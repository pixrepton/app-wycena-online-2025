"""
cieplo.app API Proxy
Zgodnie z dokumentacją README-WYCENA2025-v2.md
Serwis proxy dla zewnętrznego API cieplo.app
"""

import requests
import json
import logging
import time
from flask import Flask, request, jsonify
from typing import Dict, Any, Optional

# Konfiguracja loggingu
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class CieploApiProxy:
    """Proxy dla API cieplo.app z cachingiem i error handlingiem"""
    
    def __init__(self):
        self.base_url = "https://api.cieplo.app"
        self.timeout = 30
        self.cache = {}  # Prosty cache w pamięci
        self.cache_ttl = 300  # 5 minut
        
        logger.info("CieploApiProxy initialized")
    
    def calculate_heating_demand(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Oblicz zapotrzebowanie na ciepło
        
        Args:
            data: Dane budynku (powierzchnia, lokalizacja, itp.)
            
        Returns:
            Dict z wynikami obliczeń
        """
        cache_key = self._generate_cache_key(data)
        
        # Sprawdź cache
        cached_result = self._get_from_cache(cache_key)
        if cached_result:
            logger.info("Returning cached result for heating calculation")
            return cached_result
        
        try:
            # Przygotuj payload dla cieplo.app
            payload = self._prepare_heating_payload(data)
            
            # Wywołaj API
            response = requests.post(
                f"{self.base_url}/calculate",
                json=payload,
                timeout=self.timeout,
                headers={
                    'Content-Type': 'application/json',
                    'User-Agent': 'WYCENA-2025/1.0'
                }
            )
            
            response.raise_for_status()
            result = response.json()
            
            # Przetwórz wynik
            processed_result = self._process_heating_result(result)
            
            # Zapisz w cache
            self._save_to_cache(cache_key, processed_result)
            
            logger.info(f"Heating calculation completed: {processed_result.get('mocObliczona')} kW")
            return processed_result
            
        except requests.RequestException as e:
            logger.error(f"cieplo.app API error: {e}")
            return {
                'status': 'error',
                'error': f'Błąd komunikacji z API: {str(e)}',
                'mocObliczona': None
            }
        except Exception as e:
            logger.error(f"Unexpected error in heating calculation: {e}")
            return {
                'status': 'error', 
                'error': f'Nieoczekiwany błąd: {str(e)}',
                'mocObliczona': None
            }
    
    def _prepare_heating_payload(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Przygotuj dane dla API cieplo.app"""
        return {
            "surface_area": data.get('powierzchnia', 0),
            "location": data.get('kodPocztowy', '00-000'),
            "building_type": data.get('typBudynku', 'dom'),
            "insulation": data.get('ocieplenie', 'standard'),
            "heating_temp": data.get('tempOgrzewania', 55),
            "floors": data.get('kondygnacje', 1),
            "basement": data.get('piwnica', False),
            "roof_type": data.get('dach', 'flat'),
            "windows": data.get('okna', 'standard'),
            "ventilation": data.get('wentylacja', 'natural')
        }
    
    def _process_heating_result(self, result: Dict[str, Any]) -> Dict[str, Any]:
        """Przetwórz wynik z API cieplo.app do formatu ZORDON_STATE"""
        return {
            'status': 'success',
            'mocObliczona': result.get('power_demand', 0),
            'zapotrzebowanieRoczne': result.get('annual_demand', 0),
            'wspolczynnikEU': result.get('eu_factor', 0),
            'temperaturaNocna': result.get('night_temp', 16),
            'temperaturaDzien': result.get('day_temp', 20),
            'szczegoly': {
                'stracyCiepla': result.get('heat_losses', {}),
                'zyskiWewnetrzne': result.get('internal_gains', 0),
                'zyskiSloneczne': result.get('solar_gains', 0)
            }
        }
    
    def _generate_cache_key(self, data: Dict[str, Any]) -> str:
        """Generuj klucz cache na podstawie danych"""
        # Użyj kluczowych parametrów do cache key
        key_params = [
            str(data.get('powierzchnia', 0)),
            str(data.get('kodPocztowy', '')),
            str(data.get('typBudynku', '')),
            str(data.get('kondygnacje', 1))
        ]
        return "_".join(key_params)
    
    def _get_from_cache(self, key: str) -> Optional[Dict[str, Any]]:
        """Pobierz z cache jeśli aktualny"""
        if key in self.cache:
            cached_data, timestamp = self.cache[key]
            if (timestamp + self.cache_ttl) > time.time():
                return cached_data
            else:
                # Usuń przestarzały cache
                del self.cache[key]
        return None
    
    def _save_to_cache(self, key: str, data: Dict[str, Any]) -> None:
        """Zapisz do cache z timestampem"""
        import time
        self.cache[key] = (data, time.time())
        
        # Ogranicz rozmiar cache (maksymalnie 100 wpisów)
        if len(self.cache) > 100:
            # Usuń najstarsze wpisy
            sorted_cache = sorted(self.cache.items(), key=lambda x: x[1][1])
            for key_to_remove, _ in sorted_cache[:20]:  # Usuń 20 najstarszych
                del self.cache[key_to_remove]

# Flask endpoints dla integracji
def create_cieplo_api_routes(app: Flask):
    """Dodaj endpointy API do aplikacji Flask"""
    
    proxy = CieploApiProxy()
    
    @app.route('/api/cieplo/calculate', methods=['POST'])
    def calculate_heating():
        """Endpoint do obliczeń zapotrzebowania na ciepło"""
        try:
            data = request.get_json()
            
            if not data:
                return jsonify({
                    'status': 'error',
                    'error': 'Brak danych w request'
                }), 400
            
            result = proxy.calculate_heating_demand(data)
            return jsonify(result)
            
        except Exception as e:
            logger.error(f"Error in heating calculation endpoint: {e}")
            return jsonify({
                'status': 'error',
                'error': str(e)
            }), 500
    
    @app.route('/api/cieplo/health', methods=['GET'])
    def cieplo_health():
        """Health check dla cieplo.app proxy"""
        try:
            # Test prostego zapytania
            test_data = {
                'powierzchnia': 100,
                'kodPocztowy': '00-000',
                'typBudynku': 'dom'
            }
            
            result = proxy.calculate_heating_demand(test_data)
            
            if result.get('status') == 'success':
                return jsonify({
                    'status': 'healthy',
                    'service': 'cieplo.app proxy',
                    'cache_size': len(proxy.cache)
                })
            else:
                return jsonify({
                    'status': 'unhealthy',
                    'service': 'cieplo.app proxy', 
                    'error': result.get('error')
                }), 503
                
        except Exception as e:
            return jsonify({
                'status': 'unhealthy',
                'service': 'cieplo.app proxy',
                'error': str(e)
            }), 503

if __name__ == '__main__':
    # Test standalone
    app = Flask(__name__)
    create_cieplo_api_routes(app)
    app.run(debug=True, port=5001)