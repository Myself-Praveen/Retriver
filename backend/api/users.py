from fastapi import APIRouter, Depends
from models.user import UserInDB
from api.dependencies import get_current_user
from repositories.item_repository import ItemRepository
from api.search import serialize_items

router = APIRouter()
item_repo = ItemRepository()

@router.get("/me")
async def get_my_profile(current_user: UserInDB = Depends(get_current_user)):
    """Get current user's profile and their reported items."""
    user_items = await item_repo.get_by_finder_email(current_user.email)
    
    return {
        "user": {
            "name": current_user.name,
            "email": current_user.email,
        },
        "items": serialize_items(user_items)
    }
