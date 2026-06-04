from fastapi import FastAPI
from contextlib import asynccontextmanager
from core.database import connect_to_mongo, close_mongo_connection
from core.config import settings
from api.auth import router as auth_router
from api.media import router as media_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await connect_to_mongo()
    yield
    # Shutdown
    await close_mongo_connection()

app = FastAPI(title=settings.PROJECT_NAME, lifespan=lifespan)

# Include routers
app.include_router(auth_router, prefix="/api/auth", tags=["auth"])
app.include_router(media_router, prefix="/api/media", tags=["media"])

@app.get("/")
async def root():
    return {"message": "Welcome to the Retriever API"}
