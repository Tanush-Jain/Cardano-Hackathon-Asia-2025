"use client"

import { useState } from "react"
import { Shield, Bell, Key, Globe, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"

export function SettingsView() {
  const [notifications, setNotifications] = useState(true)
  const [zkProofs, setZkProofs] = useState(true)
  const [autoEncrypt, setAutoEncrypt] = useState(true)

  return (
    <div className="h-full flex flex-col gap-6 max-w-3xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
        <p className="text-sm text-muted-foreground mt-1">Configure your Aura AI preferences</p>
      </div>

      {/* Settings Sections */}
      <div className="space-y-6 flex-1 overflow-auto">
        {/* Privacy & Security */}
        <div className="glass rounded-xl p-5 border border-border">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Shield className="w-4 h-4 text-primary" />
            </div>
            <h3 className="font-medium text-foreground">Privacy & Security</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm text-foreground">Zero-Knowledge Proofs</Label>
                <p className="text-xs text-muted-foreground mt-0.5">Enable Midnight ZK for all transactions</p>
              </div>
              <Switch checked={zkProofs} onCheckedChange={setZkProofs} />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm text-foreground">Auto-Encrypt Uploads</Label>
                <p className="text-xs text-muted-foreground mt-0.5">Automatically encrypt all medical images</p>
              </div>
              <Switch checked={autoEncrypt} onCheckedChange={setAutoEncrypt} />
            </div>
          </div>
        </div>

        {/* Notifications */}
        <div className="glass rounded-xl p-5 border border-border">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Bell className="w-4 h-4 text-primary" />
            </div>
            <h3 className="font-medium text-foreground">Notifications</h3>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm text-foreground">Analysis Completed</Label>
                <p className="text-xs text-muted-foreground mt-0.5">Get notified when scan analysis is ready</p>
              </div>
              <Switch checked={notifications} onCheckedChange={setNotifications} />
            </div>
          </div>
        </div>

        {/* Wallet Configuration */}
        <div className="glass rounded-xl p-5 border border-border">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Key className="w-4 h-4 text-primary" />
            </div>
            <h3 className="font-medium text-foreground">Wallet Configuration</h3>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm text-foreground">Connected Wallet</Label>
              <Input value="addr1qx...7k9m" readOnly className="bg-card border-border font-mono text-sm" />
            </div>
            <div className="space-y-2">
              <Label className="text-sm text-foreground">Default Payment Amount</Label>
              <Input defaultValue="10" className="bg-card border-border" type="number" />
              <p className="text-xs text-muted-foreground">Amount in ADA for analysis fees</p>
            </div>
          </div>
        </div>

        {/* API Configuration */}
        <div className="glass rounded-xl p-5 border border-border">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Globe className="w-4 h-4 text-primary" />
            </div>
            <h3 className="font-medium text-foreground">API Configuration</h3>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm text-foreground">Masumi Node Endpoint</Label>
              <Input defaultValue="https://masumi.network/api/v1" className="bg-card border-border font-mono text-sm" />
            </div>
            <div className="space-y-2">
              <Label className="text-sm text-foreground">MedSAM Model Version</Label>
              <Input value="v2.1-stable" readOnly className="bg-card border-border font-mono text-sm" />
            </div>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <Button className="gap-2 glow-cyan-sm">
          <Save className="w-4 h-4" />
          Save Changes
        </Button>
      </div>
    </div>
  )
}
