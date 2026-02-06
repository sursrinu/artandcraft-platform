# Payment Method UI Testing Guide

## Setup Status
✅ Backend API running on http://localhost:7777
✅ Flutter Web App running on http://localhost:50529
✅ Payment Method model and endpoints created
✅ Checkout dialog updated with multi-type support

## Testing Payment Methods in Checkout

### Step 1: Navigate to Checkout Screen
1. Open http://localhost:50529 in your browser
2. Add products to cart (if not already there)
3. Click "Proceed to Checkout" button
4. Scroll to Payment Method section

### Step 2: Add Card Payment Method
1. Click "Add Payment Method" button
2. Verify "Card" tab is selected in SegmentedButton
3. Fill in the following fields:
   - Card Number: `4242 4242 4242 4242` (Stripe test card)
   - Cardholder Name: `John Doe`
   - Expiry: `12/25` (MM/YY format)
   - CVC: `123`
4. Click "Add" button
5. Verify success message appears
6. Check that payment method appears in the dropdown below

### Step 3: Add UPI Payment Method
1. Click "Add Payment Method" button again
2. Click "UPI" tab in SegmentedButton
3. Verify card fields disappear and UPI field appears
4. Enter UPI ID: `johndoe@okaxis` (or any UPI ID format)
5. Click "Add" button
6. Verify success message appears
7. Check that UPI method appears in dropdown

### Step 4: Verify Payment Methods Display
1. Scroll down in checkout screen
2. Locate "Select Payment Method" dropdown
3. Click dropdown to expand
4. Verify both payment methods are listed:
   - Card ending with last 4 digits (if available)
   - UPI ID (if added)

### Step 5: Select and Proceed
1. Select one of the payment methods from dropdown
2. If address was added, select address from dropdown
3. Click "Review Order" or "Proceed" button
4. Verify payment method displays correctly in order summary

## Expected UI Changes

### Before
- Dialog only showed card fields
- No way to add UPI or other payment methods
- Card number and CVC fields always visible

### After
- Dialog has SegmentedButton with "Card" and "UPI" tabs
- When Card is selected: Shows card fields (number, holder, expiry, CVC)
- When UPI is selected: Shows only UPI ID field
- Fields automatically hide/show based on selection
- Form fields clear after successful addition

## Backend Database Verification

### Check Payment Methods Were Saved
```bash
# If you have MySQL access, run:
SELECT * FROM payment_methods;

# Should see entries like:
# id | userId | type  | cardLastFour | upiId          | isDefault | isActive
# 1  | 1      | card  | 4242         | NULL           | 1         | 1
# 2  | 1      | upi   | NULL         | johndoe@okaxis | 0         | 1
```

## API Endpoints Reference

### Get Payment Methods
```bash
curl -X GET http://localhost:7777/api/v1/users/payment-methods \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json"
```

**Response**:
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
      "isDefault": true,
      "isActive": true
    },
    {
      "id": 2,
      "type": "upi",
      "upiId": "johndoe@okaxis",
      "isDefault": false,
      "isActive": true
    }
  ]
}
```

### Add Payment Method (Card)
```bash
curl -X POST http://localhost:7777/api/v1/users/payment-methods \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "card",
    "cardToken": "4242424242424242",
    "cardHolderName": "John Doe",
    "cardExpiry": "12/25",
    "isDefault": false
  }'
```

### Add Payment Method (UPI)
```bash
curl -X POST http://localhost:7777/api/v1/users/payment-methods \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "type": "upi",
    "upiId": "johndoe@okaxis",
    "isDefault": false
  }'
```

## Troubleshooting

### Issue: Dialog doesn't show payment type selector
**Solution**: Clear browser cache (Ctrl+Shift+Delete / Cmd+Shift+Delete) and refresh

### Issue: UPI field doesn't appear when clicking UPI tab
**Solution**: Check browser console for JavaScript errors. Clear cache and reload.

### Issue: Payment method not appearing in dropdown after adding
**Solution**: 
1. Check network tab to see if POST request succeeded (200 response)
2. Verify token is valid and user ID matches
3. Try refreshing the checkout screen

### Issue: "UNAUTHORIZED" error when testing API
**Solution**: Get a valid JWT token by logging in first, then copy from:
- Browser DevTools → Application → LocalStorage → `token` key
- Or from network request headers in Authorization field

## Frontend Code Locations

- Dialog: `/user-mobile-app/lib/screens/cart/checkout_screen.dart` lines 682-830
- Payment Service: `/user-mobile-app/lib/services/payment_service.dart`
- Controllers: `_cardNumberController`, `_cardHolderController`, `_expiryController`, `_cvcController`, `_upiIdController`

## Backend Code Locations

- Model: `/backend-api/src/models/PaymentMethod.js`
- Controller: `/backend-api/src/controllers/userController.js` lines 439-649
- Routes: `/backend-api/src/routes/users.js` lines 14-20

## Next Steps After Testing

1. Test address management (should now work after userId fix)
2. Complete checkout flow end-to-end
3. Test payment processing integration
4. Add Net Banking and Wallet payment type UIs
5. Implement payment method editing
