/**
 * Route Controller - Navigation and routing logic
 * Part of Wycena 2025 architectural refactoring
 */

class RouteController {
    constructor() {
        this.currentRoute = null;
        this.routeHistory = [];
        this.debugMode = window.ZORDON_DEBUG || false;
        
        this.debug('RouteController initialized');
    }

    debug(message, data = null) {
        if (this.debugMode) {
            console.log(`🛣️ RouteController: ${message}`, data || '');
        }
    }

    /**
     * Navigate to a specific route
     * @param {string} route - Route name (welcome, mode1, mode2, mode3, mode4)
     * @param {Object} params - Route parameters
     */
    navigateTo(route, params = {}) {
        this.debug(`Navigating to: ${route}`, params);
        
        // Validate route
        if (!this.isValidRoute(route)) {
            console.warn(`Invalid route: ${route}`);
            return false;
        }
        
        // Store previous route
        if (this.currentRoute) {
            this.routeHistory.push(this.currentRoute);
        }
        
        // Update current route
        this.currentRoute = route;
        
        // Update URL (if browser supports it)
        this.updateURL(route, params);
        
        // Update ZORDON_STATE
        if (window.ZORDON_STATE) {
            window.ZORDON_STATE.currentMode = route;
        }
        
        // Trigger route change
        this.executeRouteChange(route, params);
        
        return true;
    }

    /**
     * Go back to previous route
     */
    goBack() {
        if (this.routeHistory.length > 0) {
            const previousRoute = this.routeHistory.pop();
            this.debug(`Going back to: ${previousRoute}`);
            this.navigateTo(previousRoute);
        } else {
            this.debug('No previous route, going to welcome');
            this.navigateTo('welcome');
        }
    }

    /**
     * Validate if route exists
     */
    isValidRoute(route) {
        const validRoutes = ['welcome', 'mode1', 'mode2', 'mode3', 'mode4'];
        return validRoutes.includes(route);
    }

    /**
     * Update browser URL
     */
    updateURL(route, params) {
        if (typeof window !== 'undefined' && window.history) {
            const url = new URL(window.location);
            url.searchParams.set('mode', route);
            
            // Add additional parameters
            Object.keys(params).forEach(key => {
                url.searchParams.set(key, params[key]);
            });
            
            window.history.pushState({ route, params }, '', url);
            this.debug('URL updated', url.toString());
        }
    }

    /**
     * Execute route change logic
     */
    executeRouteChange(route, params) {
        // Use existing AppController if available
        if (window.ZordonApp && typeof window.ZordonApp.switchToMode === 'function') {
            window.ZordonApp.switchToMode(route);
        } else {
            // Fallback to direct DOM manipulation
            this.fallbackRouteChange(route);
        }
        
        // Trigger custom event
        this.dispatchRouteChangeEvent(route, params);
    }

    /**
     * Fallback route change without AppController
     */
    fallbackRouteChange(route) {
        this.debug('Using fallback route change');
        
        // Hide all sections
        document.querySelectorAll('.section, .form-section, .calculator-section').forEach(section => {
            section.classList.add('hidden');
            section.classList.remove('active');
        });
        
        // Show target section
        const targetElement = this.getRouteElement(route);
        if (targetElement) {
            targetElement.classList.remove('hidden');
            targetElement.classList.add('active');
            targetElement.scrollIntoView({ behavior: 'smooth' });
        }
    }

    /**
     * Get DOM element for route
     */
    getRouteElement(route) {
        const routeMap = {
            'welcome': '#welcome-screen',
            'mode1': '#heatCalcFormFull',
            'mode2': '#heatCalcMode2',
            'mode3': '#form-mode3',
            'mode4': '#form-mode4'
        };
        
        const selector = routeMap[route];
        return selector ? document.querySelector(selector) : null;
    }

    /**
     * Dispatch route change event
     */
    dispatchRouteChangeEvent(route, params) {
        const event = new CustomEvent('routeChange', {
            detail: { route, params, controller: this }
        });
        
        if (typeof window !== 'undefined') {
            window.dispatchEvent(event);
        }
        
        this.debug('Route change event dispatched', { route, params });
    }

    /**
     * Get current route
     */
    getCurrentRoute() {
        return this.currentRoute;
    }

    /**
     * Get route history
     */
    getRouteHistory() {
        return [...this.routeHistory];
    }

    /**
     * Initialize from URL parameters
     */
    initFromURL() {
        if (typeof window !== 'undefined') {
            const urlParams = new URLSearchParams(window.location.search);
            const mode = urlParams.get('mode');
            
            if (mode && this.isValidRoute(mode)) {
                this.debug(`Initializing from URL: ${mode}`);
                this.navigateTo(mode);
            } else {
                this.navigateTo('welcome');
            }
        }
    }

    /**
     * Setup browser navigation listeners
     */
    setupNavigationListeners() {
        if (typeof window !== 'undefined') {
            window.addEventListener('popstate', (event) => {
                if (event.state && event.state.route) {
                    this.debug('Browser back/forward detected');
                    this.executeRouteChange(event.state.route, event.state.params || {});
                }
            });
        }
    }
}

// Global instance
window.RouteController = new RouteController();

// Auto-initialize
document.addEventListener('DOMContentLoaded', () => {
    window.RouteController.setupNavigationListeners();
    window.RouteController.initFromURL();
});

// Export for ES6 modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = RouteController;
}