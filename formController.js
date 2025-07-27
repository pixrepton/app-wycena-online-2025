/**
 * Form Controller - Form handling and validation logic
 * Part of Wycena 2025 architectural refactoring - Phase 2
 */

class FormController {
    constructor() {
        this.currentForm = null;
        this.formData = {};
        this.validationRules = {};
        this.debugMode = window.ZORDON_DEBUG || false;
        
        this.initializeFormValidation();
        this.debug('FormController initialized');
    }

    debug(message, data = null) {
        if (this.debugMode) {
            console.log(`📝 FormController: ${message}`, data || '');
        }
    }

    /**
     * Initialize form validation rules
     */
    initializeFormValidation() {
        this.validationRules = {
            email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
            phone: /^[\+]?[0-9\s\-\(\)]{8,15}$/,
            postalCode: /^\d{2}-\d{3}$/,
            power: /^\d+(\.\d+)?$/,
            area: /^\d+(\.\d+)?$/
        };
    }

    /**
     * Set current active form
     * @param {string} formId - Form identifier
     */
    setCurrentForm(formId) {
        this.currentForm = formId;
        this.debug(`Set current form: ${formId}`);
        
        // Initialize form data structure
        if (!this.formData[formId]) {
            this.formData[formId] = {};
        }
        
        // Update ZORDON_STATE
        if (window.ZORDON_STATE) {
            window.ZORDON_STATE.currentForm = formId;
        }
    }

    /**
     * Validate form field
     * @param {string} fieldName - Field name
     * @param {*} value - Field value
     * @param {string} formId - Form identifier
     * @returns {Object} Validation result
     */
    validateField(fieldName, value, formId = null) {
        const form = formId || this.currentForm;
        
        if (!form) {
            return { valid: false, error: 'No active form' };
        }

        // Required field check
        if (this.isRequiredField(fieldName, form) && (!value || value.toString().trim() === '')) {
            return { valid: false, error: 'To pole jest wymagane' };
        }

        // Pattern validation
        if (value && this.validationRules[fieldName]) {
            if (!this.validationRules[fieldName].test(value.toString())) {
                return { valid: false, error: this.getValidationErrorMessage(fieldName) };
            }
        }

        // Custom validation
        const customValidation = this.runCustomValidation(fieldName, value, form);
        if (!customValidation.valid) {
            return customValidation;
        }

        return { valid: true };
    }

    /**
     * Check if field is required
     */
    isRequiredField(fieldName, formId) {
        const requiredFields = {
            'mode1': ['postal_code', 'building_type', 'heated_area'],
            'mode2': ['postal_code', 'building_type', 'heat_pump_purpose'],
            'mode3': ['postal_code', 'current_heating', 'heated_area'],
            'mode4': ['postal_code', 'known_power', 'heat_pump_purpose']
        };

        return requiredFields[formId]?.includes(fieldName) || false;
    }

    /**
     * Get validation error message
     */
    getValidationErrorMessage(fieldName) {
        const messages = {
            email: 'Wprowadź poprawny adres email',
            phone: 'Wprowadź poprawny numer telefonu',
            postalCode: 'Wprowadź kod pocztowy w formacie XX-XXX',
            power: 'Wprowadź poprawną wartość mocy (liczba)',
            area: 'Wprowadź poprawną powierzchnię (liczba)'
        };

        return messages[fieldName] || 'Niepoprawny format danych';
    }

    /**
     * Run custom validation logic
     */
    runCustomValidation(fieldName, value, formId) {
        // Custom validation for specific fields
        switch (fieldName) {
            case 'heated_area':
                if (value && (value < 10 || value > 1000)) {
                    return { valid: false, error: 'Powierzchnia musi być między 10 a 1000 m²' };
                }
                break;
            
            case 'known_power':
                if (value && (value < 1 || value > 50)) {
                    return { valid: false, error: 'Moc musi być między 1 a 50 kW' };
                }
                break;
            
            case 'floors':
                if (value && (value < 1 || value > 5)) {
                    return { valid: false, error: 'Liczba kondygnacji musi być między 1 a 5' };
                }
                break;
        }

        return { valid: true };
    }

    /**
     * Validate entire form
     * @param {string} formId - Form identifier
     * @returns {Object} Validation result with errors
     */
    validateForm(formId = null) {
        const form = formId || this.currentForm;
        const formElement = document.getElementById(form);
        
        if (!formElement) {
            return { valid: false, errors: ['Form not found'] };
        }

        const errors = [];
        const inputs = formElement.querySelectorAll('input, select, textarea');

        inputs.forEach(input => {
            if (input.name) {
                const validation = this.validateField(input.name, input.value, form);
                if (!validation.valid) {
                    errors.push({
                        field: input.name,
                        message: validation.error
                    });
                    
                    // Add visual error indication
                    this.showFieldError(input, validation.error);
                } else {
                    // Remove error indication
                    this.clearFieldError(input);
                }
            }
        });

        this.debug(`Form validation completed: ${errors.length} errors`, errors);
        return { valid: errors.length === 0, errors };
    }

    /**
     * Show field error visually
     */
    showFieldError(fieldElement, message) {
        // Remove existing error
        this.clearFieldError(fieldElement);

        // Add error class
        fieldElement.classList.add('error');

        // Create error message element
        const errorElement = document.createElement('div');
        errorElement.className = 'field-error';
        errorElement.textContent = message;
        
        // Insert after field
        fieldElement.parentNode.insertBefore(errorElement, fieldElement.nextSibling);
    }

