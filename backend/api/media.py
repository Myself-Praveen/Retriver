from fastapi import APIRouter, UploadFile, File, HTTPException, status, Depends
from services.media_service import MediaService
from services.gemini_service import GeminiService
from repositories.item_repository import ItemRepository
from models.user import UserInDB
from models.item import ItemInDB
from api.dependencies import get_current_user

router = APIRouter()
item_repo = ItemRepository()

MAX_FILE_SIZE = 5 * 1024 * 1024  # 5 MB
ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"]

@router.post("/upload", status_code=status.HTTP_201_CREATED)
async def upload_media(
    file: UploadFile = File(...),
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
    
    # 3. Save to MongoDB
    db_item = ItemInDB(
        image_url=image_url,
        ai_tags=ai_tags,
        finder_email=current_user.email
    )
    created_item = await item_repo.create(db_item)
    
    return {
        "id": str(created_item.id),
        "url": image_url,
        "tags": ai_tags
    }
