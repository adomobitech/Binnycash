'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, Bell, Loader2, Crown, Calendar, Clock, Gift, Users, 
  DollarSign, CheckCircle2, AlertOctagon, Ban, User, Info
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
  return imgSrc.startsWith('/') ? `https://apitest.binnycash.com${imgSrc}` : `https://apitest.binnycash.com/${imgSrc}`;
};

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

const getPrizeForRank = (data: any, rank: number) => {
  if (!data?.contest?.prizes) return 0;
  const prizeObj = data.contest.prizes.find((p: any) => rank >= p.startRank && rank <= p.endRank);
  return prizeObj ? prizeObj.Cash : 0;
};

// ==========================================
// REUSABLE TOP 3 PODIUM + RANK TABLE COMPONENT
// ==========================================
function LeaderboardDisplay({ data, isEnded = false }: { data: any, isEnded?: boolean }) {
  const { currency, winners } = data;

  const sortedWinners = [...winners].sort((a, b) => Number(a.rank) - Number(b.rank));
  const top1 = sortedWinners.find((w: any) => Number(w.rank) === 1);
  const top2 = sortedWinners.find((w: any) => Number(w.rank) === 2);
  const top3 = sortedWinners.find((w: any) => Number(w.rank) === 3);
  
  // Rank 4 and onwards
  const tableUsers = sortedWinners.filter((w: any) => Number(w.rank) > 3);

  const getImg = (u: any) => {
    if (!u) return null;
    if (String(u.userId) === String(getUserId())) return resolveImage(data.myProfilePic || u.image);
    return resolveImage(u.image);
  };

  return (
    <>
      <div className="flex justify-between items-center mb-4 px-1">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Trophy className="w-4 h-4 text-[#FFC94A]"/> Top Winners
        </h3>
      </div>
      
      {/* 🔥 PODIUM: 2nd (Left), 1st (Center), 3rd (Right) 🔥 */}
      <div className="flex items-end justify-center gap-2 sm:gap-4 h-[160px] mb-8 mt-6">
        
        {/* 2ND RANK (LEFT) */}
        <div className="w-[30%] bg-[#1A1C25] rounded-t-2xl flex flex-col items-center relative h-[82%] border border-white/5 border-b-0 pb-3">
           <div className="absolute -top-6 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#2A2C38] border-[3px] border-[#E2E8F0] overflow-hidden flex items-center justify-center shadow-md">
             {getImg(top2) ? <img src={getImg(top2)!} className="w-full h-full object-cover" alt=""/> : <User className="w-5 h-5 text-[#8F95A3]"/>}
           </div>
           <div className="w-5 h-5 rounded-full bg-[#E2E8F0] text-black text-[10px] font-black absolute -top-8 flex items-center justify-center shadow">2</div>
           <span className="text-xs font-bold text-white mt-auto truncate w-full text-center px-1">{top2?.userName || '---'}</span>
           {top2?.totalReward !== undefined && (
             <span className="text-[11px] text-[#00E57A] font-bold my-0.5">{formatPrice(top2?.totalReward, currency)}</span>
           )}
           <span className="text-[10px] text-[#FFC94A] font-black bg-[#FFC94A]/10 px-2 py-0.5 rounded mt-1">
             {formatPrice(top2?.prize || getPrizeForRank(data, 2), currency)}
           </span>
        </div>
        
        {/* 1ST RANK (CENTER) */}
        <div className="w-[36%] bg-gradient-to-t from-[#A66CFF]/20 via-[#1A1C25] to-[#252136] rounded-t-2xl flex flex-col items-center relative h-full border border-[#FFC94A]/40 border-b-0 pb-3 shadow-[0_-5px_25px_rgba(255,201,74,0.15)]">
           <Crown className="w-7 h-7 text-[#FFC94A] absolute -top-11 z-10 drop-shadow-[0_2px_8px_rgba(255,201,74,0.6)]" fill="#FFC94A" />
           <div className="absolute -top-7 w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-[#2A2C38] border-[3px] border-[#FFC94A] overflow-hidden flex items-center justify-center shadow-lg">
             {getImg(top1) ? <img src={getImg(top1)!} className="w-full h-full object-cover" alt=""/> : <User className="w-6 h-6 text-[#FFC94A]"/>}
           </div>
           <div className="w-6 h-6 rounded-full bg-[#FFC94A] text-black text-[11px] font-black absolute -top-9 flex items-center justify-center z-10 shadow-md">1</div>
           <span className="text-sm font-black text-white mt-auto truncate w-full text-center px-1">{top1?.userName || '---'}</span>
           {top1?.totalReward !== undefined && (
             <span className="text-xs text-[#00E57A] font-black my-0.5">{formatPrice(top1?.totalReward, currency)}</span>
           )}
           <span className="text-[11px] text-[#FFC94A] font-black bg-[#FFC94A]/20 border border-[#FFC94A]/30 px-2.5 py-0.5 rounded mt-1">
             {formatPrice(top1?.prize || getPrizeForRank(data, 1), currency)}
           </span>
        </div>

        {/* 3RD RANK (RIGHT) */}
        <div className="w-[30%] bg-[#1A1C25] rounded-t-2xl flex flex-col items-center relative h-[72%] border border-white/5 border-b-0 pb-3">
           <div className="absolute -top-6 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#2A2C38] border-[3px] border-[#CD7F32] overflow-hidden flex items-center justify-center shadow-md">
             {getImg(top3) ? <img src={getImg(top3)!} className="w-full h-full object-cover" alt=""/> : <User className="w-5 h-5 text-[#8F95A3]"/>}
           </div>
           <div className="w-5 h-5 rounded-full bg-[#CD7F32] text-black text-[10px] font-black absolute -top-8 flex items-center justify-center shadow">3</div>
           <span className="text-xs font-bold text-white mt-auto truncate w-full text-center px-1">{top3?.userName || '---'}</span>
           {top3?.totalReward !== undefined && (
             <span className="text-[11px] text-[#00E57A] font-bold my-0.5">{formatPrice(top3?.totalReward, currency)}</span>
           )}
           <span className="text-[10px] text-[#FFC94A] font-black bg-[#FFC94A]/10 px-2 py-0.5 rounded mt-1">
             {formatPrice(top3?.prize || getPrizeForRank(data, 3), currency)}
           </span>
        </div>
      </div>

      {/* 🔥 CHANGED: "Leaderboard (Rank 4+)" Replaced with "Global Standings" 🔥 */}
      <h3 className="text-sm font-bold text-white mb-3 px-1">Global Standings</h3>
      <div className="bg-[#0B0C10] rounded-xl border border-white/5 overflow-hidden mb-6">
        <div className="grid grid-cols-[60px_1fr_100px_80px] gap-2 px-4 py-3 text-[10px] font-bold text-[#8F95A3] uppercase tracking-wider bg-white/[0.02] border-b border-white/5">
          <div>RANK</div>
          <div>USER</div>
          <div className="text-right">PRIZE</div>
          <div className="text-right">STATUS</div>
        </div>
        <div className="flex flex-col max-h-[260px] overflow-y-auto custom-scrollbar">
          {tableUsers.length === 0 ? (
            <div className="text-center py-8 text-sm text-[#8F95A3]">No other players ranked yet.</div>
          ) : (
            tableUsers.map((u: any, i: number) => (
              <div 
                key={i} 
                className={`grid grid-cols-[60px_1fr_100px_80px] gap-2 px-4 py-3.5 items-center text-xs border-b border-white/5 last:border-0 ${String(u.userId) === String(getUserId()) ? 'bg-[#A66CFF]/15 border-l-2 border-l-[#A66CFF]' : 'hover:bg-white/[0.02]'}`}
              >
                <div className="text-[#8F95A3] font-bold">#{u.rank}</div>
                <div className="flex items-center gap-2 truncate">
                  <div className="w-6 h-6 rounded-full bg-white/5 overflow-hidden shrink-0 flex items-center justify-center border border-white/10">
                    {getImg(u) ? <img src={getImg(u)!} className="w-full h-full object-cover" alt=""/> : <User className="w-3 h-3 text-[#8F95A3]"/>}
                  </div>
                  <span className="truncate font-bold text-white">{u.userName || 'Anonymous'}</span>
                </div>
                <div className="text-right text-[#FFC94A] font-bold">
                  {formatPrice(u.prize || getPrizeForRank(data, u.rank), currency)}
                </div>
                <div className="text-right font-bold text-[#00E57A]">
                  {isEnded ? 'Ended' : 'Active'}
                </div>
              </div>
            ))
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
  const { currency, contest } = data;
  const timer = useCountdown(contest?.startDate);

  return (
    <>
      <div className="bg-[#0B0C10] rounded-2xl p-4 border border-white/5 flex flex-col items-center mb-6">
        <span className="text-[10px] text-[#8F95A3] font-bold uppercase tracking-widest mb-3 flex items-center gap-1.5"><Clock className="w-4 h-4"/> Starts In</span>
        <div className="flex items-center gap-5 text-center">
          <div><div className="text-3xl font-black text-white">{String(timer.days).padStart(2, '0')}</div><div className="text-[10px] mt-1 text-[#8F95A3]">Days</div></div>
          <div className="text-xl font-bold text-white/20 mb-3">:</div>
          <div><div className="text-3xl font-black text-white">{String(timer.hours).padStart(2, '0')}</div><div className="text-[10px] mt-1 text-[#8F95A3]">Hours</div></div>
          <div className="text-xl font-bold text-white/20 mb-3">:</div>
          <div><div className="text-3xl font-black text-white">{String(timer.mins).padStart(2, '0')}</div><div className="text-[10px] mt-1 text-[#8F95A3]">Mins</div></div>
          <div className="text-xl font-bold text-white/20 mb-3">:</div>
          <div><div className="text-3xl font-black text-[#3B82F6]">{String(timer.secs).padStart(2, '0')}</div><div className="text-[10px] mt-1 text-[#8F95A3]">Secs</div></div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-[#0B0C10] rounded-xl p-4 flex items-center gap-4 border border-white/5">
          <div className="w-10 h-10 rounded-full bg-[#A66CFF]/10 flex items-center justify-center shrink-0">
            <Gift className="w-5 h-5 text-[#A66CFF]" />
          </div>
          <div>
            <div className="text-[10px] text-[#8F95A3] font-bold uppercase tracking-wider mb-0.5">Prize Pool</div>
            <div className="text-lg font-black text-white">{formatPrice(contest?.totalPrizePool || 0, currency)}</div>
          </div>
        </div>
        <div className="bg-[#0B0C10] rounded-xl p-4 flex items-center gap-4 border border-white/5">
          <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5 text-[#8F95A3]" />
          </div>
          <div>
            <div className="text-[10px] text-[#8F95A3] font-bold uppercase tracking-wider mb-0.5">Participants</div>
            <div className="text-lg font-black text-white">{data.totalUsers} <span className="text-[10px] text-[#8F95A3] font-medium">Joined</span></div>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center text-sm border-y border-white/5 py-4 mb-6 px-2">
        <div className="flex flex-col">
          <span className="text-[10px] text-[#8F95A3] font-bold uppercase tracking-wider mb-1"><Calendar className="w-3.5 h-3.5 inline mr-1"/> Starts On</span>
          <span className="text-white font-bold">{contest?.startDate ? new Date(contest.startDate).toLocaleDateString() : 'TBD'}</span>
        </div>
        <div className="w-px h-8 bg-white/10" />
        <div className="flex flex-col">
          <span className="text-[10px] text-[#8F95A3] font-bold uppercase tracking-wider mb-1"><Calendar className="w-3.5 h-3.5 inline mr-1"/> Ends On</span>
          <span className="text-white font-bold">{contest?.endDate ? new Date(contest.endDate).toLocaleDateString() : 'TBD'}</span>
        </div>
        <div className="w-px h-8 bg-white/10" />
        <div className="flex flex-col items-end">
          <span className="text-[10px] text-[#FFC94A] font-bold uppercase tracking-wider mb-1"><Trophy className="w-3.5 h-3.5 inline mr-1"/> Top Prize</span>
          <span className="text-[#FFC94A] font-black">{formatPrice(getPrizeForRank(data, 1), currency)}</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center items-center py-10 text-center bg-[#0B0C10] rounded-xl border border-dashed border-white/10 mb-6">
        <Clock className="w-8 h-8 text-[#8F95A3] mb-3 opacity-50" />
        <span className="text-sm font-bold text-white mb-1">No rankings yet</span>
        <span className="text-xs text-[#8F95A3]">This contest hasn't started.</span>
      </div>

      <button className="w-full py-4 rounded-xl bg-gradient-to-r from-[#A66CFF] to-[#8B5CF6] text-white font-bold text-sm shadow-md hover:opacity-90 transition-opacity flex justify-center items-center gap-2 mt-auto cursor-pointer">
        <Bell className="w-4 h-4" /> Notify Me
      </button>
    </>
  );
}

// ==========================================
// 2. ACTIVE CONTENT
// ==========================================
function ActiveContent({ data }: { data: any }) {
  const { currency, contest, currentUserRank, userEarnings } = data;

  return (
    <>
      <div className="grid grid-cols-4 gap-2 mb-6 bg-[#0B0C10] p-4 rounded-xl border border-white/5 text-center">
        <div className="border-r border-white/5">
          <span className="text-[10px] text-[#8F95A3] font-bold block uppercase tracking-wider mb-1">Prize Pool</span>
          <span className="text-sm sm:text-base font-black text-[#A66CFF]">{formatPrice(contest?.totalPrizePool || 0, currency)}</span>
        </div>
        <div className="border-r border-white/5">
          <span className="text-[10px] text-[#8F95A3] font-bold block uppercase tracking-wider mb-1">Participants</span>
          <span className="text-sm sm:text-base font-black text-white">{data.totalUsers}</span>
        </div>
        <div className="border-r border-white/5">
          <span className="text-[10px] text-[#8F95A3] font-bold block uppercase tracking-wider mb-1">Your Rank</span>
          <span className="text-sm sm:text-base font-black text-[#00E57A]">{currentUserRank ? `#${currentUserRank}` : '--'}</span>
        </div>
        <div>
          <span className="text-[10px] text-[#8F95A3] font-bold block uppercase tracking-wider mb-1">Earnings</span>
          <span className="text-sm sm:text-base font-black text-white">{formatPrice(userEarnings, currency)}</span>
        </div>
      </div>

      {/* Render Podium + Table */}
      <LeaderboardDisplay data={data} isEnded={false} />

      {/* 🔥 CHANGED: Clean & Premium Notice/Warning Box 🔥 */}
      {data.rankMessage && (
        <div className="mt-2 bg-gradient-to-r from-[#F59E0B]/10 to-[#0B0C10] border border-[#F59E0B]/20 rounded-xl p-4 flex items-start gap-4">
           <div className="w-10 h-10 rounded-full bg-[#F59E0B]/20 flex items-center justify-center shrink-0 mt-0.5">
             <AlertOctagon className="w-5 h-5 text-[#F59E0B]" />
           </div>
           <div className="text-left flex-1">
             <h4 className="text-[#F59E0B] font-bold text-sm mb-1 uppercase tracking-wider">
               {data.rankMessage.includes(':') ? data.rankMessage.split(':')[0] : 'Eligibility Notice'}
             </h4>
             <p className="text-[13px] text-[#F59E0B]/90 font-medium leading-relaxed">
               {data.rankMessage.includes(':') ? data.rankMessage.split(':')[1].trim() : data.rankMessage}
             </p>
           </div>
        </div>
      )}
    </>
  );
}

// ==========================================
// 3. ENDED CONTENT
// ==========================================
function EndedContent({ data }: { data: any }) {
  const { currency, contest } = data;

  return (
    <>
      <div className="grid grid-cols-3 gap-3 mb-6 bg-[#0B0C10] p-4 rounded-xl border border-white/5 text-center">
        <div className="border-r border-white/5">
          <span className="text-[10px] text-[#8F95A3] font-bold block uppercase tracking-wider mb-1">Prize Pool</span>
          <span className="text-base font-black text-[#A66CFF]">{formatPrice(contest?.totalPrizePool || 0, currency)}</span>
        </div>
        <div className="border-r border-white/5">
          <span className="text-[10px] text-[#8F95A3] font-bold block uppercase tracking-wider mb-1">Participants</span>
          <span className="text-base font-black text-white">{data.totalUsers}</span>
        </div>
        <div>
          <span className="text-[10px] text-[#8F95A3] font-bold block uppercase tracking-wider mb-1">Total Payout</span>
          <span className="text-base font-black text-[#00E57A]">{formatPrice(contest?.totalPrizePool || 0, currency)}</span>
        </div>
      </div>

      {/* Render Podium + Table for Ended Contest */}
      <LeaderboardDisplay data={data} isEnded={true} />

      {/* 🔥 CHANGED: Clean & Premium Notice/Warning Box 🔥 */}
      {data.rankMessage && (
        <div className="mt-2 bg-gradient-to-r from-[#F59E0B]/10 to-[#0B0C10] border border-[#F59E0B]/20 rounded-xl p-4 flex items-start gap-4">
           <div className="w-10 h-10 rounded-full bg-[#F59E0B]/20 flex items-center justify-center shrink-0 mt-0.5">
             <AlertOctagon className="w-5 h-5 text-[#F59E0B]" />
           </div>
           <div className="text-left flex-1">
             <h4 className="text-[#F59E0B] font-bold text-sm mb-1 uppercase tracking-wider">
               {data.rankMessage.includes(':') ? data.rankMessage.split(':')[0] : 'Eligibility Notice'}
             </h4>
             <p className="text-[13px] text-[#F59E0B]/90 font-medium leading-relaxed">
               {data.rankMessage.includes(':') ? data.rankMessage.split(':')[1].trim() : data.rankMessage}
             </p>
           </div>
        </div>
      )}
    </>
  );
}

// ==========================================
// 4. FINALIZED CONTENT
// ==========================================
function FinalizedContent({ data }: { data: any }) {
  const { currency, contest, myPrize } = data;

  return (
    <>
      <div className="grid grid-cols-3 gap-3 mb-6 bg-[#0B0C10] p-4 rounded-xl border border-white/5 text-center">
        <div className="border-r border-white/5">
          <span className="text-[10px] text-[#8F95A3] font-bold block uppercase tracking-wider mb-1">Prize Pool</span>
          <span className="text-base font-black text-[#A66CFF]">{formatPrice(contest?.totalPrizePool || 0, currency)}</span>
        </div>
        <div className="border-r border-white/5">
          <span className="text-[10px] text-[#8F95A3] font-bold block uppercase tracking-wider mb-1">Total Paid</span>
          <span className="text-base font-black text-[#00E57A]">{formatPrice(contest?.totalPrizePool || 0, currency)}</span>
        </div>
        <div>
          <span className="text-[10px] text-[#8F95A3] font-bold block uppercase tracking-wider mb-1">Participants</span>
          <span className="text-base font-black text-white">{data.totalUsers}</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-6 mb-6">
        <div className="bg-[#10B981]/10 border border-[#10B981]/20 rounded-xl p-5 flex items-center gap-4">
           <CheckCircle2 className="w-6 h-6 text-[#10B981] shrink-0" />
           <div>
             <h4 className="text-white font-bold text-sm mb-0.5">Rewards Distributed!</h4>
             <p className="text-xs text-[#8F95A3]">All eligible rewards have been sent to winners.</p>
           </div>
        </div>

        <div className="bg-[#0B0C10] border border-white/5 rounded-xl p-8 flex flex-col items-center justify-center text-center">
          <span className="text-xs text-[#8F95A3] font-bold uppercase tracking-wider mb-2">Your Reward</span>
          <div className="text-5xl font-black text-[#00E57A] mb-4">{formatPrice(myPrize, currency)}</div>
          <span className="text-xs font-bold text-[#10B981] bg-[#10B981]/10 px-3 py-1 rounded flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4"/> Paid Successfully
          </span>
        </div>
      </div>

      <button className="w-full py-4 rounded-xl bg-gradient-to-r from-[#A66CFF] to-[#7C3AED] text-white font-bold text-sm shadow-md hover:opacity-90 transition-opacity mt-auto cursor-pointer">
        View Payout Details
      </button>
    </>
  );
}

// ==========================================
// 5. CANCELLED CONTENT
// ==========================================
function CancelledContent() {
  return (
    <>
      <div className="bg-[#EF4444]/10 border border-[#EF4444]/20 rounded-xl p-5 flex flex-col gap-2 mb-6">
         <div className="flex items-center gap-3">
           <AlertOctagon className="w-5 h-5 text-[#EF4444]" />
           <h4 className="text-[#EF4444] font-bold text-sm">Contest Cancelled</h4>
         </div>
         <p className="text-xs text-[#8F95A3]">Unfortunately, this contest has been cancelled.</p>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center py-12 border border-dashed border-white/10 rounded-xl bg-[#0B0C10] mb-6">
        <Ban className="w-8 h-8 text-[#8F95A3] opacity-30 mb-3" />
        <span className="text-sm font-bold text-white mb-1">No leaderboard available</span>
        <span className="text-xs text-[#8F95A3]">This contest is cancelled.</span>
      </div>

      <button className="w-full py-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-sm transition-colors mt-auto cursor-pointer">
        Return to Dashboard
      </button>
    </>
  );
}

// ==========================================
// 6. INACTIVE CONTENT
// ==========================================
function InactiveContent() {
  return (
    <>
      <div className="flex-1 flex flex-col items-center justify-center py-16 text-center bg-[#0B0C10] rounded-xl border border-white/5 mb-6">
        <div className="relative mb-6">
          <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center border border-white/5">
            <Calendar className="w-8 h-8 text-[#8F95A3] opacity-50" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-[#12141D] border border-white/10 flex items-center justify-center">
            <Clock className="w-4 h-4 text-[#8F95A3]" />
          </div>
        </div>
        <h3 className="text-xl font-black text-white mb-2">Check back later!</h3>
        <p className="text-sm text-[#8F95A3] max-w-[80%] mx-auto">We are preparing something exciting for you.</p>
      </div>
    </>
  );
}

// ==========================================
// REUSABLE CARD WRAPPER
// ==========================================
function ContestCard({ state, title, contestName, description, children }: { state: string, title: string, contestName?: string, description?: string, children: React.ReactNode }) {
  const getBadgeStyle = () => {
    switch (state) {
      case 'UPCOMING': return 'bg-[#3B82F6]/10 text-[#3B82F6] border-[#3B82F6]/20';
      case 'ACTIVE': return 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20';
      case 'ENDED': return 'bg-[#F59E0B]/10 text-[#F59E0B] border-[#F59E0B]/20';
      case 'FINALIZED': return 'bg-[#A66CFF]/10 text-[#A66CFF] border-[#A66CFF]/20';
      case 'CANCELLED': return 'bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20';
      case 'INACTIVE': return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
      default: return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  const getTrophyColor = () => {
    switch (state) {
      case 'UPCOMING': return { bg: 'from-[#3B82F6]/20 to-transparent', icon: 'text-[#3B82F6]', fill: '#3B82F6' };
      case 'ACTIVE': return { bg: 'from-[#F59E0B]/20 to-[#F59E0B]/5', icon: 'text-[#F59E0B]', fill: '#F59E0B' };
      case 'ENDED': return { bg: 'from-[#F59E0B]/20 to-transparent', icon: 'text-[#F59E0B]', fill: '#F59E0B' };
      case 'FINALIZED': return { bg: 'from-[#A66CFF]/20 to-[#A66CFF]/5', icon: 'text-[#A66CFF]', fill: '#A66CFF' };
      case 'CANCELLED': return { bg: 'from-[#EF4444]/20 to-transparent', icon: 'text-[#EF4444]', fill: '#EF4444' };
      case 'INACTIVE': return { bg: 'from-gray-500/20 to-transparent', icon: 'text-gray-500', fill: '#6B7280' };
      default: return { bg: '', icon: '', fill: '' };
    }
  };

  const trophyStyle = getTrophyColor();

  return (
    <div className="bg-[#12141D] border border-white/5 rounded-[28px] p-6 sm:p-8 shadow-xl flex flex-col hover:border-white/10 transition-colors relative overflow-hidden group min-h-[600px]">
      <div className="text-[14px] font-black tracking-wider uppercase mb-6 text-[#8F95A3]">
        {title}
      </div>

      <div className="flex gap-5 mb-8 relative z-10">
        <div className={`w-20 h-20 rounded-[20px] bg-gradient-to-b ${trophyStyle.bg} border border-white/5 flex items-center justify-center shrink-0 shadow-lg relative`}>
          {state === 'CANCELLED' ? (
            <Ban className={`w-10 h-10 ${trophyStyle.icon}`} />
          ) : (
            <Trophy className={`w-10 h-10 ${trophyStyle.icon}`} fill={trophyStyle.fill} />
          )}
          {state === 'ACTIVE' && <div className="absolute -top-1 -right-1 w-4 h-4 bg-[#10B981] rounded-full border-[3px] border-[#12141D] animate-pulse" />}
        </div>
        
        <div className="flex-1 flex flex-col justify-center min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className={`text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded border ${getBadgeStyle()}`}>
              {state === 'ACTIVE' ? 'ACTIVE' : state}
            </span>
          </div>
          <h2 className="text-[20px] font-black text-white leading-tight mb-1 truncate">
            {state === 'INACTIVE' ? 'No Active Contest' : (contestName || 'Contest')} <Trophy className="w-4 h-4 inline text-[#FFC94A] ml-1 mb-1" fill="#FFC94A"/>
          </h2>
          <p className="text-xs text-[#8F95A3] line-clamp-2">
            {state === 'INACTIVE' || state === 'CANCELLED' ? (
              state === 'CANCELLED' ? 'This contest has been cancelled.' : 'There is no active contest at the moment.'
            ) : (
              description || 'Compete now and climb to the top!'
            )}
          </p>
        </div>
      </div>
      
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
  const [myProfilePic, setMyProfilePic] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch Profile Pic
  useEffect(() => {
    const fetchMyProfile = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const res = await fetch('https://apitest.binnycash.com/api/user/viewData', { headers: { 'Authorization': `Bearer ${token}` } });
        const json = await res.json();
        if (json.code === 200) setMyProfilePic(json.data?.user?.image || json.data?.user?.profilePic);
      } catch (e) {}
    };
    fetchMyProfile();
  }, []);

  // Fetch Contest Data based on Daily/Monthly toggle
  useEffect(() => {
    const fetchLeaderboard = async () => {
      setIsLoading(true);
      const token = localStorage.getItem('token') || '';
      const userId = getUserId();

      try {
        const url = `https://apitest.binnycash.com/api/user/userViewContest?contestType=${contestType}&page=1&limit=50${userId ? `&userId=${userId}` : ''}`;
        const res = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
        const json = await res.json();

        if (json.code === 200 && json.data) {
          setContestData(json.data);
        } else {
          setContestData(null);
        }
      } catch (error) {
        setContestData(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboard();
  }, [contestType]);

  // Determine status dynamically from real API response
  const currentStatus = (contestData?.contest?.status || (isLoading ? '' : 'INACTIVE')).toUpperCase();

  // Safely map winners array regardless of whether backend sends 'topUsers' or 'winners'
  const safeWinners = Array.isArray(contestData?.topUsers) 
    ? contestData.topUsers 
    : Array.isArray(contestData?.winners) 
      ? contestData.winners 
      : [];

  const cData = {
    contest: contestData?.contest,
    totalUsers: contestData?.totalUsers || 0,
    winners: safeWinners,
    currentUserRank: contestData?.currentUserRank?.rank,
    myPrize: contestData?.currentUserRank?.prize || contestData?.myPrize || 0,
    userEarnings: contestData?.userEligibility?.contestEarnings || contestData?.currentUserRank?.totalReward || 0,
    rankMessage: contestData?.rankMessage || '',
    myProfilePic,
    currency
  };

  // Function to render exactly one block based on backend status
  const renderContestBlock = () => {
    if (isLoading) return null;
    
    // Dynamic values for the card wrapper
    const cName = contestData?.contest?.contestName;
    const cDesc = contestData?.contest?.description;

    switch (currentStatus) {
      case 'UPCOMING':
        return (
          <ContestCard state="UPCOMING" title={`${contestType} CONTEST`} contestName={cName} description={cDesc}>
            <UpcomingContent data={cData} />
          </ContestCard>
        );
      case 'ACTIVE':
        return (
          <ContestCard state="ACTIVE" title={`${contestType} CONTEST`} contestName={cName} description={cDesc}>
            <ActiveContent data={cData} />
          </ContestCard>
        );
      case 'ENDED':
        return (
          <ContestCard state="ENDED" title={`${contestType} CONTEST`} contestName={cName} description={cDesc}>
            <EndedContent data={cData} />
          </ContestCard>
        );
      case 'FINALIZED':
        return (
          <ContestCard state="FINALIZED" title={`${contestType} CONTEST`} contestName={cName} description={cDesc}>
            <FinalizedContent data={cData} />
          </ContestCard>
        );
      case 'CANCELLED':
        return (
          <ContestCard state="CANCELLED" title={`${contestType} CONTEST`} contestName={cName} description={cDesc}>
            <CancelledContent />
          </ContestCard>
        );
      default:
        // Default to INACTIVE if status doesn't match above cases
        return (
          <ContestCard state="INACTIVE" title={`${contestType} CONTEST`}>
            <InactiveContent />
          </ContestCard>
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#08090E] text-[#F5F3FF] pb-20 font-sans selection:bg-[#A66CFF]/30">
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(166,108,255,0.3); border-radius: 10px; }
      `}</style>

      {/* Background Glows */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute top-0 left-1/4 w-[500px] h-[400px] bg-[#A66CFF]/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[300px] bg-[#FFC94A]/5 blur-[100px] rounded-full" />
      </div>

      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
        
        {/* --- PAGE HEADER & TOGGLE --- */}
        <div className="flex flex-col items-center justify-center text-center mb-12">
          <h1 className="text-[32px] sm:text-[40px] font-black text-white mb-2 tracking-tight">Leaderboard</h1>
          <p className="text-[#8F95A3] text-sm font-medium mb-8">Compete with others, climb the ranks, and win big prizes.</p>
          
          <div className="bg-[#12141D] border border-white/5 p-1.5 rounded-2xl flex items-center shadow-lg relative">
            <div 
              className="absolute h-[calc(100%-12px)] top-[6px] rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#A66CFF] shadow-[0_0_20px_rgba(139,92,246,0.3)] transition-all duration-300 ease-out"
              style={{
                width: 'calc(50% - 6px)',
                left: contestType === 'DAILY' ? '6px' : 'calc(50%)'
              }}
            />
            <button 
              onClick={() => setContestType('DAILY')}
              className={`relative z-10 w-32 sm:w-40 py-2.5 text-sm font-bold transition-colors ${contestType === 'DAILY' ? 'text-white' : 'text-[#8F95A3] hover:text-white'}`}
            >
              Daily
            </button>
            <button 
              onClick={() => setContestType('MONTHLY')}
              className={`relative z-10 w-32 sm:w-40 py-2.5 text-sm font-bold transition-colors ${contestType === 'MONTHLY' ? 'text-white' : 'text-[#8F95A3] hover:text-white'}`}
            >
              Monthly
            </button>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col items-center justify-center py-32">
              <Loader2 className="w-10 h-10 text-[#A66CFF] animate-spin mb-4" />
              <p className="text-[#8F95A3] font-medium">Loading Leaderboard...</p>
            </motion.div>
          ) : (
            <motion.div key={contestType + currentStatus} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
              
              {/* --- DYNAMIC SINGLE CONTEST BLOCK --- */}
              <div className="max-w-[850px] mx-auto w-full">
                {renderContestBlock()}
              </div>

            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}