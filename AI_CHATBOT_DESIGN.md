# 🤖 AI College Counselor Chatbot - Design Document

## 📋 Overview

An intelligent, conversational AI chatbot that helps students with KCET college admission queries. The system uses Google Gemini API with agentic reasoning, WebSocket for real-time communication, and shows thinking process transparently to users.

---

## 🎯 Core Requirements

### 1. **Agentic AI with Tool Calling**

- Use Gemini API with function calling capabilities
- AI decides which APIs to call based on user query
- Multi-step reasoning for complex queries
- Context-aware conversation memory

### 2. **Real-time Communication**

- WebSocket connection for streaming responses
- Show "thinking process" animations
- Display which APIs are being called
- Stream final response as markdown

### 3. **Session Management**

- Session-based conversation storage
- Persist chat history locally (in-memory or file-based)
- Retrieve full conversation context
- Support multiple concurrent sessions

### 4. **Beautiful UI**

- Match existing website theme (purple-blue gradients)
- Animated thinking indicators
- Markdown rendering for responses
- Chat bubble design with smooth animations

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      FRONTEND (React)                        │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Chatbot Component                                      │ │
│  │  - Message Input                                        │ │
│  │  - Chat History Display                                 │ │
│  │  - Thinking Indicator (animated)                        │ │
│  │  - Markdown Renderer                                    │ │
│  └────────────────────────────────────────────────────────┘ │
│                           ↕ WebSocket                        │
└─────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────┐
│                    BACKEND (FastAPI)                         │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  WebSocket Manager                                      │ │
│  │  - Handle connections                                   │ │
│  │  - Stream messages                                      │ │
│  │  - Broadcast thinking steps                             │ │
│  └────────────────────────────────────────────────────────┘ │
│                           ↕                                  │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  AI Agent Service (Gemini)                              │ │
│  │  - Query understanding                                  │ │
│  │  - Tool selection & execution                           │ │
│  │  - Response generation                                  │ │
│  │  - Context management                                   │ │
│  └────────────────────────────────────────────────────────┘ │
│                           ↕                                  │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Session Manager                                        │ │
│  │  - Create/retrieve sessions                             │ │
│  │  - Store conversation history                           │ │
│  │  - Manage context window                                │ │
│  └────────────────────────────────────────────────────────┘ │
│                           ↕                                  │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Tool Registry (API Functions)                          │ │
│  │  - get_colleges_by_rank()                               │ │
│  │  - search_colleges()                                    │ │
│  │  - get_all_branches()                                   │ │
│  │  - get_colleges_by_branch()                             │ │
│  │  - get_cutoff_trends()                                  │ │
│  │  - get_college_branches()                               │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 Data Structures

### 1. **Session Object**

```python
class ChatSession:
    session_id: str              # UUID
    created_at: datetime
    updated_at: datetime
    messages: List[Message]      # Conversation history
    context: Dict[str, Any]      # User context (rank, preferences, etc.)
    metadata: Dict[str, Any]     # Session metadata
```

### 2. **Message Object**

```python
class Message:
    message_id: str              # UUID
    role: Literal["user", "assistant", "system", "thinking"]
    content: str                 # Message text
    timestamp: datetime
    metadata: Optional[Dict]     # Tool calls, thinking steps, etc.

# Example metadata for assistant messages:
{
    "tool_calls": [
        {
            "tool": "get_colleges_by_rank",
            "parameters": {"rank": 5000, "round": 1, "limit": 10},
            "result_summary": "Found 10 colleges"
        }
    ],
    "thinking_steps": [
        "User mentioned rank 5000",
        "Filtering for computer-related branches",
        "Calling get_all_branches API",
        "Found 3 matching branches: CS, AI, ISE",
        "Calling search_colleges with filtered branches",
        "Received 25 colleges, showing top 10"
    ]
}
```

### 3. **WebSocket Message Types**

```typescript
// Client → Server
{
    type: "chat_message",
    session_id: string,
    message: string
}

{
    type: "get_history",
    session_id: string
}

// Server → Client
{
    type: "thinking",
    step: string,
    timestamp: string
}

{
    type: "tool_call",
    tool_name: string,
    parameters: object,
    status: "started" | "completed" | "failed"
}

{
    type: "response_chunk",
    content: string,
    is_final: boolean
}

{
    type: "history",
    messages: Message[]
}

{
    type: "error",
    message: string
}
```

