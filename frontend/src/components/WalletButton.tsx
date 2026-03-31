import { ethers } from 'ethers'
import { useState, useEffect } from 'react'
import { Wallet, LogOut, ChevronDown } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

declare global {
  interface Window {
    ethereum?: {
      on: (event: string, callback: (accounts: string[]) => void) => void
      removeListener: (event: string, callback: (accounts?: string[]) => void) => void
      request: (args: { method: string }) => Promise<string[]>
    }
  }
}

interface WalletButtonProps {
  connected: boolean
  setConnected: (value: boolean) => void
  onAddressChange?: (address: string | null) => void
}

export default function WalletButton({ connected, setConnected, onAddressChange }: WalletButtonProps) {
  const [address, setAddress] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)

  const disconnectWallet = () => {
    setAddress(null)
    setConnected(false)
    setShowDropdown(false)
    localStorage.removeItem('walletAddress')
    if (onAddressChange) {
      onAddressChange(null)
    }
  }

  useEffect(() => {
    const storedAddress = localStorage.getItem('walletAddress')
    if (storedAddress && !connected) {
      const shortAddress = `${storedAddress.substring(0, 6)}...${storedAddress.substring(storedAddress.length - 4)}`
      setAddress(shortAddress)
      setConnected(true)
      if (onAddressChange) {
        onAddressChange(storedAddress)
      }
    }

    if (window.ethereum) {
      const handleAccountsChanged = (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnectWallet()
        } else if (accounts[0] !== storedAddress) {
          const newAddress = accounts[0]
          const shortAddress = `${newAddress.substring(0, 6)}...${newAddress.substring(newAddress.length - 4)}`
          setAddress(shortAddress)
          setConnected(true)
          localStorage.setItem('walletAddress', newAddress)
          if (onAddressChange) {
            onAddressChange(newAddress)
          }
        }
      }

      window.ethereum.on('accountsChanged', handleAccountsChanged)
      return () => {
        if (window.ethereum?.removeListener) {
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged as any)
        }
      }
    }
  }, [connected, onAddressChange])

  const connectWallet = async () => {
    setLoading(true)
    try {
      if (!window.ethereum) {
        alert('Please install MetaMask')
        return
      }

      const provider = new ethers.BrowserProvider(window.ethereum as any)
      const accounts = await provider.send('eth_requestAccounts', [])
      
      if (accounts.length > 0) {
        const shortAddress = `${accounts[0].substring(0, 6)}...${accounts[0].substring(accounts[0].length - 4)}`
        setAddress(shortAddress)
        setConnected(true)
        localStorage.setItem('walletAddress', accounts[0])
        if (onAddressChange) {
          onAddressChange(accounts[0])
        }
      }
    } catch (error) {
      console.error('Failed to connect wallet:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative">
      {connected ? (
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowDropdown(!showDropdown)}
            className="flex items-center gap-2 px-3 py-1.5 md:px-4 md:py-2 bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 text-white rounded-full font-bold text-xs md:text-sm transition-all shadow-[0_0_20px_rgba(59,130,246,0.1)]"
          >
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="font-mono">{address}</span>
            <ChevronDown className={`w-3 h-3 md:w-4 md:h-4 text-slate-400 transition-transform ${showDropdown ? 'rotate-180' : ''}`} />
          </motion.button>

          <AnimatePresence>
            {showDropdown && (
              <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                className="absolute right-0 top-full mt-2 w-48 glass-card rounded-2xl p-2 z-[110] border-white/10"
              >
                <div className="px-3 py-2 mb-1 border-b border-white/5">
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Connected Wallet</p>
                </div>
                <button
                  onClick={disconnectWallet}
                  className="w-full flex items-center justify-between px-3 py-2 text-sm font-semibold text-red-400 hover:bg-red-400/10 rounded-xl transition-all"
                >
                  <span>Disconnect</span>
                  <LogOut className="w-4 h-4" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ) : (
        <motion.button
          whileHover={{ scale: 1.02, y: -2 }}
          whileTap={{ scale: 0.98 }}
          onClick={connectWallet}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 md:px-6 md:py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-black text-sm rounded-full transition-all shadow-xl shadow-blue-900/20 disabled:opacity-50"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <Wallet className="w-4 h-4 md:w-5 md:h-5" />
              <span>Connect Wallet</span>
            </>
          )}
        </motion.button>
      )}
    </div>
  )
}
