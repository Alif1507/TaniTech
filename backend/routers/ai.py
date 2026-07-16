from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from utils.supabase import get_supabase_client, get_admin_client
from deps import get_current_user, get_token_header
from services.ai_service import AIService
from config import logger

router = APIRouter(prefix="/api/ai", tags=["AI Assistant"])

# Request validation schemas
class RecommendRequest(BaseModel):
    input_mode: str # 'basic' | 'advanced'
    komoditas: str
    luas_lahan_m2: float
    lokasi: str
    kondisi_saat_ini: str
    budget: float
    additional_data: Optional[Dict[str, Any]] = None

@router.post("/recommend")
async def recommend_iot(
    req: RecommendRequest,
    current_user: Dict[str, Any] = Depends(get_current_user),
    token: str = Depends(get_token_header)
):
    """
    Tahap 1: Generates IoT solutions using Groq AI.
    Saves conversation logs, generated recommendations, and components to DB.
    """
    if req.input_mode not in ['basic', 'advanced']:
        raise HTTPException(
            status_code=400,
            detail="input_mode must be 'basic' or 'advanced'"
        )

    if req.input_mode == 'advanced' and not req.additional_data:
        raise HTTPException(
            status_code=400,
            detail="additional_data is required when input_mode is 'advanced'"
        )

    # 1. Call AI service to generate recommendation
    ai_response = await AIService.generate_recommendation(
        input_mode=req.input_mode,
        komoditas=req.komoditas,
        luas_lahan_m2=req.luas_lahan_m2,
        lokasi=req.lokasi,
        kondisi_saat_ini=req.kondisi_saat_ini,
        budget=req.budget,
        additional_data=req.additional_data
    )

    user_id = current_user["id"]
    user_client = get_supabase_client(token)
    admin_client = get_admin_client()

    try:
        # 2. Insert into ai_conversations
        conv_payload = {
            "user_id": user_id,
            "input_mode": req.input_mode,
            "komoditas": req.komoditas,
            "luas_lahan_m2": req.luas_lahan_m2,
            "lokasi": req.lokasi,
            "kondisi_saat_ini": req.kondisi_saat_ini,
            "budget": req.budget,
            "additional_data": req.additional_data or {}
        }
        conv_res = user_client.table("ai_conversations").insert(conv_payload).execute()
        if not conv_res.data:
            raise HTTPException(status_code=500, detail="Failed to save conversation log")
        
        conversation_id = conv_res.data[0]["id"]

        # 3. Insert into ai_recommendations (using admin client to handle nested component inserts safely)
        rec_payload = {
            "conversation_id": conversation_id,
            "solution_name": ai_response.get("solution_name", "Solusi IoT Pintar"),
            "description": ai_response.get("description", ""),
            "estimated_cost": ai_response.get("estimated_cost", 0)
        }
        rec_res = admin_client.table("ai_recommendations").insert(rec_payload).execute()
        if not rec_res.data:
            raise HTTPException(status_code=500, detail="Failed to save AI recommendations")
            
        recommendation_id = rec_res.data[0]["id"]

        # 4. Insert components
        components = ai_response.get("components", [])
        inserted_components = []
        for comp in components:
            comp_payload = {
                "recommendation_id": recommendation_id,
                "component_name": comp.get("component_name", ""),
                "description": comp.get("description", ""),
                "price": comp.get("price", 0),
                "image_url": comp.get("image_url"),
                "buy_link_online": comp.get("buy_link_online"),
                "store_location_text": comp.get("store_location_text"),
                "store_lat": comp.get("store_lat"),
                "store_lng": comp.get("store_lng")
            }
            comp_res = admin_client.table("recommendation_components").insert(comp_payload).execute()
            if comp_res.data:
                inserted_components.append(comp_res.data[0])

        return {
            "conversation_id": conversation_id,
            "recommendation_id": recommendation_id,
            "solution_name": rec_payload["solution_name"],
            "description": rec_payload["description"],
            "estimated_cost": rec_payload["estimated_cost"],
            "components": inserted_components
        }

    except Exception as e:
        logger.error(f"Error saving recommendations to database: {e}")
        # Return AI output even if DB insert fails so that user sees results
        return {
            "error": "Failed to save recommendation to history, but generation completed successfully.",
            "data": ai_response
        }

