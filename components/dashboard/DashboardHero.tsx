'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  ArrowRight, Wallet, TrendingUp, 
  Clock, CheckCircle2, Users, UserPlus, ArrowUpRight, ArrowDownRight, Loader2
} from 'lucide-react';
import HeroWallet from './HeroWallet'; 
import { useCurrency, formatPrice } from '@/hooks/useCurrency';

export default function DashboardHero() {
  const currency = useCurrency();
  const [userName, setUserName] = useState<string>('...');
  const [isLoading, setIsLoading] = useState(true);

  // New API State
  const [summaryData, setSummaryData] = useState({
    availableBalance: 0,
    todayEarning: 0,
    todayEarningsChangePercent: 0,
    pendingEarning: 0,
    completedOffers: 0,
    referralEarning: 0,
    totalReferrals: 0,
    asOf: ""
  });

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      if (!token) return;

      const headers = { 
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json' 
      };

      try {
        // 1. Fetch Basic User Data for the Banner (Name)
        fetch('https://apitest.binnycash.com/api/user/viewData', { headers })
          .then(res => res.json())
          .then(data => {
            const user = data?.data?.user || data?.data;
            if (user) setUserName(user.userName || user.firstName || 'User');
          }).catch(console.error);

        // 2. NEW DYNAMIC API: Fetch Dashboard Summary
        const summaryRes = await fetch('https://apitest.binnycash.com/api/user/dashboardSummary', { headers });
        const summaryJson = await summaryRes.json();

        if (summaryJson.code === 200 && summaryJson.data) {
          setSummaryData({
            availableBalance: Number(summaryJson.data.availableBalance) || 0,
            todayEarning: Number(summaryJson.data.todayEarning) || 0,
            todayEarningsChangePercent: Number(summaryJson.data.todayEarningsChangePercent) || 0,
            pendingEarning: Number(summaryJson.data.pendingEarning) || 0,
            completedOffers: Number(summaryJson.data.completedOffers) || 0,
            referralEarning: Number(summaryJson.data.referralEarning) || 0,
            totalReferrals: Number(summaryJson.data.totalReferrals) || 0,
            asOf: summaryJson.data.asOf || ""
          });
        }
      } catch (err) {
        console.error("Error fetching dashboard statistics", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <div className="w-full flex flex-col xl:flex-row gap-3 mb-4 font-sans">
      
      {/* LEFT BANNER */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.5 }}
        className="w-full xl:w-[38%] relative bg-[#171520] border border-white/5 rounded-[16px] overflow-hidden p-5 sm:p-6 flex flex-col justify-center min-h-[140px] shadow-lg"
      >
        <div className="absolute top-0 right-0 w-[150px] h-[150px] bg-[#8B5CF6]/15 blur-[60px] rounded-full pointer-events-none" />

        <div className="relative z-10 w-full sm:w-[70%]">
          <p className="text-[#8F95A3] text-sm font-bold mb-1 tracking-wide">Welcome back,</p>
          <h2 className="text-white text-2xl sm:text-[28px] font-black mb-2.5 flex items-center gap-2 leading-none">
            {userName} <span className="animate-wave origin-bottom-right">👋</span>
          </h2>
          
          <h1 className="text-3xl sm:text-[32px] font-black text-white mb-1.5 leading-tight tracking-tight">
            Earn More. <span className="text-[#EC4899]">Cash Out.</span>
          </h1>
          
          <p className="text-[#8F95A3] text-[11px] sm:text-xs font-medium leading-relaxed">
            Complete offers & tasks to earn.
          </p>
        </div>

        <div className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 w-[140px] hidden sm:flex justify-center items-center pointer-events-none z-0">
          <HeroWallet />
        </div>
      </motion.div>

      {/* RIGHT GRID - Dynamic Data from New API */}
      <div className="w-full xl:w-[62%] grid grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3">
        
        {/* Card 1: Available Balance */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="bg-[#171520] border border-white/5 rounded-[12px] p-3 flex flex-col justify-between hover:bg-[#1A1C24] hover:border-white/10 hover:shadow-md transition-all">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-6 h-6 rounded-md bg-[#EC4899]/10 flex items-center justify-center shrink-0">
              <Wallet className="w-3.5 h-3.5 text-[#EC4899]" />
            </div>
            <span className="text-[#8F95A3] text-xs sm:text-sm font-bold truncate">Available Balance</span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-white mb-2">
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin text-white/50" /> : formatPrice(summaryData.availableBalance, currency)}
          </div>
          <Link href="/cashout" className="text-[10px] font-bold text-[#EC4899] border border-[#EC4899]/20 bg-[#EC4899]/5 px-2 py-1 rounded w-fit flex items-center gap-1 hover:bg-[#EC4899]/10 transition-colors cursor-pointer">
            Cashout <ArrowRight className="w-2.5 h-2.5" />
          </Link>
        </motion.div>

        {/* Card 2: Today's Earnings */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15 }} className="bg-[#171520] border border-white/5 rounded-[12px] p-3 flex flex-col justify-between hover:bg-[#1A1C24] hover:border-white/10 hover:shadow-md transition-all relative">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-6 h-6 rounded-md bg-[#00E57A]/10 flex items-center justify-center shrink-0">
              <TrendingUp className="w-3.5 h-3.5 text-[#00E57A]" />
            </div>
            <span className="text-[#8F95A3] text-xs sm:text-sm font-bold truncate">Today's Earnings</span>
          </div>
          <div className="flex items-end gap-2 mb-2">
            <div className="text-xl sm:text-2xl font-black text-white">
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin text-white/50" /> : formatPrice(summaryData.todayEarning, currency)}
            </div>
            {!isLoading && summaryData.todayEarningsChangePercent !== 0 && (
              <span className={`flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded ${summaryData.todayEarningsChangePercent > 0 ? 'bg-[#00E57A]/10 text-[#00E57A]' : 'bg-red-500/10 text-red-400'} mb-1`}>
                {summaryData.todayEarningsChangePercent > 0 ? <ArrowUpRight className="w-2.5 h-2.5" /> : <ArrowDownRight className="w-2.5 h-2.5" />}
                {Math.abs(summaryData.todayEarningsChangePercent)}%
              </span>
            )}
          </div>
          <div className="text-[10px] font-bold text-[#00E57A] flex items-center gap-1.5 truncate">
            <span className="bg-[#00E57A]/10 px-1.5 py-0.5 rounded text-[#00E57A]">Updated</span> Just now
          </div>
        </motion.div>

        {/* Card 3: Pending Earnings */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="bg-[#171520] border border-white/5 rounded-[12px] p-3 flex flex-col justify-between hover:bg-[#1A1C24] hover:border-white/10 hover:shadow-md transition-all">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-6 h-6 rounded-md bg-[#F59E0B]/10 flex items-center justify-center shrink-0">
              <Clock className="w-3.5 h-3.5 text-[#F59E0B]" />
            </div>
            <span className="text-[#8F95A3] text-xs sm:text-sm font-bold truncate">Pending Earnings</span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-white mb-2">
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin text-white/50" /> : formatPrice(summaryData.pendingEarning, currency)}
          </div>
          <Link href="/cashout" className="text-[10px] font-bold text-[#F59E0B] border border-[#F59E0B]/20 bg-[#F59E0B]/5 px-2 py-1 rounded w-fit flex items-center gap-1 hover:bg-[#F59E0B]/10 transition-colors cursor-pointer">
            View Details <ArrowRight className="w-2.5 h-2.5" />
          </Link>
        </motion.div>

        {/* Card 4: Completed Offers */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.25 }} className="bg-[#171520] border border-white/5 rounded-[12px] p-3 flex flex-col justify-between hover:bg-[#1A1C24] hover:border-white/10 hover:shadow-md transition-all">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-6 h-6 rounded-md bg-[#3B82F6]/10 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#3B82F6]" />
            </div>
            <span className="text-[#8F95A3] text-xs sm:text-sm font-bold truncate">Completed Offers</span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-white mb-2">
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin text-white/50" /> : summaryData.completedOffers}
          </div>
          <Link href="/myoffers" className="text-[10px] font-bold text-[#3B82F6] border border-[#3B82F6]/20 bg-[#3B82F6]/5 px-2 py-1 rounded w-fit flex items-center gap-1 hover:bg-[#3B82F6]/10 transition-colors cursor-pointer">
            View Details <ArrowRight className="w-2.5 h-2.5" />
          </Link>
        </motion.div>

        {/* Card 5: Referral Earnings */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }} className="bg-[#171520] border border-white/5 rounded-[12px] p-3 flex flex-col justify-between hover:bg-[#1A1C24] hover:border-white/10 hover:shadow-md transition-all">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-6 h-6 rounded-md bg-[#A855F7]/10 flex items-center justify-center shrink-0">
              <Users className="w-3.5 h-3.5 text-[#A855F7]" />
            </div>
            <span className="text-[#8F95A3] text-xs sm:text-sm font-bold truncate">Referral Earnings</span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-white mb-2">
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin text-white/50" /> : formatPrice(summaryData.referralEarning, currency)}
          </div>
          <Link href="/affiliate" className="text-[10px] font-bold text-[#A855F7] border border-[#A855F7]/20 bg-[#A855F7]/5 px-2 py-1 rounded w-fit flex items-center gap-1 hover:bg-[#A855F7]/10 transition-colors cursor-pointer">
            View Details <ArrowRight className="w-2.5 h-2.5" />
          </Link>
        </motion.div>

        {/* Card 6: Total Referrals */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.35 }} className="bg-[#171520] border border-white/5 rounded-[12px] p-3 flex flex-col justify-between hover:bg-[#1A1C24] hover:border-white/10 hover:shadow-md transition-all">
          <div className="flex items-center gap-2 mb-1.5">
            <div className="w-6 h-6 rounded-md bg-[#06B6D4]/10 flex items-center justify-center shrink-0">
              <UserPlus className="w-3.5 h-3.5 text-[#06B6D4]" />
            </div>
            <span className="text-[#8F95A3] text-xs sm:text-sm font-bold truncate">Total Referrals</span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-white mb-2">
            {isLoading ? <Loader2 className="w-5 h-5 animate-spin text-white/50" /> : summaryData.totalReferrals}
          </div>
          <Link href="/affiliate" className="text-[10px] font-bold text-[#06B6D4] border border-[#06B6D4]/20 bg-[#06B6D4]/5 px-2 py-1 rounded w-fit flex items-center gap-1 hover:bg-[#06B6D4]/10 transition-colors cursor-pointer">
            View Details <ArrowRight className="w-2.5 h-2.5" />
          </Link>
        </motion.div>

      </div>
    </div>
  );
}