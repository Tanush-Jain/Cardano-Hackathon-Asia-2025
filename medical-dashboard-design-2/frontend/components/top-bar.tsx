"use client"

import { useI18n } from "@/lib/i18n-context"
import { useTheme } from "@/lib/theme-context"
import { cn } from "@/lib/utils"
import { Bell, ChevronDown, Search, User } from "lucide-react"
import { useEffect, useRef, useState } from "react"

interface TopBarProps {
  activeTab: string
  closeAllTrigger?: number
}

export function TopBar({ activeTab, closeAllTrigger }: TopBarProps) {
  const { t } = useI18n()
  const { theme } = useTheme()
  const [showNotifications, setShowNotifications] = useState(false)
  const [showProfile, setShowProfile] = useState(false)
  const notificationsRef = useRef<HTMLDivElement>(null)
  const profileRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setShowNotifications(false)
    setShowProfile(false)
  }, [closeAllTrigger])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (notificationsRef.current && !notificationsRef.current.contains(event.target as Node)) {
        setShowNotifications(false)
      }
    }
    if (showNotifications) {
      document.addEventListener("mousedown", handleClickOutside)
      return () => document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showNotifications])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setShowProfile(false)
      }
    }
    if (showProfile) {
      document.addEventListener("mousedown", handleClickOutside)
      return () => document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [showProfile])

  const notifications = [
    { id: 1, message: "Analysis complete for Patient #A7X2", time: "2 min ago", unread: true },
    { id: 2, message: "New patient added to queue", time: "15 min ago", unread: true },
    { id: 3, message: "System update completed", time: "1 hour ago", unread: false },
  ]

  const unreadCount = notifications.filter((n) => n.unread).length

  return (
    <div
      className={cn(
        "h-16 rounded-xl flex items-center justify-between px-6 mb-6 border",
        theme === "dark" ? "bg-slate-900 border-slate-800" : "bg-white border-slate-200",
      )}
    >
      {/* Page Title */}
      <div>
        <h1 className={cn("text-lg font-semibold capitalize", theme === "dark" ? "text-white" : "text-slate-900")}>
          {t(activeTab)}
        </h1>
        <p className={cn("text-xs", theme === "dark" ? "text-slate-400" : "text-slate-500")}>Welcome back, Dr. Chen</p>
      </div>

      {/* Search Bar */}
      <div className="flex-1 max-w-md mx-8">
        <div className="relative">
          <Search
            className={cn(
              "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4",
              theme === "dark" ? "text-slate-500" : "text-slate-400",
            )}
          />
          <input
            type="text"
            placeholder={t("searchPlaceholder")}
            className={cn(
              "w-full h-10 pl-10 pr-4 rounded-lg text-sm border focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all",
              theme === "dark"
                ? "bg-slate-800 border-slate-700 text-white placeholder:text-slate-500"
                : "bg-slate-50 border-slate-200 text-slate-900 placeholder:text-slate-400",
            )}
          />
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-3">
        {/* Notifications - with click-outside ref */}
        <div className="relative" ref={notificationsRef}>
          <button
            onClick={() => {
              setShowNotifications(!showNotifications)
              setShowProfile(false)
            }}
            className={cn(
              "relative w-10 h-10 rounded-lg flex items-center justify-center transition-all",
              theme === "dark"
                ? "hover:bg-slate-800 text-slate-400 hover:text-white"
                : "hover:bg-slate-100 text-slate-500 hover:text-slate-900",
            )}
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-red-500 text-[10px] font-bold text-white flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div
              className={cn(
                "absolute right-0 top-full mt-2 w-80 rounded-xl shadow-lg border z-50 overflow-hidden",
                theme === "dark" ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200",
              )}
            >
              <div className={cn("p-3 border-b", theme === "dark" ? "border-slate-700" : "border-slate-200")}>
                <h3 className={cn("text-sm font-semibold", theme === "dark" ? "text-white" : "text-slate-900")}>
                  {t("notifications")}
                </h3>
              </div>
              <div className="max-h-64 overflow-auto">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => setShowNotifications(false)}
                    className={cn(
                      "px-3 py-3 border-b cursor-pointer transition-colors",
                      theme === "dark"
                        ? "border-slate-700/50 hover:bg-slate-700/50"
                        : "border-slate-100 hover:bg-slate-50",
                      notification.unread && (theme === "dark" ? "bg-cyan-500/5" : "bg-cyan-50"),
                    )}
                  >
                    <p className={cn("text-sm", theme === "dark" ? "text-slate-200" : "text-slate-700")}>
                      {notification.message}
                    </p>
                    <p className={cn("text-xs mt-1", theme === "dark" ? "text-slate-500" : "text-slate-400")}>
                      {notification.time}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Profile - with click-outside ref */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => {
              setShowProfile(!showProfile)
              setShowNotifications(false)
            }}
            className={cn(
              "flex items-center gap-2 h-10 px-3 rounded-lg transition-all",
              theme === "dark" ? "hover:bg-slate-800 text-slate-300" : "hover:bg-slate-100 text-slate-700",
            )}
          >
            <div
              className={cn(
                "w-7 h-7 rounded-lg flex items-center justify-center",
                theme === "dark" ? "bg-cyan-500/20" : "bg-cyan-500/10",
              )}
            >
              <User className="w-4 h-4 text-cyan-500" />
            </div>
            <span className="text-sm font-medium hidden sm:inline">Dr. Chen</span>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </button>

          {showProfile && (
            <div
              className={cn(
                "absolute right-0 top-full mt-2 w-48 rounded-xl shadow-lg border z-50 overflow-hidden",
                theme === "dark" ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200",
              )}
            >
              <div className={cn("p-3 border-b", theme === "dark" ? "border-slate-700" : "border-slate-200")}>
                <p className={cn("text-sm font-semibold", theme === "dark" ? "text-white" : "text-slate-900")}>
                  Dr. Sarah Chen
                </p>
                <p className={cn("text-xs", theme === "dark" ? "text-slate-400" : "text-slate-500")}>Radiologist</p>
              </div>
              <div className="p-1">
                <button
                  onClick={() => setShowProfile(false)}
                  className={cn(
                    "w-full px-3 py-2 text-sm text-left rounded-lg transition-colors",
                    theme === "dark" ? "text-slate-300 hover:bg-slate-700" : "text-slate-700 hover:bg-slate-100",
                  )}
                >
                  View Profile
                </button>
                <button
                  onClick={() => setShowProfile(false)}
                  className={cn(
                    "w-full px-3 py-2 text-sm text-left rounded-lg transition-colors",
                    theme === "dark" ? "text-slate-300 hover:bg-slate-700" : "text-slate-700 hover:bg-slate-100",
                  )}
                >
                  Account Settings
                </button>
                <button
                  onClick={() => setShowProfile(false)}
                  className="w-full px-3 py-2 text-sm text-left rounded-lg text-red-500 hover:bg-red-500/10 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
