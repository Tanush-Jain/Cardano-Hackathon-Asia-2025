import React, { createContext, useContext, useEffect, useState } from "react"

type Cip30Api = {
  enable: () => Promise<any>
  isEnabled?: () => Promise<boolean>
  getUsedAddresses?: () => Promise<string[]>
  getChangeAddress?: () => Promise<string>
  signData?: (address: string, payload: string) => Promise<{ signature: string } | any>
  signTx?: (txHex: string, partialSign?: boolean) => Promise<{ tx: string } | any>
  name?: string
}

type WalletState = {
  available: boolean
  connecting: boolean
  connected: boolean
  address: string | null
  api: Cip30Api | null
  connect: () => Promise<void>
  disconnect: () => void
  signData: (payload: string) => Promise<any>
  getAddresses: () => Promise<string[]>
}

const WalletContext = createContext<WalletState | null>(null)

export function WalletProvider({ children }: { children: React.ReactNode }) {
  const [available, setAvailable] = useState(false)
  const [connecting, setConnecting] = useState(false)
  const [connected, setConnected] = useState(false)
  const [address, setAddress] = useState<string | null>(null)
  const [api, setApi] = useState<Cip30Api | null>(null)

  useEffect(() => {
    // detect injected Cardano/CIP-30 wallets (Lace usually exposes window.cardano.lace)
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const injected = (window as any).cardano
    if (!injected) {
      setAvailable(false)
      return
    }
    // if lace present specifically
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const lace = injected.lace ?? injected // some wallets expose top-level cardano
    setAvailable(!!lace)
  }, [])

  async function connect() {
    if (!available) throw new Error("No Cardano wallet detected")
    setConnecting(true)
    try {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const injected = (window as any).cardano
      // prefer explicit lace provider if available
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const provider = injected?.lace ?? injected
      if (!provider) throw new Error("Wallet provider not found")
      const enabled: Cip30Api = await provider.enable()
      setApi(enabled)
      // try to read used addresses (CIP-30 returns hex-encoded addresses)
      const addrs = enabled.getUsedAddresses ? await enabled.getUsedAddresses() : []
      if (addrs && addrs.length) setAddress(addrs[0])
      setConnected(true)
      // persist basic state
      localStorage.setItem("wallet_connected", "1")
    } finally {
      setConnecting(false)
    }
  }

  function disconnect() {
    setApi(null)
    setConnected(false)
    setAddress(null)
    localStorage.removeItem("wallet_connected")
  }

  async function getAddresses() {
    if (!api || !api.getUsedAddresses) return []
    try {
      return await api.getUsedAddresses()
    } catch {
      return []
    }
  }

  async function signData(payload: string) {
    if (!api) throw new Error("Wallet not connected")
    if (!api.signData) throw new Error("signData not supported by wallet")
    // convert string -> hex (CIP-30 expects hex payload)
    const enc = new TextEncoder()
    const bytes = enc.encode(payload)
    const hex = Array.from(bytes)
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")
    return api.signData(address ?? (await getAddresses())[0], hex)
  }

  // auto-reconnect if previously connected and wallet still injected
  useEffect(() => {
    const prev = localStorage.getItem("wallet_connected")
    if (prev && available && !connected && !connecting) {
      // best-effort, ignore errors
      connect().catch(() => {})
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [available])

  const value: WalletState = {
    available,
    connecting,
    connected,
    address,
    api,
    connect,
    disconnect,
    signData,
    getAddresses,
  }

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>
}

export function useWallet() {
  const ctx = useContext(WalletContext)
  if (!ctx) {
    throw new Error("useWallet must be used inside WalletProvider")
  }
  return ctx
}