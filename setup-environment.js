import fs from 'fs';
import path from 'path';

console.log('🔧 Setting up environment configuration...');

const envContent = `# Supabase Configuration
# Replace these with your actual Supabase project values
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_KEY=your_supabase_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key_here

# API Configuration
VITE_API_BASE_URL=http://localhost:3001/api
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_KEY=your_supabase_anon_key_here

# Development
NODE_ENV=development
`;

const envPath = '.env.local';

try {
  // Check if .env.local already exists
  if (fs.existsSync(envPath)) {
    console.log('⚠️  .env.local already exists. Backing up to .env.local.backup');
    fs.copyFileSync(envPath, '.env.local.backup');
  }
  
  // Create .env.local file
  fs.writeFileSync(envPath, envContent);
  console.log('✅ Created .env.local file');
  
  console.log('\n📝 Next steps:');
  console.log('1. Open .env.local in your editor');
  console.log('2. Replace the placeholder values with your actual Supabase credentials:');
  console.log('   - SUPABASE_URL: Your Supabase project URL');
  console.log('   - SUPABASE_KEY: Your Supabase anon/public key');
  console.log('   - SUPABASE_SERVICE_ROLE_KEY: Your Supabase service role key');
  console.log('3. Save the file');
  console.log('4. Restart your server with: npm run server');
  
  console.log('\n🔍 To find your Supabase credentials:');
  console.log('1. Go to https://supabase.com/dashboard');
  console.log('2. Select your project');
  console.log('3. Go to Settings > API');
  console.log('4. Copy the Project URL and API keys');
  
} catch (error) {
  console.error('❌ Error creating .env.local:', error.message);
  console.log('\n📝 Please create .env.local manually with the following content:');
  console.log(envContent);
}
