'use client';

import { motion } from 'framer-motion';
import HeroWallet from './HeroWallet'; 
import { Sparkles, Wallet, ShieldCheck, Star, Trophy, ArrowRight } from 'lucide-react';

export default function DashboardHero() {
  const scrollToOffers = () => {
    const section = document.getElementById('featured-offers');
    if (section) {
      const yOffset = -100; 
      const y = section.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <div className="w-full bg-[#111319] border border-white/5 rounded-[32px] overflow-hidden relative shadow-2xl flex flex-col">
      <div className="absolute top-0 left-0 w-full h-[70%] bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-[#8B5CF6]/10 via-[#111319] to-transparent pointer-events-none" />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center p-8 md:p-12 relative z-10">
        <motion.div 
          initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}
          className="flex flex-col gap-6 justify-center"
        >
          <div className="flex items-center gap-2 text-[#8B5CF6] font-bold tracking-widest uppercase text-[10px] border border-[#8B5CF6]/30 bg-[#8B5CF6]/10 w-fit px-3 py-1.5 rounded-full">
            <Sparkles className="w-3 h-3" /> WELCOME BACK
          </div>
          
          <h1 className="text-4xl md:text-5xl lg:text-[56px] font-black text-white leading-[1.15] tracking-tight">
            Earn More, <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00E57A] to-[#00b359]">Cash Out More!</span>
          </h1>
          
          <p className="text-[#8F95A3] text-sm md:text-[15px] max-w-md font-medium leading-relaxed">
            Complete premium offers, take top-tier surveys, and climb the leaderboard to maximize your crypto and cash rewards today.
          </p>
          
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button 
              onClick={scrollToOffers}
              className="px-8 py-4 bg-gradient-to-r from-[#8B5CF6] to-[#7c3aed] text-white font-bold rounded-xl shadow-[0_0_20px_rgba(139,92,246,0.4)] hover:shadow-[0_0_30px_rgba(139,92,246,0.6)] transition-all hover:scale-105 flex items-center gap-2 group"
            >
              Start Earning 
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }} 
          animate={{ opacity: 1, scale: 1 }} 
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex justify-center items-center h-full min-h-[250px] relative"
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#8B5CF6]/30 blur-[80px] rounded-full pointer-events-none" />
          <HeroWallet />
        </motion.div>
      </div>

      <div className="relative z-10 border-t border-white/5 bg-[#14171F]/60 px-6 py-8 md:px-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <div className="flex items-center gap-4 group">
          <div className="w-12 h-12 rounded-full bg-[#00E57A]/10 border border-[#00E57A]/20 flex items-center justify-center shrink-0 group-hover:bg-[#00E57A]/20 transition-colors">
            <Wallet className="w-5 h-5 text-[#00E57A]" />
          </div>
          <div className="flex flex-col">
            <h4 className="text-white text-sm font-bold mb-0.5">Fast Payouts</h4>
            <p className="text-[#8F95A3] text-xs font-medium">Withdraw instantly to your wallet.</p>
          </div>
        </div>

        <div className="flex items-center gap-4 group">
          <div className="w-12 h-12 rounded-full bg-[#8B5CF6]/10 border border-[#8B5CF6]/20 flex items-center justify-center shrink-0 group-hover:bg-[#8B5CF6]/20 transition-colors">
            <ShieldCheck className="w-5 h-5 text-[#8B5CF6]" />
          </div>
          <div className="flex flex-col">
            <h4 className="text-white text-sm font-bold mb-0.5">100% Secure</h4>
            <p className="text-[#8F95A3] text-xs font-medium">Your data and earnings are always protected.</p>
          </div>
        </div>

        <div className="flex items-center gap-4 group">
          <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0 group-hover:bg-amber-500/20 transition-colors">
            <Star className="w-5 h-5 text-amber-500" />
          </div>
          <div className="flex flex-col">
            <h4 className="text-white text-sm font-bold mb-0.5">Top Offers Daily</h4>
            <p className="text-[#8F95A3] text-xs font-medium">High-paying offers updated every day.</p>
          </div>
        </div>

        <div className="flex items-center gap-4 group">
          <div className="w-12 h-12 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0 group-hover:bg-blue-500/20 transition-colors">
            <Trophy className="w-5 h-5 text-blue-500" />
          </div>
          <div className="flex flex-col">
            <h4 className="text-white text-sm font-bold mb-0.5">Climb & Earn</h4>
            <p className="text-[#8F95A3] text-xs font-medium">Compete, rank up, earn bigger rewards.</p>
          </div>
        </div>
      </div>
    </div>
  );
}