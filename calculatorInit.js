// === FILE: calculatorInit.js ===
// 🧠 Obsługuje: Inicjalizacja kalkulatora TOP-INSTAL z fix dla podwójnych wywołań API
// FIX: Usunięto live debug system powodujący duplikację wywołań buildJsonData()

(function () {
    'use strict';

    let calculatorInitialized = false;
    let isAPICallInProgress = false;

    /**
     * Sprawdza czy strona zawiera elementy kalkulatora
     */
    function hasCalculatorElements() {
        return document.querySelector("#top-instal-calc") !== null;
    }

    if (!hasCalculatorElements()) {
        console.log('❌ Brak elementów kalkulatora na stronie - przerwanie inicjalizacji');
        return;
    }

    /**
     * Ulepszona animacja AI Analysis z loading screen
     */
    function simulateAIAnalysis(tabIndex, steps, callback) {
        console.log(`🤖 Rozpoczęcie analizy AI dla zakładki ${tabIndex}`);

        let currentStep = 0;
        const progressElement = document.createElement('div');
        progressElement.className = 'ai-analysis-overlay';
        progressElement.innerHTML = `
            <div class="ai-analysis-content">
                <div class="ai-spinner"></div>
                <h3 style="font-size: 12px;">TOP-AI ANALIZUJE DANE</h3>
                <p id="ai-step-text">${steps[0]?.text || 'Przygotowuję analizę...'}</p>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: 0%"></div>
                </div>
            </div>
        `;

        // Dodaj style CSS jeśli nie istnieją
        if (!document.querySelector('#ai-analysis-styles')) {
            const style = document.createElement('style');
            style.id = 'ai-analysis-styles';
            style.textContent = `
                .ai-analysis-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.8);
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    z-index: 10000;
                    backdrop-filter: blur(5px);
                }
                .ai-analysis-content {
                    background: white;
                    border-radius: 16px;
                    padding: 40px;
                    text-align: center;
                    max-width: 500px;
                    width: 90%;
                    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
                }
                .ai-spinner {
                    width: 60px;
                    height: 60px;
                    border: 4px solid rgba(153, 0, 19, 0.2);
                    border-top: 4px solid #990013;
                    border-radius: 50%;
                    animation: spin 2s linear infinite;
                    margin: 0 auto 20px;
                }
                .progress-bar {
                    width: 100%;
                    height: 8px;
                    background: rgba(153, 0, 19, 0.1);
                    border-radius: 4px;
                    overflow: hidden;
                    margin-top: 20px;
                }
                .progress-fill {
                    height: 100%;
                    background: linear-gradient(90deg, #990013, #ff4757);
                    border-radius: 4px;
                    transition: width 0.5s ease-in-out;
                }
                @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(progressElement);

        function nextStep() {
            if (currentStep < steps.length) {
                const step = steps[currentStep];
                const stepText = document.getElementById('ai-step-text');
                const progressFill = progressElement.querySelector('.progress-fill');

                if (stepText) stepText.textContent = step.text;
                if (progressFill) {
                    const progress = ((currentStep + 1) / steps.length) * 100;
                    progressFill.style.width = `${progress}%`;
                }

                currentStep++;
                setTimeout(nextStep, step.delay || 1000);
            } else {
                setTimeout(() => {
                    progressElement.remove();
                    if (callback) callback();
                }, 500);
            }
        }

        nextStep();
    }

    /**
     * Globalne przechowywanie event listenerów
     */
    const calculatorEventListeners = new Map();

    /**
     * Czyszczenie starych event listenerów
     */
    function cleanupCalculatorEvents() {
        calculatorEventListeners.forEach((listeners, element) => {
            listeners.forEach(({ event, handler }) => {
                element.removeEventListener(event, handler);
            });
        });
        calculatorEventListeners.clear();
    }

    /**
     * Dodawanie event listenera z śledzeniem
     */
    function addCalculatorEventListener(element, event, handler) {
        if (!element) return;

        element.removeEventListener(event, handler);
        element.addEventListener(event, handler);

        if (!calculatorEventListeners.has(element)) {
            calculatorEventListeners.set(element, []);
        }
        calculatorEventListeners.get(element).push({ event, handler });
    }

    /**
     * Reset stanu kalkulatora
     */
    function resetCalculatorState() {
        cleanupCalculatorEvents();

        if (typeof window.resetResultsSection === 'function') {
            window.resetResultsSection();
        }

        window.lastCalculationResult = null;
        window.currentTab = 0;
        isAPICallInProgress = false;

        try {
            localStorage.removeItem('temp_calc_data');
        } catch (error) {
            console.warn('Błąd czyszczenia localStorage:', error);
        }
    }

    /**
     * Główna funkcja inicjalizacji kalkulatora TOP-INSTAL
     */
    function initTopInstalCalculator() {
        if (calculatorInitialized) {
            console.warn('Kalkulator już zainicjalizowany - pomijam');
            return;
        }

        resetCalculatorState();

        const sections = document.querySelectorAll("#top-instal-calc .section");
        if (!sections.length) {
            console.error('❌ Nie znaleziono sekcji kalkulatora');
            return;
        }

        window.sections = sections;
        window.currentTab = 0;

        if (typeof window.showTab !== 'function') {
            console.error('❌ Funkcja showTab nie jest dostępna');
            return;
        }

        window.showTab(0);
        calculatorInitialized = true;

        function setupStepButton(className, tabIndex, steps, nextTabIndex) {
            const btn = document.querySelector(`.${className}`);
            if (!btn) {
                console.warn(`❌ Nie znaleziono przycisku: .${className}`);
                return;
            }

            const newBtn = btn.cloneNode(true);
            btn.parentNode.replaceChild(newBtn, btn);

            const clickHandler = (e) => {
                e.preventDefault();
                e.stopPropagation();

                simulateAIAnalysis(tabIndex, steps, () => {
                    window.showTab(nextTabIndex);

                    if (typeof window.activateTooltips === 'function') {
                        setTimeout(window.activateTooltips, 100);
                    }
                });
            };

            addCalculatorEventListener(newBtn, 'click', clickHandler);
        }

       function setupFinishButtonWithAPI(className, tabIndex, steps, resultTabIndex = 6) {
    const btn = document.querySelector(`.${className}`);
    if (!btn) {
        console.warn(`❌ Nie znaleziono przycisku: .${className}`);
        return;
    }

    const newBtn = btn.cloneNode(true);
    btn.parentNode.replaceChild(newBtn, btn);

    const proxyUrl = '/api/cieplo/calculate';
    const clickHandler = (e) => {
        e.preventDefault();
        e.stopPropagation();

        if (isAPICallInProgress) {
            console.log('⚠️ Wywołanie API już w toku - pomijam');
            return;
        }

        isAPICallInProgress = true;
        newBtn.disabled = true;
        newBtn.style.opacity = '0.6';

        simulateAIAnalysis(tabIndex, steps, () => {
            if (typeof window.buildJsonData !== 'function') {
                console.error('❌ Funkcja buildJsonData nie jest dostępna');
                if (typeof window.userAlert === 'function') {
                    window.userAlert('Błąd: Funkcja buildJsonData nie została załadowana', 'error');
                } else {
                    alert('Błąd: Funkcja buildJsonData nie została załadowana');
                }
                isAPICallInProgress = false;
                newBtn.disabled = false;
                newBtn.style.opacity = '1';
                return;
            }

            let jsonData;
            try {
                jsonData = window.buildJsonData();
                console.log("📦 Payload do cieplo.app:", JSON.stringify(jsonData, null, 2));
                window.lastSentPayload = jsonData;
            } catch (error) {
                console.error('❌ Błąd buildJsonData:', error);
                if (typeof window.userAlert === 'function') {
                    window.userAlert('Błąd podczas przygotowywania danych do wysłania', 'error');
                } else {
                    alert('Błąd podczas przygotowywania danych do wysłania');
                }
                isAPICallInProgress = false;
                newBtn.disabled = false;
                newBtn.style.opacity = '1';
                return;
            }

            [
                'r-total-area', 'r-heated-area', 'r-temp', 'r-max-power',
                'r-bi-power', 'r-avg-power', 'r-cwu', 'r-temp-avg',
                'r-energy', 'r-factor', 'r-power-factor'
            ].forEach(id => {
                const el = document.getElementById(id);
                if (el) el.innerText = "...";
            });

            if (typeof window.clearValidationErrors === 'function') {
                window.clearValidationErrors();
            }

            async function callCieplo(payload) {
                try {
                    console.log('🚀 Wysyłam zapytanie do API...');

                    console.log('📤 Sending to API endpoint:', proxyUrl);
                    const response = await fetch(proxyUrl, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-Requested-With': 'XMLHttpRequest'
                        },
                        body: JSON.stringify(payload),
                        signal: AbortSignal.timeout(25000)
                    });

                    if (typeof window.showTab === 'function') {
                        window.showTab(resultTabIndex);
                        console.log(`🚀 Przejście do zakładki wyników ${resultTabIndex}`);
                    }

                    let data;
                    try {
                        data = await response.json();
                        console.log(`📥 Otrzymano odpowiedź z API (status ${response.status}):`, data);
                    } catch (jsonError) {
                        console.error('❌ Błąd parsowania JSON odpowiedzi:', jsonError);
                        throw new Error(`Serwer zwrócił nieprawidłową odpowiedź (status ${response.status})`);
                    }

                    if (data.errors && Object.keys(data.errors).length > 0) {
                        let errorMessage = "❌ Błędy walidacji:\n\n";
                        Object.entries(data.errors).forEach(([field, message]) => {
                            errorMessage += `• ${field}: ${message}\n`;
                        });

                        if (typeof window.userAlert === 'function') {
                            window.userAlert(errorMessage, 'error');
                        } else {
                            alert(errorMessage);
                        }

                        Object.keys(data.errors).forEach(fieldName => {
                            const field = document.querySelector(`[name="${fieldName}"]`) ||
                                document.querySelector(`[name="${fieldName}[material]"]`) ||
                                document.querySelector(`[name="${fieldName}[size]"]`);
                            if (field) {
                                field.style.border = '2px solid #ff4444';
                                field.style.backgroundColor = '#ffe6e6';
                            }
                        });

                        return {
                            success: false,
                            status: response.status,
                            errors: data.errors,
                            data: data
                        };
                    }

                    const resultData = data.result || (
                        data.max_heating_power && data.total_area ? data : null
                    );

                    if (resultData) {
                        console.log('✅ Otrzymano wynik z API (bezpośrednio lub przez ID)');
                        window.lastCalculationResult = resultData;

                        setTimeout(() => {
                            if (typeof window.displayResults === 'function') {
                                window.displayResults(resultData);
                            } else {
                                console.error('❌ Funkcja displayResults nie jest dostępna');
                                displayBasicResults(resultData);
                            }
                        }, 500);

                        return {
                            success: true,
                            status: response.status,
                            result: resultData,
                            data: data
                        };
                    }

                    if (data.id) {
                        console.log('🔄 Otrzymano ID do pollingu:', data.id);
                        return {
                            success: false,
                            status: response.status,
                            message: 'Otrzymano ID - polling niezaimplementowany',
                            data: data
                        };
                    }

                    console.warn('⚠️ API nie zwróciło ani wyników, ani ID:', data);
                    return {
                        success: false,
                        status: response.status,
                        message: `API nie zwróciło wyniku (status ${response.status})`,
                        data: data
                    };

                } catch (error) {
                    console.error('❌ Błąd zapytania API:', error);

                    if (error.message.includes('Failed to fetch') || error.message.includes('NetworkError')) {
                        if (typeof window.userAlert === 'function') {
                            window.userAlert('Błąd połączenia z serwerem. Sprawdź połączenie internetowe.', 'error');
                        } else {
                            alert(`❌ Błąd połączenia z serwerem.\nSprawdź połączenie internetowe.`);
                        }
                    } else {
                        if (typeof window.userAlert === 'function') {
                            window.userAlert(`Nie udało się pobrać wyników. Błąd: ${error.message}`, 'error');
                        } else {
                            alert(`❌ Nie udało się pobrać wyników.\nBłąd: ${error.message}`);
                        }
                    }

                    return {
                        success: false,
                        status: 0,
                        error: error.message,
                        networkError: true
                    };
                } finally {
                    isAPICallInProgress = false;
                    newBtn.disabled = false;
                    newBtn.style.opacity = '1';
                }
            }

            function displayBasicResults(result) {
                const resultElements = {
                    'r-total-area': `${result.total_area || result.heated_area || 0} m²`,
                    'r-heated-area': `${result.heated_area || 0} m²`,
                    'r-temp': `${result.design_outdoor_temperature || -20} °C`,
                    'r-max-power': `${result.max_heating_power || 0} kW`,
                    'r-cwu': `${result.hot_water_power || 0} kW`,
                    'r-bi-power': `${result.bivalent_point_heating_power || 0} kW`,
                    'r-avg-power': `${result.avg_heating_power || 0} kW`,
                    'r-temp-avg': `${result.avg_outdoor_temperature || 8} °C`,
                    'r-energy': `${Math.round(result.annual_energy_consumption || 0)} kWh`,
                    'r-factor': `${result.annual_energy_consumption_factor || 0}`,
                    'r-power-factor': `${result.heating_power_factor || 0}`
                };

                Object.entries(resultElements).forEach(([id, value]) => {
                    const element = document.getElementById(id);
                    if (element) {
                        element.textContent = value;
                    }
                });

                console.log('✅ Podstawowe wyniki wyświetlone (fallback)');
            }

            callCieplo(jsonData).then(result => {
                if (result.success) {
                    console.log('✅ Obliczenia zakończone pomyślnie');
                } else if (result.errors) {
                    console.log('⚠️ API zwróciło błędy walidacji - formularz wymaga poprawy');
                } else if (result.networkError) {
                    console.error('❌ Błąd sieciowy');
                } else {
                    console.warn('⚠️ Nieoczekiwana odpowiedź API:', result);
                }
            }).catch(err => {
                console.error('❌ Błąd końcowy:', err);
                const resultsSection = document.getElementById('results-section');
                if (resultsSection) {
                    resultsSection.innerHTML = `
                        <div style="text-align: center; color: #dc3545; padding: 20px;">
                            <h3>❌ Wystąpił błąd</h3>
                            <p>Nie udało się pobrać wyników. Spróbuj ponownie.</p>
                        </div>
                    `;
                }
            });
        });
    };

    newBtn.addEventListener('click', clickHandler);
}

        // Setup first tab navigation
        function setupFirstTabNavigation() {
            const btnNext1 = document.querySelector('.btn-next1');
            if (!btnNext1) {
                console.error('❌ Nie znaleziono przycisku .btn-next1');
                return;
            }

            const newBtn = btnNext1.cloneNode(true);
            btnNext1.parentNode.replaceChild(newBtn, btnNext1);

            const clickHandler = function(e) {
                e.preventDefault();
                e.stopPropagation();

                const requiredFields = [
                    'building_type', 'construction_year', 'location_id'
                ];

                let isValid = true;
                for (const fieldName of requiredFields) {
                    const field = document.querySelector(`[name="${fieldName}"]`);
                    if (!field || !field.value.trim()) {
                        console.warn(`❌ Pole ${fieldName} jest puste`);
                        isValid = false;
                        break;
                    }
                }

                if (!isValid) {
                    if (typeof window.userAlert === 'function') {
                        window.userAlert('Proszę wypełnić wszystkie wymagane pola', 'warning');
                    } else {
                        alert('Proszę wypełnić wszystkie wymagane pola');
                    }
                    return false;
                }

                newBtn.disabled = true;
                newBtn.style.opacity = '0.6';

                if (!window.sections || !window.sections.length) {
                    window.sections = document.querySelectorAll("#top-instal-calc .section");
                }

                try {
                    window.showTab(1);

                    if (typeof window.activateTooltips === 'function') {
                        setTimeout(window.activateTooltips, 100);
                    }
                } catch (error) {
                    console.error('Błąd przejścia do następnej zakładki:', error);
                    if (typeof window.userAlert === 'function') {
                        window.userAlert('Wystąpił błąd. Spróbuj ponownie.', 'error');
                    } else {
                        alert('Wystąpił błąd. Spróbuj ponownie.');
                    }
                } finally {
                    newBtn.disabled = false;
                    newBtn.style.opacity = '1';
                }

                return false;
            };

            addCalculatorEventListener(newBtn, 'click', clickHandler);
        }

        setupFirstTabNavigation();

        setupStepButton("btn-next2", 1, [
            { text: "Odczytuję wymiary budynku…", delay: 1200 },
            { text: "Uwzględniam obecność balkonów, garażu, piwnicy…", delay: 1600 },
            { text: "Obliczam kubaturę i wpływ na zapotrzebowanie cieplne…", delay: 1600 },
            { text: "Parametry zaakceptowane. Przechodzę do konstrukcji.", delay: 900 }
        ], 2);

        setupStepButton("btn-next3", 2, [
            { text: "Analizuję typ ścian oraz ich grubość…", delay: 1300 },
            { text: "Oceniam izolacyjność na podstawie materiałów budowlanych…", delay: 1600 },
            { text: "Konstrukcja spełnia kryteria. Przechodzę do okien i drzwi.", delay: 900 }
        ], 3);

        setupStepButton("btn-next4", 3, [
            { text: "Zapisuję parametry przeszkleń…", delay: 1000 },
            { text: "Uwaga na mostki cieplne – oceniam wpływ powierzchni okien i drzwi…", delay: 1400 },
            { text: "Straty przez stolarkę uwzględnione. Przechodzę dalej.", delay: 1000 }
        ], 4);

        setupStepButton("btn-next5", 4, [
            { text: "Analizuję izolację dachu/stropodachu oraz podłogi…", delay: 1100 },
            { text: "Współczynnik przenikania ciepła U - szukam odpowiedniej metody obliczeniowej", delay: 1100 },
            { text: "Współczynnik strat ciepła zaktualizowany.", delay: 900 },
            { text: "Za chwilę ostatni krok. Przechodzę dalej…", delay: 900 }
        ], 5);

        setupFinishButtonWithAPI("btn-finish", 5, [
            { text: "Zapisuję dane końcowe…", delay: 900 },
            { text: "Rozpoczynam analizę AI budynku…", delay: 1200 },
            { text: "Obliczam maksymalne zapotrzebowanie na moc grzewczą…", delay: 1100 },
            { text: "Uwzględniam CWU, jeśli zaznaczono…", delay: 900 },
            { text: "Dobieram pompę ciepła wg tabel Panasonic…", delay: 1600 },
            { text: "Dane gotowe. Generuję rekomendację pomp.", delay: 1200 }
        ], 6);

        // Obsługa przycisków "Wstecz"
        const backButtons = document.querySelectorAll("#top-instal-calc .btn-prev");
        backButtons.forEach(btn => {
            if (!btn) return;

            const backHandler = (e) => {
                e.preventDefault();
                e.stopPropagation();

                if (window.currentTab > 0) {
                    try {
                        window.showTab(window.currentTab - 1);
                    } catch (error) {
                        console.error('Błąd powrotu do poprzedniej zakładki:', error);
                    }
                }
            };

            addCalculatorEventListener(btn, 'click', backHandler);
        });

        // Inicjalizacja modułów
        try {
            if (typeof window.initFloorRenderingListeners === 'function') {
                window.initFloorRenderingListeners();
            } else if (typeof window.renderHeatedFloors === 'function') {
                window.renderHeatedFloors();
            }

            if (typeof window.setupDynamicFields === 'function') {
                window.setupDynamicFields();
            }

            if (typeof window.activateTooltips === 'function') {
                window.activateTooltips();
            }

            if (typeof window.initAIWatchers === 'function') {
                window.initAIWatchers();
            }

        } catch (error) {
            console.error('Błąd podczas inicjalizacji modułów:', error);
        }

        console.log('✅ Kalkulator zainicjalizowany pomyślnie');
    }

    /**
     * Główna inicjalizacja po załadowaniu DOM
     */
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(() => {
            console.log('🚀 Uruchamiam TOP-INSTAL Calculator v4.1');
            initTopInstalCalculator();
        }, 100);
    });

    // Fallback
    if (document.readyState !== 'loading') {
        setTimeout(() => {
            console.log('🚀 Uruchamiam TOP-INSTAL Calculator v4.1 (fallback)');
            initTopInstalCalculator();
        }, 100);
    }

    // Export funkcji
    window.initTopInstalCalculator = initTopInstalCalculator;

})();
