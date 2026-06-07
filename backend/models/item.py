from pydantic import BaseModel, Field
from typing import Optional, Dict, List
from models.user import PyObjectId
from bson import ObjectId
from datetime import datetime


class Location(BaseModel):
    """GeoJSON Point format for MongoDB 2dsphere indexing."""
    type: str = "Point"
    coordinates: List[float]  # [longitude, latitude]


class ItemCreate(BaseModel):
    """Schema for creating a new item (user input)."""
    title: str
    description: Optional[str] = None
    location_name: Optional[str] = None  # e.g. "Library, 2nd Floor"
    longitude: Optional[float] = None
    latitude: Optional[float] = None
    item_type: str = "found"  # "found" or "lost"


class ItemBase(BaseModel):
    """Full item document stored in MongoDB."""
    title: str
    description: Optional[str] = None
    image_url: str
    ai_tags: Dict[str, str]
    finder_email: str
    item_type: str = "found"
    location_name: Optional[str] = None
    location: Optional[Location] = None
    status: str = "open"  # open | claimed | resolved
    created_at: datetime = Field(default_factory=datetime.utcnow)


class ItemInDB(ItemBase):
    id: PyObjectId = Field(default_factory=PyObjectId, alias="_id")

    class Config:
        populate_by_name = True
        arbitrary_types_allowed = True
        json_encoders = {ObjectId: str}


class ItemResponse(BaseModel):
    """Clean response model sent to the frontend."""
    id: str
    title: str
    description: Optional[str] = None
    image_url: str
    ai_tags: Dict[str, str]
    finder_email: str
    item_type: str
    location_name: Optional[str] = None
    status: str
    created_at: datetime
