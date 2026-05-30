import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.routes.tweet import router as tweet_router
from backend.routes.waitlist import router as waitlist_router

logging.basicConfig(level=logging.INFO)

app = FastAPI(title="PostCapture API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3006",
        "http://127.0.0.1:3006",
        "https://postcapture.co",
        "https://www.postcapture.co",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(tweet_router)
app.include_router(waitlist_router)


@app.get("/health")
async def health():
    return {"status": "ok"}
