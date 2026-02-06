# Vendor Payout System - Quick Reference

## Implementation Complete ✅

All components of the Vendor Payout system have been successfully integrated into the Art & Craft Platform backend.

---

## What's Been Added

### 1. Database Models (2)
- **VendorPayout** - Tracks payout requests and processing
- **VendorBankAccount** - Manages vendor bank account information

### 2. Services (2)
- **VendorPayoutService** - 9 methods for payout management
- **VendorBankAccountService** - 8 methods for account management

### 3. Controllers (1)
- **PayoutController** - 15 endpoints for payout and bank account operations

### 4. Routes (1)
- **PayoutRoutes** - Setup functions for payout and bank account routes

### 5. Documentation (2)
- **PAYOUT_API_DOCUMENTATION.md** - Complete API endpoint documentation
- **IMPLEMENTATION_SUMMARY.md** - Technical implementation details

---

## Key Features

### Payout Management
- ✅ Calculate payouts based on sales and commission rates
- ✅ Request payouts for specific periods
- ✅ Track payout status (pending → processing → completed)
- ✅ Add deductions and adjustments
- ✅ Cancel payouts with reasons
- ✅ Generate payout statistics and reports

### Bank Account Management
- ✅ Add multiple bank accounts per vendor
- ✅ Verify accounts through admin approval
- ✅ Set primary account for payouts
- ✅ Update and delete accounts
- ✅ International banking support (SWIFT, IBAN)

### Security
- ✅ Vendor ownership validation
- ✅ Role-based access control (vendor/admin)
- ✅ Account number masking in responses
- ✅ Audit trail with admin tracking
- ✅ Prevention of negative payouts

---

## API Endpoints (15 Total)

### Payout Endpoints
```
POST   /api/v1/payouts/calculate         Calculate payout amount
POST   /api/v1/payouts                   Request payout
GET    /api/v1/payouts                   Get vendor payouts
GET    /api/v1/payouts/stats             Get payout statistics
GET    /api/v1/payouts/:payoutId         Get payout details
GET    /api/v1/payouts/all               Get all payouts (admin)
PUT    /api/v1/payouts/:payoutId/status  Update status (admin)
POST   /api/v1/payouts/:payoutId/deductions Add deductions (admin)
PUT    /api/v1/payouts/:payoutId/cancel  Cancel payout
```

### Bank Account Endpoints
```
POST   /api/v1/bank-accounts             Add bank account
GET    /api/v1/bank-accounts             Get vendor accounts
GET    /api/v1/bank-accounts/:accountId  Get account details
PUT    /api/v1/bank-accounts/:accountId  Update account
PUT    /api/v1/bank-accounts/:accountId/primary  Set primary
DELETE /api/v1/bank-accounts/:accountId  Delete account
PUT    /api/v1/bank-accounts/:accountId/verify   Verify (admin)
```

---

## Database Schema

### VendorPayout Table
```sql
CREATE TABLE VendorPayouts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  vendorId INT NOT NULL,
  payoutNumber VARCHAR(255) UNIQUE NOT NULL,
  amount DECIMAL(12, 2) NOT NULL,
  period VARCHAR(7) NOT NULL,
  startDate DATETIME NOT NULL,
  endDate DATETIME NOT NULL,
  status ENUM('pending', 'processing', 'completed', 'failed', 'cancelled'),
  totalSales DECIMAL(12, 2),
  totalOrders INT,
  commissionRate DECIMAL(5, 2),
  commissionAmount DECIMAL(12, 2),
  deductions DECIMAL(12, 2) DEFAULT 0,
  deductionReasons JSON,
  bankAccountId INT,
  transactionId VARCHAR(255),
  processedAt DATETIME,
  failureReason TEXT,
  createdBy INT,
  processedBy INT,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (vendorId) REFERENCES Vendors(id),
  FOREIGN KEY (bankAccountId) REFERENCES VendorBankAccounts(id),
  INDEX (vendorId),
  INDEX (status),
  INDEX (period),
  INDEX (createdAt)
);
```

### VendorBankAccount Table
```sql
CREATE TABLE VendorBankAccounts (
  id INT PRIMARY KEY AUTO_INCREMENT,
  vendorId INT NOT NULL,
  accountHolderName VARCHAR(255) NOT NULL,
  bankName VARCHAR(255) NOT NULL,
  accountNumber VARCHAR(20) NOT NULL,
  routingNumber VARCHAR(20),
  accountType ENUM('checking', 'savings'),
  swiftCode VARCHAR(11),
  ibanCode VARCHAR(34),
  currency VARCHAR(3) DEFAULT 'USD',
  isVerified BOOLEAN DEFAULT FALSE,
  verificationDate DATETIME,
  isActive BOOLEAN DEFAULT TRUE,
  createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (vendorId) REFERENCES Vendors(id) ON DELETE CASCADE,
  UNIQUE KEY (vendorId, accountNumber),
  INDEX (vendorId),
  INDEX (isActive)
);
```

---

## File Locations

