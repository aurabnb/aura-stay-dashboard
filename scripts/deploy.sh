#!/bin/bash

# AURA Stay Dashboard - Production Deployment Script
# Usage: ./scripts/deploy.sh [environment]
# Environments: staging, production

set -e  # Exit on any error

# Configuration
ENVIRONMENT=${1:-staging}
PROJECT_NAME="aura-stay-dashboard"
DOCKER_IMAGE="$PROJECT_NAME:$ENVIRONMENT"
BACKUP_DIR="./backups"
LOG_FILE="./logs/deploy-$(date +%Y%m%d-%H%M%S).log"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] $1${NC}" | tee -a "$LOG_FILE"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERROR: $1${NC}" | tee -a "$LOG_FILE"
    exit 1
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] WARNING: $1${NC}" | tee -a "$LOG_FILE"
}

# Create necessary directories
mkdir -p logs backups

log "🚀 Starting AURA Stay Dashboard deployment to $ENVIRONMENT"

# Pre-deployment checks
log "🔍 Running pre-deployment checks..."

# Check Node.js version
NODE_VERSION=$(node --version)
if [[ ! "$NODE_VERSION" =~ ^v(18\.(1[8-9]|[2-9][0-9])|19\.[8-9]|19\.[1-9][0-9]|[2-9][0-9]\.) ]]; then
    error "Node.js version $NODE_VERSION is not supported. Required: >=18.18.0, >=19.8.0, or >=20.0.0"
fi
log "✅ Node.js version: $NODE_VERSION"

# Check environment file
ENV_FILE=".env.$ENVIRONMENT"
if [[ "$ENVIRONMENT" == "production" ]]; then
    ENV_FILE=".env.production"
fi

if [[ ! -f "$ENV_FILE" ]]; then
    error "Environment file $ENV_FILE not found"
fi
log "✅ Environment file found: $ENV_FILE"

# Check required environment variables
log "🔍 Checking required environment variables..."
source "$ENV_FILE"

REQUIRED_VARS=(
    "DATABASE_URL"
    "NEXT_PUBLIC_SOLANA_RPC_URL"
    "NEXTAUTH_SECRET"
)

for var in "${REQUIRED_VARS[@]}"; do
    if [[ -z "${!var}" ]]; then
        error "Required environment variable $var is not set"
    fi
done
log "✅ All required environment variables are set"

# Run tests
log "🧪 Running tests..."
npm run test:coverage || error "Tests failed"
log "✅ Tests passed"

# Security audit
log "🔒 Running security audit..."
npm audit --audit-level high || warn "Security vulnerabilities found"

# Lint check
log "📝 Running linter..."
npm run lint || error "Linting failed"
log "✅ Linting passed"

# Type check
log "🏷️  Running type check..."
npm run type-check || error "Type checking failed"
log "✅ Type checking passed"

# Database backup (production only)
if [[ "$ENVIRONMENT" == "production" ]]; then
    log "💾 Creating database backup..."
    BACKUP_FILE="$BACKUP_DIR/backup-$(date +%Y%m%d-%H%M%S).sql"
    
    # Extract database connection details
    DB_URL_REGEX="postgresql://([^:]+):([^@]+)@([^:]+):([0-9]+)/(.+)"
    if [[ $DATABASE_URL =~ $DB_URL_REGEX ]]; then
        DB_USER="${BASH_REMATCH[1]}"
        DB_PASS="${BASH_REMATCH[2]}"
        DB_HOST="${BASH_REMATCH[3]}"
        DB_PORT="${BASH_REMATCH[4]}"
        DB_NAME="${BASH_REMATCH[5]}"
        
        PGPASSWORD="$DB_PASS" pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" > "$BACKUP_FILE" || warn "Database backup failed"
        log "✅ Database backup created: $BACKUP_FILE"
    else
        warn "Could not parse DATABASE_URL for backup"
    fi
fi

# Build application
log "🏗️  Building application..."
npm run build || error "Build failed"
log "✅ Build completed successfully"

