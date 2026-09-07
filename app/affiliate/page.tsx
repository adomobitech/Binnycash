'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Copy, Users, Clock, Wallet, CheckCircle2, ChevronRight, 
  Info, Loader2, Award, Shield, Share2, DollarSign, TrendingUp, 
  ChevronDown, Trophy, Medal, Crown, Star, Play
} from 'lucide-react';
import { useCurrency, formatPrice } from '@/hooks/useCurrency';
import Link from 'next/link';

// --- CUSTOM SOCIAL ICONS ---
const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" /></svg>
);
const TelegramIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M20.665 3.717l-17.73 6.837c-1.21.486-1.203 1.161-.222 1.509l4.552 1.42 10.532-6.645c.498-.303.953-.139.579.192l-8.533 7.701h-.002l.002.001-.314 4.692c.46 0 .663-.211.921-.46l2.211-2.15 4.599 3.397c.848.467 1.457.227 1.668-.785l3.019-14.228c.309-1.239-.473-1.8-1.282-1.481z" /></svg>
);
const FacebookIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
);
const XIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.008 4.15H5.078z"/></svg>
);
const LinkIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" /><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" /></svg>
);

const Sparkline = ({ color }: { color: string }) => (
  <svg className="w-20 h-8 opacity-50" viewBox="0 0 100 20" preserveAspectRatio="none">
    <path d="M0 15 Q 20 5 40 10 T 80 15 T 100 5" stroke={color} strokeWidth="2" fill="none" />
  </svg>
);

function AnimatedValue({ value }: { value: string | number }) {
  const [display, setDisplay] = useState(value);
  const prevRef = React.useRef<string | number>(value);

  useEffect(() => {
    const raw = String(value);
    const numeric = Number(String(value).replace(/[^0-9.-]/g, ''));
    const prevRaw = String(prevRef.current);
    const prevNumeric = Number(prevRaw.replace(/[^0-9.-]/g, ''));

    if (isNaN(numeric) || isNaN(prevNumeric) || raw === prevRaw) {
      setDisplay(value);
      prevRef.current = value;
      return;
    }

    const prefix = raw.replace(/[0-9.,-]+.*$/, '');
    const suffix = raw.slice(prefix.length).replace(/^[0-9.,-]+/, '');
    const isDecimal = raw.includes('.');

    let frame = 0;
    const totalFrames = 20;
    const start = prevNumeric;
    const end = numeric;

    const tick = () => {
      frame++;
      const progress = 1 - Math.pow(1 - frame / totalFrames, 3);
      const current = start + (end - start) * progress;
      const formatted = isDecimal ? current.toFixed(2) : Math.round(current).toLocaleString();
      setDisplay(`${prefix}${formatted}${suffix}`);
      if (frame < totalFrames) requestAnimationFrame(tick);
      else { setDisplay(value); prevRef.current = value; }
    };
    requestAnimationFrame(tick);
  }, [value]);

  return <>{display}</>;
}

function getUserId(): string {
  if (typeof window === 'undefined') return '';
  try {
    const directId = localStorage.getItem('userId') || localStorage.getItem('user_id') || localStorage.getItem('id');
    if (directId) return String(directId);
    const userDetailsStr = localStorage.getItem('userDetails') || localStorage.getItem('user');
    if (userDetailsStr) {
      const parsed = JSON.parse(userDetailsStr);
      return String(parsed?.id || parsed?._id || parsed?.userId || '');
    }
  } catch {}
  return '';
}

