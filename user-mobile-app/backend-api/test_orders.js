const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: 'localhost',
  user: 'root',
  password: 'root',
  database: 'art_and_craft_db',
  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0
});

(async () => {
  const conn = await pool.getConnection();
  try {
    const [rows] = await conn.execute('SELECT COUNT(*) as count FROM Orders');
    console.log('Total orders in DB:', rows[0].count);
    
    const [orders] = await conn.execute('SELECT id, orderNumber, status, totalAmount FROM Orders LIMIT 5');
    console.log('Sample orders:');
    console.log(orders);
  } finally {
    conn.release();
  }
})();
