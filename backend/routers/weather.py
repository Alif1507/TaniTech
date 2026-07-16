from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
from typing import Optional, Dict, Any, List
from utils.supabase import get_supabase_client, get_admin_client
from deps import get_current_user, verify_cron_secret
from services.weather_service import WeatherService
from config import logger

router = APIRouter(prefix="/api/weather", tags=["Weather & Pest Alerts"])

@router.get("/current")
async def get_current_weather_conditions(lat: float, lng: float):
    """
    Fetches real-time weather conditions for a set of coordinates.
    """
    try:
        data = await WeatherService.get_current_weather(lat, lng)
        return data
    except Exception as e:
        logger.error(f"Error fetching current weather conditions: {e}")
        raise HTTPException(
            status_code=500,
            detail="Failed to retrieve weather forecasts"
        )

@router.get("/alerts/mine")
def get_my_weather_alerts(current_user: Dict[str, Any] = Depends(get_current_user)):
    """
    Retrieves weather risk and pest warnings generated for the logged-in farmer.
    """
    if current_user["role"] != "petani":
        raise HTTPException(
            status_code=403,
            detail="Access restricted. Only farmers can view weather alerts"
        )
        
    admin_client = get_admin_client()
    try:
        res = admin_client.table("weather_alerts").select("*").eq("farmer_id", current_user["id"]).order("created_at", desc=True).execute()
        return res.data or []
    except Exception as e:
        logger.error(f"Error fetching farmer weather alerts: {e}")
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/alerts/{id}")
def get_weather_alert_detail(id: str, current_user: Dict[str, Any] = Depends(get_current_user)):
    """
    Retrieves details of a specific weather warning alert.
    """
    admin_client = get_admin_client()
    try:
        res = admin_client.table("weather_alerts").select("*").eq("id", id).execute()
        if not res.data:
            raise HTTPException(status_code=404, detail="Weather alert not found")
            
        alert = res.data[0]
        # Ownership policy check
        if alert["farmer_id"] != current_user["id"]:
            raise HTTPException(status_code=403, detail="Access denied")
            
        return alert
    except Exception as e:
        logger.error(f"Error fetching weather alert details: {e}")
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(status_code=400, detail=str(e))

async def run_weather_cron_job():
    """
    Background worker that aggregates weather warnings for all farmers.
    """
    logger.info("Executing daily agrometeorology cron job...")
    admin_client = get_admin_client()
    
    try:
        # Fetch all farmers and their farmer profiles details
        farmers_res = admin_client.table("profiles").select("*, farmer_profiles:id(*)").eq("role", "petani").execute()
        farmers = farmers_res.data or []
        
        logger.info(f"Analyzing alerts for {len(farmers)} registered farmers")
        
        for farmer in farmers:
            fp_list = farmer.get("farmer_profiles", [])
            if not fp_list:
                continue
            fp = fp_list[0] if isinstance(fp_list, list) else fp_list
            
            lat = fp.get("latitude")
            lng = fp.get("longitude")
            crop_type = fp.get("crop_type") or "tanaman umum"
            farmer_id = farmer["id"]
            
            # Skip if location coordinates are not filled in
            if lat is None or lng is None:
                logger.info(f"Skipping farmer {farmer['full_name']} (id: {farmer_id}) - coordinates not set")
                continue
                
            try:
                # 1. Fetch current weather summary
                weather = await WeatherService.get_current_weather(lat, lng)
                summary_text = weather["summary_text"]
                
                # 2. Call AI Groq analyzer
                risk = await WeatherService.analyze_weather_risks(crop_type, summary_text)
                
                # 3. Save warning alert to database
                alert_payload = {
                    "farmer_id": farmer_id,
                    "weather_summary": summary_text,
                    "risk_type": risk.get("risk_type", "cuaca_ekstrim"),
                    "risk_level": risk.get("risk_level", "low"),
                    "recommendation": risk.get("recommendation", "Pantau terus kondisi cuaca lokal."),
                    "source": "open-meteo"
                }
                admin_client.table("weather_alerts").insert(alert_payload).execute()
                
                # 4. If risk is high or medium, issue an in-app notification
                if risk.get("risk_level") in ["medium", "high"]:
                    noti_payload = {
                        "user_id": farmer_id,
                        "title": f"Peringatan Risiko: {risk.get('risk_type', 'Cuaca').upper()}",
                        "message": f"Peringatan {risk.get('risk_level')} untuk tanaman {crop_type}: {risk.get('recommendation')}"
                    }
                    admin_client.table("notifications").insert(noti_payload).execute()
                    
                    # WhatsApp opt-in notification logger simulated
                    if fp.get("opt_in_whatsapp_alert"):
                        logger.info(f"Simulating WhatsApp Alert message sent to {farmer['whatsapp_number']} for {risk['risk_type']} risk")
                        
            except Exception as farmer_err:
                logger.error(f"Failed to generate weather warnings for farmer {farmer['full_name']}: {farmer_err}")
                
        logger.info("Agrometeorology cron job completed successfully.")
    except Exception as e:
        logger.error(f"Error in agrometeorology cron job: {e}")

@router.post("/generate")
def trigger_weather_alerts(
    background_tasks: BackgroundTasks,
    is_cron: bool = Depends(verify_cron_secret)
):
    """
    Triggers manual analysis and alerts population.
    Protected endpoint called by server scheduler/cron services using X-Cron-Secret header.
    Runs asynchronously as a background task.
    """
    background_tasks.add_task(run_weather_cron_job)
    return {
        "status": "triggered",
        "message": "Agrometeorology warning alert generator has been queued as a background task."
    }
