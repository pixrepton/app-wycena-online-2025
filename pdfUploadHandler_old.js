// ===== PDF Upload Handler for AI Analysis =====
// Handles file upload, validation, and AI analysis for Mode 2

function initializePDFUploadHandler() {
    console.log('🤖 Initializing PDF Upload Handler for AI Analysis...');

    // Add event listeners for all mode forms
    for (let mode = 2; mode <= 4; mode++) {
        setupModeValidation(mode);
    }

    // Add drag & drop for PDF upload in Mode 2
    const pdfUploadArea = document.getElementById('pdf-upload-area-mode2');
    const pdfFileInput = document.getElementById('pdf-file-input-mode2');
    const analyzeBtn = document.getElementById('analyze-with-ai-mode2');

    if (pdfUploadArea && pdfFileInput) {
        // Drag & Drop handlers
        pdfUploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            pdfUploadArea.classList.add('drag-over');
        });

        pdfUploadArea.addEventListener('dragleave', (e) => {
            e.preventDefault();
            pdfUploadArea.classList.remove('drag-over');
        });

        pdfUploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            pdfUploadArea.classList.remove('drag-over');

            const files = e.dataTransfer.files;
            if (files.length > 0) {
                pdfFileInput.files = files;
                handleFileSelection(files[0]);
            }
        });

        // Click to select file
        pdfUploadArea.addEventListener('click', () => {
            pdfFileInput.click();
        });

        // File input change
        pdfFileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                handleFileSelection(e.target.files[0]);
            }
        });
    }

    // Mode 2 PDF upload setup - integrated with main HTML handlers
    console.log('✅ PDF Upload Handler initialized - integrated with main HTML event system');
}

function setupModeValidation(mode) {
    const form = document.getElementById(`form-mode${mode}`);
    if (!form) return;

    const postalCode = form.querySelector('[name="postal_code"]');
    const buildingTypeInputs = form.querySelectorAll('[name="building_type"]');
    const heatPumpPurposeInputs = form.querySelectorAll('[name="heat_pump_purpose"]');
    const submitBtn = form.querySelector('.continue-btn');
    const pdfFile = mode === 2 ? form.querySelector('#pdf-file-input-mode2') : null;

    function validateForm() {
        // Check postal code (Polish format: 00-000)
        const postalCodeValid = postalCode && /^\d{2}-\d{3}$/.test(postalCode.value);

        // Check building type selection
        const buildingType = Array.from(buildingTypeInputs).find(input => input.checked)?.value;

        // Check heat pump purpose selection
        const heatPumpPurpose = Array.from(heatPumpPurposeInputs).find(input => input.checked)?.value;

        // For Mode 2, also check PDF file
        const isValid = postalCodeValid && 
                       buildingType && 
                       heatPumpPurpose && 
                       (mode !== 2 || (pdfFile && pdfFile.files.length > 0));

        if (submitBtn) {
            submitBtn.disabled = !isValid;
        } else {
            console.warn(`Submit button not found for mode ${mode}`);
        }

        return isValid;
    }

    // Add event listeners
    if (postalCode) {
        postalCode.addEventListener('input', validateForm);
        postalCode.addEventListener('change', validateForm);
    }

    buildingTypeInputs.forEach(input => {
        input.addEventListener('change', validateForm);
    });

    heatPumpPurposeInputs.forEach(input => {
        input.addEventListener('change', validateForm);
    });

    if (pdfFile) {
        pdfFile.addEventListener('change', validateForm);
    }

    // Initial validation
    validateForm();
}

function validateSingleMode(mode) {
    // For Mode 2, it goes directly to calculator, not preliminary form
    if (mode === 2) {
        const pdfFile = document.getElementById('pdf-file-input-mode2');
        const submitBtn = document.getElementById('analyze-with-ai-mode2');

        const isValid = pdfFile?.files?.length > 0;

        if (submitBtn) {
            submitBtn.disabled = !isValid;
        } else {
            console.warn(`Submit button not found for mode ${mode}`);
        }
        return;
    }

    // For other modes, use original logic
    const form = document.getElementById(`welcome-form-mode${mode}`);
    if (!form) return false;

    const postalCode = form.querySelector('[name="postal_code"]');
    const buildingTypeInputs = form.querySelectorAll('[name="building_type"]');
    const heatPumpPurposeInputs = form.querySelectorAll('[name="heat_pump_purpose"]');
    const submitBtn = form.querySelector('.continue-btn');

    // Check postal code (Polish format: 00-000)
    const postalCodeValid = postalCode && /^\d{2}-\d{3}$/.test(postalCode.value);

    // Check building type selection
    const buildingType = Array.from(buildingTypeInputs).find(input => input.checked)?.value;

    // Check heat pump purpose selection  
    const heatPumpPurpose = Array.from(heatPumpPurposeInputs).find(input => input.checked)?.value;

    const isValid = postalCodeValid && buildingType && heatPumpPurpose;

    if (submitBtn) {
        submitBtn.disabled = !isValid;
    } else {
        console.warn(`Submit button not found for mode ${mode}`);
    }
}

