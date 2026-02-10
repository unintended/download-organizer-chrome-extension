# About RegExp Download Organizer

## 🎯 Mission

RegExp Download Organizer transforms the chaotic Downloads folder into an organized file system. By leveraging powerful regular expressions, users can create intelligent rules that automatically sort downloads into meaningful directory structures.

## 🌟 Key Features

### Intelligent File Organization
- **Pattern Matching**: Use regex to match URLs, filenames, MIME types, and more
- **Dynamic Paths**: Create folder structures with variables and capture groups
- **Date Integration**: Organize by date with flexible formatting options
- **Conflict Resolution**: Handle duplicate files with customizable actions

### Advanced Rule System
- **Multiple Criteria**: Match on URL, referrer, tab URL, filename, and MIME type
- **Capture Groups**: Extract parts of URLs or filenames for folder names
- **Priority System**: Rules processed in order for precise control
- **Enable/Disable**: Toggle rules without deleting them

### Developer-Friendly
- **Modern TypeScript**: Built with TypeScript for reliability and maintainability
- **Chrome Manifest V3**: Uses latest Chrome extension standards
- **Service Worker**: Efficient background processing
- **Console Debugging**: Detailed logging for rule development

## 🏗️ Technical Architecture

### Core Technologies
- **TypeScript 5.3+**: Type-safe development with modern JavaScript features
- **Chrome Extensions API**: Deep integration with browser download system
- **Regular Expressions**: Powerful pattern matching engine
- **Moment.js**: Flexible date formatting and manipulation

### Extension Structure
- **Service Worker**: Background script handling download events
- **Options Page**: Clean UI for rule management and configuration
- **Storage API**: Persistent rule and configuration storage
- **Offscreen Document**: Secure migration from localStorage

### Permissions Model
- **Minimal Permissions**: Only requests what's necessary
- **Optional Tabs**: Tab URL matching requires user consent
- **Secure Storage**: Chrome's built-in storage API for data protection

## 📊 Use Cases

### Content Creators
- Sort images, videos, and audio by project or date
- Organize downloads from different platforms automatically
- Create time-based archives of creative assets

### Developers
- Organize code downloads by project or language
- Sort documentation and resources by technology
- Automatically categorize build artifacts and releases

### Researchers & Students
- Organize papers and documents by topic or date
- Sort downloads from educational platforms
- Create structured research archives

### General Users
- Eliminate Downloads folder chaos
- Organize by file type, source, or date
- Create custom organization schemes

## 🔒 Privacy & Security

### Data Handling
- **Local Storage**: All rules and settings stored locally in Chrome
- **No External Servers**: Extension operates entirely offline
- **No Data Collection**: Zero telemetry or user data collection
- **Open Source**: Full transparency with public source code

### Permissions
- **Downloads**: Monitor download events to apply rules
- **Storage**: Save user configuration and rules
- **Optional Tabs**: Access tab information for advanced matching
- **No Network Access**: Extension cannot access external websites

## 🛠️ Development

### Modern Toolchain
- **TypeScript**: Full type safety and modern JavaScript features
- **ESLint & Prettier**: Consistent code quality and formatting
- **VS Code Integration**: Comprehensive development environment
- **npm Scripts**: Streamlined build and development workflow

### Quality Assurance
- **Type Checking**: Compile-time error detection
- **Linting**: Automated code quality checks
- **Chrome API Types**: Full type coverage for Chrome extension APIs
- **Modern Standards**: ES2022 modules and latest best practices

### Extension Development
- **Hot Reload**: Quick development iteration with watch mode
- **Debug Support**: VS Code debugging configuration
- **Build System**: Efficient compilation and asset bundling
- **Packaging**: Automated ZIP creation for distribution

## 🌍 Community

### Open Source
- **MIT License**: Free and open source software
- **GitHub**: Public repository with issue tracking
- **Contributions**: Community contributions welcome
- **Documentation**: Comprehensive guides and examples

### Support Channels
- **GitHub Issues**: Bug reports and feature requests
- **Chrome Web Store**: User reviews and ratings
- **Documentation**: Extensive help guides and tutorials

## 📈 Impact

Since its release, RegExp Download Organizer has helped thousands of users:
- **Time Savings**: Eliminates manual file organization
- **Productivity**: Reduces cognitive overhead of file management
- **Organization**: Creates consistent, logical file structures
- **Automation**: Set-and-forget download organization

## 🚀 Future Vision

We're committed to evolving RegExp Download Organizer with:
- **Enhanced Patterns**: More powerful matching capabilities
- **UI Improvements**: Easier rule creation and management
- **Integration**: Better workflow integration with popular tools
- **Performance**: Continued optimization and reliability improvements

## 💻 Technical Specifications

- **Minimum Chrome Version**: 88+ (Manifest V3 support)
- **Node.js Development**: 18.0.0+
- **TypeScript Version**: 5.3+
- **Build System**: npm-based with custom scripts
- **Bundle Size**: Optimized for minimal memory footprint

## 📄 Credits

### Created by
- **unintended**: Original creator and maintainer
- **Community Contributors**: Bug reports, feature suggestions, and improvements

### Third-Party Libraries
- **Moment.js**: Date manipulation and formatting
- **jQuery**: DOM manipulation and event handling
- **Bootstrap**: UI components and styling
- **TypeScript**: Type-safe JavaScript development

---

*RegExp Download Organizer - Bringing order to digital chaos, one download at a time.*