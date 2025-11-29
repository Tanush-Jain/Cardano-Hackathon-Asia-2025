"use client"

import { useTheme } from "@/lib/theme-context"
import { cn } from "@/lib/utils"
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  CreditCard,
  Download,
  Eye,
  FileCheck,
  Flame,
  Layers,
  RotateCcw,
  Share2,
  Shield,
  ZoomIn,
  ZoomOut,
} from "lucide-react"
import type React from "react"
import { useState } from "react"

interface DiagnosticDetailViewProps {
  onBack: () => void
}

type OverlayMode = "original" | "medsam" | "gradcam"

const shapFeatures = [
  { name: "Texture Irregularity", value: 0.85, color: "bg-red-500" },
  { name: "Density Pattern", value: 0.72, color: "bg-amber-500" },
  { name: "Margin Definition", value: 0.58, color: "bg-cyan-500" },
]

const trustTimeline = [
  { step: 1, label: "Upload", time: "10:00 AM", status: "complete", icon: FileCheck },
  { step: 2, label: "Masumi Payment", detail: "10 ADA - Confirmed", status: "complete", icon: CreditCard },
  { step: 3, label: "Midnight ZK Proof", detail: "Hash: 0x829f...3a1b", status: "complete", icon: Shield },
  { step: 4, label: "Audit Logged", detail: "Cardano Mainnet", status: "complete", icon: CheckCircle2 },
]

