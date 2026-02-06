# Vendor Payout API Documentation

## Overview
The Vendor Payout API provides endpoints for managing vendor payouts, commission calculations, and bank account management. This API handles the complete payout workflow from calculation to processing.

## Base URL
```
https://api.artandcraft.com/api/v1
```

## Authentication
All endpoints require authentication via JWT token in the `Authorization` header:
```
Authorization: Bearer <jwt_token>
```

---

## Payout Endpoints

### 1. Calculate Payout
Calculate the payout amount for a vendor in a specific period.

**Endpoint:** `POST /payouts/calculate`

**Auth Required:** Yes (Vendor)

**Request Body:**
```json
{
  "startDate": "2024-01-01T00:00:00Z",
  "endDate": "2024-01-31T23:59:59Z"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "totalSales": 5000.00,
    "totalOrders": 10,
    "commissionRate": 5,
    "commissionAmount": 250.00,
    "payoutAmount": 4750.00,
    "deductions": 0
  }
}
```

**Error Responses:**
- `400 Bad Request` - Missing startDate or endDate
- `404 Not Found` - Vendor not found

---

### 2. Request Payout
Create a new payout request.

**Endpoint:** `POST /payouts`

**Auth Required:** Yes (Vendor)

**Request Body:**
```json
{
  "startDate": "2024-01-01T00:00:00Z",
  "endDate": "2024-01-31T23:59:59Z",
  "notes": "January payout request"
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": 1,
    "vendorId": 5,
    "payoutNumber": "PAY-20240101ABC",
    "amount": 4750.00,
    "period": "2024-01",
    "startDate": "2024-01-01T00:00:00Z",
    "endDate": "2024-01-31T23:59:59Z",
    "status": "pending",
    "totalSales": 5000.00,
    "totalOrders": 10,
    "commissionRate": 5,
    "commissionAmount": 250.00,
    "bankAccountId": 1,
    "createdAt": "2024-01-31T12:00:00Z",
    "updatedAt": "2024-01-31T12:00:00Z"
  },
  "message": "Payout request created successfully"
}
```

**Error Responses:**
- `400 Bad Request` - Missing required fields
- `400 Bad Request` - Duplicate payout for same period
- `404 Not Found` - Vendor not found
- `409 Conflict` - No verified bank account

---

### 3. Get Vendor Payouts
Retrieve paginated list of payouts for the authenticated vendor.

**Endpoint:** `GET /payouts`

**Auth Required:** Yes (Vendor)

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `per_page` (optional): Items per page (default: 20)
- `status` (optional): Filter by status (pending, processing, completed, failed, cancelled)

**Example Request:**
```
GET /payouts?page=1&per_page=10&status=completed
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "payouts": [
      {
        "id": 1,
        "payoutNumber": "PAY-20240101ABC",
        "amount": 4750.00,
        "period": "2024-01",
        "status": "completed",
        "totalSales": 5000.00,
        "totalOrders": 10,
        "commissionAmount": 250.00,
        "processedAt": "2024-02-05T10:00:00Z",
        "createdAt": "2024-01-31T12:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "perPage": 10,
      "total": 5,
      "totalPages": 1
    }
  }
}
```

---

### 4. Get All Payouts (Admin)
Retrieve all payouts with optional filtering.

**Endpoint:** `GET /payouts/all`

