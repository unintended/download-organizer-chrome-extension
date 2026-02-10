#!/usr/bin/env node

import { execSync, spawn } from 'child_process';
import { readFileSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

// Load package.json
const packageJson = JSON.parse(readFileSync(join(projectRoot, 'package.json'), 'utf-8'));

const COMMANDS = {
  // Development commands
  build: 'Build the extension for production',
  dev: 'Start development with watch mode',
  proto: 'Build and test extension in Chrome',
  watch: 'Watch for changes and rebuild',
  clean: 'Clean build artifacts',
  
  // Quality commands  
  lint: 'Run ESLint code quality checks',
  format: 'Format code with Prettier',
  'type-check': 'Run TypeScript type checking',
  validate: 'Run type-check and lint',
  ci: 'Run complete CI pipeline locally',
  'ci-test': 'Test CI pipeline with CLI validation',
  
  // Release & CI/CD commands
  'prepare-release': 'Prepare release package with version sync',
  'release-patch': 'Bump patch version and prepare release',
  'release-minor': 'Bump minor version and prepare release', 
  'release-major': 'Bump major version and prepare release',
  'create-tag': 'Create and push git tag for current version',
  'deploy-check': 'Verify deployment readiness',
  'simulate-ci': 'Simulate complete CI pipeline locally',
  'check-workflows': 'Verify GitHub Actions workflow files exist',
  'workflow-status': 'Show recent GitHub Actions workflow runs',
  'view-ci': 'Show CI workflow runs',
  'view-deploy': 'Show deployment workflow runs',
  
  // Information commands
  info: 'Show comprehensive project information',
  'info-short': 'Show brief project information',
  'version-info': 'Show version information',
  'project-stats': 'Show project statistics',
  
  // Documentation commands
  help: 'Show help documentation',
  about: 'Show about information',
  changelog: 'Show version history',
  
  // External links
  webstore: 'Open Chrome Web Store page',
  github: 'Open GitHub repository',
  issues: 'Open issue tracker',
  
  // Utilities
  debug: 'Show extension debugging instructions',
  'sync-version': 'Sync version between package.json and manifest.json',
  release: 'Build and package for release',
  zip: 'Create distribution ZIP file',
  'pre-commit': 'Run pre-commit checks (format + validate)',
  
  // Custom CLI commands
  init: 'Initialize a new extension project here',
  serve: 'Start local development server',
  install: 'Install extension in Chrome (requires Chrome CLI)',
};

function showUsage() {
  console.log(`
╔════════════════════════════════════════════════════════════════════════╗
║                    ${packageJson.displayName}                    ║
║                         Command Line Interface                          ║  
╠═════════════════════════════════════════════════════════════════════════╣
║ Version: ${packageJson.version.padEnd(10)} │ Author: ${packageJson.author.name.padEnd(15)} │ License: ${packageJson.license.padEnd(5)} ║
╚═════════════════════════════════════════════════════════════════════════╝

Usage: regexp-download-organizer <command> [options]

📦 Extension Commands:
  build         ${COMMANDS.build}
  dev           ${COMMANDS.dev}  
  proto         ${COMMANDS.proto}
  watch         ${COMMANDS.watch}
  clean         ${COMMANDS.clean}

🔍 Quality Commands:
  lint          ${COMMANDS.lint}
  format        ${COMMANDS.format}
  type-check    ${COMMANDS['type-check']}
  validate      ${COMMANDS.validate}
  ci            ${COMMANDS.ci}
  ci-test       ${COMMANDS['ci-test']}

🚀 Release & CI/CD:
  prepare-release ${COMMANDS['prepare-release']}
  release-patch   ${COMMANDS['release-patch']}
  release-minor   ${COMMANDS['release-minor']}
  release-major   ${COMMANDS['release-major']}
  create-tag      ${COMMANDS['create-tag']}
  deploy-check    ${COMMANDS['deploy-check']}
  simulate-ci     ${COMMANDS['simulate-ci']}
  check-workflows ${COMMANDS['check-workflows']}
  workflow-status ${COMMANDS['workflow-status']}

📊 Info Commands:
  info          ${COMMANDS.info}
  info-short    ${COMMANDS['info-short']}
  version-info  ${COMMANDS['version-info']}
  project-stats ${COMMANDS['project-stats']}

📖 Documentation:
  help          ${COMMANDS.help}
  about         ${COMMANDS.about}
  changelog     ${COMMANDS.changelog}

🔗 Links:
  webstore      ${COMMANDS.webstore}
  github        ${COMMANDS.github}
  issues        ${COMMANDS.issues}

🛠️  Utilities:
  debug         ${COMMANDS.debug}
  sync-version  ${COMMANDS['sync-version']}
  release       ${COMMANDS.release}
  zip           ${COMMANDS.zip}
  pre-commit    ${COMMANDS['pre-commit']}

🚀 CLI Extensions:
  init          ${COMMANDS.init}
  serve         ${COMMANDS.serve}
  install       ${COMMANDS.install}

Examples:
  regexp-download-organizer build          # Build the extension
  regexp-download-organizer proto          # Quick build and test
  regexp-download-organizer ci             # Run CI pipeline locally  
  regexp-download-organizer release-patch  # Bump version and prepare release
  regexp-download-organizer info           # Show project info
  regexp-download-organizer help           # View documentation
  
For more help: regexp-download-organizer help
GitHub: ${packageJson.repository.url.replace('.git', '')}
  `);
}

function runNpmScript(command, args = []) {
  try {
    const npmArgs = ['run', command, ...args];
    const result = spawn('npm', npmArgs, { 
      cwd: projectRoot, 
      stdio: 'inherit',
      shell: true 
    });
    
    result.on('close', (code) => {
      process.exit(code);
    });
    
    result.on('error', (err) => {
      console.error(`Error running npm ${command}:`, err.message);
      process.exit(1);
    });
    
  } catch (error) {
    console.error(`Error executing command: ${error.message}`);
    process.exit(1);
  }
}

function initProject() {
  console.log('🚀 Initializing RegExp Download Organizer extension project...\n');
  
  try {
    console.log('📦 Installing dependencies...');
    execSync('npm install', { cwd: process.cwd(), stdio: 'inherit' });
    
    console.log('\n✅ Project initialized successfully!');
    console.log('\n📖 Next steps:');
    console.log('  1. regexp-download-organizer build    # Build the extension');
    console.log('  2. regexp-download-organizer proto    # Test in Chrome');
    console.log('  3. regexp-download-organizer help     # View documentation');
    console.log('  4. regexp-download-organizer info     # See all commands');
    
  } catch (error) {
    console.error('❌ Initialization failed:', error.message);
    process.exit(1);
  }
}

function serveProject() {
  console.log('🌐 Starting development server...\n');
  console.log('📖 Development Server Guide:');
  console.log('  1. Extension will auto-rebuild on file changes');
  console.log('  2. Reload extension in chrome://extensions/ after changes');
  console.log('  3. Use Ctrl+C to stop the server');
  console.log('  4. Check console output for build status\n');
  
  runNpmScript('dev');
}

function installExtension() {
  console.log('🔧 Chrome Extension Installation Guide:\n');
  console.log('Automated installation requires Chrome to be in PATH.');
  console.log('Manual installation steps:');
  console.log('  1. regexp-download-organizer build    # Build first');
  console.log('  2. Open chrome://extensions/');
  console.log('  3. Enable "Developer mode" (top right)');
  console.log('  4. Click "Load unpacked"');
  console.log('  5. Select the "dist" folder');
  console.log('  6. Extension will be installed and ready to use\n');
  
  // Try to build first
  try {
    console.log('🏗️  Building extension first...');
    execSync('npm run build', { cwd: projectRoot, stdio: 'inherit' });
    console.log('✅ Build complete! Follow manual steps above to install.');
  } catch (error) {
    console.error('❌ Build failed. Fix errors before installing.');
    process.exit(1);
  }
}

// Main CLI logic
const args = process.argv.slice(2);
const command = args[0];
const commandArgs = args.slice(1);

if (!command || command === '--help' || command === '-h') {
  showUsage();
  process.exit(0);
}

if (command === '--version' || command === '-v') {
  console.log(`${packageJson.displayName} v${packageJson.version}`);
  process.exit(0);
}

// Handle custom CLI commands
switch (command) {
  case 'init':
    initProject();
    break;
    
  case 'serve':
    serveProject();
    break;
    
  case 'install':
    installExtension();
    break;
    
  default:
    // Check if it's a valid npm script
    if (COMMANDS[command]) {
      runNpmScript(command, commandArgs);
    } else {
      console.error(`❌ Unknown command: ${command}`);
      console.log('');
      showUsage();
      process.exit(1);
    }
}