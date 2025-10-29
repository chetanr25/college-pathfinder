#!/bin/bash

# Azure Deployment Script for CollegePathfinder Backend
# This script helps you deploy your FastAPI backend to Azure Web App

echo "🚀 Azure Web App Deployment Script"
echo "===================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
RESOURCE_GROUP="CollegePathfinder_group"
APP_NAME="CollegePathfinder"
LOCATION="southindia"

# Check if Azure CLI is installed
if ! command -v az &> /dev/null; then
    echo -e "${RED}❌ Azure CLI is not installed${NC}"
    echo "Install it with: brew install azure-cli"
    exit 1
fi

echo -e "${GREEN}✅ Azure CLI is installed${NC}"
echo ""

# Login check
echo "Checking Azure login status..."
az account show &> /dev/null
if [ $? -ne 0 ]; then
    echo -e "${YELLOW}🔐 Please login to Azure${NC}"
    az login
else
    echo -e "${GREEN}✅ Already logged in to Azure${NC}"
fi

echo ""
echo "Current subscription:"
az account show --query "{Name:name, SubscriptionId:id}" -o table
echo ""

# Get Git deployment URL
echo "📡 Getting deployment URL..."
GIT_URL=$(az webapp deployment source config-local-git \
    --name "$APP_NAME" \
    --resource-group "$RESOURCE_GROUP" \
    --query url -o tsv)

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Git deployment URL retrieved${NC}"
    echo "URL: $GIT_URL"
else
    echo -e "${RED}❌ Failed to get deployment URL${NC}"
    echo "Please check your resource group and app name"
    exit 1
fi

echo ""

# Check if git is initialized
if [ ! -d .git ]; then
    echo "🔧 Initializing git repository..."
    git init
    echo -e "${GREEN}✅ Git initialized${NC}"
else
    echo -e "${GREEN}✅ Git repository already initialized${NC}"
fi

echo ""

# Check if azure remote exists
echo "Git repo $(GIT_URL)"
if git remote | grep -q "^azure$"; then
    echo "🔧 Updating azure remote..."
    git remote set-url azure "$GIT_URL"
else
    echo "🔧 Adding azure remote..."
    git remote add azure "$GIT_URL"
fi

echo -e "${GREEN}✅ Azure remote configured${NC}"
echo ""

# Show what files will be deployed
echo "📦 Files to be deployed:"
git add .
git status --short
echo ""

# Commit changes
read -p "Enter commit message (or press Enter for default): " COMMIT_MSG
if [ -z "$COMMIT_MSG" ]; then
    COMMIT_MSG="Deploy to Azure - $(date '+%Y-%m-%d %H:%M:%S')"
fi

git commit -m "$COMMIT_MSG"
echo ""

# Deploy
echo "🚀 Deploying to Azure..."
echo -e "${YELLOW}This may take 5-10 minutes. You may be prompted for credentials.${NC}"
echo ""

git push azure HEAD:main

if [ $? -eq 0 ]; then
    echo ""
    echo -e "${GREEN}✅ Deployment successful!${NC}"
    echo ""
    echo "🌐 Your API is available at:"
    echo "https://collegepathfinder-bhbrdhdcthnhxb3.southindia-01.azurewebsites.net"
    echo ""
    echo "📚 API Documentation:"
    echo "https://collegepathfinder-bhbrdhdcthnhxb3.southindia-01.azurewebsites.net/docs"
    echo ""
    echo "📊 View logs with:"
    echo "az webapp log tail --name $APP_NAME --resource-group $RESOURCE_GROUP"
else
    echo ""
    echo -e "${RED}❌ Deployment failed${NC}"
    echo "Check the error messages above and try again"
    exit 1
fi

echo ""
echo "🎉 Deployment complete!"
