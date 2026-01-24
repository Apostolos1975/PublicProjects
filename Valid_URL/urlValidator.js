/**
 * URL Validator Module
 * Handles validation of URLs using fetch API
 */

class URLValidator {
    constructor() {
        this.timeout = 10000; // 10 seconds timeout
        this.batchSize = 5; // Process 5 URLs at a time
    }

    /**
     * Validate a single URL
     */
    async validateURL(url) {
        // Try with CORS first to get actual status code
        try {
            return await this.validateWithCORS(url);
        } catch (error) {
            // If CORS fails, try with no-cors as fallback (but we won't get status)
            if (error.name === 'AbortError') {
                return {
                    status: 'timeout',
                    statusCode: 0,
                    message: 'Request timeout',
                    error: error
                };
            }

            // Try no-cors as last resort
            try {
                const controller = new AbortController();
                const timeoutId = setTimeout(() => controller.abort(), this.timeout);

                await fetch(url, {
                    method: 'HEAD',
                    mode: 'no-cors',
                    signal: controller.signal
                });

                clearTimeout(timeoutId);
                
                // With no-cors, we can't read status, but request succeeded
                return {
                    status: 'cors',
                    statusCode: 0,
                    message: 'CORS blocked - request sent but status unknown',
                    error: null
                };
            } catch (noCorsError) {
                if (noCorsError.name === 'AbortError') {
                    return {
                        status: 'timeout',
                        statusCode: 0,
                        message: 'Request timeout',
                        error: noCorsError
                    };
                }
                
                return {
                    status: 'error',
                    statusCode: 0,
                    message: 'Failed to connect',
                    error: noCorsError
                };
            }
        }
    }

    /**
     * Validate URL with CORS enabled (to get actual status code)
     */
    async validateWithCORS(url, existingController = null) {
        try {
            const controller = existingController || new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), this.timeout);

            const response = await fetch(url, {
                method: 'HEAD',
                mode: 'cors',
                signal: controller.signal,
                redirect: 'follow'
            });

            clearTimeout(timeoutId);

            return {
                status: response.ok ? 'success' : 'error',
                statusCode: response.status,
                message: this.getStatusMessage(response.status),
                error: null
            };
        } catch (error) {
            if (error.name === 'AbortError') {
                return {
                    status: 'timeout',
                    statusCode: 0,
                    message: 'Request timeout',
                    error: error
                };
            }

            // If CORS fails, try a different approach
            return {
                status: 'cors',
                statusCode: 0,
                message: 'CORS blocked - cannot verify status',
                error: error
            };
        }
    }

    /**
     * Get human-readable status message
     */
    getStatusMessage(statusCode) {
        const messages = {
            200: 'OK',
            201: 'Created',
            204: 'No Content',
            301: 'Moved Permanently',
            302: 'Found',
            304: 'Not Modified',
            400: 'Bad Request',
            401: 'Unauthorized',
            403: 'Forbidden',
            404: 'Not Found',
            500: 'Internal Server Error',
            502: 'Bad Gateway',
            503: 'Service Unavailable'
        };
        return messages[statusCode] || `Status ${statusCode}`;
    }

    /**
     * Validate multiple URLs in batches
     */
    async validateURLs(urls, progressCallback) {
        const results = [];
        const total = urls.length;

        for (let i = 0; i < urls.length; i += this.batchSize) {
            const batch = urls.slice(i, i + this.batchSize);
            const batchPromises = batch.map(urlEntry => 
                this.validateURL(urlEntry.url).then(result => ({
                    ...urlEntry,
                    validation: result
                }))
            );

            const batchResults = await Promise.all(batchPromises);
            results.push(...batchResults);

            // Call progress callback
            if (progressCallback) {
                const progress = Math.min(100, Math.round(((i + batch.length) / total) * 100));
                progressCallback(progress, i + batch.length, total);
            }

            // Small delay between batches to avoid overwhelming the browser
            if (i + this.batchSize < urls.length) {
                await new Promise(resolve => setTimeout(resolve, 100));
            }
        }

        return results;
    }

    /**
     * Get status badge class for CSS styling
     */
    getStatusClass(status, statusCode) {
        if (status === 'success' && statusCode === 200) {
            return 'status-success';
        } else if (status === 'error') {
            return 'status-error';
        } else if (status === 'cors') {
            return 'status-cors';
        } else if (status === 'timeout') {
            return 'status-timeout';
        } else {
            return 'status-pending';
        }
    }

    /**
     * Format status text for display
     */
    formatStatus(status, statusCode, message) {
        if (status === 'success') {
            return `${statusCode} - ${message}`;
        } else if (status === 'error') {
            return `${statusCode} - ${message}`;
        } else if (status === 'cors') {
            return 'CORS Blocked';
        } else if (status === 'timeout') {
            return 'Timeout';
        } else {
            return 'Unknown';
        }
    }
}

