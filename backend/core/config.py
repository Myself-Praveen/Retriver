from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    PROJECT_NAME: str = "Retriever API"
    MONGO_URL: str = "mongodb://admin:password@localhost:27017"
    MONGO_DB_NAME: str = "retriever"
    SECRET_KEY: str = "super_secret_key_change_me_in_prod"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
    CLOUDINARY_URL: Optional[str] = None

    class Config:
        env_file = ".env"

settings = Settings()