**Auth Required:** Yes (Admin only)

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `per_page` (optional): Items per page (default: 20)
- `status` (optional): Filter by status
- `vendorId` (optional): Filter by vendor ID

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "payouts": [
      {
        "id": 1,
        "vendorId": 5,
        "payoutNumber": "PAY-20240101ABC",
        "amount": 4750.00,
        "period": "2024-01",
        "status": "completed",
        "vendor": {
          "id": 5,
          "storeName": "Artisan Crafts"
        },
        "createdAt": "2024-01-31T12:00:00Z"
      }
    ],
    "pagination": {
      "page": 1,
      "perPage": 20,
      "total": 50,
      "totalPages": 3
    }
  }
}
```

---

### 5. Get Payout Details
Retrieve detailed information about a specific payout.

**Endpoint:** `GET /payouts/:payoutId`

**Auth Required:** Yes

**URL Parameters:**
- `payoutId`: ID of the payout

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": 1,
    "vendorId": 5,
    "payoutNumber": "PAY-20240101ABC",
    "amount": 4750.00,
    "period": "2024-01",
    "startDate": "2024-01-01T00:00:00Z",
    "endDate": "2024-01-31T23:59:59Z",
    "status": "completed",
    "totalSales": 5000.00,
    "totalOrders": 10,
    "commissionRate": 5,
    "commissionAmount": 250.00,
    "deductions": 0,
    "deductionReasons": [],
    "bankAccountId": 1,
    "bankAccount": {
      "id": 1,
      "accountHolderName": "John Doe",
      "bankName": "Chase Bank",
      "accountNumber": "****5678",
      "accountType": "checking",
      "isVerified": true
    },
    "transactionId": "TXN-123456789",
    "processedAt": "2024-02-05T10:00:00Z",
    "processedBy": 1,
    "createdAt": "2024-01-31T12:00:00Z",
    "updatedAt": "2024-02-05T10:00:00Z"
  }
}
```

---

### 6. Update Payout Status (Admin)
Update the status of a payout request.

**Endpoint:** `PUT /payouts/:payoutId/status`

**Auth Required:** Yes (Admin only)

**URL Parameters:**
- `payoutId`: ID of the payout

**Request Body:**
```json
{
  "status": "completed",
  "transactionId": "TXN-123456789",
  "failureReason": null
}
```

**Allowed Status Transitions:**
- `pending` → `processing`, `cancelled`
- `processing` → `completed`, `failed`, `cancelled`
- `completed` → (terminal state)
- `failed` → `cancelled`
- `cancelled` → (terminal state)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": 1,
    "status": "completed",
    "transactionId": "TXN-123456789",
    "processedAt": "2024-02-05T10:00:00Z",
    "processedBy": 1
  },
  "message": "Payout status updated successfully"
}
```

**Error Responses:**
- `400 Bad Request` - Invalid status transition
- `404 Not Found` - Payout not found

---

### 7. Add Deduction to Payout (Admin)
Add a deduction to a pending payout.

**Endpoint:** `POST /payouts/:payoutId/deductions`

**Auth Required:** Yes (Admin only)

**URL Parameters:**
- `payoutId`: ID of the payout

**Request Body:**
```json
{
  "amount": 100.00,
  "reason": "Tax withholding"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": 1,
    "amount": 4650.00,
    "deductions": 100.00,
    "deductionReasons": ["Tax withholding"]
  },
  "message": "Deduction added successfully"
}
```

**Error Responses:**
- `400 Bad Request` - Payout not in pending status
- `400 Bad Request` - Deduction would make amount negative
- `404 Not Found` - Payout not found

---

### 8. Cancel Payout
Cancel a payout request.

**Endpoint:** `PUT /payouts/:payoutId/cancel`

**Auth Required:** Yes (Vendor or Admin)

**URL Parameters:**
- `payoutId`: ID of the payout

**Request Body:**
```json
{
  "reason": "Incorrect bank details"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": 1,
    "status": "cancelled"
  },
  "message": "Payout cancelled successfully"
}
```

**Error Responses:**
- `400 Bad Request` - Cannot cancel completed or processing payout
- `404 Not Found` - Payout not found

---

### 9. Get Payout Statistics
Get statistics about vendor payouts.

**Endpoint:** `GET /payouts/stats`

**Auth Required:** Yes (Vendor)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "totalPayouts": 12,
    "totalPaidOut": 45000.00,
    "totalPending": 5000.00,
    "totalProcessing": 2500.00,
    "averagePayoutAmount": 3750.00,
    "lastPayoutDate": "2024-02-05T10:00:00Z",
    "payoutsByStatus": {
      "completed": 10,
      "pending": 1,
      "processing": 1,
      "failed": 0,
      "cancelled": 0
    }
  }
}
```

---

## Bank Account Endpoints

