from fastapi import APIRouter, UploadFile, File, Form, HTTPException, status, Depends
from typing import Optional
from services.media_service import MediaService
from services.gemini_service import GeminiService
from repositories.item_repository import ItemRepository
from models.user import UserInDB
from models.item import ItemInDB, Location
from api.dependencies import get_current_user
from core.cache import cache_invalidate

router = APIRouter()
item_repo = ItemRepository()

MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB
ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"]
RECENT_ITEMS_CACHE_KEY = "feed:recent_items"


@router.post("/upload", status_code=status.HTTP_201_CREATED)
async def upload_media(
    file: UploadFile = File(...),
    title: str = Form(...),
    description: Optional[str] = Form(None),
    location_name: Optional[str] = Form(None),
    longitude: Optional[float] = Form(None),
    latitude: Optional[float] = Form(None),
    item_type: str = Form("found"),
    current_user: UserInDB = Depends(get_current_user)
):
    """
    Upload an image for a lost/found item.
    Enforces MIME type and 5MB size limit.
    Automatically tags the image with Gemini AI and saves it to MongoDB.
    """
    if file.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="Unsupported file type. Only JPEG, PNG, and WEBP are allowed."
        )

    file_bytes = await file.read()
    if len(file_bytes) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="File size exceeds the 5MB limit."
        )

    # 1. AI Vision Tagging
    ai_tags = await GeminiService.analyze_image(file_bytes)

    # 2. Cloud Upload
    await file.seek(0)
    image_url = await MediaService.upload_image(file)

    # 3. Build GeoJSON location if coordinates provided
    location = None
    if longitude is not None and latitude is not None:
        location = Location(coordinates=[longitude, latitude])

    # 4. Save to MongoDB
    db_item = ItemInDB(
        title=title,
        description=description,
        image_url=image_url,
        ai_tags=ai_tags,
        finder_email=current_user.email,
        item_type=item_type,
        location_name=location_name,
        location=location,
    )
    created_item = await item_repo.create(db_item)

    # 5. Invalidate the cached feed so it reflects the new item
    await cache_invalidate(RECENT_ITEMS_CACHE_KEY)

    return {
        "id": str(created_item.id),
        "url": image_url,
        "tags": ai_tags,
        "title": title
    }
