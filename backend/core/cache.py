import redis.asyncio as redis
from typing import Optional
from core.config import settings


class RedisClient:
    _client: Optional[redis.Redis] = None

    @classmethod
    async def connect(cls):
        """Initialize the async Redis connection pool."""
        redis_url = getattr(settings, "REDIS_URL", "redis://localhost:6379/0")
        cls._client = redis.from_url(
            redis_url,
            encoding="utf-8",
            decode_responses=True
        )
        # Verify connection
        try:
            await cls._client.ping()
            print("Connected to Redis")
        except Exception as e:
            print(f"Redis connection failed (non-fatal): {e}")
            cls._client = None

    @classmethod
    async def close(cls):
        """Gracefully close the Redis connection."""
        if cls._client:
            await cls._client.close()
            print("Closed Redis connection")

    @classmethod
    def get_client(cls) -> Optional[redis.Redis]:
        return cls._client


async def cache_get(key: str) -> Optional[str]:
    """Get a value from Redis. Returns None if Redis is unavailable."""
    client = RedisClient.get_client()
    if not client:
        return None
    try:
        return await client.get(key)
    except Exception:
        return None


async def cache_set(key: str, value: str, ttl: int = 60) -> bool:
    """Set a value in Redis with a TTL. Fails silently if Redis is down."""
    client = RedisClient.get_client()
    if not client:
        return False
    try:
        await client.set(key, value, ex=ttl)
        return True
    except Exception:
        return False


async def cache_invalidate(key: str) -> bool:
    """Delete a key from Redis. Used when new items are added."""
    client = RedisClient.get_client()
    if not client:
        return False
    try:
        await client.delete(key)
        return True
    except Exception:
        return False
