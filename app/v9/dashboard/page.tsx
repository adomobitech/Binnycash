'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  TrendingUp, Users, DollarSign, Activity, RefreshCw, 
  ArrowUpRight, ArrowDownRight, ShieldAlert, Rocket, CreditCard
} from 'lucide-react';
import { useCurrency, formatPrice } from '@/hooks/useCurrency';
import { motion } from 'framer-motion';

export default function AdminDashboardPage() {
  const router = useRouter();
  const currency = useCurrency();
  
  const [isLoading, setIsLoading] = useState(true);
  const [dashboardData, setDashboardData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchAdminDashboard = async () => {
    setIsLoading(true);
    setError(null);

    const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : '';

    if (!token) {
      router.push('/v9/login');
      return;
    }

    try {
      const res = await fetch(`https://api.binnycash.com/api/admin/dashboard`, {
        method: 'GET',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      const json = await res.json();

      if (res.ok && json && (json.code === 200 || json.type === 'success')) {
        setDashboardData(json.data);
      } else {
        setError(json?.message || "Failed to load dashboard metrics.");
      }
    } catch (err: any) {
      setError("Network error while connecting to server. Please check your token or internet.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminDashboard();
  }, [router]);

  // Helper for trend indicators based on "lastMonth" comparison (if we had specific target logics)
  // For now, we will simply format the raw data received.
  
  const renderTrend = (today: number, lastMonth: number, isCurrency: boolean = false) => {
    const diff = today - lastMonth;
    if (diff === 0) return null;
    const isUp = diff > 0;
    return (
      <div className={`flex items-center gap-1 text-[11px] font-bold mt-1.5 ${isUp ? 'text-emerald-400' : 'text-rose-400'}`}>
        {isUp ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
        <span>{isUp ? '+' : ''}{isCurrency ? formatPrice(diff, currency) : diff} vs last month</span>
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6 text-white w-full max-w-[1400px] mx-auto pb-10 font-sans relative">
      
      {/* BREADCRUMBS & TITLE */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-white/10 pb-5 gap-4">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3 tracking-tight">
             <Rocket className="w-8 h-8 text-[#A66CFF]" /> 
             Admin Dashboard
          </h1>
          <p className="text-sm text-[#8F95A3] mt-2">
            Real-time analytics, revenue tracking, and network performance overview.
          </p>
        </div>

        <button 
          onClick={fetchAdminDashboard}
          disabled={isLoading}
          className="flex items-center gap-2 bg-[#12141C] hover:bg-white/5 border border-white/10 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm cursor-pointer disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 text-[#A66CFF] ${isLoading ? 'animate-spin' : ''}`} />
          Refresh Stats
        </button>
      </div>

      {error && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="w-full bg-rose-500/10 border border-rose-500/30 text-rose-400 p-4 rounded-xl flex items-center gap-3 shadow-sm">
          <ShieldAlert className="w-5 h-5 shrink-0" />
          <span className="text-sm font-bold">{error}</span>
        </motion.div>
      )}

      {/* STATS OVERVIEW CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        
        {/* TOTAL USERS CARD */}
        <div className="bg-[#12141C] border border-white/5 rounded-3xl p-6 flex flex-col justify-between shadow-xl relative overflow-hidden group hover:border-[#3B82F6]/30 transition-all">
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-[#3B82F6]/10 rounded-full blur-[20px] pointer-events-none group-hover:bg-[#3B82F6]/20 transition-all" />
          <div className="flex items-center justify-between mb-4 relative z-10">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Users</span>
            <div className="w-8 h-8 rounded-full bg-[#3B82F6]/10 flex items-center justify-center border border-[#3B82F6]/20 text-[#3B82F6]">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="relative z-10">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-white">
                {isLoading ? '...' : (dashboardData?.users?.total || 0)}
              </span>
            </div>
            <div className="flex items-center gap-1.5 mt-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-[11px] font-bold text-emerald-400">
                {isLoading ? '...' : (dashboardData?.users?.active || 0)} Active
              </span>
            </div>
          </div>
        </div>

        {/* TOTAL REVENUE CARD */}
        <div className="bg-[#12141C] border border-white/5 rounded-3xl p-6 flex flex-col justify-between shadow-xl relative overflow-hidden group hover:border-emerald-500/30 transition-all">
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-emerald-500/10 rounded-full blur-[20px] pointer-events-none group-hover:bg-emerald-500/20 transition-all" />
          <div className="flex items-center justify-between mb-4 relative z-10">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Revenue</span>
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 text-emerald-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="relative z-10">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-white">
                {isLoading ? '...' : formatPrice(Number(dashboardData?.revenue?.total || 0), currency)}
              </span>
            </div>
            <div className="flex gap-4 mt-2">
              <span className="text-[10px] font-bold text-gray-400 uppercase">Today: <span className="text-emerald-400 ml-0.5">{formatPrice(Number(dashboardData?.revenue?.today || 0), currency)}</span></span>
              <span className="text-[10px] font-bold text-gray-400 uppercase">Month: <span className="text-emerald-400 ml-0.5">{formatPrice(Number(dashboardData?.revenue?.thisMonth || 0), currency)}</span></span>
            </div>
          </div>
        </div>

        {/* PAYOUT CARD */}
        <div className="bg-[#12141C] border border-white/5 rounded-3xl p-6 flex flex-col justify-between shadow-xl relative overflow-hidden group hover:border-amber-500/30 transition-all">
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-amber-500/10 rounded-full blur-[20px] pointer-events-none group-hover:bg-amber-500/20 transition-all" />
          <div className="flex items-center justify-between mb-4 relative z-10">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Payouts</span>
            <div className="w-8 h-8 rounded-full bg-amber-500/10 flex items-center justify-center border border-amber-500/20 text-amber-500">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="relative z-10">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-black text-white">
                {isLoading ? '...' : formatPrice(Number(dashboardData?.payout?.total || 0), currency)}
              </span>
            </div>
            <div className="flex gap-4 mt-2">
              <span className="text-[10px] font-bold text-gray-400 uppercase">Today: <span className="text-amber-400 ml-0.5">{formatPrice(Number(dashboardData?.payout?.today || 0), currency)}</span></span>
              <span className="text-[10px] font-bold text-gray-400 uppercase">Month: <span className="text-amber-400 ml-0.5">{formatPrice(Number(dashboardData?.payout?.thisMonth || 0), currency)}</span></span>
            </div>
          </div>
        </div>

        {/* NET PROFIT CARD */}
        <div className="bg-[#12141C] border border-white/5 rounded-3xl p-6 flex flex-col justify-between shadow-xl relative overflow-hidden group hover:border-[#A66CFF]/30 transition-all">
          <div className="absolute -right-4 -top-4 w-20 h-20 bg-[#A66CFF]/10 rounded-full blur-[20px] pointer-events-none group-hover:bg-[#A66CFF]/20 transition-all" />
          <div className="flex items-center justify-between mb-4 relative z-10">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Net Profit</span>
            <div className="w-8 h-8 rounded-full bg-[#A66CFF]/10 flex items-center justify-center border border-[#A66CFF]/20 text-[#A66CFF]">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="relative z-10">
            <div className="flex items-baseline gap-2">
              <span className={`text-3xl font-black ${Number(dashboardData?.profit?.total || 0) < 0 ? 'text-rose-400' : 'text-white'}`}>
                {isLoading ? '...' : formatPrice(Number(dashboardData?.profit?.total || 0), currency)}
              </span>
            </div>
            <div className="flex gap-4 mt-2">
              <span className="text-[10px] font-bold text-gray-400 uppercase">Today: <span className="text-[#A66CFF] ml-0.5">{formatPrice(Number(dashboardData?.profit?.today || 0), currency)}</span></span>
              <span className="text-[10px] font-bold text-gray-400 uppercase">Month: <span className="text-[#A66CFF] ml-0.5">{formatPrice(Number(dashboardData?.profit?.thisMonth || 0), currency)}</span></span>
            </div>
          </div>
        </div>

      </div>

      {/* DETAILED MONTH COMPARISON PANEL */}
      <div className="bg-[#12141C] border border-white/5 rounded-3xl p-6 shadow-xl mt-2">
        <div className="flex items-center gap-2 border-b border-white/5 pb-4 mb-4">
          <Activity className="w-5 h-5 text-gray-400" />
          <h2 className="text-sm font-bold text-white uppercase tracking-widest">Monthly Comparison Summary</h2>
        </div>

        {isLoading ? (
          <div className="py-12 flex items-center justify-center text-gray-500 font-bold text-sm animate-pulse">Loading detailed comparison...</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 divide-y sm:divide-y-0 sm:divide-x divide-white/10">
            <div className="flex flex-col gap-2 pt-4 sm:pt-0 sm:pr-6">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Last Month Revenue</span>
              <span className="text-2xl font-black text-emerald-400">{formatPrice(Number(dashboardData?.revenue?.lastMonth || 0), currency)}</span>
              {renderTrend(Number(dashboardData?.revenue?.thisMonth || 0), Number(dashboardData?.revenue?.lastMonth || 0), true)}
            </div>
            
            <div className="flex flex-col gap-2 pt-4 sm:pt-0 sm:px-6">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Last Month Payouts</span>
              <span className="text-2xl font-black text-amber-400">{formatPrice(Number(dashboardData?.payout?.lastMonth || 0), currency)}</span>
              {renderTrend(Number(dashboardData?.payout?.thisMonth || 0), Number(dashboardData?.payout?.lastMonth || 0), true)}
            </div>
            
            <div className="flex flex-col gap-2 pt-4 sm:pt-0 sm:pl-6">
              <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Last Month Profit</span>
              <span className={`text-2xl font-black ${Number(dashboardData?.profit?.lastMonth || 0) < 0 ? 'text-rose-400' : 'text-[#A66CFF]'}`}>
                {formatPrice(Number(dashboardData?.profit?.lastMonth || 0), currency)}
              </span>
              {renderTrend(Number(dashboardData?.profit?.thisMonth || 0), Number(dashboardData?.profit?.lastMonth || 0), true)}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}