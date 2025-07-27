// === FILE: floorRenderer.js ===
// 🧠 Obsługuje: Dynamiczne generowanie checkboxów dla ogrzewanych kondygnacji

(function() {
    'use strict';

    /**
     * Tworzy element checkbox z etykietą
     */
    function createCheckbox(name, value, labelText) {
        const label = document.createElement("label");
        const checkbox = document.createElement("input");
        
        // Ustaw właściwości checkbox
        checkbox.type = "checkbox";
        checkbox.name = name;
        checkbox.value = value;
        checkbox.style.width = "18px";
        checkbox.style.height = "18px";
        checkbox.style.marginRight = "12px";
        checkbox.style.accentColor = "#990013";
        
        // Ustaw style dla label
        label.style.display = "flex";
        label.style.alignItems = "center";
        label.style.gap = "12px";
        label.style.marginBottom = "8px";
        label.style.fontWeight = "normal";
        label.style.padding = "8px 12px";
        label.style.borderRadius = "6px";
        label.style.transition = "background-color 0.2s ease";
        label.style.cursor = "pointer";
        
        // Dodaj hover effect
        label.addEventListener('mouseenter', () => {
            label.style.backgroundColor = "#f8f9fa";
        });
        
        label.addEventListener('mouseleave', () => {
            label.style.backgroundColor = "transparent";
        });
        
        // Utwórz span dla tekstu
        const textSpan = document.createElement("span");
        textSpan.textContent = labelText;
        textSpan.style.fontSize = "15px";
        textSpan.style.color = "#333";
        
        label.appendChild(checkbox);
        label.appendChild(textSpan);
        
        return label;
    }

// Przechowywanie poprzedniego stanu dla porównania
let previousFloorState = null;

/**
 * Sprawdza czy stan budynku się zmienił
 */
function hasFloorStateChanged(floors, hasBasement, roofType) {
    const currentState = { floors, hasBasement, roofType };
    const changed = !previousFloorState || 
                   JSON.stringify(previousFloorState) !== JSON.stringify(currentState);
    
    if (changed) {
        previousFloorState = currentState;
    }
    
    return changed;
}

/**
 * Zachowuje zaznaczone piętra przed re-renderem
 */
function preserveSelectedFloors() {
    const container = document.getElementById("heatedFloorsContainer");
    if (!container) return [];
    
    const checkboxes = container.querySelectorAll('input[type="checkbox"]:checked');
    return Array.from(checkboxes).map(cb => cb.value);
}

/**
 * Przywraca zaznaczone piętra po re-renderze
 */
function restoreSelectedFloors(selectedValues) {
    if (!selectedValues || selectedValues.length === 0) return;
    
    const container = document.getElementById("heatedFloorsContainer");
    if (!container) return;
    
    selectedValues.forEach(value => {
        const checkbox = container.querySelector(`input[value="${value}"]`);
        if (checkbox) {
            checkbox.checked = true;
        }
    });
}

/**
 * Renderuje dynamicznie checkboxy dla ogrzewanych kondygnacji
 * na podstawie konfiguracji budynku (liczba pięter, piwnica, typ dachu)
 */
function renderHeatedFloors() {
    try {
        const floorsSelect = document.querySelector('#top-instal-calc [name="building_floors"]') || 
                           document.querySelector('[name="building_floors"]');
        const basementCheckbox = document.querySelector('#top-instal-calc [name="has_basement"]') || 
                               document.querySelector('[name="has_basement"]');
        const roofSelect = document.querySelector('#top-instal-calc [name="building_roof"]') || 
                         document.querySelector('[name="building_roof"]');
        const container = document.getElementById("heatedFloorsContainer");

        if (!container) {
            console.warn('Nie znaleziono kontenera heatedFloorsContainer');
            return;
        }

        if (!floorsSelect) {
            console.warn('Nie znaleziono pola building_floors');
            return;
        }

        const floors = parseInt(floorsSelect.value) || 1;
        const hasBasement = basementCheckbox ? basementCheckbox.checked : false;
        const roofType = roofSelect ? roofSelect.value : "steep";

        // Sprawdź czy stan się zmienił
        if (!hasFloorStateChanged(floors, hasBasement, roofType)) {
            console.log('Stan pięter bez zmian - pomijam renderowanie');
            return;
        }

        // Zachowaj zaznaczone piętra
        const selectedFloors = preserveSelectedFloors();

        // Wyczyść kontener
        container.innerHTML = "";

        // Dodaj piwnicy jeśli jest zaznaczona
        if (hasBasement) {
            const basementLabel = createCheckbox("building_heated_floors[]", "0", "Piwnica");
            basementLabel.style.display = "flex";
            basementLabel.style.alignItems = "center";
            basementLabel.style.marginBottom = "8px";
            container.appendChild(basementLabel);
        }

        // Parter domyślnie zaznaczony (jeśli nie ma zapisanych preferencji)
        const parterCheckbox = createCheckbox("building_heated_floors[]", "1", "Parter");
        parterCheckbox.style.display = "flex";
        parterCheckbox.style.alignItems = "center";
        parterCheckbox.style.marginBottom = "8px";
        const parterInput = parterCheckbox.querySelector('input');
        if (parterInput) {
            parterInput.checked = selectedFloors.length === 0 || selectedFloors.includes("1");
        }
        container.appendChild(parterCheckbox);

        // Dodaj pozostałe piętra
        for (let i = 1; i < floors; i++) {
            const floorNumber = i + 1;
            const label = `${i}. piętro`;
            const floorCheckbox = createCheckbox("building_heated_floors[]", floorNumber.toString(), label);
            floorCheckbox.style.display = "flex";
            floorCheckbox.style.alignItems = "center";
            floorCheckbox.style.marginBottom = "8px";
            container.appendChild(floorCheckbox);
        }

        // Dodaj poddasze dla dachu skośnego
        if (roofType === "steep") {
            const atticValue = floors + 1;
            const atticCheckbox = createCheckbox("building_heated_floors[]", atticValue.toString(), "Poddasze");
            atticCheckbox.style.display = "flex";
            atticCheckbox.style.alignItems = "center";
            atticCheckbox.style.marginBottom = "8px";
            container.appendChild(atticCheckbox);
        }

        // Przywróć zaznaczone piętra
        restoreSelectedFloors(selectedFloors);

        // Dodaj event listenery do nowych checkboxów dla callbacków
        const newCheckboxes = container.querySelectorAll('input[type="checkbox"]');
        newCheckboxes.forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                // Callback dla innych modułów
                if (typeof window.onHeatedFloorsChange === 'function') {
                    const selected = Array.from(container.querySelectorAll('input:checked')).map(cb => cb.value);
                    window.onHeatedFloorsChange(selected);
                }
            });
        });

        console.log(`✅ Renderowano piętra: ${floors} kondygnacji, piwnica: ${hasBasement}, dach: ${roofType}`);
        
    } catch (error) {
        console.error('❌ Błąd renderowania pięter:', error);
        
        // Fallback - przynajmniej pokaż parter z prawidłowym formatowaniem
        const container = document.getElementById("heatedFloorsContainer");
        if (container) {
            container.innerHTML = `
                <label style="display: flex; align-items: center; gap: 12px; margin-bottom: 8px; font-weight: normal; padding: 8px 12px; border-radius: 6px; cursor: pointer;">
                    <input type="checkbox" name="building_heated_floors[]" value="1" checked style="width: 18px; height: 18px; accent-color: #990013;"> 
                    <span style="font-size: 15px; color: #333;">Parter</span>
                </label>
            `;
        }
    }
}

