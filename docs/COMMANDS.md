# Commands

All `make` commands run from the repository root. Docker services are defined in `infra/docker-compose.yml`, and variables from the root `.env` file are loaded automatically.

## Setup

| Command | Description |
| --- | --- |
| `make init` | Install `pre-commit` and register the Git hooks (Ruff lint and format run on every commit) |

## Running locally

| Command | Description |
| --- | --- |
| `make up` | Build and start PostgreSQL and the backend in the foreground |
| `make backend` | Build and start PostgreSQL and the backend in the background |
| `make frontend` | Start the frontend dev server at `http://localhost:5173` |
| `make db` | Start PostgreSQL only, in the background |
| `make logs` | Follow logs from all running containers |

The backend runs at `http://localhost:8005`, with interactive API docs at `http://localhost:8005/docs`.

## Database

| Command | Description |
| --- | --- |
| `make migrate` | Apply Alembic migrations (PostgreSQL must be running) |

Migrations also run automatically when the backend starts.

## Stopping and cleanup

| Command | Description |
| --- | --- |
| `make down` | Stop all services |
| `make clean` | Stop all services and delete volumes, including the PostgreSQL data |

## Deployment

| Command | Description |
| --- | --- |
| `make deploy-ecr` | Build the backend image for `linux/arm64` and push it to Amazon ECR. Requires `AWS_REGION`, `ECR_REPO` and `IMAGE_TAG` in `.env` |

## Without Make

```bash
# Backend (from apps/backend)
python main.py                                      # start the API with reload
alembic upgrade head                                # apply migrations
alembic revision --autogenerate -m "description"    # create a migration
ruff check . && ruff format .                       # lint and format

# Frontend (from apps/frontend)
npm run dev       # dev server
npm run build     # production build
npm run lint      # ESLint
npm run preview   # preview the production build
```
