/* ============================================
   M&A Tool - Main JavaScript
   ============================================ */

// ============================================
// Navigation Toggle Functionality
// ============================================

// Get DOM elements for sidebar navigation
const sidebarNav = document.getElementById('sidebarNav');
const navHeader = document.getElementById('navHeader');
const toggleNavBtn = document.getElementById('toggleNavBtn');
const mainContent = document.querySelector('.main-content');
// LocalStorage key for persisting sidebar state (collapsed/expanded)
const SIDEBAR_STATE_KEY = 'sidebar_collapsed';

/**
 * Load sidebar state from localStorage on page load
 * Defaults to collapsed if no saved state exists
 * Moves toggle button to appropriate location based on state
 */
function loadSidebarState() {
    // Default to collapsed if no state is saved
    const savedState = localStorage.getItem(SIDEBAR_STATE_KEY);
    const isCollapsed = savedState === null ? true : savedState === 'true';
    
    if (isCollapsed) {
        // Ensure collapsed classes are applied (they should already be in HTML)
        sidebarNav.classList.add('collapsed');
        mainContent.classList.add('sidebar-collapsed');
        toggleNavBtn.classList.add('sidebar-collapsed');
        // Move button to body so it's visible when sidebar is hidden
        const navHeader = sidebarNav.querySelector('.nav-header');
        if (toggleNavBtn.parentElement === navHeader) {
            document.body.appendChild(toggleNavBtn);
        }
    } else {
        // If user previously expanded it, restore expanded state
        sidebarNav.classList.remove('collapsed');
        mainContent.classList.remove('sidebar-collapsed');
        toggleNavBtn.classList.remove('sidebar-collapsed');
        // Move button back to header when sidebar is visible
        const navHeader = sidebarNav.querySelector('.nav-header');
        if (toggleNavBtn.parentElement !== navHeader) {
            navHeader.appendChild(toggleNavBtn);
        }
    }
}

/**
 * Toggle sidebar visibility
 * Saves state to localStorage for persistence across page reloads
 * Moves toggle button between header and body based on sidebar state
 */
function toggleSidebar() {
    if (!sidebarNav || !mainContent || !toggleNavBtn) return;
    
    const isCollapsed = sidebarNav.classList.contains('collapsed');
    
    if (isCollapsed) {
        // Expand sidebar
        sidebarNav.classList.remove('collapsed');
        mainContent.classList.remove('sidebar-collapsed');
        toggleNavBtn.classList.remove('sidebar-collapsed');
        
        // Move button back to header if it was moved to body
        const headerElement = sidebarNav.querySelector('.nav-header');
        if (toggleNavBtn.parentElement !== headerElement) {
            headerElement.appendChild(toggleNavBtn);
        }
        
        localStorage.setItem(SIDEBAR_STATE_KEY, 'false');
    } else {
        // Collapse sidebar
        sidebarNav.classList.add('collapsed');
        mainContent.classList.add('sidebar-collapsed');
        toggleNavBtn.classList.add('sidebar-collapsed');
        
        // Move button to body so it's not affected by sidebar transform
        document.body.appendChild(toggleNavBtn);
        
        localStorage.setItem(SIDEBAR_STATE_KEY, 'true');
    }
}

// Make entire navigation header clickable to toggle sidebar
// Note: Header is only visible when sidebar is expanded
if (navHeader) {
    navHeader.addEventListener('click', (e) => {
        // Toggle when clicking anywhere on the header (title area)
        // Button click is handled separately with stopPropagation
        if (e.target !== toggleNavBtn && !e.target.closest('.nav-toggle-btn')) {
            toggleSidebar();
        }
    });
}

// Button click handler (with stopPropagation to prevent double-toggling)
if (toggleNavBtn) {
    toggleNavBtn.addEventListener('click', (e) => {
        // Stop propagation to prevent header click from also firing
        e.stopPropagation();
        toggleSidebar();
    });
}

// Initialize sidebar state on page load
loadSidebarState();

// Enable transitions after initial load to prevent animation flash on page reload
// Small delay ensures DOM is ready before enabling animations
setTimeout(() => {
    sidebarNav.classList.add('loaded');
    mainContent.classList.add('loaded');
}, 10);

// ============================================
// Menu Navigation Functionality
// ============================================

