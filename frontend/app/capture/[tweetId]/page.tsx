"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import TweetPreview from "@/components/TweetPreview";
import CustomizationPanel from "@/components/CustomizationPanel";
import ExportButton from "@/components/ExportButton";
import { fetchTweetById } from "@/lib/api";
import type { Tweet, CaptureOptions } from "@/lib/types";
import { defaultCaptureOptions } from "@/lib/types";

export default function CapturePage() {
  const params = useParams();
  const router = useRouter();
  const tweetId = params.tweetId as string;

  const [tweet, setTweet] = useState<Tweet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [options, setOptions] = useState<CaptureOptions>(defaultCaptureOptions);
  const previewRef = useRef<HTMLDivElement>(null);
  const [captureUrl, setCaptureUrl] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const data = await fetchTweetById(tweetId);
        setTweet(data);
      } catch (e) {
        setError(e instanceof Error ? e.message : "Failed to load tweet");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [tweetId]);

  const getPreviewElement = useCallback(() => previewRef.current, []);

  const handleQuickCapture = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!captureUrl.trim()) return;
    try {
      const { fetchTweet } = await import("@/lib/api");
      const tweet = await fetchTweet(captureUrl.trim());
      router.push(`/capture/${tweet.id}`);
    } catch {}
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-canvas-black">
        <div className="flex flex-col items-center gap-4">
          <div className="w-8 h-8 border-2 border-primary-container border-t-transparent rounded-full animate-spin" />
          <span className="text-text-dimmed" style={{ fontFamily: "JetBrains Mono", fontSize: "13px" }}>
            Loading tweet...
          </span>
        </div>
      </div>
    );
  }

  if (error || !tweet) {
    return (
      <div className="flex h-screen items-center justify-center bg-canvas-black">
        <div className="text-center space-y-4">
          <p className="text-error">{error || "Tweet not found"}</p>
          <a href="/" className="text-primary-container hover:underline font-label-sm text-label-sm">
            Back to home
          </a>
        </div>
      </div>
    );
  }

  const isGradient = options.background.includes("gradient");

  return (
    <div className="flex flex-col h-screen overflow-hidden" style={{ backgroundColor: "#000000" }}>
      {/* TopNavBar */}
      <nav
        className="shrink-0 z-50 border-b border-border-subtle"
        style={{ background: "rgba(15, 20, 25, 0.6)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}
      >
        <div className="flex justify-between items-center h-16 px-margin-mobile md:px-gutter w-full">
          <div className="flex items-center gap-6">
            <a href="/" className="font-headline-lg text-headline-lg tracking-tighter font-bold text-on-surface">
              PostCapture
            </a>
            <a className="hidden md:block font-label-sm text-label-sm text-on-surface-variant hover:text-on-surface transition-colors px-3 py-1.5 rounded-md" href="#">
              Bulk Tweets
            </a>
            <a className="hidden md:block font-label-sm text-label-sm text-on-surface-variant hover:text-on-surface transition-colors px-3 py-1.5 rounded-md" href="#">
              Shortcuts
            </a>
          </div>

          <form onSubmit={handleQuickCapture} className="hidden lg:flex flex-1 max-w-xl mx-8 relative group">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[16px] text-text-dimmed group-focus-within:text-primary-container transition-colors select-none">
              🔗
            </span>
            <input
              className="w-full bg-surface-dim border border-border-subtle rounded py-2 pl-12 pr-28 text-on-surface focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all"
              style={{ fontSize: "16px" }}
              placeholder="Paste tweet URL..."
              type="url"
              value={captureUrl}
              onChange={(e) => setCaptureUrl(e.target.value)}
            />
            <button
              type="submit"
              className="absolute right-1 top-1 bottom-1 bg-primary-container text-white font-label-sm text-label-sm px-4 rounded hover:bg-[#1A91DA] transition-colors"
            >
              Capture
            </button>
          </form>

          <div className="flex items-center gap-4">
            <button className="hidden sm:block font-label-sm text-label-sm text-on-surface border border-border-subtle px-4 py-2 rounded hover:bg-white/5 transition-all">
              Get Pro+
            </button>
            <a
              href="/"
              className="font-label-sm text-label-sm bg-primary-container text-white px-4 py-2 rounded hover:bg-[#1A91DA] transition-all flex items-center gap-2"
            >
              <span>+</span> Add Tweet
            </a>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Canvas Workspace */}
        <div className="flex-1 grid-bg relative overflow-auto flex items-center justify-center p-8">
          <div className="absolute inset-0 bg-gradient-to-b from-canvas-black via-transparent to-canvas-black pointer-events-none opacity-50" />
          <div
            className="relative rounded-2xl transition-all duration-300 shadow-2xl flex items-center justify-center overflow-visible"
            style={{
              padding: "48px",
              ...(isGradient
                ? { background: options.background }
                : { backgroundColor: options.background === "transparent" ? "transparent" : options.background }),
              borderWidth: options.background === "transparent" ? 1 : 0,
              borderColor: "rgba(255,255,255,0.1)",
              borderStyle: options.background === "transparent" ? "dashed" : "solid",
            }}
          >
            {options.background === "transparent" && (
              <div
                className="absolute inset-0 opacity-10 rounded-xl"
                style={{
                  backgroundImage: "repeating-linear-gradient(45deg, #89929c 25%, transparent 25%, transparent 75%, #89929c 75%, #89929c), repeating-linear-gradient(45deg, #89929c 25%, transparent 25%, transparent 75%, #89929c 75%, #89929c)",
                  backgroundPosition: "0 0, 4px 4px",
                  backgroundSize: "8px 8px",
                }}
              />
            )}
            <div className="relative z-10 w-full flex justify-center">
              <TweetPreview ref={previewRef} tweet={tweet} options={options} noCard />
            </div>
          </div>

          {/* Canvas Controls */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-surface-dim/80 backdrop-blur-sm border border-border-subtle px-4 py-2 rounded-full shadow-lg z-20">
            <button className="p-2 text-text-dimmed hover:text-on-surface transition-colors rounded-full hover:bg-white/5" title="Zoom out">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M15 3l2.3 2.3-2.89 2.87 1.42 1.42L18.7 6.7 21 9V3h-6zM3 9l2.3-2.3 2.87 2.89 1.42-1.42L6.7 5.3 9 3H3v6zm6 12l-2.3-2.3 2.89-2.87-1.42-1.42L5.3 17.3 3 15v6h6zm12-6l-2.3 2.3-2.87-2.89-1.42 1.42 2.89 2.87L15 21h6v-6z"/></svg>
            </button>
            <span className="font-label-sm text-label-sm text-on-surface">100%</span>
            <button className="p-2 text-text-dimmed hover:text-on-surface transition-colors rounded-full hover:bg-white/5" title="Zoom in">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"/><path d="M7 9h5v1H7z"/></svg>
            </button>
            <div className="w-px h-6 bg-border-subtle mx-2" />
            <button className="p-2 text-text-dimmed hover:text-on-surface transition-colors rounded-full hover:bg-white/5" title="Fit to screen">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/></svg>
            </button>
          </div>
        </div>

        {/* Right Sidebar */}
        <aside className="w-80 shrink-0 h-full bg-surface border-l border-border-subtle flex flex-col z-40 overflow-y-auto custom-scrollbar">
          <CustomizationPanel options={options} onChange={setOptions} />
          <div className="mt-auto p-6 bg-surface border-t border-border-subtle sticky bottom-0 z-10">
            <ExportButton onCaptureElement={getPreviewElement} />
          </div>
        </aside>
      </div>
    </div>
  );
}
