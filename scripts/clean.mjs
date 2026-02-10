#!/usr/bin/env node

import { rmSync, existsSync, readdirSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';

const projectRoot = process.cwd();

// Clean dist directory
const distPath = join(projectRoot, 'dist');
if (existsSync(distPath)) {
    console.log('Removing dist directory...');
    rmSync(distPath, { recursive: true, force: true });
}

// Clean .chrome-debug directory  
const debugPath = join(projectRoot, '.chrome-debug');
if (existsSync(debugPath)) {
    console.log('Removing .chrome-debug directory...');
    rmSync(debugPath, { recursive: true, force: true });
}

// Clean .zip files
try {
    const files = readdirSync(projectRoot);
    const zipFiles = files.filter(file => file.endsWith('.zip'));
    
    for (const zipFile of zipFiles) {
        const zipPath = join(projectRoot, zipFile);
        console.log(`Removing ${zipFile}...`);
        rmSync(zipPath, { force: true });
    }
    
    if (zipFiles.length === 0) {
        console.log('No .zip files to remove.');
    }
} catch (error) {
    console.warn('Warning: Could not clean .zip files:', error.message);
}

console.log('✅ Cleanup complete!');