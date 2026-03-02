"""
PostgreSQL Session Manager for chat conversations.

Handles creating, storing, and retrieving chat sessions with PostgreSQL persistence.
User ownership is enforced at the application level via user_id filtering.
"""

import uuid
from datetime import datetime
from typing import Any, Dict, List, Optional
from uuid import uuid4

from sqlalchemy import delete, func, select

from app.models import ChatMessageModel, ChatSessionModel
from app.pg_database import async_session_factory


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
        self.user_email = user_email
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


class PostgresSessionManager:
    """Manages chat sessions with PostgreSQL persistence"""

    def __init__(self):
        self._cache: Dict[str, ChatSession] = {}

    async def create_session(
        self, user_id: str = None, title: str = "New Chat"
    ) -> ChatSession:
        """Create a new chat session"""
        session = ChatSession(user_id=user_id, title=title)

        if user_id:
            try:
                async with async_session_factory() as db:
                    db_session = ChatSessionModel(
                        id=uuid.UUID(session.session_id),
                        user_id=uuid.UUID(user_id),
                        title=title,
                        preview="",
                    )
                    db.add(db_session)
                    await db.commit()
                    print(f"Session created in PostgreSQL: {session.session_id}")
            except Exception as e:
                print(f"Error creating session in PostgreSQL: {e}")

        self._cache[session.session_id] = session
        return session

    async def get_session(
        self, session_id: str, user_id: str = None
    ) -> Optional[ChatSession]:
        """Get a session by ID"""
        # Check cache first
        if session_id in self._cache:
            cached = self._cache[session_id]
            if user_id and cached.user_id and cached.user_id != user_id:
                return None
            return cached

        # Load from PostgreSQL
        try:
            async with async_session_factory() as db:
                stmt = select(ChatSessionModel).where(
                    ChatSessionModel.id == uuid.UUID(session_id)
                )
                if user_id:
                    stmt = stmt.where(
                        ChatSessionModel.user_id == uuid.UUID(user_id)
                    )
                result = await db.execute(stmt)
                db_session = result.scalar_one_or_none()

                if not db_session:
                    return None

                session = ChatSession(
                    session_id=str(db_session.id),
                    user_id=str(db_session.user_id) if db_session.user_id else None,
                    created_at=db_session.created_at,
                    updated_at=db_session.updated_at,
                    title=db_session.title or "New Chat",
                    preview=db_session.preview or "",
                )

                # Load messages
                msg_stmt = (
                    select(ChatMessageModel)
                    .where(ChatMessageModel.session_id == uuid.UUID(session_id))
                    .order_by(ChatMessageModel.created_at)
                )
                msg_result = await db.execute(msg_stmt)
                for m in msg_result.scalars():
                    session.messages.append(
                        Message(
                            message_id=str(m.id),
                            role=m.role,
                            content=m.content,
                            timestamp=m.created_at,
                            session_id=str(m.session_id),
                        )
                    )

                self._cache[session_id] = session
                return session
        except Exception as e:
            print(f"Error getting session from PostgreSQL: {e}")
            return None

    async def update_session(self, session: ChatSession):
        """Update an existing session"""
        session.updated_at = datetime.now()
        self._cache[session.session_id] = session

        if session.user_id:
            try:
                async with async_session_factory() as db:
                    stmt = select(ChatSessionModel).where(
                        ChatSessionModel.id == uuid.UUID(session.session_id)
                    )
                    result = await db.execute(stmt)
                    db_session = result.scalar_one_or_none()
                    if db_session:
                        db_session.title = session.title
                        db_session.preview = session.preview
                        db_session.updated_at = session.updated_at
                        await db.commit()
            except Exception as e:
                print(f"Error updating session in PostgreSQL: {e}")

    async def delete_session(self, session_id: str, user_id: str = None) -> bool:
        """Delete a session (cascade deletes messages via FK)"""
        if session_id in self._cache:
            del self._cache[session_id]

        try:
            async with async_session_factory() as db:
                stmt = delete(ChatSessionModel).where(
                    ChatSessionModel.id == uuid.UUID(session_id)
                )
                if user_id:
                    stmt = stmt.where(
                        ChatSessionModel.user_id == uuid.UUID(user_id)
                    )
                await db.execute(stmt)
                await db.commit()
                return True
        except Exception as e:
            print(f"Error deleting session: {e}")
            return False

    async def add_message(
        self, session_id: str, message: Message, user_id: str = None
    ) -> bool:
        """Add a message to a session"""
        session = await self.get_session(session_id, user_id)
        if not session:
            session = ChatSession(session_id=session_id, user_id=user_id)
            self._cache[session_id] = session

        session.add_message(message)

        try:
            async with async_session_factory() as db:
                db_msg = ChatMessageModel(
                    id=uuid.UUID(message.message_id),
                    session_id=uuid.UUID(session_id),
                    role=message.role,
                    content=message.content,
                )
                db.add(db_msg)

                # Update session title/preview
                stmt = select(ChatSessionModel).where(
                    ChatSessionModel.id == uuid.UUID(session_id)
                )
                result = await db.execute(stmt)
                db_session = result.scalar_one_or_none()
                if db_session:
                    db_session.title = session.title
                    db_session.preview = session.preview
                    db_session.updated_at = session.updated_at

                await db.commit()
        except Exception as e:
            print(f"Error saving message to PostgreSQL: {e}")

        return True

    async def get_messages(
        self, session_id: str, limit: Optional[int] = None, user_id: str = None
    ) -> List[Message]:
        """Get messages from a session"""
        session = await self.get_session(session_id, user_id)
        if not session:
            return []

        if limit:
            return session.get_recent_messages(limit)
        return session.messages

    async def list_sessions(self, user_id: str = None) -> List[Dict[str, Any]]:
        """List all sessions for a user"""
        if not user_id:
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
            ]

        try:
            async with async_session_factory() as db:
                stmt = (
                    select(
                        ChatSessionModel,
                        func.count(ChatMessageModel.id).label("message_count"),
                    )
                    .outerjoin(ChatMessageModel)
                    .where(ChatSessionModel.user_id == uuid.UUID(user_id))
                    .group_by(ChatSessionModel.id)
                    .order_by(ChatSessionModel.updated_at.desc())
                )
                result = await db.execute(stmt)
                sessions = []
                for row in result:
                    s = row[0]
                    count = row[1]
                    sessions.append(
                        {
                            "session_id": str(s.id),
                            "title": s.title or "New Chat",
                            "preview": s.preview or "",
                            "created_at": s.created_at.isoformat(),
                            "updated_at": s.updated_at.isoformat(),
                            "message_count": count,
                        }
                    )
                return sessions
        except Exception as e:
            print(f"Error listing sessions: {e}")
            return []

    async def save_message_async(
        self, session_id: str, message: Message, user_id: str = None
    ):
        """Save a message (async version)"""
        await self.add_message(session_id, message, user_id)


# Global session manager instance
session_manager = PostgresSessionManager()
