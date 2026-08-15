'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Copy, Users, ShieldAlert, Clock, Wallet, DollarSign,
  CheckCircle2, Circle, ShieldCheck, Medal, Star, Crown,
  ArrowRight, Percent, Infinity, Zap, BarChart2, Headphones, Info, X, Loader2,
  Award, Sparkles, Shield, Lock
} from 'lucide-react';
import { useCurrency, formatPrice } from '@/hooks/useCurrency';
import Link from 'next/link';

// --- CUSTOM BRAND ICONS ---
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

// --- ANIMATION VARIANTS ---
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

const rowFade: any = {
  hidden: { opacity: 0, x: -8 },
  visible: (i: number = 0) => ({
    opacity: 1,
    x: 0,
    transition: { duration: 0.3, delay: Math.min(i * 0.04, 0.5) }
  })
};

// --- UTILITY ---
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

const getAchievementIcon = (level: number) => {
  if (level <= 2) return <Shield className="w-4 h-4" />;
  if (level <= 4) return <ShieldCheck className="w-4 h-4" />;
  if (level <= 6) return <Award className="w-4 h-4" />;
  if (level <= 7) return <Medal className="w-4 h-4" />;
  return <Crown className="w-4 h-4" />;
};

export default function AffiliatePage() {
  const currency = useCurrency();
  const [activeTab, setActiveTab] = useState<'tier' | 'affiliate'>('tier');
  const [isLearnMoreOpen, setIsLearnMoreOpen] = useState(false);

  const [dashboardData, setDashboardData] = useState<any>({
    totalRefer: 0,
    totalReferEarning: 0,
    totalPendingAmount: 0,
    totalReversalAmount: 0,
    totalCommission: 0
  });
  
  const [referralLink, setReferralLink] = useState('Loading...');
  const [currentBonusInfo, setCurrentBonusInfo] = useState<{level: number, referalBonus: string}>({ level: 1, referalBonus: "3%" });
  const [tierData, setTierData] = useState<any>({ currentTier: 1, currentReferralEarning: 0, levels: [] });
  const [affiliateUsers, setAffiliateUsers] = useState<any[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [withdrawMessage, setWithdrawMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const availableBalance = dashboardData?.totalReferEarning || 0;

  useEffect(() => {
    const fetchAffiliateData = async () => {
      setIsLoading(true);
      const token = localStorage.getItem('token') || '';
      const userId = getUserId();
      if (!userId) { setIsLoading(false); return; }

      const safeParse = async (res: Response) => {
        try {
          const text = await res.text();
          if (text && !text.trim().startsWith('<')) {
            return JSON.parse(text);
          }
          return { code: 500, data: null, message: "HTML returned instead of JSON" };
        } catch (error) {
          return { code: 500, data: null, message: "Parse Failed" };
        }
      };

      try {
        const [dashRes, profileRes, tierRes, affiliateListRes, walletTierRes] = await Promise.all([
          fetch(`https://apitest.binnycash.com/api/user/affiliate_overview`, { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch(`https://apitest.binnycash.com/api/user/userDetails?userId=${userId}`, { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch(`https://apitest.binnycash.com/api/user/affiliateTierLevel`, { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch(`https://apitest.binnycash.com/api/user/referList`, { headers: { 'Authorization': `Bearer ${token}` } }),
          fetch(`https://apitest.binnycash.com/api/user/wallet/tier-level`, { headers: { 'Authorization': `Bearer ${token}` } })
        ]);

        const [dashJson, profileJson, tierJson, affiliateListJson, walletTierJson] = await Promise.all([
          safeParse(dashRes), 
          safeParse(profileRes), 
          safeParse(tierRes), 
          safeParse(affiliateListRes), 
          safeParse(walletTierRes)
        ]);

        if (dashJson.code === 200 && dashJson.data) setDashboardData(dashJson.data);
        
        const userObj = profileJson?.data?.user || profileJson?.data || profileJson;
        if (userObj?.referralUrl) {
          setReferralLink(userObj.referralUrl);
        }

        if (tierJson.code === 200 && tierJson.data) setTierData(tierJson.data);
        if (affiliateListJson.code === 200 && Array.isArray(affiliateListJson.data)) {
          setAffiliateUsers(affiliateListJson.data);
        }

        if (walletTierJson.code === 200 && walletTierJson.data) setCurrentBonusInfo(walletTierJson.data);

      } catch (error) {
        console.error('Error fetching affiliate data:', error);
      } finally {
        setIsLoading(false);
      }
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
      const res = await fetch(`https://apitest.binnycash.com/api/user/withdraw/claim-refer-earning`, {
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
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(168,85,247,0.3); border-radius: 10px; }
      `}</style>

      <motion.main 
        variants={staggerContainer} initial="hidden" animate="visible"
        className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10"
      >
        {/* HEADER */}
        <motion.div variants={fadeUp} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-[28px] font-black text-white tracking-tight leading-none mb-1">Affiliate Program</h1>
            <p className="text-[#8F95A3] text-sm font-medium">Refer friends, earn more, and grow your passive income.</p>
          </div>
          
          {/* STATS GRID */}
          <div className="flex gap-4 w-full md:w-auto overflow-x-auto no-scrollbar pb-2 md:pb-0">
            {[
              { icon: DollarSign, color: '#A855F7', bg: 'bg-[#8B5CF6]/20', text: 'Total Refer Earnings', value: formatPrice(Number(dashboardData?.totalReferEarning) || 0, currency) },
              { icon: Clock, color: '#F59E0B', bg: 'bg-[#F59E0B]/20', text: 'Pending Amount', value: formatPrice(Number(dashboardData?.totalPendingAmount) || 0, currency) },
              { icon: Wallet, color: '#10B981', bg: 'bg-[#10B981]/20', text: 'Paid Amount', value: formatPrice(Number(dashboardData?.totalCommission) || 0, currency) },
              { icon: ShieldAlert, color: '#EF4444', bg: 'bg-[#EF4444]/20', text: 'Reversal Amount', value: formatPrice(Number(dashboardData?.totalReversalAmount) || 0, currency) },
            ].map((stat, i) => (
              <motion.div key={i} variants={fadeUp} custom={i} whileHover={{ y: -5 }} className="bg-[#161821] border border-white/5 rounded-2xl p-4 flex flex-col justify-between w-[160px] shrink-0 shadow-lg relative overflow-hidden transition-colors hover:border-white/10">
                 <div className="flex items-center gap-3 relative z-10">
                   <div className={`w-9 h-9 rounded-xl ${stat.bg} flex items-center justify-center`}>
                     <stat.icon className="w-4 h-4" style={{ color: stat.color }} />
                   </div>
                   <div className="flex flex-col">
                     <span className="text-xl font-black text-white leading-none">{stat.value}</span>
                   </div>
                 </div>
                 <span className="text-[11px] font-medium text-[#8F95A3] mt-2 relative z-10">{stat.text}</span>
                 <div className="absolute bottom-0 left-0 right-0"><Sparkline color={stat.color} /></div>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* MIDDLE 3 COLUMNS */}
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          
          {/* BALANCE CARD */}
          <motion.div variants={fadeUp} whileHover={{ y: -3 }} className="bg-[#161821] border border-white/5 rounded-[20px] p-6 shadow-xl relative overflow-hidden flex flex-col justify-between group">
            <motion.div animate={{ opacity: [0.5, 0.8, 0.5] }} transition={{ duration: 4, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }} className="absolute top-0 right-0 w-32 h-32 bg-[#8B5CF6]/20 blur-[50px] rounded-full pointer-events-none transition-all duration-500 group-hover:scale-150 group-hover:bg-[#8B5CF6]/30" />
            
            <div className="relative z-10 mb-6 flex justify-between items-start">
               <div>
                  <h3 className="text-sm font-bold text-white mb-1 flex items-center gap-1.5">Available Balance <Info className="w-3.5 h-3.5 text-[#8F95A3]"/></h3>
                  <motion.div key={availableBalance} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="text-[32px] font-black text-white tracking-tight">
                    {formatPrice(Number(availableBalance) || 0, currency)}
                  </motion.div>
                  <p className="text-xs text-[#8F95A3] mt-1">Minimum Payout: {formatPrice(5, currency)}</p>
               </div>
               <motion.div initial={{ rotate: 0 }} animate={{ rotate: 12 }} whileHover={{ rotate: 0, scale: 1.08 }} transition={{ type: 'spring', stiffness: 250, damping: 15 }} className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#8B5CF6] to-[#6366F1] p-3 flex items-center justify-center shadow-lg">
                  <Wallet className="w-8 h-8 text-white" />
               </motion.div>
            </div>

            <div className="relative z-10 space-y-3">
              <AnimatePresence>
                {withdrawMessage && (
                  <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className={`p-2 rounded-xl text-xs font-bold text-center border ${withdrawMessage.type === 'success' ? 'bg-[#10B981]/10 text-[#10B981] border-[#10B981]/30' : 'bg-red-500/10 text-red-400 border-red-500/30'}`}>
                    {withdrawMessage.text}
                  </motion.div>
                )}
              </AnimatePresence>
              <motion.button onClick={handleWithdrawClick} disabled={isWithdrawing} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} className="w-full py-3.5 rounded-xl bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-bold text-sm shadow-[0_4px_15px_rgba(139,92,246,0.3)] hover:shadow-[0_4px_20px_rgba(139,92,246,0.5)] transition-all cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed flex justify-center items-center gap-2">
                {isWithdrawing && <Loader2 className="w-4 h-4 animate-spin" />}
                {isWithdrawing ? 'Processing...' : 'Withdraw Now'}
              </motion.button>
              <div className="flex items-center justify-center gap-1.5 text-[10px] text-[#8F95A3] font-medium mt-2">
                <ShieldCheck className="w-3.5 h-3.5 text-[#8B5CF6]" /> Secure payout • Processed instantly
              </div>
            </div>
          </motion.div>

          {/* REFERRAL LINK CARD */}
          <motion.div variants={fadeUp} whileHover={{ y: -3 }} className="bg-[#161821] border border-white/5 rounded-[20px] p-6 shadow-xl flex flex-col justify-between">
             <div>
                <h3 className="text-sm font-bold text-white mb-4">Referral Link</h3>
                <div className="flex items-center w-full bg-[#0B0D14] border border-white/10 rounded-xl p-1.5 focus-within:border-[#8B5CF6] transition-colors mb-2 shadow-inner">
                  <input type="text" readOnly value={referralLink} className="w-full bg-transparent px-3 py-2 text-xs text-[#8F95A3] focus:outline-none truncate" />
                  <motion.button whileTap={{ scale: 0.95 }} onClick={handleCopy} className="h-9 px-4 rounded-lg bg-[#8B5CF6] hover:bg-[#7C3AED] text-white text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0">
                    <AnimatePresence mode="wait" initial={false}>
                      {copied ? (
                        <motion.span key="check" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }} className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Copy
                        </motion.span>
                      ) : (
                        <motion.span key="copy" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.5, opacity: 0 }} className="flex items-center gap-1.5">
                          <Copy className="w-3.5 h-3.5" /> Copy
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.button>
                </div>
                <p className="text-[11px] text-[#8F95A3] mb-6">Share your link and start earning</p>
             </div>
          </motion.div>

          {/* SHARE CARD */}
          <motion.div variants={fadeUp} whileHover={{ y: -3 }} className="bg-[#161821] border border-white/5 rounded-[20px] p-6 shadow-xl relative overflow-hidden flex flex-col justify-between">
             <div className="relative z-10">
                <h3 className="text-sm font-bold text-white mb-1">Share & Earn More</h3>
                <p className="text-xs text-[#8F95A3] mb-5">Share on social media and increase your referrals</p>
                <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="flex items-center gap-3">
                  {[
                    { icon: WhatsAppIcon, color: 'text-[#25D366]', hover: 'hover:bg-[#25D366]/20', url: `https://api.whatsapp.com/send?text=${encodeURIComponent(referralLink)}` },
                    { icon: FacebookIcon, color: 'text-[#1877F2]', hover: 'hover:bg-[#1877F2]/20', url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}` },
                    { icon: TwitterIcon, color: 'text-[#1DA1F2]', hover: 'hover:bg-[#1DA1F2]/20', url: `https://twitter.com/intent/tweet?url=${encodeURIComponent(referralLink)}` },
                    { icon: TelegramIcon, color: 'text-[#0088cc]', hover: 'hover:bg-[#0088cc]/20', url: `https://t.me/share/url?url=${encodeURIComponent(referralLink)}` }
                  ].map((s, i) => (
                    <motion.a variants={fadeUp} whileHover={{ scale: 1.15, y: -2 }} whileTap={{ scale: 0.9 }} key={i} href={s.url} target="_blank" rel="noreferrer" className={`w-10 h-10 rounded-full bg-[#1A1C24] ${s.hover} flex items-center justify-center border border-white/5 transition-all ${s.color}`}>
                      <s.icon className="w-5 h-5" />
                    </motion.a>
                  ))}
                  <motion.button variants={fadeUp} whileHover={{ scale: 1.15, y: -2 }} whileTap={{ scale: 0.9 }} onClick={handleCopy} className="w-10 h-10 rounded-full bg-[#1A1C24] hover:bg-white/10 flex items-center justify-center border border-white/5 transition-all text-white">
                    <LinkIcon className="w-4 h-4" />
                  </motion.button>
                </motion.div>
             </div>
             <motion.div animate={{ rotate: [ -12, -8, -12 ] }} transition={{ repeat: Number.POSITIVE_INFINITY, duration: 5 }} className="absolute -bottom-6 -right-6 opacity-80 pointer-events-none">
                <div className="w-32 h-32 bg-gradient-to-tl from-[#8B5CF6] to-[#EC4899] rounded-full blur-[40px] opacity-30 absolute top-0 left-0" />
                <svg width="120" height="120" viewBox="0 0 24 24" fill="none" stroke="url(#megaGrad)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="transform -rotate-12">
                  <defs><linearGradient id="megaGrad" x1="0" y1="0" x2="24" y2="24"><stop offset="0%" stopColor="#c084fc" /><stop offset="100%" stopColor="#3b82f6" /></linearGradient></defs>
                  <path d="M11 5L6 9H2v6h4l5 4V5z"></path><path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                </svg>
             </motion.div>
          </motion.div>
        </motion.div>

        {/* PROMO BOX */}
        <div className="mb-8">
          <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.5, delay: 0.1 }} whileHover={{ scale: 1.01 }} className="bg-gradient-to-br from-[#8B5CF6] to-[#6D28D9] rounded-[24px] p-6 sm:p-8 shadow-[0_10px_30px_rgba(139,92,246,0.3)] relative overflow-hidden flex flex-col justify-center border border-white/10">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4"></div>
            <div className="absolute bottom-0 right-0 w-48 h-48 bg-black/10 rounded-full blur-2xl translate-y-1/4 translate-x-1/4"></div>
            
            <div className="relative z-10 md:w-[65%]">
              <h3 className="text-[22px] sm:text-2xl font-black text-white mb-2 leading-tight drop-shadow-sm">Get More, Earn More!</h3>
              <p className="text-[13px] sm:text-sm text-white/90 mb-6 leading-relaxed font-medium">Invite more friends and unlock higher rewards across all levels.</p>
              
              <motion.button onClick={() => setIsLearnMoreOpen(true)} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="w-fit px-6 py-3 rounded-xl bg-white text-[#7C3AED] hover:bg-gray-50 font-black text-sm shadow-[0_4px_15px_rgba(0,0,0,0.1)] transition-colors flex justify-center items-center gap-2">
                Learn More <ArrowRight className="w-4 h-4" />
              </motion.button>
            </div>
            
            <motion.div 
              animate={{ y: [0, -8, 0] }} 
              transition={{ duration: 3.5, repeat: Number.POSITIVE_INFINITY, ease: 'easeInOut' }} 
              className="absolute right-8 top-1/2 -translate-y-1/2 z-0 hidden sm:block"
            >
              <div className="relative w-28 h-28">
                <div className="absolute inset-0 bg-[#FCD34D]/30 blur-[30px] rounded-full"></div>
                <div className="relative w-full h-full transform -rotate-12">
                  <div className="absolute bottom-2 left-3 w-20 h-14 bg-gradient-to-br from-[#FBBF24] to-[#D97706] rounded-md shadow-lg border-b-[3px] border-r-[3px] border-[#B45309]/40"></div>
                  <div className="absolute bottom-2 left-[44px] w-4 h-14 bg-gradient-to-b from-[#F43F5E] to-[#BE123C] shadow-sm"></div>
                  <div className="absolute bottom-7 left-3 w-20 h-4 bg-gradient-to-r from-[#F43F5E] to-[#BE123C] shadow-sm opacity-50"></div>
                  <div className="absolute bottom-16 left-1 w-[88px] h-[18px] bg-gradient-to-br from-[#FCD34D] to-[#F59E0B] rounded-[4px] shadow-md border-b-[3px] border-[#B45309]/30 z-10"></div>
                  <div className="absolute bottom-16 left-[44px] w-4 h-[18px] bg-gradient-to-b from-[#FB7185] to-[#E11D48] shadow-sm z-10"></div>
                  <div className="absolute bottom-[78px] left-[26px] w-6 h-6 border-[4px] border-[#F43F5E] rounded-full transform -rotate-45 skew-x-12 shadow-sm z-10"></div>
                  <div className="absolute bottom-[78px] left-[46px] w-6 h-6 border-[4px] border-[#F43F5E] rounded-full transform rotate-45 -skew-x-12 shadow-sm z-10"></div>
                  <div className="absolute bottom-[76px] left-[42px] w-3 h-3 bg-[#E11D48] rounded-full z-20 shadow-sm"></div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* TABS SECTION */}
        <div className="w-full bg-[#161821] border border-white/5 rounded-[24px] p-6 shadow-xl">
          <div className="flex flex-wrap items-center gap-6 border-b border-white/5 mb-6">
            {[
              { id: 'tier', label: 'Level Structure' },
              { id: 'affiliate', label: 'Affiliate Stats' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`relative pb-3 text-[13px] font-bold transition-colors cursor-pointer ${activeTab === tab.id ? 'text-white' : 'text-[#8F95A3] hover:text-white'}`}
              >
                {tab.label}
                {activeTab === tab.id && (
                  <motion.div layoutId="affiliateTab" className="absolute bottom-[-1px] left-0 w-full h-[2px] bg-[#8B5CF6] shadow-[0_0_10px_rgba(139,92,246,0.5)]" />
                )}
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
          
          {/* LEVEL STRUCTURE TAB CONTENT */}
          {activeTab === 'tier' && (
            <motion.div key="tier" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }}>
              <div className="mb-6 flex flex-col gap-2 bg-[#0B0D14] border border-white/5 p-4 rounded-2xl">
                 <div className="flex justify-between items-center text-sm font-bold">
                    <span className="text-white flex items-center gap-2">
                       <Award className="w-4 h-4 text-[#8B5CF6]"/> Current Earnings
                    </span>
                    <span className="text-[#00E57A]">{formatPrice(Number(tierData?.currentReferralEarning || 0), currency)}</span>
                 </div>
              </div>

              <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-4">
                {tierData?.levels?.map((tier: any, idx: number) => {
                  const levelNum = tier.level;
                  const isCurrent = levelNum === tierData.currentTier;
                  const isCompleted = levelNum < tierData.currentTier;
                  const isLocked = levelNum > tierData.currentTier;
                  
                  const reqEarnings = Number(tier.referralAmount) || 0;
                  const reqText = `${formatPrice(reqEarnings, currency)}+ Referral Earnings`;
                  const comm = tier.commissionPercent;

                  return (
                    <motion.div 
                      key={idx} 
                      variants={fadeUp} 
                      custom={idx} 
                      whileHover={{ y: -4, scale: 1.015 }} 
                      transition={{ type: 'spring', stiffness: 260, damping: 20 }} 
                      className={`relative bg-[#0B0D14] border ${isCurrent ? 'border-[#8B5CF6] shadow-[0_0_15px_rgba(139,92,246,0.15)]' : isCompleted ? 'border-[#00E57A]/40' : 'border-white/5'} rounded-2xl p-4 flex flex-col ${isLocked ? 'opacity-60 grayscale-[50%]' : ''}`}
                    >
                        {isCurrent && (
                          <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 400, damping: 15, delay: 0.1 }} className="absolute -top-2 right-4 px-2 py-0.5 rounded text-[9px] font-black tracking-widest bg-[#c084fc] text-white uppercase shadow-md">
                            Current
                          </motion.div>
                        )}
                        {isCompleted && (
                          <div className="absolute -top-2 right-4 px-2 py-0.5 rounded text-[9px] font-black tracking-widest bg-[#00E57A] text-[#05070A] uppercase shadow-md flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Done
                          </div>
                        )}
                        
                        <div className="flex justify-between items-center mb-5">
                          <div className="flex items-center gap-2">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                              isLocked ? 'bg-white/5 text-[#8F95A3]' :
                              levelNum <= 2 ? 'bg-[#8B5CF6]/20 text-[#A855F7]' : 
                              levelNum <= 4 ? 'bg-[#EC4899]/20 text-[#EC4899]' : 
                              levelNum <= 6 ? 'bg-[#10B981]/20 text-[#10B981]' : 
                              'bg-amber-500/20 text-amber-500'
                            }`}>
                              {isLocked ? <Lock className="w-4 h-4" /> : getAchievementIcon(levelNum)}
                            </div>
                            <span className="font-bold text-white text-sm">Level {levelNum}</span>
                          </div>
                          <div className={`flex items-center gap-1 text-xs font-bold ${isLocked ? 'text-[#8F95A3]' : 'text-white'}`}>
                            <Users className="w-3.5 h-3.5 text-[#8B5CF6]" /> {comm}%
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <span className="text-[10px] text-[#8F95A3] block mb-1">Target Requirements</span>
                            <div className="flex items-center gap-1.5 text-xs text-white font-medium">
                              <CheckCircle2 className={`w-3.5 h-3.5 ${isCurrent || isCompleted ? 'text-[#00E57A]' : 'text-white/20'}`} />
                              {reqText}
                            </div>
                          </div>
                          <div>
                            <span className="text-[10px] text-[#8F95A3] block mb-1">Commission Rate</span>
                            <span className="text-xs text-white font-medium">{comm}% on every payout</span>
                          </div>
                        </div>
                    </motion.div>
                  );
                })}
              </motion.div>
              
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }} className="w-full bg-[#8B5CF6]/10 border border-[#8B5CF6]/20 rounded-xl p-3 flex items-center gap-2">
                <Info className="w-4 h-4 text-[#8B5CF6] shrink-0" />
                <p className="text-xs text-[#8F95A3]">Levels are based on your total referral earnings. Once you hit the required earnings target, your commission rate upgrades automatically.</p>
              </motion.div>
            </motion.div>
          )}

          {/* AFFILIATE STATS TAB CONTENT */}
          {activeTab === 'affiliate' && (
            <motion.div key="affiliate" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.25 }} className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="py-3 px-4 text-[11px] font-bold text-[#8F95A3] uppercase">User</th>
                    <th className="py-3 px-4 text-[11px] font-bold text-[#8F95A3] uppercase">Earn</th>
                    <th className="py-3 px-4 text-[11px] font-bold text-[#8F95A3] uppercase">Pending Amount</th>
                    <th className="py-3 px-4 text-[11px] font-bold text-[#8F95A3] uppercase">Reversed Amount</th>
                    <th className="py-3 px-4 text-[11px] font-bold text-[#8F95A3] uppercase">Completed Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {affiliateUsers.length === 0 ? (
                    <tr><td colSpan={5} className="py-10 text-center text-[#8F95A3] text-sm">No referrals found.</td></tr>
                  ) : (
                    affiliateUsers.map((user, idx) => (
                      <motion.tr key={idx} custom={idx} initial="hidden" animate="visible" variants={rowFade} className="border-b border-white/5 hover:bg-white/[0.02]">
                        <td className="py-3 px-4 text-xs font-bold text-white">{user.userName || 'User'}</td>
                        <td className="py-3 px-4 text-xs font-bold text-white">{formatPrice(Number(user.totalEarning || 0), currency)}</td>
                        <td className="py-3 px-4 text-xs font-bold text-amber-500">{formatPrice(Number(user.processingCommission || 0), currency)}</td>
                        <td className="py-3 px-4 text-xs font-bold text-red-400">{formatPrice(Number(user.reverseCommission || 0), currency)}</td>
                        <td className="py-3 px-4 text-xs font-bold text-[#10B981]">{formatPrice(Number(user.netCommission || 0), currency)}</td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </motion.div>
          )}

         </AnimatePresence>
        </div>

        {/* FEATURES BANNER */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.5 }} className="bg-[#161821] border border-white/5 rounded-[20px] p-6 shadow-xl mt-8 flex flex-col lg:flex-row items-start lg:items-center gap-6 lg:gap-10 hover:border-white/10 transition-colors">
           <div className="flex items-center gap-3 shrink-0">
             <motion.div animate={{ rotate: [0, 15, -15, 0] }} transition={{ duration: 2.5, repeat: Number.POSITIVE_INFINITY, repeatDelay: 1.5 }} className="w-8 h-8 bg-amber-500/20 rounded-lg flex items-center justify-center">
                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
             </motion.div>
             <h3 className="text-sm font-bold text-white">Why Join BinnyCash Affiliate?</h3>
           </div>
           
           <motion.div variants={staggerContainer} initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.3 }} className="flex-1 grid grid-cols-2 md:grid-cols-5 gap-4">
              {[
                { icon: Percent, color: 'text-[#8B5CF6]', bg: 'bg-[#8B5CF6]/10', title: currentBonusInfo.referalBonus, sub: 'Commission Rate' },
                { icon: Infinity, color: 'text-[#10B981]', bg: 'bg-[#10B981]/10', title: 'Lifetime', sub: 'Earnings' },
                { icon: Zap, color: 'text-[#F59E0B]', bg: 'bg-[#F59E0B]/10', title: 'Instant', sub: 'Payouts' },
                { icon: BarChart2, color: 'text-[#3B82F6]', bg: 'bg-[#3B82F6]/10', title: 'Real-time', sub: 'Tracking' },
                { icon: Users, color: 'text-[#EC4899]', bg: 'bg-[#EC4899]/10', title: 'No Limits', sub: 'Referrals' }
              ].map((f, i) => (
                <motion.div variants={fadeUp} whileHover={{ y: -3, scale: 1.05 }} key={i} className="flex items-center gap-3">
                   <div className={`w-10 h-10 rounded-full ${f.bg} flex items-center justify-center shrink-0`}>
                     <f.icon className={`w-4 h-4 ${f.color}`} />
                   </div>
                   <div className="flex flex-col">
                     <span className="text-xs font-bold text-white">{f.title}</span>
                     <span className="text-[10px] text-[#8F95A3]">{f.sub}</span>
                   </div>
                </motion.div>
              ))}
           </motion.div>
        </motion.div>

        {/* BOTTOM HELP BANNER */}
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.3 }} transition={{ duration: 0.5 }} className="mt-8 bg-[#161821] border border-white/5 rounded-2xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl hover:border-white/10 transition-colors">
           <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-[#8B5CF6]/10 flex items-center justify-center shrink-0">
                 <Headphones className="w-5 h-5 text-[#8B5CF6]" />
              </div>
              <div>
                 <h3 className="text-sm font-bold text-white mb-0.5">Need Help?</h3>
                 <p className="text-xs text-[#8F95A3]">Our support team is here to help you with any questions you have.</p>
              </div>
           </div>
           
           <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
             <Link href="/support" className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white font-bold text-xs transition-colors flex items-center gap-2 cursor-pointer shrink-0">
                <Headphones className="w-4 h-4" /> Contact Support <ArrowRight className="w-3.5 h-3.5" />
             </Link>
           </motion.div>
        </motion.div>

      </motion.main>

      {/* --- LEARN MORE MODAL --- */}
      <AnimatePresence>
        {isLearnMoreOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsLearnMoreOpen(false)} className="absolute inset-0 bg-black/80 backdrop-blur-sm cursor-pointer" />
            
            <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="relative w-full max-w-md bg-[#161821] border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl z-10 overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-[#8B5CF6]/20 to-transparent pointer-events-none" />
              
              <motion.button onClick={() => setIsLearnMoreOpen(false)} whileHover={{ rotate: 90, scale: 1.1 }} whileTap={{ scale: 0.9 }} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 text-[#8F95A3] hover:text-white transition-colors cursor-pointer">
                <X className="w-4 h-4" />
              </motion.button>

              <div className="relative z-10">
                <motion.div initial={{ scale: 0, rotate: -20 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 260, damping: 18, delay: 0.1 }} className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED] flex items-center justify-center shadow-lg mb-5">
                  <Star className="w-6 h-6 text-white fill-white" />
                </motion.div>
                
                <h2 className="text-2xl font-black text-white mb-2 leading-tight">Maximize Your Earnings</h2>
                <p className="text-[#8F95A3] text-sm mb-6">Invite friends, build your network, and earn a passive income with our structured level system.</p>

                <motion.div variants={staggerContainer} initial="hidden" animate="visible" className="space-y-4 mb-8">
                  {[
                    { icon: Percent, color: 'text-[#8B5CF6]', bg: 'bg-[#8B5CF6]/10', title: 'Level Up Commission', desc: 'Start earning at 3% and climb all the way to 10% commission on every payout your referral makes.' },
                    { icon: Infinity, color: 'text-[#10B981]', bg: 'bg-[#10B981]/10', title: 'Lifetime Passive Income', desc: 'There is no time limit. As long as your referrals keep earning and withdrawing, you keep making money.' },
                    { icon: Zap, color: 'text-[#F59E0B]', bg: 'bg-[#F59E0B]/10', title: 'Instant Crediting', desc: 'Once a referred user successfully cashes out, your commission is instantly added to your available balance.' }
                  ].map((item, i) => (
                    <motion.div variants={fadeUp} custom={i} key={i} className="flex gap-4">
                       <div className={`w-8 h-8 rounded-full ${item.bg} flex items-center justify-center shrink-0 mt-0.5`}>
                         <item.icon className={`w-4 h-4 ${item.color}`} />
                       </div>
                       <div>
                         <h4 className="text-white font-bold text-sm">{item.title}</h4>
                         <p className="text-xs text-[#8F95A3] mt-1">{item.desc}</p>
                       </div>
                    </motion.div>
                  ))}
                </motion.div>

                <motion.button onClick={() => setIsLearnMoreOpen(false)} whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }} className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] text-white font-bold shadow-[0_4px_15px_rgba(139,92,246,0.3)] transition-all cursor-pointer">
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