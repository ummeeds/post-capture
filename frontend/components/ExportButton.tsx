"use client";

import { useState, useEffect, useCallback } from "react";

interface ExportButtonProps {
  onCaptureElement: () => HTMLElement | null;
}

export default function ExportButton({ onCaptureElement }: ExportButtonProps) {
  const [exporting, setExporting] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!exporting) setProgress(0);
  }, [exporting]);

  const getVideoEl = useCallback((): HTMLVideoElement | null => {
    const el = onCaptureElement();
    return el?.querySelector("video") || null;
  }, [onCaptureElement]);

  const downloadPNG = async () => {
    setExporting("png");
    try {
      const el = onCaptureElement();
      if (!el) return;
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(el, { scale: 2, useCORS: true, allowTaint: false, backgroundColor: null });
      const link = document.createElement("a");
      link.download = "postcrop-tweet.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
    } catch (e) {
      console.error("Export PNG failed:", e);
    } finally {
      setExporting(null);
    }
  };

  const copyToClipboard = async () => {
    setExporting("clipboard");
    try {
      const el = onCaptureElement();
      if (!el) return;
      const html2canvas = (await import("html2canvas")).default;
      const canvas = await html2canvas(el, { scale: 2, useCORS: true, allowTaint: false, backgroundColor: null });
      const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, "image/png"));
      if (blob) {
        await navigator.clipboard.write([new ClipboardItem({ "image/png": blob })]);
      }
    } catch (e) {
      console.error("Copy failed:", e);
    } finally {
      setExporting(null);
    }
  };

  const exportMP4 = async () => {
    const video = getVideoEl();
    if (!video) {
      alert("No video found in this tweet.");
      return;
    }

    const cardEl = onCaptureElement();
    if (!cardEl) return;

    setExporting("mp4");
    setProgress(0);

    try {
      const html2canvas = (await import("html2canvas")).default;

      // 1. Measure
      const cardRect = cardEl.getBoundingClientRect();
      const videoRect = video.getBoundingClientRect();

      // 2. Capture card as-is (video area will be blank/poster)
      const staticCanvas = await html2canvas(cardEl, {
        scale: 2,
        useCORS: true,
        allowTaint: false,
        backgroundColor: null,
      });

      // 3. Position video in canvas space
      const sx = staticCanvas.width / cardRect.width;
      const sy = staticCanvas.height / cardRect.height;
      const dx = (videoRect.left - cardRect.left) * sx;
      const dy = (videoRect.top - cardRect.top) * sy;
      const dw = videoRect.width * sx;
      const dh = videoRect.height * sy;

      // 4. Output canvas
      const out = document.createElement("canvas");
      out.width = staticCanvas.width;
      out.height = staticCanvas.height;
      const ctx = out.getContext("2d")!;
      ctx.drawImage(staticCanvas, 0, 0);

      // 5. Start video
      const wasLooping = video.loop;
      video.loop = false;
      video.currentTime = 0;
      video.muted = true;
      video.playbackRate = 1;

      try {
        await video.play();
      } catch {
        // Some browsers need user gesture
      }

      // Wait for video to have data
      if (video.readyState < 2) {
        await new Promise<void>((resolve, reject) => {
          const timeout = setTimeout(() => reject(new Error("Video load timeout")), 5000);
          video.addEventListener("canplay", () => { clearTimeout(timeout); resolve(); }, { once: true });
        });
      }

      const duration = video.duration || 10;

      // 6. Record
      const chunks: Blob[] = [];
      const stream = out.captureStream(30);
      let mimeType = "video/webm";
      if (!MediaRecorder.isTypeSupported("video/webm;codecs=vp9")) {
        if (MediaRecorder.isTypeSupported("video/webm;codecs=vp8")) {
          mimeType = "video/webm;codecs=vp8";
        }
      }
      const recorder = new MediaRecorder(stream, { mimeType });
      let done = false;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      const finish = () => {
        if (done) return;
        done = true;
        video.loop = wasLooping;
        setProgress(100);
        if (recorder.state === "recording") recorder.stop();
      };

      recorder.onstop = () => {
        video.loop = wasLooping;
        if (chunks.length === 0) {
          alert("Export produced no video data. Try a different tweet.");
          video.pause();
          setExporting(null);
          return;
        }
        const blob = new Blob(chunks, { type: mimeType });
        const link = document.createElement("a");
        link.download = "postcrop-tweet.webm";
        link.href = URL.createObjectURL(blob);
        link.click();
        setTimeout(() => URL.revokeObjectURL(link.href), 1000);
        video.pause();
        setExporting(null);
      };

      recorder.start(100);

      // 7. Frame loop
      const tick = () => {
        if (done || recorder.state === "inactive") return;
        ctx.drawImage(staticCanvas, 0, 0);
        try {
          if (video.readyState >= 2 && !video.ended) {
            ctx.drawImage(video, dx, dy, dw, dh);
          }
        } catch {
          // drawImage may fail if video is cross-origin
        }
        if (duration > 0) {
          setProgress(Math.min(99, Math.round((video.currentTime / duration) * 100)));
        }
        if (video.ended) {
          // Draw one final frame then stop
          ctx.drawImage(staticCanvas, 0, 0);
          try { ctx.drawImage(video, dx, dy, dw, dh); } catch {}
          finish();
          return;
        }
        requestAnimationFrame(tick);
      };

      tick();
      video.onended = finish;
      setTimeout(finish, 120000);
    } catch (e) {
      console.error("MP4 export failed:", e);
      setExporting(null);
    }
  };

  const video = getVideoEl();
  const hasVideo = !!video;
  const isExporting = exporting !== null;

  return (
    <div className="flex flex-col gap-3">
      {isExporting && (
        <div className="bg-surface-dim border border-border-subtle rounded p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-label-sm text-label-sm text-on-surface">
              {exporting === "mp4" ? "Processing video..." : exporting === "png" ? "Exporting PNG..." : "Copying..."}
            </span>
            <span className="font-label-sm text-label-sm text-primary-container">{progress}%</span>
          </div>
          <div className="h-1.5 bg-surface-variant rounded-full overflow-hidden">
            <div
              className="h-full bg-primary-container rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      <button
        onClick={downloadPNG}
        disabled={isExporting}
        className="w-full bg-primary-container text-white font-label-sm text-label-sm py-3 rounded hover:bg-[#1A91DA] transition-colors flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        ⬇ Download PNG
      </button>

      {hasVideo && (
        <button
          onClick={exportMP4}
          disabled={isExporting}
          className="w-full bg-tertiary-container text-white font-label-sm text-label-sm py-3 rounded hover:bg-[#c47500] transition-colors flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
        >
          🎬 Export MP4
        </button>
      )}

      <button
        onClick={copyToClipboard}
        disabled={isExporting}
        className="w-full bg-transparent border border-border-subtle text-on-surface font-label-sm text-label-sm py-3 rounded hover:bg-white/5 transition-colors flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        📋 Copy to Clipboard
      </button>
    </div>
  );
}
