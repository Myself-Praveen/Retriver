from core.database import get_db
from models.user import UserInDB

class UserRepository:
    def get_collection(self):
        return get_db()["users"]

    async def get_by_email(self, email: str) -> UserInDB | None:
        user_dict = await self.get_collection().find_one({"email": email})
        if user_dict:
            return UserInDB(**user_dict)
        return None

    async def create(self, user: UserInDB) -> UserInDB:
        user_dict = user.dict(by_alias=True)
        await self.get_collection().insert_one(user_dict)
        return user
