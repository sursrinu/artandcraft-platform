# Backend API Documentation

## Base URL
```
http://localhost:5000/api/v1
```

## Authentication
The API uses JWT (JSON Web Token) for authentication. Include the token in the Authorization header:
```
Authorization: Bearer {token}
```

---

## API Endpoints

### Authentication Endpoints

#### 1. Register User
```
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "+1234567890",
  "userType": "customer"  // or "vendor"
}

Response 201:
{
  "success": true,
  "data": {
    "userId": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  },
  "message": "User registered successfully"
}
```

#### 2. Login
```
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}

Response 200:
{
  "success": true,
  "data": {
    "userId": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "userType": "customer",
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc...",
    "expiresIn": 3600
  },
  "message": "Login successful"
}
```

#### 3. Refresh Token
```
POST /auth/refresh
Content-Type: application/json

{
  "refreshToken": "eyJhbGc..."
}

Response 200:
{
  "success": true,
  "data": {
    "accessToken": "eyJhbGc...",
    "refreshToken": "eyJhbGc..."
  }
}
```

#### 4. Get Profile (Requires Auth)
```
GET /auth/profile
Authorization: Bearer {token}

Response 200:
{
  "success": true,
  "data": {
    "id": 1,
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "userType": "customer"
  }
}
```

#### 5. Update Profile (Requires Auth)
```
PUT /auth/profile
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "John Updated",
  "phone": "+1234567891",
  "bio": "Art enthusiast"
}

Response 200:
{
  "success": true,
  "data": { ... updated user },
  "message": "Profile updated successfully"
}
```

#### 6. Change Password (Requires Auth)
```
PUT /auth/change-password
Authorization: Bearer {token}
Content-Type: application/json

{
  "currentPassword": "oldpassword123",
  "newPassword": "newpassword123"
}

Response 200:
{
  "success": true,
  "message": "Password changed successfully"
}
```

#### 7. Logout
```
POST /auth/logout

Response 200:
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### Product Endpoints

#### 1. Get All Products (Paginated)
```
GET /products?page=1&per_page=20&search=painting&category=1&vendor=2&sort_by=price&sort_order=asc

Query Parameters:
- page: Page number (default: 1)
- per_page: Items per page (default: 20)
- search: Search term
- category: Category ID
- vendor: Vendor ID
- sort_by: price, rating, createdAt (default: createdAt)
- sort_order: asc, desc (default: desc)

Response 200:
{
  "success": true,
  "data": {
    "items": [
      {
        "id": 1,
        "name": "Abstract Painting",
        "slug": "abstract-painting",
        "description": "...",
        "price": 150.00,
        "stock": 10,
        "rating": 4.5,
        "vendor": { ... },
        "category": { ... },
        "images": [ ... ]
      }
    ],
    "pagination": {
      "page": 1,
      "per_page": 20,
      "total": 100,
      "pages": 5
    }
  }
}
```

#### 2. Get Product By ID
```
GET /products/:id

Response 200:
{
  "success": true,
  "data": {
    "id": 1,
    "name": "Abstract Painting",
    ...
    "reviews": [ ... ],
    "vendor": { ... }
  }
}
```

#### 3. Create Product (Vendor Only, Requires Auth)
```
POST /products
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "New Artwork",
  "description": "Beautiful handmade artwork",
  "categoryId": 1,
  "price": 200.00,
  "costPrice": 100.00,
  "stock": 15,
  "sku": "ART-NEW-001",
  "discountPercentage": 5,
  "images": [
    {
      "url": "https://example.com/image.jpg",
      "altText": "Product view 1",
      "isPrimary": true
    }
  ]
}

Response 201:
{
  "success": true,
  "data": { ... created product },
  "message": "Product created successfully"
}
```

#### 4. Update Product (Vendor Only, Requires Auth)
```
PUT /products/:id
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Updated Name",
  "price": 250.00,
  "stock": 20
}

Response 200:
{
  "success": true,
  "data": { ... updated product },
  "message": "Product updated successfully"
}
```

#### 5. Delete Product (Vendor Only, Requires Auth)
```
DELETE /products/:id
Authorization: Bearer {token}

Response 200:
{
  "success": true,
  "message": "Product deleted successfully"
}
```

#### 6. Get Vendor's Products (Vendor Only, Requires Auth)
```
GET /products/vendor/mine?page=1&per_page=20
Authorization: Bearer {token}

Response 200:
{
  "success": true,
  "data": { ... paginated vendor products }
}
```

---

### Order Endpoints

#### 1. Create Order (Customer Only, Requires Auth)
```
POST /orders
Authorization: Bearer {token}
Content-Type: application/json

{
  "items": [
    {
      "productId": 1,
      "quantity": 2,
      "price": 150.00
    }
  ],
  "shippingAddress": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zip": "10001",
    "country": "USA"
  },
  "paymentMethod": "stripe"
}

