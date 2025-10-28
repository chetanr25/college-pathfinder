# 🔧 WebSocket Connection Debugging Guide

## Issue: Frontend Shows "Connecting..." Forever

This happens when the WebSocket connects but the frontend doesn't properly recognize it.

## Latest Fix Applied

### Added Connection State Tracking

**Problem:** The component was checking `chatService?.isConnected()` which might not update the UI properly.

**Solution:** Added separate `isConnected` state that gets set to `true` when the welcome message is received.

### Changes Made to AIChat.tsx

#### 1. Added Connection State (Line 15)

```typescript
const [isConnected, setIsConnected] = useState(false)
```

#### 2. Set Connected on Welcome Message (Line 54)

```typescript
case 'welcome':
  setMessages([{...}]);
  setIsConnected(true); // ✅ Mark as connected
  break;
```

#### 3. Use Connection State for Input (Line 264)

```typescript
disabled={isProcessing || !isConnected}  // ✅ Use state instead of method
placeholder={
  !isConnected ? 'Connecting...' : ...
}
```

## How to Debug

### Step 1: Open Browser Console (F12)

### Step 2: Look for These Logs (in order)

**Expected Flow:**

```
1. WebSocket connected
2. WebSocket received: {type: "welcome", message: "Hello! I'm your AI...", session_id: "..."}
3. Received message: welcome {...}
```

### Step 3: Check React DevTools

If you have React DevTools installed:

1. Open React DevTools
2. Find the `AIChat` component
3. Look at the state:
   - `isConnected`: should be `true` after welcome message
   - `messages`: should have 1 message (welcome)
   - `chatService`: should not be `null`

## Common Scenarios

### Scenario 1: WebSocket Connects But No Welcome Message

**Console Shows:**

```
✅ WebSocket connected
❌ (Nothing else)
```

**This means:** Backend is not sending the welcome message.

**Check:**

```bash
# Look at backend logs
# Should see: "WebSocket connection opened" or similar
```

**Fix:** Check `backend/app/routes/chat.py` lines 70-82 for welcome message sending.

### Scenario 2: Welcome Message Received But UI Still Shows "Connecting..."

**Console Shows:**

```
✅ WebSocket connected
✅ WebSocket received: {type: "welcome", ...}
✅ Received message: welcome {...}
❌ UI still shows "Connecting..."
```

**This means:** The `isConnected` state is not being set.

**Check:**

- Make sure the case 'welcome' handler has `setIsConnected(true)`
- Check for JavaScript errors in console
- Verify the message.message property exists

### Scenario 3: CORS or Network Error

**Console Shows:**

```
❌ WebSocket connection to 'ws://localhost:8000/chat/ws/...' failed
❌ Error: ...CORS...
```

**Fix:**

1. Restart backend server
2. Make sure CORS is configured correctly (should be fixed already)
3. Check backend is running: `curl http://localhost:8000/chat/sessions -X POST`

### Scenario 4: Session Creation Fails

**Console Shows:**

```
❌ Chat initialization error: Failed to create session
❌ Failed to initialize chat. Please refresh the page.
```

**Fix:**

1. Check backend is running
2. Test session creation: `curl -X POST http://localhost:8000/chat/sessions`
3. Check CORS headers in response
4. Make sure backend doesn't have errors in console

## Manual Testing Commands

### Test 1: Check Backend is Running

```bash
curl http://localhost:8000/docs
# Should return HTML of FastAPI docs
```

### Test 2: Create Session

```bash
curl -X POST http://localhost:8000/chat/sessions \
  -H "Content-Type: application/json" \
  -v

# Expected Response:
# HTTP/1.1 201 Created
# {
#   "session_id": "...",
#   "created_at": "...",
#   "message": "Session created successfully"
# }
```

### Test 3: Check CORS Headers

```bash
curl -X OPTIONS http://localhost:8000/chat/sessions \
  -H "Origin: http://localhost:5173" \
  -H "Access-Control-Request-Method: POST" \
  -v

# Should see these headers in response:
# Access-Control-Allow-Origin: *
# Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS
```

### Test 4: WebSocket Connection (using websocat if installed)

```bash
# Install websocat first: brew install websocat (Mac)
websocat ws://localhost:8000/chat/ws/test-session-123

# Should immediately receive:
# {"type":"welcome","message":"Hello! I'm your AI...","session_id":"test-session-123"}
```

## Frontend Code Flow

### 1. Component Mounts

```typescript
useEffect(() => {
  initializeChat() // Runs once
}, [])
```

### 2. Create Session

```typescript
const session = await chatApi.createSession()
// POST to /chat/sessions
// Returns: {session_id, created_at, message}
```

### 3. Connect WebSocket

```typescript
const service = new ChatService(session.session_id)
await service.connect()
// Connects to: ws://localhost:8000/chat/ws/{session_id}
```

### 4. Receive Welcome

```typescript
service.onMessage((type, message) => {
  if (type === 'welcome') {
    setMessages([...]); // Add welcome message to UI
    setIsConnected(true); // ✅ Enable input
  }
});
```

### 5. Input Becomes Active

```typescript
<ChatInput
  disabled={!isConnected} // false now, so enabled!
  placeholder='Ask me anything about KCET colleges...'
/>
```

## Quick Checklist

Run through this checklist in order:

- [ ] Backend running on port 8000
- [ ] Frontend running on port 5173
- [ ] Browser console shows "WebSocket connected"
- [ ] Browser console shows "WebSocket received: {type: 'welcome', ...}"
- [ ] Browser console shows "Received message: welcome {...}"
- [ ] Welcome message appears in chat UI
- [ ] Input placeholder changes from "Connecting..." to "Ask me anything..."
- [ ] Input is enabled (not grayed out)
- [ ] No errors in browser console
- [ ] No errors in backend console

## Still Having Issues?

### Check This Code in chatService.ts (Line 45-60)

The WebSocket should call `onopen` callback:

```typescript
this.ws.onopen = () => {
  console.log('WebSocket connected') // ✅ Should see this
  this.reconnectAttempts = 0
  resolve()
}
```

### Check This Code in chat.py (Line 75-82)

Backend should send welcome message:

```python
await websocket.send_json({
    "type": "welcome",
    "message": WELCOME_MESSAGE,
    "session_id": session_id
})
```

### Enable More Detailed Logging

Add this to AIChat.tsx right after line 44:

```typescript
service.onMessage((type, message) => {
  console.log('=== MESSAGE RECEIVED ===');
  console.log('Type:', type);
  console.log('Message:', message);
  console.log('Message.message:', message.message);
  console.log('isConnected before:', isConnected);

  switch (type) {
    case 'welcome':
      console.log('Setting isConnected to TRUE');
      setMessages([...]);
      setIsConnected(true);
      console.log('isConnected should now be true');
      break;
```

This will show you exactly what's happening at each step.

## Most Likely Cause

Based on the symptoms, the most likely causes are:

1. **Backend not sending welcome message** - Check backend logs
2. **Message format mismatch** - The welcome message doesn't have `message.message` property
3. **State not updating** - React state update issue (the fix we just applied should solve this)
4. **WebSocket not actually connecting** - Check for errors in browser console

---

**Next Step:** Hard refresh your browser (Cmd+Shift+R) and check the browser console for the debug logs!
