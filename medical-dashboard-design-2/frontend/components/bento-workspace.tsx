"use client"

import { cn } from "@/lib/utils"
import { UploadCloud } from "lucide-react"
import { useCallback } from "react"
import { useDropzone } from "react-dropzone"

interface BentoWorkspaceProps {
  // We pass the whole File object now, not just the name
  onStartAnalysis: (file: File) => void
}

export function BentoWorkspace({ onStartAnalysis }: BentoWorkspaceProps) {
  
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles?.length > 0) {
      // JUST PASS THE FILE UP. The Dashboard will handle the API.
      console.log("📂 File Dropped:", acceptedFiles[0].name)
      onStartAnalysis(acceptedFiles[0]) 
    }
  }, [onStartAnalysis])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg'], 'application/dicom': ['.dcm'] },
    maxFiles: 1
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-white">
            Aura <span className="text-cyan-400">Diagnostics</span>
          </h2>
          <p className="text-slate-400 mt-1">Medical imaging analysis powered by MedSAM & Midnight Privacy</p>
        </div>
      </div>

      <div 
        {...getRootProps()}
        className={cn(
          "relative h-[400px] rounded-3xl border-2 border-dashed flex flex-col items-center justify-center cursor-pointer transition-all bg-slate-900/30",
          isDragActive ? "border-cyan-500 bg-cyan-500/10" : "border-slate-700 hover:border-cyan-500/50"
        )}
      >
        <input {...getInputProps()} />
        <UploadCloud className="w-16 h-16 text-cyan-400 mb-4" />
        <h3 className="text-2xl font-bold text-white mb-2">Upload Mammogram</h3>
        <p className="text-slate-400">Drag & drop DICOM or PNG</p>
      </div>
    </div>
  )
}