---

## 🛠️ Backend Implementation

### File Structure

```
backend/
├── app/
│   ├── ai/
│   │   ├── __init__.py
│   │   ├── agent.py              # Main AI agent with Gemini
│   │   ├── tools.py              # Tool definitions for function calling
│   │   ├── prompts.py            # System prompts and templates
│   │   └── session_manager.py   # Session & conversation management
│   ├── routes/
│   │   └── chat.py              # WebSocket & chat endpoints
│   ├── schemas.py               # Updated with chat schemas
│   └── ...
```

### Key Endpoints

#### 1. **WebSocket Chat Endpoint**

```python
@router.websocket("/ws/chat")
async def chat_websocket(websocket: WebSocket, session_id: str):
    """
    Main chat WebSocket endpoint
    - Accepts user messages
    - Streams thinking process
    - Returns AI responses
    """
```

#### 2. **Session Management**

```python
@router.post("/chat/sessions")
async def create_session() -> ChatSessionResponse:
    """Create a new chat session"""

@router.get("/chat/sessions/{session_id}")
async def get_session(session_id: str) -> ChatSessionResponse:
    """Get full session with conversation history"""

@router.delete("/chat/sessions/{session_id}")
async def delete_session(session_id: str):
    """Delete a session"""

@router.get("/chat/sessions/{session_id}/messages")
async def get_messages(session_id: str) -> List[Message]:
    """Get all messages in a session"""
```

#### 3. **Tool Documentation Endpoint**

```python
@router.get("/chat/tools")
async def get_available_tools() -> List[ToolDefinition]:
    """
    Returns list of all tools available to AI
    Used for documentation and debugging
    """
```

---

## 🤖 AI Agent Design

### Tool Definitions for Gemini

```python
tools = [
    {
        "name": "get_colleges_by_rank",
        "description": "Find colleges where a student with given rank can get admission. Use this when user provides their rank.",
        "parameters": {
            "type": "object",
            "properties": {
                "rank": {
                    "type": "integer",
                    "description": "Student's KCET rank (must be positive)"
                },
                "round": {
                    "type": "integer",
                    "description": "Counselling round (1, 2, or 3)",
                    "default": 1
                },
                "limit": {
                    "type": "integer",
                    "description": "Maximum number of colleges to return (1-500)",
                    "default": 10
                }
            },
            "required": ["rank"]
        }
    },
    {
        "name": "get_all_branches",
        "description": "Get list of all available engineering branches. Use this to discover branch options or filter by user preferences.",
        "parameters": {
            "type": "object",
            "properties": {}
        }
    },
    {
        "name": "search_colleges",
        "description": "Advanced search with multiple filters including rank range and specific branches. Use when user specifies branch preferences or wants filtered results.",
        "parameters": {
            "type": "object",
            "properties": {
                "min_rank": {
                    "type": "integer",
                    "description": "Minimum rank (colleges with cutoff >= this rank)"
                },
                "max_rank": {
                    "type": "integer",
                    "description": "Maximum rank (colleges with cutoff <= this rank)"
                },
                "branches": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "List of branch names to filter (e.g., ['Computer Science Engineering', 'Artificial Intelligence'])"
                },
                "round": {
                    "type": "integer",
                    "description": "Counselling round (1, 2, or 3)",
                    "default": 1
                },
                "limit": {
                    "type": "integer",
                    "description": "Maximum results (1-500)"
                }
            }
        }
    },
    {
        "name": "get_colleges_by_branch",
        "description": "Get all colleges offering a specific branch. Use when user asks about a single specific branch.",
        "parameters": {
            "type": "object",
            "properties": {
                "branch": {
                    "type": "string",
                    "description": "Branch name (e.g., 'Computer Science Engineering')"
                },
                "round": {"type": "integer", "default": 1},
                "limit": {"type": "integer"}
            },
            "required": ["branch"]
        }
    },
    {
        "name": "get_cutoff_trends",
        "description": "Get cutoff rank trends across all 3 rounds for a specific college and branch. Use for trend analysis.",
        "parameters": {
            "type": "object",
            "properties": {
                "college_code": {
                    "type": "string",
                    "description": "College code (e.g., 'E001')"
                },
                "branch": {
                    "type": "string",
                    "description": "Branch name"
                }
            },
            "required": ["college_code", "branch"]
        }
    },
    {
        "name": "get_college_branches",
        "description": "Get all branches offered by a specific college with their cutoff ranks.",
        "parameters": {
            "type": "object",
            "properties": {
                "college_code": {
                    "type": "string",
                    "description": "College code (e.g., 'E001')"
                }
            },
            "required": ["college_code"]
        }
    }
]
```