```
backend-api/
├── src/
│   ├── controllers/
│   │   └── payoutController.js         ← 15 endpoint handlers
│   ├── models/
│   │   ├── VendorPayout.js             ← Payout model
│   │   ├── VendorBankAccount.js        ← Bank account model
│   │   └── index.js                    ← Updated with new models
│   ├── services/
│   │   ├── vendorPayoutService.js      ← Payout business logic
│   │   └── vendorBankAccountService.js ← Account management logic
│   └── routes/
│       ├── payoutRoutes.js             ← Route definitions
│       └── index.js                    ← Updated with payout routes
├── PAYOUT_API_DOCUMENTATION.md         ← Full API reference
├── IMPLEMENTATION_SUMMARY.md           ← Technical details
└── QUICK_REFERENCE.md                  ← This file
```

---

## Testing the Implementation

### Step 1: Add a Bank Account (Vendor)
```bash
curl -X POST http://localhost:3000/api/v1/bank-accounts \
  -H "Authorization: Bearer <vendor_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "accountHolderName": "John Doe",
    "bankName": "Chase Bank",
    "accountNumber": "123456789012",
    "routingNumber": "021000021",
    "accountType": "checking"
  }'
```

### Step 2: Verify Account (Admin)
```bash
curl -X PUT http://localhost:3000/api/v1/bank-accounts/1/verify \
  -H "Authorization: Bearer <admin_token>"
```

### Step 3: Calculate Payout (Vendor)
```bash
curl -X POST http://localhost:3000/api/v1/payouts/calculate \
  -H "Authorization: Bearer <vendor_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "startDate": "2024-01-01T00:00:00Z",
    "endDate": "2024-01-31T23:59:59Z"
  }'
```

### Step 4: Request Payout (Vendor)
```bash
curl -X POST http://localhost:3000/api/v1/payouts \
  -H "Authorization: Bearer <vendor_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "startDate": "2024-01-01T00:00:00Z",
    "endDate": "2024-01-31T23:59:59Z",
    "notes": "January payout"
  }'
```

### Step 5: Process Payout (Admin)
```bash
curl -X PUT http://localhost:3000/api/v1/payouts/1/status \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "processing"
  }'
```

### Step 6: Complete Payout (Admin)
```bash
curl -X PUT http://localhost:3000/api/v1/payouts/1/status \
  -H "Authorization: Bearer <admin_token>" \
  -H "Content-Type: application/json" \
  -d '{
    "status": "completed",
    "transactionId": "TXN-123456789"
  }'
```

---

## Status Workflow

```
                    ┌─→ Processing
                    │       ├─→ Completed (terminal)
                    │       ├─→ Failed
Pending ────────────┤       │   └─→ Cancelled (terminal)
        └─→ Cancelled       └─→ Cancelled (terminal)
            (terminal)
```

---

## Business Rules

### Payout Calculation
- Formula: `Payout = Total Sales - Commission - Deductions`
- Commission Rate: Set per vendor in Vendor profile
- Commission: `Total Sales × (Commission Rate / 100)`

### Payout Period
- Format: YYYY-MM (e.g., "2024-01")
- One payout per vendor per period
- Prevents duplicate requests

### Bank Account Verification
- Vendors can add multiple accounts
- Only verified accounts can receive payouts
- Only one account can be active at a time

### Deductions
- Can only be added to pending payouts
- Admin approval required
- Cannot result in negative payout amount

---

## Error Codes

| Code | HTTP | Description |
|------|------|-------------|
| VENDOR_NOT_FOUND | 404 | Vendor doesn't exist |
| PAYOUT_NOT_FOUND | 404 | Payout not found |
| ACCOUNT_NOT_FOUND | 404 | Bank account not found |
| INVALID_STATUS_TRANSITION | 400 | Status change not allowed |
| DUPLICATE_PAYOUT | 400 | Payout exists for period |
| UNVERIFIED_ACCOUNT | 409 | Account not verified |
| UNAUTHORIZED | 403 | Insufficient permissions |
| VALIDATION_ERROR | 400 | Invalid input |

---

## Next Steps

1. **Database Setup**
   - Run migrations: `npm run migrate`
   - Ensure tables are created properly

2. **Testing**
   - Test all endpoints with provided examples
   - Verify pagination works correctly
   - Test authorization on admin endpoints

3. **Integration**
   - Update frontend to use new endpoints
   - Create vendor payout dashboard
   - Create admin payout management interface

4. **Deployment**
   - Deploy to staging environment
   - Run comprehensive tests
   - Deploy to production

---

## Support

For questions or issues:
1. Check PAYOUT_API_DOCUMENTATION.md for detailed endpoint docs
2. Review IMPLEMENTATION_SUMMARY.md for technical details
3. Refer to service files for business logic
4. Check error codes and responses for troubleshooting

---

**Status:** ✅ Implementation Complete
**Date:** 2024
**Components:** 2 Models + 2 Services + 1 Controller + 1 Routes + 2 Documentation
**Endpoints:** 15 total (9 payout + 6 bank account)
**Ready for:** Testing & Deployment
