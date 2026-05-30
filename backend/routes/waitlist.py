import re
import logging
from fastapi import APIRouter, HTTPException
from backend.models import WaitlistEntry, WaitlistResponse
from backend.models.db import waitlist_collection
from datetime import datetime, timezone

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["waitlist"])

EMAIL_RE = re.compile(r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$")
DISPOSABLE_DOMAINS = {
    "mailinator.com", "guerrillamail.com", "10minutemail.com",
    "tempmail.com", "throwaway.email", "yopmail.com", "sharklasers.com",
    "trashmail.com", "temp-mail.org", "dispostable.com",
}


def _validate_email(email: str) -> str:
    email = email.strip().lower()
    if not email or len(email) > 254:
        raise HTTPException(status_code=400, detail="Invalid email address")

    if not EMAIL_RE.match(email):
        raise HTTPException(status_code=400, detail="Invalid email format")

    domain = email.split("@")[1]
    if domain in DISPOSABLE_DOMAINS:
        raise HTTPException(status_code=400, detail="Disposable emails are not allowed")

    return email


@router.post("/waitlist", response_model=WaitlistResponse)
async def join_waitlist(entry: WaitlistEntry):
    email = _validate_email(entry.email)

    existing = await waitlist_collection.find_one({"email": email})
    if existing:
        return WaitlistResponse(message="You're already on the list!", position=None)

    count = await waitlist_collection.count_documents({})
    position = count + 1

    await waitlist_collection.insert_one({
        "email": email,
        "source": entry.source or "website",
        "created_at": datetime.now(timezone.utc),
    })

    logger.info(f"New waitlist signup: {email} (position #{position})")
    return WaitlistResponse(message="You're on the list!", position=position)
