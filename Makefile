-include .env
export

COMPOSE = docker compose -f infra/docker-compose.yml

.PHONY: backend frontend up down db migrate logs clean deploy-ecr

# Start backend + postgres (docker)
up:
	$(COMPOSE) up --build

# Start only backend + postgres
backend:
	$(COMPOSE) up --build postgres backend

# Start frontend locally with npm
frontend:
	cd app/frontend && npm run dev

# Start postgres only
db:
	$(COMPOSE) up -d postgres

# Run alembic migrations (requires postgres running)
migrate:
	cd apps/backend && alembic upgrade head

# View logs
logs:
	$(COMPOSE) logs -f

# Stop all services
down:
	$(COMPOSE) down

# Stop all services and remove volumes (fresh start)
clean:
	$(COMPOSE) down -v

# Deploy backend image to AWS ECR (requires .env with AWS_REGION, ECR_REPO, IMAGE_TAG)
deploy-ecr:
	aws ecr get-login-password --region $(AWS_REGION) | docker login --username AWS --password-stdin $(ECR_REPO)
	docker build -f apps/backend/Dockerfile -t $(ECR_REPO):$(IMAGE_TAG) apps/backend
	docker push $(ECR_REPO):$(IMAGE_TAG)