/**
 * Switch to a different content section based on menu selection
 * @param {number} sectionNumber - The section number (1-10)
 */
function switchToSection(sectionNumber) {
    // Hide all content sections
    const allSections = document.querySelectorAll('.content-section');
    allSections.forEach(section => {
        section.classList.remove('active');
        section.style.display = 'none';
    });
    
    // Show the selected section
    const targetSection = document.getElementById(`section-${sectionNumber}`);
    if (targetSection) {
        targetSection.classList.add('active');
        targetSection.style.display = 'block';
    }
    
    // Update active menu item
    const allNavLinks = document.querySelectorAll('.nav-link');
    allNavLinks.forEach(link => {
        link.classList.remove('active');
    });
    
    const activeNavLink = document.querySelector(`.nav-link[data-section="${sectionNumber}"]`);
    if (activeNavLink) {
        activeNavLink.classList.add('active');
    }
    
    // Save selected section to localStorage
    localStorage.setItem('selected_section', sectionNumber.toString());
}

/**
 * Load the last selected section from localStorage
 * Defaults to section 3 (Due Diligence) if no selection is saved
 */
function loadSelectedSection() {
    const savedSection = localStorage.getItem('selected_section');
    const sectionNumber = savedSection ? parseInt(savedSection) : 3; // Default to Due Diligence
    switchToSection(sectionNumber);
}

/**
 * Set up menu item click handlers
 */
function setupMenuNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const sectionNumber = parseInt(link.getAttribute('data-section'));
            if (sectionNumber) {
                switchToSection(sectionNumber);
            }
        });
    });
}

// Initialize menu navigation
setupMenuNavigation();
loadSelectedSection();

// ============================================
// Settings Popup Functionality
// ============================================

// Get DOM elements for settings popup
const settingsBtn = document.getElementById('settingsBtn');
const settingsPopup = document.getElementById('settingsPopup');
const closePopup = document.getElementById('closePopup');
const apiKeyInput = document.getElementById('apiKey');
const togglePasswordBtn = document.getElementById('togglePassword');
const eyeClosed = document.getElementById('eyeClosed');
const eyeOpen = document.getElementById('eyeOpen');
const loadKeyBtn = document.getElementById('loadKeyBtn');
const saveKeyBtn = document.getElementById('saveKeyBtn');
const deleteKeyBtn = document.getElementById('deleteKeyBtn');
const temperatureInput = document.getElementById('temperature');

// LocalStorage keys for persisting settings
const API_KEY_STORAGE_KEY = 'chatgpt_api_key';
const TEMPERATURE_STORAGE_KEY = 'chatgpt_temperature';

/**
 * Toggle API key visibility between password and text input
 * Switches between eye icons (open/closed) to indicate state
 */
togglePasswordBtn.addEventListener('click', () => {
    const isPassword = apiKeyInput.type === 'password';
    apiKeyInput.type = isPassword ? 'text' : 'password';
    
    // Toggle eye icons
    if (isPassword) {
        // Show password - show open eye, hide closed eye
        eyeClosed.style.display = 'none';
        eyeOpen.style.display = 'block';
    } else {
        // Hide password - show closed eye, hide open eye
        eyeClosed.style.display = 'block';
        eyeOpen.style.display = 'none';
    }
});

/**
 * Open settings popup and load current settings
 */
settingsBtn.addEventListener('click', () => {
    settingsPopup.classList.add('active');
    loadApiKey();
    loadTemperature();
});

/**
 * Close settings popup when close button is clicked
 */
closePopup.addEventListener('click', () => {
    settingsPopup.classList.remove('active');
});

/**
 * Close popup when clicking on the overlay background (outside the popup content)
 */
settingsPopup.addEventListener('click', (e) => {
    if (e.target === settingsPopup) {
        settingsPopup.classList.remove('active');
    }
});

/**
 * Load existing API key from secure storage
 * Shows placeholder indicating if key exists without revealing it
 */
