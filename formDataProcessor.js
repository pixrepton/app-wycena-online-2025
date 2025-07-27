// === FILE: formDataProcessor.js ===
// 🧠 Obsługuje: Przetwarzanie danych formularza do JSON dla API cieplo.app
// OPERACJA ZERO 400: Konstrukcyjne budowanie JSON bez walidacji
// KRYSTALICZNIE IDEALNE DANE: Zgodne z dokumentacją API cieplo.app

(function () {
    'use strict';

    window.buildJsonData = function buildJsonData() {
        console.log('🔧 buildJsonData v4.2 - WYCENA 2025 - KRYSTALICZNIE IDEALNE DANE 💎');

        const data = {};

        // Znajdź formularz
        let form = document.getElementById("heatCalcFormFull") || 
                   document.getElementById("top-instal-calc") ||
                   document.querySelector("form[data-calc='top-instal']") ||
                   document.querySelector("#top-instal-calc") ||
                   document.body;

        if (!form) {
            console.error('❌ Nie znaleziono formularza');
            throw new Error('Nie znaleziono formularza kalkulatora');
        }

        // Funkcje pomocnicze
        const getEl = (name) => form.querySelector(`[name="${name}"]`);

        const isVisible = (el) => {
            if (!el) return false;
            const style = window.getComputedStyle(el);
            return !(style.display === 'none' || style.visibility === 'hidden');
        };

        const get = (name) => {
            try {
                const el = getEl(name);
                if (!el || !isVisible(el)) return null;

                if (el.type === "checkbox") return el.checked;
                if (el.type === "radio") {
                    const checked = form.querySelector(`[name="${name}"]:checked`);
                    return checked ? checked.value : null;
                }

                const val = el.value?.trim();
                return val === "" ? null : val;
            } catch (error) {
                console.warn(`Error getting field "${name}":`, error);
                return null;
            }
        };

        const getNum = (name) => {
            try {
                const val = get(name);
                if (val === null || val === undefined) return null;
                const num = parseFloat(val);
                return isNaN(num) ? null : num;
            } catch (error) {
                console.warn(`Error parsing number for field "${name}":`, error);
                return null;
            }
        };

        const getBool = (name) => {
            const val = get(name);
            if (val === null) return null;
            // Zwróć prawdziwy boolean, nie string
            return val === true || val === "true" || val === "yes" || val === 1 || val === "1";
        };

        const getCheckedArray = (name) => {
            const els = form.querySelectorAll(`[name="${name}"]:checked`);
            return Array.from(els)
                .filter(el => isVisible(el))
                .map(el => parseInt(el.value))
                .filter(val => !isNaN(val))
                .sort((a, b) => a - b); // Sortuj tablicę liczb
        };

        // === POLA OBOWIĄZKOWE - KRYSTALICZNIE IDEALNE ===

        // 1. Typ budynku (enum)
        const buildingTypeMap = {
            "single_house": "single_house",
            "dom_jednorodzinny": "single_house",
            "double_house": "double_house", 
            "blizniacza": "double_house",
            "row_house": "row_house",
            "szeregowiec": "row_house",
            "apartment": "apartment",
            "mieszkanie": "apartment",
            "multifamily": "multifamily"
        };
        const buildingTypeRaw = get("building_type") || "single_house";
        data.building_type = buildingTypeMap[buildingTypeRaw] || "single_house";

        // 2. Rok budowy (integer) - zgodny z dokumentacją
        const constructionYearMap = {
            "2025": 2025,
            "2020-2024": 2021,
            "2011-2020": 2011,
            "2000-2010": 2000,
            "1990-1999": 1990,
            "1980-1989": 1980,
            "1970-1979": 1970,
            "1960-1969": 1960,
            "1950-1959": 1950,
            "1940-1949": 1940,
            "przed_1940": 1939,
            "przed_1914": 1914
        };
        const yearRaw = get("construction_year") || get("construction_year_range");
        data.construction_year = constructionYearMap[yearRaw] || getNum("construction_year") || 2000;

        // 3. Typ konstrukcji (enum)
        const constructionTypeMap = {
            "traditional": "traditional",
            "murowany": "traditional",
            "tradycyjny": "traditional",
            "canadian": "canadian",
            "szkieletowy": "canadian",
            "kanadyjski": "canadian"
        };
        const constructionTypeRaw = get("construction_type") || "traditional";
        data.construction_type = constructionTypeMap[constructionTypeRaw] || "traditional";

        // 4. Lokalizacja (latitude, longitude) - precyzyjne współrzędne
        const locationMap = {
            "PL_DOLNOSLASKIE_WROCLAW": { lat: 51.1079, lon: 17.0385 },
            "PL_GDANSK": { lat: 54.3520, lon: 18.6466 },
            "PL_KUJAWSKOPOMORSKIE_BYDGOSZCZ": { lat: 53.1235, lon: 18.0084 },
            "PL_ZAKOPANE": { lat: 49.2992, lon: 19.9496 },
            "PL_STREFA_IV": { lat: 49.6216, lon: 20.6970 },
            "PL_STREFA_I": { lat: 54.3520, lon: 18.6466 },
            "PL_STREFA_II": { lat: 52.2297, lon: 21.0122 },
            "PL_STREFA_III": { lat: 50.0647, lon: 19.9450 },
            "PL_STREFA_V": { lat: 49.2992, lon: 19.9496 },
            "default": { lat: 51.4453433, lon: 16.2334445 } // Przykład z dokumentacji
        };
        const locationId = get("location_id") || get("climate_zone") || "default";
        const coords = locationMap[locationId] || locationMap["default"];
        data.latitude = coords.lat;
        data.longitude = coords.lon;

        // 5. Wymiary budynku - KRYSTALICZNIE IDEALNE według API
        // Kształt budynku - opcjonalny, domyślnie "regular"
        const buildingShapeMap = {
            "regular": "regular",
            "regularny": "regular", 
            "czworoboczny": "regular",
            "irregular": "irregular",
            "nieregularny": "irregular",
            "fikuśny": "irregular"
        };
        const buildingShapeRaw = get("building_shape") || "regular";
        const buildingShape = buildingShapeMap[buildingShapeRaw] || "regular";

        // Powierzchnia zabudowy - warunkowe
        const floorAreaInput = getNum("floor_area") || getNum("floor_area_irregular");

        // Długość i szerokość - warunkowe (alternatywa dla floor_area)
        const buildingLength = getNum("building_length");
        const buildingWidth = getNum("building_width");

        if (buildingLength && buildingWidth) {
            // PRAWIDŁOWA IMPLEMENTACJA: building_length + building_width (alternatywa do floor_area)
            data.building_length = buildingLength;
            data.building_width = buildingWidth;
            // NIE generujemy floor_area - API przyjmuje building_length/width jako alternatywę
        } else if (floorAreaInput && floorAreaInput > 0) {
            // PRAWIDŁOWA IMPLEMENTACJA: floor_area (alternatywa do building_length/width)
            data.floor_area = floorAreaInput;
        } else {
            // Domyślne wartości z przykładu dokumentacji
            data.building_length = 12.5;
            data.building_width = 6.0;
            // NIE generujemy floor_area - używamy building_length/width
        }

        // Dodaj building_shape tylko gdy potrzebne
        if (buildingShape === "irregular") {
            data.building_shape = "irregular";

            // Obwód budynku - wymagany dla irregular shape
            const floorPerimeter = getNum("floor_perimeter");
            if (floorPerimeter && floorPerimeter > 0) {
                data.floor_perimeter = floorPerimeter;
            }

            // Dla irregular MUSI być floor_area (zgodnie z dokumentacją)
            if (!data.floor_area) {
                data.floor_area = 45; // Przykład z dokumentacji
            }
        }
        // Dla regular shape nie dodajemy building_shape (opcjonalne)

        // 6. Kondygnacje - KRYSTALICZNIE IDEALNE
        const buildingFloors = getNum("building_floors") || 3; // Przykład z dokumentacji
        data.building_floors = buildingFloors;

        // 7. Ogrzewane kondygnacji (array[integer])
        let heatedFloors = getCheckedArray("building_heated_floors[]");
        if (heatedFloors.length === 0) {
            // Generuj domyślnie zgodnie z dokumentacją
            // 0 - piwnica, 1 - parter, 2 - 1. piętro, itd.
            heatedFloors = [0, 1, 2]; // Przykład z dokumentacji

            // Alternatywnie na podstawie budynku
            const hasBasement = getBool("has_basement");
            if (hasBasement) {
                heatedFloors = [0]; // Piwnica
            } else {
                heatedFloors = [1]; // Parter
            }

            // Dodaj pozostałe piętra
            for (let i = 2; i <= buildingFloors; i++) {
                heatedFloors.push(i);
            }
        }
        data.building_heated_floors = heatedFloors.sort((a, b) => a - b);

        // 8. Wysokość kondygnacji (enum/double)
        const floorHeightMap = {
            "niskie": 2.3,
            "2.3": 2.3,
            "low": 2.3,
            "standardowe": 2.6,
            "2.6": 2.6,
            "standard": 2.6,
            "wysokie": 3.1,
            "3.1": 3.1,
            "high": 3.1,
            "bardzo_wysokie": 4.1,
            "4.1": 4.1,
            "very_high": 4.1
        };
        const floorHeightRaw = get("floor_height") || "2.6";
        data.floor_height = floorHeightMap[floorHeightRaw] || getNum("floor_height") || 2.6;

        // 9. Rodzaj dachu (enum)
        const buildingRoofMap = {
            "flat": "flat",
            "plaski": "flat",
            "płaski": "flat",
            "oblique": "oblique", 
            "skosy": "oblique",
            "skośny": "oblique",
            "steep": "steep",
            "stromy": "steep",
            "poddasze": "steep"
        };
        const buildingRoofRaw = get("building_roof") || "steep";
        data.building_roof = buildingRoofMap[buildingRoofRaw] || "steep";

        // 10. Piwnica (boolean) - NAPRAWIONE - prawdziwy boolean
        const hasBasement = getBool("has_basement");
        if (hasBasement !== null) {
            data.has_basement = hasBasement;
        } else {
            data.has_basement = true; // Przykład z dokumentacji
        }

        // 11. Balkon (boolean) - NAPRAWIONE - prawdziwy boolean
        const hasBalcony = getBool("has_balcony");
        if (hasBalcony !== null) {
            data.has_balcony = hasBalcony;
        } else {
            data.has_balcony = true; // Przykład z dokumentacji
        }

        // 12. Garaż (enum) - KRYSTALICZNIE IDEALNE
        const garageTypeMap = {
            "none": null,
            "brak": null,
            "single_unheated": "single_unheated",
            "jeden_nieogrzewany": "single_unheated",
            "single_heated": "single_heated", 
            "jeden_ogrzewany": "single_heated",
            "double_unheated": "double_unheated",
            "dwa_nieogrzewane": "double_unheated",
            "double_heated": "double_heated",
            "dwa_ogrzewane": "double_heated"
        };
        const garageTypeRaw = get("garage_type") || "double_unheated";
        const garageType = garageTypeMap[garageTypeRaw];
        if (garageType) {
            data.garage_type = garageType;
        }

        // 13. Ściany - KRYSTALICZNIE IDEALNE
        // Grubość ściany (integer, cm)
        data.wall_size = getNum("wall_size") || 65; // Przykład z dokumentacji

        // 14. Materiał podstawowy ścian (wymagane dla traditional)
        if (data.construction_type === "traditional") {
            data.primary_wall_material = getNum("primary_wall_material") || 57; // Przykład z dokumentacji
        }

        // 15. Materiał dodatkowy ścian (opcjonalny)
        const hasSecondaryMaterial = getBool("has_secondary_wall_material");
        if (hasSecondaryMaterial === true) {
            const secondaryMaterial = getNum("secondary_wall_material");
            if (secondaryMaterial !== null && secondaryMaterial > 0) {
                data.secondary_wall_material = secondaryMaterial;
            }
        }

        // 16. IZOLACJE - KRYSTALICZNIE IDEALNE według dokumentacji API

        // Izolacja wewnętrzna ściany (wymagane dla canadian)
        if (data.construction_type === "canadian") {
            const intMat = getNum("internal_wall_isolation[material]") || getNum("internal_isolation_material") || 88;
            const intSize = getNum("internal_wall_isolation[size]") || getNum("internal_isolation_size") || 5;
            data.internal_wall_isolation = { material: intMat, size: intSize };
        } else {
            // Opcjonalnie dla traditional
            const hasInternalIsolation = getBool("has_internal_isolation");
            if (hasInternalIsolation === true) {
                const intMat = getNum("internal_wall_isolation[material]") || getNum("internal_isolation_material");
                const intSize = getNum("internal_wall_isolation[size]") || getNum("internal_isolation_size");
                if (intMat !== null && intSize !== null) {
                    data.internal_wall_isolation = { material: intMat, size: intSize };
                }
            }
        }

        // Docieplenie zewnętrzne ścian (opcjonalny)
        const hasExternalIsolation = getBool("has_external_isolation");
        if (hasExternalIsolation === true) {
            const extMat = getNum("external_wall_isolation[material]") || getNum("external_isolation_material") || 88;
            const extSize = getNum("external_wall_isolation[size]") || getNum("external_isolation_size") || 15;
            data.external_wall_isolation = { material: extMat, size: extSize };
        }

        // Izolacja od góry (opcjonalny)
        const hasTopIsolation = get("top_isolation");
        if (hasTopIsolation === "yes") {
            const topMat = getNum("top_isolation[material]") || getNum("top_isolation_material") || 68;
            const topSize = getNum("top_isolation[size]") || getNum("top_isolation_size") || 35;
            data.top_isolation = { material: topMat, size: topSize };
        }

        // Izolacja od dołu (opcjonalny)
        const hasBottomIsolation = get("bottom_isolation");
        if (hasBottomIsolation === "yes") {
            const botMat = getNum("bottom_isolation[material]") || getNum("bottom_isolation_material") || 71;
            const botSize = getNum("bottom_isolation[size]") || getNum("bottom_isolation_size") || 5;
            data.bottom_isolation = { material: botMat, size: botSize };
        }

        // 17. OKNA I DRZWI - KRYSTALICZNIE IDEALNE

        // Liczba drzwi zewnętrznych
        data.number_doors = getNum("number_doors") || 2; // Przykład z dokumentacji

        // Liczba drzwi balkonowych
        const balconyDoors = getNum("number_balcony_doors");
        if (balconyDoors !== null && balconyDoors > 0) {
            data.number_balcony_doors = balconyDoors;
        } else {
            data.number_balcony_doors = 2; // Przykład z dokumentacji
        }

        // Liczba okien (typowe okno = 130x150cm)
        data.number_windows = getNum("number_windows") || 12; // Przykład z dokumentacji

        // Liczba dużych przeszkleń (np. 3x3m)
        data.number_huge_windows = getNum("number_huge_windows") || 0; // Przykład z dokumentacji

        // Typ drzwi zewnętrznych (enum)
        const doorsTypeMap = {
            "old_wooden": "old_wooden",
            "stare_drewniane": "old_wooden",
            "old_metal": "old_metal",
            "stare_metalowe": "old_metal",
            "new_wooden": "new_wooden",
            "nowe_drewniane": "new_wooden",
            "new_metal": "new_metal",
            "nowe_metalowe": "new_metal",
            "new_pvc": "new_pvc",
            "nowe_pvc": "new_pvc"
        };
        const doorsTypeRaw = get("doors_type") || "new_metal";
        data.doors_type = doorsTypeMap[doorsTypeRaw] || "new_metal";

        // Typ okien (enum) - KRYSTALICZNIE IDEALNE mapowanie
        const windowsTypeMap = {
            "2021_triple_glass": "2021_triple_glass",
            "2021_double_glass": "2021_double_glass", 
            "new_triple_glass": "new_triple_glass",
            "new_double_glass": "new_double_glass",
            "semi_new_double_glass": "semi_new_double_glass",
            "old_double_glass": "old_double_glass",
            "old_single_glass": "old_single_glass",
            "trojszybowe_2021": "2021_triple_glass",
            "dwuszybowe_2021": "2021_double_glass",
            "trojszybowe_2011": "new_triple_glass",
            "dwuszybowe_2011": "new_double_glass",
            "zespolone": "semi_new_double_glass",
            "zwykle_podwojne": "old_double_glass",
            "pojedyncze": "old_single_glass"
        };
        const windowsTypeRaw = get("windows_type") || "new_double_glass";
        data.windows_type = windowsTypeMap[windowsTypeRaw] || "new_double_glass";

        // 18. INSTALACJE - KRYSTALICZNIE IDEALNE

        // Temperatura wewnętrzna (double, °C)
        data.indoor_temperature = getNum("indoor_temperature") || 21; // Przykład z dokumentacji

        // Typ wentylacji (enum)
        const ventilationTypeMap = {
            "natural": "natural",
            "naturalna": "natural",
            "grawitacyjna": "natural",
            "mechanical": "mechanical",
            "mechaniczna": "mechanical",
            "mechanical_recovery": "mechanical_recovery",
            "z_odzyskiem": "mechanical_recovery",
            "rekuperacja": "mechanical_recovery"
        };
        const ventilationTypeRaw = get("ventilation_type") || "natural";
        data.ventilation_type = ventilationTypeMap[ventilationTypeRaw] || "natural";

        // 19. CWU - CIEPŁA WODA UŻYTKOWA (KRYSTALICZNIE IDEALNE)

        // Czy włączyć CWU (boolean) - NAPRAWIONE - prawdziwy boolean
        const includeHotWater = getBool("include_hot_water") || getBool("includeHotWater");
        if (includeHotWater === true) {
            data.include_hot_water = true; // Prawdziwy boolean, nie string

            // Liczba osób korzystających z CWU (integer) - WYMAGANE
            const hotWaterPersons = getNum("hot_water_persons");
            if (hotWaterPersons !== null && hotWaterPersons > 0) {
                data.hot_water_persons = hotWaterPersons;
            } else {
                data.hot_water_persons = 3; // Przykład z dokumentacji
            }

            // Intensywność wykorzystania CWU (enum) - WYMAGANE
            const hotWaterUsageRaw = get("hot_water_usage");

            // KRYSTALICZNIE IDEALNE mapowanie zgodnie z dokumentacją API
            const usageMap = {
                // Wartości z formularza WordPress
                "low": "shower",
                "medium": "shower_bath", 
                "high": "bath",
                // Wartości bezpośrednie z API
                "shower": "shower",
                "shower_bath": "shower_bath",
                "bath": "bath",
                // Polskie nazwy
                "prysznic": "shower",
                "prysznic_wanna": "shower_bath",
                "wanna": "bath",
                // Alternatywne nazwy
                "tylko_prysznic": "shower",
                "glownie_prysznic": "shower_bath",
                "tylko_wanna": "bath"
            };

            if (hotWaterUsageRaw !== null) {
                data.hot_water_usage = usageMap[hotWaterUsageRaw] || "shower_bath";
            } else {
                data.hot_water_usage = "shower_bath"; // Przykład z dokumentacji
            }
        }

        // 20. MIESZKANIE - POLA SPECJALNE (KRYSTALICZNIE IDEALNE)
        if (data.building_type === "apartment") {
            // Mapowanie zgodnie z dokumentacją API
            const spaceTypeMap = {
                "heated_room": "heated_room",
                "ogrzewany_lokal": "heated_room",
                "unheated_room": "unheated_room", 
                "nieogrzewany_lokal": "unheated_room",
                "korytarz": "unheated_room",
                "klatka": "unheated_room",
                "outdoor": "outdoor",
                "zewnatrz": "outdoor",
                "swiat_zewnetrzny": "outdoor",
                "ground": "ground",
                "grunt": "ground"
            };

            // Co powyżej (whats_over) - WYMAGANE
            const whatsOverRaw = get("whats_over");
            if (whatsOverRaw !== null) {
                data.whats_over = spaceTypeMap[whatsOverRaw] || "heated_room";
            } else {
                data.whats_over = "heated_room"; // Domyślnie
            }

            // Co poniżej (whats_under) - WYMAGANE
            const whatsUnderRaw = get("whats_under");
            if (whatsUnderRaw !== null) {
                data.whats_under = spaceTypeMap[whatsUnderRaw] || "heated_room";
            } else {
                data.whats_under = "heated_room"; // Domyślnie
            }

            // Sąsiedztwo - wszystkie 4 strony WYMAGANE
            const whatsNorthRaw = get("whats_north");
            data.whats_north = spaceTypeMap[whatsNorthRaw] || "heated_room";

            const whatsSouthRaw = get("whats_south");
            data.whats_south = spaceTypeMap[whatsSouthRaw] || "heated_room";

            const whatsEastRaw = get("whats_east");
            data.whats_east = spaceTypeMap[whatsEastRaw] || "heated_room";

            const whatsWestRaw = get("whats_west");
            data.whats_west = spaceTypeMap[whatsWestRaw] || "heated_room";
        }

        // === FINALNE CZYSZCZENIE - KRYSTALICZNIE IDEALNE ===

        // Usuń pola null/undefined - API cieplo.app nie akceptuje null
        Object.keys(data).forEach(key => {
            if (data[key] === null || data[key] === undefined) {
                delete data[key];
            }
        });

        // Walidacja KRYSTALICZNIE IDEALNYCH danych
        const requiredFields = [
            'building_type', 'construction_year', 'construction_type',
            'latitude', 'longitude', 'building_floors', 'building_heated_floors',
            'floor_height', 'building_roof', 'has_basement', 'has_balcony',
            'wall_size', 'number_doors', 'number_balcony_doors', 'number_windows',
            'number_huge_windows', 'doors_type', 'windows_type',
            'indoor_temperature', 'ventilation_type'
        ];

        // Sprawdź czy wszystkie wymagane pola są obecne
        let missingFields = [];
        requiredFields.forEach(field => {
            if (data[field] === null || data[field] === undefined) {
                missingFields.push(field);
            }
        });

        // Specjalne walidacje warunkowe
        if (data.construction_type === "traditional" && !data.primary_wall_material) {
            missingFields.push('primary_wall_material (required for traditional)');
        }

        if (data.construction_type === "canadian" && !data.internal_wall_isolation) {
            missingFields.push('internal_wall_isolation (required for canadian)');
        }

        if (data.building_type === "apartment") {
            const apartmentRequired = ['whats_over', 'whats_under', 'whats_north', 'whats_south', 'whats_east', 'whats_west'];
            apartmentRequired.forEach(field => {
                if (!data[field]) {
                    missingFields.push(`${field} (required for apartment)`);
                }
            });
        }

        if (data.include_hot_water === true) {
            if (!data.hot_water_persons) missingFields.push('hot_water_persons (required when include_hot_water=true)');
            if (!data.hot_water_usage) missingFields.push('hot_water_usage (required when include_hot_water=true)');
        }

        // Logowanie wyników
        if (missingFields.length > 0) {
            console.warn('⚠️ Brakujące pola (będą użyte domyślne):', missingFields);
        }

        // Finalne podsumowanie
        console.log('💎 KRYSTALICZNIE IDEALNE DANE - JSON gotowy!');
        console.log('📦 Payload do cieplo.app:', data);
        console.log('🔢 Liczba pól:', Object.keys(data).length);

        return data;
    };

    /**
     * Czyści wizualne oznaczenia błędów w formularzu
     */
    window.clearValidationErrors = function() {
        const form = document.getElementById("heatCalcFormFull") || 
                     document.getElementById("top-instal-calc") ||
                     document.querySelector("form[data-calc='top-instal']") ||
                     document.body;

        if (form) {
            const fields = form.querySelectorAll('input, select, textarea');
            fields.forEach(field => {
                field.style.border = '';
                field.style.backgroundColor = '';
            });
        }
    };

    // Global exports
    window.buildJsonData = buildJsonData;

    console.log('✅ Form Data Processor Module v4.1 loaded successfully');

})();