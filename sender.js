/**
 * Email Sender - Wysyłanie PDF i powiadomień email
 * Zgodnie z dokumentacją README-WYCENA2025-v2.md
 */

class EmailSender {
    constructor() {
        this.baseURL = window.location.origin;
        this.debugMode = window.ZORDON_DEBUG || false;
        
        this.debug('EmailSender initialized');
    }

    debug(message, data = null) {
        if (this.debugMode) {
            console.log('📧 EmailSender:', message, data || '');
        }
    }

    /**
     * Wyślij PDF offer na email
     * @param {Object} emailData - Dane email i załącznika
     * @returns {Promise<Object>} Status wysyłki
     */
    async sendPDFOffer(emailData) {
        this.debug('Sending PDF offer', emailData);

        try {
            const response = await fetch(`${this.baseURL}/backend_php/email-proxy.php`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    email: emailData.email,
                    customerName: emailData.name || 'Klient',
                    pdfData: emailData.pdfData,
                    offerDetails: emailData.offerDetails || {},
                    language: 'pl'
                })
            });

            if (!response.ok) {
                throw new Error(`Email send failed: ${response.status}`);
            }

            const result = await response.json();
            this.debug('Email sent successfully', result);

            // Aktualizuj ZORDON_STATE
            if (window.updateZORDON) {
                window.updateZORDON({
                    emailSent: true,
                    emailSentAt: new Date().toISOString()
                });
            }

            return {
                status: 'success',
                message: 'Email został wysłany pomyślnie',
                messageId: result.messageId
            };

        } catch (error) {
            this.debug('Email send error', error);
            return {
                status: 'error',
                error: error.message
            };
        }
    }

    /**
     * Wyślij email z danymi z ZORDON_STATE
     * @param {string} email - Adres email odbiorcy
     * @returns {Promise<Object>} Status wysyłki
     */
    async sendFromZordonState(email) {
        const zordonData = window.ZORDON_STATE || {};
        
        const emailData = {
            email: email,
            name: zordonData.name || 'Klient',
            offerDetails: {
                mocSzacowana: zordonData.mocSzacowana,
                kit: zordonData.kit,
                buffer: zordonData.buffer,
                cwu: zordonData.cwu,
                price: zordonData.price,
                powierzchnia: zordonData.powierzchnia
            }
        };

        return this.sendPDFOffer(emailData);
    }

    /**
     * Przygotuj dane email z istniejącego systemu
     * @returns {Object} Przygotowane dane
     */
    prepareEmailDataFromSystem() {
        const zordonData = window.ZORDON_STATE || {};
        
        return {
            customerData: {
                email: zordonData.email,
                name: zordonData.name,
                phone: zordonData.phone
            },
            calculationData: {
                mode: zordonData.currentMode,
                powierzchnia: zordonData.powierzchnia,
                mocSzacowana: zordonData.mocSzacowana,
                kit: zordonData.kit,
                price: zordonData.price
            },
            timestamp: zordonData.timestamp
        };
    }

    /**
     * Integracja z istniejącym systemem wysyłki
     * @param {string} email - Email odbiorcy
     * @param {Blob} pdfBlob - Blob z PDF
     * @returns {Promise<Object>} Status
     */
    async sendWithExistingSystem(email, pdfBlob) {
        // Sprawdź czy istnieje stary system emailSender
        if (window.sendEmailWithPDF && typeof window.sendEmailWithPDF === 'function') {
            try {
                this.debug('Using existing email system');
                return await window.sendEmailWithPDF(email, pdfBlob);
            } catch (error) {
                this.debug('Existing system failed, using new system');
            }
        }

        // Konwertuj PDF blob do base64
        const pdfData = await this.blobToBase64(pdfBlob);
        
        return this.sendPDFOffer({
            email: email,
            pdfData: pdfData,
            offerDetails: this.prepareEmailDataFromSystem().calculationData
        });
    }

    /**
     * Konwertuj Blob do base64
     * @param {Blob} blob - Blob do konwersji
     * @returns {Promise<string>} Base64 string
     */
    async blobToBase64(blob) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => {
                const base64 = reader.result.split(',')[1]; // Usuń prefix data:...;base64,
                resolve(base64);
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }

    /**
     * Wyślij powiadomienie o nowej kalkulacji (dla admina)
     * @param {Object} calculationData - Dane kalkulacji
     * @returns {Promise<Object>} Status
     */
    async sendAdminNotification(calculationData) {
        try {
            const response = await fetch(`${this.baseURL}/api/email/admin-notification`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    type: 'new_calculation',
                    data: calculationData,
                    timestamp: new Date().toISOString()
                })
            });

            const result = await response.json();
            this.debug('Admin notification sent', result);
            return result;

        } catch (error) {
            this.debug('Admin notification error', error);
            return { status: 'error', error: error.message };
        }
    }

    /**
     * Sprawdź status serwisu email
     * @returns {Promise<Object>} Status serwisu
     */
    async checkEmailServiceStatus() {
        try {
            const response = await fetch(`${this.baseURL}/api/email/health`);
            const status = await response.json();
            this.debug('Email service status', status);
            return status;
        } catch (error) {
            return { status: 'error', error: error.message };
        }
    }
}

// Globalna instancja
window.EmailSender = new EmailSender();

// Backward compatibility functions
window.sendOfferEmail = async (email, pdfBlob) => {
    return window.EmailSender.sendWithExistingSystem(email, pdfBlob);
};

window.notifyAdmin = async (data) => {
    return window.EmailSender.sendAdminNotification(data);
};

// Export for ES6
if (typeof module !== 'undefined' && module.exports) {
    module.exports = EmailSender;
}

console.log('📧 EmailSender loaded successfully');