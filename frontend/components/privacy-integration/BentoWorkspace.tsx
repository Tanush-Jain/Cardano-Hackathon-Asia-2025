"use client"

import { useTheme } from "@/lib/theme-context"
import { cn } from "@/lib/utils"
import { Upload, FileImage, AlertCircle } from "lucide-react"
import { useCallback, useState } from "react"

interface BentoWorkspaceProps {
  onStartAnalysis: (fileName: string) => void
}

export function BentoWorkspace({ onStartAnalysis }: BentoWorkspaceProps) {
  const [isDragOver, setIsDragOver] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<File | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const { theme } = useTheme()

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)

    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      const file = files[0]
      if (file.type.startsWith('image/')) {
        setUploadedFile(file)
      }
    }
  }, [])

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      const file = files[0]
      if (file.type.startsWith('image/')) {
        setUploadedFile(file)
      }
    }
  }, [])

  const handleStartAnalysis = async () => {
    if (!uploadedFile) return

    setIsAnalyzing(true)
    // Simulate analysis start
    setTimeout(() => {
      onStartAnalysis(uploadedFile.name)
      setIsAnalyzing(false)
    }, 1000)
  }

  return (
    <div className="flex-1 p-6 space-y-6">
      {/* Upload Zone */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div
          className={cn(
            "relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200",
            isDragOver
              ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20"
              : theme === "dark"
                ? "border-slate-700 hover:border-slate-600"
                : "border-slate-300 hover:border-slate-400",
            uploadedFile && "border-green-500 bg-green-50 dark:bg-green-950/20"
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />

          {uploadedFile ? (
            <div className="space-y-4">
              <FileImage className="w-12 h-12 mx-auto text-green-500" />
              <div>
                <p className="text-sm font-medium text-green-700 dark:text-green-400">
                  File uploaded successfully
                </p>
                <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                  {uploadedFile.name}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <Upload className="w-12 h-12 mx-auto text-slate-400" />
              <div>
                <p className="text-sm font-medium">
                  Drop your medical scan here, or{" "}
                  <span className="text-blue-600 dark:text-blue-400">browse</span>
                </p>
                <p className="text-xs text-slate-500 mt-1">
                  Supports: PNG, JPG, DICOM (max 10MB)
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Analysis Controls */}
        <div className="space-y-4">
          <div className={cn(
            "p-4 rounded-lg border",
            theme === "dark" ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"
          )}>
            <h3 className="font-semibold mb-3">Analysis Configuration</h3>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium">Analysis Type</label>
                <select className={cn(
                  "w-full mt-1 px-3 py-2 border rounded-md text-sm",
                  theme === "dark"
                    ? "bg-slate-700 border-slate-600 text-white"
                    : "bg-white border-slate-300"
                )}>
                  <option>Mammogram Analysis</option>
                  <option>General Pathology</option>
                  <option>Mitosis Detection</option>
                </select>
              </div>

              <div className="flex items-center space-x-2">
                <input type="checkbox" id="privacy" defaultChecked />
                <label htmlFor="privacy" className="text-sm">
                  Enable Zero-Knowledge Privacy Protection
                </label>
              </div>
            </div>
          </div>

          <button
            onClick={handleStartAnalysis}
            disabled={!uploadedFile || isAnalyzing}
            className={cn(
              "w-full py-3 px-4 rounded-lg font-medium transition-all",
              uploadedFile && !isAnalyzing
                ? "bg-blue-600 hover:bg-blue-700 text-white"
                : "bg-slate-300 text-slate-500 cursor-not-allowed"
            )}
          >
            {isAnalyzing ? "Starting Analysis..." : "Start AI Analysis"}
          </button>

          <div className={cn(
            "p-3 rounded-lg border",
            theme === "dark" ? "bg-amber-950/20 border-amber-800/50" : "bg-amber-50 border-amber-200"
          )}>
            <div className="flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <div className="text-xs">
                <p className="font-medium text-amber-800 dark:text-amber-400">
                  Privacy Notice
                </p>
                <p className="text-amber-700 dark:text-amber-300 mt-1">
                  Your medical data remains private. Only the analysis result and cryptographic proof will be shared.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
