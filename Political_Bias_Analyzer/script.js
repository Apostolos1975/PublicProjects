// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Get DOM elements
    const apiKeyInput = document.getElementById('apiKeyInput');
    const urlInput = document.getElementById('urlInput');
    const authorsInput = document.getElementById('authorsInput');
    const analyzeBtn = document.getElementById('analyzeBtn');
    const resetBtn = document.getElementById('resetBtn');
    const historyBtn = document.getElementById('historyBtn');
    const results = document.getElementById('results');
    const loading = document.getElementById('loading');
    const authorInfo = document.getElementById('authorInfo');
    const authorContent = document.getElementById('authorContent');
    const errorMessage = document.getElementById('errorMessage');
    const scaleMarkers = document.getElementById('scaleMarkers');
    const legendItems = document.getElementById('legendItems');

    // Persistent storage for authors (session-based, cleared on reset)
    let storedAuthors = [];
    const settingsIcon = document.getElementById('settingsIcon');
    const settingsModal = document.getElementById('settingsModal');
    const settingsCloseBtn = document.getElementById('settingsCloseBtn');
    const cleanKeyBtn = document.getElementById('cleanKeyBtn');
    const updateKeyBtn = document.getElementById('updateKeyBtn');

    // Settings modal functionality
    settingsIcon.addEventListener('click', () => {
        settingsModal.classList.add('show');
    });

    settingsCloseBtn.addEventListener('click', () => {
        settingsModal.classList.remove('show');
    });

    // Close modal when clicking outside of it
    settingsModal.addEventListener('click', (e) => {
        if (e.target === settingsModal) {
            settingsModal.classList.remove('show');
        }
    });

    // Close modal with Escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && settingsModal.classList.contains('show')) {
            settingsModal.classList.remove('show');
        }
    });

    // Clean and Update key button event listeners
    cleanKeyBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to clean the API key? This will remove it from storage.')) {
            cleanApiKey();
        }
    });

    updateKeyBtn.addEventListener('click', () => {
        updateApiKey();
    });

    // XSS Protection: Function to escape HTML entities
    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // XSS Protection: Safe function to set text content (creates elements safely)
    function safeSetAuthorContent(authors) {
        // Clear existing content safely
        while (authorContent.firstChild) {
            authorContent.removeChild(authorContent.firstChild);
        }
        
        // Create paragraph for label
        const labelP = document.createElement('p');
        const strong = document.createElement('strong');
        strong.textContent = 'Author(s):';
        labelP.appendChild(strong);
        authorContent.appendChild(labelP);
        
        // Create unordered list
        const ul = document.createElement('ul');
        authors.forEach(author => {
            const li = document.createElement('li');
            li.textContent = author; // textContent automatically escapes HTML
            ul.appendChild(li);
        });
        authorContent.appendChild(ul);
    }

    // XSS Protection: Safe function to set author content with political alignment
    function safeSetAuthorContentWithAlignment(authorsWithAlignment) {
        // Clear existing content safely
        while (authorContent.firstChild) {
            authorContent.removeChild(authorContent.firstChild);
        }
        
        // Create paragraph for label
        const labelP = document.createElement('p');
        const strong = document.createElement('strong');
        strong.textContent = 'Author(s):';
        labelP.appendChild(strong);
        authorContent.appendChild(labelP);
        
        // Create container for authors
        authorsWithAlignment.forEach(({ name, alignment }) => {
            const authorDiv = document.createElement('div');
            authorDiv.style.marginBottom = '20px';
            authorDiv.style.padding = '15px';
            authorDiv.style.background = 'white';
            authorDiv.style.borderRadius = '8px';
            authorDiv.style.borderLeft = '4px solid #667eea';
            
            // Author name
            const nameP = document.createElement('p');
            nameP.style.fontWeight = '600';
            nameP.style.marginBottom = '10px';
            nameP.style.color = '#333';
            nameP.style.fontSize = '16px';
            nameP.textContent = name;
            authorDiv.appendChild(nameP);
            
            // Political alignment
            const alignmentDiv = document.createElement('div');
            alignmentDiv.style.marginTop = '10px';
            alignmentDiv.style.padding = '10px';
            alignmentDiv.style.background = '#f8f9fa';
            alignmentDiv.style.borderRadius = '5px';
            alignmentDiv.style.fontSize = '14px';
            alignmentDiv.style.color = '#555';
            alignmentDiv.style.whiteSpace = 'pre-wrap';
            alignmentDiv.textContent = alignment || 'Analysis unavailable';
            authorDiv.appendChild(alignmentDiv);
            
            authorContent.appendChild(authorDiv);
        });
    }

    // XSS Protection: Validate and sanitize URL
    function validateUrl(url) {
        try {
            const urlObj = new URL(url);
            // Only allow http and https protocols
            if (!['http:', 'https:'].includes(urlObj.protocol)) {
                throw new Error('Invalid protocol. Only http and https are allowed.');
            }
            return url.trim();
        } catch (e) {
            throw new Error('Invalid URL format. Please enter a valid URL.');
        }
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

    function cleanApiKey() {
        // Remove from localStorage
        try {
            localStorage.removeItem('openaiApiKey');
        } catch (e) {
            console.warn('localStorage not available');
        }
        
        // Remove from cookie by setting expiration date in the past
        document.cookie = `openaiApiKey=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; SameSite=Strict`;
        
        // Clear the input field
        apiKeyInput.value = '';
    }

    function updateApiKey() {
        const apiKey = apiKeyInput.value.trim();
        if (apiKey) {
            setApiKey(apiKey);
            alert('API key updated successfully!');
        } else {
            alert('Please enter an API key before updating.');
        }
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

    // Initialize scale visualization (empty on load)
    updateScaleVisualization();

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
                temperature: 0.1,
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

    // Function to get political alignment for a person
    async function getPoliticalAlignment(fullName, articleText, apiKey) {
        // Limit article text to avoid token limits (first 4000 characters for context)
        const limitedArticleText = articleText ? articleText.substring(0, 4000) : '';
        
        const prompt = `You are an analyst tasked with identifying the political affiliation or political alignment of a person.

Person: ${fullName}

${limitedArticleText ? `Article context:
The following is an article written by or associated with this person. Consider this material as part of your analysis:

${limitedArticleText}

---` : ''}

Instructions:
* First determine whether the person is a public figure.
** If the person is not clearly a public figure, state that political affiliation cannot be reliably determined and stop.
* If the person is a public figure:
** Identify any formal political affiliation (party membership, elected office, official role).
** If no formal affiliation exists, assess political alignment or ideological leaning based on:
*** public statements
*** published writings (including the article text provided above, if available)
*** leadership or editorial roles
*** documented associations
*** the content and tone of the article text provided above, if available
* Do not guess.
** If evidence is insufficient or mixed, explicitly state that.
** Only use publicly available information. Do not infer private beliefs.
* Separate facts from interpretation.
${limitedArticleText ? '* Consider the article text provided above as additional context for understanding the person\'s political alignment.' : ''}

Output format:

* Political alignment / leaning:

(e.g., left-leaning, conservative, liberal, social democratic, etc., or "unclear")

* Confidence level:

High / Medium / Low

* GAL-TAN Score:

Provide a numerical score from -100 to +100 on the GAL-TAN scale where:
- -100 represents strong GAL (Green/Alternative/Libertarian) positions
- 0 represents centrist/moderate positions
- +100 represents strong TAN (Traditional/Authoritarian/Nationalist) positions

Format: Score: [number between -100 and 100]`;

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
                temperature: 0.1,
                max_tokens: 600
            })
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error?.message || `API error: ${response.status}`);
        }

        const data = await response.json();
        return data.choices[0].message.content.trim();
    }

    // Function to parse GAL-TAN score from ChatGPT response
    function parseGALTanScore(responseText) {
        // Try to find score in format "Score: [number]" or similar patterns
        const scoreMatch = responseText.match(/Score:\s*(-?\d+)/i) || 
                          responseText.match(/GAL-TAN Score:\s*(-?\d+)/i) ||
                          responseText.match(/(-?\d+)\s*(?:out of 100|on the scale)/i);
        
        if (scoreMatch) {
            const score = parseInt(scoreMatch[1], 10);
            // Clamp score to valid range
            return Math.max(-100, Math.min(100, score));
        }
        
        // Try to infer score from alignment description
        const text = responseText.toLowerCase();
        if (text.includes('unclear') || text.includes('cannot be determined') || text.includes('insufficient')) {
            return null; // Unable to determine
        }
        
        // Rough estimation based on keywords (fallback if no explicit score)
        if (text.includes('strong gal') || text.includes('strongly left') || text.includes('green') || text.includes('libertarian left')) {
            return -80;
        } else if (text.includes('gal') || text.includes('left-leaning') || text.includes('progressive') || text.includes('liberal')) {
            return -50;
        } else if (text.includes('centrist') || text.includes('moderate') || text.includes('center')) {
            return 0;
        } else if (text.includes('tan') || text.includes('right-leaning') || text.includes('conservative') || text.includes('traditional')) {
            return 50;
        } else if (text.includes('strong tan') || text.includes('strongly right') || text.includes('authoritarian') || text.includes('nationalist')) {
            return 80;
        }
        
        return null; // Unable to determine
    }

    // Function to extract marker color (different color for each author)
    function getMarkerColor(index) {
        const colors = [
            '#ef4444', // red
            '#3b82f6', // blue
            '#10b981', // green
            '#f59e0b', // amber
            '#8b5cf6', // purple
            '#ec4899', // pink
            '#06b6d4', // cyan
            '#f97316', // orange
            '#6366f1', // indigo
            '#14b8a6'  // teal
        ];
        return colors[index % colors.length];
    }

    // Function to update scale visualization with markers
    function updateScaleVisualization() {
        // Clear existing markers
        while (scaleMarkers.firstChild) {
            scaleMarkers.removeChild(scaleMarkers.firstChild);
        }
        
        // Clear existing legend items
        while (legendItems.firstChild) {
            legendItems.removeChild(legendItems.firstChild);
        }

        // Add markers and legend items for each stored author
        storedAuthors.forEach((author, index) => {
            if (author.score === null || author.score === undefined) return;
            
            // Calculate position percentage (0 to 100, where 0 = -100, 100 = +100)
            const positionPercent = ((author.score + 100) / 200) * 100;
            
            // Create marker
            const marker = document.createElement('div');
            marker.className = 'scale-marker';
            marker.style.left = `${positionPercent}%`;
            marker.style.borderTopColor = getMarkerColor(index);
            
            // Create marker label (author name initial or short form)
            const markerLabel = document.createElement('div');
            markerLabel.className = 'scale-marker-label';
            markerLabel.textContent = author.name.split(' ').map(n => n[0]).join('').substring(0, 3);
            markerLabel.style.color = getMarkerColor(index);
            marker.appendChild(markerLabel);
            
            scaleMarkers.appendChild(marker);
            
            // Create legend item
            const legendItem = document.createElement('div');
            legendItem.className = 'legend-item';
            
            const legendMarker = document.createElement('div');
            legendMarker.className = 'legend-marker';
            legendMarker.style.borderTopColor = getMarkerColor(index);
            
            const legendName = document.createElement('div');
            legendName.className = 'legend-name';
            legendName.textContent = author.name;
            
            legendItem.appendChild(legendMarker);
            legendItem.appendChild(legendName);
            legendItems.appendChild(legendItem);
        });
    }

    // Function to analyze authors directly (without article)
    async function analyzeAuthors(authorsText, apiKey) {
        // Show loading state
        results.classList.remove('hidden');
        loading.classList.remove('hidden');
        authorInfo.classList.add('hidden');
        errorMessage.classList.add('hidden');
        analyzeBtn.disabled = true;

        try {
            // Parse author names from input
            const authors = authorsText
                .split(/[,\n\r]/)
                .map(line => line.trim())
                .filter(line => line.length > 0);

            if (authors.length === 0) {
                throw new Error('No valid author names found. Please enter author names separated by commas or new lines.');
            }

            // Query political alignment for each author (without article text)
            const loadingTextElement = loading.querySelector('p');
            const originalLoadingText = loadingTextElement.textContent;
            loadingTextElement.textContent = 'Analyzing political alignment...';
            const authorsWithAlignment = [];
            
            for (const authorName of authors) {
                try {
                    // Pass null for articleText since we don't have an article
                    const alignment = await getPoliticalAlignment(authorName, null, apiKey);
                    const score = parseGALTanScore(alignment);
                    
                    authorsWithAlignment.push({ 
                        name: authorName, 
                        alignment: alignment,
                        score: score
                    });
                    
                    // Store author in persistent array (avoid duplicates by name)
                    const existingIndex = storedAuthors.findIndex(a => 
                        a.name.toLowerCase().trim() === authorName.toLowerCase().trim()
                    );
                    if (existingIndex === -1) {
                        storedAuthors.push({
                            name: authorName,
                            alignment: alignment,
                            score: score
                        });
                    } else {
                        // Update existing author with new data
                        storedAuthors[existingIndex] = {
                            name: authorName,
                            alignment: alignment,
                            score: score
                        };
                    }
                } catch (error) {
                    console.error(`Error getting alignment for ${authorName}:`, error);
                    authorsWithAlignment.push({ 
                        name: authorName, 
                        alignment: `Error retrieving political alignment: ${error.message}`,
                        score: null
                    });
                }
            }
            
            // Update scale visualization with all stored authors
            updateScaleVisualization();
            
            // Restore original loading text and hide loading, show results
            loadingTextElement.textContent = originalLoadingText;
            loading.classList.add('hidden');
            safeSetAuthorContentWithAlignment(authorsWithAlignment);
            authorInfo.classList.remove('hidden');
        } catch (error) {
            loading.classList.add('hidden');
            errorMessage.textContent = `Error analyzing authors: ${error.message}. Please check the names and API key, then try again.`;
            errorMessage.classList.remove('hidden');
        } finally {
            analyzeBtn.disabled = false;
        }
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

            // Parse and display authors (XSS-safe)
            if (authorsText.toUpperCase().includes('N/A')) {
                // Hide loading, show results
                loading.classList.add('hidden');
                while (authorContent.firstChild) {
                    authorContent.removeChild(authorContent.firstChild);
                }
                const p = document.createElement('p');
                p.textContent = 'No authors identified.';
                authorContent.appendChild(p);
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
                    // Query political alignment for each author
                    const loadingTextElement = loading.querySelector('p');
                    const originalLoadingText = loadingTextElement.textContent;
                    loadingTextElement.textContent = 'Analyzing political alignment...';
                    const authorsWithAlignment = [];
                    
                    for (const authorName of authors) {
                        try {
                            // Pass article text for context
                            const alignment = await getPoliticalAlignment(authorName, articleTextContent, apiKey);
                            const score = parseGALTanScore(alignment);
                            
                            authorsWithAlignment.push({ 
                                name: authorName, 
                                alignment: alignment,
                                score: score
                            });
                            
                            // Store author in persistent array (avoid duplicates by name)
                            const existingIndex = storedAuthors.findIndex(a => 
                                a.name.toLowerCase().trim() === authorName.toLowerCase().trim()
                            );
                            if (existingIndex === -1) {
                                storedAuthors.push({
                                    name: authorName,
                                    alignment: alignment,
                                    score: score
                                });
                            } else {
                                // Update existing author with new data
                                storedAuthors[existingIndex] = {
                                    name: authorName,
                                    alignment: alignment,
                                    score: score
                                };
                            }
                        } catch (error) {
                            console.error(`Error getting alignment for ${authorName}:`, error);
                            authorsWithAlignment.push({ 
                                name: authorName, 
                                alignment: `Error retrieving political alignment: ${error.message}`,
                                score: null
                            });
                        }
                    }
                    
                    // Update scale visualization with all stored authors
                    updateScaleVisualization();
                    
                    // Restore original loading text and hide loading, show results
                    loadingTextElement.textContent = originalLoadingText;
                    loading.classList.add('hidden');
                    safeSetAuthorContentWithAlignment(authorsWithAlignment);
                } else {
                    // Hide loading, show results
                    loading.classList.add('hidden');
                    while (authorContent.firstChild) {
                        authorContent.removeChild(authorContent.firstChild);
                    }
                    const p = document.createElement('p');
                    p.textContent = 'No authors identified.';
                    authorContent.appendChild(p);
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

    // Clear URL when authors are manually entered
    authorsInput.addEventListener('input', () => {
        if (authorsInput.value.trim().length > 0) {
            urlInput.value = '';
        }
    });

    // Analyze button event listener
    analyzeBtn.addEventListener('click', () => {
        const apiKey = apiKeyInput.value.trim();
        const url = urlInput.value.trim();
        const authorsText = authorsInput.value.trim();
        
        if (!apiKey) {
            alert('Please enter your OpenAI API key.');
            apiKeyInput.focus();
            return;
        }
        
        // Save API key (localStorage + cookie)
        setApiKey(apiKey);
        
        // Check if we have manual author names or a URL
        if (authorsText) {
            // Process manual author names
            analyzeAuthors(authorsText, apiKey);
        } else if (url) {
            // Validate URL (XSS protection)
            try {
                const validatedUrl = validateUrl(url);
                analyzeArticle(validatedUrl, apiKey);
            } catch (error) {
                errorMessage.textContent = error.message;
                errorMessage.classList.remove('hidden');
                results.classList.remove('hidden');
            }
        } else {
            alert('Please enter either an article URL or author names to analyze.');
            if (!url) urlInput.focus();
            else authorsInput.focus();
        }
    });

    // Reset button event listener
    resetBtn.addEventListener('click', () => {
        urlInput.value = '';
        authorsInput.value = '';
        results.classList.add('hidden');
        loading.classList.add('hidden');
        authorInfo.classList.add('hidden');
        errorMessage.classList.add('hidden');
        
        // Clear stored authors and update visualization
        storedAuthors = [];
        updateScaleVisualization();
        
        urlInput.focus();
    });

    // History button event listener (functionality to be defined later)
    historyBtn.addEventListener('click', () => {
        // TODO: Implement history functionality
    });

    // Allow Enter key to trigger Analyze
    urlInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            analyzeBtn.click();
        }
    });
});

