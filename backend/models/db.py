from motor.motor_asyncio import AsyncIOMotorClient
from backend.config import MONGODB_URI, DB_NAME

client = AsyncIOMotorClient(MONGODB_URI)
db = client[DB_NAME]
tweets_collection = db["tweets"]
captures_collection = db["captures"]
waitlist_collection = db["waitlist"]
waitlist_rate_collection = db["waitlist_rate"]
