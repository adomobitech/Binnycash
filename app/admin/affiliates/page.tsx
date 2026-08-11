'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Users, UserPlus, DollarSign, Clock, RefreshCw, 
  ShieldAlert, Trophy, BarChart3, PieChart, ArrowUpRight, 
  Ban, List, X, Search, Filter, History, ChevronLeft, ChevronRight, 
  CheckCircle2, Loader2, Wallet, Activity, Eye, Share2, UserSquare, Network, Globe, Layers, Lock, Unlock, Edit3, Trash2, Plus
} from 'lucide-react';
import { useCurrency, formatPrice } from '@/hooks/useCurrency';

export default function AdminAffiliateDashboard() {
  const router = useRouter();
  const currency = useCurrency();
  const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : '';
  
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isTrendModalOpen, setIsTrendModalOpen] = useState(false);
  const [isActivityModalOpen, setIsActivityModalOpen] = useState(false);
  const [isAffiliatesModalOpen, setIsAffiliatesModalOpen] = useState(false);

  const [tiers, setTiers] = useState<any[]>([]);
  const [isTiersLoading, setIsTiersLoading] = useState(false);
  const [isTierModalOpen, setIsTierModalOpen] = useState(false);
  const [tierFormData, setTierFormData] = useState({ _id: '', level: '', commissionPercent: '', referralAmount: '' });
  const [isTierSaving, setIsTierSaving] = useState(false);
  const [isTierDeleting, setIsTierDeleting] = useState(false);

  const [previewAffiliates, setPreviewAffiliates] = useState<any[]>([]);
  const [isPreviewAffiliatesLoading, setIsPreviewAffiliatesLoading] = useState(false);

  const [modalAffiliates, setModalAffiliates] = useState<any[]>([]);
  const [modalAffiliatesPage, setModalAffiliatesPage] = useState(1);
  const [modalAffiliatesTotalPages, setModalAffiliatesTotalPages] = useState(1);
  const [modalAffiliatesTotal, setModalAffiliatesTotal] = useState(0);
  const [isModalAffiliatesLoading, setIsModalAffiliatesLoading] = useState(false);

  const [detailUserId, setDetailUserId] = useState('');
  const [userDetail, setUserDetail] = useState<any>(null);
  const [isUserDetailLoading, setIsUserDetailLoading] = useState(false);
  const [userDetailError, setUserDetailError] = useState<string | null>(null);
  const [isTogglingLock, setIsTogglingLock] = useState(false);
  const [refUserId, setRefUserId] = useState('');
  const [refPage, setRefPage] = useState(1);
  const [refLimit, setRefLimit] = useState(10);
  const [referrals, setReferrals] = useState<any[]>([]);
  const [refTotalPages, setRefTotalPages] = useState(1);
  const [refTotalRecords, setRefTotalRecords] = useState(0);
  const [isRefLoading, setIsRefLoading] = useState(false);
  const [refError, setRefError] = useState<string | null>(null);

  const [logUserId, setLogUserId] = useState('');
  const [logStatus, setLogStatus] = useState(''); 
  const [logPage, setLogPage] = useState(1);
  const [logLimit, setLogLimit] = useState(10);
  const [logs, setLogs] = useState<any[]>([]);
  const [logsTotalPages, setLogsTotalPages] = useState(1);
  const [logsTotalRecords, setLogsTotalRecords] = useState(0);
  const [isLogsLoading, setIsLogsLoading] = useState(false);
  const [logsError, setLogsError] = useState<string | null>(null);

  const [previewActivities, setPreviewActivities] = useState<any[]>([]);
  const [isPreviewLoading, setIsPreviewLoading] = useState(false);

  const [modalActivities, setModalActivities] = useState<any[]>([]);
  const [modalPage, setModalPage] = useState(1);
  const [hasMoreModal, setHasMoreModal] = useState(true);
  const [isModalActivityLoading, setIsModalActivityLoading] = useState(false);


  const fetchAffiliateStats = async () => {
    if (!token) { router.push('/admin/login'); return; }
    setIsLoading(true); setError(null);
    try {
      const res = await fetch('https://apitest.binnycash.com/api/admin/dashboardStats', {
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
      });
      const data = await res.json();
      if (res.ok && data.code === 200) setStats(data.data);
      else setError(data.message || 'Failed to fetch affiliate stats.');
    } catch (err) {
      setError("Network error or server is unreachable.");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTiers = async () => {
    if (!token) return;
    setIsTiersLoading(true);
    try {
      const res = await fetch('https://apitest.binnycash.com/api/admin/tiers', {
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
      });
      const json = await res.json();
      if (res.ok && json.code === 200) setTiers(json.data || []);
    } catch (err) { console.error(err); }
    finally { setIsTiersLoading(false); }
  };

  const handleSaveTier = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;
    setIsTierSaving(true);
    try {
      const payload: any = {
        level: Number(tierFormData.level),
        commissionPercent: Number(tierFormData.commissionPercent),
        referralAmount: Number(tierFormData.referralAmount)
      };
      if (tierFormData._id) {
        payload._id = tierFormData._id; 
      }

      const res = await fetch('https://apitest.binnycash.com/api/admin/updateTiers', {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok && data.code === 200) {
        setIsTierModalOpen(false);
        fetchTiers();
      } else {
        alert(data.message || 'Failed to save tier');
      }
    } catch (err) {
      alert('Network error while saving tier');
    } finally {
      setIsTierSaving(false);
    }
  };

  const handleDeleteLastTier = async () => {
    if (!token) return;
    if (!confirm("Are you sure you want to delete the highest affiliate tier? At least one tier must remain.")) return;
    
    setIsTierDeleting(true);
    try {
      const res = await fetch('https://apitest.binnycash.com/api/admin/tier', {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
      });
      const data = await res.json();
      if (res.ok && data.code === 200) {
        fetchTiers();
      } else {
        alert(data.message || 'Failed to delete the tier.');
      }
    } catch (err) {
      alert('Network error while deleting tier');
    } finally {
      setIsTierDeleting(false);
    }
  };

  const handleOpenAddTier = () => {
    setTierFormData({ _id: '', level: '', commissionPercent: '', referralAmount: '' });
    setIsTierModalOpen(true);
  };

  const handleOpenEditTier = (tier: any) => {
    setTierFormData({ 
      _id: tier._id || '', 
      level: tier.level.toString(), 
      commissionPercent: tier.commissionPercent.toString(), 
      referralAmount: tier.referralAmount.toString() 
    });
    setIsTierModalOpen(true);
  };

  const fetchPreviewAffiliates = async () => {
    if (!token) return;
    setIsPreviewAffiliatesLoading(true);
    try {
      const res = await fetch(`https://apitest.binnycash.com/api/admin/affiliateUsers?page=1&limit=4`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
      });
      const json = await res.json();
      if (res.ok && json.code === 200) setPreviewAffiliates(json.data?.data || []);
    } catch (err) { console.error(err); } 
    finally { setIsPreviewAffiliatesLoading(false); }
  };

  const fetchModalAffiliates = async (pageNumber: number) => {
    if (!token) return;
    setIsModalAffiliatesLoading(true);
    try {
      const res = await fetch(`https://apitest.binnycash.com/api/admin/affiliateUsers?page=${pageNumber}&limit=10`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
      });
      const json = await res.json();
      if (res.ok && json.code === 200) {
        setModalAffiliates(json.data?.data || []);
        setModalAffiliatesTotalPages(json.data?.pagination?.totalPages || 1);
        setModalAffiliatesTotal(json.data?.pagination?.total || 0);
      }
    } catch (err) { console.error(err); } 
    finally { setIsModalAffiliatesLoading(false); }
  };

  const fetchUserDetail = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!detailUserId.trim() || !token) return;
    setIsUserDetailLoading(true); 
    setUserDetailError(null);
    setUserDetail(null);
    try {
      const res = await fetch(`https://apitest.binnycash.com/api/admin/userDetail?userId=${detailUserId}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
      });
      const data = await res.json();
      if (res.ok && data.code === 200 && data.data) {
        setUserDetail(data.data);
      } else {
        setUserDetailError(data.message || 'User not found.');
      }
    } catch (err) {
      setUserDetailError("Network error.");
    } finally {
      setIsUserDetailLoading(false);
    }
  };

  const handleToggleTierLock = async () => {
    if (!userDetail || !token) return;
    const currentStatus = userDetail.affiliateStats?.tierLevelStatus;
    const isCurrentlyLocked = currentStatus === 'Locked';
    const newLockedState = !isCurrentlyLocked;

    setIsTogglingLock(true);
    try {
      const formData = new FormData();
      formData.append('userId', userDetail.userInformation.userId.toString());
      formData.append('isLocked', String(newLockedState));

      const res = await fetch('https://apitest.binnycash.com/api/admin/user-level-lock-unlock', {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      if (res.ok && data.code === 200) {
        fetchUserDetail(); 
      } else {
        alert(data.message || 'Failed to update tier lock status');
      }
    } catch (err) {
      alert('Network error while toggling lock status');
    } finally {
      setIsTogglingLock(false);
    }
  };

  const fetchReferralsList = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!refUserId.trim() || !token) return;
    setIsRefLoading(true); setRefError(null);
    try {
      const res = await fetch(`https://apitest.binnycash.com/api/admin/referrals?userId=${refUserId}&page=${refPage}&limit=${refLimit}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
      });
      const data = await res.json();
      if (res.ok && data.code === 200) {
        setReferrals(data.data?.data || []);
        setRefTotalPages(data.data?.pagination?.totalPages || 1);
        setRefTotalRecords(data.data?.pagination?.total || 0);
      } else {
        setRefError(data.message || 'Failed to fetch referrals.');
        setReferrals([]);
      }
    } catch (err) {
      setRefError("Network error.");
      setReferrals([]);
    } finally {
      setIsRefLoading(false);
    }
  };

  const fetchPreviewActivities = async () => {
    if (!token) return;
    setIsPreviewLoading(true);
    try {
      const res = await fetch(`https://apitest.binnycash.com/api/admin/recentActivity?page=1&limit=5`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
      });
      const json = await res.json();
      if (res.ok && json.code === 200) setPreviewActivities(json?.data?.data || []);
    } catch (err) { console.error(err); } 
    finally { setIsPreviewLoading(false); }
  };

  const fetchModalActivities = async (pageNumber: number) => {
    if (!token) return;
    setIsModalActivityLoading(true);
    try {
      const res = await fetch(`https://apitest.binnycash.com/api/admin/recentActivity?page=${pageNumber}&limit=20`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
      });
      const json = await res.json();
      if (res.ok && json.code === 200) {
        const newActivities = json?.data?.data || [];
        const pagination = json?.data?.pagination;
        setModalActivities(prev => {
          if (pageNumber === 1) return newActivities;
          const existingIds = new Set(prev.map(a => a._id || a.createdAt));
          const filtered = newActivities.filter((a: any) => !existingIds.has(a._id || a.createdAt));
          return [...prev, ...filtered];
        });
        setHasMoreModal(pageNumber < (pagination?.totalPages || 1));
      } else { setHasMoreModal(false); }
    } catch (err) { setHasMoreModal(false); } 
    finally { setIsModalActivityLoading(false); }
  };

  const fetchCommissionLogs = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!logUserId.trim() || !token) return;
    setIsLogsLoading(true); setLogsError(null);
    try {
      let url = `https://apitest.binnycash.com/api/admin/commissionLogs?userId=${logUserId}&page=${logPage}&limit=${logLimit}`;
      if (logStatus) url += `&status=${logStatus}`;
      const res = await fetch(url, { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok && data.code === 200) {
        const logsList = data?.data?.logs || data?.data?.list || data?.data || [];
        setLogs(Array.isArray(logsList) ? logsList : []);
        setLogsTotalPages(data?.data?.totalPages || 1);
        setLogsTotalRecords(data?.data?.totalRecords || logsList.length);
      } else {
        setLogsError(data.message || 'Failed to fetch commission logs.');
      }
    } catch (err) {
      setLogsError("Network error.");
    } finally {
      setIsLogsLoading(false);
    }
  };
  useEffect(() => {
    fetchAffiliateStats();
    fetchPreviewActivities();
    fetchPreviewAffiliates();
    fetchTiers();
  }, [router]);

  useEffect(() => { if (logUserId) fetchCommissionLogs(); }, [logPage, logLimit]);
  useEffect(() => { if (refUserId) fetchReferralsList(); }, [refPage, refLimit]);
  useEffect(() => { if (modalPage > 1 && isActivityModalOpen) fetchModalActivities(modalPage); }, [modalPage]);

  const handleOpenActivityModal = () => {
    setIsActivityModalOpen(true);
    if (modalActivities.length === 0) { setModalPage(1); fetchModalActivities(1); }
  };

  const handleOpenAffiliatesModal = () => {
    setIsAffiliatesModalOpen(true);
    if (modalAffiliates.length === 0) { setModalAffiliatesPage(1); fetchModalAffiliates(1); }
  };

  const observer = useRef<IntersectionObserver | null>(null);
  const lastModalElementRef = useCallback((node: HTMLDivElement) => {
    if (isModalActivityLoading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMoreModal) { setModalPage(prev => prev + 1); }
    });
    if (node) observer.current.observe(node);
  }, [isModalActivityLoading, hasMoreModal, modalPage]);

  const resolveImage = (imgSrc: string) => imgSrc && !imgSrc.startsWith('http') ? `https://apitest.binnycash.com${imgSrc}` : imgSrc;
  const trendData = stats?.referralCommissionTrend || [];

  const getActivityIcon = (type: string) => {
    switch(type) {
      case 'WITHDRAWAL_REQUEST': return <Wallet className="w-4 h-4 text-amber-500" />;
      case 'NEW_REFERRAL': return <UserPlus className="w-4 h-4 text-blue-500" />;
      case 'COMMISSION_APPROVED': return <CheckCircle2 className="w-4 h-4 text-green-500" />;
      default: return <Activity className="w-4 h-4 text-[#8B5CF6]" />;
    }
  };

  const formatActivityDate = (dateString: string) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    return `${d.toLocaleDateString('en-US')} at ${d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;
  };

  return (
    <div className="flex flex-col gap-8 text-black w-full max-w-[1500px] mx-auto relative pb-10">
      
      {/* SECTION 1: DASHBOARD OVERVIEW */}
      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black uppercase tracking-wider text-black">Affiliate Dashboard</h1>
            <p className="text-xs text-gray-500">Monitor referral performance, commissions, and top partners</p>
          </div>
          <button 
            onClick={() => { fetchAffiliateStats(); fetchPreviewActivities(); fetchPreviewAffiliates(); fetchTiers(); }}
            disabled={isLoading}
            className="bg-white hover:bg-gray-50 border border-gray-200 text-black px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 text-[#8B5CF6] ${isLoading ? 'animate-spin' : ''}`} /> 
            Refresh Dashboard
          </button>
        </div>

        {error && (
          <div className="w-full bg-red-50 border border-red-200 text-red-600 p-4 rounded-2xl flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 shrink-0" />
            <span className="text-sm font-bold">{error}</span>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-gray-200 rounded-2xl p-5 flex flex-col justify-between shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-500 text-xs font-bold uppercase tracking-wider">Total Affiliates</span>
              <div className="w-8 h-8 rounded-lg bg-[#8B5CF6]/10 text-[#8B5CF6] flex items-center justify-center"><Users className="w-4 h-4" /></div>
            </div>
            <div className="mt-4">
              <h2 className="text-2xl font-black text-black">{isLoading ? '...' : (stats?.totalAffiliates || 0)}</h2>
              <span className="text-green-600 text-[11px] font-bold flex items-center gap-1 mt-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span> {stats?.activeAffiliates || 0} Active currently
              </span>
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl p-5 flex flex-col justify-between shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-500 text-xs font-bold uppercase tracking-wider">Total Referrals</span>
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-500 flex items-center justify-center"><UserPlus className="w-4 h-4" /></div>
            </div>
            <div className="mt-4">
              <h2 className="text-2xl font-black text-black">{isLoading ? '...' : (stats?.totalReferrals || 0)}</h2>
              <span className="text-blue-500 text-[11px] font-bold flex items-center gap-1 mt-1"><ArrowUpRight className="w-3 h-3" /> +{stats?.todayReferrals || 0} Referrals Today</span>
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl p-5 flex flex-col justify-between shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-500 text-xs font-bold uppercase tracking-wider">Commission Paid</span>
              <div className="w-8 h-8 rounded-lg bg-green-50 text-green-500 flex items-center justify-center"><DollarSign className="w-4 h-4" /></div>
            </div>
            <div className="mt-4">
              <h2 className="text-2xl font-black text-black">{isLoading ? '...' : formatPrice(Number(stats?.totalCommissionPaid || 0), currency)}</h2>
              <span className="text-gray-500 text-[11px] font-medium mt-1 block">Out of {formatPrice(Number(stats?.totalCommission || 0), currency)} total</span>
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-2xl p-5 flex flex-col justify-between shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-gray-500 text-xs font-bold uppercase tracking-wider">Pending Payouts</span>
              <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-500 flex items-center justify-center"><Clock className="w-4 h-4" /></div>
            </div>
            <div className="mt-4">
              <h2 className="text-2xl font-black text-black">{isLoading ? '...' : formatPrice(Number(stats?.pendingCommission || 0), currency)}</h2>
              <span className="text-red-500 text-[11px] font-medium mt-1 flex items-center gap-1"><Ban className="w-3 h-3" /> {formatPrice(Number(stats?.reversedCommission || 0), currency)} Reversed</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white border border-gray-200 rounded-2xl p-6 flex flex-col gap-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-black font-bold text-base">Referral & Commission Trend</h3>
                <p className="text-gray-500 text-xs">Full history performance chart</p>
              </div>
              <button onClick={() => setIsTrendModalOpen(true)} className="flex items-center gap-2 bg-[#8B5CF6]/10 hover:bg-[#8B5CF6]/20 text-[#8B5CF6] px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer">
                <List className="w-4 h-4" /> View Full Table
              </button>
            </div>
            <div className="w-full h-[240px] bg-gray-50 rounded-xl border border-gray-200 p-4 overflow-hidden flex flex-col">
              {isLoading ? (
                <div className="flex-1 flex items-center justify-center text-xs text-gray-500 animate-pulse">Loading trend data...</div>
              ) : trendData.length === 0 ? (
                <div className="flex-1 flex items-center justify-center text-xs text-gray-500">No trend data available.</div>
              ) : (
                <div className="w-full h-full flex items-end gap-1.5 sm:gap-2 pt-6 px-1 overflow-x-auto custom-scrollbar pb-2">
                  {trendData.map((item: any, idx: number) => {
                    const maxComm = Math.max(...trendData.map((d:any) => d.commission || 0)) || 1;
                    const heightPercent = Math.min(Math.max(((item.commission || 0) / maxComm) * 100, 5), 100);
                    const dateStr = item.date ? item.date.split('-').slice(1).join('/') : `D${idx}`;
                    return (
                      <div key={idx} className="flex flex-col items-center gap-2 h-full justify-end group relative min-w-[20px] sm:min-w-[30px]">
                        <div className="absolute -top-12 left-1/2 -translate-x-1/2 bg-black text-white text-[10px] py-1.5 px-2.5 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10 shadow-lg">
                          {item.date}<br/>
                          <span className="text-[#8B5CF6] font-bold">{item.referrals} Refs</span> | <span className="text-green-400">{formatPrice(item.commission, currency)}</span>
                        </div>
                        <div style={{ height: `${heightPercent}%` }} className={`w-full rounded-t-lg transition-all duration-300 group-hover:brightness-90 ${item.commission > 0 ? 'bg-gradient-to-t from-[#8B5CF6]/60 to-[#8B5CF6]' : 'bg-gray-200'}`} />
                        <span className="text-[8px] sm:text-[9px] text-gray-500">{dateStr}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          <div className="bg-white border border-gray-200 rounded-2xl p-6 flex flex-col gap-4 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-black font-bold text-base">Commission Status</h3>
                <p className="text-gray-500 text-xs">Breakdown by approval state</p>
              </div>
              <PieChart className="w-5 h-5 text-[#8B5CF6]" />
            </div>
            <div className="flex flex-col gap-4 mt-2 justify-center flex-1">
              {isLoading ? (
                <div className="text-xs text-gray-500 animate-pulse">Loading status...</div>
              ) : stats?.commissionByStatus?.length > 0 ? (
                stats.commissionByStatus.map((status: any, idx: number) => (
                  <div key={idx} className="flex flex-col gap-1.5 bg-gray-50 p-4 rounded-xl border border-gray-200">
                    <div className="flex justify-between items-center text-xs font-bold">
                      <div className="flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: status.color || '#8B5CF6' }}></span>
                        <span className="text-black">{status.name}</span>
                      </div>
                      <span style={{ color: status.color || '#8B5CF6' }}>{formatPrice(status.value, currency)} ({status.pct}%)</span>
                    </div>
                    <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden mt-1">
                      <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${status.pct}%`, backgroundColor: status.color || '#8B5CF6' }} />
                    </div>
                  </div>
                ))
              ) : (
                 <div className="text-xs text-gray-500">No distribution data available.</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ==========================================
          SECTION 2: USER DETAIL SEARCH & TOGGLE LOCK
      ========================================== */}
      <div className="flex items-center gap-4 mt-8 mb-2 opacity-50">
        <div className="h-px bg-gray-300 flex-1" />
        <UserSquare className="w-5 h-5 text-gray-400" />
        <div className="h-px bg-gray-300 flex-1" />
      </div>

      <div className="flex flex-col gap-6">
        <div>
          <h2 className="text-2xl font-black uppercase tracking-wider text-black">Affiliate User Lookup</h2>
          <p className="text-xs text-gray-500 mt-1">Fetch detailed profile, stats, and device information of a specific affiliate user.</p>
        </div>

        {userDetailError && (
          <div className="w-full bg-red-50 border border-red-200 text-red-600 p-4 rounded-2xl flex items-center gap-3 animate-shake">
            <ShieldAlert className="w-5 h-5 shrink-0" /><span className="text-sm font-bold">{userDetailError}</span>
          </div>
        )}

        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <form onSubmit={fetchUserDetail} className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex flex-col gap-2 flex-1">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">Affiliate User ID <span className="text-red-500">*</span></label>
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="text" required value={detailUserId} onChange={(e) => setDetailUserId(e.target.value)} 
                  placeholder="Enter User ID (e.g., 30)" 
                  className="w-full bg-white border border-gray-300 rounded-xl pl-10 pr-4 py-3 text-sm text-black focus:outline-none focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6] transition-all" 
                />
              </div>
            </div>
            <button 
              type="submit" disabled={isUserDetailLoading} 
              className="bg-[#8B5CF6] hover:bg-[#7c3aed] text-white font-bold py-3 px-8 rounded-xl transition-all shadow-[0_4px_15px_rgba(139,92,246,0.3)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
            >
              {isUserDetailLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Fetch Details'}
            </button>
          </form>
        </div>

        {userDetail && userDetail.userInformation && (
          <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm flex flex-col md:flex-row items-center md:items-start gap-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#8B5CF6]/5 rounded-bl-full pointer-events-none" />
            
            <img 
              src={resolveImage(userDetail.userInformation.profilePic) || `https://ui-avatars.com/api/?name=${userDetail.userInformation.userName}&background=8B5CF6&color=fff`} 
              alt={userDetail.userInformation.userName} 
              className="w-24 h-24 rounded-2xl object-cover border-2 border-gray-100 shadow-sm shrink-0" 
            />
            
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full">
              
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Affiliate Name</span>
                <span className="text-lg font-black text-black flex items-center gap-2">
                  {userDetail.userInformation.userName || 'N/A'}
                  {userDetail.userInformation.kycStatus && <span title="KYC Verified"><CheckCircle2 className="w-4 h-4 text-green-500" /></span>}
                </span>
                <span className="text-sm text-gray-500">{userDetail.userInformation.email || 'N/A'}</span>
                <span className="text-xs text-gray-400 mt-0.5 flex items-center gap-1">
                  <Globe className="w-3 h-3" /> {userDetail.userInformation.country || 'Unknown Location'}
                </span>
              </div>
              
              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Referral Activity</span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="bg-[#8B5CF6]/10 text-[#8B5CF6] px-2.5 py-1 rounded-md text-xs font-bold border border-[#8B5CF6]/20">Code: {userDetail.userInformation.referralCode || 'N/A'}</span>
                </div>
                <span className="text-sm text-gray-600 font-medium mt-1">
                  {userDetail.referralActivity?.totalReferrals || userDetail.userInformation.referralCount || 0} Successful Users
                </span>
                <span className="text-xs text-gray-400">
                  {userDetail.referralActivity?.totalClicks || 0} Clicks | {userDetail.referralActivity?.totalConversions || 0} Conversions
                </span>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Tier Status</span>
                <div className="flex items-center gap-2 mt-1">
                  <span className="font-black text-black">Tier {userDetail.affiliateStats?.tier || '1'}</span>
                  <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${userDetail.affiliateStats?.tierLevelStatus === 'Unlock' || userDetail.affiliateStats?.tierLevelStatus === 'Active' ? 'bg-green-50 text-green-600 border border-green-200' : 'bg-red-50 text-red-600 border border-red-200'}`}>
                    {userDetail.affiliateStats?.tierLevelStatus || 'N/A'}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-sm text-gray-500">Bonus: {userDetail.affiliateStats?.commissionPercent || 0}%</span>
                  <button 
                    onClick={handleToggleTierLock}
                    disabled={isTogglingLock}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold border transition-colors cursor-pointer disabled:opacity-50 ${userDetail.affiliateStats?.tierLevelStatus === 'Locked' ? 'bg-green-50 hover:bg-green-100 text-green-600 border-green-200' : 'bg-red-50 hover:bg-red-100 text-red-600 border-red-200'}`}
                  >
                    {isTogglingLock ? <Loader2 className="w-3 h-3 animate-spin" /> : (userDetail.affiliateStats?.tierLevelStatus === 'Locked' ? <><Unlock className="w-3 h-3" /> Unlock</> : <><Lock className="w-3 h-3" /> Lock</>)}
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Earnings Stats</span>
                <span className="text-xl font-black text-green-600" title="Total Earned">
                  {formatPrice(Number(userDetail.affiliateStats?.totalReferEarnings || 0), currency)}
                </span>
                <div className="flex gap-2 text-[10px] font-bold mt-0.5">
                  <span className="text-amber-500" title="Pending">{formatPrice(Number(userDetail.affiliateStats?.pendingEarnings || 0), currency)} Pend</span>
                  <span className="text-red-500" title="Reversed">{formatPrice(Number(userDetail.affiliateStats?.reverseReferEarnings || 0), currency)} Rev</span>
                </div>
              </div>

              <div className="flex flex-col gap-1 sm:col-span-2 lg:col-span-2">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">System & Registration</span>
                <span className="text-sm text-gray-600 font-medium">Joined: {userDetail.userInformation.joinedOn ? new Date(userDetail.userInformation.joinedOn).toLocaleString() : 'N/A'}</span>
                {userDetail.deviceInfo && (
                  <span className="text-xs text-gray-400 mt-1 line-clamp-1">
                    IP: {userDetail.deviceInfo.ipAddress || 'N/A'} • {userDetail.deviceInfo.os || 'Unknown OS'} • {userDetail.deviceInfo.browser || 'Unknown Browser'}
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ==========================================
          SECTION 3: AFFILIATE REFERRALS LIST
      ========================================== */}
      <div className="flex items-center gap-4 mt-8 mb-2 opacity-50">
        <div className="h-px bg-gray-300 flex-1" />
        <Network className="w-5 h-5 text-gray-400" />
        <div className="h-px bg-gray-300 flex-1" />
      </div>

      <div className="flex flex-col gap-6">
        <div>
          <h2 className="text-2xl font-black uppercase tracking-wider text-black">Affiliate Referrals List</h2>
          <p className="text-xs text-gray-500 mt-1">Get the paginated list of users referred by a specific affiliate user.</p>
        </div>

        {refError && (
          <div className="w-full bg-red-50 border border-red-200 text-red-600 p-4 rounded-2xl flex items-center gap-3 animate-shake">
            <ShieldAlert className="w-5 h-5 shrink-0" /><span className="text-sm font-bold">{refError}</span>
          </div>
        )}

        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <form onSubmit={(e) => { setRefPage(1); fetchReferralsList(e); }} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            <div className="flex flex-col gap-2 md:col-span-7">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">User ID <span className="text-red-500">*</span></label>
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input 
                  type="text" required value={refUserId} onChange={(e) => setRefUserId(e.target.value)} 
                  placeholder="Enter Affiliate User ID" 
                  className="w-full bg-white border border-gray-300 rounded-xl pl-10 pr-4 py-3 text-sm text-black focus:outline-none focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6] transition-all" 
                />
              </div>
            </div>
            
            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Per Page</label>
              <select value={refLimit} onChange={(e) => setRefLimit(Number(e.target.value))} className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-sm text-black focus:outline-none focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6] transition-all cursor-pointer">
                <option value="10">10 Records</option>
                <option value="20">20 Records</option>
                <option value="50">50 Records</option>
              </select>
            </div>

            <div className="md:col-span-3">
              <button type="submit" disabled={isRefLoading} className="w-full bg-[#8B5CF6] hover:bg-[#7c3aed] text-white font-bold py-3 rounded-xl transition-all shadow-[0_4px_15px_rgba(139,92,246,0.3)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70">
                {isRefLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Fetch Referrals'}
              </button>
            </div>
          </form>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 text-gray-500 text-[11px] font-bold uppercase tracking-wider bg-gray-50">
                  <th className="py-4 px-5">Referred User Details</th>
                  <th className="py-4 px-5">Join Date</th>
                  <th className="py-4 px-5 text-right">Status / Info</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-sm bg-white">
                {isRefLoading ? (
                  <tr><td colSpan={3} className="py-12 text-center text-gray-500 animate-pulse font-medium"><Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#8B5CF6]" />Fetching referrals...</td></tr>
                ) : referrals.length > 0 ? (
                  referrals.map((ref: any, idx: number) => (
                    <tr key={ref.id || ref._id || idx} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-5">
                        <div className="flex flex-col">
                          <span className="font-bold text-black">{ref.userName || ref.name || `User ID: ${ref.userId || 'N/A'}`}</span>
                          <span className="text-gray-500 text-xs">{ref.email || 'No email provided'}</span>
                        </div>
                      </td>
                      <td className="py-4 px-5 text-gray-500">
                        {ref.createdAt || ref.joinedOn ? new Date(ref.createdAt || ref.joinedOn).toLocaleDateString() : 'N/A'}
                      </td>
                      <td className="py-4 px-5 text-right">
                         <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-gray-100 text-gray-600 border border-gray-200">
                          {ref.status || 'Registered'}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={3} className="py-12 text-center text-gray-500">{refUserId ? "No referrals found for this user." : "Enter an Affiliate User ID and click fetch to see referrals."}</td></tr>
                )}
              </tbody>
            </table>
          </div>
          {referrals.length > 0 && (
            <div className="p-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500">Showing page <strong className="text-black">{refPage}</strong> of <strong className="text-black">{refTotalPages}</strong> {refTotalRecords > 0 && ` (${refTotalRecords} total records)`}</span>
              <div className="flex items-center gap-2">
                <button onClick={() => { if (refPage > 1) setRefPage(p => p - 1); }} disabled={refPage === 1 || isRefLoading} className="w-9 h-9 rounded-xl bg-white hover:bg-gray-200 border border-gray-300 flex items-center justify-center text-black disabled:opacity-50 transition-colors cursor-pointer"><ChevronLeft className="w-5 h-5" /></button>
                <button onClick={() => { if (refPage < refTotalPages) setRefPage(p => p + 1); }} disabled={refPage >= refTotalPages || isRefLoading} className="w-9 h-9 rounded-xl bg-white hover:bg-gray-200 border border-gray-300 flex items-center justify-center text-black disabled:opacity-50 transition-colors cursor-pointer"><ChevronRight className="w-5 h-5" /></button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ==========================================
          SECTION 4: AFFILIATE USERS LIST (PREVIEW)
      ========================================== */}
      <div className="flex items-center gap-4 mt-8 mb-2 opacity-50">
        <div className="h-px bg-gray-300 flex-1" />
        <Share2 className="w-5 h-5 text-gray-400" />
        <div className="h-px bg-gray-300 flex-1" />
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black uppercase tracking-wider text-black">Affiliate Users Directory</h2>
            <p className="text-gray-500 text-sm mt-1">Complete list of registered affiliate partners and their current tiers.</p>
          </div>
          <button 
            onClick={handleOpenAffiliatesModal}
            className="flex items-center gap-2 bg-[#8B5CF6]/10 hover:bg-[#8B5CF6]/20 text-[#8B5CF6] px-4 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer"
          >
            <Eye className="w-4 h-4" /> View All
          </button>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 text-gray-500 text-[11px] font-bold uppercase tracking-wider bg-gray-50">
                  <th className="py-4 px-5">Affiliate Details</th>
                  <th className="py-4 px-5">Referral Code</th>
                  <th className="py-4 px-5">Referrals</th>
                  <th className="py-4 px-5">Tier Level</th>
                  <th className="py-4 px-5 text-right">Total Earning</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-sm bg-white">
                {isPreviewAffiliatesLoading ? (
                  <tr><td colSpan={5} className="py-12 text-center text-gray-500 animate-pulse font-medium"><Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#8B5CF6]" />Loading users...</td></tr>
                ) : previewAffiliates.length > 0 ? (
                  previewAffiliates.map((user: any) => (
                    <tr key={user.userId} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <img src={resolveImage(user.profilePic) || `https://ui-avatars.com/api/?name=${user.userName}&background=8B5CF6&color=fff`} alt={user.userName} className="w-10 h-10 rounded-lg object-cover border border-gray-200" />
                          <div className="flex flex-col">
                            <span className="font-bold text-black text-[15px]">{user.userName}</span>
                            <span className="text-gray-500 text-xs">{user.email}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-5">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-[#8B5CF6]/10 text-[#8B5CF6] border border-[#8B5CF6]/20">
                          {user.referralCode}
                        </span>
                      </td>
                      <td className="py-4 px-5 text-gray-600 font-medium">{user.referrals} Users</td>
                      <td className="py-4 px-5">
                        <div className="flex flex-col">
                          <span className="font-bold text-black text-sm">Tier {user.tier}</span>
                          <span className="text-[10px] text-gray-500">Bonus: {user.tierBouns}%</span>
                        </div>
                      </td>
                      <td className="py-4 px-5 text-right font-black text-green-600">
                        {formatPrice(Number(user.totalReferEarning || 0), currency)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={5} className="py-12 text-center text-gray-500">No affiliate users found.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ==========================================
          SECTION 5: TIER SYSTEM OVERVIEW (WITH ADD/EDIT/DELETE)
      ========================================== */}
      <div className="flex items-center gap-4 mt-8 mb-2 opacity-50">
        <div className="h-px bg-gray-300 flex-1" />
        <Layers className="w-5 h-5 text-gray-400" />
        <div className="h-px bg-gray-300 flex-1" />
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black uppercase tracking-wider text-black">Affiliate Tier System</h2>
            <p className="text-gray-500 text-sm mt-1">Current system configurations for tier levels, commissions, and requirements.</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={handleDeleteLastTier}
              disabled={isTierDeleting || tiers.length === 0}
              className="flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 px-4 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer disabled:opacity-50"
            >
              {isTierDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              Delete Highest Tier
            </button>
            <button 
              onClick={handleOpenAddTier}
              className="flex items-center gap-2 bg-[#8B5CF6] hover:bg-[#7c3aed] text-white px-4 py-2 rounded-xl text-sm font-bold transition-all shadow-md cursor-pointer"
            >
              <Plus className="w-4 h-4" /> Add New Tier
            </button>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 text-gray-500 text-[11px] font-bold uppercase tracking-wider bg-gray-50">
                  <th className="py-4 px-5">Tier Level</th>
                  <th className="py-4 px-5">Commission Rate</th>
                  <th className="py-4 px-5">Required Referrals Amount</th>
                  <th className="py-4 px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-sm bg-white">
                {isTiersLoading ? (
                  <tr><td colSpan={4} className="py-12 text-center text-gray-500 animate-pulse font-medium"><Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#8B5CF6]" />Loading tiers...</td></tr>
                ) : tiers.length > 0 ? (
                  tiers.map((tier: any, idx: number) => (
                    <tr key={idx} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-5">
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-[#8B5CF6]/10 text-[#8B5CF6] border border-[#8B5CF6]/20">
                          Tier {tier.level}
                        </span>
                      </td>
                      <td className="py-4 px-5 font-black text-green-600">{tier.commissionPercent}%</td>
                      <td className="py-4 px-5 font-medium text-black">
                        {formatPrice(Number(tier.referralAmount || 0), currency)}
                      </td>
                      <td className="py-4 px-5 text-right">
                        <button 
                          onClick={() => handleOpenEditTier(tier)}
                          className="bg-gray-100 hover:bg-gray-200 text-gray-600 border border-gray-200 p-2 rounded-lg transition-colors cursor-pointer"
                          title="Edit Tier"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={4} className="py-12 text-center text-gray-500">No tiers configured.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* ==========================================
          SECTION 6: RECENT ACTIVITY PREVIEW
      ========================================== */}
      <div className="flex items-center gap-4 mt-8 mb-2 opacity-50">
        <div className="h-px bg-gray-300 flex-1" />
        <Activity className="w-5 h-5 text-gray-400" />
        <div className="h-px bg-gray-300 flex-1" />
      </div>

      <div className="flex flex-col gap-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-black uppercase tracking-wider text-black">Recent Platform Activity</h2>
            <p className="text-gray-500 text-sm mt-1">Live feed of withdrawals, referrals, and approved commissions</p>
          </div>
          <button 
            onClick={handleOpenActivityModal}
            className="flex items-center gap-2 bg-[#8B5CF6]/10 hover:bg-[#8B5CF6]/20 text-[#8B5CF6] px-4 py-2 rounded-xl text-sm font-bold transition-all cursor-pointer"
          >
            <Eye className="w-4 h-4" /> View All
          </button>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl p-4 sm:p-6 shadow-sm flex flex-col gap-4">
          {isPreviewLoading ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="w-6 h-6 animate-spin text-[#8B5CF6]" />
            </div>
          ) : previewActivities.length === 0 ? (
             <div className="text-center py-10 text-gray-500 text-sm">No recent activity found.</div>
          ) : (
            <div className="flex flex-col gap-3">
              {previewActivities.map((act: any, idx: number) => (
                <div key={idx} className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-gray-50 hover:bg-gray-100 transition-colors">
                  <div className="w-10 h-10 shrink-0 rounded-full flex items-center justify-center border border-gray-200 bg-white">
                    {getActivityIcon(act.type)}
                  </div>
                  <div className="flex flex-col flex-1">
                    <span className="font-bold text-black text-[15px]">{act.title}</span>
                    <span className="text-gray-500 text-sm mt-0.5">{act.description}</span>
                  </div>
                  <div className="shrink-0 text-right">
                    <span className="text-gray-500 text-xs">{formatActivityDate(act.createdAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ==========================================
          SECTION 7: COMMISSION LOGS
      ========================================== */}
      <div className="flex items-center gap-4 mt-8 mb-2 opacity-50">
        <div className="h-px bg-gray-300 flex-1" />
        <History className="w-5 h-5 text-gray-400" />
        <div className="h-px bg-gray-300 flex-1" />
      </div>

      <div className="flex flex-col gap-6">
        <div>
          <h2 className="text-2xl font-black uppercase tracking-wider text-black">Detailed Commission Logs</h2>
          <p className="text-xs text-gray-500 mt-1">Search and filter individual commission payouts by User ID</p>
        </div>

        {logsError && (
          <div className="w-full bg-red-50 border border-red-200 text-red-600 p-4 rounded-2xl flex items-center gap-3 animate-shake">
            <ShieldAlert className="w-5 h-5 shrink-0" /><span className="text-sm font-bold">{logsError}</span>
          </div>
        )}

        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
          <form onSubmit={(e) => { setLogPage(1); fetchCommissionLogs(e); }} className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
            <div className="flex flex-col gap-2 md:col-span-4">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">User ID <span className="text-red-500">*</span></label>
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input type="text" required value={logUserId} onChange={(e) => setLogUserId(e.target.value)} placeholder="Enter Affiliate User ID" className="w-full bg-white border border-gray-300 rounded-xl pl-10 pr-4 py-3 text-sm text-black focus:outline-none focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6] transition-all" />
              </div>
            </div>
            <div className="flex flex-col gap-2 md:col-span-3">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Status Filter</label>
              <div className="relative">
                <Filter className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <select value={logStatus} onChange={(e) => setLogStatus(e.target.value)} className="w-full bg-white border border-gray-300 rounded-xl pl-10 pr-4 py-3 text-sm text-black focus:outline-none focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6] transition-all appearance-none cursor-pointer">
                  <option value="">All Statuses</option>
                  <option value="COMPLETE">COMPLETE</option>
                  <option value="REVERSE">REVERSE</option>
                </select>
              </div>
            </div>
            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Per Page</label>
              <select value={logLimit} onChange={(e) => setLogLimit(Number(e.target.value))} className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-sm text-black focus:outline-none focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6] transition-all cursor-pointer">
                <option value="10">10 Records</option>
                <option value="20">20 Records</option>
                <option value="50">50 Records</option>
              </select>
            </div>
            <div className="md:col-span-3">
              <button type="submit" disabled={isLogsLoading} className="w-full bg-[#8B5CF6] hover:bg-[#7c3aed] text-white font-bold py-3 rounded-xl transition-all shadow-[0_4px_15px_rgba(139,92,246,0.3)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70">
                {isLogsLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Fetch Logs'}
              </button>
            </div>
          </form>
        </div>

        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm flex flex-col">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 text-gray-500 text-[11px] font-bold uppercase tracking-wider bg-gray-50">
                  <th className="py-4 px-5">Log Reference</th>
                  <th className="py-4 px-5">Date & Time</th>
                  <th className="py-4 px-5">Commission Amount</th>
                  <th className="py-4 px-5 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 text-sm bg-white">
                {isLogsLoading ? (
                  <tr><td colSpan={4} className="py-12 text-center text-gray-500 animate-pulse font-medium"><Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#8B5CF6]" />Fetching records...</td></tr>
                ) : logs.length > 0 ? (
                  logs.map((log: any, idx: number) => (
                    <tr key={log._id || idx} className="hover:bg-gray-50 transition-colors">
                      <td className="py-4 px-5 font-medium text-black">{log.referenceId || log._id || `LOG-${idx + 1000}`}</td>
                      <td className="py-4 px-5 text-gray-500">{log.createdAt ? new Date(log.createdAt).toLocaleString() : 'N/A'}</td>
                      <td className="py-4 px-5 font-black text-green-600">{formatPrice(Number(log.amount || log.commission || 0), currency)}</td>
                      <td className="py-4 px-5 text-right flex justify-end">
                        {log.status === 'REVERSE' ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-red-50 text-red-600 border border-red-200"><Ban className="w-3.5 h-3.5" /> Reversed</span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-green-50 text-green-600 border border-green-200"><CheckCircle2 className="w-3.5 h-3.5" /> Completed</span>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={4} className="py-12 text-center text-gray-500">{logUserId ? "No logs found for this user." : "Enter a User ID and click fetch to see logs."}</td></tr>
                )}
              </tbody>
            </table>
          </div>
          {logs.length > 0 && (
            <div className="p-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between">
              <span className="text-xs font-medium text-gray-500">Showing page <strong className="text-black">{logPage}</strong> of <strong className="text-black">{logsTotalPages}</strong> {logsTotalRecords > 0 && ` (${logsTotalRecords} total records)`}</span>
              <div className="flex items-center gap-2">
                <button onClick={() => { if (logPage > 1) setLogPage(p => p - 1); }} disabled={logPage === 1 || isLogsLoading} className="w-9 h-9 rounded-xl bg-white hover:bg-gray-200 border border-gray-300 flex items-center justify-center text-black disabled:opacity-50 transition-colors cursor-pointer"><ChevronLeft className="w-5 h-5" /></button>
                <button onClick={() => { if (logPage < logsTotalPages) setLogPage(p => p + 1); }} disabled={logPage >= logsTotalPages || isLogsLoading} className="w-9 h-9 rounded-xl bg-white hover:bg-gray-200 border border-gray-300 flex items-center justify-center text-black disabled:opacity-50 transition-colors cursor-pointer"><ChevronRight className="w-5 h-5" /></button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ==========================================
          MODALS SECTION (POP-UPS)
      ========================================== */}
      
      {/* 0. ADD/EDIT TIER MODAL */}
      {isTierModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white border border-gray-200 w-full max-w-md rounded-[24px] shadow-xl flex flex-col relative overflow-hidden">
            <div className="p-5 border-b border-gray-200 flex items-center justify-between bg-gray-50">
              <div>
                <h3 className="text-lg font-black text-black flex items-center gap-2"><Layers className="w-5 h-5 text-[#8B5CF6]" /> {tierFormData._id ? 'Edit Tier' : 'Add New Tier'}</h3>
                <p className="text-xs text-gray-500 mt-1">Configure tier level, commission, and requirement.</p>
              </div>
              <button onClick={() => setIsTierModalOpen(false)} className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center text-gray-600 hover:text-black transition-colors cursor-pointer"><X className="w-4 h-4" /></button>
            </div>
            
            <form onSubmit={handleSaveTier} className="p-5 flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Tier Level <span className="text-red-500">*</span></label>
                <input 
                  type="number" required value={tierFormData.level} onChange={(e) => setTierFormData({...tierFormData, level: e.target.value})} 
                  placeholder="e.g. 1" 
                  className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-sm text-black focus:outline-none focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6] transition-all" 
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Commission Percent (%) <span className="text-red-500">*</span></label>
                <input 
                  type="number" required step="any" value={tierFormData.commissionPercent} onChange={(e) => setTierFormData({...tierFormData, commissionPercent: e.target.value})} 
                  placeholder="e.g. 5" 
                  className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-sm text-black focus:outline-none focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6] transition-all" 
                />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Required Referral Amount <span className="text-red-500">*</span></label>
                <input 
                  type="number" required step="any" value={tierFormData.referralAmount} onChange={(e) => setTierFormData({...tierFormData, referralAmount: e.target.value})} 
                  placeholder="e.g. 100" 
                  className="w-full bg-white border border-gray-300 rounded-xl px-4 py-3 text-sm text-black focus:outline-none focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6] transition-all" 
                />
              </div>
              
              <div className="flex justify-end gap-3 mt-4">
                <button type="button" onClick={() => setIsTierModalOpen(false)} className="bg-gray-100 hover:bg-gray-200 text-gray-600 px-5 py-2.5 rounded-xl text-sm font-bold transition-colors cursor-pointer">
                  Cancel
                </button>
                <button type="submit" disabled={isTierSaving} className="bg-[#8B5CF6] hover:bg-[#7c3aed] text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-colors shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70">
                  {isTierSaving && <Loader2 className="w-4 h-4 animate-spin" />} Save Tier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 1. TREND MODAL */}
      {isTrendModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white border border-gray-200 w-full max-w-2xl max-h-[80vh] rounded-[24px] shadow-xl flex flex-col relative overflow-hidden">
            <div className="p-5 border-b border-gray-200 flex items-center justify-between bg-gray-50">
              <div>
                <h3 className="text-lg font-black text-black flex items-center gap-2"><List className="w-5 h-5 text-[#8B5CF6]" /> Full Trend History</h3>
                <p className="text-xs text-gray-500 mt-1">Detailed view of dates, referrals, and commissions.</p>
              </div>
              <button onClick={() => setIsTrendModalOpen(false)} className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center text-gray-600 hover:text-black transition-colors cursor-pointer"><X className="w-4 h-4" /></button>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar p-5">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-gray-50 z-10 shadow-sm">
                  <tr className="border-b border-gray-200 text-gray-500 text-[11px] font-bold uppercase tracking-wider">
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4 text-center">Referrals Generated</th>
                    <th className="py-3 px-4 text-right">Commission Earned</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 text-xs text-black">
                  {trendData.length > 0 ? (
                    [...trendData].reverse().map((item: any, idx: number) => (
                      <tr key={idx} className="hover:bg-gray-50 transition-colors">
                        <td className="py-3 px-4 font-medium text-black">{item.date}</td>
                        <td className="py-3 px-4 text-center"><span className={`px-2 py-1 rounded font-bold ${item.referrals > 0 ? 'bg-[#8B5CF6]/10 text-[#8B5CF6]' : 'text-gray-500'}`}>{item.referrals}</span></td>
                        <td className="py-3 px-4 text-right"><span className={`font-bold ${item.commission > 0 ? 'text-green-600' : 'text-gray-500'}`}>{formatPrice(item.commission, currency)}</span></td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan={3} className="py-6 text-center text-gray-500">No data available.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 2. AFFILIATE USERS FULL MODAL */}
      {isAffiliatesModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white border border-gray-200 w-full max-w-5xl h-[90vh] rounded-[24px] shadow-xl flex flex-col relative overflow-hidden">
            <div className="p-5 border-b border-gray-200 flex items-center justify-between bg-gray-50 shrink-0">
              <div>
                <h3 className="text-lg font-black text-black flex items-center gap-2"><Share2 className="w-5 h-5 text-[#8B5CF6]" /> Full Affiliate Directory</h3>
                <p className="text-gray-500 text-sm mt-1">Complete paginated list of all registered affiliate partners.</p>
              </div>
              <button onClick={() => setIsAffiliatesModalOpen(false)} className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center text-gray-600 hover:text-black transition-colors cursor-pointer"><X className="w-4 h-4" /></button>
            </div>
            
            <div className="flex-1 overflow-hidden flex flex-col bg-gray-50/50 p-5">
              <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm flex flex-col h-full">
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                  <table className="w-full text-left border-collapse relative">
                    <thead className="sticky top-0 bg-gray-50 z-10 shadow-sm border-b border-gray-200">
                      <tr className="text-gray-500 text-[11px] font-bold uppercase tracking-wider">
                        <th className="py-4 px-5">Affiliate Details</th>
                        <th className="py-4 px-5">Referral Code</th>
                        <th className="py-4 px-5">Referrals</th>
                        <th className="py-4 px-5">Tier Level</th>
                        <th className="py-4 px-5 text-right">Total Earning</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 text-sm bg-white">
                      {isModalAffiliatesLoading ? (
                        <tr><td colSpan={5} className="py-12 text-center text-gray-500 animate-pulse font-medium"><Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#8B5CF6]" />Loading users...</td></tr>
                      ) : modalAffiliates.length > 0 ? (
                        modalAffiliates.map((user: any) => (
                          <tr key={user.userId} className="hover:bg-gray-50 transition-colors">
                            <td className="py-4 px-5">
                              <div className="flex items-center gap-3">
                                <img src={resolveImage(user.profilePic) || `https://ui-avatars.com/api/?name=${user.userName}&background=8B5CF6&color=fff`} alt={user.userName} className="w-10 h-10 rounded-lg object-cover border border-gray-200" />
                                <div className="flex flex-col">
                                  <span className="font-bold text-black text-[15px]">{user.userName}</span>
                                  <span className="text-gray-500 text-xs">{user.email}</span>
                                </div>
                              </div>
                            </td>
                            <td className="py-4 px-5">
                              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold bg-[#8B5CF6]/10 text-[#8B5CF6] border border-[#8B5CF6]/20">
                                {user.referralCode}
                              </span>
                            </td>
                            <td className="py-4 px-5 text-gray-600 font-medium">{user.referrals} Users</td>
                            <td className="py-4 px-5">
                              <div className="flex flex-col">
                                <span className="font-bold text-black text-sm">Tier {user.tier}</span>
                                <span className="text-[10px] text-gray-500">Bonus: {user.tierBouns}%</span>
                              </div>
                            </td>
                            <td className="py-4 px-5 text-right font-black text-green-600">
                              {formatPrice(Number(user.totalReferEarning || 0), currency)}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr><td colSpan={5} className="py-12 text-center text-gray-500">No affiliate users found.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
                
                {/* Modal Pagination */}
                {modalAffiliates.length > 0 && (
                  <div className="p-4 border-t border-gray-200 bg-gray-50 flex items-center justify-between shrink-0">
                    <span className="text-xs font-medium text-gray-500">
                      Showing page <strong className="text-black">{modalAffiliatesPage}</strong> of <strong className="text-black">{modalAffiliatesTotalPages}</strong> 
                      {modalAffiliatesTotal > 0 && ` (${modalAffiliatesTotal} total)`}
                    </span>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => { 
                          const next = modalAffiliatesPage - 1;
                          setModalAffiliatesPage(next); 
                          fetchModalAffiliates(next);
                        }} 
                        disabled={modalAffiliatesPage === 1 || isModalAffiliatesLoading} 
                        className="w-9 h-9 rounded-xl bg-white hover:bg-gray-200 border border-gray-300 flex items-center justify-center text-black disabled:opacity-50 transition-colors cursor-pointer"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <button 
                        onClick={() => { 
                          const next = modalAffiliatesPage + 1;
                          setModalAffiliatesPage(next); 
                          fetchModalAffiliates(next);
                        }} 
                        disabled={modalAffiliatesPage >= modalAffiliatesTotalPages || isModalAffiliatesLoading} 
                        className="w-9 h-9 rounded-xl bg-white hover:bg-gray-200 border border-gray-300 flex items-center justify-center text-black disabled:opacity-50 transition-colors cursor-pointer"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. ACTIVITY MODAL */}
      {isActivityModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white border border-gray-200 w-full max-w-4xl h-[85vh] rounded-[24px] shadow-xl flex flex-col relative overflow-hidden">
            <div className="p-5 border-b border-gray-200 flex items-center justify-between bg-gray-50 shrink-0">
              <div>
                <h3 className="text-lg font-black text-black flex items-center gap-2"><Activity className="w-5 h-5 text-[#8B5CF6]" /> Recent Platform Activity</h3>
                <p className="text-gray-500 text-sm mt-1">Live feed of withdrawals, referrals, and approved commissions</p>
              </div>
              <button onClick={() => setIsActivityModalOpen(false)} className="w-8 h-8 bg-gray-200 hover:bg-gray-300 rounded-full flex items-center justify-center text-gray-600 hover:text-black transition-colors cursor-pointer"><X className="w-4 h-4" /></button>
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar p-5">
              {modalActivities.length === 0 && !isModalActivityLoading ? (
                <div className="text-center py-10 text-gray-500 text-sm">No recent activity found.</div>
              ) : (
                <div className="flex flex-col gap-3">
                  {modalActivities.map((act: any, idx: number) => {
                    const isLastElement = modalActivities.length === idx + 1;
                    return (
                      <div key={idx} ref={isLastElement ? lastModalElementRef : null} className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-gray-50 hover:bg-gray-100 transition-colors">
                        <div className="w-10 h-10 shrink-0 rounded-full flex items-center justify-center border border-gray-200 bg-white">
                          {getActivityIcon(act.type)}
                        </div>
                        <div className="flex flex-col flex-1">
                          <span className="font-bold text-black text-[15px]">{act.title}</span>
                          <span className="text-gray-500 text-sm mt-0.5">{act.description}</span>
                        </div>
                        <div className="shrink-0 text-right">
                          <span className="text-gray-500 text-xs">{formatActivityDate(act.createdAt)}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
              <div className="w-full py-6 flex justify-center">
                {isModalActivityLoading && (
                  <div className="flex flex-col items-center gap-2">
                    <Loader2 className="w-6 h-6 animate-spin text-[#8B5CF6]" />
                    <span className="text-xs text-gray-500 font-bold tracking-widest uppercase">Loading more...</span>
                  </div>
                )}
                {!hasMoreModal && modalActivities.length > 0 && !isModalActivityLoading && (
                  <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">End of activity history</span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}