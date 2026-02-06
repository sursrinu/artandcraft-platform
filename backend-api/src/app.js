// Main Express Application
import dotenv from 'dotenv';

// Load environment variables BEFORE importing anything else that uses them
dotenv.config();

import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger.js';
import db from './models/index.js';
import routes, { setupRoutes } from './routes/index.js';
import { errorHandler } from './middleware/errorHandler.js';
import { initAuthController } from './controllers/authController.js';
import { initProductController } from './controllers/productController.js';
import { initUploadController } from './controllers/uploadController.js';

const sequelize = db.sequelize;
const models = db;

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", 'https:', "'unsafe-inline'"],
    },
  },
}));
app.use(cors());
app.use(morgan('combined'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(express.static('public'));
app.use('/uploads', express.static('public/uploads'));

// Initialize models and associations
console.log('🔄 Initializing database models...');
await models;
console.log('✅ Database models initialized');

// Initialize controllers with database
initAuthController(models);
initProductController(models);
initUploadController(models);

// Setup routes
const apiRoutes = setupRoutes(models);
app.use('/api/v1', apiRoutes);

// Swagger Documentation
app.use('/api/v1/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: 'Art & Craft API Documentation',
}));

// Swagger JSON endpoint
app.get('/api/v1/docs.json', (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.send(swaggerSpec);
});

// Default route
app.get('/', (req, res) => {
  res.json({
    message: 'Art & Craft MultiVendor E-Commerce Platform API',
    version: '1.0.0',
    documentation: '/api/v1/health',
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.path,
  });
});

// Error handler (must be last)
app.use(errorHandler);

// Database connection and server startup
const startServer = async () => {
  try {
    // Test database connection
    console.log('🔄 Testing database connection...');
    await sequelize.authenticate();
    console.log('✅ Database connection established');
    
    // Add paymentMethod column if it doesn't exist (before sync)
    try {
      await sequelize.query(`
        ALTER TABLE orders ADD COLUMN paymentMethod VARCHAR(50) NULL
      `);
      console.log('✅ Added paymentMethod column to orders table');
    } catch (e) {
      // Column likely already exists
      if (e.message && e.message.includes('Duplicate column')) {
        console.log('ℹ️  paymentMethod column already exists');
      } else if (e.message && e.message.includes('Unknown column')) {
        console.log('⚠️  Could not add paymentMethod column:', e.message);
      }
    }
    
    // Sync database tables - disable foreign key checks temporarily
    console.log('🔄 Syncing database tables...');
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 0');
    await sequelize.sync({ force: true }); // Create all tables fresh
    await sequelize.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('✅ Database synchronized');

  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
};

startServer();

export default app;
