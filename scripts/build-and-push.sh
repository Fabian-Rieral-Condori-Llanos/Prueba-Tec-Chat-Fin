#!/bin/bash
set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}=== Building and Pushing Docker Images ===${NC}"

# Variables
AWS_REGION=${AWS_REGION:-us-east-1}
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
ECR_REGISTRY="$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com"

echo "AWS Region: $AWS_REGION"
echo "AWS Account: $AWS_ACCOUNT_ID"
echo "ECR Registry: $ECR_REGISTRY"

# Login a ECR
echo -e "${YELLOW}Logging into ECR...${NC}"
aws ecr get-login-password --region $AWS_REGION | \
    docker login --username AWS --password-stdin $ECR_REGISTRY

# Build Backend
echo -e "${GREEN}Building Backend Image...${NC}"
cd messaging-app
docker build -t chat-backend:latest .
docker tag chat-backend:latest $ECR_REGISTRY/chat-backend:latest
docker tag chat-backend:latest $ECR_REGISTRY/chat-backend:$(git rev-parse --short HEAD)

echo -e "${YELLOW}Pushing Backend Image...${NC}"
docker push $ECR_REGISTRY/chat-backend:latest
docker push $ECR_REGISTRY/chat-backend:$(git rev-parse --short HEAD)

cd ..

# Build Frontend
echo -e "${GREEN}Building Frontend Image...${NC}"
cd chat-frontend
docker build -t chat-frontend:latest .
docker tag chat-frontend:latest $ECR_REGISTRY/chat-frontend:latest
docker tag chat-frontend:latest $ECR_REGISTRY/chat-frontend:$(git rev-parse --short HEAD)

echo -e "${YELLOW}Pushing Frontend Image...${NC}"
docker push $ECR_REGISTRY/chat-frontend:latest
docker push $ECR_REGISTRY/chat-frontend:$(git rev-parse --short HEAD)

cd ..

echo -e "${GREEN}=== Build and Push Complete! ===${NC}"
echo ""
echo "Images pushed:"
echo "- $ECR_REGISTRY/chat-backend:latest"
echo "- $ECR_REGISTRY/chat-frontend:latest"