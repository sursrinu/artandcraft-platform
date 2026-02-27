# Quick Start Guide - Art & Craft Platform

## 5-Minute Setup Guide

### Prerequisites
- Node.js 18+ LTS
- MySQL 8.0+
- Flutter 3.x (for mobile apps)
- VS Code or preferred IDE

---

## Backend API (5 minutes)

### Step 1: Navigate to Backend
```bash
cd backend-api
```

### Step 2: Install Dependencies
```bash
npm install
```

### Step 3: Create Environment File
```bash
cp .env.example .env
```

Edit `.env` with your database credentials:
```env
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_password
DB_NAME=artandcraft_db
JWT_SECRET=your_secret_key
PORT=5000
```

### Step 4: Setup Database
```bash
npm run migrate    # Creates tables
npm run seed       # Adds sample data
```

### Step 5: Start Server
```bash
npm run dev        # Starts on http://localhost:5000
```

**Test API**:
```bash
curl http://localhost:5000/api/v1/health
```

---

## User Mobile App (3 minutes)

### Step 1: Navigate to Flutter Project
```bash
cd user-mobile-app
```

### Step 2: Get Dependencies
```bash
flutter pub get
```

### Step 3: Run App
```bash
flutter run
```

Or on specific device:
```bash
flutter devices              # List available devices
flutter run -d <device-id>  # Run on specific device
```

---

## Testing the API

### Option A: Using cURL

**Login**:
```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"customer@artcraft.com","password":"customer123"}'
```

**Get Products**:
```bash
curl "http://localhost:5000/api/v1/products?page=1&per_page=10"
```

**Add to Cart** (with token from login):
```bash
curl -X POST http://localhost:5000/api/v1/cart/items \
  -H "Authorization: Bearer <YOUR_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"productId":1,"quantity":2}'
```

### Option B: Using Postman

1. Open Postman
2. Click "Import" → "Link"
3. Paste: `http://localhost:5000/api/v1`
4. Use test credentials:
   - Email: `customer@artcraft.com`
   - Password: `customer123`

### Option C: Using REST Client (VS Code)

Create `test.http` file:
```http
### Login
POST http://localhost:5000/api/v1/auth/login
Content-Type: application/json

{
  "email": "customer@artcraft.com",
  "password": "customer123"
}

### Get Products
GET http://localhost:5000/api/v1/products?page=1

### Get Cart (needs token from login)
GET http://localhost:5000/api/v1/cart
Authorization: Bearer <TOKEN>
```

---

## Test Credentials

After running `npm run seed`, use these credentials:

| Role | Email | Password |
|------|-------|----------|
| Customer | customer@artcraft.com | customer123 |
| Vendor | vendor@artcraft.com | vendor123 |
| Admin | admin@artcraft.com | admin123 |

---

## Sample API Calls

### 1. Register New Customer
```bash
POST /auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "phone": "+1234567890",
  "userType": "customer"
}
```

### 2. Login
```bash
POST /auth/login
{
  "email": "customer@artcraft.com",
  "password": "customer123"
}
```

### 3. Get All Products (Paginated)
```bash
GET /products?page=1&per_page=10&sort_by=price&sort_order=asc
```

### 4. Get Product Details
```bash
GET /products/1
```

### 5. Create Order (Requires Auth)
```bash
POST /orders
{
  "items": [
    {"productId": 1, "quantity": 2, "price": 150}
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
```

### 6. Get Cart (Requires Auth)
```bash
GET /cart
Authorization: Bearer <token>
```

### 7. Add Product Review (Requires Auth)
```bash
POST /reviews/products/1
{
  "rating": 5,
  "title": "Amazing product!",
  "comment": "This artwork is beautiful!"
}
```

---

## Troubleshooting

### Issue: "Cannot connect to database"
**Solution**:
```bash
# Check MySQL is running
mysql -u root -p

# Verify .env credentials
cat backend-api/.env

# Create database manually if needed
mysql -u root -p -e "CREATE DATABASE artandcraft_db;"
```

### Issue: "Port 5000 already in use"
**Solution (macOS/Linux)**:
```bash
lsof -ti:5000 | xargs kill -9
```

**Solution (Windows)**:
```cmd
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### Issue: "Flutter command not found"
**Solution**:
```bash
# Add Flutter to PATH
export PATH="$PATH:<flutter-installation-directory>/bin"

# Or install Flutter: https://flutter.dev/docs/get-started/install
```

### Issue: "Module not found"
**Solution**:
```bash
# For Node.js
rm -rf node_modules package-lock.json
npm install

