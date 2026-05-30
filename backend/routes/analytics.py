import logging
from fastapi import APIRouter, HTTPException, Header
from backend.models.db import waitlist_collection
from backend.routes.auth import verify_token

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["analytics"])


@router.get("/analytics")
async def get_analytics(authorization: str = Header(...)):
    if not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Missing token")
    token = authorization.split(" ", 1)[1]
    verify_token(token)

    cursor = waitlist_collection.find({}).sort("created_at", 1)
    entries = []
    async for doc in cursor:
        entries.append({
            "email": doc["email"],
            "source": doc.get("source", "website"),
            "created_at": doc["created_at"].isoformat() if doc.get("created_at") else None,
        })

    return {
        "total": len(entries),
        "entries": entries,
    }
