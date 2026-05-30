import httpx
import json
import logging
from backend.config import TWITTER_API_RAPID, RAPIDAPI_HOST, TWEET_ENDPOINT
from backend.models import Tweet

logger = logging.getLogger(__name__)


class TwitterAPIError(Exception):
    pass


ENDPOINTS = [
    ("TweetDetail", {"tweet_id"}),
    ("tweet", {"pid"}),
    ("tweet/detail", {"tweet_id"}),
    ("tweet/get", {"pid"}),
]


async def fetch_tweet(tweet_id: str) -> Tweet:
    headers = {
        "x-rapidapi-host": RAPIDAPI_HOST,
        "x-rapidapi-key": TWITTER_API_RAPID,
    }

    last_error = None
    for endpoint, param_name in ENDPOINTS:
        url = f"https://{RAPIDAPI_HOST}/{endpoint}"
        if isinstance(param_name, set):
            param_key = next(iter(param_name))
        else:
            param_key = param_name

        try:
            async with httpx.AsyncClient(timeout=15.0) as client:
                response = await client.get(url, headers=headers, params={param_key: tweet_id})

                if response.status_code == 200:
                    data = response.json()
                    tweet = _parse_tweet_response(data)
                    if tweet.id:
                        logger.info(f"Successfully fetched tweet {tweet_id} via {endpoint}")
                        return tweet
                    continue

                logger.warning(f"Endpoint {endpoint} returned {response.status_code}")
        except Exception as e:
            logger.warning(f"Endpoint {endpoint} failed: {e}")
            last_error = e
            continue

    raise TwitterAPIError(
        f"Could not fetch tweet {tweet_id}. Last error: {last_error}"
    )


def _parse_tweet_response(data: dict) -> Tweet:
    # RapidAPI wraps in: {"data": {"tweet_result": {"result": {...}}}}
    tweet_data = (
        data.get("data", {}).get("tweet_result", {}).get("result", {})
        or data.get("tweet", {})
        or data
    )

    if isinstance(tweet_data, list) and len(tweet_data) > 0:
        tweet_data = tweet_data[0]

    if not isinstance(tweet_data, dict):
        return _empty_tweet()

    logger.info(f"Tweet data top-level keys: {list(tweet_data.keys())}")

    # Legacy tweet data (text, metrics, date)
    legacy = tweet_data.get("legacy", {}) or tweet_data.get("tweet", {}).get("legacy", {})

    # ---- User extraction: try multiple paths ----
    # Path 1: core.user_result.result.legacy (TweetDetail endpoint)
    core = tweet_data.get("core", {})
    user_wrapper = core.get("user_result", core.get("user_results", {}))
    user_inner = user_wrapper.get("result", {})
    user_legacy = user_inner.get("legacy", {})

    if user_legacy.get("name"):
        user_name = user_legacy.get("name", "")
        user_screen = user_legacy.get("screen_name", "")
        user_avatar = user_legacy.get("profile_image_url_https", "")
        blue = user_inner.get("is_blue_verified", False)
        vtype = user_inner.get("verified_type", "") or user_inner.get("verification_type", "")
        biz = user_inner.get("business_account", {}) or {}
        prof = user_inner.get("professional", {}) or {}
        gold = vtype.lower() == "business" or (isinstance(biz, dict) and len(biz) > 0) or prof.get("professional_type") == "Business"
        gov = vtype.lower() == "government"
        legacy_v = user_legacy.get("verified", False)
        user_verified = blue or gold or gov or legacy_v
        verified_type = "gold" if gold else ("government" if gov else ("blue" if blue else ("legacy" if legacy_v else "none")))
        shape = user_inner.get("profile_image_shape", "Circle")
        user_id_str = str(user_inner.get("rest_id", ""))
        logger.info(f"User from core.user_result.result.legacy: name={user_name}, screen={user_screen}, vtype={verified_type}, shape={shape}")
    else:
        # Path 2: author field
        author = tweet_data.get("author", {}) or tweet_data.get("user", {})
        if author.get("name"):
            user_name = author.get("name", "")
            user_screen = author.get("screen_name", "")
            user_avatar = author.get("profile_image_url_https", "") or author.get("avatar", "")
            user_verified = author.get("verified", False)
            user_id_str = str(author.get("rest_id", "") or author.get("id", ""))
            verified_type = "none"
            shape = "Circle"
            logger.info(f"User from author: name={user_name}, screen={user_screen}")
        else:
            logger.warning(
                f"Could not find user data. "
                f"core.user_result keys: {list(user_wrapper.keys()) if user_wrapper else 'N/A'}, "
                f"user_inner keys: {list(user_inner.keys())[:10] if user_inner else 'N/A'}, "
                f"user_legacy name: {user_legacy.get('name', 'MISSING')}"
            )
            user_name = ""
            user_screen = ""
            user_avatar = ""
            user_verified = False
            user_id_str = ""
            verified_type = "none"
            shape = "Circle"

    # ---- Media ----
    media_list = []
    extended_entities = legacy.get("extended_entities", {}) or tweet_data.get("extended_entities", {})
    for m in extended_entities.get("media", []):
        media_type = m.get("type", "photo")
        video_urls = []
        if media_type in ("video", "animated_gif"):
            for v in m.get("video_info", {}).get("variants", []):
                ct = v.get("content_type", "")
                if "mpeg" in ct or "x-mpegURL" in ct:
                    continue
                if v.get("url"):
                    video_urls.append({
                        "bitrate": v.get("bitrate", 0),
                        "content_type": ct,
                        "url": v["url"],
                    })
            video_urls.sort(key=lambda x: x.get("bitrate", 0), reverse=True)

        media_list.append({
            "type": media_type,
            "url": m.get("media_url_https", m.get("media_url", "")),
            "preview_url": m.get("media_url_https", m.get("media_url", "")),
            "width": (m.get("original_info", {}) or {}).get("width") or m.get("sizes", {}).get("large", {}).get("w"),
            "height": (m.get("original_info", {}) or {}).get("height") or m.get("sizes", {}).get("large", {}).get("h"),
            "video_urls": video_urls,
        })

    # ---- Views ----
    views_data = tweet_data.get("views", {})
    if not isinstance(views_data, dict):
        views_data = {}

    logger.info(
        f"Parsed: id={tweet_data.get('rest_id', '')}, "
        f"name={user_name[:30]}, screen=@{user_screen}, "
        f"text={legacy.get('full_text', '')[:50]}"
    )

    return Tweet(
        id=tweet_data.get("rest_id", ""),
        text=legacy.get("full_text", "") or tweet_data.get("text", ""),
        created_at=legacy.get("created_at", "") or tweet_data.get("created_at", ""),
        user={
            "id": user_id_str,
            "name": user_name,
            "screen_name": user_screen,
            "avatar_url": user_avatar.replace("_normal", "_200x200") if user_avatar else "",
            "verified": user_verified,
            "verified_type": verified_type,
            "profile_image_shape": shape,
        },
        likes=legacy.get("favorite_count", 0) or tweet_data.get("favorite_count", 0),
        retweets=legacy.get("retweet_count", 0) or tweet_data.get("retweet_count", 0),
        replies=legacy.get("reply_count", 0) or tweet_data.get("reply_count", 0),
        views=views_data.get("count"),
        media=media_list,
    )


def _empty_tweet() -> Tweet:
    return Tweet(
        id="", text="", created_at="",
        user={"id": "", "name": "", "screen_name": "", "avatar_url": "", "verified": False, "verified_type": "none", "profile_image_shape": "Circle"},
        likes=0, retweets=0, replies=0, views=None, media=[],
    )
