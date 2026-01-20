"""
Supabase Session Manager for chat conversations

Handles creating, storing, and retrieving chat sessions with Supabase persistence.
Only authenticated users can access their own sessions (enforced by RLS).
"""

import os
from datetime import datetime
from typing import Any, Dict, List, Optional
from uuid import uuid4

from dotenv import load_dotenv
from supabase import Client, create_client

load_dotenv()


class Message:
    """Represents a single message in a conversation"""

    def __init__(
        self,
        role: str,
        content: str,
        message_id: Optional[str] = None,
        timestamp: Optional[datetime] = None,
        metadata: Optional[Dict] = None,
        session_id: Optional[str] = None,
    ):
        self.message_id = message_id or str(uuid4())
        self.role = role  # "user", "assistant", "system", "thinking"
        self.content = content
        self.timestamp = timestamp or datetime.now()
        self.metadata = metadata or {}
        self.session_id = session_id

    def to_dict(self) -> Dict:
        """Convert message to dictionary"""
        return {
            "message_id": self.message_id,
            "role": self.role,
            "content": self.content,
            "timestamp": self.timestamp.isoformat(),
            "metadata": self.metadata,
        }

    @classmethod
    def from_dict(cls, data: Dict) -> "Message":
        """Create message from dictionary"""
        timestamp = data.get("timestamp") or data.get("created_at")
        if isinstance(timestamp, str):
            timestamp = datetime.fromisoformat(timestamp.replace("Z", "+00:00"))

        return cls(
            message_id=data.get("message_id") or data.get("id"),
            role=data["role"],
            content=data["content"],
            timestamp=timestamp,
            metadata=data.get("metadata", {}),
            session_id=data.get("session_id"),
        )


class ChatSession:
    """Represents a chat session with full conversation history"""

    def __init__(
        self,
        session_id: Optional[str] = None,
        user_id: Optional[str] = None,
        user_email: Optional[str] = None,
        created_at: Optional[datetime] = None,
        updated_at: Optional[datetime] = None,
        messages: Optional[List[Message]] = None,
        context: Optional[Dict] = None,
        metadata: Optional[Dict] = None,
        title: str = "New Chat",
        preview: str = "",
    ):
        self.session_id = session_id or str(uuid4())
        self.user_id = user_id
        self.user_email = user_email  # User's authenticated email for email features
        self.created_at = created_at or datetime.now()
        self.updated_at = updated_at or datetime.now()
        self.messages = messages or []
        self.context = context or {}
        self.metadata = metadata or {}
        self.title = title
        self.preview = preview

    def add_message(self, message: Message):
        """Add a message to the session"""
        message.session_id = self.session_id
        self.messages.append(message)
        self.updated_at = datetime.now()

        # Update preview with first user message
        if message.role == "user" and not self.preview:
            self.preview = message.content[:100]
            self.title = message.content[:40] + (
                "..." if len(message.content) > 40 else ""
            )

    def get_recent_messages(self, limit: int = 10) -> List[Message]:
        """Get recent messages for context (last N messages)"""
        return self.messages[-limit:] if len(self.messages) > limit else self.messages

    def to_dict(self) -> Dict:
        """Convert session to dictionary"""
        return {
            "session_id": self.session_id,
            "user_id": self.user_id,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
            "messages": [msg.to_dict() for msg in self.messages],
            "context": self.context,
            "metadata": self.metadata,
            "title": self.title,
            "preview": self.preview,
        }


