"""
Chat routes for AI counselor with Supabase integration

Includes SSE streaming endpoint for real-time chat and REST endpoints for session management.
All sessions are now stored in Supabase with user-specific access (RLS).

Note: WebSocket endpoint kept for backwards compatibility but SSE is recommended for Lambda.
"""

import asyncio
import json
import os
from typing import AsyncGenerator, Optional

from fastapi import (
    APIRouter,
    Header,
    HTTPException,
    Query,
    WebSocket,
    WebSocketDisconnect,
)
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

from app.ai.agent import agent
from app.ai.prompts import ERROR_MESSAGE, WELCOME_MESSAGE
from app.ai.smart_router import smart_router
from app.ai.supabase_session_manager import ChatSession, Message, session_manager
from app.auth.service import auth_service


class ChatMessageRequest(BaseModel):
    """Request body for chat message"""

    message: str


router = APIRouter(prefix="/chat", tags=["chat"])


def extract_user_from_token(token: str) -> Optional[dict]:
    """Extract user info from JWT token (supports Supabase tokens)"""
    if not token:
        return None

    # Try Supabase token first (most common case)
    user = auth_service.verify_supabase_token(token)
    if user:
        return user

    # Fall back to our own JWT
    payload = auth_service.verify_token(token)
    if payload:
        return {"id": payload.get("sub"), "email": payload.get("email")}
    return None


# WebSocket connection manager
class ConnectionManager:
    """Manages WebSocket connections"""

    def __init__(self):
        self.active_connections: dict[str, WebSocket] = {}
        self.session_users: dict[str, str] = {}  # session_id -> user_id

    async def connect(self, websocket: WebSocket, session_id: str, user_id: str = None):
        """Accept and store WebSocket connection"""
        await websocket.accept()
        self.active_connections[session_id] = websocket
        if user_id:
            self.session_users[session_id] = user_id

    def disconnect(self, session_id: str):
        """Remove WebSocket connection"""
        if session_id in self.active_connections:
            del self.active_connections[session_id]
        if session_id in self.session_users:
            del self.session_users[session_id]

    async def send_message(self, session_id: str, message: dict):
        """Send message to specific session"""
        if session_id in self.active_connections:
            await self.active_connections[session_id].send_json(message)

    def get_user_id(self, session_id: str) -> Optional[str]:
        """Get user ID for a session"""
        return self.session_users.get(session_id)


manager = ConnectionManager()


