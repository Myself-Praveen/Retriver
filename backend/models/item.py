from pydantic import BaseModel, Field
from typing import Optional, Dict
from models.user import PyObjectId
from bson import ObjectId

class ItemBase(BaseModel):
    image_url: str
    ai_tags: Dict[str, str]
    finder_email: str

class ItemInDB(ItemBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}
