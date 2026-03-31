import { useState } from 'react'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText, Link as LinkIcon, AlertCircle, CheckCircle, ShieldAlert, Zap, Globe, Cpu, Database } from 'lucide-react'
import AnalysisResult from '../components/AnalysisResult'

interface AnalysisData {
  sentiment: {
    score: number
    label: string
  }
  keyPhrases: string[]
  credibilityScore: number
  ipfsHash: string
  transactionHash: string
}

interface SubmitNewsProps {
  connected: boolean
  walletAddress?: string
}

const inputTypes = [
  { id: 'text', label: 'Paste Text', icon: FileText },
  { id: 'url', label: 'News URL', icon: LinkIcon },
]

export default function SubmitNews({ connected, walletAddress }: SubmitNewsProps) {
  const [inputType, setInputType] = useState<'text' | 'url'>('text')
  const [content, setContent] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<AnalysisData | null>(null)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!connected) {
      setError('Please connect your wallet first')
      return
    }

    if (!content.trim()) {
      setError('Please enter news content or URL')
      return
    }

    setLoading(true)
    setError('')
    setResult(null)

    try {
      const response = await axios.post('/api/analyze', {
        type: inputType,
        content: content,
        walletAddress: walletAddress || 'anonymous',
      })

      setResult(response.data)
    } catch (err: any) {
      const errorMessage = err.response?.data?.error?.message || 
                          err.response?.data?.message || 
                          'An error occurred while analyzing the news'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-5xl mx-auto space-y-12">
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center relative py-12"
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-blue-500/10 blur-[120px] rounded-full -z-10" />
        <motion.div
           initial={{ scale: 0.9 }}
           animate={{ scale: 1 }}
           transition={{ duration: 0.5 }}
           className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 font-bold text-xs uppercase tracking-widest mb-6"
        >
          <Zap className="w-3.5 h-3.5 fill-current" />
          <span>Real-time AI Verification</span>
        </motion.div>
        <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight">
          Trust, <span className="gradient-text">Verified.</span>
        </h1>
        <p className="max-w-2xl mx-auto text-lg md:text-xl text-slate-400 font-medium leading-relaxed">
          Combat misinformation with our AI-driven verification engine. Secure every analysis permanently on the Ethereum blockchain via IPFS.
        </p>
      </motion.div>

      {/* Main Form Section */}
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="glass-card rounded-[2.5rem] p-6 md:p-10 border-white/5 shadow-3xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 blur-[80px] -z-10" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500/5 blur-[80px] -z-10" />

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Input Type Toggle */}
          <div className="flex p-1.5 bg-slate-900/50 rounded-2xl border border-white/5 w-fit mx-auto md:mx-0">
            {inputTypes.map((type) => (
              <button
                key={type.id}
                type="button"
                onClick={() => setInputType(type.id as 'text' | 'url')}
                className={`flex items-center gap-2.5 px-6 py-2.5 rounded-xl text-sm font-black transition-all duration-300 ${
                  inputType === type.id 
                    ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20' 
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                <type.icon className="w-4 h-4" />
                {type.label}
              </button>
            ))}
          </div>

          {/* Content Input */}
          <div className="space-y-3">
            <label className="flex items-center gap-2 text-sm font-bold text-slate-300 ml-1 uppercase tracking-wider">
              {inputType === 'text' ? <FileText className="w-4 h-4 text-blue-500" /> : <LinkIcon className="w-4 h-4 text-blue-500" />}
              {inputType === 'text' ? 'Article Content' : 'Article Web URL'}
            </label>
            <div className="relative group">
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={
                  inputType === 'text'
                    ? 'Paste the full article content here for deep analysis...'
                    : 'https://news-site.com/article-to-verify'
                }
                rows={inputType === 'text' ? 10 : 3}
                className="w-full px-6 py-5 bg-white/[0.03] text-white rounded-3xl border border-white/5 focus:border-blue-500/50 focus:bg-white/[0.05] focus:outline-none focus:ring-4 focus:ring-blue-500/10 transition-all duration-300 resize-none font-medium placeholder:text-slate-600"
              />
            </div>
          </div>

          <AnimatePresence mode="wait">
            {/* Wallet Not Connected Warning */}
            {!connected && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-4 bg-orange-500/10 border border-orange-500/20 rounded-2xl p-4"
              >
                <ShieldAlert className="w-6 h-6 text-orange-400 shrink-0" />
                <p className="text-orange-200 text-sm font-semibold">
                  Wallet connection required to mint blockchain verification records.
                </p>
              </motion.div>
            )}

            {/* Error Message */}
            {error && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex items-center gap-4 bg-red-500/10 border border-red-500/20 rounded-2xl p-4"
              >
                <AlertCircle className="w-6 h-6 text-red-400 shrink-0" />
                <p className="text-red-200 text-sm font-semibold">{error}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Submit Button */}
          <motion.button
            type="submit"
            disabled={loading || !connected}
            whileHover={{ y: -4, scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            className={`w-full group relative flex items-center justify-center gap-3 px-8 py-5 rounded-3xl font-black text-lg transition-all duration-500 ${
              loading 
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-2xl shadow-blue-500/20 hover:shadow-blue-500/40 border border-white/10'
            } disabled:opacity-50`}
          >
            {loading ? (
              <>
                <div className="w-6 h-6 border-3 border-white/20 border-t-white rounded-full animate-spin" />
                <span>Processing Verification...</span>
              </>
            ) : (
              <>
                <span>Analyze & Secure News</span>
                <CheckCircle className="w-6 h-6 opacity-50 group-hover:opacity-100 transition-opacity" />
              </>
            )}
            <div className="absolute inset-x-0 bottom-0 h-1 bg-white/20 rounded-b-3xl transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500" />
          </motion.button>
        </form>
      </motion.div>

      {/* Analysis Results Display */}
      <AnimatePresence>
        {(result || loading) && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.5, type: "spring" }}
          >
             <AnalysisResult data={result} loading={loading} />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Features Showcase */}
      <div className="pt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { title: 'AI Driven', desc: 'Azure Cognitive AI for sentiment and credibility analysis.', icon: Cpu },
          { title: 'IPFS Storage', desc: 'Secure decentralized storage for immutable analysis.', icon: Database },
          { title: 'Web3 Proof', desc: 'Record proofs on the Ethereum Sepolia blockchain.', icon: Globe },
        ].map((feature, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 + i * 0.1 }}
            className="p-8 glass-card rounded-[2rem] border-white/5 hover:border-blue-500/20 group transition-all duration-300"
          >
            <div className="w-14 h-14 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-600 transition-colors duration-500">
              <feature.icon className="w-7 h-7 text-blue-500 group-hover:text-white transition-colors duration-500" />
            </div>
            <h3 className="text-xl font-black text-white mb-3 tracking-tight">{feature.title}</h3>
            <p className="text-slate-400 font-medium text-sm leading-relaxed">{feature.desc}</p>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
