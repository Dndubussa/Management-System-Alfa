// Test script to verify API configuration
console.log('🔍 Testing API Configuration...\n');

// Simulate different environments
const testEnvironments = [
  { hostname: 'localhost:5173', expected: 'local' },
  { hostname: 'alfasystem.vercel.app', expected: 'vercel' },
  { hostname: 'test.vercel.app', expected: 'vercel' },
  { hostname: 'localhost:3000', expected: 'local' }
];

testEnvironments.forEach(({ hostname, expected }) => {
  // Simulate window.location.hostname
  const mockWindow = { location: { hostname } };
  
  const isVercel = hostname.includes('vercel.app') || 
                   hostname.includes('alfasystem.vercel.app') ||
                   process.env.NODE_ENV === 'production';
  
  const baseUrl = isVercel ? '/api' : 'http://localhost:3001/api';
  
  console.log(`Hostname: ${hostname}`);
  console.log(`Expected: ${expected}`);
  console.log(`Detected: ${isVercel ? 'vercel' : 'local'}`);
  console.log(`Base URL: ${baseUrl}`);
  console.log(`✅ ${isVercel === (expected === 'vercel') ? 'PASS' : 'FAIL'}\n`);
});

console.log('📋 Summary:');
console.log('- If running on localhost: Should use http://localhost:3001/api');
console.log('- If running on vercel.app: Should use /api');
console.log('- Check browser console for actual API configuration logs');
