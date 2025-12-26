// Secure Storage Utility - Protection against XSS and third-party access

/**
 * Simple encryption/decryption using Web Crypto API
 * Note: For production, consider using a more robust encryption library
 */
class SecureStorage {
    constructor() {
        this.algorithm = { name: 'AES-GCM', length: 256 };
        this.keyPromise = this.initKey();
    }

    /**
     * Initialize or retrieve encryption key from session
     * Key is stored in memory only, not persisted
     */
    async initKey() {
        // Generate a key from a passphrase derived from session
        // This ensures the key is unique per session and not stored
        const passphrase = this.getSessionPassphrase();
        return this.deriveKeyFromPassphrase(passphrase);
    }

    /**
     * Get a session-based passphrase (not stored, regenerated each session)
     */
    getSessionPassphrase() {
        // Use a combination of sessionStorage ID and user agent
        // This creates a unique key per session
        const sessionId = sessionStorage.getItem('session_id') || this.generateSessionId();
        sessionStorage.setItem('session_id', sessionId);
        return `${sessionId}_${navigator.userAgent}`;
    }

    generateSessionId() {
        return crypto.randomUUID();
    }

    /**
     * Derive encryption key from passphrase
     */
    async deriveKeyFromPassphrase(passphrase) {
        const encoder = new TextEncoder();
        const keyMaterial = await crypto.subtle.importKey(
            'raw',
            encoder.encode(passphrase),
            { name: 'PBKDF2' },
            false,
            ['deriveKey']
        );

        // Use a fixed salt derived from the app domain for consistency
        // In production, consider using a domain-specific salt
        const salt = encoder.encode('secure-app-salt-v1');
        return await crypto.subtle.deriveKey(
            {
                name: 'PBKDF2',
                salt: salt,
                iterations: 100000,
                hash: 'SHA-256'
            },
            keyMaterial,
            this.algorithm,
            false,
            ['encrypt', 'decrypt']
        );
    }

    /**
     * Sanitize input to prevent XSS
     */
    sanitizeInput(input) {
        if (typeof input !== 'string') {
            return JSON.stringify(input);
        }
        
        // Remove potentially dangerous characters and patterns
        return input
            .replace(/[<>]/g, '') // Remove angle brackets
            .replace(/javascript:/gi, '') // Remove javascript: protocol
            .replace(/on\w+=/gi, '') // Remove event handlers
            .trim();
    }

    /**
     * Encrypt data before storage
     */
    async encrypt(data) {
        try {
            const key = await this.keyPromise;
            const encoder = new TextEncoder();
            const dataBuffer = encoder.encode(JSON.stringify(data));
            
            const iv = crypto.getRandomValues(new Uint8Array(12));
            const encrypted = await crypto.subtle.encrypt(
                { ...this.algorithm, iv: iv },
                key,
                dataBuffer
            );
            
            // Combine IV and encrypted data
            const combined = new Uint8Array(iv.length + encrypted.byteLength);
            combined.set(iv);
            combined.set(new Uint8Array(encrypted), iv.length);
            
            // Convert to base64 for storage
            return btoa(String.fromCharCode(...combined));
        } catch (error) {
            console.error('Encryption error:', error);
            throw new Error('Failed to encrypt data');
        }
    }

    /**
     * Decrypt data after retrieval
     */
    async decrypt(encryptedData) {
        try {
            const key = await this.keyPromise;
            
            // Convert from base64
            const combined = Uint8Array.from(atob(encryptedData), c => c.charCodeAt(0));
            
            // Extract IV and encrypted data
            const iv = combined.slice(0, 12);
            const encrypted = combined.slice(12);
            
            const decrypted = await crypto.subtle.decrypt(
                { ...this.algorithm, iv: iv },
                key,
                encrypted
            );
            
            const decoder = new TextDecoder();
            return JSON.parse(decoder.decode(decrypted));
        } catch (error) {
            console.error('Decryption error:', error);
            throw new Error('Failed to decrypt data');
        }
    }

    /**
     * Secure localStorage wrapper
     */
    async setLocalStorage(key, value) {
        const sanitizedKey = this.sanitizeInput(key);
        const encrypted = await this.encrypt(value);
        localStorage.setItem(sanitizedKey, encrypted);
    }

    async getLocalStorage(key) {
        const sanitizedKey = this.sanitizeInput(key);
        const encrypted = localStorage.getItem(sanitizedKey);
        if (!encrypted) return null;
        return await this.decrypt(encrypted);
    }

    removeLocalStorage(key) {
        const sanitizedKey = this.sanitizeInput(key);
        localStorage.removeItem(sanitizedKey);
    }

    /**
     * Secure cookie wrapper
     * Note: HttpOnly and Secure flags require server-side implementation
     * This is a client-side only solution with encryption
     */
    async setCookie(name, value, days = 7) {
        const sanitizedName = this.sanitizeInput(name);
        const expires = new Date();
        expires.setTime(expires.getTime() + (days * 24 * 60 * 60 * 1000));
        
        // Encrypt value before storing
        const encrypted = await this.encrypt(value);
        document.cookie = `${sanitizedName}=${encodeURIComponent(encrypted)}; expires=${expires.toUTCString()}; path=/; SameSite=Strict`;
    }

    async getCookie(name) {
        const sanitizedName = this.sanitizeInput(name);
        const nameEQ = sanitizedName + "=";
        const ca = document.cookie.split(';');
        
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i];
            while (c.charAt(0) === ' ') c = c.substring(1, c.length);
            if (c.indexOf(nameEQ) === 0) {
                const encrypted = decodeURIComponent(c.substring(nameEQ.length, c.length));
                return await this.decrypt(encrypted);
            }
        }
        return null;
    }

    removeCookie(name) {
        const sanitizedName = this.sanitizeInput(name);
        document.cookie = `${sanitizedName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    }

    /**
     * Secure IndexedDB wrapper
     */
    async initIndexedDB(dbName = 'secureAppDB', version = 1) {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(dbName, version);
            
            request.onerror = () => reject(request.error);
            request.onsuccess = () => resolve(request.result);
            
            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                if (!db.objectStoreNames.contains('secureData')) {
                    db.createObjectStore('secureData', { keyPath: 'id' });
                }
            };
        });
    }

    async setIndexedDB(key, value) {
        const db = await this.initIndexedDB();
        const sanitizedKey = this.sanitizeInput(key);
        const encrypted = await this.encrypt(value);
        
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(['secureData'], 'readwrite');
            const store = transaction.objectStore('secureData');
            const request = store.put({ id: sanitizedKey, data: encrypted });
            
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }

    async getIndexedDB(key) {
        const db = await this.initIndexedDB();
        const sanitizedKey = this.sanitizeInput(key);
        
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(['secureData'], 'readonly');
            const store = transaction.objectStore('secureData');
            const request = store.get(sanitizedKey);
            
            request.onsuccess = () => {
                if (request.result) {
                    this.decrypt(request.result.data).then(resolve).catch(reject);
                } else {
                    resolve(null);
                }
            };
            request.onerror = () => reject(request.error);
        });
    }

    async removeIndexedDB(key) {
        const db = await this.initIndexedDB();
        const sanitizedKey = this.sanitizeInput(key);
        
        return new Promise((resolve, reject) => {
            const transaction = db.transaction(['secureData'], 'readwrite');
            const store = transaction.objectStore('secureData');
            const request = store.delete(sanitizedKey);
            
            request.onsuccess = () => resolve();
            request.onerror = () => reject(request.error);
        });
    }
}

// Export singleton instance
const secureStorage = new SecureStorage();

