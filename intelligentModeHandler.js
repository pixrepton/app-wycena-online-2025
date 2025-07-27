/**
 * Intelligent Mode Handler - obsługa 4 ścieżek wejścia
 * Integracja z istniejącym systemem TOP-INSTAL
 */

// Initialize app state
window.appState = window.appState || {
    userMode: null,
    calculationData: {},
    results: {}
};

// Initialize mode handler when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    initializeIntelligentModeHandler();
    setupMode2FileHandler();
});

function initializeIntelligentModeHandler() {
    console.log('🚀 Initializing Intelligent Mode Handler...');
    
    // Bind welcome screen buttons
    document.querySelectorAll('.welcome-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const mode = btn.dataset.mode;
            switchToMode(mode);
        });
    });
    
    // Bind calculation buttons for each mode
    bindModeCalculationButtons();
    
    console.log('✅ Intelligent Mode Handler initialized');
}

function bindModeCalculationButtons() {
    // Mode 2: Project data calculation
    const mode2Btn = document.getElementById('calculate-mode2');
    if (mode2Btn) {
        mode2Btn.addEventListener('click', calculateMode2);
    }
    
    // Mode 3: Energy audit calculation
    const mode3Btn = document.getElementById('calculate-mode3');
    if (mode3Btn) {
        mode3Btn.addEventListener('click', calculateMode3);
    }
    
    // Mode 4: Manual power input
    const mode4Btn = document.getElementById('calculate-mode4');
    if (mode4Btn) {
        mode4Btn.addEventListener('click', calculateMode4);
    }
}

// Function called by buttons in preliminary forms
function proceedToCalculator(mode) {
    console.log(`🎯 Proceeding to calculator for ${mode}`);
    
    // Debug: sprawdź dostępne elementy
    console.log('Available calculators:', {
        heatCalcMode2: !!document.getElementById('heatCalcMode2'),
        formMode2: !!document.getElementById('form-mode2'),
        heatCalcFormFull: !!document.getElementById('heatCalcFormFull'),
        allSections: document.querySelectorAll('.section').length
    });
    
    // Hide all mode forms (preliminary forms)
    document.querySelectorAll('.mode-form').forEach(form => {
        form.classList.add('hidden');
        form.style.display = 'none';
    });
    
    // Hide mode forms container
    const modeFormsContainer = document.getElementById('mode-forms');
    if (modeFormsContainer) {
        modeFormsContainer.classList.add('hidden');
        modeFormsContainer.style.display = 'none';
    }
    
    // Hide welcome screen
    const welcomeScreen = document.getElementById('welcome-screen');
    if (welcomeScreen) {
        welcomeScreen.classList.add('hidden');
        welcomeScreen.style.display = 'none';
    }
    
    // Show appropriate calculator based on mode
    switch(mode) {
        case 'mode1':
            // Hide main header
            const mainHeader1 = document.querySelector('.hetzner-header');
            if (mainHeader1) {
                mainHeader1.style.display = 'none';
            }
            
            // Show full calculator
            const fullCalc = document.getElementById('heatCalcFormFull');
            if (fullCalc) {
                fullCalc.classList.remove('hidden');
                fullCalc.classList.add('active');
                fullCalc.style.display = 'block';
                fullCalc.scrollIntoView({ behavior: 'smooth' });
                console.log('✅ Mode 1 Full Calculator shown');
            } else {
                console.error('❌ Mode 1 calculator not found');
            }
            break;
            
        case 'mode2':
            // Użyj nowego mode2Handler dla czystej architektury
            if (window.mode2Handler) {
                // Zbierz dane preliminary
                const preliminaryData = {
                    postalCode: document.getElementById('postal-code-2')?.value,
                    buildingType: document.querySelector('input[name="building-type-2"]:checked')?.value,
                    heatPumpPurpose: document.querySelector('input[name="heat-pump-purpose-2"]:checked')?.value
                };
                
                window.mode2Handler.activate(preliminaryData);
                console.log('✅ Mode 2 activated via new handler');
            } else {
                console.error('❌ Mode2Handler not available, cannot activate Mode 2');
            }
            break;
            
        case 'mode3':
            // Hide main header
            const mainHeader3 = document.querySelector('.hetzner-header');
            if (mainHeader3) {
                mainHeader3.style.display = 'none';
            }
            
            // Show audit calculator - sprawdź oba możliwe ID
            let auditCalc = document.getElementById('heatCalcMode3');
            if (!auditCalc) {
                auditCalc = document.getElementById('form-mode3');
            }
            if (auditCalc) {
                auditCalc.classList.remove('hidden');
                auditCalc.classList.add('active');
                auditCalc.style.display = 'block';
                auditCalc.scrollIntoView({ behavior: 'smooth' });
                console.log('✅ Mode 3 Audit Calculator shown');
            } else {
                console.error('❌ Mode 3 calculator not found (sprawdzano heatCalcMode3 i form-mode3)');
            }
            break;
            
        case 'mode4':
            // Hide main header
            const mainHeader4 = document.querySelector('.hetzner-header');
            if (mainHeader4) {
                mainHeader4.style.display = 'none';
            }
            
            // Show power calculator - sprawdź oba możliwe ID
            let powerCalc = document.getElementById('heatCalcMode4');
            if (!powerCalc) {
                powerCalc = document.getElementById('form-mode4');
            }
            if (powerCalc) {
                powerCalc.classList.remove('hidden');
                powerCalc.classList.add('active');
                powerCalc.style.display = 'block';
                powerCalc.scrollIntoView({ behavior: 'smooth' });
                console.log('✅ Mode 4 Power Calculator shown');
            } else {
                console.error('❌ Mode 4 calculator not found (sprawdzano heatCalcMode4 i form-mode4)');
            }
            break;
            
        default:
            console.error('Unknown mode:', mode);
    }
    
    // Store current mode in app state
    window.appState.userMode = mode;
}

