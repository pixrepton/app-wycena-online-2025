"""
AI PDF Analyzer for Heat Pump Calculator
Analyzes construction project PDFs using Groq AI
"""

import os
import PyPDF2
from groq import Groq
import json
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class PDFAIAnalyzer:
    def __init__(self):
        """Initialize the AI PDF analyzer with Groq client"""
        try:
            api_key = os.environ.get('GROQ_API_KEY')
            if not api_key:
                raise ValueError("GROQ_API_KEY not found in environment variables")
            
            self.client = Groq(api_key=api_key)
            self.model = "llama-3.1-70b-versatile"  # Fast and accurate model
            logger.info("PDF AI Analyzer initialized successfully")
            
        except Exception as e:
            logger.error(f"Failed to initialize PDF AI Analyzer: {e}")
            raise

    def extract_text_from_pdf(self, pdf_file):
        """Extract text content from uploaded PDF file"""
        try:
            text_content = ""
            pdf_reader = PyPDF2.PdfReader(pdf_file)
            
            for page_num, page in enumerate(pdf_reader.pages):
                try:
                    page_text = page.extract_text()
                    text_content += f"\n--- Strona {page_num + 1} ---\n{page_text}\n"
                except Exception as e:
                    logger.warning(f"Failed to extract text from page {page_num + 1}: {e}")
                    continue
            
            if not text_content.strip():
                raise ValueError("Nie udało się wyciągnąć tekstu z pliku PDF")
            
            logger.info(f"Extracted {len(text_content)} characters from PDF")
            return text_content
            
        except Exception as e:
            logger.error(f"PDF text extraction failed: {e}")
            raise

    def analyze_construction_project(self, pdf_text):
        """Analyze construction project PDF and extract heat pump sizing data"""
        
        prompt = f"""
Jesteś ekspertem od analizy projektów budowlanych i doboru pomp ciepła. Przeanalizuj poniższy tekst z projektu budowlanego i wyciągnij kluczowe dane potrzebne do profesjonalnego doboru pompy ciepła.

TEKST PROJEKTU:
{pdf_text}

ZADANIE:
Znajdź i wyciągnij następujące dane (jeśli są dostępne):

1. POWIERZCHNIA UŻYTKOWA (m²) - powierzchnia podłóg kondygnacji nadziemnych
2. WSKAŹNIK ENERGII UŻYTKOWEJ EU (kWh/m²·rok) - z charakterystyki energetycznej
3. LOKALIZACJA/MIEJSCOWOŚĆ - dla określenia strefy klimatycznej
4. ZAPOTRZEBOWANIE NA CIEPŁO (kWh/rok) - roczne zapotrzebowanie
5. MOC GRZEWCZA (kW) - jeśli podana bezpośrednio
6. TEMPERATURA PROJEKTOWA (°C) - dla danej lokalizacji
7. RODZAJ BUDYNKU - dom jednorodzinny, mieszkanie, itp.
8. STANDARD ENERGETYCZNY - energooszczędny, pasywny, itp.

ODPOWIEDŹ w FORMACIE JSON:
{{
    "found_data": {{
        "powierzchnia_uzytkowa": null lub wartość w m²,
        "wskaznik_eu": null lub wartość w kWh/m²·rok,
        "lokalizacja": null lub nazwa miejscowości,
        "zapotrzebowanie_cieplo": null lub wartość w kWh/rok,
        "moc_grzewcza": null lub wartość w kW,
        "temperatura_projektowa": null lub wartość w °C,
        "rodzaj_budynku": null lub opis,
        "standard_energetyczny": null lub opis
    }},
    "analysis_summary": "Krótkie podsumowanie analizy projektu",
    "data_quality": "good" | "partial" | "insufficient",
    "recommended_calculation_method": "zordon_formula" | "direct_power" | "manual_input",
    "confidence_level": 0.0-1.0,
    "notes": "Dodatkowe uwagi i zalecenia"
}}

WAŻNE ZASADY:
- Zwróć TYLKO poprawny JSON, bez dodatkowych tekstów
- Jeśli dane nie są dostępne, użyj null
- Podaj wartości liczbowe bez jednostek w JSON
- Bądź precyzyjny i ostrożny w interpretacji
- Uwzględnij kontekst polskiego budownictwa
"""

        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": "Jesteś ekspertem od analizy projektów budowlanych i doboru instalacji grzewczych. Zawsze odpowiadasz w poprawnym formacie JSON."
                    },
                    {
                        "role": "user", 
                        "content": prompt
                    }
                ],
                temperature=0.1,  # Low temperature for precise analysis
                max_tokens=2000
            )
            
            ai_response = response.choices[0].message.content
            if ai_response:
                ai_response = ai_response.strip()
            logger.info(f"AI analysis completed, response length: {len(ai_response) if ai_response else 0}")
            
            # Parse JSON response
            try:
                if not ai_response:
                    raise ValueError("Empty AI response")
                analysis_result = json.loads(ai_response)
                return analysis_result
            except json.JSONDecodeError as e:
                logger.error(f"Failed to parse AI JSON response: {e}")
                logger.debug(f"Raw AI response: {ai_response}")
                
                # Fallback: basic analysis
                return {
                    "found_data": {
                        "powierzchnia_uzytkowa": None,
                        "wskaznik_eu": None,
                        "lokalizacja": None,
                        "zapotrzebowanie_cieplo": None,
                        "moc_grzewcza": None,
                        "temperatura_projektowa": None,
                        "rodzaj_budynku": None,
                        "standard_energetyczny": None
                    },
                    "analysis_summary": "Nie udało się sparsować odpowiedzi AI",
                    "data_quality": "insufficient",
                    "recommended_calculation_method": "manual_input",
                    "confidence_level": 0.1,
                    "notes": f"Błąd parsowania JSON: {str(e)}"
                }
                
        except Exception as e:
            logger.error(f"AI analysis failed: {e}")
            raise

    def calculate_heat_pump_power(self, analysis_result):
        """Calculate heat pump power based on extracted data"""
        
        found_data = analysis_result.get("found_data", {})
        powierzchnia = found_data.get("powierzchnia_uzytkowa")
        wskaznik_eu = found_data.get("wskaznik_eu")
        moc_bezposrednia = found_data.get("moc_grzewcza")
        zapotrzebowanie = found_data.get("zapotrzebowanie_cieplo")
        
        calculation_results = {
            "method_used": None,
            "calculated_power": None,
            "heating_power": None,
            "dhw_power": 0.8,  # Standard 0.8 kW for DHW
            "total_power": None,
            "recommended_panasonic_model": None,
            "calculation_formula": None,
            "calculation_details": None
        }
        
        # Method 1: Direct power from project
        if moc_bezposrednia and moc_bezposrednia > 0:
            calculation_results.update({
                "method_used": "direct_from_project",
                "calculated_power": moc_bezposrednia,
                "heating_power": moc_bezposrednia,
                "total_power": moc_bezposrednia + calculation_results["dhw_power"],
                "calculation_formula": "Moc bezpośrednio z projektu",
                "calculation_details": f"Moc grzewcza z projektu: {moc_bezposrednia} kW"
            })
            
        # Method 2: Zordon formula (Area × EU) / 1800 × 2
        elif powierzchnia and wskaznik_eu and powierzchnia > 0 and wskaznik_eu > 0:
            annual_demand = powierzchnia * wskaznik_eu
            max_power = (annual_demand / 1800) * 2
            
            calculation_results.update({
                "method_used": "zordon_formula",
                "calculated_power": round(max_power, 1),
                "heating_power": round(max_power, 1),
                "total_power": round(max_power + calculation_results["dhw_power"], 1),
                "calculation_formula": "(Powierzchnia × EU) / 1800 × 2",
                "calculation_details": f"({powierzchnia} × {wskaznik_eu}) / 1800 × 2 = {max_power:.1f} kW"
            })
            
        # Method 3: Based on annual demand
        elif zapotrzebowanie and zapotrzebowanie > 0:
            heating_hours = 2000  # Approximate heating hours per year
            safety_factor = 1.5
            base_power = zapotrzebowanie / heating_hours
            max_power = base_power * safety_factor
            
            calculation_results.update({
                "method_used": "annual_demand",
                "calculated_power": round(max_power, 1),
                "heating_power": round(max_power, 1),
                "total_power": round(max_power + calculation_results["dhw_power"], 1),
                "calculation_formula": "Zapotrzebowanie / 2000h × 1.5",
                "calculation_details": f"{zapotrzebowanie} / 2000 × 1.5 = {max_power:.1f} kW"
            })
            
        # Method 4: Estimate based on area only
        elif powierzchnia and powierzchnia > 0:
            # Conservative estimate: 80-120 W/m² for modern buildings
            specific_power = 100  # W/m²
            estimated_power = (powierzchnia * specific_power) / 1000  # Convert to kW
            
            calculation_results.update({
                "method_used": "area_estimate",
                "calculated_power": round(estimated_power, 1),
                "heating_power": round(estimated_power, 1),
                "total_power": round(estimated_power + calculation_results["dhw_power"], 1),
                "calculation_formula": "Powierzchnia × 100 W/m²",
                "calculation_details": f"{powierzchnia} × 100 W/m² = {estimated_power:.1f} kW"
            })
        
        # Add Panasonic model recommendation
        if calculation_results["total_power"]:
            calculation_results["recommended_panasonic_model"] = self._recommend_panasonic_model(
                calculation_results["total_power"]
            )
        
        return calculation_results

    def _recommend_panasonic_model(self, total_power):
        """Recommend appropriate Panasonic heat pump model"""
        
        # Panasonic model ranges
        panasonic_models = [
            {"power": 5, "model": "Panasonic 5kW", "series": "Aquarea All in One"},
            {"power": 7, "model": "Panasonic 7kW", "series": "Aquarea All in One"},
            {"power": 9, "model": "Panasonic 9kW", "series": "Aquarea All in One"},
            {"power": 12, "model": "Panasonic 12kW", "series": "Aquarea All in One"},
            {"power": 16, "model": "Panasonic 16kW", "series": "Aquarea All in One"},
            {"power": 20, "model": "Panasonic 20kW", "series": "Aquarea High Performance"}
        ]
        
        # Find closest model (slightly higher power)
        for model in panasonic_models:
            if model["power"] >= total_power:
                return f"{model['model']} ({model['series']})"
        
        # If power requirement is very high
        return "Panasonic 20kW+ (konsultacja z ekspertem)"

    def process_pdf_file(self, pdf_file):
        """Complete PDF processing pipeline"""
        try:
            logger.info("Starting PDF processing pipeline")
            
            # Step 1: Extract text from PDF
            pdf_text = self.extract_text_from_pdf(pdf_file)
            
            # Step 2: AI analysis
            analysis_result = self.analyze_construction_project(pdf_text)
            
            # Step 3: Calculate heat pump power
            calculation_results = self.calculate_heat_pump_power(analysis_result)
            
            # Step 4: Combine results
            final_result = {
                "pdf_analysis": analysis_result,
                "power_calculation": calculation_results,
                "processing_status": "success",
                "timestamp": __import__('datetime').datetime.now().isoformat()
            }
            
            logger.info("PDF processing completed successfully")
            return final_result
            
        except Exception as e:
            logger.error(f"PDF processing failed: {e}")
            return {
                "pdf_analysis": None,
                "power_calculation": None,
                "processing_status": "error",
                "error_message": str(e),
                "timestamp": __import__('datetime').datetime.now().isoformat()
            }

# Initialize global analyzer instance
pdf_analyzer = PDFAIAnalyzer()