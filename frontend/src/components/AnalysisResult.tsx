import { motion } from 'framer-motion'
import { CheckCircle2, Copy, ExternalLink, ShieldCheck, Database, Globe, Zap, AlertTriangle, Fingerprint } from 'lucide-react'
import { useState } from 'react'

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

interface AnalysisResultProps {
  data: AnalysisData | null
  loading: boolean
}

export default function AnalysisResult({ data, loading }: AnalysisResultProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null)

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  // Defensive data validation and normalization
  const getSafeData = () => {
    if (!data) return null
    
    // Normalize sentiment
    let sentiment = data.sentiment
    let sentimentScore = 0.5
    let sentimentLabel = 'neutral'
    
    if (sentiment && typeof sentiment === 'object' && sentiment.score !== undefined) {
      sentimentScore = Math.max(0, Math.min(1, Number(sentiment.score) || 0.5))
      sentimentLabel = sentiment.label || 'neutral'
    } else if (typeof sentiment === 'number') {
      sentimentScore = Math.max(0, Math.min(1, sentiment))
      sentimentLabel = sentimentScore > 0.6 ? 'positive' : sentimentScore > 0.3 ? 'neutral' : 'negative'
    }

    // Normalize credibility score
    let credibilityScore = Number(data.credibilityScore) || 50
    credibilityScore = Math.max(0, Math.min(100, credibilityScore))

    return {
      sentiment: { score: sentimentScore, label: sentimentLabel },
      credibilityScore: credibilityScore,
      keyPhrases: Array.isArray(data.keyPhrases) ? data.keyPhrases : [],
      ipfsHash: String(data.ipfsHash || ''),
      transactionHash: String(data.transactionHash || '')
    }
  }

  const safeData = getSafeData()

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-20 glass-card rounded-[3rem] border-white/5 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full animate-shimmer opacity-10" />
        <div className="relative">
          <div className="w-24 h-24 border-4 border-blue-500/10 border-t-blue-500 rounded-full animate-spin" />
          <Zap className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-blue-500 animate-pulse" />
        </div>
        <div className="mt-8 text-center space-y-2">
           <h3 className="text-2xl font-black text-white tracking-tight">AI & Blockchain at Work</h3>
           <p className="text-slate-400 font-medium">Analyzing sentiment, extracting key phrases, and securing blockchain proof...</p>
        </div>
      </div>
    )
  }

  if (!data || !safeData) return null

  const getSentimentColor = (score: number) => {
    if (score < 0.3) return 'text-red-400 bg-red-400/10 border-red-400/20'
    if (score < 0.6) return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/20'
    return 'text-green-400 bg-green-400/10 border-green-400/20'
  }
  
  const getCredibilityStatus = (score: number) => {
    if (score < 40) return { label: 'Extremely Low', color: 'text-red-500 bg-red-500/10' }
    if (score < 70) return { label: 'Questionable', color: 'text-yellow-500 bg-yellow-500/10' }
    return { label: 'High Credibility', color: 'text-green-500 bg-green-500/10' }
  }

  const isSimulated = safeData.ipfsHash.includes('Simulated') || safeData.transactionHash.startsWith('0x00000')

  return (
    <div className="space-y-10 relative">
      {/* Simulation Warning */}
      {isSimulated && (
        <motion.div 
           initial={{ opacity: 0, scale: 0.95 }}
           animate={{ opacity: 1, scale: 1 }}
           className="p-5 flex items-center gap-4 bg-amber-500/10 border border-amber-500/20 rounded-3xl"
        >
          <div className="w-10 h-10 bg-amber-500/20 rounded-xl flex items-center justify-center shrink-0">
             <AlertTriangle className="w-6 h-6 text-amber-500" />
          </div>
          <div>
            <h4 className="text-amber-200 font-black text-sm uppercase tracking-wider">Demo Mode Active</h4>
            <p className="text-amber-100/70 text-xs font-medium">Using simulated blockchain and IPFS records for preview purposes. For production, please configure live API keys.</p>
          </div>
        </motion.div>
      )}

      {/* Main Analysis Results Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Sentiment Display */}
        <div className="glass-card rounded-[2.5rem] p-8 border-white/5 relative overflow-hidden group hover:border-blue-500/20 transition-all duration-500">
           <div className={`absolute top-0 right-0 w-32 h-32 blur-[60px] opacity-20 -z-10 group-hover:opacity-40 transition-opacity ${safeData.sentiment.score < 0.3 ? 'bg-red-500' : safeData.sentiment.score < 0.6 ? 'bg-yellow-500' : 'bg-green-500'}`} />
           <div className="flex justify-between items-start mb-10">
              <div>
                <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest mb-1">Sentiment Pulse</h3>
                <p className="text-3xl font-black text-white tracking-tight">{safeData.sentiment.label}</p>
              </div>
              <div className={`p-4 rounded-2xl border ${getSentimentColor(safeData.sentiment.score)}`}>
                 <ShieldCheck className="w-7 h-7" />
              </div>
           </div>

           <div className="space-y-4">
              <div className="flex justify-between items-end mb-2">
                <span className="text-sm font-bold text-slate-400">Analysis Confidence</span>
                <span className="text-2xl font-black text-white">{(safeData.sentiment.score * 100).toFixed(0)}%</span>
              </div>
              <div className="w-full h-4 bg-white/5 rounded-full overflow-hidden border border-white/5">
                 <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${safeData.sentiment.score * 100}%` }}
                    transition={{ duration: 1.5, type: "spring" }}
                    className={`h-full ${safeData.sentiment.score < 0.3 ? 'bg-red-500' : safeData.sentiment.score < 0.6 ? 'bg-yellow-500' : 'bg-green-500'} shadow-[0_0_15px_rgba(34,197,94,0.3)]`}
                 />
              </div>
           </div>
        </div>

        {/* Credibility Display */}
        <div className="glass-card rounded-[2.5rem] p-8 border-white/5 relative overflow-hidden group hover:border-blue-500/20 transition-all duration-500">
           <div className="absolute top-0 right-0 w-32 h-32 blur-[60px] opacity-20 bg-blue-500 -z-10 group-hover:opacity-40 transition-opacity" />
           <div className="flex justify-between items-start mb-8">
              <div>
                <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest mb-1">Credibility Index</h3>
                <div className={`inline-block px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest mb-2 ${getCredibilityStatus(safeData.credibilityScore).color}`}>
                   {getCredibilityStatus(safeData.credibilityScore).label}
                </div>
                <p className="text-5xl font-black text-white tracking-tighter">{safeData.credibilityScore.toFixed(0)}<span className="text-2xl text-slate-500">%</span></p>
              </div>
              <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-400">
                 <Fingerprint className="w-7 h-7" />
              </div>
           </div>

           <div className="flex flex-wrap gap-2 pt-4">
              {safeData.keyPhrases.slice(0, 5).map((phrase, i) => (
                <span key={i} className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-slate-300 hover:bg-white/10 transition-colors">
                  #{phrase}
                </span>
              ))}
           </div>
        </div>
      </div>

      {/* Blockchain Details Section */}
      <div className="glass-card rounded-[2.5rem] md:p-10 p-6 border-white/5 relative overflow-hidden">
         <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 mb-10">
            <div className="space-y-2">
               <div className="flex items-center gap-3 text-blue-400">
                  <Database className="w-6 h-6" />
                  <h3 className="text-2xl font-black text-white tracking-tight">Decentralized Proof</h3>
               </div>
               <p className="text-slate-400 font-medium">Immutable validation record stored across the web.</p>
            </div>
            {!isSimulated && (
              <motion.a 
                whileHover={{ scale: 1.02 }}
                href={`https://gateway.pinata.cloud/ipfs/${safeData.ipfsHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-white font-black text-sm transition-all shadow-xl"
              >
                 <Globe className="w-5 h-5 text-blue-400" />
                 Open IPFS Metadata
                 <ExternalLink className="w-4 h-4 ml-2 opacity-50" />
              </motion.a>
            ) || (
              <div className="px-8 py-4 bg-slate-900/50 border border-white/5 rounded-2xl text-slate-500 font-bold text-sm cursor-not-allowed">
                 📁 IPFS Gateway Preview Unavailable
              </div>
            )}
         </div>

         <div className="grid grid-cols-1 gap-6">
            {/* IPFS Hash */}
            <div className="p-8 bg-black/30 border border-white/5 rounded-[2rem] hover:border-blue-500/10 transition-colors group">
               <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                     <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">IPFS Resource Hash (CID)</span>
                     <p className="text-sm md:text-md text-emerald-400 font-mono break-all line-clamp-2 md:line-clamp-none leading-relaxed">
                        {safeData.ipfsHash}
                     </p>
                  </div>
                  <button 
                    onClick={() => handleCopy(safeData.ipfsHash, 'ipfs')}
                    className="shrink-0 flex items-center justify-center p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-all group/btn"
                  >
                    {copiedId === 'ipfs' ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <Copy className="w-5 h-5 text-slate-400 group-hover/btn:text-white" />}
                  </button>
               </div>
            </div>

            {/* Tx Hash */}
            <div className="p-8 bg-black/30 border border-white/5 rounded-[2rem] hover:border-indigo-500/10 transition-colors group">
               <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                     <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Blockchain Transaction Proof</span>
                     <p className="text-sm md:text-md text-indigo-400 font-mono break-all line-clamp-2 md:line-clamp-none leading-relaxed">
                        {safeData.transactionHash}
                     </p>
                  </div>
                  <div className="flex gap-2">
                    <button 
                       onClick={() => handleCopy(safeData.transactionHash, 'tx')}
                       className="flex items-center justify-center p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full transition-all group/btn"
                    >
                       {copiedId === 'tx' ? <CheckCircle2 className="w-5 h-5 text-indigo-500" /> : <Copy className="w-5 h-5 text-slate-400 group-hover/btn:text-white" />}
                    </button>
                    {!isSimulated && (
                       <a 
                          href={`https://sepolia.etherscan.io/tx/${safeData.transactionHash}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center justify-center p-4 bg-indigo-500/20 hover:bg-indigo-500/40 border border-indigo-500/30 rounded-full transition-all text-indigo-400"
                       >
                          <ExternalLink className="w-5 h-5" />
                       </a>
                    )}
                  </div>
               </div>
            </div>
         </div>
         
         <div className="mt-10 p-6 bg-blue-500/5  rounded-[2rem] border border-blue-500/10 flex items-center gap-6">
            <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center shrink-0">
               <ShieldCheck className="w-8 h-8 text-blue-500" />
            </div>
            <div>
               <h4 className="text-white font-black text-sm tracking-wide">Verification Success</h4>
               <p className="text-slate-400 text-xs font-medium max-w-xl">This analysis has been successfully cryptographically signed and archived on the decentralized web. It cannot be altered or removed.</p>
            </div>
         </div>
      </div>
    </div>
  )
}