async function loadApiKey() {
    try {
        const storedKey = await secureStorage.getLocalStorage(API_KEY_STORAGE_KEY);
        if (storedKey) {
            // Clear input but indicate key exists
            apiKeyInput.value = '';
            apiKeyInput.placeholder = 'API key is stored (enter new key to update)';
        } else {
            apiKeyInput.value = '';
            apiKeyInput.placeholder = 'Enter your API key';
        }
    } catch (error) {
        console.error('Error loading API key:', error);
        // If decryption fails, the key might be encrypted with a different origin
        // Don't show an error here - just clear the field
        // User can use "Load Key" button if they want to see the error message
        apiKeyInput.value = '';
        apiKeyInput.placeholder = 'Enter your API key (stored key may be invalid)';
    }
}

/**
 * Load Key button handler - Decrypts and displays stored API key in input field
 * Shows error message if decryption fails (e.g., origin changed)
 */
loadKeyBtn.addEventListener('click', async () => {
    try {
        const storedKey = await secureStorage.getLocalStorage(API_KEY_STORAGE_KEY);
        if (storedKey) {
            // Decrypted key is returned from secureStorage.getLocalStorage()
            apiKeyInput.value = storedKey;
            apiKeyInput.placeholder = 'API key loaded';
        } else {
            alert('No API key found in storage');
            apiKeyInput.value = '';
            apiKeyInput.placeholder = 'Enter your API key';
        }
    } catch (error) {
        console.error('Error loading API key:', error);
        const errorMessage = error.message.includes('encryption key may have changed') 
            ? 'Failed to decrypt API key. This usually happens when the origin changed (e.g., switching from file:// to http:// or vice versa). Please delete the old key and save it again.'
            : 'Failed to load API key. The stored key may be corrupted or encrypted with a different key.';
        alert(errorMessage);
        apiKeyInput.value = '';
        apiKeyInput.placeholder = 'Enter your API key';
    }
});

/**
 * Save API key to secure storage
 * Encrypts the key before storing for security
 */
saveKeyBtn.addEventListener('click', async () => {
    const apiKey = apiKeyInput.value.trim();
    
    if (!apiKey) {
        alert('Please enter an API key');
        return;
    }

    try {
        await secureStorage.setLocalStorage(API_KEY_STORAGE_KEY, apiKey);
        alert('API key saved successfully');
        loadApiKey(); // Reload to update placeholder
    } catch (error) {
        console.error('Error saving API key:', error);
        alert('Failed to save API key');
    }
});

/**
 * Delete stored API key from secure storage
 */
deleteKeyBtn.addEventListener('click', async () => {
    try {
        secureStorage.removeLocalStorage(API_KEY_STORAGE_KEY);
        apiKeyInput.value = '';
        apiKeyInput.placeholder = 'Enter your API key';
        alert('API key deleted successfully');
    } catch (error) {
        console.error('Error deleting API key:', error);
        alert('Failed to delete API key');
    }
});

/**
 * Load temperature setting from secure storage
 * Defaults to 0.3 if no value is stored
 */
async function loadTemperature() {
    try {
        const storedTemperature = await secureStorage.getLocalStorage(TEMPERATURE_STORAGE_KEY);
        if (storedTemperature !== null && storedTemperature !== undefined) {
            temperatureInput.value = storedTemperature;
        } else {
            // Use default value
            temperatureInput.value = 0.3;
        }
    } catch (error) {
        console.error('Error loading temperature:', error);
        temperatureInput.value = 0.3; // Use default on error
    }
}

/**
 * Save temperature setting when input value changes
 * Validates that value is between 0 and 1 (inclusive)
 */
temperatureInput.addEventListener('change', async () => {
    let tempValue = parseFloat(temperatureInput.value);
    
    // Validate range - Temperature must be between 0 and 1
    if (isNaN(tempValue) || tempValue < 0) {
        tempValue = 0;
        temperatureInput.value = 0;
    } else if (tempValue > 1) {
        tempValue = 1;
        temperatureInput.value = 1;
    }
    
    try {
        await secureStorage.setLocalStorage(TEMPERATURE_STORAGE_KEY, tempValue);
    } catch (error) {
        console.error('Error saving temperature:', error);
    }
});

// ============================================
// Result Formatting Functionality
// ============================================

/**
 * Generic function to format ChatGPT results for better presentation
 * Handles numbered lists, bullet lists, and multi-level indentation
 * Converts markdown-style formatting to formatted HTML
 * 
 * @param {string} rawText - Raw text from ChatGPT
 * @returns {string} Formatted HTML string ready for display
 */