@router.get("/history")
def get_history(current_user: Dict[str, Any] = Depends(get_current_user)):
    """
    Retrieves all AI recommendation histories for the authenticated user.
    """
    user_id = current_user["id"]
    admin_client = get_admin_client()
    
    # Query conversations for current user
    conv_res = admin_client.table("ai_conversations").select("*").eq("user_id", user_id).order("created_at", desc=True).execute()
    conversations = conv_res.data or []
    
    history_list = []
    for conv in conversations:
        # Fetch associated recommendations
        rec_res = admin_client.table("ai_recommendations").select("*").eq("conversation_id", conv["id"]).execute()
        recs = rec_res.data or []
        
        recs_with_components = []
        for rec in recs:
            comp_res = admin_client.table("recommendation_components").select("*").eq("recommendation_id", rec["id"]).execute()
            rec["components"] = comp_res.data or []
            
            # Check if simulation exists
            sim_res = admin_client.table("simulation_results").select("*").eq("recommendation_id", rec["id"]).execute()
            rec["simulation"] = sim_res.data[0] if sim_res.data else None
            
            recs_with_components.append(rec)
            
        conv["recommendations"] = recs_with_components
        history_list.append(conv)
        
    return history_list

@router.get("/history/{id}")
def get_history_detail(id: str, current_user: Dict[str, Any] = Depends(get_current_user)):
    """
    Retrieves details of a specific AI recommendation history log.
    """
    admin_client = get_admin_client()
    conv_res = admin_client.table("ai_conversations").select("*").eq("id", id).execute()
    
    if not conv_res.data:
        raise HTTPException(status_code=404, detail="Conversation log not found")
        
    conversation = conv_res.data[0]
    # Enforce ownership check
    if conversation["user_id"] != current_user["id"]:
        raise HTTPException(status_code=403, detail="Access denied")
        
    # Fetch recommendation
    rec_res = admin_client.table("ai_recommendations").select("*").eq("conversation_id", id).execute()
    recs = rec_res.data or []
    
    recs_with_components = []
    for rec in recs:
        comp_res = admin_client.table("recommendation_components").select("*").eq("recommendation_id", rec["id"]).execute()
        rec["components"] = comp_res.data or []
        
        sim_res = admin_client.table("simulation_results").select("*").eq("recommendation_id", rec["id"]).execute()
        rec["simulation"] = sim_res.data[0] if sim_res.data else None
        
        recs_with_components.append(rec)
        
    conversation["recommendations"] = recs_with_components
    return conversation

