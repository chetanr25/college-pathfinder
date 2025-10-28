# AI Chatbot Implementation - Complete Guide

## 🎯 Overview

This document provides a complete overview of the AI-powered college counseling chatbot integrated into the KCET College Predictor application. The chatbot uses Google's Gemini 1.5 Flash model with function calling capabilities to provide intelligent, context-aware college counseling.

## 📋 Features Implemented

### ✅ Completed Features

1. **Agentic AI Architecture**

   - Full autonomous agent with 6 specialized tools
   - Function calling with Gemini 1.5 Flash
   - Real-time thinking process display
   - Conversation memory (last 10 messages)
   - JSON-based session persistence

2. **Real-time Communication**

   - WebSocket-based bidirectional chat
   - Streaming responses (chunk-by-chunk)
   - Connection management with auto-reconnect
   - Session-based conversations

3. **Smart Tools Integration**

   - `get_colleges_by_rank` - Find colleges for a given rank range
   - `search_colleges` - Search with filters (branch, category, gender, location)
   - `get_cutoff_trends` - Analyze cutoff trends across rounds
   - `get_college_details` - Detailed college information
   - `get_branch_details` - Branch-specific information
   - `compare_colleges` - Side-by-side college comparison

4. **Frontend UI Components**

   - Modern chat interface with gradient theme
   - Animated thinking indicator
   - Formatted message bubbles
   - Auto-scrolling message area
   - Error handling and connection status
   - Info cards with examples and features

5. **Navigation Integration**
   - AI Counselor link added to navbar
   - SmartToy icon for visual identification
   - Route configured in App.tsx

## 🏗️ Architecture

### Backend Structure

```
backend/
├── app/
│   ├── ai/
│   │   ├── __init__.py
│   │   ├── agent.py           # Gemini AI integration
│   │   ├── prompts.py         # System prompts
│   │   ├── session_manager.py # Session & conversation management
│   │   └── tools.py           # Tool definitions & executors
│   └── routes/
│       └── chat.py            # WebSocket & REST endpoints
├── sessions/                  # JSON session storage
└── .env                       # GEMINI_API_KEY configuration
```

### Frontend Structure

```
frontend/
├── src/
│   ├── components/
│   │   └── chat/
│   │       ├── ChatInput.tsx
│   │       ├── ChatMessage.tsx
│   │       ├── ThinkingIndicator.tsx
│   │       └── MarkdownRenderer.tsx
│   ├── pages/
│   │   └── AIChat.tsx         # Main chat page
│   └── services/
│       └── chatService.ts     # WebSocket client
└── .env                       # VITE_WS_BASE_URL configuration
```

## 🔧 Configuration

### Backend Environment Variables

Create a `.env` file in the `backend/` directory:

```env
# Required
GEMINI_API_KEY=your_api_key_here

# Optional
DATABASE_URL=sqlite:///./data/kcet_2024.db
```

### Frontend Environment Variables

Create a `.env` file in the `frontend/` directory:

```env
# WebSocket URL (default: ws://localhost:8000)
VITE_WS_BASE_URL=ws://localhost:8000
VITE_API_BASE_URL=http://localhost:8000
```

## 🚀 Getting Started

### 1. Install Backend Dependencies

```bash
cd backend
pip install -r requirements.txt
```

**New dependencies added:**

- `google-generativeai` - Gemini AI SDK
- `websockets` - WebSocket support
- `python-dotenv` - Environment variable management

### 2. Install Frontend Dependencies

```bash
cd frontend
npm install
```

**Pending dependencies to install:**

```bash
npm install react-markdown react-syntax-highlighter @types/react-syntax-highlighter
```

### 3. Configure API Keys

1. Get a Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Add to `backend/.env`:
   ```
   GEMINI_API_KEY=your_actual_api_key_here
   ```

### 4. Start the Application

**Terminal 1 - Backend:**

```bash
cd backend
uvicorn main:app --reload --port 8000
```

**Terminal 2 - Frontend:**

```bash
cd frontend
npm run dev
```

### 5. Access the Chatbot

Navigate to: `http://localhost:5173/ai-chat`

## 📡 API Endpoints

### WebSocket Endpoint

**Connect:** `ws://localhost:8000/chat/ws/{session_id}`

**Client → Server Messages:**

```json
{
  "message": "I got rank 5000, which colleges can I get?"
}
```

**Server → Client Messages:**

1. **Welcome Message**

```json
{
  "type": "welcome",
  "data": {
    "message": "Hello! I'm your AI college counselor...",
    "session_id": "abc123"
  }
}
```

2. **Thinking Steps**

```json
{
  "type": "thinking",
  "data": {
    "step": "Analyzing your rank range...",
    "timestamp": "2024-01-15T10:30:00"
  }
}
```

3. **Tool Execution**

