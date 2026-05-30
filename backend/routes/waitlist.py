import re
import logging
from fastapi import APIRouter, HTTPException, Request
from backend.models import WaitlistEntry, WaitlistResponse
from backend.models.db import waitlist_collection, waitlist_rate_collection
from datetime import datetime, timezone, timedelta

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api", tags=["waitlist"])

EMAIL_RE = re.compile(r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$")
DISPOSABLE_DOMAINS = {
    "mailinator.com", "guerrillamail.com", "10minutemail.com",
    "tempmail.com", "throwaway.email", "yopmail.com", "sharklasers.com",
    "trashmail.com", "temp-mail.org", "dispostable.com",
}
RATE_LIMIT_MAX = 3
RATE_LIMIT_WINDOW_HOURS = 1


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


async def _check_rate_limit(ip: str):
    cutoff = datetime.now(timezone.utc) - timedelta(hours=RATE_LIMIT_WINDOW_HOURS)
    count = await waitlist_rate_collection.count_documents({
        "ip": ip,
        "created_at": {"$gte": cutoff},
    })
    if count >= RATE_LIMIT_MAX:
        raise HTTPException(status_code=429, detail="Too many signups. Please try again later.")


async def _record_rate_limit(ip: str):
    await waitlist_rate_collection.insert_one({
        "ip": ip,
        "created_at": datetime.now(timezone.utc),
    })
    await waitlist_rate_collection.create_index("created_at", expireAfterSeconds=RATE_LIMIT_WINDOW_HOURS * 3600)


@router.post("/waitlist", response_model=WaitlistResponse)
async def join_waitlist(entry: WaitlistEntry, request: Request):
    email = _validate_email(entry.email)

    ip = request.headers.get("x-forwarded-for", request.client.host if request.client else "unknown")
    ip = ip.split(",")[0].strip()

    await _check_rate_limit(ip)

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
    await _record_rate_limit(ip)

    logger.info(f"New waitlist signup: {email} (position #{position})")
    return WaitlistResponse(message="You're on the list!", position=position)
