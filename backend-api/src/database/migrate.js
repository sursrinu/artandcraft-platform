// Database Migration and Initialization
import sequelize from '../config/database.js';
import models from '../models/index.js';

const migrate = async () => {
  try {
    console.log('🔄 Starting database synchronization...');
    
    // Force sync in development (drop and recreate tables)
    // In production, use migrations instead
    const isDevelopment = process.env.NODE_ENV === 'development';
    
    if (isDevelopment) {
      console.log('⚠️  Development mode: Dropping existing tables...');
      await sequelize.sync({ force: true });
    } else {
      console.log('ℹ️  Production mode: Altering existing tables...');
      await sequelize.sync({ alter: true });
    }
    
    console.log('✅ Database synchronization completed successfully');
    return true;
  } catch (error) {
    console.error('❌ Migration failed:', error.message);
    throw error;
  }
};

export default migrate;
