<?php
/*
Plugin Name: Kalkulator Ciepła
Description: Wtyczka z kalkulatorem zapotrzebowania na ciepło z GDPR Compliance i Error Handling.
Version: 4.0.0
Author: TOP-INSTAL Innovations
*/

if (!headers_sent()) {
    header('Cache-Control: no-store, no-cache, must-revalidate, max-age=0');
    header('Pragma: no-cache');
    header('Expires: 0');
    header('X-LiteSpeed-Cache-Control: no-cache');
}

// Zabezpieczenie przed bezpośrednim dostępem
if (!defined('ABSPATH')) {
    exit;
}

function kalkulator_enqueue_assets() {
    if (!is_singular()) return;

    global $post;
    if (has_shortcode($post->post_content, 'kalkulator')) {
        $plugin_url = plugin_dir_url(__FILE__);

        // 1. STYLE (KOLEJNOŚĆ PREMIUM) - WYCENA 2025 structure
        wp_enqueue_style('topinstal-calculator-style', $plugin_url . 'frontend/css/kalkulator_style.css', [], '4.0.0');
        wp_enqueue_style('topinstal-premium-enhancements', $plugin_url . 'frontend/css/premium-visual-enhancements.css', ['topinstal-calculator-style'], '4.0.0');
        wp_enqueue_style('topinstal-ai-coach-dock', $plugin_url . 'frontend/css/ai-coach-dock.css', ['topinstal-premium-enhancements'], '4.0.0');
        wp_enqueue_style('google-fonts-poppins', 'https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap', [], null);
        wp_enqueue_style('font-awesome', 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css', [], '6.0.0');

        // 2. FIXES & COMPATIBILITY
        wp_enqueue_script('topinstal-elementor-fix', $plugin_url . 'elementor-fix.js', [], '4.0.0', true);
        
        // 3. ZEWNĘTRZNE BIBLIOTEKI
        wp_enqueue_script('html2pdf', 'https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.1/html2pdf.bundle.min.js', [], '0.10.1', true);

        // 3. SKRYPTY (POPRAWNA KOLEJNOŚĆ I ZALEŻNOŚCI) - WYCENA 2025 structure
        // GDPR Compliance System (must load first)
        wp_enqueue_script('topinstal-gdpr-compliance', $plugin_url . 'frontend/js/gdpr-compliance.js', [], '4.0.0', true);
        
        // Podstawowe moduły (zależne od GDPR)
        wp_enqueue_script('topinstal-tooltip-system', $plugin_url . 'frontend/js/tooltipSystem.js', ['topinstal-gdpr-compliance'], '4.0.0', true);
        wp_enqueue_script('topinstal-floor-renderer', $plugin_url . 'frontend/js/floorRenderer.js', ['topinstal-gdpr-compliance'], '4.0.0', true);
        wp_enqueue_script('topinstal-url-manager', $plugin_url . 'frontend/js/urlManager.js', ['topinstal-gdpr-compliance'], '4.0.0', true);
        wp_enqueue_script('topinstal-form-processor', $plugin_url . 'frontend/js/formDataProcessor.js', ['topinstal-gdpr-compliance'], '4.0.0', true);
        wp_enqueue_script('topinstal-pdf-generator', $plugin_url . 'frontend/js/pdfGenerator.js', [], '4.0.0', true);
        wp_enqueue_script('topinstal-email-sender', $plugin_url . 'emails/sender.js', ['topinstal-gdpr-compliance'], '4.0.0', true);
        
        // Moduły wymagające podstawowych zależności
        wp_enqueue_script('topinstal-dynamic-fields', $plugin_url . 'frontend/js/dynamicFields.js', ['topinstal-floor-renderer', 'topinstal-form-processor'], '4.0.0', true);
        wp_enqueue_script('topinstal-ai-watchers', $plugin_url . 'frontend/js/aiWatchers.js', ['topinstal-gdpr-compliance'], '4.0.0', true);
        wp_enqueue_script('topinstal-results-renderer', $plugin_url . 'frontend/js/resultsRenderer.js', ['topinstal-form-processor'], '4.0.0', true);
        wp_enqueue_script('topinstal-tab-navigation', $plugin_url . 'frontend/js/tabNavigation.js', ['topinstal-dynamic-fields', 'topinstal-results-renderer'], '4.0.0', true);
        
        // Główny koordynator (ładuje się ostatni)
        wp_enqueue_script('topinstal-calculator-init', $plugin_url . 'frontend/js/calculatorInit.js', ['topinstal-tab-navigation', 'topinstal-ai-watchers'], '4.0.0', true);

        // KONFIGURACJA – WP_LOCALIZE_SCRIPT
        wp_localize_script('topinstal-calculator-init', 'topinstal_config', [
            'ajax_url' => admin_url('admin-ajax.php'),
            'plugin_url' => $plugin_url,
            'nonce' => wp_create_nonce('topinstal_calculator_nonce'),
        ]);

        // AI Coach Dock (ostatni)
        wp_enqueue_script('topinstal-ai-coach-dock', $plugin_url . 'frontend/js/ai-coach-dock.js', ['topinstal-calculator-init'], '4.0.0', true);
    }
}
add_action('wp_enqueue_scripts', 'kalkulator_enqueue_assets');

function kalkulator_shortcode() {
    ob_start();
    ?>

    <div id="top-instal-calc" class="wrapper">

        <div class="authority-header">
            <div class="header-icon-left">
                <i class="fas fa-calculator"></i>
            </div>
            <div class="badge-content">
              <p>Inteligentny algorytm obliczeniowy<br>zgodny z PN-B 02025 i PN-EN 832</p>
              <h1>KALKULATOR MOCY POMPY CIEPŁA</h1>
            </div>
            <div class="header-icon-right">
                <i class="fas fa-thermometer-half"></i>
            </div>
        </div>

        <!-- Formularz -->
        <form id="heatCalcFormFull" novalidate>
            <div class="section active" data-tab="0">
                <!-- Pasek postępu -->
                <div class="progress-bar-premium" data-step="1">
                    <div class="step active"><span>1</span></div>
                    <div class="step"><span>2</span></div>
                    <div class="step"><span>3</span></div>
                    <div class="step"><span>4</span></div>
                    <div class="step"><span>5</span></div>
                    <div class="step"><span>6</span></div>
                </div>

                <!-- Instrukcja + Dane -->
                <div class="formularz-z-mapa">
                    <div class="formularz">
                        <div class="bordered-text">
                            <h3>INSTRUKCJA</h3>
                            <label>
                                - W mniej niż 2 minuty poznasz potrzebną moc pompy, zapotrzebowanie budynku na ciepło i otrzymasz raport.<br>
                                - Podaj dane o Twoim budynku – krok po kroku.<br>
                                - Nie spiesz się - dokładne dane to precyzyjny wynik.<br>
                                - Na końcu otrzymujesz pełne podsumowanie i możliwość skonfigurowania własnego zestawu z natychmiastową wyceną.<br>
                                - Korzystasz swobodnie - nie podajesz swoich danych.
                            </label>
                        </div>

                        <h3>INFORMACJE O BUDYNKU</h3>
                        <hr class="separator">

                        <!-- Typ budynku -->
                        <label class="form-label">Podaj rodzaj budynku: <span class="required">*</span></label>
                        <select name="building_type" required class="form-select">
                            <option value="">-- Wybierz rodzaj budynku --</option>
                            <option value="single_house" selected>Budynek jednorodzinny (wolnostojący)</option>
                            <option value="double_house" disabled>Bliźniak</option>
                            <option value="row_house" disabled>Szeregowiec</option>
                        </select>

                        <hr class="separator">
                        <hr class="separator">

                        <!-- Rok budowy -->
                        <label class="form-label">Podaj rok budowy: <span class="required">*</span></label>
                        <select name="construction_year" required class="form-select">
                            <option value="">-- Wybierz rok budowy --</option>
                            <option value="2025">2025</option>
                            <option value="2021" selected>2021–2024</option>
                            <option value="2011">2011–2020</option>
                            <option value="2000">2000–2010</option>
                            <option value="1990">1991–2000 (lata 90.)</option>
                            <option value="1980">1981–1990 (lata 80.)</option>
                            <option value="1970">1971–1980 (lata 70.)</option>
                            <option value="1960">1961–1970 (lata 60.)</option>
                            <option value="1950">1950–1960 (lata 50.)</option>
                            <option value="1940">1940–1949 (lata 40.)</option>
                            <option value="1939">przed 1939 (przed II wojną)</option>
                            <option value="1914">przed 1914 (przed I wojną)</option>
                        </select>

                        <hr class="separator">
                        <hr class="separator">

                        <!-- Strefa klimatyczna -->
                        <label class="form-label">Wybierz strefę, w której znajduje się Twój budynek <span class="required">*</span></label>
                        <div class="form-field__select-wrapper">
                            <select name="location_id" required class="form-select">
                                <option value="">-- Wybierz strefę --</option>
                                <option value="PL_DOLNOSLASKIE_WROCLAW" selected>Strefa III</option>
                                <option value="PL_STREFA_IV">Strefa IV</option>
                                <option value="PL_ZAKOPANE">Strefa V</option>
                                <option value="PL_KUJAWSKOPOMORSKIE_BYDGOSZCZ">Strefa II</option>
                                <option value="PL_GDANSK">Strefa I</option>
                            </select>
                            <span class="tooltip-icon-wrapper" tabindex="0">
                                <img src="https://topinstal.com.pl/pictures/info-light.png" alt="Info" class="tooltip-icon" />
                                <span class="tooltip-text">Sprawdź położenie budynku na mapie – strefa określa temperaturę projektową</span>
                            </span>
                        </div>

                        <hr class="separator">

                        <div class="form-column">
                            <div class="climate-map">
                                <h4><i class="fas fa-map-marked-alt"></i> Mapa stref klimatycznych</h4>
                                <img src="https://topinstal.com.pl/pictures/mapka.png" alt="Mapa stref klimatycznych w Polsce" class="zone-map">
                                <div class="zone-legend">
                                    <div class="legend-item">
                                        <span class="zone-color zone-1"></span>
                                        <span>Strefa I: -16°C</span>
                                    </div>
                                    <div class="legend-item">
                                        <span class="zone-color zone-2"></span>
                                        <span>Strefa II: -18°C</span>
                                    </div>
                                    <div class="legend-item">
                                        <span class="zone-color zone-3"></span>
                                        <span>Strefa III: -20°C</span>
                                    </div>
                                    <div class="legend-item">
                                        <span class="zone-color zone-4"></span>
                                        <span>Strefa IV: -22°C</span>
                                    </div>
                                    <div class="legend-item">
                                        <span class="zone-color zone-5"></span>
                                        <span>Strefa V: -24°C</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Przycisk Dalej -->     
                <div class="text-center">
                    <button class="btn-next1" type="button">Dalej</button>
                </div>

            </div>

            <!-- Zakładka 1: Kształt -->
            <div class="section" data-tab="1">
                <div class="progress-bar-premium" data-step="2">
                    <div class="step completed"><span>1</span></div>
                    <div class="step active"><span>2</span></div>
                    <div class="step"><span>3</span></div>
                    <div class="step"><span>4</span></div>
                    <div class="step"><span>5</span></div>
                    <div class="step"><span>6</span></div>
                </div>
                <h3>KSZTAŁT I BRYŁA BUDYNKU</h3>
                <hr class="separator">

                <div class="building-shape-wrapper">
                    <label>Obrys budynku</label>
                    <select id="buildingShape" name="building_shape" required class="form-select">
                        <option value="regular" selected>Regularny (prostokątny)</option>
                        <option value="irregular">Nieregularny (z wykuszami, wnękami itp.)</option>
                    </select>
                    <img src="https://topinstal.com.pl/pictures/obrys.png" class="obrys-img" alt="Rodzaje obrysu budynku" />
                </div>

                <hr class="separator">
                <hr class="separator">
                <div id="regularFields">
                    <label>Podaj wymiary albo powierzchnię zabudowy</label>
                    <div class="form-field__select-wrapper">
                        <select id="regularMethod" name="regular_method" class="form-select">
                            <option value="dimensions" selected>Wymiary zewnętrzne (dł. × szer.)</option>
                            <option value="area">Powierzchnia zabudowy (m²)</option>
                        </select>
                        <span class="tooltip-icon-wrapper" tabindex="0">
                            <img src="https://topinstal.com.pl/pictures/info-light.png" alt="Info" class="tooltip-icon" />
                            <span class="tooltip-text">Podajesz kluczowy parametr. Powierzchnia zabudowy to powierzchnia zajmowana przez budynek - określamy ją poprzez zewnętrzne krawędzie ścian i ich rzut na powierzchnię gruntu</span>
                        </span>
                    </div>
                    <div id="dimensionsFields">
                        <label>Długość (m)<input name="building_length" step="0.2" type="number" value="9"/></label>
                        <label>Szerokość (m)<input name="building_width" step="0.2" type="number" value="9"/></label>
                    </div>
                    <div id="areaField">
                        <label>Powierzchnia zabudowy(m²)<input name="floor_area" step="0.5" type="number"/><img src="https://topinstal.com.pl/pictures/zabudowa.png" class="obrys-img" alt="Zabudowa" /></label>
                    </div>
                </div>

                <div id="irregularFields">
                    <label>Powierzchnia zabudowy (m²)<input name="floor_area_irregular" step="0.1" type="number"/><img height= "50px" src="https://topinstal.com.pl/pictures/zabudowa.png" alt="Zabudowa" /></label>
                    <label>Obwód (m)<input name="floor_perimeter" step="0.1" type="number"/></label>
                </div>

                <hr class="separator">
                <hr class="separator">

                <label>Czy są balkony?</label>
                <div class="form-field__checkbox-inline">
                    <input id="hasBalcony" name="has_balcony" type="checkbox" value="true" />
                    <label for="hasBalcony">TAK</label>
                    <span class="tooltip-icon-wrapper" tabindex="0">
                        <img src="https://topinstal.com.pl/pictures/info-light.png" alt="Info" class="tooltip-icon" />
                        <span class="tooltip-text">Dotyczy balkonów nadwieszonych poza bryłę budynku. Takie połączenie konstrukcyjne stanowi mostek cieplny i ułatwia migrację ciepła na zewnątrz</span>
                    </span>
                </div>

                <div id="balconyFields">
                    <label>Ilość balkonów</label>
                    <input name="number_balcony_doors" type="number"/>
                </div>

                <hr class="separator">
                <hr class="separator">

                <label>Czy jest piwnica / podpiwniczenie?</label>
                <label><input name="has_basement" type="checkbox" value="true"/>TAK</label>

                <hr class="separator">
                <hr class="separator">

                <label>PODAJ LICZBĘ PIĘTER <b>bez poddasza</b></label>
                <select name="building_floors" required="">
                    <option value="1" selected>Parter</option>
                    <option value="2">Parter + 1 piętro</option>
                    <option value="3">Parter + 2 piętra</option>
                    <option value="4">Parter + 3 piętra</option>
                </select>

                <hr class="separator">
                <hr class="separator">

                <label for="building_roof">Jaki jest dach?</label>
                <div class="form-field__select-wrapper">
                    <select name="building_roof" id="building_roof" required class="form-select">
                        <option value="flat">Dach płaski</option>
                        <option value="steep">Skośny - z przestrzenią poddasza</option>
                        <option value="oblique">Skośny bez przestrzeni poddasza</option>
                    </select>
                    <span class="tooltip-icon-wrapper" tabindex="0">
                        <img src="https://topinstal.com.pl/pictures/info-light.png" alt="Info" class="tooltip-icon" />
                        <span class="tooltip-text">Poddasze to przestrzeń pod dachem o wielkości jak prawie cała kondygnacja. Poddasze może być użytkowe lub niezamieszkałe i ma rozmiary niepełnej kondygnacji. Nie zaznaczaj poddasza, jeśli masz strych niewielkich rozmiarów.</span>
                    </span>
                </div>

                <hr class="separator">
                <hr class="separator">

                <div id="heatedFloorsSection">
                    <label><strong>ZAZNACZ OGRZEWANE PIĘTRA:</strong></label>
                    <div id="heatedFloorsContainer">
                        <label><input type="checkbox" name="building_heated_floors[]" value="0"/> PIWNICA</label>
                        <label><input type="checkbox" name="building_heated_floors[]" value="1" checked/>PARTER</label>
                        <label><input type="checkbox" name="building_heated_floors[]" value="2"/> 1. PIĘTRO</label>
                        <label><input type="checkbox" name="building_heated_floors[]" value="3"/> 2. PIĘTRO</label>
                        <label><input type="checkbox" name="building_heated_floors[]" value="4"/> 3. PIĘTRO</label>
                    </div>
                </div>

                <hr class="separator">
                <hr class="separator">

                <label>Wysokość kondygnacji:</label>
                <select name="floor_height" required="">
                    <option value="2.6">Standard: około 2,70 m</option>
                    <option value="2.3">Nisko: poniżej 2,40 m</option>
                    <option value="3.1">Wysoko: 3 m lub więcej</option>
                    <option value="4.1">Bardzo wysoko: 4 m lub więcej</option>
                </select>

                <hr class="separator">
                <hr class="separator">

                <label>Czy w bryle budynku znajduje się garaż?</label>
                <select name="garage_type" required="">
                    <option value="none">Brak garażu w bryle budynku</option>
                    <option value="single_unheated">1-stanowisko, nieogrzewany</option>
                    <option value="single_heated">1-stanowisko, ogrzewany</option>
                    <option value="double_unheated">2-stanowiskowy, nieogrzewany</option>
                    <option value="double_heated">2-stanowiskowy, ogrzewany</option>
                </select>

                <div id="garageFields" class="hidden">
                    <label>Szczegóły garażu</label>
                    <small class="opis">Garaż w bryle budynku wpływa na obliczenia cieplne</small>
                </div>

                <hr class="separator">
                    <div class="btn-row">
                      <button class="btn-prev" type="button">Cofnij</button>
                      <button class="btn-next2" type="button">Dalej</button>
                </div>
            </div>

            <!-- Zakładka 2: Konstrukcja -->
            <div class="section" data-tab="2">
                <div class="progress-bar-premium" data-step="3">
                    <div class="step completed"><span>1</span></div>
                    <div class="step completed"><span>2</span></div>
                    <div class="step active"><span>3</span></div>
                    <div class="step"><span>4</span></div>
                    <div class="step"><span>5</span></div>
                    <div class="step"><span>6</span></div>
                </div>
                <h3>ŚCIANY ZEWNĘTRZNE</h3>
                <hr class="separator">

                <label>Konstrukcja budynku:</label>
                <select id="constructionType" name="construction_type">
                    <option value="traditional">Tradycyjna (murowana lub drewniana)</option>
                    <option value="canadian" disabled>Szkieletowa (dom kanadyjski)</option>
                </select>

                <hr class="separator">
                <hr class="separator">

                <label>Grubość ściany zewnętrznej (z ewentualnym ociepleniem)</label>
                <input min="0" name="wall_size" required="" step="1" type="number" value="50"/>

                <hr class="separator">
                <hr class="separator">

                <div id="traditionalOptions">
                    <label>Podaj podstawowy materiał, z jakiego zbudowane są ściany</label>
                    <small class="opis">Jeśli nie jesteś pewien, wybierz najbardziej zbliżony</small>
                    <select name="primary_wall_material" id="primary_wall_material_select">
                        <option value="84">Porotherm</option>
                        <option value="55">Drewno liściaste</option>
                        <option value="56">Drewno iglaste</option>
                        <option value="54">Beton komórkowy</option>
                        <option value="51">Beton</option>
                        <option value="52">Żelbet</option>
                        <option value="53">Pustak żużlobetonowy</option>
                        <option value="57">Cegła pełna</option>
                        <option value="58">Cegła dziurawka</option>
                        <option value="59">Cegła kratówka</option>
                        <option value="60">Cegła silikatowa pełna</option>
                        <option value="61">Cegła silikatowa dziurawka</option>
                        <option value="62">Cegła klinkierowa</option>
                        <option value="63">Pustaki ceramiczne</option>
                        <option value="76">Kamień polny</option>
                        <option value="77">Granit</option>
                        <option value="78">Marmur</option>
                        <option value="79">Piaskowiec</option>
                        <option value="80">Wapień</option>
                        <option value="83">Wiórobeton</option>
                        <option value="85">Pustak keramzytowy</option>
                        <option value="89">Ytong</option>
                        <option value="90">Termalica 300/400</option>
                        <option value="91">Termalica 600/650</option>
                        <option value="92">Thermomur</option>
                        <option value="93">Glina</option>
                        <option value="95">PIR</option>
                        <option value="96">Bloczek silikatowy</option>
                        <option value="97">Keramzytobeton</option>
                        <option value="99">Ytong Ultra+</option>
                        <option value="100">Ytong PP5</option>
                    </select>
                </div>

                <hr class="separator">
                <hr class="separator">

                <label>Czy ściany są zbudowane z jakiegoś dodatkowego materiału?</label>
                <label><input id="hasSecondaryWallMaterial" name="has_secondary_wall_material" type="checkbox" value="true"/>TAK</label>

                <div class="hidden" id="secondaryWallFields">
                    <label>Dodatkowy materiał ścian zewnętrznych:</label>
                    <select name="secondary_wall_material" id="secondary_wall_material_select">
                        <option value="84">Porotherm</option>
                        <option value="55">Drewno liściaste</option>
                        <option value="56">Drewno iglaste</option>
                        <option value="54">Beton komórkowy</option>
                        <option value="51">Beton</option>
                        <option value="52">Żelbet</option>
                        <option value="53">Pustak żużlobetonowy</option>
                        <option value="57">Cegła pełna</option>
                        <option value="58">Cegła dziurawka</option>
                        <option value="59">Cegła kratówka</option>
                        <option value="60">Cegła silikatowa pełna</option>
                        <option value="61">Cegła silikatowa dziurawka</option>
                        <option value="62">Cegła klinkierowa</option>
                        <option value="63">Pustaki ceramiczne</option>
                        <option value="76">Kamień polny</option>
                        <option value="77">Granit</option>
                        <option value="78">Marmur</option>
                        <option value="79">Piaskowiec</option>
                        <option value="80">Wapień</option>
                        <option value="83">Wiórobeton</option>
                        <option value="85">Pustak keramzytowy</option>
                        <option value="89">Ytong</option>
                        <option value="90">Termalica 300/400</option>
                        <option value="91">Termalica 600/650</option>
                        <option value="92">Thermomur</option>
                        <option value="93">Glina</option>
                        <option value="95">PIR</option>
                        <option value="96">Bloczek silikatowy</option>
                        <option value="97">Keramzytobeton</option>
                        <option value="99">Ytong Ultra+</option>
                        <option value="100">Ytong PP5</option>
                    </select>
                </div>

                <div class="hidden" id="canadianOptions">
                    <label><input id="hasInternalIsolation" name="has_internal_isolation" type="checkbox" value="true"/> Ściana ma izolację wewnętrzną</label>
                    <div class="hidden" id="internalIsolationFields">
                        <label>Rodzaj izolacji wewnętrznej</label>
                        <select name="internal_wall_isolation[material]" id="internal_wall_isolation[material]">
                            <option value="64">Korek</option>
                            <option value="65">Słoma</option>
                            <option value="66">Trzcina</option>
                            <option value="68">Wełna mineralna</option>
                            <option value="69">Wełna mineralna granulowana</option>
                            <option value="70">Styropian</option>
                            <option value="71">Styropian twardy (XPS)</option>
                            <option value="81">Padzierz lniany</option>
                            <option value="82">Pustka powietrzna</option>
                            <option value="83">Wiórobeton</option>
                            <option value="86">PUR</option>
                            <option value="87">Ekofiber</option>
                            <option value="88">Styropian grafitowy</option>
                            <option value="94">Wełna drzewna</option>
                            <option value="95">PIR</option>
                            <option value="98">Celuloza</option>
                            <option value="101">Multipor</option>
                        </select>
                        <label>Grubość izolacji (cm)<input min="0" name="internal_wall_isolation[size]" step="1" type="number"/></label>
                    </div>
                </div>

                <hr class="separator">
                <hr class="separator">

                <label>Czy ściany budynku są docieplone?</label>
                <label><input id="hasExternalIsolation" name="has_external_isolation" type="checkbox" value="true" checked/>TAK</label>
                <div class="hidden" id="externalIsolationFields">
                    <label>Rodzaj ocieplenia ścian</label>
                    <select name="external_wall_isolation[material]" id="external_wall_isolation[material]">
                        <option value="88">Styropian grafitowy</option>
                        <option value="70">Styropian</option>
                        <option value="71">Styropian twardy (XPS)</option>
                        <option value="64">Korek</option>
                        <option value="65">Słoma</option>
                        <option value="66">Trzcina</option>
                        <option value="68">Wełna mineralna</option>
                        <option value="81">Padzierz lniany</option>
                        <option value="86">PUR</option>
                        <option value="87">Ekofiber</option>
                        <option value="94">Wełna drzewna</option>
                        <option value="95">PIR</option>
                        <option value="98">Celuloza</option>
                        <option value="101">Multipor</option>
                    </select>
                    <label>Grubość ocieplenia (cm)<input min="0" name="external_wall_isolation[size]" step="1" type="number" value="15"/></label>
                </div>

                <hr class="separator">

                    <div class="btn-row">
                      <button class="btn-prev" type="button">Cofnij</button>
                      <button class="btn-next3" type="button">Dalej</button>
                </div>
            </div>

            <!-- Zakładka 3: Okna i drzwi -->
            <div class="section" data-tab="3">
                <div class="progress-bar-premium" data-step="4">
                    <div class="step completed"><span>1</span></div>
                    <div class="step completed"><span>2</span></div>
                    <div class="step completed"><span>3</span></div>
                    <div class="step active"><span>4</span></div>
                    <div class="step"><span>5</span></div>
                    <div class="step"><span>6</span></div>
                </div>
                <h3>OKNA I DRZWI</h3>
                <hr class="separator">

                <label>Wybierz rodzaj okien:</label>
                <select name="windows_type" required="">
                    <option value="2021_triple_glass">Nowoczesne (2021+), trzyszybowe</option>
                    <option value="2021_double_glass">Nowoczesne (2021+), dwuszybowe</option>
                    <option value="new_triple_glass">Współczesne, 3-szybowe</option>
                    <option value="new_double_glass">Współczesne, 2-szybowe</option>
                    <option value="semi_new_double_glass">Starsze zespolone (typowe z lat 90.)</option>
                    <option value="old_double_glass">Stare okna z 2 szybami</option>
                    <option value="old_single_glass">Stare okna z 1 szybą</option>
                </select>

                <hr class="separator">
                <hr class="separator">

                <label class="label-with-tooltip">
                    Podaj liczbę okien:
                    <span class="tooltip-icon-wrapper" tabindex="0">
                        <span class="tooltip-icon"></span>
                        <span class="tooltip-text">Mniejsze okna należy liczyć jako pół, okna dachowe jako 1, a małe dachowe jako pół</span>
                    </span>
                </label>
                <input min="1" name="number_windows" type="number" value="9" required/>

                <hr class="separator">
                <hr class="separator">

                <label>Liczba dużych przeszkleń</label>
                <small class="opis">(np. okna HS, tarasowe, witrynowe)</small>
                <input min="0" name="number_huge_windows" type="number" value="0"/>

                <hr class="separator">
                <hr class="separator">

                <label>Rodzaj drzwi zewnętrznych</label>
                <select name="doors_type" required>
                    <option value="new_pvc">Nowe PVC</option>
                    <option value="new_wooden">Nowe drewniane</option>
                    <option value="new_metal">Nowe metalowe</option>
                    <option value="old_wooden">Stare drewniane</option>
                    <option value="old_metal">Stare metalowe</option>
                </select>

                <hr class="separator">
                <hr class="separator">

                <label>Liczba drzwi zewnętrznych:</label>
                <input min="1" name="number_doors" type="number" value="1" required/>

                <hr class="separator">

                    <div class="btn-row">
                      <button class="btn-prev" type="button">Cofnij</button>
                      <button class="btn-next4" type="button">Dalej</button>
                </div>
            </div>

            <!-- Zakładka 4: Izolacje -->
            <div class="section" data-tab="4">
                <div class="progress-bar-premium" data-step="5">
                    <div class="step completed"><span>1</span></div>
                    <div class="step completed"><span>2</span></div>
                    <div class="step completed"><span>3</span></div>
                    <div class="step completed"><span>4</span></div>
                    <div class="step active"><span>5</span></div>
                    <div class="step"><span>6</span></div>
                </div>
                <h3>IZOLACJE</h3>
                <hr class="separator">

                <label>Izolacja dachu</label>
                <select id="hasTopIsolation" name="top_isolation">
                    <option value="yes">Tak</option>
                    <option value="no">Nie</option>
                </select>

                <div id="topIsolationFields">
                    <label>Materiał izolacyjny dachu</label>
                    <select name="top_isolation[material]" id="top_isolation[material]">
                        <option value="68">Wełna mineralna</option>
                        <option value="70">Styropian</option>
                        <option value="71">Styropian twardy (XPS)</option>
                        <option value="88">Styropian grafitowy</option>
                        <option value="86">Piana PUR</option>
                        <option value="64">Korek</option>
                        <option value="65">Słoma</option>
                        <option value="66">Trzcina</option>
                        <option value="81">Padzierz lniany</option>
                        <option value="87">Ekofiber</option>
                        <option value="94">Wełna drzewna</option>
                        <option value="95">PIR</option>
                        <option value="98">Celuloza</option>
                        <option value="101">Multipor</option>
                    </select>
                    <label>Grubość izolacji dachu (cm)<input min="0" name="top_isolation[size]" step="1" type="number" value="20"/></label>
                </div>

                <hr class="separator">
                <hr class="separator">

                <label>Izolacja podłogi</label>
                <select id="hasBottomIsolation" name="bottom_isolation">
                    <option value="yes">Tak</option>
                    <option value="no">Nie</option>
                </select>

                <div id="bottomIsolationFields">
                    <label>Materiał izolacyjny podłogi</label>
                    <select name="bottom_isolation[material]" id="bottom_isolation[material]">
                        <option value="68">Wełna mineralna</option>
                        <option value="70">Styropian</option>
                        <option value="71">Styropian twardy (XPS)</option>
                        <option value="88">Styropian grafitowy</option>
                        <option value="86">Piana PUR</option>
                        <option value="64">Korek</option>
                        <option value="65">Słoma</option>
                        <option value="66">Trzcina</option>
                        <option value="81">Padzierz lniany</option>
                        <option value="87">Ekofiber</option>
                        <option value="94">Wełna drzewna</option>
                        <option value="95">PIR</option>
                        <option value="98">Celuloza</option>
                        <option value="101">Multipor</option>
                    </select>
                    <label>Grubość izolacji podłogi (cm)<input min="0" name="bottom_isolation[size]" id="bottom_isolation[Size]" step="1" type="number" value="10"/></label>
                </div>

                <hr class="separator">

                <div class="btn-row">
                  <button class="btn-prev" type="button">Cofnij</button>
                  <button class="btn-next5" type="button">Dalej</button>

                </div>
            </div>

            <!-- Zakładka 5: Ogrzewanie i CWU -->
            <div class="section" data-tab="5">
                <div class="progress-bar-premium" data-step="6">
                    <div class="step completed"><span>1</span></div>
                    <div class="step completed"><span>2</span></div>
                    <div class="step completed"><span>3</span></div>
                    <div class="step completed"><span>4</span></div>
                    <div class="step completed"><span>5</span></div>
                    <div class="step active"><span>6</span></div>
                </div>

                <h3>OGRZEWANIE, WODA, PANELE</h3>
                <hr class="separator">
                <div class="final-summary">
                    <h4>Podsumowanie wprowadzonych danych:</h4>
                    <div class="summary-grid">
                        <div class="summary-item">
                            <span class="summary-label">Rodzaj budynku:</span>
                            <span class="summary-value" id="summary-building-type">-</span>
                        </div>
                        <div class="summary-item">
                            <span class="summary-label">Rok budowy:</span>
                            <span class="summary-value" id="summary-construction-year">-</span>
                        </div>
                        <div class="summary-item">
                            <span class="summary-label">Strefa klimatyczna:</span>
                            <span class="summary-value" id="summary-location">-</span>
                        </div>
                    </div>
                </div>

                <hr class="separator"><hr class="separator">
                <label>Główne źródło ciepła</label>
                <select name="source_type" required="">
                    <option value="air_to_water_hp">Pompa ciepła powietrze-woda</option>
                    <option value="gas">Gaz</option>
                    <option value="oil">Olej</option>
                    <option value="biomass">Biomasa</option>
                    <option value="district_heating">Ciepło sieciowe</option>
                </select>
                <hr class="separator"><hr class="separator">

                <label>Docelowa temperatura (°C)</label>
                <input max="30" min="15" name="indoor_temperature" type="number" value="21"/>
                <hr class="separator"><hr class="separator">
                <label>Wentylacja:</label>
                <select name="ventilation_type">
                    <option value="natural">Grawitacyjna, naturalna</option>
                    <option value="mechanical">Mechaniczna</option>
                    <option value="mechanical_recovery">Mechaniczna z rekuperacją</option>
                </select>
                <hr class="separator"><hr class="separator">

                <label>Typ instalacji grzewczej w budynku:</label>
                <div class="form-field__select-wrapper">
                    <select name="heating_type" required class="form-select">
                        <option value="underfloor">Ogrzewanie podłogowe</option>
                        <option value="radiators">Kaloryfery / grzejniki</option>
                        <option value="mixed">Mieszane (podłogówka + kaloryfery)</option>
                    </select>
                    <span class="tooltip-icon-wrapper" tabindex="0">
                        <img src="https://topinstal.com.pl/pictures/info-light.png" alt="Info" class="tooltip-icon" />
                        <span class="tooltip-text">Jeżeli masz podłogówkę i np. dodatkowe 2 grzejniki łazienkowe - w dalszym ciągu
                            wybierasz ogrzewanie podłogowe. Układ mieszany wybierasz, gdy faktycznie masz 2 strefy z różnymi odbiornikami ciepła.
                        </span>
                    </span>
                </div>
                <hr class="separator"><hr class="separator">

                <label>Czy pompa ma przygotowywać ciepłą wodę użytkową?</label>
                <div class="form-field__checkbox-inline">
                    <input id="includeHotWater" name="include_hot_water" type="checkbox" value="true" />
                    <label for="includeHotWater">TAK</label>
                    <span class="tooltip-icon-wrapper" tabindex="0">
                        <img src="https://topinstal.com.pl/pictures/info-light.png" alt="Info" class="tooltip-icon" />
                        <span class="tooltip-text">Wyłącz tylko jeśli posiadasz inne źródło ciepłej wody i nie zamierzasz ogrzewać
                            zasobnika na wodę kranową za pomocą pompy ciepła.
                        </span>
                    </span>
                </div>
                <hr class="separator">

                <div id="hotWaterOptions">
                    <label>Liczba mieszkańców</label>
                    <select name="hot_water_persons">
                        <option value="1">1 osoba</option>
                        <option value="2">2 osoby</option>
                        <option value="4" selected>3-4 osoby</option>
                        <option value="6">5-6 osób</option>
                        <option value="8">7+ osób</option>
                    </select>
                    <hr class="separator">

                    <label for="hot_water_usage">Zużycie ciepłej wody:</label>
                    <div class="form-field__select-wrapper">
                        <select name="hot_water_usage" id="hot_water_usage" required class="form-select">
                            <option value="shower">Małe zużycie</option>
                            <option value="shower_bath" selected>Średnie zużycie</option>
                            <option value="bath">Duże zużycie</option>
                        </select>
                        <span class="tooltip-icon-wrapper" tabindex="0">
                            <img src="https://topinstal.com.pl/pictures/info-light.png" alt="Info" class="tooltip-icon" />
                            <span class="tooltip-text">Małe: tylko umywalka i prysznic. Średnie: dodatkowa wanna, zmywarka. Duże: więcej punktów poboru wody, częste kąpiele w wannie.
                            </span>
                        </span>
                    </div>
                </div>
                <hr class="separator">
                <div class="btn-row"> 
                    <button class="btn-prev" type="button">Cofnij</button>
                    <button class="btn-finish" type="button">SPRAWDŹ WYNIK</button>
                </div>
            </div>

            <!-- ZORDON 3.0 - Sekcja Wyników Ultra Premium -->
            <section class="results-wrapper section" data-tab="6">
                <div class="progress-bar-premium" data-step="6">
                    <div class="step completed"><span>1</span></div>
                    <div class="step completed"><span>2</span></div>
                    <div class="step completed"><span>3</span></div>
                    <div class="step completed"><span>4</span></div>
                    <div class="step completed"><span>5</span></div>
                    <div class="step active"><span>6</span></div>
                </div>

                <!-- PROFIL ENERGETYCZNY - WYNIKI OBLICZEŃ -->
                <div class="energy-profile-section glass-box">
                    <h2 class="result-title">Twój profil energetyczny - WYNIK</h2>
                    <p class="result-subtitle">Kompleksowa analiza zapotrzebowania na ciepło dla Twojego budynku</p>
                    
                    <div class="result-grid">
                        <div class="result-item"><span class="icon-squares">Powierzchnia całkowita</span> <strong id="r-total-area">...</strong></div>
                        <div class="result-item"><span class="icon-flame">Powierzchnia ogrzewana</span> <strong id="r-heated-area">...</strong></div>
                        <div class="result-item"><span class="icon-power">Moc maksymalna (c.o.)</span> <strong id="r-max-power">...</strong></div>
                        <div class="result-item"><span class="icon-drop">Moc CWU</span> <strong id="r-cwu">...</strong></div>
                        <div class="result-item"><span class="icon-chart">Zużycie roczne</span> <strong id="r-energy">...</strong></div>
                        <div class="result-item"><span class="icon-thermometer">Temperatura projektowa</span> <strong id="r-temp">...</strong></div>
                        <div class="result-item"><span class="icon-target">Punkt biwalentny</span> <strong id="r-bi-power">...</strong></div>
                        <div class="result-item"><span class="icon-globe">Temperatura średnioroczna</span> <strong id="r-temp-avg">...</strong></div>
                        <div class="result-item"><span class="icon-power">Moc średnia</span> <strong id="r-avg-power">...</strong></div>
                    </div>
                </div>

                <!-- SLIDERY Z POMPAMI -->
                <div id="pump-recommendation-zone"></div>

                <!-- PRZYCISKI FUNKCJONALNE -->
                <div class="results-actions glass-box">
                    <div class="action-row primary-actions">
<button type="button" id="download-pdf-btn">Pobierz raport PDF</button>                    </div>
                    
                    <!-- FORMULARZ KONTAKTOWY DLA PDF (ukryty domyślnie) -->
                    <div id="pdf-contact-form" class="pdf-contact-form hidden">
                        <div class="contact-form-content">
                            <div class="form-header">
                                <h4><i class="fas fa-envelope"></i> Otrzymaj pełny raport energetyczny</h4>
                                <p>Pełny raport energetyczny z doborem mocy pompy otrzymasz drogą mailową</p>
                            </div>
                            
                            <div class="form-fields">
                                <div class="form-field">
                                    <label for="customer-email">Email <span class="required">*</span></label>
                                    <input type="email" id="customer-email" class="contact-input" placeholder="twoj@email.pl" required>
                                </div>
                                
                                <div class="form-field">
                                    <label for="customer-postal-code">Kod pocztowy <span class="required">*</span></label>
                                    <input type="text" id="customer-postal-code" class="contact-input" placeholder="00-000" maxlength="6" required>
                                    <small class="field-note">Dla celów statystycznych</small>
                                </div>
                            </div>
                            
                            <div class="form-actions">
                                <button class="action-btn primary full-width" onclick="collectCustomerData()">
                                    <i class="fas fa-paper-plane"></i> Odbierz raport cieplny PDF
                                </button>
                                <button class="action-btn cancel-btn" onclick="hidePDFContactForm()">
                                    <i class="fas fa-times"></i> Anuluj
                                </button>
                            </div>
                        </div>
                    </div>
                    
                    <div class="action-row secondary-actions">
                        <button class="action-btn secondary" onclick="goBackToForm()">
                            <i class="fas fa-arrow-left"></i> Wróć do formularza
                        </button>
                        <button class="action-btn tertiary" onclick="startNewCalculation()">
                            <i class="fas fa-calculator"></i> Nowe obliczenie
                        </button>
                        <button class="action-btn tertiary disabled-feature" disabled data-tooltip="Wkrótce dostępne" onclick="window.open('https://topinstal.com.pl/konfigurator', '_blank')">
                            <i class="fas fa-cogs"></i> Konfigurator
                        </button>
                    </div>
                </div>
            </section>
        </form>

        <!-- Brand Footer -->
        <div class="authority-header">
            <div class="brand-content">
                <img src="https://topinstal.com.pl/pictures/www-mobile.png" alt="TOP-INSTAL" class="brand-logo">
                <div class="brand-text">
                    <p><strong>TOP-INSTAL</strong> - Profesjonalne instalacje</p>
                    <p>Autoryzowany partner Panasonic i Mitsubishi Electric</p>
                </div>
            </div>
        </div>

        <!-- FINAL PREMIUM AI-COACH DOCK -->
        <div id="ai-coach-dock" aria-live="polite">
          <div class="ai-coach-dock__content">
            <span id="ai-coach-icon" class="ai-coach-dock__icon" aria-label="AI Asystent">
              <!-- Normalna ikona -->
              <svg id="ai-icon-svg" viewBox="0 0 20 20" fill="none" width="22" height="22">
                <circle cx="10" cy="10" r="9" stroke="#C20118" stroke-width="2"/>
                <path d="M10 13v.01" stroke="#C20118" stroke-width="2" stroke-linecap="round"/>
                <path d="M10 7a2 2 0 0 1 2 2c0 .828-.895 1.464-1.435 1.947C10.166 11.256 10 12 10 12" stroke="#2D3657" stroke-width="1.5" stroke-linecap="round"/>
              </svg>
              <!-- Animacja ładowania (ukryta na start) -->
              <span id="ai-coach-loader" class="ai-coach-dock__loader" hidden>
                <svg viewBox="0 0 40 40" width="22" height="22">
                  <circle cx="20" cy="20" r="16" stroke="#C20118" stroke-width="3" fill="none" opacity="0.17"/>
                  <circle cx="20" cy="20" r="16" stroke="#C20118" stroke-width="3" fill="none" stroke-dasharray="100" stroke-dashoffset="75" stroke-linecap="round">
                    <animateTransform attributeName="transform" type="rotate" values="0 20 20;360 20 20" dur="1s" repeatCount="indefinite"/>
                  </circle>
                </svg>
              </span>
            </span>
            <span id="ai-coach-dock-text" class="ai-coach-dock__text">INTELIGENTNA POMOC</span>
            <button id="ai-coach-pause" class="ai-coach-dock__btn" aria-label="Wstrzymaj AI" title="Wstrzymaj AI">⏸️</button>
            <button id="ai-coach-resume" class="ai-coach-dock__btn" aria-label="Wznów AI" title="Wznów AI" hidden>▶️</button>
          </div>
        </div>
    </div>

    <?php
    return ob_get_clean();
}
add_shortcode('kalkulator', 'kalkulator_shortcode');

// Dodaj action hook dla AJAX (opcjonalnie)
add_action('wp_ajax_topinstal_calculator', 'handle_topinstal_calculator_ajax');
add_action('wp_ajax_nopriv_topinstal_calculator', 'handle_topinstal_calculator_ajax');

function handle_topinstal_calculator_ajax() {
    // Sprawdź nonce
    if (!wp_verify_nonce($_POST['nonce'], 'topinstal_calculator_nonce')) {
        wp_die('Security check failed');
    }
    
    // Tutaj możesz dodać obsługę AJAX jeśli potrzebna
    wp_die();
}
?>