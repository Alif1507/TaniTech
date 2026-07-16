from supabase import create_client, Client
from supabase.lib.client_options import ClientOptions
from config import settings, logger
from typing import Optional

def get_supabase_client(token: Optional[str] = None) -> Client:
    """
    Returns a user-scoped Supabase client.
    If a JWT token is provided, it configures the client to use this token,
    which ensures Row Level Security (RLS) is applied on Supabase queries.
    """
    url = settings.SUPABASE_URL
    key = settings.SUPABASE_ANON_KEY
    
    if not url or not key:
        logger.error("SUPABASE_URL or SUPABASE_ANON_KEY is missing in settings!")
        raise ValueError("Supabase configuration is missing.")
        
    if token:
        # Create client with custom Authorization header containing user JWT
        options = ClientOptions(
            headers={"Authorization": f"Bearer {token}"}
        )
        return create_client(url, key, options=options)
    else:
        return create_client(url, key)

def get_admin_client() -> Client:
    """
    Returns a service-role/admin Supabase client which bypasses RLS.
    Used for background processes, cron jobs, or initial admin setups.
    """
    url = settings.SUPABASE_URL
    # Use service role key if available, otherwise fallback to anon key with warning
    key = settings.SUPABASE_SERVICE_ROLE_KEY or settings.SUPABASE_ANON_KEY
    
    if not settings.SUPABASE_SERVICE_ROLE_KEY:
        logger.warning(
            "SUPABASE_SERVICE_ROLE_KEY is not defined! "
            "Falling back to SUPABASE_ANON_KEY which might trigger RLS blocks for admin operations."
        )
        
    if not url or not key:
        logger.error("Supabase configuration is missing for admin client!")
        raise ValueError("Supabase configuration is missing.")
        
    return create_client(url, key)
