'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Zap, Lock, CheckCircle2, Loader2, Gift, AlertCircle, Percent
} from 'lucide-react';
import { useCurrency, formatPrice } from '@/hooks/useCurrency';

// --- CUSTOM ICONS ---
const XIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-white"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
);

const DiscordIcon = () => (
  <svg viewBox="0 0 24 24" className="w-6 h-6 fill-[#5865F2]"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>
);

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="url(#ig-grad)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6">
    <defs>
      <linearGradient id="ig-grad" x1="2" y1="2" x2="22" y2="22">
        <stop offset="0%" stopColor="#f9ce34" />
        <stop offset="50%" stopColor="#ee2a7b" />
        <stop offset="100%" stopColor="#6228d7" />
      </linearGradient>
    </defs>
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

const LinkedInIcon = () => (
  <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-[#0A66C2]">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);
// ---------------------------------------------------------------

export default function RewardsPage() {
  const currency = useCurrency();
  const isCoin = currency === 'Coin' || currency === 'COIN';
  
  const [loadingStreak, setLoadingStreak] = useState(true);
  const [streakData, setStreakData] = useState<any>(null);

  // Sirf aaj ki earning ki state
  const [todayEarnings, setTodayEarnings] = useState(0);

  // Claim Reward States
  const [claimingDay, setClaimingDay] = useState<number | null>(null);
  const [claimedDays, setClaimedDays] = useState<number[]>([]);
  const [claimError, setClaimError] = useState<string | null>(null);
  const [claimSuccess, setClaimSuccess] = useState<string | null>(null);
  
  // Promo Code States
  const [promoCode, setPromoCode] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoMessage, setPromoMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

  // Progress Bar Variables -> Strictly relies on todayEarnings
  const targetAmount = isCoin ? 1000 : 1; 
  const currentProgressEarnings = todayEarnings; 
  const isProgressComplete = currentProgressEarnings >= targetAmount;

  const calculateProgress = () => {
    return Math.min(100, Math.max(0, (currentProgressEarnings / targetAmount) * 100)); 
  };
  const progressPercent = calculateProgress().toFixed(0);

  useEffect(() => {
    fetchAllData();
  }, []);

  const fetchAllData = async () => {
    setLoadingStreak(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };
      const cacheBust = `?t=${Date.now()}`;

      // Sirf 2 zaroori API calls
      const [resToday, resStreak] = await Promise.all([
        fetch(`https://apitest.binnycash.com/api/user/wallet/today-earning${cacheBust}`, { method: 'GET', headers, cache: 'no-store' }),
        fetch(`https://apitest.binnycash.com/api/user/userDailyStreak${cacheBust}`, { method: 'GET', headers, cache: 'no-store' })
      ]);

      const [jsonToday, jsonStreak] = await Promise.all([
        resToday.json().catch(() => ({})),
        resStreak.json().catch(() => ({}))
      ]);

      // 1. Today Earning (For Progress Bar)
      if (jsonToday.code === 200) {
        let tEarning = 0;
        if (typeof jsonToday.data === 'number') tEarning = jsonToday.data;
        else if (typeof jsonToday.data === 'string') tEarning = Number(jsonToday.data) || 0;
        else if (typeof jsonToday.data === 'object' && jsonToday.data !== null) {
          tEarning = Number(jsonToday.data.totalAmount || jsonToday.data.todayEarning || jsonToday.data.amount || jsonToday.data.total || 0);
        }
        setTodayEarnings(tEarning);
      }

      // 2. Streak Data
      if (jsonStreak.code === 200 && jsonStreak.data) {
        setStreakData(jsonStreak.data);
      }

    } catch (err) {
      console.error("Failed to load page data:", err);
    } finally {
      setLoadingStreak(false);
    }
  };

  const handleClaimStreak = async (dayItem: any) => {
    // Ye function ab call hi nahi hoga agar status 'CLAIM' ya 'UNLOCKED' nahi hai
    if (claimingDay !== null) return;

    setClaimError(null);
    setClaimSuccess(null);
    setClaimingDay(dayItem.day);

    try {
      const token = localStorage.getItem('token');
      
      // Withdraw API as URLSearchParams (Standard for PUT requests without JSON headers)
      const payload = new URLSearchParams();
      payload.append('day', String(dayItem.day));

      const res = await fetch('https://apitest.binnycash.com/api/user/withdrawReward', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: payload
      });

      const json = await res.json();

      if (res.ok && (json.code === 200 || json.type === 'success')) {
        setClaimedDays(prev => [...prev, dayItem.day]);
        setClaimSuccess(json.message || `Day ${dayItem.day} reward claimed successfully!`);
        await fetchAllData(); 
      } else {
        setClaimError(json.message || 'Reward configuration not found or already claimed.');
      }
    } catch (err) {
      console.error("Failed to claim streak", err);
      setClaimError('Something went wrong. Please try again.');
    } finally {
      setClaimingDay(null);
      setTimeout(() => {
        setClaimError(null);
        setClaimSuccess(null);
      }, 5000);
    }
  };

  const handleRedeemPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!promoCode.trim()) return;

    setPromoLoading(true);
    setPromoMessage(null);

    try {
      const token = localStorage.getItem('token');
      const deviceId = localStorage.getItem('deviceId') || 'web-browser-device'; 

      // Promo Code API as clean JSON body POST request
      const res = await fetch('https://apitest.binnycash.com/api/user/promoCode/promo/apply', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ code: promoCode, deviceId })
      });

      const json = await res.json();

      if (res.ok || json.code === 200) {
        setPromoMessage({ text: json.message || 'Promo code applied successfully!', type: 'success' });
        setPromoCode('');
      } else {
        setPromoMessage({ text: json.message || 'Invalid or ineligible promo code.', type: 'error' });
      }
    } catch (error) {
      console.error("Promo code error:", error);
      setPromoMessage({ text: 'Something went wrong. Please try again.', type: 'error' });
    } finally {
      setPromoLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#08070D] text-[#F5F3FF] font-sans relative overflow-x-hidden pb-16">
      <main className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
        
        {/* TOP HEADER SECTION (Clean, NO reward/balance cards) */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-10">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#A855F7]/10 border border-[#A855F7]/30 flex items-center justify-center shrink-0 mt-1">
              <Gift className="w-6 h-6 text-[#A855F7]" />
            </div>
            <div>
              <h1 className="text-3xl sm:text-4xl font-black text-white mb-1 tracking-tight">Rewards</h1>
              <p className="text-[#8D89A8] text-sm font-medium">Collect daily rewards, use promo codes and follow our social channels to earn more!</p>
            </div>
          </div>
        </div>

        {/* DAILY STREAK SECTION */}
        <div className="bg-[#12101B] border border-white/5 rounded-3xl p-6 sm:p-8 mb-8 shadow-xl">
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#F59E0B]/10 flex items-center justify-center border border-[#F59E0B]/20">
                <Zap className="w-5 h-5 text-[#F59E0B]" />
              </div>
              <div>
                <h2 className="text-xl font-black text-white">Daily Streak</h2>
              </div>
            </div>
          </div>

          {loadingStreak ? (
            <div className="flex justify-center items-center py-20">
               <Loader2 className="w-8 h-8 text-[#A855F7] animate-spin" />
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row gap-8 items-start">
              
              {/* LEFT SIDE: Text and Progress Box */}
              <div className="w-full lg:w-[380px] shrink-0 pr-0 lg:pr-4">
                <p className="text-[#8D89A8] text-sm leading-relaxed mb-6">
                  Each day you earn {formatPrice(targetAmount, currency)} or more, your streak continues and you unlock progressively higher rewards. If you fail to meet this requirement, your streak will reset.
                </p>

                <div className="bg-[#1A1C24] border border-white/5 rounded-2xl p-5">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-sm font-medium text-white/80">
                      Your progress ({formatPrice(currentProgressEarnings, currency)}-{formatPrice(targetAmount, currency)})
                    </span>
                    <span className="text-sm font-medium text-white/80">{progressPercent}%</span>
                  </div>
                  <div className="w-full h-2.5 bg-[#08070D] rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }} 
                      animate={{ width: `${progressPercent}%` }} 
                      transition={{ duration: 1, ease: "easeOut" }}
                      className="h-full bg-[#A855F7] rounded-full"
                    />
                  </div>
                </div>
              </div>

              {/* RIGHT SIDE: Scrollable Days Row */}
              <div className="flex-1 w-full overflow-x-auto custom-scrollbar pb-4 pt-1">
                <div className="flex items-center gap-3 min-w-max px-1">
                  {(streakData?.days || []).map((day: any, idx: number) => {
                    const topDay = streakData?.day || 1;
                    const topStatus = String(streakData?.status || '').toUpperCase();
                    const isToday = day.day === topDay;

                    // Resolve display status dynamically
                    let displayStatus = 'LOCKED';
                    if (day.day < topDay) {
                      displayStatus = 'CLAIMED';
                    } else if (isToday) {
                      if (topStatus === 'ACTIVE') {
                        displayStatus = isProgressComplete ? 'CLAIM' : 'ACTIVE';
                      } else {
                        displayStatus = topStatus;
                      }
                    } else {
                      displayStatus = 'LOCKED';
                    }

                    if (claimedDays.includes(day.day)) {
                      displayStatus = 'CLAIMED';
                    }

                    const isClaimed = displayStatus === 'CLAIMED';
                    const isClaimable = displayStatus === 'CLAIM' || displayStatus === 'UNLOCKED';
                    const isActive = displayStatus === 'ACTIVE';
                    
                    const isClaiming = claimingDay === day.day;
                    
                    // Clickable ONLY if it is explicitly Claimable
                    const isClickable = isClaimable && claimingDay === null; 

                    // STYLING: 'Active' now has 'cursor-default' and no hover effects
                    const cardClass = isClaimed
                      ? 'bg-[#0E281F] border border-[#3DE8A0]/30 opacity-60 cursor-default'
                      : isClaimable
                        ? 'bg-[#18122B] border border-[#A855F7] shadow-[0_0_15px_rgba(168,85,247,0.25)] cursor-pointer hover:scale-105 hover:border-[#B46AFA]'
                        : isActive
                          ? 'bg-[#18122B] border border-[#A855F7] shadow-[0_0_20px_rgba(168,85,247,0.1)] cursor-default'
                          : 'bg-[#12101B] border border-transparent cursor-default opacity-80';

                    // SQUARE ICON BOX
                    const iconBoxClass = isClaimed 
                      ? 'bg-[#3DE8A0]/20 text-[#3DE8A0]'
                      : (isClaimable || isActive)
                        ? 'bg-[#A855F7]/10 border border-[#A855F7]/30 text-[#A855F7]'
                        : 'bg-[#242731] text-[#4B4E5A] border border-white/5';

                    // Bottom Text
                    let bottomContent;
                    if (isClaimable) {
                       bottomContent = (
                         <span className="w-full py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider text-center bg-[#A855F7] text-white shadow-sm mt-1 transition-all">
                           Claim
                         </span>
                       );
                    } else if (isClaimed) {
                       bottomContent = <span className="text-xs font-semibold text-[#3DE8A0] mt-1">Claimed</span>;
                    } else if (isActive) {
                       bottomContent = <span className="text-xs font-semibold text-white mt-1">Active</span>;
                    } else {
                       bottomContent = <span className="text-xs font-semibold text-[#8D89A8] mt-1">Locked</span>;
                    }

                    return (
                      <div 
                        key={idx}
                        // Only trigger onClick if strictly claimable
                        onClick={isClickable ? () => handleClaimStreak(day) : undefined}
                        className={`relative w-[110px] h-[160px] shrink-0 rounded-2xl flex flex-col items-center justify-between p-4 transition-all duration-300 ${cardClass}`}
                      >
                        {isClaiming && (
                          <div className="absolute inset-0 rounded-2xl bg-[#08070D]/70 flex items-center justify-center z-10">
                            <Loader2 className="w-6 h-6 text-[#A855F7] animate-spin" />
                          </div>
                        )}

                        <span className={`text-sm font-semibold ${isClaimed || isClaimable || isActive ? 'text-white' : 'text-[#8D89A8]'}`}>
                          Day {day.day}
                        </span>
                        
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${iconBoxClass}`}>
                          {isClaimed ? <CheckCircle2 className="w-6 h-6 text-[#3DE8A0]" /> :
                           (isClaimable || isActive) ? <Zap className="w-5 h-5 fill-current" /> :
                           <Lock className="w-4 h-4 fill-current" />}
                        </div>

                        <div className="flex flex-col items-center w-full">
                          <span className={`text-lg font-bold ${isClaimed || isClaimable || isActive ? 'text-white' : 'text-[#8D89A8]'}`}>
                            {formatPrice(day.reward, currency)}
                          </span>
                          {bottomContent}
                        </div>
                      </div>
                    );
                  })}
                  
                </div>
              </div>
            </div>
          )}

          {/* Error / Success Toast Messages */}
          <AnimatePresence>
            {claimError && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="mt-6 p-4 rounded-2xl flex items-start gap-3 bg-[#3F1626] border border-[#7C1F3D] text-[#FF6B6B] shadow-sm w-fit"
              >
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <div className="flex flex-col pr-4">
                  <span className="text-sm font-bold text-white mb-1">Action Denied</span>
                  <span className="text-xs font-medium">{claimError}</span>
                </div>
              </motion.div>
            )}

            {claimSuccess && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                className="mt-6 p-4 rounded-2xl flex items-start gap-3 bg-[#3DE8A0]/10 border border-[#3DE8A0]/20 text-[#3DE8A0] shadow-sm w-fit"
              >
                <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                <div className="flex flex-col pr-4">
                  <span className="text-sm font-bold text-[#3DE8A0]">Success</span>
                  <span className="text-xs font-medium mt-0.5">{claimSuccess}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* PROMO CODE SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-10">
          <div className="lg:col-span-8 bg-[#12101B] border border-white/5 rounded-3xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-lg">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#A855F7]/10 border border-[#A855F7]/30 flex items-center justify-center shrink-0 mt-1">
                <Gift className="w-6 h-6 text-[#A855F7]" />
              </div>
              <div>
                <h3 className="text-xl font-black text-white mb-1">Promo Code</h3>
                <p className="text-[#8D89A8] text-xs font-medium">Have a promo code? Redeem it now!</p>
              </div>
            </div>

            <form onSubmit={handleRedeemPromo} className="w-full sm:w-auto flex flex-col sm:flex-row gap-3">
              <input 
                type="text"
                placeholder="Enter promo code here"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                className="bg-[#08070D] border border-white/10 rounded-2xl px-5 py-3.5 text-sm text-white font-medium focus:outline-none focus:border-[#A855F7] transition-colors placeholder:text-white/30 sm:w-[260px]"
              />
              <button 
                type="submit"
                disabled={promoLoading}
                className="py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#7C3AED] to-[#A855F7] text-white font-bold text-sm tracking-wide hover:opacity-90 transition-opacity shadow-[0_0_20px_rgba(168,85,247,0.3)] disabled:opacity-50 shrink-0"
              >
                {promoLoading ? <Loader2 className="w-5 h-5 mx-auto animate-spin" /> : 'Redeem Code'}
              </button>
            </form>
          </div>

          <div className="lg:col-span-4 bg-[#12101B] border border-white/5 rounded-3xl p-6 sm:p-8 flex items-center justify-between gap-4 shadow-lg">
            <div>
              <span className="text-white font-bold text-sm block mb-1">New Code?</span>
              <p className="text-[#8D89A8] text-xs leading-relaxed">Follow our social channels to get the latest promo codes!</p>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-[#A855F7]/10 border border-[#A855F7]/30 flex items-center justify-center shrink-0">
              <Percent className="w-6 h-6 text-[#A855F7]" />
            </div>
          </div>
        </div>

        {promoMessage && (
          <div className={`mb-8 p-4 rounded-2xl text-center text-xs font-bold ${promoMessage.type === 'success' ? 'bg-[#3DE8A0]/10 text-[#3DE8A0]' : 'bg-red-500/10 text-red-400'}`}>
            {promoMessage.text}
          </div>
        )}

        {/* SOCIAL MEDIA REWARDS SECTION */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-[#A855F7]/10 flex items-center justify-center border border-[#A855F7]/20">
              <Gift className="w-5 h-5 text-[#A855F7]" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white tracking-tight">Social Media Rewards</h2>
              <p className="text-[#8D89A8] text-xs font-medium mt-0.5">Follow our social channels and earn rewards instantly!</p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Instagram */}
            <div className="bg-[#12101B] border border-white/5 rounded-2xl p-5 flex flex-col justify-between hover:border-white/10 transition-colors">
              <div className="mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#1A1C24] border border-white/5 flex items-center justify-center shrink-0">
                    <InstagramIcon />
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-sm">Instagram</h4>
                    <p className="text-[#8D89A8] text-[11px]">Follow us on Instagram</p>
                  </div>
                </div>
              </div>
              <a href="https://www.instagram.com/binnycash_official/" target="_blank" rel="noreferrer" className="block w-full py-2.5 rounded-xl bg-gradient-to-r from-[#EC4899] to-[#8B5CF6] hover:opacity-90 text-white font-bold text-xs text-center transition-opacity shadow-sm">
                Follow
              </a>
            </div>

            {/* Follow on X */}
            <div className="bg-[#12101B] border border-white/5 rounded-2xl p-5 flex flex-col justify-between hover:border-white/10 transition-colors">
              <div className="mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#1A1C24] border border-white/5 flex items-center justify-center shrink-0">
                    <XIcon />
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-sm">Follow on X</h4>
                    <p className="text-[#8D89A8] text-[11px]">Follow us on X (Twitter)</p>
                  </div>
                </div>
              </div>
              <a href="https://x.com/binnycash_com" target="_blank" rel="noreferrer" className="block w-full py-2.5 rounded-xl bg-[#1A1C24] hover:bg-white/5 border border-white/10 text-white font-bold text-xs text-center transition-colors">
                Follow
              </a>
            </div>

            {/* Join Discord */}
            <div className="bg-[#12101B] border border-white/5 rounded-2xl p-5 flex flex-col justify-between hover:border-white/10 transition-colors">
              <div className="mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#1A1C24] border border-white/5 flex items-center justify-center shrink-0">
                    <DiscordIcon />
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-sm">Join Discord</h4>
                    <p className="text-[#8D89A8] text-[11px]">Join our Discord server</p>
                  </div>
                </div>
              </div>
              <a href="https://discord.gg/KrwPb6V8a" target="_blank" rel="noreferrer" className="block w-full py-2.5 rounded-xl bg-[#5865F2] hover:bg-[#4752C4] text-white font-bold text-xs text-center transition-colors shadow-sm">
                Join
              </a>
            </div>

            {/* LinkedIn */}
            <div className="bg-[#12101B] border border-white/5 rounded-2xl p-5 flex flex-col justify-between hover:border-white/10 transition-colors">
              <div className="mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#1A1C24] border border-white/5 flex items-center justify-center shrink-0">
                    <LinkedInIcon />
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-sm">LinkedIn</h4>
                    <p className="text-[#8D89A8] text-[11px]">Follow us on LinkedIn</p>
                  </div>
                </div>
              </div>
              <a href="https://www.linkedin.com/company/binnycash/" target="_blank" rel="noreferrer" className="block w-full py-2.5 rounded-xl bg-[#0A66C2] hover:bg-[#004182] text-white font-bold text-xs text-center transition-colors shadow-sm">
                Follow
              </a>
            </div>

          </div>
        </div>

        {/* Footer info note */}
        <div className="flex items-center gap-2.5 text-[#8D89A8] text-xs font-medium px-1">
          <AlertCircle className="w-4 h-4 shrink-0 text-[#A855F7]" />
          <span>Rewards will be added to your balance within 5-10 minutes after completing the action.</span>
        </div>

        <style dangerouslySetInnerHTML={{__html: `
          .custom-scrollbar::-webkit-scrollbar { height: 6px; }
          .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
          .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(168, 85, 247, 0.4); border-radius: 10px; }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(168, 85, 247, 0.8); }
        `}} />
      </main>
    </div>
  );
}