export function DiagnosticDetailView({ onBack }: DiagnosticDetailViewProps) {
  const [overlayMode, setOverlayMode] = useState<OverlayMode>("original")
  const [zoom, setZoom] = useState(100)
  const { theme } = useTheme()

  return (
    <div className="h-full flex flex-col gap-6">
      {/* Header - more spacious */}
      <header className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className={cn(
              "p-3 rounded-xl transition-colors",
              theme === "dark"
                ? "bg-slate-800 hover:bg-slate-700 text-slate-300"
                : "bg-slate-100 hover:bg-slate-200 text-slate-600",
            )}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className={cn("text-2xl font-bold tracking-tight", theme === "dark" ? "text-white" : "text-slate-900")}>
              Diagnostic Analysis
            </h1>
            <p className={cn("text-sm mt-1", theme === "dark" ? "text-slate-400" : "text-slate-500")}>
              Patient ID: ANO-2024-8847 | Scan: mammogram_left_cc.dcm
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {/* Action buttons */}
          <button
            className={cn(
              "p-2.5 rounded-lg transition-colors",
              theme === "dark"
                ? "bg-slate-800 hover:bg-slate-700 text-slate-400"
                : "bg-slate-100 hover:bg-slate-200 text-slate-600",
            )}
          >
            <Download className="w-5 h-5" />
          </button>
          <button
            className={cn(
              "p-2.5 rounded-lg transition-colors",
              theme === "dark"
                ? "bg-slate-800 hover:bg-slate-700 text-slate-400"
                : "bg-slate-100 hover:bg-slate-200 text-slate-600",
            )}
          >
            <Share2 className="w-5 h-5" />
          </button>
          <div
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-full",
              theme === "dark" ? "bg-red-500/10 border border-red-500/20" : "bg-red-50 border border-red-200",
            )}
          >
            <AlertTriangle className="w-4 h-4 text-red-500" />
            <span className="text-sm font-medium text-red-500">Requires Review</span>
          </div>
        </div>
      </header>

      <div className="flex-1 flex gap-6 min-h-0">
        {/* Central Viewer - takes most space */}
        <div className="flex-1 flex flex-col gap-4 min-w-0">
          <div
            className={cn(
              "flex-1 relative rounded-2xl overflow-hidden border",
              theme === "dark" ? "bg-black border-slate-800" : "bg-slate-900 border-slate-200",
            )}
          >
            {/* Scan Display */}
            <div className="absolute inset-0 flex items-center justify-center p-8">
              <div
                className="relative w-full h-full flex items-center justify-center transition-transform duration-200"
                style={{ transform: `scale(${zoom / 100})` }}
              >
                {/* Base Scan Image */}
                <img
                  src="/mammogram-medical-scan-grayscale.jpg"
                  alt="Mammogram scan"
                  className="max-w-full max-h-full object-contain"
                />

                {/* MedSAM Overlay */}
                {overlayMode === "medsam" && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="w-32 h-44 rounded-full border-4 border-red-500 bg-red-500/20 blur-sm absolute top-1/3 left-1/2 transform -translate-x-1/2" />
                    <div className="w-28 h-40 rounded-full border-2 border-red-500 bg-red-500/10 absolute top-1/3 left-1/2 transform -translate-x-1/2" />
                  </div>
                )}

                {/* Grad-CAM Overlay */}
                {overlayMode === "gradcam" && (
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                      background:
                        "radial-gradient(ellipse 35% 45% at 50% 35%, rgba(255,0,0,0.5) 0%, rgba(255,165,0,0.35) 30%, rgba(255,255,0,0.2) 50%, rgba(0,255,0,0.1) 70%, transparent 100%)",
                    }}
                  />
                )}
              </div>
            </div>

            {/* Grid Overlay */}
            <div
              className="absolute inset-0 opacity-[0.03] pointer-events-none"
              style={{
                backgroundImage: `linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)`,
                backgroundSize: "50px 50px",
              }}
            />

            <div
              className={cn(
                "absolute top-4 left-4 flex items-center gap-1 p-1 rounded-lg",
                theme === "dark" ? "bg-slate-800/90" : "bg-white/90",
              )}
            >
              <button
                onClick={() => setZoom(Math.max(50, zoom - 25))}
                className={cn(
                  "p-2 rounded-md transition-colors",
                  theme === "dark" ? "hover:bg-slate-700 text-slate-300" : "hover:bg-slate-100 text-slate-600",
                )}
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span
                className={cn(
                  "text-xs font-medium w-12 text-center",
                  theme === "dark" ? "text-slate-300" : "text-slate-600",
                )}
              >
                {zoom}%
              </span>
              <button
                onClick={() => setZoom(Math.min(200, zoom + 25))}
                className={cn(
                  "p-2 rounded-md transition-colors",
                  theme === "dark" ? "hover:bg-slate-700 text-slate-300" : "hover:bg-slate-100 text-slate-600",
                )}
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                onClick={() => setZoom(100)}
                className={cn(
                  "p-2 rounded-md transition-colors",
                  theme === "dark" ? "hover:bg-slate-700 text-slate-300" : "hover:bg-slate-100 text-slate-600",
                )}
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            <div
              className={cn(
                "absolute bottom-6 left-1/2 transform -translate-x-1/2 flex items-center gap-2 p-2 rounded-xl",
                theme === "dark" ? "bg-slate-800/90" : "bg-white/90 shadow-lg",
              )}
            >
              <OverlayButton
                icon={Eye}
                label="Original"
                active={overlayMode === "original"}
                onClick={() => setOverlayMode("original")}
                theme={theme}
              />
              <OverlayButton
                icon={Layers}
                label="MedSAM Mask"
                active={overlayMode === "medsam"}
                onClick={() => setOverlayMode("medsam")}
                color="red"
                theme={theme}
              />
              <OverlayButton
                icon={Flame}
                label="Grad-CAM"
                active={overlayMode === "gradcam"}
                onClick={() => setOverlayMode("gradcam")}
                color="gradient"
                theme={theme}
              />
            </div>
          </div>
        </div>

        <div className="w-96 flex flex-col gap-4 overflow-y-auto">
          {/* Diagnosis Card - larger */}
          <div
            className={cn(
              "rounded-2xl p-6 border",
              theme === "dark" ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200",
            )}
          >
            <h3
              className={cn(
                "text-xs font-semibold uppercase tracking-wider mb-4",
                theme === "dark" ? "text-slate-500" : "text-slate-400",
              )}
            >
              AI Diagnosis
            </h3>
            <div className="flex items-center gap-4 mb-5">
              <div
                className={cn(
                  "w-14 h-14 rounded-xl flex items-center justify-center",
                  theme === "dark" ? "bg-red-500/10 border border-red-500/30" : "bg-red-50 border border-red-200",
                )}
              >
                <AlertTriangle className="w-7 h-7 text-red-500" />
              </div>
              <div>
                <p className="text-3xl font-bold text-red-500">Malignant</p>
                <p className={cn("text-sm", theme === "dark" ? "text-slate-400" : "text-slate-500")}>
                  Suspected Finding
                </p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className={theme === "dark" ? "text-slate-400" : "text-slate-500"}>Confidence Score</span>
                <span className={cn("font-bold", theme === "dark" ? "text-white" : "text-slate-900")}>98.5%</span>
              </div>
              <div
                className={cn("h-3 rounded-full overflow-hidden", theme === "dark" ? "bg-slate-800" : "bg-slate-100")}
              >
                <div
                  className="h-full bg-gradient-to-r from-red-500 to-red-400 rounded-full"
                  style={{ width: "98.5%" }}
                />
              </div>
            </div>
          </div>

          {/* SHAP Analysis - more spacious */}
          <div
            className={cn(
              "rounded-2xl p-6 border",
              theme === "dark" ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200",
            )}
          >
            <h3
              className={cn(
                "text-xs font-semibold uppercase tracking-wider mb-5",
                theme === "dark" ? "text-slate-500" : "text-slate-400",
              )}
            >
              SHAP Feature Analysis
            </h3>
            <div className="space-y-5">
              {shapFeatures.map((feature) => (
                <div key={feature.name} className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className={theme === "dark" ? "text-slate-300" : "text-slate-600"}>{feature.name}</span>
                    <span
                      className={cn(
                        "font-mono text-sm font-medium",
                        theme === "dark" ? "text-white" : "text-slate-900",
                      )}
                    >
                      {(feature.value * 100).toFixed(0)}%
                    </span>
                  </div>
                  <div
                    className={cn(
                      "h-2.5 rounded-full overflow-hidden",
                      theme === "dark" ? "bg-slate-800" : "bg-slate-100",
                    )}
                  >
                    <div
                      className={cn("h-full rounded-full transition-all", feature.color)}
                      style={{ width: `${feature.value * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Chain of Trust - scrollable if needed */}
          <div
            className={cn(
              "flex-1 rounded-2xl p-6 border min-h-0",
              theme === "dark" ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200",
            )}
          >
            <h3
              className={cn(
                "text-xs font-semibold uppercase tracking-wider mb-5",
                theme === "dark" ? "text-slate-500" : "text-slate-400",
              )}
            >
              Chain of Trust
            </h3>
            <div className="space-y-0">
              {trustTimeline.map((item, index) => (
                <div key={item.step} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div
                      className={cn(
                        "w-10 h-10 rounded-full flex items-center justify-center",
                        item.status === "complete"
                          ? theme === "dark"
                            ? "bg-emerald-500/10 border border-emerald-500/30"
                            : "bg-emerald-50 border border-emerald-200"
                          : theme === "dark"
                            ? "bg-slate-800 border border-slate-700"
                            : "bg-slate-100 border border-slate-200",
                      )}
                    >
                      <item.icon
                        className={cn(
                          "w-5 h-5",
                          item.status === "complete"
                            ? "text-emerald-500"
                            : theme === "dark"
                              ? "text-slate-500"
                              : "text-slate-400",
                        )}
                      />
                    </div>
                    {index < trustTimeline.length - 1 && (
                      <div
                        className={cn("w-0.5 h-10 my-1", theme === "dark" ? "bg-emerald-500/30" : "bg-emerald-200")}
                      />
                    )}
                  </div>
                  <div className="pt-2 pb-4">
                    <p className={cn("text-sm font-medium", theme === "dark" ? "text-white" : "text-slate-900")}>
                      {item.label}
                    </p>
                    {item.time && (
                      <p className={cn("text-xs mt-0.5", theme === "dark" ? "text-slate-500" : "text-slate-400")}>
                        {item.time}
                      </p>
                    )}
                    {item.detail && <p className="text-xs font-mono text-cyan-500 mt-1">{item.detail}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

function OverlayButton({
  icon: Icon,
  label,
  active,
  onClick,
  color,
  theme,
}: {
  icon: React.ElementType
  label: string
  active: boolean
  onClick: () => void
  color?: "red" | "gradient"
  theme: string
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all",
        active
          ? color === "red"
            ? "bg-red-500/15 text-red-500 border border-red-500/30"
            : color === "gradient"
              ? "bg-gradient-to-r from-red-500/15 via-amber-500/15 to-green-500/15 text-amber-500 border border-amber-500/30"
              : "bg-cyan-500/15 text-cyan-500 border border-cyan-500/30"
          : theme === "dark"
            ? "text-slate-400 hover:text-white hover:bg-slate-700"
            : "text-slate-600 hover:text-slate-900 hover:bg-slate-100",
      )}
    >
      <Icon className="w-4 h-4" />
      {label}
    </button>
  )
}
