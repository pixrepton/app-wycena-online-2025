// === FILE: aiWatchers.js ===
// 🧠 Obsługuje: AI Watchers - 5 systemów śledzenia zachowań użytkownika
// 🔒 GDPR Compliant - wymaga zgody użytkownika

(function() {
    'use strict';

    // GDPR compliance check
    function canTrack() {
        return typeof window.canTrack === 'function' 
            ? window.canTrack('analytics') 
            : false; // Default: no tracking without consent
    }

    // Debug flags (tylko gdy tracking dozwolony)
    const DEBUG_LIVE_FORM_DATA = false;
    const DEBUG_USER_PATH = false;
    const DEBUG_TIMESTAMP_LOG = false;
    const DEBUG_FORM_ANOMALIES = false;
    const DEBUG_USER_ACTIVITY = false;

// === SYSTEM 1: LIVE FORM DATA ===
function initLiveFormData() {
    if (!canTrack()) {
        
        return;
    }
    
    window.liveFormData = {};
    
    function updateLiveData(element) {
        if (!element || !element.name) return;
        
        const value = element.type === 'checkbox' ? element.checked : element.value;
        window.liveFormData[element.name] = {
            value: value,
            timestamp: Date.now(),
            element_type: element.type,
            step: window.currentTab || 0
        };
        
        if (DEBUG_LIVE_FORM_DATA) {
            
        }
    }
    
    // Attach listeners do wszystkich pól formularza
    const formElements = document.querySelectorAll('#top-instal-calc input, #top-instal-calc select, #top-instal-calc textarea');
    formElements.forEach(element => {
        element.addEventListener('input', () => updateLiveData(element));
        element.addEventListener('change', () => updateLiveData(element));
    });
    
    
}

// === SYSTEM 2: USER PATH HISTORY ===
function initUserPathHistory() {
    if (!canTrack()) {
        
        return;
    }
    
    window.userPathHistory = [];
    
    function trackFieldFocus(element) {
        if (!element || !element.name) return;
        
        const pathEntry = {
            field_name: element.name,
            field_type: element.type,
            timestamp: Date.now(),
            step: window.currentTab || 0,
            sequence_number: window.userPathHistory.length + 1
        };
        
        window.userPathHistory.push(pathEntry);
        
        if (DEBUG_USER_PATH) {
            
        }
    }
    
    // Track focus events
    const formElements = document.querySelectorAll('#top-instal-calc input, #top-instal-calc select, #top-instal-calc textarea');
    formElements.forEach(element => {
        element.addEventListener('focus', () => trackFieldFocus(element));
    });
    
    
}

// === SYSTEM 3: TIMESTAMP LOG ===
function initTimestampLog() {
    if (!canTrack()) {
        
        return;
    }
    
    window.timestampLog = [];
    
    function logInteraction(label, actionType = 'change', value = null) {
        const logEntry = {
            timestamp: Date.now(),
            datetime: new Date().toISOString(),
            label: label,
            action: actionType,
            value: value,
            step: window.currentTab || 0
        };
        
        window.timestampLog.push(logEntry);
        
        if (DEBUG_TIMESTAMP_LOG) {
            
        }
    }
    
    // Track różne typy interakcji
    document.addEventListener('click', function(e) {
        if (e.target.matches('#top-instal-calc button, #top-instal-calc .btn-next, #top-instal-calc .btn-prev')) {
            logInteraction(e.target.className || e.target.textContent, 'click', e.target.textContent);
        }
    });
    
    // Track form changes
    const formElements = document.querySelectorAll('#top-instal-calc input, #top-instal-calc select, #top-instal-calc textarea');
    formElements.forEach(element => {
        element.addEventListener('change', function() {
            const value = this.type === 'checkbox' ? this.checked : this.value;
            logInteraction(this.name || this.id, 'change', value);
        });
    });
    
    
}

// === SYSTEM 4: FORM ANOMALIES ===
function checkForAnomalies(data) {
    const anomalies = [];
    
    // Sprawdź szybkie wypełnianie (< 1 sekunda między polami)
    if (window.userPathHistory && window.userPathHistory.length > 1) {
        const recent = window.userPathHistory.slice(-2);
        const timeDiff = recent[1].timestamp - recent[0].timestamp;
        if (timeDiff < 1000) {
            anomalies.push({
                type: 'fast_filling',
                message: 'Bardzo szybkie wypełnianie pól',
                timestamp: Date.now()
            });
        }
    }
    
    // Sprawdź nielogiczne wartości
    if (data.heated_area && data.total_area) {
        if (parseFloat(data.heated_area) > parseFloat(data.total_area)) {
            anomalies.push({
                type: 'logic_error',
                message: 'Powierzchnia ogrzewana większa niż całkowita',
                timestamp: Date.now()
            });
        }
    }
    
    return anomalies;
}

function initFormAnomalies() {
    if (!canTrack()) {
        
        return;
    }
    
    window.formAnomalies = [];
    
    // Sprawdzaj anomalie co 5 sekund
    setInterval(() => {
        const formData = window.liveFormData || {};
        const anomalies = checkForAnomalies(formData);
        
        if (anomalies.length > 0) {
            window.formAnomalies.push(...anomalies);
            
            if (DEBUG_FORM_ANOMALIES) {
                
            }
            
            // Wyślij custom event
            document.dispatchEvent(new CustomEvent('formAnomaliesDetected', {
                detail: { anomalies: anomalies }
            }));
        }
    }, 5000);
    
    
}

// === SYSTEM 5: USER ACTIVITY TRACKER ===
function initUserActivityTracker() {
    if (!canTrack()) {
        
        return;
    }
    
    let idleTimer = null;
    let isIdle = false;
    const IDLE_TIME = 30000; // 30 sekund
    
    function resetIdleTimer() {
        if (idleTimer) clearTimeout(idleTimer);
        
        if (isIdle) {
            isIdle = false;
            if (DEBUG_USER_ACTIVITY) {
                
            }
            document.dispatchEvent(new CustomEvent('userBecameActive'));
        }
        
        idleTimer = setTimeout(() => {
            isIdle = true;
            if (DEBUG_USER_ACTIVITY) {
                
            }
            document.dispatchEvent(new CustomEvent('userBecameIdle'));
        }, IDLE_TIME);
    }
    
    // Track user activity
    ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'].forEach(event => {
        document.addEventListener(event, resetIdleTimer, true);
    });
    
    // Initial timer
    resetIdleTimer();
    
    
}

