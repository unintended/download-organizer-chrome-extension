# CLI Usage Guide

The RegExp Download Organizer includes a powerful command-line interface (CLI) that makes development easier and provides access to all project functionality from the terminal.

## 📦 Installation

### Global Installation

```bash
npm install -g regexp-download-organizer
```

After installation, you can use either:
- `regexp-download-organizer` (full name)
- `rdo` (short alias)

### Local Development

```bash
# Clone and setup
git clone https://github.com/unintended/download-organizer-chrome-extension.git
cd download-organizer-chrome-extension
npm install

# Link for global access during development
npm link
```

## 🚀 Commands

### Extension Development

```bash
# Build the extension
rdo build

# Quick build and test in Chrome
rdo proto  

# Development with watch mode
rdo dev

# Watch for changes only
rdo watch

# Clean build artifacts
rdo clean
```

### Code Quality

```bash
# Lint code
rdo lint

# Format code with Prettier
rdo format

# Type checking
rdo type-check

# Run all quality checks
rdo validate
```

### Information & Documentation

```bash
# Comprehensive project info
rdo info

# Brief project info
rdo info-short

# Version information
rdo version-info

# Project statistics
rdo project-stats

# View help documentation
rdo help

# About the extension
rdo about

# Version history
rdo changelog
```

### External Links

```bash
# Open Chrome Web Store page
rdo webstore

# Open GitHub repository  
rdo github

# Open issue tracker
rdo issues
```

### Development Utilities

```bash
# Extension debugging guide
rdo debug

# Sync versions between package.json and manifest.json
rdo sync-version

# Build and package for release
rdo release

# Create distribution ZIP
rdo zip
```

### CLI-Specific Commands

```bash
# Initialize new extension project in current directory
rdo init

# Start development server with auto-reload
rdo serve

# Install extension in Chrome (with guidance)
rdo install
```

## 💡 Usage Examples

### Quick Start for New Project

```bash
mkdir my-download-organizer
cd my-download-organizer
rdo init
```

### Development Workflow

```bash
# Start development
rdo serve

# In another terminal - test changes
rdo proto

# Quality check before commit
rdo validate

# Create release package
rdo release
```

### Information Gathering

```bash
# Get project overview
rdo info

# Check versions are synchronized
rdo version-info

# View documentation
rdo help

# See what files exist
rdo project-stats
```

## 🔧 Global vs Local Usage

### Global Installation Benefits
- Use `rdo` command anywhere
- Initialize new projects easily
- Access documentation from any directory
- Consistent command interface

### Local Development Benefits  
- Uses project-specific dependencies
- No global package conflicts
- Full access to npm scripts
- Works with existing workflows

## 📖 Help & Documentation

```bash
# Show all available commands
rdo --help

# Get version
rdo --version

# View detailed help
rdo help

# Debug extension development
rdo debug
```

## 🎯 Integration with IDEs

The CLI works seamlessly with:
- **VS Code**: Use terminal or tasks
- **WebStorm**: Run configurations
- **Command Line**: Cross-platform compatibility

### VS Code Integration Example

Add to `.vscode/tasks.json`:
```json
{
    "version": "2.0.0",
    "tasks": [
        {
            "label": "Build Extension",
            "type": "shell",
            "command": "rdo",
            "args": ["build"],
            "group": "build"
        },
        {
            "label": "Start Development",
            "type": "shell", 
            "command": "rdo",
            "args": ["serve"],
            "group": "build"
        }
    ]
}
```

## 🚀 Advanced Usage

### Custom Commands

The CLI automatically detects and runs npm scripts, so you can add custom commands to `package.json` and run them via:

```bash
rdo your-custom-command
```

### Environment Variables

```bash
# Set custom build environment
NODE_ENV=production rdo build

# Enable debug output
DEBUG=* rdo serve
```

### Automation

```bash
#!/bin/bash
# Build and test script
rdo clean
rdo build
rdo validate
echo "Extension ready for testing!"
```

## 🆘 Troubleshooting

**Command not found:**
```bash
npm install -g regexp-download-organizer
```

**Permission errors on Mac/Linux:**
```bash  
sudo npm install -g regexp-download-organizer
```

**Local development setup:**
```bash
git clone <repo>
cd download-organizer-chrome-extension  
npm install
npm link
```

**Reset global installation:**
```bash
npm uninstall -g regexp-download-organizer
npm install -g regexp-download-organizer
```

## 📞 Support

- **CLI Issues**: Use `rdo issues` to report problems
- **Documentation**: Use `rdo help` for comprehensive guides
- **GitHub**: Use `rdo github` to access repository