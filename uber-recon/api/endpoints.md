# Uber API Endpoint Documentation

> **Captured**: 2025-12-06
> **Account**: Rider (sgbusrqg@sharklasers.com)
> **User UUID**: 0f9ac5ed-40a0-45e9-a97d-a8028c953566

---

## GraphQL Endpoints

### riders.uber.com/graphql

| Operation | Description | IDOR Potential |
|-----------|-------------|----------------|
| `CurrentUserRidersWeb` | Get current user profile | No - uses session |
| `GetArrears` | Check outstanding payments | Needs tripUUID |
| `GetStatus` | Get nearby vehicles, active trips | Contains driver.uuid |
| `ClientHasTaxForms` | Check tax form status | No |
| `GetTrip` | Get trip by UUID | ⚠️ **HIGH** - test with victim UUID |

### m.uber.com/go/graphql

| Operation | Description | IDOR Potential |
|-----------|-------------|----------------|
| `GetPromotions` | Get user promotions/awards | Low |

---

## Key Parameters for IDOR Testing

| Parameter | Format | Found In |
|-----------|--------|----------|
| `uuid` (user) | UUID v4 | currentUser, driver |
| `tripUUID` | UUID v4 | getTrip, getArrears |
| `paymentProfileUUID` | UUID v4 | currentUser |
| `threadUUID` | UUID v4 | chat (trip) |
| `city.id` | Integer | status |

---

## Interesting Fields in Responses

### GetStatus Response (when trip active)
```json
{
  "trip": {
    "uuid": "...",           // Trip identifier
    "clientUUID": "...",     // Rider UUID
    "driver": {
      "uuid": "...",         // Driver UUID
      "name": "...",
      "pictureUrl": "...",
      "rating": 4.9
    },
    "chat": {
      "threadUUID": "..."    // Chat thread ID
    },
    "shareToken": "...",     // Share ride token
    "vehicle": {
      "licensePlate": "..."
    },
    "waypoints": [...]       // Locations
  }
}
```

### currentUser Response
```json
{
  "uuid": "0f9ac5ed-40a0-45e9-a97d-a8028c953566",
  "firstName": "Aynorica",
  "lastName": "Tester",
  "email": "sgbusrqg@sharklasers.com",
  "role": "USER_ROLE_CLIENT",
  "paymentProfiles": [
    {
      "uuid": "d6939fbe-f373-5463-ae19-9f9ed91cf566",
      "tokenType": "stored_value"
    }
  ]
}
```

---

## IDOR Testing Priority

### Priority 1: Trip Data (High Value)
- **Endpoint**: `GetTrip($tripUUID: String!)`
- **Attack**: Swap tripUUID to access other users' trips
- **Impact**: PII exposure (locations, driver info, fare)
- **Blocker**: Need valid tripUUID from victim account

### Priority 2: Receipt/Invoice Access
- **Pattern**: `/trips/{tripUUID}/receipt`
- **Attack**: Direct URL access with UUID
- **Impact**: Financial data exposure

### Priority 3: Driver Profile Access
- **Parameter**: `driver.uuid`
- **Attack**: Query driver data directly by UUID
- **Impact**: Driver PII, earnings info

---

## Authentication Headers

Required for all authenticated requests:

```
x-csrf-token: x
x-uber-rv-session-type: desktop_session
Content-Type: application/json
```

Cookies (httpOnly):
- `sid` - Main session token
- `jwt-session` - JWT token
- `udi-id` - Device identifier

---

## Next Steps

1. **Create Account B** (Victim) - Manual via GuerrillaMail
2. **Take a trip on Account B** - Get valid tripUUID
3. **Test GetTrip IDOR** - Use Account A to fetch Account B's trip
4. **Check receipts** - `/trips/{uuid}/receipt` access
5. **Test driver UUID access** - During active trip

---

## Notes

- GraphQL introspection is disabled
- Uber uses UUID v4 (not enumerable)
- Need UUID leak or second account for proper IDOR testing
- API responses are well-structured with `__typename` for each object
