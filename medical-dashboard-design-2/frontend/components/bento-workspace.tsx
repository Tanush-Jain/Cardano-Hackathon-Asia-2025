"use client"

import { SmartUploadZone } from "./smart-upload-zone"
import { StatusTile } from "./status-tile"
import { Server, Cpu, Shield, Coins } from "lucide-react"

interface BentoWorkspaceProps {
  onStartAnalysis?: (fileName: string) => void
}

export function BentoWorkspace({ onStartAnalysis }: BentoWorkspaceProps) {
  return (
    <div className="h-full flex flex-col gap-5">
      {/* Header - Enhanced iOS glass style */}
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground tracking-tight">
            Aura <span className="text-primary">Diagnostics</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Medical imaging analysis powered by MedSAM</p>
        </div>
        <div className="flex items-center gap-2.5 px-4 py-2 rounded-full glass border border-success/20 glow-cyan-subtle">
          <span className="w-2 h-2 rounded-full bg-success animate-pulse" />
          <span className="text-xs font-medium text-success">System Online</span>
        </div>
      </header>

      {/* Bento Grid - Enhanced glass panels */}
      <div className="flex-1 grid grid-cols-4 grid-rows-3 gap-4">
        {/* Main Upload Zone - spans 3 cols, 3 rows */}
        <div className="col-span-3 row-span-3">
          <SmartUploadZone onStartAnalysis={onStartAnalysis} />
        </div>

        {/* Status Tiles - right column */}
        <StatusTile icon={Server} label="Masumi Node" value="Active" status="success" />
        <StatusTile icon={Cpu} label="MedSAM" value="Ready" status="success" />
        <StatusTile icon={Shield} label="Midnight" value="Encrypted" status="info" />
      </div>

      {/* Bottom Info Bar - iOS glass style */}
      <div className="flex items-center justify-between px-5 py-3.5 rounded-2xl glass">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2.5">
            <Coins className="w-4 h-4 text-primary" />
            <span className="text-sm text-muted-foreground">Analysis Fee:</span>
            <span className="text-sm font-semibold text-foreground">10 ADA</span>
          </div>
          <div className="flex items-center gap-2.5">
            <Shield className="w-4 h-4 text-success" />
            <span className="text-sm text-muted-foreground">Privacy:</span>
            <span className="text-sm font-semibold text-success">Midnight ZK</span>
          </div>
        </div>
        <span className="text-xs text-muted-foreground">GPU Cluster: 4x A100 Available</span>
      </div>
    </div>
  )
}
