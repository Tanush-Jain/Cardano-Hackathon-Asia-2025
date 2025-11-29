import { AlertCircle, ChevronRight, Loader2, ShieldCheck, Wallet } from "lucide-react"
import { useState } from "react"

interface PaymentModalProps {
  isOpen: boolean
  onClose: () => void
  onPaymentComplete: () => void
  fileName?: string
}

export function PaymentModal({ isOpen, onClose, onPaymentComplete, fileName }: PaymentModalProps) {
  // --- DEMO STATE ---
  // We ignore the real wallet hooks and use local state to simulate the flow
  const [demoStep, setDemoStep] = useState<'CONNECT' | 'PAY' | 'SUCCESS'>('CONNECT')
  const [isProcessing, setIsProcessing] = useState(false)

  // 1. SIMULATE CONNECTION
  const handleMockConnect = () => {
    setIsProcessing(true)
    setTimeout(() => {
        setIsProcessing(false)
        setDemoStep('PAY')
    }, 800) // Small delay to feel real
  }

  // 2. SIMULATE PAYMENT
  const handleMockPay = async () => {
    setIsProcessing(true)
    
    // Simulate Blockchain Delays
    console.log("💸 Building Transaction...")
    await new Promise(r => setTimeout(r, 1000))
    console.log("✍️ Requesting Signature...")
    await new Promise(r => setTimeout(r, 1000))
    
    setDemoStep('SUCCESS')
    console.log("✅ Transaction Confirmed")
    
    // Close and trigger AI
    setTimeout(() => {
        onPaymentComplete()
        // Reset for next time
        setTimeout(() => setDemoStep('CONNECT'), 500) 
    }, 1500)
    
    setIsProcessing(false)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-white/10 p-8 rounded-3xl w-full max-w-lg shadow-2xl relative overflow-hidden">
        
        {/* Ambient Glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-[50px] pointer-events-none" />

        <div className="flex justify-between items-start mb-6">
          <div>
            <h2 className="text-2xl font-bold text-white flex items-center gap-2">
              <ShieldCheck className="text-cyan-400" /> Secure Payment
            </h2>
            <p className="text-slate-400 text-sm mt-1">Masumi Protocol Escrow</p>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-white transition-colors">✕</button>
        </div>

        {/* --- STEP 1: CONNECT WALLET (SIMULATED) --- */}
        {demoStep === 'CONNECT' && (
          <div className="text-center py-8 animate-in slide-in-from-right duration-300">
            <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <Wallet className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-slate-300 mb-6">Connect your CIP-30 Wallet to proceed.</p>
            
            <div className="flex justify-center">
              <button 
                onClick={handleMockConnect}
                disabled={isProcessing}
                className="bg-white text-black hover:bg-gray-200 px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition-all active:scale-95"
              >
                {isProcessing ? (
                    <>Connecting...</>
                ) : (
                    <>Connect Wallet <ChevronRight size={16} /></>
                )}
              </button>
            </div>
            <p className="mt-4 text-xs text-slate-500">Supports Lace, Nami, Eternl</p>
          </div>
        )}

        {/* --- STEP 2: PAY (SIMULATED) --- */}
        {(demoStep === 'PAY' || demoStep === 'SUCCESS') && (
          <div className="space-y-6 animate-in slide-in-from-right duration-300">
            <div className="bg-slate-800/50 p-4 rounded-xl border border-white/5">
              <div className="flex justify-between mb-2">
                <span className="text-slate-400">Connected With</span>
                <span className="text-white font-medium flex items-center gap-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div> Lace Wallet
                </span>
              </div>
              <div className="flex justify-between items-center text-lg">
                <span className="text-slate-200">Service Fee</span>
                <span className="font-bold text-cyan-400 text-xl">10.00 ₳</span>
              </div>
              {fileName && (
                 <div className="mt-2 text-xs text-slate-500 text-right truncate">File: {fileName}</div>
              )}
            </div>

            {demoStep === 'SUCCESS' ? (
              <div className="bg-green-500/10 border border-green-500/20 p-4 rounded-xl text-center animate-in zoom-in duration-300">
                <p className="text-green-400 font-bold mb-1">Payment Successful!</p>
                <p className="text-xs text-green-300/70 break-all font-mono">
                    8a60264b21e872806c866f0c45321f3c956f1b9ec
                </p>
              </div>
            ) : (
              <button 
                onClick={handleMockPay}
                disabled={isProcessing}
                className="w-full py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white rounded-xl font-bold text-lg shadow-lg shadow-cyan-500/20 transition-all flex items-center justify-center gap-2"
              >
                {isProcessing ? (
                  <>
                    <Loader2 className="animate-spin" />
                    Verifying on Ledger...
                  </>
                ) : (
                  "Confirm Payment"
                )}
              </button>
            )}
            
            <p className="text-xs text-slate-500 text-center flex items-center justify-center gap-1">
              <AlertCircle size={12} /> Powered by Cardano Mesh SDK
            </p>
          </div>
        )}
      </div>
    </div>
  )
}