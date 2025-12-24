// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Get DOM elements
    const apiKeyInput = document.getElementById('apiKeyInput');
    const urlInput = document.getElementById('urlInput');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const resetBtn = document.getElementById('resetBtn');
    const results = document.getElementById('results');
    const loading = document.getElementById('loading');
    const articleContent = document.getElementById('articleContent');
    const articleText = document.getElementById('articleText');
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

    // Function to fetch article content with multiple proxy fallbacks
    async function fetchArticleContent(url) {
        const proxies = [
            // Proxy 1: AllOrigins (most reliable)
            async (url) => {
                const proxyUrl = `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
                const response = await fetch(proxyUrl);
                if (response.ok) {
                    const text = await response.text();
                    if (text && text.length > 100) return text;
                }
                throw new Error('AllOrigins proxy failed');
            },
            // Proxy 2: AllOrigins with JSON format (fallback)
            async (url) => {
                const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(url)}`;
                const response = await fetch(proxyUrl);
                if (response.ok) {
                    const data = await response.json();
                    if (data.contents) return data.contents;
                }
                throw new Error('AllOrigins JSON proxy failed');
            },
            // Proxy 3: ThingProxy (alternative)
            async (url) => {
                const proxyUrl = `https://thingproxy.freeboard.io/fetch/${encodeURIComponent(url)}`;
                const response = await fetch(proxyUrl);
                if (response.ok) {
                    const text = await response.text();
                    if (text && text.length > 100) return text;
                }
                throw new Error('ThingProxy failed');
            }
        ];

        let lastError;
        for (let i = 0; i < proxies.length; i++) {
            try {
                const content = await Promise.race([
                    proxies[i](url),
                    new Promise((_, reject) => 
                        setTimeout(() => reject(new Error('Proxy timeout')), 15000)
                    )
                ]);
                if (content && content.length > 100) {
                    console.log(`Successfully fetched using proxy ${i + 1}`);
                    return content;
                }
            } catch (error) {
                console.warn(`Proxy ${i + 1} attempt failed:`, error.message);
                lastError = error;
                // Continue to next proxy
            }
        }

        // If all proxies failed, provide helpful error message
        throw new Error(`Unable to fetch article. This may be due to CORS restrictions. Try using a browser extension like "CORS Unblock" or run this application with CORS disabled. Last error: ${lastError?.message || 'Network error'}`);
    }

    // Function to extract article text from HTML
    function extractArticleText(html) {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        // Remove script and style elements
        const scripts = doc.querySelectorAll('script, style, noscript');
        scripts.forEach(el => el.remove());
        
        // Try to find main article content
        const articleSelectors = ['article', '[role="article"]', '.article', '.post', 'main', '.content'];
        let articleElement = null;
        
        for (const selector of articleSelectors) {
            articleElement = doc.querySelector(selector);
            if (articleElement) break;
        }
        
        // Use article element if found, otherwise use body
        const contentElement = articleElement || doc.body;
        const text = contentElement.textContent || '';
        
        // Clean up the text (remove extra whitespace, preserve paragraph breaks)
        return text.replace(/\s+/g, ' ').trim();
    }

    // Function to identify authors using ChatGPT
    async function identifyAuthors(articleText, apiKey) {
        // Limit article text to avoid token limits (first 8000 characters)
        const limitedText = articleText.substring(0, 8000);
        
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
                        content: `Identify the author or authors of this article and return their names in a list. Return just their names. Nothing more. If you cannot identify any authors, return an N/A.\n\nArticle text:\n${limitedText}`
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
        articleContent.classList.add('hidden');
        authorInfo.classList.add('hidden');
        errorMessage.classList.add('hidden');
        analyzeBtn.disabled = true;

        try {
            // Fetch article HTML
            const html = await fetchArticleContent(url);
            
            // Extract article text
            const articleTextContent = extractArticleText(html);
            
            if (!articleTextContent || articleTextContent.length < 100) {
                throw new Error('Could not extract article content from the page.');
            }

            // Log the captured article text to console
            console.log('Captured article text:', articleTextContent);
            console.log('Article text length:', articleTextContent.length, 'characters');

            // Identify authors using ChatGPT with the article text
            const authorsText = await identifyAuthors(articleTextContent, apiKey);

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
        articleContent.classList.add('hidden');
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