function handleFileSelection(file) {
    console.log(`📄 File selected: ${file.name} (${formatFileSize(file.size)})`);

    // Validate file
    if (file.type !== 'application/pdf') {
        if (typeof window.userAlert === 'function') {
            window.userAlert('Dozwolone są tylko pliki PDF', 'error');
        } else {
            alert('Dozwolone są tylko pliki PDF');
        }
        return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
        if (typeof window.userAlert === 'function') {
            window.userAlert('Plik jest za duży. Maksymalny rozmiar to 10MB', 'error');
        } else {
            alert('Plik jest za duży. Maksymalny rozmiar to 10MB');
        }
        return;
    }

    // Update UI
    const uploadArea = document.getElementById('pdf-upload-area-mode2');
    const analyzeBtn = document.getElementById('analyze-with-ai-mode2');

    uploadArea.innerHTML = `
        <div class="upload-content">
            <i class="fas fa-file-pdf upload-icon" style="color: #dc2626;"></i>
            <p class="upload-text">Wybrano: ${file.name}</p>
            <p class="upload-subtext">Rozmiar: ${formatFileSize(file.size)}</p>
        </div>
    `;

    uploadArea.classList.add('file-selected');

    if (analyzeBtn) {
        analyzeBtn.disabled = false;
        analyzeBtn.innerHTML = '<i class="fas fa-magic"></i> Analizuj projekt z AI';
    }

    // Trigger form validation
    validateSingleMode(2);
}

function checkPDFServiceStatus() {
    return fetch('/api/health')
        .then(response => response.json())
        .then(data => {
            console.log('📊 PDF Service Status:', data);
            return data;
        })
        .catch(error => {
            console.error('❌ Failed to check PDF service status:', error);
            return null;
        });
}

function analyzeProjectWithAI(file) {
    console.log('🤖 Starting AI analysis of project PDF...');

    // First, check if the service is available
    checkPDFServiceStatus().then(status => {
        if (status && !status.pdf_analyzer) {
            console.error('❌ PDF Analyzer not available:', status);
            if (typeof window.userAlert === 'function') {
                window.userAlert('Serwis analizy AI nie jest skonfigurowany. Skontaktuj się z administratorem.', 'error');
            } else {
                alert('Serwis analizy AI nie jest skonfigurowany. Skontaktuj się z administratorem.');
            }
            return;
        }

        // Proceed with analysis
        performPDFAnalysis(file);
    });
}

