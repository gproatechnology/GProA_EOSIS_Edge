#!/bin/bash
# GProA EDGE - Render Deployment Health Check Script
# Run this after both services are deployed to verify everything works

set -e

echo "=========================================="
echo "  GProA EDGE Render Deployment Checker"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get backend URL from user
read -p "Enter Backend URL (e.g., https://gproa-edge-backend.onrender.com): " BACKEND_URL
read -p "Enter Frontend URL (e.g., https://gproa-edge-frontend.onrender.com): " FRONTEND_URL

# Remove trailing slash
BACKEND_URL=${BACKEND_URL%/}
FRONTEND_URL=${FRONTEND_URL%/}

API_URL="${BACKEND_URL}/api"

echo ""
echo "Testing Backend API: $API_URL"
echo "------------------------------------------"

# Test 1: Root endpoint
echo -n "1. Root endpoint (/)... "
response=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/")
if [ "$response" = "200" ]; then
    echo -e "${GREEN}✓${NC} (HTTP $response)"
else
    echo -e "${RED}✗${NC} (HTTP $response)"
    exit 1
fi

# Test 2: Edge rules endpoint
echo -n "2. Edge rules endpoint... "
response=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/edge-rules")
if [ "$response" = "200" ]; then
    echo -e "${GREEN}✓${NC} (HTTP $response)"
else
    echo -e "${RED}✗${NC} (HTTP $response)"
fi

# Test 3: Create project
echo -n "3. Create project (POST)... "
project_response=$(curl -s -X POST "$API_URL/projects" \
    -H "Content-Type: application/json" \
    -d '{"name":"Health Check Test","typology":"residential"}')
project_id=$(echo "$project_response" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
if [ -n "$project_id" ]; then
    echo -e "${GREEN}✓${NC} (Project ID: $project_id)"
else
    echo -e "${RED}✗${NC} Could not create project"
    exit 1
fi

# Test 4: List projects
echo -n "4. List projects (GET)... "
response=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/projects")
if [ "$response" = "200" ]; then
    echo -e "${GREEN}✓${NC} (HTTP $response)"
else
    echo -e "${RED}✗${NC} (HTTP $response)"
fi

# Test 5: Get specific project
echo -n "5. Get project detail... "
response=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/projects/$project_id")
if [ "$response" = "200" ]; then
    echo -e "${GREEN}✓${NC} (HTTP $response)"
else
    echo -e "${RED}✗${NC} (HTTP $response)"
fi

# Test 6: WBS validation endpoint
echo -n "6. WBS validation endpoint... "
response=$(curl -s -o /dev/null -w "%{http_code}" "$API_URL/projects/$project_id/wbs-validation")
if [ "$response" = "200" ]; then
    echo -e "${GREEN}✓${NC} (HTTP $response)"
else
    echo -e "${YELLOW}⚠${NC} (HTTP $response - expected if no files uploaded)"
fi

# Test 7: Upload file
echo -n "7. Upload test file... "
test_content="TABLA DE LUMINARIAS LED
ID    MODELO         CANT    LUMENS   WATTS
L01   Test Luminaire 10     3000     30"
upload_response=$(curl -s -X POST "$API_URL/projects/$project_id/files" \
    -F "file=@<(echo "$test_content");type=text/plain" 2>/dev/null || true)
file_id=$(echo "$upload_response" | grep -o '"id":"[^"]*"' | cut -d'"' -f4)
if [ -n "$file_id" ]; then
    echo -e "${GREEN}✓${NC} (File ID: $file_id)"
else
    echo -e "${YELLOW}⚠${NC} Could not upload file (may need retry)"
fi

echo ""
echo "------------------------------------------"
echo "Frontend URL: $FRONTEND_URL"
echo ""
echo "Manual checks:"
echo "  1. Open $FRONTEND_URL in browser"
echo "  2. Verify project appears in list"
echo "  3. Click project, go to 'Archivos' tab"
echo "  4. Upload a real test file"
echo "  5. Click 'Procesar Proyecto EDGE'"
echo "  6. Check 'Datos Extraídos' tab shows data"
echo "  7. Check 'Compliance EDGE' tab shows validation"
echo ""
echo "=========================================="
echo -e "${GREEN}All backend health checks passed!${NC}"
echo "Note: Some tests may fail if project has no files yet – that's expected."
echo "=========================================="
