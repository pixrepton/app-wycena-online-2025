/**
 * Zordon Core™ - Centralny kontroler aplikacji Wycena 2025
 * Ujednolicony punkt wejścia i warstwa kontrolna
 */

// Globalny stan aplikacji
window.ZORDON_STATE = {
    currentMode: null,
    calculatedPower: null,
    selectedKit: null,
    price: null,
    userInputs: {},
    pdfReady: false,
    aiNotes: [],
    version: {
        api: '1.2',
        formularz: '3.0',
        pdf: '2.5',
        core: '1.0'
    }
};

// Debug mode - aktywuj przez ?dev=true
if (new URLSearchParams(window.location.search).get('dev') === 'true') {
    window.ZORDON_DEBUG = true;
    console.log('🧠 ZORDON DEBUG MODE ENABLED');
}

/**
 * Zordon App Controller - główny kontroler aplikacji
 */
class ZordonAppController {
    constructor() {
        this.modules = new Map();
        this.currentView = null;
        this.initialized = false;
        
        this.debugLog('Zordon Core™ initializing...');
    }

    /**
     * Debug logger
     */
    debugLog(message, data = null) {
        if (window.ZORDON_DEBUG) {
            console.log(`🧠 ZORDON: ${message}`, data || '');
        }
    }

    /**
     * Inicjalizacja aplikacji
     */
    async init() {
        try {
            this.debugLog('Starting application initialization');
            
            // Załaduj moduły
            await this.loadModules();
            
            // Ustaw handlery
            this.setupEventHandlers();
            
            // Ustaw stan początkowy
            this.setupInitialState();
            
            this.initialized = true;
            this.debugLog('Application initialized successfully', window.ZORDON_STATE);
            
        } catch (error) {
            console.error('❌ Zordon initialization failed:', error);
        }
    }

    /**
     * Ładowanie modułów
     */
    async loadModules() {
        const modules = [
            'formDataProcessor',
            'pdfGenerator',
            'emailSender',
            'resultsRenderer',
            'intelligentModeHandler'
        ];

        for (const module of modules) {
            try {
                // Sprawdź czy moduł już istnieje w globalnym scope
                if (window[module]) {
                    this.modules.set(module, window[module]);
                    this.debugLog(`Module loaded: ${module}`);
                }
            } catch (error) {
                console.warn(`⚠️ Module ${module} not available:`, error);
            }
        }
    }

    /**
     * Przełączanie widoków/trybów
     */
    switchToMode(mode) {
        this.debugLog(`Switching to mode: ${mode}`);
        
        // Ukryj wszystkie sekcje
        this.hideAllSections();
        
        // Pokaż odpowiednią sekcję
        switch (mode) {
            case 'welcome':
                this.showWelcomeScreen();
                break;
            case 'mode1':
                this.showMode1();
                break;
            case 'mode2':
                this.showMode2();
                break;
            case 'mode3':
                this.showMode3();
                break;
            case 'mode4':
                this.showMode4();
                break;
            default:
                console.warn('Unknown mode:', mode);
                this.showWelcomeScreen();
        }
        
        // Aktualizuj stan
        window.ZORDON_STATE.currentMode = mode;
        this.currentView = mode;
    }

    /**
     * Ukryj wszystkie sekcje
     */
    hideAllSections() {
        const sections = document.querySelectorAll('.section, .form-section, .calculator-section');
        sections.forEach(section => {
            section.classList.add('hidden');
            section.classList.remove('active');
        });
    }

    /**
     * Pokaż ekran powitalny
     */
    showWelcomeScreen() {
        const welcomeScreen = document.getElementById('welcome-screen');
        if (welcomeScreen) {
            welcomeScreen.classList.remove('hidden');
            welcomeScreen.classList.add('active');
            this.debugLog('Welcome screen displayed');
        }
    }

    /**
     * Pokaż Mode 1 - Pełny kalkulator
     */
    showMode1() {
        const mode1Section = document.getElementById('heatCalcFormFull');
        if (mode1Section) {
            mode1Section.classList.remove('hidden');
            mode1Section.classList.add('active');
            mode1Section.scrollIntoView({ behavior: 'smooth' });
            this.debugLog('Mode 1 activated');
        }
    }

    /**
     * Pokaż Mode 2 - AI PDF Analysis
     */
    showMode2() {
        const mode2Section = document.getElementById('heatCalcMode2');
        if (mode2Section) {
            mode2Section.classList.remove('hidden');
            mode2Section.classList.add('active');
            mode2Section.scrollIntoView({ behavior: 'smooth' });
            this.debugLog('Mode 2 activated');
        }
    }

    /**
     * Pokaż Mode 3 - Modernizacja
     */
    showMode3() {
        const mode3Section = document.getElementById('form-mode3');
        if (mode3Section) {
            mode3Section.classList.remove('hidden');
            mode3Section.classList.add('active');
            mode3Section.scrollIntoView({ behavior: 'smooth' });
            this.debugLog('Mode 3 activated');
        }
    }

    /**
     * Pokaż Mode 4 - Znana moc
     */
    showMode4() {
        const mode4Section = document.getElementById('form-mode4');
        if (mode4Section) {
            mode4Section.classList.remove('hidden');
            mode4Section.classList.add('active');
            mode4Section.scrollIntoView({ behavior: 'smooth' });
            this.debugLog('Mode 4 activated');
        }
    }

    /**
     * Aktualizuj dane w stanie globalnym
     */
    updateState(key, value) {
        window.ZORDON_STATE[key] = value;
        this.debugLog(`State updated: ${key}`, value);
    }

    /**
     * Pobierz dane ze stanu
     */
    getState(key) {
        return window.ZORDON_STATE[key];
    }

    /**
     * Ustaw handlery zdarzeń
     */
    setupEventHandlers() {
        // Handlery dla przycisków trybu
        const modeButtons = document.querySelectorAll('[data-mode]');
        modeButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const mode = e.target.dataset.mode;
                this.switchToMode(mode);
            });
        });

        // Handler dla przycisku powrotu
        const backButtons = document.querySelectorAll('.back-to-welcome');
        backButtons.forEach(button => {
            button.addEventListener('click', () => {
                this.switchToMode('welcome');
            });
        });

        this.debugLog('Event handlers setup complete');
    }

    /**
     * Ustaw stan początkowy
     */
    setupInitialState() {
        // Pokaż ekran powitalny
        this.switchToMode('welcome');
        
        // Ustaw wersję w stanie
        this.updateState('version', window.ZORDON_STATE.version);
        
        this.debugLog('Initial state setup complete');
    }

    /**
     * Obsługa błędów
     */
    handleError(error, context = '') {
        console.error(`❌ Zordon Error ${context}:`, error);
        
        if (window.ZORDON_DEBUG) {
            alert(`Błąd aplikacji: ${error.message || error}`);
        }
        
        // Loguj błąd do stanu dla debugowania
        if (!window.ZORDON_STATE.errors) {
            window.ZORDON_STATE.errors = [];
        }
        window.ZORDON_STATE.errors.push({
            error: error.message || error,
            context,
            timestamp: new Date().toISOString()
        });
    }
}

// Globalna instancja kontrolera
window.ZordonApp = new ZordonAppController();

// Auto-inicjalizacja po załadowaniu DOM
document.addEventListener('DOMContentLoaded', () => {
    window.ZordonApp.init();
});

// Export dla modułów ES6 (jeśli potrzebne)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ZordonAppController;
}