#!/usr/bin/env node

// Simple server startup script with better error handling
import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

console.log('🚀 Starting Alfa Hospital Management System Server...');
console.log('📁 Working directory:', process.cwd());
console.log('📁 Script directory:', __dirname);

// Check if server.js exists
import { existsSync } from 'fs';
const serverPath = join(__dirname, 'server.js');

if (!existsSync(serverPath)) {
  console.error('❌ server.js not found at:', serverPath);
  process.exit(1);
}

console.log('✅ server.js found at:', serverPath);

// Start the server
const server = spawn('node', ['server.js'], {
  stdio: 'inherit',
  cwd: __dirname
});

server.on('error', (error) => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});

server.on('exit', (code) => {
  console.log(`📊 Server exited with code ${code}`);
  if (code !== 0) {
    console.error('❌ Server failed to start properly');
    process.exit(code);
  }
});

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 Shutting down server...');
  server.kill('SIGINT');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Shutting down server...');
  server.kill('SIGTERM');
  process.exit(0);
});

console.log('✅ Server startup script ready');
console.log('🌐 Server should be available at: http://localhost:3001');
console.log('📊 API endpoints available at: http://localhost:3001/api/*');
console.log('🛑 Press Ctrl+C to stop the server');
