# API Documentation

## Base URL

```
http://localhost:8005  (Development)
```

## REST Endpoints

### Colleges

**Base Path**: `/colleges`  
**File**: `backend/app/routes/colleges.py`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/colleges/by-rank/{rank}` | Get colleges accessible for a specific rank |
| `GET` | `/colleges/by-branch/{branch}` | Get all colleges offering a specific branch |
| `GET` | `/colleges/search` | Advanced search with multiple filters |
| `GET` | `/colleges/cutoff/{college_code}/{branch}` | Get cutoff trends for a college-branch combination |
| `GET` | `/colleges/{college_code}/branches` | Get all branches offered by a college |
| `GET` | `/colleges/all` | List all colleges in the database |

### Branches

**Base Path**: `/branches`  
**File**: `backend/app/routes/branches.py`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/branches/list` | Get all available engineering branches |

### Chat

**Base Path**: `/chat`  
**File**: `backend/app/routes/chat.py`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `WS` | `/chat/ws/{session_id}` | Real-time AI chat via WebSocket |
| `POST` | `/chat/sessions` | Create a new chat session |
| `GET` | `/chat/sessions` | Get user's chat sessions |

### Email

**Base Path**: `/api/email`  
**File**: `backend/app/routes/email_routes.py`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/email/send-prediction-summary` | Send prediction summary email |
| `POST` | `/api/email/send-welcome` | Send welcome email to new users |
| `POST` | `/api/email/send-comparison` | Send college comparison report |
| `GET` | `/api/email/status` | Check email service status |

### Authentication

**Base Path**: `/auth`  
**File**: `backend/app/routes/auth.py`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/auth/login` | Authenticate user |
| `POST` | `/auth/logout` | Logout user |
| `GET` | `/auth/me` | Get current user info |

## WebSocket Message Types

### Client to Server

```json
// Send chat message
{
  "type": "chat_message",
  "message": "What colleges can I get with rank 5000?"
}

// Request conversation history
{
  "type": "get_history"
}
```

### Server to Client

```json
// Welcome message on connection
{
  "type": "welcome",
  "message": "Welcome! How can I help you?",
  "session_id": "abc123"
}

// AI thinking/reasoning step
{
  "type": "thinking",
  "step": "Analyzing your rank and preferences...",
  "timestamp": "2024-01-15T10:30:00Z"
}

// Tool execution notification
{
  "type": "tool_call",
  "tool_name": "get_colleges_by_rank",
  "parameters": {"rank": 5000},
  "status": "completed"
}

// Streaming response chunk
{
  "type": "response_chunk",
  "content": "Based on your rank of 5000...",
  "is_final": false
}

// Complete response
{
  "type": "response_complete",
  "message_id": "msg_123",
  "full_content": "Complete response text..."
}

// Error message
{
  "type": "error",
  "message": "Unable to process request. Please try again."
}
```

## Request/Response Examples

### Get Colleges by Rank

**Request:**
```http
GET /colleges/by-rank/5000?round=1&limit=10
```

**Response:**
```json
[
  {
    "college_code": "E001",
    "college_name": "RV College of Engineering",
    "branch_name": "Computer Science",
    "cutoff_rank": 4500,
    "round": 1
  }
]
```

### Advanced Search

**Request:**
```http
GET /colleges/search?min_rank=1000&max_rank=5000&branch=Computer Science&sort_by=rank
```

**Response:**
```json
{
  "results": [...],
  "total": 150,
  "page": 1,
  "limit": 20
}
```

