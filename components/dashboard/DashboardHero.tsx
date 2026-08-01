'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { 
  ArrowRight, Wallet, TrendingUp, 
  Clock, CheckCircle2, Users, UserPlus 
} from 'lucide-react';
import HeroWallet from './HeroWallet'; 
import { useCurrency, formatPrice } from '@/hooks/useCurrency';

export default function DashboardHero() {
  const currency = useCurrency();
  
  // States for API Data
  const [userName, setUserName] = useState<string>('...');
  const [availableBalance, setAvailableBalance] = useState<number>(0);
  const [todayEarnings, setTodayEarnings] = useState<number>(0);
  const [pendingEarnings, setPendingEarnings] = useState<number>(0);
  const [completedOffers, setCompletedOffers] = useState<number>(0);
  const [referralEarnings, setReferralEarnings] = useState<number>(0);
  const [totalReferrals, setTotalReferrals] = useState<number>(0);

  useEffect(() => {
    const fetchDashboardStats = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;

      const headers = { 'Authorization': `Bearer ${token}` };

      try {
        // 1. Fetch User Name
        fetch('https://apitest.binnycash.com/api/user/viewData', { headers })
          .then(res => res.json())
          .then(data => {
            const user = data?.data?.user || data?.data;
            if (user) setUserName(user.userName || user.firstName || 'User');
          }).catch(console.error);

        // 2. Fetch Available Balance
        fetch('https://apitest.binnycash.com/api/user/wallet/total-earning', { headers })
          .then(res => res.json())
          .then(data => {
            if (data.code === 200 && data.data !== undefined) {
              setAvailableBalance(Number(data.data));
            }
          }).catch(console.error);

        // 3. Fetch Today's Earnings
        fetch('https://apitest.binnycash.com/api/user/wallet/today-earning', { headers })
          .then(res => res.json())
          .then(data => {
            if (data.code === 200 && data.data !== undefined) {
              setTodayEarnings(Number(data.data));
            }
          }).catch(console.error);

        // 4. Fetch Pending Amount
        fetch('https://apitest.binnycash.com/api/user/wallet/view', { headers })
          .then(res => res.json())
          .then(data => {
            if (data.code === 200 && data.data) {
              setPendingEarnings(Number(data.data.totalPendingAmount || 0));
            }
          }).catch(console.error);

        // 5. Fetch Completed Offers Count
        fetch('https://apitest.binnycash.com/api/user/tracking/getUserCompleteData', { headers })
          .then(res => res.json())
          .then(data => {
            const list = data?.data?.list || data?.data || [];
            if (Array.isArray(list)) {
              setCompletedOffers(list.length);
            }
          }).catch(console.error);

        // 6. Fetch Affiliate Stats (Referrals & Referral Earnings)
        fetch('https://apitest.binnycash.com/api/user/affiliate_dashboard', { headers })
          .then(res => res.json())
          .then(data => {
            if (data.code === 200 && data.data) {
              setReferralEarnings(Number(data.data.totalReferEarning || 0));
              setTotalReferrals(Number(data.data.totalReferUsers || 0));
            }
          }).catch(console.error);

      } catch (err) {
        console.error("Error fetching dashboard statistics", err);
      }
    };

    fetchDashboardStats();
  }, []);

  return (
    <div className="w-full flex flex-col xl:flex-row gap-4 mb-4 font-sans">
      
      {/* LEFT BANNER (Hero Box) */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.5 }}
        className="w-full xl:w-[45%] 2xl:w-[42%] relative bg-gradient-to-br from-[#1A1829] via-[#12101E] to-[#1A1829] border border-white/5 rounded-[24px] overflow-hidden p-6 sm:p-8 flex flex-col justify-center min-h-[260px] shadow-xl"
      >
        {/* Decorative background glow */}
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[#8B5CF6]/10 blur-[80px] rounded-full pointer-events-none" />

        <div className="relative z-10 w-full sm:w-[65%]">
          <p className="text-[#8F95A3] text-xs font-medium mb-1">Welcome back,</p>
          <h2 className="text-white text-xl sm:text-2xl font-bold mb-4 flex items-center gap-2">
            {userName} <span className="animate-wave origin-bottom-right">👋</span>
          </h2>
          
          <h1 className="text-3xl sm:text-4xl font-black text-white mb-2 leading-tight tracking-tight">
            Earn More. <span className="text-[#EC4899]">Cash Out More.</span>
          </h1>
          
          <p className="text-[#8F95A3] text-xs sm:text-[13px] mb-6 max-w-[280px] leading-relaxed">
            Complete offers, surveys & tasks to earn real rewards.
          </p>
        </div>

        {/* 3D Wallet Positioned on Right inside the banner */}
        <div className="absolute -right-8 top-1/2 -translate-y-1/2 w-[220px] sm:w-[260px] h-full hidden sm:flex justify-center items-center pointer-events-none z-0">
          <HeroWallet />
        </div>
      </motion.div>

      {/* RIGHT GRID (Stats Cards) */}
      <div className="w-full xl:w-[55%] 2xl:w-[58%] grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
        
        {/* Card 1: Available Balance */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="bg-[#161821] border border-white/5 rounded-[16px] p-4 flex flex-col justify-between hover:bg-[#1A1C24] transition-colors shadow-lg">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-[10px] bg-[#EC4899]/10 flex items-center justify-center shrink-0">
              <Wallet className="w-4 h-4 text-[#EC4899]" />
            </div>
            <span className="text-[#8F95A3] text-xs font-semibold">Available Balance</span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-white mb-2">{formatPrice(availableBalance, currency)}</div>
          <Link href="/cashout" className="text-[10px] sm:text-[11px] font-bold text-[#EC4899] border border-[#EC4899]/20 bg-[#EC4899]/5 px-3 py-1.5 rounded-lg w-fit flex items-center gap-1 hover:bg-[#EC4899]/10 transition-colors cursor-pointer">
            Cashout <ArrowRight className="w-3 h-3" />
          </Link>
        </motion.div>

        {/* Card 2: Today's Earnings */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15 }} className="bg-[#161821] border border-white/5 rounded-[16px] p-4 flex flex-col justify-between hover:bg-[#1A1C24] transition-colors shadow-lg">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-[10px] bg-[#00E57A]/10 flex items-center justify-center shrink-0">
              <TrendingUp className="w-4 h-4 text-[#00E57A]" />
            </div>
            <span className="text-[#8F95A3] text-xs font-semibold">Today's Earnings</span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-white mb-2">{formatPrice(todayEarnings, currency)}</div>
          <div className="text-[10px] sm:text-[11px] font-bold text-[#00E57A] flex items-center gap-1">
            <span className="bg-[#00E57A]/10 px-1.5 py-0.5 rounded text-[#00E57A]">Updated</span> Just now
          </div>
        </motion.div>

        {/* Card 3: Pending Earnings */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="bg-[#161821] border border-white/5 rounded-[16px] p-4 flex flex-col justify-between hover:bg-[#1A1C24] transition-colors shadow-lg">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-[10px] bg-[#F59E0B]/10 flex items-center justify-center shrink-0">
              <Clock className="w-4 h-4 text-[#F59E0B]" />
            </div>
            <span className="text-[#8F95A3] text-xs font-semibold">Pending Earnings</span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-white mb-2">{formatPrice(pendingEarnings, currency)}</div>
          <Link href="/cashout" className="text-[10px] sm:text-[11px] font-bold text-[#F59E0B] border border-[#F59E0B]/20 bg-[#F59E0B]/5 px-3 py-1.5 rounded-lg w-fit flex items-center gap-1 hover:bg-[#F59E0B]/10 transition-colors cursor-pointer">
            View Details <ArrowRight className="w-3 h-3" />
          </Link>
        </motion.div>

        {/* Card 4: Completed Offers */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.25 }} className="bg-[#161821] border border-white/5 rounded-[16px] p-4 flex flex-col justify-between hover:bg-[#1A1C24] transition-colors shadow-lg">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-[10px] bg-[#3B82F6]/10 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-4 h-4 text-[#3B82F6]" />
            </div>
            <span className="text-[#8F95A3] text-xs font-semibold">Completed Offers</span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-white mb-2">{completedOffers}</div>
          <Link href="/myoffers" className="text-[10px] sm:text-[11px] font-bold text-[#3B82F6] border border-[#3B82F6]/20 bg-[#3B82F6]/5 px-3 py-1.5 rounded-lg w-fit flex items-center gap-1 hover:bg-[#3B82F6]/10 transition-colors cursor-pointer">
            View Details <ArrowRight className="w-3 h-3" />
          </Link>
        </motion.div>

        {/* Card 5: Referral Earnings */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }} className="bg-[#161821] border border-white/5 rounded-[16px] p-4 flex flex-col justify-between hover:bg-[#1A1C24] transition-colors shadow-lg">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-[10px] bg-[#A855F7]/10 flex items-center justify-center shrink-0">
              <Users className="w-4 h-4 text-[#A855F7]" />
            </div>
            <span className="text-[#8F95A3] text-xs font-semibold">Referral Earnings</span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-white mb-2">{formatPrice(referralEarnings, currency)}</div>
          <Link href="/affiliate" className="text-[10px] sm:text-[11px] font-bold text-[#A855F7] border border-[#A855F7]/20 bg-[#A855F7]/5 px-3 py-1.5 rounded-lg w-fit flex items-center gap-1 hover:bg-[#A855F7]/10 transition-colors cursor-pointer">
            View Details <ArrowRight className="w-3 h-3" />
          </Link>
        </motion.div>

        {/* Card 6: Total Referrals */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.35 }} className="bg-[#161821] border border-white/5 rounded-[16px] p-4 flex flex-col justify-between hover:bg-[#1A1C24] transition-colors shadow-lg">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-[10px] bg-[#06B6D4]/10 flex items-center justify-center shrink-0">
              <UserPlus className="w-4 h-4 text-[#06B6D4]" />
            </div>
            <span className="text-[#8F95A3] text-xs font-semibold">Total Referrals</span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-white mb-2">{totalReferrals}</div>
          <Link href="/affiliate" className="text-[10px] sm:text-[11px] font-bold text-[#06B6D4] border border-[#06B6D4]/20 bg-[#06B6D4]/5 px-3 py-1.5 rounded-lg w-fit flex items-center gap-1 hover:bg-[#06B6D4]/10 transition-colors cursor-pointer">
            View Details <ArrowRight className="w-3 h-3" />
          </Link>
        </motion.div>

      </div>
    </div>
  );
}