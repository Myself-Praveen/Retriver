from fastapi import APIRouter, UploadFile, File, HTTPException, status, Depends
from services.media_service import MediaService
from models.user import UserInDB
from api.dependencies import get_current_user

router = APIRouter()
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
    """
    if file.content_type not in ALLOWED_MIME_TYPES:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="Unsupported file type. Only JPEG, PNG, and WEBP are allowed."
        )
    
    # Read file size (spooling)
    file_bytes = await file.read()
    if len(file_bytes) > MAX_FILE_SIZE:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="File size exceeds the 5MB limit."
        )
    
    # Reset file cursor for the service layer
    await file.seek(0)
    
    url = await MediaService.upload_image(file)
    return {"url": url}
