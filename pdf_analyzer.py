"""
Refactored PDF AI Analyzer Service
Improved error handling, configuration, and maintainability
"""
import os
import json
import logging
from pathlib import Path
from typing import Dict, Any, Optional, Union
from io import BytesIO

try:
    import PyPDF2
    from PyPDF2 import PdfReader
except ImportError:
    PyPDF2 = None
    PdfReader = None

try:
    from groq import Groq
    from groq.types.chat import ChatCompletion
except ImportError:
    Groq = None
    ChatCompletion = None

logger = logging.getLogger(__name__)

class PDFAnalyzerError(Exception):
    """Custom exception for PDF analyzer errors"""
    pass

class PDFAIAnalyzer:
    """Enhanced PDF AI Analyzer with better error handling and configuration"""

    def __init__(self, api_key: Optional[str] = None, model: str = "llama-3.3-70b-versatile"):
        """Initialize the AI PDF analyzer"""
        self.api_key = api_key or os.environ.get('GROQ_API_KEY')
        self.model = model
        self.client = None
        self._initialized = False

        # Try to initialize immediately if we have an API key
        if self.api_key:
            try:
                self._validate_dependencies()
                if Groq is not None:
                    self.client = Groq(api_key=self.api_key)
                    self._initialized = True
                    logger.info("PDF AI Analyzer initialized successfully in constructor")
            except Exception as e:
                logger.error(f"Failed to initialize in constructor: {e}")
                self._initialized = False

    def init_app(self, app):
        """Initialize with Flask app context"""
        try:
            self._validate_dependencies()

            if not self.api_key:
                raise PDFAnalyzerError("GROQ_API_KEY not found in environment variables")

            if Groq is None:
                raise PDFAnalyzerError("Groq module not available")
            self.client = Groq(api_key=self.api_key)
            self._initialized = True
            logger.info("PDF AI Analyzer initialized successfully")

        except Exception as e:
            logger.error(f"Failed to initialize PDF AI Analyzer: {e}")
            # Don't raise - allow app to continue without PDF analysis
            self._initialized = False

    def _validate_dependencies(self):
        """Validate required dependencies"""
        if PyPDF2 is None or PdfReader is None:
            raise PDFAnalyzerError("PyPDF2 not installed. Install with: pip install PyPDF2")

        if Groq is None:
            raise PDFAnalyzerError("Groq not installed. Install with: pip install groq")

    def is_available(self) -> bool:
        """Check if the service is available"""
        return self._initialized and self.client is not None

    def extract_text_from_pdf(self, pdf_file: Union[BytesIO, Any]) -> str:
        """Extract text content from uploaded PDF file"""
        if not self.is_available():
            raise PDFAnalyzerError("PDF Analyzer service not available")

        try:
            # Reset file pointer if needed
            if hasattr(pdf_file, 'seek'):
                pdf_file.seek(0)

            text_content = ""
            if PdfReader is None:
                raise PDFAnalyzerError("PdfReader not available")
            pdf_reader = PdfReader(pdf_file)

            if len(pdf_reader.pages) == 0:
                raise PDFAnalyzerError("PDF nie zawiera żadnych stron")

            for page_num, page in enumerate(pdf_reader.pages):
                try:
                    page_text = page.extract_text()
                    if page_text.strip():
                        text_content += f"\n--- Strona {page_num + 1} ---\n{page_text}\n"
                except Exception as e:
                    logger.warning(f"Failed to extract text from page {page_num + 1}: {e}")
                    continue

            if not text_content.strip():
                raise PDFAnalyzerError("Nie udało się wyciągnąć tekstu z pliku PDF")

            logger.info(f"Extracted {len(text_content)} characters from {len(pdf_reader.pages)} pages")
            return text_content

        except Exception as e:
            logger.error(f"PDF text extraction failed: {e}")
            raise PDFAnalyzerError(f"Błąd ekstrakcji tekstu: {str(e)}")

    def analyze_construction_project(self, pdf_text: str) -> Dict[str, Any]:
        """Analyze construction project PDF and extract heat pump sizing data"""

        if not self.is_available():
            if not self.api_key:
                raise PDFAnalyzerError("Brak klucza API dla Groq. Skontaktuj się z administratorem.")
            else:
                raise PDFAnalyzerError("Serwis analizy AI nie jest dostępny")

        # Truncate text if too long (API limits)
        max_text_length = 12000  # Conservative limit
        if len(pdf_text) > max_text_length:
            pdf_text = pdf_text[:max_text_length] + "\\n[TEKST SKRÓCONY]"
            logger.info(f"PDF text truncated to {max_text_length} characters")

        prompt = self._build_analysis_prompt(pdf_text)

        try:
            if not self.client:
                raise PDFAnalyzerError("Groq client not initialized")

            logger.info(f"Sending request to Groq AI with model: {self.model}")
            logger.debug(f"Prompt length: {len(prompt)} characters")

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

            logger.info("Groq AI request completed successfully")

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

                # Return fallback response
                return self._create_fallback_analysis("Błąd parsowania odpowiedzi AI")

        except Exception as e:
            logger.error(f"AI analysis request failed: {e}")
            return self._create_fallback_analysis(f"Błąd analizy AI: {str(e)}")

    def _build_analysis_prompt(self, pdf_text: str) -> str:
        """Build the analysis prompt for AI"""
        return f"""
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

    def _create_fallback_analysis(self, error_message: str) -> Dict[str, Any]:
        """Create fallback analysis when AI fails"""
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
            "analysis_summary": f"Analiza nie powiodła się: {error_message}",
            "data_quality": "insufficient",
            "recommended_calculation_method": "manual_input",
            "confidence_level": 0.0,
            "notes": "Proszę wprowadzić dane ręcznie ze względu na błąd analizy automatycznej."
        }

    def calculate_heating_requirements(self, analysis_data: Dict[str, Any]) -> Dict[str, Any]:
        """Calculate heating requirements based on analysis data"""
        found_data = analysis_data.get("found_data", {})

        # Method 1: Direct power if available
        if found_data.get("moc_grzewcza"):
            power = found_data["moc_grzewcza"]
            return {
                "calculated_power": power,
                "method": "direct_power",
                "formula": "Moc bezpośrednio z projektu",
                "confidence": "high"
            }

        # Method 2: Zordon formula (EU × Area / 1800 × 2)
        if found_data.get("wskaznik_eu") and found_data.get("powierzchnia_uzytkowa"):
            eu = found_data["wskaznik_eu"]
            area = found_data["powierzchnia_uzytkowa"]
            annual_demand = area * eu
            max_power = (annual_demand / 1800) * 2

            return {
                "calculated_power": round(max_power, 1),
                "annual_demand": annual_demand,
                "method": "zordon_formula",
                "formula": f"({area} × {eu}) / 1800 × 2 = {max_power:.1f} kW",
                "confidence": "medium"
            }

        # Method 3: Area-based estimation (if only area available)
        if found_data.get("powierzchnia_uzytkowa"):
            area = found_data["powierzchnia_uzytkowa"]
            # Rough estimation: 50-80W/m² for modern houses
            estimated_power = area * 0.065  # 65W/m²

            return {
                "calculated_power": round(estimated_power, 1),
                "method": "area_estimation",
                "formula": f"{area} × 65W/m² = {estimated_power:.1f} kW",
                "confidence": "low"
            }

        return {
            "calculated_power": None,
            "method": "insufficient_data",
            "formula": "Brak wystarczających danych",
            "confidence": "none"
        }

    def process_pdf_file(self, pdf_file) -> Dict[str, Any]:
        """Main method to process PDF file with comprehensive error handling"""
        try:
            logger.info("🔍 Starting PDF processing...")

            # Validate input file
            if pdf_file is None:
                logger.error("❌ No PDF file provided")
                return {
                    "processing_status": "error", 
                    "error_message": "Nie podano pliku PDF",
                    "error_type": "no_file"
                }

            # Check if service is available
            if not self.is_available():
                logger.error("❌ PDF analyzer service not available")
                return {
                    "processing_status": "error",
                    "error_message": "Serwis analiz PDF nie jest dostępny",
                    "error_type": "service_unavailable"
                }

            # Extract text
            logger.info("📄 Extracting text from PDF...")
            pdf_text = self.extract_text_from_pdf(pdf_file)
            logger.info(f"✅ Extracted {len(pdf_text)} characters from PDF")

            if not pdf_text or len(pdf_text.strip()) < 10:
                logger.error("❌ Insufficient text extracted from PDF")
                return {
                    "processing_status": "error",
                    "error_message": "Plik PDF nie zawiera wystarczająco tekstu do analizy",
                    "error_type": "insufficient_text"
                }

            # Analyze with AI
            logger.info("🤖 Starting AI analysis...")
            analysis_result = self.analyze_construction_project(pdf_text)
            logger.info(f"✅ AI analysis completed with {analysis_result.get('data_quality', 'unknown')} quality")

            # Calculate heating requirements
            logger.info("🔢 Calculating heating requirements...")
            heating_calc = self.calculate_heating_requirements(analysis_result)
            logger.info(f"✅ Heating calculations completed using {heating_calc.get('method', 'unknown')} method")

            # Combine results
            result = {
                "processing_status": "success",
                "text_length": len(pdf_text),
                "analysis": analysis_result,
                "heating_calculation": heating_calc,
                "timestamp": None  # Will be set by API
            }

            logger.info("🎉 PDF processing completed successfully")
            return result

        except PDFAnalyzerError as e:
            logger.error(f"❌ PDF Analysis Error: {e}")
            return {
                "processing_status": "error",
                "error_message": str(e),
                "error_type": "pdf_analysis_error"
            }
        except Exception as e:
            logger.error(f"❌ Unexpected error in PDF processing: {e}", exc_info=True)
            return {
                "processing_status": "error", 
                "error_message": f"Nieoczekiwany błąd: {str(e)}",
                "error_type": "unexpected_error"
            }

# Create global instance
pdf_analyzer = PDFAIAnalyzer()