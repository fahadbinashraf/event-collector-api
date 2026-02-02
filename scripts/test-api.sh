#!/bin/bash

# Event Collector API Test Script
# This script demonstrates the API functionality

API_URL="http://localhost:3000"

echo "======================================"
echo "Event Collector API - Test Script"
echo "======================================"
echo ""

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 1. Health Check
echo -e "${BLUE}1. Health Check${NC}"
echo "GET $API_URL/health"
curl -s "$API_URL/health" | jq '.'
echo ""
echo ""

# 2. Create Page View Event
echo -e "${BLUE}2. Create Page View Event${NC}"
echo "POST $API_URL/api/events"
PAGE_VIEW=$(cat <<EOF
{
  "eventType": "pageView",
  "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "userId": "user_demo_123",
  "sessionId": "session_demo_456",
  "page": {
    "url": "https://nn.nl/insurance/car",
    "title": "Car Insurance - NN",
    "referrer": "https://google.com"
  },
  "device": {
    "userAgent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
    "screenResolution": "1920x1080"
  }
}
EOF
)
curl -s -X POST "$API_URL/api/events" \
  -H "Content-Type: application/json" \
  -d "$PAGE_VIEW" | jq '.'
echo ""
echo ""

# 3. Create Click Event
echo -e "${BLUE}3. Create Click Event${NC}"
echo "POST $API_URL/api/events"
CLICK_EVENT=$(cat <<EOF
{
  "eventType": "click",
  "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "userId": "user_demo_123",
  "sessionId": "session_demo_456",
  "element": {
    "id": "cta-button",
    "text": "Get Quote Now",
    "position": { "x": 500, "y": 300 }
  },
  "page": {
    "url": "https://nn.nl/insurance/car"
  }
}
EOF
)
curl -s -X POST "$API_URL/api/events" \
  -H "Content-Type: application/json" \
  -d "$CLICK_EVENT" | jq '.'
echo ""
echo ""

# 4. Create Custom Event
echo -e "${BLUE}4. Create Custom Event${NC}"
echo "POST $API_URL/api/events"
CUSTOM_EVENT=$(cat <<EOF
{
  "eventType": "custom",
  "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "userId": "user_demo_123",
  "sessionId": "session_demo_456",
  "eventName": "quote_requested",
  "properties": {
    "vehicleType": "car",
    "coverageType": "comprehensive",
    "estimatedValue": 25000
  }
}
EOF
)
curl -s -X POST "$API_URL/api/events" \
  -H "Content-Type: application/json" \
  -d "$CUSTOM_EVENT" | jq '.'
echo ""
echo ""

# 5. Get All Events
echo -e "${BLUE}5. Get All Events (limit 5)${NC}"
echo "GET $API_URL/api/events?limit=5"
curl -s "$API_URL/api/events?limit=5" | jq '.'
echo ""
echo ""

# 6. Filter Events by Type
echo -e "${BLUE}6. Filter Events by Type (pageView)${NC}"
echo "GET $API_URL/api/events?eventType=pageView&limit=3"
curl -s "$API_URL/api/events?eventType=pageView&limit=3" | jq '.'
echo ""
echo ""

# 7. Filter Events by User
echo -e "${BLUE}7. Filter Events by User${NC}"
echo "GET $API_URL/api/events?userId=user_demo_123"
curl -s "$API_URL/api/events?userId=user_demo_123" | jq '.'
echo ""
echo ""

# 8. Get Statistics
echo -e "${BLUE}8. Get Event Statistics${NC}"
echo "GET $API_URL/api/events/statistics"
curl -s "$API_URL/api/events/statistics" | jq '.'
echo ""
echo ""

# 9. Test Validation Error
echo -e "${BLUE}9. Test Validation (Should Fail)${NC}"
echo "POST $API_URL/api/events"
INVALID_EVENT=$(cat <<EOF
{
  "eventType": "pageView",
  "timestamp": "invalid-date"
}
EOF
)
curl -s -X POST "$API_URL/api/events" \
  -H "Content-Type: application/json" \
  -d "$INVALID_EVENT" | jq '.'
echo ""
echo ""

echo -e "${GREEN}======================================"
echo "Test Script Completed!"
echo "======================================${NC}"