@router.websocket("/ws/{session_id}")
async def websocket_chat(
    websocket: WebSocket, session_id: str, token: str = Query(default=None)
):
    """
    WebSocket endpoint for real-time chat

    Query params:
    - token: JWT token for authentication (optional but recommended)

    Messages from client:
    - {"message": "user message"} or {"type": "chat_message", "message": "user message"}
    - {"type": "get_history"}

    Messages to client:
    - {"type": "thinking", "step": "...", "timestamp": "..."}
    - {"type": "tool_call", "tool_name": "...", "parameters": {...}, "status": "started|completed|failed"}
    - {"type": "response_chunk", "content": "...", "is_final": false}
    - {"type": "response_complete", "message_id": "...", "full_content": "..."}
    - {"type": "error", "message": "..."}
    """
    # Extract user from token
    user = extract_user_from_token(token) if token else None
    user_id = user["id"] if user else None
    user_email = user.get("email") if user else None

    await manager.connect(websocket, session_id, user_id)

    # Handle temp sessions (new sessions not yet saved)
    is_temp_session = session_id.startswith("temp-")

    # Get or create session
    session = None
    if not is_temp_session:
        session = session_manager.get_session(session_id, user_id)
        if session and user_email:
            session.user_email = user_email  # Set email for email features

    if not session:
        # Create a new in-memory session (will be persisted on first message)
        session = ChatSession(
            session_id=session_id, user_id=user_id, user_email=user_email
        )

        # Send welcome message
        await websocket.send_json(
            {"type": "welcome", "message": WELCOME_MESSAGE, "session_id": session_id}
        )
    else:
        # Session exists, send connected message
        await websocket.send_json(
            {
                "type": "connected",
                "session_id": session_id,
                "message_count": len(session.messages),
            }
        )

    try:
        while True:
            # Receive message from client
            data = await websocket.receive_json()

            # Handle both {"message": "..."} and {"type": "chat_message", "message": "..."}
            msg_type = data.get("type", "chat_message")
            user_message = data.get("message", "").strip()

            if msg_type == "chat_message" or (
                user_message and msg_type != "get_history"
            ):
                if not user_message:
                    continue

                # Create real session in Supabase if this is first message and we have a user
                if is_temp_session and user_id:
                    # Create new session in Supabase
                    real_session = session_manager.create_session(
                        user_id, user_message[:40]
                    )
                    # Update our local session reference
                    session = real_session
                    # Notify client of real session ID
                    await websocket.send_json(
                        {
                            "type": "session_created",
                            "old_session_id": session_id,
                            "new_session_id": session.session_id,
                        }
                    )
                    session_id = session.session_id
                    is_temp_session = False

                # Add user message to session
                user_msg = Message(
                    role="user", content=user_message, session_id=session_id
                )
                session.add_message(user_msg)

                # Save to Supabase asynchronously
                if user_id and not is_temp_session:
                    session_manager.add_message(session_id, user_msg, user_id)

                try:
                    # Try smart router first (uses Gemini for intent, direct DB for data)
                    router_result = await smart_router.route(user_message, session)

                    if router_result.handled and router_result.response:
                        await websocket.send_json(
                            {
                                "type": "thinking",
                                "step": "Processing your request...",
                                "timestamp": user_msg.timestamp.isoformat(),
                            }
                        )

                        response_text = router_result.response
                        chunk_size = 100
                        for i in range(0, len(response_text), chunk_size):
                            chunk = response_text[i : i + chunk_size]
                            await websocket.send_json(
                                {
                                    "type": "response_chunk",
                                    "content": chunk,
                                    "is_final": False,
                                }
                            )
                            await asyncio.sleep(0.01)
                    else:

                        async def emit_thinking(step: str):
                            try:
                                await websocket.send_json(
                                    {
                                        "type": "thinking",
                                        "step": step,
                                        "timestamp": user_msg.timestamp.isoformat(),
                                    }
                                )
                            except Exception as e:
                                print(f"Failed to send thinking step: {e}")

                        async def emit_tool_call(
                            tool_name: str, parameters: dict, status: str
                        ):
                            try:
                                sanitized_params = {}
                                for key, value in parameters.items():
                                    if isinstance(
                                        value, (str, int, float, bool, type(None))
                                    ):
                                        if isinstance(value, str) and len(value) > 100:
                                            sanitized_params[key] = value[:100] + "..."
                                        else:
                                            sanitized_params[key] = value
                                    elif isinstance(value, list):
                                        sanitized_params[key] = f"[{len(value)} items]"
                                    elif isinstance(value, dict):
                                        sanitized_params[key] = (
                                            f"{{dict with {len(value)} keys}}"
                                        )
                                    else:
                                        sanitized_params[key] = str(
                                            type(value).__name__
                                        )

                                await websocket.send_json(
                                    {
                                        "type": "tool_call",
                                        "tool_name": tool_name,
                                        "parameters": sanitized_params,
                                        "status": status,
                                    }
                                )
                            except Exception as e:
                                print(f"Failed to send tool call status: {e}")

                        response_text = ""
                        async for chunk in agent.process_message(
                            user_message,
                            session,
                            emit_thinking=emit_thinking,
                            emit_tool_call=emit_tool_call,
                        ):
                            response_text += chunk
                            try:
                                await websocket.send_json(
                                    {
                                        "type": "response_chunk",
                                        "content": chunk,
                                        "is_final": False,
                                    }
                                )
                            except Exception as e:
                                print(f"Failed to send response chunk: {e}")

                    # Add assistant response to session
                    assistant_msg = Message(
                        role="assistant", content=response_text, session_id=session_id
                    )
                    session.add_message(assistant_msg)

                    # Save assistant message to Supabase asynchronously
                    if user_id and not is_temp_session:
                        session_manager.add_message(session_id, assistant_msg, user_id)

                    # Send completion message
                    try:
                        await websocket.send_json(
                            {
                                "type": "response_complete",
                                "message_id": assistant_msg.message_id,
                                "full_content": response_text,
                            }
                        )
                    except Exception as e:
                        print(f"⚠️ Failed to send completion message: {e}")

                except Exception as e:
                    import traceback

                    error_msg = f"Error processing message: {str(e)}"
                    error_trace = traceback.format_exc()
                    print(f"Error in websocket_chat: {error_msg}")
                    print(f"Traceback: {error_trace}")
                    await websocket.send_json(
                        {
                            "type": "error",
                            "message": ERROR_MESSAGE,
                            "details": str(e) if os.getenv("DEBUG") else None,
                        }
                    )

            elif msg_type == "get_history":
                # Send conversation history
                messages = [msg.to_dict() for msg in session.messages]
                await websocket.send_json({"type": "history", "messages": messages})

    except WebSocketDisconnect:
        manager.disconnect(session_id)
    except Exception as e:
        print(f"WebSocket error: {str(e)}")
        manager.disconnect(session_id)


# =============================================================================
# SSE Streaming Endpoint (Recommended for Lambda)
# =============================================================================


