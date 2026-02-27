# Payment Method Implementation - Complete

## Overview
Implemented comprehensive payment method storage and management system supporting multiple payment types: Card, UPI, Net Banking, and Wallet.

## Backend Implementation

### 1. PaymentMethod Model (`/backend-api/src/models/PaymentMethod.js`)
- **Table**: `payment_methods`
- **Supported Types**: card, upi, netbanking, wallet
- **Fields**:
  - `id`: Primary key
  - `userId`: Foreign key to users table
  - `type`: ENUM(card, upi, netbanking, wallet)
  - `isDefault`: Boolean flag for default payment method
  - `isActive`: Boolean flag for active/inactive status
  - `createdAt`, `updatedAt`: Timestamps

**Card-specific fields**:
- `cardToken`: Stored card token from payment processor
- `cardLastFour`: Last 4 digits of card (displayed in UI)
- `cardHolderName`: Name on card
- `cardExpiry`: Card expiry date (MM/YY format)

**UPI-specific fields**:
- `upiId`: UPI identifier (e.g., username@upi)

**Net Banking-specific fields**:
- `bankName`: Name of the bank
- `bankAccountToken`: Bank account token

**Wallet-specific fields**:
- `walletProvider`: Wallet provider name (e.g., "Paytm", "Google Pay")
- `walletId`: Wallet ID

### 2. User Model Association
```javascript
User.hasMany(models.PaymentMethod, { 
  foreignKey: 'userId', 
  onDelete: 'CASCADE' 
});
```

### 3. Routes (`/backend-api/src/routes/users.js`)
All routes require authentication via `authenticate` middleware:

- `GET /users/payment-methods` - List all payment methods for authenticated user
- `POST /users/payment-methods` - Create new payment method
- `PUT /users/payment-methods/:methodId` - Update payment method (isDefault/isActive)
- `DELETE /users/payment-methods/:methodId` - Delete payment method

**Important**: These routes are placed BEFORE the generic `/:id` routes to ensure proper route matching.

### 4. Controller Functions (`/backend-api/src/controllers/userController.js`)

#### `getPaymentMethods()`
- Returns active payment methods ordered by `isDefault DESC, createdAt DESC`
- Automatically adds JWT userId to request

#### `addPaymentMethod()`
- Validates type-specific required fields
- If setting as default, unsets other default methods
- Returns created payment method

**Field validation**:
- Card: requires cardToken, cardHolderName, cardExpiry
- UPI: requires upiId
- NetBanking: requires bankName
- Wallet: requires walletProvider

#### `updatePaymentMethod()`
- Updates isDefault and isActive flags
- Unsets other methods' default if setting current as default

#### `deletePaymentMethod()`
- Soft delete conceptually, hard delete in implementation
- Removes method for authenticated user

## Frontend Implementation

### 1. PaymentService (`/user-mobile-app/lib/services/payment_service.dart`)

**PaymentMethod class**:
```dart
class PaymentMethod {
  final int id;
  final String type; // 'card', 'upi', 'netbanking', 'wallet'
  final String? cardToken;
  final String? cardLastFour;
  final String? cardHolderName;
  final String? cardExpiry;
  final String? upiId;
  final String? bankName;
  final String? walletProvider;
  final bool isDefault;
}
```

**Key methods**:
- `getPaymentMethods()`: GET /users/payment-methods
- `savePaymentMethod()`: POST /users/payment-methods with type-specific parameters
- `deletePaymentMethod()`: DELETE /users/payment-methods/:methodId
- `setDefaultPaymentMethod()`: PUT /users/payment-methods/:methodId/default

### 2. Payment Method Dialog (`/user-mobile-app/lib/screens/cart/checkout_screen.dart`)

**Features**:
- **Type Selector**: SegmentedButton to choose between Card and UPI
- **Conditional Fields**:
  - **Card**: Card number, cardholder name, expiry (MM/YY), CVC
  - **UPI**: UPI ID input field
- **Error Handling**: Shows snackbar on success/failure
- **Auto-clear**: Clears form fields after successful addition
- **Refresh**: Invalidates payment methods provider to refresh list

