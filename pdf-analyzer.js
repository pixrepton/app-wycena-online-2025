/**
 * PDF Analyzer Module - Refactored
 * Handles PDF upload and AI analysis
 */

class PDFAnalyzer {
    constructor() {
        this.uploadProgress = 0;
        this.currentFile = null;
        
        this.init();
    }

    init() {
        console.log('📄 PDF Analyzer initialized');
        this.bindEvents();
    }

    bindEvents() {
        // Drag & Drop
        const dropZone = document.getElementById('pdf-drop-zone');
        if (dropZone) {
            dropZone.addEventListener('dragover', (e) => this.handleDragOver(e));
            dropZone.addEventListener('drop', (e) => this.handleDrop(e));
        }

        // File input
        const fileInput = document.getElementById('pdf-file-input');
        if (fileInput) {
            fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        }

        // Analyze button
        const analyzeBtn = document.getElementById('analyze-pdf-btn');
        if (analyzeBtn) {
            analyzeBtn.addEventListener('click', () => this.analyzePDF());
        }
    }

    handleDragOver(event) {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'copy';
        
        const dropZone = event.currentTarget;
        dropZone.classList.add('drag-over');
    }

    handleDrop(event) {
        event.preventDefault();
        
        const dropZone = event.currentTarget;
        dropZone.classList.remove('drag-over');
        
        const files = event.dataTransfer.files;
        if (files.length > 0) {
            this.processFile(files[0]);
        }
    }

    handleFileSelect(event) {
        const files = event.target.files;
        if (files.length > 0) {
            this.processFile(files[0]);
        }
    }

    processFile(file) {
        // Validate file
        if (!this.validateFile(file)) {
            return;
        }

        this.currentFile = file;
        this.displayFileInfo(file);
        this.enableAnalyzeButton();
    }

    validateFile(file) {
        // Check file type
        if (file.type !== 'application/pdf') {
            this.showError('Dozwolone są tylko pliki PDF');
            return false;
        }

        // Check file size (max 16MB)
        const maxSize = 16 * 1024 * 1024;
        if (file.size > maxSize) {
            this.showError('Plik jest za duży. Maksymalny rozmiar to 16MB');
            return false;
        }

        return true;
    }

    displayFileInfo(file) {
        const fileInfo = document.getElementById('pdf-file-info');
        if (fileInfo) {
            fileInfo.innerHTML = `
                <div class="file-info">
                    <i class="fas fa-file-pdf"></i>
                    <span class="file-name">${file.name}</span>
                    <span class="file-size">${this.formatFileSize(file.size)}</span>
                </div>
            `;
            fileInfo.classList.remove('hidden');
        }
    }

    enableAnalyzeButton() {
        const btn = document.getElementById('analyze-pdf-btn');
        if (btn) {
            btn.disabled = false;
            btn.classList.remove('disabled');
        }
    }

    async analyzePDF() {
        if (!this.currentFile) {
            this.showError('Najpierw wybierz plik PDF');
            return;
        }

        try {
            this.showProgress();
            
            const formData = new FormData();
            formData.append('pdf_file', this.currentFile);
            
            const response = await fetch('/api/analyze-pdf', {
                method: 'POST',
                body: formData
            });
            
            const result = await response.json();
            
            if (result.status === 'success') {
                this.displayAnalysisResults(result.data);
            } else {
                throw new Error(result.error || 'Błąd analizy PDF');
            }
            
        } catch (error) {
            console.error('PDF analysis error:', error);
            this.showError(error.message);
        } finally {
            this.hideProgress();
        }
    }

    showProgress() {
        const progressSection = document.getElementById('pdf-analysis-progress');
        if (progressSection) {
            progressSection.classList.remove('hidden');
        }

        // Simulate progress
        this.uploadProgress = 0;
        const progressInterval = setInterval(() => {
            this.uploadProgress += Math.random() * 15;
            if (this.uploadProgress > 90) this.uploadProgress = 90;
            
            const progressBar = document.getElementById('pdf-progress-bar');
            if (progressBar) {
                progressBar.style.width = `${this.uploadProgress}%`;
            }
        }, 300);

        // Store interval ID for cleanup
        this.progressInterval = progressInterval;
    }

    hideProgress() {
        if (this.progressInterval) {
            clearInterval(this.progressInterval);
        }

        const progressBar = document.getElementById('pdf-progress-bar');
        if (progressBar) {
            progressBar.style.width = '100%';
        }

        setTimeout(() => {
            const progressSection = document.getElementById('pdf-analysis-progress');
            if (progressSection) {
                progressSection.classList.add('hidden');
            }
        }, 1000);
    }

    displayAnalysisResults(data) {
        console.log('📊 PDF Analysis results:', data);
        
        const resultsContainer = document.getElementById('pdf-analysis-results');
        if (resultsContainer) {
            resultsContainer.innerHTML = this.buildResultsHTML(data);
            resultsContainer.classList.remove('hidden');
        }
    }

    buildResultsHTML(data) {
        const analysis = data.analysis || {};
        const foundData = analysis.found_data || {};
        
        return `
            <div class="analysis-results">
                <h4>Wyniki analizy AI</h4>
                <div class="data-quality ${analysis.data_quality}">
                    Jakość danych: ${this.translateDataQuality(analysis.data_quality)}
                </div>
                
                <div class="extracted-data">
                    ${this.buildDataRow('Powierzchnia użytkowa', foundData.powierzchnia_uzytkowa, 'm²')}
                    ${this.buildDataRow('Wskaźnik EU', foundData.wskaznik_eu, 'kWh/m²·rok')}
                    ${this.buildDataRow('Lokalizacja', foundData.lokalizacja)}
                    ${this.buildDataRow('Moc grzewcza', foundData.moc_grzewcza, 'kW')}
                    ${this.buildDataRow('Rodzaj budynku', foundData.rodzaj_budynku)}
                </div>
                
                <div class="analysis-summary">
                    <h5>Podsumowanie:</h5>
                    <p>${analysis.analysis_summary || 'Brak podsumowania'}</p>
                </div>
                
                <div class="recommended-method">
                    <strong>Zalecana metoda:</strong> ${this.translateMethod(analysis.recommended_calculation_method)}
                </div>
            </div>
        `;
    }

    buildDataRow(label, value, unit = '') {
        const displayValue = value !== null && value !== undefined ? 
            `${value} ${unit}`.trim() : 'Nie znaleziono';
        
        return `
            <div class="data-row ${value ? 'found' : 'not-found'}">
                <span class="label">${label}:</span>
                <span class="value">${displayValue}</span>
            </div>
        `;
    }

    translateDataQuality(quality) {
        const translations = {
            'good': 'Dobra',
            'partial': 'Częściowa', 
            'insufficient': 'Niewystarczająca'
        };
        return translations[quality] || quality;
    }

    translateMethod(method) {
        const translations = {
            'zordon_formula': 'Formuła Zordon',
            'direct_power': 'Moc bezpośrednia',
            'manual_input': 'Wprowadzenie ręczne'
        };
        return translations[method] || method;
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    showError(message) {
        const errorContainer = document.getElementById('pdf-error');
        if (errorContainer) {
            errorContainer.textContent = message;
            errorContainer.classList.remove('hidden');
        } else {
            alert(message);
        }
    }
}

// Export for module use
export default PDFAnalyzer;

// Also provide global access for backward compatibility
window.PDFAnalyzer = PDFAnalyzer;