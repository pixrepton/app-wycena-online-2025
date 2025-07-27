/**
 * API Client - Centralized API communication
 * Part of Wycena 2025 architectural refactoring
 */

class APIClient {
    constructor() {
        this.baseURL = window.location.origin;
        this.defaultHeaders = {
            'Content-Type': 'application/json'
        };
        this.timeout = 30000; // 30 seconds
        this.debugMode = window.ZORDON_DEBUG || false;
        
        this.debug('APIClient initialized', { baseURL: this.baseURL });
    }

    debug(message, data = null) {
        if (this.debugMode) {
            console.log(`🌐 APIClient: ${message}`, data || '');
        }
    }

    /**
     * Generic request method
     */
    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        
        const config = {
            method: 'GET',
            headers: { ...this.defaultHeaders, ...options.headers },
            ...options
        };

        // Remove Content-Type for FormData
        if (config.body instanceof FormData) {
            delete config.headers['Content-Type'];
        }

        this.debug(`Request: ${config.method} ${url}`, config);

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), this.timeout);
            
            const response = await fetch(url, {
                ...config,
                signal: controller.signal
            });
            
            clearTimeout(timeoutId);
            
            this.debug(`Response: ${response.status} ${response.statusText}`);
            
            if (!response.ok) {
                throw new APIError(`HTTP ${response.status}: ${response.statusText}`, response.status);
            }
            
            // Try to parse JSON, fallback to text
            let data;
            const contentType = response.headers.get('content-type');
            
            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
            } else {
                data = await response.text();
            }
            
            this.debug('Response data received', data);
            return data;
            
        } catch (error) {
            if (error.name === 'AbortError') {
                throw new APIError('Request timeout', 408);
            }
            
            this.debug(`Request failed: ${error.message}`);
            throw error;
        }
    }

    /**
     * GET request
     */
    async get(endpoint, params = {}) {
        const url = new URL(endpoint, this.baseURL);
        Object.keys(params).forEach(key => {
            url.searchParams.append(key, params[key]);
        });
        
        return this.request(url.pathname + url.search);
    }

    /**
     * POST request
     */
    async post(endpoint, data = null, options = {}) {
        const config = {
            method: 'POST',
            ...options
        };
        
        if (data) {
            if (data instanceof FormData) {
                config.body = data;
            } else {
                config.body = JSON.stringify(data);
            }
        }
        
        return this.request(endpoint, config);
    }

    /**
     * PUT request
     */
    async put(endpoint, data = null, options = {}) {
        const config = {
            method: 'PUT',
            ...options
        };
        
        if (data) {
            config.body = JSON.stringify(data);
        }
        
        return this.request(endpoint, config);
    }

    /**
     * DELETE request
     */
    async delete(endpoint, options = {}) {
        return this.request(endpoint, {
            method: 'DELETE',
            ...options
        });
    }

    /**
     * Upload file
     */
    async uploadFile(endpoint, file, additionalData = {}) {
        const formData = new FormData();
        formData.append('file', file);
        
        // Add additional fields
        Object.keys(additionalData).forEach(key => {
            formData.append(key, additionalData[key]);
        });
        
        return this.post(endpoint, formData);
    }

    /**
     * Health check
     */
    async healthCheck() {
        try {
            const response = await this.get('/ping');
            return { status: 'healthy', response };
        } catch (error) {
            return { status: 'unhealthy', error: error.message };
        }
    }

    /**
     * Set authentication token
     */
    setAuthToken(token) {
        this.defaultHeaders['Authorization'] = `Bearer ${token}`;
        this.debug('Auth token set');
    }

    /**
     * Remove authentication token
     */
    removeAuthToken() {
        delete this.defaultHeaders['Authorization'];
        this.debug('Auth token removed');
    }
}

/**
 * Custom API Error class
 */
class APIError extends Error {
    constructor(message, status = 500, data = null) {
        super(message);
        this.name = 'APIError';
        this.status = status;
        this.data = data;
    }
}

// Global instance
window.APIClient = new APIClient();

// Export for ES6 modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { APIClient, APIError };
}