### System Prompt

```python
SYSTEM_PROMPT = """You are an expert KCET college counselor AI assistant helping students with engineering college admissions in Karnataka.

Your capabilities:
- Help students find suitable colleges based on their rank
- Provide information about different engineering branches
- Compare colleges and cutoff trends
- Guide students through the counselling process
- Answer questions about specific colleges and branches

Important guidelines:
1. Always ask for the student's rank if not provided
2. Be conversational and friendly, remember context from previous messages
3. When users mention preferences like "computer-related" or "core engineering", intelligently filter branches:
   - Computer-related: Computer Science, AI, ML, Data Science, Information Science, etc.
   - Core: Mechanical, Civil, Electrical, etc.
   - Electronics: Electronics, ECE, EEE, etc.
4. Explain your reasoning when making suggestions
5. Provide actionable advice for counselling strategy
6. If unsure about a college code or exact branch name, use available tools to search
7. Format responses in clear markdown with headings, lists, and tables where appropriate
8. Always consider the counselling round (default to round 1 if not specified)

Remember: You have access to real-time data through tools. Use them to provide accurate, up-to-date information.
"""
```

---

## 🎨 Frontend Design

### Chatbot Component Layout

```
┌─────────────────────────────────────────────────────────┐
│  🤖 KCET AI Counselor                           [─][×]  │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │  💬 Hello! I'm your AI college counselor.      │   │
│  │     How can I help you today?                  │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│          ┌─────────────────────────────────────────┐   │
│          │  I got rank 5000, which colleges can   │   │
│          │  I get for computer branches?          │   │
│          └─────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │  🤔 Thinking...                                 │   │
│  │  ↻ Fetching all engineering branches           │   │
│  │  ✓ Found 45 branches                           │   │
│  │  ↻ Filtering computer-related branches         │   │
│  │  ✓ Identified: Computer Science, AI, IS, DS    │   │
│  │  ↻ Searching colleges for rank 5000            │   │
│  │  ✓ Found 28 colleges                           │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Great! Based on rank 5000, here are          │   │
│  │  computer-related colleges you can get:        │   │
│  │                                                 │   │
│  │  ### Top Colleges                              │   │
│  │  1. **RV College** - Computer Science          │   │
│  │     Cutoff: 1234                               │   │
│  │  2. **BMS College** - AI & ML                  │   │
│  │     Cutoff: 2456                               │   │
│  │  ...                                           │   │
│  └─────────────────────────────────────────────────┘   │
│                                                         │
├─────────────────────────────────────────────────────────┤
│  Type your message...                      [Send 📤]   │
└─────────────────────────────────────────────────────────┘
```

### Theme Matching

```typescript
// Colors from existing theme
const chatTheme = {
  background: '#f8f9fa',
  messageUser: 'linear-gradient(135deg, #FA8BFF 0%, #2BD2FF 90%)',
  messageAssistant: '#ffffff',
  thinking: '#f0f0f0',
  thinkingAccent: '#4F46E5',
  border: '#e0e0e0',
  text: {
    user: '#ffffff',
    assistant: '#1a1a1a',
    thinking: '#666666'
  }
}
```

### Thinking Indicator Animation

```tsx
// Animated dots: ⚡ → 🔄 → ⚙️ → ✅
// With smooth fade transitions
// Show current step being executed
// Progress bar for multi-step processes
```

### Component Structure

```
src/
├── pages/
│   └── AIChat.tsx                    # New chat page
├── components/
│   ├── chat/
│   │   ├── ChatContainer.tsx         # Main chat wrapper
│   │   ├── ChatMessage.tsx           # Single message bubble
│   │   ├── ThinkingIndicator.tsx    # Animated thinking display
│   │   ├── ChatInput.tsx            # Message input field
│   │   ├── MarkdownRenderer.tsx     # Render markdown responses
│   │   └── ToolCallDisplay.tsx      # Show API calls being made
│   └── ...
└── services/
    └── chatService.ts               # WebSocket connection logic
```