function performPDFAnalysis(file) {

    console.log('🔄 Performing PDF analysis...');

    const progressSection = document.getElementById('upload-progress-mode2');
    const resultsSection = document.getElementById('ai-analysis-results-mode2');
    const progressFill = document.getElementById('progress-fill-mode2');
    const progressText = document.getElementById('progress-text-mode2');
    const analyzeBtn = document.getElementById('analyze-with-ai-mode2');

    // Show progress
    if (progressSection) {
        progressSection.classList.remove('hidden');
    }
    if (resultsSection) {
        resultsSection.classList.add('hidden');
    }

    // Disable button
    if (analyzeBtn) {
        analyzeBtn.disabled = true;
        analyzeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analizowanie...';
    }

    // Simulate progress
    let progress = 0;
    const progressInterval = setInterval(() => {
        progress += Math.random() * 15;
        if (progress > 90) progress = 90;
        if (progressFill) {
            progressFill.style.width = progress + '%';
        }
        if (progressText) {
            progressText.textContent = `Analizowanie projektu... ${Math.round(progress)}%`;
        }
    }, 200);

    // Prepare form data
    const formData = new FormData();
    formData.append('file', file);

    // Send to AI analysis API
    fetch('/api/analyze-pdf', {
        method: 'POST',
        body: formData
    })
    .then(response => {
        console.log(`📡 Response status: ${response.status}`);
        if (!response.ok) {
            return response.json().then(err => {
                console.error('❌ API Error Response:', err);
                return Promise.reject(err);
            });
        }
        return response.json();
    })
    .then(data => {
        clearInterval(progressInterval);
        if (progressFill) {
            progressFill.style.width = '100%';
        }
        if (progressText) {
            progressText.textContent = 'Analiza zakończona!';
        }

        console.log('🎉 Full API Response:', data);

        // Check if the response indicates success
        if (data.status === 'success' && data.data) {
            console.log('✅ AI analysis completed successfully');
            console.log('🔄 Processing AI results and proceeding to calculator system');

            setTimeout(() => {
                if (progressSection) {
                    progressSection.classList.add('hidden');
                }

                // Display analysis results and enable next steps
                displayPDFAnalysisResults(data.data);

            }, 1000);

        } else if (data.status === 'error') {
            console.error('❌ API returned error status:', data);
            setTimeout(() => {
                if (progressSection) {
                    progressSection.classList.add('hidden');
                }
                displayAnalysisError(data.error || 'Nie udało się przeanalizować projektu PDF');

            }, 1000);

        } else {
            console.error('❌ Unexpected response format:', data);
            setTimeout(() => {
                if (progressSection) {
                    progressSection.classList.add('hidden');
                }
                displayAnalysisError('Otrzymano nieoczekiwaną odpowiedź z serwera');

            }, 1000);
        }

        // Re-enable button after processing
        if (analyzeBtn) {
            analyzeBtn.disabled = false;
            analyzeBtn.innerHTML = '<i class="fas fa-magic"></i> Analizuj ponownie';
        }

        console.log('✅ AI analysis completed successfully');
    })
    .catch(error => {
        clearInterval(progressInterval);
        console.error('❌ AI analysis failed:', error);
        
        if (progressSection) {
            progressSection.classList.add('hidden');
        }
        
        // Re-enable button
        if (analyzeBtn) {
            analyzeBtn.disabled = false;
            analyzeBtn.innerHTML = '<i class="fas fa-magic"></i> Spróbuj ponownie';
        }
        
        // Display error
        displayAnalysisError(error.message || 'Nie udało się połączyć z serwisem analizy AI');
    });
}

function displayPDFAnalysisResults(data) {
    console.log('📊 Displaying PDF analysis results:', data);
    
    const resultsSection = document.getElementById('ai-analysis-results-mode2');
    if (!resultsSection) {
        console.error('❌ Results section not found');
        return;
    }
    
    // Update ZORDON_STATE with AI results
    if (window.updateZORDON) {
        window.updateZORDON({
            powierzchnia: data.powierzchnia || null,
            eu: data.eu || null,
            mocSzacowana: data.mocSzacowana || null,
            aiAnalysisCompleted: true,
            aiResults: data
        });
    }
    
    // Generate results HTML
    const resultsHTML = `
        <div class="ai-results-container">
            <div class="ai-results-header">
                <i class="fas fa-robot"></i>
                <h3>Wyniki Analizy AI</h3>
            </div>
            <div class="ai-results-content">
                <div class="result-item">
                    <span class="result-label">Powierzchnia ogrzewana:</span>
                    <span class="result-value">${data.powierzchnia || 'Nie wykryto'} m²</span>
                </div>
                <div class="result-item">
                    <span class="result-label">Standard energetyczny:</span>
                    <span class="result-value">${data.eu || 'Nie wykryto'}</span>
                </div>
                <div class="result-item">
                    <span class="result-label">Szacowana moc:</span>
                    <span class="result-value">${data.mocSzacowana || 'Nie obliczono'} kW</span>
                </div>
            </div>
            <div class="ai-results-actions">
                <button type="button" class="btn-continue-ai" onclick="proceedToMode2Calculator()">
                    <i class="fas fa-calculator"></i>
                    Przejdź do kalkulatora
                </button>
            </div>
        </div>
    `;
    
    resultsSection.innerHTML = resultsHTML;
    resultsSection.classList.remove('hidden');
}

function displayAnalysisError(errorMessage) {
    console.error('📊 Displaying analysis error:', errorMessage);
    
    const resultsSection = document.getElementById('ai-analysis-results-mode2');
    if (!resultsSection) {
        console.error('❌ Results section not found');
        return;
    }
    
    const errorHTML = `
        <div class="ai-error-container">
            <div class="ai-error-header">
                <i class="fas fa-exclamation-triangle"></i>
                <h3>Błąd Analizy</h3>
            </div>
            <div class="ai-error-content">
                <p>${errorMessage}</p>
                <p>Możesz spróbować ponownie lub przejść do ręcznego wprowadzenia danych.</p>
            </div>
            <div class="ai-error-actions">
                <button type="button" class="btn-continue-manual" onclick="proceedToMode2Calculator()">
                    <i class="fas fa-edit"></i>
                    Wprowadź dane ręcznie
                </button>
            </div>
        </div>
    `;
    
    resultsSection.innerHTML = errorHTML;
    resultsSection.classList.remove('hidden');
}