// Mode 3 calculation function
function calculateMode3() {
    console.log('🔥 Starting Mode 3 calculation - Energy Audit');
    
    const area = parseFloat(document.getElementById('audit_area').value);
    const consumption = parseFloat(document.getElementById('annual_consumption').value);
    const standard = document.getElementById('energy_standard').value;
    const insulation = document.getElementById('insulation_level').value;
    
    if (!area || !consumption || !standard || !insulation) {
        showNotification('Proszę wypełnić wszystkie wymagane pola', 'error');
        return;
    }
    
    // Calculate power based on audit data
    let efficiency = getEfficiencyByStandard(standard);
    let insulationFactor = getInsulationFactor(insulation);
    
    // Formula: (annual consumption / 2000) * efficiency * insulation factor
    const calculatedPower = (consumption / 2000) * efficiency * insulationFactor;
    
    // Store results and show
    const results = {
        power: calculatedPower.toFixed(1),
        area: area,
        consumption: consumption,
        standard: standard,
        insulation: insulation,
        mode: 'mode3'
    };
    
    window.appState.results = results;
    showCalculationResults(results);
}

// Mode 4 calculation function  
function calculateMode4() {
    console.log('⚡ Starting Mode 4 calculation - Known Power');
    
    const power = parseFloat(document.getElementById('manual_power').value);
    const source = document.getElementById('power_source').value;
    const area = parseFloat(document.getElementById('building_area_mode4').value) || null;
    
    if (!power || !source) {
        showNotification('Proszę podać moc pompy i źródło informacji', 'error');
        return;
    }
    
    // Validate power range
    if (power < 1 || power > 50) {
        showNotification('Moc powinna być w zakresie 1-50 kW', 'error');
        return;
    }
    
    // Store results and show
    const results = {
        power: power.toFixed(1),
        area: area,
        source: source,
        mode: 'mode4'
    };
    
    window.appState.results = results;
    showCalculationResults(results);
}

// Helper functions
function getEfficiencyByStandard(standard) {
    const efficiencyMap = {
        'old': 0.6,      // Old buildings are less efficient
        'medium': 0.75,  // Medium standard
        'modern': 0.85,  // Modern buildings
        'passive': 0.95  // Passive houses are very efficient
    };
    return efficiencyMap[standard] || 0.75;
}

function getInsulationFactor(insulation) {
    const insulationMap = {
        'none': 1.3,     // No insulation requires more power
        'partial': 1.1,  // Partial insulation
        'full': 0.9      // Full insulation reduces power needs
    };
    return insulationMap[insulation] || 1.0;
}

