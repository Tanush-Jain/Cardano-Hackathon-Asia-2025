"use client"

import { cn } from "@/lib/utils"
import { AlertCircle, CheckCircle2, ChevronLeft, ChevronRight, Clock, Loader2 } from "lucide-react"

interface PatientQueueProps {
  collapsed: boolean
  onToggle: () => void
}

const patients = [
  { id: "PX-7829", status: "verified", time: "2m ago" },
  { id: "PX-7830", status: "analyzing", time: "5m ago" },
  { id: "PX-7831", status: "pending", time: "12m ago" },
  { id: "PX-7832", status: "verified", time: "18m ago" },
  { id: "PX-7833", status: "pending", time: "25m ago" },
]

const statusConfig = {
  pending: {
    label: "Payment Pending",
    icon: AlertCircle,
    className: "bg-warning/15 text-warning border-warning/25",
  },
  analyzing: {
    label: "Analyzing",
    icon: Loader2,
    className: "bg-primary/15 text-primary border-primary/25",
    animate: true,
  },
  verified: {
    label: "Verified",
    icon: CheckCircle2,
    className: "bg-success/15 text-success border-success/25",
  },
}

export function PatientQueue({ collapsed, onToggle }: PatientQueueProps) {
  return (
    <aside
      className={cn(
        "h-full glass-heavy border-l border-white/10 transition-all duration-300 flex flex-col rounded-l-2xl",
        collapsed ? "w-14" : "w-72",
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        {!collapsed && <h2 className="text-sm font-semibold text-foreground">Patient Queue</h2>}
        <button
          onClick={onToggle}
          className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center transition-all border border-white/10 btn-glossy"
        >
          {collapsed ? (
            <ChevronLeft className="w-4 h-4 text-muted-foreground" />
          ) : (
            <ChevronRight className="w-4 h-4 text-muted-foreground" />
          )}
        </button>
      </div>

      {/* Queue List */}
      {!collapsed && (
        <div className="flex-1 overflow-auto p-3 space-y-2.5">
          {patients.map((patient) => {
            const config = statusConfig[patient.status as keyof typeof statusConfig]
            const StatusIcon = config.icon
            return (
              <div
                key={patient.id}
                className="p-3.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/[0.08] transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-sm font-mono font-semibold text-foreground">{patient.id}</span>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="w-3 h-3" />
                    {patient.time}
                  </div>
                </div>
                <div
                  className={cn(
                    "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border",
                    config.className,
                  )}
                >
                  <StatusIcon className={cn("w-3 h-3", config.animate && "animate-spin")} />
                  {config.label}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Collapsed state indicator */}
      {collapsed && (
        <div className="flex-1 flex flex-col items-center py-4 gap-2.5">
          {patients.slice(0, 5).map((patient) => {
            const config = statusConfig[patient.status as keyof typeof statusConfig]
            return (
              <div
                key={patient.id}
                className={cn(
                  "w-2.5 h-2.5 rounded-full transition-all",
                  patient.status === "verified" && "bg-success",
                  patient.status === "analyzing" && "bg-primary animate-pulse",
                  patient.status === "pending" && "bg-warning",
                )}
                title={`${patient.id}: ${config.label}`}
              />
            )
          })}
        </div>
      )}
    </aside>
  )
}