function proceedToMode2Calculator() {
    console.log('🎯 Proceeding to Mode 2 calculator...');
    
    // Hide current sections
    const form = document.getElementById('form-mode2');
    if (form) {
        form.classList.add('hidden');
    }
    
    // Show Mode 2 calculator
    const calculator = document.getElementById('heatCalcMode2');
    if (calculator) {
        calculator.classList.remove('hidden');
        calculator.classList.add('active');
        console.log('✅ Mode 2 calculator displayed');
        
        // Initialize calculator if needed
        if (typeof window.initTopInstalCalculator === 'function') {
            window.initTopInstalCalculator();
        }
    } else {
        console.error('❌ Mode 2 calculator element not found');
    }
}
    .catch(error => {
        clearInterval(progressInterval);
        if (progressSection) {
            progressSection.classList.add('hidden');
        }

        console.error('❌ AI analysis failed:', error);

        if (typeof window.userAlert === 'function') {
            window.userAlert(`Błąd analizy PDF: ${error.error || error.message || 'Nieznany błąd'}`, 'error');
        } else {
            alert(`Błąd analizy PDF: ${error.error || error.message || 'Nieznany błąd'}`);
        }

        // Re-enable button
        if (analyzeBtn) {
            analyzeBtn.disabled = false;
            analyzeBtn.innerHTML = '<i class="fas fa-magic"></i> Spróbuj ponownie';
        }
    });
}

// Display PDF analysis results
function displayPDFAnalysisResults(analysisData) {
    console.log('📊 Displaying PDF analysis results:', analysisData);

    const resultsSection = document.getElementById('ai-analysis-results-mode2');
    if (!resultsSection) {
        console.error('❌ Results section not found');
        return;
    }

    // Extract analysis and heating calculation data
    const analysis = analysisData.analysis;
    const heating = analysisData.heating_calculation;

    if (!analysis || !heating) {
        displayAnalysisError('Brak danych analizy w odpowiedzi serwera');
        return;
    }

    // Create results HTML
    let resultsHTML = `
        <div class="ai-results-container">
            <div class="results-header">
                <h3><i class="fas fa-check-circle" style="color: #16a34a;"></i> Analiza PDF zakończona</h3>
                <p class="results-summary">${analysis.analysis_summary || 'Analiza projektu PDF zakończona pomyślnie'}</p>
            </div>

            <div class="analysis-data">
                <h4>🏠 Dane z projektu:</h4>
                <div class="data-grid">
    `;

    const foundData = analysis.found_data || {};
    const dataLabels = {
        powierzchnia_uzytkowa: 'Powierzchnia użytkowa',
        wskaznik_eu: 'Wskaźnik EU',
        lokalizacja: 'Lokalizacja',
        zapotrzebowanie_cieplo: 'Zapotrzebowanie na ciepło',
        moc_grzewcza: 'Moc grzewcza',
        temperatura_projektowa: 'Temperatura projektowa',
        rodzaj_budynku: 'Rodzaj budynku',
        standard_energetyczny: 'Standard energetyczny'
    };

    for (const [key, label] of Object.entries(dataLabels)) {
        const value = foundData[key];
        if (value !== null && value !== undefined) {
            const unit = getUnit(key);
            resultsHTML += `<div class="data-item">
                <span class="data-label">${label}:</span>
                <span class="data-value">${value}${unit}</span>
            </div>`;
        }
    }

    resultsHTML += `
                </div>
            </div>

            <div class="heating-calculation">
                <h4>🔥 Obliczenia grzewcze:</h4>
                <div class="calc-result">
                    <div class="power-result">
                        <span class="power-label">Obliczona moc:</span>
                        <span class="power-value">${heating.calculated_power || 'Brak danych'} kW</span>
                    </div>
                    <div class="method-info">
                        <span class="method-label">Metoda:</span>
                        <span class="method-value">${getMethodName(heating.method)}</span>
                    </div>
                    ${heating.formula ? `<div class="formula-info">
                        <span class="formula-label">Wzór:</span>
                        <span class="formula-value">${heating.formula}</span>
                    </div>` : ''}
                </div>
            </div>

            <div class="analysis-quality">
                <div class="quality-indicator quality-${analysis.data_quality}">
                    Jakość danych: ${getQualityName(analysis.data_quality)}
                </div>
                <div class="confidence-level">
                    Pewność analizy: ${Math.round((analysis.confidence_level || 0) * 100)}%
                </div>
            </div>

            <div class="action-buttons">
                <button id="proceed-to-calculator-mode2" class="btn btn-primary">
                    <i class="fas fa-calculator"></i> Przejdź do kalkulatora
                </button>
                <button id="analyze-again-mode2" class="btn btn-secondary" onclick="document.getElementById('analyze-with-ai-mode2').click()">
                    <i class="fas fa-redo"></i> Analizuj ponownie
                </button>
            </div>
        </div>
    `;

    resultsSection.innerHTML = resultsHTML;
    resultsSection.classList.remove('hidden');

    // Add event listener for proceed button
    const proceedBtn = document.getElementById('proceed-to-calculator-mode2');
    if (proceedBtn) {
        proceedBtn.onclick = () => proceedToCalculatorWithAIData(analysisData);
    }
}

