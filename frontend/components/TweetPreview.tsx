"use client";

import { forwardRef } from "react";
import type { Tweet, CaptureOptions } from "@/lib/types";

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

function formatDate(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return dateStr;
  }
}

function formatTime(dateStr: string): string {
  try {
    const d = new Date(dateStr);
    return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
  } catch {
    return "";
  }
}

interface TweetPreviewProps {
  tweet: Tweet;
  options: CaptureOptions;
  noCard?: boolean;
}

const ASPECT_STYLES: Record<string, React.CSSProperties> = {
  auto: { aspectRatio: "auto" },
  "1:1": { aspectRatio: "1 / 1", maxWidth: "600px" },
  "4:5": { aspectRatio: "4 / 5", maxWidth: "480px" },
  "3:4": { aspectRatio: "3 / 4", maxWidth: "450px" },
  "9:16": { aspectRatio: "9 / 16", maxWidth: "340px" },
};

const TweetPreview = forwardRef<HTMLDivElement, TweetPreviewProps>(function TweetPreview({ tweet, options, noCard }, ref) {
  const isDark = options.theme === "dark";
  const bg = isDark ? "#000000" : "#ffffff";
  const text = isDark ? "#e7e9ea" : "#0f1419";
  const secondary = isDark ? "#71767b" : "#536471";
  const border = isDark ? "#2f3336" : "#eff3f4";

  const linkifiedText = tweet.text.replace(
    /(https?:\/\/\S+)|(@\w+)|(#\w+)/g,
    (match) => `<span style="color:#1d9bf0">${match}</span>`
  );

  const aspectStyle = ASPECT_STYLES[options.aspect_ratio] || {};
  const isFixedLayout = options.aspect_ratio !== "auto";

  return (
    <div
      ref={ref}
      style={{
        background: noCard ? "transparent" : bg,
        color: text,
        border: noCard ? "none" : `1px solid ${border}`,
        borderRadius: noCard ? "0" : "16px",
        padding: "40px 32px",
        width: isFixedLayout ? (aspectStyle.maxWidth || "100%") : "100%",
        maxWidth: isFixedLayout ? undefined : "100%",
        aspectRatio: isFixedLayout ? (aspectStyle.aspectRatio as string) : "auto",
        flexShrink: 0,
      }}
    >
      <div
        style={{
          maxWidth: `${options.width}px`,
          transform: `scale(${options.scale})`,
          transformOrigin: "center center",
          margin: "0 auto",
          width: "100%",
        }}
      >
        <div style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif' }}>
        <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
          <div style={{ flexShrink: 0 }}>
            <img
              src={tweet.user.avatar_url}
              alt={tweet.user.name}
              width={48}
              height={48}
              style={{
                borderRadius: options.square_avatar || tweet.user.profile_image_shape === "Square" ? "4px" : "50%",
                display: "block",
                width: 48,
                height: 48,
              }}
            />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "4px", flexWrap: "wrap", marginBottom: "2px" }}>
              <span style={{ fontWeight: 700, fontSize: "15px" }}>{tweet.user.name}</span>
              {options.show_verified && tweet.user.verified && (
                (() => {
                  const vtype = tweet.user.verified_type || "blue";
                  const color = vtype === "gold" ? "#F4B400" : vtype === "government" ? "#829AAB" : "#1d9bf0";
                  const path = "M512 268c0 17.9-4.3 34.5-12.9 49.7s-20.1 27.1-34.6 35.4c.4 2.7.6 6.9.6 12.6 0 27.1-9.1 50.1-27.1 69.1-18.1 19.1-39.9 28.6-65.4 28.6-11.4 0-22.3-2.1-32.6-6.3-8 16.4-19.5 29.6-34.6 39.7-15 10.2-31.5 15.2-49.4 15.2-18.3 0-34.9-4.9-49.7-14.9-14.9-9.9-26.3-23.2-34.3-40-10.3 4.2-21.1 6.3-32.6 6.3-25.5 0-47.4-9.5-65.7-28.6-18.3-19-27.4-42.1-27.4-69.1 0-3 .4-7.2 1.1-12.6-14.5-8.4-26-20.2-34.6-35.4-8.5-15.2-12.8-31.8-12.8-49.7 0-19 4.8-36.5 14.3-52.3s22.3-27.5 38.3-35.1c-4.2-11.4-6.3-22.9-6.3-34.3 0-27 9.1-50.1 27.4-69.1s40.2-28.6 65.7-28.6c11.4 0 22.3 2.1 32.6 6.3 8-16.4 19.5-29.6 34.6-39.7 15-10.1 31.5-15.2 49.4-15.2s34.4 5.1 49.4 15.1c15 10.1 26.6 23.3 34.6 39.7 10.3-4.2 21.1-6.3 32.6-6.3 25.5 0 47.3 9.5 65.4 28.6s27.1 42.1 27.1 69.1c0 12.6-1.9 24-5.7 34.3 16 7.6 28.8 19.3 38.3 35.1 9.5 15.9 14.3 33.4 14.3 52.4zm-266.9 77.1 105.7-158.3c2.7-4.2 3.5-8.8 2.6-13.7-1-4.9-3.5-8.8-7.7-11.4-4.2-2.7-8.8-3.6-13.7-2.9-5 .8-9 3.2-12 7.4l-93.1 140-42.9-42.8c-3.8-3.8-8.2-5.6-13.1-5.4-5 .2-9.3 2-13.1 5.4-3.4 3.4-5.1 7.7-5.1 12.9 0 5.1 1.7 9.4 5.1 12.9l58.9 58.9 2.9 2.3c3.4 2.3 6.9 3.4 10.3 3.4 6.7-.1 11.8-2.9 15.2-8.7z";
                  return (
                    <svg viewBox="0 0 512 512" width="18" height="18" style={{ flexShrink: 0 }}>
                      <path d={path} fill={color} />
                    </svg>
                  );
                })()
              )}
              <span style={{ color: secondary, fontSize: "15px" }}>@{tweet.user.screen_name}</span>
            </div>

            <div
              style={{ marginBottom: "12px", whiteSpace: "pre-wrap", wordBreak: "break-word", fontSize: "15px", lineHeight: "1.5" }}
              dangerouslySetInnerHTML={{ __html: linkifiedText }}
            />

            {options.show_media && tweet.media.length > 0 && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: tweet.media.length === 1 ? "1fr" : "1fr 1fr",
                  gap: "4px",
                  marginBottom: "12px",
                }}
              >
                {tweet.media.map((m, i) => {
                  const isSingle = tweet.media.length === 1;
                  const hasDims = m.width && m.height;
                  const aspect = isSingle && hasDims ? `${m.width} / ${m.height}` : "1 / 1";
                  const fit = isSingle && hasDims ? "contain" : "cover";
                  const radius = isSingle ? "16px" : "12px";
                  const bg = isDark ? "#1a1a1a" : "#f0f0f0";

                  if ((m.type === "video" || m.type === "animated_gif") && m.video_urls.length > 0) {
                    const mp4Urls = m.video_urls.filter(v => v.content_type === "video/mp4");
                    const rawUrl = mp4Urls[0]?.url || m.video_urls[0]?.url || "";
                    const proxyUrl = rawUrl
                      ? `http://127.0.0.1:8000/api/proxy/video?url=${encodeURIComponent(rawUrl)}`
                      : "";
                    if (!rawUrl) {
                      return (
                        <img key={i} src={m.preview_url || m.url} alt="" crossOrigin="anonymous"
                          style={{ width: "100%", aspectRatio: aspect, objectFit: fit, borderRadius: radius, border: `1px solid ${border}`, display: "block", background: bg }} />
                      );
                    }
                    return (
                      <video
                        key={i}
                        src={proxyUrl}
                        crossOrigin="anonymous"
                        autoPlay
                        loop
                        playsInline
                        controls={false}
                        poster={m.preview_url || m.url}
                        preload="metadata"
                        onError={(e) => {
                          const target = e.currentTarget;
                          target.style.display = "none";
                          const img = document.createElement("img");
                          img.src = String(m.preview_url || m.url);
                          img.crossOrigin = "anonymous";
                          img.style.cssText = `width:100%;aspect-ratio:${aspect};object-fit:${fit};border-radius:${radius};display:block;background:${bg}`;
                          img.style.border = `1px solid ${border}`;
                          target.parentNode?.insertBefore(img, target);
                        }}
                        style={{ width: "100%", aspectRatio: aspect, objectFit: fit, borderRadius: radius, border: `1px solid ${border}`, display: "block", background: bg }}
                      />
                    );
                  }
                  return (
                    <img
                      key={i}
                      src={m.preview_url || m.url}
                      alt=""
                      crossOrigin="anonymous"
                      style={{
                        width: "100%",
                        borderRadius: radius,
                        border: `1px solid ${border}`,
                        display: "block",
                        objectFit: fit,
                        aspectRatio: aspect,
                        background: bg,
                      }}
                    />
                  );
                })}
              </div>
            )}

            {options.show_timestamp && (
              <div style={{ color: secondary, fontSize: "15px", marginBottom: "4px" }}>
                {formatTime(tweet.created_at)} · {formatDate(tweet.created_at)}
              </div>
            )}
          </div>
        </div>

        {options.show_metrics && (
          <div
            style={{
              display: "flex",
              gap: "24px",
              paddingTop: "12px",
              marginTop: "12px",
              borderTop: `1px solid ${border}`,
              color: secondary,
              fontSize: "14px",
            }}
          >
            {[
              { path: "M14.046 2.242l-4.148-.01h-.002c-4.374 0-7.8 3.427-7.8 7.802 0 4.098 3.186 7.206 7.465 7.37v3.828c0 .108.044.286.12.403.142.225.384.347.632.347.138 0 .277-.038.402-.118.264-.168 6.473-4.14 8.088-5.506 1.902-1.61 3.04-3.97 3.043-6.312v-.017c-.006-4.367-3.43-7.787-7.8-7.788zm3.787 12.972c-1.134.96-4.862 3.405-6.772 4.643V16.67c0-.414-.335-.75-.75-.75h-.396c-3.66 0-6.318-2.476-6.318-5.886 0-3.534 2.768-6.302 6.3-6.302l4.147.01h.002c3.532 0 6.3 2.766 6.302 6.296-.003 1.91-.942 3.844-2.514 5.176z", value: tweet.replies, label: "Replies" },
              { path: "M23.77 15.67c-.292-.292-.767-.292-1.06 0l-2.22 2.22V7.65c0-2.068-1.683-3.75-3.75-3.75h-5.85c-.414 0-.75.336-.75.75s.336.75.75.75h5.85c1.24 0 2.25 1.01 2.25 2.25v10.24l-2.22-2.22c-.293-.293-.768-.293-1.06 0s-.294.768 0 1.06l3.5 3.5c.145.147.337.22.53.22s.383-.072.53-.22l3.5-3.5c.294-.292.294-.767 0-1.06zm-10.66 3.28H7.26c-1.24 0-2.25-1.01-2.25-2.25V6.46l2.22 2.22c.148.147.34.22.532.22s.384-.073.53-.22c.293-.293.293-.768 0-1.06l-3.5-3.5c-.293-.294-.768-.294-1.06 0l-3.5 3.5c-.294.292-.294.767 0 1.06s.767.293 1.06 0l2.22-2.22V16.7c0 2.068 1.683 3.75 3.75 3.75h5.85c.414 0 .75-.336.75-.75s-.337-.75-.75-.75z", value: tweet.retweets, label: "Reposts" },
              { path: "M12 21.638h-.014C9.403 21.59 1.95 14.856 1.95 8.478c0-3.064 2.525-5.754 5.403-5.754 2.29 0 3.83 1.351 4.647 2.476.818-1.125 2.357-2.476 4.647-2.476 2.878 0 5.403 2.69 5.403 5.754 0 6.378-7.453 13.112-10.05 13.16z", value: tweet.likes, label: "Likes" },
              { path: "M8.75 21V3h2v18h-2zM18 21V8.5h2V21h-2zM4 21l.004-10h2L6 21H4zm9.248 0v-7h2v7h-2z", value: tweet.views ?? 0, label: "Views", hide: tweet.views == null },
            ].filter(m => !m.hide).map((metric, i) => (
              <span key={i} style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d={metric.path} />
                </svg>
                <span style={{ fontWeight: 500, color: text }}>{formatNumber(metric.value)}</span> {metric.label}
              </span>
            ))}
          </div>
        )}
      </div>
      </div>
    </div>
  );
});

export default TweetPreview;
