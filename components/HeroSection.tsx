'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

export default function HeroSection() {
  const { openRegister } = useAuth();
  
  const [totalEarned, setTotalEarned] = useState(18450.60);
  const [players, setPlayers] = useState(1200452);
  
  // Real-looking default data with ₹
  const [winners, setWinners] = useState([
    { id: 1, name: 'Rahul_99', action: 'Completed Battle Quest', amount: 850.00 },
    { id: 2, name: 'AlexGaming', action: 'Won Solo Showdown', amount: 420.50 },
    { id: 3, name: 'RohitM', action: 'Completed Daily Challenge', amount: 1250.00 },
    { id: 4, name: 'Aman_Y', action: 'Won Squad Tournament', amount: 940.20 },
  ]);

  useEffect(() => {
    // Speed increased to 800ms for a faster, livelier feel
    const interval = setInterval(() => {
      setTotalEarned(prev => prev + (Math.random() * 5 + 0.50));
      setPlayers(prev => prev + Math.floor(Math.random() * 3));
      
      // Increased probability to 60% so it updates more frequently
      if (Math.random() > 0.4) {
        const newNames = ['Priya_S', 'NinjaPro', 'Vikas007', 'Karan_D', 'Sneha_Win', 'Amit_OP', 'RiyaGamer'];
        const newActions = ['Cleared Boss Level', 'Daily Login Bonus', 'Referral Reward', 'Won Deathmatch', 'Jackpot Spin'];
        
        const newWinner = {
          id: Date.now(),
          name: newNames[Math.floor(Math.random() * newNames.length)],
          action: newActions[Math.floor(Math.random() * newActions.length)],
          amount: (Math.random() * 1500 + 50) // Realistic amounts between ₹50 and ₹1550
        };

        setWinners(prev => [newWinner, ...prev].slice(0, 4));
      }
    }, 800);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative min-h-screen flex flex-col justify-center overflow-hidden bg-[#08080C] bg-[url('/background.png')] bg-cover bg-center bg-no-repeat pb-20 lg:pb-0">
      
      <style jsx>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .feed-item { animation: slideIn 0.3s ease-out forwards; }
      `}</style>
      
      <div className="absolute inset-0 bg-gradient-to-r from-[#08080C]/95 via-[#08080C]/60 lg:via-[#08080C]/40 to-[#08080C]/90 z-0 pointer-events-none"></div>

      <section className="relative max-w-[1450px] mx-auto px-6 pt-24 pb-16 flex flex-col lg:flex-row items-center justify-between z-20 w-full gap-12 lg:gap-8">
        
        {/* ================= LEFT COLUMN ================= */}
        <div className="w-full lg:w-[45%] flex flex-col items-start text-left drop-shadow-2xl">
          <div className="inline-flex items-center gap-3 bg-[#12121A]/80 backdrop-blur-md border border-white/5 rounded-full p-1 pr-5 mb-6">
            <span className="bg-[#12121A] border border-[#00E57A]/30 text-[#00E57A] text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#00E57A] animate-pulse"></span> LIVE
            </span>
            <span className="text-sm text-gray-300 font-medium">New high-paying quests added!</span>
          </div>
          
          <h1 className="text-[4rem] sm:text-[6.5rem] lg:text-[7.5rem] font-black tracking-tighter leading-[0.9] lg:leading-[0.85] text-white mb-6 uppercase italic">
            Loot The <br />
            <span className="text-[#00E57A] drop-shadow-[0_0_25px_rgba(0,229,122,0.3)]">Digital</span> <br />World
          </h1>
          
          <p className="text-[#8F95A3] text-base lg:text-lg mb-10 leading-relaxed max-w-md font-medium">
            Complete epic quests, conquer insane games, and turn your skills into real cash. <br/>
            This isn't just a game. <span className="text-[#8B5CF6] font-bold">It's a revolution.</span>
          </p>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-5 w-full sm:w-auto">
            <button onClick={openRegister} className="w-full sm:w-auto flex justify-center items-center gap-2 rounded-xl bg-[#00E57A] hover:bg-[#00c968] shadow-[0_0_20px_rgba(0,229,122,0.2)] transition-all px-8 py-4">
              <span className="font-black text-sm text-[#08080C] tracking-wide uppercase">Start Earning</span>
              <span className="text-[#08080C]">⚡</span>
            </button>
            <Link href="#how-it-works" className="w-full sm:w-auto flex justify-center items-center gap-3 rounded-xl bg-[#12121A]/80 backdrop-blur-md border border-white/5 hover:bg-white/5 transition-all px-8 py-4">
              <span className="font-black text-sm text-white tracking-wide uppercase">How it Works</span>
              <span className="w-5 h-5 rounded-full border border-white flex items-center justify-center text-[10px] text-white pl-[1px]">▶</span>
            </Link>
          </div>
        </div>

        <div className="hidden lg:block w-[15%] h-[550px] relative pointer-events-none"></div>

        {/* ================= RIGHT COLUMN (Live Feed & Stats) ================= */}
        <div className="w-full lg:w-[40%] flex flex-col gap-4 relative z-20">
           
           <div className="bg-[#12121A]/80 backdrop-blur-2xl border border-white/5 rounded-3xl p-6 flex justify-between items-center shadow-xl">
             <div>
               <p className="text-xs text-[#8F95A3] font-bold uppercase tracking-wider mb-1">Total Earned</p>
               {/* Converted to ₹ */}
               <h3 className="text-3xl lg:text-4xl font-black text-white mb-2 transition-all duration-300">
                 ₹{totalEarned.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
               </h3>
               <div className="flex items-center gap-2 text-xs font-semibold">
                 <span className="text-[#00E57A]">↑ 23.5%</span>
                 <span className="text-gray-500">vs last week</span>
               </div>
             </div>
             <div className="w-16 h-16 lg:w-20 lg:h-20 bg-gradient-to-br from-[#00E57A]/10 to-[#8B5CF6]/10 rounded-2xl flex items-center justify-center border border-white/5 relative shadow-[0_0_30px_rgba(0,229,122,0.1)]">
               <span className="text-3xl lg:text-4xl absolute transform -rotate-12 hover:rotate-0 transition-transform duration-300">💸</span>
             </div>
           </div>

           <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
             <div className="bg-[#12121A]/80 backdrop-blur-xl border border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-lg hover:bg-white/5 transition-colors">
               <span className="text-[#8B5CF6] text-xl mb-2">👥</span>
               <span className="text-white font-black text-sm">{(players / 1000000).toFixed(1)}M+</span>
               <span className="text-[9px] text-[#8F95A3] font-bold uppercase mt-1">Players</span>
             </div>
             <div className="bg-[#12121A]/80 backdrop-blur-xl border border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-lg hover:bg-white/5 transition-colors">
               <span className="text-[#00E57A] text-xl mb-2">🎮</span>
               <span className="text-white font-black text-sm">50+</span>
               <span className="text-[9px] text-[#8F95A3] font-bold uppercase mt-1">Games</span>
             </div>
             <div className="bg-[#12121A]/80 backdrop-blur-xl border border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-lg hover:bg-white/5 transition-colors">
               <span className="text-[#8B5CF6] text-xl mb-2">⚡</span>
               <span className="text-white font-black text-sm">&lt;30s</span>
               <span className="text-[9px] text-[#8F95A3] font-bold uppercase mt-1">Payouts</span>
             </div>
             <div className="bg-[#12121A]/80 backdrop-blur-xl border border-white/5 rounded-2xl p-4 flex flex-col items-center justify-center text-center shadow-lg hover:bg-white/5 transition-colors">
               <span className="text-[#00E57A] text-xl mb-2">🏆</span>
               <span className="text-white font-black text-sm">98%</span>
               <span className="text-[9px] text-[#8F95A3] font-bold uppercase mt-1">Success</span>
             </div>
           </div>

           <div className="bg-[#12121A]/80 backdrop-blur-2xl border border-white/5 rounded-3xl p-5 shadow-xl flex flex-col h-[280px]">
             <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-3">
               <span className="text-xs text-[#8F95A3] font-bold uppercase tracking-wider">Recent Winners</span>
               <div className="flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-[#00E57A] animate-pulse"></div>
                 <span className="text-[10px] font-bold text-[#00E57A] uppercase tracking-wider">Live</span>
               </div>
             </div>
             <div className="flex-1 overflow-hidden flex flex-col gap-3">
               {winners.map((winner) => (
                 <div key={winner.id} className="feed-item flex items-center justify-between bg-white/5 p-3 rounded-xl border border-white/5 hover:border-white/10 transition-colors">
                   <div className="flex items-center gap-3">
                     <div className="w-10 h-10 rounded-full bg-[#08080C] flex items-center justify-center text-lg border border-white/5">
                       🧑‍🚀
                     </div>
                     <div className="flex flex-col">
                       <span className="text-white text-sm font-bold">{winner.name}</span>
                       <span className="text-[#8F95A3] text-[10px] font-medium">{winner.action}</span>
                     </div>
                   </div>
                   {/* Changed to ₹ */}
                   <span className="text-[#00E57A] font-black text-sm">
                     +₹{winner.amount.toFixed(2)}
                   </span>
                 </div>
               ))}
             </div>
           </div>

        </div>
      </section>
    </div>
  );
}