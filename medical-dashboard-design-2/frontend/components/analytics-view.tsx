"use client"

import { TrendingUp, Activity, Shield, Cpu, Database } from "lucide-react"

const stats = [
  { label: "Total Scans", value: "1,284", change: "+12%", trend: "up", icon: Activity },
  { label: "Accuracy Rate", value: "98.5%", change: "+0.3%", trend: "up", icon: TrendingUp },
  { label: "Avg. Processing", value: "2.3s", change: "-0.5s", trend: "up", icon: Cpu },
  { label: "Data Encrypted", value: "100%", change: "0%", trend: "neutral", icon: Shield },
]

const recentActivity = [
  { time: "2 min ago", event: "Scan PX-7821-003 completed", type: "success" },
  { time: "15 min ago", event: "Payment received: 10 ADA", type: "payment" },
  { time: "32 min ago", event: "New patient PX-7826 registered", type: "info" },
  { time: "1 hour ago", event: "MedSAM model updated to v2.1", type: "update" },
  { time: "2 hours ago", event: "Scan PX-7822-001 started", type: "info" },
]

const activityStyles: Record<string, string> = {
  success: "bg-emerald-500",
  payment: "bg-primary",
  info: "bg-blue-500",
  update: "bg-amber-500",
}

export function AnalyticsView() {
  return (
    <div className="h-full flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Analytics</h1>
        <p className="text-sm text-muted-foreground mt-1">System performance and usage metrics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <div key={stat.label} className="glass rounded-xl p-4 border border-border">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted-foreground">{stat.label}</span>
                <Icon className="w-4 h-4 text-primary" />
              </div>
              <div className="flex items-end justify-between">
                <span className="text-2xl font-semibold text-foreground">{stat.value}</span>
                <span
                  className={`text-xs font-medium ${
                    stat.trend === "up" ? "text-emerald-400" : "text-muted-foreground"
                  }`}
                >
                  {stat.change}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1">
        {/* Scan Volume Chart Placeholder */}
        <div className="glass rounded-xl p-5 border border-border flex flex-col">
          <h3 className="text-sm font-medium text-foreground mb-4">Scan Volume (Last 7 Days)</h3>
          <div className="flex-1 flex items-end gap-2 pb-4">
            {[65, 40, 80, 55, 90, 70, 85].map((height, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className="w-full bg-primary/30 rounded-t transition-all hover:bg-primary/50"
                  style={{ height: `${height}%` }}
                />
                <span className="text-xs text-muted-foreground">
                  {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"][i]}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="glass rounded-xl p-5 border border-border flex flex-col">
          <h3 className="text-sm font-medium text-foreground mb-4">Recent Activity</h3>
          <div className="flex-1 space-y-3 overflow-auto">
            {recentActivity.map((activity, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className={`w-2 h-2 rounded-full mt-1.5 ${activityStyles[activity.type]}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-foreground truncate">{activity.event}</p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* System Resources */}
      <div className="glass rounded-xl p-5 border border-border">
        <h3 className="text-sm font-medium text-foreground mb-4">System Resources</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { label: "GPU Utilization", value: 72, icon: Cpu },
            { label: "Memory Usage", value: 58, icon: Database },
            { label: "Network I/O", value: 34, icon: Activity },
          ].map((resource) => {
            const Icon = resource.icon
            return (
              <div key={resource.label} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Icon className="w-4 h-4" />
                    {resource.label}
                  </div>
                  <span className="text-foreground font-medium">{resource.value}%</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-primary rounded-full transition-all"
                    style={{ width: `${resource.value}%` }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
