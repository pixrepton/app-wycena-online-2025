/**
 * UI Router - Routing i nawigacja według specyfikacji WYCENA 2025
 * Zgodnie z dokumentacją README-WYCENA2025-v2.md
 */

class UIRouter {
    constructor() {
        this.currentView = null;
        this.viewHistory = [];
        this.routes = {
            'welcome': '#welcome-screen',
            'tryb1': '#heatCalcFormFull',
            'tryb2': '#heatCalcMode2', 
            'tryb3': '#form-mode3',
            'tryb4': '#form-mode4',
            'results': '#calcResultsSection'
        };
        
        this.debug('UIRouter initialized');
    }

    debug(message, data = null) {
        if (window.ZORDON_DEBUG) {
            console.log(`🛣️ UIRouter: ${message}`, data || '');
        }
    }

    /**
     * Nawiguj do widoku
     * @param {string} route - Nazwa route
     * @param {Object} params - Parametry opcjonalne
     */
    navigateTo(route, params = {}) {
        this.debug(`Navigating to: ${route}`, params);
        
        if (!this.routes[route]) {
            console.warn(`Route not found: ${route}`);
            return false;
        }

        // Zapisz obecny widok w historii
        if (this.currentView && this.currentView !== route) {
            this.viewHistory.push(this.currentView);
        }

        // Ukryj wszystkie sekcje
        this.hideAllSections();

        // Pokaż docelową sekcję
        const targetSelector = this.routes[route];
        const targetElement = document.querySelector(targetSelector);
        
        if (targetElement) {
            targetElement.classList.remove('hidden');
            targetElement.classList.add('active');
            
            // Smooth scroll do elementu
            targetElement.scrollIntoView({ 
                behavior: 'smooth',
                block: 'start'
            });
        }

        // Aktualizuj stan
        this.currentView = route;
        
        // Aktualizuj ZORDON_STATE
        if (window.updateZORDON) {
            window.updateZORDON({ currentMode: route });
        }
        
        // Aktualizuj URL
        this.updateURL(route, params);
        
        // Trigger custom event
        this.dispatchNavigationEvent(route, params);
        
        this.debug(`Navigation completed to: ${route}`);
        return true;
    }

    /**
     * Ukryj wszystkie sekcje
     */
    hideAllSections() {
        // Lista wszystkich sekcji do ukrycia
        const sections = [
            '#welcome-screen',
            '#heatCalcFormFull', 
            '#heatCalcMode2',
            '#form-mode3',
            '#form-mode4',
            '#calcResultsSection',
            '.form-section',
            '.calculator-section'
        ];

        sections.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(el => {
                el.classList.add('hidden');
                el.classList.remove('active');
            });
        });
    }

    /**
     * Powrót do poprzedniego widoku
     */
    goBack() {
        if (this.viewHistory.length > 0) {
            const previousView = this.viewHistory.pop();
            this.debug(`Going back to: ${previousView}`);
            this.navigateTo(previousView);
        } else {
            this.debug('No history, going to welcome');
            this.navigateTo('welcome');
        }
    }

    /**
     * Aktualizuj URL bez przeładowania strony
     */
    updateURL(route, params) {
        if (typeof history !== 'undefined' && history.pushState) {
            const url = new URL(window.location);
            url.searchParams.set('mode', route);
            
            // Dodaj dodatkowe parametry
            Object.keys(params).forEach(key => {
                url.searchParams.set(key, params[key]);
            });
            
            history.pushState({ route, params }, '', url);
            this.debug('URL updated', url.toString());
        }
    }

    /**
     * Inicjalizuj router z URL
     */
    initFromURL() {
        const urlParams = new URLSearchParams(window.location.search);
        const mode = urlParams.get('mode');
        
        if (mode && this.routes[mode]) {
            this.debug(`Initializing from URL: ${mode}`);
            this.navigateTo(mode);
        } else {
            this.navigateTo('welcome');
        }
    }

    /**
     * Wyślij event nawigacji
     */
    dispatchNavigationEvent(route, params) {
        const event = new CustomEvent('zordon:navigation', {
            detail: { route, params, router: this }
        });
        
        if (typeof window !== 'undefined') {
            window.dispatchEvent(event);
        }
    }

    /**
     * Zarejestruj nowy route
     */
    registerRoute(name, selector) {
        this.routes[name] = selector;
        this.debug(`Route registered: ${name} -> ${selector}`);
    }

    /**
     * Pobierz obecny route
     */
    getCurrentRoute() {
        return this.currentView;
    }

    /**
     * Sprawdź czy route istnieje
     */
    hasRoute(route) {
        return !!this.routes[route];
    }

    /**
     * Obsługa browser back/forward
     */
    setupBrowserNavigation() {
        window.addEventListener('popstate', (event) => {
            if (event.state && event.state.route) {
                this.debug('Browser navigation detected');
                // Nie dodawaj do historii - to już jest browser history
                const currentView = this.currentView;
                this.currentView = null; // Reset aby uniknąć dodania do historii
                this.navigateTo(event.state.route, event.state.params || {});
            }
        });
    }
}

// Globalna instancja
window.UIRouter = new UIRouter();

// Auto-inicjalizacja
document.addEventListener('DOMContentLoaded', () => {
    window.UIRouter.setupBrowserNavigation();
    window.UIRouter.initFromURL();
});

// Backward compatibility - aliasy dla istniejących funkcji
window.showWelcomeScreen = () => window.UIRouter.navigateTo('welcome');
window.switchToMode = (mode) => window.UIRouter.navigateTo(mode);

// Export for ES6
if (typeof module !== 'undefined' && module.exports) {
    module.exports = UIRouter;
}

console.log('🛣️ UIRouter system loaded successfully');