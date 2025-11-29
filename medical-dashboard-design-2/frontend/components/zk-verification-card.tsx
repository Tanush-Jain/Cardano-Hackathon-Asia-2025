"use client"

import { useI18n } from "@/lib/i18n-context"
import { cn } from "@/lib/utils"
import { CheckCircle2, Hash, Loader2, Shield } from "lucide-react"
import { useEffect, useState } from "react"

interface ZkVerificationCardProps {
  isActive?: boolean
  onComplete?: () => void
}

type Step = "hashing" | "generating" | "verifying" | "complete"

export function ZkVerificationCard({ isActive = false, onComplete }: ZkVerificationCardProps) {
  const { t } = useI18n()
  const [currentStep, setCurrentStep] = useState<Step>("hashing")
  const [hashProgress, setHashProgress] = useState(0)
  const [txId, setTxId] = useState("")

  useEffect(() => {
    if (!isActive) {
      setCurrentStep("hashing")
      setHashProgress(0)
      setTxId("")
      return
    }

    // Step 1: Hashing Inputs
    const hashInterval = setInterval(() => {
      setHashProgress((prev) => {
        if (prev >= 100) {
          clearInterval(hashInterval)
          setCurrentStep("generating")
          return 100
        }
        return prev + 2
      })
    }, 50)

    return () => clearInterval(hashInterval)
  }, [isActive])

  useEffect(() => {
    if (currentStep === "generating") {
      const timeout = setTimeout(() => {
        setCurrentStep("verifying")
      }, 2500)
      return () => clearTimeout(timeout)
    }
  }, [currentStep])

  useEffect(() => {
    if (currentStep === "verifying") {
      const timeout = setTimeout(() => {
        setTxId(`0x${Math.random().toString(16).slice(2, 18)}`)
        setCurrentStep("complete")
        onComplete?.()
      }, 2000)
      return () => clearTimeout(timeout)
    }
  }, [currentStep, onComplete])

  const steps = [
    {
      id: "hashing",
      label: t("hashingInputs"),
      icon: Hash,
    },
    {
      id: "generating",
      label: t("generatingZkSnark"),
      icon: Shield,
    },
    {
      id: "verifying",
      label: t("onChainVerification"),
      icon: CheckCircle2,
    },
  ]

  const getStepStatus = (stepId: string) => {
    const stepOrder = ["hashing", "generating", "verifying", "complete"]
    const currentIndex = stepOrder.indexOf(currentStep)
    const stepIndex = stepOrder.indexOf(stepId)

    if (stepIndex < currentIndex || currentStep === "complete") return "complete"
    if (stepIndex === currentIndex) return "active"
    return "pending"
  }

  return (
    <div className="glass rounded-xl p-5 border border-border/30">
      <h3 className="text-sm font-semibold text-foreground mb-6 flex items-center gap-2">
        <Shield className="w-4 h-4 text-purple-400" />
        Zero-Knowledge Verification
      </h3>

      <div className="relative">
        {/* Connecting Line */}
        <div className="absolute left-[18px] top-8 bottom-8 w-0.5 bg-border/30" />
        <div
          className={cn(
            "absolute left-[18px] top-8 w-0.5 bg-purple-400 transition-all duration-500 glow-line",
            currentStep === "hashing" && "h-0",
            currentStep === "generating" && "h-[calc(33%-8px)]",
            currentStep === "verifying" && "h-[calc(66%-8px)]",
            currentStep === "complete" && "h-[calc(100%-64px)]",
          )}
        />

        {/* Steps */}
        <div className="space-y-8">
          {steps.map((step, index) => {
            const status = getStepStatus(step.id)
            const Icon = step.icon

            return (
              <div key={step.id} className="flex items-start gap-4 relative">
                {/* Step Circle */}
                <div
                  className={cn(
                    "w-9 h-9 rounded-full flex items-center justify-center shrink-0 border-2 transition-all duration-300 z-10",
                    status === "complete" && "bg-purple-500/20 border-purple-400 glow-cyan-sm",
                    status === "active" && "bg-purple-500/10 border-purple-400 animate-pulse",
                    status === "pending" && "bg-secondary border-border/50",
                  )}
                >
                  {status === "complete" ? (
                    <CheckCircle2 className="w-4 h-4 text-purple-400" />
                  ) : status === "active" && step.id === "generating" ? (
                    <Shield className="w-4 h-4 text-purple-400 animate-spin" />
                  ) : status === "active" ? (
                    <Loader2 className="w-4 h-4 text-purple-400 animate-spin" />
                  ) : (
                    <Icon className="w-4 h-4 text-muted-foreground" />
                  )}
                </div>

                {/* Step Content */}
                <div className="flex-1 pt-1.5">
                  <p
                    className={cn(
                      "text-sm font-medium mb-2",
                      status === "pending" ? "text-muted-foreground" : "text-foreground",
                    )}
                  >
                    {step.label}
                  </p>

                  {/* Step-specific content */}
                  {step.id === "hashing" && status === "active" && (
                    <div className="space-y-1.5">
                      <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-purple-400 rounded-full transition-all duration-100"
                          style={{ width: `${hashProgress}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground">{hashProgress}% complete</p>
                    </div>
                  )}

                  {step.id === "hashing" && status === "complete" && (
                    <p className="text-xs text-success font-mono">SHA256: 0x8f4a...e2c1</p>
                  )}

                  {step.id === "generating" && status === "active" && (
                    <div className="flex items-center gap-2">
                      <div className="relative w-6 h-6">
                        <Shield className="w-6 h-6 text-purple-400 animate-pulse" />
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="w-2 h-2 bg-purple-400 rounded-full animate-ping" />
                        </div>
                      </div>
                      <p className="text-xs text-purple-400">Generating proof...</p>
                    </div>
                  )}

                  {step.id === "generating" && status === "complete" && (
                    <p className="text-xs text-success font-mono">Proof: Valid (Groth16)</p>
                  )}

                  {step.id === "verifying" && status === "active" && (
                    <p className="text-xs text-primary animate-pulse">Submitting to Cardano...</p>
                  )}

                  {step.id === "verifying" && status === "complete" && txId && (
                    <div className="space-y-1">
                      <p className="text-xs text-success flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Verified on-chain
                      </p>
                      <p className="text-xs text-muted-foreground font-mono">TX: {txId}</p>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
