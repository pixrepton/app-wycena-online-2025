/**
 * Main Application Entry Point - Refactored
 * Initializes all modules and handles global app state
 */

// Global app state
window.appState = {
    currentMode: null,
    calculationData: {},
    results: {},
    initialized: false
};

// Import modules (for modern browser support)
let CalculatorCore, PDFAnalyzer;

// Initialize application when DOM is ready
document.addEventListener('DOMContentLoaded', async function() {
    console.log('🚀 Initializing Heat Pump Calculator v4.2 (Refactored)');
    
    try {
        // Load modules
        await loadModules();
        
        // Initialize core components
        initializeCore();
        
        // Initialize legacy components for backward compatibility
        initializeLegacySupport();
        
        // Mark as initialized
        window.appState.initialized = true;
        console.log('✅ Application initialized successfully');
        
    } catch (error) {
        console.error('❌ Application initialization failed:', error);
        showInitializationError(error);
    }
});

async function loadModules() {
    try {
        // Try to load ES6 modules if supported
        if (typeof import !== 'undefined') {
            const calculatorModule = await import('./modules/calculator-core.js');
            const pdfModule = await import('./modules/pdf-analyzer.js');
            
            CalculatorCore = calculatorModule.default;
            PDFAnalyzer = pdfModule.default;
        } else {
            // Fallback to global objects for older browsers
            CalculatorCore = window.CalculatorCore;
            PDFAnalyzer = window.PDFAnalyzer;
        }
    } catch (error) {
        console.warn('Module loading failed, using fallback approach:', error);
        // Modules will be loaded as global objects via script tags
    }
}

function initializeCore() {
    // Initialize Calculator Core
    if (CalculatorCore) {
        window.calculatorCore = new CalculatorCore();
    }
    
    // Initialize PDF Analyzer
    if (PDFAnalyzer) {
        window.pdfAnalyzer = new PDFAnalyzer();
    }
    
    // Initialize welcome screen
    initializeWelcomeScreen();
    
    // Initialize tooltips
    initializeTooltips();
    
    // Initialize global error handling
    initializeErrorHandling();
}

function initializeLegacySupport() {
    // Maintain compatibility with existing code
    
    // Expose legacy functions
    window.switchToMode = function(mode) {
        if (window.calculatorCore) {
            window.calculatorCore.switchMode(mode);
        }
    };
    
    window.buildJsonData = function() {
        // Legacy form data processor compatibility
        console.warn('buildJsonData is deprecated, use CalculatorCore instead');
        return {};
    };
    
    // Legacy event bindings
    bindLegacyEvents();
}

function initializeWelcomeScreen() {
    const welcomeButtons = document.querySelectorAll('.welcome-btn');
    welcomeButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            const mode = this.dataset.mode;
            if (mode) {
                switchToMode(mode);
            }
        });
    });
}

function initializeTooltips() {
    // Initialize tooltip system
    const tooltips = document.querySelectorAll('[data-tooltip]');
    tooltips.forEach(element => {
        element.addEventListener('mouseenter', showTooltip);
        element.addEventListener('mouseleave', hideTooltip);
    });
}

function initializeErrorHandling() {
    // Global error handler
    window.addEventListener('error', function(event) {
        console.error('Global error:', event.error);
        // Could send to analytics or logging service
    });
    
    // Promise rejection handler
    window.addEventListener('unhandledrejection', function(event) {
        console.error('Unhandled promise rejection:', event.reason);
    });
}

function bindLegacyEvents() {
    // Bind existing form events for backward compatibility
    const legacyForms = document.querySelectorAll('#heatCalcFormFull, #top-instal-calc');
    legacyForms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            console.log('Legacy form submission intercepted');
            
            if (window.calculatorCore) {
                window.calculatorCore.handleSubmit(e);
            }
        });
    });
}

function switchToMode(mode) {
    console.log(`🎯 Switching to mode: ${mode}`);
    
    window.appState.currentMode = mode;
    
    // Hide welcome screen
    const welcomeScreen = document.getElementById('welcome-screen');
    if (welcomeScreen) {
        welcomeScreen.classList.add('hidden');
    }
    
    // Hide all form sections
    const forms = document.querySelectorAll('.section');
    forms.forEach(form => form.classList.add('hidden'));
    
    // Show selected form
    const targetForm = document.getElementById(getFormId(mode));
    if (targetForm) {
        targetForm.classList.remove('hidden');
        
        // Focus first input for accessibility
        const firstInput = targetForm.querySelector('input, select, textarea');
        if (firstInput) {
            firstInput.focus();
        }
    }
    
    // Update URL without page reload
    updateURL(mode);
}

function getFormId(mode) {
    const formIds = {
        mode1: 'heatCalcFormFull',
        mode2: 'form-mode2',
        mode3: 'form-mode3', 
        mode4: 'form-mode4'
    };
    return formIds[mode] || 'heatCalcFormFull';
}

function updateURL(mode) {
    if (history.pushState) {
        const newUrl = `${window.location.pathname}?mode=${mode}`;
        history.pushState({mode}, '', newUrl);
    }
}

function showTooltip(event) {
    const tooltip = event.target.dataset.tooltip;
    if (!tooltip) return;
    
    const tooltipEl = document.createElement('div');
    tooltipEl.className = 'tooltip';
    tooltipEl.textContent = tooltip;
    tooltipEl.style.position = 'absolute';
    tooltipEl.style.background = '#333';
    tooltipEl.style.color = 'white';
    tooltipEl.style.padding = '8px 12px';
    tooltipEl.style.borderRadius = '4px';
    tooltipEl.style.fontSize = '14px';
    tooltipEl.style.zIndex = '1000';
    tooltipEl.style.pointerEvents = 'none';
    
    document.body.appendChild(tooltipEl);
    
    const rect = event.target.getBoundingClientRect();
    tooltipEl.style.left = rect.left + 'px';
    tooltipEl.style.top = (rect.top - tooltipEl.offsetHeight - 8) + 'px';
    
    event.target._tooltip = tooltipEl;
}

function hideTooltip(event) {
    if (event.target._tooltip) {
        document.body.removeChild(event.target._tooltip);
        delete event.target._tooltip;
    }
}

function showInitializationError(error) {
    const errorEl = document.createElement('div');
    errorEl.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #dc2626;
        color: white;
        padding: 16px;
        border-radius: 8px;
        z-index: 9999;
        max-width: 400px;
    `;
    errorEl.innerHTML = `
        <strong>Błąd inicjalizacji aplikacji</strong><br>
        ${error.message || 'Nieznany błąd'}
    `;
    
    document.body.appendChild(errorEl);
    
    // Auto remove after 10 seconds
    setTimeout(() => {
        if (document.body.contains(errorEl)) {
            document.body.removeChild(errorEl);
        }
    }, 10000);
}

// URL mode detection on page load
window.addEventListener('load', function() {
    const urlParams = new URLSearchParams(window.location.search);
    const mode = urlParams.get('mode');
    
    if (mode && window.appState.initialized) {
        switchToMode(mode);
    }
});

// Export for testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { switchToMode, initializeCore };
}