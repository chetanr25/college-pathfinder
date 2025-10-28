# 🔧 Frontend "Connecting..." Fix

## Issue

Frontend shows "Connecting..." indefinitely even though:

- Backend shows "WebSocket connection opened"
- Backend sends session_id
- Connection is established

## Root Cause

The frontend message handler was not properly receiving the welcome message from the backend.

## Fixes Applied

### 1. Updated Message Handler (AIChat.tsx)

- Changed parameter name from `data` to `message` for clarity
- Added console.log for debugging
- Fixed all references to use `message.field` instead of `data.field`

### 2. Added Debug Logging (chatService.ts)

- Added `console.log('WebSocket received:', data)` to see incoming messages
- This helps verify what the backend is actually sending

## Testing Steps

### 1. Clear Browser Cache & Reload

```bash
# In browser console (F12)
# 1. Right-click reload button
# 2. Select "Empty Cache and Hard Reload"
# OR just press Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
```

### 2. Check Browser Console

Open browser console (F12) and look for:

**Expected logs:**

```
WebSocket connected
WebSocket received: {type: "welcome", message: "Hello! I'm your AI...", session_id: "..."}
Received message: welcome {type: "welcome", message: "Hello!...", session_id: "..."}
```

**If you see these logs:**
✅ WebSocket is working correctly
✅ Welcome message is being received
✅ The issue should be fixed

### 3. What You Should See

**Before Fix:**

- "Connecting..." never goes away
- No welcome message appears
- Console might be silent or show errors

**After Fix:**

- Welcome message appears immediately (1-2 seconds)
- Chat input becomes active
- Placeholder changes from "Connecting..." to "Ask me anything..."

## Backend Message Format

The backend sends messages in this format:

```json
{
  "type": "welcome",
  "message": "Hello! I'm your AI college counselor...",
  "session_id": "abc123"
}
```

The frontend now correctly reads `message.message` instead of looking for `data.data.message`.

## Manual Testing

### Test 1: Welcome Message

1. Go to http://localhost:5173/ai-chat
2. Open browser console (F12)
3. Wait 1-2 seconds
4. **Expected:** Welcome message appears

### Test 2: Send Message

1. Type "Hello" in the input
2. Press Enter
3. **Expected:**
   - Your message appears
   - "AI is thinking..." shows briefly
   - AI response streams in

### Test 3: Check Logs

Look in browser console for:

```
WebSocket connected ✅
WebSocket received: {type: "welcome", ...} ✅
Received message: welcome {...} ✅
```

## If Still Stuck on "Connecting..."

### Check 1: Verify Backend is Running

```bash
curl http://localhost:8000/chat/sessions -X POST
# Should return: {"session_id": "...", "created_at": "...", "message": "..."}
```

### Check 2: Check Browser Console for Errors

Look for:

- ❌ WebSocket connection errors
- ❌ CORS errors
- ❌ 404 errors

### Check 3: Verify WebSocket URL

In browser console, check:

```javascript
// Should log the WebSocket URL
console.log(import.meta.env.VITE_WS_BASE_URL)
// Expected: "ws://localhost:8000" or similar
```

### Check 4: Network Tab

1. Open Network tab (F12)
2. Filter by "WS" (WebSocket)
3. Click on the WebSocket connection
4. Check "Messages" tab
5. **Expected:** See welcome message in received messages

## Quick Fix Commands

### Rebuild Frontend (if needed)

```bash
cd frontend
npm run build
npm run dev
```

### Force Reload Browser

- Mac: `Cmd + Shift + R`
- Windows/Linux: `Ctrl + Shift + R`

### Clear React State

If welcome message appears but input still shows "Connecting...":

1. Check `disabled` prop on ChatInput
2. Verify `chatService?.isConnected()` returns true

## Debug Checklist

After refreshing the page, verify:

- [ ] Backend logs show: "WebSocket connection opened"
- [ ] Browser console shows: "WebSocket connected"
- [ ] Browser console shows: "WebSocket received: {type: 'welcome', ...}"
- [ ] Browser console shows: "Received message: welcome {...}"
- [ ] Welcome message appears in chat UI
- [ ] Input placeholder changes from "Connecting..." to "Ask me anything..."
- [ ] Send button is enabled (not disabled)

## Additional Changes Made

### AIChat.tsx - Line 45

**Before:**

```typescript
service.onMessage((type, data) => {
  switch (type) {
    case 'welcome':
      content: data.message,  // ❌ Wrong
```

**After:**

```typescript
service.onMessage((type, message) => {
  console.log('Received message:', type, message); // Debug
  switch (type) {
    case 'welcome':
      content: message.message,  // ✅ Correct
```

### chatService.ts - Line 51

**Added debug logging:**

```typescript
this.ws.onmessage = (event) => {
  try {
    const data = JSON.parse(event.data);
    console.log('WebSocket received:', data); // ✅ New
    this.handleMessage(data);
```

---

## Next Steps

1. **Hard refresh the browser** (Cmd+Shift+R or Ctrl+Shift+R)
2. **Open browser console** (F12)
3. **Navigate to** http://localhost:5173/ai-chat
4. **Check console logs** - you should see welcome message
5. **Verify UI** - welcome message should appear

If you still see "Connecting...", check the browser console logs and share them for further debugging.

---

**Status:** ✅ Fix Applied - Hard refresh browser to test
**Date:** October 28, 2025