function showCalculationResults(results) {
    console.log('📊 Showing calculation results:', results);
    
    // Hide current calculator
    document.querySelectorAll('form[id^="heatCalc"]').forEach(form => {
        form.classList.add('hidden');
    });
    
    // Show results section (reuse existing results system)
    const resultsSection = document.getElementById('results');
    if (resultsSection) {
        resultsSection.classList.remove('hidden');
        resultsSection.scrollIntoView({ behavior: 'smooth' });
        
        // Update results content with mode-specific data
        updateResultsContent(results);
    }
}

function switchToMode(mode) {
    console.log(`🎯 Switching to mode: ${mode}`);
    
    window.appState.userMode = mode;
    
    // Hide welcome screen
    const welcomeScreen = document.getElementById('welcome-screen');
    if (welcomeScreen) {
        welcomeScreen.classList.add('hidden');
    }
    
    // Route to different calculation paths based on mode
    switch(mode) {
        case 'mode1':
            // Mode 1: Full calculator (existing system)
            activateFullCalculator();
            break;
        case 'mode2':
            // Mode 2: AI Project Analysis (existing form)
            activateProjectMode();
            break;
        case 'mode3':
            // Mode 3: Energy Audit Mode
            activateEnergyAuditMode();
            break;
        case 'mode4':
            // Mode 4: Manual Power Input Mode
            activateManualPowerMode();
            break;
        default:
            console.error('Unknown mode:', mode);
            showWelcomeScreen();
    }
}

function activateFullCalculator() {
    console.log('🧮 Activating Mode 1: Full Calculator');
    
    // Clean up any existing mode containers
    cleanupModeContainers();
    
    // Show the main calculator form
    const form = document.getElementById('heatCalcFormFull');
    if (form) {
        form.classList.remove('hidden');
        
        // Scroll to the form
        form.scrollIntoView({ behavior: 'smooth' });
        
        // Initialize calculator if needed
        if (typeof initializeCalculator === 'function') {
            initializeCalculator();
        }
    }
    
    console.log('✅ Full calculator activated');
}

function activateProjectMode() {
    console.log('📐 Activating Mode 2: AI Project Analysis');
    
    // Clean up any existing mode containers
    cleanupModeContainers();
    
    const form = document.getElementById('form-mode2');
    if (form) {
        form.classList.remove('hidden');
        
        // Scroll to the form
        form.scrollIntoView({ behavior: 'smooth' });
        
        // Initialize PDF upload handler if not already done
        if (typeof initializePDFUploadHandler === 'function') {
            initializePDFUploadHandler();
        }
    }
    console.log('✅ Project mode activated');
}

function cleanupModeContainers() {
    // Hide all existing forms and containers
    const containersToHide = [
        'heatCalcFormFull',
        'form-mode2',
        'form-mode3', 
        'form-mode4',
        'mode3-container',
        'mode4-container',
        'calcResultsSection'
    ];
    
    containersToHide.forEach(id => {
        const element = document.getElementById(id);
        if (element) {
            element.classList.add('hidden');
        }
    });
    
    // Remove dynamically created containers
    const dynamicContainers = document.querySelectorAll('.mode-container');
    dynamicContainers.forEach(container => {
        container.remove();
    });
}

function activateEnergyAuditMode() {
    console.log('♻️ Activating Mode 3: Energy Audit Mode');
    
    // Clean up any existing mode containers
    cleanupModeContainers();
    
    // Create energy audit interface
    createEnergyAuditInterface();
}

function activateManualPowerMode() {
    console.log('⚡ Activating Mode 4: Manual Power Mode');
    
    // Clean up any existing mode containers
    cleanupModeContainers();
    
    // Create manual power interface
    createManualPowerInterface();
}

