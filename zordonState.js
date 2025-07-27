/**
 * ZORDON_STATE - Centralny store danych klienta i wyceny
 * Part of Wycena 2025 - zgodnie z dokumentacją README-WYCENA2025-v2.md
 */

// Inicjalizacja globalnego stanu ZORDON
if (typeof window !== 'undefined') {
    window.ZORDON_STATE = window.ZORDON_STATE || {};
}

class ZordonState {
    constructor() {
        this.state = {
            // Tryb kalkulacji
            currentMode: null,
            
            // Dane budynku
            powierzchnia: null,
            eu: null,
            kondygnacje: 1,
            piwnica: false,
            dach: 'flat',
            
            // Obliczenia
            mocSzacowana: null,
            mocObliczona: null,
            
            // Dobrane urządzenia
            kit: null,
            buffer: null,
            cwu: null,
            
            // Pricing
            price: null,
            priceNet: null,
            priceGross: null,
            
            // Status
            pdfReady: false,
            calculationComplete: false,
            
            // Dane klienta
            email: null,
            phone: null,
            name: null,
            
            // Metadane
            timestamp: new Date().toISOString(),
            version: '2025-07-26'
        };
        
        this.listeners = [];
        this.debugMode = window.ZORDON_DEBUG || false;
        
        // Inicjalizacja z localStorage jeśli dostępne
        this.loadFromStorage();
        
        this.debug('ZordonState initialized');
    }

    debug(message, data = null) {
        if (this.debugMode) {
            console.log(`🧠 ZORDON_STATE: ${message}`, data || '');
        }
    }

    /**
     * Ustaw wartość w stanie
     * @param {string} key - Klucz
     * @param {*} value - Wartość
     */
    set(key, value) {
        const oldValue = this.state[key];
        this.state[key] = value;
        
        this.debug(`Set ${key}:`, value);
        
        // Trigger listeners
        this.notifyListeners(key, value, oldValue);
        
        // Auto-save to storage
        this.saveToStorage();
        
        return this;
    }

    /**
     * Pobierz wartość ze stanu
     * @param {string} key - Klucz
     * @returns {*} Wartość
     */
    get(key) {
        return this.state[key];
    }

    /**
     * Ustaw wiele wartości jednocześnie
     * @param {Object} updates - Obiekt z kluczami i wartościami
     */
    update(updates) {
        const changedKeys = [];
        
        Object.keys(updates).forEach(key => {
            if (this.state[key] !== updates[key]) {
                changedKeys.push(key);
                this.state[key] = updates[key];
            }
        });
        
        this.debug('Bulk update:', updates);
        
        // Notify listeners for changed keys
        changedKeys.forEach(key => {
            this.notifyListeners(key, this.state[key], undefined);
        });
        
        this.saveToStorage();
        return this;
    }

    /**
     * Pobierz cały stan
     * @returns {Object} Kompletny stan
     */
    getAll() {
        return { ...this.state };
    }

    /**
     * Zresetuj stan do wartości domyślnych
     */
    reset() {
        const defaultState = {
            currentMode: null,
            powierzchnia: null,
            eu: null,
            kondygnacje: 1,
            piwnica: false,
            dach: 'flat',
            mocSzacowana: null,
            mocObliczona: null,
            kit: null,
            buffer: null,
            cwu: null,
            price: null,
            priceNet: null,
            priceGross: null,
            pdfReady: false,
            calculationComplete: false,
            email: null,
            phone: null,
            name: null,
            timestamp: new Date().toISOString(),
            version: '2025-07-26'
        };
        
        this.state = defaultState;
        this.debug('State reset');
        this.saveToStorage();
        
        // Notify all listeners of reset
        this.notifyListeners('RESET', this.state, {});
        
        return this;
    }

    /**
     * Dodaj listener do zmian stanu
     * @param {Function} callback - Funkcja wywoływana przy zmianie
     */
    addListener(callback) {
        this.listeners.push(callback);
        this.debug('Listener added, total:', this.listeners.length);
    }

