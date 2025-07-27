// === FILE: dynamicFields.js ===
// 🧠 Obsługuje: Dynamiczne pokazywanie/ukrywanie pól w zależności od wyboru użytkownika

(function() {
    'use strict';

    /**
     * Funkcja pomocnicza do zarządzania widocznością elementów
     */
    function toggleDisplay(elem, condition) {
    if (elem) {
        elem.classList.toggle("hidden", !condition);
        elem.style.display = condition ? "block" : "none";
    }
}

/**
 * Przełącza opcje CWU (ciepłej wody użytkowej)
 */
function toggleHotWaterOptions() {
    const hotWaterCheckbox = document.getElementById("includeHotWater");
    const hotWaterOptions = document.getElementById("hotWaterOptions");

    if (hotWaterCheckbox && hotWaterOptions) {
        toggleDisplay(hotWaterOptions, hotWaterCheckbox.checked);
    }
}

/**
 * Główna funkcja inicjalizująca wszystkie dynamiczne pola
 */
function setupDynamicFields() {
    // === 1. KSZTAŁT BUDYNKU ===
    const buildingShapeSelect = document.getElementById('buildingShape');
    const regularFields = document.getElementById('regularFields');
    const irregularFields = document.getElementById('irregularFields');

    if (buildingShapeSelect) {
        buildingShapeSelect.addEventListener('change', function() {
            if (this.value === 'regular') {
                toggleDisplay(regularFields, true);
                toggleDisplay(irregularFields, false);
            } else if (this.value === 'irregular') {
                toggleDisplay(regularFields, false);
                toggleDisplay(irregularFields, true);
            }
        });
    }

    // === 2. METODA WPROWADZANIA WYMIARÓW (dla regularnych) ===
    const regularMethodSelect = document.getElementById('regularMethod');
    const dimensionsFields = document.getElementById('dimensionsFields');
    const areaField = document.getElementById('areaField');

    if (regularMethodSelect) {
        regularMethodSelect.addEventListener('change', function() {
            if (this.value === 'dimensions') {
                toggleDisplay(dimensionsFields, true);
                toggleDisplay(areaField, false);
            } else if (this.value === 'area') {
                toggleDisplay(dimensionsFields, false);
                toggleDisplay(areaField, true);
            }
        });
    }

    // === 3. BALKONY ===
    const hasBalconyCheckbox = document.querySelector('input[name="has_balcony"]');
    const balconyFields = document.getElementById('balconyFields');

    if (hasBalconyCheckbox) {
        hasBalconyCheckbox.addEventListener('change', function() {
            toggleDisplay(balconyFields, this.checked);
        });
    }

    // === 4. GARAŻ ===
    const garageTypeSelect = document.querySelector('select[name="garage_type"]');
    const garageFields = document.getElementById('garageFields');

    if (garageTypeSelect) {
        garageTypeSelect.addEventListener('change', function() {
            toggleDisplay(garageFields, this.value !== 'none');
        });
    }

    // === 4.5. KONSTRUKCJA KANADYJSKA ===
    const constructionTypeSelect = document.getElementById('constructionType');
    const traditionalOptions = document.getElementById('traditionalOptions');
    const canadianOptions = document.getElementById('canadianOptions');

    if (constructionTypeSelect) {
        constructionTypeSelect.addEventListener('change', function() {
            if (this.value === 'traditional') {
                toggleDisplay(traditionalOptions, true);
                toggleDisplay(canadianOptions, false);
            } else if (this.value === 'canadian') {
                toggleDisplay(traditionalOptions, false);
                toggleDisplay(canadianOptions, true);
            }
        });
    }

    // === 4.6. IZOLACJA WEWNĘTRZNA (dla kanadyjskiej) ===
    const hasInternalIsolationCheckbox = document.getElementById('hasInternalIsolation');
    const internalIsolationFields = document.getElementById('internalIsolationFields');

    if (hasInternalIsolationCheckbox) {
        hasInternalIsolationCheckbox.addEventListener('change', function() {
            toggleDisplay(internalIsolationFields, this.checked);
        });
    }

    // === 5. MATERIAŁ DODATKOWY ŚCIAN ===
    const hasSecondaryWallCheckbox = document.getElementById('hasSecondaryWallMaterial');
    const secondaryWallFields = document.getElementById('secondaryWallFields');

    if (hasSecondaryWallCheckbox) {
        hasSecondaryWallCheckbox.addEventListener('change', function() {
            toggleDisplay(secondaryWallFields, this.checked);
        });
    }

    // === 6. IZOLACJA ZEWNĘTRZNA ===
    const hasExternalIsolationCheckbox = document.getElementById('hasExternalIsolation');
    const externalIsolationFields = document.getElementById('externalIsolationFields');

    if (hasExternalIsolationCheckbox) {
        hasExternalIsolationCheckbox.addEventListener('change', function() {
            toggleDisplay(externalIsolationFields, this.checked);
        });
    }

    // === 7. IZOLACJA DACHU ===
    const topIsolationSelect = document.getElementById('hasTopIsolation');
    const topIsolationFields = document.getElementById('topIsolationFields');

    if (topIsolationSelect) {
        topIsolationSelect.addEventListener('change', function() {
            toggleDisplay(topIsolationFields, this.value === 'yes');
        });
    }

    // === 8. IZOLACJA PODŁOGI ===
    const bottomIsolationSelect = document.getElementById('hasBottomIsolation');
    const bottomIsolationFields = document.getElementById('bottomIsolationFields');

    if (bottomIsolationSelect) {
        bottomIsolationSelect.addEventListener('change', function() {
            toggleDisplay(bottomIsolationFields, this.value === 'yes');
        });
    }

    // === 9. CIEPŁA WODA UŻYTKOWA ===
    const hotWaterCheckbox = document.getElementById("includeHotWater");
    if (hotWaterCheckbox) {
        hotWaterCheckbox.addEventListener('change', toggleHotWaterOptions);
        // Inicjalizuj stan na starcie
        toggleHotWaterOptions();
    }

    // === 10. RENDEROWANIE PIĘTER BUDYNKU ===
    // Uwaga: Event listenery dla renderowania pięter są obsługiwane w floorRenderer.js
    // poprzez initFloorRenderingListeners() - nie duplikujemy logiki tutaj

    function triggerFloorRendering() {
        // Ta funkcja jest zachowana dla kompatybilności wstecznej
        if (typeof window.renderHeatedFloors === 'function') {
            setTimeout(() => {
                window.renderHeatedFloors();
            }, 100);
        } else {
            console.warn('Funkcja renderHeatedFloors nie jest zdefiniowana.');
        }
    }


    // === 10. INICJALIZACJA STANÓW DOMYŚLNYCH ===
    // Ustaw domyślne stany na podstawie aktualnych wartości

    // Kształt budynku
    if (buildingShapeSelect && regularFields && irregularFields) {
        if (buildingShapeSelect.value === 'regular') {
            toggleDisplay(regularFields, true);
            toggleDisplay(irregularFields, false);
        } else if (buildingShapeSelect.value === 'irregular') {
            toggleDisplay(regularFields, false);
            toggleDisplay(irregularFields, true);
        }
    }

    // Konstrukcja budynku
    if (constructionTypeSelect) {
        if (constructionTypeSelect.value === 'traditional') {
            toggleDisplay(traditionalOptions, true);
            toggleDisplay(canadianOptions, false);
        } else if (constructionTypeSelect.value === 'canadian') {
            toggleDisplay(traditionalOptions, false);
            toggleDisplay(canadianOptions, true);
        }
    }

    // Izolacja wewnętrzna
    if (hasInternalIsolationCheckbox) {
        toggleDisplay(internalIsolationFields, hasInternalIsolationCheckbox.checked);
    }

    // Metoda wymiarów dla regularnych
    if (regularMethodSelect && dimensionsFields && areaField) {
        if (regularMethodSelect.value === 'dimensions') {
            toggleDisplay(dimensionsFields, true);
            toggleDisplay(areaField, false);
        } else if (regularMethodSelect.value === 'area') {
            toggleDisplay(dimensionsFields, false);
            toggleDisplay(areaField, true);
        }
    }

    // Balkony
    if (hasBalconyCheckbox) {
        toggleDisplay(balconyFields, hasBalconyCheckbox.checked);
    }

    // Garaż
    if (garageTypeSelect) {
        toggleDisplay(garageFields, garageTypeSelect.value !== 'none');
    }

    // Materiał dodatkowy ścian
    if (hasSecondaryWallCheckbox) {
        toggleDisplay(secondaryWallFields, hasSecondaryWallCheckbox.checked);
    }

    // Izolacja zewnętrzna
    if (hasExternalIsolationCheckbox) {
        toggleDisplay(externalIsolationFields, hasExternalIsolationCheckbox.checked);
    }

    // Izolacja dachu
    if (topIsolationSelect && topIsolationFields) {
        toggleDisplay(topIsolationFields, topIsolationSelect.value === 'yes');
    }

    // Izolacja podłogi
    if (bottomIsolationSelect && bottomIsolationFields) {
        toggleDisplay(bottomIsolationFields, bottomIsolationSelect.value === 'yes');
    }

    // CWU - inicjalizacja stanu
    if (hotWaterCheckbox) {
        toggleHotWaterOptions();
    }


    }

    // Global exports
    window.setupDynamicFields = setupDynamicFields;
    window.toggleDisplay = toggleDisplay;
    window.toggleHotWaterOptions = toggleHotWaterOptions;

})();