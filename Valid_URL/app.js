/**
 * Main Application Logic
 * Coordinates file parsing, URL validation, and UI updates
 */

class URLValidatorApp {
    constructor() {
        this.parser = new FileParser();
        this.validator = new URLValidator();
        this.urlEntries = [];
        this.deletedURLs = new Set();
        
        this.initializeEventListeners();
    }

    /**
     * Initialize all event listeners
     */
    initializeEventListeners() {
        const fileInput = document.getElementById('fileInput');
        const uploadArea = document.getElementById('uploadArea');
        const clearFileBtn = document.getElementById('clearFile');
        const downloadBtn = document.getElementById('downloadBtn');
        const statusFilter = document.getElementById('statusFilter');

        // File input change
        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                this.handleFileUpload(e.target.files[0]);
            }
        });

        // Drag and drop
        uploadArea.addEventListener('click', () => fileInput.click());
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });
        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });
        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            if (e.dataTransfer.files.length > 0) {
                this.handleFileUpload(e.dataTransfer.files[0]);
            }
        });

        // Clear file
        clearFileBtn.addEventListener('click', () => {
            this.resetApp();
        });

        // Download modified file
        downloadBtn.addEventListener('click', () => {
            this.downloadModifiedFile();
        });

        // Status filter
        statusFilter.addEventListener('change', () => {
            this.filterResults();
        });
    }

    /**
     * Handle file upload
     */
    async handleFileUpload(file) {
        try {
            this.showError('');
            this.showFileInfo(file.name);
            this.showProgress(0, 'Parsing file...');

            // Parse file
            const urls = await this.parser.parseFile(file);
            
            if (urls.length === 0) {
                this.showError('No URLs found in the file.');
                this.hideProgress();
                return;
            }

            this.urlEntries = urls;
            this.deletedURLs.clear();

            // Validate URLs
            this.showProgress(0, `Validating ${urls.length} URLs...`);
            const validatedEntries = await this.validator.validateURLs(
                urls,
                (progress, current, total) => {
                    this.showProgress(progress, `Validating ${current} of ${total} URLs...`);
                }
            );

            this.urlEntries = validatedEntries;
            this.hideProgress();
            this.displayResults();
            this.enableDownload();

        } catch (error) {
            this.showError(`Error: ${error.message}`);
            this.hideProgress();
            console.error('File upload error:', error);
        }
    }

    /**
     * Display validation results in table
     */
    displayResults() {
        const resultsSection = document.getElementById('resultsSection');
        const resultsBody = document.getElementById('resultsBody');
        const resultsSummary = document.getElementById('resultsSummary');

        resultsSection.style.display = 'block';
        resultsBody.innerHTML = '';

        const visibleEntries = this.getVisibleEntries();

        visibleEntries.forEach((entry) => {
            if (this.deletedURLs.has(entry.url)) return;

            const row = document.createElement('tr');
            const validation = entry.validation || { status: 'pending', statusCode: 0, message: 'Pending' };

            const statusClass = this.validator.getStatusClass(validation.status, validation.statusCode);
            const statusText = this.validator.formatStatus(validation.status, validation.statusCode, validation.message);

            // Escape URL for use in HTML attributes
            const escapedUrl = entry.url.replace(/'/g, "&#39;").replace(/"/g, "&quot;");
            const displayUrl = entry.url.replace(/</g, "&lt;").replace(/>/g, "&gt;");
            
            row.innerHTML = `
                <td class="url-cell">
                    <a href="${entry.url}" target="_blank" rel="noopener noreferrer" class="url-link">${displayUrl}</a>
                </td>
                <td>
                    <span class="status-badge ${statusClass}">${statusText}</span>
                </td>
                <td class="source-cell">${entry.source.replace(/</g, "&lt;").replace(/>/g, "&gt;")}</td>
                <td>
                    <button class="btn-danger" data-url="${escapedUrl}">Delete</button>
                </td>
            `;
            
            // Add event listener to avoid inline onclick with special characters
            const deleteBtn = row.querySelector('.btn-danger');
            deleteBtn.addEventListener('click', () => {
                this.deleteEntry(entry.url);
            });

            resultsBody.appendChild(row);
        });

        // Update summary
        this.updateSummary(visibleEntries);
    }

    /**
     * Get visible entries based on filter
     */
    getVisibleEntries() {
        const filter = document.getElementById('statusFilter').value;
        
        if (filter === 'all') {
            return this.urlEntries;
        }

        return this.urlEntries.filter(entry => {
            const validation = entry.validation || {};
            if (filter === '200') {
                return validation.status === 'success' && validation.statusCode === 200;
            } else if (filter === 'error') {
                return validation.status === 'error';
            } else if (filter === 'cors') {
                return validation.status === 'cors';
            }
            return true;
        });
    }

    /**
     * Filter results based on status
     */
    filterResults() {
        this.displayResults();
    }

    /**
     * Update results summary
     */
    updateSummary(entries) {
        const summary = document.getElementById('resultsSummary');
        const total = this.urlEntries.length;
        const deleted = this.deletedURLs.size;
        const remaining = total - deleted;

        const success = entries.filter(e => 
            e.validation && e.validation.status === 'success' && e.validation.statusCode === 200
        ).length;
        const errors = entries.filter(e => 
            e.validation && e.validation.status === 'error'
        ).length;
        const cors = entries.filter(e => 
            e.validation && e.validation.status === 'cors'
        ).length;
        const timeouts = entries.filter(e => 
            e.validation && e.validation.status === 'timeout'
        ).length;

        summary.innerHTML = `
            <strong>Summary:</strong> 
            Total: ${total} | 
            Remaining: ${remaining} | 
            Deleted: ${deleted} | 
            Success: ${success} | 
            Errors: ${errors} | 
            CORS Blocked: ${cors} | 
            Timeouts: ${timeouts}
        `;
    }

    /**
     * Delete an entry
     */
    deleteEntry(url) {
        if (this.deletedURLs.has(url)) return;

        const entry = this.urlEntries.find(e => e.url === url);
        if (!entry) return;

        // Delete from parser
        const deleted = this.parser.deleteURL(entry);
        if (deleted) {
            this.deletedURLs.add(url);
            this.displayResults();
            this.enableDownload();
        } else {
            this.showError('Failed to delete entry from file.');
        }
    }

    /**
     * Download modified file
     */
    downloadModifiedFile() {
        try {
            const blob = this.parser.generateModifiedFile();
            if (!blob) {
                this.showError('Failed to generate modified file.');
                return;
            }

            const fileName = this.parser.getFileName();
            const fileType = this.parser.getFileType();
            
            // Generate download filename
            let downloadName = fileName;
            if (fileType === 'word') {
                // Word files are saved as text for now
                downloadName = fileName.replace(/\.docx?$/i, '_modified.txt');
            } else {
                downloadName = fileName.replace(/(\.[^.]+)$/, '_modified$1');
            }

            saveAs(blob, downloadName);
        } catch (error) {
            this.showError(`Error generating download: ${error.message}`);
            console.error('Download error:', error);
        }
    }

    /**
     * Show file info
     */
    showFileInfo(fileName) {
        const fileInfo = document.getElementById('fileInfo');
        const fileNameSpan = document.getElementById('fileName');
        fileNameSpan.textContent = fileName;
        fileInfo.style.display = 'flex';
    }

    /**
     * Show progress
     */
    showProgress(percentage, text) {
        const progressSection = document.getElementById('progressSection');
        const progressFill = document.getElementById('progressFill');
        const progressText = document.getElementById('progressText');

        progressSection.style.display = 'block';
        progressFill.style.width = `${percentage}%`;
        progressText.textContent = text;
    }

    /**
     * Hide progress
     */
    hideProgress() {
        const progressSection = document.getElementById('progressSection');
        progressSection.style.display = 'none';
    }

    /**
     * Show error message
     */
    showError(message) {
        const errorMessage = document.getElementById('errorMessage');
        if (message) {
            errorMessage.textContent = message;
            errorMessage.style.display = 'block';
        } else {
            errorMessage.style.display = 'none';
        }
    }

    /**
     * Enable download button
     */
    enableDownload() {
        const downloadBtn = document.getElementById('downloadBtn');
        downloadBtn.disabled = this.deletedURLs.size === 0;
    }

    /**
     * Reset application state
     */
    resetApp() {
        this.parser = new FileParser();
        this.urlEntries = [];
        this.deletedURLs.clear();

        document.getElementById('fileInput').value = '';
        document.getElementById('fileInfo').style.display = 'none';
        document.getElementById('resultsSection').style.display = 'none';
        document.getElementById('progressSection').style.display = 'none';
        document.getElementById('downloadBtn').disabled = true;
        this.showError('');
    }
}

// Initialize app when DOM is ready
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new URLValidatorApp();
});

