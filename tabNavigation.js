// === FILE: tabNavigation.js ===
// 🧠 Obsługuje: System nawigacji między zakładkami kalkulatora z walidacją

(function() {
    'use strict';

    /**
     * Wyświetla określoną zakładkę kalkulatora
     */
    function showTab(index) {
        try {
            // Try different selectors to find sections
            if (!window.sections || window.sections.length === 0) {
                // First try the main calculator form
                let foundSections = document.querySelectorAll("#heatCalcFormFull .section");
                
                // Fallback to old selector
                if (foundSections.length === 0) {
                    foundSections = document.querySelectorAll("#top-instal-calc .section");
                }
                
                // Last resort - any section with data-tab
                if (foundSections.length === 0) {
                    foundSections = document.querySelectorAll(".section[data-tab]");
                }
                
                window.sections = foundSections;
                console.log(`Found ${window.sections.length} calculator sections`);
            }

            if (index < 0 || index >= window.sections.length) {
                console.warn(`Invalid tab index: ${index}, available tabs: ${window.sections.length}`);
                return;
            }

            // Ukryj wszystkie sekcje
            window.sections.forEach(section => {
                section.style.display = "none";
                section.classList.remove("active");
            });

            // Pokaż wybraną sekcję
            const activeSection = window.sections[index];
            activeSection.style.display = "block";
            activeSection.classList.add("active");

            // 🔽 Scroll – najpierw do progress bar, jeśli istnieje
            const progressBar = activeSection.querySelector('.progress-bar-premium');
            const scrollTarget = progressBar || activeSection;
            const offsetY = scrollTarget.getBoundingClientRect().top + window.scrollY - 20;
            window.scrollTo({ top: offsetY, behavior: "smooth" });

        } catch (error) {
            console.error('Błąd podczas przełączania zakładki:', error);
            // Fallback - spróbuj znaleźć sekcje ponownie
            window.sections = document.querySelectorAll("#top-instal-calc .section");
            if (window.sections.length > index && index >= 0) {
                window.sections[index].style.display = "block";
            }
        }

        // Aktualizuj globalny indeks
        window.currentTab = index;

        // Aktualizuj pasek postępu
        updateProgressBar(index);
    }

/**
 * Aktualizuje pasek postępu
 */
function updateProgressBar(activeIndex) {
    // Szukaj różnych wariantów paska postępu
    const progressContainers = [
        document.querySelector('.progress-bar-premium'),
        document.querySelector('.progress-bar'),
        document.querySelector('.progress-steps')
    ];

    const progressContainer = progressContainers.find(container => container !== null);

    if (progressContainer) {
        // Aktualizuj CSS custom property dla premium progress bar
        progressContainer.style.setProperty('--step', activeIndex + 1);

        // Znajdź kroki
        const progressSteps = progressContainer.querySelectorAll('.step');

        progressSteps.forEach((step, index) => {
            step.classList.remove('active', 'completed');

            if (index < activeIndex) {
                step.classList.add('completed');
            } else if (index === activeIndex) {
                step.classList.add('active');
            }
        });

        console.log(`📊 Pasek postępu zaktualizowany: krok ${activeIndex + 1}/${progressSteps.length}`);
    }
}

/**
 * Waliduje całą zakładkę przed przejściem dalej - UPROSZCZONA WERSJA
 */
function validateTab(tabIndex) {
    if (!window.sections || !window.sections[tabIndex]) {
        return true; // Brak sekcji = pozwól przejść
    }

    const section = window.sections[tabIndex];
    clearValidationErrors(section);

    let isValid = true;

    // Znajdź wszystkie wymagane pola w tej sekcji (tylko widoczne)
    const requiredFields = section.querySelectorAll('[required], [data-required="true"]');

    requiredFields.forEach(field => {
        // Sprawdź czy pole jest widoczne
        if (field.offsetParent === null || field.style.display === 'none') {
            return; // Pomiń ukryte pola
        }

        let isEmpty = false;

        // Sprawdź czy pole jest puste
        if (field.type === 'checkbox' || field.type === 'radio') {
            const checkedField = section.querySelector(`[name="${field.name}"]:checked`);
            isEmpty = !checkedField;
        } else {
            isEmpty = !field.value || field.value.trim() === '';
        }

        if (isEmpty) {
            markFieldAsInvalid(field, 'To pole jest wymagane');
            isValid = false;
        }
    });

    return isValid;
}

/**
 * Waliduje pojedyncze pole
 */
function validateField(field) {
    if (!field) return true;

    let isValid = true;
    let errorMessage = '';

    // Sprawdź czy pole jest widoczne
    if (field.offsetParent === null || field.style.display === 'none') {
        return true; // Pomiń ukryte pola
    }

    // Walidacja pustych pól
    if (field.hasAttribute('required') || field.hasAttribute('data-required')) {
        if (field.type === 'checkbox') {
            if (!field.checked) {
                isValid = false;
                errorMessage = 'To pole jest wymagane';
            }
        } else if (!field.value || field.value.trim() === '') {
            isValid = false;
            errorMessage = 'To pole jest wymagane';
        }
    }

    // Walidacja specjalna dla różnych typów pól
    if (field.value && field.value.trim() !== '') {
        switch (field.type) {
            case 'number':
                const numValue = parseFloat(field.value);
                if (isNaN(numValue)) {
                    isValid = false;
                    errorMessage = 'Wprowadź prawidłową liczbę';
                } else if (field.min && numValue < parseFloat(field.min)) {
                    isValid = false;
                    errorMessage = `Minimalna wartość: ${field.min}`;
                } else if (field.max && numValue > parseFloat(field.max)) {
                    isValid = false;
                    errorMessage = `Maksymalna wartość: ${field.max}`;
                }
                break;

            case 'email':
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(field.value)) {
                    isValid = false;
                    errorMessage = 'Wprowadź prawidłowy adres email';
                }
                break;
        }
    }

    if (!isValid) {
        markFieldAsInvalid(field, errorMessage);
    }

    return isValid;
}

/**
 * Walidacje specjalne dla poszczególnych sekcji - UPROSZCZONE
 */
function validateSpecificFields(section) {
    return true; // Wyłączone - tylko podstawowa walidacja required
}

/**
 * Walidacja pól warunkowo wymaganych - UPROSZCZONE
 */
function validateConditionalFields(section) {
    return true; // Wyłączone - tylko podstawowa walidacja required
}

/**
 * Oznacza pole jako nieprawidłowe
 */
function markFieldAsInvalid(field, customMessage = null) {
    // Usuń poprzednie błędy
    field.classList.remove('field-error');
    const existingError = field.parentNode.querySelector('.error-message');
    if (existingError) {
        existingError.remove();
    }

    // Dodaj klasę błędu
    field.classList.add('field-error');

    // Dodaj komunikat błędu
    const errorMessage = customMessage || getDefaultErrorMessage(field);
    const errorElement = document.createElement('div');
    errorElement.className = 'error-message';
    errorElement.textContent = errorMessage;
    errorElement.style.color = '#dc3545';
    errorElement.style.fontSize = '14px';
    errorElement.style.marginTop = '5px';

    field.parentNode.insertBefore(errorElement, field.nextSibling);

    // Scroll do pierwszego błędu
    if (field.parentNode.querySelector('.field-error') === field) {
        field.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
}

/**
 * Zwraca domyślny komunikat błędu dla pola
 */
function getDefaultErrorMessage(field) {
    if (field.hasAttribute('required') || field.hasAttribute('data-required')) {
        return 'To pole jest wymagane';
    }

    switch (field.type) {
        case 'number':
            return 'Wprowadź prawidłową liczbę';
        case 'email':
            return 'Wprowadź prawidłowy adres email';
        default:
            return 'Wartość w tym polu jest nieprawidłowa';
    }
}

/**
 * Funkcje nawigacji
 */
function nextStep() {
    let idx = window.currentTab || 0;
    if (validateTab(idx)) {
        showTab(idx + 1);
    }
}

function prevStep() {
    let idx = window.currentTab || 0;
    showTab(idx - 1);
}

/**
 * Dodaje wymagane atrybuty do pól
 */
function addRequiredAttributes() {
    // Lista pól wymaganych w każdym kroku
    const requiredFieldsByStep = {
        0: ['construction_year', 'heating_type', 'location_id'], // Krok 1: Podstawowe dane
        1: ['building_floors', 'heated_area'], // Krok 2: Wymiary budynku
        2: ['primary_wall_material', 'wall_size'], // Krok 3: Konstrukcja
        3: ['number_windows', 'windows_type', 'number_doors'], // Krok 4: Okna i drzwi
        4: [], // Krok 5: Izolacja (opcjonalna)
        5: ['r_max_power'] // Krok 6: Podsumowanie - moc wymagana
    };

    // Dodaj atrybut required do odpowiednich pól
    Object.entries(requiredFieldsByStep).forEach(([step, fields]) => {
        fields.forEach(fieldName => {
            const field = document.querySelector(`[name="${fieldName}"], #${fieldName}`);
            if (field && !field.hasAttribute('required')) {
                field.setAttribute('required', 'required');
            }
        });
    });

    // Specjalne przypadki - pola, które mogą być wymagane warunkowo
    const conditionalFields = [
        'hot_water_persons',
        'hot_water_usage'
    ];

    conditionalFields.forEach(fieldName => {
        const field = document.querySelector(`[name="${fieldName}"], #${fieldName}`);
        if (field) {
            field.setAttribute('data-conditional-required', 'true');
        }
    });
    }

    // Global exports
    window.showTab = showTab;
    window.validateTab = validateTab;
    window.validateField = validateField;
    window.validateSpecificFields = validateSpecificFields;
    window.validateConditionalFields = validateConditionalFields;
    window.markFieldAsInvalid = markFieldAsInvalid;
    window.clearValidationErrors = clearValidationErrors;
    window.getDefaultErrorMessage = getDefaultErrorMessage;
    window.nextStep = nextStep;
    window.prevStep = prevStep;
    window.addRequiredAttributes = addRequiredAttributes;

})();