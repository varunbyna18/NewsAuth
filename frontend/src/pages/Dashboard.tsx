import { useState, useEffect } from 'react'
import axios from 'axios'
import { motion } from 'framer-motion'
import { 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  AreaChart, Area, Cell, PieChart, Pie
} from 'recharts'
import { 
  TrendingUp, Activity, Database, History, Search, 
  ArrowUpRight, LayoutDashboard, Globe, AlertTriangle
} from 'lucide-react'

interface NewsRecord {
  id: string
  timestamp: string
  sentiment: number
  credibility: number
  ipfsHash: string
  txHash: string
  status: string
}

export default function Dashboard() {
  const [records, setRecords] = useState<NewsRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalAnalyzed: 0,
    avgCredibility: 0,
    blockchainRecords: 0
  })

  useEffect(() => {
    fetchRecords()
  }, [])

  const fetchRecords = async () => {
    try {
      const response = await axios.get('/api/records')
      setRecords(response.data.records || [])
      setStats(response.data.stats || { totalAnalyzed: 0, avgCredibility: 0, blockchainRecords: 0 })
    } catch (error) {
      console.error('Failed to fetch records:', error)
    } finally {
      setLoading(false)
    }
  }

  // Pre-process chart data
  const chartData = records.slice(0, 7).reverse().map(r => ({
    time: new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    credibility: r.credibility,
    sentiment: r.sentiment * 100
  }))

  const sentimentDist = [
     { name: 'Positive', value: records.filter(r => r.sentiment >= 0.6).length },
     { name: 'Neutral', value: records.filter(r => r.sentiment >= 0.3 && r.sentiment < 0.6).length },
     { name: 'Negative', value: records.filter(r => r.sentiment < 0.3).length }
  ]
  const COLORS = ['#22c55e', '#eab308', '#ef4444']

  return (
    <div className="max-w-7xl mx-auto space-y-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-4 border-b border-white/5">
        <div className="space-y-2">
            <div className="flex items-center gap-3">
               <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-2xl">
                  <LayoutDashboard className="w-8 h-8 text-blue-500" />
               </div>
               <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter">System <span className="gradient-text">Analytics</span></h1>
            </div>
            <p className="text-slate-400 font-medium">Real-time oversight of system performance and verification history.</p>
        </div>
        <div className="flex gap-3">
          <button 
             onClick={fetchRecords}
             className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-white font-black text-sm transition-all flex items-center gap-2"
          >
             <Activity className="w-4 h-4 text-blue-400" />
             Refresh Insights
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {[
          { label: 'Total Analyzed', value: stats.totalAnalyzed, sub: 'News articles', icon: Search, color: 'text-blue-500' },
          { label: 'Avg Credibility', value: `${Number(stats.avgCredibility || 0).toFixed(1)}%`, sub: 'Confidence score', icon: TrendingUp, color: 'text-purple-500' },
          { label: 'On Blockchain', value: stats.blockchainRecords, sub: 'Records secured', icon: Database, color: 'text-emerald-500' },
        ].map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card rounded-[2.5rem] p-8 border-white/5 relative overflow-hidden group shadow-2xl"
          >
             <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:scale-125 transition-transform duration-500">
                <stat.icon className="w-24 h-24" />
             </div>
             <h3 className="text-sm font-black text-slate-500 uppercase tracking-widest mb-3">{stat.label}</h3>
             <p className="text-5xl font-black text-white tracking-tighter mb-2">{stat.value}</p>
             <div className="flex items-center gap-2 text-slate-400 font-bold text-xs uppercase tracking-wider">
               <span className={stat.color}>{stat.sub}</span>
               <div className="w-1.5 h-1.5 rounded-full bg-slate-700 mx-1" />
               <span>Live</span>
             </div>
          </motion.div>
        ))}
      </div>

      {/* Visual Analytics Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         {/* Sentiment Trends Chart */}
         <motion.div 
           initial={{ opacity: 0, scale: 0.98 }}
           animate={{ opacity: 1, scale: 1 }}
           className="lg:col-span-2 glass-card rounded-[3rem] p-10 border-white/5 shadow-2xl space-y-8"
         >
            <div className="flex justify-between items-center">
              <h3 className="text-2xl font-black text-white tracking-tight">Real-time Trends</h3>
              <div className="flex gap-4">
                 <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-500">
                    <div className="w-3 h-3 bg-blue-500 rounded-full" />
                    Credibility
                 </div>
                 <div className="flex items-center gap-2 text-[10px] font-black uppercase text-slate-500">
                    <div className="w-3 h-3 bg-indigo-500 rounded-full" />
                    Sentiment
                 </div>
              </div>
            </div>
            
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                 <AreaChart data={chartData}>
                    <defs>
                       <linearGradient id="credGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                       </linearGradient>
                       <linearGradient id="sentGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                       </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#ffffff05" />
                    <XAxis dataKey="time" stroke="#ffffff20" fontSize={10} fontWeight={800} axisLine={false} tickLine={false} />
                    <YAxis stroke="#ffffff20" fontSize={10} fontWeight={800} axisLine={false} tickLine={false} />
                    <Tooltip 
                       contentStyle={{ backgroundColor: '#0f172aCC', border: '1px solid #ffffff10', borderRadius: '1.5rem', backdropFilter: 'blur(10px)' }}
                       itemStyle={{ fontWeight: 800, fontSize: '12px' }}
                    />
                    <Area type="monotone" dataKey="credibility" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#credGradient)" />
                    <Area type="monotone" dataKey="sentiment" stroke="#6366f1" strokeWidth={4} fillOpacity={1} fill="url(#sentGradient)" />
                 </AreaChart>
              </ResponsiveContainer>
            </div>
         </motion.div>

         {/* Distribution Chart */}
         <motion.div 
           initial={{ opacity: 0, scale: 0.98 }}
           animate={{ opacity: 1, scale: 1 }}
           className="glass-card rounded-[3rem] p-10 border-white/5 shadow-2xl flex flex-col items-center justify-center space-y-10"
         >
            <h3 className="text-2xl font-black text-white tracking-tight self-start">Sentiment Pulse</h3>
            <div className="h-[250px] w-full relative">
               <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                     <Pie
                        data={sentimentDist}
                        cx="50%"
                        cy="50%"
                        innerRadius={65}
                        outerRadius={95}
                        paddingAngle={10}
                        dataKey="value"
                        cornerRadius={100}
                     >
                        {sentimentDist.map((_entry, index) => (
                           <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                     </Pie>
                     <Tooltip 
                        contentStyle={{ backgroundColor: '#0f172aCC', border: '1px solid #ffffff10', borderRadius: '1rem', backdropFilter: 'blur(10px)' }}
                        itemStyle={{ fontWeight: 800, fontSize: '12px' }}
                     />
                  </PieChart>
               </ResponsiveContainer>
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                  <p className="text-3xl font-black text-white">{records.length}</p>
                  <p className="text-[10px] font-black text-slate-500 uppercase">Records</p>
               </div>
            </div>
            <div className="w-full space-y-4">
               {sentimentDist.map((s, i) => (
                  <div key={i} className="flex items-center justify-between p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-colors">
                     <div className="flex items-center gap-3">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                        <span className="text-sm font-bold text-white">{s.name}</span>
                     </div>
                     <span className="text-sm font-black text-slate-400">{s.value}</span>
                  </div>
               ))}
            </div>
         </motion.div>
      </div>

      {/* Records Listing Table */}
      <div className="glass-card rounded-[3rem] border-white/5 shadow-3xl overflow-hidden">
        <div className="px-10 py-8 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
             <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl">
                <History className="w-6 h-6 text-indigo-400" />
             </div>
             <h2 className="text-2xl font-black text-white tracking-tight">Activity Log</h2>
          </div>
          <div className="relative group">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
             <input 
                type="text" 
                placeholder="Search history..." 
                className="w-full md:w-64 bg-slate-950/50 border border-white/5 rounded-2xl pl-12 pr-6 py-3 text-sm font-bold text-white focus:outline-none focus:border-blue-500/50 transition-all placeholder:text-slate-600"
             />
          </div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center p-24 space-y-6">
             <div className="w-16 h-16 border-4 border-blue-500/10 border-t-blue-500 rounded-full animate-spin" />
             <p className="text-slate-500 font-black text-sm uppercase tracking-widest">Aggregating History...</p>
          </div>
        ) : records.length === 0 ? (
          <div className="p-24 text-center space-y-4">
             <div className="inline-flex p-6 bg-slate-900/50 border border-white/5 rounded-[2rem] mb-4">
                <AlertTriangle className="w-12 h-12 text-slate-700" />
             </div>
             <p className="text-slate-300 text-lg font-black tracking-tight">No Verification History</p>
             <p className="text-slate-500 font-medium max-w-xs mx-auto">Analyze your first news article to build your verification vault.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-950/30 text-left">
                  <th className="px-10 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Artifact Identity</th>
                  <th className="px-10 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Sentiment Pulse</th>
                  <th className="px-10 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Confidence Index</th>
                  <th className="px-10 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Provenance</th>
                  <th className="px-10 py-6 text-[10px] font-black text-slate-500 uppercase tracking-widest">Verification</th>
                </tr>
              </thead>
              <tbody>
                {records.map((record) => (
                  <tr key={record.id} className="group hover:bg-white/[0.02] border-t border-white/5 transition-all">
                    <td className="px-10 py-6">
                       <div className="flex flex-col">
                          <span className="text-white font-black tracking-tight text-sm mb-1">{record.id.substring(0, 8)}...</span>
                          <span className="text-[10px] font-black text-slate-500 uppercase">{new Date(record.timestamp).toLocaleString()}</span>
                       </div>
                    </td>
                    <td className="px-10 py-6">
                      <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-xl border font-black text-[11px] uppercase tracking-wider ${
                        record.sentiment > 0.6 ? 'bg-green-500/10 border-green-500/20 text-green-400' :
                        record.sentiment > 0.3 ? 'bg-yellow-500/10 border-yellow-500/20 text-yellow-400' :
                        'bg-red-500/10 border-red-500/20 text-red-400'
                      }`}>
                         <div className={`w-1.5 h-1.5 rounded-full ${
                            record.sentiment > 0.6 ? 'bg-green-500 animate-pulse' :
                            record.sentiment > 0.3 ? 'bg-yellow-500 animate-pulse' :
                            'bg-red-500 animate-pulse'
                         }`} />
                         {(record.sentiment * 100).toFixed(0)}%
                      </div>
                    </td>
                    <td className="px-10 py-6">
                       <div className="flex items-center gap-4">
                          <div className="w-32 bg-white/5 rounded-full h-2.5 overflow-hidden border border-white/5">
                             <div 
                                className="h-full bg-gradient-to-r from-blue-600 to-indigo-500"
                                style={{ width: `${record.credibility}%` }}
                             />
                          </div>
                          <span className="text-white font-black text-sm">{record.credibility.toFixed(0)}%</span>
                       </div>
                    </td>
                    <td className="px-10 py-6">
                       <div className="flex items-center gap-3">
                          <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
                             <Globe className="w-4 h-4 text-emerald-500" />
                          </div>
                          <code className="text-[10px] font-mono font-bold text-emerald-400 tracking-tight bg-emerald-400/5 px-2 py-1 rounded">
                             {record.ipfsHash.substring(0, 12)}...
                          </code>
                       </div>
                    </td>
                    <td className="px-10 py-6">
                      <a
                        href={`https://sepolia.etherscan.io/tx/${record.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 rounded-xl text-blue-400 font-black text-xs transition-all"
                      >
                        View Proof
                        <ArrowUpRight className="w-3 h-3 group-hover:scale-125 transition-transform" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
