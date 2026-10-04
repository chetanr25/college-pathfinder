# Environment Variables

The project uses two environment files. Copy the examples to get started:

```bash
cp .env.example .env
cp apps/frontend/.env.example apps/frontend/.env
```

## Backend

Defined in `.env` at the repository root. Used by the backend and by Docker Compose.

### Required

| Variable | Description |
| --- | --- |
| `GEMINI_API_KEY` | Google Gemini API key for the counselling assistant. Get one from [Google AI Studio](https://aistudio.google.com/apikey) |
| `POSTGRES_URL` | PostgreSQL connection URL in async SQLAlchemy format, for example `postgresql+asyncpg://postgres:postgres@localhost:5432/collegefinder`. Set automatically when running with Docker Compose |
| `JWT_SECRET_KEY` | Secret used to sign access tokens. Use a random string of at least 32 characters |

### Optional

| Variable | Default | Description |
| --- | --- | --- |
| `DATABASE_URL` | `apps/backend/data/kcet_2025.db` | Path to the SQLite cutoff database |
| `JWT_ALGORITHM` | `HS256` | Algorithm used to sign access tokens |
| `JWT_EXPIRATION_HOURS` | `24` | Access token lifetime in hours |
| `CORS_ENABLED` | `true` | Enable the CORS middleware |
| `CORS_ORIGINS` | `*` | Comma-separated list of allowed origins |
| `FRONTEND_BASE_URL` | `http://localhost:5173` | Frontend URL used in share links and emails |
| `DEFAULT_ROUND` | `1` | Counselling round used when none is given |
| `MIN_ROUND` | `1` | Lowest accepted round |
| `MAX_ROUND` | `3` | Highest accepted round |
| `DEBUG` | | When set, chat error responses include error details |
| `DB_PASSWORD` | `postgres` | PostgreSQL password used by Docker Compose |

### Email

Needed only for email reports. With Gmail, use an [App Password](https://support.google.com/accounts/answer/185833) instead of your account password.

| Variable | Default | Description |
| --- | --- | --- |
| `EMAIL_ENABLED` | `false` | Set to `true` to enable sending email |
| `SMTP_HOST` | `smtp.gmail.com` | SMTP server |
| `SMTP_PORT` | `587` | SMTP port |
| `SMTP_USERNAME` | | SMTP login |
| `SMTP_PASSWORD` | | SMTP password or App Password |
| `SMTP_FROM_EMAIL` | | Sender address |
| `SMTP_FROM_NAME` | `KCET College Predictor` | Sender display name |

### Deployment

Used by `make deploy-ecr`.

| Variable | Description |
| --- | --- |
| `AWS_REGION` | AWS region of the ECR repository |
| `ECR_REPO` | Full ECR repository URI |
| `IMAGE_TAG` | Tag for the pushed image |

## Frontend

Defined in `apps/frontend/.env`. Vite only exposes variables prefixed with `VITE_`.

| Variable | Required | Description |
| --- | --- | --- |
| `VITE_API_BASE_URL` | Yes | Backend URL, for example `http://localhost:8005` |
| `VITE_GOOGLE_CLIENT_ID` | For sign-in | Google OAuth client ID. Sign-in is required for the counselling assistant |
