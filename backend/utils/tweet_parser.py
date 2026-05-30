import re


def extract_tweet_id(url: str) -> str:
    patterns = [
        r"(?:twitter\.com|x\.com)/\w+/status/(\d+)",
        r"(?:twitter\.com|x\.com)/i/status/(\d+)",
    ]
    for pattern in patterns:
        match = re.search(pattern, url)
        if match:
            return match.group(1)
    if url.strip().isdigit():
        return url.strip()
    raise ValueError(f"Could not extract tweet ID from URL: {url}")