    /**
     * Clear field error
     */
    clearFieldError(fieldElement) {
        fieldElement.classList.remove('error');
        
        const errorElement = fieldElement.parentNode.querySelector('.field-error');
        if (errorElement) {
            errorElement.remove();
        }
    }

    /**
     * Collect form data
     * @param {string} formId - Form identifier
     * @returns {Object} Form data
     */
    collectFormData(formId = null) {
        const form = formId || this.currentForm;
        const formElement = document.getElementById(form);
        
        if (!formElement) {
            this.debug('Form element not found', form);
            return {};
        }

        const data = {};
        const inputs = formElement.querySelectorAll('input, select, textarea');

        inputs.forEach(input => {
            if (input.name && input.value !== '') {
                // Handle different input types
                if (input.type === 'checkbox') {
                    data[input.name] = input.checked;
                } else if (input.type === 'radio') {
                    if (input.checked) {
                        data[input.name] = input.value;
                    }
                } else {
                    data[input.name] = input.value;
                }
            }
        });

        // Store in form controller
        this.formData[form] = data;

        // Update ZORDON_STATE
        if (window.ZORDON_STATE) {
            window.ZORDON_STATE.formData = window.ZORDON_STATE.formData || {};
            window.ZORDON_STATE.formData[form] = data;
        }

        this.debug('Form data collected', data);
        return data;
    }

    /**
     * Submit form
     * @param {string} formId - Form identifier
     * @param {Function} onSuccess - Success callback
     * @param {Function} onError - Error callback
     */
    async submitForm(formId = null, onSuccess = null, onError = null) {
        const form = formId || this.currentForm;
        this.debug(`Submitting form: ${form}`);

        // Validate form
        const validation = this.validateForm(form);
        if (!validation.valid) {
            this.debug('Form validation failed', validation.errors);
            if (onError) {
                onError(validation.errors);
            }
            return false;
        }

        // Collect data
        const formData = this.collectFormData(form);

        try {
            // Process form based on type
            let result;
            switch (form) {
                case 'mode1':
                case 'heatCalcFormFull':
                    result = await this.processFullCalculatorForm(formData);
                    break;
                case 'mode2':
                case 'heatCalcMode2':
                    result = await this.processAIAnalysisForm(formData);
                    break;
                case 'mode3':
                    result = await this.processModernizationForm(formData);
                    break;
                case 'mode4':
                    result = await this.processPowerForm(formData);
                    break;
                default:
                    result = await this.processGenericForm(formData);
            }

            this.debug('Form submitted successfully', result);
            if (onSuccess) {
                onSuccess(result);
            }
            return result;

        } catch (error) {
            this.debug('Form submission failed', error);
            if (onError) {
                onError([{ field: 'general', message: error.message }]);
            }
            return false;
        }
    }

    /**
     * Process full calculator form
     */
    async processFullCalculatorForm(data) {
        // Use existing formDataProcessor if available
        if (window.buildJsonData && typeof window.buildJsonData === 'function') {
            return window.buildJsonData(data);
        }
        
        return data;
    }

    /**
     * Process AI analysis form
     */
    async processAIAnalysisForm(data) {
        // Combine form data with AI analysis results
        if (window.ZORDON_STATE && window.ZORDON_STATE.aiAnalysisResult) {
            return {
                ...data,
                aiAnalysis: window.ZORDON_STATE.aiAnalysisResult
            };
        }
        
        return data;
    }

    /**
     * Process modernization form
     */
    async processModernizationForm(data) {
        // Add modernization-specific processing
        return {
            ...data,
            calculationType: 'modernization'
        };
    }

    /**
     * Process power specification form
     */
    async processPowerForm(data) {
        // Add power-specific processing
        return {
            ...data,
            calculationType: 'known_power'
        };
    }

    /**
     * Process generic form
     */
    async processGenericForm(data) {
        return data;
    }

    /**
     * Auto-save form data
     */
    autoSave(formId = null) {
        const form = formId || this.currentForm;
        if (!form) return;

        const data = this.collectFormData(form);
        
        // Save to localStorage
        try {
            localStorage.setItem(`form_${form}`, JSON.stringify(data));
            this.debug('Form auto-saved', form);
        } catch (error) {
            this.debug('Auto-save failed', error);
        }
    }

    /**
     * Load saved form data
     */
    loadSavedData(formId) {
        try {
            const saved = localStorage.getItem(`form_${formId}`);
            if (saved) {
                const data = JSON.parse(saved);
                this.populateForm(formId, data);
                this.debug('Saved form data loaded', formId);
                return data;
            }
        } catch (error) {
            this.debug('Failed to load saved data', error);
        }
        return null;
    }

    /**
     * Populate form with data
     */
    populateForm(formId, data) {
        const formElement = document.getElementById(formId);
        if (!formElement) return;

        Object.keys(data).forEach(fieldName => {
            const field = formElement.querySelector(`[name="${fieldName}"]`);
            if (field) {
                if (field.type === 'checkbox') {
                    field.checked = data[fieldName];
                } else if (field.type === 'radio') {
                    const radio = formElement.querySelector(`[name="${fieldName}"][value="${data[fieldName]}"]`);
                    if (radio) radio.checked = true;
                } else {
                    field.value = data[fieldName];
                }
            }
        });
    }
}

// Global instance
window.FormController = new FormController();

// Export for ES6 modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FormController;
}