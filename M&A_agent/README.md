# M&A Agent Tool

A comprehensive web application for managing merger and acquisition (M&A) processes, built with a secure, minimal design and AI-powered assistance through ChatGPT integration.

## Overview

This M&A tool provides a structured interface for managing various aspects of the M&A lifecycle, from deal sourcing and pipeline management to due diligence, financial analysis, and post-merger integration. The application features a modular navigation system with 10 main functional areas, each designed to support specific M&A workflows.

## Features

### Core Functionality

- **10-Section Navigation Menu**: Collapsible sidebar with comprehensive M&A workflow sections:
  1. Deal Sourcing & Pipeline Management
  2. Financial Analysis & Valuation
  3. Due Diligence Management (Currently Active)
  4. Collaboration & Governance
  5. Deal Structuring & Execution
  6. Post-Merger Integration (PMI)
  7. Intelligence & Benchmarking
  8. Security, Compliance & Trust
  9. Automation & AI
  10. Integration & Extensibility

- **Target Company Panel**: Persistent panel at the top of the page for managing target company information:
  - Company Name
  - Company URL
  - Domain (Classification) - Currently text input, will become dropdown
  - Collapsible to save space
  - Auto-saves to localStorage

- **Due Diligence Management**: Currently active section with ChatGPT integration:
  - Prompt template dropdown with pre-defined templates
  - Custom prompt input with company details auto-included
  - Formatted result display with markdown-like formatting support
  - Raw response logging for debugging

- **Dynamic Content Sections**: Each navigation item displays different content in the main area, with state persistence

### Security

- **Encrypted Storage**: All sensitive data stored in localStorage, cookies, and IndexedDB is encrypted using AES-GCM 256-bit encryption
- **XSS Protection**: Input sanitization and Content Security Policy (CSP) headers
- **Third-party Protection**: Encrypted data prevents browser extensions from reading sensitive information
- **Deterministic Key Derivation**: Encryption keys are derived from origin + app secret (not stored)
- **Company Data Storage**: Currently stored in clear text (bypassing encryption for company data as per requirements)

### Design

- **Minimal UI**: Clean, uncluttered interface with collapsible sections
- **Responsive**: Main content and target company panel limited to 80% of viewport width
- **Modern Typography**: System font stack for optimal performance
- **Tailwind CSS**: Utility-first CSS framework for rapid styling
- **Smooth Animations**: Collapsible sections with CSS transitions

### Functionality

- **ChatGPT Interface**: Interactive chat interface with prompt input and formatted result display
- **Settings Panel**: Configurable settings accessible via cogwheel icon
- **Secure API Key Storage**: Encrypted storage for sensitive API keys with password visibility toggle
- **Model Selection**: Choose from predefined ChatGPT models
- **Temperature Control**: Adjustable temperature parameter (0-1) for response creativity
- **Keyboard Shortcuts**: Ctrl+Enter to send prompts
- **Modular Architecture**: Separated concerns with dedicated files for HTML, CSS, JavaScript, prompts, and security utilities
- **Prompt Management**: Centralized prompt templates in `prompts.js` with clear naming conventions
- **Result Formatting**: Automatic formatting of ChatGPT responses (lists, indentation, markdown-like structures)

## File Structure

```
├── index.html          # Main HTML file with navigation, target company panel, and content sections
├── style.css           # Custom styles for layout, navigation, and components
├── script.js           # Main JavaScript logic for navigation, company data, and ChatGPT integration
├── prompts.js          # Centralized prompt templates and prompt-building functions
├── secureStorage.js    # Secure storage utility with encryption (bypassed for company data)
├── README.md           # User-facing documentation
├── AI_instructions.md  # Instructions for AI coding agents
└── icons/              # Icon assets
```

## Usage

### Basic Setup

1. Open `index.html` in a web browser (or use a local web server for best results)
2. The navigation sidebar starts collapsed by default
3. Click the navigation header or toggle button to expand/collapse the sidebar
4. Click the target company panel header to collapse/expand it

### Managing Target Company Information

1. Enter company details in the "Target company" panel at the top:
   - **Name of company**: Company name
   - **Company URL**: Full company website URL
   - **Domain (classification)**: Industry classification (currently text input)
2. Data is automatically saved to localStorage as you type
3. Company details are automatically included in ChatGPT prompts

### Using Due Diligence Management

1. Select "Due Diligence Management" from the navigation menu (currently the only active section)
2. Optionally select a prompt template from the dropdown:
   - Risk Analysis
   - Compliance Check
   - Financial Review
3. The selected template will populate the prompt input field
4. Adjust the prompt as needed
5. Click "Run" or press **Ctrl+Enter** to send the prompt to ChatGPT
6. View the formatted response in the result display area
7. Check browser console for raw response logging (for debugging)

### Managing API Keys

1. Click the cogwheel icon in the upper right corner
2. In the "ChatGPT parameters" popup:
   - **Load Key**: Click to load and display your stored API key (decrypted)
   - **Save Key**: Enter your API key and click to store it securely (encrypted)
   - **Delete Key**: Click to remove the stored API key
   - **Eye Icon**: Toggle password visibility to view/hide the API key
3. Your API key is automatically encrypted before storage

### Configuring ChatGPT Parameters