// Display analysis error
function displayAnalysisError(errorMessage) {
    console.error('❌ Displaying analysis error:', errorMessage);

    const resultsSection = document.getElementById('ai-analysis-results-mode2');
    if (!resultsSection) {
        console.error('❌ Results section not found');
        return;
    }

    resultsSection.innerHTML = `
        <div class="ai-error-container">
            <div class="error-header">
                <h3><i class="fas fa-exclamation-triangle" style="color: #dc2626;"></i> Błąd analizy</h3>
                <p class="error-message">${errorMessage}</p>
            </div>

            <div class="error-suggestions">
                <h4>💡 Sugestie:</h4>
                <ul>
                    <li>Sprawdź czy plik PDF zawiera czytelny tekst</li>
                    <li>Upewnij się że to dokument projektowy budowlany</li>
                    <li>Spróbuj przesłać inny plik PDF</li>
                </ul>
            </div>

            <div class="action-buttons">
                <button id="retry-analysis-mode2" class="btn btn-primary" onclick="document.getElementById('analyze-with-ai-mode2').click()">
                    <i class="fas fa-retry"></i> Spróbuj ponownie
                </button>
                <button id="manual-entry-mode2" class="btn btn-secondary" onclick="proceedToManualEntry()">
                    <i class="fas fa-edit"></i> Wprowadź dane ręcznie
                </button>
            </div>
        </div>
    `;

    resultsSection.classList.remove('hidden');
}

// Helper functions
function getUnit(key) {
    const units = {
        powierzchnia_uzytkowa: ' m²',
        wskaznik_eu: ' kWh/m²·rok',
        zapotrzebowanie_cieplo: ' kWh/rok',
        moc_grzewcza: ' kW',
        temperatura_projektowa: '°C'
    };
    return units[key] || '';
}

function getMethodName(method) {
    const methods = {
        'direct_power': 'Moc bezpośrednia z projektu',
        'zordon_formula': 'Wzór Zordon (EU × Powierzchnia)',
        'area_estimation': 'Estymacja na podstawie powierzchni',
        'insufficient_data': 'Niewystarczające dane'
    };
    return methods[method] || method;
}

function getQualityName(quality) {
    const qualities = {
        'good': 'Dobra',
        'partial': 'Częściowa', 
        'insufficient': 'Niewystarczająca'
    };
    return qualities[quality] || quality;
}

// Proceed to calculator with AI data
function proceedToCalculatorWithAIData(analysisData) {
    console.log('🎯 Proceeding to calculator with AI data');

    // Store AI data for main calculator
    window.aiAnalysisData = analysisData;

    // Fill calculator fields with AI data if available
    const analysis = analysisData.analysis;
    const heating = analysisData.heating_calculation;

    if (analysis && analysis.found_data) {
        const data = analysis.found_data;

        // Fill available fields
        if (data.powierzchnia_uzytkowa) {
            const areaField = document.getElementById('area');
            if (areaField) areaField.value = data.powierzchnia_uzytkowa;
        }

        if (data.lokalizacja) {
            const locationField = document.getElementById('postalCode');
            if (locationField) locationField.value = data.lokalizacja;
        }
    }

    // Proceed to main calculator results with calculated power
    if (heating && heating.calculated_power) {
        // Create result object for main system
        const results = {
            calculatedPower: heating.calculated_power,
            method: 'ai_analysis',
            source: 'Analiza AI projektu PDF',
            aiData: analysisData
        };

        // Show main calculator and populate with results
        if (typeof window.renderResults === 'function') {
            window.renderResults(results);
        } else {
            console.log('📊 Main results system not available, staying in Mode 2');
        }
    }
}

