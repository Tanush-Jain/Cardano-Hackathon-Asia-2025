"use client"

import { cn } from "@/lib/utils"
import { Bot, CheckCircle2, Cpu, Loader2, Lock, Shield, X } from "lucide-react"
import { useEffect, useState } from "react"

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  onPaymentComplete: () => void
  fileName?: string
}

type PaymentStatus = "idle" | "waiting" | "confirming" | "locked"

export function PaymentModal({ isOpen, onClose, onPaymentComplete, fileName }: PaymentModalProps) {
  const [status, setStatus] = useState<PaymentStatus>("idle")

  useEffect(() => {
    if (!isOpen) {
      setStatus("idle")
    }
  }, [isOpen])

  const handlePay = () => {
    setStatus("waiting")
    setTimeout(() => setStatus("confirming"), 2000)
    setTimeout(() => setStatus("locked"), 4000)
    setTimeout(() => onPaymentComplete(), 5000)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={status === "idle" ? onClose : undefined}
      />

      {/* Modal */}
      <div className="relative w-full max-w-md mx-4 rounded-2xl bg-card border border-border shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-secondary/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-foreground">Masumi Secure Escrow</h2>
              <p className="text-xs text-muted-foreground">Decentralized AI Payment Protocol</p>
            </div>
          </div>
          {status === "idle" && (
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-secondary transition-colors">
              <X className="w-5 h-5 text-muted-foreground" />
            </button>
          )}
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Agent Details */}
          <div className="space-y-3">
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Agent Details</h3>
            <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/50 border border-border">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <Bot className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground">Aura MedSAM v2</p>
                <p className="text-xs text-muted-foreground">Cancer Segmentation Service</p>
              </div>
              <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-success/10 border border-success/20">
                <span className="w-1.5 h-1.5 rounded-full bg-success" />
                <span className="text-xs text-success font-medium">Verified</span>
              </div>
            </div>
          </div>

          {/* Cost Breakdown */}
          <div className="space-y-3">
            <h3 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Cost Breakdown</h3>
            <div className="rounded-lg bg-secondary/50 border border-border overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-foreground">Compute Fee</span>
                </div>
                <span className="text-sm font-mono font-medium text-foreground">8 ADA</span>
              </div>
              <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                <div className="flex items-center gap-2">
                  <Lock className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-foreground">Privacy Fee</span>
                </div>
                <span className="text-sm font-mono font-medium text-foreground">2 ADA</span>
              </div>
              <div className="flex items-center justify-between px-4 py-3 bg-primary/5">
                <span className="text-sm font-medium text-foreground">Total</span>
                <span className="text-lg font-mono font-bold text-primary">10 ADA</span>
              </div>
            </div>
          </div>

          {/* Privacy Guarantee */}
          <div className="p-4 rounded-lg bg-success/5 border border-success/20">
            <div className="flex items-start gap-3">
              <Shield className="w-5 h-5 text-success mt-0.5" />
              <div>
                <p className="text-sm font-medium text-success">Zero-Knowledge Proof Enabled</p>
                <p className="text-xs text-success/80 mt-1">
                  Patient data never leaves this enclave. Powered by Midnight Protocol.
                </p>
              </div>
            </div>
          </div>

          {/* Action */}
          <button
            onClick={handlePay}
            disabled={status !== "idle"}
            className={cn(
              "w-full py-3.5 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-2",
              status === "idle"
                ? "bg-primary text-primary-foreground hover:bg-primary/90 glow-cyan-sm"
                : "bg-secondary text-muted-foreground cursor-not-allowed",
            )}
          >
            {status === "idle" ? (
              <>
                <img src="/lace-wallet-logo.png" alt="Lace" className="w-5 h-5" />
                Pay with Lace
              </>
            ) : status === "waiting" ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Waiting for Transaction...
              </>
            ) : status === "confirming" ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Confirming on Cardano...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4 text-success" />
                Payment Locked
              </>
            )}
          </button>

          {/* Status Indicator */}
          {status !== "idle" && (
            <div className="flex items-center justify-center gap-2">
              <div
                className={cn(
                  "w-2 h-2 rounded-full transition-colors",
                  status === "waiting"
                    ? "bg-warning animate-pulse"
                    : status === "confirming"
                      ? "bg-primary animate-pulse"
                      : "bg-success",
                )}
              />
              <span className="text-xs text-muted-foreground font-mono">
                {status === "waiting" && "Awaiting wallet signature..."}
                {status === "confirming" && "Block confirmation in progress..."}
                {status === "locked" && "Escrow secured. Starting analysis..."}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
