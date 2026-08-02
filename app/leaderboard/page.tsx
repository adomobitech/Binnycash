'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, Bell, Loader2, Crown, Calendar, Clock, Gift, Users, 
  DollarSign, CheckCircle2, AlertOctagon, Ban, User
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
// 1. UPCOMING CONTENT
// ==========================================
function UpcomingContent({ data }: { data: any }) {
  const { currency, contest } = data;
  const timer = useCountdown(contest?.startDate);

  return (
    <>
      <div className="bg-[#0B0C10] rounded-2xl p-3 border border-white/5 flex flex-col items-center mb-4">
        <span className="text-[9px] text-[#8F95A3] font-bold uppercase tracking-widest mb-2 flex items-center gap-1"><Clock className="w-3 h-3"/> Starts In</span>
        <div className="flex items-center gap-3 text-center">
          <div><div className="text-xl font-black text-white">{String(timer.days).padStart(2, '0')}</div><div className="text-[8px] text-[#8F95A3]">Days</div></div>
          <div className="text-sm font-bold text-white/20 mb-2">:</div>
          <div><div className="text-xl font-black text-white">{String(timer.hours).padStart(2, '0')}</div><div className="text-[8px] text-[#8F95A3]">Hours</div></div>
          <div className="text-sm font-bold text-white/20 mb-2">:</div>
          <div><div className="text-xl font-black text-white">{String(timer.mins).padStart(2, '0')}</div><div className="text-[8px] text-[#8F95A3]">Mins</div></div>
          <div className="text-sm font-bold text-white/20 mb-2">:</div>
          <div><div className="text-xl font-black text-[#3B82F6]">{String(timer.secs).padStart(2, '0')}</div><div className="text-[8px] text-[#8F95A3]">Secs</div></div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-[#0B0C10] rounded-xl p-3 flex items-center gap-3 border border-white/5">
          <div className="w-8 h-8 rounded-full bg-[#A66CFF]/10 flex items-center justify-center shrink-0">
            <Gift className="w-4 h-4 text-[#A66CFF]" />
          </div>
          <div>
            <div className="text-[9px] text-[#8F95A3] font-bold">Prize Pool</div>
            <div className="text-xs font-black text-white">{formatPrice(contest?.totalPrizePool || 0, currency)}</div>
          </div>
        </div>
        <div className="bg-[#0B0C10] rounded-xl p-3 flex items-center gap-3 border border-white/5">
          <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center shrink-0">
            <Users className="w-4 h-4 text-[#8F95A3]" />
          </div>
          <div>
            <div className="text-[9px] text-[#8F95A3] font-bold">Participants</div>
            <div className="text-xs font-black text-white">{data.totalUsers} <span className="text-[8px] text-[#8F95A3]">Joined</span></div>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-center text-xs border-y border-white/5 py-2.5 mb-4 px-1">
        <div className="flex flex-col">
          <span className="text-[9px] text-[#8F95A3] font-bold"><Calendar className="w-3 h-3 inline"/> Starts On</span>
          <span className="text-white font-bold text-[11px]">{contest?.startDate ? new Date(contest.startDate).toLocaleDateString() : 'TBD'}</span>
        </div>
        <div className="w-px h-6 bg-white/10" />
        <div className="flex flex-col">
          <span className="text-[9px] text-[#8F95A3] font-bold"><Calendar className="w-3 h-3 inline"/> Ends On</span>
          <span className="text-white font-bold text-[11px]">{contest?.endDate ? new Date(contest.endDate).toLocaleDateString() : 'TBD'}</span>
        </div>
        <div className="w-px h-6 bg-white/10" />
        <div className="flex flex-col items-end">
          <span className="text-[9px] text-[#FFC94A] font-bold"><Trophy className="w-3 h-3 inline"/> Top Prize</span>
          <span className="text-[#FFC94A] font-black text-[11px]">{formatPrice(getPrizeForRank(data, 1), currency)}</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center items-center py-6 text-center bg-[#0B0C10] rounded-xl border border-dashed border-white/10 mb-4">
        <Clock className="w-6 h-6 text-[#8F95A3] mb-2 opacity-50" />
        <span className="text-xs font-bold text-white mb-0.5">No rankings yet</span>
        <span className="text-[10px] text-[#8F95A3]">This contest hasn't started.</span>
      </div>

      <button className="w-full py-3 rounded-xl bg-gradient-to-r from-[#A66CFF] to-[#8B5CF6] text-white font-bold text-xs shadow-md hover:opacity-90 transition-opacity flex justify-center items-center gap-1.5 mt-auto">
        <Bell className="w-3.5 h-3.5" /> Notify Me
      </button>
    </>
  );
}

// ==========================================
// 2. ACTIVE CONTENT
// ==========================================
function ActiveContent({ data }: { data: any }) {
  const { currency, contest, winners, currentUserRank, userEarnings } = data;

  const top1 = winners.find((w: any) => w.rank === 1);
  const top2 = winners.find((w: any) => w.rank === 2);
  const top3 = winners.find((w: any) => w.rank === 3);
  const tableUsers = winners.filter((w: any) => w.rank > 3);

  const getImg = (u: any) => {
    if (!u) return null;
    if (u.userId === getUserId()) return resolveImage(data.myProfilePic || u.image);
    return resolveImage(u.image);
  };

  return (
    <>
      <div className="grid grid-cols-4 gap-1.5 mb-4 bg-[#0B0C10] p-2.5 rounded-xl border border-white/5 text-center">
        <div className="border-r border-white/5">
          <span className="text-[8px] text-[#8F95A3] font-bold block uppercase">Prize Pool</span>
          <span className="text-[11px] font-black text-[#A66CFF]">{formatPrice(contest?.totalPrizePool || 0, currency)}</span>
        </div>
        <div className="border-r border-white/5">
          <span className="text-[8px] text-[#8F95A3] font-bold block uppercase">Participants</span>
          <span className="text-[11px] font-black text-white">{data.totalUsers}</span>
        </div>
        <div className="border-r border-white/5">
          <span className="text-[8px] text-[#8F95A3] font-bold block uppercase">Your Rank</span>
          <span className="text-[11px] font-black text-[#00E57A]">{currentUserRank ? `#${currentUserRank}` : '--'}</span>
        </div>
        <div>
          <span className="text-[8px] text-[#8F95A3] font-bold block uppercase">Earnings</span>
          <span className="text-[11px] font-black text-white">{formatPrice(userEarnings, currency)}</span>
        </div>
      </div>

      <div className="flex justify-between items-center mb-3">
        <h3 className="text-xs font-bold text-white flex items-center gap-1"><Trophy className="w-3.5 h-3.5 text-[#A66CFF]"/> Top 3 Leaderboard</h3>
      </div>
      
      <div className="flex items-end justify-center gap-2 h-[110px] mb-4">
        <div className="w-[30%] bg-[#1A1C25] rounded-t-xl flex flex-col items-center relative h-[80%] border border-white/5 border-b-0 pb-2">
           <div className="absolute -top-5 w-9 h-9 rounded-full bg-[#2A2C38] border-2 border-[#E2E8F0] overflow-hidden flex items-center justify-center">
             {getImg(top2) ? <img src={getImg(top2)!} className="w-full h-full object-cover" alt=""/> : <User className="w-4 h-4 text-[#8F95A3]"/>}
           </div>
           <div className="w-3.5 h-3.5 rounded-full bg-[#E2E8F0] text-black text-[8px] font-black absolute -top-6 flex items-center justify-center">2</div>
           <span className="text-[10px] font-bold text-white mt-auto truncate w-full text-center px-1">{top2?.userName || '---'}</span>
           <span className="text-[9px] text-[#00E57A] font-bold">{formatPrice(top2?.prize || 0, currency)}</span>
           <span className="text-[8px] text-[#FFC94A] font-black">Prize {formatPrice(getPrizeForRank(data, 2), currency)}</span>
        </div>
        
        <div className="w-[35%] bg-gradient-to-t from-[#A66CFF]/20 to-[#1A1C25] rounded-t-xl flex flex-col items-center relative h-full border border-[#A66CFF]/30 border-b-0 pb-2">
           <Crown className="w-4 h-4 text-[#FFC94A] absolute -top-8 z-10" fill="#FFC94A" />
           <div className="absolute -top-5 w-11 h-11 rounded-full bg-[#2A2C38] border-2 border-[#FFC94A] overflow-hidden flex items-center justify-center shadow-md">
             {getImg(top1) ? <img src={getImg(top1)!} className="w-full h-full object-cover" alt=""/> : <User className="w-5 h-5 text-[#FFC94A]"/>}
           </div>
           <div className="w-3.5 h-3.5 rounded-full bg-[#FFC94A] text-black text-[8px] font-black absolute -top-6 flex items-center justify-center z-10">1</div>
           <span className="text-xs font-black text-white mt-auto truncate w-full text-center px-1">{top1?.userName || '---'}</span>
           <span className="text-[10px] text-[#00E57A] font-black">{formatPrice(top1?.prize || 0, currency)}</span>
           <span className="text-[9px] text-[#FFC94A] font-black">Prize {formatPrice(getPrizeForRank(data, 1), currency)}</span>
        </div>

        <div className="w-[30%] bg-[#1A1C25] rounded-t-xl flex flex-col items-center relative h-[70%] border border-white/5 border-b-0 pb-2">
           <div className="absolute -top-5 w-9 h-9 rounded-full bg-[#2A2C38] border-2 border-[#CD7F32] overflow-hidden flex items-center justify-center">
             {getImg(top3) ? <img src={getImg(top3)!} className="w-full h-full object-cover" alt=""/> : <User className="w-4 h-4 text-[#8F95A3]"/>}
           </div>
           <div className="w-3.5 h-3.5 rounded-full bg-[#CD7F32] text-black text-[8px] font-black absolute -top-6 flex items-center justify-center">3</div>
           <span className="text-[10px] font-bold text-white mt-auto truncate w-full text-center px-1">{top3?.userName || '---'}</span>
           <span className="text-[9px] text-[#00E57A] font-bold">{formatPrice(top3?.prize || 0, currency)}</span>
           <span className="text-[8px] text-[#FFC94A] font-black">Prize {formatPrice(getPrizeForRank(data, 3), currency)}</span>
        </div>
      </div>

      <h3 className="text-xs font-bold text-white mb-2">Full Leaderboard</h3>
      <div className="bg-[#0B0C10] rounded-xl border border-white/5 overflow-hidden mb-4">
        <div className="grid grid-cols-[40px_1fr_80px_60px] gap-1 px-3 py-2 text-[8px] font-bold text-[#8F95A3] uppercase tracking-wider bg-white/[0.02] border-b border-white/5">
          <div>RANK</div><div>USER</div><div className="text-right">PRIZE</div><div className="text-right">STATUS</div>
        </div>
        <div className="flex flex-col max-h-[160px] overflow-y-auto custom-scrollbar">
          {tableUsers.length === 0 ? (
            <div className="text-center py-6 text-xs text-[#8F95A3]">No other players ranked yet.</div>
          ) : (
            tableUsers.map((u: any, i: number) => (
              <div key={i} className={`grid grid-cols-[40px_1fr_80px_60px] gap-1 px-3 py-2 items-center text-[10px] border-b border-white/5 last:border-0 ${u.userId === getUserId() ? 'bg-[#A66CFF]/15' : ''}`}>
                <div className="text-[#8F95A3] font-bold">{u.rank}</div>
                <div className="truncate font-bold text-white">{u.userName || 'Anonymous'}</div>
                <div className="text-right text-[#FFC94A] font-bold">{formatPrice(u.prize || getPrizeForRank(data, u.rank), currency)}</div>
                <div className="text-right text-[#00E57A] font-bold">Active</div>
              </div>
            ))
          )}
        </div>
      </div>

      {data.rankMessage && (
        <div className="text-xs text-[#8F95A3] bg-[#0B0C10] p-2.5 rounded-xl border border-white/5 text-center mt-auto">
          {data.rankMessage}
        </div>
      )}
    </>
  );
}

// ==========================================
// 3. ENDED CONTENT
// ==========================================
function EndedContent({ data }: { data: any }) {
  const { currency, contest, winners } = data;
  const top1 = winners.find((w: any) => w.rank === 1);
  const tableUsers = winners.filter((w: any) => w.rank > 1);

  const getImg = (u: any) => {
    if (!u) return null;
    if (u.userId === getUserId()) return resolveImage(data.myProfilePic || u.image);
    return resolveImage(u.image);
  };

  return (
    <>
      <div className="grid grid-cols-3 gap-2 mb-4 bg-[#0B0C10] p-3 rounded-xl border border-white/5 text-center">
        <div className="border-r border-white/5">
          <span className="text-[9px] text-[#8F95A3] font-bold block uppercase">Prize Pool</span>
          <span className="text-xs font-black text-[#A66CFF]">{formatPrice(contest?.totalPrizePool || 0, currency)}</span>
        </div>
        <div className="border-r border-white/5">
          <span className="text-[9px] text-[#8F95A3] font-bold block uppercase">Participants</span>
          <span className="text-xs font-black text-white">{data.totalUsers}</span>
        </div>
        <div>
          <span className="text-[9px] text-[#8F95A3] font-bold block uppercase">Total Payout</span>
          <span className="text-xs font-black text-[#00E57A]">{formatPrice(contest?.totalPrizePool || 0, currency)}</span>
        </div>
      </div>

      <div className="mb-4">
        <h3 className="text-xs font-bold text-white mb-2">Winner</h3>
        {top1 ? (
          <div className="bg-gradient-to-r from-[#FFC94A]/10 to-transparent border border-[#FFC94A]/20 rounded-xl p-3 flex items-center justify-between">
             <div className="flex items-center gap-3">
               <div className="w-8 h-8 rounded-full bg-[#12141D] border border-[#FFC94A] overflow-hidden flex items-center justify-center font-black text-xs text-[#FFC94A]">
                 {getImg(top1) ? <img src={getImg(top1)!} className="w-full h-full object-cover" alt=""/> : '🥇'}
               </div>
               <span className="text-xs font-bold text-white">{top1.userName || 'Winner'}</span>
             </div>
             <div className="flex items-center gap-4 text-right">
               <div><span className="text-[8px] text-[#8F95A3] block uppercase">Prize</span><span className="text-xs font-black text-[#FFC94A]">{formatPrice(top1.prize || getPrizeForRank(data, 1), currency)}</span></div>
             </div>
          </div>
        ) : (
          <div className="text-xs text-[#8F95A3] bg-[#0B0C10] p-3 rounded-xl border border-white/5 text-center">No winner recorded.</div>
        )}
      </div>

      <h3 className="text-xs font-bold text-white mb-2">Full Leaderboard</h3>
      <div className="bg-[#0B0C10] rounded-xl border border-white/5 overflow-hidden mb-4 max-h-[180px] overflow-y-auto custom-scrollbar">
        <div className="grid grid-cols-[40px_1fr_70px_50px] gap-1 px-3 py-2 text-[8px] font-bold text-[#8F95A3] uppercase tracking-wider bg-white/[0.02] border-b border-white/5">
          <div>RANK</div><div>USER</div><div className="text-right">PRIZE</div><div className="text-right">STATUS</div>
        </div>
        <div className="flex flex-col">
          {tableUsers.length === 0 ? (
            <div className="text-center py-6 text-xs text-[#8F95A3]">No other ranked users.</div>
          ) : (
            tableUsers.map((row: any, i: number) => (
              <div key={i} className="grid grid-cols-[40px_1fr_70px_50px] gap-1 px-3 py-2 items-center text-[10px] border-b border-white/5 last:border-0">
                <div className="text-white font-bold">{row.rank}</div>
                <div className="truncate font-bold text-white">{row.userName || 'Anonymous'}</div>
                <div className="text-right text-[#FFC94A] font-bold">{formatPrice(row.prize || getPrizeForRank(data, row.rank), currency)}</div>
                <div className="text-right text-[#00E57A] font-bold">Ended</div>
              </div>
            ))
          )}
        </div>
      </div>

      {data.rankMessage && (
        <div className="text-xs text-[#8F95A3] bg-[#0B0C10] p-2.5 rounded-xl border border-white/5 text-center mb-3">
          {data.rankMessage}
        </div>
      )}

      <button className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-xs transition-colors mt-auto">
        View All Results
      </button>
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
      <div className="grid grid-cols-3 gap-2 mb-5 bg-[#0B0C10] p-3 rounded-xl border border-white/5 text-center">
        <div className="border-r border-white/5">
          <span className="text-[9px] text-[#8F95A3] font-bold block uppercase">Prize Pool</span>
          <span className="text-xs font-black text-[#A66CFF]">{formatPrice(contest?.totalPrizePool || 0, currency)}</span>
        </div>
        <div className="border-r border-white/5">
          <span className="text-[9px] text-[#8F95A3] font-bold block uppercase">Total Paid</span>
          <span className="text-xs font-black text-[#00E57A]">{formatPrice(contest?.totalPrizePool || 0, currency)}</span>
        </div>
        <div>
          <span className="text-[9px] text-[#8F95A3] font-bold block uppercase">Participants</span>
          <span className="text-xs font-black text-white">{data.totalUsers}</span>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-4 mb-5">
        <div className="bg-[#10B981]/10 border border-[#10B981]/20 rounded-xl p-3.5 flex items-center gap-3">
           <CheckCircle2 className="w-5 h-5 text-[#10B981] shrink-0" />
           <div>
             <h4 className="text-white font-bold text-xs">Rewards Distributed!</h4>
             <p className="text-[11px] text-[#8F95A3]">All eligible rewards have been sent to winners.</p>
           </div>
        </div>

        <div className="bg-[#0B0C10] border border-white/5 rounded-xl p-5 flex flex-col items-center justify-center text-center">
          <span className="text-[10px] text-[#8F95A3] font-bold uppercase tracking-wider mb-1">Your Reward</span>
          <div className="text-3xl font-black text-[#00E57A] mb-2">{formatPrice(myPrize, currency)}</div>
          <span className="text-[10px] font-bold text-[#10B981] bg-[#10B981]/10 px-2 py-0.5 rounded flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3"/> Paid Successfully
          </span>
        </div>
      </div>

      <button className="w-full py-3 rounded-xl bg-gradient-to-r from-[#A66CFF] to-[#7C3AED] text-white font-bold text-xs shadow-md hover:opacity-90 transition-opacity mt-auto">
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
      <div className="bg-[#EF4444]/10 border border-[#EF4444]/20 rounded-xl p-4 flex flex-col gap-2 mb-5">
         <div className="flex items-center gap-2">
           <AlertOctagon className="w-4 h-4 text-[#EF4444]" />
           <h4 className="text-[#EF4444] font-bold text-xs">Contest Cancelled</h4>
         </div>
         <p className="text-[11px] text-[#8F95A3]">Unfortunately, this contest has been cancelled.</p>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center py-8 border border-dashed border-white/10 rounded-xl bg-[#0B0C10] mb-5">
        <Ban className="w-6 h-6 text-[#8F95A3] opacity-30 mb-2" />
        <span className="text-xs font-bold text-white mb-0.5">No leaderboard available</span>
        <span className="text-[10px] text-[#8F95A3]">This contest is cancelled.</span>
      </div>

      <button className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-xs transition-colors mt-auto">
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
      <div className="flex-1 flex flex-col items-center justify-center py-10 text-center bg-[#0B0C10] rounded-xl border border-white/5 mb-5">
        <div className="relative mb-4">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center border border-white/5">
            <Calendar className="w-6 h-6 text-[#8F95A3] opacity-50" />
          </div>
          <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#12141D] border border-white/10 flex items-center justify-center">
            <Clock className="w-3 h-3 text-[#8F95A3]" />
          </div>
        </div>
        <h3 className="text-base font-black text-white mb-1">Check back later!</h3>
        <p className="text-xs text-[#8F95A3] max-w-[80%] mx-auto">We are preparing something exciting for you.</p>
      </div>

      <button className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-xs transition-colors mt-auto flex justify-center items-center gap-1.5">
        <Gift className="w-3.5 h-3.5 text-[#A66CFF]" /> Browse Offers
      </button>
    </>
  );
}

// ==========================================
// REUSABLE CARD WRAPPER FOR 6 GRIDS
// ==========================================
function ContestCard({ state, title, children }: { state: string, title: string, children: React.ReactNode }) {
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
    <div className="bg-[#12141D] border border-white/5 rounded-[24px] p-6 shadow-xl flex flex-col hover:border-white/10 transition-colors relative overflow-hidden group">
      <div className="text-[13px] font-black tracking-wider uppercase mb-4 text-[#8F95A3]">
        {title}
      </div>

      <div className="flex gap-4 mb-6 relative z-10">
        <div className={`w-16 h-16 rounded-[18px] bg-gradient-to-b ${trophyStyle.bg} border border-white/5 flex items-center justify-center shrink-0 shadow-lg relative`}>
          {state === 'CANCELLED' ? (
            <Ban className={`w-8 h-8 ${trophyStyle.icon}`} />
          ) : (
            <Trophy className={`w-8 h-8 ${trophyStyle.icon}`} fill={trophyStyle.fill} />
          )}
          {state === 'ACTIVE' && <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#10B981] rounded-full border-2 border-[#12141D] animate-pulse" />}
        </div>
        
        <div className="flex-1 flex flex-col justify-center min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${getBadgeStyle()}`}>
              {state === 'ACTIVE' ? 'ACTIVE' : state}
            </span>
          </div>
          <h2 className="text-[16px] font-black text-white leading-tight mb-0.5 truncate">
            {state === 'INACTIVE' ? 'No Active Contest' : 'Loot League Season 5'} <Trophy className="w-3 h-3 inline text-[#FFC94A] ml-0.5 mb-1" fill="#FFC94A"/>
          </h2>
          <p className="text-[11px] text-[#8F95A3] line-clamp-1">
            {state === 'UPCOMING' && 'Get ready! The contest starts soon.'}
            {state === 'ACTIVE' && 'Compete now and climb to the top!'}
            {state === 'ENDED' && 'This contest has ended. Thank you for participating!'}
            {state === 'FINALIZED' && 'Rewards have been distributed successfully.'}
            {state === 'CANCELLED' && 'This contest has been cancelled.'}
            {state === 'INACTIVE' && 'There is no active contest at the moment.'}
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

  // Determine status from real API response
  const status = contestData?.contest?.status || (isLoading ? '' : 'INACTIVE');

  const cData = {
    contest: contestData?.contest,
    totalUsers: contestData?.totalUsers || 0,
    winners: contestData?.winners || [],
    currentUserRank: contestData?.currentUserRank,
    myPrize: contestData?.myPrize || 0,
    userEarnings: contestData?.userEligibility?.contestEarnings || 0,
    rankMessage: contestData?.rankMessage || '',
    myProfilePic,
    currency
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
            <motion.div key={contestType + status} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }}>
              
              {/* --- 6 CONTEST CARDS GRID --- */}
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 lg:gap-8">
                
                {/* 1. UPCOMING CONTEST */}
                <ContestCard state="UPCOMING" title="1. UPCOMING CONTEST">
                  <UpcomingContent data={cData} />
                </ContestCard>

                {/* 2. ACTIVE CONTEST */}
                <ContestCard state="ACTIVE" title="2. ACTIVE CONTEST">
                  <ActiveContent data={cData} />
                </ContestCard>

                {/* 3. ENDED CONTEST */}
                <ContestCard state="ENDED" title="3. ENDED CONTEST">
                  <EndedContent data={cData} />
                </ContestCard>

                {/* 4. FINALIZED CONTEST */}
                <ContestCard state="FINALIZED" title="4. FINALIZED CONTEST">
                  <FinalizedContent data={cData} />
                </ContestCard>

                {/* 5. CANCELLED CONTEST */}
                <ContestCard state="CANCELLED" title="5. CANCELLED CONTEST">
                  <CancelledContent />
                </ContestCard>

                {/* 6. INACTIVE CONTEST */}
                <ContestCard state="INACTIVE" title="6. INACTIVE CONTEST">
                  <InactiveContent />
                </ContestCard>

              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}