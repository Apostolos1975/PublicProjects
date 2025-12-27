# LLM Design Template

A secure, minimal web application template with security-by-design principles and streamlined development processes.

## Features

### Security
- **Encrypted Storage**: All data stored in localStorage, cookies, and IndexedDB is encrypted using AES-GCM 256-bit encryption
- **XSS Protection**: Input sanitization and Content Security Policy (CSP) headers
- **Third-party Protection**: Encrypted data prevents browser extensions from reading sensitive information
- **Deterministic Key Derivation**: Encryption keys are derived from origin + app secret (not stored)

### Design
- **Minimal UI**: Clean, uncluttered interface with few predefined design elements
- **Responsive**: Container limited to 80% of viewport width, centered both horizontally and vertically
- **Modern Typography**: System font stack for optimal performance and native look
- **Tailwind CSS**: Utility-first CSS framework for rapid styling

### Functionality
- **ChatGPT Interface**: Interactive chat interface with prompt input and result display
- **Settings Panel**: Configurable settings accessible via cogwheel icon
- **Secure API Key Storage**: Encrypted storage for sensitive API keys with password visibility toggle
- **Model Selection**: Choose from predefined ChatGPT models (gpt-5.1, gpt-5, gpt-4.1, gpt-4.1-mini, gpt-4o, gpt-3.5-turbo)
- **Temperature Control**: Adjustable temperature parameter (0-1) for response creativity
- **Keyboard Shortcuts**: Ctrl+Enter to send prompts
- **Modular Architecture**: Separated concerns with dedicated files for HTML, CSS, JavaScript, and security utilities

## File Structure

```
├── index.html          # Main HTML file
├── style.css           # Custom styles
├── script.js           # Main JavaScript logic
├── secureStorage.js    # Secure storage utility with encryption
├── README.md           # User-facing documentation
└── AI_instructions.md  # Instructions for AI coding agents
```

## Usage

### Basic Setup
1. Open `index.html` in a web browser (or use a local web server for best results)
2. The app will be centered on the page with a maximum width of 80% viewport
3. Click the cogwheel icon in the upper right to configure settings

### Storing Data Securely

```javascript
// Store data in localStorage (encrypted)
await secureStorage.setLocalStorage('key', 'value');

// Retrieve data from localStorage (decrypted)
const value = await secureStorage.getLocalStorage('key');

// Remove data
secureStorage.removeLocalStorage('key');
```

### Managing API Keys
1. Click the cogwheel icon in the upper right corner
2. In the "ChatGPT parameters" popup:
   - **Load Key**: Click to load and display your stored API key (decrypted)
   - **Save Key**: Enter your API key and click to store it securely (encrypted)
   - **Delete Key**: Click to remove the stored API key
   - **Eye Icon**: Toggle password visibility to view/hide the API key
3. Your API key is automatically encrypted before storage

### Using ChatGPT Interface
1. Enter your prompt in the "Prompt" text area
2. Click "Run" or press **Ctrl+Enter** to send the prompt to ChatGPT
3. View the response in the "Result" text area
4. Click "Clear" to clear both prompt and result fields

### Configuring ChatGPT Parameters
1. Open settings (cogwheel icon)
2. **Temperature**: Adjust the temperature parameter (0-1, default: 0.3)
   - Lower values (0-0.3): More focused and deterministic responses
   - Higher values (0.7-1): More creative and varied responses
3. **Model Selection**: Choose from available ChatGPT models
   - Default: gpt-5.1
   - Options: gpt-5.1, gpt-5, gpt-4.1, gpt-4.1-mini, gpt-4o, gpt-3.5-turbo
4. Settings are automatically saved when changed

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

## Browser Compatibility

- Modern browsers with Web Crypto API support
- Chrome/Edge 37+, Firefox 34+, Safari 11+

## Dependencies

- **Tailwind CSS**: Loaded via CDN (can be replaced with local build for production)

## Future Improvements

### Security Enhancements
- [ ] **Master Password Support**: Add optional user-provided master password for stronger encryption key derivation
  - Would prevent automatic key derivation by JavaScript on the same origin
  - Requires user input to decrypt data, adding protection against XSS/compromised scripts
  - Implementation: Combine master password with origin + appSecret in passphrase derivation

- [ ] **Key Rotation**: Implement key rotation mechanism for long-term data security
  - Allow migration of encrypted data to new keys
  - Support multiple key versions during transition period

- [ ] **Server-side Storage Option**: Add option to store sensitive keys server-side with HttpOnly cookies
  - Better protection against client-side attacks
  - Requires backend implementation

### Functionality
- [ ] **Additional Storage Options**: Support for more storage mechanisms (WebSQL, etc.)
- [ ] **Export/Import Encrypted Data**: Allow users to backup and restore encrypted data
- [ ] **Session Management**: Add session timeout and automatic cleanup
- [ ] **Audit Logging**: Log security-relevant events (failed decryption attempts, etc.)

### UI/UX
- [ ] **Theme Support**: Add light/dark theme toggle
- [ ] **Accessibility Improvements**: Enhanced ARIA labels, keyboard navigation
- [ ] **Loading States**: Visual feedback for async operations
- [ ] **Error Handling**: User-friendly error messages and recovery options

### Development
- [ ] **Build Process**: Add build pipeline for production (minification, bundling)
- [ ] **Tailwind CSS Production Setup**: Replace CDN with PostCSS plugin or CLI build
  - Current CDN version is for development only (~3MB+ uncompressed)
  - Production build will only include used classes (much smaller)
  - Install via `npm install -D tailwindcss postcss autoprefixer` or use CLI
  - See: https://tailwindcss.com/docs/installation
- [ ] **Testing**: Add unit tests for encryption/decryption functions
- [ ] **Documentation**: API documentation for secureStorage utility
- [ ] **TypeScript Support**: Add TypeScript definitions for better type safety

### Performance
- [ ] **Lazy Loading**: Implement lazy loading for non-critical resources
- [ ] **Caching Strategy**: Add service worker for offline support
- [ ] **Optimize Key Derivation**: Cache derived keys in memory to reduce computation

## Contributing

This is a template project. Feel free to fork and customize for your needs.

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