function createEnergyAuditInterface() {
    // Remove existing mode3 interface if it exists
    const existingMode3 = document.getElementById('mode3-container');
    if (existingMode3) {
        existingMode3.remove();
    }
    
    const mode3HTML = `
        <div id="mode3-container" class="mode-container">
            <div class="mode-header">
                <button class="back-to-welcome" onclick="showWelcomeScreen()">
                    <i class="fas fa-arrow-left"></i> Powrót do menu
                </button>
                <h2><i class="fas fa-chart-line"></i> Modernizacja - audyt energetyczny</h2>
                <p>Obliczenie mocy na podstawie danych z audytu energetycznego lub istniejącego zużycia</p>
            </div>
            
            <div class="mode-form">
                <div class="form-field">
                    <label for="audit_annual">Roczne zapotrzebowanie na ciepło (kWh/rok)</label>
                    <input type="number" id="audit_annual" placeholder="15000" step="100" min="1000" max="100000" required>
                    <small>Dane z audytu energetycznego lub rachunków za ogrzewanie</small>
                </div>
                
                <div class="form-field">
                    <label for="audit_area">Powierzchnia użytkowa budynku (m²)</label>
                    <input type="number" id="audit_area" placeholder="150" step="1" min="50" max="1000" required>
                    <small>Powierzchnia ogrzewana budynku</small>
                </div>
                
                <div class="form-field">
                    <label for="audit_temp">Temperatura projektowa (°C)</label>
                    <select id="audit_temp" required>
                        <option value="">-- Wybierz temperaturę projektową --</option>
                        <option value="-16">-16°C (Strefa I)</option>
                        <option value="-18">-18°C (Strefa II)</option>
                        <option value="-20" selected>-20°C (Strefa III)</option>
                        <option value="-22">-22°C (Strefa IV)</option>
                        <option value="-24">-24°C (Strefa V)</option>
                    </select>
                    <small>Minimalna temperatura zewnętrzna w Twojej lokalizacji</small>
                </div>
                
                <div class="calculation-info">
                    <h4><i class="fas fa-info-circle"></i> Metoda obliczenia</h4>
                    <p>System obliczy moc pompy na podstawie rocznego zapotrzebowania na ciepło i liczby godzin grzewczych, z uwzględnieniem współczynnika bezpieczeństwa.</p>
                    <ul>
                        <li>Moc bazowa = Zapotrzebowanie roczne / 2000h</li>
                        <li>Moc maksymalna = Moc bazowa × 1.5</li>
                        <li>Współczynnik bezpieczeństwa uwzględnia szczytowe zapotrzebowanie</li>
                    </ul>
                </div>
                
                <button type="button" id="calculate-mode3" class="calculate-btn" disabled>
                    <i class="fas fa-calculator"></i> Oblicz moc pompy ciepła
                </button>
            </div>
        </div>
    `;
    
    // Insert into main container
    const mainContainer = document.querySelector('main') || document.body;
    mainContainer.insertAdjacentHTML('beforeend', mode3HTML);
    
    // Add validation
    setupMode3Validation();
    
    console.log('✅ Energy audit interface created');
}

function createManualPowerInterface() {
    // Remove existing mode4 interface if it exists
    const existingMode4 = document.getElementById('mode4-container');
    if (existingMode4) {
        existingMode4.remove();
    }
    
    const mode4HTML = `
        <div id="mode4-container" class="mode-container">
            <div class="mode-header">
                <button class="back-to-welcome" onclick="showWelcomeScreen()">
                    <i class="fas fa-arrow-left"></i> Powrót do menu
                </button>
                <h2><i class="fas fa-bolt"></i> Znana moc pompy</h2>
                <p>Wprowadź znaną moc pompy ciepła z projektu, audytu lub rekomendacji instalatora</p>
            </div>
            
            <div class="mode-form">
                <div class="form-field">
                    <label for="manual_power">Moc pompy ciepła (kW)</label>
                    <input type="number" id="manual_power" placeholder="8.5" step="0.1" min="3" max="50" required>
                    <small>Moc grzewcza pompy ciepła podana w dokumentacji</small>
                </div>
                
                <div class="form-field">
                    <label for="power_source">Źródło informacji o mocy</label>
                    <select id="power_source" required>
                        <option value="">-- Skąd znasz tę moc? --</option>
                        <option value="project">Projekt techniczny</option>
                        <option value="audit">Audyt energetyczny</option>
                        <option value="installer">Rekomendacja instalatora</option>
                        <option value="calculation">Własne obliczenia</option>
                        <option value="manufacturer">Dane producenta</option>
                        <option value="other">Inne źródło</option>
                    </select>
                    <small>Ta informacja pomoże nam w dalszej konfiguracji</small>
                </div>
                
                <div class="form-field">
                    <label for="building_area_mode4">Powierzchnia budynku (m²) - opcjonalnie</label>
                    <input type="number" id="building_area_mode4" placeholder="150" step="1" min="50" max="1000">
                    <small>Pomocne do weryfikacji mocy i doboru dodatkowych komponentów</small>
                </div>
                
                <div class="power-verification">
                    <h4><i class="fas fa-check-circle"></i> Weryfikacja mocy</h4>
                    <p>Wprowadzona moc zostanie wykorzystana do:</p>
                    <ul>
                        <li>Doboru odpowiedniego modelu pompy Panasonic</li>
                        <li>Konfiguracji systemu grzewczego</li>
                        <li>Obliczenia kosztów instalacji</li>
                        <li>Przygotowania oferty handlowej</li>
                    </ul>
                </div>
                
                <button type="button" id="calculate-mode4" class="calculate-btn" disabled>
                    <i class="fas fa-cogs"></i> Przejdź do konfiguracji
                </button>
            </div>
        </div>
    `;
    
    // Insert into main container
    const mainContainer = document.querySelector('main') || document.body;
    mainContainer.insertAdjacentHTML('beforeend', mode4HTML);
    
    // Add validation
    setupMode4Validation();
    
    console.log('✅ Manual power interface created');
}