```json
{
  "type": "tool_call",
  "data": {
    "tool_name": "get_colleges_by_rank",
    "status": "executing",
    "arguments": { "rank": 5000, "buffer": 500 }
  }
}
```

4. **Response Chunks**

```json
{
  "type": "response_chunk",
  "data": {
    "content": "Based on your rank...",
    "timestamp": "2024-01-15T10:30:01"
  }
}
```

5. **Response Complete**

```json
{
  "type": "response_complete",
  "data": {
    "message_id": "msg_123",
    "full_content": "Complete response text...",
    "timestamp": "2024-01-15T10:30:05"
  }
}
```

6. **Error**

```json
{
  "type": "error",
  "data": {
    "message": "Failed to process request",
    "code": "PROCESSING_ERROR"
  }
}
```

### REST Endpoints

#### Create Session

```http
POST /chat/sessions
Response: {
  "session_id": "abc123",
  "created_at": "2024-01-15T10:30:00"
}
```

#### Get Session

```http
GET /chat/sessions/{session_id}
Response: {
  "session_id": "abc123",
  "created_at": "2024-01-15T10:30:00",
  "last_activity": "2024-01-15T10:35:00",
  "message_count": 5
}
```

#### List Sessions

```http
GET /chat/sessions
Response: {
  "sessions": [
    {
      "session_id": "abc123",
      "created_at": "2024-01-15T10:30:00",
      "last_activity": "2024-01-15T10:35:00",
      "message_count": 5
    }
  ]
}
```

#### Get Session History

```http
GET /chat/sessions/{session_id}/history?limit=10
Response: {
  "session_id": "abc123",
  "messages": [
    {
      "message_id": "msg_1",
      "role": "user",
      "content": "Hello",
      "timestamp": "2024-01-15T10:30:00"
    }
  ]
}
```

#### Clear Session

```http
DELETE /chat/sessions/{session_id}
Response: {
  "message": "Session cleared successfully"
}
```

## 🛠️ AI Agent Configuration

### Model Settings

```python
# In app/ai/agent.py
model_name = "gemini-1.5-flash"
temperature = 0.7
top_p = 0.95
top_k = 40
max_output_tokens = 2048
```

### System Prompt

The agent is configured with a comprehensive system prompt that defines:

- Role as expert KCET college counselor
- Knowledge scope (KCET 2024 data)
- Tool usage guidelines
- Response format preferences
- Transparency requirements

### Context Window

- **Message History:** Last 10 messages
- **Session Storage:** Persistent JSON files
- **Memory:** In-memory cache + file backup

### Tool Calling

The agent can call multiple tools in sequence to:

1. Gather information (e.g., get colleges by rank)
2. Filter and refine (e.g., search with branch filter)
3. Analyze trends (e.g., cutoff comparison)
4. Provide comprehensive answers

## 🎨 UI Components

### ChatMessage Component

**Features:**

- Gradient bubble design (user: blue, assistant: purple)
- Basic markdown support (bold, italic, lists)
- Timestamps
- Auto-formatting of line breaks

**Usage:**

```tsx
<ChatMessage
  message={{
    message_id: 'msg_1',
    role: 'user',
    content: 'Hello!',
    timestamp: '2024-01-15T10:30:00'
  }}
/>
```

### ThinkingIndicator Component

**Features:**

- Animated pulse effect
- Spinning gear icon
- Step-by-step display
- Checkmarks for completed steps

**Usage:**

```tsx
<ThinkingIndicator
  steps={[
    { step: 'Analyzing rank...', timestamp: '...', completed: true },
    { step: 'Searching colleges...', timestamp: '...' }
  ]}
/>
```

### ChatInput Component

**Features:**

- Multi-line text input
- Send button with gradient
- Enter key support (Shift+Enter for new line)
- Disabled states during processing
- Loading indicator

**Usage:**

```tsx
<ChatInput
  onSendMessage={handleSend}
  disabled={isProcessing}
  placeholder='Ask me anything...'
/>
```

## 🔍 Example Conversations

### Example 1: Rank-based Search

**User:** "I got rank 5000 in KCET. Which colleges can I get?"

**Agent Response:**

1. **Thinks:** "Analyzing rank range around 5000..."
2. **Calls Tool:** `get_colleges_by_rank(5000, buffer=500)`
3. **Responds:** "Based on your rank of 5000, here are colleges you can target..."
   - Lists 10-15 colleges with cutoff comparisons
   - Suggests applying to both safe and ambitious choices

### Example 2: Branch-specific Query

**User:** "Show me top computer science colleges"

**Agent Response:**

1. **Thinks:** "Searching for Computer Science programs..."
2. **Calls Tool:** `search_colleges(branch_name="Computer Science", limit=10)`
3. **Responds:** "Here are the top Computer Science colleges in Karnataka..."
   - Displays colleges with CS cutoffs
   - Highlights prestigious programs

