import Database from './src/database/index.js';

const db = new Database();
await db.connect();

// Restore stock for test products
await db.sequelize.query(`
  UPDATE products 
  SET stock = CASE 
    WHEN id = 11 THEN 5
    WHEN id = 13 THEN 5
    WHEN id = 14 THEN 5
    ELSE stock
  END
  WHERE id IN (11, 13, 14)
`);

console.log('✅ Product stock restored');
process.exit(0);
