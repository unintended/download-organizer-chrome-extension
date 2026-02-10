# RegExp Download Organizer

Chrome extension that allows you to set custom download locations with flexible regexp-based rules.

[![Chrome Web Store](https://img.shields.io/chrome-web-store/v/oamembonjndgangicfphlckkdmagpjlg.svg)](https://chrome.google.com/webstore/detail/regexp-download-organizer/oamembonjndgangicfphlckkdmagpjlg)
[![Chrome Web Store Users](https://img.shields.io/chrome-web-store/users/oamembonjndgangicfphlckkdmagpjlg.svg)](https://chrome.google.com/webstore/detail/regexp-download-organizer/oamembonjndgangicfphlckkdmagpjlg)

## 🚀 Installation

**From Chrome Web Store:**
[Install RegExp Download Organizer](https://chrome.google.com/webstore/detail/regexp-download-organizer/oamembonjndgangicfphlckkdmagpjlg)

**CLI Installation (for developers):**
```bash
npm install -g regexp-download-organizer
# Or using short alias:
rdo --help
```

## 🔧 Development

See [Development Guide](docs/DEVELOPMENT.md) for setting up the development environment.

**CLI Documentation**: See [CLI Guide](docs/CLI.md) for complete command-line interface documentation.

### Quick Commands

```bash
npm run info          # Project overview and commands
npm run proto         # Build and test in Chrome
npm run dev           # Development watch mode  
npm run help          # View help documentation
npm run about         # About this extension
npm run changelog     # Version history
```

### CLI Usage

If installed globally, you can use the CLI from anywhere:

```bash
# Full command name
regexp-download-organizer build     # Build the extension
regexp-download-organizer proto     # Quick build and test
regexp-download-organizer info      # Project information
regexp-download-organizer help      # View documentation

# Short alias
rdo build            # Same as above, shorter
rdo --help           # Show all available commands
rdo --version        # Show version

# CLI-specific commands
rdo init             # Initialize new extension project
rdo serve            # Start development server
rdo install          # Install extension in Chrome
```

## 🐛 Debugging

Before opening an issue, please debug the extension to understand which fields are suitable for your rule:

1. Open `chrome://extensions/`
2. Find "RegExp Download Organizer" and click "Inspect views: service worker"
3. Download something and check the console output
4. Look for "Downloading item" - this shows all available fields for creating rules

The console output shows the structure of download items, helping you create effective rules. Different sites have different link structures, so there's no universal rule for all sites.

If you need help, open an issue and include the console output for your specific download.

## 📄 License

See [LICENSE](LICENSE) file.
