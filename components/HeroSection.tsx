'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

export default function HeroSection() {
  const { openRegister } = useAuth();
  
  // API States
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [totalOffers, setTotalOffers] = useState<string | number>(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 1. Fetch Total Users
    fetch('https://apitest.binnycash.com/api/admin/totalUser?adminId=2')
      .then(res => res.json())
      .then(resData => {
        const count = typeof resData === 'number' ? resData : (resData?.data ?? resData?.totalUser ?? resData?.count ?? 0);
        setTotalUsers(Number(count));
      })
      .catch(err => {
        console.error("Error fetching users:", err);
        setTotalUsers(0);
      });

    // 2. Fetch Total Offers
    fetch('https://apitest.binnycash.com/api/user/offer/totaloffer')
      .then(res => res.json())
      .then(resData => {
        const count = resData?.data || resData?.total || resData?.count || resData?.offers || 3;
        setTotalOffers(count);
      })
      .catch(err => {
        console.error("Error fetching offers:", err);
        setTotalOffers(3); 
      })
      .finally(() => setIsLoading(false));
  }, []);

  const offerCount = String(totalOffers).replace(/\D/g, '') || '0';

  const formatUsers = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M+';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K+';
    return num.toString();
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-center overflow-hidden bg-[#08080C] bg-[url('/background.png')] bg-cover bg-center bg-no-repeat pb-10 pt-28">
      
      {/* Background Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#08080C]/90 via-[#08080C]/60 to-[#08080C]/90 z-0 pointer-events-none"></div>

      <section className="relative max-w-[1450px] mx-auto px-6 flex flex-col z-20 w-full gap-8">
        
        {/* ================= TOP ROW: Text & Feature List ================= */}
        <div className="flex flex-col lg:flex-row items-center justify-between gap-12 w-full">
          
          {/* Left Side: Headlines & CTA */}
          <div className="w-full lg:w-[55%] flex flex-col items-start text-left drop-shadow-2xl">
            <div className="inline-flex items-center gap-3 bg-[#12121A]/80 backdrop-blur-md border border-white/5 rounded-full p-1 pr-5 mb-6">
              <span className="bg-[#00E57A]/10 border border-[#00E57A]/30 text-[#00E57A] text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-wider flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#00E57A] animate-pulse"></span> LIVE
              </span>
              <span className="text-sm text-gray-300 font-medium">Top paying offers available now!</span>
            </div>
            
            <h1 className="text-[3.5rem] sm:text-[5rem] lg:text-[6rem] font-black tracking-tighter leading-[1] text-white mb-6 uppercase italic">
              Earn <span className="text-[#00E57A] drop-shadow-[0_0_20px_rgba(0,229,122,0.3)]">Real</span><br/>
              <span className="text-[#00E57A] drop-shadow-[0_0_20px_rgba(0,229,122,0.3)]">Cash</span> Today
            </h1>
            
            <p className="text-[#8F95A3] text-base lg:text-lg mb-8 leading-relaxed max-w-lg font-medium">
              Complete high-paying surveys, try new apps, and earn real money instantly. 
              Join our growing community making cash daily.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center gap-6 w-full sm:w-auto">
              <button onClick={openRegister} className="w-full sm:w-auto flex justify-center items-center gap-2 rounded-xl bg-[#00E57A] hover:bg-[#00c968] shadow-[0_0_20px_rgba(0,229,122,0.2)] transition-all px-8 py-4">
                <span className="font-black text-sm text-[#08080C] tracking-wide uppercase">Start Earning Now</span>
                <span className="text-[#08080C]">⚡</span>
              </button>
              
              <button className="flex items-center gap-3 group">
                <div className="w-12 h-12 rounded-full border border-white/20 flex items-center justify-center group-hover:border-white/50 transition-colors">
                  <div className="w-0 h-0 border-t-[6px] border-t-transparent border-l-[10px] border-l-white border-b-[6px] border-b-transparent ml-1"></div>
                </div>
                <span className="text-white font-semibold text-sm group-hover:text-gray-300 transition-colors">How It Works</span>
              </button>
            </div>
          </div>

          {/* Right Side: 3 Premium Feature Cards */}
          <div className="w-full lg:w-[45%] flex flex-col gap-4 justify-center mt-8 lg:mt-0">
            
            {/* Card 1: Play and Win (Purple Glow) */}
            <div className="relative p-[1.5px] bg-gradient-to-r from-white/10 to-transparent hover:from-[#a855f7]/80 rounded-2xl transition-all duration-300 group hover:translate-x-2 cursor-default">
              <div className="bg-[#0b0b12]/90 backdrop-blur-xl rounded-2xl p-5 flex items-center gap-5 h-full border border-white/5 group-hover:border-transparent transition-colors relative overflow-hidden">
                <div className="absolute left-8 top-1/2 -translate-y-1/2 w-16 h-16 bg-[#a855f7] blur-[40px] opacity-0 group-hover:opacity-40 transition-opacity duration-500"></div>
                <div className="w-14 h-14 shrink-0 rounded-xl bg-gradient-to-br from-[#2e1065] to-[#0f0518] border border-[#a855f7]/30 flex items-center justify-center text-3xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-[0_0_15px_rgba(168,85,247,0.2)] z-10">
                  🎮
                </div>
                <div className="flex flex-col z-10">
                  <h4 className="text-white font-black text-[17px] mb-1 uppercase tracking-wide group-hover:text-[#c084fc] transition-colors">Play And Win</h4>
                  <p className="text-gray-400 text-sm leading-relaxed">Play games, earn cash. Try exciting new games and get rewarded.</p>
                </div>
              </div>
            </div>

            {/* Card 2: Complete Offer (Pink/Red Glow) */}
            <div className="relative p-[1.5px] bg-gradient-to-r from-white/10 to-transparent hover:from-[#f43f5e]/80 rounded-2xl transition-all duration-300 group hover:translate-x-2 cursor-default">
              <div className="bg-[#0b0b12]/90 backdrop-blur-xl rounded-2xl p-5 flex items-center gap-5 h-full border border-white/5 group-hover:border-transparent transition-colors relative overflow-hidden">
                <div className="absolute left-8 top-1/2 -translate-y-1/2 w-16 h-16 bg-[#f43f5e] blur-[40px] opacity-0 group-hover:opacity-30 transition-opacity duration-500"></div>
                <div className="w-14 h-14 shrink-0 rounded-xl bg-gradient-to-br from-[#4c0519] to-[#0f0518] border border-[#f43f5e]/30 flex items-center justify-center text-3xl group-hover:scale-110 group-hover:-rotate-6 transition-all duration-300 shadow-[0_0_15px_rgba(244,63,94,0.2)] z-10">
                  🏆
                </div>
                <div className="flex flex-col z-10">
                  <h4 className="text-white font-black text-[17px] mb-1 uppercase tracking-wide group-hover:text-[#fb7185] transition-colors">Complete Offer</h4>
                  <p className="text-gray-400 text-sm leading-relaxed">Try new apps and get paid instantly. Making money has never been this easy.</p>
                </div>
              </div>
            </div>

            {/* Card 3: Join Surveys (Cyan/Blue Glow) */}
            <div className="relative p-[1.5px] bg-gradient-to-r from-white/10 to-transparent hover:from-[#0ea5e9]/80 rounded-2xl transition-all duration-300 group hover:translate-x-2 cursor-default">
              <div className="bg-[#0b0b12]/90 backdrop-blur-xl rounded-2xl p-5 flex items-center gap-5 h-full border border-white/5 group-hover:border-transparent transition-colors relative overflow-hidden">
                <div className="absolute left-8 top-1/2 -translate-y-1/2 w-16 h-16 bg-[#0ea5e9] blur-[40px] opacity-0 group-hover:opacity-30 transition-opacity duration-500"></div>
                <div className="w-14 h-14 shrink-0 rounded-xl bg-gradient-to-br from-[#082f49] to-[#0f0518] border border-[#0ea5e9]/30 flex items-center justify-center text-3xl group-hover:scale-110 group-hover:rotate-6 transition-all duration-300 shadow-[0_0_15px_rgba(14,165,233,0.2)] z-10">
                  📝
                </div>
                <div className="flex flex-col z-10">
                  <h4 className="text-white font-black text-[17px] mb-1 uppercase tracking-wide group-hover:text-[#38bdf8] transition-colors">Join Surveys</h4>
                  <p className="text-gray-400 text-sm leading-relaxed">Your opinion matters! Companies pay you to improve their products and services.</p>
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* ================= MIDDLE ROW: 4 Stat Cards ================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full mt-4">
          
          {/* 1. TOTAL USERS */}
          <div className="bg-gradient-to-r from-[#8b5cf6]/50 to-transparent p-[1px] rounded-xl hover:-translate-y-1 transition-transform cursor-default">
            <div className="bg-[#12121A]/90 backdrop-blur-md w-full h-full p-5 flex flex-col justify-between rounded-xl border border-white/5 relative overflow-hidden">
              <div className="flex items-center gap-4">
                <div className="text-3xl text-[#a855f7] drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]">👥</div>
                <div className="flex flex-col">
                  <span className="text-2xl font-black text-white">{formatUsers(totalUsers)}</span>
                  <span className="text-[10px] font-bold text-[#c084fc] uppercase tracking-wider">Total Users</span>
                </div>
              </div>
              <div className="w-full h-1 bg-white/5 rounded-full mt-4 overflow-hidden"><div className="w-[80%] h-full bg-[#a855f7] shadow-[0_0_10px_#a855f7]"></div></div>
            </div>
          </div>

          {/* 2. LIVE OFFERS IN INDIA */}
          <div className="bg-gradient-to-r from-[#f43f5e]/50 to-transparent p-[1px] rounded-xl hover:-translate-y-1 transition-transform cursor-default">
            <div className="bg-[#12121A]/90 backdrop-blur-md w-full h-full p-5 flex flex-col justify-between rounded-xl border border-white/5 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-3xl text-[#fb7185] drop-shadow-[0_0_10px_rgba(244,63,94,0.5)]">🎯</div>
                  <div className="flex flex-col">
                    <span className="text-2xl font-black text-white">{offerCount}+</span>
                    <span className="text-[10px] font-bold text-[#fb7185] uppercase tracking-wider">Live Offers</span>
                  </div>
                </div>
                <div className="bg-[#1c080e] border border-[#f43f5e]/30 px-2.5 py-1 rounded-md flex items-center gap-1.5 shadow-sm">
                  <span className="text-xs">🇮🇳</span>
                  <span className="text-[10px] font-bold text-gray-300 uppercase tracking-wider">IN</span>
                </div>
              </div>
              <div className="w-full h-1 bg-white/5 rounded-full mt-4 overflow-hidden"><div className="w-[60%] h-full bg-[#f43f5e] shadow-[0_0_10px_#f43f5e]"></div></div>
            </div>
          </div>

          {/* 3. AVG PAYOUT TIME */}
          <div className="bg-gradient-to-r from-[#0ea5e9]/50 to-transparent p-[1px] rounded-xl hover:-translate-y-1 transition-transform cursor-default">
            <div className="bg-[#12121A]/90 backdrop-blur-md w-full h-full p-5 flex flex-col justify-between rounded-xl border border-white/5 relative overflow-hidden">
              <div className="flex items-center gap-4">
                <div className="text-3xl text-[#38bdf8] drop-shadow-[0_0_10px_rgba(14,165,233,0.5)]">⚡</div>
                <div className="flex flex-col">
                  <span className="text-2xl font-black text-white">&lt; 30s</span>
                  <span className="text-[10px] font-bold text-[#38bdf8] uppercase tracking-wider">Avg. Payout Time</span>
                </div>
              </div>
              <div className="w-full h-1 bg-white/5 rounded-full mt-4 overflow-hidden"><div className="w-[90%] h-full bg-[#0ea5e9] shadow-[0_0_10px_#0ea5e9]"></div></div>
            </div>
          </div>

          {/* 4. SUCCESS RATE */}
          <div className="bg-gradient-to-r from-[#22c55e]/50 to-transparent p-[1px] rounded-xl hover:-translate-y-1 transition-transform cursor-default">
            <div className="bg-[#12121A]/90 backdrop-blur-md w-full h-full p-5 flex flex-col justify-between rounded-xl border border-white/5 relative overflow-hidden">
              <div className="flex items-center gap-4">
                <div className="text-3xl text-[#4ade80] drop-shadow-[0_0_10px_rgba(34,197,94,0.5)]">🏆</div>
                <div className="flex flex-col">
                  <span className="text-2xl font-black text-white">99.2%</span>
                  <span className="text-[10px] font-bold text-[#4ade80] uppercase tracking-wider">Success Rate</span>
                </div>
              </div>
              <div className="w-full h-1 bg-white/5 rounded-full mt-4 overflow-hidden"><div className="w-[98%] h-full bg-[#22c55e] shadow-[0_0_10px_#22c55e]"></div></div>
            </div>
          </div>

        </div>

        {/* ================= BOTTOM ROW: Trust Banner ================= */}
        <div className="w-full bg-[#12121A]/80 backdrop-blur-md border border-white/10 rounded-2xl p-4 md:p-6 mt-2 flex flex-col md:flex-row items-center justify-between gap-6 lg:gap-0">
           
           <div className="flex items-center gap-4">
             <div className="flex -space-x-3">
               <div className="w-10 h-10 rounded-full border-2 border-[#12121A] bg-[url('https://i.pravatar.cc/100?img=11')] bg-cover"></div>
               <div className="w-10 h-10 rounded-full border-2 border-[#12121A] bg-[url('https://i.pravatar.cc/100?img=12')] bg-cover"></div>
               <div className="w-10 h-10 rounded-full border-2 border-[#12121A] bg-[url('https://i.pravatar.cc/100?img=13')] bg-cover"></div>
               <div className="w-10 h-10 rounded-full bg-[#00E57A] border-2 border-[#12121A] flex items-center justify-center text-[10px] font-bold text-black z-10">...</div>
             </div>
             <div className="flex flex-col">
               <span className="text-white font-bold text-sm">Join BinnyCash Today</span>
               <span className="text-gray-400 text-xs">Be part of the fastest growing earning community</span>
             </div>
           </div>

           <div className="hidden lg:block w-[1px] h-10 bg-white/10"></div>

           <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-[#00E57A]/10 flex items-center justify-center text-[#00E57A] text-xl">✔</div>
             <div className="flex flex-col">
               <div className="flex items-center gap-2">
                 <span className="text-white font-bold text-sm">Top Rated</span>
                 <span className="text-[#eab308] text-xs">★★★★★</span>
               </div>
               <span className="text-gray-400 text-xs">Loved by our users</span>
             </div>
           </div>

           <div className="hidden lg:block w-[1px] h-10 bg-white/10"></div>

           <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-full bg-[#a855f7]/10 flex items-center justify-center text-[#a855f7] text-xl">🔒</div>
             <div className="flex flex-col">
               <span className="text-white font-bold text-sm">Secure Payments</span>
               <span className="text-gray-400 text-xs">100% Safe Withdrawals</span>
             </div>
           </div>

        </div>

      </section>
    </div>
  );
}