from typing import Optional
from supabase import create_client, Client
from app.config import settings

_supabase_client: Optional[Client] = None


def get_supabase_client() -> Optional[Client]:
    """Returns a singleton Supabase client if credentials are configured."""
    global _supabase_client
    if _supabase_client is None:
        if settings.supabase_url and settings.supabase_key:
            _supabase_client = create_client(settings.supabase_url, settings.supabase_key)
    return _supabase_client
