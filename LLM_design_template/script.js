// Template JavaScript

// Settings popup functionality
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

const API_KEY_STORAGE_KEY = 'chatgpt_api_key';
const TEMPERATURE_STORAGE_KEY = 'chatgpt_temperature';

// Toggle password visibility
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

// Open popup
settingsBtn.addEventListener('click', () => {
    settingsPopup.classList.add('active');
    loadApiKey();
    loadTemperature();
});

// Close popup
closePopup.addEventListener('click', () => {
    settingsPopup.classList.remove('active');
});

// Close popup when clicking outside
settingsPopup.addEventListener('click', (e) => {
    if (e.target === settingsPopup) {
        settingsPopup.classList.remove('active');
    }
});

// Load existing API key
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

// Load Key button - load and decrypt API key into input field
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

// Save API key
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

// Delete API key
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

// Load temperature from storage
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

// Save temperature when it changes
temperatureInput.addEventListener('change', async () => {
    let tempValue = parseFloat(temperatureInput.value);
    
    // Validate range
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

// ChatGPT interface functionality
const promptInput = document.getElementById('promptInput');
const resultInput = document.getElementById('resultInput');
const runBtn = document.getElementById('runBtn');
const clearBtn = document.getElementById('clearBtn');

// Run button - send prompt to ChatGPT
runBtn.addEventListener('click', async () => {
    await sendPrompt();
});

// Clear button - clear prompt and results
clearBtn.addEventListener('click', () => {
    promptInput.value = '';
    resultInput.value = '';
});

// Ctrl+Enter to send prompt
promptInput.addEventListener('keydown', async (e) => {
    if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        await sendPrompt();
    }
});

// Send prompt to ChatGPT
async function sendPrompt() {
    const prompt = promptInput.value.trim();
    
    if (!prompt) {
        alert('Please enter a prompt');
        return;
    }

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
    runBtn.disabled = true;
    runBtn.textContent = 'Running...';
    resultInput.value = 'Sending request...';

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
                        content: prompt
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
        const result = data.choices[0]?.message?.content || 'No response received';
        resultInput.value = result;
    } catch (error) {
        console.error('Error calling ChatGPT API:', error);
        resultInput.value = `Error: ${error.message}`;
    } finally {
        // Re-enable button
        runBtn.disabled = false;
        runBtn.textContent = 'Run';
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

// Initialize temperature on page load
loadTemperature();

