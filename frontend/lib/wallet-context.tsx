"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

declare global {
  interface Window {
    cardano?: {
      lace?: {
        enable: () => Promise<any>
        isEnabled: () => Promise<boolean>
        getBalance: () => Promise<string>
        getUtxos: () => Promise<string[]>
        getChangeAddress: () => Promise<string>
        getRewardAddresses: () => Promise<string[]>
        signTx: (tx: string, partialSign?: boolean) => Promise<string>
        submitTx: (tx: string) => Promise<string>
        getUsedAddresses: () => Promise<string[]>
        getUnusedAddresses: () => Promise<string[]>
      }
    }
  }
}

interface WalletContextType {
  wallet: any | null
  isConnected: boolean
  balance: string | null
  address: string | null
  connectWallet: () => Promise<void>
  disconnectWallet: () => void
  signAndSubmitTx: (tx: string) => Promise<string>
}

const WalletContext = createContext<WalletContextType | undefined>(undefined)

export function WalletProvider({ children }: { children: ReactNode }) {
  const [wallet, setWallet] = useState<any | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [balance, setBalance] = useState<string | null>(null)
  const [address, setAddress] = useState<string | null>(null)

  const connectWallet = async () => {
    try {
      if (!window.cardano?.lace) {
        throw new Error('Lace wallet not found. Please install Lace wallet extension.')
      }

      const walletApi = await window.cardano.lace.enable()
      setWallet(walletApi)
      setIsConnected(true)

      // Get wallet info
      const balance = await walletApi.getBalance()
      const addresses = await walletApi.getChangeAddress()

      setBalance(balance)
      setAddress(addresses)
    } catch (error) {
      console.error('Failed to connect wallet:', error)
      throw error
    }
  }

  const disconnectWallet = () => {
    setWallet(null)
    setIsConnected(false)
    setBalance(null)
    setAddress(null)
  }

  const signAndSubmitTx = async (tx: string): Promise<string> => {
    if (!wallet) {
      throw new Error('Wallet not connected')
    }

    try {
      const signedTx = await wallet.signTx(tx)
      const txHash = await wallet.submitTx(signedTx)
      return txHash
    } catch (error) {
      console.error('Transaction failed:', error)
      throw error
    }
  }

  // Check if wallet was previously connected
  useEffect(() => {
    const checkWalletConnection = async () => {
      if (window.cardano?.lace) {
        try {
          const isEnabled = await window.cardano.lace.isEnabled()
          if (isEnabled) {
            await connectWallet()
          }
        } catch (error) {
          console.log('Wallet not previously connected')
        }
      }
    }

    checkWalletConnection()
  }, [])

  return (
    <WalletContext.Provider
      value={{
        wallet,
        isConnected,
        balance,
        address,
        connectWallet,
        disconnectWallet,
        signAndSubmitTx,
      }}
    >
      {children}
    </WalletContext.Provider>
  )
}

export function useWallet() {
  const context = useContext(WalletContext)
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider')
  }
  return context
}
