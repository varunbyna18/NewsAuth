import { Link, useLocation } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LayoutDashboard, Info, PlusCircle, Menu, X, Newspaper } from 'lucide-react'
import WalletButton from './WalletButton'

interface NavbarProps {
  connected: boolean
  setConnected: (value: boolean) => void
  onAddressChange?: (address: string | null) => void
}

export default function Navbar({ connected, setConnected, onAddressChange }: NavbarProps) {
  const location = useLocation()
  const [isOpen, setIsOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  const isActive = (path: string) => location.pathname === path

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const navLinks = [
    { name: 'Submit News', path: '/', icon: PlusCircle },
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'About', path: '/about', icon: Info },
  ]

  return (
    <nav 
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${
        scrolled ? 'nav-blur border-b border-white/10 py-3 shadow-2xl' : 'bg-transparent py-5'
      }`}
    >
      <div className="container mx-auto px-4 md:px-6">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center group">
            <motion.div 
              whileHover={{ rotate: [0, -10, 10, 0] }}
              transition={{ duration: 0.5 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-blue-500/20 blur-xl rounded-full scale-110 group-hover:scale-150 transition-transform duration-500" />
              <Newspaper className="w-8 h-8 md:w-9 md:h-9 text-blue-500 relative z-10" />
            </motion.div>
            <div className="ml-3 flex flex-col">
              <span className="text-xl md:text-2xl font-black text-white leading-none tracking-tight">News<span className="text-blue-500">Auth</span></span>
              <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold hidden sm:inline leading-none mt-1">AI-Powered Verification</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-2 px-4 py-2 rounded-full font-semibold text-sm transition-all duration-300 ${
                  isActive(link.path) 
                    ? 'bg-blue-500/10 text-white border border-blue-500/20 shadow-[0_0_20px_rgba(59,130,246,0.1)]' 
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <link.icon className={`w-4 h-4 ${isActive(link.path) ? 'text-blue-400' : ''}`} />
                {link.name}
              </Link>
            ))}
            <div className="ml-4 pl-4 border-l border-white/10">
              <WalletButton connected={connected} setConnected={setConnected} onAddressChange={onAddressChange} />
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center space-x-4">
            <WalletButton connected={connected} setConnected={setConnected} onAddressChange={onAddressChange} />
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="p-2 text-slate-300 hover:text-white bg-white/5 rounded-xl border border-white/10 transition-colors"
            >
              {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="md:hidden glass-card-hover bg-slate-900 border-b border-white/10 overflow-hidden"
          >
            <div className="container mx-auto px-4 py-6 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`flex items-center gap-4 px-5 py-4 rounded-2xl font-bold transition-all ${
                    isActive(link.path) 
                      ? 'bg-blue-500/10 text-white border border-blue-500/20' 
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                  onClick={() => setIsOpen(false)}
                >
                  <link.icon className={`w-6 h-6 ${isActive(link.path) ? 'text-blue-400' : ''}`} />
                  <span className="text-lg">{link.name}</span>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  )
}
