import os
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional
import logging

# Configure basic logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("tanitech_backend")

class Settings(BaseSettings):
    SUPABASE_URL: str
    SUPABASE_ANON_KEY: str
    SUPABASE_SERVICE_ROLE_KEY: Optional[str] = None
    
    GROQ_API_KEY: Optional[str] = None
    GROQ_DEFAULT_MODEL: str = "openai/gpt-oss-20b"
    GROQ_REASONING_MODEL: str = "qwen/qwen3.6-27b"
    
    INTERNAL_CRON_SECRET: str = "super_secret_cron_key"

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

# Instantiate settings
try:
    settings = Settings()
except Exception as e:
    logger.warning(f"Error loading settings from .env file: {e}. Falling back to default/manual configuration.")
    # Fallback default values for development if environment variables are not fully set
    settings = Settings(
        SUPABASE_URL=os.getenv("SUPABASE_URL", "https://cdmgrxwbobiyorddcmes.supabase.co"),
        SUPABASE_ANON_KEY=os.getenv("SUPABASE_ANON_KEY", ""),
        SUPABASE_SERVICE_ROLE_KEY=os.getenv("SUPABASE_SERVICE_ROLE_KEY"),
        GROQ_API_KEY=os.getenv("GROQ_API_KEY"),
        GROQ_DEFAULT_MODEL=os.getenv("GROQ_DEFAULT_MODEL", "openai/gpt-oss-20b"),
        GROQ_REASONING_MODEL=os.getenv("GROQ_REASONING_MODEL", "qwen/qwen3.6-27b"),
        INTERNAL_CRON_SECRET=os.getenv("INTERNAL_CRON_SECRET", "super_secret_cron_key")
    )