Response 201:
{
  "success": true,
  "data": {
    "orderId": 1,
    "orderNumber": "ORD-2024-001",
    "totalAmount": 300.00,
    "status": "pending",
    "items": [ ... ],
    "createdAt": "2024-01-15T10:30:00Z"
  },
  "message": "Order created successfully"
}
```

#### 2. Get Customer's Orders (Customer Only, Requires Auth)
```
GET /orders?page=1&per_page=20&status=pending
Authorization: Bearer {token}

Response 200:
{
  "success": true,
  "data": { ... paginated orders }
}
```

#### 3. Get Order Details (Requires Auth)
```
GET /orders/:id
Authorization: Bearer {token}

Response 200:
{
  "success": true,
  "data": {
    "id": 1,
    "orderNumber": "ORD-2024-001",
    "customer": { ... },
    "vendor": { ... },
    "items": [ ... ],
    "totalAmount": 300.00,
    "status": "pending",
    "shippingAddress": { ... }
  }
}
```

#### 4. Cancel Order (Customer Only, Requires Auth)
```
PUT /orders/:id/cancel
Authorization: Bearer {token}

Response 200:
{
  "success": true,
  "data": { ... updated order },
  "message": "Order cancelled successfully"
}
```

#### 5. Update Order Status (Vendor Only, Requires Auth)
```
PUT /orders/:id/status
Authorization: Bearer {token}
Content-Type: application/json

{
  "status": "shipped",
  "trackingNumber": "TRACK-123456"
}

Response 200:
{
  "success": true,
  "data": { ... updated order },
  "message": "Order status updated successfully"
}
```

#### 6. Get Vendor's Orders (Vendor Only, Requires Auth)
```
GET /orders/vendor/orders?page=1&per_page=20&status=pending
Authorization: Bearer {token}

Response 200:
{
  "success": true,
  "data": { ... paginated vendor orders }
}
```

---

### Cart Endpoints

#### 1. Get Cart (Requires Auth)
```
GET /cart
Authorization: Bearer {token}

Response 200:
{
  "success": true,
  "data": {
    "id": 1,
    "items": [
      {
        "id": 1,
        "productId": 1,
        "quantity": 2,
        "product": { ... }
      }
    ]
  }
}
```

#### 2. Get Cart Summary (Requires Auth)
```
GET /cart/summary
Authorization: Bearer {token}

Response 200:
{
  "success": true,
  "data": {
    "itemCount": 5,
    "subtotal": 500.00,
    "discountAmount": 50.00,
    "taxAmount": 45.00,
    "total": 495.00,
    "items": [ ... ]
  }
}
```

#### 3. Add to Cart (Requires Auth)
```
POST /cart/items
Authorization: Bearer {token}
Content-Type: application/json

{
  "productId": 1,
  "quantity": 2
}

Response 200:
{
  "success": true,
  "data": { ... updated cart },
  "message": "Product added to cart"
}
```

#### 4. Update Cart Item Quantity (Requires Auth)
```
PUT /cart/items/:cartItemId
Authorization: Bearer {token}
Content-Type: application/json

{
  "quantity": 5
}

Response 200:
{
  "success": true,
  "data": { ... updated cart },
  "message": "Quantity updated"
}
```

#### 5. Remove from Cart (Requires Auth)
```
DELETE /cart/items/:cartItemId
Authorization: Bearer {token}

Response 200:
{
  "success": true,
  "data": { ... updated cart },
  "message": "Product removed from cart"
}
```

#### 6. Clear Cart (Requires Auth)
```
DELETE /cart
Authorization: Bearer {token}

Response 200:
{
  "success": true,
  "message": "Cart cleared successfully"
}
```

---

### Review Endpoints

#### 1. Create Review (Requires Auth)
```
POST /reviews/products/:productId
Authorization: Bearer {token}
Content-Type: application/json

{
  "rating": 5,
  "title": "Amazing product!",
  "comment": "This is the best artwork I've purchased..."
}

Response 201:
{
  "success": true,
  "data": {
    "id": 1,
    "productId": 1,
    "rating": 5,
    "title": "Amazing product!",
    "comment": "...",
    "createdAt": "2024-01-15T10:30:00Z"
  },
  "message": "Review created successfully"
}
```

#### 2. Get Product Reviews
```
GET /reviews/products/:productId?page=1&per_page=10

Response 200:
{
  "success": true,
  "data": {
    "items": [ ... reviews ],
    "pagination": { ... }
  }
}
```

#### 3. Update Review (Requires Auth)
```
PUT /reviews/:reviewId
Authorization: Bearer {token}
Content-Type: application/json

{
  "rating": 4,
  "comment": "Updated review content"
}

