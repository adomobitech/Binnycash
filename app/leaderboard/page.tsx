'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, Bell, Loader2, Crown, Calendar, Clock, Gift, Users, 
  DollarSign, CheckCircle2, AlertOctagon, Ban, User, Info, X, Zap, Target
} from 'lucide-react';
import { useCurrency, formatPrice } from '@/hooks/useCurrency';

// --- UTILITY: Get User ID ---
function getUserId(): string {
  if (typeof window === 'undefined') return '';
  const isNumeric = (v: any) => v !== null && v !== undefined && /^\d+$/.test(String(v));
  try {
    const keys = ['loginResponse', 'authResponse', 'loginData', 'userDetails', 'user', 'userData', 'profile', 'authUser', 'userId', 'user_id', 'uid', 'sid'];
    for (const key of keys) {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      if (isNumeric(raw)) return String(raw);
      try {
        const parsed = JSON.parse(raw);
        const candidates = [parsed?.id, parsed?.userDetails?.id, parsed?._id, parsed?.userId, parsed?.user_id, parsed?.data?.userDetails?.id];
        const numericMatch = candidates.find(isNumeric);
        if (numericMatch !== undefined) return String(numericMatch);
      } catch {}
    }
  } catch (err) {}
  return '';
}

const resolveImage = (imgSrc: string | null | undefined) => {
  if (!imgSrc || imgSrc.trim() === '') return null;
  if (imgSrc.startsWith('http')) return imgSrc;
  return imgSrc.startsWith('/') ? `https://api.binnycash.com${imgSrc}` : `https://api.binnycash.com/${imgSrc}`;
};

const getInitial = (name?: string) => (name ? name.charAt(0).toUpperCase() : 'U');

// --- CUSTOM COUNTDOWN HOOK ---
function useCountdown(targetDateStr: string | null | undefined) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, mins: 0, secs: 0 });

  useEffect(() => {
    if (!targetDateStr) return;
    const target = new Date(targetDateStr).getTime();

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const difference = target - now;

      if (difference <= 0) {
        clearInterval(interval);
        setTimeLeft({ days: 0, hours: 0, mins: 0, secs: 0 });
      } else {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          mins: Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60)),
          secs: Math.floor((difference % (1000 * 60)) / 1000)
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [targetDateStr]);

  return timeLeft;
}

// ==========================================
// REUSABLE TIMELINE COMPONENT (UPGRADED UI)
// ==========================================
function TimelineInfo({ start, end }: { start: string, end: string }) {
  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'TBD';
    return new Date(dateStr).toLocaleString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: 'numeric', minute: '2-digit', hour12: true
    });
  };

  return (
    <div className="flex justify-between items-center text-sm border border-white/5 py-4 mb-8 px-6 bg-white/[0.02] rounded-2xl shadow-inner relative overflow-hidden">
      <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500/50" />
      <div className="absolute top-0 right-0 w-1 h-full bg-rose-500/50" />
      
      <div className="flex flex-col flex-1">
        <span className="text-[10px] text-[#8F95A3] font-black uppercase tracking-widest mb-1 flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5" /> Starts On
        </span>
        <span className="text-emerald-400 font-black text-xs sm:text-sm tracking-wide">{formatDate(start)}</span>
      </div>
      <div className="w-px h-10 bg-white/10 mx-4" />
      <div className="flex flex-col flex-1 items-end text-right">
        <span className="text-[10px] text-[#8F95A3] font-black uppercase tracking-widest mb-1 flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" /> Ends On
        </span>
        <span className="text-rose-400 font-black text-xs sm:text-sm tracking-wide">{formatDate(end)}</span>
      </div>
    </div>
  );
}

