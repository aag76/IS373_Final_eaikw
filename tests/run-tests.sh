#!/bin/bash

# Test Runner Script for Complete Submission Workflow
# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}  Design Gallery - Integration Test Suite${NC}"
echo -e "${BLUE}================================================${NC}\n"

# Check environment variables
echo -e "${YELLOW}🔍 Checking environment configuration...${NC}"

if [ ! -f .env ]; then
  echo -e "${RED}❌ .env file not found${NC}"
  exit 1
fi

source .env

REQUIRED_VARS=(
  "AIRTABLE_API_TOKEN"
  "AIRTABLE_BASE_ID"
  "DISCORD_WEBHOOK_SUBMISSIONS"
)

MISSING_VARS=()

for var in "${REQUIRED_VARS[@]}"; do
  if [ -z "${!var}" ]; then
    MISSING_VARS+=("$var")
  fi
done

if [ ${#MISSING_VARS[@]} -gt 0 ]; then
  echo -e "${RED}❌ Missing required environment variables:${NC}"
  for var in "${MISSING_VARS[@]}"; do
    echo -e "${RED}   - $var${NC}"
  done
  exit 1
fi

echo -e "${GREEN}✓ All required environment variables set${NC}\n"

# Start dev server if not running
echo -e "${YELLOW}🚀 Starting development server...${NC}"
npm run dev > /dev/null 2>&1 &
DEV_SERVER_PID=$!

# Wait for server to be ready
echo -e "${YELLOW}⏳ Waiting for server to start...${NC}"
sleep 5

# Check if server is running
if curl -s http://localhost:8080 > /dev/null; then
  echo -e "${GREEN}✓ Development server running on http://localhost:8080${NC}\n"
else
  echo -e "${RED}❌ Failed to start development server${NC}"
  kill $DEV_SERVER_PID 2>/dev/null
  exit 1
fi

# Create screenshots directory
mkdir -p tests/screenshots

# Run tests based on argument
TEST_TYPE=${1:-"all"}

case $TEST_TYPE in
  "integration")
    echo -e "${BLUE}📊 Running integration tests...${NC}\n"
    npx playwright test tests/integration/submission-workflow.test.js --reporter=list
    ;;
  "e2e")
    echo -e "${BLUE}🎬 Running E2E tests...${NC}\n"
    npx playwright test tests/e2e/live-submission.test.js --reporter=list
    ;;
  "discord")
    echo -e "${BLUE}💬 Running Discord integration tests...${NC}\n"
    npx playwright test tests/integration/discord-notifications.test.js --reporter=list
    ;;
  "all")
    echo -e "${BLUE}🧪 Running all tests...${NC}\n"
    
    echo -e "${YELLOW}Test 1/3: Integration Tests${NC}"
    npx playwright test tests/integration/submission-workflow.test.js --reporter=list
    INTEGRATION_EXIT=$?
    
    echo -e "\n${YELLOW}Test 2/3: E2E Tests${NC}"
    npx playwright test tests/e2e/live-submission.test.js --reporter=list
    E2E_EXIT=$?
    
    echo -e "\n${YELLOW}Test 3/3: Discord Tests${NC}"
    npx playwright test tests/integration/discord-notifications.test.js --reporter=list
    DISCORD_EXIT=$?
    ;;
  *)
    echo -e "${RED}❌ Unknown test type: $TEST_TYPE${NC}"
    echo -e "${YELLOW}Usage: ./tests/run-tests.sh [integration|e2e|discord|all]${NC}"
    kill $DEV_SERVER_PID 2>/dev/null
    exit 1
    ;;
esac

TEST_EXIT=$?

# Cleanup
echo -e "\n${YELLOW}🧹 Cleaning up...${NC}"
kill $DEV_SERVER_PID 2>/dev/null
wait $DEV_SERVER_PID 2>/dev/null

# Summary
echo -e "\n${BLUE}================================================${NC}"
echo -e "${BLUE}  Test Summary${NC}"
echo -e "${BLUE}================================================${NC}"

if [ "$TEST_TYPE" = "all" ]; then
  echo -e "Integration Tests: $([ $INTEGRATION_EXIT -eq 0 ] && echo -e "${GREEN}✓ PASSED${NC}" || echo -e "${RED}✗ FAILED${NC}")"
  echo -e "E2E Tests:         $([ $E2E_EXIT -eq 0 ] && echo -e "${GREEN}✓ PASSED${NC}" || echo -e "${RED}✗ FAILED${NC}")"
  echo -e "Discord Tests:     $([ $DISCORD_EXIT -eq 0 ] && echo -e "${GREEN}✓ PASSED${NC}" || echo -e "${RED}✗ FAILED${NC}")"
  
  if [ $INTEGRATION_EXIT -eq 0 ] && [ $E2E_EXIT -eq 0 ] && [ $DISCORD_EXIT -eq 0 ]; then
    echo -e "\n${GREEN}✅ All tests passed!${NC}"
    exit 0
  else
    echo -e "\n${RED}❌ Some tests failed${NC}"
    exit 1
  fi
else
  if [ $TEST_EXIT -eq 0 ]; then
    echo -e "${GREEN}✅ Tests passed!${NC}"
    exit 0
  else
    echo -e "${RED}❌ Tests failed${NC}"
    exit 1
  fi
fi
