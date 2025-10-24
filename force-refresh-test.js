// Test script to force refresh the API configuration
console.log('🔍 Testing Force Refresh...\n');

// Simulate the exact API configuration logic
const getApiUrl = (endpoint = '') => {
  const hostname = 'localhost:5173'; // Simulate local development
  
  const isVercel = hostname.includes('vercel.app') || 
                   hostname.includes('alfasystem.vercel.app') ||
                   process.env.NODE_ENV === 'production';
  
  const baseUrl = isVercel
    ? '/api'  // Vercel serverless functions
    : 'https://alfasystem.vercel.app/api';  // Use Vercel API even for local development
  
  const fullUrl = endpoint ? `${baseUrl}/${endpoint}` : baseUrl;
  
  console.log('API Configuration:');
  console.log(`  hostname: ${hostname}`);
  console.log(`  isVercel: ${isVercel}`);
  console.log(`  baseUrl: ${baseUrl}`);
  console.log(`  endpoint: ${endpoint}`);
  console.log(`  fullUrl: ${fullUrl}`);
  
  return fullUrl;
};

// Test multiple times to see if there's any variation
console.log('Test 1:');
const url1 = getApiUrl('vital-signs');
console.log(`Result: ${url1}\n`);

console.log('Test 2:');
const url2 = getApiUrl('vital-signs');
console.log(`Result: ${url2}\n`);

console.log('Test 3:');
const url3 = getApiUrl('vital-signs');
console.log(`Result: ${url3}\n`);

// Check if all results are the same
const allSame = url1 === url2 && url2 === url3;
console.log(`All results same: ${allSame}`);

if (allSame) {
  console.log('✅ API configuration is consistent');
} else {
  console.log('❌ API configuration is inconsistent');
}
