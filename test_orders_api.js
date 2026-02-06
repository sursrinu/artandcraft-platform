// Test the orders API with proper authentication
const loginUrl = 'http://localhost:7777/api/v1/auth/login';
const ordersUrl = 'http://localhost:7777/api/v1/orders';

// First create or find a test user
async function testOrdersAPI() {
  try {
    let token;
    
    // Try login with test user
    console.log('🔵 Attempting login...');
    const loginRes = await fetch(loginUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: 'customer@example.com',
        password: 'password123'
      })
    });

    const loginData = await loginRes.json();
    console.log('Login response:', JSON.stringify(loginData, null, 2));

    if (loginData.success && loginData.data?.accessToken) {
      token = loginData.data.accessToken;
    } else {
      console.log('❌ Login failed, trying to create user first...');
      
      // Try to register instead
      const registerRes = await fetch('http://localhost:7777/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: 'Test Customer',
          email: 'testcustomer@example.com',
          password: 'test12345',
          userType: 'customer'
        })
      });

      const registerData = await registerRes.json();
      console.log('Register response:', JSON.stringify(registerData, null, 2));

      if (!registerData.success) {
        console.log('❌ Register failed too');
        return;
      }
      
      token = registerData.data?.accessToken;
    }

    if (!token) {
      console.log('❌ No token found');
      return;
    }

    console.log('✅ Got token:', token.substring(0, 30) + '...');

    // Now test orders endpoint
    console.log('\n🔵 Fetching orders...');
    const ordersRes = await fetch(ordersUrl + '?page=1&per_page=10', {
      headers: { 'Authorization': `Bearer ${token}` }
    });

    const ordersData = await ordersRes.json();
    console.log('Orders response:', JSON.stringify(ordersData, null, 2));

    if (ordersData.success && ordersData.data) {
      console.log(`\n✅ Found ${ordersData.data.orders?.length || 0} orders`);
      if (ordersData.data.orders?.length > 0) {
        console.log('First order:', JSON.stringify(ordersData.data.orders[0], null, 2));
      }
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

testOrdersAPI();
