"""
Session Manager for chat conversations

Handles creating, storing, and retrieving chat sessions with JSON file persistence
"""
import json
import os
from datetime import datetime
from typing import Dict, List, Optional
from uuid import uuid4
from pathlib import Path

# Directory to store session files
SESSIONS_DIR = Path(__file__).parent.parent.parent / "sessions"
SESSIONS_DIR.mkdir(exist_ok=True)


class Message:
    """Represents a single message in a conversation"""
    
    def __init__(
        self,
        role: str,
        content: str,
        message_id: Optional[str] = None,
        timestamp: Optional[datetime] = None,
        metadata: Optional[Dict] = None
    ):
        self.message_id = message_id or str(uuid4())
        self.role = role  # "user", "assistant", "system", "thinking"
        self.content = content
        self.timestamp = timestamp or datetime.now()
        self.metadata = metadata or {}
    
    def to_dict(self) -> Dict:
        """Convert message to dictionary"""
        return {
            "message_id": self.message_id,
            "role": self.role,
            "content": self.content,
            "timestamp": self.timestamp.isoformat(),
            "metadata": self.metadata
        }
    
    @classmethod
    def from_dict(cls, data: Dict) -> "Message":
        """Create message from dictionary"""
        return cls(
            message_id=data["message_id"],
            role=data["role"],
            content=data["content"],
            timestamp=datetime.fromisoformat(data["timestamp"]),
            metadata=data.get("metadata", {})
        )


class ChatSession:
    """Represents a chat session with full conversation history"""
    
    def __init__(
        self,
        session_id: Optional[str] = None,
        created_at: Optional[datetime] = None,
        updated_at: Optional[datetime] = None,
        messages: Optional[List[Message]] = None,
        context: Optional[Dict] = None,
        metadata: Optional[Dict] = None
    ):
        self.session_id = session_id or str(uuid4())
        self.created_at = created_at or datetime.now()
        self.updated_at = updated_at or datetime.now()
        self.messages = messages or []
        self.context = context or {}  # Store user preferences, rank, etc.
        self.metadata = metadata or {}
    
    def add_message(self, message: Message):
        """Add a message to the session"""
        self.messages.append(message)
        self.updated_at = datetime.now()
    
    def get_recent_messages(self, limit: int = 10) -> List[Message]:
        """Get recent messages for context (last N messages)"""
        return self.messages[-limit:] if len(self.messages) > limit else self.messages
    
    def to_dict(self) -> Dict:
        """Convert session to dictionary"""
        return {
            "session_id": self.session_id,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
            "messages": [msg.to_dict() for msg in self.messages],
            "context": self.context,
            "metadata": self.metadata
        }
    
    @classmethod
    def from_dict(cls, data: Dict) -> "ChatSession":
        """Create session from dictionary"""
        return cls(
            session_id=data["session_id"],
            created_at=datetime.fromisoformat(data["created_at"]),
            updated_at=datetime.fromisoformat(data["updated_at"]),
            messages=[Message.from_dict(msg) for msg in data["messages"]],
            context=data.get("context", {}),
            metadata=data.get("metadata", {})
        )


class SessionManager:
    """Manages chat sessions with JSON file persistence"""
    
    def __init__(self, sessions_dir: Path = SESSIONS_DIR):
        self.sessions_dir = sessions_dir
        self.sessions_dir.mkdir(exist_ok=True)
        # In-memory cache for active sessions
        self._cache: Dict[str, ChatSession] = {}
    
    def _get_session_file(self, session_id: str) -> Path:
        """Get the file path for a session"""
        return self.sessions_dir / f"{session_id}.json"
    
    def create_session(self) -> ChatSession:
        """Create a new chat session"""
        session = ChatSession()
        self._save_session(session)
        self._cache[session.session_id] = session
        return session
    
    def get_session(self, session_id: str) -> Optional[ChatSession]:
        """Get a session by ID"""
        # Check cache first
        if session_id in self._cache:
            return self._cache[session_id]
        
        # Load from file
        session_file = self._get_session_file(session_id)
        if not session_file.exists():
            return None
        
        try:
            with open(session_file, 'r') as f:
                data = json.load(f)
            session = ChatSession.from_dict(data)
            self._cache[session_id] = session
            return session
        except Exception as e:
            print(f"Error loading session {session_id}: {e}")
            return None
    
    def _save_session(self, session: ChatSession):
        """Save a session to file"""
        session_file = self._get_session_file(session.session_id)
        try:
            with open(session_file, 'w') as f:
                json.dump(session.to_dict(), f, indent=2)
        except Exception as e:
            print(f"Error saving session {session.session_id}: {e}")
    
    def update_session(self, session: ChatSession):
        """Update an existing session"""
        session.updated_at = datetime.now()
        self._save_session(session)
        self._cache[session.session_id] = session
    
    def delete_session(self, session_id: str) -> bool:
        """Delete a session"""
        session_file = self._get_session_file(session_id)
        if session_file.exists():
            try:
                session_file.unlink()
                if session_id in self._cache:
                    del self._cache[session_id]
                return True
            except Exception as e:
                print(f"Error deleting session {session_id}: {e}")
                return False
        return False
    
    def add_message(self, session_id: str, message: Message) -> bool:
        """Add a message to a session"""
        session = self.get_session(session_id)
        if not session:
            return False
        
        session.add_message(message)
        self.update_session(session)
        return True
    
    def get_messages(self, session_id: str, limit: Optional[int] = None) -> List[Message]:
        """Get messages from a session"""
        session = self.get_session(session_id)
        if not session:
            return []
        
        if limit:
            return session.get_recent_messages(limit)
        return session.messages
    
    def list_sessions(self) -> List[str]:
        """List all session IDs"""
        return [f.stem for f in self.sessions_dir.glob("*.json")]
    
    def cleanup_old_sessions(self, days: int = 7):
        """Delete sessions older than specified days"""
        cutoff_time = datetime.now().timestamp() - (days * 24 * 60 * 60)
        
        for session_file in self.sessions_dir.glob("*.json"):
            if session_file.stat().st_mtime < cutoff_time:
                try:
                    session_file.unlink()
                    session_id = session_file.stem
                    if session_id in self._cache:
                        del self._cache[session_id]
                except Exception as e:
                    print(f"Error deleting old session {session_file}: {e}")


# Global session manager instance
session_manager = SessionManager()
