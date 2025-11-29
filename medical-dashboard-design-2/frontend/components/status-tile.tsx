import { cn } from "@/lib/utils"
import type { LucideIcon } from "lucide-react"

interface StatusTileProps {
  icon: LucideIcon
  label: string
  value: string
  status: "success" | "warning" | "error" | "info"
}

const statusStyles = {
  success: {
    bg: "bg-success/10",
    border: "border-success/25",
    text: "text-success",
    dot: "bg-success",
    glow: "shadow-[0_0_12px_rgba(34,197,94,0.2)]",
  },
  warning: {
    bg: "bg-warning/10",
    border: "border-warning/25",
    text: "text-warning",
    dot: "bg-warning",
    glow: "shadow-[0_0_12px_rgba(234,179,8,0.2)]",
  },
  error: {
    bg: "bg-destructive/10",
    border: "border-destructive/25",
    text: "text-destructive",
    dot: "bg-destructive",
    glow: "shadow-[0_0_12px_rgba(239,68,68,0.2)]",
  },
  info: {
    bg: "bg-primary/10",
    border: "border-primary/25",
    text: "text-primary",
    dot: "bg-primary",
    glow: "glow-cyan-subtle",
  },
}

export function StatusTile({ icon: Icon, label, value, status }: StatusTileProps) {
  const styles = statusStyles[status]

  return (
    <div
      className={cn(
        "rounded-2xl glass p-4 flex flex-col justify-between hover:bg-white/[0.08] transition-all duration-200 cursor-default",
        styles.glow,
      )}
    >
      <div className="flex items-center justify-between">
        <div
          className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center border backdrop-blur-sm",
            styles.bg,
            styles.border,
          )}
        >
          <Icon className={cn("w-5 h-5", styles.text)} />
        </div>
        <span className={cn("w-2.5 h-2.5 rounded-full animate-pulse", styles.dot)} />
      </div>
      <div className="mt-4">
        <p className="text-xs text-muted-foreground font-medium">{label}</p>
        <p className={cn("text-sm font-semibold mt-0.5", styles.text)}>{value}</p>
      </div>
    </div>
  )
}
