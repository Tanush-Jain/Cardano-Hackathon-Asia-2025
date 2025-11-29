"use client"

import { uploadToAgent, type AnalysisResult } from "@/lib/api"
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
  const [analysisData, setAnalysisData] = useState<{ fileName: string; file: File } | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null)
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
        case "d": handleTabChange("diagnostics"); break
        case "p": handleTabChange("patients"); break
        case "a": handleTabChange("analytics"); break
        case "s": handleTabChange("settings"); break
        case "t": toggleTheme(); break
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [toggleTheme, handleTabChange])

  const handleStartAnalysis = (file: File) => {
    console.log('📁 [Dashboard] File selected:', file.name)
    setAnalysisData({ fileName: file.name, file: file })
    setShowPaymentModal(true)
  }

  const handlePaymentComplete = async () => {
    if (!analysisData?.file) {
      console.error('❌ No file to analyze')
      return
    }

    setShowPaymentModal(false)
    setIsAnalyzing(true)

    try {
      console.log('🚀 [Dashboard] Starting analysis pipeline...')
      const result = await uploadToAgent(analysisData.file)
      
      console.log('✅ [Dashboard] Analysis complete!')
      console.log('   Result:', result)
      
      setAnalysisResult(result)
      setViewingAnalysis(true)
    } catch (error) {
      console.error('❌ [Dashboard] Analysis failed:', error)
      alert('Failed to connect to backend. Check console and ensure Python server is running on port 8000.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const renderMainContent = () => {
    switch (activeTab) {
      case "patients": return <PatientsView />
      case "diagnostics": 
        return <BentoWorkspace onStartAnalysis={handleStartAnalysis} />
      case "analytics": return <AnalyticsView />
      case "settings": return <SettingsView />
      case "about": return <AboutTeamView />
      default: return <BentoWorkspace onStartAnalysis={handleStartAnalysis} />
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

      <main className="flex-1 p-6 overflow-auto flex flex-col relative">
        <TopBar activeTab={activeTab} closeAllTrigger={closeAllTrigger} />

        <div className="flex-1 overflow-auto">
          {renderMainContent()}
        </div>

        {isAnalyzing && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center">
            <div className="w-16 h-16 border-4 border-slate-700 border-t-cyan-500 rounded-full animate-spin mb-6"></div>
            <h3 className="text-2xl font-bold text-white mb-2">Running MedSAM Analysis</h3>
            <p className="text-cyan-400 font-mono animate-pulse">Generating Segmentation & ZK-Proof...</p>
          </div>
        )}
      </main>

      {activeTab === "diagnostics" && !viewingAnalysis && (
        <PatientQueue collapsed={queueCollapsed} onToggle={() => setQueueCollapsed(!queueCollapsed)} />
      )}

      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        onPaymentComplete={handlePaymentComplete}
        fileName={analysisData?.fileName}
      />

      {viewingAnalysis && analysisResult && (
        <DiagnosticDetailView
          fileName={analysisData?.fileName}
          analysisResult={analysisResult}
          onClose={() => {
            console.log('🔙 [Dashboard] Closing detail view')
            setViewingAnalysis(false)
            setAnalysisResult(null)
          }}
        />
      )}

      <LiveSystemConsole />

      {showWelcome && <WelcomeToast onDismiss={() => setShowWelcome(false)} />}
    </div>
  )
}