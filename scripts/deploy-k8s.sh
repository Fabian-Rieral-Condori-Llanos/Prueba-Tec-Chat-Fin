#!/bin/bash
set -e

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}=== Deploying to Kubernetes ===${NC}"

# Variables
ENVIRONMENT_NAME=${ENVIRONMENT_NAME:-chat-app-production}
AWS_REGION=${AWS_REGION:-us-east-1}
AWS_ACCOUNT_ID=$(aws sts get-caller-identity --query Account --output text)
ECR_REGISTRY="$AWS_ACCOUNT_ID.dkr.ecr.$AWS_REGION.amazonaws.com"

# Verificar que kubectl esté configurado
if ! kubectl cluster-info &> /dev/null; then
    echo -e "${RED}Error: kubectl no está configurado correctamente${NC}"
    echo "Ejecuta: aws eks update-kubeconfig --name $ENVIRONMENT_NAME --region $AWS_REGION"
    exit 1
fi

echo -e "${YELLOW}Updating image references...${NC}"
# Actualizar referencias de imágenes en los manifiestos
find kubernetes/ -name "*.yaml" -type f -exec sed -i "s|<TU_ECR_REPOSITORY>|$ECR_REGISTRY|g" {} +

# 1. Crear namespace
echo -e "${GREEN}Step 1: Creating namespace${NC}"
kubectl apply -f kubernetes/namespace.yaml

# 2. Crear ConfigMap y Secrets
echo -e "${GREEN}Step 2: Creating ConfigMap and Secrets${NC}"
echo -e "${YELLOW}IMPORTANT: Update kubernetes/configmap.yaml and kubernetes/secrets.yaml with your values before deploying!${NC}"
read -p "Have you updated the ConfigMap and Secrets? (y/n): " UPDATED
if [[ $UPDATED != "y" ]]; then
    echo -e "${RED}Please update the files and run this script again${NC}"
    exit 1
fi

kubectl apply -f kubernetes/configmap.yaml
kubectl apply -f kubernetes/secrets.yaml

# 3. Deploy PostgreSQL (si no usas RDS)
read -p "Are you using RDS or deploying PostgreSQL in K8s? (rds/k8s): " DB_CHOICE
if [[ $DB_CHOICE == "k8s" ]]; then
    echo -e "${GREEN}Step 3: Deploying PostgreSQL${NC}"
    kubectl apply -f kubernetes/postgres/
else
    echo -e "${YELLOW}Skipping PostgreSQL deployment (using RDS)${NC}"
fi

# 4. Deploy MongoDB (si no usas DocumentDB)
read -p "Are you using DocumentDB or deploying MongoDB in K8s? (documentdb/k8s): " MONGO_CHOICE
if [[ $MONGO_CHOICE == "k8s" ]]; then
    echo -e "${GREEN}Step 4: Deploying MongoDB${NC}"
    kubectl apply -f kubernetes/mongodb/
else
    echo -e "${YELLOW}Skipping MongoDB deployment (using DocumentDB)${NC}"
fi

# 5. Deploy Backend
echo -e "${GREEN}Step 5: Deploying Backend${NC}"
kubectl apply -f kubernetes/backend/

# Esperar a que el backend esté ready
echo -e "${YELLOW}Waiting for backend to be ready...${NC}"
kubectl wait --for=condition=available --timeout=300s deployment/backend -n chat-app

# 6. Deploy Frontend
echo -e "${GREEN}Step 6: Deploying Frontend${NC}"
kubectl apply -f kubernetes/frontend/

# Esperar a que el frontend esté ready
echo -e "${YELLOW}Waiting for frontend to be ready...${NC}"
kubectl wait --for=condition=available --timeout=300s deployment/frontend -n chat-app

# 7. Deploy Ingress
echo -e "${GREEN}Step 7: Deploying Ingress${NC}"
kubectl apply -f kubernetes/ingress/

# Obtener información de despliegue
echo -e "${GREEN}=== Deployment Complete! ===${NC}"
echo ""
echo "Deployment Information:"
kubectl get all -n chat-app

echo ""
echo "Ingress Information:"
kubectl get ingress -n chat-app

echo ""
echo "To get the Load Balancer URL:"
echo "kubectl get ingress chat-app-ingress -n chat-app -o jsonpath='{.status.loadBalancer.ingress[0].hostname}'"

echo ""
echo "To view logs:"
echo "Backend:  kubectl logs -f -l app=backend -n chat-app"
echo "Frontend: kubectl logs -f -l app=frontend -n chat-app"

echo ""
echo "To scale deployments:"
echo "kubectl scale deployment backend --replicas=5 -n chat-app"
echo "kubectl scale deployment frontend --replicas=5 -n chat-app"