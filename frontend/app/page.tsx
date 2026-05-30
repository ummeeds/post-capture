"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { fetchTweet } from "@/lib/api";

export default function Home() {
  const router = useRouter();
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCapture = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;
    setLoading(true);
    setError("");
    try {
      const tweet = await fetchTweet(url.trim());
      if (!tweet.id) {
        throw new Error("Could not find tweet. Check the URL.");
      }
      router.push(`/capture/${tweet.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <nav
        className="fixed top-0 w-full z-50 border-b border-border-subtle"
        style={{ background: "rgba(15, 20, 25, 0.6)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)" }}
      >
        <div className="flex justify-between items-center h-16 px-margin-mobile md:px-gutter max-w-container-max mx-auto w-full">
          <a className="font-headline-lg text-headline-lg tracking-tighter font-bold text-on-surface" href="/">
            PostCapture
          </a>
          <div className="hidden md:flex items-center gap-8">
            <a className="font-label-sm text-label-sm text-on-surface-variant hover:text-on-surface transition-colors duration-200" href="#">
              Features
            </a>
            <a className="font-label-sm text-label-sm text-on-surface-variant hover:text-on-surface transition-colors duration-200" href="#">
              Pricing
            </a>
            <a className="font-label-sm text-label-sm text-on-surface-variant hover:text-on-surface transition-colors duration-200" href="#">
              Showcase
            </a>
            <a className="font-label-sm text-label-sm text-on-surface-variant hover:text-on-surface transition-colors duration-200" href="#">
              API
            </a>
          </div>
          <div className="flex items-center gap-4">
            <button className="hidden md:block font-label-sm text-label-sm text-on-surface border border-border-subtle px-4 py-2 rounded hover:bg-white/5 transition-all duration-200">
              Login
            </button>
            <a
              href="#capture-form"
              className="font-label-sm text-label-sm bg-primary-container text-white px-4 py-2 rounded hover:bg-[#1A91DA] transition-all duration-200"
            >
              Capture Now
            </a>
          </div>
        </div>
      </nav>

      <main className="flex-grow pt-32 pb-section-gap grid-bg relative">
        <div className="absolute inset-0 bg-gradient-to-b from-canvas-black via-transparent to-canvas-black pointer-events-none" />
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-gutter relative z-10 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 border border-border-subtle rounded-full px-3 py-1 mb-8 bg-surface-dim/80 backdrop-blur-sm">
            <span className="w-2 h-2 rounded-full bg-primary-container animate-pulse" />
            <span className="font-label-sm text-label-sm text-on-surface-variant">v2.0 Beta Live</span>
          </div>

          <h1 className="font-display-xl-mobile md:font-display-xl text-on-surface max-w-3xl mb-6">
            Turn tweets into <span className="text-primary-container">masterpieces</span>
          </h1>
          <p className="text-text-dimmed max-w-xl mx-auto mb-12" style={{ fontSize: "16px", lineHeight: "24px" }}>
            Technical precision for social media content. Paste a URL to instantly generate pixel-perfect,
            high-resolution screenshots with zero noise.
          </p>

          <form id="capture-form" onSubmit={handleCapture} className="w-full max-w-2xl relative flex items-center group">
            <span className="absolute left-4 text-[20px] text-text-dimmed group-focus-within:text-primary-container transition-colors select-none">
              🔗
            </span>
            <input
              className="w-full bg-surface-dim border border-border-subtle rounded py-4 pl-12 pr-32 text-on-surface focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all"
              style={{ fontSize: "16px" }}
              placeholder="https://x.com/username/status/..."
              type="url"
              value={url}
              onChange={(e) => { setUrl(e.target.value); setError(""); }}
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !url.trim()}
              className="absolute right-2 top-2 bottom-2 bg-primary-container text-white font-label-sm text-label-sm px-6 rounded hover:bg-[#1A91DA] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Capturing..." : "Capture"}
            </button>
          </form>

          {error && (
            <p className="mt-4 text-error text-sm">⚠ {error}</p>
          )}

          <div className="mt-8 flex items-center gap-4 text-text-dimmed font-label-sm text-label-sm">
            <span className="flex items-center gap-1">✅ Auto-crop</span>
            <span className="flex items-center gap-1">✅ High Res</span>
            <span className="flex items-center gap-1">✅ SVG/PNG</span>
          </div>
        </div>

        <section className="max-w-container-max mx-auto px-margin-mobile md:px-gutter mt-section-gap relative z-10">
          <div className="flex flex-col items-center mb-16 text-center">
            <h2 className="font-headline-lg text-headline-lg text-on-surface mb-4">High-Precision Previews</h2>
            <p className="text-text-dimmed max-w-2xl" style={{ fontSize: "16px", lineHeight: "24px" }}>
              See exactly how your content will look across platforms.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { label: "1080x1080 • PNG", theme: "Dark", bg: "from-[#15202B] to-[#1DA1F2]/10", cardBg: "bg-black border border-border-subtle", shadow: true, blockBg: "bg-surface-variant", textBg: "bg-surface-variant", textBg2: "bg-border-subtle", textBg3: "bg-surface-variant", imgBg: "bg-surface-variant" },
              { label: "1200x630 • SVG", theme: "Light", bg: "from-zinc-200 to-white", cardBg: "bg-white border border-gray-200", shadow: false, blockBg: "bg-gray-300", textBg: "bg-gray-200", textBg2: "bg-gray-200", textBg3: "bg-gray-300", imgBg: "bg-gray-300" },
            ].map((card, i) => (
              <div key={i} className="bg-surface-dim border border-border-subtle rounded-xl overflow-hidden group hover:border-outline-variant transition-colors">
                <div className="p-3 border-b border-border-subtle flex justify-between items-center bg-surface">
                  <span className="font-label-sm text-label-sm text-text-dimmed">{card.label}</span>
                  <div className="flex gap-2">
                    <span className="font-label-sm text-label-sm text-text-dimmed bg-surface-variant px-2 py-0.5 rounded-full">{card.theme}</span>
                  </div>
                </div>
                <div
                  className={`p-6 aspect-square flex items-center justify-center relative overflow-hidden bg-gradient-to-br ${card.bg}`}
                >
                  <div className={`w-full max-w-[280px] rounded-xl p-4 ${card.shadow ? "shadow-2xl" : "shadow-[0_8px_30px_rgb(0,0,0,0.12)]"} ${card.cardBg} transform group-hover:scale-105 transition-transform duration-500`}>
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-10 h-10 ${card.blockBg} rounded-full`} />
                      <div>
                        <div className={`w-24 h-3 ${card.textBg} rounded mb-1`} />
                        <div className={`w-16 h-2 ${card.textBg2} rounded`} />
                      </div>
                    </div>
                    <div className={`w-full h-3 ${card.textBg3} rounded mb-2`} />
                    <div className={`w-5/6 h-3 ${card.textBg3} rounded mb-4`} />
                    <div className={`w-full aspect-video ${card.blockBg} rounded-lg border border-border-subtle`} />
                  </div>
                </div>
              </div>
            ))}
            <div className="bg-surface-dim border border-border-subtle rounded-xl overflow-hidden group hover:border-outline-variant transition-colors md:col-span-2 lg:col-span-1">
              <div className="p-3 border-b border-border-subtle flex justify-between items-center bg-surface">
                <span className="font-label-sm text-label-sm text-text-dimmed">1920x1080 • MP4</span>
                <div className="flex gap-2">
                  <span className="font-label-sm text-label-sm text-text-dimmed bg-surface-variant px-2 py-0.5 rounded-full">Glass</span>
                </div>
              </div>
              <div className="p-6 aspect-square bg-surface-variant flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-canvas-black/40 backdrop-blur-md" />
                <div className="w-full max-w-[280px] bg-white/10 backdrop-blur-xl border border-white/20 rounded-xl p-4 shadow-2xl transform group-hover:rotate-2 transition-transform duration-500 relative z-10">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-white/20" />
                    <div>
                      <div className="w-24 h-3 bg-white/30 rounded mb-1" />
                      <div className="w-16 h-2 bg-white/10 rounded" />
                    </div>
                  </div>
                  <div className="w-full h-3 bg-white/30 rounded mb-2" />
                  <div className="w-3/4 h-3 bg-white/30 rounded" />
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="w-full py-section-gap border-t border-border-subtle bg-surface">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8 px-margin-mobile md:px-gutter max-w-container-max mx-auto w-full">
          <span className="font-label-sm text-label-sm font-bold text-on-surface">PostCapture</span>
          <div className="flex flex-wrap justify-center gap-6">
            <a className="font-label-sm text-label-sm text-text-dimmed hover:text-on-surface transition-colors duration-200" href="#">Terms</a>
            <a className="font-label-sm text-label-sm text-text-dimmed hover:text-on-surface transition-colors duration-200" href="#">Privacy</a>
            <a className="font-label-sm text-label-sm text-text-dimmed hover:text-on-surface transition-colors duration-200" href="#">Support</a>
            <a className="font-label-sm text-label-sm text-text-dimmed hover:text-on-surface transition-colors duration-200" href="#">GitHub</a>
          </div>
          <span className="text-text-dimmed text-sm">2024 PostCapture.co</span>
        </div>
      </footer>
    </>
  );
}
