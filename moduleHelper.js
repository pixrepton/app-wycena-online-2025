/**
 * Zordon Module Helper - Utilities for modular JS architecture
 * Część Zordon Core™ system
 */

/**
 * Calculate maximum power based on EU and area
 * @param {number} eu - Energy usage
 * @param {number} area - Building area
 * @returns {number} Calculated power
 */
export function calculateMaxPower(eu, area) {
    if (!eu || !area) return 0;
    
    // Zordon calculation algorithm
    const power = (area * eu) / 1000 * 0.8;
    
    if (window.ZORDON_DEBUG) {
        console.log('🧠 ZORDON calculateMaxPower:', { eu, area, power });
    }
    
    return power;
}

/**
 * Get selected heat pump kit from state
 * @returns {Object|null} Selected kit data
 */
export function getSelectedKit() {
    const kit = window.ZORDON_STATE?.selectedKit || null;
    
    if (window.ZORDON_DEBUG) {
        console.log('🧠 ZORDON getSelectedKit:', kit);
    }
    
    return kit;
}

/**
 * Generate PDF with current data
 * @param {Object} data - Data for PDF generation
 * @returns {Promise} PDF generation promise
 */
export function generatePDF(data) {
    if (window.ZORDON_DEBUG) {
        console.log('🧠 ZORDON generatePDF input:', data);
    }
    
    // Update state
    window.ZORDON_STATE.pdfReady = false;
    
    // Call existing PDF generator if available
    if (typeof window.generatePDF === 'function') {
        return window.generatePDF(data).then(result => {
            window.ZORDON_STATE.pdfReady = true;
            return result;
        });
    }
    
    // Fallback
    console.warn('PDF generator not available');
    return Promise.reject('PDF generator not loaded');
}

/**
 * Update user inputs in global state
 * @param {string} key - Input key
 * @param {*} value - Input value
 */
export function updateUserInput(key, value) {
    if (!window.ZORDON_STATE.userInputs) {
        window.ZORDON_STATE.userInputs = {};
    }
    
    window.ZORDON_STATE.userInputs[key] = value;
    
    if (window.ZORDON_DEBUG) {
        console.log(`🧠 ZORDON updateUserInput: ${key} =`, value);
    }
}

/**
 * Get user input from global state
 * @param {string} key - Input key
 * @returns {*} Input value
 */
export function getUserInput(key) {
    const value = window.ZORDON_STATE?.userInputs?.[key];
    
    if (window.ZORDON_DEBUG) {
        console.log(`🧠 ZORDON getUserInput: ${key} =`, value);
    }
    
    return value;
}

/**
 * Clear all user inputs
 */
export function clearUserInputs() {
    window.ZORDON_STATE.userInputs = {};
    
    if (window.ZORDON_DEBUG) {
        console.log('🧠 ZORDON clearUserInputs: inputs cleared');
    }
}

/**
 * Validate required inputs for a mode
 * @param {string} mode - Mode to validate
 * @returns {boolean} Validation result
 */
export function validateModeInputs(mode) {
    const inputs = window.ZORDON_STATE.userInputs || {};
    
    switch (mode) {
        case 'mode2':
            return !!(inputs.project_area && inputs.project_eu);
        case 'mode3':
            return !!(inputs.modern_area && inputs.annual_consumption && inputs.energy_standard);
        case 'mode4':
            return !!(inputs.manual_power && inputs.power_source);
        default:
            return true;
    }
}

/**
 * Log state for debugging
 */
export function logZordonState() {
    if (window.ZORDON_DEBUG) {
        console.log('🧠 ZORDON STATE:', window.ZORDON_STATE);
    }
}