// Template JavaScript

// Settings popup functionality
const settingsBtn = document.getElementById('settingsBtn');
const settingsPopup = document.getElementById('settingsPopup');
const closePopup = document.getElementById('closePopup');
const apiKeyInput = document.getElementById('apiKey');
const saveKeyBtn = document.getElementById('saveKeyBtn');
const deleteKeyBtn = document.getElementById('deleteKeyBtn');

const API_KEY_STORAGE_KEY = 'chatgpt_api_key';

// Open popup
settingsBtn.addEventListener('click', () => {
    settingsPopup.classList.add('active');
    loadApiKey();
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
        apiKeyInput.value = '';
        apiKeyInput.placeholder = 'Enter your API key';
    }
}

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