// ==========================================
// REUSABLE YOUR STATS GRID COMPONENT (UPGRADED UI)
// ==========================================
function UserStatsGrid({ data }: { data: any }) {
  const { currency, totalUsers, currentUserRank, userEarnings, myPrize } = data;
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
      <div className="bg-[#161821]/80 backdrop-blur-md border border-white/5 p-5 rounded-2xl shadow-lg flex flex-col items-center justify-center relative overflow-hidden group hover:border-white/10 transition-all">
        <Users className="absolute -right-2 -bottom-2 w-12 h-12 text-white/[0.03] group-hover:scale-110 transition-transform" />
        <span className="text-[10px] text-[#8F95A3] font-black uppercase tracking-widest mb-1.5">Participants</span>
        <span className="text-xl sm:text-2xl font-black text-white">{totalUsers || 0}</span>
      </div>
      <div className="bg-[#161821]/80 backdrop-blur-md border border-white/5 p-5 rounded-2xl shadow-lg flex flex-col items-center justify-center relative overflow-hidden group hover:border-[#00E57A]/30 transition-all">
        <Target className="absolute -right-2 -bottom-2 w-12 h-12 text-[#00E57A]/5 group-hover:scale-110 transition-transform" />
        <span className="text-[10px] text-[#8F95A3] font-black uppercase tracking-widest mb-1.5">Your Rank</span>
        <span className="text-xl sm:text-2xl font-black text-[#00E57A] drop-shadow-[0_0_10px_rgba(0,229,122,0.3)]">{currentUserRank ? `#${currentUserRank}` : '--'}</span>
      </div>
      <div className="bg-[#161821]/80 backdrop-blur-md border border-white/5 p-5 rounded-2xl shadow-lg flex flex-col items-center justify-center relative overflow-hidden group hover:border-white/10 transition-all">
        <Zap className="absolute -right-2 -bottom-2 w-12 h-12 text-white/[0.03] group-hover:scale-110 transition-transform" />
        <span className="text-[10px] text-[#8F95A3] font-black uppercase tracking-widest mb-1.5">Your Earnings</span>
        <span className="text-xl sm:text-2xl font-black text-white">{formatPrice(userEarnings, currency)}</span>
      </div>
      <div className="bg-[#161821]/80 backdrop-blur-md border border-white/5 p-5 rounded-2xl shadow-lg flex flex-col items-center justify-center relative overflow-hidden group hover:border-[#FFC94A]/30 transition-all">
        <Gift className="absolute -right-2 -bottom-2 w-12 h-12 text-[#FFC94A]/5 group-hover:scale-110 transition-transform" />
        <span className="text-[10px] text-[#8F95A3] font-black uppercase tracking-widest mb-1.5">Est. Reward</span>
        <span className="text-xl sm:text-2xl font-black text-[#FFC94A] drop-shadow-[0_0_10px_rgba(255,201,74,0.3)]">{formatPrice(myPrize, currency)}</span>
      </div>
    </div>
  );
}

// ==========================================
// ELIGIBILITY NOTICE / STATUS COMPONENT
// ==========================================
function EligibilityNotice({ data }: { data: any }) {
  const message = data.rankMessage;
  if (!message) return null;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="mb-8 flex items-center justify-center gap-3 px-6 py-4 rounded-2xl border bg-gradient-to-r from-[#A66CFF]/10 via-[#A66CFF]/5 to-[#A66CFF]/10 border-[#A66CFF]/20 shadow-[0_0_20px_rgba(166,108,255,0.1)] relative overflow-hidden"
    >
       <div className="absolute left-0 top-0 w-1 h-full bg-[#A66CFF]" />
       <Info className="w-5 h-5 text-[#A66CFF] shrink-0" />
       <span className="text-sm font-bold text-[#e9d5ff] tracking-wide">
          {message}
       </span>
    </motion.div>
  );
}