// === GŁÓWNA FUNKCJA INICJALIZACJI ===
function initAIWatchers() {
    
    
    try {
        initLiveFormData();
        initUserPathHistory();
        initTimestampLog();
        initFormAnomalies();
        initUserActivityTracker();
        
        
        
        // Expose helper functions globally
        window.getLiveFormData = () => window.liveFormData || {};
        window.getUserPathHistory = () => window.userPathHistory || [];
        window.getTimestampLog = () => window.timestampLog || [];
        window.getFormAnomalies = () => window.formAnomalies || [];
        
        window.clearLiveFormData = () => { window.liveFormData = {}; };
        window.clearUserPathHistory = () => { window.userPathHistory = []; };
        window.clearTimestampLog = () => { window.timestampLog = []; };
        window.clearFormAnomalies = () => { window.formAnomalies = []; };
        
        // Stats function
        window.getInteractionStats = () => {
            const stats = {
                totalFields: Object.keys(window.liveFormData || {}).length,
                pathLength: (window.userPathHistory || []).length,
                totalInteractions: (window.timestampLog || []).length,
                anomaliesCount: (window.formAnomalies || []).length,
                currentStep: window.currentTab || 0
            };
            return stats;
        };
        
    } catch (error) {
        console.error('❌ Błąd podczas inicjalizacji AI Watchers:', error);
    }
    }

    // Global exports
    window.initAIWatchers = initAIWatchers;
    window.checkForAnomalies = checkForAnomalies;

})();