@router.post("/simulate/{recommendation_id}")
async def simulate_digital_twin(
    recommendation_id: str,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Tahap 2: Generates Digital Twin Simulation.
    Projections: yield increase, breakeven analysis, environmental impact, scenarios A/B.
    """
    admin_client = get_admin_client()
    
    # 1. Fetch recommendation details
    rec_res = admin_client.table("ai_recommendations").select("*").eq("id", recommendation_id).execute()
    if not rec_res.data:
        raise HTTPException(status_code=404, detail="Recommendation details not found")
    recommendation = rec_res.data[0]
    
    # 2. Fetch conversation details to get context (crop, budget, location)
    conv_res = admin_client.table("ai_conversations").select("*").eq("id", recommendation["conversation_id"]).execute()
    if not conv_res.data:
        raise HTTPException(status_code=404, detail="Associated conversation context not found")
    conversation = conv_res.data[0]
    
    # Check ownership
    if conversation["user_id"] != current_user["id"]:
        raise HTTPException(status_code=403, detail="Access denied")

    # 3. Check if simulation already exists to prevent duplicate calls
    existing_sim = admin_client.table("simulation_results").select("*").eq("recommendation_id", recommendation_id).execute()
    if existing_sim.data:
        sim_id = existing_sim.data[0]["id"]
        scenarios_res = admin_client.table("simulation_scenarios").select("*").eq("simulation_id", sim_id).execute()
        result = {**existing_sim.data[0]}
        result["scenarios"] = scenarios_res.data or []
        return result

    # 4. Fetch details of components to pass to simulation API
    comp_res = admin_client.table("recommendation_components").select("*").eq("recommendation_id", recommendation_id).execute()
    recommendation["components"] = comp_res.data or []

    # 5. Generate Simulation via Groq
    sim_data = await AIService.generate_simulation(
        recommendation=recommendation,
        conversation=conversation
    )

    try:
        # 6. Save Simulation Result to DB
        sim_payload = {
            "recommendation_id": recommendation_id,
            "current_yield_kg": sim_data.get("current_yield_kg", 0),
            "projected_yield_kg": sim_data.get("projected_yield_kg", 0),
            "yield_increase_percent": sim_data.get("yield_increase_percent", 0),
            "current_failure_rate": sim_data.get("current_failure_rate", ""),
            "projected_failure_rate": sim_data.get("projected_failure_rate", ""),
            "water_usage_reduction_percent": sim_data.get("water_usage_reduction_percent", 0),
            "investment_cost": sim_data.get("investment_cost", recommendation["estimated_cost"]),
            "additional_income_per_cycle": sim_data.get("additional_income_per_cycle", 0),
            "breakeven_cycle": sim_data.get("breakeven_cycle", 1),
            "breakeven_months": sim_data.get("breakeven_months", 3.0),
            "projected_net_profit_year1": sim_data.get("projected_net_profit_year1", 0),
            "risk_drought_before": sim_data.get("risk_drought_before", "medium"),
            "risk_drought_after": sim_data.get("risk_drought_after", "low"),
            "risk_pest_level": sim_data.get("risk_pest_level", "medium"),
            # If advanced mode, confidence level is 15-20% higher
            "confidence_level": sim_data.get("confidence_level", 75.0 if conversation["input_mode"] == "advanced" else 55.0),
            "ai_insight_text": sim_data.get("ai_insight_text", "")
        }
        
        sim_res = admin_client.table("simulation_results").insert(sim_payload).execute()
        if not sim_res.data:
            raise HTTPException(status_code=500, detail="Failed to save simulation results")
            
        simulation_id = sim_res.data[0]["id"]
        
        # 7. Save Simulation Scenarios
        scenarios = sim_data.get("scenarios", [])
        inserted_scenarios = []
        for sc in scenarios:
            sc_payload = {
                "simulation_id": simulation_id,
                "scenario_label": sc.get("scenario_label", "A"),
                "scenario_name": sc.get("scenario_name", ""),
                "total_cost": sc.get("total_cost", 0),
                "projected_yield_kg": sc.get("projected_yield_kg", 0),
                "breakeven_cycle": sc.get("breakeven_cycle", 1),
                "is_within_budget": sc.get("is_within_budget", True),
                "ai_recommendation_note": sc.get("ai_recommendation_note", "")
            }
            sc_res = admin_client.table("simulation_scenarios").insert(sc_payload).execute()
            if sc_res.data:
                inserted_scenarios.append(sc_res.data[0])
                
        result = {**sim_res.data[0]}
        result["scenarios"] = inserted_scenarios
        return result

    except Exception as e:
        logger.error(f"Error saving digital twin simulation results: {e}")
        return {
            "error": "Failed to save simulation results to DB, but generation completed.",
            "data": sim_data
        }

@router.get("/simulate/{id}")
def get_simulation_detail(id: str, current_user: Dict[str, Any] = Depends(get_current_user)):
    """
    Retrieves the details of a specific simulation result.
    """
    admin_client = get_admin_client()
    sim_res = admin_client.table("simulation_results").select("*").eq("id", id).execute()
    
    if not sim_res.data:
        raise HTTPException(status_code=404, detail="Simulation result not found")
        
    simulation = sim_res.data[0]
    
    # Ownership Check
    rec_res = admin_client.table("ai_recommendations").select("conversation_id").eq("id", simulation["recommendation_id"]).execute()
    if rec_res.data:
        conv_res = admin_client.table("ai_conversations").select("user_id").eq("id", rec_res.data[0]["conversation_id"]).execute()
        if conv_res.data and conv_res.data[0]["user_id"] != current_user["id"]:
            raise HTTPException(status_code=403, detail="Access denied")

    scenarios_res = admin_client.table("simulation_scenarios").select("*").eq("simulation_id", id).execute()
    simulation["scenarios"] = scenarios_res.data or []
    
    return simulation

@router.get("/simulate/{id}/scenarios")
def get_simulation_scenarios(id: str):
    """
    Retrieves the scenario options (A/B comparison) for a specific simulation.
    """
    admin_client = get_admin_client()
    scenarios_res = admin_client.table("simulation_scenarios").select("*").eq("simulation_id", id).execute()
    return scenarios_res.data or []
