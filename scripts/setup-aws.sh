#!/bin/bash
set -e

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}=== Chat App AWS Setup ===${NC}"

# Variables
ENVIRONMENT_NAME=${ENVIRONMENT_NAME:-chat-app-production}
AWS_REGION=${AWS_REGION:-us-east-1}
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)

echo "Environment: $ENVIRONMENT_NAME"
echo "Region: $AWS_REGION"
echo "Account ID: $AWS_ACCOUNT_ID"

# Función para crear stack
create_stack() {
    local stack_name=$1
    local template_file=$2
    local parameters=$3

    echo -e "${YELLOW}Creating stack: $stack_name${NC}"
    
    if aws cloudformation describe-stacks --stack-name $stack_name --region $AWS_REGION 2>/dev/null; then
        echo -e "${YELLOW}Stack $stack_name already exists. Updating...${NC}"
        aws cloudformation update-stack \
            --stack-name $stack_name \
            --template-body file://$template_file \
            --parameters $parameters \
            --capabilities CAPABILITY_IAM CAPABILITY_NAMED_IAM \
            --region $AWS_REGION || echo "No updates to be performed"
    else
        aws cloudformation create-stack \
            --stack-name $stack_name \
            --template-body file://$template_file \
            --parameters $parameters \
            --capabilities CAPABILITY_IAM CAPABILITY_NAMED_IAM \
            --region $AWS_REGION
    fi

    echo -e "${YELLOW}Waiting for stack $stack_name to complete...${NC}"
    aws cloudformation wait stack-create-complete \
        --stack-name $stack_name \
        --region $AWS_REGION 2>/dev/null || \
    aws cloudformation wait stack-update-complete \
        --stack-name $stack_name \
        --region $AWS_REGION 2>/dev/null || true

    echo -e "${GREEN}Stack $stack_name completed!${NC}"
}

# 1. Crear VPC
echo -e "${GREEN}Step 1: Creating VPC and Networking${NC}"
create_stack \
    "$ENVIRONMENT_NAME-vpc" \
    "cloudformation/01-vpc.yaml" \
    "ParameterKey=EnvironmentName,ParameterValue=$ENVIRONMENT_NAME"

# 2. Crear Security Groups
echo -e "${GREEN}Step 2: Creating Security Groups${NC}"
create_stack \
    "$ENVIRONMENT_NAME-security-groups" \
    "cloudformation/04-security-groups.yaml" \
    "ParameterKey=EnvironmentName,ParameterValue=$ENVIRONMENT_NAME"

# 3. Crear EKS Cluster
echo -e "${GREEN}Step 3: Creating EKS Cluster${NC}"
read -p "Enter node instance type (default: t3.medium): " NODE_TYPE
NODE_TYPE=${NODE_TYPE:-t3.medium}

create_stack \
    "$ENVIRONMENT_NAME-eks" \
    "cloudformation/02-eks.yaml" \
    "ParameterKey=EnvironmentName,ParameterValue=$ENVIRONMENT_NAME ParameterKey=NodeInstanceType,ParameterValue=$NODE_TYPE"

# 4. Configurar kubectl
echo -e "${GREEN}Step 4: Configuring kubectl${NC}"
aws eks update-kubeconfig \
    --name $ENVIRONMENT_NAME \
    --region $AWS_REGION

# Verificar conexión
kubectl get nodes

# 5. Crear RDS (opcional)
read -p "Do you want to create RDS PostgreSQL? (y/n): " CREATE_RDS
if [[ $CREATE_RDS == "y" ]]; then
    echo -e "${GREEN}Step 5: Creating RDS PostgreSQL${NC}"
    read -s -p "Enter DB password: " DB_PASSWORD
    echo
    
    create_stack \
        "$ENVIRONMENT_NAME-rds" \
        "cloudformation/03-rds.yaml" \
        "ParameterKey=EnvironmentName,ParameterValue=$ENVIRONMENT_NAME ParameterKey=DBPassword,ParameterValue=$DB_PASSWORD"
fi

# 6. Crear ECR Repositories
echo -e "${GREEN}Step 6: Creating ECR Repositories${NC}"
aws ecr create-repository \
    --repository-name chat-backend \
    --region $AWS_REGION 2>/dev/null || echo "Backend repository already exists"

aws ecr create-repository \
    --repository-name chat-frontend \
    --region $AWS_REGION 2>/dev/null || echo "Frontend repository already exists"

# 7. Instalar AWS Load Balancer Controller
echo -e "${GREEN}Step 7: Installing AWS Load Balancer Controller${NC}"

# Crear IAM policy
curl -o iam-policy.json https://raw.githubusercontent.com/kubernetes-sigs/aws-load-balancer-controller/v2.6.0/docs/install/iam_policy.json

aws iam create-policy \
    --policy-name AWSLoadBalancerControllerIAMPolicy \
    --policy-document file://iam-policy.json 2>/dev/null || echo "Policy already exists"

# Crear service account
eksctl create iamserviceaccount \
    --cluster=$ENVIRONMENT_NAME \
    --namespace=kube-system \
    --name=aws-load-balancer-controller \
    --attach-policy-arn=arn:aws:iam::$AWS_ACCOUNT_ID:policy/AWSLoadBalancerControllerIAMPolicy \
    --override-existing-serviceaccounts \
    --region $AWS_REGION \
    --approve

# Instalar con Helm
helm repo add eks https://aws.github.io/eks-charts
helm repo update

helm install aws-load-balancer-controller eks/aws-load-balancer-controller \
    -n kube-system \
    --set clusterName=$ENVIRONMENT_NAME \
    --set serviceAccount.create=false \
    --set serviceAccount.name=aws-load-balancer-controller \
    --set region=$AWS_REGION \
    --set vpcId=$(aws cloudformation describe-stacks \
        --stack-name $ENVIRONMENT_NAME-vpc \
        --query 'Stacks[0].Outputs[?OutputKey==`VPC`].OutputValue' \
        --output text \
        --region $AWS_REGION)

echo -e "${GREEN}=== Setup Complete! ===${NC}"
echo ""
echo "Next steps:"
echo "1. Run ./scripts/build-and-push.sh to build and push Docker images"
echo "2. Update kubernetes/configmap.yaml with your domain and RDS endpoint"
echo "3. Update kubernetes/secrets.yaml with your secrets"
echo "4. Run ./scripts/deploy-k8s.sh to deploy the application"