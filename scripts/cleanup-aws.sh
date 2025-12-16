#!/bin/bash
set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${RED}=== CLEANUP WARNING ===${NC}"
echo -e "${YELLOW}This script will DELETE all resources created by the setup script${NC}"
read -p "Are you sure you want to continue? (type 'yes' to confirm): " CONFIRM

if [[ $CONFIRM != "yes" ]]; then
    echo "Cleanup cancelled"
    exit 0
fi

# Variables
ENVIRONMENT_NAME=${ENVIRONMENT_NAME:-chat-app-production}
AWS_REGION=${AWS_REGION:-us-east-1}

echo -e "${RED}Starting cleanup...${NC}"

# 1. Delete Kubernetes resources
echo -e "${YELLOW}Step 1: Deleting Kubernetes resources${NC}"
kubectl delete namespace chat-app --ignore-not-found=true

# 2. Delete CloudFormation stacks
echo -e "${YELLOW}Step 2: Deleting CloudFormation stacks${NC}"

delete_stack() {
    local stack_name=$1
    echo "Deleting $stack_name..."
    aws cloudformation delete-stack --stack-name $stack_name --region $AWS_REGION 2>/dev/null || true
}

delete_stack "$ENVIRONMENT_NAME-rds"
delete_stack "$ENVIRONMENT_NAME-eks"
delete_stack "$ENVIRONMENT_NAME-security-groups"
delete_stack "$ENVIRONMENT_NAME-vpc"

# 3. Delete ECR repositories
echo -e "${YELLOW}Step 3: Deleting ECR repositories${NC}"
aws ecr delete-repository --repository-name chat-backend --force --region $AWS_REGION 2>/dev/null || true
aws ecr delete-repository --repository-name chat-frontend --force --region $AWS_REGION 2>/dev/null || true

echo -e "${GREEN}Cleanup initiated. Stacks will be deleted in the background.${NC}"
echo "You can monitor progress in the AWS Console CloudFormation section"