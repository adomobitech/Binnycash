'use client';

import { useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { useTranslation } from './LanguageContext';

const safeJsonParse = async (res: Response) => {
  try {
    const text = await res.text();
    if (text && !text.trim().startsWith('<')) {
      return JSON.parse(text);
    }
    return { code: 500, data: null, message: "HTML returned instead of JSON" };
  } catch (error) {
    return { code: 500, data: null, message: "Parse Failed" };
  }
};

export default function LowerHero() {
  const { openRegister } = useAuth();
  const { t } = useTranslation();
  
  const [totalPaid, setTotalPaid] = useState<number | string>(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPayAmount = async () => {
      try {
        const res = await fetch('https://apitest.binnycash.com/api/payAmount');
        const resData = await safeJsonParse(res);
        const amount = resData?.data ?? resData?.amount ?? resData?.total ?? resData ?? 0;
        setTotalPaid(amount);
      } catch (err) {
        console.error("Error fetching paid amount:", err);
        setTotalPaid(0);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPayAmount();
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

  const formatAmount = (val: number | string) => {
    const num = Number(val);
    if (isNaN(num)) return val;
    // Changed en-IN to en-US for proper dollar comma formatting
    return num.toLocaleString('en-US', { maximumFractionDigits: 2 });
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

        {/* Unique Total Paid Amount Section */}
        <div className="w-full">
          <div className="bg-gradient-to-br from-[#120f24] via-[#0f0e17] to-[#1a1033] border border-[#7e22ce]/30 rounded-3xl p-8 md:p-12 flex flex-col items-center text-center relative overflow-hidden shadow-[0_20px_50px_rgba(126,34,206,0.15)]">
            <div className="absolute -top-24 -right-24 w-72 h-72 bg-[#9333ea]/20 rounded-full blur-[80px] pointer-events-none"></div>
            <div className="absolute -bottom-24 -left-24 w-72 h-72 bg-[#00E57A]/10 rounded-full blur-[80px] pointer-events-none"></div>

            <div className="inline-flex items-center gap-2 bg-[#8b5cf6]/15 border border-[#8b5cf6]/30 px-4 py-1.5 rounded-full mb-6">
              <span className="w-2 h-2 rounded-full bg-[#00E57A] animate-ping"></span>
              <span className="text-[#d8b4fe] text-[11px] font-black uppercase tracking-widest">Global Platform Milestone</span>
            </div>

            <h3 className="text-gray-300 font-bold text-sm md:text-base uppercase tracking-[0.2em] mb-3">
              Total Paid Out To Community
            </h3>

            <div className="my-2">
              {isLoading ? (
                <div className="h-16 w-64 bg-white/5 animate-pulse rounded-2xl mx-auto"></div>
              ) : (
                <div className="text-4xl sm:text-6xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-[#e9d5ff] to-[#00E57A] tracking-tighter drop-shadow-[0_0_35px_rgba(0,229,122,0.25)]">
                  ${formatAmount(totalPaid)}
                </div>
              )}
            </div>

            <p className="text-gray-400 text-xs md:text-sm max-w-md mx-auto mt-3 mb-8 leading-relaxed">
              Real rewards distributed instantly to warriors worldwide. Join our winning community today and claim your share!
            </p>

            <div className="border-t border-white/10 w-full pt-8 flex flex-col md:flex-row items-center justify-between gap-6">
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 text-gray-400 text-xs font-medium">
                <div className="flex items-center gap-2"><span className="text-[#8b5cf6]">🔒</span> 100% Encrypted & Safe</div>
                <div className="flex items-center gap-2"><span className="text-[#8b5cf6]">⚡</span> Instant Wallet Withdrawals</div>
                <div className="flex items-center gap-2"><span className="text-[#8b5cf6]">🎮</span> Verified Offer Walls</div>
              </div>

              <button 
                onClick={openRegister} 
                className="w-full md:w-auto bg-gradient-to-r from-[#8b5cf6] to-[#7c3aed] hover:opacity-95 text-white font-black text-xs uppercase px-10 py-4 rounded-2xl transition-all shadow-[0_0_25px_rgba(139,92,246,0.4)] hover:shadow-[0_0_35px_rgba(139,92,246,0.6)] shrink-0 cursor-pointer"
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