    /**
     * Usuń listener
     * @param {Function} callback - Funkcja do usunięcia
     */
    removeListener(callback) {
        const index = this.listeners.indexOf(callback);
        if (index > -1) {
            this.listeners.splice(index, 1);
            this.debug('Listener removed');
        }
    }

    /**
     * Powiadom wszystkich listenerów o zmianie
     */
    notifyListeners(key, newValue, oldValue) {
        this.listeners.forEach(listener => {
            try {
                listener(key, newValue, oldValue, this.state);
            } catch (error) {
                console.error('ZORDON_STATE listener error:', error);
            }
        });
    }

    /**
     * Zapisz stan do localStorage
     */
    saveToStorage() {
        if (typeof localStorage !== 'undefined') {
            try {
                localStorage.setItem('ZORDON_STATE', JSON.stringify(this.state));
                this.debug('State saved to localStorage');
            } catch (error) {
                console.warn('Failed to save to localStorage:', error);
            }
        }
    }

    /**
     * Wczytaj stan z localStorage
     */
    loadFromStorage() {
        if (typeof localStorage !== 'undefined') {
            try {
                const saved = localStorage.getItem('ZORDON_STATE');
                if (saved) {
                    const parsedState = JSON.parse(saved);
                    this.state = { ...this.state, ...parsedState };
                    this.debug('State loaded from localStorage');
                }
            } catch (error) {
                console.warn('Failed to load from localStorage:', error);
            }
        }
    }

    /**
     * Eksportuj stan do JSON
     * @returns {string} JSON string
     */
    export() {
        return JSON.stringify(this.state, null, 2);
    }

    /**
     * Importuj stan z JSON
     * @param {string} jsonString - JSON string
     */
    import(jsonString) {
        try {
            const importedState = JSON.parse(jsonString);
            this.state = { ...this.state, ...importedState };
            this.debug('State imported from JSON');
            this.saveToStorage();
            this.notifyListeners('IMPORT', this.state, {});
        } catch (error) {
            console.error('Failed to import state:', error);
        }
    }

    /**
     * Sprawdź czy kalkulacja jest kompletna
     * @returns {boolean}
     */
    isCalculationComplete() {
        return !!(
            this.state.mocSzacowana &&
            this.state.kit &&
            this.state.price &&
            this.state.currentMode
        );
    }

    /**
     * Sprawdź czy można generować PDF
     * @returns {boolean}
     */
    canGeneratePDF() {
        return this.isCalculationComplete() && 
               !!(this.state.email || this.state.phone);
    }

    /**
     * Pobierz podsumowanie do PDF
     * @returns {Object}
     */
    getPDFSummary() {
        return {
            MOC: this.state.mocSzacowana,
            KIT: this.state.kit,
            BUFFER: this.state.buffer,
            CWU: this.state.cwu,
            PRICE: this.state.price,
            POWIERZCHNIA: this.state.powierzchnia,
            EMAIL: this.state.email,
            TIMESTAMP: this.state.timestamp
        };
    }
}

// Globalna instancja
const zordonState = new ZordonState();

// Eksportuj do window dla backward compatibility
if (typeof window !== 'undefined') {
    window.ZORDON_STATE = zordonState.getAll();
    
    // Metody globalne dla backward compatibility
    window.updateZORDON = (updates) => {
        zordonState.update(updates);
        window.ZORDON_STATE = zordonState.getAll();
    };
    
    window.getZORDON = (key) => zordonState.get(key);
    
    window.resetZORDON = () => {
        zordonState.reset();
        window.ZORDON_STATE = zordonState.getAll();
    };
    
    // Synchronizuj zmiany
    zordonState.addListener(() => {
        window.ZORDON_STATE = zordonState.getAll();
    });
}

// Export for ES6 modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ZordonState;
}

console.log('🧠 ZORDON_STATE system loaded successfully');