# API Specification

## Base URL
```
https://api.artandcraft.com/v1
```

## Authentication
All API endpoints (except login/register) require Bearer token authentication.

### Header Format
```
Authorization: Bearer <jwt_token>
```

## Response Format

### Success Response
```json
{
  "success": true,
  "data": {},
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "success": false,
  "error": "ERROR_CODE",
  "message": "Human readable error message"
}
```

## Authentication Endpoints

### Register User
```
POST /auth/register
```
**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "+1234567890",
  "user_type": "customer"
}
```

### Login
```
POST /auth/login
```
**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

### Refresh Token
```
POST /auth/refresh
```

### Logout
```
POST /auth/logout
```

## Product Endpoints

### Get All Products
```
GET /products
Query Parameters:
  - page: int (default: 1)
  - per_page: int (default: 20)
  - search: string
  - category_id: int
  - vendor_id: int
  - sort_by: string (price_asc, price_desc, rating, newest)
```

### Get Product Details
```
GET /products/:id
```

### Create Product (Vendor Only)
```
POST /products
```
**Request Body:**
```json
{
  "name": "Product Name",
  "description": "Product description",
  "price": 99.99,
  "category_id": 1,
  "stock": 100,
  "images": ["url1", "url2"]
}
```

### Update Product (Vendor Only)
```
PUT /products/:id
```

### Delete Product (Vendor Only)
```
DELETE /products/:id
```

## Order Endpoints

### Create Order
```
POST /orders
```
**Request Body:**
```json
{
  "items": [
    {
      "product_id": 1,
      "quantity": 2,
      "price": 99.99
    }
  ],
  "shipping_address": {
    "address": "123 Main St",
    "city": "City",
    "state": "State",
    "zip": "12345",
    "country": "Country"
  },
  "payment_method": "credit_card"
}
```

### Get Orders
```
GET /orders
Query Parameters:
  - status: string (pending, confirmed, shipped, delivered, cancelled)
  - page: int
```

### Get Order Details
```
GET /orders/:id
```

### Update Order Status (Admin/Vendor)
```
PUT /orders/:id/status
```
**Request Body:**
```json
{
  "status": "shipped",
  "tracking_number": "TRK123456"
}
```

## Vendor Endpoints

### Register Vendor
```
POST /vendors/register
```
**Request Body:**
```json
{
  "business_name": "ABC Store",
  "email": "vendor@abc.com",
  "phone": "+1234567890",
  "address": "123 Business St",
  "tax_id": "TAX123456",
  "commission_rate": 10
}
```

### Get Vendors
```
GET /vendors
Query Parameters:
  - status: string (pending, approved, rejected)
  - page: int
```

### Get Vendor Details
```
GET /vendors/:id
```

### Update Vendor (Admin Only)
```
PUT /vendors/:id
```

### Approve Vendor (Admin Only)
```
POST /vendors/:id/approve
```

### Reject Vendor (Admin Only)
```
POST /vendors/:id/reject
```
**Request Body:**
```json
{
  "reason": "Rejection reason"
}
```

## Review Endpoints

### Get Product Reviews
```
GET /products/:id/reviews
Query Parameters:
  - page: int
  - rating: int (1-5)
```

### Create Review
```
POST /products/:id/reviews
```
**Request Body:**
```json
{
  "rating": 4,
  "comment": "Great product!",
  "title": "Very satisfied"
}
```

## Category Endpoints

### Get All Categories
```
GET /categories
```

### Get Category Details
```
GET /categories/:id
```

### Create Category (Admin Only)
```
POST /categories
```

### Update Category (Admin Only)
```
PUT /categories/:id
```

## Payment Endpoints

### Create Payment
```
POST /payments
```
**Request Body:**
```json
{
  "order_id": 1,
  "amount": 299.97,
  "payment_method": "credit_card",
  "gateway": "stripe"
}
```

### Get Payment Status
```
GET /payments/:id
```

### Payment Webhook (External)
```
POST /webhooks/payment
```

## Error Codes

| Code | Description |
|------|-------------|
| INVALID_CREDENTIALS | Invalid email or password |
| UNAUTHORIZED | Missing or invalid token |
| FORBIDDEN | Insufficient permissions |
| NOT_FOUND | Resource not found |
| VALIDATION_ERROR | Invalid request data |
| DUPLICATE_EMAIL | Email already exists |
| SERVER_ERROR | Internal server error |

## Rate Limiting

- 1000 requests per hour per IP
- 100 requests per minute for authenticated users
- 10 requests per minute for unauthenticated users

## CORS Configuration

Allowed origins:
- Mobile apps (configured per environment)
- Admin panel domain
- Frontend domain