function setupMode3Validation() {
    const annualInput = document.getElementById('audit_annual');
    const areaInput = document.getElementById('audit_area');
    const tempSelect = document.getElementById('audit_temp');
    const calculateBtn = document.getElementById('calculate-mode3');
    
    function validateMode3() {
        const annual = parseFloat(annualInput.value);
        const area = parseFloat(areaInput.value);
        const temp = tempSelect.value;
        
        const isValid = annual >= 1000 && annual <= 100000 && 
                       area >= 50 && area <= 1000 && 
                       temp !== '';
        
        calculateBtn.disabled = !isValid;
    }
    
    annualInput.addEventListener('input', validateMode3);
    areaInput.addEventListener('input', validateMode3);
    tempSelect.addEventListener('change', validateMode3);
    calculateBtn.addEventListener('click', calculateMode3);
}

function setupMode4Validation() {
    const powerInput = document.getElementById('manual_power');
    const sourceSelect = document.getElementById('power_source');
    const calculateBtn = document.getElementById('calculate-mode4');
    
    function validateMode4() {
        const power = parseFloat(powerInput.value);
        const source = sourceSelect.value;
        
        const isValid = power >= 3 && power <= 50 && source !== '';
        
        calculateBtn.disabled = !isValid;
    }
    
    powerInput.addEventListener('input', validateMode4);
    sourceSelect.addEventListener('change', validateMode4);
    calculateBtn.addEventListener('click', calculateMode4);
}

// Simplified Function for PDF Analysis from Mode 2 - delegates to pdfUploadHandler
function startAIPDFAnalysis() {
    console.log('🤖 Starting AI PDF Analysis - delegating to analyzeProjectWithAI');
    
    // Get PDF file from Mode 2 input
    const pdfFileInput = document.getElementById('pdf-file-input-mode2');
    
    if (!pdfFileInput || !pdfFileInput.files || pdfFileInput.files.length === 0) {
        const message = 'Proszę najpierw wybrać plik PDF do analizy';
        if (typeof window.userAlert === 'function') {
            window.userAlert(message, 'warning');
        } else {
            alert(message);
        }
        return;
    }
    
    const file = pdfFileInput.files[0];
    
    // Delegate to the working function in pdfUploadHandler.js
    if (typeof analyzeProjectWithAI === 'function') {
        analyzeProjectWithAI(file);
    } else {
        console.error('❌ analyzeProjectWithAI function not found');
        if (typeof window.userAlert === 'function') {
            window.userAlert('Błąd systemu - funkcja analizy nie jest dostępna', 'error');
        } else {
            alert('Błąd systemu - funkcja analizy nie jest dostępna');
        }
    }
}

// Removed duplicate functions - using analyzeProjectWithAI from pdfUploadHandler.js

