#!/bin/bash
# GProA EDGE - Render Deployment Health Check Script
# Usage: ./verify-deployment.sh <BACKEND_URL> <FRONTEND_URL>
# Example: ./verify-deployment.sh https://gproa-edge-backend.onrender.com https://gproa-edge-frontend.onrender.com

set -e

echo "=========================================="
echo "  GProA EDGE - Deployment Verification"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

BACKEND_URL="${1:-$BACKEND_URL}"
FRONTEND_URL="${2:-$FRONTEND_URL}"

if [ -z "$BACKEND_URL" ] || [ -z "$FRONTEND_URL" ]; then
    echo -e "${RED}Error:${NC} Missing URLs"
    echo "Usage: $0 <BACKEND_URL> <FRONTEND_URL>"
    echo "Example: $0 https://gproa-edge-backend.onrender.com https://gproa-edge-frontend.onrender.com"
    echo ""
    echo "Or set environment variables:"
    echo "  export BACKEND_URL=https://... frontend"
    echo "  export FRONTEND_URL=https://... frontend"
    exit 1
fi

BACKEND_URL="${BACKEND_URL%/}"
FRONTEND_URL="${FRONTEND_URL%/}"
API_URL="${BACKEND_URL}/api"

PASSED=0
FAILED=0

check() {
    local name="$1"
    local url="$2"
    local expected="$3"
    
    echo -n "  Checking $name... "
    local status=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null || echo "000")
    
    if [ "$status" = "$expected" ]; then
        echo -e "${GREEN}✓${NC} HTTP $status"
        ((PASSED++))
        return 0
    else
        echo -e "${RED}✗${NC} HTTP $status (expected $expected)"
        ((FAILED++))
        return 1
    fi
}

echo -e "${BLUE}Backend Checks:${NC}"
check "API Root" "$API_URL/" "200"
check "Edge Rules" "$API_URL/edge-rules" "200"

echo ""
echo -e "${BLUE}Project Creation:${NC}"
echo -n "  Creating test project... "
PROJECT_RESPONSE=$(curl -s -X POST "$API_URL/projects" \
    -H "Content-Type: application/json" \
    -d '{"name":"Deployment Test","typology":"residential"}')
PROJECT_ID=$(echo "$PROJECT_RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)

if [ -n "$PROJECT_ID" ]; then
    echo -e "${GREEN}✓${NC} Project ID: $PROJECT_ID"
    ((PASSED++))
else
    echo -e "${RED}✗${NC} Could not create project"
    ((FAILED++))
    exit 1
fi

echo -n "  Fetching project... "
if curl -s "$API_URL/projects/$PROJECT_ID" | grep -q "$PROJECT_ID"; then
    echo -e "${GREEN}✓${NC}"
    ((PASSED++))
else
    echo -e "${RED}✗${NC}"
    ((FAILED++))
fi

echo ""
echo -e "${BLUE}File Upload:${NC}"
echo -n "  Uploading sample file... "
TEST_FILE=$(mktemp)
echo "TABLA DE LUMINARIAS TEST" > "$TEST_FILE"
UPLOAD_RESPONSE=$(curl -s -X POST "$API_URL/projects/$PROJECT_ID/files" \
    -F "file=@${TEST_FILE};type=text/plain" 2>/dev/null || echo "{}")
FILE_ID=$(echo "$UPLOAD_RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
rm "$TEST_FILE"

if [ -n "$FILE_ID" ]; then
    echo -e "${GREEN}✓${NC} File ID: $FILE_ID"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠${NC} Upload may have failed (non-critical)"
fi

echo ""
echo -e "${BLUE}Processing:${NC}"
echo -n "  Starting batch processing... "
BATCH_RESPONSE=$(curl -s -X POST "$API_URL/projects/$PROJECT_ID/process-edge")
BATCH_JOB_ID=$(echo "$BATCH_RESPONSE" | grep -o '"job_id":"[^"]*"' | cut -d'"' -f4)

if [ -n "$BATCH_JOB_ID" ]; then
    echo -e "${GREEN}✓${NC} Job ID: $BATCH_JOB_ID"
    ((PASSED++))
    
    echo -n "  Polling status (max 30s)... "
    for i in {1..15}; do
        STATUS_RESPONSE=$(curl -s "$API_URL/projects/$PROJECT_ID/process-status/$BATCH_JOB_ID")
        STATUS=$(echo "$STATUS_RESPONSE" | grep -o '"status":"[^"]*"' | cut -d'"' -f4)
        if [ "$STATUS" = "completed" ]; then
            echo -e "${GREEN}✓${NC} Completed"
            ((PASSED++))
            break
        elif [ "$STATUS" = "error" ]; then
            echo -e "${RED}✗${NC} Error"
            ((FAILED++))
            break
        else
            echo -n "."
            sleep 2
        fi
    done
else
    echo -e "${YELLOW}⚠${NC} Could not start batch (may need files)"
fi

echo ""
echo -e "${BLUE}Export:${NC}"
echo -n "  Testing Excel export... "
EXCEL_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/projects/$PROJECT_ID/export-excel")
if [ "$EXCEL_STATUS" = "200" ]; then
    echo -e "${GREEN}✓${NC} HTTP $EXCEL_STATUS"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠${NC} HTTP $EXCEL_STATUS (may need processed files)"
fi

echo ""
echo "=========================================="
echo -e "Results: ${GREEN}$PASSED passed${NC}, ${RED}$FAILED failed${NC}"
echo ""

# Frontend URL info
echo -e "${BLUE}Frontend:${NC} $FRONTEND_URL"
echo ""
echo "Manual verification needed:"
echo "  1. Open $FRONTEND_URL in browser"
echo "  2. Create project → upload file → process"
echo "  3. Check tabs: Datos Extraídos, Compliance EDGE"
echo "  4. Test Export Excel button"
echo ""

# Cleanup test project
echo -n "Cleaning up test project... "
curl -s -X DELETE "$API_URL/projects/$PROJECT_ID" > /dev/null 2>&1
echo "done"

echo "=========================================="
echo "Verification complete!"
echo "=========================================="
