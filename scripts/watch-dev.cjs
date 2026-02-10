const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

console.log('🔄 Starting development watch mode...');
console.log('📂 Watching src/ directory for changes');
console.log('🌐 Load dist/ folder in Chrome at chrome://extensions/');
console.log('🔄 Press Ctrl+C to stop\n');

let isBuilding = false;

function rebuild(changedFile) {
  if (isBuilding) return;
  
  isBuilding = true;
  const startTime = Date.now();
  
  console.log(`📝 Changed: ${changedFile}`);
  console.log('🔨 Rebuilding...');
  
  exec('npm run build', (error, stdout, stderr) => {
    isBuilding = false;
    const duration = Date.now() - startTime;
    
    if (error) {
      console.error(`❌ Build failed (${duration}ms):`, error.message);
      return;
    }
    
    if (stderr) {
      console.error(`⚠️  Build warnings:`, stderr);
    }
    
    console.log(`✅ Build completed in ${duration}ms`);
    console.log('🔄 Reload extension in Chrome to see changes\n');
  });
}

// Watch src directory recursively
function watchDirectory(dir) {
  fs.watch(dir, { recursive: true }, (eventType, filename) => {
    if (!filename) return;
    
    const fullPath = path.join(dir, filename);
    
    // Skip node_modules, dist, and hidden files
    if (filename.includes('node_modules') || 
        filename.includes('dist') || 
        filename.startsWith('.') ||
        filename.includes('.git')) {
      return;
    }
    
    // Skip temporary files
    if (filename.includes('~') || filename.includes('.tmp')) {
      return;
    }
    
    // Only react to file changes we care about
    if (eventType === 'change' || eventType === 'rename') {
      rebuild(filename);
    }
  });
}

// Start watching
watchDirectory('./src');

// Keep the process alive
process.on('SIGINT', () => {
  console.log('\n👋 Stopping watch mode...');
  process.exit(0);
});