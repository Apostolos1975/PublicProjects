// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Get DOM elements
    const apiKeyInput = document.getElementById('apiKeyInput');
    const urlInput = document.getElementById('urlInput');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const resetBtn = document.getElementById('resetBtn');
    const results = document.getElementById('results');
    const loading = document.getElementById('loading');
    const authorInfo = document.getElementById('authorInfo');
    const authorContent = document.getElementById('authorContent');
    const errorMessage = document.getElementById('errorMessage');
    const galTanToggle = document.getElementById('galTanToggle');
    const galTanContent = document.querySelector('.gal-tan-content');

    // Toggle GAL-TAN info section
    if (galTanToggle && galTanContent) {
        galTanToggle.addEventListener('click', () => {
            galTanContent.classList.toggle('collapsed');
        });
    }

    // Storage utility functions with localStorage and cookie fallback
    function setApiKey(apiKey) {
        // Try localStorage first
        try {
            localStorage.setItem('openaiApiKey', apiKey);
        } catch (e) {
            console.warn('localStorage not available, using cookie fallback');
        }
        
        // Also save to cookie as backup (expires in 1 year)
        const expirationDate = new Date();
        expirationDate.setFullYear(expirationDate.getFullYear() + 1);
        document.cookie = `openaiApiKey=${encodeURIComponent(apiKey)}; expires=${expirationDate.toUTCString()}; path=/; SameSite=Strict`;
    }

    function getApiKey() {
        // Try localStorage first
        try {
            const stored = localStorage.getItem('openaiApiKey');
            if (stored) return stored;
        } catch (e) {
            console.warn('localStorage not available, trying cookie fallback');
        }
        
        // Fallback to cookie
        const cookies = document.cookie.split(';');
        for (let cookie of cookies) {
            const [name, value] = cookie.trim().split('=');
            if (name === 'openaiApiKey') {
                return decodeURIComponent(value);
            }
        }
        return null;
    }

    // Load API key on page load
    const storedApiKey = getApiKey();
    if (storedApiKey) {
        apiKeyInput.value = storedApiKey;
    }

    // Save API key when it changes (on blur)
    apiKeyInput.addEventListener('blur', () => {
        const apiKey = apiKeyInput.value.trim();
        if (apiKey) {
            setApiKey(apiKey);
        }
    });

    // Function to identify authors using ChatGPT
    async function identifyAuthors(url, apiKey) {
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
                        content: `Identify the author or authors of this article and return their names in a list. Return just their names. Nothing more. If you cannot identify any authors, return an N/A.\n\nArticle URL: ${url}`
                    }
                ],
                temperature: 0.3,
                max_tokens: 200
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error?.message || `API error: ${response.status}`);
        }

        const data = await response.json();
        return data.choices[0].message.content.trim();
    }

    // Function to analyze article
    async function analyzeArticle(url, apiKey) {
        // Show loading state
        results.classList.remove('hidden');
        loading.classList.remove('hidden');
        authorInfo.classList.add('hidden');
        errorMessage.classList.add('hidden');
        analyzeBtn.disabled = true;

        try {
            // Identify authors using ChatGPT
            const authorsText = await identifyAuthors(url, apiKey);

            // Hide loading, show results
            loading.classList.add('hidden');

            // Parse and display authors
            if (authorsText.toUpperCase().includes('N/A')) {
                authorContent.innerHTML = '<p>No authors identified.</p>';
            } else {
                // Split by common delimiters and clean up
                const authors = authorsText
                    .split(/[,\n\r]/)
                    .map(line => line.trim())
                    .filter(line => line.length > 0)
                    .filter(line => !line.toUpperCase().includes('N/A'))
                    .map(line => line.replace(/^[\d\-\•\*\.]+\s*/, '').trim())
                    .filter(name => name.length > 0);

                if (authors.length > 0) {
                    authorContent.innerHTML = `
                        <p><strong>Author(s):</strong></p>
                        <ul>
                            ${authors.map(author => `<li>${author}</li>`).join('')}
                        </ul>
                    `;
                } else {
                    authorContent.innerHTML = '<p>No authors identified.</p>';
                }
            }

            authorInfo.classList.remove('hidden');
        } catch (error) {
            loading.classList.add('hidden');
            errorMessage.textContent = `Error analyzing article: ${error.message}. Please check the URL and API key, then try again.`;
            errorMessage.classList.remove('hidden');
        } finally {
            analyzeBtn.disabled = false;
        }
    }

    // Analyze button event listener
    analyzeBtn.addEventListener('click', () => {
        const apiKey = apiKeyInput.value.trim();
        const url = urlInput.value.trim();
        
        if (!apiKey) {
            alert('Please enter your OpenAI API key.');
            apiKeyInput.focus();
            return;
        }
        
        // Save API key (localStorage + cookie)
        setApiKey(apiKey);
        
        if (!url) {
            alert('Please enter a URL to analyze.');
            urlInput.focus();
            return;
        }
        
        analyzeArticle(url, apiKey);
    });

    // Reset button event listener
    resetBtn.addEventListener('click', () => {
        urlInput.value = '';
        results.classList.add('hidden');
        loading.classList.add('hidden');
        authorInfo.classList.add('hidden');
        errorMessage.classList.add('hidden');
        urlInput.focus();
    });

    // Allow Enter key to trigger Analyze
    urlInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            analyzeBtn.click();
        }
    });
});