Response 200:
{
  "success": true,
  "data": { ... updated review },
  "message": "Review updated successfully"
}
```

#### 4. Delete Review (Requires Auth)
```
DELETE /reviews/:reviewId
Authorization: Bearer {token}

Response 200:
{
  "success": true,
  "message": "Review deleted successfully"
}
```

#### 5. Mark Review as Helpful
```
POST /reviews/:reviewId/helpful

Response 200:
{
  "success": true,
  "data": { ... updated review with new helpful count },
  "message": "Marked as helpful"
}
```

---

### Vendor Endpoints

#### 1. Register as Vendor
```
POST /vendors/register
Content-Type: application/json

{
  "businessName": "Artisan Crafts",
  "email": "vendor@example.com",
  "password": "password123",
  "phone": "+1234567890",
  "address": "123 Business St",
  "taxId": "TAX-123456"
}

Response 201:
{
  "success": true,
  "data": { ... vendor data },
  "message": "Vendor registration submitted"
}
```

#### 2. Get All Vendors
```
GET /vendors?page=1&per_page=20&status=approved

Query Parameters:
- status: pending, approved, rejected, suspended

Response 200:
{
  "success": true,
  "data": { ... paginated vendors }
}
```

#### 3. Get Vendor Details
```
GET /vendors/:id

Response 200:
{
  "success": true,
  "data": {
    "id": 1,
    "businessName": "...",
    "status": "approved",
    "rating": 4.5,
    "products": [ ... ],
    "stats": { ... }
  }
}
```

#### 4. Update Vendor Profile (Vendor Only, Requires Auth)
```
PUT /vendors
Authorization: Bearer {token}
Content-Type: application/json

{
  "businessName": "Updated Name",
  "phone": "+1234567891"
}

Response 200:
{
  "success": true,
  "data": { ... updated vendor },
  "message": "Vendor updated successfully"
}
```

#### 5. Get Vendor Stats (Vendor Only, Requires Auth)
```
GET /vendors/stats
Authorization: Bearer {token}

Response 200:
{
  "success": true,
  "data": {
    "totalProducts": 25,
    "totalOrders": 100,
    "totalRevenue": 5000.00,
    "totalReviews": 50,
    "averageRating": 4.5
  }
}
```

#### 6. Approve Vendor (Admin Only, Requires Auth)
```
PUT /vendors/:id/approve
Authorization: Bearer {token}

Response 200:
{
  "success": true,
  "message": "Vendor approved successfully"
}
```

#### 7. Reject Vendor (Admin Only, Requires Auth)
```
PUT /vendors/:id/reject
Authorization: Bearer {token}
Content-Type: application/json

{
  "reason": "Documents not verified"
}

Response 200:
{
  "success": true,
  "message": "Vendor rejected"
}
```

#### 8. Suspend Vendor (Admin Only, Requires Auth)
```
PUT /vendors/:id/suspend
Authorization: Bearer {token}
Content-Type: application/json

{
  "reason": "Violation of terms"
}

Response 200:
{
  "success": true,
  "message": "Vendor suspended"
}
```

#### 9. Update Commission Rate (Admin Only, Requires Auth)
```
PUT /vendors/:id/commission
Authorization: Bearer {token}
Content-Type: application/json

{
  "commissionRate": 15
}

Response 200:
{
  "success": true,
  "message": "Commission rate updated successfully"
}
```

---

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "message": "Error description",
  "statusCode": 400,
  "code": "VALIDATION_ERROR"
}
```

### Common Error Codes

| Status | Code | Message |
|--------|------|---------|
| 400 | VALIDATION_ERROR | Invalid request parameters |
| 401 | UNAUTHORIZED | Authentication required or invalid token |
| 403 | FORBIDDEN | Access denied |
| 404 | NOT_FOUND | Resource not found |
| 409 | CONFLICT | Resource already exists |
| 500 | SERVER_ERROR | Internal server error |

---

## Testing the API

### Using cURL

```bash
# Register
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@example.com","password":"pass123","userType":"customer"}'

# Login
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"john@example.com","password":"pass123"}'

# Get Products
curl -X GET "http://localhost:5000/api/v1/products?page=1&per_page=10"
```

### Using Postman

1. Import the API collection from `/docs/postman-collection.json`
2. Set the base URL to `http://localhost:5000/api/v1`
3. For authenticated endpoints, use the token from login response in the Authorization header

---

## Rate Limiting

The API implements rate limiting to prevent abuse:
- 100 requests per 15 minutes per IP address
- 1000 requests per hour per authenticated user

---

## CORS

CORS is enabled for the following origins (configurable in .env):
- `http://localhost:3000` (Admin panel)
- `http://localhost:3001` (User app)
- `http://localhost:3002` (Vendor app)

---

## Database Schema

See [DATABASE_SCHEMA.md](../docs/DATABASE_SCHEMA.md) for complete schema information.
