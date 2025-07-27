(function() {
    'use strict';

    // Tabela doboru pomp ciepła
    const pumpMatchingTable = {
        "KIT-SDC03K3E5": {
            min: { surface: 3.0, mixed: 3.0, radiators: 2.5 },
            max: { surface: 4.2, mixed: 4.2, radiators: 3.5 },
            power: 3,
            series: 'SDC',
            type: 'split'
        },
        "KIT-SDC05K3E5": {
            min: { surface: 4.3, mixed: 4.3, radiators: 3.5 },
            max: { surface: 6.5, mixed: 6.4, radiators: 6.0 },
            power: 5,
            series: 'SDC',
            type: 'split'
        },
        "KIT-SDC07K3E5": {
            min: { surface: 5.5, mixed: 5.0, radiators: 4.5 },
            max: { surface: 7.0, mixed: 6.5, radiators: 6.5 },
            power: 7,
            series: 'SDC',
            type: 'split'
        },
        "KIT-SDC09K3E5": {
            min: { surface: 6.7, mixed: 6.5, radiators: 5.5 },
            max: { surface: 8.0, mixed: 8.0, radiators: 7.5 },
            power: 9,
            series: 'SDC',
            type: 'split'
        },
        "KIT-SDC09K3E8": {
            min: { surface: 8.0, mixed: 8.1, radiators: 7.5 },
            max: { surface: 11.0, mixed: 10.5, radiators: 10.0 },
            power: 9,
            series: 'SDC',
            type: 'split'
        },
        "KIT-SDC12K6E8": {
            min: { surface: 10.5, mixed: 9.5, radiators: 8.5 },
            max: { surface: 14.5, mixed: 13.0, radiators: 12.0 },
            power: 12,
            series: 'SDC',
            type: 'split'
        },
        "KIT-SDC12K9E8": {
            min: { surface: 10.5, mixed: 9.5, radiators: 8.5 },
            max: { surface: 14.5, mixed: 13.5, radiators: 13.0 },
            power: 12,
            series: 'SDC',
            type: 'split'
        },
        "KIT-SDC16K9E8": {
            min: { surface: 12.5, mixed: 11.0, radiators: 10.0 },
            max: { surface: 17.5, mixed: 16.0, radiators: 14.5 },
            power: 16,
            series: 'SDC',
            type: 'split'
        },
        "KIT-ADC03K3E5": {
            min: { surface: 3.0, mixed: 3.0, radiators: 2.5 },
            max: { surface: 4.2, mixed: 4.2, radiators: 3.5 },
            power: 3,
            series: 'ADC',
            type: 'all-in-one'
        },
        "KIT-ADC05K3E5": {
            min: { surface: 4.3, mixed: 4.3, radiators: 3.5 },
            max: { surface: 6.5, mixed: 6.4, radiators: 6.0 },
            power: 5,
            series: 'ADC',
            type: 'all-in-one'
        },
        "KIT-ADC07K3E5": {
            min: { surface: 5.5, mixed: 5.0, radiators: 4.5 },
            max: { surface: 7.0, mixed: 6.5, radiators: 6.5 },
            power: 7,
            series: 'ADC',
            type: 'all-in-one'
        },
        "KIT-ADC09K3E5": {
            min: { surface: 6.7, mixed: 6.5, radiators: 5.5 },
            max: { surface: 8.0, mixed: 8.0, radiators: 7.5 },
            power: 9,
            series: 'ADC',
            type: 'all-in-one'
        },
        "KIT-ADC09K3E8": {
            min: { surface: 8.0, mixed: 8.1, radiators: 7.5 },
            max: { surface: 11.0, mixed: 10.5, radiators: 10.0 },
            power: 9,
            series: 'ADC',
            type: 'all-in-one'
        },
        "KIT-ADC12K6E8": {
            min: { surface: 10.5, mixed: 9.5, radiators: 8.5 },
            max: { surface: 14.5, mixed: 13.0, radiators: 12.0 },
            power: 12,
            series: 'ADC',
            type: 'all-in-one'
        },
        "KIT-ADC12K9E8": {
            min: { surface: 10.5, mixed: 9.5, radiators: 8.5 },
            max: { surface: 14.5, mixed: 13.5, radiators: 13.0 },
            power: 12,
            series: 'ADC',
            type: 'all-in-one'
        },
        "KIT-ADC16K9E8": {
            min: { surface: 12.5, mixed: 11.0, radiators: 10.0 },
            max: { surface: 17.5, mixed: 16.0, radiators: 14.5 },
            power: 16,
            series: 'ADC',
            type: 'all-in-one'
        }
    };

    // Baza danych pomp ciepła
    const pumpCardsData = [
        { model: "KIT-SDC03K3E5", power: 3, series: "SDC", type: "split", image: "pictures/split-k.png", price: 15999 },
        { model: "KIT-SDC05K3E5", power: 5, series: "SDC", type: "split", image: "pictures/split-k.png", price: 18999 },
        { model: "KIT-SDC07K3E5", power: 7, series: "SDC", type: "split", image: "pictures/split-k.png", price: 22999 },
        { model: "KIT-SDC09K3E5", power: 9, series: "SDC", type: "split", image: "pictures/split-k.png", price: 26999 },
        { model: "KIT-SDC09K3E8", power: 9, series: "SDC", type: "split", image: "pictures/split-k.png", price: 28999 },
        { model: "KIT-SDC12K6E8", power: 12, series: "SDC", type: "split", image: "pictures/split-k.png", price: 34999 },
        { model: "KIT-SDC12K9E8", power: 12, series: "SDC", type: "split", image: "pictures/split-k.png", price: 34999 },
        { model: "KIT-SDC16K9E8", power: 16, series: "SDC", type: "split", image: "pictures/split-k.png", price: 42999 },
        { model: "KIT-ADC03K3E5", power: 3, series: "ADC", type: "all-in-one", image: "pictures/allinone.png", price: 17999 },
        { model: "KIT-ADC05K3E5", power: 5, series: "ADC", type: "all-in-one", image: "pictures/allinone.png", price: 20999 },
        { model: "KIT-ADC07K3E5", power: 7, series: "ADC", type: "all-in-one", image: "pictures/allinone.png", price: 24999 },
        { model: "KIT-ADC09K3E5", power: 9, series: "ADC", type: "all-in-one", image: "pictures/allinone.png", price: 28999 },
        { model: "KIT-ADC09K3E8", power: 9, series: "ADC", type: "all-in-one", image: "pictures/allinone.png", price: 30999 },
        { model: "KIT-ADC12K6E8", power: 12, series: "ADC", type: "all-in-one", image: "pictures/allinone.png", price: 36999 },
        { model: "KIT-ADC12K9E8", power: 12, series: "ADC", type: "all-in-one", image: "pictures/allinone.png", price: 36999 },
        { model: "KIT-ADC16K9E8", power: 16, series: "ADC", type: "all-in-one", image: "pictures/allinone.png", price: 44999 }
    ];

    /**
     * Waliduje i normalizuje dane wyników z API
     */
    function validateAndNormalizeResult(result) {
        if (!result || typeof result !== 'object') {
            throw new Error('Brak danych wyników lub nieprawidłowy format');
        }

        // Mapowanie pól z API na wymagane pola
        const normalized = {
            total_area: parseFloat(result.total_area || result.totalArea || result.floor_area || 0),
            heated_area: parseFloat(result.heated_area || result.heatedArea || result.floor_area || 0),
            design_outdoor_temperature: parseFloat(result.design_outdoor_temperature || result.designOutdoorTemperature || -20),
            max_heating_power: parseFloat(result.max_heating_power || result.maxHeatingPower || result.heating_power || 0),
            hot_water_power: parseFloat(result.hot_water_power || result.hotWaterPower || result.cwu_power || 0),
            bivalent_point_heating_power: parseFloat(result.bivalent_point_heating_power || result.bivalentPointHeatingPower || result.bi_power || 0),
            avg_heating_power: parseFloat(result.avg_heating_power || result.avgHeatingPower || result.average_power || 0),
            avg_outdoor_temperature: parseFloat(result.avg_outdoor_temperature || result.avgOutdoorTemperature || 8),
            annual_energy_consumption: parseFloat(result.annual_energy_consumption || result.annualEnergyConsumption || result.energy_consumption || 0),
            annual_energy_consumption_factor: parseFloat(result.annual_energy_consumption_factor || result.annualEnergyConsumptionFactor || result.energy_factor || 0),
            heating_power_factor: parseFloat(result.heating_power_factor || result.heatingPowerFactor || result.power_factor || 0),
            cop: parseFloat(result.cop || result.COP || 4.0),
            scop: parseFloat(result.scop || result.SCOP || 4.0)
        };

        // Sprawdź czy mamy podstawowe dane
        if (normalized.max_heating_power <= 0) {
            throw new Error('Brak wymaganej mocy grzewczej w wynikach API');
        }

        if (normalized.heated_area <= 0) {
            throw new Error('Brak powierzchni ogrzewanej w wynikach API');
        }

        console.log('✅ Znormalizowane wyniki API:', normalized);
        return normalized;
    }

    /**
     * Dobiera pompy ciepła na podstawie wyników
     */
    function selectHeatPumps(result, heatingType = 'radiators') {
        const powerDemand = result.max_heating_power + (result.hot_water_power || 0);
        console.log(`🔍 Dobór pomp dla mocy ${powerDemand} kW, typ: ${heatingType}`);

        const matchingPumps = Object.entries(pumpMatchingTable)
            .filter(([model, data]) => {
                const min = data.min[heatingType];
                const max = data.max[heatingType];
                return powerDemand >= min && powerDemand <= max;
            })
            .map(([model, data]) => {
                const pumpData = pumpCardsData.find(p => p.model === model);
                return {
                    model: model,
                    power: data.power,
                    series: data.series,
                    type: data.type,
                    image: pumpData?.image || 'pictures/default-pump.png',
                    price: pumpData?.price || 0
                };
            });

        console.log(`✅ Znaleziono ${matchingPumps.length} dopasowanych pomp`);
        return matchingPumps;
    }

  function displayResults(result) {
    const setText = (id, val, unit = '') => {
        const el = document.getElementById(id);
        if (el && val !== undefined && val !== null) el.textContent = `${val}${unit}`;
    };

    setText('r-total-area', result.total_area, ' m²');
    setText('r-heated-area', result.heated_area, ' m²');
    setText('r-max-power', result.max_heating_power, ' kW');
    setText('r-cwu', result.hot_water_power || 0, ' kW');
    setText('r-energy', Math.round(result.annual_energy_consumption), ' kWh');
    setText('r-temp', result.design_outdoor_temperature, '°C');
    setText('r-bi-power', result.bivalent_point_heating_power, ' kW');
    setText('r-avg-power', result.avg_heating_power, ' kW');
    setText('r-temp-avg', result.avg_outdoor_temperature, '°C');

    const pumpZone = document.getElementById('pump-recommendation-zone');
    const pumpsGrouped = DobierzPompe(result);
    renderHaierStyleSliders(pumpsGrouped, pumpZone);
}


    function resetResultsSection() {
        const loadingElements = document.querySelectorAll('[id^="r-"]');
        loadingElements.forEach(el => {
            if (el) el.textContent = '...';
        });

        console.log('🔄 Sekcja wyników zresetowana');
    }

    function displayRecommendedPumps(pumps, result) {
        const zone = document.getElementById('pump-recommendation-zone');
        if (!zone || !Array.isArray(pumps)) return;

        // Funkcja tworząca pojedynczą kartę pompy
        function createPumpCard(pump, badgeClass) {
            const typeLabel = pump.type === 'split' ? 'SPLIT (zewn. + wewn.)' : 'ALL-IN-ONE (1 jednostka)';
            const typeClass = pump.type === 'split' ? 'split' : 'all-in-one';

            const imagePath = pump.type === 'split' ?
                'https://topinstal.com.pl/wp-content/uploads/2024/split-k.png' :
                'https://topinstal.com.pl/wp-content/uploads/2024/aio-k.png';

            const card = document.createElement('div');
            card.className = `pump-recommendation-card recommended-${badgeClass} animate-fade-in animate-hover-lift`;
            card.setAttribute('data-pump', pump.model);

            card.innerHTML = `
                <div class="pump-image-container">
                    <img src="${imagePath}" alt="Pompa ciepła ${pump.type}" class="pump-image"
                         onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                    <div class="pump-image-fallback" style="display:none; align-items:center; justify-content:center; height:100%; color:#6B7280; font-size:14px; font-weight:500;">
                        📷 Zdjęcie pompy ${pump.type.toUpperCase()}
                    </div>
                    <div class="pump-image-overlay">${pump.type === 'split' ? 'SPLIT' : 'ALL-IN-ONE'}</div>
                </div>
                <div class="card-badge ${badgeClass}">${pump.series === 'SDC' ? 'REKOMENDOWANA' : 'ALTERNATYWA'}</div>
                <div class="card-series">PANASONIC SERIE K</div>
                <div class="card-type-badge ${typeClass}">${typeLabel}</div>
                <div class="card-model">${pump.model}</div>
                <div class="card-power">${pump.power} kW</div>
                <div class="card-price">${new Intl.NumberFormat('pl-PL').format(pump.price)} zł</div>
                <div class="card-features">
                    <div class="feature">Moc grzewcza: ${pump.power} kW</div>
                    <div class="feature">COP: 4.2 (wysoka efektywność)</div>
                    <div class="feature">Klasa energetyczna: A+++</div>
                    <div class="feature">Temperatura pracy: -25°C do +35°C</div>
                    <div class="feature">Cicha praca: < 35 dB(A)</div>
                </div>
                <button class="select-pump-btn configure-btn" data-pump="${pump.model}">WYBIERZ I KONFIGURUJ</button>
            `;

            const button = card.querySelector('.configure-btn');
            button.addEventListener('click', function() {
                const selectedPump = this.getAttribute('data-pump');
                const configData = {
                    from_calculator: true,
                    heated_area: result.heated_area,
                    max_heating_power: result.max_heating_power,
                    bivalent_power: result.bivalent_point_heating_power,
                    hot_water_power: result.hot_water_power || 0,
                    selected_pump: selectedPump,
                    annual_energy_consumption: result.annual_energy_consumption,
                    design_outdoor_temperature: result.design_outdoor_temperature
                };
                localStorage.setItem('config_data', JSON.stringify(configData));
                alert(`Wybrano pompę: ${selectedPump}\nDane zostały zapisane do konfiguracji.`);
            });

            return card;
        }

        // Funkcja renderowania kart pomp w sliderze
        function renderPumpCards(pumps, containerId, sliderTitle) {
            const container = document.getElementById(containerId);
            if (!container) return;

            // Sprawdź czy są pompy do wyświetlenia
            if (!pumps || pumps.length === 0) {
                container.style.display = 'none';
                return;
            }

            container.style.display = 'block';

            // Znajdź slider header i ustaw tytuł
            const sliderHeader = container.querySelector('.slider-header h3');
            if (sliderHeader) {
                sliderHeader.textContent = sliderTitle;
            }

            // Znajdź kontener na karty
            const cardsContainer = container.querySelector('.pump-cards-slider');
            if (!cardsContainer) return;

            // Wyczyść istniejące karty
            cardsContainer.innerHTML = '';

            // Utwórz slider track
            const sliderTrack = document.createElement('div');
            sliderTrack.className = 'slider-track';

            // Renderuj karty pomp
            pumps.forEach((pump, index) => {
                const pumpCard = createPumpCard(pump, index === 0 ? 'recommended' : 'alternative');
                sliderTrack.appendChild(pumpCard);
            });

            cardsContainer.appendChild(sliderTrack);

            // Dodaj nawigację slidera jeśli jest więcej niż jedna karta
            if (pumps.length > 1) {
                addSliderNavigation(cardsContainer, pumps.length);
            }

            // Inicjalizuj slider
            initializeSlider(cardsContainer, pumps.length);
        }

        // Funkcja dodawania nawigacji slidera
        function addSliderNavigation(container, totalSlides) {
            const navigation = document.createElement('div');
            navigation.className = 'slider-navigation';

            // Przycisk poprzedni
            const prevBtn = document.createElement('button');
            prevBtn.className = 'slider-btn slider-prev';
            prevBtn.innerHTML = '‹';
            prevBtn.setAttribute('aria-label', 'Poprzednia pompa');

            // Dots (kropki nawigacyjne)
            const dotsContainer = document.createElement('div');
            dotsContainer.className = 'slider-dots';

            for (let i = 0; i < totalSlides; i++) {
                const dot = document.createElement('button');
                dot.className = `slider-dot ${i === 0 ? 'active' : ''}`;
                dot.setAttribute('data-slide', i);
                dot.setAttribute('aria-label', `Przejdź do pompy ${i + 1}`);
                dotsContainer.appendChild(dot);
            }

            // Przycisk następny
            const nextBtn = document.createElement('button');
            nextBtn.className = 'slider-btn slider-next';
            nextBtn.innerHTML = '›';
            nextBtn.setAttribute('aria-label', 'Następna pompa');

            navigation.appendChild(prevBtn);
            navigation.appendChild(dotsContainer);
            navigation.appendChild(nextBtn);

            container.appendChild(navigation);
        }

        // Funkcja inicjalizacji slidera
        function initializeSlider(container, totalSlides) {
            if (totalSlides <= 1) return;

            const track = container.querySelector('.slider-track');
            const prevBtn = container.querySelector('.slider-prev');
            const nextBtn = container.querySelector('.slider-next');
            const dots = container.querySelectorAll('.slider-dot');

            let currentSlide = 0;

            // Funkcja aktualizacji slidera
            function updateSlider(slideIndex) {
                currentSlide = slideIndex;

                // Animacja przesunięcia
                track.style.transform = `translateX(-${currentSlide * 100}%)`;

                // Aktualizacja dots
                dots.forEach((dot, index) => {
                    dot.classList.toggle('active', index === currentSlide);
                });

                // Aktualizacja przycisków
                prevBtn.disabled = currentSlide === 0;
                nextBtn.disabled = currentSlide === totalSlides - 1;

                // Aktualizacja aria-labels
                prevBtn.style.opacity = currentSlide === 0 ? '0.5' : '1';
                nextBtn.style.opacity = currentSlide === totalSlides - 1 ? '0.5' : '1';
            }

            // Event listenery dla przycisków
            prevBtn.addEventListener('click', () => {
                if (currentSlide > 0) {
                    updateSlider(currentSlide - 1);
                }
            });

            nextBtn.addEventListener('click', () => {
                if (currentSlide < totalSlides - 1) {
                    updateSlider(currentSlide + 1);
                }
            });

            // Event listenery dla dots
            dots.forEach((dot, index) => {
                dot.addEventListener('click', () => {
                    updateSlider(index);
                });
            });

            // Obsługa klawiatury
            container.addEventListener('keydown', (e) => {
                if (e.key === 'ArrowLeft' && currentSlide > 0) {
                    updateSlider(currentSlide - 1);
                } else if (e.key === 'ArrowRight' && currentSlide < totalSlides - 1) {
                    updateSlider(currentSlide + 1);
                }
            });

            // Inicjalna aktualizacja
            updateSlider(0);

            // Auto-play (opcjonalnie)
            if (totalSlides > 1) {
                let autoplayInterval = setInterval(() => {
                    const nextSlide = (currentSlide + 1) % totalSlides;
                    updateSlider(nextSlide);
                }, 5000); // 5 sekund

                // Zatrzymaj autoplay przy hover
                container.addEventListener('mouseenter', () => {
                    clearInterval(autoplayInterval);
                });

                container.addEventListener('mouseleave', () => {
                    autoplayInterval = setInterval(() => {
                        const nextSlide = (currentSlide + 1) % totalSlides;
                        updateSlider(nextSlide);
                    }, 5000);
                });
            }
        }

        // TYLKO SLIDERY - bez dodatkowych kart lub elementów
        zone.innerHTML = `
            <div class="pump-slider-wrapper">
              <div class="slider-header">
                <h3>💎 Rekomendowane pompy ciepła PANASONIC</h3>
                <p>Zapotrzebowanie całkowite: <strong>${(parseFloat(result.max_heating_power) + parseFloat(result.hot_water_power || 0)).toFixed(1)} kW</strong></p>
              </div>
              <div class="pump-cards-slider">
                
              </div>
            </div>
        `;

        const totalPowerDemand = (parseFloat(result.max_heating_power) + parseFloat(result.hot_water_power || 0)).toFixed(1);
        renderPumpCards(pumps, 'pump-recommendation-zone', `💎 Rekomendowane pompy ciepła PANASONIC (zapotrzebowanie: ${totalPowerDemand} kW)`);

        const cards = zone.querySelectorAll('.pump-recommendation-card');
        cards.forEach((card, index) => {
            card.style.animationDelay = `${index * 0.15}s`;
        });
    }

    function DobierzPompe(result) {
    const totalPower = parseFloat(result.max_heating_power || 0) + parseFloat(result.hot_water_power || 0);
    const allPumps = [
        { model: "KIT-SDC03K3E5", power: 3, series: "SDC", type: "split", image: "/pictures/split-k.png" },
        { model: "KIT-SDC05K3E5", power: 5, series: "SDC", type: "split", image: "/pictures/split-k.png" },
        { model: "KIT-SDC07K3E5", power: 7, series: "SDC", type: "split", image: "/pictures/split-k.png" },
        { model: "KIT-SDC09K3E5", power: 9, series: "SDC", type: "split", image: "/pictures/split-k.png" },
        { model: "KIT-SDC12K6E8", power: 12, series: "SDC", type: "split", image: "/pictures/split-k.png" },
        { model: "KIT-ADC03K3E5", power: 3, series: "ADC", type: "all-in-one", image: "/pictures/allinone.png" },
        { model: "KIT-ADC05K3E5", power: 5, series: "ADC", type: "all-in-one", image: "/pictures/allinone.png" },
        { model: "KIT-ADC07K3E5", power: 7, series: "ADC", type: "all-in-one", image: "/pictures/allinone.png" },
        { model: "KIT-ADC09K3E5", power: 9, series: "ADC", type: "all-in-one", image: "/pictures/allinone.png" },
        { model: "KIT-ADC12K6E8", power: 12, series: "ADC", type: "all-in-one", image: "/pictures/allinone.png" }
    ];

    const matching = allPumps.filter(p => p.power >= totalPower * 0.9 && p.power <= totalPower * 1.3);
    const grouped = {};

    matching.forEach(pump => {
        if (!grouped[pump.power]) grouped[pump.power] = {};
        grouped[pump.power][pump.series.toLowerCase()] = pump;
    });

    return Object.entries(grouped).map(([power, pair]) => ({
        power: Number(power),
        sdc: pair.sdc || null,
        adc: pair.adc || null
    })).sort((a, b) => a.power - b.power);
}

function renderHaierStyleSliders(pumpGroups, container) {
        if (!container || !Array.isArray(pumpGroups)) return;
        container.innerHTML = ''; // Reset

        pumpGroups.forEach((group, index) => {
            const wrapper = document.createElement('div');
            wrapper.className = 'haier-slider-wrapper animate-fade-in';
            const title = index === 0 ? '💎 Rekomendowana moc' : '🧩 Alternatywna moc';

            wrapper.innerHTML = `
                <div class="slider-header">
                    <h3>${title}: ${group.power} kW</h3>
                </div>
                <div class="haier-slider">
                    ${group.sdc ? createMinimalCard(group.sdc) : ''}
                    ${group.adc ? createMinimalCard(group.adc) : ''}
                </div>
            `;
            container.appendChild(wrapper);
        });

        function createMinimalCard(pump) {
            const label = pump.type === 'split' ? 'Split' : 'All-in-One';
            const imgPath = pump.type === 'split' ? '/pictures/sdc-k.png' : '/pictures/adc-k.png';
            return `
            <a href="#" class="heat-pump-card haier-style" data-pump="${pump.model}">
                <img src="${imgPath}" alt="Pompa ${label}" class="clean-pump-image" />
            </a>`;
        }
    }


    // Funkcje obsługi przycisków
    let customerDataCollected = false;

    function showPDFContactForm() {
        const pdfFormContainer = document.getElementById('pdf-contact-form');
        if (pdfFormContainer) {
            pdfFormContainer.style.display = 'block';
            pdfFormContainer.scrollIntoView({ behavior: 'smooth' });
        }
    }

    function hidePDFContactForm() {
        const pdfFormContainer = document.getElementById('pdf-contact-form');
        if (pdfFormContainer) {
            pdfFormContainer.style.display = 'none';
        }
    }

    function collectCustomerData() {
        const email = document.getElementById('customer-email').value.trim();
        const postalCode = document.getElementById('customer-postal-code').value.trim();

        if (!email || !postalCode) {
            alert('Wypełnij wszystkie wymagane pola');
            return false;
        }

        // Walidacja email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            alert('Podaj prawidłowy adres email');
            return false;
        }

        // Walidacja kodu pocztowego (format XX-XXX)
        const postalRegex = /^\d{2}-\d{3}$/;
        if (!postalRegex.test(postalCode)) {
            alert('Podaj prawidłowy kod pocztowy (format: XX-XXX)');
            return false;
        }

        // Zapisz dane klienta
        const customerData = {
            email: email,
            postalCode: postalCode,
            timestamp: new Date().toISOString(),
            calculationData: window.lastCalcResult || {}
        };

        // Zapisz w localStorage (można zastąpić wywołaniem API)
        let customers = JSON.parse(localStorage.getItem('customerDatabase') || '[]');
        customers.push(customerData);
        localStorage.setItem('customerDatabase', JSON.stringify(customers));

        customerDataCollected = true;
        console.log('Dane klienta zapisane:', customerData);

        // Wyślij email z raportem
        sendPDFReportEmail(customerData);

        return true;
    }

    function sendPDFReportEmail(customerData) {
        // Implementacja wysyłania emaila z raportem PDF
        const reportData = {
            email: customerData.email,
            postalCode: customerData.postalCode,
            calculationResults: customerData.calculationData,
            reportType: 'full_energy_report'
        };

        // Tutaj można dodać wywołanie do API wysyłającego email
        console.log('Wysyłanie raportu PDF na email:', reportData);

        // Pokaż komunikat sukcesu
        showSuccessMessage(customerData.email);
    }

    function showSuccessMessage(email) {
        const successDiv = document.createElement('div');
        successDiv.className = 'pdf-success-message';
        successDiv.innerHTML = `
            <div class="success-content">
                <i class="fas fa-check-circle"></i>
                <h4>Raport został wysłany!</h4>
                <p>Pełny raport energetyczny został wysłany na adres:<br><strong>${email}</strong></p>
                <p>Sprawdź swoją skrzynkę odbiorczą (również folder spam).</p>
            </div>
        `;

        const actionsContainer = document.querySelector('.results-actions');
        if (actionsContainer) {
            actionsContainer.appendChild(successDiv);
            successDiv.scrollIntoView({ behavior: 'smooth' });

            // Ukryj formularz kontaktowy
            hidePDFContactForm();

            // Usuń komunikat po 10 sekundach
            setTimeout(() => {
                if (successDiv.parentNode) {
                    successDiv.remove();
                }
            }, 10000);
        }
    }

    function handleEmailSend() {
        // Stara funkcja - pozostawiona dla kompatybilności
        console.log('Funkcja handleEmailSend została zastąpiona');
    }

    function goBackToForm() {
        if (typeof showTab === 'function') {
            showTab(5);
        } else {
            // Fallback - przewiń do góry strony
            const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;
            const targetScrollTop = Math.max(0, currentScrollTop / 2);

            window.scrollTo({
                top: targetScrollTop,
                behavior: 'smooth'
            });
        }
    }

    function startNewCalculation() {
        if (typeof showTab === 'function') {
            showTab(0);
        } else {
            // Fallback - przeładuj stronę
            window.location.reload();
        }
    }


    window.displayResults = displayResults;
    window.displayRecommendedPumps = displayRecommendedPumps;
    window.DobierzPompe = DobierzPompe;
    window.resetResultsSection = resetResultsSection;
    window.lastCalcResult = window.lastCalcResult || {};
    window.handleEmailSend = handleEmailSend;
    window.goBackToForm = goBackToForm;
    window.startNewCalculation = startNewCalculation;
    window.showPDFContactForm = showPDFContactForm;
    window.collectCustomerData = collectCustomerData;
    window.downloadPDF = function() { showPDFContactForm(); };

    console.log('✅ Results Renderer Module v4.2 - ZORDON 3.0 loaded successfully');

})();