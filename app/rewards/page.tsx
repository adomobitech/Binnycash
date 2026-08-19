'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Lock, CheckCircle2, Loader2, AlertCircle, Gift, Zap, Clock, X, Sparkles
} from 'lucide-react';
import { useCurrency, formatPrice } from '@/hooks/useCurrency';

// --- CUSTOM SVG ICONS ---
const XIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
);

const FacebookIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
);

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

const DiscordIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6 fill-white"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>
);

export default function RewardsPage() {
  const currency = useCurrency();
  
  const [activeTab, setActiveTab] = useState('daily_streak');

  // Data States
  const [loadingStreak, setLoadingStreak] = useState(true);
  const [streakData, setStreakData] = useState<any>(null);
  const [todayEarnings, setTodayEarnings] = useState(0);
  const [streakWallet, setStreakWallet] = useState(0); 

  // Claim States
  const [claiming, setClaiming] = useState(false); 
  const [claimError, setClaimError] = useState<string | null>(null);
  const [claimSuccess, setClaimSuccess] = useState<string | null>(null);

  // Promo Code States
  const [promoCode, setPromoCode] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoMessage, setPromoMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

  // Modals
  const [isHowItWorksOpen, setIsHowItWorksOpen] = useState(false);

  const targetAmount = 1; // $1.00 fixed target
  
  const displayEarnings = Math.min(Math.max(todayEarnings, 0), targetAmount);
  const calculateProgress = () => {
    return Math.min(100, Math.max(0, (displayEarnings / targetAmount) * 100)); 
  };
  const progressPercent = calculateProgress().toFixed(0);

  // Fetch API Data
  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async (isSilent = false) => {
    if (!isSilent) setLoadingStreak(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };
      const cacheBust = `?t=${Date.now()}`;

      const [resToday, resStreak, resStreakWallet] = await Promise.all([
        fetch(`https://apitest.binnycash.com/api/user/balance/today-earning${cacheBust}`, { method: 'GET', headers, cache: 'no-store' }),
        fetch(`https://apitest.binnycash.com/api/user/userDailyRewardStatus${cacheBust}`, { method: 'GET', headers, cache: 'no-store' }),
        fetch(`https://apitest.binnycash.com/api/user/daily-rewards/wallet${cacheBust}`, { method: 'GET', headers, cache: 'no-store' })
      ]);

      const [jsonToday, jsonStreak, jsonStreakWallet] = await Promise.all([
        resToday.json().catch(() => ({})),
        resStreak.json().catch(() => ({})),
        resStreakWallet.json().catch(() => ({}))
      ]);

      if (jsonToday.code === 200) {
        let tEarning = 0;
        if (typeof jsonToday.data === 'number') tEarning = jsonToday.data;
        else if (typeof jsonToday.data === 'string') tEarning = Number(jsonToday.data) || 0;
        else if (typeof jsonToday.data === 'object' && jsonToday.data !== null) {
          tEarning = Number(jsonToday.data.totalAmount || jsonToday.data.todayEarning || jsonToday.data.amount || jsonToday.data.total || 0);
        }
        setTodayEarnings(tEarning);
      }

      if (jsonStreak.code === 200 && jsonStreak.data) {
        setStreakData(jsonStreak.data);
      }

      if (jsonStreakWallet.code === 200) {
        const walletData = jsonStreakWallet.data || jsonStreakWallet;
        const walletVal = walletData.dailyRewardWallet ?? walletData.streakWallet ?? 0;
        setStreakWallet(Number(walletVal));
      }
    } catch (err) {
      console.error("Failed to load streak data:", err);
    } finally {
      if (!isSilent) setLoadingStreak(false);
    }
  };

  // TOTAL CLAIM
  const handleClaimAll = async () => {
    if (claimableDays.length === 0 || claiming) return;
    setClaimError(null);
    setClaimSuccess(null);
    setClaiming(true); 

    try {
      const token = localStorage.getItem('token');
      let successCount = 0;

      for (const d of claimableDays) {
        const payload = new URLSearchParams();
        payload.append('day', String(d.day));

        const res = await fetch('https://apitest.binnycash.com/api/user/claimDailyReward', {
          method: 'PUT', 
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/x-www-form-urlencoded' },
          body: payload
        });
        const json = await res.json();
        if (res.ok && (json.code === 200 || json.type === 'success')) successCount++;
      }

      if (successCount > 0) {
        setClaimSuccess(`Successfully claimed total ${formatPrice(streakWallet > 0 ? streakWallet : totalClaimableAmount, currency)}!`);
        await fetchAllData(true); 
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new Event('walletUpdated'));
          window.dispatchEvent(new Event('balanceUpdated'));
        }
      } else {
        setClaimError('Unable to claim rewards right now.');
      }
    } catch (err) {
      setClaimError('Something went wrong. Please try again.');
    } finally {
      setClaiming(false);
    }
  };

  // BONUS CODE HANDLER
  const handleRedeemPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoCode.trim()) return;
    setPromoLoading(true);
    setPromoMessage(null);

    try {
      const token = localStorage.getItem('token');
      const deviceId = localStorage.getItem('device_id') || 'web-browser-device'; 

      const formData = new URLSearchParams();
      formData.append('code', promoCode.trim());
      formData.append('deviceId', deviceId);

      const res = await fetch('https://apitest.binnycash.com/api/user/bonusCode/bonus/apply', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`, 
          'Content-Type': 'application/x-www-form-urlencoded' 
        },
        body: formData
      });
      const json = await res.json();
      if (res.ok || json.code === 200) {
        setPromoMessage({ text: json.message || 'Bonus code applied successfully!', type: 'success' });
        setPromoCode('');
        if (typeof window !== 'undefined') window.dispatchEvent(new Event('walletUpdated'));
      } else {
        setPromoMessage({ text: json.message || 'Invalid or ineligible bonus code.', type: 'error' });
      }
    } catch (error) {
      setPromoMessage({ text: 'Something went wrong. Please try again.', type: 'error' });
    } finally {
      setPromoLoading(false);
    }
  };

  const claimableDays = streakData?.days?.filter((d: any) => String(d.status).toUpperCase() === 'CLAIM') || [];
  const claimedDays = streakData?.days?.filter((d: any) => String(d.status).toUpperCase() === 'CLAIMED') || [];
  
  const isMainButtonClaimable = claimableDays.length > 0;
  const hasClaimedAny = claimedDays.length > 0;

  // 🔥 AMOUNT FIX CALCULATION 🔥
  const totalClaimableAmount = claimableDays.reduce((sum: number, day: any) => sum + Number(day.reward || 0), 0);
  const totalClaimedAmount = claimedDays.reduce((sum: number, day: any) => sum + Number(day.reward || 0), 0);

  const tabs = [
    { id: 'daily_streak', label: 'Daily Streak' },
    { id: 'bonus_codes', label: 'Bonus Code' }
  ];

  return (
    <div className="min-h-screen bg-[#0B0E14] text-white font-sans relative pb-20 overflow-hidden">
      
      {/* POPUPS & MODALS */}
      <AnimatePresence>
        {claimSuccess && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0B0E14]/90 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#151923] border border-[#00E57A]/30 rounded-3xl p-8 w-full max-w-sm text-center shadow-2xl relative"
            >
              <div className="w-16 h-16 rounded-full bg-[#00E57A]/20 flex items-center justify-center mx-auto mb-4 border border-[#00E57A]/50">
                <CheckCircle2 className="w-8 h-8 text-[#00E57A]" />
              </div>
              <h3 className="text-2xl font-black text-white mb-2">Claimed!</h3>
              <p className="text-[#8F95A3] text-sm mb-8">{claimSuccess}</p>
              <button onClick={() => setClaimSuccess(null)} className="w-full py-3.5 rounded-xl bg-[#00E57A] hover:bg-[#00c76a] text-black font-bold text-sm transition-all cursor-pointer">
                Continue
              </button>
            </motion.div>
          </div>
        )}

        {claimError && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0B0E14]/90 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              className="bg-[#151923] border border-rose-500/30 rounded-3xl p-8 w-full max-w-sm text-center shadow-2xl relative"
            >
              <div className="w-16 h-16 rounded-full bg-rose-500/20 flex items-center justify-center mx-auto mb-4 border border-rose-500/50">
                <AlertCircle className="w-8 h-8 text-rose-500" />
              </div>
              <h3 className="text-2xl font-black text-white mb-2">Oops!</h3>
              <p className="text-[#8F95A3] text-sm mb-8">{claimError}</p>
              <button onClick={() => setClaimError(null)} className="w-full py-3.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-sm transition-all cursor-pointer">
                Try Again
              </button>
            </motion.div>
          </div>
        )}

        {isHowItWorksOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#0B0E14]/90 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="bg-[#151923] border border-white/10 rounded-3xl p-6 md:p-8 w-full max-w-lg shadow-2xl relative"
            >
              <button 
                onClick={() => setIsHowItWorksOpen(false)} 
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-[#8F95A3] transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
                  <Gift className="w-5 h-5 text-emerald-500" />
                </div>
                <h3 className="text-2xl font-black text-white tracking-tight">How Daily Streak Works</h3>
              </div>
              
              <div className="space-y-4 text-sm text-[#8F95A3] font-medium leading-relaxed">
                <p><strong className="text-emerald-500">1. Earn Daily:</strong> Reach the minimum daily goal ({formatPrice(targetAmount, currency)}) to maintain your streak.</p>
                <p><strong className="text-[#9B51E0]">2. Claim Rewards:</strong> Once the daily goal is met, your current day unlocks. Click the card or the main claim button to get your bonus.</p>
                <p><strong className="text-amber-500">3. Big 7-Day Bonus:</strong> Complete all 7 days in a row to unlock the massive Day 7 mystery reward.</p>
                <p><strong className="text-rose-500">4. Don't Break It:</strong> If you miss a day and fail to reach the minimum earning, your streak resets to Day 1.</p>
              </div>

              <button 
                onClick={() => setIsHowItWorksOpen(false)} 
                className="w-full mt-8 py-3.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/5 text-white font-bold text-sm transition-all cursor-pointer"
              >
                Got it!
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <main className="max-w-[1100px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* HEADER */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-6">Bonuses</h1>

          {/* TABS */}
          <div className="inline-flex items-center bg-[#151923] border border-white/5 p-1.5 rounded-[20px] relative">
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button 
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative z-10 px-8 py-3 rounded-[16px] text-[15px] font-bold whitespace-nowrap transition-colors duration-300 cursor-pointer ${
                    isActive ? 'text-white' : 'text-[#8F95A3] hover:text-white'
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTabIndicator"
                      className="absolute inset-0 bg-[#9B51E0] rounded-[16px]"
                      style={{ zIndex: -1 }}
                      transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    />
                  )}
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* TAB CONTENTS */}
        <AnimatePresence mode="wait">
          
          {/* DAILY STREAK TAB */}
          {activeTab === 'daily_streak' && (
            <motion.div 
              key="daily_streak"
              initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.3 }}
              className="bg-[#121620] border border-white/5 rounded-[24px] p-6 lg:p-10 shadow-2xl relative overflow-hidden"
            >
              {loadingStreak ? (
                <div className="py-32 flex justify-center items-center">
                  <Loader2 className="w-10 h-10 text-[#9B51E0] animate-spin" />
                </div>
              ) : (
                <>
                  <div className="text-center mb-10">
                    <h2 className="text-[17px] font-medium text-[#8F95A3]">
                      Earn <span className="text-[#9B51E0] font-bold">{formatPrice(targetAmount, currency)}+</span> daily to keep your streak!
                    </h2>
                  </div>

                  {/* TIMELINE UI */}
                  <div className="relative w-full max-w-4xl mx-auto mb-10 overflow-x-auto hide-scroll pb-6">
                    <div className="absolute top-[85px] left-[5%] right-[5%] h-[2px] border-t-2 border-dashed border-white/10 z-0"></div>

                    <div className="flex justify-between min-w-[700px] relative z-10">
                      {(streakData?.days || []).map((dayItem: any, idx: number) => {
                        const currentDayId = dayItem.day !== undefined ? dayItem.day : (idx + 1);
                        const backendStatus = String(dayItem.status || '').toUpperCase();
                        const isDay7 = idx === 6;
                        
                        const isClaimed = backendStatus === 'CLAIMED';
                        const isClaimable = backendStatus === 'CLAIM';
                        const isActive = backendStatus === 'ACTIVE';

                        let iconBoxClass = ""; 
                        let IconComponent = Lock;
                        let topCardClass = "";
                        let rewardTextColor = "";

                        if (isClaimed) {
                          iconBoxClass = "bg-[#00E57A] border border-[#00E57A] text-[#121620]";
                          IconComponent = CheckCircle2;
                          topCardClass = "bg-[#00E57A]/10 border border-[#00E57A]/30 opacity-60";
                          rewardTextColor = "text-[#00E57A]";
                        } else if (isClaimable) {
                          iconBoxClass = "bg-[#3B82F6] border border-[#3B82F6] text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]";
                          IconComponent = Gift;
                          topCardClass = "bg-[#3B82F6]/10 border border-[#3B82F6]/30 shadow-[0_0_15px_rgba(59,130,246,0.1)]";
                          rewardTextColor = "text-white";
                        } else if (isActive) {
                          iconBoxClass = "bg-[#1C212D] border border-white/20 text-[#8F95A3]";
                          IconComponent = isDay7 ? Gift : Zap;
                          topCardClass = "bg-white/5 border border-white/10";
                          rewardTextColor = isDay7 ? "text-amber-500" : "text-white";
                        } else {
                          iconBoxClass = "bg-[#1C212D] border border-white/5 text-[#5F6574] opacity-50";
                          IconComponent = Lock;
                          topCardClass = "bg-transparent border border-transparent opacity-50";
                          rewardTextColor = isDay7 ? "text-amber-500/50" : "text-[#5F6574]";
                        }

                        return (
                          <div key={idx} className="flex flex-col items-center w-24 relative group">
                            <div className={`w-20 h-20 rounded-2xl flex flex-col items-center justify-center mb-4 transition-all duration-300 ${topCardClass}`}>
                              <span className="text-[11px] font-medium text-[#8F95A3] mb-1">Day {currentDayId}</span>
                              <span className={`text-sm font-bold ${rewardTextColor}`}>
                                {formatPrice(dayItem.reward, currency)}
                              </span>
                            </div>
                            
                            <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 relative z-10 ${iconBoxClass}`}>
                              <IconComponent className="w-5 h-5" />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* INFO BANNER */}
                  <div className="w-full bg-[#181C25] border border-white/5 rounded-2xl p-4 flex items-center justify-between mb-8 text-sm">
                    <div className="flex items-center gap-3">
                      <Gift className="w-5 h-5 text-[#9B51E0]" />
                      <span className="text-[#8F95A3]">Complete all 7 days to unlock <span className="text-amber-500 font-bold">{formatPrice(streakData?.days?.[6]?.reward || 1, currency)}!</span></span>
                    </div>
                    <button 
                      onClick={() => setIsHowItWorksOpen(true)} 
                      className="text-[#9B51E0] font-bold hover:underline hidden sm:block transition-all cursor-pointer"
                    >
                      How it works? {'>'}
                    </button>
                  </div>

                  {/* BOTTOM PROGRESS BOX */}
                  <div className="w-full bg-[#181C25] border border-white/5 rounded-3xl p-6 sm:p-8 flex flex-col gap-8">
                    <div className="flex flex-col md:flex-row justify-between gap-8 md:gap-16">
                      <div className="flex-1">
                        <div className="flex justify-between items-end mb-3">
                          <span className="text-sm font-medium text-[#8F95A3]">Today's Progress</span>
                        </div>
                        <div className="flex items-end gap-2 mb-4">
                          <span className="text-3xl font-black text-white leading-none">{formatPrice(displayEarnings, currency)}</span>
                          <span className="text-xl font-bold text-white leading-none mb-0.5">/ {formatPrice(targetAmount, currency)}</span>
                        </div>
                        <div className="w-full h-3 bg-[#121620] rounded-full overflow-hidden border border-white/5">
                          <motion.div 
                            initial={{ width: 0 }} animate={{ width: `${progressPercent}%` }} transition={{ duration: 1 }}
                            className="h-full bg-[#9B51E0] rounded-full"
                          />
                        </div>
                      </div>
                    </div>

                    <button 
                      disabled={!isMainButtonClaimable || claiming}
                      onClick={() => isMainButtonClaimable ? handleClaimAll() : null}
                      className={`w-full py-5 rounded-2xl font-black text-lg flex items-center justify-center gap-3 transition-all duration-300 shadow-xl ${
                        isMainButtonClaimable 
                          ? 'bg-[#3B82F6] hover:bg-[#2563EB] text-white shadow-[0_10px_30px_rgba(59,130,246,0.3)] cursor-pointer hover:-translate-y-1' 
                          : hasClaimedAny
                            ? 'bg-[#15192C] text-[#00E57A]/60 cursor-not-allowed border border-[#00E57A]/10 shadow-inner'
                            : 'bg-[#9B51E0]/20 text-[#9B51E0]/50 cursor-not-allowed border border-[#9B51E0]/10'
                      }`}
                    >
                      {claiming ? (
                        <Loader2 className="w-6 h-6 animate-spin" />
                      ) : (
                        <>
                          {isMainButtonClaimable ? <Gift className="w-6 h-6" /> : hasClaimedAny ? <CheckCircle2 className="w-6 h-6" /> : <Gift className="w-6 h-6" />}
                          {isMainButtonClaimable 
                            ? `Claim ${formatPrice(streakWallet > 0 ? streakWallet : totalClaimableAmount, currency)}` 
                            : hasClaimedAny
                              ? `Claimed ${formatPrice(totalClaimedAmount, currency)}`
                              : 'Complete tasks to Claim'}
                        </>
                      )}
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          )}

          {/* BONUS CODES TAB */}
          {activeTab === 'bonus_codes' && (
            <motion.div 
              key="bonus_codes"
              initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -15 }} transition={{ duration: 0.3 }}
              className="bg-[#121620] border border-white/5 rounded-[24px] p-8 md:p-16 shadow-2xl max-w-3xl mx-auto text-center"
            >
              <h2 className="text-[26px] font-black text-white mb-2">Have a Bonus Code?</h2>
              <p className="text-[#8F95A3] text-[15px] mb-10 font-medium">Follow our socials to get notified when we drop new bonus codes.</p>

              <div className="flex justify-center gap-4 mb-12">
                <a href="https://www.facebook.com/binnycash" target="_blank" rel="noreferrer" className="w-12 h-12 rounded-full bg-[#1877F2] flex items-center justify-center hover:scale-110 transition-transform shadow-lg">
                  <FacebookIcon />
                </a>
                <a href="https://www.instagram.com/binnycash_official/" target="_blank" rel="noreferrer" className="w-12 h-12 rounded-full bg-gradient-to-tr from-[#f9ce34] via-[#ee2a7b] to-[#6228d7] flex items-center justify-center hover:scale-110 transition-transform shadow-lg">
                  <InstagramIcon />
                </a>
                <a href="https://x.com/binnycash_com" target="_blank" rel="noreferrer" className="w-12 h-12 rounded-full bg-black border border-white/10 flex items-center justify-center hover:scale-110 transition-transform shadow-lg">
                  <XIcon />
                </a>
                <a href="https://discord.gg/KrwPb6V8a" target="_blank" rel="noreferrer" className="w-12 h-12 rounded-full bg-[#5865F2] flex items-center justify-center hover:scale-110 transition-transform shadow-lg">
                  <DiscordIcon />
                </a>
              </div>

              <form onSubmit={handleRedeemPromo} className="relative w-full max-w-xl mx-auto">
                <input 
                  type="text"
                  placeholder="Bonus code"
                  value={promoCode}
                  onChange={(e) => setPromoCode(e.target.value)}
                  className="w-full bg-[#1A1C24] border border-white/10 rounded-xl pl-5 pr-20 py-4 text-[15px] text-white focus:outline-none focus:border-[#9B51E0] transition-colors placeholder:text-[#5F6574]"
                />
                <button 
                  type="submit"
                  disabled={promoLoading || !promoCode.trim()}
                  className="absolute right-5 top-1/2 -translate-y-1/2 font-bold text-[15px] text-[#9B51E0] hover:text-[#b46af5] transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {promoLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Apply'}
                </button>
              </form>
              
              {promoMessage && (
                <div className="max-w-xl mx-auto mt-6">
                  <div className={`p-4 rounded-xl text-center text-sm font-bold ${promoMessage.type === 'success' ? 'bg-[#00E57A]/10 text-[#00E57A]' : 'bg-red-500/10 text-red-400'}`}>
                    {promoMessage.text}
                  </div>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <style dangerouslySetInnerHTML={{__html: `
        .hide-scroll::-webkit-scrollbar { display: none; }
        .hide-scroll { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  );
}