// Setup file handler for Mode 2 PDF upload
function setupMode2FileHandler() {
    const fileInput = document.getElementById('pdf-upload-mode2');
    const uploadZone = document.getElementById('pdf-upload-zone-mode2');
    const uploadText = document.getElementById('pdf-upload-text-mode2');
    
    if (!fileInput || !uploadZone || !uploadText) return;
    
    // File input change handler
    fileInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file && file.type === 'application/pdf') {
            uploadText.textContent = `✓ ${file.name}`;
            uploadZone.classList.add('file-selected');
            
            // Enable the analyze button
            const analyzeBtn = document.querySelector('#form-mode2 .btn-continue');
            if (analyzeBtn) {
                analyzeBtn.disabled = false;
            }
        } else if (file) {
            uploadText.textContent = 'Tylko pliki PDF są dozwolone';
            uploadZone.classList.remove('file-selected');
            fileInput.value = '';
        }
    });
    
    // Drag and drop handlers
    uploadZone.addEventListener('dragover', function(e) {
        e.preventDefault();
        uploadZone.classList.add('drag-over');
    });
    
    uploadZone.addEventListener('dragleave', function(e) {
        e.preventDefault();
        uploadZone.classList.remove('drag-over');
    });
    
    uploadZone.addEventListener('drop', function(e) {
        e.preventDefault();
        uploadZone.classList.remove('drag-over');
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            const file = files[0];
            if (file.type === 'application/pdf') {
                fileInput.files = files;
                uploadText.textContent = `✓ ${file.name}`;
                uploadZone.classList.add('file-selected');
                
                // Enable the analyze button
                const analyzeBtn = document.querySelector('#form-mode2 .btn-continue');
                if (analyzeBtn) {
                    analyzeBtn.disabled = false;
                }
            } else {
                uploadText.textContent = 'Tylko pliki PDF są dozwolone';
            }
        }
    });
}

function showBasicMode2Form() {
    console.log('🔧 Creating fallback Mode 2 form');
    
    // Usuń istniejące formularze Mode 2
    const existingForms = document.querySelectorAll('#mode2-fallback, #temp-mode2-form');
    existingForms.forEach(form => form.remove());
    
    // Utwórz podstawowy formularz Mode 2
    const mode2HTML = `
        <section id="mode2-fallback" class="section active">
            <div class="mode-indicator">
                <div class="mode-icon">🤖</div>
                <div>Tryb: AI Analiza Projektu PDF</div>
            </div>
            
            <div class="formularz">
                <h3>ANALIZA PROJEKTU Z AI</h3>
                <hr class="separator">
                <p class="mode-description">Prześlij projekt budowlany (PDF) - AI automatycznie wyciągnie dane do doboru pompy</p>

                <div class="pdf-upload-section">
                    <div class="upload-area" id="pdf-upload-area-fallback">
                        <div class="upload-content">
                            <i class="fas fa-cloud-upload-alt upload-icon"></i>
                            <p class="upload-text">Przeciągnij i upuść projekt PDF tutaj</p>
                            <p class="upload-subtext">lub kliknij aby wybrać plik</p>
                            <input type="file" id="pdf-file-input-fallback" accept=".pdf" style="display: none;">
                        </div>
                    </div>

                    <div id="upload-progress-fallback" class="upload-progress hidden">
                        <div class="progress-bar">
                            <div class="progress-fill"></div>
                        </div>
                        <p class="progress-text">Analizowanie projektu z AI...</p>
                    </div>
                </div>

                <div class="action-row">
                    <button type="button" class="action-btn primary" id="analyze-with-ai-fallback" disabled>
                        <i class="fas fa-magic"></i> Analizuj projekt z AI
                    </button>
                    <button type="button" class="action-btn secondary" onclick="showWelcomeScreen()">
                        <i class="fas fa-arrow-left"></i> Powrót do menu
                    </button>
                </div>
            </div>
        </section>
    `;
    
    // Wstaw formularz
    const mainContainer = document.querySelector('main') || document.body;
    mainContainer.insertAdjacentHTML('beforeend', mode2HTML);
    
    // Scroll do formularza
    const fallbackForm = document.getElementById('mode2-fallback');
    if (fallbackForm) {
        fallbackForm.scrollIntoView({ behavior: 'smooth' });
    }
    
    console.log('✅ Mode 2 fallback form created');
}

