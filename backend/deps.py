from fastapi import Header, HTTPException, Depends, Security
from fastapi.security import APIKeyHeader
from typing import Optional, Dict, Any
from utils.supabase import get_supabase_client, get_admin_client
from config import settings, logger

# API Key header helper for internal cron validation
api_key_header = APIKeyHeader(name="X-Cron-Secret", auto_error=False)

def get_token_header(authorization: Optional[str] = Header(None)) -> str:
    """
    Extracts the Bearer JWT token from the Authorization header.
    """
    if not authorization:
        raise HTTPException(
            status_code=401,
            detail="Authorization header missing"
        )
    
    parts = authorization.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        raise HTTPException(
            status_code=401,
            detail="Invalid authorization header format. Expected: 'Bearer <token>'"
        )
        
    return parts[1]

async def get_current_user(token: str = Depends(get_token_header)) -> Dict[str, Any]:
    """
    Validates user session with Supabase Auth and returns the user's profile details.
    """
    client = get_supabase_client(token)
    try:
        # Fetch authenticated user info from Supabase Auth
        auth_response = client.auth.get_user(token)
        if not auth_response or not auth_response.user:
            raise HTTPException(
                status_code=401,
                detail="Invalid or expired session token"
            )
            
        user_id = auth_response.user.id
        email = auth_response.user.email
        
        # Query profile information from public.profiles table using admin client 
        # (to ensure we bypass RLS or fetch profiles correctly)
        admin_client = get_admin_client()
        profile_response = admin_client.table("profiles").select("*").eq("id", user_id).execute()
        
        if not profile_response.data or len(profile_response.data) == 0:
            # If profile does not exist in DB yet, create a default one from JWT meta data
            # (Fallback in case the DB trigger didn't fire or ran into issues)
            metadata = auth_response.user.user_metadata or {}
            role = metadata.get("role", "konsumen")
            full_name = metadata.get("full_name", "")
            phone = metadata.get("phone", "")
            whatsapp_number = metadata.get("whatsapp_number", "")
            avatar_url = metadata.get("avatar_url", "")
            
            try:
                new_profile = {
                    "id": user_id,
                    "email": email,
                    "full_name": full_name,
                    "phone": phone,
                    "whatsapp_number": whatsapp_number,
                    "role": role,
                    "avatar_url": avatar_url
                }
                admin_client.table("profiles").insert(new_profile).execute()
                
                # Insert sub-profiles
                if role == "petani":
                    admin_client.table("farmer_profiles").insert({"user_id": user_id}).execute()
                elif role == "konsumen":
                    admin_client.table("consumer_profiles").insert({"user_id": user_id}).execute()
                    
                return new_profile
            except Exception as insert_err:
                logger.error(f"Failed to auto-create fallback profile: {insert_err}")
                raise HTTPException(
                    status_code=500,
                    detail="User profile not initialized."
                )
        
        return profile_response.data[0]
        
    except Exception as e:
        logger.error(f"Authentication error: {e}")
        if isinstance(e, HTTPException):
            raise e
        raise HTTPException(
            status_code=401,
            detail="Could not validate credentials"
        )

def verify_cron_secret(x_cron_secret: Optional[str] = Security(api_key_header)) -> bool:
    """
    Validates internal service API key to protect cron-triggered endpoints.
    """
    if not x_cron_secret or x_cron_secret != settings.INTERNAL_CRON_SECRET:
        raise HTTPException(
            status_code=403,
            detail="Invalid or missing X-Cron-Secret header"
        )
    return True