**Dialog Structure**:
```
AlertDialog
├── Title: "Add Payment Method"
├── Content:
│   ├── Payment Type Selector (Card/UPI SegmentedButton)
│   ├── Conditional Fields based on type:
│   │   ├── Card fields (if Card selected)
│   │   └── UPI field (if UPI selected)
│   └── SingleChildScrollView for overflow
└── Actions: [Cancel, Add]
```

## Critical Field Mappings

### Backend → Frontend
- `stateOrProvince` ↔ `state` (Address field)
- `zipCode` ↔ `zip` (Address field)
- `phoneNumber` ↔ `phone` (Address field)

### JWT Token
- Backend uses: `req.user?.userId` (NOT `req.user?.id`)
- Frontend sends: JWT token in Authorization header automatically via ApiClient

## Testing Checklist

- [ ] Add card payment method via dialog
  - [ ] Verify dialog shows card fields
  - [ ] Verify payment method appears in list
  - [ ] Verify data persists in database

- [ ] Add UPI payment method via dialog
  - [ ] Verify dialog switches to UPI fields
  - [ ] Verify UPI ID saved correctly
  - [ ] Verify payment method appears in list

- [ ] Delete payment method
  - [ ] Verify method removed from list
  - [ ] Verify database entry deleted

- [ ] Set default payment method
  - [ ] Verify isDefault flag updated
  - [ ] Verify other methods set to non-default

- [ ] Address management
  - [ ] Verify addresses display in dropdown
  - [ ] Test add/update/delete address
  - [ ] Verify correct field mapping (state/zip/phone)

- [ ] Complete checkout flow
  - [ ] Select address from dropdown
  - [ ] Select payment method from dropdown
  - [ ] Verify order details correct
  - [ ] Place order

## API Response Format

### Get Payment Methods
```json
{
  "success": true,
  "message": "Payment methods retrieved successfully",
  "data": [
    {
      "id": 1,
      "type": "card",
      "cardLastFour": "4242",
      "cardHolderName": "John Doe",
      "cardExpiry": "12/25",
      "isDefault": true
    },
    {
      "id": 2,
      "type": "upi",
      "upiId": "john@upi",
      "isDefault": false
    }
  ]
}
```

### Save Payment Method
```json
{
  "success": true,
  "message": "Payment method added successfully",
  "data": {
    "id": 3,
    "type": "upi",
    "upiId": "jane@upi",
    "isDefault": false
  }
}
```

## Environment & Dependencies

### Backend
- Node.js/Express
- Sequelize ORM
- MySQL database
- Running on: `http://localhost:7777`

### Frontend
- Flutter Web
- Riverpod for state management
- Dio for HTTP requests
- Running on: `http://localhost:50529`

## Files Modified

1. `/backend-api/src/models/PaymentMethod.js` - CREATED
2. `/backend-api/src/models/User.js` - Updated with association
3. `/backend-api/src/controllers/userController.js` - Added 4 controller functions
4. `/backend-api/src/routes/users.js` - Added 4 payment method routes
5. `/user-mobile-app/lib/services/payment_service.dart` - Updated with type support
6. `/user-mobile-app/lib/screens/cart/checkout_screen.dart` - Updated dialog for multi-type support

## Error Handling

### Backend Errors
- `404 Not Found`: Payment method not found
- `400 Bad Request`: Missing required fields for payment type
- `401 Unauthorized`: Missing or invalid JWT token
- `403 Forbidden`: Attempting to modify another user's payment method

### Frontend Errors
- Network errors: Shown in snackbar
- Validation errors: Snackbar message from server
- Form validation: Pre-submission validation in UI

## Next Steps

1. ✅ Implement multi-type payment method support
2. ✅ Update checkout dialog with type selector
3. ⏳ Test complete payment flow
4. ⏳ Add Net Banking and Wallet payment type UIs
5. ⏳ Integrate with actual payment processors (Stripe, Razorpay, etc.)
6. ⏳ Add payment method editing functionality

## Notes

- All payment methods are user-specific (scoped by userId)
- Default payment method is returned first in list
- Payment method deletion is permanent (CASCADE delete)
- Card data should ideally use tokenization from payment processor instead of storing raw data
- Future: Implement PCI compliance for card data storage
