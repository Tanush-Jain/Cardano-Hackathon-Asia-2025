"use client"

import { useI18n } from "@/lib/i18n-context"
import { useTheme } from "@/lib/theme-context"
import { cn } from "@/lib/utils"
import {
  Activity,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  Globe,
  HelpCircle,
  Info,
  Moon,
  Settings,
  Sun,
  Users,
  Zap,
} from "lucide-react"
import { useEffect, useRef, useState } from "react"

interface NavSidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
  closeAllTrigger?: number
  isCollapsed: boolean
  onToggleCollapse: () => void
}

const navItems = [
  { id: "patients", icon: Users, labelKey: "patients" },
  { id: "diagnostics", icon: Activity, labelKey: "diagnostics" },
  { id: "analytics", icon: BarChart3, labelKey: "analytics" },
  { id: "settings", icon: Settings, labelKey: "settings" },
  { id: "about", icon: Info, labelKey: "about" },
]

export function NavSidebar({
  activeTab,
  onTabChange,
  closeAllTrigger,
  isCollapsed,
  onToggleCollapse,
}: NavSidebarProps) {
  const { theme, toggleTheme } = useTheme()
  const { t, language, setLanguage, languages } = useI18n()
  const [showLangMenu, setShowLangMenu] = useState(false)
  const langMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setShowLangMenu(false)
  }, [closeAllTrigger])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (langMenuRef.current && !langMenuRef.current.contains(event.target as Node)) {
        setShowLangMenu(false)
      }
    }
    if (showLangMenu) {
      document.addEventListener("mousedown", handleClickOutside)
      return () => document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showLangMenu])

  return (
    <aside
      className={cn(
        "h-full flex flex-col py-6 border-r transition-all duration-300 relative",
        isCollapsed ? "w-20 px-3" : "w-64 px-4",
        theme === "dark" ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200",
      )}
    >
      <button
        onClick={onToggleCollapse}
        className={cn(
          "absolute -right-3 top-8 w-6 h-6 rounded-full border flex items-center justify-center z-10 transition-colors",
          theme === "dark"
            ? "bg-slate-800 border-slate-700 text-slate-400 hover:text-white hover:bg-slate-700"
            : "bg-white border-slate-200 text-slate-500 hover:text-slate-900 hover:bg-slate-50",
        )}
      >
        {isCollapsed ? <ChevronRight className="w-3 h-3" /> : <ChevronLeft className="w-3 h-3" />}
      </button>

      {/* Logo */}
      <div className={cn("flex items-center gap-3 mb-8", isCollapsed ? "justify-center px-0" : "px-2")}>
        <div
          className={cn(
            "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0",
            theme === "dark" ? "bg-cyan-500/20" : "bg-cyan-500/10",
          )}
        >
          <Zap className="w-5 h-5 text-cyan-500" />
        </div>
        {!isCollapsed && (
          <div>
            <h1 className={cn("text-lg font-semibold", theme === "dark" ? "text-white" : "text-slate-900")}>Aura AI</h1>
            <p className={cn("text-xs", theme === "dark" ? "text-slate-400" : "text-slate-500")}>Medical Diagnostics</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex flex-col gap-1 flex-1">
        {!isCollapsed && (
          <p
            className={cn(
              "text-xs font-medium uppercase tracking-wider px-3 mb-2",
              theme === "dark" ? "text-slate-500" : "text-slate-400",
            )}
          >
            Menu
          </p>
        )}
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.id
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              title={isCollapsed ? t(item.labelKey) : undefined}
              className={cn(
                "h-11 rounded-lg flex items-center gap-3 transition-all",
                isCollapsed ? "justify-center px-0" : "px-3",
                isActive
                  ? theme === "dark"
                    ? "bg-cyan-500/15 text-cyan-400"
                    : "bg-cyan-500/10 text-cyan-600"
                  : theme === "dark"
                    ? "text-slate-400 hover:bg-slate-800 hover:text-white"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
              )}
            >
              <Icon className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && <span className="text-sm font-medium">{t(item.labelKey)}</span>}
            </button>
          )
        })}
      </nav>

      {/* Bottom Controls */}
      <div
        className={cn("flex flex-col gap-1 pt-4 border-t", theme === "dark" ? "border-slate-800" : "border-slate-200")}
      >
        {!isCollapsed && (
          <p
            className={cn(
              "text-xs font-medium uppercase tracking-wider px-3 mb-2",
              theme === "dark" ? "text-slate-500" : "text-slate-400",
            )}
          >
            Preferences
          </p>
        )}

        {/* Language Selector */}
        <div className="relative" ref={langMenuRef}>
          <button
            onClick={() => setShowLangMenu(!showLangMenu)}
            title={isCollapsed ? t("language") : undefined}
            className={cn(
              "w-full h-11 rounded-lg flex items-center gap-3 transition-all",
              isCollapsed ? "justify-center px-0" : "px-3",
              theme === "dark"
                ? "text-slate-400 hover:bg-slate-800 hover:text-white"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
            )}
          >
            <Globe className="w-5 h-5 flex-shrink-0" />
            {!isCollapsed && <span className="text-sm font-medium">{t("language")}</span>}
          </button>
          {showLangMenu && (
            <div
              className={cn(
                "absolute left-full ml-2 bottom-0 rounded-lg shadow-lg border p-2 z-50 min-w-36",
                theme === "dark" ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200",
              )}
            >
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setLanguage(lang.code)
                    setShowLangMenu(false)
                  }}
                  className={cn(
                    "w-full px-3 py-2 text-sm text-left rounded-md transition-colors",
                    language === lang.code
                      ? "text-cyan-500 bg-cyan-500/10"
                      : theme === "dark"
                        ? "text-slate-300 hover:bg-slate-700"
                        : "text-slate-700 hover:bg-slate-100",
                  )}
                >
                  {lang.name}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Theme Toggle */}
        <button
          onClick={toggleTheme}
          title={isCollapsed ? (theme === "dark" ? t("lightMode") : t("darkMode")) : undefined}
          className={cn(
            "w-full h-11 rounded-lg flex items-center gap-3 transition-all",
            isCollapsed ? "justify-center px-0" : "px-3",
            theme === "dark"
              ? "text-slate-400 hover:bg-slate-800 hover:text-white"
              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
          )}
        >
          {theme === "dark" ? (
            <>
              <Sun className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && <span className="text-sm font-medium">{t("lightMode")}</span>}
            </>
          ) : (
            <>
              <Moon className="w-5 h-5 flex-shrink-0" />
              {!isCollapsed && <span className="text-sm font-medium">{t("darkMode")}</span>}
            </>
          )}
        </button>

        <button
          title={isCollapsed ? t("helpSupport") : undefined}
          className={cn(
            "w-full h-11 rounded-lg flex items-center gap-3 transition-all",
            isCollapsed ? "justify-center px-0" : "px-3",
            theme === "dark"
              ? "text-slate-400 hover:bg-slate-800 hover:text-white"
              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
          )}
        >
          <HelpCircle className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && <span className="text-sm font-medium">{t("helpSupport")}</span>}
        </button>
      </div>
    </aside>
  )
}
