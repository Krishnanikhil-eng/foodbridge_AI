from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    app_name: str = "FoodBridge AI Backend"
    environment: str = "development"
    frontend_url: str = "http://localhost:3000"

    supabase_url: str = ""
    supabase_key: str = ""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )


settings = Settings()
