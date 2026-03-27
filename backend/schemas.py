from pydantic import BaseModel
from datetime import datetime

class UserCreate(BaseModel):
    username: str
    password: str

class UserResponse(BaseModel):
    id: int
    username: str

    class Config:
        from_attributes = True

class DeviceApprove(BaseModel):
    username: str
    password: str
    fingerprint: str

class DeviceResponse(BaseModel):
    id: int
    fingerprint: str
    is_trusted: bool
    created_at: datetime

    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str