function FORMAT_CHATGPT_RESULT(rawText) {
    if (!rawText) return '';
    
    // Split into lines for processing
    const lines = rawText.split('\n');
    const formattedLines = [];
    const listStack = []; // Stack to track nested lists: [{type: 'ol'|'ul', level: number}]
    
    // Helper function to check if next non-empty line is a list item of the same type
    function isNextLineListItem(startIndex, targetLevel, targetType) {
        for (let j = startIndex + 1; j < lines.length; j++) {
            const nextLine = lines[j].trim();
            if (!nextLine) continue; // Skip empty lines
            
            const nextIndentMatch = lines[j].match(/^(\s*)/);
            const nextIndentLevel = nextIndentMatch ? Math.floor(nextIndentMatch[1].length / 2) : 0;
            
            // Check if it's a list item at the same level and same type
            const nextNumbered = nextLine.match(/^(\d+)[\.\)]\s+(.+)$/);
            const nextBullet = nextLine.match(/^[-*•]\s+(.+)$/);
            
            if (targetType === 'ol' && nextNumbered && nextIndentLevel === targetLevel) {
                return true;
            }
            if (targetType === 'ul' && nextBullet && nextIndentLevel === targetLevel) {
                return true;
            }
            // If we hit a non-list item at same or shallower level, the list should close
            if (nextIndentLevel <= targetLevel && !nextNumbered && !nextBullet) {
                return false;
            }
        }
        return false;
    }
    
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmed = line.trim();
        
        // Detect indentation level (count leading spaces/tabs)
        const indentMatch = line.match(/^(\s*)/);
        const indentLevel = indentMatch ? Math.floor(indentMatch[1].length / 2) : 0;
        
        if (!trimmed) {
            // Empty line - check if next non-empty line continues the list
            const topList = listStack.length > 0 ? listStack[listStack.length - 1] : null;
            if (topList) {
                // Check if next line continues this list (same type and level)
                if (!isNextLineListItem(i, topList.level, topList.type)) {
                    // Next line won't continue the list, so close it
                    while (listStack.length > 0) {
                        const list = listStack.pop();
                        formattedLines.push(`</${list.type}>`);
                    }
                }
                // If next line continues the list, keep it open (don't close)
            }
            formattedLines.push('<br>');
            continue;
        }
        
        // Detect numbered list (1. 2. 3. or 1) 2) 3))
        const numberedMatch = trimmed.match(/^(\d+)[\.\)]\s+(.+)$/);
        // Detect bullet list (- * •)
        const bulletMatch = trimmed.match(/^[-*•]\s+(.+)$/);
        
        // Close lists that are at deeper levels or different types at same level
        while (listStack.length > 0) {
            const topList = listStack[listStack.length - 1];
            // Close if deeper level, or same level but different type
            if (topList.level > indentLevel || 
                (topList.level === indentLevel && numberedMatch && topList.type !== 'ol') ||
                (topList.level === indentLevel && bulletMatch && topList.type !== 'ul')) {
                const list = listStack.pop();
                formattedLines.push(`</${list.type}>`);
            } else {
                break;
            }
        }
        
        if (numberedMatch) {
            // Numbered list item
            const content = numberedMatch[2];
            
            // Check if we need to open a new numbered list
            // Only open if: no list exists, or top list is not 'ol', or top list is different level
            if (listStack.length === 0 || 
                listStack[listStack.length - 1].type !== 'ol' || 
                listStack[listStack.length - 1].level !== indentLevel) {
                formattedLines.push('<ol>');
                listStack.push({ type: 'ol', level: indentLevel });
            }
            
            formattedLines.push(`<li>${formatInlineMarkdown(content)}</li>`);
        } else if (bulletMatch) {
            // Bullet list item
            const content = bulletMatch[1];
            
            // Check if we need to open a new bullet list
            if (listStack.length === 0 || 
                listStack[listStack.length - 1].type !== 'ul' || 
                listStack[listStack.length - 1].level !== indentLevel) {
                formattedLines.push('<ul>');
                listStack.push({ type: 'ul', level: indentLevel });
            }
            
            formattedLines.push(`<li>${formatInlineMarkdown(content)}</li>`);
        } else {
            // Regular text line (not a list item)
            // Close all open lists - headings/text should not be inside lists
            while (listStack.length > 0) {
                const list = listStack.pop();
                formattedLines.push(`</${list.type}>`);
            }
            formattedLines.push(`<p>${formatInlineMarkdown(trimmed)}</p>`);
        }
    }
    
    // Close any remaining open lists
    while (listStack.length > 0) {
        const list = listStack.pop();
        formattedLines.push(`</${list.type}>`);
    }
    
    return formattedLines.join('');
}