---

## 🔄 User Flow Examples

### Example 1: Simple Query

```
User: "What colleges can I get with rank 5000?"

AI Thinking:
↻ Analyzing query...
✓ Detected rank: 5000
↻ Calling get_colleges_by_rank(rank=5000, limit=10)
✓ Retrieved 10 colleges

AI Response:
"Based on rank 5000, here are top 10 colleges you can get admission to..."
```

### Example 2: Complex Query with Preference

```
User: "I got 15000 rank and prefer computer related branches"

AI Thinking:
↻ Analyzing query...
✓ Detected rank: 15000
✓ Detected preference: computer-related branches
↻ Fetching all branches...
✓ Found 45 branches
↻ Filtering computer-related branches...
✓ Matched 5 branches: Computer Science, AI, Information Science, Data Science, IT
↻ Searching colleges with branch filter...
✓ Found 35 colleges

AI Response:
"Great! For rank 15000, I found 35 colleges offering computer-related branches..."
```

### Example 3: Follow-up Conversation

```
User: "Show me colleges"
AI: "I'd be happy to help! Could you please tell me your KCET rank?"

User: "32000"
AI Thinking:
↻ Using rank from conversation: 32000
↻ Calling get_colleges_by_rank(rank=32000, limit=10)
✓ Found 10 colleges

AI Response:
"Based on rank 32000, here are colleges you can explore..."

User: "What about mechanical engineering only?"
AI Thinking:
↻ User wants to filter previous results
✓ Branch: Mechanical Engineering
✓ Rank from context: 32000
↻ Calling search_colleges(min_rank=32000, branches=['Mechanical Engineering'])
✓ Found 18 colleges

AI Response:
"Here are mechanical engineering colleges for rank 32000..."
```

---

## 📦 Tech Stack

### Backend

- **FastAPI WebSocket** - Real-time communication
- **Google Gemini API** - AI model with function calling
- **Python dictionaries/JSON files** - Session storage (for now)
- **asyncio** - Async operations

### Frontend

- **React** - UI framework
- **WebSocket API** - Real-time connection
- **react-markdown** - Markdown rendering
- **framer-motion** - Animations
- **MUI** - UI components (existing)

---

## 🚀 Implementation Phases

### Phase 1: Backend Foundation

1. Create session manager with in-memory storage
2. Define tool registry with all API functions
3. Set up Gemini API integration
4. Implement tool calling logic

### Phase 2: WebSocket Communication

1. Create WebSocket endpoint
2. Implement message broadcasting
3. Add thinking step streaming
4. Handle errors gracefully

### Phase 3: AI Agent

1. Define system prompt
2. Implement tool execution
3. Add context management
4. Test multi-turn conversations

### Phase 4: Frontend UI

1. Create chat page and components
2. Implement WebSocket connection
3. Add thinking indicator animations
4. Integrate markdown rendering

### Phase 5: Polish & Testing

1. Add typing indicators
2. Improve error handling
3. Add session persistence
4. Performance optimization

---

## ❓ Questions Before Implementation

1. **Session Storage**: Start with in-memory dictionary or use JSON file persistence from day 1?

2. **Gemini Model**: Which Gemini model to use?

   - `gemini-1.5-flash` (faster, cheaper)
   - `gemini-1.5-pro` (more capable)

3. **Rate Limiting**: Should we add rate limiting per session to prevent abuse?

4. **Chat History Limit**: How many messages to keep in context window? (e.g., last 10 messages)

5. **Branch Filtering Logic**: Should AI use fuzzy matching for branches (e.g., "computer" matches "Computer Science", "Computer Networking", etc.)?

6. **Authentication**: Do we need user authentication for sessions, or keep it anonymous with just session IDs?

7. **Deployment**: Where are we planning to deploy this? (affects WebSocket configuration)

8. **Monitoring**: Should we log all conversations for debugging and improvement?

---

## 📝 Next Steps

Once you approve this design, I'll:

1. Create all backend files (agent, tools, session manager, routes)
2. Implement WebSocket endpoint
3. Set up Gemini integration
4. Create frontend chat components
5. Test end-to-end flow

**Please review and let me know:**

- Any changes to the design
- Answers to the questions above
- Any additional features you'd like
- If we're good to start implementation!
