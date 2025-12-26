# Instructions for AI Coding Agents

This document provides guidelines and constraints for AI coding agents working on this template project. **Please read and follow these instructions carefully.**

## Core Principles

1. **Preserve Design Consistency**: Maintain the minimal, clean design aesthetic established in this template
2. **Security First**: Never compromise the security-by-design principles already implemented
3. **Ask Before Adding**: If a feature or design element doesn't exist, ask for explicit user permission before implementing
4. **Stay Within Bounds**: Work within the existing design system and security architecture

## Design Constraints

### Color Palette
- **Background**: `#f8fafc` (very light gray-blue)
- **Container/Card**: `#ffffff` (white)
- **Primary Button**: `#3b82f6` (blue)
- **Secondary Button**: `#64748b` (slate gray)
- **Text**: `#1e293b` (dark slate)
- **Borders**: `#e2e8f0` (light slate)

**Do NOT** introduce new colors without explicit user permission.

### Layout & Spacing
- Container is limited to 80% of viewport width
- Container is centered both horizontally and vertically
- Use consistent padding and spacing patterns already established
- Maintain the minimal UI approach - avoid cluttering the interface

### Typography
- System font stack: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Helvetica Neue', sans-serif`
- **Do NOT** add external font imports without permission

### UI Components
- Buttons follow the established `.btn`, `.btn-primary`, `.btn-secondary` pattern
- Forms use the `.form-group` structure with consistent styling
- Popups use the `.popup-overlay` and `.popup-content` pattern
- **Do NOT** introduce new UI frameworks or component libraries without permission

## Security Constraints

### Encryption & Storage
- **ALWAYS** use `secureStorage` utility for any data storage (localStorage, cookies, IndexedDB)
- **NEVER** store sensitive data in plain text
- **NEVER** bypass the encryption layer
- All API keys must be stored using `secureStorage.setLocalStorage()`

### Content Security Policy (CSP)
- Current CSP: `default-src 'self'; script-src 'self' https://cdn.tailwindcss.com; style-src 'self' 'unsafe-inline' https://cdn.tailwindcss.com; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; connect-src 'self' https://api.openai.com;`
- **Do NOT** modify CSP without understanding security implications
- If adding new external resources, update CSP appropriately and inform the user

### Input Sanitization
- All user inputs must be sanitized (handled by `secureStorage.sanitizeInput()`)
- **NEVER** directly insert user input into HTML without sanitization
- Use secure storage methods that handle sanitization automatically

### API Security
- API keys are retrieved from secure storage, never hardcoded
- API calls must handle errors gracefully
- **Do NOT** log sensitive information (API keys, user data) to console in production code

## File Structure

Maintain the current file structure:
```
├── index.html          # Main HTML file
├── style.css           # All custom styles
├── script.js           # Main JavaScript logic
├── secureStorage.js    # Secure storage utility (DO NOT MODIFY without permission)
├── README.md           # User-facing documentation
└── AI_instructions.md # This file
```

## When to Ask for Permission

**ALWAYS ask for explicit user permission before:**

1. **Adding new dependencies**: External libraries, CDN resources, npm packages
2. **Introducing new design elements**: New color schemes, fonts, UI components, animations
3. **Modifying security architecture**: Changes to encryption, CSP, storage mechanisms
4. **Adding new features**: Major functionality that extends beyond the template scope
5. **Changing file structure**: Creating new files, reorganizing existing structure
6. **Breaking changes**: Any modification that could affect existing functionality

**You MAY proceed without asking for:**
- Bug fixes within existing functionality
- Minor styling adjustments using existing color palette
- Code refactoring that maintains the same behavior
- Documentation updates
- Performance optimizations that don't change functionality

## ChatGPT Integration

- The template includes ChatGPT API integration
- API key is stored securely using `secureStorage`
- Current implementation uses `gpt-3.5-turbo` model
- **Do NOT** change the API endpoint or model without permission
- **Do NOT** add additional AI services without permission

## Tailwind CSS

- Currently using Tailwind CSS via CDN (development mode)
- **Do NOT** add Tailwind classes that aren't necessary
- Keep custom CSS in `style.css` for template-specific styling
- Note: Production should use PostCSS build (see README.md Future Improvements)

## Code Style

- Use modern JavaScript (ES6+)
- Maintain consistent code formatting
- Add comments for complex logic
- Keep functions focused and modular
- Follow existing patterns in the codebase

## Testing Considerations

- Test security features (encryption/decryption) when making changes
- Verify CSP doesn't block new resources
- Ensure responsive design is maintained
- Check that secure storage still works after modifications

## Common Pitfalls to Avoid

1. ❌ **Don't** add external fonts without permission
2. ❌ **Don't** introduce new color schemes
3. ❌ **Don't** bypass secure storage for "convenience"
4. ❌ **Don't** add animations/transitions without asking
5. ❌ **Don't** modify `secureStorage.js` without understanding the security implications
6. ❌ **Don't** add new UI frameworks (React, Vue, etc.) without permission
7. ❌ **Don't** remove security features "to simplify"
8. ❌ **Don't** hardcode API keys or sensitive data

## Questions to Ask Yourself

Before implementing something new, ask:
1. Does this fit within the existing design system?
2. Does this maintain or improve security?
3. Have I asked the user for permission if this is a new feature?
4. Does this follow the established patterns in the codebase?
5. Will this break existing functionality?

## Communication

When in doubt, **ask the user explicitly**. It's better to ask for permission than to make assumptions that violate the template's design principles or security constraints.

---

**Remember**: This is a template designed to be minimal, secure, and consistent. Your role is to enhance it while respecting these constraints, not to transform it into something completely different.

