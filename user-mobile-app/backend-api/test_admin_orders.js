// Using native fetch (Node 18+)

// Get token first
const loginRes = await fetch('http://localhost:7777/api/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'admin@example.com',
    password: 'password123'
  })
});

const loginData = await loginRes.json();
const token = loginData.data?.token;

if (!token) {
  console.log('Login failed:', loginData);
  process.exit(1);
}

console.log('✅ Got token:', token.substring(0, 20) + '...');

// Now test admin orders endpoint
const ordersRes = await fetch('http://localhost:7777/api/v1/orders/admin/all?page=1&per_page=10', {
  headers: { 'Authorization': `Bearer ${token}` }
});

const ordersData = await ordersRes.json();
console.log('Admin orders response:', JSON.stringify(ordersData, null, 2));