// Proceed to manual entry
function proceedToManualEntry() {
    console.log('✏️ Proceeding to manual data entry');

    // Hide AI sections and show manual input form
    const aiSection = document.getElementById('ai-analysis-results-mode2');
    if (aiSection) aiSection.classList.add('hidden');

    // Focus on first manual input field
    const firstInput = document.querySelector('#heatCalcMode2 input[type="number"]');
    if (firstInput) firstInput.focus();
}

// New function to process AI results and integrate with main calculator
function processAIResultsAndProceed(analysisData) {
    console.log('🔄 Processing AI results and proceeding to calculator system');

    if (!analysisData || !analysisData.pdf_analysis) {
        if (typeof window.userAlert === 'function') {
            window.userAlert('Nie udało się przeanalizować projektu PDF', 'error');
        } else {
            alert('Nie udało się przeanalizować projektu PDF');
        }
        return;
    }

    const powerCalculation = analysisData.power_calculation;

    if (powerCalculation && powerCalculation.calculated_power) {
        // Create results object compatible with main calculator system
        const results = {
            calculatedPower: powerCalculation.calculated_power,
            annualDemand: powerCalculation.annual_demand || null,
            euValue: powerCalculation.eu_value || null,
            area: powerCalculation.area || null,
            method: 'ai_pdf_analysis',
            source: 'Analiza AI projektu PDF',
            calculation: powerCalculation.calculation_details || `AI przeanalizowało projekt i obliczyło moc: ${powerCalculation.calculated_power} kW`,
            note: 'Wyniki oparte na analizie AI dokumentu projektowego',
            analysisData: analysisData
        };

        // Store in global state
        window.appState = window.appState || {};
        window.appState.aiAnalysisResults = results;

        console.log('✅ AI results processed, delegating to main results system');

        // Delegate to main results system (from resultsRenderer.js or formDataProcessor.js)
        if (typeof proceedToExistingResults === 'function') {
            proceedToExistingResults(results, 'Analiza AI projektu PDF');
        } else if (typeof window.renderResults === 'function') {
            window.renderResults(results);
        } else {
            console.log('📊 Main results system not available, showing local results');
            displayAIResults(analysisData);
        }
    } else {
        if (typeof window.userAlert === 'function') {
            window.userAlert('AI nie mogło wyliczyć mocy na podstawie projektu. Spróbuj z innym plikiem.', 'warning');
        } else {
            alert('AI nie mogło wyliczyć mocy na podstawie projektu. Spróbuj z innym plikiem.');
        }

        // Still show the analysis results even if power calculation failed
        displayAIResults(analysisData);
    }
}

