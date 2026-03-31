import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Navbar from './components/Navbar'
import SubmitNews from './pages/SubmitNews'
import Dashboard from './pages/Dashboard'
import About from './pages/About'
import './App.css'

function AnimatedRoutes({ 
  connected, 
  walletAddress 
}: { 
  connected: boolean, 
  walletAddress: string | null
}) {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        transition={{ duration: 0.3 }}
        className="container mx-auto px-4 py-8 md:py-12"
      >
        <Routes location={location}>
          <Route 
            path="/" 
            element={<SubmitNews connected={connected} walletAddress={walletAddress || undefined} />} 
          />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/about" element={<About />} />
        </Routes>
      </motion.div>
    </AnimatePresence>
  );
}

function App() {
  const [connected, setConnected] = useState(false)
  const [walletAddress, setWalletAddress] = useState<string | null>(null)

  return (
    <Router>
      <div className="min-h-screen bg-mesh selection:bg-indigo-500/30">
        <Navbar 
          connected={connected} 
          setConnected={setConnected}
          onAddressChange={setWalletAddress}
        />
        
        <main className="relative z-10">
          <AnimatedRoutes 
            connected={connected} 
            walletAddress={walletAddress}
          />
        </main>

        <footer className="footer-gradient pt-24 pb-12">
          <div className="container mx-auto px-4 border-t border-white/5 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex flex-col items-center md:items-start">
                <p className="text-slate-400 text-sm font-medium">
                  © 2024 NewsAuth. All rights reserved.
                </p>
                <p className="text-slate-500 text-xs mt-1">
                  Powered by Azure AI & Ethereum Blockchain
                </p>
              </div>
              <div className="flex space-x-6 text-sm text-slate-400">
                <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
                <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
                <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Github</a>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </Router>
  )
}

export default App
