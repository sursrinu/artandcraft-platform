# Vendor Payout System - Implementation Summary

## Overview
The Vendor Payout System has been successfully integrated into the Art & Craft Platform backend. This comprehensive system enables vendors to request payouts based on their sales, with admin controls for processing and verification.

## Database Models

### 1. VendorPayout Model
**Location:** `src/models/VendorPayout.js`

**Purpose:** Track all vendor payouts with commission calculations and payment status.

**Key Fields:**
- `id` (INTEGER, Primary Key)
- `vendorId` (INTEGER, Foreign Key to Vendor)
- `payoutNumber` (STRING, Unique identifier format: PAY-XXXXXXXX)
- `amount` (DECIMAL(12,2), Net payout after commissions)
- `period` (STRING, YYYY-MM format)
- `startDate` / `endDate` (DATE, Period boundaries)
- `status` (ENUM: pending, processing, completed, failed, cancelled)
- `totalSales` (DECIMAL(12,2), Sales for period)
- `totalOrders` (INTEGER, Number of orders)
- `commissionRate` (DECIMAL(5,2), Commission percentage)
- `commissionAmount` (DECIMAL(12,2), Calculated commission)
- `deductions` (DECIMAL(12,2), Total deductions)
- `deductionReasons` (JSON, Array of deduction reasons)
- `bankAccountId` (INTEGER, Foreign Key to VendorBankAccount)
- `transactionId` (STRING, External payment gateway reference)
- `processedAt` (DATE, When payout was processed)
- `failureReason` (TEXT, Reason if payout failed)
- `createdBy` (INTEGER, Admin who created payout)
- `processedBy` (INTEGER, Admin who processed payout)
- `createdAt` / `updatedAt` (TIMESTAMP)

**Indexes:**
- vendorId (for vendor lookup)
- status (for status filtering)
- period (for period-based queries)
- createdAt (for date-based sorting)

**Associations:**
- `belongsTo(Vendor)`
- `belongsTo(VendorBankAccount)`

---

### 2. VendorBankAccount Model
**Location:** `src/models/VendorBankAccount.js`

**Purpose:** Store and manage vendor bank account information for receiving payouts.

**Key Fields:**
- `id` (INTEGER, Primary Key)
- `vendorId` (INTEGER, Foreign Key to Vendor)
- `accountHolderName` (STRING, Account owner name)
- `bankName` (STRING, Name of the bank)
- `accountNumber` (STRING, 8-20 characters, masked in responses)
- `routingNumber` (STRING, US bank routing number)
- `accountType` (ENUM: checking, savings)
- `swiftCode` (STRING, International banking SWIFT code)
- `ibanCode` (STRING, International banking IBAN)
- `currency` (STRING, 3-letter currency code, default USD)
- `isVerified` (BOOLEAN, Admin verification status)
- `verificationDate` (DATE, When verified by admin)
- `isActive` (BOOLEAN, Current active account flag)
- `createdAt` / `updatedAt` (TIMESTAMP)

**Constraints:**
- Unique constraint on (vendorId, accountNumber)
- Only one active account per vendor

**Associations:**
- `belongsTo(Vendor)`
- `hasMany(VendorPayout)`

---

## Services

### 1. VendorPayoutService
**Location:** `src/services/vendorPayoutService.js`

**Methods:**

1. **calculatePayoutForVendor(vendorId, startDate, endDate)**
   - Calculates payout amount for vendor in a period
   - Returns: totalSales, totalOrders, commissionRate, commissionAmount, payoutAmount, deductions
   - Formula: payoutAmount = totalSales - commissionAmount - deductions

2. **createPayout(vendorId, payoutData)**
   - Creates new payout request
   - Validates vendor exists and has verified bank account
   - Prevents duplicate payouts for same period

3. **getVendorPayouts(vendorId, options)**
   - Returns paginated list of vendor payouts
   - Supports filtering by status
   - Options: { page, perPage, status }

4. **getAllPayouts(options)**
   - Admin endpoint to view all payouts
   - Supports filtering by vendorId and status
   - Options: { page, perPage, status, vendorId }

5. **getPayoutById(payoutId)**
   - Returns detailed payout with vendor and bank account info
   - Includes all calculation details

6. **updatePayoutStatus(payoutId, newStatus, adminId, additionalData)**
   - Updates payout status with workflow validation
   - Creates vendor notification on status change
   - Allowed transitions:
     - pending → processing, cancelled
     - processing → completed, failed, cancelled
     - failed → cancelled
     - completed, cancelled (terminal states)

7. **addDeductions(payoutId, amount, reason)**
   - Adds deductions to pending payouts
   - Validates amount doesn't make payout negative
   - Updates deductionReasons array

8. **cancelPayout(payoutId, reason)**
   - Cancels payout with reason
   - Only allows cancellation of pending/processing payouts