function displayAIResults(analysisData) {
    console.log('📊 Displaying AI analysis results:', analysisData);

    const resultsSection = document.getElementById('ai-analysis-results-mode2');
    const extractedDataDiv = document.getElementById('ai-extracted-data-mode2');

    if (!analysisData || !analysisData.pdf_analysis) {
        if (extractedDataDiv) {
            extractedDataDiv.innerHTML = '<p class="error">Nie udało się przeanalizować projektu</p>';
        }
        if (resultsSection) {
            resultsSection.classList.remove('hidden');
        }
        return;
    }

    const pdfAnalysis = analysisData.pdf_analysis;
    const powerCalculation = analysisData.power_calculation;
    const foundData = pdfAnalysis.found_data || {};

    let resultsHTML = '';

    // Analysis summary
    if (pdfAnalysis.analysis_summary) {
        resultsHTML += `
            <div class="data-item">
                <span class="data-label">📋 Podsumowanie analizy:</span>
                <span class="data-value">${pdfAnalysis.analysis_summary}</span>
            </div>
        `;
    }

    // Extracted data
    if (foundData.powierzchnia_uzytkowa) {
        resultsHTML += `
            <div class="data-item">
                <span class="data-label">🏠 Powierzchnia użytkowa:</span>
                <span class="data-value success">${foundData.powierzchnia_uzytkowa} m²</span>
            </div>
        `;
    }

    if (foundData.wskaznik_eu) {
        resultsHTML += `
            <div class="data-item">
                <span class="data-label">⚡ Wskaźnik EU:</span>
                <span class="data-value success">${foundData.wskaznik_eu} kWh/m²·rok</span>
            </div>
        `;
    }

    if (foundData.lokalizacja) {
        resultsHTML += `
            <div class="data-item">
                <span class="data-label">📍 Lokalizacja:</span>
                <span class="data-value success">${foundData.lokalizacja}</span>
            </div>
        `;
    }

    if (foundData.moc_grzewcza) {
        resultsHTML += `
            <div class="data-item">
                <span class="data-label">🔥 Moc grzewcza z projektu:</span>
                <span class="data-value success">${foundData.moc_grzewcza} kW</span>
            </div>
        `;
    }

    if (foundData.zapotrzebowanie_cieplo) {
        resultsHTML += `
            <div class="data-item">
                <span class="data-label">🏡 Zapotrzebowanie na ciepło:</span>
                <span class="data-value success">${foundData.zapotrzebowanie_cieplo} kWh/rok</span>
            </div>
        `;
    }

    // Power calculation results
    if (powerCalculation && powerCalculation.calculated_power) {
        resultsHTML += `
            <div class="data-item" style="border-left-color: #059669; background: #f0fdf4;">
                <span class="data-label">🎯 <strong>Obliczona moc pompy:</strong></span>
                <span class="data-value success" style="font-size: 1.2em;"><strong>${powerCalculation.calculated_power} kW</strong></span>
            </div>
        `;

        if (powerCalculation.calculation_details) {
            resultsHTML += `
                <div class="data-item">
                    <span class="data-label">🧮 Obliczenie:</span>
                    <span class="data-value">${powerCalculation.calculation_details}</span>
                </div>
            `;
        }

        if (powerCalculation.recommended_panasonic_model) {
            resultsHTML += `
                <div class="data-item" style="border-left-color: #c20118; background: #fef2f2;">
                    <span class="data-label">🏭 <strong>Zalecany model Panasonic:</strong></span>
                    <span class="data-value" style="color: #c20118; font-weight: bold;">${powerCalculation.recommended_panasonic_model}</span>
                </div>
            `;
        }
    }

    // Data quality and confidence
    if (pdfAnalysis.data_quality) {
        const qualityClass = pdfAnalysis.data_quality === 'good' ? 'success' : 
                            pdfAnalysis.data_quality === 'partial' ? 'warning' : 'error';
        const qualityText = pdfAnalysis.data_quality === 'good' ? 'Dobra' :
                           pdfAnalysis.data_quality === 'partial' ? 'Częściowa' : 'Niewystarczająca';

        resultsHTML += `
            <div class="data-item">
                <span class="data-label">📊 Jakość danych:</span>
                <span class="data-value ${qualityClass}">${qualityText}</span>
            </div>
        `;
    }

    if (pdfAnalysis.confidence_level) {
        const confidence = Math.round(pdfAnalysis.confidence_level * 100);
        const confidenceClass = confidence >= 80 ? 'success' : confidence >= 60 ? 'warning' : 'error';

        resultsHTML += `
            <div class="data-item">
                <span class="data-label">🎯 Pewność analizy:</span>
                <span class="data-value ${confidenceClass}">${confidence}%</span>
            </div>
        `;
    }

    // Additional notes
    if (pdfAnalysis.notes) {
        resultsHTML += `
            <div class="data-item">
                <span class="data-label">📝 Uwagi:</span>
                <span class="data-value">${pdfAnalysis.notes}</span>
            </div>
        `;
    }

    // Action buttons for AI results
    if (powerCalculation && powerCalculation.calculated_power) {
        resultsHTML += `
            <div class="ai-action-buttons" style="margin-top: 20px; text-align: center;">
                <button type="button" class="action-btn primary" onclick="useAIResults(${powerCalculation.calculated_power}, '${powerCalculation.method_used}')">
                    <i class="fas fa-check"></i> Użyj wyników AI (${powerCalculation.calculated_power} kW)
                </button>
            </div>
        `;
    }

    if (!resultsHTML) {
        resultsHTML = `
            <div class="data-item">
                <span class="data-label">❌ Brak danych:</span>
                <span class="data-value error">Nie udało się wyciągnąć danych z projektu</span>
            </div>
            <div class="ai-action-buttons" style="margin-top: 20px; text-align: center;">
                <button type="button" class="action-btn secondary" onclick="showManualInput()">
                    <i class="fas fa-edit"></i> Wprowadź dane ręcznie
                </button>
            </div>
        `;
    }

    if (extractedDataDiv) {
        extractedDataDiv.innerHTML = resultsHTML;
    }
    if (resultsSection) {
        resultsSection.classList.remove('hidden');
    }

    // Auto-fill manual inputs if possible
    if (foundData.powierzchnia_uzytkowa) {
        const projectAreaInput = document.getElementById('project_area');
        if (projectAreaInput) {
            projectAreaInput.value = foundData.powierzchnia_uzytkowa;
        }
    }
    if (foundData.wskaznik_eu) {
        const projectEuInput = document.getElementById('project_eu');
        if (projectEuInput) {
            projectEuInput.value = foundData.wskaznik_eu;
        }
    }
}

