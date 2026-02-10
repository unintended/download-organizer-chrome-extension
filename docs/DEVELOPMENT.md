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

### Font Loading Issues
- ✅ Fixed Bootstrap glyphicon font paths
- ✅ Fonts now copied to both `dist/assets/fonts/` and `dist/fonts/` for compatibility
- ✅ No more "Failed to load resource: net::ERR_FILE_NOT_FOUND" errors for fonts

#### Font Loading Fix Details
**Problem:** Bootstrap CSS expected fonts at `../fonts/` relative to CSS location, but build only copied to `dist/assets/fonts/`.
**Solution:** Updated `scripts/copy-assets.cjs` to copy fonts to both locations:
```javascript
// Copy fonts to root fonts directory for Bootstrap compatibility
fs.mkdirSync('dist/fonts', { recursive: true });
copyRecursive('src/assets/fonts', 'dist/fonts');
```
**Result:** Fonts available at both `dist/assets/fonts/` (organized) and `dist/fonts/` (Bootstrap-compatible).

## Troubleshooting

### Build Issues
| Problem | Solution |
|---------|----------|
| **Font loading errors** | Fonts are copied to multiple locations during build. Run `npm run build` to ensure proper copying. |
| **TypeScript compilation errors** | Run `npm run type-check` to validate types. Check `tsconfig.json` for path mappings. |
| **Missing dependencies** | Run `npm install` to ensure all packages are installed. |
| **Extension not loading** | Verify `dist/manifest.json` exists and has correct paths. |

### Development Issues  
| Problem | Solution |
|---------|----------|
| **Watch mode not working** | Restart with `npm run dev`. Check file permissions in project directory. |
| **Changes not reflected** | Hard refresh extension in Chrome (remove and re-add from `chrome://extensions/`). |
| **Console errors in options** | Check Developer Tools in options page. Verify all CSS/JS files loaded correctly. |
| **Background worker issues** | Check service worker logs in Chrome Extensions page. |

### VS Code Integration Issues
| Problem | Solution |
|---------|----------|
| **Tasks not appearing** | Open the `.code-workspace` file, not individual folders. |
| **Build shortcuts not working** | Ensure workspace is loaded. Check `Ctrl+Shift+P` → "Tasks: Configure Task" to verify task definitions. |
| **TypeScript errors in IDE** | Reload VS Code window. Verify TypeScript extension is installed. |

## File Structure
- **Service Worker**: `dist/scripts/manager.js` (background script)
- **Options Page**: `dist/options.html` + `dist/scripts/options.js`
- **Dependencies**: `dist/scripts/js/moment-es.js`, jQuery, Bootstrap

## VS Code Integration

For the optimal development experience, use the VS Code workspace configuration:

### Opening the Workspace
1. Open `download-organizer-chrome-extension.code-workspace` in VS Code
2. Click "Open Workspace" when prompted
3. VS Code automatically configures TypeScript, ESLint, debugging, and tasks

### Key Features
- **25+ Integrated Tasks**: Access via `Ctrl+Shift+P` → "Tasks: Run Task"
- **Keyboard Shortcuts**: 
  - `Ctrl+Shift+B` → Build Extension
  - `Ctrl+Shift+T` → Run CI Pipeline
  - `Ctrl+Shift+W` → Watch Mode
  - `F5` → Debug in Chrome
- **Organized Folders**: Source, Distribution, Documentation views
- **Debugging Setup**: Chrome extension debugging with source maps
- **Extension Recommendations**: GitHub Actions, ESLint, Prettier, etc.

### Task Categories
- **🏗️ Build Tasks**: Build, watch, clean, package
- **🔄 CI/CD Tasks**: Local CI pipeline, deployment checks
- **📈 Release Tasks**: Automated version bumping and releases
- **🔍 Quality Tasks**: Linting, formatting, type checking
- **🐞 Debug Tasks**: Chrome debugging configurations

See [Workspace Guide](WORKSPACE.md) for complete VS Code integration details.

## Distribution

Run `npm run zip` to create a packaged extension ready for Chrome Web Store submission.