/**
 * Format inline markdown elements (bold, italic, code)
 * @param {string} text - Text to format
 * @returns {string} Formatted HTML
 */
function formatInlineMarkdown(text) {
    // Escape HTML first
    let formatted = escapeHtml(text);
    
    // Format code blocks (`code`)
    formatted = formatted.replace(/`([^`]+?)`/g, '<code>$1</code>');
    
    // Format bold text (**text**)
    formatted = formatted.replace(/\*\*([^*]+?)\*\*/g, '<strong>$1</strong>');
    
    // Format italic text (*text*) - but not if it's part of **
    formatted = formatted.replace(/(?<!\*)\*([^*]+?)\*(?!\*)/g, '<em>$1</em>');
    
    return formatted;
}

/**
 * Escape HTML special characters to prevent XSS
 * @param {string} text - Text to escape
 * @returns {string} Escaped text
 */
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// ============================================
// ChatGPT Interface Functionality
// ============================================

// Get DOM elements for Due Diligence chat interface
// Naming convention: <sectionName><ElementType> (e.g., dueDiligencePromptInput)
const dueDiligencePromptInput = document.getElementById('dueDiligencePromptInput');
const dueDiligenceResultInput = document.getElementById('dueDiligenceResultInput');
const dueDiligenceRunBtn = document.getElementById('dueDiligenceRunBtn');
const dueDiligenceClearBtn = document.getElementById('dueDiligenceClearBtn');
const dueDiligencePromptSelect = document.getElementById('dueDiligencePromptSelect');

/**
 * Run button handler - Sends prompt to ChatGPT API
 */
dueDiligenceRunBtn.addEventListener('click', async () => {
    await sendDueDiligencePrompt();
});

/**
 * Clear button handler - Clears both prompt and result
 */
dueDiligenceClearBtn.addEventListener('click', () => {
    dueDiligencePromptInput.value = '';
    dueDiligenceResultInput.innerHTML = '';
    // Also reset the dropdown
    if (dueDiligencePromptSelect) {
        dueDiligencePromptSelect.value = '';
    }
});

/**
 * Keyboard shortcut: Ctrl+Enter to send prompt
 */
dueDiligencePromptInput.addEventListener('keydown', async (e) => {
    if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        await sendDueDiligencePrompt();
    }
});

/**
 * Populate the prompt template dropdown with available templates
 */
function populateDueDiligencePromptDropdown() {
    if (!dueDiligencePromptSelect) return;
    
    // Get prompt templates from prompts.js
    const templates = PROMPT_GET_DUE_DILIGENCE_TEMPLATES();
    
    // Clear existing options (except the first placeholder)
    dueDiligencePromptSelect.innerHTML = '<option value="">-- Select a prompt template --</option>';
    
    // Add template options
    templates.forEach(template => {
        const option = document.createElement('option');
        option.value = template.id;
        option.textContent = template.name;
        dueDiligencePromptSelect.appendChild(option);
    });
}

/**
 * Handle prompt template selection from dropdown
 */
function setupDueDiligencePromptSelection() {
    if (!dueDiligencePromptSelect) return;
    
    dueDiligencePromptSelect.addEventListener('change', (e) => {
        const selectedTemplateId = e.target.value;
        
        if (!selectedTemplateId) {
            // If "Select a prompt template" is selected, do nothing
            return;
        }
        
        // Get the selected template
        const templates = PROMPT_GET_DUE_DILIGENCE_TEMPLATES();
        const selectedTemplate = templates.find(t => t.id === selectedTemplateId);
        
        if (selectedTemplate && dueDiligencePromptInput) {
            // Populate the prompt input with the selected template
            dueDiligencePromptInput.value = selectedTemplate.prompt;
            // Focus on the input so user can make adjustments
            dueDiligencePromptInput.focus();
            // Move cursor to end of text
            dueDiligencePromptInput.setSelectionRange(
                dueDiligencePromptInput.value.length,
                dueDiligencePromptInput.value.length
            );
        }
    });
}

/**
 * Send Due Diligence prompt to ChatGPT API and display response
 * Retrieves API key and temperature from secure storage
 * Automatically includes company details in the prompt
 * Handles errors gracefully with user-friendly messages
 * 
 * Function naming convention: send<SectionName>Prompt()
 */
async function sendDueDiligencePrompt() {
    const userPrompt = dueDiligencePromptInput.value.trim();
    
    if (!userPrompt) {
        alert('Please enter a prompt');
        return;
    }

    // Get company data to include in prompt
    const companyData = getCompanyData();
    
    // Build the complete prompt using the prompts.js file
    // PROMPT_BUILD_COMPLETE is defined in prompts.js
    const fullPrompt = PROMPT_BUILD_COMPLETE(userPrompt, companyData);

    // Get API key
    let apiKey;
    try {
        apiKey = await secureStorage.getLocalStorage(API_KEY_STORAGE_KEY);
        if (!apiKey) {
            alert('Please set your API key in settings first');
            return;
        }
    } catch (error) {
        console.error('Error retrieving API key:', error);
        alert('Failed to retrieve API key');
        return;
    }

    // Get temperature (default to 0.3 if not set)
    let temperature = 0.3;
    try {
        const storedTemperature = await secureStorage.getLocalStorage(TEMPERATURE_STORAGE_KEY);
        if (storedTemperature !== null && storedTemperature !== undefined) {
            temperature = parseFloat(storedTemperature);
            // Validate range
            if (isNaN(temperature) || temperature < 0) temperature = 0;
            if (temperature > 1) temperature = 1;
        }
    } catch (error) {
        console.error('Error retrieving temperature, using default:', error);
        // Use default 0.3
    }

    // Disable button and show loading
    dueDiligenceRunBtn.disabled = true;
    dueDiligenceRunBtn.textContent = 'Running...';
    dueDiligenceResultInput.innerHTML = '<p style="color: #64748b; font-style: italic;">Sending request...</p>';

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: 'gpt-3.5-turbo',
                messages: [
                    {
                        role: 'user',
                        content: fullPrompt
                    }
                ],
                max_tokens: 1000,
                temperature: temperature
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: { message: 'Unknown error' } }));
            throw new Error(errorData.error?.message || `HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        const rawResult = data.choices[0]?.message?.content || 'No response received';
        
        // Log raw response from ChatGPT for comparison with formatted output
        console.log('=== RAW CHATGPT RESPONSE ===');
        console.log(rawResult);
        console.log('=== END RAW RESPONSE ===');
        
        // TEMPORARILY DISABLED: Display raw result without any formatting for comparison
        // Format the result using the generic formatting function
        // const formattedResult = FORMAT_CHATGPT_RESULT(rawResult);
        
        // Log formatted result for comparison
        // console.log('=== FORMATTED RESULT (HTML) ===');
        // console.log(formattedResult);
        // console.log('=== END FORMATTED RESULT ===');
        
        // Display raw result as-is (escape HTML and preserve line breaks)
        const rawResultHtml = escapeHtml(rawResult).replace(/\n/g, '<br>');
        dueDiligenceResultInput.innerHTML = rawResultHtml;
    } catch (error) {
        console.error('Error calling ChatGPT API:', error);
        dueDiligenceResultInput.innerHTML = `<p style="color: #ef4444;"><strong>Error:</strong> ${escapeHtml(error.message)}</p>`;
    } finally {
        // Re-enable button
        dueDiligenceRunBtn.disabled = false;
        dueDiligenceRunBtn.textContent = 'Run';
    }
}

