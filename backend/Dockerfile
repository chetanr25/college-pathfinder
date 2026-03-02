# Use the official AWS Lambda Python base image
FROM public.ecr.aws/lambda/python:3.11

# Copy requirements file
COPY requirements.txt .

# Install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the application code
COPY . .

# Set the handler
CMD ["handler.handler"]
