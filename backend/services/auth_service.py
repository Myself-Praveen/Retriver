import re
from fastapi import HTTPException, status
from models.user import UserCreate, UserInDB
from repositories.user_repository import UserRepository
from core.security import get_password_hash, verify_password, create_access_token

class AuthService:
    def __init__(self):
        self.user_repo = UserRepository()
        # Regex for any .edu email
        self.edu_regex = re.compile(r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.edu$")

    async def signup(self, user_in: UserCreate) -> UserInDB:
        # Validate .edu email
        if not self.edu_regex.match(user_in.email):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Only .edu email addresses are allowed to register."
            )
        
        # Check if exists
        existing_user = await self.user_repo.get_by_email(user_in.email)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered."
            )
        
        # Hash password and save
        hashed_password = get_password_hash(user_in.password)
        db_user = UserInDB(
            email=user_in.email,
            name=user_in.name,
            hashed_password=hashed_password
        )
        created_user = await self.user_repo.create(db_user)
        return created_user

    async def authenticate(self, email: str, password: str) -> dict:
        user = await self.user_repo.get_by_email(email)
        if not user or not verify_password(password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Incorrect email or password",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        access_token = create_access_token(data={"sub": user.email})
        return {"access_token": access_token, "token_type": "bearer"}
