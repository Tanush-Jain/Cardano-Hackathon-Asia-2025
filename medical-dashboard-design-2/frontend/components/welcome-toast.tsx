"use client"

import { useTheme } from "@/lib/theme-context"
import { cn } from "@/lib/utils"
import { ArrowRight, Sparkles, X } from "lucide-react"
import { useEffect, useState } from "react"

interface WelcomeToastProps {
  onDismiss: () => void
}

export function WelcomeToast({ onDismiss }: WelcomeToastProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isLeaving, setIsLeaving] = useState(false)
  const { theme } = useTheme()

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 500)
    return () => clearTimeout(timer)
  }, [])

  const handleDismiss = () => {
    setIsLeaving(true)
    setTimeout(() => onDismiss(), 300)
  }

  useEffect(() => {
    const timer = setTimeout(() => handleDismiss(), 8000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div
      className={cn(
        "fixed bottom-52 right-6 z-50 max-w-sm transition-all duration-300 ease-out",
        isVisible && !isLeaving ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
      )}
    >
      <div
        className={cn(
          "rounded-2xl p-4 border shadow-lg",
          theme === "dark" ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200",
        )}
      >
        <div className="flex items-start gap-3">
          <div
            className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
              theme === "dark" ? "bg-cyan-500/20" : "bg-cyan-500/10",
            )}
          >
            <Sparkles className="w-5 h-5 text-cyan-500" />
          </div>
          <div className="flex-1 min-w-0">
            <h4 className={cn("text-sm font-semibold mb-1", theme === "dark" ? "text-white" : "text-slate-900")}>
              Welcome to Aura AI
            </h4>
            <p className={cn("text-xs leading-relaxed", theme === "dark" ? "text-slate-400" : "text-slate-500")}>
              Upload mammogram scans for AI-powered analysis. Your data is protected with Zero-Knowledge encryption.
            </p>
            <button className="mt-3 inline-flex items-center gap-1.5 text-xs font-medium text-cyan-500 hover:text-cyan-400 transition-colors">
              Take a quick tour
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <button
            onClick={handleDismiss}
            className={cn(
              "p-1 rounded-lg transition-colors flex-shrink-0",
              theme === "dark" ? "hover:bg-slate-700" : "hover:bg-slate-100",
            )}
            aria-label="Dismiss"
          >
            <X className={cn("w-4 h-4", theme === "dark" ? "text-slate-400" : "text-slate-500")} />
          </button>
        </div>
      </div>
    </div>
  )
}
