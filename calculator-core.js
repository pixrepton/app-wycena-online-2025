/**
 * Calculator Core Module - Refactored
 * Handles the main calculator logic and API communication
 */

class CalculatorCore {
    constructor() {
        this.apiCallInProgress = false;
        this.currentData = {};
        this.results = {};
        
        this.init();
    }

    init() {
        console.log('🧮 Calculator Core initialized');
        this.bindEvents();
    }

    bindEvents() {
        // Bind form submission
        const forms = document.querySelectorAll('[data-calculator-form]');
        forms.forEach(form => {
            form.addEventListener('submit', (e) => this.handleSubmit(e));
        });

        // Bind mode switches
        const modeButtons = document.querySelectorAll('[data-mode]');
        modeButtons.forEach(btn => {
            btn.addEventListener('click', (e) => this.switchMode(e.target.dataset.mode));
        });
    }

    async handleSubmit(event) {
        event.preventDefault();
        
        if (this.apiCallInProgress) {
            console.warn('API call already in progress');
            return;
        }

        try {
            this.apiCallInProgress = true;
            this.showLoading();
            
            const formData = this.collectFormData(event.target);
            const results = await this.calculateHeatPump(formData);
            
            this.displayResults(results);
            
        } catch (error) {
            console.error('Calculation error:', error);
            this.showError(error.message);
        } finally {
            this.apiCallInProgress = false;
            this.hideLoading();
        }
    }

    collectFormData(form) {
        const data = {};
        const formData = new FormData(form);
        
        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }
        
        return this.validateAndCleanData(data);
    }

    validateAndCleanData(data) {
        // Clean and validate form data
        const cleanData = {};
        
        Object.keys(data).forEach(key => {
            const value = data[key];
            if (value !== null && value !== undefined && value !== '') {
                cleanData[key] = value;
            }
        });
        
        return cleanData;
    }

    async calculateHeatPump(data) {
        // This will be implemented based on the original logic
        console.log('🔥 Calculating heat pump requirements:', data);
        
        // For now, return mock data structure
        return {
            calculatedPower: 12.5,
            method: 'advanced_calculation',
            recommendations: [],
            annual_demand: 2500
        };
    }

    switchMode(mode) {
        console.log(`🎯 Switching to mode: ${mode}`);
        
        // Hide all forms
        document.querySelectorAll('[data-calculator-form]').forEach(form => {
            form.classList.add('hidden');
        });
        
        // Show selected form
        const targetForm = document.querySelector(`[data-mode="${mode}"]`);
        if (targetForm) {
            targetForm.classList.remove('hidden');
        }
        
        // Update state
        window.appState = window.appState || {};
        window.appState.currentMode = mode;
    }

    showLoading() {
        const loader = document.getElementById('calculator-loader');
        if (loader) {
            loader.classList.remove('hidden');
        }
    }

    hideLoading() {
        const loader = document.getElementById('calculator-loader');
        if (loader) {
            loader.classList.add('hidden');
        }
    }

    displayResults(results) {
        console.log('📊 Displaying results:', results);
        
        const resultsContainer = document.getElementById('calculation-results');
        if (resultsContainer) {
            resultsContainer.innerHTML = this.buildResultsHTML(results);
            resultsContainer.classList.remove('hidden');
        }
    }

    buildResultsHTML(results) {
        return `
            <div class="results-panel">
                <h3>Wyniki obliczeń</h3>
                <div class="result-item">
                    <label>Obliczona moc:</label>
                    <span>${results.calculatedPower} kW</span>
                </div>
                <div class="result-item">
                    <label>Metoda:</label>
                    <span>${results.method}</span>
                </div>
                <div class="result-item">
                    <label>Zapotrzebowanie roczne:</label>
                    <span>${results.annual_demand} kWh/rok</span>
                </div>
            </div>
        `;
    }

    showError(message) {
        const errorContainer = document.getElementById('calculator-error');
        if (errorContainer) {
            errorContainer.textContent = message;
            errorContainer.classList.remove('hidden');
        } else {
            alert(message);
        }
    }
}

// Export for module use
export default CalculatorCore;

// Also provide global access for backward compatibility
window.CalculatorCore = CalculatorCore;