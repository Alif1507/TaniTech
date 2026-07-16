from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr
from typing import Optional, Dict, Any
from utils.supabase import get_supabase_client, get_admin_client
from deps import get_current_user, get_token_header
from config import logger

router = APIRouter(prefix="/api/auth", tags=["Auth"])

# Pydantic schemas for request validation
class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    full_name: str
    phone: str
    whatsapp_number: str
    role: str # 'petani' | 'konsumen'
    avatar_url: Optional[str] = None

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class RefreshRequest(BaseModel):
    refresh_token: str

class FarmerProfileUpdate(BaseModel):
    farm_name: Optional[str] = None
    farm_type: Optional[str] = None
    location: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    bio: Optional[str] = None
    crop_type: Optional[str] = None
    opt_in_whatsapp_alert: Optional[bool] = None

class ConsumerProfileUpdate(BaseModel):
    address: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

class ProfileUpdateRequest(BaseModel):
    full_name: Optional[str] = None
    phone: Optional[str] = None
    whatsapp_number: Optional[str] = None
    avatar_url: Optional[str] = None
    farmer_data: Optional[FarmerProfileUpdate] = None
    consumer_data: Optional[ConsumerProfileUpdate] = None

@router.post("/register")
def register(req: RegisterRequest):
    """
    Registers a new user on Supabase Auth.
    Triggers automatically populate the public profiles table and role-specific tables.
    """
    if req.role not in ['petani', 'konsumen']:
        raise HTTPException(
            status_code=400,
            detail="Role must be either 'petani' or 'konsumen'"
        )

    # Clean whatsapp number to start with international dial format without '+'
    wa = req.whatsapp_number.strip()
    if wa.startswith("+"):
        wa = wa[1:]
    elif wa.startswith("08"):
        wa = "628" + wa[2:]

    admin_client = get_admin_client()
    try:
        # Register user directly with admin client to auto-confirm email and bypass rate limits
        auth_res = admin_client.auth.admin.create_user({
            "email": req.email,
            "password": req.password,
            "email_confirm": True,
            "user_metadata": {
                "full_name": req.full_name,
                "phone": req.phone,
                "whatsapp_number": wa,
                "role": req.role,
                "avatar_url": req.avatar_url or ""
            }
        })
        
        if not auth_res or not auth_res.user:
            raise HTTPException(
                status_code=400,
                detail="Registration failed. Check if email is already in use."
            )
            
        user = auth_res.user
        # Return registered user profile
        return {
            "id": user.id,
            "email": user.email,
            "full_name": req.full_name,
            "phone": req.phone,
            "whatsapp_number": wa,
            "role": req.role,
            "avatar_url": req.avatar_url,
            "created_at": user.created_at
        }
    except Exception as e:
        logger.error(f"Registration error: {e}")
        raise HTTPException(
            status_code=400,
            detail=str(e)
        )

@router.post("/login")
def login(req: LoginRequest):
    """
    Authenticates a user via Supabase Auth and returns an access token session.
    """
    client = get_supabase_client()
    try:
        res = client.auth.sign_in_with_password({
            "email": req.email,
            "password": req.password
        })
        if not res or not res.session:
            raise HTTPException(
                status_code=401,
                detail="Incorrect email or password"
            )
        
        # Get profile role details
        admin_client = get_admin_client()
        profile_res = admin_client.table("profiles").select("*").eq("id", res.user.id).execute()
        profile = profile_res.data[0] if profile_res.data else {}
            
        return {
            "access_token": res.session.access_token,
            "refresh_token": res.session.refresh_token,
            "expires_in": res.session.expires_in,
            "token_type": "bearer",
            "profile": profile
        }
    except Exception as e:
        logger.error(f"Login error: {e}")
        raise HTTPException(
            status_code=401,
            detail="Authentication failed. Incorrect email or password."
        )