// Example usage of secure storage:
// 
// // Store data securely
// await secureStorage.setLocalStorage('userData', { name: 'John', email: 'john@example.com' });
// await secureStorage.setCookie('sessionToken', 'abc123', 7);
// await secureStorage.setIndexedDB('largeData', { /* large object */ });
//
// // Retrieve data securely
// const userData = await secureStorage.getLocalStorage('userData');
// const token = await secureStorage.getCookie('sessionToken');
// const largeData = await secureStorage.getIndexedDB('largeData');
//
// // Remove data
// secureStorage.removeLocalStorage('userData');
// secureStorage.removeCookie('sessionToken');
// await secureStorage.removeIndexedDB('largeData');

// ============================================
// Target Company Panel Toggle Functionality
// ============================================

// Get DOM elements for target company section
const targetCompanyTitleWrapper = document.getElementById('targetCompanyTitleWrapper');
const toggleTargetCompanyBtn = document.getElementById('toggleTargetCompanyBtn');
const targetCompanyFields = document.getElementById('targetCompanyFields');
const TARGET_COMPANY_COLLAPSED_KEY = 'target_company_collapsed';

// ============================================
// Company Data Storage Functionality
// ============================================

// Get DOM elements for company data inputs
const companyNameInput = document.getElementById('companyName');
const companyURLInput = document.getElementById('companyURL');
const companyDomainInput = document.getElementById('companyDomain');

