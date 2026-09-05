'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Copy, Users, ShieldAlert, Clock, Wallet,
  CheckCircle2, Circle, ShieldCheck, Medal, Star,
  ArrowRight, Percent, Infinity, Zap, BarChart2, Headphones, Info, X, Loader2,
  Award, Shield, Lock, CircleDollarSign
} from 'lucide-react';
import { useCurrency, formatPrice } from '@/hooks/useCurrency';
import Link from 'next/link';

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413z" />
  </svg>
);

const TelegramIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M20.665 3.717l-17.73 6.837c-1.21.486-1.203 1.161-.222 1.509l4.552 1.42 10.532-6.645c.498-.303.953-.139.579.192l-8.533 7.701h-.002l.002.001-.314 4.692c.46 0 .663-.211.921-.46l2.211-2.15 4.599 3.397c.848.467 1.457.227 1.668-.785l3.019-14.228c.309-1.239-.473-1.8-1.282-1.481z" />
  </svg>
);

const FacebookIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
  </svg>
);

const TwitterIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
  </svg>
);

const LinkIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
    <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
  </svg>
);

const Sparkline = ({ color }: { color: string }) => (
  <svg className="w-full h-8 mt-2 opacity-30" viewBox="0 0 100 20" preserveAspectRatio="none">
    <path d="M0 20 Q 10 15 20 18 T 40 10 T 60 15 T 80 5 T 100 12 L 100 20 Z" fill={`url(#gradient-${color})`} />
    <path d="M0 20 Q 10 15 20 18 T 40 10 T 60 15 T 80 5 T 100 12" stroke={color} strokeWidth="2" fill="none" />
    <defs>
      <linearGradient id={`gradient-${color}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={color} stopOpacity="0.5" />
        <stop offset="100%" stopColor={color} stopOpacity="0" />
      </linearGradient>
    </defs>
  </svg>
);

const fadeUp: any = {
  hidden: { opacity: 0, y: 18 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }
  })
};

const staggerContainer: any = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.07 }
  }
};

const popIn: any = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } }
};

// Lightweight component that animates a numeric value counting up whenever it changes.
// Falls back to rendering the raw string instantly for non-numeric / currency-formatted values.
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
    const totalFrames = 24;
    const start = prevNumeric;
    const end = numeric;

    const tick = () => {
      frame++;
      const progress = 1 - Math.pow(1 - frame / totalFrames, 3); // ease-out cubic
      const current = start + (end - start) * progress;
      const formatted = isDecimal ? current.toFixed(2) : Math.round(current).toLocaleString();
      setDisplay(`${prefix}${formatted}${suffix}`);
      if (frame < totalFrames) {
        requestAnimationFrame(tick);
      } else {
        setDisplay(value);
        prevRef.current = value;
      }
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
  const [isLearnMoreOpen, setIsLearnMoreOpen] = useState(false);

  const [dashboardData, setDashboardData] = useState<any>({
    totalRefer: 0,
    totalReferEarning: 0,
    totalPendingAmount: 0,
    totalReversalAmount: 0,
    totalCommission: 0
  });
  
  const [referralLink, setReferralLink] = useState('...');
  const [tierData, setTierData] = useState<any>({ currentTier: 1, currentReferralEarning: 0, levels: [] });

  const [copied, setCopied] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [withdrawMessage, setWithdrawMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const availableBalance = dashboardData?.totalReferEarning || 0;

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

  const handleWithdrawClick = async () => {
    const balanceNum = Number(availableBalance) || 0;
    if (balanceNum < 5) {
      setWithdrawMessage({ text: `Minimum payout is ${formatPrice(5, currency)}. You need ${formatPrice(5 - balanceNum, currency)} more.`, type: 'error' });
      setTimeout(() => setWithdrawMessage(null), 4000);
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
      setTimeout(() => setWithdrawMessage(null), 4000);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0D14] text-white relative pb-16 font-sans overflow-hidden">
      <motion.div
        aria-hidden
        className="pointer-events-none absolute -top-40 -left-40 w-[520px] h-[520px] rounded-full bg-[#8B5CF6]/20 blur-[120px]"
        animate={{ x: [0, 40, 0], y: [0, 30, 0], opacity: [0.5, 0.8, 0.5] }}
        transition={{ duration: 14, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
      />
      <motion.div
        aria-hidden
        className="pointer-events-none absolute top-1/3 -right-32 w-[420px] h-[420px] rounded-full bg-[#00E57A]/10 blur-[110px]"
        animate={{ x: [0, -30, 0], y: [0, 40, 0], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 16, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut', delay: 1 }}
      />

      <motion.main 
        variants={staggerContainer} initial="hidden" animate="visible"
        className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10"
      >
        <motion.div variants={fadeUp} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <motion.h1
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              className="text-[28px] font-black text-white tracking-tight leading-none mb-1"
            >
              Affiliate Program
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-[#8F95A3] text-sm font-medium"
            >
              Refer friends, earn more, and grow your passive income.
            </motion.p>
          </div>
          
          <div className="flex gap-4 w-full md:w-auto overflow-x-auto no-scrollbar pb-2 md:pb-0">
            {[
              { icon: Users, color: '#3B82F6', bg: 'bg-[#3B82F6]/20', text: 'Total Referrals', value: dashboardData?.totalRefer || 0 },
              { icon: Clock, color: '#F59E0B', bg: 'bg-[#F59E0B]/20', text: 'Pending Amount', value: formatPrice(Number(dashboardData?.totalPendingAmount) || 0, currency) },
              { icon: Wallet, color: '#10B981', bg: 'bg-[#10B981]/20', text: 'Paid Amount', value: formatPrice(Number(dashboardData?.totalCommission) || 0, currency) },
              { icon: ShieldAlert, color: '#EF4444', bg: 'bg-[#EF4444]/20', text: 'Reversal Amount', value: formatPrice(Number(dashboardData?.totalReversalAmount) || 0, currency) },
            ].map((stat, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                custom={i}
                whileHover={{ y: -5, scale: 1.02, transition: { duration: 0.2 } }}
                className="bg-[#161821] border border-white/5 rounded-2xl p-4 flex flex-col justify-between w-[160px] shrink-0 shadow-lg relative overflow-hidden group transition-shadow duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.4)]"
              >
                 <div
                   className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                   style={{ background: `radial-gradient(120px circle at 30% 20%, ${stat.color}22, transparent 70%)` }}
                 />
                 <div className="flex items-center gap-3 relative z-10">
                   <motion.div
                     whileHover={{ scale: 1.12, rotate: 6 }}
                     transition={{ type: 'spring', stiffness: 300, damping: 15 }}
                     className={`w-9 h-9 rounded-xl ${stat.bg} flex items-center justify-center`}
                   >
                     <stat.icon className="w-4 h-4" style={{ color: stat.color }} />
                   </motion.div>
                   <div className="flex flex-col">
                     <span className="text-xl font-black text-white leading-none tabular-nums">
                       <AnimatedValue value={stat.value} />
                     </span>
                   </div>
                 </div>
                 <span className="text-[11px] font-medium text-[#8F95A3] mt-2 relative z-10">{stat.text}</span>
                 <div className="absolute bottom-0 left-0 right-0"><Sparkline color={stat.color} /></div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          
          <motion.div
            variants={fadeUp}
            whileHover={{ y: -4 }}
            className="bg-[#161821] border border-white/5 rounded-[20px] p-6 shadow-xl relative overflow-hidden flex flex-col justify-between transition-shadow duration-300 hover:shadow-[0_10px_40px_rgba(139,92,246,0.15)]"
          >
            <div className="relative z-10 mb-6 flex justify-between items-start">
               <div>
                  <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-1.5">Available Balance <Info className="w-3.5 h-3.5 text-[#8F95A3]"/></h3>
                  <div className="text-[32px] font-black text-white tracking-tight tabular-nums">
                    <AnimatedValue value={formatPrice(Number(availableBalance) || 0, currency)} />
                  </div>
                  <p className="text-xs text-[#8F95A3] mt-1">Minimum Payout: {formatPrice(5, currency)}</p>
               </div>
               <div className="relative w-16 h-16 shrink-0">
                  <motion.div
                    className="absolute inset-0 rounded-2xl bg-[#8B5CF6]/40 blur-md"
                    animate={{ opacity: [0.4, 0.8, 0.4], scale: [0.95, 1.05, 0.95] }}
                    transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
                  />
                  <motion.div
                    whileHover={{ scale: 1.08, rotate: -4 }}
                    transition={{ type: 'spring', stiffness: 260, damping: 14 }}
                    className="relative w-16 h-16 rounded-2xl bg-gradient-to-br from-[#8B5CF6] to-[#6366F1] p-3 flex items-center justify-center shadow-lg"
                  >
                    <Wallet className="w-8 h-8 text-white" />
                  </motion.div>
               </div>
            </div>

            <div className="relative z-10 space-y-3">
              <AnimatePresence>
                {withdrawMessage && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className={`p-2 rounded-xl text-xs font-bold text-center border ${withdrawMessage.type === 'success' ? 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/30' : 'bg-red-500/10 text-red-400 border-red-500/30'}`}>
                    {withdrawMessage.text}
                  </motion.div>
                )}
              </AnimatePresence>
              <motion.button
                whileHover={{ scale: 1.015 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleWithdrawClick}
                disabled={isWithdrawing}
                className="w-full py-3.5 rounded-xl bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-bold text-sm transition-colors cursor-pointer disabled:opacity-60 flex justify-center items-center gap-2"
              >
                <AnimatePresence mode="wait" initial={false}>
                  {isWithdrawing ? (
                    <motion.span key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center gap-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                    </motion.span>
                  ) : (
                    <motion.span key="label" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      Withdraw Now
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
              <div className="flex items-center justify-center gap-1.5 text-[10px] text-[#8F95A3] font-medium mt-2">
                <ShieldCheck className="w-3.5 h-3.5 text-[#8B5CF6]" /> Secure payout • Processed instantly
              </div>
            </div>
          </motion.div>

          <motion.div variants={fadeUp} whileHover={{ y: -4 }} className="bg-[#161821] border border-white/5 rounded-[20px] p-6 shadow-xl flex flex-col justify-between transition-shadow duration-300 hover:shadow-[0_10px_40px_rgba(0,0,0,0.35)]">
             <div>
                <h3 className="text-sm font-bold text-white mb-4">Referral Link</h3>
                <div className="flex items-center w-full bg-[#0B0D14] border border-white/10 rounded-xl p-1.5 focus-within:border-[#8B5CF6] transition-colors mb-2 shadow-inner">
                  <input type="text" readOnly value={referralLink} className="w-full bg-transparent px-3 py-2 text-xs text-white opacity-80 focus:outline-none truncate font-mono" />
                  <motion.button
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleCopy}
                    className="h-9 px-4 rounded-lg bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 overflow-hidden"
                  >
                    <AnimatePresence mode="wait" initial={false}>
                      {copied ? (
                        <motion.span
                          key="copied"
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          transition={{ duration: 0.18 }}
                          className="flex items-center gap-1.5"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Copied
                        </motion.span>
                      ) : (
                        <motion.span
                          key="copy"
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          transition={{ duration: 0.18 }}
                          className="flex items-center gap-1.5"
                        >
                          <Copy className="w-3.5 h-3.5" /> Copy
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.button>
                </div>
                <p className="text-[11px] text-[#8F95A3] mb-6">Share your link and start earning</p>
             </div>
          </motion.div>

          <motion.div variants={fadeUp} whileHover={{ y: -4 }} className="bg-[#161821] border border-white/5 rounded-[20px] p-6 shadow-xl relative overflow-hidden flex flex-col justify-between transition-shadow duration-300 hover:shadow-[0_10px_40px_rgba(0,0,0,0.35)]">
             <div className="relative z-10">
                <h3 className="text-sm font-bold text-white mb-1">Share & Earn More</h3>
                <p className="text-xs text-[#8F95A3] mb-5">Share on social media and increase your referrals</p>
                <div className="flex items-center gap-3">
                  {[
                    { icon: WhatsAppIcon, color: 'text-[#25D366]', hover: 'hover:bg-[#25D366]/20', url: `https://api.whatsapp.com/send?text=${encodeURIComponent(referralLink)}` },
                    { icon: FacebookIcon, color: 'text-[#1877F2]', hover: 'hover:bg-[#1877F2]/20', url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}` },
                    { icon: TwitterIcon, color: 'text-[#1DA1F2]', hover: 'hover:bg-[#1DA1F2]/20', url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(referralLink)}` },
                    { icon: TelegramIcon, color: 'text-[#0088cc]', hover: 'hover:bg-[#0088cc]/20', url: `https://t.me/share/url?url=${encodeURIComponent(referralLink)}` }
                  ].map((s, i) => (
                    <motion.a
                      key={i}
                      href={s.url}
                      target="_blank"
                      rel="noreferrer"
                      whileHover={{ scale: 1.15, rotate: -6, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 12 }}
                      className={`w-10 h-10 rounded-full bg-[#1A1C24] ${s.hover} flex items-center justify-center border border-white/5 transition-colors ${s.color}`}
                    >
                      <s.icon className="w-5 h-5" />
                    </motion.a>
                  ))}
                  <motion.button
                    whileHover={{ scale: 1.15, rotate: 6, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 12 }}
                    onClick={handleCopy}
                    className="w-10 h-10 rounded-full bg-[#1A1C24] hover:bg-white/10 flex items-center justify-center border border-white/5 transition-colors text-white"
                  >
                    <LinkIcon className="w-4 h-4" />
                  </motion.button>
                </div>
             </div>
          </motion.div>
        </motion.div>

        <motion.div variants={fadeUp} className="mb-8">
          <div className="bg-gradient-to-br from-[#8B5CF6] to-[#6D28D9] rounded-[24px] p-6 sm:p-8 relative overflow-hidden flex flex-col justify-center border border-white/10">
            <motion.div
              aria-hidden
              className="pointer-events-none absolute -right-10 -top-10 w-48 h-48 rounded-full bg-white/10"
              animate={{ y: [0, -14, 0], x: [0, 8, 0] }}
              transition={{ duration: 6, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
            />
            <motion.div
              aria-hidden
              className="pointer-events-none absolute right-16 bottom-0 w-24 h-24 rounded-full bg-white/10"
              animate={{ y: [0, 12, 0], x: [0, -6, 0] }}
              transition={{ duration: 5, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut', delay: 0.6 }}
            />
            <motion.div
              aria-hidden
              className="pointer-events-none absolute right-40 top-6 w-14 h-14 rounded-full bg-white/10"
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut', delay: 0.3 }}
            />

            <div className="relative z-10 md:w-[65%]">
              <h3 className="text-[22px] sm:text-2xl font-black text-white mb-2 leading-tight">Get More, Earn More!</h3>
              <p className="text-[13px] sm:text-sm text-white/90 mb-6 leading-relaxed font-medium">Invite more friends and unlock higher rewards across all levels.</p>
              
              <motion.button
                whileHover={{ scale: 1.04, gap: '10px' }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setIsLearnMoreOpen(true)}
                className="w-fit px-6 py-3 rounded-xl bg-white text-[#7C3AED] hover:bg-gray-50 font-black text-sm transition-colors flex justify-center items-center gap-2"
              >
                Learn More <ArrowRight className="w-4 h-4" />
              </motion.button>
            </div>
          </div>
        </motion.div>

        <motion.div variants={fadeUp} className="w-full bg-[#161821] border border-white/5 rounded-[24px] p-6 shadow-xl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <motion.span
                animate={{ rotate: [0, -8, 8, 0] }}
                transition={{ duration: 3, repeat: Number.POSITIVE_INFINITY, repeatDelay: 3, ease: 'easeInOut' }}
              >
                <Award className="w-5 h-5 text-[#00E57A]" />
              </motion.span>
              Affiliate Level Structure
            </h2>
            <div className="bg-[#0B0D14] border border-white/5 px-4 py-2.5 rounded-xl flex items-center gap-2 text-sm font-bold shadow-inner">
               <span className="text-[#8F95A3]">Current Earnings:</span>
               <span className="text-[#00E57A] tabular-nums">
                 <AnimatedValue value={formatPrice(Number(tierData?.currentReferralEarning || 0), currency)} />
               </span>
            </div>
          </div>

          <p className="text-xs text-[#8F95A3] mb-6 flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5 text-[#00E57A]"/> Reach the next Level to earn a higher commission from your Referrals.
          </p>

          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {tierData?.levels?.length > 0 ? (
              tierData.levels.map((tierItem: any, idx: number) => {
                const levelNum = tierItem.level;
                const isCurrent = Number(levelNum) === Number(tierData.currentTier);
                const isCompleted = Number(levelNum) < Number(tierData.currentTier);
                const isLocked = Number(levelNum) > Number(tierData.currentTier);
                
                const reqEarnings = Number(tierItem.referralAmount) || 0;
                const reqReferrals = Number(tierItem.requiredReferral) || 0;
                const comm = tierItem.commissionPercent || 0;

                const hasEnoughEarnings = (Number(tierData?.currentReferralEarning) || 0) >= reqEarnings;
                const hasEnoughReferrals = (Number(dashboardData?.totalRefer) || 0) >= reqReferrals;

                const earningsCheck = isCompleted || hasEnoughEarnings;
                const referralsCheck = isCompleted || hasEnoughReferrals;

                const iconColor = isLocked ? 'text-gray-500' : 'text-[#00E57A]';
                const borderColor = isCurrent ? 'border-[#00E57A]' : 'border-white/5';

                // Visual-only progress indicator, derived purely from existing values.
                const referralProgress = reqReferrals > 0 ? Math.min(100, ((Number(dashboardData?.totalRefer) || 0) / reqReferrals) * 100) : 100;
                const earningProgress = reqEarnings > 0 ? Math.min(100, ((Number(tierData?.currentReferralEarning) || 0) / reqEarnings) * 100) : 100;

                return (
                  <motion.div 
                    key={idx}
                    variants={popIn}
                    whileHover={!isLocked ? { y: -6, transition: { duration: 0.2 } } : {}}
                    className={`relative bg-[#0B0D14] border ${borderColor} rounded-2xl p-6 flex flex-col transition-colors duration-300 ${isLocked ? 'opacity-70' : ''} ${isCurrent ? 'shadow-[0_0_0_1px_rgba(0,229,122,0.15)]' : ''}`}
                  >
                      {isCurrent && (
                        <motion.div
                          aria-hidden
                          className="pointer-events-none absolute inset-0 rounded-2xl"
                          animate={{ boxShadow: ['0 0 0px rgba(0,229,122,0.0)', '0 0 24px rgba(0,229,122,0.18)', '0 0 0px rgba(0,229,122,0.0)'] }}
                          transition={{ duration: 2.6, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }}
                        />
                      )}

                      {isCurrent && (
                        <motion.div
                          initial={{ opacity: 0, y: -6, scale: 0.9 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          transition={{ delay: 0.15, type: 'spring', stiffness: 300, damping: 16 }}
                          className="absolute -top-3 right-6 px-4 py-0.5 text-[10px] font-black tracking-widest bg-[#00E57A] text-[#0B0D14] rounded-full uppercase shadow-md border-[2px] border-[#161821]"
                        >
                          Active
                        </motion.div>
                      )}
                      
                      <div className="flex justify-between items-center mb-6">
                        <div className={`flex items-center gap-2 font-black text-sm tracking-wide ${isLocked ? 'text-gray-500' : 'text-white'}`}>
                          <Medal className={`w-5 h-5 ${iconColor}`} /> Level {levelNum}
                        </div>
                        <div className={`flex items-center gap-1.5 font-bold text-[13px] ${isLocked ? 'text-gray-500' : 'text-[#00E57A]'}`}>
                          <CircleDollarSign className={`w-4 h-4 ${iconColor}`} /> {comm}% commission
                        </div>
                      </div>

                      <div className="flex items-center gap-3 mb-5">
                        <div className="h-[1px] flex-1 bg-white/5"></div>
                        <span className="text-[10px] text-gray-500 font-medium">Requirements</span>
                        <div className="h-[1px] flex-1 bg-white/5"></div>
                      </div>

                      <div className="flex flex-col gap-4">
                        <div>
                          <div className={`flex items-center gap-2.5 text-xs font-medium mb-1.5 ${isLocked ? 'text-gray-500' : 'text-gray-300'}`}>
                            <AnimatePresence mode="wait" initial={false}>
                              {referralsCheck ? (
                                <motion.span key="check" initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 400, damping: 15 }}>
                                  <CheckCircle2 className="w-4 h-4 text-[#00E57A] shrink-0" />
                                </motion.span>
                              ) : (
                                <motion.span key="circle" initial={{ scale: 0 }} animate={{ scale: 1 }}>
                                  <Circle className="w-4 h-4 text-gray-600 shrink-0" />
                                </motion.span>
                              )}
                            </AnimatePresence>
                            Refer {reqReferrals} users
                          </div>
                          <div className="h-1 rounded-full bg-white/5 overflow-hidden">
                            <motion.div
                              className="h-full rounded-full bg-[#00E57A]"
                              initial={{ width: 0 }}
                              animate={{ width: `${referralProgress}%` }}
                              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                            />
                          </div>
                        </div>

                        <div>
                          <div className={`flex items-center gap-2.5 text-xs font-medium mb-1.5 ${isLocked ? 'text-gray-500' : 'text-gray-300'}`}>
                            <AnimatePresence mode="wait" initial={false}>
                              {earningsCheck ? (
                                <motion.span key="check" initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 400, damping: 15 }}>
                                  <CheckCircle2 className="w-4 h-4 text-[#00E57A] shrink-0" />
                                </motion.span>
                              ) : (
                                <motion.span key="circle" initial={{ scale: 0 }} animate={{ scale: 1 }}>
                                  <Circle className="w-4 h-4 text-gray-600 shrink-0" />
                                </motion.span>
                              )}
                            </AnimatePresence>
                            {formatPrice(reqEarnings, currency)} affiliate earnings
                          </div>
                          <div className="h-1 rounded-full bg-white/5 overflow-hidden">
                            <motion.div
                              className="h-full rounded-full bg-[#00E57A]"
                              initial={{ width: 0 }}
                              animate={{ width: `${earningProgress}%` }}
                              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
                            />
                          </div>
                        </div>
                      </div>

                  </motion.div>
                );
              })
            ) : (
              <div className="col-span-full py-8 text-center text-gray-500 text-sm flex items-center justify-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin" /> Loading levels...
              </div>
            )}
          </motion.div>
        </motion.div>

        <motion.div
          variants={fadeUp}
          whileHover={{ y: -3 }}
          className="mt-8 bg-[#161821] border border-white/5 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl transition-shadow duration-300 hover:shadow-[0_10px_30px_rgba(0,0,0,0.3)]"
        >
           <div className="flex items-center gap-4">
              <motion.div
                whileHover={{ rotate: [0, -12, 12, -8, 0] }}
                transition={{ duration: 0.6 }}
                className="w-12 h-12 rounded-full bg-[#8B5CF6]/10 flex items-center justify-center shrink-0"
              >
                 <Headphones className="w-5 h-5 text-[#8B5CF6]" />
              </motion.div>
              <div>
                 <h3 className="text-sm font-bold text-white mb-0.5">Need Help?</h3>
                 <p className="text-xs text-[#8F95A3]">Our support team is here to help you with any questions you have.</p>
              </div>
           </div>
           
           <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="shrink-0">
             <Link href="/support" className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-xs transition-colors flex items-center gap-2 cursor-pointer">
                <Headphones className="w-4 h-4" /> Contact Support <ArrowRight className="w-3.5 h-3.5" />
             </Link>
           </motion.div>
        </motion.div>

      </motion.main>

      <AnimatePresence>
        {isLearnMoreOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setIsLearnMoreOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm cursor-pointer"
            />
            
            <motion.div
              initial={{ opacity: 0, scale: 0.92, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              transition={{ type: 'spring', stiffness: 320, damping: 28 }}
              className="relative w-full max-w-md bg-[#161821] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl z-10 overflow-hidden"
            >
              <motion.button
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsLearnMoreOpen(false)}
                className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-[#8F95A3] hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </motion.button>

              <div className="relative z-10">
                <motion.div
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ delay: 0.1, type: 'spring', stiffness: 300, damping: 14 }}
                  className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED] flex items-center justify-center shadow-lg mb-5"
                >
                  <Star className="w-6 h-6 text-white fill-white" />
                </motion.div>
                
                <motion.h2
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 }}
                  className="text-2xl font-black text-white mb-2 leading-tight"
                >
                  Maximize Your Earnings
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-[#8F95A3] text-sm mb-6"
                >
                  Invite friends, build your network, and earn a passive income with our structured level system.
                </motion.p>

                <motion.button
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setIsLearnMoreOpen(false)}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] text-white font-bold shadow-[0_4px_15px_rgba(139,92,246,0.3)] transition-shadow cursor-pointer"
                >
                  Got it, let's earn!
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}