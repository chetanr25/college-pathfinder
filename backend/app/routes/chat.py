"""
Chat routes for AI counselor

Includes WebSocket endpoint for real-time chat and REST endpoints for session management
"""
import json
import os
from typing import List
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.responses import JSONResponse

from app.ai.session_manager import session_manager, Message
from app.ai.agent import agent
from app.ai.prompts import WELCOME_MESSAGE, ERROR_MESSAGE


router = APIRouter(
    prefix="/chat",
    tags=["chat"]
)


# WebSocket connection manager
class ConnectionManager:
    """Manages WebSocket connections"""
    
    def __init__(self):
        self.active_connections: dict[str, WebSocket] = {}
    
    async def connect(self, websocket: WebSocket, session_id: str):
        """Accept and store WebSocket connection"""
        await websocket.accept()
        self.active_connections[session_id] = websocket
    
    def disconnect(self, session_id: str):
        """Remove WebSocket connection"""
        if session_id in self.active_connections:
            del self.active_connections[session_id]
    
    async def send_message(self, session_id: str, message: dict):
        """Send message to specific session"""
        if session_id in self.active_connections:
            await self.active_connections[session_id].send_json(message)


manager = ConnectionManager()


@router.websocket("/ws/{session_id}")
async def websocket_chat(websocket: WebSocket, session_id: str):
    """
    WebSocket endpoint for real-time chat
    
    Messages from client:
    - {"type": "chat_message", "message": "user message"}
    - {"type": "get_history"}
    
    Messages to client:
    - {"type": "thinking", "step": "...", "timestamp": "..."}
    - {"type": "tool_call", "tool_name": "...", "parameters": {...}, "status": "started|completed|failed"}
    - {"type": "response_chunk", "content": "...", "is_final": false}
    - {"type": "response_complete", "message_id": "..."}
    - {"type": "error", "message": "..."}
    """
    await manager.connect(websocket, session_id)
    
    # Get or create session
    session = session_manager.get_session(session_id)
    if not session:
        session = session_manager.create_session()
        # Update session_id to match requested one
        session.session_id = session_id
        session_manager.update_session(session)
        
        # Send welcome message
        welcome_msg = Message(role="assistant", content=WELCOME_MESSAGE)
        session.add_message(welcome_msg)
        session_manager.update_session(session)
        
        await websocket.send_json({
            "type": "welcome",
            "message": WELCOME_MESSAGE,
            "session_id": session_id
        })
    
    try:
        while True:
            # Receive message from client
            data = await websocket.receive_json()
            msg_type = data.get("type")
            
            if msg_type == "chat_message":
                user_message = data.get("message", "").strip()
                if not user_message:
                    continue
                
                # Add user message to session
                user_msg = Message(role="user", content=user_message)
                session.add_message(user_msg)
                session_manager.update_session(session)
                
                # Define callback functions for streaming
                async def emit_thinking(step: str):
                    """Emit thinking step"""
                    try:
                        await websocket.send_json({
                            "type": "thinking",
                            "step": step,
                            "timestamp": user_msg.timestamp.isoformat()
                        })
                    except Exception as e:
                        print(f"⚠️ Failed to send thinking step: {e}")
                
                async def emit_tool_call(tool_name: str, parameters: dict, status: str):
                    """Emit tool call status"""
                    try:
                        await websocket.send_json({
                            "type": "tool_call",
                            "tool_name": tool_name,
                            "parameters": parameters,
                            "status": status
                        })
                    except Exception as e:
                        print(f"⚠️ Failed to send tool call status: {e}")
                
                try:
                    # Process message with AI agent
                    response_text = ""
                    async for chunk in agent.process_message(
                        user_message,
                        session,
                        emit_thinking=emit_thinking,
                        emit_tool_call=emit_tool_call
                    ):
                        response_text += chunk
                        try:
                            await websocket.send_json({
                                "type": "response_chunk",
                                "content": chunk,
                                "is_final": False
                            })
                        except Exception as e:
                            print(f"⚠️ Failed to send response chunk (client may have disconnected): {e}")
                            # Continue processing even if client disconnected
                    
                    # Add assistant response to session
                    assistant_msg = Message(role="assistant", content=response_text)
                    session.add_message(assistant_msg)
                    session_manager.update_session(session)
                    
                    # Send completion message
                    try:
                        await websocket.send_json({
                            "type": "response_complete",
                            "message_id": assistant_msg.message_id,
                            "full_content": response_text
                        })
                    except Exception as e:
                        print(f"⚠️ Failed to send completion message: {e}")
                    
                except Exception as e:
                    import traceback
                    error_msg = f"Error processing message: {str(e)}"
                    error_trace = traceback.format_exc()
                    print(f"Error in websocket_chat: {error_msg}")
                    print(f"Traceback: {error_trace}")
                    await websocket.send_json({
                        "type": "error",
                        "message": ERROR_MESSAGE,
                        "details": str(e) if os.getenv("DEBUG") else None
                    })
            
            elif msg_type == "get_history":
                # Send conversation history
                messages = [msg.to_dict() for msg in session.messages]
                await websocket.send_json({
                    "type": "history",
                    "messages": messages
                })
    
    except WebSocketDisconnect:
        manager.disconnect(session_id)
    except Exception as e:
        print(f"WebSocket error: {str(e)}")
        manager.disconnect(session_id)


# REST endpoints for session management

@router.post("/sessions", status_code=201)
async def create_session():
    """Create a new chat session"""
    session = session_manager.create_session()
    
    # Add welcome message
    welcome_msg = Message(role="assistant", content=WELCOME_MESSAGE)
    session.add_message(welcome_msg)
    session_manager.update_session(session)
    
    return {
        "session_id": session.session_id,
        "created_at": session.created_at.isoformat(),
        "message": "Session created successfully"
    }


@router.get("/sessions/{session_id}")
async def get_session(session_id: str):
    """Get full session with conversation history"""
    session = session_manager.get_session(session_id)
    if not session:
        raise HTTPException(status_code=404, detail="Session not found")
    
    return {
        "session_id": session.session_id,
        "created_at": session.created_at.isoformat(),
        "updated_at": session.updated_at.isoformat(),
        "message_count": len(session.messages),
        "messages": [msg.to_dict() for msg in session.messages],
        "context": session.context,
        "metadata": session.metadata
    }


@router.delete("/sessions/{session_id}")
async def delete_session(session_id: str):
    """Delete a session"""
    success = session_manager.delete_session(session_id)
    if not success:
        raise HTTPException(status_code=404, detail="Session not found")
    
    return {"message": "Session deleted successfully"}


@router.get("/sessions/{session_id}/messages")
async def get_messages(session_id: str, limit: int = None):
    """Get messages from a session"""
    messages = session_manager.get_messages(session_id, limit)
    if messages is None:
        raise HTTPException(status_code=404, detail="Session not found")
    
    return {
        "session_id": session_id,
        "message_count": len(messages),
        "messages": [msg.to_dict() for msg in messages]
    }


@router.get("/sessions")
async def list_sessions():
    """List all session IDs"""
    session_ids = session_manager.list_sessions()
    return {
        "count": len(session_ids),
        "session_ids": session_ids
    }
