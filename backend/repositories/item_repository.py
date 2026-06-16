from typing import List, Optional
from core.database import get_db
from models.item import ItemInDB


class ItemRepository:
    def get_collection(self):
        return get_db()["items"]

    async def create(self, item: ItemInDB) -> ItemInDB:
        item_dict = item.dict(by_alias=True)
        await self.get_collection().insert_one(item_dict)
        return item

    async def ensure_indexes(self):
        """Create compound text index and 2dsphere geospatial index."""
        collection = self.get_collection()
        # Text index on AI tags and title for full-text search
        await collection.create_index(
            [
                ("title", "text"),
                ("description", "text"),
                ("ai_tags.brand", "text"),
                ("ai_tags.color", "text"),
                ("ai_tags.category", "text"),
                ("ai_tags.description", "text"),
            ],
            name="item_text_search_index"
        )
        # Geospatial index for nearby queries
        await collection.create_index(
            [("location", "2dsphere")],
            name="item_geo_index"
        )
        # Index on created_at for efficient recent-items feed
        await collection.create_index(
            [("created_at", -1)],
            name="item_recency_index"
        )

    async def search_text(self, query: str, limit: int = 20) -> List[dict]:
        """Full-text search across AI tags and title."""
        cursor = self.get_collection().find(
            {"$text": {"$search": query}},
            {"score": {"$meta": "textScore"}}
        ).sort([("score", {"$meta": "textScore"})]).limit(limit)
        return await cursor.to_list(length=limit)

    async def search_nearby(
        self, longitude: float, latitude: float,
        max_distance_meters: int = 500, limit: int = 20
    ) -> List[dict]:
        """Find items within a radius using 2dsphere index."""
        cursor = self.get_collection().find({
            "location": {
                "$near": {
                    "$geometry": {
                        "type": "Point",
                        "coordinates": [longitude, latitude]
                    },
                    "$maxDistance": max_distance_meters
                }
            }
        }).limit(limit)
        return await cursor.to_list(length=limit)

    async def get_recent(self, limit: int = 50) -> List[dict]:
        """Get the most recently reported items."""
        cursor = self.get_collection().find().sort(
            "created_at", -1
        ).limit(limit)
        return await cursor.to_list(length=limit)

    async def get_by_finder_email(self, email: str, limit: int = 50) -> List[dict]:
        """Get items reported by a specific user email."""
        cursor = self.get_collection().find({"finder_email": email}).sort(
            "created_at", -1
        ).limit(limit)
        return await cursor.to_list(length=limit)
