import logging
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from jose import jwt

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["auth"])

JWT_SECRET = "postcapture-super-secret-key-2026"
JWT_ALGORITHM = "HS256"
TOKEN_EXPIRE_HOURS = 24

ADMIN_EMAIL = "umeedsinha@gmail.com"
ADMIN_PASSWORD = "postCapture@0212"


class LoginRequest(BaseModel):
    email: str
    password: str


class LoginResponse(BaseModel):
    token: str
    expires_in: int


def create_token(email: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(hours=TOKEN_EXPIRE_HOURS)
    payload = {
        "sub": email,
        "exp": expire,
        "iat": datetime.now(timezone.utc),
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


def verify_token(token: str) -> str:
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
        email = payload.get("sub")
        if email != ADMIN_EMAIL:
            raise HTTPException(status_code=403, detail="Forbidden")
        return email
    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")


@router.post("/auth/login", response_model=LoginResponse)
async def login(req: LoginRequest):
    if req.email != ADMIN_EMAIL or req.password != ADMIN_PASSWORD:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    token = create_token(req.email)
    logger.info(f"Admin login: {req.email}")
    return LoginResponse(token=token, expires_in=TOKEN_EXPIRE_HOURS * 3600)


@router.post("/auth/verify")
async def verify(token: str):
    email = verify_token(token)
    return {"valid": True, "email": email}
