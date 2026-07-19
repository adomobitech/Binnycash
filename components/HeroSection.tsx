'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';

export default function HeroSection() {
  // ================= 🔄 FAST LIVE DATA SIMULATION STATES =================
  const [totalEarned, setTotalEarned] = useState(18450.60);
  const [players, setPlayers] = useState(1200452);
  
  // Live Feed Data State
  const [winners, setWinners] = useState([
    { id: 1, name: 'Rahul Verma', action: 'Completed Battle Quest', amount: 35.00 },
    { id: 2, name: 'Alex Gaming', action: 'Won Solo Showdown', amount: 18.40 },
    { id: 3, name: 'Rohit Munjal', action: 'Completed Daily Challenge', amount: 52.60 },
    { id: 4, name: 'Aman Yadav', action: 'Won Squad Tournament', amount: 41.20 },
  ]);

  // UseEffect to continuously animate numbers & feed
  useEffect(() => {
    const interval = setInterval(() => {
      // 1. Animate Total Earned and Players
      setTotalEarned(prev => prev + (Math.random() * 2 + 0.10));
      setPlayers(prev => prev + Math.floor(Math.random() * 2));
      
      // 2. Randomly add a new winner to the feed (30% chance every 1.5 seconds)
      if (Math.random() > 0.7) {
        const newNames = ['Priya S.', 'Ninja Pro', 'Vikas007', 'KaranD', 'Sneha_Win'];
        const newActions = ['Cleared Boss Level', 'Daily Login Bonus', 'Referral Reward', 'Won Deathmatch'];
        
        const newWinner = {
          id: Date.now(),
          name: newNames[Math.floor(Math.random() * newNames.length)],
          action: newActions[Math.floor(Math.random() * newActions.length)],
          amount: (Math.random() * 50 + 10)
        };

        setWinners(prev => [newWinner, ...prev].slice(0, 4)); // Sirf top 4 dikhayenge
      }
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative min-h-screen flex flex-col justify-center overflow-hidden bg-[#030308]">
      
      {/* 🔴 CUSTOM KEYFRAMES FOR FEED ANIMATION */}
      <style jsx>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .feed-item { animation: slideIn 0.4s ease-out forwards; }
      `}</style>

      {/* ================= 🌌 ACTUAL BACKGROUND IMAGE ================= */}
      <div className="absolute inset-0 z-0 bg-[url('/background.png')] bg-cover bg-center bg-no-repeat"></div>
      
      {/* 🌑 DARK OVERLAYS FOR TEXT READABILITY */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#030308]/95 via-[#030308]/20 to-[#030308]/90 z-0 pointer-events-none"></div>

      {/* ================= 🚀 MAIN HERO AREA ================= */}
      <section className="relative max-w-[1450px] mx-auto px-6 pt-24 pb-16 flex flex-col lg:flex-row items-center justify-between z-20 w-full gap-8">
        
        {/* ================= LEFT COLUMN: TYPOGRAPHY ================= */}
        <div className="w-full lg:w-[45%] flex flex-col items-start text-left drop-shadow-2xl">
          
          <div className="inline-flex items-center gap-3 bg-[#0a0a14]/60 backdrop-blur-md border border-white/10 rounded-full p-1 pr-5 mb-6">
            <span className="bg-fuchsia-600 text-white text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-white animate-pulse" style={{ animationDuration: '0.8s' }}></span> LIVE
            </span>
            <span className="text-sm text-gray-200 font-medium">New high-paying quests added!</span>
          </div>
          
          <h1 className="text-[5.5rem] sm:text-[6.5rem] lg:text-[7.5rem] font-black tracking-tighter leading-[0.85] text-white mb-6 uppercase italic">
            Loot The <br />
            <span className="text-fuchsia-500 drop-shadow-[0_0_25px_rgba(217,70,239,0.5)]">
              Digital
            </span> <br />
            World
          </h1>
          
          <p className="text-gray-300 text-lg mb-10 leading-relaxed max-w-md font-medium">
            Complete epic quests, conquer insane games, and turn your skills into real cash. <br/>
            This isn't just a game. <span className="text-fuchsia-400 font-bold">It's a revolution.</span>
          </p>
          
          <div className="flex items-center gap-5">
            <Link href="/register" className="flex items-center gap-2 rounded-xl bg-fuchsia-600 hover:bg-fuchsia-500 shadow-[0_0_20px_rgba(217,70,239,0.4)] transition-all px-8 py-4">
              <span className="font-black text-sm text-white tracking-wide uppercase">Get Started</span>
              <span className="text-white">⚡</span>
            </Link>
            
            <Link href="#how-it-works" className="flex items-center gap-3 rounded-xl bg-[#0a0a14]/80 backdrop-blur-md border border-white/10 hover:bg-white/5 transition-all px-8 py-4">
              <span className="font-black text-sm text-white tracking-wide uppercase">How it Works</span>
              <span className="w-5 h-5 rounded-full border border-white flex items-center justify-center text-[10px] text-white pl-[1px]">▶</span>
            </Link>
          </div>
        </div>

        {/* ================= CENTER COLUMN (Spacer for Background Character) ================= */}
        <div className="hidden lg:block w-[15%] h-[550px] relative pointer-events-none"></div>

        {/* ================= RIGHT COLUMN: DASHBOARD PANELS ================= */}
        <div className="w-full lg:w-[40%] flex flex-col gap-4 relative z-20">
           
           {/* 1. TOTAL EARNED CARD */}
           <div className="bg-[#0B0D1A]/80 backdrop-blur-2xl border border-white/5 rounded-3xl p-6 flex justify-between items-center shadow-xl">
             <div>
               <p className="text-xs text-gray-400 font-bold uppercase tracking-wider mb-1">Total Earned</p>
               <h3 className="text-4xl font-black text-white mb-2 transition-all duration-300">
                 ${totalEarned.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
               </h3>
               <div className="flex items-center gap-2 text-xs font-semibold">
                 <span className="text-green-400">↑ 23.5%</span>
                 <span className="text-gray-500">vs last week</span>
               </div>
             </div>
             {/* Mock 3D Wallet Icon Setup */}
             <div className="w-20 h-20 bg-gradient-to-br from-green-500/20 to-purple-500/20 rounded-2xl flex items-center justify-center border border-white/10 relative shadow-[0_0_30px_rgba(34,197,94,0.2)]">
               <span className="text-4xl absolute transform -rotate-12 hover:rotate-0 transition-transform duration-300">💸</span>
               <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-fuchsia-600 rounded-full border-2 border-[#0B0D1A] flex items-center justify-center">
                 <div className="w-2 h-2 bg-white rounded-full"></div>
               </div>
             </div>
           </div>

           {/* 2. STATS GRID */}
           <div className="grid grid-cols-4 gap-3">
             <div className="bg-[#0B0D1A]/80 backdrop-blur-xl border border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-lg hover:bg-white/5 transition-colors">
               <span className="text-indigo-400 text-xl mb-2">👥</span>
               <span className="text-white font-black text-sm">
                  {/* Format to keep it like 1.2M+ but alive */}
                  {(players / 1000000).toFixed(1)}M+
               </span>
               <span className="text-[9px] text-gray-400 font-bold uppercase mt-1">Active Players</span>
             </div>
             <div className="bg-[#0B0D1A]/80 backdrop-blur-xl border border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-lg hover:bg-white/5 transition-colors">
               <span className="text-purple-400 text-xl mb-2">🎮</span>
               <span className="text-white font-black text-sm">50+</span>
               <span className="text-[9px] text-gray-400 font-bold uppercase mt-1">Games Available</span>
             </div>
             <div className="bg-[#0B0D1A]/80 backdrop-blur-xl border border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-lg hover:bg-white/5 transition-colors">
               <span className="text-orange-400 text-xl mb-2">⚡</span>
               <span className="text-white font-black text-sm">&lt;30s</span>
               <span className="text-[9px] text-gray-400 font-bold uppercase mt-1">Instant Withdrawals</span>
             </div>
             <div className="bg-[#0B0D1A]/80 backdrop-blur-xl border border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-lg hover:bg-white/5 transition-colors">
               <span className="text-yellow-400 text-xl mb-2">🏆</span>
               <span className="text-white font-black text-sm">98%</span>
               <span className="text-[9px] text-gray-400 font-bold uppercase mt-1">Success Rate</span>
             </div>
           </div>

           {/* 3. RECENT WINNERS LIVE FEED */}
           <div className="bg-[#0B0D1A]/80 backdrop-blur-2xl border border-white/5 rounded-3xl p-5 shadow-xl flex flex-col h-[280px]">
             <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-3">
               <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Recent Winners</span>
               <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                 <span className="text-[10px] font-bold text-green-500 uppercase tracking-wider">Live</span>
               </div>
             </div>
             
             {/* Feed Container */}
             <div className="flex-1 overflow-hidden flex flex-col gap-3">
               {winners.map((winner) => (
                 <div key={winner.id} className="feed-item flex items-center justify-between bg-white/5 p-3 rounded-xl border border-white/5">
                   <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center text-lg border border-white/10">
                       🧑‍🚀
                     </div>
                     <div className="flex flex-col">
                       <span className="text-white text-sm font-bold">{winner.name}</span>
                       <span className="text-gray-400 text-[10px] font-medium">{winner.action}</span>
                     </div>
                   </div>
                   <span className="text-green-400 font-black text-sm">
                     +${winner.amount.toFixed(2)}
                   </span>
                 </div>
               ))}
             </div>
           </div>

           {/* 4. REFER & EARN BANNER */}
           <div className="bg-gradient-to-r from-purple-900/40 to-[#0B0D1A]/80 backdrop-blur-xl border border-purple-500/30 rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:border-purple-500/60 transition-colors shadow-[0_0_20px_rgba(168,85,247,0.15)]">
             <div className="flex items-center gap-4">
               <div className="w-10 h-10 bg-purple-600/20 rounded-xl flex items-center justify-center text-xl border border-purple-500/50">
                 🎁
               </div>
               <div className="flex flex-col">
                 <span className="text-white text-sm font-bold">Refer & Earn</span>
                 <span className="text-gray-400 text-xs font-medium">Invite friends and earn up to <span className="text-fuchsia-400 font-bold">$100</span></span>
               </div>
             </div>
             <span className="text-purple-400 font-bold">›</span>
           </div>

        </div>
      </section>
    </div>
  );
}