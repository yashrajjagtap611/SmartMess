const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testServerDatabase() {
  try {
    // Test with a user we know exists in SmartMess database
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'Test123456'
      })
    });

    const data = await response.json();
    console.log('Test with test@example.com:');
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(data, null, 2));

    // Test with a user from mess-app database
    const response2 = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'yashrajjagtap57@gmail.com',
        password: 'password123'
      })
    });

    const data2 = await response2.json();
    console.log('\nTest with yashrajjagtap57@gmail.com (from mess-app):');
    console.log('Response status:', response2.status);
    console.log('Response data:', JSON.stringify(data2, null, 2));

  } catch (error) {
    console.error('Error testing server database:', error.message);
  }
}

testServerDatabase(); 