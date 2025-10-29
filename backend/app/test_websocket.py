#!/usr/bin/env python3
"""
Quick test script to verify WebSocket welcome message format
"""
import asyncio
import websockets
import json

async def test_websocket():
    uri = "ws://localhost:8000/chat/ws/test-session-debug"
    
    print("🔌 Connecting to:", uri)
    
    try:
        async with websockets.connect(uri) as websocket:
            print("✅ Connected!")
            
            # Wait for welcome message
            print("\n⏳ Waiting for welcome message...")
            message = await websocket.recv()
            
            print("\n📨 Received raw message:")
            print(message)
            
            print("\n📋 Parsed JSON:")
            data = json.loads(message)
            print(json.dumps(data, indent=2))
            
            print("\n🔍 Message structure:")
            print(f"  - type: {data.get('type')}")
            print(f"  - message: {data.get('message')[:50] if data.get('message') else 'None'}...")
            print(f"  - session_id: {data.get('session_id')}")
            
            print("\n✨ Frontend should access:")
            print(f"  - message.message = '{data.get('message')[:30]}...'")
            
    except Exception as e:
        print(f"\n❌ Error: {e}")
        print("\n🔧 Make sure backend is running:")
        print("   cd backend && uvicorn main:app --reload --port 8000")

if __name__ == "__main__":
    asyncio.run(test_websocket())
