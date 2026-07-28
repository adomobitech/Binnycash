'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { 
  Zap, Lock, CheckCircle2, Clock, Send, 
  MessageCircle, ExternalLink, Loader2 
} from 'lucide-react';
import { useCurrency, formatPrice } from '@/hooks/useCurrency';

// Custom X (Twitter) Icon
const XIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
);

// Discord Icon
const DiscordIcon = () => (
  <svg viewBox="0 0 24 24" className="w-5 h-5 fill-current"><path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/></svg>
);

const InstagramIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-white">
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);

export default function RewardsPage() {
  const currency = useCurrency();
  const [loadingStreak, setLoadingStreak] = useState(true);
  const [streakData, setStreakData] = useState<any>(null);
  
  // Promo Code States
  const [promoCode, setPromoCode] = useState('');
  const [promoLoading, setPromoLoading] = useState(false);
  const [promoMessage, setPromoMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    fetchStreakData();
  }, []);

  const fetchStreakData = async () => {
    setLoadingStreak(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('https://apitest.binnycash.com/api/user/usergetStreakData', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const json = await res.json();
      if (json.code === 200 && json.data) {
        setStreakData(json.data);
      }
    } catch (err) {
      console.error("Failed to load streak data:", err);
    } finally {
      setLoadingStreak(false);
    }
  };

  const handleClaimStreak = async (dayItem: any) => {
    if (dayItem.status !== 'UNLOCKED') return;

    try {
      const token = localStorage.getItem('token');
      alert(`Claiming reward for Day ${dayItem.day}... API required here.`);
      fetchStreakData();
    } catch (err) {
      console.error("Failed to claim streak", err);
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

      const formData = new FormData();
      formData.append('code', promoCode);
      formData.append('deviceId', deviceId);

      const res = await fetch('https://apitest.binnycash.com/api/user/promoCode/promo/apply', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      const json = await res.json();

      if (res.ok || json.code === 200) {
        setPromoMessage({ text: 'Promo code applied successfully!', type: 'success' });
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

  const calculateProgress = () => {
    if (!streakData) return 0;
    const current = streakData.totalCycles || 0; 
    return Math.min(100, Math.max(0, current * 100)); 
  };

  return (
    <div className="min-h-screen bg-[#08070D] text-[#F5F3FF] font-sans relative overflow-x-hidden pb-16">
      <main className="max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
        
        <div className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-black text-white mb-2 tracking-tight">Bonus</h1>
          <p className="text-[#8D89A8] text-sm font-medium">Collect your daily rewards, claim promo codes, and win instant prizes.</p>
        </div>

        {/* DAILY STREAK */}
        <div className="bg-[#12101B] border border-white/5 rounded-3xl p-6 sm:p-8 mb-8 shadow-xl">
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#A855F7]/10 flex items-center justify-center border border-[#A855F7]/20">
                <Zap className="w-6 h-6 text-[#A855F7]" />
              </div>
              <h2 className="text-2xl font-black text-white">Daily Streak</h2>
            </div>
            
            <div className="flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-2 rounded-xl">
              <Clock className="w-4 h-4 text-[#8D89A8]" />
              {/* 🔥 RESET TIME MAPPED TO BACKEND DATA 🔥 */}
              <span className="text-sm font-bold text-[#8D89A8]">
                Streak resets in <span className="text-white">{streakData?.resetTime || '00:00:00'}</span> (UTC)
              </span>
            </div>
          </div>

          {loadingStreak ? (
            <div className="flex justify-center items-center py-20">
               <Loader2 className="w-8 h-8 text-[#A855F7] animate-spin" />
            </div>
          ) : (
            <div className="flex flex-col lg:flex-row gap-8 items-center">
              
              <div className="w-full lg:w-[350px] shrink-0">
                <p className="text-[#8D89A8] text-[13px] leading-relaxed mb-6 font-medium">
                  Each day you earn {formatPrice(1, currency)} or more, your streak continues and you unlock progressively higher rewards. If you fail to meet this requirement, your streak will reset.
                </p>
                
                <div className="bg-[#1A1725] rounded-2xl p-5 border border-white/5">
                  <div className="flex justify-between items-center mb-3">
                    <span className="text-xs font-bold text-white">Your progress ({formatPrice(0, currency)}-{formatPrice(1, currency)})</span>
                    <span className="text-xs font-bold text-[#8D89A8]">{calculateProgress()}%</span>
                  </div>
                  <div className="w-full h-2 bg-[#252132] rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }} animate={{ width: `${calculateProgress()}%` }} transition={{ duration: 1 }}
                      className="h-full bg-[#A855F7] rounded-full"
                    />
                  </div>
                </div>
              </div>

              <div className="flex-1 w-full overflow-x-auto custom-scrollbar pb-4 pt-2">
                <div className="flex items-center gap-3 min-w-max px-2">
                  {(streakData?.days || []).map((day: any, idx: number) => {
                    const isActive = day.status === 'ACTIVE'; 
                    const isUnlocked = day.status === 'UNLOCKED'; 
                    const isLocked = day.status === 'LOCKED'; 
                    
                    return (
                      <div 
                        key={idx}
                        onClick={() => handleClaimStreak(day)}
                        className={`w-[110px] h-[140px] shrink-0 rounded-2xl flex flex-col items-center justify-center p-3 transition-all duration-300 ${
                          isActive 
                            ? 'bg-[#18122B] border-2 border-[#A855F7] shadow-[0_0_20px_rgba(168,85,247,0.2)]' 
                            : isUnlocked 
                              ? 'bg-[#1A1725] border border-[#3DE8A0]/40 cursor-pointer hover:border-[#3DE8A0] hover:shadow-[0_0_15px_rgba(61,232,160,0.2)]'
                              : 'bg-[#1A1725] border border-white/5 opacity-60'
                        }`}
                      >
                        <span className={`text-[13px] font-bold mb-4 ${isActive ? 'text-white' : 'text-[#8D89A8]'}`}>
                          Day {day.day}
                        </span>
                        
                        <div className={`w-12 h-12 rounded-[14px] flex items-center justify-center mb-4 ${
                          isActive ? 'bg-[#A855F7]/20 border border-[#A855F7]/40' : 
                          isUnlocked ? 'bg-[#3DE8A0]/10 border border-[#3DE8A0]/30' :
                          'bg-white/5 border border-white/10'
                        }`}>
                          {isActive ? <Zap className="w-5 h-5 text-[#A855F7]" /> : 
                           isUnlocked ? <CheckCircle2 className="w-5 h-5 text-[#3DE8A0]" /> :
                           <Lock className="w-5 h-5 text-[#8D89A8]" />}
                        </div>

                        <div className="flex flex-col items-center">
                          <span className={`text-[15px] font-black leading-none mb-1 ${isActive || isUnlocked ? 'text-white' : 'text-[#8D89A8]'}`}>
                            {formatPrice(day.reward, currency)}
                          </span>
                          <span className={`text-[10px] font-bold uppercase tracking-wider ${isActive ? 'text-[#A855F7]' : isUnlocked ? 'text-[#3DE8A0]' : 'text-[#8D89A8]'}`}>
                            {day.status}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* PROMO CODE & SOCIALS */}
        <h2 className="text-2xl font-black text-white mb-6 tracking-tight">Social Quests</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-4 bg-[#12101B] border border-white/5 rounded-3xl p-8 flex flex-col items-center justify-center text-center shadow-lg">
            <h3 className="text-xl font-black text-white mb-2">Promo Code</h3>
            <p className="text-sm text-[#8D89A8] mb-8 font-medium">Found a secret code on social media? Enter it here.</p>
            
            <form onSubmit={handleRedeemPromo} className="w-full flex flex-col gap-4">
              <input 
                type="text"
                placeholder="ENTER CODE HERE"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                className="w-full bg-[#08070D] border border-white/10 rounded-xl px-5 py-4 text-sm text-white font-bold text-center uppercase tracking-wider focus:outline-none focus:border-[#A855F7] transition-colors placeholder:text-white/20"
              />
              
              <button 
                type="submit"
                disabled={promoLoading}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-[#A855F7] to-[#D946EF] text-white font-black text-sm uppercase tracking-wider hover:opacity-90 transition-opacity shadow-[0_0_20px_rgba(168,85,247,0.3)] disabled:opacity-50"
              >
                {promoLoading ? <Loader2 className="w-5 h-5 mx-auto animate-spin" /> : 'Redeem Code'}
              </button>
            </form>

            {promoMessage && (
              <p className={`mt-4 text-xs font-bold ${promoMessage.type === 'success' ? 'text-[#3DE8A0]' : 'text-red-400'}`}>
                {promoMessage.text}
              </p>
            )}

            <Link href="/support" className="mt-6 text-[#8D89A8] text-xs font-medium hover:text-[#A855F7] transition-colors">
              Need help?? <span className="text-[#A855F7]">Contact support</span>
            </Link>
          </div>

          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-[#12101B] border border-white/5 rounded-2xl p-6 flex flex-col justify-between hover:bg-[#161421] transition-colors">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                    <InstagramIcon />
                  </div>
                  <h4 className="text-white font-bold text-base">Instagram</h4>
                </div>
                <p className="text-[#8D89A8] text-sm font-medium mb-6">Stay updated with the latest drops and instagram post.</p>
              </div>
              <a href="https://instagram.com/binnycash" target="_blank" rel="noreferrer" className="w-full py-3 rounded-xl bg-[#1A1725] hover:bg-white/10 text-white font-bold text-sm text-center transition-colors">
                Follow Now
              </a>
            </div>

            <div className="bg-[#12101B] border border-white/5 rounded-2xl p-6 flex flex-col justify-between hover:bg-[#161421] transition-colors">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                    <XIcon />
                  </div>
                  <h4 className="text-white font-bold text-base">Follow on X</h4>
                </div>
                <p className="text-[#8D89A8] text-sm font-medium mb-6">Stay updated with the latest drops and community news.</p>
              </div>
              <a href="https://twitter.com/binnycash" target="_blank" rel="noreferrer" className="w-full py-3 rounded-xl bg-[#1A1725] hover:bg-white/10 text-white font-bold text-sm text-center transition-colors">
                Follow Now
              </a>
            </div>

            <div className="bg-[#12101B] border border-white/5 rounded-2xl p-6 flex flex-col justify-between hover:bg-[#161421] transition-colors">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                    <DiscordIcon />
                  </div>
                  <h4 className="text-white font-bold text-base">Join Discord</h4>
                </div>
                <p className="text-[#8D89A8] text-sm font-medium mb-6">Connect with fellow looters and join exclusive giveaways.</p>
              </div>
              <a href="https://discord.gg/binnycash" target="_blank" rel="noreferrer" className="w-full py-3 rounded-xl bg-[#1A1725] hover:bg-white/10 text-white font-bold text-sm text-center transition-colors">
                Join Server
              </a>
            </div>

            <div className="bg-[#12101B] border border-white/5 rounded-2xl p-6 flex flex-col justify-between hover:bg-[#161421] transition-colors">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                    <Send className="w-4 h-4 text-white" />
                  </div>
                  <h4 className="text-white font-bold text-base">Telegram</h4>
                </div>
                <p className="text-[#8D89A8] text-sm font-medium mb-6">Never miss an update. Instant notifications for all loot boxes.</p>
              </div>
              <a href="https://t.me/binnycash" target="_blank" rel="noreferrer" className="w-full py-3 rounded-xl bg-[#1A1725] hover:bg-white/10 text-white font-bold text-sm text-center transition-colors">
                Subscribe
              </a>
            </div>
          </div>
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