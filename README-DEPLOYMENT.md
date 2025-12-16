# Chat App - Deployment Guide

## Prerequisites

- AWS CLI configured with appropriate credentials
- kubectl installed
- eksctl installed
- Helm 3 installed
- Docker installed
- Git installed

## Quick Start

### 1. Setup AWS Infrastructure
```bash
export ENVIRONMENT_NAME=chat-app-production
export AWS_REGION=us-east-1

./scripts/setup-aws.sh
```

This will create:
- VPC with public and private subnets
- EKS Cluster with managed node group
- Security Groups
- RDS PostgreSQL (optional)
- ECR Repositories
- AWS Load Balancer Controller

### 2. Build and Push Docker Images
```bash
./scripts/build-and-push.sh
```

### 3. Configure Kubernetes Manifests

Update the following files with your values:

**kubernetes/configmap.yaml:**
- `NEXT_PUBLIC_API_URL`: Your API domain
- `NEXT_PUBLIC_WS_URL`: Your WebSocket domain
- `DATABASE_URL`: RDS endpoint (if using RDS)

**kubernetes/secrets.yaml:**
- `POSTGRES_PASSWORD`: Strong database password
- `JWT_SECRET`: Generate with `openssl rand -base64 32`

**kubernetes/ingress/ingress.yaml:**
- `alb.ingress.kubernetes.io/certificate-arn`: Your ACM certificate ARN
- `host`: Your domains

### 4. Deploy to Kubernetes
```bash
./scripts/deploy-k8s.sh
```

### 5. Get Load Balancer URL
```bash
kubectl get ingress chat-app-ingress -n chat-app
```

Point your domain DNS to the ALB hostname.

## Monitoring

### View Logs
```bash
# Backend logs
kubectl logs -f -l app=backend -n chat-app

# Frontend logs
kubectl logs -f -l app=frontend -n chat-app

# All pods
kubectl logs -f -l app=chat-app -n chat-app --all-containers=true
```

### View Resources
```bash
kubectl get all -n chat-app
kubectl top nodes
kubectl top pods -n chat-app
```

## Updates

### Update Docker Images
```bash
./scripts/build-and-push.sh
kubectl rollout restart deployment/backend -n chat-app
kubectl rollout restart deployment/frontend -n chat-app
```

### Update ConfigMap/Secrets
```bash
kubectl apply -f kubernetes/configmap.yaml
kubectl apply -f kubernetes/secrets.yaml
kubectl rollout restart deployment/backend -n chat-app
kubectl rollout restart deployment/frontend -n chat-app
```

## Scaling

### Manual Scaling
```bash
kubectl scale deployment backend --replicas=5 -n chat-app
kubectl scale deployment frontend --replicas=5 -n chat-app
```

### Auto-scaling (HPA)

HPA is already configured in the manifests:
- Backend: 2-10 replicas (CPU 70%, Memory 80%)
- Frontend: 2-10 replicas (CPU 70%, Memory 80%)

View HPA status:
```bash
kubectl get hpa -n chat-app
```

## Cleanup

**WARNING: This will delete ALL resources**
```bash
./scripts/cleanup-aws.sh
```

## Security Best Practices

1. **Secrets Management:**
   - Use AWS Secrets Manager or Sealed Secrets
   - Rotate secrets regularly
   - Never commit secrets to Git

2. **Network Security:**
   - Use private subnets for databases
   - Restrict security group rules
   - Enable VPC Flow Logs

3. **Container Security:**
   - Scan images for vulnerabilities
   - Use non-root users
   - Keep base images updated

4. **Access Control:**
   - Use IAM roles for service accounts
   - Enable audit logging
   - Implement least privilege principle

## Cost Optimization

- Use Spot instances for non-critical workloads
- Enable cluster autoscaler
- Use RDS Reserved Instances
- Set up CloudWatch billing alerts
- Delete unused resources

## Troubleshooting

### Pods not starting
```bash
kubectl describe pod <pod-name> -n chat-app
kubectl logs <pod-name> -n chat-app
```

### Database connection issues
```bash
# Test from a pod
kubectl run -it --rm debug --image=postgres:15-alpine --restart=Never -n chat-app -- psql -h <rds-endpoint> -U chatuser -d chatdb
```

### Load Balancer not creating
```bash
kubectl describe ingress chat-app-ingress -n chat-app
kubectl logs -n kube-system -l app.kubernetes.io/name=aws-load-balancer-controller
```

## Support

For issues or questions:
- Check CloudWatch Logs
- Review EKS cluster logs
- Check AWS Health Dashboard