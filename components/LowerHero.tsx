'use client';

import { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useTranslation } from './LanguageContext';

interface TopEarner {
  id?: number | string;
  name?: string;
  userName?: string;
  username?: string;
  amount?: number;
  totalAmount?: number;
  totalEarning?: number;
  earnings?: number;
  [key: string]: any;
}

export default function LowerHero() {
  const { openRegister } = useAuth();
  const { t } = useTranslation();
  
  const [topEarners, setTopEarners] = useState<TopEarner[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('https://apitest.binnycash.com/api/admin/userEarningList')
      .then(res => res.json())
      .then(resData => {
        const list = resData?.data || resData?.list || resData || [];
        setTopEarners(Array.isArray(list) ? list.slice(0, 3) : []);
      })
      .catch(err => {
        console.error("Error fetching earners:", err);
        setTopEarners([]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const steps = [
    { num: '01', title: t.LowerHero?.s1?.title || 'SIGN UP FREE', desc: t.LowerHero?.s1?.desc || 'Create your free account in seconds and get started', icon: '👤' },
    { num: '02', title: t.LowerHero?.s2?.title || 'PLAY & COMPLETE', desc: t.LowerHero?.s2?.desc || 'Play games, try apps, take surveys & more', icon: '🎮' },
    { num: '03', title: t.LowerHero?.s3?.title || 'EARN POINTS', desc: t.LowerHero?.s3?.desc || 'Complete tasks and earn exciting rewards', icon: '👛' },
    { num: '04', title: t.LowerHero?.s4?.title || 'WITHDRAW CASH', desc: t.LowerHero?.s4?.desc || 'Withdraw your earnings instantly to your wallet', icon: '💸' },
  ];

  const cardCutStyle = {
    clipPath: 'polygon(0 0, calc(100% - 20px) 0, 100% 20px, 100% 100%, 20px 100%, 0 calc(100% - 20px))'
  };

  return (
    <div id="how-it-works" className="w-full bg-[#08080C] relative overflow-hidden py-20 font-sans scroll-mt-24">
      <div className="max-w-[1300px] mx-auto px-6 flex flex-col gap-16 relative z-10">
        
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-1.5 h-1.5 rotate-45 bg-[#8b5cf6]"></div>
            <span className="text-[#8b5cf6] font-bold text-xs tracking-[0.2em] uppercase">{t.LowerHero?.tagline || 'How It Works'}</span>
            <div className="w-1.5 h-1.5 rotate-45 bg-[#8b5cf6]"></div>
          </div>
          <h2 className="text-white font-black text-3xl md:text-5xl uppercase mb-3 tracking-tight">
            {t.LowerHero?.title1 || 'Earn In'} <span className="text-[#c084fc]">{t.LowerHero?.title2 || '4 Simple Steps'}</span>
          </h2>
          <p className="text-gray-400 text-sm md:text-base">{t.LowerHero?.subtitle || 'Play, complete & earn real cash rewards in just a few clicks'}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
          {steps.map((step, index) => (
            <div key={index} className="relative w-full h-[220px] group">
              <div className="absolute top-0 left-0 z-20">
                <div className="bg-[#6d28d9] text-white font-black text-sm px-3 py-1.5 rounded-br-xl shadow-md">
                  {step.num}
                </div>
              </div>

              <div className="w-full h-full p-[1px] bg-[#1e1b2e] hover:bg-[#8b5cf6]/50 transition-colors duration-300" style={cardCutStyle}>
                <div className="bg-[#12111a] w-full h-full p-6 pt-10 flex flex-col items-center text-center relative" style={cardCutStyle}>
                  <div className="text-5xl mb-4 z-10 group-hover:scale-110 transition-transform duration-300">
                    {step.icon}
                  </div>
                  <h3 className="text-white font-black text-sm mb-2 z-10 tracking-wider uppercase">{step.title}</h3>
                  <p className="text-gray-400 text-xs z-10 leading-relaxed">{step.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="w-full">
          <div className="bg-[#0f0e17] border border-white/10 rounded-2xl p-6 md:p-8 flex flex-col gap-6 relative overflow-hidden">
            
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/5 pb-5">
              <h3 className="text-white font-black text-base md:text-lg tracking-wider flex items-center gap-2.5 uppercase">
                <span>🏆</span> {t.LowerHero?.leaderboard || 'DAILY TOP EARNERS'}
              </h3>
              <div className="flex items-center gap-2 bg-[#00E57A]/10 border border-[#00E57A]/20 px-3 py-1 rounded-full">
                <div className="w-2 h-2 rounded-full bg-[#00E57A] animate-pulse"></div>
                <span className="text-[10px] text-[#00E57A] font-bold uppercase tracking-widest">{t.LowerHero?.live || 'Live Updates'}</span>
              </div>
            </div>

            <div className="min-h-[120px] flex items-center justify-center">
              {isLoading ? (
                <div className="flex gap-4 w-full">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 bg-white/5 animate-pulse rounded-xl flex-1"></div>
                  ))}
                </div>
              ) : topEarners.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
                  {topEarners.map((earner, idx) => {
                    const name = earner.name || earner.userName || earner.username || `User_${idx + 1}`;
                    const amount = earner.amount || earner.totalAmount || earner.totalEarning || earner.earnings || 0;
                    
                    return (
                      <div key={idx} className="bg-[#181625] border border-white/5 rounded-xl p-4 flex items-center gap-4">
                        <div className="w-8 h-8 rounded-lg bg-[#8b5cf6]/20 text-[#8b5cf6] flex items-center justify-center font-black text-sm">
                          #{idx + 1}
                        </div>
                        <div className="flex flex-col overflow-hidden">
                          <span className="text-white text-sm font-bold truncate">{name}</span>
                          <span className="text-[#00E57A] font-black text-sm">₹{Number(amount).toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center text-gray-500 text-sm font-medium py-6">
                  {t.LowerHero?.noEarners || 'No earners logged for today yet. Start playing to rank first!'}
                </div>
              )}
            </div>

            <div className="border-t border-white/5 pt-6 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex flex-wrap items-center gap-6 text-gray-400 text-xs font-medium">
                <div className="flex items-center gap-2"><span className="text-[#8b5cf6]">🔒</span> {t.LowerHero?.f1 || '100% Encrypted & Safe'}</div>
                <div className="flex items-center gap-2"><span className="text-[#8b5cf6]">⚡</span> {t.LowerHero?.f2 || 'Instant Wallet Withdrawals'}</div>
                <div className="flex items-center gap-2"><span className="text-[#8b5cf6]">🎮</span> {t.LowerHero?.f3 || 'Verified Offer Walls'}</div>
              </div>

              <button 
                onClick={openRegister} 
                className="w-full md:w-auto bg-[#8b5cf6] hover:bg-[#7c3aed] text-white font-black text-xs uppercase px-8 py-3.5 rounded-xl transition-all shadow-[0_0_15px_rgba(139,92,246,0.2)] hover:shadow-[0_0_25px_rgba(139,92,246,0.4)] shrink-0 cursor-pointer"
              >
                {t.LowerHero?.btnStart || 'START EARNING NOW'} ⚡
              </button>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}