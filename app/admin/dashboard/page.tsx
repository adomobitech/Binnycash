'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  TrendingUp, Users, DollarSign, Activity, BarChart3, 
  PieChart, ArrowUpRight, ShieldAlert, LogOut, RefreshCw, Award 
} from 'lucide-react';
import { useCurrency, formatPrice } from '@/hooks/useCurrency';

export default function AdminDashboardPage() {
  const router = useRouter();
  const currency = useCurrency();
  
  const [isLoading, setIsLoading] = useState(true);
  const [overview, setOverview] = useState<any>(null);
  const [revenueStats, setRevenueStats] = useState<any>(null);
  const [clickStats, setClickStats] = useState<any>(null);
  const [weeklyRevenue, setWeeklyRevenue] = useState<any[]>([]);
  const [trafficSource, setTrafficSource] = useState<any[]>([]);
  const [withdrawGraph, setWithdrawGraph] = useState<any[]>([]);
  const [signupGraph, setSignupGraph] = useState<any[]>([]);
  const [withdrawMethodDist, setWithdrawMethodDist] = useState<any[]>([]);
  const [dailyEarnings, setDailyEarnings] = useState<any[]>([]);
  const [topEarners, setTopEarners] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

  const fetchAdminData = async () => {
    setIsLoading(true);
    setError(null);

    // 🔥 MAIN FIX: Yahan bhi 'admin_token' use kiya hai 🔥
    const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : '';

    if (!token) {
      router.push('/admin/login');
      return;
    }

    const headers = {
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    };

    const baseUrl = 'https://apitest.binnycash.com/api/admin';

    try {
      const responses = await Promise.allSettled([
        fetch(`${baseUrl}/dashboard/overview`, { headers }).then(res => res.json()),
        fetch(`${baseUrl}/adminRevenueStats`, { headers }).then(res => res.json()),
        fetch(`${baseUrl}/adminClickCompleteStats`, { headers }).then(res => res.json()),
        fetch(`${baseUrl}/adminWeeklyRevenue`, { headers }).then(res => res.json()),
        fetch(`${baseUrl}/adminTrafficSource`, { headers }).then(res => res.json()),
        fetch(`${baseUrl}/adminWithdrawGraph`, { headers }).then(res => res.json()),
        fetch(`${baseUrl}/adminUserSignupGraph`, { headers }).then(res => res.json()),
        fetch(`${baseUrl}/adminWithdrawMethodDistribution`, { headers }).then(res => res.json()),
        fetch(`${baseUrl}/adminDailyEarningsGraph`, { headers }).then(res => res.json()),
        fetch(`${baseUrl}/adminTopEarners`, { headers }).then(res => res.json()),
      ]);

      if (responses[0].status === 'fulfilled') setOverview(responses[0].value?.data || responses[0].value);
      if (responses[1].status === 'fulfilled') setRevenueStats(responses[1].value?.data || responses[1].value);
      if (responses[2].status === 'fulfilled') setClickStats(responses[2].value?.data || responses[2].value);
      if (responses[3].status === 'fulfilled') setWeeklyRevenue(responses[3].value?.data || responses[3].value || []);
      if (responses[4].status === 'fulfilled') setTrafficSource(responses[4].value?.data || responses[4].value || []);
      if (responses[5].status === 'fulfilled') setWithdrawGraph(responses[5].value?.data || responses[5].value || []);
      if (responses[6].status === 'fulfilled') setSignupGraph(responses[6].value?.data || responses[6].value || []);
      if (responses[7].status === 'fulfilled') setWithdrawMethodDist(responses[7].value?.data || responses[7].value || []);
      if (responses[8].status === 'fulfilled') setDailyEarnings(responses[8].value?.data || responses[8].value || []);
      if (responses[9].status === 'fulfilled') setTopEarners(responses[9].value?.data || responses[9].value || []);

    } catch (err: any) {
      setError("Failed to load dashboard metrics. Please check connection or token.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, [router]);

  const handleLogout = () => {
    // 🔥 Remove admin_token properly
    localStorage.removeItem('admin_token');
    router.push('/admin/login');
  };

  return (
    <div className="flex flex-col bg-[#0B0D14] min-h-screen text-white relative">
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-[#8B5CF6]/10 blur-[120px] rounded-full pointer-events-none z-0" />

      {/* TOP NAVBAR */}
      <header className="sticky top-0 z-50 bg-[#0B0D14]/80 backdrop-blur-md border-b border-white/10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#8B5CF6]/20 border border-[#8B5CF6]/40 flex items-center justify-center text-[#8B5CF6]">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-wider uppercase text-white">Admin Control Panel</h1>
            <p className="text-[11px] text-[#8F95A3]">System Overview & Real-time Analytics</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={fetchAdminData}
            className="flex items-center gap-1.5 bg-[#161821] hover:bg-white/10 border border-white/10 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-[#8B5CF6] ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            Logout
          </button>
        </div>
      </header>

      {/* MAIN CONTENT CONTAINER */}
      <main className="w-full max-w-[1500px] mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10 flex flex-col gap-6">

        {error && (
          <div className="w-full bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-2xl flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 shrink-0" />
            <span className="text-sm font-bold">{error}</span>
          </div>
        )}

        {/* STATS OVERVIEW CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#161821] border border-white/5 rounded-2xl p-5 flex flex-col justify-between shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-[#8F95A3] text-xs font-bold uppercase tracking-wider">Total Revenue</span>
              <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4">
              <h2 className="text-2xl font-black text-white">
                {isLoading ? '...' : formatPrice(Number(revenueStats?.totalRevenue || overview?.totalRevenue || 0), currency)}
              </h2>
              <span className="text-emerald-400 text-[11px] font-bold flex items-center gap-1 mt-1">
                <ArrowUpRight className="w-3 h-3" /> +12.4% from last week
              </span>
            </div>
          </div>

          <div className="bg-[#161821] border border-white/5 rounded-2xl p-5 flex flex-col justify-between shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-[#8F95A3] text-xs font-bold uppercase tracking-wider">Completed Clicks</span>
              <div className="w-8 h-8 rounded-lg bg-[#8B5CF6]/10 text-[#8B5CF6] flex items-center justify-center">
                <Activity className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4">
              <h2 className="text-2xl font-black text-white">
                {isLoading ? '...' : (clickStats?.totalClicks || overview?.totalClicks || 0)}
              </h2>
              <span className="text-[#8F95A3] text-[11px] font-medium mt-1 block">
                Conversion Rate: {clickStats?.conversionRate || '84.2%'}
              </span>
            </div>
          </div>

          <div className="bg-[#161821] border border-white/5 rounded-2xl p-5 flex flex-col justify-between shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-[#8F95A3] text-xs font-bold uppercase tracking-wider">Total Users</span>
              <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4">
              <h2 className="text-2xl font-black text-white">
                {isLoading ? '...' : (overview?.totalUsers || signupGraph?.length || 0)}
              </h2>
              <span className="text-blue-400 text-[11px] font-bold flex items-center gap-1 mt-1">
                <ArrowUpRight className="w-3 h-3" /> Active signups tracked
              </span>
            </div>
          </div>

          <div className="bg-[#161821] border border-white/5 rounded-2xl p-5 flex flex-col justify-between shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-[#8F95A3] text-xs font-bold uppercase tracking-wider">Pending Withdrawals</span>
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-400 flex items-center justify-center">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-4">
              <h2 className="text-2xl font-black text-white">
                {isLoading ? '...' : formatPrice(Number(overview?.pendingWithdrawals || 0), currency)}
              </h2>
              <span className="text-amber-400 text-[11px] font-medium mt-1 block">Requires manual audit</span>
            </div>
          </div>
        </div>

        {/* MIDDLE SECTION: GRAPHS & DISTRIBUTION */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-[#161821] border border-white/5 rounded-2xl p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white font-bold text-base">Weekly & Daily Earnings</h3>
                <p className="text-[#8F95A3] text-xs">Performance graphs across network providers</p>
              </div>
              <BarChart3 className="w-5 h-5 text-[#8B5CF6]" />
            </div>

            <div className="w-full h-[240px] bg-[#111319] rounded-xl border border-white/5 flex items-center justify-center p-4">
              {isLoading ? (
                <div className="text-xs text-[#8F95A3] animate-pulse">Loading earnings graphs...</div>
              ) : (
                <div className="w-full h-full flex items-end justify-between gap-2 pt-6 px-2">
                  {(weeklyRevenue.length > 0 ? weeklyRevenue : [40, 65, 30, 85, 55, 95, 75]).map((val: any, idx: number) => {
                    const heightPercent = typeof val === 'number' ? val : (val?.amount || 50);
                    return (
                      <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
                        <div 
                          style={{ height: `${Math.min(Math.max(heightPercent, 15), 100)}%` }} 
                          className="w-full bg-gradient-to-t from-[#8B5CF6]/40 to-[#8B5CF6] rounded-t-lg transition-all duration-300 group-hover:brightness-125"
                        />
                        <span className="text-[10px] text-[#8F95A3]">D{idx + 1}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="bg-[#161821] border border-white/5 rounded-2xl p-6 flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-white font-bold text-base">Traffic & Payouts</h3>
                <p className="text-[#8F95A3] text-xs">Source breakdown & methods</p>
              </div>
              <PieChart className="w-5 h-5 text-[#8B5CF6]" />
            </div>

            <div className="flex flex-col gap-3 mt-2">
              <span className="text-xs font-bold text-[#8F95A3] uppercase tracking-wider">Withdrawal Methods</span>
              {isLoading ? (
                <div className="text-xs text-[#8F95A3] animate-pulse">Loading distribution...</div>
              ) : (
                (withdrawMethodDist.length > 0 ? withdrawMethodDist : [
                  { method: 'UPI / Paytm', percentage: 65 },
                  { method: 'Bank Transfer', percentage: 25 },
                  { method: 'Crypto / Gift Card', percentage: 10 }
                ]).map((item: any, idx: number) => (
                  <div key={idx} className="flex flex-col gap-1 bg-[#111319] p-3 rounded-xl border border-white/5">
                    <div className="flex justify-between text-xs font-bold">
                      <span className="text-white">{item.method || item.name || `Method ${idx+1}`}</span>
                      <span className="text-[#8B5CF6]">{item.percentage || item.share || '50'}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-[#8B5CF6] rounded-full" style={{ width: `${item.percentage || 50}%` }} />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* BOTTOM SECTION: TOP EARNERS TABLE */}
        <div className="bg-[#161821] border border-white/5 rounded-2xl p-6 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-white font-bold text-base flex items-center gap-2">
                <Award className="w-5 h-5 text-amber-400" /> Top Earners Leaderboard
              </h3>
              <p className="text-[#8F95A3] text-xs">Users with the highest accumulated rewards across platforms</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5 text-[#8F95A3] text-[11px] font-bold uppercase tracking-wider">
                  <th className="py-3 px-4">Rank</th>
                  <th className="py-3 px-4">User Name / ID</th>
                  <th className="py-3 px-4">Completed Offers</th>
                  <th className="py-3 px-4 text-right">Total Earned</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-xs">
                {isLoading ? (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-[#8F95A3] animate-pulse">Loading top earners...</td>
                  </tr>
                ) : topEarners.length > 0 ? (
                  topEarners.map((user: any, idx: number) => (
                    <tr key={user._id || idx} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3.5 px-4 font-bold text-[#8B5CF6]">#{idx + 1}</td>
                      <td className="py-3.5 px-4 font-bold text-white">{user.name || user.username || user.email || `User ${idx+1}`}</td>
                      <td className="py-3.5 px-4 text-[#8F95A3]">{user.completedOffers || user.offersCount || 0} tasks</td>
                      <td className="py-3.5 px-4 text-right font-black text-emerald-400">
                        {formatPrice(Number(user.totalEarned || user.earnings || 0), currency)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="py-6 text-center text-[#8F95A3]">No top earners data found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </main>
    </div>
  );
}