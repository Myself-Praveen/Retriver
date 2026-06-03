from fastapi import APIRouter, Depends
from fastapi.security import OAuth2PasswordRequestForm
from models.user import UserCreate, UserResponse, Token
from services.auth_service import AuthService

router = APIRouter()
auth_service = AuthService()

@router.post("/signup", response_model=UserResponse)
async def signup(user_in: UserCreate):
    """
    Register a new user. Must use a .edu email.
    """
    user = await auth_service.signup(user_in)
    return user

@router.post("/login", response_model=Token)
async def login(form_data: OAuth2PasswordRequestForm = Depends()):
    """
    OAuth2 compatible token login, get an access token for future requests.
    """
    token = await auth_service.authenticate(form_data.username, form_data.password)
    return token