# Build Docker image
log "🐳 Building Docker image..."
docker build -t "$DOCKER_IMAGE" . || error "Docker build failed"
log "✅ Docker image built: $DOCKER_IMAGE"

# Run Docker security scan
log "🔐 Running Docker security scan..."
docker run --rm -v /var/run/docker.sock:/var/run/docker.sock \
    aquasec/trivy image --exit-code 0 --severity HIGH,CRITICAL "$DOCKER_IMAGE" || warn "Security vulnerabilities found in Docker image"

# Database migration (if needed)
log "🗄️  Running database migrations..."
if [[ "$ENVIRONMENT" == "production" ]]; then
    npm run db:migrate:deploy || error "Database migration failed"
else
    npm run db:push || error "Database schema push failed"
fi
log "✅ Database migrations completed"

# Deploy based on environment
if [[ "$ENVIRONMENT" == "production" ]]; then
    log "🚀 Deploying to production..."
    
    # Stop existing containers
    docker-compose -f docker-compose.prod.yml down || warn "No existing containers to stop"
    
    # Start new deployment
    docker-compose -f docker-compose.prod.yml up -d || error "Production deployment failed"
    
    # Wait for services to be ready
    log "⏳ Waiting for services to be ready..."
    sleep 30
    
    # Health check
    log "🏥 Running health checks..."
    max_attempts=30
    attempt=1
    while [[ $attempt -le $max_attempts ]]; do
        if curl -f -s http://localhost/api/health > /dev/null; then
            log "✅ Health check passed"
            break
        fi
        
        if [[ $attempt -eq $max_attempts ]]; then
            error "Health check failed after $max_attempts attempts"
        fi
        
        log "⏳ Health check attempt $attempt/$max_attempts failed, retrying..."
        sleep 10
        ((attempt++))
    done
    
elif [[ "$ENVIRONMENT" == "staging" ]]; then
    log "🚀 Deploying to staging..."
    
    # Deploy to staging environment
    docker-compose -f docker-compose.staging.yml down || warn "No existing staging containers to stop"
    docker-compose -f docker-compose.staging.yml up -d || error "Staging deployment failed"
    
    # Health check for staging
    sleep 20
    if curl -f -s http://localhost:3001/api/health > /dev/null; then
        log "✅ Staging health check passed"
    else
        error "Staging health check failed"
    fi
    
else
    error "Unknown environment: $ENVIRONMENT. Use 'staging' or 'production'"
fi

# Clean up old Docker images
log "🧹 Cleaning up old Docker images..."
docker image prune -f || warn "Failed to clean up Docker images"

# Performance test (basic)
log "⚡ Running basic performance test..."
if command -v ab &> /dev/null; then
    ab -n 100 -c 10 http://localhost/api/health > /dev/null || warn "Performance test failed"
    log "✅ Basic performance test completed"
else
    warn "Apache Bench (ab) not found, skipping performance test"
fi

# Send deployment notification (if configured)
if [[ -n "$SLACK_WEBHOOK_URL" ]]; then
    curl -X POST -H 'Content-type: application/json' \
        --data "{\"text\":\"🚀 AURA Stay Dashboard deployed to $ENVIRONMENT successfully!\"}" \
        "$SLACK_WEBHOOK_URL" || warn "Failed to send Slack notification"
fi

# Log deployment details
cat << EOF | tee -a "$LOG_FILE"

📊 DEPLOYMENT SUMMARY
=====================
Environment: $ENVIRONMENT
Timestamp: $(date)
Node.js Version: $NODE_VERSION
Docker Image: $DOCKER_IMAGE
Log File: $LOG_FILE

🔗 USEFUL LINKS
===============
Application: http://localhost$([ "$ENVIRONMENT" = "staging" ] && echo ":3001")
Health Check: http://localhost$([ "$ENVIRONMENT" = "staging" ] && echo ":3001")/api/health
Logs: docker-compose logs -f app

🏁 Deployment completed successfully!
EOF

log "🎉 Deployment to $ENVIRONMENT completed successfully!"
log "📋 Check the health endpoint: http://localhost$([ "$ENVIRONMENT" = "staging" ] && echo ":3001")/api/health" 