// LocalStorage key for company data
const COMPANY_DATA_STORAGE_KEY = 'company_data';

/**
 * Company data structure:
 * {
 *   companyName: string,
 *   url: string,
 *   taxonomy: string,
 *   history: object (JSON, to be defined later)
 * }
 * 
 * NOTE: Company data is stored in CLEAR TEXT format using regular localStorage.
 * We are bypassing the secureStorage encryption logic for company data.
 * This is intentional - company data is not sensitive like API keys.
 */

/**
 * Save company data to localStorage
 * Stores company name, URL, taxonomy, and history
 * Uses plain localStorage (clear text) - bypasses secureStorage encryption
 */
function saveCompanyData() {
    try {
        const companyData = {
            companyName: companyNameInput ? companyNameInput.value.trim() : '',
            url: companyURLInput ? companyURLInput.value.trim() : '',
            taxonomy: companyDomainInput ? companyDomainInput.value.trim() : '',
            history: getCompanyHistory() // Preserve existing history
        };
        
        // Use regular localStorage (clear text) - bypassing secureStorage encryption
        // This is intentional - company data is stored in plain text format
        localStorage.setItem(COMPANY_DATA_STORAGE_KEY, JSON.stringify(companyData));
        console.log('Company data saved successfully (clear text format)');
    } catch (error) {
        console.error('Error saving company data:', error);
    }
}

/**
 * Load company data from localStorage
 * Populates input fields with saved values
 * Returns the company data object or null if not found
 * Uses plain localStorage (clear text) - bypasses secureStorage decryption
 */
function loadCompanyData() {
    try {
        // Use regular localStorage (clear text) - bypassing secureStorage decryption
        const savedData = localStorage.getItem(COMPANY_DATA_STORAGE_KEY);
        
        if (savedData) {
            const companyData = JSON.parse(savedData);
            
            // Populate input fields if they exist
            if (companyNameInput && companyData.companyName) {
                companyNameInput.value = companyData.companyName;
            }
            if (companyURLInput && companyData.url) {
                companyURLInput.value = companyData.url;
            }
            if (companyDomainInput && companyData.taxonomy) {
                companyDomainInput.value = companyData.taxonomy;
            }
            
            return companyData;
        }
        
        // Return default structure if no data exists
        return {
            companyName: '',
            url: '',
            taxonomy: '',
            history: {}
        };
    } catch (error) {
        console.error('Error loading company data:', error);
        return {
            companyName: '',
            url: '',
            taxonomy: '',
            history: {}
        };
    }
}

/**
 * Get current company history from localStorage
 * Preserves existing history when saving other fields
 * Uses plain localStorage (clear text) - bypasses secureStorage decryption
 */
function getCompanyHistory() {
    try {
        // Use regular localStorage (clear text) - bypassing secureStorage decryption
        const savedData = localStorage.getItem(COMPANY_DATA_STORAGE_KEY);
        if (savedData) {
            const companyData = JSON.parse(savedData);
            return companyData.history || {};
        }
    } catch (error) {
        console.error('Error getting company history:', error);
    }
    return {};
}

/**
 * Update company history in localStorage
 * Merges new history data with existing history
 * Uses plain localStorage (clear text) - bypasses secureStorage encryption
 * @param {Object} newHistory - History object to merge with existing history
 */
