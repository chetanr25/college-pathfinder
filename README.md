# KCET College Predictor

An intelligent, full-stack web application that helps students navigate Karnataka Common Entrance Test (KCET) college admissions through AI-powered counseling, real-time data analysis, and personalized recommendations.

## Table of Contents

- [What This Solves](#what-this-solves)
- [Features](#features)
- [Technology Stack](#technology-stack)
- [Agentic AI System](#agentic-ai-system)
- [API Documentation](#api-documentation)
- [Database](#database)
- [Contributing](#contributing)
- [License](#license)

## What This Solves

Every year, thousands of students struggle with KCET counseling due to complex cutoff trends, difficulty finding suitable colleges based on rank, lack of personalized guidance, and overwhelming data from 1000+ colleges across multiple engineering branches.

This platform provides real-time college predictions, AI-powered conversational counseling, automated analysis reports, advanced filtering and comparison tools, and historical cutoff trend analysis.

## Features

### Core Functionality

- **Rank-Based Prediction**: Find colleges accessible based on KCET rank with configurable round selection
- **Branch-Wise Search**: Explore colleges offering specific engineering branches with cutoff analysis
- **Advanced Filtering**: Multi-parameter search with rank ranges, branch preferences, and sorting
- **College Comparison**: Side-by-side comparison of multiple colleges with detailed metrics
- **Cutoff Trends**: Historical cutoff data across all counseling rounds
- **Fuzzy Matching**: Intelligent search handles abbreviations (e.g., "RV" matches "RV College of Engineering")

### AI-Powered Counseling

The AI counselor uses Google Gemini 2.5 Flash with function calling to autonomously query the database and provide personalized guidance. The agent has access to 18 specialized tools across four categories:

**Data Retrieval**: [`backend/app/ai/tools.py`](backend/app/ai/tools.py)
- Get colleges by rank, branch, or advanced filters
- Retrieve cutoff trends and branch listings
- Analyze branch popularity and competitiveness

**Smart Matching**: [`backend/app/services.py`](backend/app/services.py)
- Fuzzy search for college names handling abbreviations
- Intelligent branch name matching (CS, ECE, AIML, etc.)

**Analysis Tools**: [`backend/app/services.py`](backend/app/services.py)
- Statistical analysis of student prospects
- Side-by-side college comparisons

**Email Automation**: [`backend/app/ai/email_tools.py`](backend/app/ai/email_tools.py)
- Comprehensive reports with college matches and analysis
- Prediction summaries, comparisons, and counseling guidance
- Automated HTML email generation with session continuity

The AI autonomously decides which tools to use based on student queries, executes multiple tools in sequence for complex requests, and maintains conversation context across sessions.

## Technology Stack

### Backend

- **Framework**: FastAPI (Python 3.11+)
- **Database**: SQLite with KCET 2024 data
- **AI Model**: Google Gemini 2.5 Flash with function calling
- **Email**: SMTP (Gmail) with Jinja2 templating
- **WebSockets**: Native FastAPI WebSocket support
- **Validation**: Pydantic v2 for request/response schemas

### Frontend

- **Framework**: React 19.1 with TypeScript
- **Build Tool**: Vite
- **UI Library**: Material-UI (MUI) v5
- **HTTP Client**: Axios
- **State Management**: React Hooks

## Agentic AI System

The AI counselor is built on an agentic architecture where the language model autonomously decides which tools to use and when to use them.

### Agent Architecture

The AI agent ([`backend/app/ai/agent.py`](backend/app/ai/agent.py)) operates in a continuous loop:

1. **User Input**: Student asks a question in natural language
2. **Reasoning**: AI analyzes the query and determines required actions
3. **Tool Selection**: Selects appropriate functions from the tool registry
4. **Execution**: Calls tools with extracted parameters
5. **Result Processing**: Receives structured data from tools
6. **Response Generation**: Formulates natural language response with data
7. **Iteration**: May call multiple tools in sequence for complex queries

### Autonomous Behavior

The system prompt ([`backend/app/ai/prompts.py`](backend/app/ai/prompts.py)) enforces strict rules:

- **Zero Confirmation Policy**: AI proceeds automatically with high-confidence matches
- **Tool-First Execution**: Never promises actions without executing them
- **Context Retention**: Remembers rank and preferences across conversation
- **Smart Extraction**: Auto-derives student name from email, rank from history
- **Multi-Step Completion**: Executes all required tools without user intervention

### Session Management

Sessions are persisted as JSON files ([`backend/sessions/`](backend/sessions/)) containing full conversation history, extracted context, and metadata. This enables conversation resumption from email links, cross-device continuity, and comprehensive report generation.

### Real-Time Communication

WebSocket implementation ([`backend/app/routes/chat.py`](backend/app/routes/chat.py)) provides streaming responses with chunked delivery, thinking indicators showing AI reasoning steps, tool call notifications, and error handling with graceful fallbacks.

## API Documentation

### REST Endpoints

**Colleges** ([`backend/app/routes/colleges.py`](backend/app/routes/colleges.py))
- `GET /colleges/by-rank/{rank}` - Get colleges for a rank
- `GET /colleges/by-branch/{branch}` - Get colleges by branch
- `GET /colleges/search` - Advanced search with filters
- `GET /colleges/cutoff/{college_code}/{branch}` - Cutoff trends
- `GET /colleges/{college_code}/branches` - College branches
- `GET /colleges/all` - List all colleges

**Branches** ([`backend/app/routes/branches.py`](backend/app/routes/branches.py))
- `GET /branches/list` - Get all available branches

**Chat** ([`backend/app/routes/chat.py`](backend/app/routes/chat.py))
- `WS /chat/ws/{session_id}` - Real-time AI chat via WebSocket

**Email** ([`backend/app/routes/email_routes.py`](backend/app/routes/email_routes.py))
- `POST /api/email/send-prediction-summary` - Send prediction email
- `POST /api/email/send-welcome` - Send welcome email
- `POST /api/email/send-comparison` - Send comparison report
- `GET /api/email/status` - Check email service status

### WebSocket Message Types

```json
// Client to Server
{"type": "chat_message", "message": "user query"}
{"type": "get_history"}

// Server to Client
{"type": "welcome", "message": "...", "session_id": "..."}
{"type": "thinking", "step": "...", "timestamp": "..."}
{"type": "tool_call", "tool_name": "...", "parameters": {...}, "status": "..."}
{"type": "response_chunk", "content": "...", "is_final": false}
{"type": "response_complete", "message_id": "...", "full_content": "..."}
{"type": "error", "message": "..."}
```

## Database

The application uses SQLite ([`backend/data/kcet_2024.db`](backend/data/kcet_2024.db)) with KCET 2024 data.

### Schema

**kcet_2024 table:**
- `college_code`: Unique college identifier
- `college_name`: Full college name
- `branch_name`: Engineering branch name
- `GM_rank_r1`, `GM_rank_r2`, `GM_rank_r3`: General Merit cutoff for each round

**Data**: 1000+ colleges, 20+ engineering branches, 3 counseling rounds

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for:
- Development environment setup
- Code style guidelines
- Pull request process
- Testing guidelines
- Reporting issues and suggesting features

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

Built with FastAPI, React, and Google Gemini AI
