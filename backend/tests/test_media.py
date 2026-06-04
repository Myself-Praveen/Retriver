import pytest
from fastapi.testclient import TestClient
from main import app
import io

client = TestClient(app)

def get_mock_user_override():
    # Mock dependency to bypass JWT auth in tests
    from models.user import UserInDB
    return UserInDB(email="test@edu.edu", name="Test User", hashed_password="hashed")

# Override dependency
from api.dependencies import get_current_user
app.dependency_overrides[get_current_user] = get_mock_user_override

def test_upload_invalid_mime_type():
    file_content = b"fake pdf content"
    response = client.post(
        "/api/media/upload",
        files={"file": ("test.pdf", io.BytesIO(file_content), "application/pdf")}
    )
    assert response.status_code == 415
    assert "Unsupported file type" in response.json()["detail"]

def test_upload_too_large():
    # 5MB + 1 byte
    large_file = b"0" * ((5 * 1024 * 1024) + 1)
    response = client.post(
        "/api/media/upload",
        files={"file": ("large.jpg", io.BytesIO(large_file), "image/jpeg")}
    )
    assert response.status_code == 413
    assert "exceeds the 5MB limit" in response.json()["detail"]

def test_upload_success():
    # create a small valid valid image using Pillow
    from PIL import Image
    
    img = Image.new('RGB', (10, 10), color = 'red')
    img_byte_arr = io.BytesIO()
    img.save(img_byte_arr, format='JPEG')
    img_bytes = img_byte_arr.getvalue()
    
    response = client.post(
        "/api/media/upload",
        files={"file": ("test.jpg", io.BytesIO(img_bytes), "image/jpeg")}
    )
    assert response.status_code == 201
    assert "url" in response.json()
