// Debug script to see what URL the API configuration generates
console.log('🔍 Debugging API URL Generation...\n');

// Simulate the exact logic from the API configuration
const getApiUrl = (endpoint = '') => {
  // Simulate window.location.hostname for local development
  const hostname = 'localhost:5173';
  
  const isVercel = hostname.includes('vercel.app') || 
                   hostname.includes('alfasystem.vercel.app') ||
                   process.env.NODE_ENV === 'production';
  
  const baseUrl = isVercel
    ? '/api'  // Vercel serverless functions
    : 'https://alfasystem.vercel.app/api';  // Use Vercel API even for local development
  
  const fullUrl = endpoint ? `${baseUrl}/${endpoint}` : baseUrl;
  
  console.log('API Configuration Debug:');
  console.log(`  hostname: ${hostname}`);
  console.log(`  isVercel: ${isVercel}`);
  console.log(`  baseUrl: ${baseUrl}`);
  console.log(`  endpoint: ${endpoint}`);
  console.log(`  fullUrl: ${fullUrl}`);
  
  return fullUrl;
};

// Test the vital signs endpoint
const vitalSignsUrl = getApiUrl('vital-signs');
console.log(`\nVital Signs URL: ${vitalSignsUrl}`);

// Test if this URL would work
console.log('\nTesting URL validity:');
if (vitalSignsUrl.startsWith('https://')) {
  console.log('✅ Absolute URL - should work');
} else if (vitalSignsUrl.startsWith('/api')) {
  console.log('❌ Relative URL - might not work in local development');
} else {
  console.log('❓ Unknown URL format');
}
