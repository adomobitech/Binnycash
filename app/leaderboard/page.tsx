'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Bell, Loader2, Crown, ChevronRight, ChevronDown, ShieldCheck, User } from 'lucide-react';
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

  // Data mapping from Backend
  const usersList = contestData?.winners || contestData?.topUsers || [];
  const currentUser = contestData?.currentUserRank;

  const top1 = usersList.find((u: any) => u.rank === 1);
  const top2 = usersList.find((u: any) => u.rank === 2);
  const top3 = usersList.find((u: any) => u.rank === 3);

  // 🔥 Yahan Ranks 1,2,3 filter kar diye hain taaki sirf Rank 4 se dikhe 🔥
  const tableUsers = usersList.filter((u: any) => u.rank > 3);

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

  return (
    <div className="min-h-screen bg-[#08070D] text-[#F5F3FF] relative overflow-x-hidden pb-16 font-sans">
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(166,108,255,0.35); border-radius: 10px; }
      `}</style>

      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <motion.div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-[#A66CFF]/5 blur-[120px] rounded-full"
          animate={{ opacity: [0.6, 1, 0.6], scale: [1, 1.08, 1] }}
          transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut' }}
        />
        <Particles />
      </div>

      <main className="max-w-[1200px] mx-auto px-4 sm:px-6 py-8 relative z-10">

        {/* --- HEADER --- */}
        <div className="flex flex-col items-center justify-center text-center mb-10">
          <motion.h1
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl sm:text-4xl font-black text-white mb-2"
          >
            Leaderboard
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-[#8D89A8] text-sm mb-6"
          >
            Compete. Earn More. Win Big.
          </motion.p>
          
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.15 }} className="bg-[#120F1A] border border-white/10 p-1 rounded-full flex items-center w-fit mx-auto shadow-lg">
            {(['DAILY', 'MONTHLY'] as const).map((type) => (
              <button
                key={type}
                onClick={() => setContestType(type)}
                className={`relative px-8 py-2.5 rounded-full text-sm font-bold transition-all cursor-pointer ${contestType === type ? 'text-white bg-[#A66CFF] shadow-[0_0_15px_rgba(166,108,255,0.4)]' : 'text-[#8D89A8] hover:text-white'}`}
              >
                {type.charAt(0) + type.slice(1).toLowerCase()}
              </button>
            ))}
          </motion.div>
        </div>

        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center py-32">
              <Loader2 className="w-10 h-10 text-[#A66CFF] animate-spin mb-4" />
              <p className="text-[#8D89A8] font-medium animate-pulse">Loading Leaderboard...</p>
            </motion.div>
          ) : (
            <motion.div key="content" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>

              {/* --- BIG HERO BANNER --- */}
              <div className="w-full bg-[#1A1235] border border-white/5 rounded-[32px] p-6 sm:p-8 mb-16 flex flex-col sm:flex-row items-center gap-6 shadow-2xl relative overflow-hidden">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-[24px] bg-gradient-to-br from-[#A66CFF] to-[#8B5CF6] flex items-center justify-center shrink-0 shadow-[0_0_40px_rgba(166,108,255,0.4)] z-10">
                  <Trophy className="w-12 h-12 sm:w-14 sm:h-14 text-[#FFD700]" fill="#FFD700" />
                </div>
                <div className="flex flex-col text-center sm:text-left z-10">
                  <div className="flex items-center justify-center sm:justify-start gap-2 mb-3">
                    <span className="text-[10px] font-black text-[#FFC94A] bg-[#120F1A]/50 px-2.5 py-1 rounded border border-[#FFC94A]/20 tracking-wider">
                      {isEnded ? 'CONTEST ENDED' : 'CONTEST ACTIVE'}
                    </span>
                  </div>
                  <h2 className="text-2xl sm:text-4xl font-black text-white mb-2 tracking-tight">
                    {contestData?.contest?.contestName || `${contestType.charAt(0) + contestType.slice(1).toLowerCase()} Earnings Race`}
                  </h2>
                  <p className="text-[#A39EBD] text-sm font-medium">
                    {isEnded ? 'This contest has ended. Here are the final results!' : (contestData?.contest?.description || 'Earn the most to win big prizes!')}
                  </p>
                </div>
                
                {/* Background decorative elements */}
                <div className="absolute top-0 right-0 w-[40%] h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] pointer-events-none" />
                <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-[#120B29]/80 to-transparent pointer-events-none" />
              </div>

              {/* --- PODIUM (TOP 3) --- */}
              <div className="flex items-end justify-center gap-3 sm:gap-6 px-2 mt-20 relative z-20">
                
                {/* 2nd Place */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="w-[30%] max-w-[200px] bg-[#161821] border border-white/5 rounded-[24px] p-4 flex flex-col items-center relative pt-12 shadow-xl h-[200px] justify-between">
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex flex-col items-center">
                    <div className="w-6 h-6 rounded-full bg-[#E2E8F0] text-[#120F1A] font-black text-[11px] flex items-center justify-center absolute -top-2 z-20 shadow-md">2</div>
                    <div className="w-16 h-16 rounded-full border-[3px] border-[#E2E8F0] p-1 bg-[#120F1A] z-10 shadow-[0_0_15px_rgba(226,232,240,0.3)] overflow-hidden">
                      {getUserImage(top2) ? (
                        <img src={getUserImage(top2)!} alt="2nd" className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <div className="w-full h-full rounded-full bg-white/10 flex items-center justify-center text-[#E2E8F0] font-black text-xl">{top2?.userName ? top2.userName.charAt(0).toUpperCase() : '?'}</div>
                      )}
                    </div>
                  </div>
                  <span className="text-white font-bold text-sm truncate w-full text-center mt-2">{top2 ? (top2.userName || 'Anonymous') : 'Waiting...'}</span>
                  <span className="text-[#8D89A8] text-[10px] font-bold">2nd Place</span>
                  <span className="text-xl font-black text-[#E2E8F0] mt-1">
                    <AnimatedNumber value={Number(top2?.prize || getPrizeForRank(2)) * multiplier} prefix={prefix} decimals={decimals} suffix={suffix}/>
                  </span>
                </motion.div>

                {/* 1st Place */}
                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="w-[35%] max-w-[240px] bg-gradient-to-b from-[#1C182A] to-[#120F1A] border border-[#FFC94A]/40 rounded-[28px] p-5 flex flex-col items-center relative pt-14 shadow-[0_0_30px_rgba(255,201,74,0.15)] h-[240px] justify-between z-30">
                  <div className="absolute -top-14 left-1/2 -translate-x-1/2 flex flex-col items-center">
                    <Crown className="w-6 h-6 text-[#FFC94A] mb-[-6px] z-30 drop-shadow-lg" fill="#FFC94A" />
                    <div className="w-7 h-7 rounded-full bg-[#FFC94A] text-[#120F1A] font-black text-xs flex items-center justify-center absolute top-2 z-20 shadow-md">1</div>
                    <div className="w-20 h-20 rounded-full border-[4px] border-[#FFC94A] p-1 bg-[#120F1A] z-10 shadow-[0_0_20px_rgba(255,201,74,0.4)] overflow-hidden">
                      {getUserImage(top1) ? (
                        <img src={getUserImage(top1)!} alt="1st" className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <div className="w-full h-full rounded-full bg-white/10 flex items-center justify-center text-[#FFC94A] font-black text-2xl">{top1?.userName ? top1.userName.charAt(0).toUpperCase() : '?'}</div>
                      )}
                    </div>
                  </div>
                  <span className="text-white font-black text-base truncate w-full text-center mt-2">{top1 ? (top1.userName || 'Anonymous') : 'Waiting...'}</span>
                  <span className="text-[#FFC94A] text-xs font-bold">1st Place</span>
                  <span className="text-3xl font-black text-[#FFC94A] mt-1 drop-shadow-[0_0_10px_rgba(255,201,74,0.5)]">
                    <AnimatedNumber value={Number(top1?.prize || getPrizeForRank(1)) * multiplier} prefix={prefix} decimals={decimals} suffix={suffix}/>
                  </span>
                </motion.div>

                {/* 3rd Place */}
                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="w-[30%] max-w-[200px] bg-[#161821] border border-[#CD7F32]/30 rounded-[24px] p-4 flex flex-col items-center relative pt-12 shadow-xl h-[180px] justify-between">
                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex flex-col items-center">
                    <div className="w-6 h-6 rounded-full bg-[#CD7F32] text-[#120F1A] font-black text-[11px] flex items-center justify-center absolute -top-2 z-20 shadow-md">3</div>
                    <div className="w-16 h-16 rounded-full border-[3px] border-[#CD7F32] p-1 bg-[#120F1A] z-10 shadow-[0_0_15px_rgba(205,127,50,0.3)] overflow-hidden">
                      {getUserImage(top3) ? (
                        <img src={getUserImage(top3)!} alt="3rd" className="w-full h-full rounded-full object-cover" />
                      ) : (
                        <div className="w-full h-full rounded-full bg-white/10 flex items-center justify-center text-[#CD7F32] font-black text-xl">{top3?.userName ? top3.userName.charAt(0).toUpperCase() : '?'}</div>
                      )}
                    </div>
                  </div>
                  <span className="text-white font-bold text-sm truncate w-full text-center mt-2">{top3 ? (top3.userName || 'Anonymous') : 'Waiting...'}</span>
                  <span className="text-[#CD7F32] text-[10px] font-bold">3rd Place</span>
                  <span className="text-xl font-black text-[#CD7F32] mt-1">
                    <AnimatedNumber value={Number(top3?.prize || getPrizeForRank(3)) * multiplier} prefix={prefix} decimals={decimals} suffix={suffix}/>
                  </span>
                </motion.div>

              </div>

              {/* 🔥 YOUR EARNINGS NOTIFICATION BAR (WITH POSITIVE TOP MARGIN TO AVOID OVERLAP) 🔥 */}
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="w-full max-w-3xl mx-auto bg-[#1C103F]/90 border border-[#A66CFF]/30 rounded-[20px] py-4 px-6 text-center mb-12 mt-6 shadow-[0_0_25px_rgba(166,108,255,0.2)] flex justify-center items-center gap-3 backdrop-blur-md relative z-10"
              >
                <motion.div animate={{ rotate: [0, -15, 15, -15, 0] }} transition={{ duration: 1.2, repeat: Infinity, repeatDelay: 2 }}>
                  <Trophy className="w-5 h-5 text-[#FFC94A] shrink-0" />
                </motion.div>
                <span className="text-sm font-bold text-white tracking-wide">
                  You earned today <AnimatedNumber value={parseFloat(userEarnings) * multiplier} prefix={prefix} suffix={suffix} decimals={decimals} className="inline text-[#00E57A]" />, {userRank ? `your rank is #${userRank} 🚀` : "you are not ranked yet 🚀"}
                </span>
              </motion.div>

              {/* --- BOTTOM SECTION (LIST + YOUR RANK) --- */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
                
                {/* Left Col: Leaderboard List */}
                <div className="lg:col-span-2 bg-[#120F1A] border border-white/5 rounded-[24px] p-5 shadow-2xl flex flex-col h-fit">
                  
                  {/* 🔥 TODAY BUTTON REMOVED HERE 🔥 */}
                  <div className="flex items-center mb-4 px-2">
                    <h3 className="text-lg font-black text-white">Top Leaderboard</h3>
                  </div>

                  {/* Table Header */}
                  <div className="grid grid-cols-[3.5rem_1fr_100px_80px] gap-2 px-4 py-3 text-[11px] font-bold text-[#8F95A3] uppercase tracking-wider border-b border-white/[0.05] mb-2">
                    <div className="text-center">Rank</div>
                    <div>Player</div>
                    <div className="text-right">Earnings</div>
                    <div className="text-right">Prize</div>
                  </div>

                  {/* Table Rows (NOW STARTS FROM RANK 4) */}
                  <div className="flex flex-col gap-1 overflow-hidden pb-2">
                    {tableUsers.length === 0 ? (
                      <div className="text-center py-10 text-[#8F95A3] text-sm font-medium">
                        {usersList.length === 0 ? 'Waiting for leaderboard data...' : 'No other players ranked yet.'}
                      </div>
                    ) : (
                      tableUsers.map((u: any, idx: number) => {
                        const avatar = getUserImage(u);

                        return (
                          <div key={u._id || idx} className="grid grid-cols-[3.5rem_1fr_100px_80px] gap-2 px-4 py-3 items-center hover:bg-white/[0.03] rounded-xl transition-colors border-b border-white/[0.02] last:border-0 group">
                            
                            {/* Simple Sleek Badge for Rank 4+ */}
                            <div className="flex justify-center">
                              <div className="w-8 h-8 rounded-[10px] flex items-center justify-center border shadow-inner transition-transform group-hover:scale-105 bg-[#212431] border-white/10 text-[#8F95A3]">
                                <span className="text-xs font-black">{u.rank}</span>
                              </div>
                            </div>

                            {/* Player Column */}
                            <div className="flex items-center gap-3 min-w-0 ml-2">
                              <div className="w-9 h-9 rounded-full bg-[#1A1C23] border border-white/10 shrink-0 overflow-hidden flex items-center justify-center shadow-sm">
                                {avatar ? <img src={avatar} className="w-full h-full object-cover" alt="" /> : <User className="w-4 h-4 text-[#8F95A3]" />}
                              </div>
                              <span className="text-sm font-bold text-white/90 truncate">{u.userName || 'Anonymous'}</span>
                            </div>

                            {/* Earnings Column */}
                            <div className="text-right text-[13px] font-bold text-[#00E57A]">
                              {formatPrice(parseFloat(u.totalReward || u.earnings || 0), currency)}
                            </div>

                            {/* Prize Column */}
                            <div className="text-right text-[13px] font-black text-[#FFC94A]">
                              {formatPrice(parseFloat(u.prize || getPrizeForRank(u.rank)), currency)}
                            </div>

                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* Right Col: Your Rank Card */}
                <div className="lg:col-span-1 bg-[#1A1325] border border-[#A66CFF]/20 rounded-[24px] p-6 shadow-xl flex flex-col h-fit">
                  <h3 className="text-sm font-bold text-white mb-6">Your Rank</h3>
                  
                  <div className="mb-8">
                    <span className="text-5xl font-black text-[#A66CFF] drop-shadow-[0_0_15px_rgba(166,108,255,0.4)]">
                      #{userRank || '--'}
                    </span>
                    <p className="text-xs text-[#8F95A3] mt-2 mb-3 font-medium">Keep going! You're in the top {userRank ? Math.max(1, Math.min(100, Math.ceil((userRank/100)*100))) : '--'}%</p>
                    <div className="w-full h-1.5 bg-[#120F1A] rounded-full overflow-hidden border border-white/5">
                      <div className="h-full bg-gradient-to-r from-[#A66CFF] to-[#7C3AED] rounded-full shadow-[0_0_10px_#A66CFF]" style={{ width: userRank ? `${Math.max(10, 100 - (userRank * 2))}%` : '0%' }} />
                    </div>
                  </div>

                  <div className="flex flex-col gap-5">
                    <div className="bg-[#120F1A] border border-white/5 p-4 rounded-[16px]">
                      <span className="text-[11px] font-bold text-[#8F95A3] uppercase tracking-wider block mb-1">Today's Earnings</span>
                      <span className="text-xl font-black text-[#00E57A]">{formatPrice(parseFloat(userEarnings), currency)}</span>
                    </div>
                    <div className="bg-[#120F1A] border border-white/5 p-4 rounded-[16px]">
                      <span className="text-[11px] font-bold text-[#8F95A3] uppercase tracking-wider block mb-1">Your Best</span>
                      <span className="text-xl font-black text-white">{formatPrice(parseFloat(userEarnings), currency)}</span> 
                    </div>
                  </div>
                </div>

              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </main>
    </div>
  );
}