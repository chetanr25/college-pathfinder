# KCET College Predictor

<<<<<<< HEAD
An intelligent, full-stack web application that helps students navigate Karnataka Common Entrance Test (KCET) college admissions through AI-powered counseling, real-time data analysis, and personalized recommendations.
=======
<div align="center">

![GitHub language count](https://img.shields.io/github/languages/count/chetanr25/college-pathfinder)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.109.0+-009688?style=flat&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Python](https://img.shields.io/badge/Python-3.11+-3776AB?style=flat&logo=python&logoColor=white)](https://www.python.org/)

**An intelligent, application that helps students navigate Karnataka Common Entrance Test (KCET) college admissions through AI-powered counseling, real-time data analysis, and personalized recommendations.**

</div>

---
>>>>>>> 879bd297f7e3a9a9781f7d1934aaefc38e713f07

## Table of Contents

- [What This Solves](#what-this-solves)
- [Features](#features)
<<<<<<< HEAD
- [Technology Stack](#technology-stack)
- [Agentic AI System](#agentic-ai-system)
- [API Documentation](#api-documentation)
- [Database](#database)
=======
- [System Architecture](#system-architecture)
- [Technology Stack](#technology-stack)
- [Agentic AI System](#agentic-ai-system)
>>>>>>> 879bd297f7e3a9a9781f7d1934aaefc38e713f07
- [Contributing](#contributing)
- [License](#license)

## What This Solves

<<<<<<< HEAD
Every year, thousands of students struggle with KCET counseling due to complex cutoff trends, difficulty finding suitable colleges based on rank, lack of personalized guidance, and overwhelming data from 1000+ colleges across multiple engineering branches.

This platform provides real-time college predictions, AI-powered conversational counseling, automated analysis reports, advanced filtering and comparison tools, and historical cutoff trend analysis.
=======
Every year, thousands of students struggle with KCET counseling due to:
- Complex cutoff trends across multiple rounds
- Difficulty finding suitable colleges based on rank
- Lack of personalized guidance
- Overwhelming data from 1000+ colleges across 20+ engineering branches

**Solution:**
- Real-time college predictions based on KCET rank
- AI-powered conversational counseling
- Automated analysis reports via email
- Advanced filtering and comparison tools
- Historical cutoff trend analysis
>>>>>>> 879bd297f7e3a9a9781f7d1934aaefc38e713f07

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

<<<<<<< HEAD
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
=======
- **Data Retrieval**: Get colleges by rank, branch, or advanced filters; retrieve cutoff trends and branch listings; analyze branch popularity
- **Smart Matching**: Fuzzy search for college names handling abbreviations; intelligent branch name matching (CS, ECE, AIML, etc.)
- **Analysis Tools**: Statistical analysis of student prospects; side-by-side college comparisons
- **Email Automation**: Comprehensive reports with college matches and analysis; prediction summaries, comparisons, and counseling guidance

**Key Capabilities:**
- Autonomous tool selection based on student queries
- Multi-tool execution for complex requests
- Conversation context retention across sessions
- Zero-confirmation policy for high-confidence matches

## System Architecture

```mermaid
graph TB
    subgraph "Client Layer"
        Browser[Web Browser]
        Mobile[Mobile Browser]
    end

    subgraph "Frontend - React Application"
        React[React 19.1 + TypeScript]
        Vite[Vite Build Tool]
        MUI[Material-UI Components]
        Router[React Router]
        AuthContext[Auth Context]
    end

    subgraph "Backend - FastAPI Server"
        FastAPI[FastAPI Application]
        REST[REST API Endpoints]
        WS[WebSocket Handler]
        Middleware[CORS & Auth Middleware]
    end

    subgraph "AI Agent System"
        Agent[AI Agent Core]
        Gemini[Google Gemini 2.5 Flash]
        Tools[Tool Registry - 18 Tools]
        Prompts[System Prompts]
        SessionMgr[Session Manager]
    end

    subgraph "Data Layer"
        SQLite[(SQLite Database<br/>KCET 2024 Data)]
        SessionStore[Session Storage<br/>JSON Files]
    end

    subgraph "External Services"
        Supabase[Supabase Auth]
        SMTP[SMTP Email Service]
        Gmail[Gmail SMTP]
    end

    subgraph "Email System"
        EmailService[Email Service]
        Templates[Jinja2 Templates]
        Reports[Report Generator]
    end

    Browser --> React
    Mobile --> React
    React --> Vite
    React --> MUI
    React --> Router
    React --> AuthContext
    
    React -->|REST API| REST
    React -->|WebSocket| WS
    AuthContext -->|OAuth| Supabase
    
    REST --> FastAPI
    WS --> FastAPI
    FastAPI --> Middleware
    
    FastAPI --> Agent
    Agent --> Gemini
    Agent --> Tools
    Agent --> Prompts
    Agent --> SessionMgr
    
    Tools --> SQLite
    SessionMgr --> SessionStore
    
    Agent --> EmailService
    EmailService --> Templates
    EmailService --> Reports
    EmailService --> SMTP
    SMTP --> Gmail
    
    style React fill:#61DAFB
    style FastAPI fill:#009688
    style Gemini fill:#4285F4
    style SQLite fill:#003B57
    style Supabase fill:#3ECF8E
```

## Technology Stack

### Backend

- **FastAPI** 0.109.0+ - Web framework
- **Python** 3.11+ - Programming language
- **SQLite** - Database with KCET 2024 data
- **Google Gemini** 2.5 Flash - AI model with function calling
- **Pydantic** v2 - Data validation
- **Jinja2** 3.1.0+ - Email template engine
- **WebSockets** - Real-time communication
- **Supabase** 2.24.0 - Authentication

### Frontend

- **React** 19.1 - UI library
- **TypeScript** 5.9 - Type-safe JavaScript
- **Vite** 7.1+ - Build tool
- **Material-UI** v5 - Component library
- **Axios** 1.12+ - HTTP client
- **React Router** 7.9+ - Routing
- **React Markdown** 10.1+ - Markdown rendering

## Agentic AI System

The AI counselor is built on an agentic architecture where the language model autonomously decides which tools to use and when to use them.

### Agent Architecture

The AI agent operates in a continuous loop:
1. User Input - Student asks a question in natural language
2. Reasoning - AI analyzes the query and determines required actions
3. Tool Selection - Selects appropriate functions from the tool registry
4. Execution - Calls tools with extracted parameters
5. Result Processing - Receives structured data from tools
6. Response Generation - Formulates natural language response with data
7. Iteration - May call multiple tools in sequence for complex queries

### Autonomous Behavior

The system prompt enforces strict rules:
- Zero Confirmation Policy - AI proceeds automatically with high-confidence matches
- Tool-First Execution - Never promises actions without executing them
- Context Retention - Remembers rank and preferences across conversation
- Smart Extraction - Auto-derives student name from email, rank from history
- Multi-Step Completion - Executes all required tools without user intervention

### Real-Time Communication

WebSocket implementation provides:
- Streaming responses with chunked delivery
- Thinking indicators showing AI reasoning steps
- Tool call notifications for transparent execution
- Error handling with graceful fallbacks

## Documentation

- [API Documentation](API_DOCUMENTATION.md) - Complete API reference
- [Database Schema](SCHEMA.md) - Database structure and schema
- [Contributing Guide](CONTRIBUTING.md) - Development setup and guidelines
>>>>>>> 879bd297f7e3a9a9781f7d1934aaefc38e713f07

## Contributing

We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for:
- Development environment setup
- Code style guidelines
- Pull request process
- Testing guidelines
<<<<<<< HEAD
- Reporting issues and suggesting features
=======
>>>>>>> 879bd297f7e3a9a9781f7d1934aaefc38e713f07

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<<<<<<< HEAD
Built with FastAPI, React, and Google Gemini AI
=======
<div align="center">

**Built with FastAPI, React, and Google Gemini AI**

</div>
>>>>>>> 879bd297f7e3a9a9781f7d1934aaefc38e713f07