function showWelcomeScreen() {
    console.log('🏠 Returning to welcome screen');
    
    // Clean up all mode containers including fallbacks
    cleanupModeContainers();
    
    // Remove fallback forms
    const fallbackForms = document.querySelectorAll('#mode2-fallback, #mode3-fallback, #mode4-fallback, #temp-mode2-form');
    fallbackForms.forEach(form => form.remove());
    
    // Show welcome screen
    const welcomeScreen = document.getElementById('welcome-screen');
    if (welcomeScreen) {
        welcomeScreen.classList.remove('hidden');
        welcomeScreen.style.display = 'block';
        welcomeScreen.scrollIntoView({ behavior: 'smooth' });
    }
    
    // Reset state
    window.appState.userMode = null;
    window.appState.calculationData = {};
}

// TRYB 2: Budowa domu - dane z projektu
function calculateMode2() {
    console.log('📐 Calculating Mode 2: Project Data');
    
    const formData = {
        euValue: parseFloat(document.getElementById('project_eu').value),
        area: parseFloat(document.getElementById('project_area').value),
        climateZone: document.getElementById('project_climate').value
    };
    
    // Validate inputs
    if (!formData.euValue || !formData.area || !formData.climateZone) {
        if (typeof window.userAlert === 'function') {
            window.userAlert('Proszę wypełnić wszystkie pola', 'warning');
        } else {
            alert('Proszę wypełnić wszystkie pola');
        }
        return;
    }
    
    // Calculate using Zordon formula: Moc max [kW] = (Powierzchnia × EU) / 1800 × 2
    const annualDemand = formData.area * formData.euValue; // kWh/rok
    const maxPower = (annualDemand / 1800) * 2; // kW
    
    const results = {
        calculatedPower: Math.round(maxPower * 10) / 10,
        annualDemand: annualDemand,
        euValue: formData.euValue,
        area: formData.area,
        method: 'project',
        formula: '(Powierzchnia × EU) / 1800 × 2',
        calculation: `(${formData.area} × ${formData.euValue}) / 1800 × 2 = ${maxPower.toFixed(1)} kW`
    };
    
    window.appState.calculationData = formData;
    window.appState.results = results;
    
    proceedToExistingResults(results, 'Obliczenie na podstawie projektu');
}

// TRYB 3: Modernizacja - dane z audytu OZC
function calculateMode3() {
    console.log('♻️ Calculating Mode 3: Energy Audit');
    
    const formData = {
        annualDemand: parseFloat(document.getElementById('audit_annual').value),
        area: parseFloat(document.getElementById('audit_area').value),
        designTemp: parseInt(document.getElementById('audit_temp').value)
    };
    
    // Validate inputs
    if (!formData.annualDemand || !formData.area || !formData.designTemp) {
        if (typeof window.userAlert === 'function') {
            window.userAlert('Proszę wypełnić wszystkie pola', 'warning');
        } else {
            alert('Proszę wypełnić wszystkie pola');
        }
        return;
    }
    
    // Calculate based on annual demand and design temperature
    const heatingHours = 2000; // Approximate heating hours per year
    const safetyFactor = 1.5;
    const basePower = formData.annualDemand / heatingHours;
    const maxPower = basePower * safetyFactor;
    
    const results = {
        calculatedPower: Math.round(maxPower * 10) / 10,
        annualDemand: formData.annualDemand,
        area: formData.area,
        euEquivalent: Math.round(formData.annualDemand / formData.area),
        method: 'audit',
        heatingHours: heatingHours,
        safetyFactor: safetyFactor,
        calculation: `${formData.annualDemand} / ${heatingHours} × ${safetyFactor} = ${maxPower.toFixed(1)} kW`
    };
    
    window.appState.calculationData = formData;
    window.appState.results = results;
    
    proceedToExistingResults(results, 'Obliczenie na podstawie audytu');
}

// TRYB 4: Znana moc pompy
function calculateMode4() {
    console.log('⚡ Mode 4: Known Power');
    
    const formData = {
        manualPower: parseFloat(document.getElementById('manual_power').value),
        powerSource: document.getElementById('power_source').value
    };
    
    // Validate inputs
    if (!formData.manualPower || !formData.powerSource) {
        if (typeof window.userAlert === 'function') {
            window.userAlert('Proszę wypełnić wszystkie pola', 'warning');
        } else {
            alert('Proszę wypełnić wszystkie pola');
        }
        return;
    }
    
    const results = {
        calculatedPower: formData.manualPower,
        method: 'manual',
        powerSource: formData.powerSource,
        note: 'Moc podana bezpośrednio przez użytkownika',
        source: getSourceDescription(formData.powerSource)
    };
    
    window.appState.calculationData = formData;
    window.appState.results = results;
    
    proceedToExistingResults(results, 'Moc podana ręcznie');
}

