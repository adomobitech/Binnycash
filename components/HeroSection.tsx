'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { motion, Variants } from 'framer-motion';
import { useAuth } from './AuthContext';
import { useTranslation } from './LanguageContext';
import { Play, Sparkles, Users, Target, Zap, ArrowRight, ShieldCheck, Trophy, Flame } from 'lucide-react';

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

export default function HeroSection() {
  const { openRegister } = useAuth();
  const { t } = useTranslation();
  
  const [totalUsers, setTotalUsers] = useState<number>(0);
  const [totalOffers, setTotalOffers] = useState<string | number>(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [resUser, resOffer] = await Promise.all([
          fetch('https://api.binnycash.com/api/activeUser'),
          fetch('https://api.binnycash.com/api/avilableOffer')
        ]);

        const [jsonUser, jsonOffer] = await Promise.all([
          safeJsonParse(resUser),
          safeJsonParse(resOffer)
        ]);

        const countUser = typeof jsonUser === 'number' ? jsonUser : (jsonUser?.data ?? jsonUser?.totalUser ?? jsonUser?.count ?? 0);
        setTotalUsers(Number(countUser));

        const countOffer = jsonOffer?.data || jsonOffer?.total || jsonOffer?.count || jsonOffer?.offers || 3;
        setTotalOffers(countOffer);
      } catch (err) {
        console.error("Error fetching hero data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const offerCount = String(totalOffers).replace(/\D/g, '') || '0';

  const formatUsers = (num: number) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M+';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K+';
    return num.toString();
  };

  const scrollToHowItWorks = () => {
    const element = document.getElementById('how-it-works');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-between overflow-hidden bg-[#05050A] font-sans pt-24 lg:pt-32 pb-10">
      <div className="absolute inset-0 bg-[url('/background.png')] bg-cover bg-center bg-no-repeat opacity-40 mix-blend-screen scale-105 animate-[pulse_10s_ease-in-out_infinite]"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-[#05050A]/80 via-[#05050A]/40 to-[#05050A] z-0"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,#05050A_80%)] z-0"></div>
      <div className="absolute top-[10%] left-[20%] w-[30vw] h-[30vw] bg-[#00E57A]/15 blur-[120px] rounded-full pointer-events-none z-0"></div>
      <div className="absolute top-[20%] right-[10%] w-[40vw] h-[40vw] bg-[#8B5CF6]/15 blur-[150px] rounded-full pointer-events-none z-0"></div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 flex flex-col items-center text-center max-w-[1000px] mx-auto px-4 sm:px-6 w-full mt-10 lg:mt-16"
      >
        <motion.div variants={itemVariants} className="inline-flex items-center gap-2 bg-black/40 backdrop-blur-xl border border-white/10 px-5 py-2 rounded-full mb-8 shadow-[0_0_30px_rgba(0,229,122,0.15)]">
          <span className="w-2 h-2 rounded-full bg-[#00E57A] shadow-[0_0_10px_#00E57A] animate-pulse"></span>
          <span className="text-xs sm:text-sm font-black text-white tracking-widest uppercase">{t.Hero?.tagline || 'The Ultimate Earning Hub'}</span>
        </motion.div>
        
        <motion.h1 variants={itemVariants} className="text-[3.5rem] sm:text-[5rem] lg:text-[6.5rem] font-black tracking-tighter leading-[0.95] text-white mb-6 uppercase">
          {t.Hero?.title1 || 'Level Up Your'} <br className="hidden sm:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00E57A] via-[#3DE8A0] to-[#8B5CF6] drop-shadow-[0_0_40px_rgba(139,92,246,0.3)] italic">
            {t.Hero?.title2 || 'Wallet Today.'}
          </span>
        </motion.h1>
        
        <motion.p variants={itemVariants} className="text-[#A0A5B1] text-base sm:text-lg lg:text-xl mb-10 leading-relaxed max-w-2xl font-medium">
          {t.Hero?.subtitle || 'Play top-tier games, conquer high-paying surveys, and withdraw your cash instantly. No hidden fees. No limits. Just pure profit.'}
        </motion.p>
        
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center justify-center gap-5 w-full sm:w-auto">
          <button 
            onClick={openRegister} 
            className="w-full sm:w-auto relative group overflow-hidden rounded-2xl bg-[#00E57A] hover:bg-[#00c968] transition-all shadow-[0_0_40px_rgba(0,229,122,0.4)] hover:shadow-[0_0_60px_rgba(0,229,122,0.6)] hover:-translate-y-1 cursor-pointer"
          >
            <div className="absolute inset-0 w-full h-full bg-[linear-gradient(110deg,transparent_25%,rgba(255,255,255,0.4)_50%,transparent_75%)] bg-[length:250%_250%] group-hover:animate-[shimmer_1.5s_infinite]"></div>
            <div className="relative flex items-center justify-center gap-3 px-10 py-4 sm:py-5">
              <span className="font-black text-[15px] sm:text-[17px] text-[#05050A] tracking-widest uppercase">{t.Hero?.btnStart || 'Start Grinding Now'}</span>
              <Zap className="w-5 h-5 text-[#05050A] fill-[#05050A]" />
            </div>
          </button>
          
          <button 
            onClick={scrollToHowItWorks} 
            className="w-full sm:w-auto flex items-center justify-center gap-3 px-10 py-4 sm:py-5 rounded-2xl bg-black/30 backdrop-blur-md border border-white/10 hover:border-white/30 hover:bg-white/5 transition-all group cursor-pointer"
          >
            <Play className="w-5 h-5 text-[#8F95A3] group-hover:text-white transition-colors fill-transparent group-hover:fill-white/20" />
            <span className="text-white font-black text-[15px] sm:text-[17px] tracking-widest uppercase">{t.Hero?.btnHow || 'How It Works'}</span>
          </button>
        </motion.div>
      </motion.div>

      <motion.div 
        variants={itemVariants}
        initial="hidden"
        animate="visible"
        className="w-full max-w-[1300px] mx-auto px-4 sm:px-6 relative z-20 mt-16 lg:mt-24"
      >
        <div className="w-full bg-[#12141D]/60 backdrop-blur-2xl border-t border-l border-white/10 border-b-transparent border-r-transparent rounded-[32px] p-6 lg:p-8 shadow-[0_30px_80px_rgba(0,0,0,0.8)] relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-white/5 to-transparent opacity-50"></div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 relative z-10 divide-y sm:divide-y-0 sm:divide-x divide-white/10">
            <div className="flex items-center gap-5 justify-start lg:justify-center pt-4 sm:pt-0">
               <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#8B5CF6]/20 to-transparent border border-[#8B5CF6]/30 flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(139,92,246,0.15)]">
                 <Users className="w-7 h-7 text-[#A855F7]" />
               </div>
               <div className="flex flex-col">
                 <span className="text-3xl lg:text-4xl font-black text-white tracking-tight">{formatUsers(totalUsers)}</span>
                 <span className="text-[#8F95A3] text-[11px] font-bold uppercase tracking-widest mt-1">{t.Hero?.stats?.users || 'Active Warriors'}</span>
               </div>
            </div>

            <div className="flex items-center gap-5 justify-start lg:justify-center pt-6 sm:pt-0 pl-0 sm:pl-6 lg:pl-0">
               <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#00E57A]/20 to-transparent border border-[#00E57A]/30 flex items-center justify-center shrink-0 relative shadow-[0_0_20px_rgba(0,229,122,0.15)]">
                 <span className="absolute top-0 right-0 w-3 h-3 bg-[#00E57A] rounded-full animate-ping"></span>
                 <Target className="w-7 h-7 text-[#00E57A]" />
               </div>
               <div className="flex flex-col">
                 <span className="text-3xl lg:text-4xl font-black text-white tracking-tight">{isLoading ? '...' : `${offerCount}+`}</span>
                 <span className="text-[#8F95A3] text-[11px] font-bold uppercase tracking-widest mt-1">{t.Hero?.stats?.live || 'Live Missions'}</span>
               </div>
            </div>

            <div className="flex items-center gap-5 justify-start lg:justify-center pt-6 lg:pt-0 pl-0 lg:pl-0">
               <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#38bdf8]/20 to-transparent border border-[#38bdf8]/30 flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(56,189,248,0.15)]">
                 <Zap className="w-7 h-7 text-[#38bdf8]" />
               </div>
               <div className="flex flex-col">
                 <span className="text-3xl lg:text-4xl font-black text-white tracking-tight">&lt; 30s</span>
                 <span className="text-[#8F95A3] text-[11px] font-bold uppercase tracking-widest mt-1">{t.Hero?.stats?.time || 'Instant Payouts'}</span>
               </div>
            </div>

            <div className="flex items-center gap-5 justify-start lg:justify-center pt-6 sm:pt-6 lg:pt-0 pl-0 sm:pl-6 lg:pl-0">
               <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#F5A623]/20 to-transparent border border-[#F5A623]/30 flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(245,166,35,0.15)]">
                 <Trophy className="w-7 h-7 text-[#F5A623]" />
               </div>
               <div className="flex flex-col">
                 <span className="text-3xl lg:text-4xl font-black text-white tracking-tight">99.8%</span>
                 <span className="text-[#8F95A3] text-[11px] font-bold uppercase tracking-widest mt-1">{t.Hero?.stats?.success || 'Success Rate'}</span>
               </div>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#05050A] to-transparent pointer-events-none z-10"></div>
    </div>
  );
}