#!/bin/bash
# Test rate limiting on Uber promo code endpoint

COOKIE='sid=QA.CAESEFynQ_gJk0WBtFIzzs5S4NIYmP-F0QYiATEqJDBmOWFjNWVkLTQwYTAtNDVlOS1hOTdkLWE4MDI4Yzk1MzU2NjI8NE6sL7V9LiEAfA3e41dZOPc3VUkkz4IUKW6J6Ugz7AZqOfRs3Z1d2AIfALvjcabO1HqPub4xytulXNo5OgExQgh1YmVyLmNvbQ.znOQkJ2_dVOHpTOTLNUTMQ97BXTl-CIVdzRnDdgOXmg'

echo "Testing promo code endpoint..."
curl -i 'https://m.uber.com/go/graphql' \
  -H 'Content-Type: application/json' \
  -H 'x-csrf-token: x' \
  -H 'Origin: https://m.uber.com' \
  -b "$COOKIE" \
  --data-raw '{"operationName":"ApplyPromoCode","variables":{"promotionCode":"TESTCODE"},"query":"mutation ApplyPromoCode($promotionCode: String!) { applyPromoCode(promotionCode: $promotionCode) { promotionApplied } }"}'
