# Contributing to College Path Finder

Thank you for your interest in contributing to College Path Finder. This document covers how to set up the project locally and how to submit changes.

## Table of Contents

- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [How to Contribute](#how-to-contribute)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Documentation](#documentation)

## Getting Started

1. Read the [README](README.md) to understand what the project does
2. Check the [Issues](../../issues) page for open tasks
3. Look for issues labeled `good first issue` if you are new to the project

## Development Setup

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) and Docker Compose
- Node.js 20.19 or later, and npm
- Python 3.11, only if you run the backend without Docker
- A [Gemini API key](https://aistudio.google.com/apikey)
- A Google OAuth client ID, to use sign-in and the counselling assistant
- A Gmail App Password, only if you work on email features

### 1. Fork and clone

```bash
git clone https://github.com/<your-username>/college-pathfinder.git
cd college-pathfinder
make init   # installs pre-commit hooks for Ruff
```

### 2. Configure environment

```bash
cp .env.example .env
cp apps/frontend/.env.example apps/frontend/.env
```

Set at least `GEMINI_API_KEY` and `JWT_SECRET_KEY` in `.env`, and `VITE_API_BASE_URL` and `VITE_GOOGLE_CLIENT_ID` in `apps/frontend/.env`. Every variable is described in [Environment variables](docs/ENVIRONMENT.md).

### 3. Start the backend

```bash
make backend
```

This starts PostgreSQL and the backend in Docker and applies database migrations. The API runs at `http://localhost:8005`, with interactive docs at `http://localhost:8005/docs`.

### 4. Start the frontend

```bash
cd apps/frontend
npm install
npm run dev
```

The app runs at `http://localhost:5173`.

### Running the backend without Docker

```bash
make db                      # start PostgreSQL only
cd apps/backend
python -m venv .venv
source .venv/bin/activate    # Windows: .venv\Scripts\activate
pip install -r requirements.txt
alembic upgrade head
python main.py
```

See [Commands](docs/COMMANDS.md) for every available `make` target.

## How to Contribute

### Reporting Bugs

Before creating a bug report:

- Check the [Issues](../../issues) page to avoid duplicates
- Collect information about the bug (steps to reproduce, error messages, screenshots)

Create a bug report with:

- **Clear title**: Brief description of the issue
- **Description**: Detailed explanation of the problem
- **Steps to Reproduce**: Numbered list of steps
- **Expected Behavior**: What should happen
- **Actual Behavior**: What actually happens
- **Environment**: OS, browser, Python/Node version
- **Screenshots**: If applicable
- **Error Logs**: Console output or stack traces

### Suggesting Enhancements

Enhancement suggestions are tracked as GitHub issues. When creating an enhancement suggestion:

- **Use a clear title**: Describe the enhancement
- **Provide detailed description**: Explain the feature and its benefits
- **Include use cases**: How will this help users?
- **Consider alternatives**: What other solutions exist?
- **Mockups/Examples**: Visual aids if applicable

## Coding Standards

### Python (Backend)

Follow PEP 8 style guide:

```python
# Good
def get_colleges_by_rank(rank: int, round: int = 1) -> List[Dict]:
    """
    Get colleges accessible for a given rank.

    Args:
        rank: Student's KCET rank
        round: Counselling round number

    Returns:
        List of college dictionaries
    """
    return CollegeService.get_colleges_by_rank(rank, round)

# Bad
def getColleges(r,rd=1):
    return CollegeService.get_colleges_by_rank(r,rd)
```

**Key Points:**

- Use type hints for all function parameters and return values
- Write docstrings for all public functions (Google style)
- Use meaningful variable names
- Keep functions focused and small
- Code is linted and formatted with Ruff (`ruff check . && ruff format .`), which also runs as a pre-commit hook

**Project-Specific Guidelines:**

- Place route handlers in `app/routes/`
- Business logic goes in `app/services.py`
- Database queries use context manager pattern
- Pydantic models for all request/response validation
- Exception handling with custom exceptions from `app/exceptions.py`

### TypeScript/React (Frontend)

Follow React and TypeScript best practices:

```typescript
// Good
interface CollegeCardProps {
  college: College
  onClick?: (collegeCode: string) => void
}

const CollegeCard: React.FC<CollegeCardProps> = ({ college, onClick }) => {
  const handleClick = () => {
    if (onClick) {
      onClick(college.college_code)
    }
  }

  return (
    <Card onClick={handleClick}>
      <Typography variant='h6'>{college.college_name}</Typography>
    </Card>
  )
}

// Bad
function CollegeCard(props) {
  return (
    <div onClick={() => props.onClick(props.college.college_code)}>
      {props.college.college_name}
    </div>
  )
}
```

**Key Points:**

- Use TypeScript for all new code
- Define interfaces for props and data structures
- Use functional components with hooks
- Follow React naming conventions (PascalCase for components)
- Use meaningful variable names
- Extract reusable logic into custom hooks
- Maximum line length: 100 characters
- Use 2 spaces for indentation

**Project-Specific Guidelines:**

- Place components in `src/components/`
- Place pages in `src/pages/`
- API calls go through `src/services/api.ts`
- Use Material-UI components consistently
- Theme customization in `src/theme/`

### File Organization

```
apps/backend/
├── app/
│   ├── routes/          # API endpoints
│   ├── ai/             # AI agent and tools
│   ├── email/          # Email service and templates
│   ├── services.py     # Business logic
│   ├── database.py     # Database utilities
│   ├── schemas.py      # Pydantic models
│   └── config.py       # Configuration

apps/frontend/
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/          # Page components
│   ├── services/       # API client and utilities
│   ├── theme/          # Theme configuration
│   └── types/          # TypeScript types
```

## Commit Guidelines

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

**Types:**

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, missing semi-colons, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Build process or auxiliary tool changes

**Examples:**

```bash
feat(chat): add WebSocket reconnection logic

Implement automatic reconnection when WebSocket connection is lost.
Includes exponential backoff and connection state indicator.

Closes #123

---

fix(api): handle null cutoff ranks in college search

Some colleges have null cutoff ranks for certain rounds.
Update query to filter out null values.

Fixes #456

---

docs(readme): update installation instructions

Add clarification for Windows users regarding virtual environment activation.
```

## Pull Request Process

1. **Create a branch** from `main`:

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes**:

   - Follow the coding standards
   - Write/update tests
   - Update documentation

3. **Test your changes**:

   - Run `ruff check .` in `apps/backend`
   - Run `npm run lint` and `npm run build` in `apps/frontend`
   - Test the affected features locally

4. **Commit your changes**:

   ```bash
   git add .
   git commit -m "feat: add your feature"
   ```

5. **Push to your fork**:

   ```bash
   git push origin feature/your-feature-name
   ```

6. **Create a Pull Request**:
   - Use a clear title describing the change
   - Fill out the PR template completely
   - Link related issues
   - Add screenshots for UI changes
   - Request review from maintainers

## Documentation

### Code Documentation

- Add docstrings to all public functions
- Use type hints in Python
- Add JSDoc comments for complex TypeScript functions
- Keep comments up to date with code changes

### README Updates

Update README.md when:

- Adding new features
- Changing installation steps
- Modifying configuration options
- Adding new dependencies

### API Documentation

- Document all new endpoints
- Include request/response examples
- Specify required parameters
- List possible error codes

## Project-Specific Guidelines

### AI Agent Development

When working on the AI agent:

- Test with various user queries
- Ensure tool calls execute correctly
- Validate response formatting (especially markdown tables)
- Check conversation context retention
- Test error handling for tool failures

### Email Template Development

When creating/modifying email templates:

- Test in multiple email clients (Gmail, Outlook, etc.)
- Use inline CSS for compatibility
- Ensure responsive design
- Test with various data inputs
- Verify all links work correctly

Thank you for contributing to College Path Finder!
