import { motion } from 'framer-motion'
import { FaGithub } from 'react-icons/fa'
import { 
  ShieldCheck, Cpu, Database, Globe, Layers, Key, Zap, 
  ExternalLink, Mail, MessageSquare
} from 'lucide-react'

export default function About() {
  const technologies = [
    { title: 'Frontend', icon: Layers, tech: ['React 18', 'TypeScript', 'Vite', 'Tailwind CSS', 'Framer Motion'], color: 'text-blue-400', bg: 'bg-blue-400/10' },
    { title: 'AI Backend', icon: Cpu, tech: ['Node.js + Express', 'Azure Cognitive AI', 'Sentiment Analysis', 'Key Phrase Extractions'], color: 'text-purple-400', bg: 'bg-purple-400/10' },
    { title: 'Decentralized', icon: Database, tech: ['Ethereum Sepolia', 'Solidity Contracts', 'Pinata IPFS Gateway', 'Ethers.js'], color: 'text-emerald-400', bg: 'bg-emerald-400/10' },
    { title: 'DevOps / Cloud', icon: Zap, tech: ['Azure App Service', 'GitHub Actions CI/CD', 'Azure Key Vault', 'Secure API Management'], color: 'text-orange-400', bg: 'bg-orange-400/10' },
  ]

  const steps = [
    { title: 'Submit News', desc: 'Secure input of raw text or news articles URLs via a sleek dark-themed interface.', icon: Layers },
    { title: 'AI Deep Scan', desc: 'Cloud-powered AI analyzes sentiment polarity and extracts linguistic markers.', icon: Cpu },
    { title: 'IPFS Archive', desc: 'Data is cryptographically formatted and stored on the distributed IPFS network via Pinata.', icon: Database },
    { title: 'Web3 Proofing', desc: 'The unique IPFS CID is registered on the Ethereum blockchain for permanent authentication.', icon: Key },
    { title: 'Immutable History', desc: 'A permanent verification certificate is generated with blockchain transaction proof.', icon: ShieldCheck },
  ]

  return (
    <div className="max-w-6xl mx-auto space-y-24 py-12">
      {/* Hero Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center relative"
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-500/10 blur-[150px] rounded-full -z-10" />
        <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tight">Mission <span className="gradient-text">Integrity.</span></h1>
        <p className="max-w-3xl mx-auto text-xl text-slate-400 font-medium leading-relaxed">
          NewsAuth is a state-of-the-art verification ecosystem engineering trust back into the news cycle. We merge cutting-edge AI insights with the immutable power of Web3.
        </p>
      </motion.div>

      {/* About Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
         <motion.div 
           initial={{ opacity: 0, x: -30 }}
           animate={{ opacity: 1, x: 0 }}
           className="glass-card rounded-[3rem] p-10 border-white/5 shadow-2xl space-y-8"
         >
            <div className="w-16 h-16 bg-blue-500/10 rounded-2xl flex items-center justify-center">
               <ShieldCheck className="w-9 h-9 text-blue-500" />
            </div>
            <h2 className="text-3xl font-black text-white tracking-tight">What is NewsAuth?</h2>
            <p className="text-slate-400 font-medium leading-relaxed">
              In an era of deepfakes and algorithmic bias, truth is under attack. NewsAuth provides a transparent, verifiable protocol for analyzing and archiving news data. 
              By leveraging Decentralized Storage (IPFS) and the Ethereum Network, we ensure that verification records can never be silenced, censored, or altered.
            </p>
            <div className="flex gap-4">
               <button className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-black text-sm rounded-2xl transition-all shadow-xl shadow-blue-900/40">
                  Read Whitepaper
               </button>
               <button className="flex items-center gap-2 px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-black text-sm rounded-2xl transition-all">
                  <FaGithub className="w-4 h-4" />
                  Source Code
               </button>
            </div>
         </motion.div>

         <motion.div 
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="grid grid-cols-2 gap-4"
         >
            {technologies.map((t, i) => (
               <div key={i} className="glass-card rounded-[2rem] p-8 border-white/5 hover:border-white/10 transition-colors group">
                  <t.icon className={`w-8 h-8 ${t.color} mb-6 transition-transform group-hover:scale-110`} />
                  <h3 className="text-lg font-black text-white mb-4 tracking-tight">{t.title}</h3>
                  <div className="flex flex-col gap-2">
                     {t.tech.slice(0, 3).map((item, j) => (
                        <div key={j} className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-slate-500">
                           <div className={`w-1 h-1 rounded-full ${t.bg}`} />
                           {item}
                        </div>
                     ))}
                  </div>
               </div>
            ))}
         </motion.div>
      </div>

      {/* How It Works (Steps) */}
      <div className="space-y-12">
        <h2 className="text-3xl font-black text-white text-center tracking-tight">Proof Protocol <span className="text-slate-500">Overview</span></h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
           {steps.map((step, i) => (
              <motion.div 
                 key={i}
                 initial={{ opacity: 0, y: 20 }}
                 animate={{ opacity: 1, y: 0 }}
                 transition={{ delay: i * 0.1 }}
                 className="relative p-7 glass-card rounded-[2rem] border-white/5 text-center flex flex-col items-center group"
              >
                 <div className="w-12 h-12 bg-white/5 border border-white/5 rounded-2xl flex items-center justify-center mb-6 group-hover:bg-blue-500/10 transition-colors">
                    <step.icon className="w-5 h-5 text-slate-500 group-hover:text-blue-500 transition-colors" />
                 </div>
                 <h3 className="text-sm font-black text-white mb-2 uppercase tracking-widest">{step.title}</h3>
                 <p className="text-[10px] font-bold text-slate-500 leading-relaxed">{step.desc}</p>
                 {i < 4 && (
                    <div className="hidden md:block absolute -right-4 top-1/2 -translate-y-1/2 text-slate-800">
                       <Zap className="w-6 h-6 fill-current" />
                    </div>
                 )}
              </motion.div>
           ))}
        </div>
      </div>

      {/* Resources & Security */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         <div className="md:col-span-2 glass-card rounded-[3rem] p-10 border-white/5 flex flex-col md:flex-row gap-10 items-center">
            <div className="w-full md:w-1/3 aspect-square bg-gradient-to-br from-blue-600 to-indigo-600 rounded-[2.5rem] flex items-center justify-center p-8 shadow-2xl relative overflow-hidden group">
               <div className="absolute inset-0 bg-white/20 scale-150 -translate-x-full transition-transform duration-1000 group-hover:translate-x-full" />
               <ShieldCheck className="w-full h-full text-white" />
            </div>
            <div className="flex-1 space-y-6 text-center md:text-left">
               <h3 className="text-3xl font-black text-white tracking-tight">Hardened Security</h3>
               <p className="text-slate-400 font-medium leading-relaxed">
                  Every byte of data is protected via Azure Key Vault integrations and end-to-end encryption. 
                  Our smart contracts are audited and deployed on the Sepolia proof-of-stake network for maximum energy efficiency and safety.
               </p>
               <div className="flex flex-wrap justify-center md:justify-start gap-3">
                  {['AES-256', 'Web3-Auth', 'Vaulted-Keys', 'HTTPS-TLS'].map(tag => (
                     <span key={tag} className="px-4 py-2 bg-white/5 border border-white/5 rounded-xl text-[10px] font-black uppercase text-slate-500 tracking-widest">
                        {tag}
                     </span>
                  ))}
               </div>
            </div>
         </div>

         <div className="glass-card rounded-[3rem] p-10 border-white/5 space-y-8">
            <h3 className="text-2xl font-black text-white tracking-tight">Resources</h3>
            <div className="space-y-4">
               {[
                 { label: 'Network Status', link: 'https://sepolia.etherscan.io', icon: Globe },
                 { label: 'AI Documentation', link: 'https://azure.microsoft.com', icon: Cpu },
                 { label: 'IPFS Explorer', link: 'https://pinata.cloud', icon: Database },
                 { label: 'Vulnerability Disclosure', link: '#', icon: ShieldCheck }
               ].map((res, i) => (
                  <a 
                    key={i} 
                    href={res.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 border border-white/5 rounded-2xl transition-all group"
                  >
                     <div className="flex items-center gap-3">
                        <res.icon className="w-4 h-4 text-slate-400 group-hover:text-blue-400 transition-colors" />
                        <span className="text-xs font-black text-white">{res.label}</span>
                     </div>
                     <ExternalLink className="w-4 h-4 text-slate-700 group-hover:text-white transition-colors" />
                  </a>
               ))}
            </div>
         </div>
      </div>
      
      {/* Contact Banner */}
      <motion.div 
         whileHover={{ scale: 1.01 }}
         className="p-1 px-1 bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 rounded-[3rem] shadow-2xl"
      >
         <div className="bg-slate-950 rounded-[2.95rem] p-12 flex flex-col md:flex-row items-center justify-between gap-12 overflow-hidden relative">
            <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-600/10 blur-[100px] -z-10" />
            <div className="text-left space-y-4">
               <h3 className="text-4xl font-black text-white tracking-tight">Join the truth movement.</h3>
               <p className="text-slate-400 font-medium max-w-xl">
                  Support the initiative by contributing to the open-source protocol or integrating NewsAuth into your platform today.
               </p>
            </div>
            <div className="flex gap-4">
               <button className="px-10 py-5 bg-white text-slate-950 font-black text-sm rounded-[2rem] hover:bg-blue-50 transition-all flex items-center gap-3">
                  <Mail className="w-5 h-5" />
                  Contact Us
               </button>
               <button className="px-10 py-5 bg-blue-500/10 border border-blue-500/20 text-white font-black text-sm rounded-[2rem] hover:bg-blue-500/20 transition-all flex items-center gap-3">
                  <MessageSquare className="w-5 h-5" />
                  Community
               </button>
            </div>
         </div>
      </motion.div>
    </div>
  )
}
