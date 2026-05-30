const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:8000";

import type { Tweet } from "./types";

export async function fetchTweet(url: string): Promise<Tweet> {
  const res = await fetch(`${BACKEND_URL}/api/tweet`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ url }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Failed to fetch tweet" }));
    throw new Error(err.detail || "Failed to fetch tweet");
  }
  return res.json();
}

export async function fetchTweetById(tweetId: string): Promise<Tweet> {
  const res = await fetch(`${BACKEND_URL}/api/tweet/${tweetId}`);
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Failed to fetch tweet" }));
    throw new Error(err.detail || "Failed to fetch tweet");
  }
  return res.json();
}
