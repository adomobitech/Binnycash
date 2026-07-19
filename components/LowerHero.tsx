'use client';

import { useState, useEffect } from 'react';

export default function LowerHero() {
  const [jackpot, setJackpot] = useState(2548750);

  useEffect(() => {
    const interval = setInterval(() => {
      setJackpot(prev => prev + Math.floor(Math.random() * 250) + 100);
    }, 800); 
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full bg-[#08080C] relative overflow-hidden py-16 font-sans">
      
      {/* MOBILE ONLY BACKGROUND */}
      <div className="absolute inset-0 w-full h-full bg-[url('/lowerbackground.png')] bg-cover bg-center bg-no-repeat lg:hidden z-0 opacity-20 pointer-events-none"></div>
      
      <div className="absolute inset-0 bg-gradient-to-b from-[#08080C] via-transparent to-[#08080C] lg:hidden z-0 pointer-events-none"></div>

      {/* New Purple Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#8B5CF6]/5 blur-[120px] rounded-full pointer-events-none z-0"></div>

      <div className="max-w-[1450px] mx-auto px-6 flex flex-col gap-20 relative z-10">
        
        {/* ================= 1. HOW IT WORKS SECTION ================= */}
        <div className="w-full animate-in fade-in zoom-in duration-1000">
          <div className="flex items-center justify-center gap-4 mb-14">
            <div className="w-16 h-[1px] bg-gradient-to-r from-transparent to-[#8B5CF6]/50"></div>
            <h2 className="text-white font-black text-xl tracking-widest uppercase text-center drop-shadow-md">How It Works</h2>
            <div className="w-16 h-[1px] bg-gradient-to-l from-transparent to-[#8B5CF6]/50"></div>
          </div>

          <div className="grid grid-cols-2 lg:flex justify-center items-center gap-6 lg:gap-10">
            {['Play Games', 'Complete Quests', 'Earn Cash', 'Instant Withdraw'].map((step, i) => (
              <div key={i} className="flex flex-col items-center text-center w-full lg:w-48 group hover:-translate-y-2 transition-transform duration-300">
                <div className="w-20 h-20 lg:w-24 lg:h-24 rounded-full border border-white/10 bg-[#12121A]/80 backdrop-blur-md lg:bg-transparent flex items-center justify-center mb-6 relative group-hover:border-[#00E57A]/50 shadow-[0_0_20px_rgba(0,229,122,0.05)] transition-all z-10">
                  <div className="absolute top-0 left-0 -translate-x-1 -translate-y-1 w-6 h-6 rounded-full bg-[#00E57A] flex items-center justify-center text-xs font-black text-[#08080C] shadow-lg">{i + 1}</div>
                  <span className="text-3xl lg:text-4xl">{['🎮', '🎯', '💳', '💵'][i]}</span>
                </div>
                <h3 className="text-white font-black text-xs lg:text-sm uppercase mb-2 drop-shadow-lg">{step}</h3>
              </div>
            ))}
          </div>
        </div>

        {/* ================= 2. MAIN 3-COLUMN GRID ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left: Why Players Love */}
          <div className="lg:col-span-3 flex flex-col gap-6 relative z-20 animate-in slide-in-from-left duration-1000">
            <h3 className="text-white font-black text-lg uppercase tracking-wider mb-2 text-center lg:text-left drop-shadow-lg">Why Players Love <span className="text-[#00E57A]">BINNYCASH</span></h3>
            {['Secure Payments', 'Instant Withdraw', 'Fair Play', '24/7 Support'].map((feature, i) => (
              <div key={i} className="flex gap-4 items-center bg-[#12121A]/80 backdrop-blur-md p-3 rounded-xl border border-white/5 hover:border-[#8B5CF6]/30 transition-all cursor-default">
                <div className="w-8 h-8 rounded-lg bg-[#8B5CF6]/10 flex items-center justify-center text-[#8B5CF6]">✨</div>
                <span className="text-white text-sm font-bold">{feature}</span>
              </div>
            ))}
          </div>

          {/* Center THE MAIN ASSET */}
          <div className="hidden lg:flex lg:col-span-5 h-[600px] relative justify-center items-center overflow-hidden rounded-3xl group z-10 border border-white/10 shadow-[0_0_40px_rgba(139,92,246,0.1)]">
            <div className="absolute inset-0 w-full h-full bg-[url('/lowerbackground.png')] bg-cover bg-center bg-no-repeat z-0 transform group-hover:scale-105 transition-transform duration-700 ease-out"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-[#08080C] via-transparent to-transparent z-10 pointer-events-none opacity-80"></div>
          </div>

          {/* Right: Jackpot & Leaderboard */}
          <div className="lg:col-span-4 flex flex-col gap-6 relative z-20 animate-in slide-in-from-right duration-1000 mt-8 lg:mt-0">
            
            {/* Live Jackpot Card */}
            <div className="bg-[#12121A]/80 backdrop-blur-md border border-[#8B5CF6]/40 rounded-2xl p-6 shadow-[0_0_30px_rgba(139,92,246,0.15)] relative overflow-hidden group">
              <span className="text-[#8F95A3] font-bold text-xs uppercase tracking-wider mb-2 block">Live Jackpot</span>
              <h3 className="text-4xl lg:text-5xl font-black text-[#8B5CF6] mb-6 drop-shadow-[0_0_15px_rgba(139,92,246,0.2)]">
                ₹{jackpot.toLocaleString('en-IN')}
              </h3>
              <button className="w-full bg-[#00E57A] hover:bg-[#00c968] text-[#08080C] font-black text-sm uppercase py-4 rounded-xl shadow-[0_0_20px_rgba(0,229,122,0.2)] transition-all animate-pulse">
                Join Now & Win ⚡
              </button>
            </div>

            {/* Daily Top Earners Card */}
            <div className="bg-[#12121A]/80 backdrop-blur-md border border-white/5 rounded-2xl p-6">
              <h3 className="text-white font-bold text-sm uppercase tracking-wider mb-6">Daily Top Earners</h3>
              <div className="flex flex-col gap-4">
                {[1,2,3,4,5].map((rank) => (
                  <div key={rank} className="flex items-center justify-between p-2 hover:bg-white/5 rounded-lg transition-colors">
                    <div className="flex items-center gap-4">
                      <span className="text-sm font-black text-[#8F95A3] w-4">{rank}</span>
                      <span className="text-white text-sm font-medium">Player_{100+rank}</span>
                    </div>
                    <span className="text-[#00E57A] font-bold text-sm">₹{20000 - (rank*2000)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}