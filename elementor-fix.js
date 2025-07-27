// === ELEMENTOR COMPATIBILITY FIX ===
// Defensywne sprawdzenie dla elementorFrontendConfig i ElementorProFrontendConfig
// Zapobiega błędom ReferenceError w środowisku bez Elementor

(function() {
    'use strict';

    // Sprawdź czy jesteśmy w środowisku WordPress z Elementor
    if (typeof window !== 'undefined') {
        
        // Fix dla elementorFrontendConfig
        if (typeof elementorFrontendConfig === 'undefined') {
            window.elementorFrontendConfig = {
                environmentMode: {
                    edit: false,
                    wpPreview: false,
                    isScriptDebug: false
                },
                i18n: {},
                is_rtl: false,
                breakpoints: {
                    xs: 0,
                    sm: 480,
                    md: 768,
                    lg: 1025,
                    xl: 1440,
                    xxl: 1600
                },
                responsive: {
                    breakpoints: {}
                },
                version: '3.0.0',
                urls: {
                    assets: '',
                    ajaxurl: ''
                }
            };
            console.log('🔧 Elementor config fallback loaded');
        }

        // Fix dla ElementorProFrontendConfig
        if (typeof ElementorProFrontendConfig === 'undefined') {
            window.ElementorProFrontendConfig = {
                ajaxurl: '',
                nonce: '',
                urls: {
                    assets: '',
                    rest: ''
                },
                settings: {}
            };
            console.log('🔧 ElementorPro config fallback loaded');
        }

        // Try-catch wrapper dla kodu który używa Elementor
        window.safeElementorCall = function(callback) {
            try {
                if (typeof callback === 'function') {
                    return callback();
                }
            } catch (error) {
                console.warn('⚠️ Elementor function call failed (safe fallback):', error.message);
                return null;
            }
        };
    }

})();