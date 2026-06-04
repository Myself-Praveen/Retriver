import io
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
        """Uploads image to Cloudinary and returns the secure URL."""
        file_bytes = await file.read()
        
        # Compress before upload
        compressed_bytes = MediaService.compress_image(file_bytes)
        
        if not settings.CLOUDINARY_URL:
            # Mock URL for local development if no key provided
            return "https://mock-image-url.com/placeholder.jpg"
            
        result = cloudinary.uploader.upload(
            compressed_bytes,
            folder="retriever_items"
        )
        return result.get("secure_url")
