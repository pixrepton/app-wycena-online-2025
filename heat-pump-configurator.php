<?php
/**
 * Plugin Name: Heat Pump Configurator Extended
 * Description: 3-step heat pump configurator with premium UI integration
 * Version: 1.0.0
 * Author: Top-Instal
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

class HeatPumpConfiguratorExtended {
    
    public function __construct() {
        add_action('init', array($this, 'init'));
        add_action('wp_enqueue_scripts', array($this, 'enqueue_scripts'));
        add_shortcode('heat_pump_configurator', array($this, 'render_configurator'));
        add_action('wp_ajax_calculate_heat_demand', array($this, 'calculate_heat_demand'));
        add_action('wp_ajax_nopriv_calculate_heat_demand', array($this, 'calculate_heat_demand'));
        add_action('wp_ajax_get_pump_recommendations', array($this, 'get_pump_recommendations'));
        add_action('wp_ajax_nopriv_get_pump_recommendations', array($this, 'get_pump_recommendations'));
        add_action('wp_ajax_get_component_recommendations', array($this, 'get_component_recommendations'));
        add_action('wp_ajax_nopriv_get_component_recommendations', array($this, 'get_component_recommendations'));
    }

    public function init() {
        // Plugin initialization
    }

    public function enqueue_scripts() {
        if (!is_singular()) return;
        
        global $post;
        if (has_shortcode($post->post_content, 'heat_pump_configurator')) {
            
            // Main CSS
            wp_enqueue_style(
                'configurator-main-css',
                plugin_dir_url(__FILE__) . 'assets/configurator-main.css',
                array(),
                '1.0.0'
            );
            
            // Font Awesome
            wp_enqueue_style(
                'font-awesome',
                'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css',
                array(),
                '6.0.0'
            );
            
            // Feather Icons
            wp_enqueue_script(
                'feather-icons',
                'https://unpkg.com/feather-icons',
                array(),
                '4.29.0',
                true
            );
            
            // Main JavaScript files
            wp_enqueue_script(
                'configurator-data-js',
                plugin_dir_url(__FILE__) . 'assets/configurator-data.js',
                array('jquery'),
                '1.0.0',
                true
            );
            
            wp_enqueue_script(
                'step1-selection-js',
                plugin_dir_url(__FILE__) . 'assets/step1-selection.js',
                array('jquery', 'configurator-data-js'),
                '1.0.0',
                true
            );
            
            wp_enqueue_script(
                'step3-components-js',
                plugin_dir_url(__FILE__) . 'assets/step3-components.js',
                array('jquery', 'configurator-data-js'),
                '1.0.0',
                true
            );
            
            wp_enqueue_script(
                'pump-recommendations-js',
                plugin_dir_url(__FILE__) . 'assets/pump-recommendations.js',
                array('jquery', 'configurator-data-js'),
                '1.0.0',
                true
            );
            
            wp_enqueue_script(
                'configurator-main-js',
                plugin_dir_url(__FILE__) . 'assets/configurator-main.js',
                array('jquery', 'configurator-data-js', 'step1-selection-js', 'step3-components-js', 'pump-recommendations-js'),
                '1.0.0',
                true
            );
            
            // Localize script for AJAX
            wp_localize_script('configurator-main-js', 'configuratorAjax', array(
                'ajax_url' => admin_url('admin-ajax.php'),
                'nonce' => wp_create_nonce('configurator_nonce')
            ));
        }
    }

    public function render_configurator() {
        ob_start();
        ?>
        <div id="heat-pump-configurator-extended">
            <!-- Progress Indicator -->
            <div class="progress-container">
                <div class="progress-bar">
                    <div class="progress-fill" id="progress-fill"></div>
                </div>
                <div class="progress-steps">
                    <div class="step-indicator active" data-step="1">
                        <i data-feather="clipboard"></i>
                        <span>Dane wyjściowe</span>
                    </div>
                    <div class="step-indicator" data-step="2">
                        <i data-feather="calculator"></i>
                        <span>Obliczenia</span>
                    </div>
                    <div class="step-indicator" data-step="3">
                        <i data-feather="settings"></i>
                        <span>Konfiguracja</span>
                    </div>
                </div>
            </div>

            <!-- Step 1: Selection Screen -->
            <div class="configurator-step active" id="step-1">
                <div class="step-header">
                    <h2><i data-feather="clipboard"></i> Jak chcesz określić zapotrzebowanie na ciepło?</h2>
                    <p>Wybierz najbardziej odpowiednią opcję dla swojego budynku</p>
                </div>
                
                <div class="selection-grid">
                    <div class="selection-card" data-option="know-power">
                        <div class="card-icon">
                            <i data-feather="zap"></i>
                        </div>
                        <h3>Znam moc pompy</h3>
                        <p>Mam już obliczoną lub znaną moc grzewczą potrzebną dla mojego budynku</p>
                        <div class="card-features">
                            <span><i data-feather="check"></i> Szybka konfiguracja</span>
                            <span><i data-feather="check"></i> Bezpośredni dobór</span>
                        </div>
                    </div>
                    
                    <div class="selection-card" data-option="have-audit">
                        <div class="card-icon">
                            <i data-feather="file-text"></i>
                        </div>
                        <h3>Mam audyt energetyczny</h3>
                        <p>Posiadam dokumentację z audytu energetycznego lub projektu budowlanego</p>
                        <div class="card-features">
                            <span><i data-feather="check"></i> Precyzyjne dane</span>
                            <span><i data-feather="check"></i> Profesjonalna analiza</span>
                        </div>
                    </div>
                    
                    <div class="selection-card recommended" data-option="calculate">
                        <div class="card-icon">
                            <i data-feather="calculator"></i>
                        </div>
                        <h3>Chcę obliczyć</h3>
                        <p>Skorzystam z kalkulatora aby obliczyć zapotrzebowanie na podstawie parametrów budynku</p>
                        <div class="card-features">
                            <span><i data-feather="check"></i> Szczegółowa analiza</span>
                            <span><i data-feather="check"></i> Rekomendowane</span>
                        </div>
                        <div class="recommended-badge">Rekomendowane</div>
                    </div>
                </div>
                
                <!-- Dynamic Form Fields -->
                <div class="dynamic-fields" id="dynamic-fields" style="display: none;">
                    <!-- Content will be populated by JavaScript -->
                </div>
                
                <div class="step-actions">
                    <button class="btn btn-primary" id="continue-step1" disabled>
                        Kontynuuj <i data-feather="arrow-right"></i>
                    </button>
                </div>
            </div>

            <!-- Step 2: Calculator Integration -->
            <div class="configurator-step" id="step-2">
                <div class="step-header">
                    <h2><i data-feather="calculator"></i> Kalkulator zapotrzebowania na ciepło</h2>
                    <p>Wypełnij formularz aby obliczyć optymalne parametry</p>
                </div>
                
                <div class="calculator-container">
                    <!-- Existing calculator will be loaded here -->
                    <div id="calculator-placeholder">
                        <div class="loading-spinner">
                            <i data-feather="loader"></i>
                            <span>Ładowanie kalkulatora...</span>
                        </div>
                    </div>
                </div>
                
                <div class="step-actions">
                    <button class="btn btn-secondary" id="back-to-step1">
                        <i data-feather="arrow-left"></i> Cofnij
                    </button>
                    <button class="btn btn-primary" id="continue-step2" disabled>
                        Kontynuuj <i data-feather="arrow-right"></i>
                    </button>
                </div>
            </div>

            <!-- Step 3: Component Configuration -->
            <div class="configurator-step" id="step-3">
                <div class="step-header">
                    <h2><i data-feather="settings"></i> Konfiguracja komponentów</h2>
                    <p>Dobierz dodatkowe komponenty do swojego systemu</p>
                </div>
                
                <!-- Pump Recommendations -->
                <div class="pump-recommendations" id="pump-recommendations">
                    <!-- Content will be populated by JavaScript -->
                </div>
                
                <!-- Component Selection -->
                <div class="component-selection" id="component-selection">
                    <!-- Content will be populated by JavaScript -->
                </div>
                
                <!-- Pricing Summary -->
                <div class="pricing-summary" id="pricing-summary">
                    <!-- Content will be populated by JavaScript -->
                </div>
                
                <div class="step-actions">
                    <button class="btn btn-secondary" id="back-to-step2">
                        <i data-feather="arrow-left"></i> Cofnij
                    </button>
                    <button class="btn btn-primary" id="generate-quote">
                        Generuj ofertę <i data-feather="download"></i>
                    </button>
                </div>
            </div>
        </div>

        <!-- Loading Overlay -->
        <div class="loading-overlay" id="loading-overlay" style="display: none;">
            <div class="loading-content">
                <i data-feather="loader"></i>
                <span>Przetwarzanie danych...</span>
            </div>
        </div>
        <?php
        return ob_get_clean();
    }

    public function calculate_heat_demand() {
        check_ajax_referer('configurator_nonce', 'nonce');
        
        $data = $_POST['data'];
        
        // Heat demand calculation logic
        $heating_area = floatval($data['heating_area']);
        $building_year = intval($data['building_year']);
        $heating_type = sanitize_text_field($data['heating_type']);
        $insulation_level = sanitize_text_field($data['insulation_level']);
        
        // Calculate heat demand based on building parameters
        $heat_demand_per_sqm = $this->get_heat_demand_coefficient($building_year, $insulation_level);
        $total_heat_demand = $heating_area * $heat_demand_per_sqm;
        
        // Add CWU demand if needed
        if (!empty($data['cwu_needed'])) {
            $cwu_demand = $this->calculate_cwu_demand($data['residents'], $data['usage_pattern']);
            $total_heat_demand += $cwu_demand;
        }
        
        wp_send_json_success(array(
            'heat_demand' => $total_heat_demand,
            'heat_demand_per_sqm' => $heat_demand_per_sqm,
            'cwu_demand' => isset($cwu_demand) ? $cwu_demand : 0
        ));
    }

    public function get_pump_recommendations() {
        check_ajax_referer('configurator_nonce', 'nonce');
        
        $heat_demand = floatval($_POST['heat_demand']);
        $heating_type = sanitize_text_field($_POST['heating_type']);
        
        $pumps = array(
            'split' => $this->get_split_pump_recommendation($heat_demand, $heating_type),
            'monoblock' => $this->get_monoblock_pump_recommendation($heat_demand, $heating_type)
        );
        
        wp_send_json_success($pumps);
    }

    public function get_component_recommendations() {
        check_ajax_referer('configurator_nonce', 'nonce');
        
        $data = $_POST['data'];
        $components = array();
        
        // DHW tank recommendation
        if (!empty($data['cwu_needed'])) {
            $components['dhw_tank'] = $this->get_dhw_tank_recommendation($data['residents'], $data['usage_pattern']);
        }
        
        // Buffer tank recommendation
        $components['buffer_tank'] = $this->get_buffer_tank_recommendation($data['heat_demand'], $data['heating_type']);
        
        // Additional components
        $components['additional'] = $this->get_additional_components($data);
        
        wp_send_json_success($components);
    }

    private function get_heat_demand_coefficient($building_year, $insulation_level) {
        $coefficients = array(
            '2025' => 30,
            '2021' => 40,
            '2011' => 60,
            '2000' => 80,
            '1990' => 100,
            '1980' => 120,
            '1970' => 140,
            '1960' => 160,
            '1950' => 180,
            '1940' => 200,
            '1939' => 220,
            '1914' => 240
        );
        
        $base_coefficient = isset($coefficients[$building_year]) ? $coefficients[$building_year] : 150;
        
        // Adjust for insulation level
        switch ($insulation_level) {
            case 'excellent':
                return $base_coefficient * 0.7;
            case 'good':
                return $base_coefficient * 0.85;
            case 'average':
                return $base_coefficient;
            case 'poor':
                return $base_coefficient * 1.2;
            default:
                return $base_coefficient;
        }
    }

    private function calculate_cwu_demand($residents, $usage_pattern) {
        $base_demand = $residents * 0.5; // kW per person
        
        switch ($usage_pattern) {
            case 'economical':
                return $base_demand * 0.8;
            case 'comfortable':
                return $base_demand * 1.2;
            case 'luxury':
                return $base_demand * 1.5;
            default:
                return $base_demand;
        }
    }

    private function get_split_pump_recommendation($heat_demand, $heating_type) {
        // Logic for split pump recommendation
        return array(
            'model' => 'Panasonic Split ' . ceil($heat_demand) . 'kW',
            'power' => ceil($heat_demand),
            'price' => ceil($heat_demand) * 3000,
            'efficiency' => 'A+++',
            'features' => array('Cicha praca', 'Praca do -25°C', 'Inteligentne sterowanie')
        );
    }

    private function get_monoblock_pump_recommendation($heat_demand, $heating_type) {
        // Logic for monoblock pump recommendation
        return array(
            'model' => 'Panasonic Monoblock ' . ceil($heat_demand) . 'kW',
            'power' => ceil($heat_demand),
            'price' => ceil($heat_demand) * 2800,
            'efficiency' => 'A+++',
            'features' => array('Kompaktowa konstrukcja', 'Łatwy montaż', 'Bez ryzyka wycieku')
        );
    }

    private function get_dhw_tank_recommendation($residents, $usage_pattern) {
        $tank_sizes = array(
            'economical' => array(1 => 150, 2 => 200, 3 => 250, 4 => 300),
            'comfortable' => array(1 => 200, 2 => 250, 3 => 300, 4 => 400),
            'luxury' => array(1 => 250, 2 => 300, 3 => 400, 4 => 500)
        );
        
        $residents = min($residents, 4);
        $size = $tank_sizes[$usage_pattern][$residents] ?? 300;
        
        return array(
            'size' => $size,
            'price' => $size * 8,
            'features' => array('Izolacja wysokiej klasy', 'Anoda magnezowa', 'Cyfrowy wyświetlacz')
        );
    }

    private function get_buffer_tank_recommendation($heat_demand, $heating_type) {
        $size = $heating_type === 'radiators' ? ceil($heat_demand * 20) : ceil($heat_demand * 15);
        
        return array(
            'size' => $size,
            'price' => $size * 6,
            'features' => array('Stal nierdzewna', 'Izolacja termiczna', 'Przyłącza wielofunkcyjne')
        );
    }

    private function get_additional_components($data) {
        $components = array();
        
        // WiFi module
        $components['wifi'] = array(
            'name' => 'Moduł WiFi',
            'price' => 599,
            'description' => 'Zdalne sterowanie przez aplikację'
        );
        
        // Separator
        if ($data['heating_type'] === 'mixed') {
            $components['separator'] = array(
                'name' => 'Separator hydrauliczny',
                'price' => 899,
                'description' => 'Rozdzielenie obiegów grzewczych'
            );
        }
        
        // Foundation
        $components['foundation'] = array(
            'name' => 'Fundament antywibracyjny',
            'price' => 1299,
            'description' => 'Redukcja drgań i hałasu'
        );
        
        return $components;
    }
}

// Initialize the plugin
new HeatPumpConfiguratorExtended();
?>
