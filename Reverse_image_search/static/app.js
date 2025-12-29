// Service information
let servicesData = {};

// Check if running from file:// protocol
function checkServerConnection() {
    if (window.location.protocol === 'file:') {
        showServerError();
        return false;
    }
    return true;
}

function showServerError() {
    const servicesInfo = document.getElementById('servicesInfo');
    servicesInfo.innerHTML = `
        <div style="background: #fff3cd; border: 2px solid #ffc107; border-radius: 12px; padding: 30px; text-align: center;">
            <h2 style="color: #856404; margin-bottom: 15px;">⚠️ Server Not Running</h2>
            <p style="color: #856404; margin-bottom: 20px; font-size: 1.1rem;">
                This application needs to be run through the Flask server, not opened directly from the file system.
            </p>
            <div style="background: white; border-radius: 8px; padding: 20px; text-align: left; max-width: 600px; margin: 0 auto;">
                <p style="margin-bottom: 10px; font-weight: 600; color: #333;">To start the server:</p>
                <ol style="color: #333; line-height: 1.8;">
                    <li>Open a terminal/command prompt</li>
                    <li>Navigate to the project directory</li>
                    <li>Run: <code style="background: #f5f5f5; padding: 4px 8px; border-radius: 4px; font-family: monospace;">python app.py</code></li>
                    <li>Open your browser to: <code style="background: #f5f5f5; padding: 4px 8px; border-radius: 4px; font-family: monospace;">http://localhost:5000</code></li>
                </ol>
            </div>
        </div>
    `;
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    if (!checkServerConnection()) {
        return;
    }
    initializeUpload();
    loadServices();
});

// Initialize file upload functionality
function initializeUpload() {
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    const previewSection = document.getElementById('previewSection');
    const previewImage = document.getElementById('previewImage');
    const searchBtn = document.getElementById('searchBtn');
    const clearBtn = document.getElementById('clearBtn');

    // Label will handle click naturally - no need to manually trigger
    // Just prevent label from navigating away
    uploadArea.addEventListener('click', (e) => {
        // Let the label handle the click naturally for file input
        // This works better in Firefox
    });
    
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.stopPropagation();
        uploadArea.style.borderColor = '#764ba2';
        uploadArea.style.background = '#f0f2ff';
    });

    uploadArea.addEventListener('dragleave', (e) => {
        e.preventDefault();
        e.stopPropagation();
        uploadArea.style.borderColor = '#667eea';
        uploadArea.style.background = '#f8f9ff';
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        e.stopPropagation();
        uploadArea.style.borderColor = '#667eea';
        uploadArea.style.background = '#f8f9ff';
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFileSelect(files[0]);
        }
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFileSelect(e.target.files[0]);
        }
    });

    searchBtn.addEventListener('click', () => {
        const imageData = previewImage.src;
        if (imageData) {
            searchAllAPIs(imageData);
        }
    });

    clearBtn.addEventListener('click', () => {
        fileInput.value = '';
        previewSection.style.display = 'none';
        document.getElementById('resultsSection').style.display = 'none';
        uploadArea.style.display = 'block';
    });
}

function handleFileSelect(file) {
    if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        const uploadArea = document.getElementById('uploadArea');
        const previewSection = document.getElementById('previewSection');
        const previewImage = document.getElementById('previewImage');
        
        previewImage.src = e.target.result;
        uploadArea.style.display = 'none';
        previewSection.style.display = 'flex';
    };
    reader.readAsDataURL(file);
}

// Load available services
async function loadServices() {
    try {
        const response = await fetch('/api/services');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        servicesData = await response.json();
        displayServices(servicesData);
    } catch (error) {
        console.error('Error loading services:', error);
        // Show error message if server is not accessible
        const servicesInfo = document.getElementById('servicesInfo');
        if (servicesInfo && !servicesInfo.querySelector('.server-error')) {
            servicesInfo.innerHTML = `
                <div class="server-error" style="background: #f8d7da; border: 2px solid #f5c6cb; border-radius: 12px; padding: 20px; text-align: center;">
                    <h2 style="color: #721c24; margin-bottom: 10px;">⚠️ Cannot Connect to Server</h2>
                    <p style="color: #721c24;">
                        Make sure the Flask server is running. Start it with: <code style="background: #f5f5f5; padding: 4px 8px; border-radius: 4px;">python app.py</code>
                    </p>
                    <p style="color: #721c24; margin-top: 10px;">
                        Then open: <code style="background: #f5f5f5; padding: 4px 8px; border-radius: 4px;">http://localhost:5000</code>
                    </p>
                </div>
            `;
        }
    }
}

function displayServices(services) {
    const servicesGrid = document.getElementById('servicesGrid');
    servicesGrid.innerHTML = '';

    Object.keys(services).forEach(key => {
        const service = services[key];
        const card = document.createElement('div');
        card.className = `service-card ${service.configured ? 'configured' : ''}`;
        
        card.innerHTML = `
            <h3>${service.name}</h3>
            <span class="service-status ${service.configured ? 'status-configured' : 'status-not-configured'}">
                ${service.configured ? '✓ Configured' : '⚠ Not Configured'}
            </span>
            <ul class="service-features">
                ${service.features.map(feature => `<li>${feature}</li>`).join('')}
            </ul>
        `;
        
        servicesGrid.appendChild(card);
    });
}

// Search all APIs
async function searchAllAPIs(imageData) {
    const loading = document.getElementById('loading');
    const resultsSection = document.getElementById('resultsSection');
    const resultsGrid = document.getElementById('resultsGrid');
    
    loading.style.display = 'block';
    resultsSection.style.display = 'none';
    resultsGrid.innerHTML = '';

    try {
        const response = await fetch('/api/compare', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ image_data: imageData })
        });

        const results = await response.json();
        displayResults(results);
        
    } catch (error) {
        console.error('Error searching APIs:', error);
        showError('Failed to search APIs. Please try again.');
    } finally {
        loading.style.display = 'none';
        resultsSection.style.display = 'block';
    }
}

function displayResults(results) {
    const resultsGrid = document.getElementById('resultsGrid');
    resultsGrid.innerHTML = '';

    Object.keys(results).forEach(serviceName => {
        const result = results[serviceName];
        const serviceInfo = servicesData[serviceName] || { name: serviceName };
        
        const card = document.createElement('div');
        card.className = `result-card ${result.success ? 'success' : 'error'}`;
        
        let content = `
            <div class="result-header">
                <h3>${serviceInfo.name}</h3>
                <span class="result-status ${result.success ? 'status-success' : 'status-error'}">
                    ${result.success ? 'Success' : 'Error'}
                </span>
            </div>
        `;

        if (result.success) {
            const totalResults = result.total_results || (result.results ? result.results.length : 0);
            content += `
                <div class="result-info">
                    <p class="result-count">Found ${totalResults} result(s)</p>
                    ${result.results && result.results.length > 0 ? `
                        <p style="margin-top: 10px; font-size: 0.85rem; color: #666;">
                            Sample results available. Check API response for full details.
                        </p>
                    ` : ''}
                </div>
            `;
        } else {
            content += `
                <div class="error-message">
                    ${result.error || 'Unknown error occurred'}
                </div>
            `;
        }

        card.innerHTML = content;
        resultsGrid.appendChild(card);
    });
}

function showError(message) {
    const resultsGrid = document.getElementById('resultsGrid');
    resultsGrid.innerHTML = `
        <div class="result-card error" style="grid-column: 1 / -1;">
            <div class="error-message">${message}</div>
        </div>
    `;
}

