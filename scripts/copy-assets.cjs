const fs = require('fs');
const path = require('path');

function copyRecursive(src, dest) {
  const exists = fs.existsSync(src);
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();

  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach((childItemName) => {
      copyRecursive(path.join(src, childItemName), path.join(dest, childItemName));
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

function copyFile(src, dest) {
  const destDir = path.dirname(dest);
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
  }
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, dest);
    console.log(`Copied: ${src} -> ${dest}`);
  } else {
    console.warn(`Source not found: ${src}`);
  }
}

// Create dist directory
if (!fs.existsSync('dist')) {
  fs.mkdirSync('dist');
}

console.log('Copying extension assets...');

// Copy HTML files
copyFile('src/options.html', 'dist/options.html');
copyFile('src/offscreen.html', 'dist/offscreen.html');

// Copy manifest
copyFile('src/manifest.json', 'dist/manifest.json');

// Copy assets
copyRecursive('src/assets', 'dist/assets');

// Copy locales
copyRecursive('src/_locales', 'dist/_locales');

// Copy styles (CSS and dependencies)
fs.mkdirSync('dist/styles', { recursive: true });
copyRecursive('src/styles', 'dist/styles');

// Copy scripts (JS libraries)
fs.mkdirSync('dist/scripts', { recursive: true });
fs.mkdirSync('dist/scripts/js', { recursive: true });
copyFile('src/scripts/js/jquery.min.js', 'dist/scripts/jquery.min.js');
copyFile('src/scripts/js/bootstrap.min.js', 'dist/scripts/bootstrap.min.js');
copyFile('src/scripts/js/moment-es.js', 'dist/scripts/js/moment-es.js');

console.log('Assets copied successfully!');