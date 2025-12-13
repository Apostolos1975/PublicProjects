const fileInput = document.getElementById('fileInput');
const uploadBox = document.getElementById('uploadBox');
const fileInfo = document.getElementById('fileInfo');
const loading = document.getElementById('loading');
const results = document.getElementById('results');
const error = document.getElementById('error');
const resultsContent = document.getElementById('resultsContent');
const summary = document.getElementById('summary');

// Drag and drop handlers
uploadBox.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadBox.classList.add('dragover');
});

uploadBox.addEventListener('dragleave', () => {
    uploadBox.classList.remove('dragover');
});

uploadBox.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadBox.classList.remove('dragover');
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleFile(files[0]);
    }
});

uploadBox.addEventListener('click', () => {
    fileInput.click();
});

fileInput.addEventListener('change', (e) => {
    if (e.target.files.length > 0) {
        handleFile(e.target.files[0]);
    }
});

function handleFile(file) {
    // Validate file type
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 
                         'application/msword', 'text/plain'];
    const allowedExtensions = ['.pdf', '.docx', '.doc', '.txt'];
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    
    if (!allowedExtensions.includes(fileExtension)) {
        showError('Invalid file type. Please upload PDF, DOCX, or TXT files.');
        return;
    }

    // Show file info
    fileInfo.innerHTML = `
        <strong>Selected:</strong> ${file.name} (${formatFileSize(file.size)})
    `;
    fileInfo.classList.remove('hidden');

    // Hide previous results and errors
    results.classList.add('hidden');
    error.classList.add('hidden');

    // Upload and check
    uploadAndCheck(file);
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

async function uploadAndCheck(file) {
    loading.classList.remove('hidden');
    
    const formData = new FormData();
    formData.append('file', file);

    try {
        const response = await fetch('/api/check-pii', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error || 'An error occurred');
        }

        displayResults(data);
    } catch (err) {
        showError(err.message || 'Failed to analyze document. Please try again.');
    } finally {
        loading.classList.add('hidden');
    }
}

function displayResults(data) {
    const findings = data.findings;
    
    // Display summary
    if (findings.has_pii) {
        summary.innerHTML = `
            <div class="summary-card has-pii">
                <h3>⚠️</h3>
                <p>PII Detected</p>
            </div>
            <div class="summary-card">
                <h3>${findings.total_matches}</h3>
                <p>Total Matches</p>
            </div>
            <div class="summary-card">
                <h3>${Object.keys(findings.categories).length}</h3>
                <p>PII Categories</p>
            </div>
        `;
    } else {
        summary.innerHTML = `
            <div class="summary-card no-pii">
                <h3>✓</h3>
                <p>No PII Found</p>
            </div>
            <div class="summary-card">
                <h3>${data.text_length}</h3>
                <p>Characters Scanned</p>
            </div>
        `;
    }

    // Display detailed results
    if (findings.has_pii) {
        let html = '';
        for (const [category, info] of Object.entries(findings.categories)) {
            html += `
                <div class="category-section">
                    <div class="category-header">
                        <h3>${info.name} <span class="badge">${info.count}</span></h3>
                    </div>
                    <p style="color: #666; margin-bottom: 15px;">${info.description}</p>
                    ${info.matches.map(match => `
                        <div class="match-item">
                            <div class="match-value">${escapeHtml(match.value)}</div>
                            <div class="match-context">...${escapeHtml(match.context)}...</div>
                        </div>
                    `).join('')}
                </div>
            `;
        }
        resultsContent.innerHTML = html;
    } else {
        resultsContent.innerHTML = `
            <div class="no-pii-message">
                <h3>✓ No PII Detected</h3>
                <p>Your document appears to be free of personally identifiable information.</p>
            </div>
        `;
    }

    results.classList.remove('hidden');
}

function showError(message) {
    error.textContent = message;
    error.classList.remove('hidden');
    loading.classList.add('hidden');
    results.classList.add('hidden');
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

