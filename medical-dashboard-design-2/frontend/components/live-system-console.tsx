"use client"

import { useTheme } from "@/lib/theme-context"
import { cn } from "@/lib/utils"
import { Circle, Cpu, Maximize2, Minimize2, Shield, Terminal } from "lucide-react"
import { useEffect, useRef, useState } from "react"

interface LogEntry {
  id: number
  type: "INFO" | "ZK" | "MedSAM" | "WARN" | "ERROR"
  message: string
  timestamp: Date
}

const initialLogs: LogEntry[] = [
  { id: 1, type: "INFO", message: "System initialized", timestamp: new Date() },
  { id: 2, type: "INFO", message: "Connecting to Masumi Node...", timestamp: new Date() },
  { id: 3, type: "INFO", message: "Block 4827: Synced", timestamp: new Date() },
  { id: 4, type: "ZK", message: "Midnight Prover: Ready", timestamp: new Date() },
  { id: 5, type: "MedSAM", message: "Model loaded: MedSAM-v2.1", timestamp: new Date() },
]

const simulatedLogs = [
  { type: "INFO" as const, message: "Block {block}: Transaction Confirmed" },
  { type: "ZK" as const, message: "Generating Witness..." },
  { type: "ZK" as const, message: "Proof verification: PASSED" },
  { type: "MedSAM" as const, message: "Mask generated in {time}s" },
  { type: "MedSAM" as const, message: "Preprocessing scan: {id}" },
  { type: "INFO" as const, message: "Patient data encrypted" },
  { type: "ZK" as const, message: "ZK-SNARK commitment: 0x{hash}" },
  { type: "INFO" as const, message: "Peer connected: node-{node}" },
]

export function LiveSystemConsole() {
  const [logs, setLogs] = useState<LogEntry[]>(initialLogs)
  const [minimized, setMinimized] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const logIdRef = useRef(initialLogs.length + 1)
  const { theme } = useTheme()

  useEffect(() => {
    const interval = setInterval(
      () => {
        const template = simulatedLogs[Math.floor(Math.random() * simulatedLogs.length)]
        const message = template.message
          .replace("{block}", String(4828 + Math.floor(Math.random() * 100)))
          .replace("{time}", (0.2 + Math.random() * 0.5).toFixed(2))
          .replace(
            "{id}",
            `PAT-${Math.floor(Math.random() * 9999)
              .toString()
              .padStart(4, "0")}`,
          )
          .replace("{hash}", Math.random().toString(16).slice(2, 10))
          .replace("{node}", String(Math.floor(Math.random() * 99) + 1))

        const newLog: LogEntry = {
          id: logIdRef.current++,
          type: template.type,
          message,
          timestamp: new Date(),
        }

        setLogs((prev) => [...prev.slice(-50), newLog])
      },
      2000 + Math.random() * 3000,
    )

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [logs])

  const getTypeColor = (type: LogEntry["type"]) => {
    switch (type) {
      case "INFO":
        return "text-cyan-500"
      case "ZK":
        return "text-purple-400"
      case "MedSAM":
        return "text-emerald-500"
      case "WARN":
        return "text-amber-500"
      case "ERROR":
        return "text-red-500"
    }
  }

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" })
  }

  return (
    <div
      className={cn(
        "fixed bottom-0 left-64 right-0 border-t transition-all duration-300 z-40",
        minimized ? "h-12" : "h-48",
        theme === "dark" ? "bg-slate-950 border-slate-800" : "bg-slate-900 border-slate-800",
      )}
    >
      {/* Status Bar */}
      <div
        className={cn(
          "h-12 px-5 flex items-center justify-between border-b",
          theme === "dark" ? "bg-slate-900 border-slate-800" : "bg-slate-800 border-slate-700",
        )}
      >
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2.5">
            <Terminal className="w-4 h-4 text-cyan-500" />
            <span className="text-xs font-mono font-semibold text-white">SYSTEM CONSOLE</span>
          </div>
          <div className="flex items-center gap-4 text-xs font-mono">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              <Circle className="w-2 h-2 fill-emerald-500 text-emerald-500 animate-pulse" />
              <span className="text-slate-400">Masumi Node:</span>
              <span className="text-emerald-500 font-semibold">Synced</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20">
              <Shield className="w-3 h-3 text-purple-400" />
              <span className="text-slate-400">Midnight Prover:</span>
              <span className="text-purple-400 font-semibold">Active</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20">
              <Cpu className="w-3 h-3 text-cyan-500" />
              <span className="text-slate-400">GPU Memory:</span>
              <span className="text-cyan-500 font-semibold">4.2GB / 16GB</span>
            </div>
          </div>
        </div>
        <button
          onClick={() => setMinimized(!minimized)}
          className="p-2 hover:bg-slate-700 rounded-lg transition-all text-slate-400 hover:text-white"
        >
          {minimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
        </button>
      </div>

      {/* Log Output */}
      {!minimized && (
        <div
          ref={scrollRef}
          className="h-[calc(100%-48px)] overflow-y-auto console-scrollbar p-4 font-mono text-xs bg-slate-950"
        >
          {logs.map((log) => (
            <div key={log.id} className="flex gap-4 py-1 hover:bg-slate-900 rounded px-2 -mx-2 transition-colors">
              <span className="text-slate-600 shrink-0">{formatTime(log.timestamp)}</span>
              <span className={cn("shrink-0 w-20 font-semibold", getTypeColor(log.type))}>[{log.type}]</span>
              <span className="text-slate-300">{log.message}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
