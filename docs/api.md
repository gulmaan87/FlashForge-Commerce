# API Reference

All services follow the same response envelope:

```json
// Success
{ "success": true, "data": <T> }

// Error
{ "success": false, "error": { "code": "SNAKE_CASE_CODE", "message": "Human message" } }
```

---

## Product Service — `http://localhost:4001`

### `GET /api/products`
List all products.

**Response 200:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Ocean Blue Shirt",
      "description": "...",
      "price": 5000,
      "sku": "ocean-blue-shirt",
      "imageUrl": "https://..."
    }
  ]
}
```

---

### `GET /api/products/:id`
Get a single product by ID.

**Response 200:** Single product object.  
**Response 404:** `{ "error": { "code": "PRODUCT_NOT_FOUND" } }`

---

### `POST /api/products`
Create a product.

**Body:**
```json
{
  "name": "string",
  "description": "string",
  "price": 5000,
  "sku": "unique-sku",
  "imageUrl": "https://..."
}
```

**Response 201:** Created product.  
**Response 400:** Validation error.  
**Response 409:** SKU already exists.

---

### `PATCH /api/products/:id`
Update product fields.

---

### `DELETE /api/products/:id`
Delete a product.

---

## Inventory Service — `http://localhost:4002`

### `GET /api/inventory/:productId`
Get current stock for a product.

**Response 200:**
```json
{
  "success": true,
  "data": {
    "productId": "uuid",
    "quantityAvailable": 95,
    "quantityReserved": 5
  }
}
```

---

### `POST /api/inventory/reserve`
Reserve stock for a pending checkout.

**Body:**
```json
{
  "productId": "uuid",
  "userId": "user-123",
  "quantity": 1
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "reservationToken": "uuid",
    "expiresAt": "2025-01-01T12:10:00Z"
  }
}
```

**Response 409:** `{ "error": { "code": "OUT_OF_STOCK" } }`

---

### `POST /api/inventory/commit`
Commit a reservation after successful payment.

**Body:**
```json
{ "reservationToken": "uuid" }
```

**Response 200:** `{ "success": true }`

---

### `POST /api/inventory/release`
Release a reservation (payment failed or cart abandoned).

**Body:**
```json
{ "reservationToken": "uuid" }
```

**Response 200:** `{ "success": true }`

---

## Checkout Service — `http://localhost:4003`

### `POST /api/checkout`
Orchestrate a checkout. Validates cart, confirms reservation, charges payment, publishes event.

**Body:**
```json
{
  "sessionId": "unique-session-id",
  "userId": "user-123",
  "reservationToken": "uuid-from-inventory",
  "items": [
    { "productId": "uuid", "quantity": 1, "price": 5000 }
  ],
  "totalAmount": 5000
}
```

**Response 201:**
```json
{
  "success": true,
  "data": {
    "checkoutId": "uuid",
    "status": "processing",
    "message": "Payment accepted. Order is being created."
  }
}
```

**Response 409:** `OUT_OF_STOCK` — reservation expired.  
**Response 402:** `PAYMENT_FAILED` — payment declined.  
**Response 400:** Validation error.

---

## Payment Service — `http://localhost:4004`

### `POST /api/payments`
Process a payment. Idempotent — same `sessionId` always returns the same result.

**Body:**
```json
{
  "sessionId": "unique-session-id",
  "userId": "user-123",
  "amount": 5000,
  "currency": "USD",
  "checkoutId": "uuid"
}
```

**Response 200:**
```json
{
  "success": true,
  "data": {
    "paymentId": "uuid",
    "status": "succeeded",
    "amount": 5000,
    "currency": "USD"
  }
}
```

**Response 402:**
```json
{
  "success": false,
  "error": { "code": "PAYMENT_FAILED", "message": "Payment declined by gateway" }
}
```

> **Note:** The mock gateway succeeds ~80% of the time. In production replace with Stripe or similar.

---

## Order Service — `http://localhost:4005`

### `GET /api/orders`
List all orders (optionally filtered by `?userId=...`).

---

### `GET /api/orders/:id`
Get order by ID.

**Response 200:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "checkoutId": "uuid",
    "userId": "user-123",
    "status": "confirmed",
    "totalAmount": 5000,
    "items": [
      { "productId": "uuid", "quantity": 1, "price": 5000 }
    ],
    "createdAt": "2025-01-01T12:00:00Z"
  }
}
```

---

### `POST /api/orders`
Idempotent order creation (called by worker-service, not directly by frontend).

**Body:**
```json
{
  "checkoutId": "uuid",
  "userId": "user-123",
  "items": [...],
  "totalAmount": 5000
}
```

---

## Health Endpoints (all services)

### `GET /health`
Returns `200 { "status": "ok", "service": "<name>" }`.

### `GET /ready`
Returns `200 { "status": "ready" }` when the service is ready to accept traffic.

### `GET /metrics`
Returns Prometheus text-format metrics.
