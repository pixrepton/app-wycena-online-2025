/**
 * Simple Welcome Screen Handler
 * Manages direct mode transitions
 */

// Simple function to activate selected mode
window.activateMode = function(modeType) {
    console.log('Activating mode:', modeType);
    
    // Hide welcome screen
    const welcomeScreen = document.getElementById('welcome-screen');
    welcomeScreen.classList.add('hidden');
    welcomeScreen.classList.remove('active');
    
    // Show appropriate section based on mode
    switch(modeType) {
        case 'mode1':
            // Show full calculator form
            const fullForm = document.getElementById('heatCalcFormFull');
            if (fullForm) {
                fullForm.classList.remove('hidden');
                fullForm.classList.add('active');
                console.log('Full calculator activated');
            }
            break;
            
        case 'mode2':
            // Show construction project mode (will be handled by intelligentModeHandler)
            if (window.IntelligentMode && window.IntelligentMode.activateMode) {
                window.IntelligentMode.activateMode('mode2');
            }
            console.log('Construction project mode activated');
            break;
            
        case 'mode3':
            // Show modernization mode (will be handled by intelligentModeHandler)
            if (window.IntelligentMode && window.IntelligentMode.activateMode) {
                window.IntelligentMode.activateMode('mode3');
            }
            console.log('Modernization mode activated');
            break;
            
        case 'mode4':
            // Show known power mode (will be handled by intelligentModeHandler)
            if (window.IntelligentMode && window.IntelligentMode.activateMode) {
                window.IntelligentMode.activateMode('mode4');
            }
            console.log('Known power mode activated');
            break;
            
        default:
            console.warn('Unknown mode:', modeType);
    }
}

// Function to return to welcome screen
window.showWelcomeScreen = function() {
    console.log('Returning to welcome screen');
    
    // Hide all mode sections
    const allSections = document.querySelectorAll('.section');
    allSections.forEach(section => {
        if (section.id !== 'welcome-screen') {
            section.classList.add('hidden');
            section.classList.remove('active');
        }
    });
    
    // Show welcome screen
    const welcomeScreen = document.getElementById('welcome-screen');
    welcomeScreen.classList.remove('hidden');
    welcomeScreen.classList.add('active');
}

console.log('Simple Welcome Screen loaded successfully');

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    console.log('Welcome Screen ready');
});