export default function AffiliatePage() {
  const currency = useCurrency();

  const [dashboardData, setDashboardData] = useState<any>({
    totalRefer: 0,
    totalReferEarning: 0,
    last30DaysEarning: 0,
    totalPendingAmount: 0
  });
  
  const [referralLink, setReferralLink] = useState('https://www.binnycash.com/?ref=...');
  const [tierData, setTierData] = useState<any>({ currentTier: 1, currentReferralEarning: 0, levels: [] });

  const [copied, setCopied] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [withdrawMessage, setWithdrawMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // FAQ State
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);

  const minPayout = 5.00;
  const availableBalance = Number(dashboardData?.totalReferEarning || 0) - Number(dashboardData?.totalPendingAmount || 0); 
  const withdrawProgress = Math.min(100, (availableBalance / minPayout) * 100);

  // FAQ Data
  const faqs = [
    { q: 'How do I earn affiliate commission?', a: 'You earn commission when your referred friends complete offers, surveys, or other eligible activities on the platform. The higher your level, the more commission percentage you earn.' },
    { q: 'When will my commission be credited?', a: 'Commissions are usually credited instantly to your available balance as soon as your referral successfully completes an earning activity.' },
    { q: 'What happens if a referral is reversed?', a: 'If a referral\'s earnings are reversed due to fraud or chargebacks by the offerwall, the corresponding commission will also be deducted from your balance.' },
    { q: 'When can I withdraw my earnings?', a: `You can request a withdrawal as soon as your available affiliate balance reaches the minimum payout threshold of ${formatPrice(minPayout, currency)}.` }
  ];

  useEffect(() => {
    const fetchAffiliateData = async () => {
      const token = localStorage.getItem('token') || '';
      const userId = getUserId();

      // 1. Fetch Affiliate Overview 
      try {
        const res = await fetch(`https://api.binnycash.com/api/user/affiliate_overview`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const json = await res.json().catch(() => null);
        if (json?.code === 200 && json?.data) {
          setDashboardData(json.data);
        }
      } catch (err) {
        console.error("Overview error:", err);
      }

      // 2. Fetch User Details for Referral URL
      try {
        const userEndpoint = userId 
          ? `https://api.binnycash.com/api/user/userDetails?userId=${userId}`
          : `https://api.binnycash.com/api/user/userDetails`;

        const res = await fetch(userEndpoint, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const json = await res.json().catch(() => null);
        const userObj = json?.data?.user || json?.data || json;

        if (userObj?.referralUrl) {
          setReferralLink(userObj.referralUrl);
        } else if (userObj?.referralCode) {
          setReferralLink(`https://www.binnycash.com/?ref=${userObj.referralCode}`);
        }
      } catch (err) {
        console.error("User details error:", err);
      }

      // 3. Fetch Levels
      try {
        const res = await fetch(`https://api.binnycash.com/api/user/affiliateTierLevel`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const json = await res.json().catch(() => null);
        if (json) {
          const payload = json.data || json;
          const levels = payload.levels || json.levels || [];
          setTierData({
            currentTier: payload.currentTier || json.currentTier || 1,
            currentReferralEarning: payload.currentReferralEarning || json.currentReferralEarning || 0,
            levels: Array.isArray(levels) ? levels : []
          });
        }
      } catch (err) {
        console.error("Tier level error:", err);
      }

      // Background auto claim
      fetch(`https://api.binnycash.com/api/user/autoCliam`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      }).catch(() => {});
    };

    fetchAffiliateData();
  }, []);

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNativeShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: 'Join BinnyCash!',
          text: 'Sign up using my referral link and start earning rewards today.',
          url: referralLink,
        });
      } catch (err) {
        console.log('Share cancelled or failed', err);
      }
    } else {
      handleCopy();
      alert('Link copied to clipboard! Paste it anywhere to share.');
    }
  };

  const handleWithdrawClick = async () => {
    if (availableBalance < minPayout) {
      setWithdrawMessage({ text: `Minimum payout is ${formatPrice(minPayout, currency)}`, type: 'error' });
      setTimeout(() => setWithdrawMessage(null), 3000);
      return;
    }

    setIsWithdrawing(true);
    setWithdrawMessage(null);
    const token = localStorage.getItem('token') || '';

    try {
      const res = await fetch(`https://api.binnycash.com/api/user/withdraw/claim-refer-earning`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
      });
      const json = await res.json();
      
      if (res.ok || json.code === 200 || json.type === 'success') {
        setWithdrawMessage({ text: json.message || 'Withdrawal requested successfully!', type: 'success' });
      } else {
        setWithdrawMessage({ text: json.message || 'Failed to process withdrawal.', type: 'error' });
      }
    } catch (err) {
      setWithdrawMessage({ text: 'Network error. Please try again.', type: 'error' });
    } finally {
      setIsWithdrawing(false);
      setTimeout(() => setWithdrawMessage(null), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-[#0E1015] text-[#F5F3FF] pb-12 font-sans">
      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-5">
        
        {/* ========================================== */}
        {/* HERO BANNER SECTION */}
        {/* ========================================== */}
        <div className="w-full bg-[#12141D] border border-white/5 rounded-3xl overflow-hidden relative flex flex-col md:flex-row justify-between items-center shadow-lg">
          <div className="absolute inset-0 bg-gradient-to-r from-[#12141D] via-[#12141D] to-[#2E185A]/40 pointer-events-none" />
          
          <div className="p-8 md:p-10 relative z-10 w-full md:w-[60%]">
            <span className="text-[10px] font-bold text-[#00E57A] tracking-widest uppercase mb-3 block">Affiliate Program</span>
            <h1 className="text-4xl md:text-5xl font-black text-white leading-tight mb-3">
              Refer Friends. <span className="text-[#A855F7]">Earn More.</span>
            </h1>
            <p className="text-gray-400 text-sm mb-8 max-w-md">
              Invite friends to BinnyCash and earn commission on their activity. The more you refer, the higher your commission level.
            </p>
            
            <div className="flex flex-wrap gap-4 mb-10">
              <button onClick={handleCopy} className="bg-gradient-to-r from-[#8B5CF6] to-[#A855F7] hover:from-[#7C3AED] hover:to-[#8B5CF6] text-white px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-all shadow-[0_0_20px_rgba(139,92,246,0.3)] cursor-pointer">
                {copied ? <CheckCircle2 className="w-4 h-4" /> : <LinkIcon className="w-4 h-4" />}
                {copied ? 'Copied!' : 'Copy Referral Link'}
              </button>
              <button onClick={handleNativeShare} className="bg-white/5 hover:bg-white/10 border border-white/10 text-white px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-all cursor-pointer">
                <Share2 className="w-4 h-4" /> Share Now
              </button>
            </div>

            <div className="flex items-center gap-4 text-xs font-bold text-gray-400">
               <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-blue-500/10 text-blue-400 flex items-center justify-center"><Users className="w-5 h-5"/></div>
                  <span className="text-center">Invite<br/>Your Friends</span>
               </div>
               <ChevronRight className="w-4 h-4 text-gray-600 mb-6" />
               <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-purple-500/10 text-purple-400 flex items-center justify-center"><Play className="w-5 h-5"/></div>
                  <span className="text-center">They Sign Up<br/>and Play</span>
               </div>
               <ChevronRight className="w-4 h-4 text-gray-600 mb-6" />
               <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center"><DollarSign className="w-5 h-5"/></div>
                  <span className="text-center">You Earn<br/>Commission</span>
               </div>
               <ChevronRight className="w-4 h-4 text-gray-600 mb-6" />
               <div className="flex flex-col items-center gap-2">
                  <div className="w-10 h-10 rounded-full bg-yellow-500/10 text-yellow-400 flex items-center justify-center"><Crown className="w-5 h-5"/></div>
                  <span className="text-center">Unlock Higher<br/>Levels</span>
               </div>
            </div>
          </div>

          <div className="hidden md:flex relative z-10 w-[40%] h-full justify-end items-center pr-10">
             <div className="relative">
                <div className="absolute inset-0 bg-[#A855F7]/30 blur-[60px] rounded-full" />
                <img src="/logo.png" alt="Rewards" className="w-64 h-auto object-contain relative z-10 drop-shadow-[0_0_30px_rgba(168,85,247,0.4)]" />
                <div className="absolute -top-10 -left-10 text-white font-handwriting text-2xl rotate-[-10deg]">More Friends<br/>More Rewards!</div>
             </div>
          </div>
        </div>

        {/* ========================================== */}
        {/* 4 STAT CARDS ROW */}
        {/* ========================================== */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-[#12141D] border border-white/5 rounded-2xl p-5 flex items-center justify-between shadow-md hover:border-white/10 transition-colors">
             <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                   <Users className="w-6 h-6 text-blue-400" />
                </div>
                <div className="flex flex-col">
                   <span className="text-2xl font-black text-white"><AnimatedValue value={dashboardData.totalRefer || 0} /></span>
                   <span className="text-xs text-gray-500 font-medium">Total Referrals</span>
                </div>
             </div>
          </div>

          <div className="bg-[#12141D] border border-white/5 rounded-2xl p-5 flex items-center justify-between shadow-md hover:border-white/10 transition-colors relative overflow-hidden">
             <div className="flex items-center gap-4 relative z-10">
                <div className="w-12 h-12 rounded-xl bg-yellow-500/10 flex items-center justify-center border border-yellow-500/20">
                   <DollarSign className="w-6 h-6 text-yellow-400" />
                </div>
                <div className="flex flex-col">
                   <span className="text-2xl font-black text-white"><AnimatedValue value={formatPrice(dashboardData.totalReferEarning || 0, currency)} /></span>
                   <span className="text-xs text-gray-500 font-medium">Total Earnings</span>
                </div>
             </div>
             <div className="absolute right-0 bottom-0"><Sparkline color="#FBBF24" /></div>
          </div>

          <div className="bg-[#12141D] border border-white/5 rounded-2xl p-5 flex items-center justify-between shadow-md hover:border-white/10 transition-colors relative overflow-hidden">
             <div className="flex items-center gap-4 relative z-10">
                <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                   <TrendingUp className="w-6 h-6 text-emerald-400" />
                </div>
                <div className="flex flex-col">
                   <span className="text-2xl font-black text-white"><AnimatedValue value={formatPrice(dashboardData.last30DaysEarning || 0, currency)} /></span>
                   <span className="text-xs text-gray-500 font-medium">30 Days Earning</span>
                </div>
             </div>
             <div className="absolute right-0 bottom-0"><Sparkline color="#10B981" /></div>
          </div>

          <div className="bg-[#12141D] border border-white/5 rounded-2xl p-5 flex items-center justify-between shadow-md hover:border-white/10 transition-colors relative overflow-hidden">
             <div className="flex items-center gap-4 relative z-10">
                <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
                   <Clock className="w-6 h-6 text-amber-400" />
                </div>
                <div className="flex flex-col">
                   <span className="text-2xl font-black text-white"><AnimatedValue value={formatPrice(dashboardData.totalPendingAmount || 0, currency)} /></span>
                   <span className="text-xs text-gray-500 font-medium">Pending Amount</span>
                </div>
             </div>
             <div className="absolute right-0 bottom-0"><Sparkline color="#F59E0B" /></div>
          </div>
        </div>

        {/* ========================================== */}
        {/* MIDDLE 3 COLUMN ROW */}
        {/* ========================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          
          <div className="bg-[#12141D] border border-white/5 rounded-2xl p-6 shadow-lg">
             <div className="flex items-center gap-2 mb-4">
               <LinkIcon className="w-5 h-5 text-[#00E57A]" />
               <h3 className="text-base font-bold text-white">Your Referral Link</h3>
             </div>
             <p className="text-xs text-gray-500 mb-4">Share this link with friends and start earning.</p>
             
             <div className="flex items-center bg-[#0B0D14] border border-white/10 rounded-xl p-1 mb-5">
               <input type="text" readOnly value={referralLink} className="w-full bg-transparent px-3 text-sm text-white focus:outline-none font-mono" />
               <button onClick={handleCopy} className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white px-4 py-2 rounded-lg text-xs font-bold transition-colors flex items-center gap-2 cursor-pointer">
                 <Copy className="w-3.5 h-3.5" /> Copy
               </button>
             </div>

             <p className="text-xs text-white font-bold mb-3">Share via</p>
             <div className="flex items-center justify-between">
                {[
                  { icon: WhatsAppIcon, label: 'WhatsApp', color: 'text-[#25D366]', url: `https://api.whatsapp.com/send?text=${encodeURIComponent(referralLink)}` },
                  { icon: TelegramIcon, label: 'Telegram', color: 'text-[#0088cc]', url: `https://t.me/share/url?url=${encodeURIComponent(referralLink)}` },
                  { icon: FacebookIcon, label: 'Facebook', color: 'text-[#1877F2]', url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}` },
                  { icon: XIcon, label: 'X', color: 'text-white', url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(referralLink)}` },
                ].map((s, i) => (
                  <a key={i} href={s.url} target="_blank" rel="noreferrer" className="flex flex-col items-center gap-2 cursor-pointer group">
                    <div className="w-12 h-12 rounded-full bg-white/5 group-hover:bg-white/10 flex items-center justify-center transition-colors">
                      <s.icon className={`w-5 h-5 ${s.color}`} />
                    </div>
                    <span className="text-[10px] text-gray-400 group-hover:text-white transition-colors">{s.label}</span>
                  </a>
                ))}
                <div onClick={handleCopy} className="flex flex-col items-center gap-2 cursor-pointer group">
                  <div className="w-12 h-12 rounded-full bg-white/5 group-hover:bg-white/10 flex items-center justify-center transition-colors text-white">
                    <LinkIcon className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] text-gray-400 group-hover:text-white transition-colors">Copy Link</span>
                </div>
             </div>
          </div>

          <div className="bg-[#12141D] border border-white/5 rounded-2xl p-6 shadow-lg">
             <div className="flex items-center justify-between mb-6">
               <div className="flex items-center gap-2">
                 <Medal className="w-5 h-5 text-[#00E57A]" />
                 <h3 className="text-base font-bold text-white">Your Current Level</h3>
               </div>
               <span className="bg-[#00E57A]/10 border border-[#00E57A]/20 text-[#00E57A] text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">Active</span>
             </div>

             <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center border border-yellow-500/30">
                    <Shield className="w-5 h-5 text-yellow-500" />
                  </div>
                  <h4 className="text-xl font-black text-white">Level {tierData?.currentTier || 1}</h4>
                </div>
                <span className="text-[#00E57A] font-bold text-sm">3% Commission</span>
             </div>

             <div className="flex flex-col gap-3 mb-6">
                <div>
                  <div className="flex justify-between text-xs text-gray-400 mb-1.5">
                    <span><strong className="text-white">0</strong> / 5 Referrals</span>
                    <span>0%</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-[#00E57A] rounded-full" style={{ width: '0%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-xs text-gray-400 mb-1.5">
                    <span><strong className="text-white">$ 0.00</strong> / $ 10.00 Earnings</span>
                    <span>0%</span>
                  </div>
                  <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-[#00E57A] rounded-full" style={{ width: '0%' }}></div>
                  </div>
                </div>
             </div>

             <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3 flex items-start gap-3">
                <ChevronRight className="w-4 h-4 text-gray-500 shrink-0 mt-0.5" />
                <p className="text-xs text-gray-400 leading-relaxed">
                  Refer 5 more users or earn <strong>$10.00</strong> to unlock <strong>Level 2</strong> (4% Commission)
                </p>
             </div>
          </div>

          <div className="bg-[#12141D] border border-white/5 rounded-2xl p-6 shadow-lg flex flex-col justify-between">
             <div>
               <div className="flex items-center gap-2 mb-4">
                 <Wallet className="w-5 h-5 text-[#00E57A]" />
                 <h3 className="text-base font-bold text-white">Available to Withdraw</h3>
               </div>
               <div className="text-4xl font-black text-white mb-1">
                 <AnimatedValue value={formatPrice(availableBalance, currency)} />
               </div>
               <p className="text-sm text-gray-400 mb-6">Minimum Payout: {formatPrice(minPayout, currency)}</p>
               
               <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                 <div className="h-2 flex-1 bg-white/10 rounded-full overflow-hidden mr-3">
                    <div className="h-full bg-[#00E57A] rounded-full" style={{ width: `${withdrawProgress}%` }}></div>
                 </div>
                 <span className="text-gray-400">{Math.floor(withdrawProgress)}%</span>
               </div>
               <p className="text-[11px] text-gray-500 mb-6">
                 <strong className="text-yellow-500">{formatPrice(Math.max(0, minPayout - availableBalance), currency)}</strong> more to unlock withdrawal
               </p>
             </div>

             <button 
                onClick={handleWithdrawClick}
                disabled={isWithdrawing || availableBalance < minPayout}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#A855F7] hover:from-[#7C3AED] hover:to-[#8B5CF6] text-white font-bold text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
             >
                {isWithdrawing ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Withdraw Now'}
             </button>
             {withdrawMessage && <p className={`text-center text-[10px] mt-2 font-bold ${withdrawMessage.type === 'error' ? 'text-rose-400' : 'text-emerald-400'}`}>{withdrawMessage.text}</p>}
          </div>

        </div>

        {/* ========================================== */}
        {/* LEVELS GRID (DYNAMIC API MAPPING) */}
        {/* ========================================== */}
        <div className="mt-5 bg-[#12141D] border border-white/5 rounded-2xl p-6 shadow-lg">
           <div className="flex items-center justify-between mb-6">
             <div>
               <h3 className="text-lg font-bold text-white flex items-center gap-2"><TrendingUp className="w-5 h-5 text-[#00E57A]" /> Affiliate Level Structure</h3>
               <p className="text-xs text-gray-500 mt-1">Reach the next level to earn a higher commission from your referrals.</p>
             </div>
           </div>

           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
             {tierData?.levels?.length > 0 ? (
               tierData.levels.map((tier: any, i: number) => {
                 const isCurrent = Number(tier.level) === Number(tierData.currentTier);
                 return (
                   <div key={i} className={`relative bg-[#0B0D14] border ${isCurrent ? 'border-[#00E57A]' : 'border-white/5'} rounded-xl p-4 flex flex-col items-center text-center`}>
                      {isCurrent && (
                        <span className="absolute -top-2.5 bg-[#00E57A] text-[#0B0D14] text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border border-[#12141D]">
                          Current
                        </span>
                      )}
                      <Trophy className={`w-8 h-8 mb-2 ${isCurrent ? 'text-yellow-400' : 'text-gray-500'}`} />
                      <h4 className="text-sm font-bold text-white mb-0.5">Level {tier.level}</h4>
                      <span className={`text-xs font-bold mb-3 ${isCurrent ? 'text-[#00E57A]' : 'text-blue-400'}`}>{tier.commissionPercent}% Commission</span>
                      
                      <span className="text-[10px] text-gray-400">Refer {tier.requiredReferral || 0} users</span>
                      <span className="text-[10px] text-gray-400">${tier.referralAmount || 0} earnings</span>
                   </div>
                 );
               })
             ) : (
               <div className="col-span-full py-8 text-center text-gray-500 text-xs flex items-center justify-center gap-2">
                 <Loader2 className="w-4 h-4 animate-spin" /> Loading levels...
               </div>
             )}
           </div>
        </div>

        {/* ========================================== */}
        {/* FOOTER SECTION: How it works & FAQ */}
        {/* ========================================== */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-5">
           
           {/* HOW IT WORKS */}
           <div className="lg:col-span-2 bg-[#12141D] border border-white/5 rounded-2xl p-6 shadow-lg">
              <h3 className="text-base font-bold text-white flex items-center gap-2 mb-6"><Info className="w-4 h-4 text-gray-400" /> How It Works</h3>
              <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                {[
                  { step: 1, title: 'Share Your Link', desc: 'Copy your unique referral link and share it.' },
                  { step: 2, title: 'Invite Friends', desc: 'Friends sign up using your referral link.' },
                  { step: 3, title: 'Earn Commission', desc: 'Get commission from their eligible activity.' },
                  { step: 4, title: 'Unlock Higher Levels', desc: 'More referrals and earnings unlock higher commission rates.' },
                ].map((s, i) => (
                  <React.Fragment key={i}>
                    <div className="flex items-start gap-3 flex-1">
                      <div className="w-8 h-8 rounded-full bg-[#8B5CF6]/20 text-[#8B5CF6] flex items-center justify-center font-bold text-sm shrink-0 border border-[#8B5CF6]/30">{s.step}</div>
                      <div>
                        <h4 className="text-xs font-bold text-white mb-1">{s.title}</h4>
                        <p className="text-[10px] text-gray-500 leading-snug">{s.desc}</p>
                      </div>
                    </div>
                    {i < 3 && <ChevronRight className="w-4 h-4 text-gray-700 hidden md:block shrink-0" />}
                  </React.Fragment>
                ))}
              </div>
           </div>

           {/* ACCORDION FAQ */}
           <div className="bg-[#12141D] border border-white/5 rounded-2xl p-6 shadow-lg">
             <div className="flex items-center justify-between mb-4">
               <h3 className="text-base font-bold text-white flex items-center gap-2"><Info className="w-4 h-4 text-gray-400" /> Frequently Asked Questions</h3>
             </div>
             
             <div className="flex flex-col gap-1">
               {faqs.map((faq, i) => (
                 <div key={i} className="flex flex-col border-b border-white/5 py-2">
                   <div 
                     onClick={() => setOpenFaqIndex(openFaqIndex === i ? null : i)}
                     className="flex items-center justify-between cursor-pointer group"
                   >
                     <span className="text-xs text-gray-400 group-hover:text-white transition-colors">{faq.q}</span>
                     <ChevronDown className={`w-3 h-3 text-gray-600 group-hover:text-white transition-transform ${openFaqIndex === i ? 'rotate-180' : ''}`} />
                   </div>
                   <AnimatePresence>
                     {openFaqIndex === i && (
                       <motion.div
                         initial={{ height: 0, opacity: 0 }}
                         animate={{ height: 'auto', opacity: 1 }}
                         exit={{ height: 0, opacity: 0 }}
                         className="overflow-hidden"
                       >
                         <p className="text-[11px] text-gray-500 mt-2 leading-relaxed pb-1">{faq.a}</p>
                       </motion.div>
                     )}
                   </AnimatePresence>
                 </div>
               ))}
             </div>
           </div>

        </div>

      </main>
    </div>
  );
}