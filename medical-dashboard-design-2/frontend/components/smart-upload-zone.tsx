"use client"

import type React from "react"

import { cn } from "@/lib/utils"
import { CheckCircle2, FileImage, Upload, X } from "lucide-react"
import { useCallback, useState } from "react"

interface SmartUploadZoneProps {
  onStartAnalysis?: (fileName: string) => void
}

export function SmartUploadZone({ onStartAnalysis }: SmartUploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) setUploadedFile(file)
  }, [])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) setUploadedFile(file)
  }, [])

  const clearFile = () => setUploadedFile(null)

  const handleStartAnalysis = () => {
    if (uploadedFile && onStartAnalysis) {
      onStartAnalysis(uploadedFile.name)
    }
  }

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={cn(
        "h-full rounded-2xl border-2 border-dashed transition-all duration-300 flex flex-col items-center justify-center relative overflow-hidden glass",
        isDragging
          ? "border-primary bg-primary/10 glow-cyan"
          : uploadedFile
            ? "border-success/40 bg-success/5"
            : "border-white/15 hover:border-primary/40 hover:bg-white/[0.03]",
      )}
    >
      <div
        className="absolute inset-0 opacity-[0.02]"
        style={{
          backgroundImage: `linear-gradient(rgba(255,255,255,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.3) 1px, transparent 1px)`,
          backgroundSize: "24px 24px",
        }}
      />

      {uploadedFile ? (
        <div className="relative z-10 flex flex-col items-center gap-5">
          <div className="w-24 h-24 rounded-3xl bg-success/15 border border-success/30 flex items-center justify-center glow-cyan-subtle">
            <CheckCircle2 className="w-12 h-12 text-success" />
          </div>
          <div className="text-center">
            <p className="text-lg font-medium text-foreground">{uploadedFile.name}</p>
            <p className="text-sm text-muted-foreground mt-1.5">{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</p>
          </div>
          <div className="flex items-center gap-3 mt-3">
            <button
              onClick={handleStartAnalysis}
              className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm btn-glossy glow-cyan-sm"
            >
              Start Analysis
            </button>
            <button
              onClick={clearFile}
              className="p-3 rounded-xl bg-white/5 hover:bg-destructive/20 border border-white/10 transition-all group btn-glossy"
            >
              <X className="w-5 h-5 text-muted-foreground group-hover:text-destructive" />
            </button>
          </div>
        </div>
      ) : (
        <label className="relative z-10 flex flex-col items-center gap-5 cursor-pointer p-8">
          <div
            className={cn(
              "w-24 h-24 rounded-3xl flex items-center justify-center transition-all duration-300 border",
              isDragging
                ? "bg-primary/20 border-primary/40 glow-cyan"
                : "bg-white/5 border-white/10 hover:border-primary/30",
            )}
          >
            {isDragging ? (
              <FileImage className="w-12 h-12 text-primary" />
            ) : (
              <Upload className="w-12 h-12 text-muted-foreground" />
            )}
          </div>
          <div className="text-center">
            <p className="text-xl font-semibold text-foreground">
              {isDragging ? "Drop to upload" : "Smart Upload Zone"}
            </p>
            <p className="text-sm text-muted-foreground mt-2">Drag & drop DICOM, PNG, or JPEG mammogram images</p>
          </div>
          <div className="flex items-center gap-3 mt-3">
            {["DICOM", "PNG", "JPEG"].map((format) => (
              <span
                key={format}
                className="px-4 py-1.5 rounded-full bg-white/5 text-xs font-medium text-muted-foreground border border-white/10"
              >
                {format}
              </span>
            ))}
          </div>
          <input type="file" className="hidden" accept=".dcm,.dicom,.png,.jpg,.jpeg" onChange={handleFileSelect} />
        </label>
      )}
    </div>
  )
}
