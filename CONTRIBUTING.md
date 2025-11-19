# Contributing to KCET College Predictor

Thank you for your interest in contributing to the KCET College Predictor! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Setup](#development-setup)
- [How to Contribute](#how-to-contribute)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Testing](#testing)
- [Documentation](#documentation)
- [Reporting Bugs](#reporting-bugs)
- [Suggesting Enhancements](#suggesting-enhancements)

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment. We expect all contributors to:

- Use welcoming and inclusive language
- Be respectful of differing viewpoints and experiences
- Gracefully accept constructive criticism
- Focus on what is best for the community
- Show empathy towards other community members

## Getting Started

Before you begin:

1. Ensure you have Python 3.11+ and Node.js 18+ installed
2. Familiarize yourself with the project by reading the [README.md](README.md)
3. Check the [Issues](../../issues) page for open tasks
4. Look for issues labeled `good first issue` if you're new to the project

## Development Setup

### Prerequisites

Before you begin, ensure you have:
- Python 3.11 or higher
- Node.js 18+ and npm
- Gmail account with App Password (for email features)
- Google Gemini API key

### Backend Setup

1. Fork and clone the repository:
```bash
git clone https://github.com/your-username/major_project.git
cd major_project/backend
```

2. Create and activate a virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Create a `.env` file in the backend directory:
```bash
# API Configuration
APP_NAME="KCET College Predictor API"
APP_VERSION="1.0.0"

# Gemini AI
GEMINI_API_KEY=your_gemini_api_key_here

# Email Configuration (optional)
EMAIL_ENABLED=true
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USERNAME=your_email@gmail.com
SMTP_PASSWORD=your_app_password
SMTP_FROM_EMAIL=your_email@gmail.com
SMTP_FROM_NAME="KCET College Predictor"

# Database
DATABASE_URL=data/kcet_2024.db
```

5. Run the development server:
```bash
python main.py
```

The API will be available at `http://localhost:8005`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the frontend directory:
```bash
VITE_API_BASE_URL=http://localhost:8005
```

4. Run the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

### Environment Configuration

#### Backend Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `GEMINI_API_KEY` | Google Gemini API key | Yes | - |
| `EMAIL_ENABLED` | Enable/disable email features | No | `false` |
| `SMTP_USERNAME` | Gmail address for sending emails | No | - |
| `SMTP_PASSWORD` | Gmail app password | No | - |
| `DATABASE_URL` | Path to SQLite database | No | `data/kcet_2024.db` |

#### Frontend Environment Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `VITE_API_BASE_URL` | Backend API URL | No | `http://localhost:8005` |

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
- Maximum line length: 100 characters
- Use 4 spaces for indentation

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
  college: College;
  onClick?: (collegeCode: string) => void;
}

const CollegeCard: React.FC<CollegeCardProps> = ({ college, onClick }) => {
  const handleClick = () => {
    if (onClick) {
      onClick(college.college_code);
    }
  };

  return (
    <Card onClick={handleClick}>
      <Typography variant="h6">{college.college_name}</Typography>
    </Card>
  );
};

// Bad
function CollegeCard(props) {
  return <div onClick={() => props.onClick(props.college.college_code)}>{props.college.college_name}</div>
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
backend/
├── app/
│   ├── routes/          # API endpoints
│   ├── ai/             # AI agent and tools
│   ├── email/          # Email service and templates
│   ├── services.py     # Business logic
│   ├── database.py     # Database utilities
│   ├── schemas.py      # Pydantic models
│   └── config.py       # Configuration

frontend/
├── src/
│   ├── components/     # Reusable UI components
│   ├── pages/          # Page components
│   ├── services/       # API client and utilities
│   ├── theme/          # Theme configuration
│   └── types/          # TypeScript types
```

## Commit Guidelines

Follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <subject>

<body>

<footer>
```

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
   - Run backend tests
   - Test frontend functionality
   - Check for linting errors

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

### Pull Request Checklist

- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex logic
- [ ] Documentation updated
- [ ] No new warnings or errors
- [ ] Tests added/updated
- [ ] All tests pass
- [ ] Branch is up to date with main

### Review Process

- Maintainers will review your PR within 3-5 business days
- Address any requested changes
- Once approved, a maintainer will merge your PR
- Your contribution will be credited in the release notes

## Testing

### Backend Tests

```bash
cd backend
pytest
```

Test files should:
- Be named `test_*.py`
- Use pytest fixtures for setup
- Test both success and error cases
- Mock external dependencies (API calls, database)

Example:
```python
def test_get_colleges_by_rank():
    """Test college retrieval by rank"""
    result = CollegeService.get_colleges_by_rank(rank=5000, round=1, limit=10)
    assert len(result) <= 10
    assert all(college['cutoff_rank'] >= 5000 for college in result)
```

### Frontend Tests

```bash
cd frontend
npm test
```

Test files should:
- Be named `*.test.tsx` or `*.spec.tsx`
- Use React Testing Library
- Test component behavior, not implementation
- Include accessibility checks

Example:
```typescript
describe('CollegeCard', () => {
  it('renders college name', () => {
    const college = { college_code: 'E001', college_name: 'Test College' };
    render(<CollegeCard college={college} />);
    expect(screen.getByText('Test College')).toBeInTheDocument();
  });
});
```

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

### Database Queries

When writing database queries:
- Use parameterized queries (prevent SQL injection)
- Test with edge cases (null values, empty results)
- Consider performance for large datasets
- Use transactions for multiple operations

## Getting Help

If you need help:
- Check existing [Issues](../../issues) and [Pull Requests](../../pulls)
- Review the [README.md](README.md) and documentation
- Ask questions by creating a new issue with the `question` label
- Join our community discussions (if available)

## Recognition

Contributors will be recognized in:
- The project's contributor list
- Release notes for their contributions
- The README.md (for significant contributions)

Thank you for contributing to KCET College Predictor!
