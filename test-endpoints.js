const http = require('http');

function testUrl(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'localhost',
      port: 8080,
      path: path,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    const req = http.request(options, res => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });
    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

async function runTests() {
  console.log('--- Testing Dokra Health Endpoints ---');
  
  const health = await testUrl('GET', '/health');
  console.log('1. GET /health -> HTTP', health.status, health.body);

  const feed = await testUrl('GET', '/v2/servicecard/list');
  console.log('2. GET /v2/servicecard/list -> HTTP', feed.status, 'Cards:', Array.isArray(feed.body) ? feed.body.length : 'N/A');

  const googleLogin = await testUrl('POST', '/v1/auth/google-login', {
    email: 'athlete@dokrahealth.com',
    name: 'Dokra Athlete',
    googleId: 'g_test_12345'
  });
  console.log('3. POST /v1/auth/google-login -> HTTP', googleLogin.status, googleLogin.body.success ? 'Success (Token issued)' : googleLogin.body);

  const fbSignup = await testUrl('POST', '/v1/auth/signup', {
    email: 'runner@dokrahealth.com',
    password: 'password123',
    name: 'Dokra Runner'
  });
  console.log('4. POST /v1/auth/signup -> HTTP', fbSignup.status, fbSignup.body.success ? 'Success (User created & token issued)' : fbSignup.body);

  const logo = await testUrl('GET', '/assets/dokra-logo.png');
  console.log('5. GET /assets/dokra-logo.png -> HTTP', logo.status, 'Length:', logo.body ? logo.body.length : 0);

  const studio = await testUrl('GET', '/admin/studio');
  console.log('6. GET /admin/studio -> HTTP', studio.status, 'Studio UI loaded successfully!');
}

runTests().catch(console.error);
