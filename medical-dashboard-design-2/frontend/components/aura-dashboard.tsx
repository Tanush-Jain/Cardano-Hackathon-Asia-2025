"use client"

import { useTheme } from "@/lib/theme-context"
import { cn } from "@/lib/utils"
import { useCallback, useEffect, useState } from "react"
import { AboutTeamView } from "./about-team-view"
import { AnalyticsView } from "./analytics-view"
import { BentoWorkspace } from "./bento-workspace"
import { DiagnosticDetailView } from "./diagnostic-detail-view"
import { LiveSystemConsole } from "./live-system-console"
import { NavSidebar } from "./nav-sidebar"
import { PatientQueue } from "./patient-queue"
import { PatientsView } from "./patients-view"
import { PaymentModal } from "./payment-modal"
import { SettingsView } from "./settings-view"
import { TopBar } from "./top-bar"
import { WelcomeToast } from "./welcome-toast"

export function AuraDashboard() {
  const [activeTab, setActiveTab] = useState("diagnostics")
  const [queueCollapsed, setQueueCollapsed] = useState(false)
  const [viewingAnalysis, setViewingAnalysis] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [analysisData, setAnalysisData] = useState<{ fileName: string } | null>(null)
  const [showWelcome, setShowWelcome] = useState(true)
  const [closeAllTrigger, setCloseAllTrigger] = useState(0)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true)
  const { theme, toggleTheme } = useTheme()

  const handleTabChange = useCallback((tab: string) => {
    setActiveTab(tab)
    setCloseAllTrigger((prev) => prev + 1)
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return

      switch (e.key.toLowerCase()) {
        case "d":
          handleTabChange("diagnostics")
          break
        case "p":
          handleTabChange("patients")
          break
        case "a":
          handleTabChange("analytics")
          break
        case "s":
          handleTabChange("settings")
          break
        case "t":
          toggleTheme()
          break
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [toggleTheme, handleTabChange])

  const handleStartAnalysis = (fileName: string) => {
    setAnalysisData({ fileName })
    setShowPaymentModal(true)
  }

  const handlePaymentComplete = () => {
    setShowPaymentModal(false)
    setViewingAnalysis(true)
  }

  const handleBackToUpload = () => {
    setViewingAnalysis(false)
    setAnalysisData(null)
  }

  const renderMainContent = () => {
    if (viewingAnalysis && activeTab === "diagnostics") {
      return <DiagnosticDetailView onBack={handleBackToUpload} />
    }

    switch (activeTab) {
      case "patients":
        return <PatientsView />
      case "diagnostics":
        return <BentoWorkspace onStartAnalysis={handleStartAnalysis} />
      case "analytics":
        return <AnalyticsView />
      case "settings":
        return <SettingsView />
      case "about":
        return <AboutTeamView />
      default:
        return <BentoWorkspace onStartAnalysis={handleStartAnalysis} />
    }
  }

  return (
    <div className={cn("flex h-screen overflow-hidden pb-48", theme === "dark" ? "bg-slate-950" : "bg-slate-50")}>
      <NavSidebar
        activeTab={activeTab}
        onTabChange={handleTabChange}
        closeAllTrigger={closeAllTrigger}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      />

      {/* Center Workspace */}
      <main className="flex-1 p-6 overflow-auto flex flex-col">
        <TopBar activeTab={activeTab} closeAllTrigger={closeAllTrigger} />

        <div className="flex-1 overflow-auto">{renderMainContent()}</div>
      </main>

      {/* Right Context Panel - hide when viewing analysis for more space */}
      {activeTab === "diagnostics" && !viewingAnalysis && (
        <PatientQueue collapsed={queueCollapsed} onToggle={() => setQueueCollapsed(!queueCollapsed)} />
      )}

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onPaymentComplete={handlePaymentComplete}
        fileName={analysisData?.fileName}
      />

      {/* Live System Console */}
      <LiveSystemConsole />

      {/* Welcome toast for first-time users */}
      {showWelcome && <WelcomeToast onDismiss={() => setShowWelcome(false)} />}
    </div>
  )
}
