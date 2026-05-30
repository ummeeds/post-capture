from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import StreamingResponse
from backend.models import TweetFetchRequest, Tweet
from backend.utils.tweet_parser import extract_tweet_id
from backend.services.twitter_api import fetch_tweet, TwitterAPIError, ENDPOINTS
from backend.config import RAPIDAPI_HOST, TWITTER_API_RAPID
from backend.models.db import tweets_collection
from datetime import datetime
from urllib.parse import unquote
import httpx

router = APIRouter(prefix="/api", tags=["tweets"])


@router.get("/debug/endpoints")
async def debug_endpoints(tweet_id: str = Query(..., description="Tweet ID to test")):
    headers = {
        "x-rapidapi-host": RAPIDAPI_HOST,
        "x-rapidapi-key": TWITTER_API_RAPID,
    }
    results = {}
    for endpoint, param_name in ENDPOINTS:
        param_key = next(iter(param_name)) if isinstance(param_name, set) else param_name
        url = f"https://{RAPIDAPI_HOST}/{endpoint}"
        try:
            async with httpx.AsyncClient(timeout=10.0) as client:
                resp = await client.get(url, headers=headers, params={param_key: tweet_id})
                results[endpoint] = {
                    "status": resp.status_code,
                    "body_preview": resp.text[:500],
                }
        except Exception as e:
            results[endpoint] = {"error": str(e)}
    return {"host": RAPIDAPI_HOST, "tweet_id": tweet_id, "endpoints": results}


@router.get("/debug/raw")
async def debug_raw(tweet_id: str = Query(..., description="Tweet ID to test")):
    headers = {
        "x-rapidapi-host": RAPIDAPI_HOST,
        "x-rapidapi-key": TWITTER_API_RAPID,
    }
    url = f"https://{RAPIDAPI_HOST}/TweetDetail"
    async with httpx.AsyncClient(timeout=10.0) as client:
        resp = await client.get(url, headers=headers, params={"tweet_id": tweet_id})
        return {"status": resp.status_code, "body": resp.text[:2000]}


@router.post("/tweet", response_model=Tweet)
async def get_tweet(request: TweetFetchRequest):
    try:
        tweet_id = extract_tweet_id(request.url)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

    try:
        tweet = await fetch_tweet(tweet_id)
    except TwitterAPIError as e:
        raise HTTPException(status_code=502, detail=str(e))

    if not tweet.id or not tweet.text:
        raise HTTPException(
            status_code=404,
            detail="Could not find tweet data. Verify the URL is correct and the tweet is public.",
        )

    try:
        await tweets_collection.update_one(
            {"id": tweet.id},
            {"$set": {**tweet.model_dump(), "fetched_at": datetime.utcnow()}},
            upsert=True,
        )
    except Exception:
        pass

    return tweet


@router.get("/tweet/{tweet_id}", response_model=Tweet)
async def get_tweet_by_id(tweet_id: str):
    cached = await tweets_collection.find_one({"id": tweet_id})
    if cached:
        cached.pop("_id", None)
        cached.pop("fetched_at", None)
        return Tweet(**cached)

    try:
        tweet = await fetch_tweet(tweet_id)
    except TwitterAPIError as e:
        raise HTTPException(status_code=502, detail=str(e))

    try:
        await tweets_collection.insert_one(
            {**tweet.model_dump(), "fetched_at": datetime.utcnow()}
        )
    except Exception:
        pass

    return tweet


@router.get("/proxy/video")
async def proxy_video(url: str = Query(..., description="Video URL to proxy")):
    decoded = unquote(url)

    # Validate host
    try:
        parsed = httpx.URL(decoded)
        host = parsed.host or ""
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid URL")

    if "twimg.com" not in host and "twitter.com" not in host:
        raise HTTPException(status_code=400, detail="Only Twitter video URLs allowed")

    async def stream():
        async with httpx.AsyncClient(timeout=30.0, follow_redirects=True) as client:
            async with client.stream(
                "GET",
                decoded,
                headers={
                    "Referer": "https://x.com/",
                    "Origin": "https://x.com",
                    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
                },
            ) as resp:
                if resp.status_code != 200:
                    return
                async for chunk in resp.aiter_bytes(chunk_size=65536):
                    yield chunk

    return StreamingResponse(
        stream(),
        media_type="video/mp4",
        headers={
            "Cache-Control": "public, max-age=3600",
            "Accept-Ranges": "bytes",
            "Access-Control-Allow-Origin": "*",
        },
    )