// ==========================================
// REUSABLE TOP 3 PODIUM + RANK TABLE (UPGRADED UI)
// ==========================================
// 🔥 Added isEnded prop definition to fix the TypeScript Error 🔥
function LeaderboardDisplay({ data, isEnded = false }: { data: any, isEnded?: boolean }) {
  const { currency, winners } = data;

  const sortedWinners = Array.isArray(winners) ? [...winners].sort((a, b) => Number(a.rank) - Number(b.rank)) : [];
  const top1 = sortedWinners.find((w: any) => Number(w.rank) === 1);
  const top2 = sortedWinners.find((w: any) => Number(w.rank) === 2);
  const top3 = sortedWinners.find((w: any) => Number(w.rank) === 3);
  
  const tableUsers = sortedWinners;

  const getImg = (u: any) => {
    if (!u) return null;
    if (String(u.userId) === String(getUserId())) return resolveImage(data.myProfilePic || u.image);
    return resolveImage(u.image);
  };

  return (
    <>
      <div className="flex justify-center items-center mb-10 mt-10">
        <h3 className="text-xl font-black text-white flex items-center gap-3 uppercase tracking-widest drop-shadow-md">
          <Trophy className="w-6 h-6 text-[#FFC94A]"/> Top Winners
        </h3>
      </div>
      
      {/* --- GLOWING 3D PODIUM --- */}
      <div className="flex items-end justify-center gap-3 sm:gap-6 h-[240px] mb-16 relative">
        
        {/* 2ND RANK (SILVER) */}
        <motion.div 
          initial={{ height: 0, opacity: 0 }} animate={{ height: '75%', opacity: 1 }} transition={{ duration: 0.5, delay: 0.2 }}
          className="w-[30%] max-w-[150px] bg-gradient-to-t from-slate-400/20 via-slate-400/5 to-transparent rounded-t-3xl flex flex-col items-center relative border-t-[3px] border-slate-300/50 backdrop-blur-sm"
        >
           <div className="absolute -top-10 w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-[#1A1C25] border-4 border-slate-300 overflow-hidden flex items-center justify-center shadow-[0_0_20px_rgba(203,213,225,0.4)] z-10">
             {getImg(top2) ? <img src={getImg(top2)!} className="w-full h-full object-cover" alt=""/> : <span className="text-2xl font-black text-slate-300">{getInitial(top2?.userName || top2?.name)}</span>}
           </div>
           <div className="w-6 h-6 rounded-full bg-slate-300 text-black text-xs font-black absolute -top-12 flex items-center justify-center shadow-lg z-20">2</div>
           
           <div className="mt-14 flex flex-col items-center w-full px-2">
             <span className="text-sm font-bold text-white truncate w-full text-center">{top2?.userName || top2?.name || '---'}</span>
             <span className="text-xs text-[#00E57A] font-black my-1">{top2?.earnings !== undefined ? formatPrice(top2.earnings, currency) : '---'}</span>
             <span className="text-[11px] text-black font-black bg-slate-300 px-3 py-1 rounded-full mt-1 shadow-md">
               {formatPrice(top2?.reward || 0, currency)}
             </span>
           </div>
        </motion.div>
        
        {/* 1ST RANK (GOLD) */}
        <motion.div 
          initial={{ height: 0, opacity: 0 }} animate={{ height: '100%', opacity: 1 }} transition={{ duration: 0.6, type: 'spring' }}
          className="w-[35%] max-w-[180px] bg-gradient-to-t from-[#FFC94A]/30 via-[#FFC94A]/10 to-transparent rounded-t-3xl flex flex-col items-center relative border-t-[4px] border-[#FFC94A] backdrop-blur-sm shadow-[0_-15px_40px_rgba(255,201,74,0.15)] z-10"
        >
           <Crown className="w-10 h-10 text-[#FFC94A] absolute -top-16 z-20 drop-shadow-[0_0_15px_rgba(255,201,74,0.8)]" fill="#FFC94A" />
           <div className="absolute -top-10 w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-[#1A1C25] border-4 border-[#FFC94A] overflow-hidden flex items-center justify-center shadow-[0_0_30px_rgba(255,201,74,0.5)] z-10">
             {getImg(top1) ? <img src={getImg(top1)!} className="w-full h-full object-cover" alt=""/> : <span className="text-3xl font-black text-[#FFC94A]">{getInitial(top1?.userName || top1?.name)}</span>}
           </div>
           <div className="w-8 h-8 rounded-full bg-[#FFC94A] text-black text-sm font-black absolute -top-12 flex items-center justify-center z-20 shadow-lg border-2 border-[#1A1C25]">1</div>
           
           <div className="mt-16 flex flex-col items-center w-full px-2">
             <span className="text-base font-black text-white truncate w-full text-center drop-shadow-md">{top1?.userName || top1?.name || '---'}</span>
             <span className="text-sm text-[#00E57A] font-black my-1">{top1?.earnings !== undefined ? formatPrice(top1.earnings, currency) : '---'}</span>
             <span className="text-xs text-black font-black bg-gradient-to-r from-[#FFC94A] to-[#F59E0B] px-4 py-1.5 rounded-full mt-1 shadow-lg shadow-amber-500/40">
               {formatPrice(top1?.reward || 0, currency)}
             </span>
           </div>
        </motion.div>

        {/* 3RD RANK (BRONZE) */}
        <motion.div 
          initial={{ height: 0, opacity: 0 }} animate={{ height: '65%', opacity: 1 }} transition={{ duration: 0.5, delay: 0.3 }}
          className="w-[30%] max-w-[150px] bg-gradient-to-t from-orange-500/20 via-orange-500/5 to-transparent rounded-t-3xl flex flex-col items-center relative border-t-[3px] border-orange-400/60 backdrop-blur-sm"
        >
           <div className="absolute -top-8 w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#1A1C25] border-4 border-orange-400 overflow-hidden flex items-center justify-center shadow-[0_0_20px_rgba(249,115,22,0.4)] z-10">
             {getImg(top3) ? <img src={getImg(top3)!} className="w-full h-full object-cover" alt=""/> : <span className="text-2xl font-black text-orange-400">{getInitial(top3?.userName || top3?.name)}</span>}
           </div>
           <div className="w-6 h-6 rounded-full bg-orange-400 text-black text-xs font-black absolute -top-10 flex items-center justify-center shadow-lg z-20">3</div>
           
           <div className="mt-12 flex flex-col items-center w-full px-2">
             <span className="text-sm font-bold text-white truncate w-full text-center">{top3?.userName || top3?.name || '---'}</span>
             <span className="text-xs text-[#00E57A] font-black my-1">{top3?.earnings !== undefined ? formatPrice(top3.earnings, currency) : '---'}</span>
             <span className="text-[11px] text-black font-black bg-orange-400 px-3 py-1 rounded-full mt-1 shadow-md">
               {formatPrice(top3?.reward || 0, currency)}
             </span>
           </div>
        </motion.div>
      </div>

      <EligibilityNotice data={data} />

      {/* --- GLOBAL STANDINGS MODERN LIST --- */}
      <h3 className="text-base font-black text-white mb-4 px-2 uppercase tracking-widest">Global Standings</h3>
      <div className="flex flex-col gap-2 mb-6">
        
        <div className="grid grid-cols-[60px_1fr_90px_90px] sm:grid-cols-[80px_1fr_120px_120px] gap-4 px-6 py-3 text-[10px] font-black text-[#8F95A3] uppercase tracking-widest bg-white/[0.02] rounded-xl border border-white/5">
          <div className="text-center">RANK</div>
          <div>PLAYER</div>
          <div className="text-right">SCORE</div>
          <div className="text-right">REWARD</div>
        </div>
        
        <div className="flex flex-col gap-2 max-h-[400px] overflow-y-auto custom-scrollbar pr-1">
          {tableUsers.length === 0 ? (
            <div className="text-center py-12 bg-white/[0.02] border border-white/5 rounded-2xl text-sm text-[#8F95A3]">No players ranked yet. Be the first!</div>
          ) : (
            tableUsers.map((u: any, i: number) => {
              const isMe = String(u.userId) === String(getUserId());
              return (
                <motion.div 
                  initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                  key={i} 
                  className={`grid grid-cols-[60px_1fr_90px_90px] sm:grid-cols-[80px_1fr_120px_120px] gap-4 px-6 py-4 items-center text-sm rounded-2xl border transition-all ${
                    isMe 
                      ? 'bg-gradient-to-r from-[#A66CFF]/20 to-transparent border-[#A66CFF]/40 shadow-[0_0_15px_rgba(166,108,255,0.1)]' 
                      : 'bg-[#161821] border-white/5 hover:bg-[#1A1C25] hover:border-white/10'
                  }`}
                >
                  <div className={`font-black text-center ${i < 3 ? 'text-white' : 'text-[#8F95A3]'}`}>#{u.rank}</div>
                  <div className="flex items-center gap-3 sm:gap-4 truncate pr-2">
                    <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-[#2A2C38] overflow-hidden shrink-0 flex items-center justify-center border ${isMe ? 'border-[#A66CFF]' : 'border-white/10'}`}>
                      {getImg(u) ? (
                        <img src={getImg(u)!} className="w-full h-full object-cover" alt=""/>
                      ) : (
                        <span className="text-white text-xs font-black">{getInitial(u.userName || u.name)}</span>
                      )}
                    </div>
                    <span className={`truncate font-bold text-sm sm:text-base ${isMe ? 'text-white' : 'text-gray-300'}`}>
                      {u.userName || u.name || 'Anonymous'} {isMe && <span className="text-[10px] bg-[#A66CFF] text-white px-2 py-0.5 rounded-full ml-2 align-middle">YOU</span>}
                    </span>
                  </div>
                  <div className="text-right text-[#00E57A] font-black tracking-wide">
                    {formatPrice(u.earnings || u.score || 0, currency)}
                  </div>
                  <div className="text-right text-[#FFC94A] font-black tracking-wide bg-[#FFC94A]/10 px-3 py-1 rounded-lg w-fit ml-auto">
                    {formatPrice(u.reward || u.prize || 0, currency)}
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}

// ==========================================
// 1. UPCOMING CONTENT
// ==========================================
function UpcomingContent({ data }: { data: any }) {
  const { contest } = data;
  const timer = useCountdown(contest?.startDate);

  return (
    <>
      <TimelineInfo start={contest?.startDate} end={contest?.endDate} />

      <div className="bg-gradient-to-b from-[#1A1C25] to-[#12141D] rounded-3xl p-8 border border-white/5 flex flex-col items-center mb-8 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 w-full h-1 bg-gradient-to-r from-transparent via-[#3B82F6] to-transparent opacity-50" />
        <span className="text-xs text-[#8F95A3] font-black uppercase tracking-widest mb-6 flex items-center gap-2"><Clock className="w-5 h-5 text-[#3B82F6]"/> Contest Starts In</span>
        <div className="flex items-center gap-4 sm:gap-8 text-center">
          <div className="flex flex-col items-center"><div className="text-4xl sm:text-5xl font-black text-white drop-shadow-lg">{String(timer.days).padStart(2, '0')}</div><div className="text-xs mt-2 text-[#8F95A3] font-bold uppercase tracking-wider">Days</div></div>
          <div className="text-2xl font-black text-white/20 mb-6">:</div>
          <div className="flex flex-col items-center"><div className="text-4xl sm:text-5xl font-black text-white drop-shadow-lg">{String(timer.hours).padStart(2, '0')}</div><div className="text-xs mt-2 text-[#8F95A3] font-bold uppercase tracking-wider">Hours</div></div>
          <div className="text-2xl font-black text-white/20 mb-6">:</div>
          <div className="flex flex-col items-center"><div className="text-4xl sm:text-5xl font-black text-white drop-shadow-lg">{String(timer.mins).padStart(2, '0')}</div><div className="text-xs mt-2 text-[#8F95A3] font-bold uppercase tracking-wider">Mins</div></div>
          <div className="text-2xl font-black text-white/20 mb-6">:</div>
          <div className="flex flex-col items-center"><div className="text-4xl sm:text-5xl font-black text-[#3B82F6] drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]">{String(timer.secs).padStart(2, '0')}</div><div className="text-xs mt-2 text-[#8F95A3] font-bold uppercase tracking-wider">Secs</div></div>
        </div>
      </div>

      <button className="w-full py-5 rounded-2xl bg-gradient-to-r from-[#3B82F6] to-[#2563EB] text-white font-black text-sm uppercase tracking-widest shadow-[0_0_30px_rgba(59,130,246,0.3)] hover:shadow-[0_0_40px_rgba(59,130,246,0.5)] transition-all flex justify-center items-center gap-2 hover:scale-[1.02] cursor-pointer">
        <Bell className="w-5 h-5" /> Remind Me
      </button>
    </>
  );
}

// ==========================================
// 2. ACTIVE CONTENT
// ==========================================
function ActiveContent({ data }: { data: any }) {
  const { contest } = data;
  return (
    <>
      <TimelineInfo start={contest?.startDate} end={contest?.endDate} />
      <UserStatsGrid data={data} />
      <LeaderboardDisplay data={data} />
    </>
  );
}

// ==========================================
// 3. ENDED CONTENT
// ==========================================
function EndedContent({ data }: { data: any }) {
  const { contest } = data;
  return (
    <>
      <TimelineInfo start={contest?.startDate} end={contest?.endDate} />
      <UserStatsGrid data={data} />
      <LeaderboardDisplay data={data} isEnded={true} />
    </>
  );
}

// ==========================================
// 4. CANCELLED CONTENT
// ==========================================
function CancelledContent() {
  return (
    <>
      <div className="bg-[#EF4444]/10 border border-[#EF4444]/20 rounded-2xl p-6 flex flex-col gap-2 mb-8 shadow-inner">
         <div className="flex items-center gap-3">
           <AlertOctagon className="w-6 h-6 text-[#EF4444]" />
           <h4 className="text-[#EF4444] font-black text-base uppercase tracking-wider">Contest Cancelled</h4>
         </div>
         <p className="text-sm text-rose-200/70">Unfortunately, this contest has been cancelled by the administration.</p>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center py-20 border-2 border-dashed border-white/5 rounded-3xl bg-white/[0.01] mb-8">
        <Ban className="w-12 h-12 text-[#8F95A3] opacity-30 mb-4" />
        <span className="text-lg font-black text-white mb-1">No Leaderboard Available</span>
        <span className="text-sm text-[#8F95A3]">Check back for future contests.</span>
      </div>
    </>
  );
}

// ==========================================
// 5. INACTIVE CONTENT
// ==========================================
function InactiveContent() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center py-24 text-center bg-gradient-to-b from-white/[0.02] to-transparent rounded-3xl border border-white/5 mb-6 shadow-inner">
      <div className="relative mb-8">
        <div className="w-24 h-24 rounded-full bg-white/5 flex items-center justify-center border border-white/10 shadow-[0_0_30px_rgba(255,255,255,0.05)]">
          <Trophy className="w-10 h-10 text-[#8F95A3] opacity-40" />
        </div>
        <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-[#08090E] border border-white/10 flex items-center justify-center shadow-lg">
          <Clock className="w-5 h-5 text-[#A66CFF]" />
        </div>
      </div>
      <h3 className="text-2xl font-black text-white mb-3 tracking-wide">No Active Contest</h3>
      <p className="text-base text-[#8F95A3] max-w-[80%] mx-auto leading-relaxed">We are preparing something massive. Check back soon for the next prize pool!</p>
    </div>
  );
}

// ==========================================
// REUSABLE CARD WRAPPER
// ==========================================
function ContestCard({ state, title, contestName, description, children }: { state: string, title: string, contestName?: string, description?: string, children: React.ReactNode }) {
  const getBadgeStyle = () => {
    switch (state) {
      case 'UPCOMING': return 'bg-[#3B82F6] text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]';
      case 'ACTIVE': return 'bg-[#10B981] text-black shadow-[0_0_15px_rgba(16,185,129,0.5)]';
      case 'ENDED': return 'bg-[#F59E0B] text-black shadow-[0_0_15px_rgba(245,158,11,0.5)]';
      case 'CANCELLED': return 'bg-[#EF4444] text-white shadow-[0_0_15px_rgba(239,68,68,0.5)]';
      default: return 'bg-gray-600 text-white shadow-md';
    }
  };

  const getTrophyColor = () => {
    switch (state) {
      case 'UPCOMING': return { bg: 'from-[#3B82F6]/20 to-transparent', icon: 'text-[#3B82F6]', fill: '#3B82F6' };
      case 'ACTIVE': return { bg: 'from-[#10B981]/20 to-[#10B981]/5', icon: 'text-[#10B981]', fill: '#10B981' };
      case 'ENDED': return { bg: 'from-[#F59E0B]/20 to-transparent', icon: 'text-[#F59E0B]', fill: '#F59E0B' };
      case 'CANCELLED': return { bg: 'from-[#EF4444]/20 to-transparent', icon: 'text-[#EF4444]', fill: '#EF4444' };
      default: return { bg: 'from-gray-500/20 to-transparent', icon: 'text-gray-500', fill: '#6B7280' };
    }
  };

  const trophyStyle = getTrophyColor();

  return (
    <div className="bg-[#12141D]/90 backdrop-blur-xl border border-white/10 rounded-[32px] p-6 sm:p-10 shadow-[0_20px_60px_rgba(0,0,0,0.4)] flex flex-col relative overflow-hidden min-h-[600px]">
      
      {/* Decorative background flare */}
      {state === 'ACTIVE' && <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[60%] h-[100px] bg-[#10B981]/20 blur-[80px] pointer-events-none" />}
      
      <div className="text-sm font-black tracking-widest uppercase mb-8 text-[#8F95A3] relative z-10 border-b border-white/5 pb-4">
        {title}
      </div>

      {state !== 'INACTIVE' && (
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-10 relative z-10 text-center sm:text-left">
          <div className={`w-24 h-24 rounded-3xl bg-gradient-to-b ${trophyStyle.bg} border border-white/10 flex items-center justify-center shrink-0 shadow-2xl relative`}>
            {state === 'CANCELLED' ? (
              <Ban className={`w-12 h-12 ${trophyStyle.icon}`} />
            ) : (
              <Trophy className={`w-12 h-12 ${trophyStyle.icon} drop-shadow-[0_0_15px_${trophyStyle.fill}]`} fill={trophyStyle.fill} />
            )}
            {state === 'ACTIVE' && <div className="absolute -top-2 -right-2 w-6 h-6 bg-[#10B981] rounded-full border-[4px] border-[#12141D] shadow-[0_0_15px_#10B981] animate-pulse" />}
          </div>
          
          <div className="flex-1 flex flex-col justify-center">
            <div className="flex items-center justify-center sm:justify-start gap-3 mb-2">
              <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${getBadgeStyle()}`}>
                {state}
              </span>
            </div>
            <h2 className="text-3xl font-black text-white leading-tight mb-2 drop-shadow-md">
              {contestName || 'Contest'}
            </h2>
            <p className="text-sm text-[#8F95A3] line-clamp-2 max-w-lg">
              {state === 'CANCELLED' ? 'This contest has been cancelled.' : (description || 'Compete now and climb to the top!')}
            </p>
          </div>
        </div>
      )}
      
      <div className="flex-1 flex flex-col relative z-10">
        {children}
      </div>
    </div>
  );
}

// ==========================================
// MAIN LEADERBOARD PAGE COMPONENT
// ==========================================
export default function LeaderboardPage() {
  const currency = useCurrency();
  const [contestType, setContestType] = useState<'DAILY' | 'MONTHLY'>('DAILY');
  const [contestData, setContestData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      setIsLoading(true);
      const token = localStorage.getItem('token') || '';

      try {
        const url = `https://api.binnycash.com/api/user/userViewLeaderboard?leaderboardType=${contestType}`;
        const res = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
        const json = await res.json();

        if (json.code === 200 && json.data) {
          if (!json.data.leaderboard) {
            setContestData({ isEmpty: true, message: "No leaderboard found." });
          } else {
            setContestData(json.data);
          }
        } 
        else {
          setContestData({ isEmpty: true, message: json.message || "Failed to load leaderboard." });
        }
      } catch (error) {
        setContestData({ isEmpty: true });
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboard();
  }, [contestType]);

  const currentStatus = (contestData?.leaderboard?.status || (isLoading ? '' : 'INACTIVE')).toUpperCase();

  const safeWinners = Array.isArray(contestData?.leaderboardUsers) ? contestData.leaderboardUsers : [];

  const cData = {
    contest: contestData?.leaderboard,
    totalUsers: contestData?.pagination?.total || safeWinners.length || 0,
    winners: safeWinners,
    currentUserRank: contestData?.yourstatus?.rank,
    myPrize: contestData?.yourstatus?.reward || 0,
    userEarnings: contestData?.yourstatus?.earnings || 0,
    rankMessage: contestData?.yourstatus?.rankMessage || '',
    myProfilePic: null, 
    currency
  };

  const renderContestBlock = () => {
    if (isLoading) return null;
    
    if (contestData?.isEmpty) {
      return (
        <ContestCard state="INACTIVE" title={`${contestType} CONTEST`}>
          <InactiveContent />
        </ContestCard>
      );
    }

    let resolvedStatus = currentStatus;
    if (resolvedStatus === 'INACTIVE' && safeWinners.length > 0) resolvedStatus = 'ACTIVE';

    const cName = contestData?.leaderboard?.leaderboardName || 'Leaderboard';
    const cDesc = contestData?.leaderboard?.description;

    switch (resolvedStatus) {
      case 'UPCOMING':
        return <ContestCard state="UPCOMING" title={`${contestType} CONTEST`} contestName={cName} description={cDesc}><UpcomingContent data={cData} /></ContestCard>;
      case 'ACTIVE':
        return <ContestCard state="ACTIVE" title={`${contestType} CONTEST`} contestName={cName} description={cDesc}><ActiveContent data={cData} /></ContestCard>;
      case 'ENDED':
        return <ContestCard state="ENDED" title={`${contestType} CONTEST`} contestName={cName} description={cDesc}><EndedContent data={cData} /></ContestCard>;
      case 'CANCELLED':
        return <ContestCard state="CANCELLED" title={`${contestType} CONTEST`} contestName={cName} description={cDesc}><CancelledContent /></ContestCard>;
      default:
        return <ContestCard state="INACTIVE" title={`${contestType} CONTEST`}><InactiveContent /></ContestCard>;
    }
  };

  return (
    <div className="min-h-screen bg-[#08090E] text-[#F5F3FF] pb-20 font-sans selection:bg-[#A66CFF]/30">
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(166,108,255,0.3); border-radius: 10px; }
      `}</style>

      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute top-0 left-1/4 w-[500px] h-[400px] bg-[#A66CFF]/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[300px] bg-[#FFC94A]/5 blur-[100px] rounded-full" />
      </div>

      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
        
        <div className="flex flex-col items-center justify-center text-center mb-12">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-br from-[#A66CFF] to-[#7C3AED] flex items-center justify-center shadow-[0_10px_30px_rgba(166,108,255,0.4)] mb-6">
            <Trophy className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-[36px] sm:text-[48px] font-black text-white mb-3 tracking-tight drop-shadow-md">Global Leaderboard</h1>
          <p className="text-[#8F95A3] text-base font-medium mb-10 max-w-lg mx-auto">Dominate the rankings, prove your skills, and earn massive rewards every single day.</p>
          
          <div className="bg-[#12141D]/80 backdrop-blur-xl border border-white/10 p-2 rounded-2xl flex items-center shadow-2xl relative w-fit mx-auto">
            <div 
              className="absolute h-[calc(100%-16px)] top-[8px] rounded-xl bg-[#A66CFF] shadow-[0_0_15px_rgba(166,108,255,0.5)] transition-all duration-300 ease-out"
              style={{
                width: 'calc(50% - 8px)',
                left: contestType === 'DAILY' ? '8px' : 'calc(50%)'
              }}
            />
            <button 
              onClick={() => setContestType('DAILY')}
              className={`relative z-10 w-36 sm:w-48 py-3 text-sm font-black uppercase tracking-wider transition-colors ${contestType === 'DAILY' ? 'text-white' : 'text-[#8F95A3] hover:text-white'}`}
            >
              Daily Race
            </button>
            <button 
              onClick={() => setContestType('MONTHLY')}
              className={`relative z-10 w-36 sm:w-48 py-3 text-sm font-black uppercase tracking-wider transition-colors ${contestType === 'MONTHLY' ? 'text-white' : 'text-[#8F95A3] hover:text-white'}`}
            >
              Monthly Epic
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div key="loading" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="flex flex-col items-center justify-center py-32 bg-[#12141D]/50 border border-white/5 rounded-[32px] max-w-[900px] mx-auto backdrop-blur-md">
              <div className="w-16 h-16 relative flex items-center justify-center mb-6">
                <div className="absolute inset-0 rounded-full border-4 border-white/10 border-t-[#A66CFF] animate-spin"></div>
                <Trophy className="w-6 h-6 text-[#A66CFF]" />
              </div>
              <p className="text-white font-black tracking-widest uppercase text-sm">Loading Standings...</p>
            </motion.div>
          ) : (
            <motion.div key={contestType + currentStatus} initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -30 }} transition={{ duration: 0.4, ease: "easeOut" }}>
              <div className="max-w-[900px] mx-auto w-full">
                {renderContestBlock()}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}