import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    DATABASE_URL: str = os.getenv(
        "DATABASE_URL", 
        "postgresql://postgres:root@localhost:5432/stocksense?schema=public"
    )
    SAFETY_STOCK_PERCENTAGE: float = 0.15  # Default 15% safety stock
    PORT: int = 8000

    class Config:
        env_file = "../backend/.env"
        env_file_encoding = "utf-8"
        extra = "ignore"

settings = Settings()