function getSourceDescription(source) {
    const descriptions = {
        'audit': 'Audyt energetyczny',
        'project': 'Projekt techniczny',
        'calculation': 'Własne obliczenia',
        'installer': 'Rekomendacja instalatora',
        'other': 'Inne źródło'
    };
    return descriptions[source] || 'Nieznane źródło';
}

function proceedToExistingResults(results, modeDescription) {
    console.log('📊 Proceeding to existing results system:', results);
    
    // Hide current mode form
    const currentModeForm = document.querySelector('.section:not(.hidden)');
    if (currentModeForm && currentModeForm.id !== 'welcome-screen') {
        currentModeForm.classList.add('hidden');
    }
    
    // Prepare data in format expected by existing system
    const preparedData = {
        power_demand: results.calculatedPower,
        annual_demand: results.annualDemand || null,
        building_area: results.area || null,
        calculation_method: modeDescription,
        source_details: results
    };
    
    // Try to use existing results system
    if (typeof window.showResults === 'function') {
        window.showResults(preparedData);
    } else if (typeof renderResults === 'function') {
        renderResults(preparedData);
    } else {
        // Fallback: show basic results
        showBasicResults(results, modeDescription);
    }
}

function showBasicResults(results, modeDescription) {
    // Find or create results section
    let resultsSection = document.getElementById('calcResultsSection');
    if (!resultsSection) {
        resultsSection = document.createElement('section');
        resultsSection.id = 'calcResultsSection';
        resultsSection.className = 'section';
        document.getElementById('top-instal-calc').appendChild(resultsSection);
    }
    
    resultsSection.innerHTML = `
        <div class="mode-indicator">
            <div class="mode-icon">📊</div>
            <div>Wyniki obliczeń: ${modeDescription}</div>
        </div>
        
        <div class="results-summary">
            <h3>ZALECANA MOC POMPY CIEPŁA</h3>
            <div class="power-result">
                <span class="power-value">${results.calculatedPower}</span>
                <span class="power-unit">kW</span>
            </div>
        </div>
        
        <div class="calculation-details">
            ${results.calculation ? `<p><strong>Obliczenie:</strong> ${results.calculation}</p>` : ''}
            ${results.formula ? `<p><strong>Wzór:</strong> ${results.formula}</p>` : ''}
            ${results.note ? `<p><strong>Uwaga:</strong> ${results.note}</p>` : ''}
            ${results.source ? `<p><strong>Źródło:</strong> ${results.source}</p>` : ''}
        </div>
        
        <div class="action-row">
            <button type="button" class="action-btn primary" onclick="proceedToConfiguration()">
                <i class="fas fa-cogs"></i> Konfiguruj pompę ${results.calculatedPower} kW
            </button>
            <button type="button" class="action-btn secondary" onclick="showWelcomeScreen()">
                <i class="fas fa-arrow-left"></i> Nowe obliczenie
            </button>
        </div>
    `;
    
    resultsSection.classList.remove('hidden');
    resultsSection.scrollIntoView({ behavior: 'smooth' });
}

function proceedToConfiguration() {
    console.log('🎯 Proceeding to heat pump configuration...');
    
    // Save results to localStorage for next step
    localStorage.setItem('heatPumpCalculatorResults', JSON.stringify(window.appState));
    
    // Check if existing configurator exists
    if (typeof window.startConfiguration === 'function') {
        window.startConfiguration(window.appState.results);
    } else {
        // For now, show info and ask for new calculation
        alert(`Gotowe! Zalecana moc pompy: ${window.appState.results.calculatedPower} kW\n\nW pełnej aplikacji tutaj następowałby przechod do kroku konfiguracji pompy.`);
        
        if (confirm('Czy chcesz wykonać nowe obliczenie?')) {
            showWelcomeScreen();
        }
    }
}

// Export for external use
window.IntelligentModeHandler = {
    switchToMode,
    showWelcomeScreen,
    calculateMode2,
    calculateMode3,
    calculateMode4,
    proceedToConfiguration
};

console.log('🧮 Intelligent Mode Handler module loaded successfully');