### 1. Add Bank Account
Add a new bank account for the vendor.

**Endpoint:** `POST /bank-accounts`

**Auth Required:** Yes (Vendor)

**Request Body:**
```json
{
  "accountHolderName": "John Doe",
  "bankName": "Chase Bank",
  "accountNumber": "123456789012",
  "routingNumber": "021000021",
  "accountType": "checking",
  "currency": "USD",
  "swiftCode": "CHASUS33",
  "ibanCode": null
}
```

**Response:** `201 Created`
```json
{
  "success": true,
  "data": {
    "id": 1,
    "vendorId": 5,
    "accountHolderName": "John Doe",
    "bankName": "Chase Bank",
    "accountNumber": "****6789",
    "accountType": "checking",
    "currency": "USD",
    "isVerified": false,
    "isActive": true,
    "createdAt": "2024-01-31T12:00:00Z"
  },
  "message": "Bank account added successfully"
}
```

**Validation:**
- Account number must be 8-20 characters
- Account type must be 'checking' or 'savings'
- Currency must be a valid 3-letter code

**Error Responses:**
- `400 Bad Request` - Missing required fields
- `400 Bad Request` - Duplicate account for this vendor

---

### 2. Get Bank Accounts
Retrieve all bank accounts for the authenticated vendor.

**Endpoint:** `GET /bank-accounts`

**Auth Required:** Yes (Vendor)

**Response:** `200 OK`
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "accountHolderName": "John Doe",
      "bankName": "Chase Bank",
      "accountNumber": "****6789",
      "accountType": "checking",
      "currency": "USD",
      "isVerified": true,
      "isActive": true,
      "verificationDate": "2024-02-01T10:00:00Z",
      "createdAt": "2024-01-31T12:00:00Z"
    }
  ]
}
```

---

### 3. Get Bank Account Details
Retrieve details for a specific bank account.

**Endpoint:** `GET /bank-accounts/:accountId`

**Auth Required:** Yes (Vendor)

**URL Parameters:**
- `accountId`: ID of the bank account

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": 1,
    "accountHolderName": "John Doe",
    "bankName": "Chase Bank",
    "accountNumber": "****6789",
    "routingNumber": "****0021",
    "accountType": "checking",
    "currency": "USD",
    "swiftCode": "CHASUS33",
    "ibanCode": null,
    "isVerified": true,
    "isActive": true,
    "verificationDate": "2024-02-01T10:00:00Z",
    "createdAt": "2024-01-31T12:00:00Z"
  }
}
```

---

### 4. Update Bank Account
Update bank account details.

**Endpoint:** `PUT /bank-accounts/:accountId`

**Auth Required:** Yes (Vendor)

**URL Parameters:**
- `accountId`: ID of the bank account

**Request Body:**
```json
{
  "accountHolderName": "John Doe Jr.",
  "swiftCode": "CHASUS33"
}
```

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": 1,
    "accountHolderName": "John Doe Jr.",
    "bankName": "Chase Bank",
    "accountNumber": "****6789",
    "swiftCode": "CHASUS33",
    "isVerified": true,
    "updatedAt": "2024-02-10T10:00:00Z"
  },
  "message": "Bank account updated successfully"
}
```

**Error Responses:**
- `404 Not Found` - Account not found
- `403 Forbidden` - Vendor does not own this account

---

### 5. Set Primary Bank Account
Set a bank account as the primary account for payouts.

**Endpoint:** `PUT /bank-accounts/:accountId/primary`

**Auth Required:** Yes (Vendor)

**URL Parameters:**
- `accountId`: ID of the bank account

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": 1,
    "accountHolderName": "John Doe",
    "isActive": true,
    "message": "This account is now set as primary"
  },
  "message": "Primary bank account set successfully"
}
```

**Note:** Setting an account as primary will deactivate all other accounts.

---

### 6. Delete Bank Account
Delete a bank account.

**Endpoint:** `DELETE /bank-accounts/:accountId`

**Auth Required:** Yes (Vendor)

