import google.generativeai as genai
import json
from core.config import settings

if settings.GEMINI_API_KEY:
    genai.configure(api_key=settings.GEMINI_API_KEY)

class GeminiService:
    @staticmethod
    async def analyze_image(image_bytes: bytes) -> dict:
        """Analyzes an image to extract structured JSON metadata."""
        if not settings.GEMINI_API_KEY:
            # Mock response for local dev without key
            return {"brand": "MockBrand", "color": "Black", "category": "Electronics", "description": "A mocked electronic device."}
            
        model = genai.GenerativeModel("gemini-2.5-flash")
        prompt = (
            "Analyze this image of a lost item. Extract the following information and return ONLY a valid JSON object. "
            "Do not include markdown formatting blocks like ```json. "
            "Schema: {\"brand\": \"str\", \"color\": \"str\", \"category\": \"str\", \"description\": \"str\"}. "
            "If a field is unknown, use 'Unknown'."
        )
        
        try:
            response = await model.generate_content_async(
                contents=[prompt, {"mime_type": "image/jpeg", "data": image_bytes}]
            )
            text = response.text.strip().removeprefix('```json').removesuffix('```').strip()
            return json.loads(text)
        except Exception as e:
            return {"brand": "Unknown", "color": "Unknown", "category": "Unknown", "description": f"AI Parsing failed: {str(e)}"}
