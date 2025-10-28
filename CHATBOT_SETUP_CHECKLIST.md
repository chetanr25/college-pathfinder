# 🚀 AI Chatbot - Quick Setup Checklist

Follow these steps to get the AI chatbot up and running.

## ✅ Backend Setup

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

**Verify these packages are installed:**

- ✅ `google-generativeai`
- ✅ `websockets`
- ✅ `python-dotenv`

### 2. Configure Environment Variables

Create `backend/.env`:

```env
GEMINI_API_KEY=your_api_key_here
DATABASE_URL=sqlite:///./data/kcet_2024.db
```

**Get Gemini API Key:**

1. Visit: https://makersuite.google.com/app/apikey
2. Sign in with Google account
3. Click "Create API Key"
4. Copy and paste into `.env`

### 3. Create Sessions Directory

```bash
cd backend
mkdir -p sessions
```

### 4. Test Backend

```bash
cd backend
uvicorn main:app --reload --port 8000
```

**Verify endpoints:**

- ✅ http://localhost:8000/docs (FastAPI docs should load)
- ✅ Check that `/chat/ws/{session_id}` endpoint exists
- ✅ Test `POST /chat/sessions` to create a session

---

## ✅ Frontend Setup

### 1. Install Base Dependencies

```bash
cd frontend
npm install
```

### 2. Install Additional Dependencies (REQUIRED)

```bash
npm install react-markdown react-syntax-highlighter @types/react-syntax-highlighter
```

### 3. Configure Environment Variables

Create `frontend/.env`:

```env
VITE_WS_BASE_URL=ws://localhost:8000
VITE_API_BASE_URL=http://localhost:8000
```

### 4. Test Frontend

```bash
cd frontend
npm run dev
```

**Verify:**

- ✅ App loads at http://localhost:5173
- ✅ Navigate to http://localhost:5173/ai-chat
- ✅ Chat interface appears
- ✅ "AI Counselor" link in navbar

---

## ✅ Integration Testing

### Test 1: Connection

1. Open http://localhost:5173/ai-chat
2. Open browser console (F12)
3. Check for WebSocket connection message
4. Should see: "Connected to chat"

### Test 2: Welcome Message

1. Wait 1-2 seconds after page load
2. Should see welcome message from AI
3. Message should be: "Hello! I'm your AI college counselor..."

### Test 3: Basic Query

1. Type: "I got rank 5000"
2. Press Enter or click Send
3. Should see:
   - ✅ User message appears
   - ✅ Thinking indicator shows
   - ✅ AI response streams in
   - ✅ Message history preserved

### Test 4: Tool Calling

1. Type: "Show me computer science colleges"
2. Should see:
   - ✅ Thinking step: "Searching for Computer Science programs..."
   - ✅ Tool execution indicator
   - ✅ Response with college list

### Test 5: Error Handling

1. Stop backend server
2. Try sending a message
3. Should see:
   - ✅ Error message displayed
   - ✅ "Connecting..." placeholder
   - ✅ Send button disabled

---

## 🐛 Troubleshooting

### Issue: "Cannot connect to WebSocket"

**Solution:**

```bash
# Check backend is running
curl http://localhost:8000/health

# Check WebSocket URL in frontend/.env
cat frontend/.env
# Should be: VITE_WS_BASE_URL=ws://localhost:8000
```

### Issue: "Invalid API key"

**Solution:**

```bash
# Verify API key in backend/.env
cat backend/.env | grep GEMINI_API_KEY

# Test API key directly
python -c "
import google.generativeai as genai
genai.configure(api_key='YOUR_KEY_HERE')
print('API Key is valid!')
"
```

### Issue: "Tool definitions error"

**Solution:**

- Ensure `app/ai/tools.py` uses `type_` (with underscore)
- NOT `type` (without underscore)
- Gemini requires: `"type_": "OBJECT"` not `"type": "object"`

### Issue: "Module not found: react-markdown"

**Solution:**

```bash
cd frontend
npm install react-markdown react-syntax-highlighter @types/react-syntax-highlighter
```

### Issue: "Session not found"

**Solution:**

```bash
# Check sessions directory exists
ls backend/sessions/

# Create it if missing
mkdir -p backend/sessions/
```

### Issue: "CORS error in browser"

**Solution:**

- Backend automatically allows all origins in development
- If issue persists, check `app/middleware.py` CORS settings

---

## 📋 Pre-Launch Checklist

Before sharing with users:

### Required

- [ ] GEMINI_API_KEY configured in backend/.env
- [ ] Both backend and frontend running without errors
- [ ] WebSocket connection established successfully
- [ ] Welcome message appears on page load
- [ ] At least one test query works end-to-end
- [ ] Markdown dependencies installed

### Recommended

- [ ] Test all 6 tools work (try queries for each)
- [ ] Verify session persistence (refresh page, history preserved)
- [ ] Check mobile responsiveness
- [ ] Test error scenarios (disconnect, invalid input)
- [ ] Review system prompt for accuracy

### Optional

- [ ] Add rate limiting
- [ ] Set up session cleanup cron job
- [ ] Configure production environment variables
- [ ] Add monitoring/logging
- [ ] Create backup strategy for sessions/

---

## 🎯 Quick Test Script

Save this as `backend/test_chatbot.py`:

```python
import asyncio
from app.ai.agent import AIAgent
from app.ai.session_manager import SessionManager

async def test_chatbot():
    """Quick test of chatbot functionality"""
    sm = SessionManager()
    session = sm.create_session()
    agent = AIAgent()

    test_queries = [
        "I got rank 5000",
        "Show me computer science colleges",
        "Compare MIT and RV College"
    ]

    for query in test_queries:
        print(f"\n{'='*60}")
        print(f"Query: {query}")
        print('='*60)

        async for chunk in agent.process_message(query, session.session_id, sm):
            print(chunk, end='', flush=True)
        print("\n")

if __name__ == "__main__":
    asyncio.run(test_chatbot())
```

Run it:

```bash
cd backend
python test_chatbot.py
```

---

## ✨ Success Indicators

You'll know everything is working when:

1. ✅ Backend starts without errors
2. ✅ Frontend loads at /ai-chat
3. ✅ WebSocket connects (check browser console)
4. ✅ Welcome message appears automatically
5. ✅ Test query returns intelligent response
6. ✅ Thinking steps show during processing
7. ✅ Response streams smoothly
8. ✅ Message history persists on refresh

---

## 📞 Need Help?

Check these files for reference:

- **API Documentation:** `backend/API_DOCUMENTATION.md`
- **Implementation Guide:** `AI_CHATBOT_IMPLEMENTATION.md`
- **Architecture:** `backend/ARCHITECTURE.md`

---

**Last Updated:** January 2024
