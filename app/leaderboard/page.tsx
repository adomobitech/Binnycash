'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Bell, Loader2, Crown } from 'lucide-react';
import { useCurrency, formatPrice } from '@/hooks/useCurrency';

// --- UTILITY: Get User ID securely ---
function getUserId(): string {
  if (typeof window === 'undefined') return '';
  const isNumeric = (v: any) => v !== null && v !== undefined && /^\d+$/.test(String(v));
  try {
    const wrapperKeys = ['loginResponse', 'authResponse', 'loginData'];
    for (const key of wrapperKeys) {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      try {
        const parsed = JSON.parse(raw);
        const id = parsed?.data?.userDetails?.id ?? parsed?.userDetails?.id;
        if (isNumeric(id)) return String(id);
      } catch {}
    }
    const objectKeys = ['userDetails', 'user', 'userData', 'profile', 'authUser'];
    for (const key of objectKeys) {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      try {
        const parsed = JSON.parse(raw);
        const candidates = [parsed?.id, parsed?.userDetails?.id, parsed?._id, parsed?.userId, parsed?.user_id];
        const numericMatch = candidates.find(isNumeric);
        if (numericMatch !== undefined) return String(numericMatch);
      } catch {}
    }
    const directKeys = ['userId', 'user_id', 'uid', 'sid', 'numericUserId'];
    for (const key of directKeys) {
      const val = localStorage.getItem(key);
      if (isNumeric(val)) return String(val);
    }
  } catch (err) {}
  return '';
}

const resolveImage = (imgSrc: string | null | undefined) => {
  if (!imgSrc || imgSrc.trim() === '') return null;
  if (imgSrc.startsWith('http')) return imgSrc;
  return imgSrc.startsWith('/') ? `https://apitest.binnycash.com${imgSrc}` : `https://apitest.binnycash.com/${imgSrc}`;
};

function AnimatedNumber({ value, prefix = '', suffix = '', decimals = 0, className = '' }: { value: number; prefix?: string; suffix?: string; decimals?: number; className?: string }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    const target = Number(value) || 0;
    const start = display;
    const duration = 800;
    const startTime = performance.now();
    let raf: number;
    const step = (now: number) => {
      const progress = Math.min((now - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(start + (target - start) * eased);
      if (progress < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value]);
  return <span className={className}>{prefix}{display.toFixed(decimals)}{suffix}</span>;
}

const Particles = () => (
  <>
    {Array.from({ length: 10 }).map((_, i) => (
      <motion.div
        key={i}
        className="absolute rounded-full"
        style={{
          left: `${8 + i * 9}%`,
          width: 4 + (i % 3) * 2,
          height: 4 + (i % 3) * 2,
          background: i % 2 === 0 ? 'rgba(166,108,255,0.5)' : 'rgba(255,201,74,0.4)',
          filter: 'blur(1px)',
        }}
        initial={{ y: '110vh', opacity: 0 }}
        animate={{ y: '-10vh', opacity: [0, 1, 1, 0] }}
        transition={{ duration: 10 + (i % 5), repeat: Infinity, delay: i * 1.3, ease: 'linear' }}
      />
    ))}
  </>
);

const Medal = ({ place }: { place: 1 | 2 | 3 }) => {
  const colors = {
    1: { main: '#FFC94A', dark: '#B48A2D', glow: 'rgba(255,201,74,0.5)', text: '1st' },
    2: { main: '#E2E8F0', dark: '#94A3B8', glow: 'rgba(226,232,240,0.4)', text: '2nd' },
    3: { main: '#CD7F32', dark: '#8C5622', glow: 'rgba(205,127,50,0.4)', text: '3rd' }
  };
  const c = colors[place];

  return (
    <motion.div
      className="relative flex flex-col items-center w-12 h-14"
      style={{ filter: `drop-shadow(0 0 10px ${c.glow})` }}
      animate={{ y: [0, -3, 0] }}
      transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: place * 0.15 }}
    >
      <div className="absolute top-0 w-8 h-8 rounded-full border-[3px] border-[#120F1A] z-10 flex items-center justify-center shadow-inner" style={{ backgroundColor: c.main }}>
        <span className="text-[10px] font-black text-[#120F1A]">{c.text}</span>
      </div>
      <div className="absolute top-6 flex gap-1 z-0">
        <div className="w-2.5 h-6 bg-[#FF5D73] skew-y-12 rounded-b-sm border-r border-black/20" />
        <div className="w-2.5 h-6 bg-[#FF5D73] -skew-y-12 rounded-b-sm border-l border-black/20" />
      </div>
    </motion.div>
  );
};

