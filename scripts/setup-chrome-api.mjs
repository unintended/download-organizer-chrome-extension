#!/usr/bin/env node

/**
 * Chrome Web Store API Setup Helper
 * Helps users generate the required credentials for CI/CD deployment
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { createInterface } from 'readline';
import https from 'https';
import { URL } from 'url';

const rl = createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (prompt) => new Promise(resolve => rl.question(prompt, resolve));

console.log(`
╔════════════════════════════════════════════════════════════════════════╗
║              Chrome Web Store API Setup Helper                        ║
╚════════════════════════════════════════════════════════════════════════╝

This script helps you set up automated deployment to Chrome Web Store.

📋 You will need:
1. Google Cloud Console project with Chrome Web Store API enabled
2. OAuth2 Desktop Application credentials  
3. Extension ID from Chrome Web Store
4. GitHub repository with Actions enabled

🔗 Helpful links:
• Google Cloud Console: https://console.cloud.google.com/
• Chrome Web Store API: https://developers.google.com/webstore/using_webstore_api
• GitHub Secrets: https://github.com/your-repo/settings/secrets/actions

`);

async function main() {
  try {
    const setup = await collectCredentials();
    await generateRefreshToken(setup);
    await createInstructions(setup);
    
    console.log(`
✅ Setup completed successfully!

📝 Next steps:
1. Add the generated secrets to your GitHub repository
2. Commit and push the workflow files
3. Create a release or tag to trigger deployment

🚀 Your CI/CD pipeline is ready!
    `);
    
  } catch (error) {
    console.error('\n❌ Setup failed:', error.message);
    console.log('\n📖 See docs/CICD.md for detailed setup instructions');
  } finally {
    rl.close();
  }
}

async function collectCredentials() {
  console.log('📝 Step 1: OAuth2 Credentials');
  
  const clientId = await question('Enter your OAuth2 Client ID: ');
  if (!clientId || !clientId.includes('.apps.googleusercontent.com')) {
    throw new Error('Invalid Client ID format');
  }
  
  const clientSecret = await question('Enter your OAuth2 Client Secret: ');
  if (!clientSecret) {
    throw new Error('Client Secret is required');
  }
  
  console.log('\n📝 Step 2: Extension Information');
  
  const extensionId = await question('Enter your Chrome Extension ID: ');
  if (!extensionId || extensionId.length !== 32) {
    throw new Error('Invalid Extension ID format (should be 32 characters)');
  }
  
  return { clientId, clientSecret, extensionId };
}

async function generateRefreshToken(setup) {
  console.log('\n🔑 Step 3: Generate Refresh Token');
  
  const authUrl = new URL('https://accounts.google.com/o/oauth2/auth');
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('scope', 'https://www.googleapis.com/auth/chromewebstore');
  authUrl.searchParams.set('client_id', setup.clientId);
  authUrl.searchParams.set('redirect_uri', 'urn:ietf:wg:oauth:2.0:oob');
  authUrl.searchParams.set('access_type', 'offline');
  
  console.log(`
🌐 Please visit this URL in your browser:
${authUrl.toString()}

1. Sign in with your Google account
2. Grant permission to Chrome Web Store API
3. Copy the authorization code from the page
  `);
  
  const authCode = await question('Enter the authorization code: ');
  if (!authCode) {
    throw new Error('Authorization code is required');
  }
  
  console.log('\n🔄 Exchanging code for refresh token...');
  
  return new Promise((resolve, reject) => {
    const postData = new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: setup.clientId,
      client_secret: setup.clientSecret,
      redirect_uri: 'urn:ietf:wg:oauth:2.0:oob',
      code: authCode
    }).toString();
    
    const req = https.request('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Content-Length': postData.length
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const response = JSON.parse(data);
          if (response.refresh_token) {
            setup.refreshToken = response.refresh_token;
            console.log('✅ Refresh token generated successfully!');
            resolve(setup);
          } else {
            reject(new Error('Failed to get refresh token: ' + (response.error || 'Unknown error')));
          }
        } catch (err) {
          reject(new Error('Failed to parse token response: ' + err.message));
        }
      });
    });
    
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

async function createInstructions(setup) {
  console.log('\n📋 Step 4: GitHub Secrets Setup');
  
  const secrets = [
    { name: 'CHROME_CLIENT_ID', value: setup.clientId },
    { name: 'CHROME_CLIENT_SECRET', value: setup.clientSecret },
    { name: 'CHROME_REFRESH_TOKEN', value: setup.refreshToken },
    { name: 'CHROME_EXTENSION_ID', value: setup.extensionId }
  ];
  
  console.log(`
🔐 Add these secrets to your GitHub repository:
Go to: Settings → Secrets and variables → Actions

`);
  
  secrets.forEach(secret => {
    console.log(`🔑 ${secret.name}:`);
    console.log(`   ${secret.value}`);
    console.log('');
  });
  
  // Save to local file for reference
  const secretsFile = 'github-secrets.txt';
  const content = `
# GitHub Secrets for Chrome Web Store CI/CD
# Add these to: Settings → Secrets and variables → Actions

CHROME_CLIENT_ID=${setup.clientId}
CHROME_CLIENT_SECRET=${setup.clientSecret}
CHROME_REFRESH_TOKEN=${setup.refreshToken}
CHROME_EXTENSION_ID=${setup.extensionId}

# Generated on: ${new Date().toISOString()}
# Extension URL: https://chrome.google.com/webstore/detail/regexp-download-organizer/${setup.extensionId}

# Security Note:
# - Keep these credentials secure
# - Do not commit this file to version control
# - Rotate credentials periodically
  `.trim();
  
  writeFileSync(secretsFile, content);
  console.log(`💾 Secrets saved to: ${secretsFile}`);
  console.log(`⚠️  This file contains sensitive information - do not commit to git!`);
  
  // Create .gitignore entry if needed
  const gitignoreFile = '.gitignore';
  if (existsSync(gitignoreFile)) {
    const gitignore = readFileSync(gitignoreFile, 'utf-8');
    if (!gitignore.includes('github-secrets.txt')) {
      writeFileSync(gitignoreFile, gitignore + '\n# Chrome Web Store credentials\ngithub-secrets.txt\n');
      console.log(`✅ Added ${secretsFile} to .gitignore`);
    }
  }
}

// Run the setup
main().catch(error => {
  console.error('❌ Fatal error:', error.message);
  process.exit(1);
});