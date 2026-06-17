import io
import os
import uuid
import cloudinary
import cloudinary.uploader
from PIL import Image
from fastapi import UploadFile
from core.config import settings

if settings.CLOUDINARY_URL:
    cloudinary.config(url=settings.CLOUDINARY_URL)

class MediaService:
    @staticmethod
    def compress_image(file_bytes: bytes) -> bytes:
        """Compresses image using Pillow to save bandwidth."""
        image = Image.open(io.BytesIO(file_bytes))
        if image.mode in ("RGBA", "P"):
            image = image.convert("RGB")
        
        output = io.BytesIO()
        image.save(output, format="JPEG", quality=80, optimize=True)
        return output.getvalue()

    @staticmethod
    async def upload_image(file: UploadFile) -> str:
        """Uploads image to Cloudinary or falls back to local storage."""
        file_bytes = await file.read()
        
        # Compress before upload
        compressed_bytes = MediaService.compress_image(file_bytes)
        
        if settings.CLOUDINARY_URL:
            result = cloudinary.uploader.upload(
                compressed_bytes,
                folder="retriever_items"
            )
            return result.get("secure_url")
            
        # Local storage fallback
        os.makedirs("uploads", exist_ok=True)
        filename = f"{uuid.uuid4()}.jpg"
        filepath = os.path.join("uploads", filename)
        
        with open(filepath, "wb") as f:
            f.write(compressed_bytes)
            
        return f"http://localhost:8000/uploads/{filename}"
