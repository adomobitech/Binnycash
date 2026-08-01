'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Copy, Users, ShieldAlert, Clock, Wallet, DollarSign,
  CheckCircle2, Circle, ShieldCheck, Medal, Star, Crown
} from 'lucide-react';
import { useCurrency, formatPrice } from '@/hooks/useCurrency';

// --- CUSTOM BRAND ICONS (Original Logos for exact look) ---
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

const EmailIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
  </svg>
);

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

export default function AffiliatePage() {
  const currency = useCurrency();
  const [activeTab, setActiveTab] = useState<'tier' | 'affiliate' | 'history'>('tier');
  
  // API States
  const [dashboardData, setDashboardData] = useState<any>({
    totalReferUsers: 0,
    totalReferEarning: 0,
    totalProcessingAmount: 0,
    totalReferReverse: 0,
    totalNetCommission: 0
  });
  
  const [availableBalance, setAvailableBalance] = useState<string>('0.00');
  const [referralLink, setReferralLink] = useState('Loading...');
  
  // 🔥 FIXED API RESPONSE KEYS HERE (levels instead of tiers) 🔥
  const [tierData, setTierData] = useState<any>({
    currentTier: 1,
    currentReferralEarning: 0,
    levels: [] 
  });

  const [claimHistory, setClaimHistory] = useState<any[]>([]);
  const [affiliateUsers, setAffiliateUsers] = useState<any[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchAffiliateData = async () => {
      setIsLoading(true);
      const token = localStorage.getItem('token') || '';
      const userId = getUserId();
      if (!userId) {
        setIsLoading(false);
        return;
      }

      try {
        // Fetch Dashboard Stats
        const dashRes = await fetch(`https://apitest.binnycash.com/api/user/affiliate_dashboard?userId=${userId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const dashJson = await dashRes.json();
        if (dashJson.code === 200 && dashJson.data) {
          setDashboardData(dashJson.data);
        }

        // Fetch Available Balance (Refer Earning Balance)
        const balanceRes = await fetch(`https://apitest.binnycash.com/api/user/wallet/refer-earning-balance`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const balanceJson = await balanceRes.json();
        if (balanceJson.code === 200 && balanceJson.data !== undefined) {
          setAvailableBalance(balanceJson.data);
        }

        // Fetch Referral URL
        const profileRes = await fetch(`https://apitest.binnycash.com/api/user/viewData?userId=${userId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const profileJson = await profileRes.json();
        if (profileJson.code === 200 && profileJson.data?.user?.referralUrl) {
          setReferralLink(profileJson.data.user.referralUrl);
        }

        // Fetch Tiers
        const tierRes = await fetch(`https://apitest.binnycash.com/api/user/affiliateTierLevel?userId=${userId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const tierJson = await tierRes.json();
        if (tierJson.code === 200 && tierJson.data) {
          setTierData(tierJson.data);
        }

        // Fetch Claim Earning History
        const historyRes = await fetch(`https://apitest.binnycash.com/api/user/wallet/claim-earning-history`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const historyJson = await historyRes.json();
        if (historyJson.code === 200 && Array.isArray(historyJson.data)) {
          setClaimHistory(historyJson.data);
        }

        // Fetch Affiliate Referred Users List
        const affiliateListRes = await fetch(`https://apitest.binnycash.com/api/user/UserReferList?userId=${userId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const affiliateListJson = await affiliateListRes.json();
        if (affiliateListJson.code === 200 && affiliateListJson.data?.users) {
          setAffiliateUsers(affiliateListJson.data.users);
        }

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

  const getLevelIcon = (level: number) => {
    if (level <= 3) return <ShieldCheck className="w-5 h-5" />;
    if (level <= 6) return <Medal className="w-5 h-5" />;
    if (level === 7) return <Star className="w-5 h-5" />;
    return <Crown className="w-5 h-5" />;
  };

  const getLevelColor = (level: number) => {
    if (level <= 3) return 'bg-[#00E57A]/10 text-[#00E57A] border-[#00E57A]/20';
    if (level <= 6) return 'bg-[#A855F7]/10 text-[#A855F7] border-[#A855F7]/20';
    if (level === 7) return 'bg-amber-400/10 text-amber-400 border-amber-400/20';
    return 'bg-amber-500/10 text-amber-500 border-amber-500/20';
  };

  return (
    <div className="min-h-screen bg-[#08070D] text-[#F5F3FF] relative overflow-x-hidden pb-16">
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(166,108,255,0.35); border-radius: 10px; }
      `}</style>

      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-24 w-[520px] h-[520px] bg-[#A66CFF]/10 blur-[120px] rounded-full" />
        <div className="absolute top-1/3 -right-32 w-[420px] h-[420px] bg-[#FFC94A]/[0.05] blur-[130px] rounded-full" />
      </div>

      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Affiliate</h1>
            <p className="text-[#8D89A8] text-sm mt-1">Become an affiliate and earn money for every referral.</p>
          </div>
          <div className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-[#8D89A8] flex items-center gap-1.5 shadow-md">
            <span className="w-1.5 h-1.5 rounded-full bg-[#3DE8A0] animate-pulse" /> Live affiliate overview
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          
          <div className="bg-[#120F1A] border border-white/[0.06] rounded-[24px] p-6 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-2xl bg-[#A66CFF]/10 flex items-center justify-center border border-[#A66CFF]/20 shadow-inner">
                  <Wallet className="w-7 h-7 text-[#A66CFF]" />
                </div>
                <div>
                  <h3 className="text-[10px] font-bold text-[#8D89A8] tracking-widest uppercase">Available Balance</h3>
                  <div className="text-3xl font-black text-white mt-1 f-mono">
                    {formatPrice(Number(availableBalance) || 0, currency)}
                  </div>
                </div>
              </div>
              <p className="text-[11px] text-[#8D89A8] mb-6 font-medium">Ready to withdraw • Min {formatPrice(5, currency)}</p>
            </div>
            
            <div className="space-y-4">
              <button className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#c084fc] to-[#a855f7] hover:opacity-90 text-white font-bold text-sm shadow-[0_0_20px_rgba(168,85,247,0.4)] transition-all cursor-pointer">
                Withdraw now
              </button>
              <div className="flex items-center justify-center gap-1.5 text-[10px] text-[#8D89A8]">
                <ShieldAlert className="w-3.5 h-3.5 text-[#A66CFF]" /> Secure payout • Processed instantly
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 bg-[#120F1A] border border-white/[0.06] rounded-[24px] p-6 shadow-xl">
            <h3 className="text-xs font-bold text-[#8D89A8] mb-4">Affiliate performance</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-[#1A1725] rounded-2xl p-4 flex items-center gap-4 border border-white/5">
                <div className="w-10 h-10 rounded-full bg-[#00E57A]/10 flex items-center justify-center shrink-0">
                  <DollarSign className="w-5 h-5 text-[#00E57A]" />
                </div>
                <div>
                  <div className="text-lg font-black text-white f-mono">{formatPrice(Number(dashboardData?.totalReferEarning) || 0, currency)}</div>
                  <div className="text-xs text-[#8D89A8]">Total Earned Commission</div>
                </div>
              </div>

              <div className="bg-[#1A1725] rounded-2xl p-4 flex items-center gap-4 border border-white/5">
                <div className="w-10 h-10 rounded-full bg-[#A66CFF]/10 flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5 text-[#A66CFF]" />
                </div>
                <div>
                  <div className="text-lg font-black text-white f-mono">{dashboardData?.totalReferUsers || 0}</div>
                  <div className="text-xs text-[#8D89A8]">Referrals</div>
                </div>
              </div>

              <div className="bg-[#1A1725] rounded-2xl p-4 flex items-center gap-4 border border-white/5">
                <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <div className="text-lg font-black text-white f-mono">{formatPrice(Number(dashboardData?.totalProcessingAmount) || 0, currency)}</div>
                  <div className="text-xs text-[#8D89A8]">Pending Commission</div>
                </div>
              </div>

              <div className="bg-[#1A1725] rounded-2xl p-4 flex items-center gap-4 border border-white/5">
                <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <div className="text-lg font-black text-white f-mono">{formatPrice(Number(dashboardData?.totalReferReverse) || 0, currency)}</div>
                  <div className="text-xs text-[#8D89A8]">Reverse Commission</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* FULL WIDTH REFERRAL BLOCK WITH SOCIAL SHARE */}
        <div className="bg-[#120F1A] border border-white/[0.06] rounded-[24px] p-6 shadow-xl mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
            <div>
              <span className="text-[10px] font-bold text-[#8D89A8] tracking-widest uppercase">Referral Program</span>
              <div className="flex items-center gap-2 mt-1">
                <h2 className="text-xl font-bold text-white">Refer & Earn</h2>
                <span className="px-2 py-0.5 rounded-full bg-[#A66CFF]/20 text-[#A66CFF] text-[10px] font-bold border border-[#A66CFF]/30">New</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <a href={`https://api.whatsapp.com/send?text=${encodeURIComponent(referralLink)}`} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-[#25D366]/10 hover:bg-[#25D366]/20 flex items-center justify-center border border-[#25D366]/30 transition-all text-[#25D366] shadow-[0_0_15px_rgba(37,211,102,0.15)]">
                <WhatsAppIcon className="w-5 h-5" />
              </a>
              <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(referralLink)}`} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-[#1877F2]/10 hover:bg-[#1877F2]/20 flex items-center justify-center border border-[#1877F2]/30 transition-all text-[#1877F2] shadow-[0_0_15px_rgba(24,119,242,0.15)]">
                <FacebookIcon className="w-5 h-5" />
              </a>
              <a href={`mailto:?body=${encodeURIComponent(referralLink)}`} className="w-10 h-10 rounded-full bg-[#EA4335]/10 hover:bg-[#EA4335]/20 flex items-center justify-center border border-[#EA4335]/30 transition-all text-[#EA4335] shadow-[0_0_15px_rgba(234,67,53,0.15)]">
                <EmailIcon className="w-5 h-5" />
              </a>
              <a href={`https://twitter.com/intent/tweet?url=${encodeURIComponent(referralLink)}`} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-[#1DA1F2]/10 hover:bg-[#1DA1F2]/20 flex items-center justify-center border border-[#1DA1F2]/30 transition-all text-[#1DA1F2] shadow-[0_0_15px_rgba(29,161,242,0.15)]">
                <TwitterIcon className="w-4 h-4" />
              </a>
              <a href={`https://t.me/share/url?url=${encodeURIComponent(referralLink)}`} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-[#0088cc]/10 hover:bg-[#0088cc]/20 flex items-center justify-center border border-[#0088cc]/30 transition-all text-[#0088cc] shadow-[0_0_15px_rgba(0,136,204,0.15)]">
                <TelegramIcon className="w-5 h-5 ml-[-2px]" />
              </a>
            </div>
          </div>

          <p className="text-sm text-[#8D89A8] leading-relaxed mb-6 max-w-full">
            Earn unlimited rewards by referring your friends, family, and followers. You'll earn <span className="text-white font-bold">3%</span> of the confirmed payouts from your referred members. Keep referring more friends and watch your earnings grow!
          </p>

          <div className="relative w-full">
            <div className="flex items-center w-full bg-[#1A1725] border border-white/10 rounded-xl overflow-hidden p-1.5 focus-within:border-[#A66CFF]/50 transition-colors">
              <input 
                type="text" 
                readOnly 
                value={referralLink} 
                className="w-full bg-transparent px-4 py-2 text-sm text-white font-bold focus:outline-none"
              />
              <button 
                onClick={handleCopy}
                className="w-12 h-11 shrink-0 rounded-lg bg-[#c084fc] hover:bg-[#a855f7] flex items-center justify-center transition-colors cursor-pointer"
              >
                {copied ? <CheckCircle2 className="w-5 h-5 text-white" /> : <Copy className="w-5 h-5 text-white" />}
              </button>
            </div>
            <p className="text-[11px] text-[#8D89A8] mt-2 pl-1">Share your link across social media, communities, or with close friends and start earning on every confirmed payout they make.</p>
          </div>
        </div>

        <div className="flex items-center gap-6 border-b border-white/[0.06] mb-6">
          {[
            { id: 'tier', label: 'Level' },
            { id: 'affiliate', label: 'Affiliate' },
            { id: 'history', label: 'Claim history' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`relative pb-3 text-sm font-bold transition-colors cursor-pointer ${activeTab === tab.id ? 'text-white' : 'text-[#8D89A8] hover:text-white'}`}
            >
              {tab.label}
              {activeTab === tab.id && (
                <motion.div layoutId="affiliateTab" className="absolute bottom-0 left-0 w-full h-[3px] bg-[#A66CFF] rounded-t-full shadow-[0_0_10px_rgba(166,108,255,0.6)]" />
              )}
            </button>
          ))}
        </div>

        <div className="min-h-[300px]">
          {activeTab === 'tier' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* 🔥 FIXED MAPPING HERE (levels instead of tiers) 🔥 */}
              {(tierData?.levels || []).map((tier: any, idx: number) => {
                const isCurrent = tier.level === tierData.currentTier;
                const isCompleted = tier.level < tierData.currentTier;
                const colorClasses = getLevelColor(tier.level);
                
                return (
                  <div 
                    key={idx} 
                    className={`relative bg-[#120F1A] rounded-2xl p-5 border transition-all ${isCurrent ? 'border-[#A66CFF] shadow-[0_0_15px_rgba(166,108,255,0.15)]' : 'border-white/[0.06]'}`}
                  >
                    {isCurrent && (
                      <div className="absolute -top-3 -right-2 px-2 py-0.5 rounded-md bg-[#c084fc] text-white text-[9px] font-black tracking-widest uppercase shadow-md">
                        Current
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center mb-6">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${isCurrent || isCompleted ? colorClasses : 'bg-white/5 text-[#8D89A8] border-transparent'}`}>
                          {getLevelIcon(tier.level)}
                        </div>
                        <span className="font-bold text-white text-base">Level {tier.level}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-xs font-bold text-[#A66CFF]">
                        <Users className="w-3.5 h-3.5" /> {tier.commissionPercent}% commission
                      </div>
                    </div>

                    <div className="border-t border-white/5 pt-4">
                      <span className="text-[11px] text-[#8D89A8] mb-2 block">Requirements</span>
                      <div className="flex items-center gap-2">
                        {isCompleted || isCurrent ? (
                          <CheckCircle2 className="w-4 h-4 text-[#A66CFF] shrink-0" />
                        ) : (
                          <Circle className="w-4 h-4 text-white/20 shrink-0" />
                        )}
                        <span className="text-xs text-white">
                          US{formatPrice(Number(tier.referralAmount) || 0, currency)} affiliate earnings
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'affiliate' && (
            <div className="bg-[#120F1A] border border-white/[0.06] rounded-[24px] overflow-hidden shadow-xl">
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead>
                    <tr className="bg-white/[0.02] border-b border-white/[0.06]">
                      <th className="px-6 py-4 text-[11px] font-bold text-[#8D89A8] uppercase tracking-wider">User</th>
                      <th className="px-6 py-4 text-[11px] font-bold text-[#8D89A8] uppercase tracking-wider">Earn</th>
                      <th className="px-6 py-4 text-[11px] font-bold text-[#8D89A8] uppercase tracking-wider">Pending</th>
                      <th className="px-6 py-4 text-[11px] font-bold text-[#8D89A8] uppercase tracking-wider">Reversed</th>
                      <th className="px-6 py-4 text-[11px] font-bold text-[#8D89A8] uppercase tracking-wider">Net Commission</th>
                    </tr>
                  </thead>
                  <tbody>
                    {affiliateUsers.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-16 text-center">
                          <span className="text-sm font-medium text-[#8D89A8]">No referrals found.</span>
                        </td>
                      </tr>
                    ) : (
                      affiliateUsers.map((user, idx) => {
                        let avatar = user.profileImage;
                        const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(user.userName || 'U')}&background=A855F7&color=fff`;
                        
                        if (avatar) {
                          if (!avatar.startsWith('http')) {
                            avatar = `https://apitest.binnycash.com${avatar.startsWith('/') ? '' : '/'}${avatar}`;
                          }
                          avatar = avatar.replace('binycash.com', 'binnycash.com'); 
                        } else {
                          avatar = fallbackAvatar;
                        }

                        return (
                          <tr key={idx} className="border-b border-white/[0.06] hover:bg-white/[0.02] transition-colors">
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                <img 
                                  src={avatar} 
                                  alt="User" 
                                  onError={(e) => { e.currentTarget.src = fallbackAvatar; }}
                                  className="w-10 h-10 rounded-full bg-white/5 object-cover shrink-0 border border-white/10" 
                                />
                                <div className="flex flex-col">
                                  <span className="text-xs font-bold text-white">{user.userName || 'Unknown'}</span>
                                  <span className="text-[10px] text-[#8D89A8]">Joined {new Date(user.joiningDate).toLocaleDateString()}</span>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-xs font-bold text-white">{formatPrice(Number(user.totalEarning || 0), currency)}</td>
                            <td className="px-6 py-4 text-xs font-bold text-amber-500">{formatPrice(Number(user.processingCommission || 0), currency)}</td>
                            <td className="px-6 py-4 text-xs font-bold text-red-400">{formatPrice(Number(user.reverseCommission || 0), currency)}</td>
                            <td className="px-6 py-4 text-xs font-bold text-[#00E57A]">{formatPrice(Number(user.netCommission || 0), currency)}</td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="bg-[#120F1A] border border-white/[0.06] rounded-[24px] overflow-hidden shadow-xl">
              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead>
                    <tr className="bg-white/[0.02] border-b border-white/[0.06]">
                      <th className="px-6 py-4 text-[11px] font-bold text-[#8D89A8] uppercase tracking-wider text-center">Claim ID</th>
                      <th className="px-6 py-4 text-[11px] font-bold text-[#8D89A8] uppercase tracking-wider text-center">Date</th>
                      <th className="px-6 py-4 text-[11px] font-bold text-[#8D89A8] uppercase tracking-wider text-center">Method</th>
                      <th className="px-6 py-4 text-[11px] font-bold text-[#8D89A8] uppercase tracking-wider text-center">Amount</th>
                      <th className="px-6 py-4 text-[11px] font-bold text-[#8D89A8] uppercase tracking-wider text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {claimHistory.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-16 text-center">
                          <span className="text-sm font-medium text-[#8D89A8]">No claim history found</span>
                        </td>
                      </tr>
                    ) : (
                      claimHistory.map((claim, idx) => (
                        <tr key={idx} className="border-b border-white/[0.06] hover:bg-white/[0.02]">
                          <td className="px-6 py-4 text-center text-xs text-white">{claim._id || claim.id || claim.claimId || 'N/A'}</td>
                          <td className="px-6 py-4 text-center text-xs text-[#8D89A8]">{claim.createdAt || claim.date ? new Date(claim.createdAt || claim.date).toLocaleDateString() : 'N/A'}</td>
                          <td className="px-6 py-4 text-center text-xs text-white">{claim.method || 'N/A'}</td>
                          <td className="px-6 py-4 text-center text-xs text-[#00E57A] font-bold">{formatPrice(Number(claim.amount || 0), currency)}</td>
                          <td className="px-6 py-4 text-center text-xs text-white">{claim.status || 'Completed'}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}