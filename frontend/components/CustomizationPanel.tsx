"use client";

import type { CaptureOptions, AspectRatio } from "@/lib/types";
import { SOLID_COLORS, GRADIENTS, defaultBgForTheme } from "@/lib/types";

interface CustomizationPanelProps {
  options: CaptureOptions;
  onChange: (options: CaptureOptions) => void;
}

const ASPECT_RATIOS: { value: AspectRatio; label: string }[] = [
  { value: "auto", label: "Auto" },
  { value: "1:1", label: "1:1" },
  { value: "4:5", label: "4:5" },
  { value: "3:4", label: "3:4" },
  { value: "9:16", label: "9:16" },
];

export default function CustomizationPanel({ options, onChange }: CustomizationPanelProps) {
  const update = (partial: Partial<CaptureOptions>) => {
    const next = { ...options, ...partial };
    if (partial.theme && partial.theme !== options.theme) {
      const currentSolids = SOLID_COLORS.map(c => c.value);
      if (currentSolids.includes(options.background) || !options.background) {
        next.background = defaultBgForTheme(partial.theme);
      }
    }
    onChange(next);
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto custom-scrollbar">
      {/* Header */}
      <div className="p-6 border-b border-border-subtle">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-primary-container text-lg">⚙</span>
          <h2 className="font-headline-lg text-lg font-bold text-on-surface">Editor Controls</h2>
        </div>
        <p className="font-label-sm text-label-sm text-text-dimmed">Technical Precision v2.8.0</p>
      </div>

      {/* Appearance */}
      <div className="p-6 border-b border-border-subtle">
        <h3 className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-4 flex items-center gap-2">
          <span>🎨</span> Appearance
        </h3>

        <div className="mb-6">
          <label className="font-label-sm text-label-sm text-on-surface mb-2 block">Theme</label>
          <div className="flex bg-surface-variant rounded p-1 border border-border-subtle">
            {(["light", "dark"] as const).map((t) => (
              <button
                key={t}
                onClick={() => update({ theme: t })}
                className={`flex-1 py-1.5 rounded font-label-sm text-label-sm transition-colors ${
                  options.theme === t
                    ? "bg-surface border border-border-subtle text-on-surface shadow-sm"
                    : "text-text-dimmed hover:text-on-surface"
                }`}
              >
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="font-label-sm text-label-sm text-on-surface mb-2 block">Background</label>
          <div className="grid grid-cols-4 gap-2 mb-4">
            {SOLID_COLORS.map((c) => (
              <button
                key={c.value}
                title={c.label}
                onClick={() => update({ background: c.value })}
                className={`relative aspect-square rounded border transition-all ${
                  options.background === c.value
                    ? "border-primary-container ring-2 ring-primary-container ring-offset-2 ring-offset-surface"
                    : "border-border-subtle hover:border-primary-container"
                }`}
                style={{
                  background:
                    c.value === "transparent"
                      ? undefined
                      : c.value,
                }}
              >
                {c.value === "transparent" && (
                  <div className="absolute inset-0 opacity-20 rounded"
                    style={{
                      backgroundImage: "repeating-linear-gradient(45deg, #89929c 25%, transparent 25%, transparent 75%, #89929c 75%, #89929c), repeating-linear-gradient(45deg, #89929c 25%, transparent 25%, transparent 75%, #89929c 75%, #89929c)",
                      backgroundPosition: "0 0, 4px 4px",
                      backgroundSize: "8px 8px",
                    }}
                  />
                )}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-4 gap-2">
            {GRADIENTS.map((g) => (
              <button
                key={g.value}
                title={g.label}
                onClick={() => update({ background: g.value })}
                className={`aspect-video rounded border-2 transition-all ${
                  options.background === g.value
                    ? "border-primary-container shadow-[0_0_0_2px_rgba(29,161,242,0.2)]"
                    : "border-border-subtle hover:border-primary-container"
                }`}
                style={{ background: g.value }}
              />
            ))}
            <button className="aspect-video rounded border border-border-subtle hover:border-primary-container transition-all bg-surface-variant flex items-center justify-center text-text-dimmed hover:text-on-surface">
              <span className="text-xl">+</span>
            </button>
          </div>
        </div>
      </div>

      {/* Layout */}
      <div className="p-6 border-b border-border-subtle">
        <h3 className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-4 flex items-center gap-2">
          <span>📐</span> Layout
        </h3>
        <div className="grid grid-cols-5 gap-2">
          {ASPECT_RATIOS.map((r) => (
            <button
              key={r.value}
              onClick={() => update({ aspect_ratio: r.value })}
              className="flex flex-col items-center gap-1 group"
            >
              <div
                className={`w-full aspect-[4/3] rounded transition-colors flex items-center justify-center ${
                  options.aspect_ratio === r.value
                    ? "border border-primary-container bg-primary-container/10"
                    : "border border-border-subtle group-hover:border-primary-container/50"
                }`}
              >
                {r.value === "auto" && (
                  <div className="w-6 h-4 border border-primary-container/50 rounded-sm" />
                )}
                {r.value === "1:1" && (
                  <div className="w-5 h-5 border border-text-dimmed rounded-sm" />
                )}
                {r.value === "4:5" && (
                  <div className="w-4 h-5 border border-text-dimmed rounded-sm" />
                )}
                {r.value === "3:4" && (
                  <div className="w-4 h-6 border border-text-dimmed rounded-sm" />
                )}
                {r.value === "9:16" && (
                  <div className="w-3 h-6 border border-text-dimmed rounded-sm" />
                )}
              </div>
              <span
                className={`text-[10px] ${
                  options.aspect_ratio === r.value ? "text-primary-container" : "text-text-dimmed"
                }`}
                style={{ fontFamily: "JetBrains Mono", fontWeight: 500 }}
              >
                {r.label}
              </span>
            </button>
          ))}
        </div>
        <div className="mt-6 space-y-5">
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-label-sm text-label-sm text-on-surface">Scale</label>
              <span className="font-label-sm text-label-sm text-text-dimmed">{options.scale.toFixed(2)}x</span>
            </div>
            <input
              type="range"
              min={0.5}
              max={2}
              step={0.05}
              value={options.scale}
              onChange={(e) => update({ scale: Number(e.target.value) })}
              className="w-full accent-primary-container"
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="font-label-sm text-label-sm text-on-surface">Width</label>
              <span className="font-label-sm text-label-sm text-text-dimmed">{options.width}px</span>
            </div>
            <input
              type="range"
              min={280}
              max={700}
              step={10}
              value={options.width}
              onChange={(e) => update({ width: Number(e.target.value) })}
              className="w-full accent-primary-container"
            />
          </div>
        </div>
      </div>

      {/* Elements */}
      <div className="p-6 border-b border-border-subtle">
        <h3 className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-4 flex items-center gap-2">
          <span>📦</span> Elements
        </h3>
        <div className="space-y-4">
          {[
            { key: "show_metrics" as const, label: "Metrics" },
            { key: "show_media" as const, label: "Media Attachment" },
            { key: "show_timestamp" as const, label: "Timestamp" },
            { key: "show_verified" as const, label: "Verified Badge" },
            { key: "square_avatar" as const, label: "Square Avatar" },
          ].map(({ key, label }) => (
            <label key={key} className="flex items-center justify-between cursor-pointer group">
              <span className="font-label-sm text-label-sm text-on-surface group-hover:text-primary-container transition-colors">
                {label}
              </span>
              <div className="relative inline-flex items-center">
                <input
                  checked={options[key]}
                  onChange={(e) => update({ [key]: e.target.checked })}
                  className="sr-only peer"
                  type="checkbox"
                />
                <div className="w-9 h-5 bg-surface-variant peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-primary-container" />
              </div>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}
