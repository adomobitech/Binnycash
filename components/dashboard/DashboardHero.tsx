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
        fetch('https://apitest.binnycash.com/api/user/viewData', { headers })
          .then(res => res.json())
          .then(data => {
            const user = data?.data?.user || data?.data;
            if (user) setUserName(user.userName || user.firstName || 'User');
          }).catch(console.error);

        fetch('https://apitest.binnycash.com/api/user/wallet/total-earning', { headers })
          .then(res => res.json())
          .then(data => {
            if (data.code === 200 && data.data !== undefined) setAvailableBalance(Number(data.data));
          }).catch(console.error);

        fetch('https://apitest.binnycash.com/api/user/wallet/today-earning', { headers })
          .then(res => res.json())
          .then(data => {
            if (data.code === 200 && data.data !== undefined) setTodayEarnings(Number(data.data));
          }).catch(console.error);

        fetch('https://apitest.binnycash.com/api/user/wallet/view', { headers })
          .then(res => res.json())
          .then(data => {
            if (data.code === 200 && data.data) setPendingEarnings(Number(data.data.totalPendingAmount || 0));
          }).catch(console.error);

        fetch('https://apitest.binnycash.com/api/user/tracking/getUserCompleteData', { headers })
          .then(res => res.json())
          .then(data => {
            const list = data?.data?.list || data?.data || [];
            if (Array.isArray(list)) setCompletedOffers(list.length);
          }).catch(console.error);

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
    <div className="w-full flex flex-col xl:flex-row gap-2 mb-2 font-sans">
      
      {/* LEFT BANNER */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        transition={{ duration: 0.5 }}
        className="w-full xl:w-[38%] relative bg-gradient-to-br from-[#1A1829] via-[#12101E] to-[#1A1829] border border-white/5 rounded-[12px] overflow-hidden p-3 sm:p-4 flex flex-col justify-center min-h-[100px] shadow-lg"
      >
        <div className="absolute top-0 right-0 w-[120px] h-[120px] bg-[#8B5CF6]/10 blur-[50px] rounded-full pointer-events-none" />

        <div className="relative z-10 w-full sm:w-[75%]">
          <p className="text-[#8F95A3] text-[9px] font-medium mb-0.5">Welcome back,</p>
          <h2 className="text-white text-sm sm:text-base font-bold mb-1 flex items-center gap-1.5">
            {userName} <span className="animate-wave origin-bottom-right text-sm">👋</span>
          </h2>
          
          <h1 className="text-lg sm:text-xl font-black text-white mb-0.5 leading-none tracking-tight">
            Earn More. <span className="text-[#EC4899]">Cash Out.</span>
          </h1>
          
          <p className="text-[#8F95A3] text-[9px] mb-0 leading-tight">
            Complete offers & tasks to earn.
          </p>
        </div>

        {/* 🚀 Wallet position aur opacity Theek Ki, ab bahar nahi katega */}
        <div className="absolute right-1 sm:right-4 top-1/2 -translate-y-1/2 w-[120px] opacity-80 hidden sm:flex justify-center items-center pointer-events-none z-0">
          <HeroWallet />
        </div>
      </motion.div>

      {/* RIGHT GRID */}
      <div className="w-full xl:w-[62%] grid grid-cols-2 md:grid-cols-3 gap-2">
        
        {/* Card 1 */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }} className="bg-[#161821] border border-white/5 rounded-[10px] p-2 sm:p-2.5 flex flex-col justify-between hover:bg-[#1A1C24] hover:border-white/10 hover:shadow-[0_0_15px_rgba(255,255,255,0.03)] transition-all">
          <div className="flex items-center gap-1.5 mb-1">
            <div className="w-5 h-5 rounded-[6px] bg-[#EC4899]/10 flex items-center justify-center shrink-0">
              <Wallet className="w-2.5 h-2.5 text-[#EC4899]" />
            </div>
            <span className="text-[#A0A5B1] text-[9px] sm:text-[10px] font-medium truncate">Available Balance</span>
          </div>
          <div className="text-sm sm:text-base font-black text-white mb-1.5">{formatPrice(availableBalance || 0, currency)}</div>
          <Link href="/cashout" className="text-[8px] font-bold text-[#EC4899] border border-[#EC4899]/20 bg-[#EC4899]/5 px-1.5 py-0.5 rounded w-fit flex items-center gap-1 hover:bg-[#EC4899]/10 transition-colors cursor-pointer">
            Cashout <ArrowRight className="w-2 h-2" />
          </Link>
        </motion.div>

        {/* Card 2 */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.15 }} className="bg-[#161821] border border-white/5 rounded-[10px] p-2 sm:p-2.5 flex flex-col justify-between hover:bg-[#1A1C24] hover:border-white/10 hover:shadow-[0_0_15px_rgba(255,255,255,0.03)] transition-all">
          <div className="flex items-center gap-1.5 mb-1">
            <div className="w-5 h-5 rounded-[6px] bg-[#00E57A]/10 flex items-center justify-center shrink-0">
              <TrendingUp className="w-2.5 h-2.5 text-[#00E57A]" />
            </div>
            <span className="text-[#A0A5B1] text-[9px] sm:text-[10px] font-medium truncate">Today's Earnings</span>
          </div>
          <div className="text-sm sm:text-base font-black text-white mb-1.5">{formatPrice(todayEarnings || 0, currency)}</div>
          <div className="text-[8px] font-bold text-[#00E57A] flex items-center gap-1 truncate">
            <span className="bg-[#00E57A]/10 px-1 py-0.5 rounded text-[#00E57A]">Updated</span> Just now
          </div>
        </motion.div>

        {/* Card 3 */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }} className="bg-[#161821] border border-white/5 rounded-[10px] p-2 sm:p-2.5 flex flex-col justify-between hover:bg-[#1A1C24] hover:border-white/10 hover:shadow-[0_0_15px_rgba(255,255,255,0.03)] transition-all">
          <div className="flex items-center gap-1.5 mb-1">
            <div className="w-5 h-5 rounded-[6px] bg-[#F59E0B]/10 flex items-center justify-center shrink-0">
              <Clock className="w-2.5 h-2.5 text-[#F59E0B]" />
            </div>
            <span className="text-[#A0A5B1] text-[9px] sm:text-[10px] font-medium truncate">Pending Earnings</span>
          </div>
          <div className="text-sm sm:text-base font-black text-white mb-1.5">{formatPrice(pendingEarnings || 0, currency)}</div>
          <Link href="/cashout" className="text-[8px] font-bold text-[#F59E0B] border border-[#F59E0B]/20 bg-[#F59E0B]/5 px-1.5 py-0.5 rounded w-fit flex items-center gap-1 hover:bg-[#F59E0B]/10 transition-colors cursor-pointer">
            View Details <ArrowRight className="w-2 h-2" />
          </Link>
        </motion.div>

        {/* Card 4 */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.25 }} className="bg-[#161821] border border-white/5 rounded-[10px] p-2 sm:p-2.5 flex flex-col justify-between hover:bg-[#1A1C24] hover:border-white/10 hover:shadow-[0_0_15px_rgba(255,255,255,0.03)] transition-all">
          <div className="flex items-center gap-1.5 mb-1">
            <div className="w-5 h-5 rounded-[6px] bg-[#3B82F6]/10 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-2.5 h-2.5 text-[#3B82F6]" />
            </div>
            <span className="text-[#A0A5B1] text-[9px] sm:text-[10px] font-medium truncate">Completed Offers</span>
          </div>
          <div className="text-sm sm:text-base font-black text-white mb-1.5">{completedOffers || 0}</div>
          <Link href="/myoffers" className="text-[8px] font-bold text-[#3B82F6] border border-[#3B82F6]/20 bg-[#3B82F6]/5 px-1.5 py-0.5 rounded w-fit flex items-center gap-1 hover:bg-[#3B82F6]/10 transition-colors cursor-pointer">
            View Details <ArrowRight className="w-2 h-2" />
          </Link>
        </motion.div>

        {/* Card 5 */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }} className="bg-[#161821] border border-white/5 rounded-[10px] p-2 sm:p-2.5 flex flex-col justify-between hover:bg-[#1A1C24] hover:border-white/10 hover:shadow-[0_0_15px_rgba(255,255,255,0.03)] transition-all">
          <div className="flex items-center gap-1.5 mb-1">
            <div className="w-5 h-5 rounded-[6px] bg-[#A855F7]/10 flex items-center justify-center shrink-0">
              <Users className="w-2.5 h-2.5 text-[#A855F7]" />
            </div>
            <span className="text-[#A0A5B1] text-[9px] sm:text-[10px] font-medium truncate">Referral Earnings</span>
          </div>
          <div className="text-sm sm:text-base font-black text-white mb-1.5">{formatPrice(referralEarnings || 0, currency)}</div>
          <Link href="/affiliate" className="text-[8px] font-bold text-[#A855F7] border border-[#A855F7]/20 bg-[#A855F7]/5 px-1.5 py-0.5 rounded w-fit flex items-center gap-1 hover:bg-[#A855F7]/10 transition-colors cursor-pointer">
            View Details <ArrowRight className="w-2 h-2" />
          </Link>
        </motion.div>

        {/* Card 6 */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.35 }} className="bg-[#161821] border border-white/5 rounded-[10px] p-2 sm:p-2.5 flex flex-col justify-between hover:bg-[#1A1C24] hover:border-white/10 hover:shadow-[0_0_15px_rgba(255,255,255,0.03)] transition-all">
          <div className="flex items-center gap-1.5 mb-1">
            <div className="w-5 h-5 rounded-[6px] bg-[#06B6D4]/10 flex items-center justify-center shrink-0">
              <UserPlus className="w-2.5 h-2.5 text-[#06B6D4]" />
            </div>
            <span className="text-[#A0A5B1] text-[9px] sm:text-[10px] font-medium truncate">Total Referrals</span>
          </div>
          <div className="text-sm sm:text-base font-black text-white mb-1.5">{totalReferrals || 0}</div>
          <Link href="/affiliate" className="text-[8px] font-bold text-[#06B6D4] border border-[#06B6D4]/20 bg-[#06B6D4]/5 px-1.5 py-0.5 rounded w-fit flex items-center gap-1 hover:bg-[#06B6D4]/10 transition-colors cursor-pointer">
            View Details <ArrowRight className="w-2 h-2" />
          </Link>
        </motion.div>

      </div>
    </div>
  );
}