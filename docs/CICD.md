# Chrome Web Store CI/CD Setup Guide

This guide explains how to set up automated deployment to the Chrome Web Store using GitHub Actions.

## 🚀 Overview

The CI/CD pipeline provides:

- **Continuous Integration**: Automated testing, building, and validation on every push/PR
- **Continuous Deployment**: Automated publishing to Chrome Web Store on releases
- **Quality Assurance**: Type checking, linting, security scanning
- **Version Management**: Automatic version synchronization

## 🔧 Setup Instructions

### 1. Chrome Web Store API Setup

#### A. Enable Chrome Web Store API

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the **Chrome Web Store API**
4. Go to **APIs & Services** → **Credentials**

#### B. Create OAuth2 Credentials

1. Click **Create Credentials** → **OAuth client ID**
2. Application type: **Desktop application**
3. Name: `Chrome Extension CI/CD`
4. Download the credentials JSON file

#### C. Generate Refresh Token

Use this Node.js script to generate a refresh token:

```javascript
// get-refresh-token.js
const https = require('https');
const querystring = require('querystring');

const clientId = 'YOUR_CLIENT_ID';
const clientSecret = 'YOUR_CLIENT_SECRET';

// Step 1: Get authorization code (manual step)
const authUrl = `https://accounts.google.com/o/oauth2/auth?` +
  `response_type=code&` +
  `scope=https://www.googleapis.com/auth/chromewebstore&` +
  `client_id=${clientId}&` +
  `redirect_uri=urn:ietf:wg:oauth:2.0:oob`;

console.log('1. Visit this URL:', authUrl);
console.log('2. Copy the authorization code');
console.log('3. Run: node get-refresh-token.js YOUR_AUTH_CODE');

const authCode = process.argv[2];
if (!authCode) {
  console.log('Usage: node get-refresh-token.js <auth_code>');
  process.exit(1);
}

// Step 2: Exchange code for refresh token
const postData = querystring.stringify({
  grant_type: 'authorization_code',
  client_id: clientId,
  client_secret: clientSecret,
  redirect_uri: 'urn:ietf:wg:oauth:2.0:oob',
  code: authCode
});

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
    const response = JSON.parse(data);
    console.log('✅ Refresh token:', response.refresh_token);
  });
});

req.write(postData);
req.end();
```

### 2. GitHub Repository Secrets

Add these secrets to your GitHub repository:

Go to **Settings** → **Secrets and variables** → **Actions** → **New repository secret**

| Secret Name | Description | Example |
|-------------|-------------|---------|
| `CHROME_CLIENT_ID` | OAuth2 Client ID | `123456789.apps.googleusercontent.com` |
| `CHROME_CLIENT_SECRET` | OAuth2 Client Secret | `GOCSPX-xxxxxxxxxxxxxxxxxxxxx` |
| `CHROME_REFRESH_TOKEN` | OAuth2 Refresh Token | `1//xxxxxxxxxxxxxxxxxxxxx` |
| `CHROME_EXTENSION_ID` | Extension ID from Chrome Web Store | `oamembonjndgangicfphlckkdmagpjlg` |

### 3. Extension ID

Get your extension ID from:
- Chrome Web Store Developer Dashboard
- Or from the extension URL: `chrome-extension://EXTENSION_ID/`

## 📋 Workflow Triggers

### CI Pipeline (`ci.yml`)
Triggers on:
- Push to `master`, `main`, or `develop` branches
- Pull requests to `master` or `main`
- Manual dispatch

**Actions:**
- Multi-node testing (Node 18, 20)
- TypeScript compilation
- Build verification
- CLI testing
- Security scanning
- Artifact creation

### Deployment Pipeline (`deploy.yml`)
Triggers on:
- GitHub releases (published)
- Version tags (`v*`)

**Actions:**
- Build production extension
- Update version numbers
- Create ZIP package
- Upload to Chrome Web Store
- Publish extension
- Create GitHub release assets

## 🎯 Usage Examples

### Creating a Release

#### Option 1: GitHub Release
```bash
# Create and push a tag
git tag v1.2.3
git push origin v1.2.3

# Or create release through GitHub UI
```

#### Option 2: npm Version
```bash
# Bump version and create tag
npm version patch  # or minor/major
git push origin master --tags
```

#### Option 3: CLI Release
```bash
# Use your CLI tool
rdo release  # if you add this command
```

### Manual Deployment

Force deployment without tag:
```bash
# Trigger workflow manually
gh workflow run deploy.yml
```

## 🔍 Monitoring

### Check CI Status
- View GitHub Actions tab
- Check build artifacts
- Monitor test results

### Chrome Web Store Status
- Chrome Web Store Developer Dashboard
- Extension analytics
- User reviews and ratings

### Deployment Logs
```bash
# View recent workflow runs
gh run list --workflow=deploy.yml

# View specific run logs  
gh run view <run_id> --log
```

## 🛠️ Troubleshooting

### Common Issues

**Authentication Errors:**
```bash
# Verify secrets are set correctly
gh secret list

# Test API access locally
curl -H "Authorization: Bearer <access_token>" \
  https://www.googleapis.com/chromewebstore/v1.1/items/<extension_id>
```

**Build Failures:**
- Check Node.js version compatibility
- Verify all dependencies are in `package.json`
- Ensure build scripts work locally

**Version Mismatches:**
- Use `npm run sync-version` before releases
- Verify version in both `package.json` and `manifest.json`

**Upload Failures:**
- Check ZIP file size (< 128MB)
- Verify manifest format
- Ensure all required files are included

## 🔐 Security Best Practices

1. **Rotate Credentials**: Regularly update OAuth tokens
2. **Limit Permissions**: Use minimal required scopes
3. **Monitor Access**: Check Cloud Console audit logs
4. **Environment Isolation**: Separate dev/prod credentials
5. **Secret Rotation**: Update GitHub secrets periodically

## 🚀 Advanced Configuration

### Custom Build Steps

Add to workflow:
```yaml
- name: Custom preprocessing
  run: |
    # Your custom build steps
    npm run custom-build
    
- name: Code signing
  run: |
    # Sign extension if needed
    npm run sign
```

### Conditional Publishing

Deploy only on specific branches:
```yaml
- name: Deploy to Chrome Web Store
  if: github.ref == 'refs/heads/main'
  uses: mobilefirstllc/cws-publish@latest
```

### Slack/Discord Notifications

Add notification steps:
```yaml
- name: Notify team
  uses: 8398a7/action-slack@v3
  with:
    status: ${{ job.status }}
    webhook_url: ${{ secrets.SLACK_WEBHOOK }}
```

## 📊 Analytics Integration

Monitor deployment metrics:
- Extension install rates
- User engagement
- Error rates
- Performance metrics

This CI/CD setup provides a robust, automated pipeline for Chrome extension development and deployment!