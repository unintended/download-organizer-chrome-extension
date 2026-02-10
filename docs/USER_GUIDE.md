# 📦 RegExp Download Organizer - User Guide

## 🎯 What It Does

Transform your chaotic Downloads folder into an organized file system with intelligent rules. RegExp Download Organizer automatically sorts downloads using powerful regular expressions, creating meaningful directory structures without manual file management.

## 🌟 Key Features

- **Smart Pattern Matching**: Use regex to match URLs, filenames, MIME types, and more
- **Dynamic Folders**: Create directory structures with variables and date formatting  
- **Flexible Rules**: Multiple criteria with priority ordering and enable/disable controls
- **Zero Setup**: Works immediately with sensible defaults
- **Privacy-First**: No external servers, all data stored locally in Chrome

## 🚀 Getting Started

### Installation
1. **Chrome Web Store**: Install [RegExp Download Organizer](https://chrome.google.com/webstore/detail/regexp-download-organizer/oamembonjndgangicfphlckkdmagpjlg)
2. **Configure Rules**: Right-click extension icon → Options
3. **Start Downloading**: Files automatically organize based on your rules

### Basic Setup
1. Open the extension options page
2. Click "🆕 New rule" to create your first rule
3. Define what to match (URL, filename, etc.)
4. Set where files should go (destination pattern)
5. Save and test by downloading a file

## 📋 Creating Rules

### Rule Components

Each rule contains three main parts:

| Component | Description | Example |
|-----------|-------------|---------|
| **Match Fields** | What to check | URL, filename, MIME type |
| **Pattern** | Where to save | `Downloads/Images/${filename}` |
| **Conflict Action** | Handle duplicates | Overwrite, rename, skip |

### Available Match Fields

- **URL**: The download URL
- **Final URL**: URL after redirects
- **Filename**: Original filename
- **MIME Type**: File type (image/png, text/html, etc.)
- **Referrer**: Page that initiated download
- **Tab URL**: Current tab URL (requires permission)

### Pattern Variables

Use `${variable}` syntax in destination paths:

| Variable | Description | Example |
|----------|-------------|---------|
| `${filename}` | Original filename | `document.pdf` |
| `${url:1}` | First regex capture group | From `github.com/(user)/repo` → `user` |
| `${date}` | Current date | `2026-02-09` |
| `${date:YYYY/MM}` | Custom date format | `2026/02` |

## 🎯 Common Use Cases

### Organize by File Type
```
MIME Type: ^image/
Pattern: Downloads/Images/${filename}
```
*Saves all images to Downloads/Images/*

### Organize by Date  
```
Pattern: Downloads/${date:YYYY/MM}/${filename}
```
*Creates monthly folders: Downloads/2026/02/filename*

### Extract from URL
```
URL: github\.com/([^/]+)/([^/]+)
Pattern: Code/${url:1}/${url:2}/${filename}
```
*From github.com/user/repo → Code/user/repo/filename*

### Sort by Website
```
URL: amazon\.com
Pattern: Shopping/Amazon/${filename}
```
*All Amazon downloads go to Shopping/Amazon/*

## 🔧 Advanced Features

### Date Formatting
Use [moment.js formats](https://momentjs.com/docs/#/displaying/format/) with `${date:format}`:

| Format | Result | Use Case |
|--------|--------|----------|
| `YYYY-MM-DD` | 2026-02-09 | ISO date format |
| `YYYY/MM` | 2026/02 | Monthly folders |
| `DD-MMM-YYYY` | 09-Feb-2026 | Human-readable |
| `dddd` | Sunday | Day-based organization |

### Regex Capture Groups
Extract parts of URLs or filenames using parentheses:

```
URL: https://example\.com/user/([^/]+)/files/(.+)
Pattern: Users/${url:1}/Files/${url:2}
```
*Extracts username and file path from URL*

### MIME Type Detection
The extension automatically detects file types with intelligent fallbacks:
- Uses server-provided MIME types when available
- Falls back to file extension detection
- Handles common server misconfigurations

## 🐛 Troubleshooting

### Rule Not Working?

1. **Check Console Output**:
   - Go to `chrome://extensions/`
   - Find "RegExp Download Organizer" 
   - Click "Inspect views: service worker"
   - Download a file and check console for "Downloading item"

2. **Verify Pattern**:
   - Test regex patterns at [regex101.com](https://regex101.com)
   - Ensure special characters are escaped
   - Check that capture groups exist if using `${url:1}`

3. **Rule Priority**:
   - Rules process in order (top to bottom)
   - Move specific rules before general ones
   - Use up/down arrows to reorder

### Common Issues

| Problem | Solution |
|---------|----------|
| **Files not moving** | Check target directory permissions and conflict action |
| **Pattern not matching** | Verify regex syntax and available fields in console |
| **Permission errors** | Enable "tabs" permission for `${tabUrl}` matching |
| **Date format issues** | Check moment.js format documentation |

### Debug Console
The service worker console shows detailed information:
```
Downloading item: {
  url: "https://example.com/file.pdf",
  filename: "document.pdf", 
  mime: "application/pdf"
}
```

## ⚙️ Permissions

| Permission | Purpose | Required |
|------------|---------|----------|
| **Downloads** | Intercept and redirect downloads | ✅ Yes |
| **Storage** | Save rules and settings | ✅ Yes |
| **Tabs** | Access tab URL for `${tabUrl}` | ❌ Optional |
| **Offscreen** | One-time migration from old versions | ❌ Temporary |

## 🎯 Best Practices

1. **Start Simple**: Test basic patterns before creating complex rules
2. **Use Console**: Always check the debug output when creating rules
3. **Order Matters**: Put specific rules before general catchalls
4. **Test Thoroughly**: Download various file types to verify rules
5. **Backup Rules**: Export your configuration regularly
6. **Escape Special Characters**: Use `\.` for literal dots in domains

## 🌟 Example Configurations

### Content Creator Setup
```
# Images by date
MIME Type: ^image/
Pattern: Media/Images/${date:YYYY/MM}/${filename}

# Videos by source  
URL: youtube\.com
Pattern: Media/Videos/YouTube/${filename}

# Audio files
MIME Type: ^audio/
Pattern: Media/Audio/${date:YYYY}/${filename}
```

### Developer Setup
```
# GitHub downloads
URL: github\.com/([^/]+)/([^/]+)
Pattern: Code/${url:1}/${url:2}/${filename}

# Documentation
MIME Type: application/pdf
URL: docs?\.|documentation
Pattern: Docs/${date:YYYY-MM}/${filename}

# Development tools
URL: (npmjs|nodejs|github\.com.*releases)
Pattern: DevTools/${filename}
```

### Student/Researcher Setup
```
# Academic papers
MIME Type: application/pdf
Pattern: Research/Papers/${date:YYYY}/${filename}

# Course materials
Referrer: (edu|university|course)
Pattern: Education/${date:YYYY-MM}/${filename}

# Reference images
MIME Type: ^image/
Referrer: (wikipedia|wikimedia)
Pattern: Research/References/${filename}
```

## 📞 Support

- **Issues**: [GitHub Issues](https://github.com/unintended/download-organizer-chrome-extension/issues)
- **Chrome Store**: [Extension Page](https://chrome.google.com/webstore/detail/regexp-download-organizer/oamembonjndgangicfphlckkdmagpjlg)
- **Documentation**: [Development Guide](DEVELOPMENT.md)

---

*RegExp Download Organizer - Bringing order to digital chaos, one download at a time.*