/**
 * PDF Analyzer Service - AI PDF analysis client
 * Part of Wycena 2025 architectural refactoring
 */

class PDFAnalyzerService {
    constructor() {
        this.apiClient = window.APIClient;
        this.debugMode = window.ZORDON_DEBUG || false;
        
        this.debug('PDFAnalyzerService initialized');
    }

    debug(message, data = null) {
        if (this.debugMode) {
            console.log(`📄 PDFAnalyzer: ${message}`, data || '');
        }
    }

    /**
     * Analyze PDF document with AI
     * @param {File} file - PDF file to analyze
     * @param {Object} options - Analysis options
     * @returns {Promise<Object>} Analysis results
     */
    async analyzePDF(file, options = {}) {
        this.debug('Starting PDF analysis', { 
            fileName: file.name, 
            fileSize: file.size,
            options 
        });

        // Validate file
        if (!this.validatePDFFile(file)) {
            throw new Error('Invalid PDF file');
        }

        try {
            // Upload and analyze
            const result = await this.apiClient.uploadFile('/api/analyze-pdf', file, {
                analysisType: options.analysisType || 'building_project',
                language: options.language || 'pl'
            });

            this.debug('PDF analysis completed', result);

            // Process and validate result
            return this.processAnalysisResult(result);

        } catch (error) {
            this.debug(`PDF analysis failed: ${error.message}`);
            throw new AnalysisError(`Analiza PDF nie powiodła się: ${error.message}`, error);
        }
    }

    /**
     * Validate PDF file
     */
    validatePDFFile(file) {
        // Check file type
        if (!file.type.includes('pdf') && !file.name.toLowerCase().endsWith('.pdf')) {
            this.debug('Invalid file type', file.type);
            return false;
        }

        // Check file size (max 10MB)
        const maxSize = 10 * 1024 * 1024; // 10MB
        if (file.size > maxSize) {
            this.debug('File too large', { size: file.size, maxSize });
            return false;
        }

        // Check if file is not empty
        if (file.size === 0) {
            this.debug('Empty file');
            return false;
        }

        return true;
    }

    /**
     * Process analysis result
     */
    processAnalysisResult(result) {
        // Validate result structure
        if (!result || typeof result !== 'object') {
            throw new Error('Invalid analysis result format');
        }

        if (result.status === 'error') {
            throw new Error(result.error || 'Analysis failed');
        }

        if (result.status !== 'success' || !result.data) {
            throw new Error('Analysis did not complete successfully');
        }

        const data = result.data;

        // Ensure required fields exist
        const processedResult = {
            success: true,
            analysis: data.analysis || {},
            heatingCalculation: data.heating_calculation || {},
            recommendations: data.recommendations || [],
            extractedData: data.extracted_data || {},
            confidence: data.confidence || 0,
            timestamp: new Date().toISOString()
        };

        // Validate critical data
        if (!processedResult.heatingCalculation.calculated_power) {
            this.debug('Warning: No calculated power in result');
        }

        this.debug('Analysis result processed', processedResult);
        return processedResult;
    }

    /**
     * Get analysis status
     */
    async getAnalysisStatus(analysisId) {
        try {
            const result = await this.apiClient.get(`/api/analysis-status/${analysisId}`);
            return result;
        } catch (error) {
            this.debug(`Status check failed: ${error.message}`);
            throw error;
        }
    }

    /**
     * Cancel analysis
     */
    async cancelAnalysis(analysisId) {
        try {
            const result = await this.apiClient.delete(`/api/analysis/${analysisId}`);
            this.debug('Analysis cancelled', { analysisId });
            return result;
        } catch (error) {
            this.debug(`Cancel failed: ${error.message}`);
            throw error;
        }
    }

    /**
     * Get supported file types
     */
    getSupportedTypes() {
        return [
            'application/pdf',
            '.pdf'
        ];
    }

    /**
     * Get maximum file size
     */
    getMaxFileSize() {
        return 10 * 1024 * 1024; // 10MB
    }

    /**
     * Extract text from PDF (client-side, if needed)
     */
    async extractTextFromPDF(file) {
        // This would require a PDF parsing library like pdf-lib or PDF.js
        // For now, return a placeholder
        this.debug('Client-side text extraction not implemented');
        return 'Text extraction requires server-side processing';
    }
}

/**
 * Analysis Error class
 */
class AnalysisError extends Error {
    constructor(message, originalError = null) {
        super(message);
        this.name = 'AnalysisError';
        this.originalError = originalError;
    }
}

// Global instance
window.PDFAnalyzerService = new PDFAnalyzerService();

// Export for ES6 modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { PDFAnalyzerService, AnalysisError };
}