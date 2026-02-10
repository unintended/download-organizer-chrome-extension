# RegExp Download Organizer - Help Guide

## 🎯 Overview

RegExp Download Organizer helps you automatically organize your downloads by creating flexible rules based on regular expressions. Instead of everything going to your default Downloads folder, you can set up intelligent patterns to sort files into specific directories.

## 🚀 Getting Started

1. **Install the Extension**: Available on the [Chrome Web Store](https://chrome.google.com/webstore/detail/regexp-download-organizer/oamembonjndgangicfphlckkdmagpjlg)
2. **Configure Rules**: Right-click the extension icon → Options (or visit `chrome://extensions/` and click "Options")
3. **Test Your Rules**: Download files and watch them automatically organize

## 📋 Creating Rules

### Basic Rule Structure

Each rule contains:
- **Rule Fields**: What to match against (URL, filename, MIME type, etc.)
- **Pattern**: Where to save the file (supports variables)
- **Conflict Action**: What to do if file already exists

### Available Fields

- `url` - The download URL
- `finalUrl` - The final URL after redirects
- `filename` - Original filename
- `mime` - File MIME type
- `referrer` - Page that initiated the download
- `tabUrl` - URL of the tab (requires tabs permission)

### Pattern Variables

Use `${fieldname}` in your pattern:
- `${filename}` - Original filename
- `${url:1}` - First regex capture group from URL
- `${date}` - Current date (YYYY-MM-DD)
- `${date:YYYY/MM}` - Custom date format using moment.js

### Example Rules

**Organize by File Type:**
```
MIME Type: ^image/
Pattern: Downloads/Images/${filename}
```

**Organize by Date:**
```
Pattern: Downloads/${date:YYYY/MM}/${filename}
```

**Extract from URL:**
```
URL: github\.com/([^/]+)/([^/]+)
Pattern: Code/${url:1}/${url:2}/${filename}
```

## 🔧 Advanced Features

### Date Formatting

Use moment.js format strings with `${date:format}`:
- `${date:YYYY-MM-DD}` - 2026-02-09
- `${date:YYYY/MM}` - 2026/02
- `${date:DD-MMM-YYYY}` - 09-Feb-2026

### Regex Capture Groups

Use parentheses in your regex to create capture groups, then reference them:
```
URL: https://example\.com/user/([^/]+)/files/(.+)
Pattern: Users/${url:1}/Files/${url:2}
```

### MIME Type Detection

The extension automatically detects MIME types, with fallbacks for common extensions when servers return `application/octet-stream`.

## 🐛 Debugging

To see what fields are available for your downloads:

1. Go to `chrome://extensions/`
2. Find "RegExp Download Organizer"
3. Click "Inspect views: service worker"
4. Download a file and check the console
5. Look for "Downloading item" to see available fields

## ⚙️ Permissions

- **Downloads** - Required to intercept and modify download behavior
- **Storage** - Required to save your rules and settings
- **Offscreen** - Used for one-time migration from localStorage
- **Tabs** - Optional, enables `${tabUrl}` matching

## 🎯 Tips & Best Practices

1. **Test Rules**: Use specific URLs first before creating broad patterns
2. **Use Priorities**: Rules are processed in order - put specific rules first
3. **Debug Console**: Always check the console when creating new rules
4. **Backup Rules**: Export your rules regularly from the options page
5. **Escape Regex**: Remember to escape special characters in regex patterns

## ❓ Common Issues

**Rule Not Matching:**
- Check the console output to see available fields
- Verify your regex pattern with a regex tester
- Ensure the rule is enabled

**Files Not Moving:**
- Check that the target directory exists or will be created
- Verify you have write permissions to the target location
- Make sure the conflict action is set appropriately

**Permission Errors:**
- Grant "tabs" permission if using `${tabUrl}`
- Check Chrome's download settings for conflicts

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/unintended/download-organizer-chrome-extension/issues)
- **Documentation**: [Development Guide](DEVELOPMENT.md)
- **Chrome Store**: [Extension Page](https://chrome.google.com/webstore/detail/regexp-download-organizer/oamembonjndgangicfphlckkdmagpjlg)