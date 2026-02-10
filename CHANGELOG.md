# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.5.1] - 2026-02-09

### Added
- Modern TypeScript development environment
- ESLint and Prettier code quality tools
- VS Code workspace configuration with debugging support
- Comprehensive build system with npm scripts
- Development documentation in `docs/DEVELOPMENT.md`

### Changed
- Migrated codebase from JavaScript to TypeScript
- Updated build system from Vite to simpler tsc + asset copying
- Reorganized project structure with clean `src/` directory
- Enhanced VS Code integration with tasks and debugging

### Fixed
- Module resolution issues with moment.js imports
- Service worker registration problems (Status code: 15)
- Build system compatibility with Chrome extension requirements
- File structure cleanup and duplicate removal

### Technical
- TypeScript 5.3.0 with strict type checking
- ES2022 modules with proper Chrome extension support
- Chrome Extensions Manifest V3 compliance
- Node.js >=18.0.0 requirement

## [0.5.0] - Previous Release

### Features
- RegExp-based download organization rules
- Custom download location setting
- Date-based filename patterns using moment.js
- Rule priority and conflict resolution
- Tab URL and referrer matching
- MIME type detection and overrides
- Chrome storage integration with migration support

### Permissions
- `downloads` - Monitor and modify download behavior
- `storage` - Save user rules and settings
- `offscreen` - Migration from localStorage
- `tabs` (optional) - Access tab information for advanced rules

## [Previous Versions]

See git history for detailed changes in earlier versions.