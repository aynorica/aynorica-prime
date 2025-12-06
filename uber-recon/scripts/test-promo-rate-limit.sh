#!/bin/bash
# Test rate limiting on Uber promo code endpoint

COOKIE='sid=QA.CAESEFynQ_gJk0WBtFIzzs5S4NIYmP-F0QYiATEqJDBmOWFjNWVkLTQwYTAtNDVlOS1hOTdkLWE4MDI4Yzk1MzU2NjI8NE6sL7V9LiEAfA3e41dZOPc3VUkkz4IUKW6J6Ugz7AZqOfRs3Z1d2AIfALvjcabO1HqPub4xytulXNo5OgExQgh1YmVyLmNvbQ.znOQkJ2_dVOHpTOTLNUTMQ97BXTl-CIVdzRnDdgOXmg; csid=1.1767620274428.Djy9IS01jvYJ5gAfpOCIYmr6HNxdZtsZ2fijSKYyask='

echo "Testing rate limiting on promo code endpoint..."
echo "Sending 20 rapid requests..."

for i in $(seq 1 20); do
    CODE="TESTCODE$i"
    RESPONSE=$(curl -s -w '\n%{http_code}' 'https://m.uber.com/go/graphql' \
      -H 'Content-Type: application/json' \
      -H 'x-csrf-token: x' \
      -H 'Origin: https://m.uber.com' \
      -b "$COOKIE" \
      --data-raw "{\"operationName\":\"ApplyPromoCode\",\"variables\":{\"promotionCode\":\"$CODE\"},\"query\":\"mutation ApplyPromoCode(\$promotionCode: String!) { applyPromoCode(promotionCode: \$promotionCode) { promotionApplied __typename } }\"}")
    
    HTTP_CODE=$(echo "$RESPONSE" | tail -1)
    BODY=$(echo "$RESPONSE" | head -n -1)
    
    echo "Request $i: HTTP $HTTP_CODE - $(echo $BODY | jq -r '.errors[0].extensions.code.errorMessage // .data.applyPromoCode.promotionApplied // "unknown"' 2>/dev/null || echo "$BODY")"
done
