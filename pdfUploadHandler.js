/**
 * PDF Upload Handler - WYCENA 2025
 * Obsługa przesyłania i analizy plików PDF dla trybu 2
 */

(function () {
    'use strict';
    
    let currentFile = null;
    
    // Initialize PDF upload functionality
    function initPDFUploadHandler() {
        console.log('🤖 Initializing PDF Upload Handler for AI Analysis...');
        setupPDFUploadEvents();
        setupAnalyzeButton();
        console.log('✅ PDF Upload Handler initialized - integrated with main HTML event system');
    }
    
    function setupPDFUploadEvents() {
        const uploadArea = document.getElementById('pdf-upload-area-mode2');
        const fileInput = document.getElementById('pdf-file-input-mode2');
        
        if (!uploadArea || !fileInput) {
            console.warn('❌ PDF upload elements not found');
            return;
        }
        
        // Click to select file
        uploadArea.addEventListener('click', () => {
            fileInput.click();
        });
        
        // File selection
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (file) {
                handlePDFFile(file);
            }
        });
        
        // Drag and drop
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });
        
        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });
        
        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            
            const file = e.dataTransfer.files[0];
            if (file && file.type === 'application/pdf') {
                handlePDFFile(file);
            }
        });
    }
    
    function setupAnalyzeButton() {
        const analyzeBtn = document.getElementById('analyze-with-ai-mode2');
        if (analyzeBtn) {
            analyzeBtn.addEventListener('click', () => {
                if (currentFile) {
                    window.analyzeProjectWithAI(currentFile);
                }
            });
        }
    }
    
    function handlePDFFile(file) {
        if (!file.type === 'application/pdf') {
            if (typeof window.userAlert === 'function') {
                window.userAlert('Proszę wybrać plik PDF', 'error');
            } else {
                alert('Proszę wybrać plik PDF');
            }
            return;
        }
        
        currentFile = file;
        
        // Update UI
        const uploadArea = document.getElementById('pdf-upload-area-mode2');
        const analyzeBtn = document.getElementById('analyze-with-ai-mode2');
        
        if (uploadArea) {
            uploadArea.innerHTML = `
                <div class="upload-content">
                    <i class="fas fa-file-pdf upload-icon" style="color: #dc2626;"></i>
                    <p class="upload-text">Wybrano: ${file.name}</p>
                    <p class="upload-subtext">Rozmiar: ${formatFileSize(file.size)}</p>
                </div>
            `;
            uploadArea.classList.add('file-selected');
        }
        
        if (analyzeBtn) {
            analyzeBtn.disabled = false;
            analyzeBtn.innerHTML = '<i class="fas fa-magic"></i> Analizuj projekt z AI';
        }
        
        console.log('📄 PDF file selected:', file.name);
    }
    
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    // Make function globally available
    window.analyzeProjectWithAI = function(file) {
        console.log('🤖 Starting AI analysis of project PDF...');
        
        // Check service status first
        fetch('/api/health')
            .then(response => response.json())
            .then(status => {
                console.log('📊 PDF Service Status:', status);
                if (status && status.pdf_analyzer) {
                    performPDFAnalysis(file);
                } else {
                    throw new Error('PDF Analyzer service not available');
                }
            })
            .catch(error => {
                console.error('❌ Service check failed:', error);
                if (typeof window.userAlert === 'function') {
                    window.userAlert('Serwis analizy AI nie jest dostępny. Spróbuj ponownie później.', 'error');
                } else {
                    alert('Serwis analizy AI nie jest dostępny. Spróbuj ponownie później.');
                }
            });
    };
    
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
        console.log('📤 Sending PDF to API endpoint: /api/analyze-pdf');
        console.log('📦 FormData contents:', {
            file: formData.get('file'),
            fileName: formData.get('file')?.name,
            fileSize: formData.get('file')?.size
        });
        
        fetch('/api/analyze-pdf', {
            method: 'POST',
            body: formData
        })
        .then(response => {
            console.log(`📡 Response status: ${response.status}`);
            console.log('📡 Response headers:', Object.fromEntries(response.headers.entries()));
            
            if (!response.ok) {
                return response.text().then(text => {
                    console.error('❌ Raw error response:', text);
                    try {
                        const err = JSON.parse(text);
                        throw new Error(err.error || err.message || `HTTP ${response.status}`);
                    } catch (parseError) {
                        throw new Error(`Server error: ${response.status} - ${text}`);
                    }
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
            
            setTimeout(() => {
                if (progressSection) {
                    progressSection.classList.add('hidden');
                }
                
                // Handle both old and new API response formats
                const isSuccess = data.status === 'success' || data.processing_status === 'success';
                const resultData = data.data || data;
                
                if (isSuccess && (resultData.analysis || resultData.heating_calculation)) {
                    displayPDFAnalysisResults(resultData);
                } else {
                    const errorMsg = data.message || data.error_message || 'Nie udało się przeanalizować projektu';
                    displayAnalysisError(errorMsg);
                }
            }, 1000);
            
            // Re-enable button
            if (analyzeBtn) {
                analyzeBtn.disabled = false;
                analyzeBtn.innerHTML = '<i class="fas fa-magic"></i> Analizuj ponownie';
            }
        })
        .catch(error => {
            clearInterval(progressInterval);
            console.error('❌ AI analysis failed:', error);
            
            if (progressSection) {
                progressSection.classList.add('hidden');
            }
            
            if (analyzeBtn) {
                analyzeBtn.disabled = false;
                analyzeBtn.innerHTML = '<i class="fas fa-magic"></i> Spróbuj ponownie';
            }
            
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
        
        // Extract data from backend format
        const analysis = data.analysis || {};
        const foundData = analysis.found_data || {};
        const heatingCalc = data.heating_calculation || {};
        
        // Update ZORDON_STATE with AI results
        if (window.updateZORDON) {
            window.updateZORDON({
                powierzchnia: foundData.powierzchnia_uzytkowa || null,
                eu: foundData.wskaznik_eu || null,
                mocSzacowana: heatingCalc.calculated_power || null,
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
                        <span class="result-label">Powierzchnia użytkowa:</span>
                        <span class="result-value">${foundData.powierzchnia_uzytkowa || 'Nie wykryto'} m²</span>
                    </div>
                    <div class="result-item">
                        <span class="result-label">Wskaźnik EU:</span>
                        <span class="result-value">${foundData.wskaznik_eu || 'Nie wykryto'} kWh/m²·rok</span>
                    </div>
                    <div class="result-item">
                        <span class="result-label">Lokalizacja:</span>
                        <span class="result-value">${foundData.lokalizacja || 'Nie wykryto'}</span>
                    </div>
                    <div class="result-item">
                        <span class="result-label">Obliczona moc:</span>
                        <span class="result-value">${heatingCalc.calculated_power || 'Nie obliczono'} kW</span>
                    </div>
                    <div class="result-item">
                        <span class="result-label">Metoda obliczenia:</span>
                        <span class="result-value">${heatingCalc.method || 'Brak danych'}</span>
                    </div>
                    ${analysis.analysis_summary ? `
                    <div class="result-item full-width">
                        <span class="result-label">Podsumowanie analizy:</span>
                        <span class="result-value summary">${analysis.analysis_summary}</span>
                    </div>
                    ` : ''}
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
    
    // Global function for proceeding to calculator
    window.proceedToMode2Calculator = function() {
        console.log('🎯 Proceeding to Mode 2 calculator...');
        
        // Hide all mode forms first
        const allModeForms = document.querySelectorAll('[id^="form-mode"]');
        allModeForms.forEach(form => {
            form.classList.add('hidden');
            form.style.display = 'none';
        });
        
        // Hide PDF upload sections
        const pdfSections = document.querySelectorAll('#pdf-upload-area-mode2, #upload-progress-mode2, #ai-analysis-results-mode2');
        pdfSections.forEach(section => {
            if (section) {
                section.classList.add('hidden');
                section.style.display = 'none';
            }
        });
        
        // Show Mode 2 calculator with multiple selector attempts
        const calculatorSelectors = [
            '#heatCalcMode2',
            '#heat-calc-mode2', 
            '.heat-calc-mode2',
            '[data-mode="2"]'
        ];
        
        let calculatorFound = false;
        
        for (const selector of calculatorSelectors) {
            const calculator = document.querySelector(selector);
            if (calculator) {
                calculator.classList.remove('hidden');
                calculator.classList.add('active');
                
                // FORCE display with highest CSS priority
                calculator.setAttribute('style', 'display: block !important; visibility: visible !important; opacity: 1 !important;');
                
                calculatorFound = true;
                console.log(`✅ Mode 2 calculator found and displayed using selector: ${selector}`);
                console.log('🔧 Applied force styles:', calculator.style.cssText);
                
                // CRITICAL: Resetuj window.sections żeby tabNavigation.js nie ukrywał Mode 2
                window.sections = [];
                console.log('🔧 Reset window.sections to prevent tabNavigation interference');
                break;
            }
        }
        
        if (!calculatorFound) {
            console.error('❌ Mode 2 calculator element not found with any selector');
            // Try to show the main calculator section
            const mainCalc = document.querySelector('.kalkulator-container, .calculator-main, #main-calculator');
            if (mainCalc) {
                mainCalc.classList.remove('hidden');
                mainCalc.style.display = 'block';
                console.log('✅ Fallback: Main calculator section displayed');
            }
        }
        
        // Initialize calculator if available
        if (typeof window.initTopInstalCalculator === 'function') {
            setTimeout(() => {
                window.initTopInstalCalculator();
            }, 100);
        }
        
        // Update UI state
        if (typeof window.updateZORDON === 'function') {
            window.updateZORDON({
                currentMode: 2,
                aiAnalysisCompleted: true
            });
        }
        
        // Scroll to calculator
        setTimeout(() => {
            const visibleCalc = document.querySelector('#heatCalcMode2:not(.hidden), .calculator-main:not(.hidden)');
            if (visibleCalc) {
                visibleCalc.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 200);
    };
    
    // Enhanced mode switching function
    window.switchToAIAnalysisMode = function() {
        console.log('🔄 Switching to AI Analysis Mode...');
        
        // Show the PDF upload form for Mode 2
        const mode2Form = document.getElementById('form-mode2');
        if (mode2Form) {
            mode2Form.classList.remove('hidden');
            mode2Form.style.display = 'block';
            console.log('✅ Mode 2 PDF upload form displayed');
        }
        
        // Hide other mode forms
        ['form-mode1', 'form-mode3', 'form-mode4'].forEach(id => {
            const form = document.getElementById(id);
            if (form) {
                form.classList.add('hidden');
                form.style.display = 'none';
            }
        });
        
        // Initialize PDF upload components
        const uploadArea = document.getElementById('pdf-upload-area-mode2');
        const analyzeBtn = document.getElementById('analyze-with-ai-mode2');
        
        if (uploadArea && analyzeBtn) {
            // Reset upload area
            uploadArea.innerHTML = `
                <div class="upload-content">
                    <i class="fas fa-cloud-upload-alt upload-icon"></i>
                    <p class="upload-text">Przeciągnij i upuść projekt PDF tutaj</p>
                    <p class="upload-subtext">lub kliknij aby wybrać plik</p>
                </div>
            `;
            uploadArea.classList.remove('file-selected');
            
            // Reset analyze button
            analyzeBtn.disabled = true;
            analyzeBtn.innerHTML = '<i class="fas fa-magic"></i> Wybierz plik PDF';
        }
        
        // Scroll to the form
        setTimeout(() => {
            if (mode2Form) {
                mode2Form.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 100);
    };

    // Auto-start analysis if file is already selected
    function checkForPreSelectedFile() {
        const transferredFile = window.tempPDFFile;
        if (transferredFile) {
            console.log('📄 PDF file found in preliminary form, auto-starting AI analysis');
            handlePDFFile(transferredFile);
            setTimeout(() => {
                console.log('🚀 Auto-starting AI PDF analysis with transferred file');
                window.analyzeProjectWithAI(transferredFile);
            }, 500);
            window.tempPDFFile = null; // Clear after use
        }
    }
    
    // Initialize on DOM ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initPDFUploadHandler);
    } else {
        initPDFUploadHandler();
    }
    
    // Check for pre-selected file after initialization
    setTimeout(checkForPreSelectedFile, 100);
    
    // Debug function to check DOM state
    window.debugPDFMode = function() {
        console.log('🔍 DEBUG: PDF Mode DOM State');
        
        const elements = {
            'form-mode2': document.getElementById('form-mode2'),
            'pdf-upload-area-mode2': document.getElementById('pdf-upload-area-mode2'),
            'analyze-with-ai-mode2': document.getElementById('analyze-with-ai-mode2'),
            'heatCalcMode2': document.getElementById('heatCalcMode2'),
            'upload-progress-mode2': document.getElementById('upload-progress-mode2'),
            'ai-analysis-results-mode2': document.getElementById('ai-analysis-results-mode2')
        };
        
        Object.entries(elements).forEach(([id, element]) => {
            if (element) {
                console.log(`✅ ${id}:`, {
                    exists: true,
                    visible: !element.classList.contains('hidden'),
                    display: element.style.display,
                    classes: Array.from(element.classList)
                });
            } else {
                console.log(`❌ ${id}: NOT FOUND`);
            }
        });
        
        return elements;
    };
    
    console.log('✅ PDF Upload Handler loaded successfully');
    
    // Test function to verify system readiness
    window.testPDFAnalysisSystem = function() {
        console.log('🔍 Testing PDF Analysis System...');
        
        // Test 1: Check API health
        fetch('/api/health')
            .then(response => response.json())
            .then(data => {
                console.log('✅ API Health Check:', data);
                
                if (data.pdf_analyzer) {
                    console.log('✅ PDF Analyzer service is available');
                } else {
                    console.warn('⚠️ PDF Analyzer service may not be ready');
                }
            })
            .catch(error => {
                console.error('❌ API Health Check failed:', error);
            });
        
        // Test 2: Check DOM elements
        const elements = {
            'form-mode2': document.getElementById('form-mode2'),
            'pdf-upload-area-mode2': document.getElementById('pdf-upload-area-mode2'),
            'analyze-with-ai-mode2': document.getElementById('analyze-with-ai-mode2'),
            'upload-progress-mode2': document.getElementById('upload-progress-mode2'),
            'ai-analysis-results-mode2': document.getElementById('ai-analysis-results-mode2')
        };
        
        let allElementsFound = true;
        Object.entries(elements).forEach(([id, element]) => {
            if (element) {
                console.log(`✅ ${id}: Found`);
            } else {
                console.error(`❌ ${id}: Not found`);
                allElementsFound = false;
            }
        });
        
        if (allElementsFound) {
            console.log('🎉 All DOM elements are present and ready');
        } else {
            console.error('❌ Some DOM elements are missing');
        }
        
        console.log('🔍 System test completed');
        return { elementsReady: allElementsFound };
    };
    
})();