from fastapi import APIRouter, Query, Depends
from typing import Optional
from repositories.item_repository import ItemRepository
from models.user import UserInDB
from api.dependencies import get_current_user
from core.cache import cache_get, cache_set, cache_invalidate
from bson import ObjectId
import json

router = APIRouter()
item_repo = ItemRepository()

RECENT_ITEMS_CACHE_KEY = "feed:recent_items"
CACHE_TTL = 60  # 60 seconds


def serialize_items(items: list) -> list:
    """Convert MongoDB docs to JSON-serializable dicts."""
    results = []
    for item in items:
        item["_id"] = str(item["_id"])
        if "created_at" in item:
            item["created_at"] = item["created_at"].isoformat()
        results.append(item)
    return results


@router.get("/text")
async def search_by_text(
    q: str = Query(..., min_length=1, description="Search query"),
    limit: int = Query(20, ge=1, le=100),
    current_user: UserInDB = Depends(get_current_user)
):
    """
    Full-text search across item titles and AI-generated tags.
    """
    items = await item_repo.search_text(q, limit=limit)
    return {"results": serialize_items(items), "count": len(items)}


@router.get("/nearby")
async def search_nearby(
    longitude: float = Query(..., description="Longitude of search center"),
    latitude: float = Query(..., description="Latitude of search center"),
    radius: int = Query(500, ge=50, le=5000, description="Search radius in meters"),
    limit: int = Query(20, ge=1, le=100),
    current_user: UserInDB = Depends(get_current_user)
):
    """
    Geospatial search for items found near a specific location.
    Uses MongoDB 2dsphere index for performance.
    """
    items = await item_repo.search_nearby(
        longitude=longitude,
        latitude=latitude,
        max_distance_meters=radius,
        limit=limit
    )
    return {"results": serialize_items(items), "count": len(items)}


@router.get("/feed")
async def get_recent_feed(
    limit: int = Query(50, ge=1, le=100),
):
    """
    Get the most recently reported found items.
    Cached in Redis for 60 seconds to handle high-frequency requests.
    """
    # Try cache first
    cached = await cache_get(RECENT_ITEMS_CACHE_KEY)
    if cached:
        return {"results": json.loads(cached), "source": "cache"}

    # Cache miss — query MongoDB
    items = await item_repo.get_recent(limit=limit)
    serialized = serialize_items(items)

    # Store in Redis
    await cache_set(RECENT_ITEMS_CACHE_KEY, json.dumps(serialized), ttl=CACHE_TTL)

    return {"results": serialized, "source": "db"}