9. **getPayoutStats(vendorId)**
   - Returns payout statistics for vendor
   - Includes: totalPayouts, totalPaidOut, totalPending, averageAmount, lastPayoutDate

---

### 2. VendorBankAccountService
**Location:** `src/services/vendorBankAccountService.js`

**Methods:**

1. **addBankAccount(vendorId, accountData)**
   - Creates new bank account for vendor
   - Checks for duplicate accounts
   - Validates account number length (8-20 chars)

2. **getVendorBankAccounts(vendorId)**
   - Lists all bank accounts for vendor
   - Ordered by creation date (newest first)

3. **getBankAccountById(accountId, vendorId)**
   - Retrieves specific account with vendor ownership validation
   - Masks sensitive account number data in response

4. **updateBankAccount(accountId, vendorId, updateData)**
   - Updates account details
   - Validates vendor ownership

5. **verifyBankAccount(accountId)**
   - Admin verification workflow
   - Sets isVerified = true and verificationDate
   - Required before account can be used for payouts

6. **deactivateBankAccount(accountId, vendorId)**
   - Marks account as inactive
   - Doesn't delete, just disables

7. **setPrimaryBankAccount(accountId, vendorId)**
   - Sets account as primary for payouts
   - Deactivates all other vendor accounts

8. **deleteBankAccount(accountId, vendorId)**
   - Deletes bank account
   - Validates no associated payouts exist
   - Vendor ownership check

---

## Controllers

### PayoutController
**Location:** `src/controllers/payoutController.js`

**Endpoints Implemented:**

**Payout Endpoints:**
1. `POST /payouts/calculate` - Calculate payout
2. `POST /payouts` - Request payout
3. `GET /payouts` - Get vendor payouts
4. `GET /payouts/all` - Get all payouts (admin)
5. `GET /payouts/:payoutId` - Get payout details
6. `PUT /payouts/:payoutId/status` - Update status (admin)
7. `POST /payouts/:payoutId/deductions` - Add deductions (admin)
8. `PUT /payouts/:payoutId/cancel` - Cancel payout
9. `GET /payouts/stats` - Get payout statistics

**Bank Account Endpoints:**
1. `POST /bank-accounts` - Add bank account
2. `GET /bank-accounts` - Get vendor accounts
3. `PUT /bank-accounts/:accountId` - Update account
4. `PUT /bank-accounts/:accountId/primary` - Set primary
5. `DELETE /bank-accounts/:accountId` - Delete account
6. `PUT /bank-accounts/:accountId/verify` - Verify account (admin)

---

## Routes

### Payout Routes
**Location:** `src/routes/payoutRoutes.js`

**Base Path:** `/api/v1/payouts`

**Functions:**
- `setupPayoutRoutes(db)` - Initializes payout route handlers
- Routes properly configured with authentication and authorization middleware

### Bank Account Routes
**Base Path:** `/api/v1/bank-accounts`

**Functions:**
- `setupBankAccountRoutes(db)` - Initializes bank account route handlers
- Admin endpoints protected with role-based authorization

**Route Integration:**
- Routes imported and mounted in `src/routes/index.js`
- Properly integrated with existing route structure

---

## API Endpoints Summary

### Payout Management (15 endpoints)
| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/payouts/calculate` | Vendor | Calculate payout for period |
| POST | `/payouts` | Vendor | Request payout |
| GET | `/payouts` | Vendor | Get vendor payouts (paginated) |
| GET | `/payouts/:payoutId` | Vendor/Admin | Get payout details |
| GET | `/payouts/stats` | Vendor | Get payout statistics |
| GET | `/payouts/all` | Admin | Get all payouts (paginated) |
| PUT | `/payouts/:payoutId/status` | Admin | Update payout status |
| POST | `/payouts/:payoutId/deductions` | Admin | Add deductions |
| PUT | `/payouts/:payoutId/cancel` | Vendor/Admin | Cancel payout |
| POST | `/bank-accounts` | Vendor | Add bank account |
| GET | `/bank-accounts` | Vendor | Get vendor accounts |
| GET | `/bank-accounts/:accountId` | Vendor | Get account details |
| PUT | `/bank-accounts/:accountId` | Vendor | Update account |
| PUT | `/bank-accounts/:accountId/primary` | Vendor | Set primary account |
| DELETE | `/bank-accounts/:accountId` | Vendor | Delete account |
| PUT | `/bank-accounts/:accountId/verify` | Admin | Verify account |

---

## Business Logic

### Commission Calculation
```
Commission = Total Sales × (Commission Rate / 100)
Payout Amount = Total Sales - Commission Amount - Deductions
```

### Payout Period Format
- Format: `YYYY-MM` (e.g., "2024-01" for January 2024)
- Prevents duplicate payouts for same period
- Validates start and end dates

### Status Workflow
```
pending
  ├─→ processing
  │    ├─→ completed (final)
  │    ├─→ failed → cancelled (final)
  │    └─→ cancelled (final)
  └─→ cancelled (final)