export default function LeaderboardPage() {
  const currency = useCurrency();
  const isCoin = currency === 'Coin' || currency === 'COIN';
  const multiplier = isCoin ? 1000 : 1;
  const prefix = isCoin ? '' : '$';
  const suffix = isCoin ? ' COINS' : '';
  const decimals = isCoin ? 0 : 2;

  const [contestType, setContestType] = useState<'DAILY' | 'MONTHLY'>('DAILY');
  const [contestData, setContestData] = useState<any>(null);
  const [myProfilePic, setMyProfilePic] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMyProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const res = await fetch('https://apitest.binnycash.com/api/user/viewData', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const json = await res.json();
        if (json.code === 200) {
          setMyProfilePic(json.data?.user?.image || json.data?.user?.profilePic);
        }
      } catch (e) {}
    };
    fetchMyProfile();
  }, []);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setIsLoading(true);
      const token = localStorage.getItem('token') || '';
      const userId = getUserId();

      try {
        const url = `https://apitest.binnycash.com/api/user/userViewContest?contestType=${contestType}&page=1&limit=50${userId ? `&userId=${userId}` : ''}`;
        const res = await fetch(url, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const json = await res.json();

        if (json.code === 200 && json.data) {
          setContestData(json.data);
        } else {
          setContestData(null);
        }
      } catch (error) {
        console.error("Failed to fetch leaderboard:", error);
        setContestData(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboard();
  }, [contestType]);

  const usersList = contestData?.winners || contestData?.topUsers || [];
  const currentUser = contestData?.currentUserRank;

  const top1 = usersList.find((u: any) => u.rank === 1);
  const top2 = usersList.find((u: any) => u.rank === 2);
  const top3 = usersList.find((u: any) => u.rank === 3);

  const remainingUsers = usersList.filter((u: any) => u.rank > 3);

  const userEarnings = contestData?.userEligibility?.contestEarnings || currentUser?.totalReward || 0;
  const userRank = currentUser?.rank;
  const isEnded = contestData?.contest?.status === 'ENDED';

  const getUserImage = (u: any) => {
    if (!u) return null;
    const currentId = getUserId();
    if (String(u.userId) === String(currentId) || String(u.userId) === String(currentUser?.userId)) {
      return resolveImage(myProfilePic || currentUser?.image || u.image);
    }
    return resolveImage(u.image);
  };

  const getPrizeForRank = (rank: number) => {
    if (!contestData?.contest?.prizes) return 0;
    const prizeObj = contestData.contest.prizes.find((p: any) => rank >= p.startRank && rank <= p.endRank);
    return prizeObj ? prizeObj.Cash : 0;
  };

  const scrollToLeaderboard = () => {
    const listElement = document.getElementById('leaderboard-list');
    if (listElement) {
      const yOffset = -80; 
      const y = listElement.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#08070D] text-[#F5F3FF] relative overflow-x-hidden pb-16 font-sans">
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(166,108,255,0.35); border-radius: 10px; }
        .f-display { font-family: 'Space Grotesk', ui-sans-serif, sans-serif; }
        @keyframes glowPulse {
          0%, 100% { box-shadow: 0 0 20px rgba(255,201,74,0.25), 0 0 0 0 rgba(255,201,74,0.4); }
          50% { box-shadow: 0 0 40px rgba(255,201,74,0.55), 0 0 0 6px rgba(255,201,74,0.08); }
        }
        .glow-pulse-gold { animation: glowPulse 2.2s ease-in-out infinite; }
        @keyframes glowPulseViolet {
          0%, 100% { box-shadow: 0 0 15px rgba(166,108,255,0.25); }
          50% { box-shadow: 0 0 30px rgba(166,108,255,0.5); }
        }
        .glow-pulse-violet { animation: glowPulseViolet 2.4s ease-in-out infinite; }
      `}</style>

      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <motion.div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[#A66CFF]/5 blur-[120px] rounded-full"
          animate={{ opacity: [0.6, 1, 0.6], scale: [1, 1.08, 1] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        />
        <Particles />
      </div>

      <main className="max-w-[1000px] mx-auto px-4 sm:px-6 py-8 relative z-10">

        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-center mb-6">
          <div className="relative bg-[#120F1A] border border-white/10 p-1 rounded-full grid grid-cols-2 w-[220px]">
            <motion.div
              className="absolute inset-y-1 left-1 rounded-full bg-[#A66CFF] shadow-[0_0_15px_rgba(166,108,255,0.4)]"
              style={{ width: 'calc(50% - 4px)' }}
              animate={{ x: contestType === 'DAILY' ? 0 : '100%' }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            />
            {(['DAILY', 'MONTHLY'] as const).map((type) => (
              <motion.button
                key={type}
                onClick={() => setContestType(type)}
                whileTap={{ scale: 0.94 }}
                className={`relative z-10 px-8 py-2.5 rounded-full text-sm font-bold transition-colors cursor-pointer ${contestType === type ? 'text-white' : 'text-[#8D89A8] hover:text-white'}`}
              >
                {type.charAt(0) + type.slice(1).toLowerCase()}
              </motion.button>
            ))}
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="text-center f-display text-3xl font-black text-white mb-10"
        >
          Leaderboard
        </motion.h1>

        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center py-32">
              <Loader2 className="w-10 h-10 text-[#A66CFF] animate-spin mb-4" />
              <motion.p
                className="text-[#8D89A8] font-medium"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.4, repeat: Infinity }}
              >
                Loading Leaderboard...
              </motion.p>
            </motion.div>
          ) : (
            <motion.div key="content" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>

              {contestData?.contest && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                  className="max-w-2xl mx-auto bg-gradient-to-b from-[#2A2015] to-[#120F1A] border border-[#FFC94A]/20 rounded-[28px] p-8 text-center shadow-[0_20px_40px_rgba(0,0,0,0.4)] mb-20 relative overflow-hidden"
                >
                  <motion.div
                    className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#FFC94A] to-transparent opacity-50"
                    animate={{ opacity: [0.3, 0.8, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  />

                  <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.15, type: 'spring', stiffness: 300 }}
                    className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#FFC94A] text-[#120F1A] text-xs font-black uppercase tracking-wider mb-4 shadow-[0_0_15px_rgba(255,201,74,0.3)]"
                  >
                    <Trophy className="w-3.5 h-3.5" />
                    {isEnded ? 'Contest Ended' : 'Contest Active'}
                  </motion.div>

                  <h2 className="text-3xl font-black text-white mb-2 tracking-tight">
                    {contestData.contest.contestName} {isEnded && '🏆'}
                  </h2>
                  <p className="text-[#8D89A8] text-sm mb-6">
                    {isEnded ? 'This contest has ended. Here are the final results!' : contestData.contest.description}
                  </p>

                  <motion.button
                    onClick={scrollToLeaderboard}
                    whileHover={{ scale: 1.05, backgroundColor: 'rgba(255,255,255,0.1)' }}
                    whileTap={{ scale: 0.95 }}
                    className="px-6 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-sm font-bold transition-colors flex items-center gap-2 mx-auto cursor-pointer"
                  >
                    <Trophy className="w-4 h-4 text-[#FFC94A]" /> Final Leaderboard
                  </motion.button>
                </motion.div>
              )}

              <div className="flex justify-center items-end gap-2 sm:gap-6 mb-12 px-2">

                {/* 2ND PLACE */}
                <div className="flex flex-col items-center w-[30%] max-w-[180px]">
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="flex flex-col items-center">
                    <div className="relative mb-2">
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 z-20">
                        <Medal place={2} />
                      </div>
                      <motion.div
                        whileHover={{ scale: 1.06 }}
                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-[3px] border-[#E2E8F0] p-1 shadow-[0_0_20px_rgba(226,232,240,0.3)] bg-[#120F1A] glow-pulse-violet"
                      >
                        {getUserImage(top2) ? (
                          <img src={getUserImage(top2)!} alt="2nd" className="w-full h-full rounded-full object-cover" />
                        ) : top2 ? (
                          <div className="w-full h-full rounded-full bg-white/10 flex items-center justify-center text-[#E2E8F0] font-black text-xl">{(top2.userName || 'U')[0].toUpperCase()}</div>
                        ) : (
                          <div className="w-full h-full rounded-full bg-white/5 flex items-center justify-center text-white/20 font-black text-xl">?</div>
                        )}
                      </motion.div>
                    </div>
                    <span className="text-white font-bold text-xs sm:text-sm truncate w-full text-center mb-3 px-1">
                      {top2 ? (top2.userName || 'Anonymous') : 'Waiting...'}
                    </span>
                  </motion.div>
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 120, opacity: 1 }}
                    transition={{ delay: 0.3, duration: 0.5, ease: 'easeOut' }}
                    className="w-full bg-[#161421] border border-white/5 rounded-t-2xl rounded-b-xl flex flex-col items-center justify-end p-4 shadow-lg overflow-hidden"
                  >
                    <div className="w-6 h-6 rounded-md bg-white/5 flex items-center justify-center mb-2">
                      <Trophy className="w-3 h-3 text-[#E2E8F0]" />
                    </div>
                    <span className="text-[9px] font-bold text-[#8D89A8] uppercase tracking-wider mb-0.5 whitespace-nowrap">
                      Earn <AnimatedNumber value={parseFloat(top2?.totalReward || top2?.earnings || 0) * multiplier} decimals={decimals} prefix={prefix} suffix={suffix} />
                    </span>
                    <span className="text-xl font-black text-white whitespace-nowrap">
                      <AnimatedNumber value={Number(top2?.prize || getPrizeForRank(2)) * multiplier} prefix={prefix} decimals={decimals} suffix={suffix}/>
                    </span>
                    <span className="text-[10px] text-[#8D89A8]">Prize</span>
                  </motion.div>
                </div>

                {/* 1ST PLACE */}
                <div className="flex flex-col items-center w-[35%] max-w-[220px] relative z-10 -mx-2">
                  <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="flex flex-col items-center w-full">
                    <div className="relative mb-2">
                      <motion.div
                        className="absolute -top-12 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center"
                        animate={{ rotate: [-4, 4, -4] }}
                        transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
                      >
                        <Crown className="w-5 h-5 text-[#FFC94A] mb-1 drop-shadow-[0_0_8px_rgba(255,201,74,0.8)]" fill="#FFC94A" />
                        <Medal place={1} />
                      </motion.div>
                      <motion.div
                        whileHover={{ scale: 1.06 }}
                        className="w-20 h-20 sm:w-28 sm:h-28 rounded-full border-[4px] border-[#FFC94A] p-1 bg-[#120F1A] glow-pulse-gold"
                      >
                        {getUserImage(top1) ? (
                          <img src={getUserImage(top1)!} alt="1st" className="w-full h-full rounded-full object-cover" />
                        ) : top1 ? (
                          <div className="w-full h-full rounded-full bg-white/10 flex items-center justify-center text-[#FFC94A] font-black text-3xl">{(top1.userName || 'U')[0].toUpperCase()}</div>
                        ) : (
                          <div className="w-full h-full rounded-full bg-white/5 flex items-center justify-center text-white/20 font-black text-3xl">?</div>
                        )}
                      </motion.div>
                    </div>
                    <span className="text-white font-black text-sm sm:text-base truncate w-full text-center mb-4 px-1">
                      {top1 ? (top1.userName || 'Anonymous') : 'Waiting...'}
                    </span>
                  </motion.div>
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 150, opacity: 1 }}
                    transition={{ delay: 0.35, duration: 0.5, ease: 'easeOut' }}
                    className="w-full bg-gradient-to-b from-[#1C182A] to-[#120F1A] border border-[#FFC94A]/20 rounded-t-2xl rounded-b-xl flex flex-col items-center justify-end p-5 shadow-[0_0_30px_rgba(255,201,74,0.1)] overflow-hidden"
                  >
                    <div className="w-8 h-8 rounded-md bg-[#FFC94A]/10 flex items-center justify-center mb-2 border border-[#FFC94A]/20">
                      <Trophy className="w-4 h-4 text-[#FFC94A]" />
                    </div>
                    <span className="text-[10px] font-bold text-[#8D89A8] uppercase tracking-wider mb-0.5 whitespace-nowrap">
                      Earn <AnimatedNumber value={parseFloat(top1?.totalReward || top1?.earnings || 0) * multiplier} decimals={decimals} prefix={prefix} suffix={suffix} />
                    </span>
                    <span className="text-3xl font-black text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.3)] whitespace-nowrap">
                      <AnimatedNumber value={Number(top1?.prize || getPrizeForRank(1)) * multiplier} prefix={prefix} decimals={decimals} suffix={suffix} />
                    </span>
                    <span className="text-xs text-[#8D89A8] mt-1">Prize</span>
                  </motion.div>
                </div>

                {/* 3RD PLACE */}
                <div className="flex flex-col items-center w-[30%] max-w-[180px]">
                  <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="flex flex-col items-center">
                    <div className="relative mb-2">
                      <div className="absolute -top-10 left-1/2 -translate-x-1/2 z-20">
                        <Medal place={3} />
                      </div>
                      <motion.div
                        whileHover={{ scale: 1.06 }}
                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-[3px] border-[#CD7F32] p-1 shadow-[0_0_20px_rgba(205,127,50,0.3)] bg-[#120F1A]"
                      >
                        {getUserImage(top3) ? (
                          <img src={getUserImage(top3)!} alt="3rd" className="w-full h-full rounded-full object-cover" />
                        ) : top3 ? (
                          <div className="w-full h-full rounded-full bg-white/10 flex items-center justify-center text-[#CD7F32] font-black text-xl">{(top3.userName || 'U')[0].toUpperCase()}</div>
                        ) : (
                          <div className="w-full h-full rounded-full bg-white/5 flex items-center justify-center text-white/20 font-black text-xl">?</div>
                        )}
                      </motion.div>
                    </div>
                    <span className="text-white font-bold text-xs sm:text-sm truncate w-full text-center mb-3 px-1">
                      {top3 ? (top3.userName || 'Anonymous') : 'Waiting...'}
                    </span>
                  </motion.div>
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 110, opacity: 1 }}
                    transition={{ delay: 0.25, duration: 0.5, ease: 'easeOut' }}
                    className="w-full bg-[#161421] border border-white/5 rounded-t-2xl rounded-b-xl flex flex-col items-center justify-end p-4 shadow-lg overflow-hidden"
                  >
                    <div className="w-6 h-6 rounded-md bg-white/5 flex items-center justify-center mb-2">
                      <Trophy className="w-3 h-3 text-[#CD7F32]" />
                    </div>
                    <span className="text-[9px] font-bold text-[#8D89A8] uppercase tracking-wider mb-0.5 whitespace-nowrap">
                      Earn <AnimatedNumber value={parseFloat(top3?.totalReward || top3?.earnings || 0) * multiplier} decimals={decimals} prefix={prefix} suffix={suffix} />
                    </span>
                    <span className="text-xl font-black text-white whitespace-nowrap">
                      <AnimatedNumber value={Number(top3?.prize || getPrizeForRank(3)) * multiplier} prefix={prefix} decimals={decimals} suffix={suffix} />
                    </span>
                    <span className="text-[10px] text-[#8D89A8]">Prize</span>
                  </motion.div>
                </div>

              </div>

              <div id="leaderboard-list">
                <motion.div
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.1 }}
                  className="w-full bg-[#1A1325] border border-[#A66CFF]/30 rounded-xl py-3.5 px-4 text-center mb-8 shadow-[0_0_20px_rgba(166,108,255,0.1)] flex justify-center items-center gap-2 glow-pulse-violet"
                >
                  <motion.div animate={{ rotate: [0, -15, 15, -15, 0] }} transition={{ duration: 1.2, repeat: Infinity, repeatDelay: 2 }}>
                    <Bell className="w-4 h-4 text-[#A66CFF] shrink-0" />
                  </motion.div>
                  <span className="text-sm font-bold text-white/90">
                    You earned today <AnimatedNumber value={parseFloat(userEarnings) * multiplier} prefix={prefix} suffix={suffix} decimals={decimals} className="inline" />, {userRank ? `your rank is #${userRank} 🚀` : "you are not ranked yet 🚀"}
                  </span>
                </motion.div>

                <div className="flex items-center justify-between px-6 py-3 text-[11px] font-bold text-[#8D89A8] uppercase tracking-wider border-b border-white/[0.06] mb-2">
                  <div className="flex items-center gap-6 w-1/2">
                    <span className="w-8 text-center">Rank</span>
                    <span>User</span>
                  </div>
                  <div className="flex items-center justify-end gap-8 w-1/2">
                    <span className="w-20 text-right">Earnings</span>
                    <span className="w-16 text-right">Prize</span>
                  </div>
                </div>

                <div className="flex flex-col gap-2">
                  {remainingUsers.length === 0 ? (
                    <div className="text-center py-10 text-[#8D89A8] bg-[#120F1A] rounded-2xl border border-white/5">
                      No more users to show.
                    </div>
                  ) : (
                    remainingUsers.map((u: any, idx: number) => {
                      const avatar = getUserImage(u);
                      return (
                        <motion.div
                          key={u._id || idx}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.04, type: 'spring', stiffness: 260, damping: 22 }}
                          whileHover={{ scale: 1.015, x: 4, backgroundColor: 'rgba(255,255,255,0.03)' }}
                          className="flex items-center justify-between px-6 py-4 bg-[#120F1A] border border-white/[0.04] rounded-2xl transition-colors"
                        >
                          <div className="flex items-center gap-6 w-1/2">
                            <span className="w-8 text-center font-black text-[#8D89A8] text-sm">{u.rank}</span>
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center shrink-0 overflow-hidden">
                                {avatar ? (
                                  <img src={avatar} alt="user" className="w-full h-full object-cover" />
                                ) : (
                                  <span className="text-xs font-bold text-[#A66CFF]">{(u.userName || 'U')[0].toUpperCase()}</span>
                                )}
                              </div>
                              <span className="text-sm font-bold text-white truncate">{u.userName || 'Anonymous'}</span>
                            </div>
                          </div>

                          <div className="flex items-center justify-end gap-8 w-1/2">
                            <span className="w-20 text-right text-sm font-bold text-[#E879F9]">
                              {formatPrice(parseFloat(u.totalReward || u.earnings || 0), currency)}
                            </span>
                            <span className="w-16 text-right text-sm font-black text-white">
                              {formatPrice(parseFloat(u.prize || 0), currency)}
                            </span>
                          </div>
                        </motion.div>
                      );
                    })
                  )}
                </div>
              </div>

            </motion.div>
          )}
        </AnimatePresence>

      </main>
    </div>
  );
}