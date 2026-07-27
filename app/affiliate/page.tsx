'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Copy, Users, ShieldAlert, Clock, Wallet, DollarSign,
  MessageCircle, AtSign, Send, CheckCircle2, Circle, AlertCircle, Search, ChevronDown
} from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState<'tier' | 'affiliate' | 'history'>('tier');
  
  // API States
  const [dashboardData, setDashboardData] = useState<any>({
    totalReferUsers: 0,
    totalReferEarning: 0,
    totalProcessingAmount: 0,
    totalReferReverse: 0,
    totalNetCommission: 0
  });
  
  const [referralLink, setReferralLink] = useState('Loading...');
  const [walletBalance, setWalletBalance] = useState<string>('0.00'); // Added Wallet Balance State
  
  const [tierData, setTierData] = useState<any>({
    currentTier: 1,
    currentReferralEarning: 0,
    tiers: []
  });

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
        // 1. Fetch Dashboard Stats
        const dashRes = await fetch(`https://apitest.binnycash.com/api/user/affiliate_dashboard?userId=${userId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const dashJson = await dashRes.json();
        if (dashJson.code === 200 && dashJson.data) {
          setDashboardData(dashJson.data);
        }

        // 2. Fetch User Profile (for referral URL)
        const profileRes = await fetch(`https://apitest.binnycash.com/api/user/viewData?userId=${userId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const profileJson = await profileRes.json();
        if (profileJson.code === 200 && profileJson.data?.user?.referralUrl) {
          setReferralLink(profileJson.data.user.referralUrl);
        }

        // 3. Fetch Tier Data
        const tierRes = await fetch(`https://apitest.binnycash.com/api/user/affiliateTierLevel?userId=${userId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const tierJson = await tierRes.json();
        if (tierJson.code === 200 && tierJson.data) {
          setTierData(tierJson.data);
        }

        // 4. Fetch Actual Wallet Total Earnings
        const walletRes = await fetch('https://apitest.binnycash.com/api/user/wallet/total-earning', {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const walletJson = await walletRes.json();
        if (walletJson && walletJson.data !== undefined) {
          setWalletBalance(walletJson.data);
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

  return (
    <div className="min-h-screen bg-[#08070D] text-[#F5F3FF] relative overflow-x-hidden pb-16">
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(166,108,255,0.35); border-radius: 10px; }
      `}</style>

      {/* Ambient backdrop */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-24 w-[520px] h-[520px] bg-[#A66CFF]/10 blur-[120px] rounded-full" />
        <div className="absolute top-1/3 -right-32 w-[420px] h-[420px] bg-[#FFC94A]/[0.05] blur-[130px] rounded-full" />
      </div>

      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        
        {/* HEADER */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Affiliate</h1>
            <p className="text-[#8D89A8] text-sm mt-1">Become an affiliate and earn money for every referral.</p>
          </div>
          <div className="px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[10px] font-bold text-[#8D89A8] flex items-center gap-1.5 shadow-md">
            <span className="w-1.5 h-1.5 rounded-full bg-[#3DE8A0] animate-pulse" /> Live affiliate overview
          </div>
        </div>

        {/* TOP STATS GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          
          {/* BALANCE CARD (Now linked to wallet/total-earning) */}
          <div className="bg-[#120F1A] border border-white/[0.06] rounded-[24px] p-6 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 rounded-2xl bg-[#A66CFF]/10 flex items-center justify-center border border-[#A66CFF]/20 shadow-inner">
                  <Wallet className="w-7 h-7 text-[#A66CFF]" />
                </div>
                <div>
                  <h3 className="text-[10px] font-bold text-[#8D89A8] tracking-widest uppercase">Available Balance</h3>
                  <div className="text-3xl font-black text-white mt-1 f-mono">
                    ${parseFloat(walletBalance || '0').toFixed(2)}
                  </div>
                </div>
              </div>
              <p className="text-[11px] text-[#8D89A8] mb-6 font-medium">Ready to withdraw • Min $5</p>
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

          {/* PERFORMANCE CARDS */}
          <div className="lg:col-span-2 bg-[#120F1A] border border-white/[0.06] rounded-[24px] p-6 shadow-xl">
            <h3 className="text-xs font-bold text-[#8D89A8] mb-4">Affiliate performance</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-[#1A1725] rounded-2xl p-4 flex items-center gap-4 border border-white/5">
                <div className="w-10 h-10 rounded-full bg-[#A66CFF]/10 flex items-center justify-center shrink-0">
                  <DollarSign className="w-5 h-5 text-[#A66CFF]" />
                </div>
                <div>
                  <div className="text-lg font-black text-white f-mono">${parseFloat(dashboardData?.totalNetCommission || 0).toFixed(2)}</div>
                  <div className="text-xs text-[#8D89A8]">Net Commission</div>
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
                  <ShieldAlert className="w-5 h-5 text-amber-500" />
                </div>
                <div>
                  <div className="text-lg font-black text-white f-mono">${parseFloat(dashboardData?.totalProcessingAmount || 0).toFixed(2)}</div>
                  <div className="text-xs text-[#8D89A8]">Processing Commissions</div>
                </div>
              </div>

              <div className="bg-[#1A1725] rounded-2xl p-4 flex items-center gap-4 border border-white/5">
                <div className="w-10 h-10 rounded-full bg-red-500/10 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5 text-red-500" />
                </div>
                <div>
                  <div className="text-lg font-black text-white f-mono">${parseFloat(dashboardData?.totalReferReverse || 0).toFixed(2)}</div>
                  <div className="text-xs text-[#8D89A8]">Reversal Commissions</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* REFERRAL LINK SECTION */}
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
              <button className="w-9 h-9 rounded-full bg-[#1A1725] hover:bg-[#231F33] flex items-center justify-center border border-white/5 transition-colors group">
                <MessageCircle className="w-4 h-4 text-[#3DE8A0] group-hover:scale-110 transition-transform" />
              </button>
              <button className="w-9 h-9 rounded-full bg-[#1A1725] hover:bg-[#231F33] flex items-center justify-center border border-white/5 transition-colors group">
                {/* Facebook Inline SVG */}
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-[#3b5998] group-hover:scale-110 transition-transform">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                </svg>
              </button>
              <button className="w-9 h-9 rounded-full bg-[#1A1725] hover:bg-[#231F33] flex items-center justify-center border border-white/5 transition-colors group">
                <AtSign className="w-4 h-4 text-[#FFC94A] group-hover:scale-110 transition-transform" />
              </button>
              <button className="w-9 h-9 rounded-full bg-[#1A1725] hover:bg-[#231F33] flex items-center justify-center border border-white/5 transition-colors group">
                {/* Twitter/X Inline SVG */}
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4 text-[#1DA1F2] group-hover:scale-110 transition-transform">
                  <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
                </svg>
              </button>
              <button className="w-9 h-9 rounded-full bg-[#1A1725] hover:bg-[#231F33] flex items-center justify-center border border-white/5 transition-colors group">
                <Send className="w-4 h-4 text-[#0088cc] group-hover:scale-110 transition-transform" />
              </button>
            </div>
          </div>

          <p className="text-sm text-[#8D89A8] leading-relaxed mb-6 max-w-3xl">
            Earn unlimited rewards by referring your friends, family, and followers. You'll earn <span className="text-white font-bold">3%</span> of the confirmed payouts from your referred members. Keep referring more friends and watch your earnings grow!
          </p>

          <div className="relative max-w-3xl">
            <div className="flex items-center bg-[#1A1725] border border-white/10 rounded-xl overflow-hidden p-1.5 focus-within:border-[#A66CFF]/50 transition-colors">
              <input 
                type="text" 
                readOnly 
                value={referralLink} 
                className="w-full bg-transparent px-4 py-2 text-sm text-white font-bold focus:outline-none"
              />
              <button 
                onClick={handleCopy}
                className="w-10 h-10 shrink-0 rounded-lg bg-[#c084fc] hover:bg-[#a855f7] flex items-center justify-center transition-colors cursor-pointer"
              >
                {copied ? <CheckCircle2 className="w-5 h-5 text-white" /> : <Copy className="w-5 h-5 text-white" />}
              </button>
            </div>
            <p className="text-[11px] text-[#8D89A8] mt-2 ml-1">
              Share your link across social media, communities, or with close friends and start earning on every confirmed payout they make.
            </p>
          </div>
        </div>

        {/* TABS NAVIGATION */}
        <div className="flex items-center gap-6 border-b border-white/[0.06] mb-6">
          {[
            { id: 'tier', label: 'Tier' },
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

        {/* TABS CONTENT */}
        <div className="min-h-[300px]">
          
          {/* TIER TAB */}
          {activeTab === 'tier' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {(tierData?.tiers || []).map((tier: any, idx: number) => {
                const isCurrent = tier.level === tierData.currentTier;
                const isCompleted = tier.level < tierData.currentTier;
                
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
                      <div className="flex items-center gap-2">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isCurrent || isCompleted ? 'bg-[#3DE8A0]/10 text-[#3DE8A0]' : 'bg-white/5 text-[#8D89A8]'}`}>
                          <ShieldAlert className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-white">Tier {tier.level}</span>
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
                          US${parseFloat(tier.referralAmount || 0).toFixed(2)} affiliate earnings
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* AFFILIATE TAB */}
          {activeTab === 'affiliate' && (
            <div className="bg-[#120F1A] border border-white/[0.06] rounded-[24px] overflow-hidden shadow-xl">
              <div className="p-4 md:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-white/[0.06]">
                <div className="flex items-center gap-2 text-xs text-[#8D89A8]">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <p>Users who signed up using your referral code are listed here. Earn a commission every time they complete an offer!</p>
                </div>
                
                <div className="flex items-center gap-3 w-full sm:w-auto">
                  <div className="relative w-full sm:w-48">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8D89A8]" />
                    <input 
                      type="text" 
                      placeholder="Search..."
                      className="w-full bg-[#1A1725] border border-white/10 rounded-lg pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-[#A66CFF]"
                    />
                  </div>
                  <div className="flex items-center gap-2 bg-[#1A1725] border border-white/10 px-3 py-2 rounded-lg cursor-pointer">
                    <span className="text-xs text-white">All</span>
                    <ChevronDown className="w-3 h-3 text-[#A66CFF]" />
                  </div>
                </div>
              </div>

              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left border-collapse min-w-[800px]">
                  <thead>
                    <tr className="bg-white/[0.02]">
                      <th className="px-6 py-4 text-[11px] font-bold text-[#8D89A8] uppercase tracking-wider">User</th>
                      <th className="px-6 py-4 text-[11px] font-bold text-[#8D89A8] uppercase tracking-wider">Earn</th>
                      <th className="px-6 py-4 text-[11px] font-bold text-[#8D89A8] uppercase tracking-wider">Processing</th>
                      <th className="px-6 py-4 text-[11px] font-bold text-[#8D89A8] uppercase tracking-wider">Reversed</th>
                      <th className="px-6 py-4 text-[11px] font-bold text-[#8D89A8] uppercase tracking-wider">Net Commission</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td colSpan={5} className="px-6 py-16 text-center">
                        <span className="text-sm font-medium text-[#8D89A8]">No referrals found.</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* CLAIM HISTORY TAB */}
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
                    <tr>
                      <td colSpan={5} className="px-6 py-16 text-center">
                        <span className="text-sm font-medium text-[#8D89A8]">No claim history found</span>
                      </td>
                    </tr>
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