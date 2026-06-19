from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
import os
from core.database import connect_to_mongo, close_mongo_connection
from core.cache import RedisClient
from core.config import settings
from repositories.item_repository import ItemRepository
from api.auth import router as auth_router
from api.media import router as media_router
from api.search import router as search_router
from api.users import router as users_router
from api.chat import router as chat_router
from api.items import router as items_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await connect_to_mongo()
    await RedisClient.connect()

    # Create MongoDB indexes on startup
    item_repo = ItemRepository()
    await item_repo.ensure_indexes()

    yield

    # Shutdown
    await RedisClient.close()
    await close_mongo_connection()


app = FastAPI(title=settings.PROJECT_NAME, lifespan=lifespan)

# Ensure local uploads directory exists and mount it
os.makedirs("uploads", exist_ok=True)

# Custom StaticFiles to add CORS headers
class CORSStaticFiles(StaticFiles):
    def is_not_modified(self, response_headers, req_headers):
        return False
        
    async def get_response(self, path: str, scope):
        response = await super().get_response(path, scope)
        response.headers["Access-Control-Allow-Origin"] = "*"
        response.headers["Access-Control-Allow-Methods"] = "GET, OPTIONS"
        response.headers["Access-Control-Allow-Headers"] = "*"
        return response

app.mount("/uploads", CORSStaticFiles(directory="uploads"), name="uploads")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development, allow all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth_router, prefix="/api/auth", tags=["auth"])
app.include_router(users_router, prefix="/api/users", tags=["users"])
app.include_router(media_router, prefix="/api/media", tags=["media"])
app.include_router(search_router, prefix="/api/search", tags=["search"])
app.include_router(chat_router, prefix="/api/chat", tags=["chat"])
app.include_router(items_router, prefix="/api/items", tags=["items"])


@app.get("/")
async def root():
    return {"message": "Welcome to the Retriever API"}