class SupabaseSessionManager:
    """Manages chat sessions with Supabase persistence"""

    def __init__(self):
        supabase_url = os.getenv("SUPABASE_URL")
        supabase_key = os.getenv("SUPABASE_SERVICE_KEY") or os.getenv("SUPABASE_KEY")

        if not supabase_url or not supabase_key:
            print(
                "⚠️ WARNING: Supabase credentials not configured. Using in-memory storage."
            )
            self.supabase: Optional[Client] = None
        else:
            try:
                self.supabase: Client = create_client(supabase_url, supabase_key)
                print("✅ Supabase connected successfully")
            except Exception as e:
                print(f"❌ Failed to connect to Supabase: {e}")
                self.supabase = None

        # In-memory cache for active sessions (fallback + performance)
        self._cache: Dict[str, ChatSession] = {}

    def create_session(
        self, user_id: str = None, title: str = "New Chat"
    ) -> ChatSession:
        """Create a new chat session"""
        session = ChatSession(user_id=user_id, title=title)

        if self.supabase and user_id:
            try:
                result = (
                    self.supabase.table("chat_sessions")
                    .insert(
                        {
                            "id": session.session_id,
                            "user_id": user_id,
                            "title": title,
                            "preview": "",
                            "created_at": session.created_at.isoformat(),
                            "updated_at": session.updated_at.isoformat(),
                        }
                    )
                    .execute()
                )

                if result.data:
                    print(f"✅ Session created in Supabase: {session.session_id}")
            except Exception as e:
                print(f"❌ Error creating session in Supabase: {e}")

        self._cache[session.session_id] = session
        return session

    def get_session(
        self, session_id: str, user_id: str = None
    ) -> Optional[ChatSession]:
        """Get a session by ID"""
        # Check cache first
        if session_id in self._cache:
            cached = self._cache[session_id]
            # Verify user ownership if user_id provided
            if user_id and cached.user_id and cached.user_id != user_id:
                return None
            return cached

        # Load from Supabase
        if self.supabase:
            try:
                query = (
                    self.supabase.table("chat_sessions")
                    .select("*")
                    .eq("id", session_id)
                )
                if user_id:
                    query = query.eq("user_id", user_id)
                result = query.execute()

                if result.data and len(result.data) > 0:
                    session_data = result.data[0]
                    session = ChatSession(
                        session_id=session_data["id"],
                        user_id=session_data["user_id"],
                        created_at=datetime.fromisoformat(
                            session_data["created_at"].replace("Z", "+00:00")
                        ),
                        updated_at=datetime.fromisoformat(
                            session_data["updated_at"].replace("Z", "+00:00")
                        ),
                        title=session_data.get("title", "New Chat"),
                        preview=session_data.get("preview", ""),
                    )

                    # Load messages
                    messages = self._load_messages(session_id)
                    session.messages = messages

                    self._cache[session_id] = session
                    return session
            except Exception as e:
                print(f"❌ Error getting session from Supabase: {e}")

        return None

    def _load_messages(self, session_id: str) -> List[Message]:
        """Load messages for a session from Supabase"""
        if not self.supabase:
            return []

        try:
            result = (
                self.supabase.table("chat_messages")
                .select("*")
                .eq("session_id", session_id)
                .order("created_at")
                .execute()
            )

            if result.data:
                return [Message.from_dict(msg) for msg in result.data]
        except Exception as e:
            print(f"❌ Error loading messages: {e}")

        return []

    def update_session(self, session: ChatSession):
        """Update an existing session"""
        session.updated_at = datetime.now()
        self._cache[session.session_id] = session

        if self.supabase and session.user_id:
            try:
                self.supabase.table("chat_sessions").update(
                    {
                        "title": session.title,
                        "preview": session.preview,
                        "updated_at": session.updated_at.isoformat(),
                    }
                ).eq("id", session.session_id).execute()
            except Exception as e:
                print(f"❌ Error updating session in Supabase: {e}")

    def delete_session(self, session_id: str, user_id: str = None) -> bool:
        """Delete a session"""
        if session_id in self._cache:
            del self._cache[session_id]

        if self.supabase:
            try:
                # Delete messages first
                self.supabase.table("chat_messages").delete().eq(
                    "session_id", session_id
                ).execute()
                # Delete session
                query = (
                    self.supabase.table("chat_sessions").delete().eq("id", session_id)
                )
                if user_id:
                    query = query.eq("user_id", user_id)
                query.execute()
                return True
            except Exception as e:
                print(f"❌ Error deleting session: {e}")
                return False

        return True

    def add_message(
        self, session_id: str, message: Message, user_id: str = None
    ) -> bool:
        """Add a message to a session"""
        session = self.get_session(session_id, user_id)
        if not session:
            # Create session if it doesn't exist (for new sessions)
            session = ChatSession(session_id=session_id, user_id=user_id)
            self._cache[session_id] = session

        session.add_message(message)

        # Save message to Supabase asynchronously
        if self.supabase:
            try:
                self.supabase.table("chat_messages").insert(
                    {
                        "id": message.message_id,
                        "session_id": session_id,
                        "role": message.role,
                        "content": message.content,
                        "created_at": message.timestamp.isoformat(),
                    }
                ).execute()

                # Update session title/preview
                self.update_session(session)
            except Exception as e:
                print(f"❌ Error saving message to Supabase: {e}")

        return True

    def get_messages(
        self, session_id: str, limit: Optional[int] = None, user_id: str = None
    ) -> List[Message]:
        """Get messages from a session"""
        session = self.get_session(session_id, user_id)
        if not session:
            return []

        if limit:
            return session.get_recent_messages(limit)
        return session.messages

    def list_sessions(self, user_id: str = None) -> List[Dict[str, Any]]:
        """List all sessions for a user"""
        if not self.supabase or not user_id:
            # Return cached sessions
            return [
                {
                    "session_id": s.session_id,
                    "title": s.title,
                    "preview": s.preview,
                    "created_at": s.created_at.isoformat(),
                    "updated_at": s.updated_at.isoformat(),
                    "message_count": len(s.messages),
                }
                for s in self._cache.values()
                if not user_id or s.user_id == user_id
            ]

        try:
            result = (
                self.supabase.table("chat_sessions")
                .select("*")
                .eq("user_id", user_id)
                .order("updated_at", desc=True)
                .execute()
            )

            if result.data:
                sessions = []
                for s in result.data:
                    # Get message count
                    count_result = (
                        self.supabase.table("chat_messages")
                        .select("*", count="exact")
                        .eq("session_id", s["id"])
                        .execute()
                    )
                    message_count = count_result.count if count_result.count else 0

                    sessions.append(
                        {
                            "session_id": s["id"],
                            "title": s.get("title", "New Chat"),
                            "preview": s.get("preview", ""),
                            "created_at": s["created_at"],
                            "updated_at": s["updated_at"],
                            "message_count": message_count,
                        }
                    )
                return sessions
        except Exception as e:
            print(f"❌ Error listing sessions: {e}")

        return []

    def save_message_async(
        self, session_id: str, message: Message, user_id: str = None
    ):
        """Save a message asynchronously (fire and forget)"""
        # This is called from the WebSocket handler to not block the response
        self.add_message(session_id, message, user_id)


# Global session manager instance (replaces the old file-based one)
supabase_session_manager = SupabaseSessionManager()

# For backward compatibility, also export as session_manager
session_manager = supabase_session_manager