1. Open settings (cogwheel icon)
2. **Temperature**: Adjust the temperature parameter (0-1, default: 0.3)
   - Lower values (0-0.3): More focused and deterministic responses
   - Higher values (0.7-1): More creative and varied responses
3. **Model Selection**: Choose from available ChatGPT models
   - Default: gpt-3.5-turbo
   - Options: gpt-3.5-turbo, gpt-4o, and others
4. Settings are automatically saved when changed

## Architecture

### Navigation System

- **State Persistence**: Sidebar and target company panel states are saved to localStorage
- **Dynamic Content Loading**: Each navigation item shows/hides corresponding content sections
- **Active State Management**: Only one section is visible at a time

### Company Data Storage

Company data is stored in localStorage with the following structure:
```javascript
{
  name: "Company Name",
  url: "https://company.com",
  domain: "Industry Classification",
  history: {} // JSON object to be defined later
}
```

### Prompt Management

All prompts are centralized in `prompts.js` with clear naming conventions:
- `PROMPT_BUILD_COMPLETE(userPrompt, companyData)`: Main function to build complete prompts with company details
- `PROMPT_SECTION_3_DUE_DILIGENCE`: Prompt templates for Due Diligence section
- `PROMPT_GET_DUE_DILIGENCE_TEMPLATES()`: Function to retrieve Due Diligence templates

### Result Formatting

The `FORMAT_CHATGPT_RESULT()` function processes raw ChatGPT responses to:
- Convert numbered lists (1. 2. 3.) to HTML `<ol>` elements
- Convert bullet lists (- * •) to HTML `<ul>` elements
- Preserve indentation for nested lists
- Format inline markdown (bold, italic, code)
- Handle multi-level list structures

## Security Architecture

### Encryption Flow

1. **Key Derivation**: Encryption key is derived from `origin + app_secret` using PBKDF2 (100,000 iterations)
2. **Encryption**: Data is encrypted using AES-GCM with a random IV for each encryption
3. **Storage**: Encrypted data (IV + ciphertext) is base64-encoded and stored
4. **Decryption**: IV is extracted, and data is decrypted using the derived key

### Security Features

- **No Stored Keys**: Encryption keys are derived on-the-fly, never stored
- **Domain Isolation**: Different origins produce different encryption keys
- **Input Sanitization**: All inputs are sanitized to prevent XSS attacks
- **CSP Headers**: Content Security Policy restricts resource loading
- **Company Data**: Currently stored in clear text (bypassing encryption as per requirements)

## Browser Compatibility

- Modern browsers with Web Crypto API support
- Chrome/Edge 37+, Firefox 34+, Safari 11+

## Dependencies

- **Tailwind CSS**: Loaded via CDN (can be replaced with local build for production)

## Development Notes

### Current Status

- **Active Section**: Due Diligence Management (Section 3) is the only fully functional section
- **Other Sections**: Navigation items 1-2 and 4-10 are grayed out and inactive
- **Result Formatting**: Currently disabled for raw output comparison (can be re-enabled)
- **Company Data**: Stored in clear text format (encryption bypassed)

### Code Organization

- **Naming Conventions**: Section-specific element IDs (e.g., `dueDiligencePromptInput`, `dueDiligenceResultDisplay`)
- **Modular Design**: Prompts separated into `prompts.js` for easier management
- **State Management**: localStorage used for persistence of UI state and company data

## Future Improvements

### Functionality
- [ ] Implement remaining 9 navigation sections
- [ ] Convert Domain field to dropdown with predefined classifications
- [ ] Add company history tracking and management
- [ ] Implement export/import functionality for company data
- [ ] Add multiple company management (switch between companies)
- [ ] Re-enable and refine result formatting function

### UI/UX
- [ ] Add loading states and progress indicators
- [ ] Implement error handling with user-friendly messages
- [ ] Add keyboard shortcuts for common actions
- [ ] Improve responsive design for mobile devices
- [ ] Add theme support (light/dark mode)

### Security
- [ ] Re-enable encryption for company data (if required)
- [ ] Add data export/import with encryption
- [ ] Implement audit logging for data changes

### Development
- [ ] Add unit tests for formatting and prompt functions
- [ ] Implement build process for production
- [ ] Replace Tailwind CDN with local build
- [ ] Add TypeScript support for better type safety

## Contributing

This is an active development project. Feel free to fork and customize for your needs.

### For AI Coding Agents

If you're an AI coding assistant working on this project, please read `AI_instructions.md` first. It contains important guidelines about design constraints, security requirements, and when to ask for user permission before implementing new features.

## License

[Specify your license here]

## Notes

- The encryption implementation uses the Web Crypto API, which is available in modern browsers
- For production use, consider using a more robust encryption library
- The current implementation provides a good balance between security and usability for client-side applications
- Remember that client-side encryption has inherent limitations - it protects against casual inspection and most browser extensions, but not against sophisticated malware or compromised JavaScript
- **Development Tip**: For best results, use a local web server (e.g., `python -m http.server 8000`) instead of opening the file directly. This avoids `file://` protocol restrictions and ensures consistent encryption key derivation
- **API Key Security**: Your API key is encrypted using AES-GCM 256-bit encryption before storage. The encryption key is derived from your origin, ensuring domain isolation
- **Company Data**: Currently stored in clear text format in localStorage for easier debugging and development