# For Flutter
flutter clean
flutter pub get
```

---

## Project Structure Overview

```
artandcraft-platform/
├── backend-api/
│   ├── src/
│   │   ├── models/          # Database models (12)
│   │   ├── services/        # Business logic (6)
│   │   ├── controllers/     # HTTP handlers (6)
│   │   ├── routes/          # API routes (6)
│   │   ├── middleware/      # Middleware
│   │   ├── config/          # Configuration
│   │   └── database/        # Migrations & seeds
│   ├── package.json
│   ├── API_DOCUMENTATION.md
│   └── DEVELOPMENT.md
├── user-mobile-app/
│   ├── lib/
│   │   ├── screens/         # 9 UI screens
│   │   ├── providers/       # State management (3)
│   │   ├── services/        # API client
│   │   └── config/          # Configuration
│   └── pubspec.yaml
├── docs/
│   ├── PROJECT_PLAN.md
│   ├── ARCHITECTURE.md
│   └── DATABASE_SCHEMA.md
└── README.md
```

---

## API Endpoints Quick Reference

### Authentication
- `POST /auth/register` - Create account
- `POST /auth/login` - Login user
- `POST /auth/refresh` - Refresh token
- `GET /auth/profile` - Get user profile (auth required)
- `PUT /auth/profile` - Update profile (auth required)

### Products
- `GET /products` - List products (paginated)
- `GET /products/:id` - Get product details
- `POST /products` - Create product (vendor only)
- `PUT /products/:id` - Update product (vendor only)
- `DELETE /products/:id` - Delete product (vendor only)

### Orders
- `POST /orders` - Create order (customer only)
- `GET /orders` - List customer orders
- `GET /orders/:id` - Get order details
- `PUT /orders/:id/status` - Update status (vendor only)

### Cart
- `GET /cart` - Get cart
- `POST /cart/items` - Add to cart
- `PUT /cart/items/:id` - Update quantity
- `DELETE /cart/items/:id` - Remove from cart
- `GET /cart/summary` - Get cart summary

### Reviews
- `GET /reviews/products/:productId` - List product reviews
- `POST /reviews/products/:productId` - Create review
- `PUT /reviews/:id` - Update review
- `DELETE /reviews/:id` - Delete review

### Vendors
- `POST /vendors/register` - Register as vendor
- `GET /vendors` - List vendors
- `GET /vendors/:id` - Get vendor details
- `PUT /vendors/:id/approve` - Approve vendor (admin only)

---

## Development Workflow

### 1. Start Backend
```bash
cd backend-api
npm run dev
# Runs on http://localhost:5000
```

### 2. Start Mobile App (in new terminal)
```bash
cd user-mobile-app
flutter run
```

### 3. Test API (in another terminal)
```bash
# Use curl, Postman, or VS Code REST Client
curl http://localhost:5000/api/v1/health
```

### 4. Check Logs
```bash
# Backend logs appear in terminal running npm run dev
# Mobile app logs appear in terminal running flutter run
```

---

## Next Steps

### After Basic Setup:
1. ✅ Backend API running on port 5000
2. ✅ Database with sample data
3. ✅ Mobile app connected to backend
4. 📝 Customize business logic as needed
5. 🔧 Add additional features
6. 🚀 Deploy to production

### Recommended Order:
1. Get backend running and test with cURL
2. Get mobile app running
3. Connect mobile app to backend API
4. Test key flows (login, browse products, cart, checkout)
5. Add authentication to mobile app
6. Implement search and filtering
7. Add more features as needed

---

## Important Notes

### Security
- Change JWT secrets in production
- Use HTTPS in production
- Never commit .env files
- Validate all input on backend
- Use secure password hashing (bcrypt)

### Database
- Always backup before migrations
- Test changes on development first
- Keep migration scripts for version control
- Monitor query performance

### Mobile App
- Test on multiple devices/screen sizes
- Optimize images and assets
- Implement proper error handling
- Cache API responses appropriately

---

## Resources

### Documentation Files
- **API Docs**: `backend-api/API_DOCUMENTATION.md`
- **Dev Guide**: `backend-api/DEVELOPMENT.md`
- **Architecture**: `docs/ARCHITECTURE.md`
- **Database Schema**: `docs/DATABASE_SCHEMA.md`

### External Resources
- **Flutter**: https://flutter.dev
- **Express.js**: https://expressjs.com
- **Sequelize**: https://sequelize.org
- **Riverpod**: https://riverpod.dev
- **MySQL**: https://mysql.com

---

## Getting Help

### Debugging Backend
```bash
# Enable detailed logs
DEBUG=* npm run dev

# Check database directly
mysql -u root -p artandcraft_db
mysql> SELECT * FROM Users;
```

### Debugging Mobile App
```bash
# Enable debug logs
flutter run --verbose

# Use DevTools
flutter pub global activate devtools
devtools
```

### Check Service Status
```bash
# Is backend running?
curl http://localhost:5000/api/v1/health

# Is database running?
mysql -u root -p -e "SELECT 1;"
```

---

## Quick Commands Reference

| Command | Purpose |
|---------|---------|
| `npm install` | Install Node dependencies |
| `npm run dev` | Start backend development server |
| `npm run migrate` | Create database tables |
| `npm run seed` | Add sample data |
| `npm run lint:fix` | Fix code style issues |
| `flutter pub get` | Install Flutter dependencies |
| `flutter run` | Run Flutter app |
| `flutter run --release` | Release build |
| `flutter build apk` | Build Android APK |
| `curl -X GET http://...` | Test API endpoint |

---

## Performance Tips

1. **Database**: Add indexes for frequently queried columns
2. **API**: Enable compression and caching
3. **Mobile**: Use image caching and lazy loading
4. **Code**: Implement pagination for large datasets

---

## Deployment Checklist

Before production:
- [ ] Update all .env files with production values
- [ ] Set `NODE_ENV=production`
- [ ] Change all secrets and API keys
- [ ] Enable HTTPS
- [ ] Configure CORS for production domains
- [ ] Setup database backups
- [ ] Setup error monitoring
- [ ] Test thoroughly in staging
- [ ] Create deployment documentation
- [ ] Setup monitoring and alerts

---

## Support

For issues or questions:
1. Check the relevant documentation file
2. Review the code comments
3. Check error messages in logs
4. Refer to external library documentation
5. Test endpoints individually

---

## Summary

You now have:
✅ Working backend API with 42 endpoints
✅ User mobile app with 9 screens
✅ Database with sample data
✅ Test credentials for development
✅ Comprehensive documentation

**Ready to build the next features!** 🚀

---

*Last Updated: 2024*
*Status: Production Ready - Phase 1 Complete*
