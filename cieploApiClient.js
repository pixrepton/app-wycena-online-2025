/**
 * cieplo.app API Client - Frontend integration
 * Zgodnie z dokumentacją README-WYCENA2025-v2.md
 */

class CieploApiClient {
    constructor() {
        this.baseURL = window.location.origin;
        this.timeout = 30000;
        this.debugMode = window.ZORDON_DEBUG || false;
        
        this.debug('CieploApiClient initialized');
    }

    debug(message, data = null) {
        if (this.debugMode) {
            console.log(`🌡️ CieploAPI: ${message}`, data || '');
        }
    }

    /**
     * Oblicz zapotrzebowanie na ciepło
     * @param {Object} buildingData - Dane budynku
     * @returns {Promise<Object>} Wyniki obliczeń
     */
    async calculateHeatingDemand(buildingData) {
        this.debug('Calculating heating demand', buildingData);
        
        try {
            const response = await fetch(`${this.baseURL}/api/cieplo/calculate`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(buildingData),
                signal: AbortSignal.timeout(this.timeout)
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const result = await response.json();
            this.debug('Calculation completed', result);

            // Aktualizuj ZORDON_STATE z wynikami
            if (window.updateZORDON && result.status === 'success') {
                window.updateZORDON({
                    mocObliczona: result.mocObliczona,
                    zapotrzebowanieRoczne: result.zapotrzebowanieRoczne,
                    wspolczynnikEU: result.wspolczynnikEU,
                    calculationComplete: true
                });
            }

            return result;

        } catch (error) {
            this.debug('API error', error);
            return {
                status: 'error',
                error: error.message,
                mocObliczona: null
            };
        }
    }

    /**
     * Przygotuj dane z formularza dla API
     * @param {Object} formData - Dane z formularza
     * @returns {Object} Przygotowane dane
     */
    prepareCalculationData(formData) {
        return {
            powierzchnia: parseFloat(formData.heated_area) || 0,
            kodPocztowy: formData.postal_code || '00-000',
            typBudynku: formData.building_type || 'dom',
            ocieplenie: formData.insulation || 'standard',
            tempOgrzewania: parseFloat(formData.heating_temp) || 55,
            kondygnacje: parseInt(formData.floors) || 1,
            piwnica: formData.basement === 'true' || formData.basement === true,
            dach: formData.roof_type || 'flat',
            okna: formData.windows || 'standard',
            wentylacja: formData.ventilation || 'natural'
        };
    }

    /**
     * Sprawdź status serwisu cieplo.app
     * @returns {Promise<Object>} Status serwisu
     */
    async checkHealthStatus() {
        try {
            const response = await fetch(`${this.baseURL}/api/cieplo/health`, {
                method: 'GET',
                signal: AbortSignal.timeout(10000) // Krótszy timeout dla health check
            });

            if (!response.ok) {
                throw new Error(`Health check failed: ${response.status}`);
            }

            const status = await response.json();
            this.debug('Health check result', status);
            return status;

        } catch (error) {
            this.debug('Health check error', error);
            return {
                status: 'unhealthy',
                error: error.message
            };
        }
    }

    /**
     * Oblicz mocę pompy na podstawie danych ZORDON_STATE
     * @returns {Promise<Object>} Wyniki obliczeń
     */
    async calculateFromZordonState() {
        const zordonData = window.ZORDON_STATE || {};
        
        const buildingData = {
            powierzchnia: zordonData.powierzchnia,
            kodPocztowy: zordonData.kodPocztowy || '00-000',
            typBudynku: zordonData.typBudynku || 'dom',
            kondygnacje: zordonData.kondygnacje || 1,
            piwnica: zordonData.piwnica || false,
            dach: zordonData.dach || 'flat'
        };

        this.debug('Calculating from ZORDON_STATE', buildingData);
        return this.calculateHeatingDemand(buildingData);
    }

    /**
     * Integracja z istniejącym systemem formDataProcessor
     * @param {string} mode - Tryb kalkulacji
     * @returns {Promise<Object>} Wyniki
     */
    async integrateWithFormProcessor(mode = 'tryb1') {
        // Pobierz dane z istniejącego formDataProcessor jeśli dostępne
        if (window.buildJsonData && typeof window.buildJsonData === 'function') {
            try {
                const formData = window.buildJsonData();
                const preparedData = this.prepareCalculationData(formData);
                return await this.calculateHeatingDemand(preparedData);
            } catch (error) {
                this.debug('Form processor integration error', error);
                return {
                    status: 'error',
                    error: 'Błąd integracji z procesorem formularza'
                };
            }
        }

        // Fallback - użyj ZORDON_STATE
        return this.calculateFromZordonState();
    }
}

// Globalna instancja
window.CieploApiClient = new CieploApiClient();

// Funkcje pomocnicze dla backward compatibility
window.calculateHeatingDemand = async (data) => {
    return window.CieploApiClient.calculateHeatingDemand(data);
};

window.checkCieploHealth = async () => {
    return window.CieploApiClient.checkHealthStatus();
};

// Export for ES6
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CieploApiClient;
}

console.log('🌡️ CieploApiClient loaded successfully');