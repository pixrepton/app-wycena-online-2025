
// ========== NUMBER SPINNERS FUNCTIONALITY ==========
// Automatyczne dodawanie przycisków +/- do pól numerycznych

function initNumberSpinners() {
    // NUMBER SPINNERS WYŁĄCZONE - funkcja pusta
    return;
}

// Inicjalizuj po załadowaniu DOM
document.addEventListener('DOMContentLoaded', function() {
    initNumberSpinners();
    
    // Reinicjalizuj po dynamicznych zmianach w formularzu
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach(function(node) {
                    if (node.nodeType === 1) { // Element node
                        const newInputs = node.querySelectorAll('input[type="number"]');
                        if (newInputs.length > 0) {
                            setTimeout(initNumberSpinners, 100);
                        }
                    }
                });
            }
        });
    });
    
    // Obserwuj zmiany w kontenerze kalkulatora
    const calcContainer = document.getElementById('top-instal-calc');
    if (calcContainer) {
        observer.observe(calcContainer, {
            childList: true,
            subtree: true
        });
    }
});

// Eksportuj funkcję dla użycia w innych skryptach
if (typeof window !== 'undefined') {
    window.initNumberSpinners = initNumberSpinners;
}
