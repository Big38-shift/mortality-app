from pydantic_settings import BaseSettings, SettingsConfigDict
from functools import lru_cache

class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",           # Let Pydantic load the .env file
        env_file_encoding="utf-8",
        extra="ignore"
    )
    
    APP_NAME: str = "Mortality Risk Prediction API"
    APP_VERSION: str = "1.0.0"
    DEBUG: bool = True
    DATABASE_URL: str | None = None
    SECRET_KEY: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60
    ALLOWED_ORIGINS: str = "http://localhost:3000"

    @property
    def origins_list(self) -> list[str]:
        return [o.strip() for o in self.ALLOWED_ORIGINS.split(",")]


@lru_cache()
def get_settings() -> Settings:
    return Settings()


from dotenv import load_dotenv, find_dotenv
import os

dotenv_path = find_dotenv(".env")
print(f"Looking for .env at: {dotenv_path}")
print(f"File exists: {os.path.exists(dotenv_path)}")
load_dotenv(dotenv_path)
print(f"DATABASE_URL from os.environ: {os.environ.get('DATABASE_URL')}")