from pydantic import BaseModel, EmailStr
from typing import Optional


class WaitlistEntry(BaseModel):
    email: str
    source: str = "website"


class WaitlistResponse(BaseModel):
    message: str
    position: Optional[int] = None


class TweetUser(BaseModel):
    id: str
    name: str
    screen_name: str
    avatar_url: str
    verified: bool = False
    verified_type: str = "none"
    profile_image_shape: str = "Circle"


class TweetMedia(BaseModel):
    type: str
    url: str
    preview_url: Optional[str] = None
    width: Optional[int] = None
    height: Optional[int] = None
    video_urls: list[dict] = []


class Tweet(BaseModel):
    id: str
    text: str
    created_at: str
    user: TweetUser
    likes: int = 0
    retweets: int = 0
    replies: int = 0
    views: Optional[int] = None
    media: list[TweetMedia] = []
    quoted_tweet: Optional["Tweet"] = None
    is_reply: bool = False
    reply_to: Optional[str] = None


class TweetFetchRequest(BaseModel):
    url: str


class CaptureOptions(BaseModel):
    theme: str = "light"
    show_metrics: bool = True
    show_avatar: bool = True
    show_date: bool = True
    show_verified: bool = True
    scale: float = 2.0
