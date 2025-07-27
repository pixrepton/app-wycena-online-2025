/**
 * Mode 2 Handler - Nowoczesny handler dla trybu AI PDF Analysis
 * Część architektury WYCENA 2025
 */

class Mode2Handler {
    constructor() {
        this.initialized = false;
        this.debug('Mode2Handler initialized');
    }

    debug(message, data = null) {
        console.log(`🎯 Mode2Handler: ${message}`, data || '');
    }

    /**
     * Aktywuj tryb 2 używając nowoczesnej architektury
     */
    activate(preliminaryData = {}) {
        this.debug('Activating Mode 2 with preliminary data', preliminaryData);

        // Użyj UIRouter dla czystej nawigacji
        if (window.uiRouter) {
            window.uiRouter.navigateTo('tryb2');
            this.debug('✅ Mode 2 activated via UIRouter');
        } else {
            // Fallback do bezpośredniej aktywacji
            this.activateDirectly();
        }

        // Zapisz dane preliminary w ZORDON_STATE
        if (window.updateZORDON) {
            window.updateZORDON({
                currentMode: 'tryb2',
                preliminaryData: preliminaryData
            });
        }

        // Sprawdź czy PDF został już przesłany
        this.handlePreliminaryPDF();

        this.initialized = true;
    }

    /**
     * Bezpośrednia aktywacja jako fallback
     */
    activateDirectly() {
        this.debug('Using direct activation fallback');
        
        const calc = document.getElementById('heatCalcMode2');
        if (calc) {
            // Używaj czystych klas CSS zamiast inline styles
            calc.classList.remove('hidden');
            calc.classList.add('active');
            
            // Aktywuj wewnętrzną sekcję
            const innerSection = calc.querySelector('.section[data-tab="0"]');
            if (innerSection) {
                innerSection.classList.add('active');
            }
            
            calc.scrollIntoView({ behavior: 'smooth' });
            this.debug('✅ Mode 2 calculator activated directly');
        }
    }

    /**
     * Obsługa PDF przesłanego w formularzu preliminary
     */
    handlePreliminaryPDF() {
        const prelimPdfInput = document.getElementById('pdf-upload-mode2');
        const selectedFile = prelimPdfInput?.files?.[0];

        if (selectedFile) {
            this.debug('📄 PDF file found, transferring to calculator');
            
            // Transfer pliku do kalkulatora Mode 2
            const calculatorPdfInput = document.getElementById('pdf-file-input-mode2');
            if (calculatorPdfInput) {
                // Utwórz nowy FileList z tym samym plikiem
                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(selectedFile);
                calculatorPdfInput.files = dataTransfer.files;
                
                this.debug('✅ PDF file transferred to calculator input');
            }
            
            // Zachowaj plik w state
            if (window.updateZORDON) {
                window.updateZORDON({ selectedFile: selectedFile });
            }
            
            // Auto-trigger analizy AI
            setTimeout(() => {
                this.debug('🚀 Auto-starting AI PDF analysis');
                this.startAIAnalysis();
            }, 1000);
        }
    }

    /**
     * Uruchom analizę AI
     */
    startAIAnalysis() {
        // Sprawdź czy plik jest w kalkulatorze
        const calculatorPdfInput = document.getElementById('pdf-file-input-mode2');
        const selectedFile = calculatorPdfInput?.files?.[0];
        
        if (selectedFile) {
            this.debug('✅ File found in calculator, starting AI analysis');
            if (window.analyzeProjectWithAI) {
                window.analyzeProjectWithAI(selectedFile);
            } else {
                this.debug('❌ analyzeProjectWithAI function not available');
            }
        } else {
            // Fallback do startAIPDFAnalysis
            if (window.startAIPDFAnalysis) {
                window.startAIPDFAnalysis();
            } else {
                this.debug('❌ No AI Analysis functions available');
            }
        }
    }
}

// Utwórz globalną instancję
window.mode2Handler = new Mode2Handler();

// Export dla kompatybilności
window.activateMode2 = function(preliminaryData) {
    window.mode2Handler.activate(preliminaryData);
};

console.log('✅ Mode2Handler loaded successfully');