@router.post("/refresh")
def refresh(req: RefreshRequest):
    """
    Refreshes an active session token using a refresh token.
    """
    client = get_supabase_client()
    try:
        res = client.auth.refresh_session(req.refresh_token)
        if not res or not res.session:
            raise HTTPException(
                status_code=400,
                detail="Invalid refresh token"
            )
            
        return {
            "access_token": res.session.access_token,
            "refresh_token": res.session.refresh_token,
            "expires_in": res.session.expires_in,
            "token_type": "bearer"
        }
    except Exception as e:
        logger.error(f"Token refresh error: {e}")
        raise HTTPException(
            status_code=400,
            detail="Session could not be refreshed. Try logging in again."
        )

@router.get("/me")
def get_me(current_user: Dict[str, Any] = Depends(get_current_user)):
    """
    Fetches the profile info and role-specific profile details of the logged in user.
    """
    user_id = current_user["id"]
    role = current_user["role"]
    
    admin_client = get_admin_client()
    result = {**current_user}
    
    if role == "petani":
        farmer_res = admin_client.table("farmer_profiles").select("*").eq("user_id", user_id).execute()
        if farmer_res.data:
            result["farmer_profile"] = farmer_res.data[0]
    elif role == "konsumen":
        consumer_res = admin_client.table("consumer_profiles").select("*").eq("user_id", user_id).execute()
        if consumer_res.data:
            result["consumer_profile"] = consumer_res.data[0]
            
    return result

@router.patch("/me/profile")
def update_profile(
    req: ProfileUpdateRequest, 
    current_user: Dict[str, Any] = Depends(get_current_user),
    token: str = Depends(get_token_header)
):
    """
    Updates the profiles table and role-specific details of the logged in user.
    """
    user_id = current_user["id"]
    role = current_user["role"]
    
    # 1. Update general profile table using user-scoped client (respects RLS)
    user_client = get_supabase_client(token)
    
    profile_updates = {}
    if req.full_name is not None:
        profile_updates["full_name"] = req.full_name
    if req.phone is not None:
        profile_updates["phone"] = req.phone
    if req.whatsapp_number is not None:
        wa = req.whatsapp_number.strip()
        if wa.startswith("+"):
            wa = wa[1:]
        elif wa.startswith("08"):
            wa = "628" + wa[2:]
        profile_updates["whatsapp_number"] = wa
    if req.avatar_url is not None:
        profile_updates["avatar_url"] = req.avatar_url
        
    if profile_updates:
        user_client.table("profiles").update(profile_updates).eq("id", user_id).execute()
        
    # 2. Update role-specific profiles
    if role == "petani" and req.farmer_data:
        farmer_updates = {}
        d = req.farmer_data
        if d.farm_name is not None:
            farmer_updates["farm_name"] = d.farm_name
        if d.farm_type is not None:
            farmer_updates["farm_type"] = d.farm_type
        if d.location is not None:
            farmer_updates["location"] = d.location
        if d.latitude is not None:
            farmer_updates["latitude"] = d.latitude
        if d.longitude is not None:
            farmer_updates["longitude"] = d.longitude
        if d.bio is not None:
            farmer_updates["bio"] = d.bio
        if d.crop_type is not None:
            farmer_updates["crop_type"] = d.crop_type
        if d.opt_in_whatsapp_alert is not None:
            farmer_updates["opt_in_whatsapp_alert"] = d.opt_in_whatsapp_alert
            
        if farmer_updates:
            user_client.table("farmer_profiles").update(farmer_updates).eq("user_id", user_id).execute()
            
    elif role == "konsumen" and req.consumer_data:
        consumer_updates = {}
        d = req.consumer_data
        if d.address is not None:
            consumer_updates["address"] = d.address
        if d.latitude is not None:
            consumer_updates["latitude"] = d.latitude
        if d.longitude is not None:
            consumer_updates["longitude"] = d.longitude
            
        if consumer_updates:
            user_client.table("consumer_profiles").update(consumer_updates).eq("user_id", user_id).execute()
            
    # Fetch final updated details
    return get_me(current_user=current_user)
