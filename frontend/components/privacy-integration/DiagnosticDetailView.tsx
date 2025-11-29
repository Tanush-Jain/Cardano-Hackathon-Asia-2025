"use client"

import { useTheme } from "@/lib/theme-context"
import { cn } from "@/lib/utils"
import { ArrowLeft, Download, Shield, CheckCircle, AlertTriangle } from "lucide-react"
import { useState } from "react"

interface DiagnosticDetailViewProps {
  onBack: () => void
}

export function DiagnosticDetailView({ onBack }: DiagnosticDetailViewProps) {
  const [isVerified, setIsVerified] = useState(false)
  const { theme } = useTheme()

  // Mock analysis results
  const analysisResults = {
    confidence: 94.2,
    findings: [
      { type: "normal", description: "No significant abnormalities detected", severity: "low" },
      { type: "mitosis", description: "Potential mitotic activity in region 3", severity: "medium" },
      { type: "calcification", description: "Microcalcifications present", severity: "high" }
    ],
    proofId: "0x7f3a9b2c8e5d4f1a6b8c9e2d5f4a7b3c9e1f5a8b"
  }

  return (
    <div className={cn(
      "flex flex-col h-full gap-4 p-6",
      theme === "dark" ? "bg-slate-950" : "bg-white"
    )}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-sm font-medium hover:opacity-70"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>
        <h1 className="text-2xl font-bold">Diagnostic Analysis</h1>
        <div className="w-10" />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto space-y-6">
        {/* Confidence Score */}
        <div className={cn(
          "p-4 rounded-lg border",
          theme === "dark" 
            ? "bg-slate-900 border-slate-700" 
            : "bg-slate-50 border-slate-200"
        )}>
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold">Confidence Score</span>
            <span className="text-lg font-bold text-blue-500">{analysisResults.confidence}%</span>
          </div>
          <div className="w-full bg-slate-300 rounded-full h-2">
            <div 
              className="bg-blue-500 h-2 rounded-full" 
              style={{ width: `${analysisResults.confidence}%` }}
            />
          </div>
        </div>

        {/* Findings */}
        <div className="space-y-3">
          <h2 className="font-semibold text-lg">Findings</h2>
          {analysisResults.findings.map((finding, idx) => (
            <div
              key={idx}
              className={cn(
                "p-4 rounded-lg border-l-4 flex gap-3",
                finding.severity === "high" 
                  ? "border-l-red-500 bg-red-50 dark:bg-red-950"
                  : finding.severity === "medium"
                  ? "border-l-yellow-500 bg-yellow-50 dark:bg-yellow-950"
                  : "border-l-green-500 bg-green-50 dark:bg-green-950"
              )}>
              <div>
                {finding.severity === "high" && <AlertTriangle className="w-5 h-5 text-red-500" />}
                {finding.severity === "medium" && <AlertTriangle className="w-5 h-5 text-yellow-500" />}
                {finding.severity === "low" && <CheckCircle className="w-5 h-5 text-green-500" />}
              </div>
              <div>
                <p className="font-medium capitalize">{finding.type}</p>
                <p className="text-sm opacity-75">{finding.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Verification Status */}
        <div className={cn(
          "p-4 rounded-lg border flex items-center gap-3",
          theme === "dark"
            ? "bg-slate-900 border-slate-700"
            : "bg-slate-50 border-slate-200"
        )}>
          <Shield className="w-5 h-5 text-blue-500" />
          <div className="flex-1">
            <p className="font-medium">Privacy Verified</p>
            <p className="text-sm opacity-75">Proof ID: {analysisResults.proofId}</p>
          </div>
          <button
            onClick={() => setIsVerified(!isVerified)}
            className={cn(
              "px-4 py-2 rounded font-medium transition",
              isVerified
                ? "bg-blue-500 text-white"
                : "bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white"
            )}
          >
            {isVerified ? "Verified ✓" : "Verify"}
          </button>
        </div>
      </div>

      {/* Footer Actions */}
      <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
        <button className="flex-1 flex items-center justify-center gap-2 py-2 rounded bg-slate-200 dark:bg-slate-700 hover:opacity-80 transition">
          <Download className="w-4 h-4" />
          Download Report
        </button>
      </div>
    </div>
  )
}