```

### Bank Account Management
- Vendors can have multiple accounts
- Only one account can be active at a time
- Accounts must be verified by admin before use in payouts
- Account numbers masked in API responses (e.g., ****6789)

### Security Features
- Vendor ownership validation on all operations
- Admin-only verification and processing endpoints
- Audit trail with createdBy/processedBy fields
- No deletion of accounts with active payouts
- Prevented negative payout amounts with deductions

---

## Error Handling

All endpoints implement comprehensive error handling with specific error codes:

- `VENDOR_NOT_FOUND` (404) - Vendor doesn't exist
- `PAYOUT_NOT_FOUND` (404) - Payout not found
- `ACCOUNT_NOT_FOUND` (404) - Bank account not found
- `INVALID_STATUS_TRANSITION` (400) - Invalid status change
- `DUPLICATE_PAYOUT` (400) - Payout exists for period
- `UNVERIFIED_ACCOUNT` (409) - Account not verified
- `UNAUTHORIZED` (403) - Insufficient permissions
- `VALIDATION_ERROR` (400) - Invalid input

---

## File Structure

```
backend-api/
├── src/
│   ├── controllers/
│   │   └── payoutController.js (15 endpoints)
│   ├── models/
│   │   ├── VendorPayout.js
│   │   ├── VendorBankAccount.js
│   │   └── index.js (updated with new models)
│   ├── services/
│   │   ├── vendorPayoutService.js (9 methods)
│   │   └── vendorBankAccountService.js (8 methods)
│   └── routes/
│       ├── payoutRoutes.js
│       └── index.js (updated with payout routes)
├── PAYOUT_API_DOCUMENTATION.md (complete API docs)
└── IMPLEMENTATION_SUMMARY.md
```

---

## Database Migrations

To set up the new tables in your database:

1. Run Sequelize migrations:
```bash
npm run migrate
```

2. The following tables will be created:
   - `VendorPayouts`
   - `VendorBankAccounts`

---

## Testing

### Example Workflow

1. **Vendor adds bank account:**
```bash
POST /api/v1/bank-accounts
Content-Type: application/json
Authorization: Bearer <vendor_token>

{
  "accountHolderName": "John Doe",
  "bankName": "Chase Bank",
  "accountNumber": "123456789012",
  "routingNumber": "021000021",
  "accountType": "checking"
}
```

2. **Admin verifies account:**
```bash
PUT /api/v1/bank-accounts/1/verify
Authorization: Bearer <admin_token>
```

3. **Vendor calculates payout:**
```bash
POST /api/v1/payouts/calculate
Authorization: Bearer <vendor_token>

{
  "startDate": "2024-01-01T00:00:00Z",
  "endDate": "2024-01-31T23:59:59Z"
}
```

4. **Vendor requests payout:**
```bash
POST /api/v1/payouts
Authorization: Bearer <vendor_token>

{
  "startDate": "2024-01-01T00:00:00Z",
  "endDate": "2024-01-31T23:59:59Z"
}
```

5. **Admin processes payout:**
```bash
PUT /api/v1/payouts/1/status
Authorization: Bearer <admin_token>

{
  "status": "processing"
}
```

6. **Admin marks as completed:**
```bash
PUT /api/v1/payouts/1/status
Authorization: Bearer <admin_token>

{
  "status": "completed",
  "transactionId": "TXN-123456789"
}
```

---

## Performance Considerations

### Database Indexes
- Indexes on vendorId, status, period, and createdAt for optimal query performance
- Foreign key indexes for faster joins

### Pagination
- Default page size: 20 items
- Maximum page size: 100 items
- Prevents large data transfers

### Caching Opportunities
- Payout statistics could be cached (update on new payout)
- Vendor commission rates could be cached

---

## Future Enhancements

1. **Payment Gateway Integration**
   - Stripe/PayPal integration for automated payments
   - Webhook handling for payment confirmations

2. **Automated Payouts**
   - Schedule automatic monthly payouts
   - Batch processing for multiple vendors

3. **Tax Reporting**
   - Generate 1099 reports for vendors
   - Tax deduction calculations and tracking

4. **Advanced Analytics**
   - Payout trends and forecasting
   - Vendor performance analytics
   - Commission impact analysis

5. **Dispute Management**
   - Payout dispute workflow
   - Adjustment request system

6. **Notifications**
   - Email notifications on payout status changes
   - SMS alerts for large payouts
   - Notification preferences management

---

## Maintenance

### Database Backups
Regular backups of payout data recommended due to financial criticality.

### Audit Logs
All payout status changes are logged with admin IDs for compliance.

### Monitoring
Consider monitoring:
- Payout processing time
- Failed payout rates
- Bank account verification failures
- Duplicate payout attempts

---

**Implementation Date:** 2024
**Status:** Complete
**Ready for:** Testing and Deployment