**URL Parameters:**
- `accountId`: ID of the bank account

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "deleted": true
  },
  "message": "Bank account deleted successfully"
}
```

**Error Responses:**
- `404 Not Found` - Account not found
- `403 Forbidden` - Vendor does not own this account
- `400 Bad Request` - Cannot delete account with active payouts

---

### 7. Verify Bank Account (Admin)
Verify a bank account for use in payouts.

**Endpoint:** `PUT /bank-accounts/:accountId/verify`

**Auth Required:** Yes (Admin only)

**URL Parameters:**
- `accountId`: ID of the bank account

**Response:** `200 OK`
```json
{
  "success": true,
  "data": {
    "id": 1,
    "accountHolderName": "John Doe",
    "bankName": "Chase Bank",
    "isVerified": true,
    "verificationDate": "2024-02-10T10:00:00Z"
  },
  "message": "Bank account verified successfully"
}
```

**Error Responses:**
- `404 Not Found` - Account not found

---

## Error Handling

All error responses follow this format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message"
  }
}
```

### Common Error Codes
- `VENDOR_NOT_FOUND` - Vendor does not exist
- `PAYOUT_NOT_FOUND` - Payout request not found
- `ACCOUNT_NOT_FOUND` - Bank account not found
- `INVALID_STATUS_TRANSITION` - Status change is not allowed
- `DUPLICATE_PAYOUT` - Payout already exists for this period
- `UNVERIFIED_ACCOUNT` - Bank account not verified
- `UNAUTHORIZED` - User does not have permission
- `VALIDATION_ERROR` - Input validation failed

---

## Status Workflow

### Payout Status Flow
```
pending
  ├─→ processing
  │    ├─→ completed (final)
  │    ├─→ failed
  │    │    └─→ cancelled (final)
  │    └─→ cancelled (final)
  └─→ cancelled (final)
```

### Bank Account Status
- `isVerified: false` - Awaiting admin verification
- `isVerified: true` - Approved for use in payouts
- `isActive: true` - Currently active (only one per vendor)
- `isActive: false` - Inactive/replaced

---

## Rate Limiting

- 100 requests per minute per authenticated user
- 10 requests per minute per IP for authentication endpoints

---

## Examples

### Example 1: Create and Process a Payout

1. **Calculate payout:**
```bash
curl -X POST https://api.artandcraft.com/api/v1/payouts/calculate \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "startDate": "2024-01-01T00:00:00Z",
    "endDate": "2024-01-31T23:59:59Z"
  }'
```

2. **Request payout:**
```bash
curl -X POST https://api.artandcraft.com/api/v1/payouts \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "startDate": "2024-01-01T00:00:00Z",
    "endDate": "2024-01-31T23:59:59Z",
    "notes": "January payout"
  }'
```

3. **Admin updates status:**
```bash
curl -X PUT https://api.artandcraft.com/api/v1/payouts/1/status \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "completed",
    "transactionId": "TXN-123456789"
  }'
```

### Example 2: Add and Verify Bank Account

1. **Vendor adds bank account:**
```bash
curl -X POST https://api.artandcraft.com/api/v1/bank-accounts \
  -H "Authorization: Bearer <vendor_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "accountHolderName": "John Doe",
    "bankName": "Chase Bank",
    "accountNumber": "123456789012",
    "routingNumber": "021000021",
    "accountType": "checking",
    "currency": "USD"
  }'
```

2. **Admin verifies account:**
```bash
curl -X PUT https://api.artandcraft.com/api/v1/bank-accounts/1/verify \
  -H "Authorization: Bearer <admin_token>"
```

3. **Vendor sets as primary:**
```bash
curl -X PUT https://api.artandcraft.com/api/v1/bank-accounts/1/primary \
  -H "Authorization: Bearer <vendor_token>"
```

---

## Pagination

List endpoints support pagination with the following parameters:
- `page`: Current page number (starts at 1)
- `per_page`: Items per page (default: 20, max: 100)

Response includes pagination metadata:
```json
{
  "pagination": {
    "page": 1,
    "perPage": 20,
    "total": 100,
    "totalPages": 5
  }
}
```