@router.post("/stream/{session_id}")
async def stream_chat(
    session_id: str,
    request: ChatMessageRequest,
    authorization: Optional[str] = Header(default=None),
):
    """
    SSE streaming endpoint for chat - works with AWS Lambda

    This endpoint receives a message and streams back the response using
    Server-Sent Events (SSE) format.

    Headers:
    - Authorization: Bearer <token> (Supabase JWT token)

    Request body:
    - message: The user's message

    Response: Server-Sent Events stream with the following event types:
    - {"type": "thinking", "step": "...", "timestamp": "..."}
    - {"type": "tool_call", "tool_name": "...", "parameters": {...}, "status": "started|completed|failed"}
    - {"type": "chunk", "content": "..."}
    - {"type": "complete", "message_id": "...", "full_content": "..."}
    - {"type": "error", "message": "..."}
    """
    # Extract token from Authorization header
    token = None
    if authorization and authorization.startswith("Bearer "):
        token = authorization[7:]

    # Extract user from token
    user = extract_user_from_token(token) if token else None
    user_id = user["id"] if user else None
    user_email = user.get("email") if user else None

    user_message = request.message.strip()
    if not user_message:
        raise HTTPException(status_code=400, detail="Message cannot be empty")

    # Handle temp sessions (new sessions not yet saved)
    is_temp_session = session_id.startswith("temp-")

    # Get or create session
    session = None
    actual_session_id = session_id

    if not is_temp_session:
        session = session_manager.get_session(session_id, user_id)
        if session and user_email:
            session.user_email = user_email

    if not session:
        # Create a new in-memory session
        session = ChatSession(
            session_id=session_id, user_id=user_id, user_email=user_email
        )

    async def generate_sse() -> AsyncGenerator[str, None]:
        """Generate SSE events for the chat response using async queue for real-time updates"""
        nonlocal session, actual_session_id, is_temp_session

        # Use an async queue to allow immediate event emission
        event_queue: asyncio.Queue = asyncio.Queue()
        processing_complete = asyncio.Event()
        response_text_holder = {"text": ""}
        assistant_msg_holder = {"msg": None}
        error_holder = {"error": None}

        async def process_ai_response():
            """Background task to process AI and put events in queue"""
            nonlocal session, actual_session_id, is_temp_session

            try:
                # Create real session in Supabase if this is first message and we have a user
                if is_temp_session and user_id:
                    real_session = session_manager.create_session(
                        user_id, user_message[:40]
                    )
                    session = real_session
                    actual_session_id = session.session_id
                    is_temp_session = False

                    await event_queue.put(
                        {"type": "session_created", "session_id": actual_session_id}
                    )

                # Add user message to session
                user_msg = Message(
                    role="user", content=user_message, session_id=actual_session_id
                )
                session.add_message(user_msg)

                # Save to Supabase
                if user_id and not is_temp_session:
                    session_manager.add_message(actual_session_id, user_msg, user_id)

                # Try smart router first (uses Gemini for intent extraction, direct DB for data)
                router_result = await smart_router.route(user_message, session)

                if router_result.handled and router_result.response:
                    # Smart router handled the request - send response directly
                    await event_queue.put(
                        {
                            "type": "thinking",
                            "step": "Processing your request...",
                            "timestamp": user_msg.timestamp.isoformat(),
                        }
                    )

                    response_text = router_result.response

                    # Stream the response in chunks for smooth display
                    chunk_size = 100
                    for i in range(0, len(response_text), chunk_size):
                        chunk = response_text[i : i + chunk_size]
                        await event_queue.put({"type": "chunk", "content": chunk})
                        await asyncio.sleep(0.01)
                else:
                    # Fall back to Gemini for complex/conversational queries
                    async def on_thinking(step: str):
                        await event_queue.put(
                            {
                                "type": "thinking",
                                "step": step,
                                "timestamp": user_msg.timestamp.isoformat(),
                            }
                        )

                    async def on_tool_call(
                        tool_name: str, parameters: dict, status: str
                    ):
                        sanitized_params = {}
                        for key, value in parameters.items():
                            if isinstance(value, (str, int, float, bool, type(None))):
                                if isinstance(value, str) and len(value) > 100:
                                    sanitized_params[key] = value[:100] + "..."
                                else:
                                    sanitized_params[key] = value
                            elif isinstance(value, list):
                                sanitized_params[key] = f"[{len(value)} items]"
                            elif isinstance(value, dict):
                                sanitized_params[key] = (
                                    f"{{dict with {len(value)} keys}}"
                                )
                            else:
                                sanitized_params[key] = str(type(value).__name__)

                        await event_queue.put(
                            {
                                "type": "tool_call",
                                "tool_name": tool_name,
                                "parameters": sanitized_params,
                                "status": status,
                            }
                        )

                    response_text = ""
                    async for chunk in agent.process_message(
                        user_message,
                        session,
                        emit_thinking=on_thinking,
                        emit_tool_call=on_tool_call,
                    ):
                        response_text += chunk
                        await event_queue.put({"type": "chunk", "content": chunk})

                response_text_holder["text"] = response_text

                # Add assistant response to session
                assistant_msg = Message(
                    role="assistant",
                    content=response_text,
                    session_id=actual_session_id,
                )
                session.add_message(assistant_msg)
                assistant_msg_holder["msg"] = assistant_msg

                # Save assistant message to Supabase
                if user_id and not is_temp_session:
                    session_manager.add_message(
                        actual_session_id, assistant_msg, user_id
                    )

                # Send completion event
                await event_queue.put(
                    {
                        "type": "complete",
                        "message_id": assistant_msg.message_id,
                        "full_content": response_text,
                    }
                )

            except Exception as e:
                import traceback

                error_msg = f"Error processing message: {str(e)}"
                error_trace = traceback.format_exc()
                print(f"Error in stream_chat: {error_msg}")
                print(f"Traceback: {error_trace}")

                error_holder["error"] = e
                await event_queue.put(
                    {
                        "type": "error",
                        "message": ERROR_MESSAGE,
                        "details": str(e) if os.getenv("DEBUG") else None,
                    }
                )
            finally:
                processing_complete.set()

        # Start the AI processing in the background
        processing_task = asyncio.create_task(process_ai_response())

        try:
            # Yield events from queue as they arrive
            while True:
                # Check if processing is complete and queue is empty
                if processing_complete.is_set() and event_queue.empty():
                    break

                try:
                    # Wait for next event with timeout
                    event = await asyncio.wait_for(event_queue.get(), timeout=0.1)
                    yield f"data: {json.dumps(event)}\n\n"

                    # If this was the complete or error event, we're done
                    if event.get("type") in ("complete", "error"):
                        break

                except asyncio.TimeoutError:
                    # No event yet, continue waiting
                    continue
        finally:
            # Ensure task is cleaned up
            if not processing_task.done():
                processing_task.cancel()
                try:
                    await processing_task
                except asyncio.CancelledError:
                    pass

    return StreamingResponse(
        generate_sse(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",  # Disable nginx buffering
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
    )


# =============================================================================
# REST endpoints for session management
# =============================================================================


@router.post("/sessions", status_code=201)
async def create_session(user_id: str = None, title: str = "New Chat"):
    """Create a new chat session"""
    session = session_manager.create_session(user_id, title)

    return {
        "session_id": session.session_id,
        "created_at": session.created_at.isoformat(),
        "message": "Session created successfully",
    }


@router.get("/sessions/{session_id}")
async def get_session(session_id: str, user_id: str = None):
    """Get full session with conversation history"""
    session = session_manager.get_session(session_id, user_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    return {
        "session_id": session.session_id,
        "created_at": session.created_at.isoformat(),
        "updated_at": session.updated_at.isoformat(),
        "title": session.title,
        "preview": session.preview,
        "message_count": len(session.messages),
        "messages": [msg.to_dict() for msg in session.messages],
        "context": session.context,
        "metadata": session.metadata,
    }


@router.delete("/sessions/{session_id}")
async def delete_session(session_id: str, user_id: str = None):
    """Delete a session"""
    success = session_manager.delete_session(session_id, user_id)
    if not success:
        raise HTTPException(status_code=404, detail="Session not found")

    return {"message": "Session deleted successfully"}


@router.get("/sessions/{session_id}/messages")
async def get_messages(session_id: str, limit: int = None, user_id: str = None):
    """Get messages from a session"""
    messages = session_manager.get_messages(session_id, limit, user_id)

    return {
        "session_id": session_id,
        "message_count": len(messages),
        "messages": [msg.to_dict() for msg in messages],
    }


@router.get("/sessions")
async def list_sessions(user_id: str = None):
    """List all sessions for a user"""
    sessions = session_manager.list_sessions(user_id)

    return {"count": len(sessions), "sessions": sessions}


@router.patch("/sessions/{session_id}")
async def update_session_metadata(
    session_id: str, title: str = None, user_id: str = None
):
    """Update session metadata (e.g., title)"""
    session = session_manager.get_session(session_id, user_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")

    if title:
        session.title = title
        session_manager.update_session(session)

    return {
        "session_id": session.session_id,
        "title": session.title,
        "message": "Session updated successfully",
    }


# Health check endpoint
@router.get("/health")
async def health_check():
    """Check if Supabase connection is working"""
    is_connected = session_manager.supabase is not None
    return {
        "status": "healthy" if is_connected else "degraded",
        "supabase_connected": is_connected,
        "message": "Supabase connected"
        if is_connected
        else "Using in-memory storage (Supabase not configured)",
    }
