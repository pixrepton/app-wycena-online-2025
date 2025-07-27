// === GDPR COMPLIANCE SYSTEM ===
// System zgodności z RODO dla systemów trackingu TOP-INSTAL

(function() {
    'use strict';

    // GDPR Configuration
    const GDPR_CONFIG = {
        cookieName: 'topinstal_analytics_consent',
        consentDuration: 365, // dni
        requiredForCore: false, // Czy tracking jest wymagany dla działania kalkulatora
        privacyPolicyUrl: '/polityka-prywatnosci',
        categories: {
            necessary: {
                name: 'Niezbędne',
                description: 'Wymagane do działania kalkulatora',
                enabled: true,
                locked: true
            },
            analytics: {
                name: 'Analityczne', 
                description: 'Pomagają nam ulepszać kalkulator',
                enabled: false,
                locked: false,
                modules: ['aiWatchers', 'userPathHistory', 'formAnomalies']
            },
            functional: {
                name: 'Funkcjonalne',
                description: 'Zapamiętują Twoje preferencje', 
                enabled: false,
                locked: false,
                modules: ['formSaving', 'preferences']
            }
        }
    };

    class GDPRManager {
        constructor() {
            this.consent = this.loadConsent();
            this.consentGiven = false;
            this.modules = new Map();
        }

        loadConsent() {
            try {
                const cookie = document.cookie
                    .split('; ')
                    .find(row => row.startsWith(GDPR_CONFIG.cookieName + '='));
                
                if (cookie) {
                    const value = cookie.split('=')[1];
                    return JSON.parse(decodeURIComponent(value));
                }
            } catch (error) {
                console.error('GDPR: Błąd odczytu zgody:', error);
            }
            return null;
        }

        saveConsent(consent) {
            try {
                const expires = new Date();
                expires.setDate(expires.getDate() + GDPR_CONFIG.consentDuration);
                
                const consentData = {
                    ...consent,
                    timestamp: Date.now(),
                    version: '1.0'
                };

                document.cookie = `${GDPR_CONFIG.cookieName}=${encodeURIComponent(JSON.stringify(consentData))}; expires=${expires.toUTCString()}; path=/; secure; samesite=strict`;
                this.consent = consentData;
                this.consentGiven = true;
                
                return true;
            } catch (error) {
                console.error('GDPR: Błąd zapisu zgody:', error);
                return false;
            }
        }

        hasConsent(category) {
            if (!this.consent) return false;
            return this.consent[category] === true;
        }

        isConsentValid() {
            if (!this.consent || !this.consent.timestamp) return false;
            
            const consentAge = Date.now() - this.consent.timestamp;
            const maxAge = GDPR_CONFIG.consentDuration * 24 * 60 * 60 * 1000;
            
            return consentAge < maxAge;
        }

        registerModule(name, category, initFunction, destroyFunction) {
            if (!name || !category || typeof initFunction !== 'function') {
                console.error('GDPR: Nieprawidłowe parametry rejestracji modułu');
                return;
            }
            
            this.modules.set(name, {
                category,
                init: initFunction,
                destroy: destroyFunction || function() {},
                active: false
            });
            
            console.log(`GDPR: Zarejestrowano moduł ${name} w kategorii ${category}`);
        }

        initializeModules() {
            this.modules.forEach((module, name) => {
                const shouldEnable = GDPR_CONFIG.categories[module.category].locked || 
                                   this.hasConsent(module.category);

                if (shouldEnable && !module.active) {
                    try {
                        module.init();
                        module.active = true;
                        console.log(`GDPR: Moduł ${name} został włączony`);
                    } catch (error) {
                        console.error(`GDPR: Błąd inicjalizacji modułu ${name}:`, error);
                    }
                } else if (!shouldEnable && module.active) {
                    try {
                        module.destroy();
                        module.active = false;
                        console.log(`GDPR: Moduł ${name} został wyłączony`);
                    } catch (error) {
                        console.error(`GDPR: Błąd wyłączenia modułu ${name}:`, error);
                    }
                }
            });
        }

        showConsentBanner() {
            if (this.isConsentValid()) {
                this.initializeModules();
                return;
            }

            const banner = this.createConsentBanner();
            document.body.appendChild(banner);
        }

        createConsentBanner() {
            const banner = document.createElement('div');
            banner.id = 'gdpr-consent-banner';
            banner.innerHTML = `
                <div class="gdpr-banner">
                    <div class="gdpr-content">
                        <h3>🍪 Ustawienia prywatności</h3>
                        <p>Używamy różnych technologii do ulepszania działania kalkulatora. Wybierz, na co wyrażasz zgodę:</p>
                        
                        <div class="gdpr-categories">
                            ${Object.entries(GDPR_CONFIG.categories).map(([key, cat]) => `
                                <label class="gdpr-category ${cat.locked ? 'locked' : ''}">
                                    <input type="checkbox" 
                                           data-category="${key}" 
                                           ${cat.enabled ? 'checked' : ''} 
                                           ${cat.locked ? 'disabled' : ''}>
                                    <span class="gdpr-category-name">${cat.name}</span>
                                    <span class="gdpr-category-desc">${cat.description}</span>
                                </label>
                            `).join('')}
                        </div>
                        
                        <div class="gdpr-actions">
                            <button id="gdpr-accept-all" class="gdpr-btn primary">Akceptuj wszystkie</button>
                            <button id="gdpr-accept-selected" class="gdpr-btn secondary">Akceptuj wybrane</button>
                            <button id="gdpr-reject-all" class="gdpr-btn tertiary">Tylko niezbędne</button>
                            <a href="${GDPR_CONFIG.privacyPolicyUrl}" target="_blank" class="gdpr-policy-link">Polityka prywatności</a>
                        </div>
                    </div>
                </div>
            `;

            // Style CSS
            const style = document.createElement('style');
            style.textContent = `
                .gdpr-banner {
                    position: fixed;
                    bottom: 0;
                    left: 0;
                    right: 0;
                    background: rgba(0,0,0,0.95);
                    color: white;
                    z-index: 10000;
                    backdrop-filter: blur(10px);
                }
                .gdpr-content {
                    max-width: 800px;
                    margin: 0 auto;
                    padding: 20px;
                }
                .gdpr-categories {
                    margin: 15px 0;
                }
                .gdpr-category {
                    display: flex;
                    align-items: center;
                    margin: 10px 0;
                    padding: 10px;
                    background: rgba(255,255,255,0.1);
                    border-radius: 5px;
                    cursor: pointer;
                }
                .gdpr-category.locked {
                    opacity: 0.6;
                    cursor: not-allowed;
                }
                .gdpr-category input {
                    margin-right: 10px;
                }
                .gdpr-category-name {
                    font-weight: bold;
                    margin-right: 10px;
                }
                .gdpr-category-desc {
                    font-size: 0.9em;
                    opacity: 0.8;
                }
                .gdpr-actions {
                    display: flex;
                    gap: 10px;
                    flex-wrap: wrap;
                    align-items: center;
                    margin-top: 15px;
                }
                .gdpr-btn {
                    padding: 10px 15px;
                    border: none;
                    border-radius: 5px;
                    cursor: pointer;
                    font-weight: bold;
                }
                .gdpr-btn.primary {
                    background: #4CAF50;
                    color: white;
                }
                .gdpr-btn.secondary {
                    background: #2196F3;
                    color: white;
                }
                .gdpr-btn.tertiary {
                    background: transparent;
                    color: white;
                    border: 1px solid white;
                }
                .gdpr-policy-link {
                    color: #81C784;
                    text-decoration: underline;
                }
                @media (max-width: 600px) {
                    .gdpr-actions {
                        flex-direction: column;
                    }
                    .gdpr-btn {
                        width: 100%;
                    }
                }
            `;
            banner.appendChild(style);

            // Event listeners
            banner.querySelector('#gdpr-accept-all').onclick = () => this.acceptAll(banner);
            banner.querySelector('#gdpr-accept-selected').onclick = () => this.acceptSelected(banner);
            banner.querySelector('#gdpr-reject-all').onclick = () => this.rejectAll(banner);

            return banner;
        }

        acceptAll(banner) {
            const consent = {};
            Object.keys(GDPR_CONFIG.categories).forEach(category => {
                consent[category] = true;
            });
            
            if (this.saveConsent(consent)) {
                this.removeBanner(banner);
                this.initializeModules();
            }
        }

        acceptSelected(banner) {
            const consent = {};
            const checkboxes = banner.querySelectorAll('input[type="checkbox"]');
            
            checkboxes.forEach(cb => {
                consent[cb.dataset.category] = cb.checked;
            });
            
            if (this.saveConsent(consent)) {
                this.removeBanner(banner);
                this.initializeModules();
            }
        }

        rejectAll(banner) {
            const consent = {};
            Object.keys(GDPR_CONFIG.categories).forEach(category => {
                consent[category] = GDPR_CONFIG.categories[category].locked;
            });
            
            if (this.saveConsent(consent)) {
                this.removeBanner(banner);
                this.initializeModules();
            }
        }

        removeBanner(banner) {
            if (banner && banner.parentNode) {
                banner.parentNode.removeChild(banner);
            }
        }

        // Public API for checking consent
        canTrack(category) {
            return GDPR_CONFIG.categories[category]?.locked || this.hasConsent(category);
        }

        // Reset consent (for testing/admin)
        resetConsent() {
            try {
                document.cookie = `${GDPR_CONFIG.cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
                localStorage.removeItem(GDPR_CONFIG.cookieName);
                this.consent = null;
                this.consentGiven = false;
                
                // Zatrzymaj wszystkie moduły
                this.modules.forEach((module, name) => {
                    if (module.active) {
                        try {
                            module.destroy();
                            module.active = false;
                        } catch (error) {
                            console.error(`GDPR: Błąd zatrzymania modułu ${name}:`, error);
                        }
                    }
                });
                
                console.log('GDPR: Zgoda została zresetowana');
            } catch (error) {
                console.error('GDPR: Błąd resetowania zgody:', error);
            }
        }

        // Sprawdza czy można śledzić konkretną kategorię
        canUseCategory(category) {
            const categoryConfig = GDPR_CONFIG.categories[category];
            if (!categoryConfig) {
                console.warn(`GDPR: Nieznana kategoria: ${category}`);
                return false;
            }
            
            return categoryConfig.locked || this.hasConsent(category);
        }

        // Zwraca status wszystkich kategorii
        getConsentStatus() {
            const status = {};
            Object.keys(GDPR_CONFIG.categories).forEach(category => {
                status[category] = this.canUseCategory(category);
            });
            return status;
        }

        // Wywołuje callback gdy zgoda się zmieni
        onConsentChange(callback) {
            if (typeof callback !== 'function') return;
            
            // Dodaj do listenersów (można rozszerzyć)
            setTimeout(() => callback(this.getConsentStatus()), 0);
        }
    }

    // Initialize GDPR Manager
    window.GDPRManager = new GDPRManager();

    // Google Analytics Domain Fix
    // Zapobiega problemom z cookies GA na localhost/testowych domenach
    if (typeof gtag !== 'undefined' && 
        (location.hostname === 'localhost' || 
         location.hostname.includes('127.0.0.1') ||
         location.hostname.includes('.replit.') ||
         location.hostname.includes('test'))) {
        
        console.log('🔧 GDPR: Google Analytics disabled for dev/test domain');
        
        // Override gtag dla środowisk dev/test
        window.gtag = function() {
            console.log('📊 GA call blocked (dev environment):', arguments);
        };
    }

    // Auto-start on DOM ready with error handling
    function initializeGDPR() {
        try {
            window.GDPRManager.showConsentBanner();
            
            // Auto-register podstawowe moduły jeśli są dostępne
            setTimeout(() => {
                if (typeof window.initAIWatchers === 'function') {
                    window.registerGDPRModule(
                        'aiWatchers', 
                        'analytics', 
                        window.initAIWatchers,
                        () => { 
                            // Funkcja czyszcząca AI Watchers
                            if (window.cleanupAIWatchers) window.cleanupAIWatchers();
                        }
                    );
                }
                
                if (typeof window.initUserPathHistory === 'function') {
                    window.registerGDPRModule(
                        'userPathHistory', 
                        'analytics', 
                        window.initUserPathHistory,
                        () => {
                            if (window.cleanupUserPath) window.cleanupUserPath();
                        }
                    );
                }
                
                console.log('GDPR: Automatyczna rejestracja modułów zakończona');
            }, 500);
            
        } catch (error) {
            console.error('GDPR: Błąd inicjalizacji:', error);
        }
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeGDPR);
    } else {
        initializeGDPR();
    }

    // Export for other modules
    window.canTrack = (category) => window.GDPRManager.canTrack(category);
    window.registerGDPRModule = (name, category, init, destroy) => 
        window.GDPRManager.registerModule(name, category, init, destroy);
    window.getGDPRStatus = () => window.GDPRManager.getConsentStatus();
    window.resetGDPRConsent = () => window.GDPRManager.resetConsent();

    console.log('✅ GDPR Compliance Module loaded successfully');

})();