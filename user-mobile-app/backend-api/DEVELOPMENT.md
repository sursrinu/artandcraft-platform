# Backend API Development Guide

## Quick Start

### 1. Install Dependencies
```bash
cd backend-api
npm install
```

### 2. Environment Setup
Create a `.env` file in the `backend-api` directory:

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=password
DB_NAME=artandcraft_db

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_REFRESH_SECRET=your_super_secret_refresh_key_change_this_in_production
JWT_EXPIRY=3600
JWT_REFRESH_EXPIRY=604800

# CORS Configuration
CORS_ORIGIN=http://localhost:3000,http://localhost:3001,http://localhost:3002

# Email Configuration (Optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@artandcraft.com

# Payment Gateway (Stripe)
STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...

# Firebase Configuration (Optional)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_PRIVATE_KEY=your-private-key
FIREBASE_CLIENT_EMAIL=your-client-email

# Cloud Storage (Cloudinary)
CLOUDINARY_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Redis Configuration (Optional)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
```

### 3. Database Setup

#### Using Docker (Recommended)
```bash
# Start MySQL container
docker-compose up -d mysql

# Wait for MySQL to be ready (about 10 seconds)
```

#### Manual MySQL Setup
```bash
# Create database
mysql -u root -p -e "CREATE DATABASE artandcraft_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# Or use MySQL Workbench/phpMyAdmin
```

### 4. Initialize Database
```bash
# Run migrations (creates tables)
npm run migrate

# Seed sample data
npm run seed
```

### 5. Start Development Server
```bash
npm run dev
```

The API will be available at `http://localhost:5000`

---

## Project Structure

```
backend-api/
├── src/
│   ├── app.js                    # Main Express application
│   ├── config/
│   │   ├── database.js           # Sequelize configuration
│   │   └── jwt.js                # JWT configuration
│   ├── controllers/              # HTTP request handlers
│   │   ├── authController.js
│   │   ├── productController.js
│   │   ├── orderController.js
│   │   ├── vendorController.js
│   │   ├── cartController.js
│   │   └── reviewController.js
│   ├── middleware/               # Express middleware
│   │   ├── auth.js               # JWT authentication
│   │   ├── errorHandler.js       # Global error handler
│   │   └── validators.js         # Input validation
│   ├── models/                   # Sequelize models
│   │   ├── User.js
│   │   ├── Vendor.js
│   │   ├── Product.js
│   │   ├── Order.js
│   │   ├── Review.js
│   │   ├── Cart.js
│   │   └── index.js              # Model aggregator
│   ├── routes/                   # API route definitions
│   │   ├── auth.js
│   │   ├── products.js
│   │   ├── orders.js
│   │   ├── vendors.js
│   │   ├── cart.js
│   │   ├── reviews.js
│   │   └── index.js              # Route aggregator
│   ├── services/                 # Business logic
│   │   ├── authService.js
│   │   ├── productService.js
│   │   ├── orderService.js
│   │   ├── vendorService.js
│   │   ├── cartService.js
│   │   └── reviewService.js
│   ├── database/                 # Database scripts
│   │   ├── migrate.js            # Migration script
│   │   └── seed.js               # Seeding script
│   └── utils/                    # Utility functions
│       └── logger.js             # Logging utility
├── tests/                        # Test files
├── API_DOCUMENTATION.md          # Complete API docs
├── .env                          # Environment variables
└── package.json
```

---

## Architecture Overview

### Service-Oriented Architecture

The backend uses a three-layer architecture:

```
Routes (API Endpoints)
    ↓
Controllers (HTTP Handlers)
    ↓
Services (Business Logic)
    ↓
Models (Data Access Layer)
    ↓
Database (MySQL)
```

### Layer Responsibilities

**Routes**: Define API endpoints and HTTP methods
- Located in `routes/` directory
- Use Express Router
- Include middleware for auth and validation

**Controllers**: Handle HTTP requests and responses
- Located in `controllers/` directory
- Extract data from request (body, params, query)
- Call appropriate service methods
- Format and send responses

**Services**: Contain business logic
- Located in `services/` directory
- Perform database operations
- Implement complex logic (order grouping, stock management, etc.)
- Handle validation and error checking

**Models**: Define database structure
- Located in `models/` directory
- Define Sequelize models with validations
- Define associations between models
- Include indexes for performance

---

## Adding a New Feature

### Example: Add a Wishlist Feature

#### 1. Create the Model (`models/Wishlist.js`)
```javascript
export default (sequelize, DataTypes) => {
  const Wishlist = sequelize.define('Wishlist', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Users', key: 'id' },
    },
    productId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Products', key: 'id' },
    },
  });

  Wishlist.associate = (models) => {
    Wishlist.belongsTo(models.User);
    Wishlist.belongsTo(models.Product);
  };

  return Wishlist;
};
```

