import os
from dotenv import load_dotenv

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), "..", ".env"))

MONGODB_URI = os.getenv("MONGODB_URI", "").replace("MONGO_URI=", "")
DB_NAME = os.getenv("DB_NAME", "postcapture")
TWITTER_API_RAPID = os.getenv("TWITTER_API_RAPID", "")
RAPIDAPI_HOST = os.getenv("RAPIDAPI_HOST", "twitter283.p.rapidapi.com")
TWEET_ENDPOINT = os.getenv("TWEET_ENDPOINT", "tweet")
