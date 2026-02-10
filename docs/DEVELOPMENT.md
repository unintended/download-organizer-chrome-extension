# RegExp Download Organizer - Development Guide

## Overview

This Chrome extension has been modernized with TypeScript, modern tooling, and a streamlined build process.

## Prerequisites
- Node.js 18.0.0 or higher
- npm

## Project Structure
```
src/
├── scripts/          # TypeScript source files
│   ├── manager.ts    # Background service worker
│   ├── options.ts    # Options page logic
│   └── migration.ts  # Migration helper
├── styles/           # CSS files and dependencies
├── assets/           # Images, icons, fonts
├── _locales/         # Internationalization
├── *.html           # HTML pages
└── manifest.json    # Extension manifest

dist/                 # Built extension (ready for Chrome)
```

## Development Commands

### Install Dependencies
```bash
npm install
```

### Development Build
```bash
npm run build
```

### Watch Mode (for development)
```bash
npm run dev
```

### Lint Code
```bash
npm run lint
```

### Format Code
```bash
npm run format
```

### Type Check
```bash
npm run type-check
```

### Package for Distribution
```bash
npm run zip
```

## Loading Extension in Chrome

1. Build the extension: `npm run build`
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode"
4. Click "Load unpacked"
5. Select the `dist/` folder

## Development Workflow

1. Make changes to TypeScript files in `src/scripts/`
2. Run `npm run build` to compile and copy assets
3. Reload extension in Chrome
4. Test functionality

For rapid development, use `npm run dev` which will watch for changes and rebuild automatically.

## Technologies Used

- **TypeScript** - Type-safe JavaScript
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **Chrome Extensions Manifest V3** - Modern extension format
- **ES2022** - Modern JavaScript features

## Build Process

The build process:
1. Compiles TypeScript files to JavaScript
2. Copies HTML, CSS, images, and other assets
3. Outputs everything to `dist/` folder ready for Chrome

## Files Overview

- `src/scripts/manager.ts` - Background service worker handling download events
- `src/scripts/options.ts` - Options page functionality and UI logic  
- `src/scripts/migration.ts` - Handles migration from localStorage to chrome.storage
- `src/options.html` - Options page UI
- `src/offscreen.html` - Offscreen document for migration
- `src/manifest.json` - Extension configuration

## Debugging

1. Background worker logs: Open Chrome Extensions → Inspect views: service worker
2. Options page logs: Open extension options → F12 Developer Tools
3. Console logs show download matching and rule processing

## Common Issues Fixed

### Module Resolution Errors
- ✅ Fixed moment.js imports to use relative paths (`./js/moment-es.js`)
- ✅ Fixed regex pattern replacement in service worker
- ✅ Properly copies all required JavaScript modules

### Service Worker Registration
- ✅ Service worker now properly loads with correct module paths
- ✅ No more "Failed to resolve module specifier" errors

## File Structure
- **Service Worker**: `dist/scripts/manager.js` (background script)
- **Options Page**: `dist/options.html` + `dist/scripts/options.js`
- **Dependencies**: `dist/scripts/js/moment-es.js`, jQuery, Bootstrap

## Distribution

Run `npm run zip` to create a packaged extension ready for Chrome Web Store submission.