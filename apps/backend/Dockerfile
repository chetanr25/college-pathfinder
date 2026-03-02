FROM --platform=linux/arm64 python:3.11-slim

WORKDIR /app

# Copy requirements file
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the application code
COPY . .

EXPOSE 8005

# Run with uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8005"]

# ─── DISABLED: AWS Lambda (migrated to EC2) ─────────────────────────────────────
# FROM public.ecr.aws/lambda/python:3.11
# COPY requirements.txt .
# RUN pip install --no-cache-dir -r requirements.txt
# COPY . .
# CMD ["handler.handler"]
