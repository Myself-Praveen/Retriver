from core.database import get_db
from models.item import ItemInDB

class ItemRepository:
    def get_collection(self):
        return get_db()["items"]

    async def create(self, item: ItemInDB) -> ItemInDB:
        item_dict = item.dict(by_alias=True)
        await self.get_collection().insert_one(item_dict)
        return item
