/**
 * pdfGenerator.js – TOP-INSTAL Premium PDF Generator
 * Łączy layout oferty + wizualizację rekomendowanych pomp
 * Wymaga: html2pdf.js
 */

(function () {
  'use strict';

  async function generateOfferPDF(configData, pumpData) {
  try {
    console.log('🔥 Generuję PDF oferty...', configData, pumpData);

    // Try to get content from backend first
    let htmlContent;
    try {
      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          buildingData: configData,
          pumpData: pumpData,
          pricing: window.ZORDON_STATE || {}
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        htmlContent = result.htmlContent;
        console.log('✅ PDF template from backend');
      } else {
        throw new Error('Backend unavailable');
      }
    } catch (backendError) {
      console.warn('⚠️ Backend unavailable, using fallback template');
      htmlContent = createPDFContent(configData);
    }

    const tempContainer = document.createElement('div');
    tempContainer.innerHTML = htmlContent;
    tempContainer.style.position = 'absolute';
    tempContainer.style.left = '-9999px';
    tempContainer.style.top = '0';
    document.body.appendChild(tempContainer);

    // ⏱️ Poczekaj na render
    await new Promise(resolve => setTimeout(resolve, 300));

    const options = {
      margin: [15, 15, 15, 15],
      filename: `Oferta_Top-Instal_${new Date().toISOString().split('T')[0]}.pdf`,
      image: { type: 'jpeg', quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    console.log('📄 HTML to convert:', tempContainer.innerHTML);

    // ✅ Najpierw PDF, potem usuwanie
    await html2pdf().set(options).from(tempContainer).save();

    // ⬇️ Teraz bezpiecznie usuwamy
    if (document.body.contains(tempContainer)) {
      document.body.removeChild(tempContainer);
    }

    console.log('✅ PDF zapisany');
  } catch (err) {
    console.error('❌ Błąd podczas generowania PDF:', err);
    alert('Nie udało się wygenerować oferty PDF. Sprawdź dane lub spróbuj ponownie.');
  }
}

  function createPDFContent(data) {
    const date = new Date().toLocaleDateString('pl-PL');
    return `
      <div style="font-family:Segoe UI, sans-serif; font-size:14px; color:#333;">
        <div style="text-align:center; margin-bottom:20px;">
          <img src="/pictures/8.png" alt="Logo Top-Instal" style="max-width:180px; margin-bottom:10px;" />
          <h1 style="color:#C20118;">Oferta – Pompa Ciepła Panasonic</h1>
          <p style="font-size:12px;">Data wygenerowania: ${date}</p>
        </div>
        <h3 style="border-left:4px solid #C20118; padding-left:8px;">Dane budynku</h3>
        <ul>
          <li>Powierzchnia ogrzewana: <strong>${data.heated_area || '---'} m²</strong></li>
          <li>Moc grzewcza: <strong>${data.max_heating_power || '---'} kW</strong></li>
          <li>+ CWU: <strong>${data.hot_water_power || 0} kW</strong></li>
          <li>Typ instalacji: <strong>${data.heating_type || '---'}</strong></li>
        </ul>
      </div>`;
  }

  function downloadPDF() {
    try {
      const configData = JSON.parse(localStorage.getItem('config_data') || '{}');
      const resultData = {
        max_heating_power: parseFloat(getElementValue('r-max-power')) || 0,
        hot_water_power: parseFloat(getElementValue('r-cwu')) || 0,
        heated_area: getElementValue('r-heated-area') || '---',
        heating_type: configData.heating_type || '---'
      };

      const totalPower = resultData.max_heating_power +
        (configData.include_hot_water ? resultData.hot_water_power : 0);

      const pumpData = [
        {
          power: 7,
          sdc: { name: "KIT-SDC07K3E5", image: "/pictures/split-k.png" },
          adc: { name: "KIT-ADC07K3E5", image: "/pictures/aio-k.png" }
        },
        {
          power: 9,
          sdc: { name: "KIT-SDC09K3E5", image: "/pictures/split-k.png" },
          adc: { name: "KIT-ADC09K3E5", image: "/pictures/aio-k.png" }
        }
      ].filter(p => p.power >= totalPower * 0.9 && p.power <= totalPower * 1.3);

      generateOfferPDF(resultData, pumpData);
    } catch (err) {
      console.error('❌ Błąd w funkcji downloadPDF:', err);
      alert('Nie udało się przygotować danych do PDF.');
    }
  }

  function getElementValue(id) {
    const el = document.getElementById(id);
    return el ? el.textContent.trim() : '';
  }

  document.addEventListener('DOMContentLoaded', function () {
    const btn = document.getElementById('download-pdf-btn');
    if (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        console.log('🧪 Kliknięto przycisk PDF');
        if (typeof downloadPDF === 'function') {
          console.log('⏩ Wywołuję downloadPDF()');
          downloadPDF();
        } else {
          console.error('🚫 downloadPDF() nie istnieje');
        }
      });
    }
  });

  window.generateOfferPDF = generateOfferPDF;
  window.downloadPDF = downloadPDF;
})();
