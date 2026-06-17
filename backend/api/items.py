from fastapi import APIRouter, Depends, HTTPException, status
from bson import ObjectId
from repositories.item_repository import ItemRepository
from models.user import UserInDB
from api.dependencies import get_current_user
from core.cache import cache_invalidate

router = APIRouter()
item_repo = ItemRepository()

@router.patch("/{item_id}/resolve")
async def resolve_item(item_id: str, current_user: UserInDB = Depends(get_current_user)):
    """Mark an item as resolved/found by the original poster."""
    query = {"_id": item_id}
    if ObjectId.is_valid(item_id):
        query = {"$or": [{"_id": ObjectId(item_id)}, {"_id": item_id}]}
        
    collection = item_repo.get_collection()
    item = await collection.find_one(query)
    
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
        
    if item.get("finder_email") != current_user.email:
        raise HTTPException(status_code=403, detail="Not authorized to modify this item")
        
    result = await collection.update_one(
        query,
        {"$set": {"status": "resolved"}}
    )
    
    if result.modified_count == 0:
        if item.get("status") == "resolved":
            return {"message": "Item is already resolved"}
        raise HTTPException(status_code=500, detail="Failed to update item")
        
    # Invalidate feed cache so the UI updates globally
    await cache_invalidate("feed:recent_items")
    
    return {"message": "Item marked as resolved"}
