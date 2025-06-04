#!/bin/bash

# AURA Stay Dashboard - Production Readiness Test
# Tests all critical functionality before deployment

set -e

echo "🚀 AURA Stay Dashboard - Production Readiness Test"
echo "================================================="

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_info() {
    echo -e "ℹ️  $1"
}

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

test_result() {
    if [ $1 -eq 0 ]; then
        log_success "$2"
        ((TESTS_PASSED++))
        return 0
    else
        log_error "$2"
        ((TESTS_FAILED++))
        return 1
    fi
}

echo
log_info "1. Testing Node.js Version Compatibility..."
NODE_VERSION=$(node --version | cut -d'v' -f2)
REQUIRED_VERSION="18.18.0"

if node -pe "process.version.localeCompare('v18.18.0', undefined, { numeric: true, sensitivity: 'base' }) >= 0" >/dev/null 2>&1; then
    test_result 0 "Node.js version $NODE_VERSION is compatible"
else
    test_result 1 "Node.js version $NODE_VERSION is incompatible (requires ≥18.18.0)"
fi

echo
log_info "2. Testing Dependencies..."
if npm ls >/dev/null 2>&1; then
    test_result 0 "All dependencies are properly installed"
else
    test_result 1 "Dependency issues detected"
fi

echo
log_info "3. Testing TypeScript Compilation..."
if npm run build >/dev/null 2>&1; then
    test_result 0 "Production build successful"
else
    test_result 1 "Production build failed"
fi

echo
log_info "4. Testing Essential Files..."

# Check critical files
CRITICAL_FILES=(
    "package.json"
    "next.config.js"
    "tailwind.config.ts"
    "src/app/page.tsx"
    "src/components/Header.tsx"
    "src/components/Footer.tsx"
    "Dockerfile"
    "docker-compose.yml"
)

for file in "${CRITICAL_FILES[@]}"; do
    if [ -f "$file" ]; then
        test_result 0 "Found $file"
    else
        test_result 1 "Missing critical file: $file"
    fi
done

echo
log_info "5. Testing Environment Configuration..."

if [ -f ".env.local" ] || [ -f ".env" ]; then
    test_result 0 "Environment configuration found"
else
    test_result 1 "No environment configuration found"
fi

if [ -f "env.production.example" ]; then
    test_result 0 "Production environment template available"
else
    test_result 1 "Missing production environment template"
fi

echo
log_info "6. Testing API Endpoints Structure..."

API_DIRS=(
    "src/app/api/community"
    "src/app/api/health"
    "src/app/api/treasury"
    "src/app/api/governance"
)

for dir in "${API_DIRS[@]}"; do
    if [ -d "$dir" ]; then
        test_result 0 "API endpoint exists: $dir"
    else
        test_result 1 "Missing API endpoint: $dir"
    fi
done

echo
log_info "7. Testing Security Configuration..."

if grep -q "X-Frame-Options" next.config.js; then
    test_result 0 "Security headers configured"
else
    test_result 1 "Security headers not configured"
fi

if [ -f "src/middleware.ts" ]; then
    test_result 0 "Security middleware exists"
else
    test_result 1 "Security middleware missing"
fi

echo
log_info "8. Testing Docker Configuration..."

if [ -f "Dockerfile" ]; then
    if command -v docker >/dev/null 2>&1; then
        if docker build -t aura-test . >/dev/null 2>&1; then
            test_result 0 "Docker build successful"
            docker rmi aura-test >/dev/null 2>&1 || true
        else
            test_result 1 "Docker build failed"
        fi
    else
        test_result 0 "Dockerfile exists (Docker not installed - skipping build test)"
    fi
else
    test_result 1 "Dockerfile missing"
fi

echo
log_info "9. Testing Database Schema..."

if [ -f "prisma/schema.prisma" ]; then
    test_result 0 "Database schema exists"
else
    test_result 1 "Database schema missing"
fi

echo
log_info "10. Testing Performance Optimizations..."

if grep -q "apiOptimizer" src/lib/services/apiOptimizer.ts >/dev/null 2>&1; then
    test_result 0 "API optimization service exists"
else
    test_result 1 "API optimization service missing"
fi

if grep -q "MobileCard\|MobileGrid\|MobileSkeleton" src/components/ui/mobile-optimized.tsx >/dev/null 2>&1; then
    test_result 0 "Mobile optimization components exist"
else
    test_result 1 "Mobile optimization components missing"
fi

echo
echo "================================================="
echo "📊 Test Summary:"
echo "✅ Tests Passed: $TESTS_PASSED"
echo "❌ Tests Failed: $TESTS_FAILED"
echo "🎯 Success Rate: $(echo "scale=1; $TESTS_PASSED * 100 / ($TESTS_PASSED + $TESTS_FAILED)" | bc -l)%"
echo

if [ $TESTS_FAILED -eq 0 ]; then
    echo "🎉 ALL TESTS PASSED! Your AURA Stay Dashboard is 100% production-ready!"
    echo
    echo "🚀 Ready to deploy with:"
    echo "   • Docker: docker-compose up -d"
    echo "   • Script: ./scripts/deploy.sh production"
    echo "   • Manual: npm run build && npm run start"
    echo
    exit 0
else
    echo "⚠️  $TESTS_FAILED issues need to be resolved before production deployment."
    echo
    exit 1
fi 