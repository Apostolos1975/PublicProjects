/**
 * File Parser Module
 * Handles parsing of Excel, Word, CSV, and Firefox bookmark files
 */

class FileParser {
    constructor() {
        this.fileData = null;
        this.fileType = null;
        this.fileName = null;
    }

    /**
     * Parse uploaded file based on its type
     */
    async parseFile(file) {
        this.fileName = file.name;
        const extension = file.name.split('.').pop().toLowerCase();
        
        try {
            switch (extension) {
                case 'xlsx':
                case 'xls':
                    this.fileType = 'excel';
                    this.fileData = await this.parseExcel(file);
                    break;
                case 'docx':
                    this.fileType = 'word';
                    this.fileData = await this.parseWord(file);
                    break;
                case 'csv':
                    this.fileType = 'csv';
                    this.fileData = await this.parseCSV(file);
                    break;
                case 'json':
                    this.fileType = 'bookmarks';
                    this.fileData = await this.parseBookmarks(file);
                    break;
                default:
                    throw new Error('Unsupported file format');
            }
            return this.extractURLs();
        } catch (error) {
            throw new Error(`Error parsing file: ${error.message}`);
        }
    }

    /**
     * Parse Excel file using SheetJS
     */
    async parseExcel(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const data = new Uint8Array(e.target.result);
                    const workbook = XLSX.read(data, { type: 'array' });
                    const result = {
                        workbook: workbook,
                        sheets: {}
                    };
                    
                    workbook.SheetNames.forEach(sheetName => {
                        const worksheet = workbook.Sheets[sheetName];
                        result.sheets[sheetName] = worksheet;
                    });
                    
                    resolve(result);
                } catch (error) {
                    reject(error);
                }
            };
            reader.onerror = reject;
            reader.readAsArrayBuffer(file);
        });
    }

    /**
     * Parse Word document using Mammoth.js
     */
    async parseWord(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = async (e) => {
                try {
                    const arrayBuffer = e.target.result;
                    const result = await mammoth.extractRawText({ arrayBuffer });
                    const htmlResult = await mammoth.convertToHtml({ arrayBuffer });
                    
                    resolve({
                        text: result.value,
                        html: htmlResult.value,
                        originalFile: file
                    });
                } catch (error) {
                    reject(error);
                }
            };
            reader.onerror = reject;
            reader.readAsArrayBuffer(file);
        });
    }

    /**
     * Parse CSV file
     */
    async parseCSV(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const text = e.target.result;
                    const lines = text.split('\n');
                    const rows = lines.map((line, index) => ({
                        index: index,
                        data: line.split(',').map(cell => cell.trim().replace(/^"|"$/g, '')),
                        original: line
                    }));
                    
                    resolve({
                        rows: rows,
                        originalText: text
                    });
                } catch (error) {
                    reject(error);
                }
            };
            reader.onerror = reject;
            reader.readAsText(file);
        });
    }

    /**
     * Parse Firefox bookmarks JSON file
     */
    async parseBookmarks(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const json = JSON.parse(e.target.result);
                    resolve({
                        data: json,
                        original: json
                    });
                } catch (error) {
                    reject(error);
                }
            };
            reader.onerror = reject;
            reader.readAsText(file);
        });
    }

    /**
     * Extract URLs from parsed file data
     */
    extractURLs() {
        const urls = [];
        const urlRegex = /(https?:\/\/[^\s<>"{}|\\^`\[\]]+)/gi;

        switch (this.fileType) {
            case 'excel':
                return this.extractURLsFromExcel(urls, urlRegex);
            case 'word':
                return this.extractURLsFromWord(urls, urlRegex);
            case 'csv':
                return this.extractURLsFromCSV(urls, urlRegex);
            case 'bookmarks':
                return this.extractURLsFromBookmarks(urls);
            default:
                return urls;
        }
    }

    /**
     * Extract URLs from Excel file
     */
    extractURLsFromExcel(urls, urlRegex) {
        const workbook = this.fileData.workbook;
        
        workbook.SheetNames.forEach(sheetName => {
            const worksheet = this.fileData.sheets[sheetName];
            const sheetData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' });
            
            sheetData.forEach((row, rowIndex) => {
                row.forEach((cell, colIndex) => {
                    if (cell && typeof cell === 'string') {
                        const matches = cell.match(urlRegex);
                        if (matches) {
                            matches.forEach(url => {
                                urls.push({
                                    url: url,
                                    source: `${this.fileName} - Sheet: ${sheetName}, Cell: ${String.fromCharCode(65 + colIndex)}${rowIndex + 1}`,
                                    location: {
                                        type: 'excel',
                                        sheet: sheetName,
                                        row: rowIndex,
                                        col: colIndex,
                                        cellValue: cell
                                    }
                                });
                            });
                        }
                    }
                });
            });
        });
        
        return urls;
    }

    /**
     * Extract URLs from Word document
     */
    extractURLsFromWord(urls, urlRegex) {
        // Extract from text
        const textMatches = this.fileData.text.match(urlRegex);
        if (textMatches) {
            textMatches.forEach((url, index) => {
                urls.push({
                    url: url,
                    source: `${this.fileName} - Text position ${index + 1}`,
                    location: {
                        type: 'word',
                        textIndex: index,
                        originalFile: this.fileData.originalFile
                    }
                });
            });
        }

        // Extract hyperlinks from HTML
        const htmlDoc = new DOMParser().parseFromString(this.fileData.html, 'text/html');
        const links = htmlDoc.querySelectorAll('a[href]');
        links.forEach((link, index) => {
            const href = link.getAttribute('href');
            if (href && (href.startsWith('http://') || href.startsWith('https://'))) {
                // Avoid duplicates
                if (!urls.some(u => u.url === href)) {
                    urls.push({
                        url: href,
                        source: `${this.fileName} - Hyperlink ${index + 1}`,
                        location: {
                            type: 'word',
                            hyperlinkIndex: index,
                            originalFile: this.fileData.originalFile
                        }
                    });
                }
            }
        });

        return urls;
    }

    /**
     * Extract URLs from CSV file
     */
    extractURLsFromCSV(urls, urlRegex) {
        this.fileData.rows.forEach(row => {
            row.data.forEach((cell, colIndex) => {
                if (cell) {
                    const matches = cell.match(urlRegex);
                    if (matches) {
                        matches.forEach(url => {
                            urls.push({
                                url: url,
                                source: `${this.fileName} - Row ${row.index + 1}, Column ${colIndex + 1}`,
                                location: {
                                    type: 'csv',
                                    rowIndex: row.index,
                                    colIndex: colIndex,
                                    originalRow: row.original
                                }
                            });
                        });
                    }
                }
            });
        });
        
        return urls;
    }

    /**
     * Extract URLs from Firefox bookmarks
     */
    extractURLsFromBookmarks(urls) {
        const extractFromNode = (node, path = '') => {
            if (node.type === 'text/x-moz-place' && node.uri) {
                urls.push({
                    url: node.uri,
                    source: `${this.fileName} - ${node.title || 'Untitled'}`,
                    location: {
                        type: 'bookmarks',
                        node: node,
                        path: path
                    }
                });
            }
            
            if (node.children) {
                const newPath = path ? `${path} > ${node.title || 'Folder'}` : (node.title || 'Root');
                node.children.forEach(child => extractFromNode(child, newPath));
            }
        };

        if (this.fileData.data.children) {
            this.fileData.data.children.forEach(child => extractFromNode(child));
        }
        
        return urls;
    }

    /**
     * Delete a URL entry from the file data
     */
    deleteURL(urlEntry) {
        if (!this.fileData) return false;

        switch (this.fileType) {
            case 'excel':
                return this.deleteFromExcel(urlEntry);
            case 'word':
                return this.deleteFromWord(urlEntry);
            case 'csv':
                return this.deleteFromCSV(urlEntry);
            case 'bookmarks':
                return this.deleteFromBookmarks(urlEntry);
            default:
                return false;
        }
    }

    /**
     * Delete URL from Excel file
     */
    deleteFromExcel(urlEntry) {
        const { sheet, row, col } = urlEntry.location;
        const worksheet = this.fileData.sheets[sheet];
        
        if (worksheet) {
            const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
            if (worksheet[cellAddress]) {
                // Remove URL from cell, keep other text
                let cellValue = worksheet[cellAddress].v || '';
                if (typeof cellValue === 'string') {
                    cellValue = cellValue.replace(urlEntry.url, '').trim();
                    if (cellValue) {
                        worksheet[cellAddress].v = cellValue;
                    } else {
                        delete worksheet[cellAddress];
                    }
                }
                return true;
            }
        }
        return false;
    }

    /**
     * Delete URL from Word file (mark for deletion, actual deletion happens on regeneration)
     */
    deleteFromWord(urlEntry) {
        // Store deleted URLs and filter them out during regeneration
        if (!this.fileData.deletedURLs) {
            this.fileData.deletedURLs = [];
        }
        this.fileData.deletedURLs.push(urlEntry.url);
        return true;
    }

    /**
     * Delete URL from CSV file
     */
    deleteFromCSV(urlEntry) {
        const { rowIndex } = urlEntry.location;
        const row = this.fileData.rows.find(r => r.index === rowIndex);
        
        if (row) {
            // Remove URL from the cell
            const colIndex = urlEntry.location.colIndex;
            if (row.data[colIndex]) {
                row.data[colIndex] = row.data[colIndex].replace(urlEntry.url, '').trim();
                // Reconstruct the row
                row.original = row.data.map(cell => `"${cell}"`).join(',');
            }
            return true;
        }
        return false;
    }

    /**
     * Delete URL from Firefox bookmarks
     */
    deleteFromBookmarks(urlEntry) {
        const deleteFromNode = (node) => {
            if (node.type === 'text/x-moz-place' && node.uri === urlEntry.url) {
                return null; // Mark for deletion
            }
            
            if (node.children) {
                node.children = node.children
                    .map(child => deleteFromNode(child))
                    .filter(child => child !== null);
            }
            
            return node;
        };

        if (this.fileData.data.children) {
            this.fileData.data.children = this.fileData.data.children
                .map(child => deleteFromNode(child))
                .filter(child => child !== null);
        }
        
        return true;
    }

    /**
     * Generate modified file for download
     */
    generateModifiedFile() {
        if (!this.fileData) return null;

        switch (this.fileType) {
            case 'excel':
                return this.generateExcelFile();
            case 'word':
                return this.generateWordFile();
            case 'csv':
                return this.generateCSVFile();
            case 'bookmarks':
                return this.generateBookmarksFile();
            default:
                return null;
        }
    }

    /**
     * Generate modified Excel file
     */
    generateExcelFile() {
        const workbook = XLSX.utils.book_new();
        
        this.fileData.workbook.SheetNames.forEach(sheetName => {
            const worksheet = this.fileData.sheets[sheetName];
            XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
        });
        
        const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
        return new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    }

    /**
     * Generate modified Word file (simplified - would need more complex library for full support)
     */
    generateWordFile() {
        // Note: Full Word file regeneration would require a more complex library
        // For now, we'll create a simple text file with remaining URLs removed
        // In a production environment, you'd want to use docx.js or similar
        let remainingText = this.fileData.text;
        
        // Remove deleted URLs from text
        if (this.fileData.deletedURLs) {
            this.fileData.deletedURLs.forEach(deletedURL => {
                remainingText = remainingText.replace(deletedURL, '').replace(/\s+/g, ' ').trim();
            });
        }
        
        const blob = new Blob([remainingText], { type: 'text/plain' });
        return blob;
    }

    /**
     * Generate modified CSV file
     */
    generateCSVFile() {
        const lines = this.fileData.rows.map(row => row.original);
        const csvContent = lines.join('\n');
        return new Blob([csvContent], { type: 'text/csv' });
    }

    /**
     * Generate modified Firefox bookmarks file
     */
    generateBookmarksFile() {
        const jsonString = JSON.stringify(this.fileData.data, null, 2);
        return new Blob([jsonString], { type: 'application/json' });
    }

    /**
     * Get file type
     */
    getFileType() {
        return this.fileType;
    }

    /**
     * Get file name
     */
    getFileName() {
        return this.fileName;
    }
}

