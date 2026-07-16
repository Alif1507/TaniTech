import httpx
import json
from typing import Dict, Any, Optional
from config import settings, logger

class AIService:
    @staticmethod
    async def _call_groq(prompt: str, system_prompt: str, use_reasoning_model: bool = False) -> Dict[str, Any]:
        """
        Helper method to execute HTTP POST requests to Groq API.
        If GROQ_API_KEY is not defined, it returns high quality mock data.
        """
        api_key = settings.GROQ_API_KEY
        model = settings.GROQ_REASONING_MODEL if use_reasoning_model else settings.GROQ_DEFAULT_MODEL

        if not api_key:
            logger.warning("GROQ_API_KEY not set. Using offline mock generator.")
            return AIService._get_offline_mock(prompt, use_reasoning_model)

        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }
        
        payload = {
            "model": model,
            "messages": [
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt}
            ],
            "response_format": {"type": "json_object"},
            "temperature": 0.2
        }

        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    "https://api.groq.com/openai/v1/chat/completions",
                    headers=headers,
                    json=payload
                )
                
                if response.status_code != 200:
                    logger.error(f"Groq API error ({response.status_code}): {response.text}")
                    # Fallback to mock on API failures so the demo doesn't crash
                    return AIService._get_offline_mock(prompt, use_reasoning_model)
                    
                data = response.json()
                content_str = data["choices"][0]["message"]["content"]
                return json.loads(content_str)
                
        except Exception as e:
            logger.error(f"Error calling Groq API: {e}")
            return AIService._get_offline_mock(prompt, use_reasoning_model)

    @staticmethod
    def _get_offline_mock(prompt: str, use_reasoning_model: bool) -> Dict[str, Any]:
        """
        Returns mock JSON structures that fit the expected schemas perfectly for demo purposes.
        """
        # Parse basic keywords from prompt to make mock slightly dynamic
        komoditas = "Cabai Merah"
        lokasi = "Kabupaten Garut"
        budget = 3000000
        
        try:
            if "komoditas" in prompt:
                # Prompt is likely JSON or contains details. Try to extract
                if "Cabai" in prompt or "cabai" in prompt:
                    komoditas = "Cabai Merah"
                elif "Padi" in prompt or "padi" in prompt:
                    komoditas = "Padi IR64"
                elif "Jagung" in prompt or "jagung" in prompt:
                    komoditas = "Jagung Hibrida"
                
                if "Garut" in prompt or "garut" in prompt:
                    lokasi = "Kabupaten Garut, Jawa Barat"
                elif "Malang" in prompt or "malang" in prompt:
                    lokasi = "Kabupaten Malang, Jawa Timur"
        except:
            pass

        if not use_reasoning_model:
            # Tahap 1: AI Recommendation
            return {
                "solution_name": f"Smart Irrigation & Moisture Monitoring System ({komoditas})",
                "description": f"Sistem irigasi otomatis berbasis kelembaban tanah yang dirancang khusus untuk lahan pertanian {komoditas} di {lokasi}. Sistem ini mengalirkan air secara presisi hanya saat tanah membutuhkan, mencegah pemborosan air dan menjaga kesehatan akar tanaman.",
                "estimated_cost": 2750000,
                "components": [
                    {
                        "component_name": "Solenoid Valve Kuningan 12V",
                        "description": "Katup air otomatis yang dikontrol mikroprosesor untuk membuka/tutup aliran air irigasi.",
                        "price": 280000,
                        "image_url": "https://placehold.co/400x300?text=Solenoid+Valve",
                        "buy_link_online": "https://www.tokopedia.com/search?q=solenoid+valve+12v+kuningan",
                        "store_location_text": "Toko Teknik Pertanian Jaya, Garut",
                        "store_lat": -7.2278,
                        "store_lng": 107.9086
                    },
                    {
                        "component_name": "Sensor Kelembaban Tanah Kapasitif v1.2",
                        "description": "Mengukur kelembaban tanah secara akurat tanpa korosi cepat.",
                        "price": 85000,
                        "image_url": "https://placehold.co/400x300?text=Capacitive+Moisture+Sensor",
                        "buy_link_online": "https://www.tokopedia.com/search?q=soil+moisture+sensor+capacitive",
                        "store_location_text": "Toko Elektronik Komponen Garut",
                        "store_lat": -7.2290,
                        "store_lng": 107.9000
                    },
                    {
                        "component_name": "Mikrokontroler ESP32 IoT Board",
                        "description": "Otak sistem yang memproses data sensor dan mengirimkan instruksi via Wi-Fi/Bluetooth.",
                        "price": 120000,
                        "image_url": "https://placehold.co/400x300?text=ESP32+IoT+Board",
                        "buy_link_online": "https://www.tokopedia.com/search?q=esp32+development+board",
                        "store_location_text": "Toko Elektronik Komponen Garut",
                        "store_lat": -7.2290,
                        "store_lng": 107.9000
                    },
                    {
                        "component_name": "Pipa Drip & Selang PE 16mm (100 Meter)",
                        "description": "Jaringan distribusi air untuk irigasi tetes merata.",
                        "price": 450000,
                        "image_url": "https://placehold.co/400x300?text=Pipa+Drip+PE",
                        "buy_link_online": "https://www.tokopedia.com/search?q=selang+pe+16mm+100m",
                        "store_location_text": "Toko Selang & Plastik Sentosa",
                        "store_lat": -7.2150,
                        "store_lng": 107.8950
                    },
                    {
                        "component_name": "Pompa Air DC 12V High Pressure & Adaptor",
                        "description": "Pompa pendorong air ke jalur pipa tetes.",
                        "price": 350000,
                        "image_url": "https://placehold.co/400x300?text=DC+Water+Pump",
                        "buy_link_online": "https://www.tokopedia.com/search?q=pompa+air+dc+12v+adaptor",
                        "store_location_text": "Toko Teknik Pertanian Jaya, Garut",
                        "store_lat": -7.2278,
                        "store_lng": 107.9086
                    }
                ]
            }
        else:
            # Tahap 2: Digital Twin Simulation
            return {
                "current_yield_kg": 350.0,
                "projected_yield_kg": 490.0,
                "yield_increase_percent": 40.0,
                "current_failure_rate": "2x dari 5 musim terakhir",
                "projected_failure_rate": "0-1x dari 5 musim ke depan",
                "water_usage_reduction_percent": 35.0,
                "investment_cost": 2750000,
                "additional_income_per_cycle": 3500000,
                "breakeven_cycle": 1,
                "breakeven_months": 3.0,
                "projected_net_profit_year1": 7750000,
                "risk_drought_before": "high",
                "risk_drought_after": "low",
                "risk_pest_level": "medium",
                "confidence_level": 85.0 if "advanced" in prompt else 65.0,
                "ai_insight_text": f"Sistem irigasi pintar ini mengurangi konsumsi air secara signifikan dan mengoptimalkan kelembaban tanah di {lokasi}, yang terbukti meningkatkan kualitas buah {komoditas} serta mempercepat masa panen sehingga modal kembali dalam siklus pertama.",
                "scenarios": [
                    {
                        "scenario_label": "A",
                        "scenario_name": "Smart Irrigation Only (Sesuai Budget)",
                        "total_cost": 2750000,
                        "projected_yield_kg": 490.0,
                        "breakeven_cycle": 1,
                        "is_within_budget": True,
                        "ai_recommendation_note": "✅ Sesuai budget Rp 3.000.000"
                    },
                    {
                        "scenario_label": "B",
                        "scenario_name": "Smart Irrigation & Soil Nitrogen Sensors (Opsi Upgrade)",
                        "total_cost": 4100000,
                        "projected_yield_kg": 540.0,
                        "breakeven_cycle": 2,
                        "is_within_budget": False,
                        "ai_recommendation_note": "⚠️ Melebihi budget (butuh tambahan Rp 1.100.000)"
                    }
                ]
            }

    @classmethod
    async def generate_recommendation(
        cls, 
        input_mode: str, 
        komoditas: str, 
        luas_lahan_m2: float, 
        lokasi: str, 
        kondisi_saat_ini: str, 
        budget: float, 
        additional_data: Optional[Dict[str, Any]] = None
    ) -> Dict[str, Any]:
        """
        Tahap 1: Generates IoT solution recommendation.
        """
        system_prompt = (
            "Anda adalah AI Ahli Teknologi Pertanian (IoT & Smart Farming) Indonesia. "
            "Tugas Anda adalah merekomendasikan solusi teknologi pertanian pintar (IoT) berdasarkan input petani. "
            "Anda WAJIB mengembalikan respon dalam format JSON yang valid, tanpa penjelasan markdown di luar blok JSON. "
            "Format JSON yang diharapkan harus mengikuti struktur berikut:\n"
            "{\n"
            "  \"solution_name\": \"Nama Solusi IoT\",\n"
            "  \"description\": \"Penjelasan mendetail mengenai solusi dan kegunaannya\",\n"
            "  \"estimated_cost\": 2500000, // angka estimasi total biaya dalam Rupiah\n"
            "  \"components\": [\n"
            "    {\n"
            "      \"component_name\": \"Nama Komponen\",\n"
            "      \"description\": \"Fungsi komponen tersebut\",\n"
            "      \"price\": 150000, // angka estimasi harga per unit dalam Rupiah\n"
            "      \"image_url\": \"URL gambar ilustrasi komponen\",\n"
            "      \"buy_link_online\": \"Link pencarian e-commerce online (misal Tokopedia/Shopee)\",\n"
            "      \"store_location_text\": \"Nama toko/area terdekat (misal Toko Elektronik di Bandung)\",\n"
            "      \"store_lat\": -6.9175,\n"
            "      \"store_lng\": 107.6191\n"
            "    }\n"
            "  ]\n"
            "}"
        )

        user_content = {
            "input_mode": input_mode,
            "komoditas": komoditas,
            "luas_lahan_m2": luas_lahan_m2,
            "lokasi": lokasi,
            "kondisi_saat_ini": kondisi_saat_ini,
            "budget": budget,
            "additional_data": additional_data or {}
        }
        
        prompt = (
            f"Tolong buatkan rekomendasi solusi IoT pertanian pintar berdasarkan data berikut:\n"
            f"{json.dumps(user_content, indent=2)}\n"
            f"Harap sesuaikan komponen dan harga yang masuk akal di pasar Indonesia saat ini."
        )

        return await cls._call_groq(prompt, system_prompt, use_reasoning_model=False)

    @classmethod
    async def generate_simulation(
        cls,
        recommendation: Dict[str, Any],
        conversation: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Tahap 2: Generates Digital Twin Simulation results comparing current and projected yield, breakeven analysis, and scenarios.
        """
        system_prompt = (
            "Anda adalah AI Ahli Simulasi Digital Twin Pertanian. "
            "Tugas Anda adalah memproyeksikan hasil panen, penghematan air, risiko iklim/hama, dan kelayakan finansial "
            "dari penerapan solusi IoT yang telah direkomendasikan sebelumnya. "
            "Anda WAJIB mengembalikan respon dalam format JSON yang valid, tanpa penjelasan markdown di luar blok JSON. "
            "Format JSON yang diharapkan harus mengikuti struktur berikut:\n"
            "{\n"
            "  \"current_yield_kg\": 300, // Hasil panen saat ini (sebelum pasang alat) dalam kg\n"
            "  \"projected_yield_kg\": 450, // Proyeksi hasil panen setelah pasang alat dalam kg\n"
            "  \"yield_increase_percent\": 50, // Persentase kenaikan\n"
            "  \"current_failure_rate\": \"2x dari 5 musim\", // Keterangan gagal panen lama\n"
            "  \"projected_failure_rate\": \"0-1x dari 5 musim\", // Proyeksi gagal panen baru\n"
            "  \"water_usage_reduction_percent\": 30, // Persen penghematan air\n"
            "  \"investment_cost\": 2500000, // Total biaya investasi alat\n"
            "  \"additional_income_per_cycle\": 3000000, // Tambahan pendapatan kotor per siklus panen (Rupiah)\n"
            "  \"breakeven_cycle\": 1, // Siklus panen ke berapa modal kembali\n"
            "  \"breakeven_months\": 3.5, // Jumlah bulan sampai balik modal\n"
            "  \"projected_net_profit_year1\": 6500000, // Proyeksi profit bersih tahun pertama (Rupiah)\n"
            "  \"risk_drought_before\": \"high\", // low / medium / high\n"
            "  \"risk_drought_after\": \"low\", // low / medium / high\n"
            "  \"risk_pest_level\": \"medium\", // low / medium / high\n"
            "  \"confidence_level\": 80, // Persen tingkat kepercayaan (berkisar 0-100)\n"
            "  \"ai_insight_text\": \"Kalimat kesimpulan dan insight penutup dari AI\",\n"
            "  \"scenarios\": [\n"
            "    {\n"
            "      \"scenario_label\": \"A\",\n"
            "      \"scenario_name\": \"Smart Irrigation Only\",\n"
            "      \"total_cost\": 2500000,\n"
            "      \"projected_yield_kg\": 450,\n"
            "      \"breakeven_cycle\": 1,\n"
            "      \"is_within_budget\": true,\n"
            "      \"ai_recommendation_note\": \"✅ Sesuai budget\"\n"
            "    },\n"
            "    {\n"
            "      \"scenario_label\": \"B\",\n"
            "      \"scenario_name\": \"Smart Irrigation + Pest Sensor (Upgrade)\",\n"
            "      \"total_cost\": 3800000,\n"
            "      \"projected_yield_kg\": 500,\n"
            "      \"breakeven_cycle\": 2,\n"
            "      \"is_within_budget\": false,\n"
            "      \"ai_recommendation_note\": \"⚠️ Melebihi budget\"\n"
            "    }\n"
            "  ]\n"
            "}"
        )

        user_content = {
            "conversation_input": conversation,
            "recommended_solution": recommendation
        }

        prompt = (
            f"Tolong buatkan simulasi dampak digital twin pertanian berdasarkan data berikut:\n"
            f"{json.dumps(user_content, indent=2)}\n"
            f"Harap hitung secara realistis untuk pasar dan komoditas pertanian di Indonesia."
        )

        # Use reasoning model for deep simulation projections
        return await cls._call_groq(prompt, system_prompt, use_reasoning_model=True)