function updateCompanyHistory(newHistory) {
    try {
        const currentData = loadCompanyData();
        currentData.history = { ...currentData.history, ...newHistory };
        
        // Use regular localStorage (clear text) - bypassing secureStorage encryption
        localStorage.setItem(COMPANY_DATA_STORAGE_KEY, JSON.stringify(currentData));
        console.log('Company history updated successfully (clear text format)');
    } catch (error) {
        console.error('Error updating company history:', error);
    }
}

/**
 * Get complete company data object
 * @returns {Object} Company data with name, URL, taxonomy, and history
 */
function getCompanyData() {
    return loadCompanyData();
}

/**
 * Toggle target company section visibility
 * Saves state to localStorage for persistence
 */
function toggleTargetCompany() {
    if (!targetCompanyFields) return;
    
    const isCollapsed = targetCompanyFields.classList.contains('collapsed');
    
    if (isCollapsed) {
        // Expand section
        targetCompanyFields.classList.remove('collapsed');
        if (toggleTargetCompanyBtn) {
            toggleTargetCompanyBtn.classList.remove('collapsed');
        }
        localStorage.setItem(TARGET_COMPANY_COLLAPSED_KEY, 'false');
    } else {
        // Collapse section
        targetCompanyFields.classList.add('collapsed');
        if (toggleTargetCompanyBtn) {
            toggleTargetCompanyBtn.classList.add('collapsed');
        }
        localStorage.setItem(TARGET_COMPANY_COLLAPSED_KEY, 'true');
    }
}

/**
 * Load target company panel state from localStorage
 * Defaults to expanded if no state is saved
 */
function loadTargetCompanyState() {
    if (!targetCompanyFields) return;
    
    const savedState = localStorage.getItem(TARGET_COMPANY_COLLAPSED_KEY);
    const isCollapsed = savedState === 'true';
    
    if (isCollapsed) {
        targetCompanyFields.classList.add('collapsed');
        if (toggleTargetCompanyBtn) {
            toggleTargetCompanyBtn.classList.add('collapsed');
        }
    }
}

// Make entire title bar clickable to toggle section
if (targetCompanyTitleWrapper) {
    targetCompanyTitleWrapper.addEventListener('click', (e) => {
        // Prevent double-toggling if button is clicked (event will bubble)
        // But allow button click to work as well
        toggleTargetCompany();
    });
}

// Also allow button click (though it will bubble to wrapper, this ensures it works)
if (toggleTargetCompanyBtn) {
    toggleTargetCompanyBtn.addEventListener('click', (e) => {
        // Stop propagation to prevent double-toggle
        e.stopPropagation();
        toggleTargetCompany();
    });
}

// ============================================
// Company Data Input Event Listeners
// ============================================

/**
 * Set up auto-save functionality for company data inputs
 * Saves to localStorage whenever any field changes
 */
function setupCompanyDataAutoSave() {
    // Auto-save on input change (debounced for performance)
    let saveTimeout;
    
    const debouncedSave = () => {
        clearTimeout(saveTimeout);
        saveTimeout = setTimeout(() => {
            saveCompanyData();
        }, 500); // Wait 500ms after user stops typing
    };
    
    // Add event listeners to all company input fields
    if (companyNameInput) {
        companyNameInput.addEventListener('input', debouncedSave);
        companyNameInput.addEventListener('blur', saveCompanyData); // Save immediately on blur
    }
    
    if (companyURLInput) {
        companyURLInput.addEventListener('input', debouncedSave);
        companyURLInput.addEventListener('blur', saveCompanyData);
    }
    
    if (companyDomainInput) {
        companyDomainInput.addEventListener('input', debouncedSave);
        companyDomainInput.addEventListener('blur', saveCompanyData);
    }
}

// ============================================
// Initialization
// ============================================

// Load temperature setting on page load
loadTemperature();

// Load target company panel state on page load
loadTargetCompanyState();

// Load company data and set up auto-save on page load
// Wait for DOM to be fully loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        loadCompanyData();
        setupCompanyDataAutoSave();
        // Set up Due Diligence prompt dropdown
        populateDueDiligencePromptDropdown();
        setupDueDiligencePromptSelection();
    });
} else {
    // DOM is already loaded
    loadCompanyData();
    setupCompanyDataAutoSave();
    // Set up Due Diligence prompt dropdown
    populateDueDiligencePromptDropdown();
    setupDueDiligencePromptSelection();
}