function useAIResults(calculatedPower, method) {
    console.log(`🎯 Using AI results: ${calculatedPower} kW (method: ${method})`);

    // Save AI results to global state
    window.appState = window.appState || {};
    window.appState.aiAnalysisResults = {
        power: calculatedPower,
        method: method,
        source: 'ai_pdf_analysis',
        timestamp: new Date().toISOString()
    };

    // Create results object in expected format
    const results = {
        calculatedPower: calculatedPower,
        method: 'ai_pdf_analysis',
        source: 'Analiza AI projektu PDF',
        calculation: `AI automatycznie przeanalizowało projekt i obliczyło moc: ${calculatedPower} kW`,
        note: 'Wyniki oparte na analizie AI dokumentu projektowego'
    };

    // Use existing results system
    if (typeof proceedToExistingResults === 'function') {
        proceedToExistingResults(results, 'Analiza AI projektu PDF');
    } else {
        // Fallback: show basic results
        showBasicAIResults(results);
    }
}

function showManualInput() {
    console.log('📝 Switching to manual input mode');

    const manualSection = document.getElementById('manual-input-section');
    if (manualSection) {
        manualSection.scrollIntoView({ behavior: 'smooth' });

        // Focus first input
        const firstInput = manualSection.querySelector('input');
        if (firstInput) {
            setTimeout(() => firstInput.focus(), 500);
        }
    }
}

function showBasicAIResults(results) {
    // Create a simple results display if advanced system not available
    const resultsHTML = `
        <div class="ai-final-results" style="background: #f0fdf4; border: 2px solid #059669; border-radius: 12px; padding: 20px; margin: 20px 0; text-align: center;">
            <h3 style="color: #059669; margin-bottom: 15px;">
                <i class="fas fa-check-circle"></i> Analiza AI zakończona!
            </h3>
            <div style="font-size: 1.5em; font-weight: bold; color: #1f2937; margin: 15px 0;">
                Zalecana moc pompy: ${results.calculatedPower} kW
            </div>
            <p style="color: #6b7280; margin: 10px 0;">${results.calculation}</p>
            <div style="margin-top: 20px;">
                <button type="button" class="action-btn primary" onclick="showWelcomeScreen()">
                    <i class="fas fa-calculator"></i> Nowe obliczenie
                </button>
            </div>
        </div>
    `;

    const mode2Section = document.getElementById('form-mode2');
    if (mode2Section) {
        mode2Section.innerHTML += resultsHTML;
    }
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Export for global use
window.PDFUploadHandler = {
    initializePDFUploadHandler,
    handleFileSelection,
    analyzeProjectWithAI,
    displayAIResults,
    useAIResults,
    showManualInput
};

console.log('📄 PDF Upload Handler module loaded successfully');

async function startAIPDFAnalysis() {
    console.log('🤖 Starting AI PDF Analysis...');

    // Get file from the input
    const fileInput = document.getElementById('pdf-file-input-mode2');
    const file = fileInput?.files?.[0];
    
    if (!file) {
        showError('Najpierw wybierz plik PDF');
        return;
    }

    // Delegate to existing function
    analyzeProjectWithAI(file);
}

function showLoadingState(show) {
    console.log('🔄 Loading state:', show);
}

function showError(message) {
    console.error('⚠️ Error:', message);
    if (typeof window.userAlert === 'function') {
        window.userAlert(message, 'error');
    } else {
        alert(message);
    }
}

// Export startAIPDFAnalysis for global use
window.startAIPDFAnalysis = startAIPDFAnalysis;

console.log('✅ PDF Upload Handler loaded successfully');

// Initialize immediately when loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializePDFUploadHandler);
} else {
    initializePDFUploadHandler();
}