/**
 * Reset stanu modułu
 */
function resetFloorRenderer() {
    previousFloorState = null;
    const container = document.getElementById("heatedFloorsContainer");
    if (container) {
        container.innerHTML = "";
    }
}

    /**
     * Inicjalizuje event listenery dla automatycznego renderowania pięter
     */
    function initFloorRenderingListeners() {
        // Znajdź pola które wpływają na renderowanie pięter
        const floorsSelect = document.querySelector('#top-instal-calc [name="building_floors"]') || 
                           document.querySelector('[name="building_floors"]');
        const basementCheckbox = document.querySelector('#top-instal-calc [name="has_basement"]') || 
                               document.querySelector('[name="has_basement"]');
        const roofSelect = document.querySelector('#top-instal-calc [name="building_roof"]') || 
                         document.querySelector('[name="building_roof"]');

        // Event listener dla liczby pięter
        if (floorsSelect) {
            floorsSelect.addEventListener('change', () => {
                console.log('🔄 Zmieniono liczbę pięter - renderuję ponownie');
                renderHeatedFloors();
            });
        }

        // Event listener dla piwnicy
        if (basementCheckbox) {
            basementCheckbox.addEventListener('change', () => {
                console.log('🔄 Zmieniono stan piwnicy - renderuję ponownie');
                renderHeatedFloors();
            });
        }

        // Event listener dla typu dachu
        if (roofSelect) {
            roofSelect.addEventListener('change', () => {
                console.log('🔄 Zmieniono typ dachu - renderuję ponownie');
                renderHeatedFloors();
            });
        }

        // Wywołaj renderowanie przy pierwszym załadowaniu
        renderHeatedFloors();
        
        console.log('✅ Event listenery dla renderowania pięter zostały zainicjalizowane');
    }

    // Global exports
    window.renderHeatedFloors = renderHeatedFloors;
    window.createCheckbox = createCheckbox;
    window.resetFloorRenderer = resetFloorRenderer;
    window.preserveSelectedFloors = preserveSelectedFloors;
    window.restoreSelectedFloors = restoreSelectedFloors;
    window.initFloorRenderingListeners = initFloorRenderingListeners;

    // Automatyczna inicjalizacja po załadowaniu DOM
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initFloorRenderingListeners);
    } else {
        // DOM już załadowany
        setTimeout(initFloorRenderingListeners, 100);
    }

    console.log('✅ Floor Renderer Module loaded successfully');

})();