#### 2. Create the Service (`services/wishlistService.js`)
```javascript
export class WishlistService {
  constructor(models) {
    this.models = models;
  }

  async addToWishlist(userId, productId) {
    const wishlist = await this.models.Wishlist.findOrCreate({
      where: { userId, productId },
      include: ['Product'],
    });
    return wishlist[0];
  }

  async removeFromWishlist(userId, productId) {
    return await this.models.Wishlist.destroy({
      where: { userId, productId },
    });
  }

  async getWishlist(userId) {
    return await this.models.Wishlist.findAll({
      where: { userId },
      include: ['Product'],
    });
  }
}
```

#### 3. Create the Controller (`controllers/wishlistController.js`)
```javascript
import { WishlistService } from '../services/wishlistService.js';

let wishlistService;

export const initWishlistController = (models) => {
  wishlistService = new WishlistService(models);
};

export const addToWishlist = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const { productId } = req.body;
    
    const result = await wishlistService.addToWishlist(userId, productId);
    
    res.status(201).json({
      success: true,
      data: result,
      message: 'Added to wishlist',
    });
  } catch (error) {
    next(error);
  }
};
```

#### 4. Create Routes (`routes/wishlist.js`)
```javascript
import express from 'express';
import { authenticate } from '../middleware/auth.js';
import {
  addToWishlist,
  removeFromWishlist,
  getWishlist,
  initWishlistController,
} from '../controllers/wishlistController.js';

const router = express.Router();

export const setupWishlistRoutes = (db) => {
  initWishlistController(db);
  return router;
};

router.get('/', authenticate, getWishlist);
router.post('/', authenticate, addToWishlist);
router.delete('/:productId', authenticate, removeFromWishlist);

export default router;
```

#### 5. Update Main Routes (`routes/index.js`)
```javascript
import wishlistRoutes, { setupWishlistRoutes } from './wishlist.js';

export const setupRoutes = (db) => {
  const wishlistRouter = setupWishlistRoutes(db);
  router.use('/wishlist', wishlistRouter);
  // ... other routes
};
```

---

## Testing

### Unit Tests with Jest

Create test files in `tests/` directory:

```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Watch mode
npm run test:watch
```

Example test (`tests/services/productService.test.js`):
```javascript
import { ProductService } from '../../src/services/productService.js';

describe('ProductService', () => {
  let service;
  let mockModels;

  beforeEach(() => {
    mockModels = {
      Product: {
        findAll: jest.fn(),
        findByPk: jest.fn(),
      },
    };
    service = new ProductService(mockModels);
  });

  test('getProducts should return paginated products', async () => {
    mockModels.Product.findAll.mockResolvedValue([
      { id: 1, name: 'Product 1' },
    ]);

    const result = await service.getProducts({
      page: 1,
      perPage: 10,
    });

    expect(mockModels.Product.findAll).toHaveBeenCalled();
    expect(result).toEqual(expect.any(Array));
  });
});
```

---

## Debugging

### Using Node Inspector

```bash
# Start with debugger
node --inspect src/app.js

# Open Chrome DevTools: chrome://inspect
```

### Logging

The application uses Winston for logging:

```javascript
import logger from './utils/logger.js';

logger.info('Information message');
logger.error('Error message');
logger.warn('Warning message');
logger.debug('Debug message');
```

---

## Common Issues & Solutions

### Issue: Database Connection Failed
**Solution**:
1. Check MySQL is running: `mysql -u root -p`
2. Verify `.env` database credentials
3. Create database: `CREATE DATABASE artandcraft_db;`

### Issue: JWT Token Expired
**Solution**:
1. Use refresh token endpoint to get new token
2. Update frontend to handle token refresh
3. Check JWT_EXPIRY in .env

### Issue: CORS Errors
**Solution**:
1. Update CORS_ORIGIN in .env with correct URLs
2. Restart server
3. Check browser console for exact error

### Issue: Port 5000 Already in Use
**Solution**:
```bash
# macOS/Linux
lsof -ti:5000 | xargs kill -9

# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

---

## Deployment Checklist

Before deploying to production:

- [ ] Update `.env` with production credentials
- [ ] Set `NODE_ENV=production`
- [ ] Change JWT secrets to strong values
- [ ] Enable HTTPS
- [ ] Configure CORS for production URLs
- [ ] Setup error monitoring (Sentry)
- [ ] Configure database backups
- [ ] Setup logging aggregation
- [ ] Run security audit: `npm audit`
- [ ] Load test the API

---

## Performance Tips

1. **Database Queries**:
   - Use indexes on frequently queried columns
   - Implement query pagination
   - Use `include` for relationships instead of multiple queries

2. **Caching**:
   - Cache product listings in Redis
   - Cache user sessions in Redis
   - Set appropriate TTLs

3. **API Optimization**:
   - Implement rate limiting
   - Use compression middleware
   - Return only needed fields

4. **Code**:
   - Use async/await properly
   - Avoid N+1 query problems
   - Implement proper error handling

---

## Contributing Guidelines

1. Create feature branch: `git checkout -b feature/new-feature`
2. Follow code style: `npm run lint:fix`
3. Write tests for new features
4. Update documentation
5. Create pull request with description

---

## Support

For questions or issues, refer to:
- [API Documentation](./API_DOCUMENTATION.md)
- [Database Schema](../docs/DATABASE_SCHEMA.md)
- [Project Architecture](../docs/ARCHITECTURE.md)
