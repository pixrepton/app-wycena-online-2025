/**
 * Global Error Handling System
 * Comprehensive error catching and user-friendly error reporting
 */

(function() {
    'use strict';

    // Global error handler
    window.addEventListener('error', function(event) {
        console.error('Global JavaScript Error:', {
            message: event.message,
            filename: event.filename,
            lineno: event.lineno,
            colno: event.colno,
            error: event.error
        });

        // Don't show errors for external scripts or minor issues
        if (event.filename && (
            event.filename.includes('font-awesome') ||
            event.filename.includes('googleapis') ||
            event.filename.includes('cdnjs')
        )) {
            return;
        }

        // Show user-friendly error for critical issues
        if (typeof window.userAlert === 'function') {
            window.userAlert('Wystąpił nieoczekiwany błąd. Spróbuj odświeżyć stronę.', 'error');
        }
    });

    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', function(event) {
        console.error('Unhandled Promise Rejection:', event.reason);
        
        // Prevent default browser behavior
        event.preventDefault();

        if (typeof window.userAlert === 'function') {
            window.userAlert('Wystąpił błąd podczas ładowania danych. Spróbuj ponownie.', 'error');
        }
    });

    // Safe DOM manipulation helpers
    window.safeQuerySelector = function(selector) {
        try {
            return document.querySelector(selector);
        } catch (error) {
            console.warn(`Invalid selector: ${selector}`, error);
            return null;
        }
    };

    window.safeQuerySelectorAll = function(selector) {
        try {
            return document.querySelectorAll(selector);
        } catch (error) {
            console.warn(`Invalid selector: ${selector}`, error);
            return [];
        }
    };

    // Safe element manipulation
    window.safeSetInnerHTML = function(element, html) {
        try {
            if (element && typeof element.innerHTML !== 'undefined') {
                element.innerHTML = html;
                return true;
            }
        } catch (error) {
            console.warn('Error setting innerHTML:', error);
        }
        return false;
    };

    // Safe class manipulation
    window.safeAddClass = function(element, className) {
        try {
            if (element && element.classList) {
                element.classList.add(className);
                return true;
            }
        } catch (error) {
            console.warn('Error adding class:', error);
        }
        return false;
    };

    window.safeRemoveClass = function(element, className) {
        try {
            if (element && element.classList) {
                element.classList.remove(className);
                return true;
            }
        } catch (error) {
            console.warn('Error removing class:', error);
        }
        return false;
    };

    // Safe JSON parsing
    window.safeJsonParse = function(jsonString, fallback = null) {
        try {
            return JSON.parse(jsonString);
        } catch (error) {
            console.warn('JSON parse error:', error);
            return fallback;
        }
    };

    // Safe local storage operations
    window.safeLocalStorage = {
        get: function(key, fallback = null) {
            try {
                const value = localStorage.getItem(key);
                return value !== null ? JSON.parse(value) : fallback;
            } catch (error) {
                console.warn('LocalStorage get error:', error);
                return fallback;
            }
        },
        set: function(key, value) {
            try {
                localStorage.setItem(key, JSON.stringify(value));
                return true;
            } catch (error) {
                console.warn('LocalStorage set error:', error);
                return false;
            }
        },
        remove: function(key) {
            try {
                localStorage.removeItem(key);
                return true;
            } catch (error) {
                console.warn('LocalStorage remove error:', error);
                return false;
            }
        }
    };

    // Network error handling
    window.handleNetworkError = function(error, operation = 'operacji') {
        console.error(`Network error during ${operation}:`, error);
        
        if (typeof window.userAlert === 'function') {
            if (error.message && error.message.includes('fetch')) {
                window.userAlert('Błąd połączenia z serwerem. Sprawdź połączenie internetowe.', 'error');
            } else {
                window.userAlert(`Błąd podczas ${operation}. Spróbuj ponownie.`, 'error');
            }
        } else {
            alert(`Błąd podczas ${operation}. Spróbuj ponownie.`);
        }
    };

    // Validation helpers
    window.validateInput = function(value, type = 'text', options = {}) {
        if (value === null || value === undefined || value === '') {
            return { valid: false, error: 'Pole jest wymagane' };
        }

        switch (type) {
            case 'number':
                const num = parseFloat(value);
                if (isNaN(num)) {
                    return { valid: false, error: 'Wartość musi być liczbą' };
                }
                if (options.min !== undefined && num < options.min) {
                    return { valid: false, error: `Wartość musi być większa niż ${options.min}` };
                }
                if (options.max !== undefined && num > options.max) {
                    return { valid: false, error: `Wartość musi być mniejsza niż ${options.max}` };
                }
                return { valid: true, value: num };

            case 'email':
                const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailPattern.test(value)) {
                    return { valid: false, error: 'Nieprawidłowy format email' };
                }
                return { valid: true, value: value };

            case 'phone':
                const phonePattern = /^[\+]?[0-9\s\-\(\)]{9,}$/;
                if (!phonePattern.test(value)) {
                    return { valid: false, error: 'Nieprawidłowy format numeru telefonu' };
                }
                return { valid: true, value: value };

            default:
                if (options.minLength && value.length < options.minLength) {
                    return { valid: false, error: `Minimalna długość: ${options.minLength} znaków` };
                }
                if (options.maxLength && value.length > options.maxLength) {
                    return { valid: false, error: `Maksymalna długość: ${options.maxLength} znaków` };
                }
                return { valid: true, value: value };
        }
    };

    // Debounce function for preventing rapid API calls
    window.debounce = function(func, wait, immediate = false) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                timeout = null;
                if (!immediate) func.apply(this, args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(this, args);
        };
    };

    // Throttle function for limiting function calls
    window.throttle = function(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    };

    console.log('✅ Global Error Handling System initialized');
})();