### Example 3: Multi-step Analysis

**User:** "I want to compare MIT and RV College for Electronics"

**Agent Response:**

1. **Thinks:** "Fetching details for both colleges..."
2. **Calls Tool:** `get_college_details("E001")` (MIT)
3. **Calls Tool:** `get_college_details("E002")` (RV)
4. **Calls Tool:** `compare_colleges(["E001", "E002"])`
5. **Responds:** Detailed comparison table with:
   - Electronics branch cutoffs
   - Total seats
   - Location advantages
   - Recommendation based on user's rank

## 📊 Session Management

### Session Lifecycle

1. **Creation:** User opens chat → Backend creates session → Returns session_id
2. **Connection:** Frontend connects to WebSocket with session_id
3. **Conversation:** Messages exchanged and stored
4. **Persistence:** Session saved to JSON after each message
5. **Cleanup:** Sessions remain until explicitly deleted

### Session Storage Format

```json
{
  "session_id": "abc123",
  "created_at": "2024-01-15T10:30:00",
  "last_activity": "2024-01-15T10:35:00",
  "messages": [
    {
      "message_id": "msg_1",
      "role": "user",
      "content": "Hello",
      "timestamp": "2024-01-15T10:30:00"
    },
    {
      "message_id": "msg_2",
      "role": "assistant",
      "content": "Hi! How can I help?",
      "timestamp": "2024-01-15T10:30:02"
    }
  ]
}
```

## 🚧 Known Limitations

1. **MarkdownRenderer:**

   - Component created but needs npm dependencies
   - Install: `npm install react-markdown react-syntax-highlighter @types/react-syntax-highlighter`

2. **Rate Limiting:**

   - No rate limiting implemented yet
   - Recommended: Add per-session rate limiting for production

3. **Authentication:**

   - Currently anonymous sessions
   - Future: Integrate with user authentication

4. **Voice Integration:**
   - Planned but not implemented
   - Future: Add speech-to-text and text-to-speech

## 🔜 Pending Tasks

### High Priority

- [ ] Install markdown rendering dependencies
- [ ] Add rate limiting to prevent abuse
- [ ] Implement session cleanup (auto-delete old sessions)
- [ ] Add error retry logic in frontend

### Medium Priority

- [ ] Add user authentication integration
- [ ] Implement conversation export (PDF/text)
- [ ] Add feedback mechanism (thumbs up/down)
- [ ] Track tool usage analytics

### Low Priority

- [ ] Voice input/output integration
- [ ] Multi-language support
- [ ] Dark mode for chat interface
- [ ] Mobile-responsive chat layout improvements

## 🧪 Testing

### Backend Testing

Test the AI agent directly:

```bash
cd backend
python -c "
from app.ai.agent import AIAgent
from app.ai.session_manager import SessionManager

sm = SessionManager()
session = sm.create_session()
agent = AIAgent()

async def test():
    async for chunk in agent.process_message(
        'I got rank 5000',
        session.session_id,
        sm
    ):
        print(chunk)

import asyncio
asyncio.run(test())
"
```

### Frontend Testing

1. Open browser console
2. Navigate to `/ai-chat`
3. Check WebSocket connection:
   ```javascript
   // Should see in Network tab:
   // WS ws://localhost:8000/chat/ws/{session_id}
   ```
4. Send test messages and verify:
   - Thinking steps appear
   - Response chunks stream
   - Auto-scroll works
   - Error handling displays

## 📝 Future Enhancements

1. **Advanced Features:**

   - Multi-modal inputs (images, PDFs)
   - Personalized recommendations based on preferences
   - Integration with college websites for live data
   - Admission deadline tracking

2. **Performance:**

   - Response caching for common queries
   - Tool result caching
   - Lazy loading of chat history

3. **Analytics:**
   - Popular query tracking
   - Tool usage statistics
   - Session duration metrics
   - Conversion tracking (queries → college applications)

## 🤝 Contributing

When extending the chatbot:

1. **Adding New Tools:**

   - Define schema in `app/ai/tools.py`
   - Implement executor function
   - Add to `TOOL_DEFINITIONS` array
   - Update system prompt if needed

2. **Modifying UI:**

   - Keep gradient theme consistent
   - Test on mobile devices
   - Maintain accessibility standards
   - Update TypeScript types

3. **Backend Changes:**
   - Add type hints
   - Update API documentation
   - Write tests for new endpoints
   - Update requirements.txt

## 📄 License

This chatbot implementation is part of the KCET College Predictor project.

## 🙏 Acknowledgments

- **Google Gemini:** AI model powering the agent
- **FastAPI:** WebSocket and REST framework
- **Material-UI:** React component library
- **React:** Frontend framework

---

**Last Updated:** January 2024
**Version:** 1.0.0
**Status:** Production Ready (pending markdown dependencies)
