const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testServerDBConnection() {
  try {
    // Test the server's database connection by making a request
    const response = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'nehadahake27@gmail.com',
        password: 'Password123'
      })
    });

    const data = await response.json();
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(data, null, 2));

    // Also test with a different email to see if any users are found
    const response2 = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'Test123456'
      })
    });

    const data2 = await response2.json();
    console.log('\nTest with test@example.com:');
    console.log('Response status:', response2.status);
    console.log('Response data:', JSON.stringify(data2, null, 2));

  } catch (error) {
    console.error('Error testing server DB connection:', error.message);
  }
}

testServerDBConnection(); 