import httpx
import json
from typing import Dict, Any, Optional
from config import settings, logger

class WeatherService:
    @staticmethod
    async def get_current_weather(lat: float, lng: float) -> Dict[str, Any]:
        """
        Fetches current weather and daily forecast data from Open-Meteo API.
        """
        url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lng}&current_weather=true&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto"
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                response = await client.get(url)
                if response.status_code == 200:
                    data = response.json()
                    current = data.get("current_weather", {})
                    daily = data.get("daily", {})
                    
                    temp = current.get("temperature", 28.0)
                    wind = current.get("windspeed", 10.0)
                    weathercode = current.get("weathercode", 0)
                    
                    # Basic mapping of weather codes to human description
                    weather_desc = "Cerah"
                    if weathercode in [1, 2, 3]:
                        weather_desc = "Berawan"
                    elif weathercode in [45, 48]:
                        weather_desc = "Berkabut"
                    elif weathercode in [51, 53, 55, 61, 63, 65, 80, 81, 82]:
                        weather_desc = "Hujan"
                    elif weathercode in [71, 73, 75, 85, 86]:
                        weather_desc = "Salju"
                    elif weathercode in [95, 96, 99]:
                        weather_desc = "Badai Petir"
                        
                    precipitation = daily.get("precipitation_sum", [0.0])[0] if daily.get("precipitation_sum") else 0.0
                    temp_max = daily.get("temperature_2m_max", [temp])[0] if daily.get("temperature_2m_max") else temp
                    temp_min = daily.get("temperature_2m_min", [temp])[0] if daily.get("temperature_2m_min") else temp
                    
                    return {
                        "temperature": temp,
                        "temperature_max": temp_max,
                        "temperature_min": temp_min,
                        "windspeed": wind,
                        "precipitation_sum_mm": precipitation,
                        "description": weather_desc,
                        "summary_text": f"Cuaca saat ini {weather_desc} dengan suhu {temp}°C (Rentang: {temp_min}°C - {temp_max}°C). Akumulasi hujan diperkirakan {precipitation} mm."
                    }
        except Exception as e:
            logger.error(f"Error calling Open-Meteo: {e}")
            
        # Fallback basic weather info
        return {
            "temperature": 29.5,
            "temperature_max": 32.0,
            "temperature_min": 26.0,
            "windspeed": 8.5,
            "precipitation_sum_mm": 12.0,
            "description": "Hujan Ringan",
            "summary_text": "Cuaca saat ini Hujan Ringan dengan suhu 29.5°C (Rentang: 26°C - 32°C). Akumulasi hujan diperkirakan 12 mm."
        }

    @staticmethod
    async def analyze_weather_risks(crop_type: str, weather_summary: str) -> Dict[str, Any]:
        """
        Analyzes agricultural risks (pests, weather extremes, flooding, droughts)
        using Groq AI based on crop type and current weather summary.
        """
        api_key = settings.GROQ_API_KEY
        if not api_key:
            logger.warning("GROQ_API_KEY not set. Using offline weather risk mock generator.")
            return WeatherService._get_offline_weather_risk_mock(crop_type, weather_summary)
            
        system_prompt = (
            "Anda adalah AI Ahli Agrometeorologi dan Proteksi Tanaman Indonesia. "
            "Tugas Anda adalah menilai tingkat risiko cuaca ekstrim, hama, penyakit, kekeringan, "
            "atau banjir untuk tanaman tertentu berdasarkan kondisi cuaca hari ini. "
            "Anda WAJIB memberikan respon dalam format JSON yang valid, tanpa penjelasan markdown di luar blok JSON. "
            "Format JSON yang diharapkan harus mengikuti struktur berikut:\n"
            "{\n"
            "  \"risk_type\": \"cuaca_ekstrim | hama | kekeringan | banjir\", // jenis risiko utama\n"
            "  \"risk_level\": \"low | medium | high\", // tingkat risiko\n"
            "  \"recommendation\": \"Saran langkah mitigasi taktis yang singkat dan padat untuk petani\"\n"
            "}"
        )
        
        prompt = (
            f"Kondisi cuaca: {weather_summary}\n"
            f"Tanaman utama petani: {crop_type}\n"
            f"Tolong analisa risiko utama dan berikan mitigasinya."
        )
        
        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": settings.GROQ_DEFAULT_MODEL,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt}
            ],
            "response_format": {"type": "json_object"},
            "temperature": 0.2
        }

        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                response = await client.post(
                    "https://api.groq.com/openai/v1/chat/completions",
                    headers=headers,
                    json=payload
                )
                if response.status_code == 200:
                    data = response.json()
                    content_str = data["choices"][0]["message"]["content"]
                    return json.loads(content_str)
                else:
                    logger.error(f"Groq weather risk API error ({response.status_code}): {response.text}")
                    return WeatherService._get_offline_weather_risk_mock(crop_type, weather_summary)
        except Exception as e:
            logger.error(f"Error calling Groq weather risk API: {e}")
            return WeatherService._get_offline_weather_risk_mock(crop_type, weather_summary)

    @staticmethod
    def _get_offline_weather_risk_mock(crop_type: str, weather_summary: str) -> Dict[str, Any]:
        """
        Returns mock JSON for weather/pest risk simulation if Groq API key is missing.
        """
        crop = crop_type.lower()
        if "hujan" in weather_summary.lower() or "badai" in weather_summary.lower():
            if "cabai" in crop or "cabe" in crop:
                return {
                    "risk_type": "hama",
                    "risk_level": "high",
                    "recommendation": "Waspadai penyakit antraknosa (patek) dan busuk buah akibat kelembaban tinggi. Lakukan penyemprotan fungisida organik secara berkala dan pastikan drainase bedengan mengalir lancar."
                }
            elif "padi" in crop:
                return {
                    "risk_type": "banjir",
                    "risk_level": "medium",
                    "recommendation": "Pastikan saluran pembuangan air di sawah tidak tersumbat lumpur. Pantau debit air secara berkala untuk menghindari genangan berlebih pada anakan padi muda."
                }
            else:
                return {
                    "risk_type": "hama",
                    "risk_level": "medium",
                    "recommendation": "Tingginya curah hujan meningkatkan kelembaban. Lakukan pemantauan serangga pengganggu dan bersihkan gulma di sekeliling tanaman untuk mengurangi kelembaban mikro."
                }
        else:
            # Hot/Dry weather
            if "padi" in crop:
                return {
                    "risk_type": "kekeringan",
                    "risk_level": "medium",
                    "recommendation": "Suhu udara tinggi meningkatkan penguapan air. Terapkan sistem pengairan berselang (intermittent irrigation) untuk menghemat air dan kurangi resiko retak tanah."
                }
            else:
                return {
                    "risk_type": "kekeringan",
                    "risk_level": "low",
                    "recommendation": "Gunakan mulsa organik di permukaan tanah untuk mempertahankan kelembaban tanah. Lakukan penyiraman secara berkala pada pagi atau sore hari."
                }
