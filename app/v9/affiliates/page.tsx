'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Users, Search, Eye, ChevronLeft, ChevronRight, X, Loader2, 
  AlertCircle, Share2, DollarSign, Activity, MonitorSmartphone, 
  TrendingUp, Copy, CheckCircle2, RefreshCcw, Lock, Unlock,
  MousePointerClick, UserPlus, Zap, Globe, ShieldCheck, ListOrdered, Receipt, Filter, Settings, Edit2, Save, Trash2, Plus, Info
} from 'lucide-react';
import { useCurrency, formatPrice } from '@/hooks/useCurrency';

export default function AdminAffiliatesPage() {
  const router = useRouter();
  const currency = useCurrency();
  
  // --- LIST STATES ---
  const [affiliates, setAffiliates] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // --- PAGINATION STATES ---
  const [currentPage, setCurrentPage] = useState(1);
  const [paginationData, setPaginationData] = useState({
    total: 0,
    page: 1,
    limit: 50,
    totalPages: 1
  });

  // --- AFFILIATE DETAIL MODAL STATES ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [affiliateDetail, setAffiliateDetail] = useState<any>(null);
  const [copiedCode, setCopiedCode] = useState(false);
  const [isLockActionLoading, setIsLockActionLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'referrals' | 'commissions'>('overview');
  
  // Sub-list States
  const [referralsList, setReferralsList] = useState<any[]>([]);
  const [isReferralsLoading, setIsReferralsLoading] = useState(false);
  const [referralsPage, setReferralsPage] = useState(1);
  const [referralsTotalPages, setReferralsTotalPages] = useState(1);

  const [commissionsList, setCommissionsList] = useState<any[]>([]);
  const [isCommissionsLoading, setIsCommissionsLoading] = useState(false);
  const [commissionsPage, setCommissionsPage] = useState(1);
  const [commissionsTotalPages, setCommissionsTotalPages] = useState(1);
  const [commissionStatusFilter, setCommissionStatusFilter] = useState<string>('');

  // 🔥 NEW: TIER SETTINGS STATES 🔥
  const [isTierModalOpen, setIsTierModalOpen] = useState(false);
  const [tierLevels, setTierLevels] = useState<any[]>([]);
  const [isTierLoading, setIsTierLoading] = useState(false);
  const [editingTierId, setEditingTierId] = useState<string | number | null>(null);
  const [editFormData, setEditFormData] = useState({ commissionPercent: 0, referralAmount: 0 });
  const [isSavingTier, setIsSavingTier] = useState(false);
  const [isDeletingTier, setIsDeletingTier] = useState(false);
  const [isAddingTier, setIsAddingTier] = useState(false);

  const resolveImage = (imgSrc: string | null) => {
    if (!imgSrc || imgSrc.trim() === '') return null;
    return !imgSrc.startsWith('http') ? `https://api.binnycash.com${imgSrc}` : imgSrc;
  };

  // 1. Fetch All Users List
  const fetchAffiliates = async (pageToFetch = 1) => {
    setIsLoading(true);
    setErrorMsg(null);
    const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : '';
    const adminId = typeof window !== 'undefined' ? localStorage.getItem('admin_id') : '';
    
    if (!token || !adminId) {
      router.push('/v9/login');
      return;
    }

    try {
      const res = await fetch(`https://api.binnycash.com/api/admin/userList?adminId=${encodeURIComponent(adminId)}&page=${pageToFetch}&limit=50`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
      });
      const json = await res.json().catch(() => null);

      if (res.ok && json?.code === 200 && json?.data) {
        const list = Array.isArray(json.data) ? json.data : [];
        setAffiliates(list);
        setPaginationData({
          total: list.length,
          page: pageToFetch,
          limit: 50,
          totalPages: Math.max(1, Math.ceil(list.length / 50))
        });
      } else {
        setErrorMsg(json?.message || "Failed to load users list.");
        setAffiliates([]);
      }
    } catch (err) {
      console.error("Users list fetch error:", err);
      setErrorMsg("Network error while fetching users.");
      setAffiliates([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAffiliates(currentPage);
  }, [currentPage, router]);

  // 2. Fetch Detailed Affiliate Stats
  const handleViewDetails = async (userId: string | number) => {
    setIsModalOpen(true);
    setActiveTab('overview');
    setIsDetailLoading(true);
    setAffiliateDetail(null);
    setCopiedCode(false);
    setReferralsList([]);
    setCommissionsList([]);
    setCommissionStatusFilter(''); 
    
    const token = localStorage.getItem('admin_token');

    try {
      const res = await fetch(`https://api.binnycash.com/api/admin/affiliates/${encodeURIComponent(userId)}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
      });
      const json = await res.json();
      
      if (json?.code === 200 && json?.data) {
        setAffiliateDetail(json.data);
      } else {
        setAffiliateDetail({ error: json?.message || 'Affiliate data not available for this user.' });
      }
    } catch (err) {
      setAffiliateDetail({ error: 'Network error while fetching details.' });
    } finally {
      setIsDetailLoading(false);
    }
  };

  const handleToggleTierLock = async () => {
    if (!affiliateDetail?.userInformation?.userId) return;
    setIsLockActionLoading(true);
    const token = localStorage.getItem('admin_token');
    const userId = affiliateDetail.userInformation.userId;
    
    const currentStatus = affiliateDetail.affiliateStats?.tierLevelStatus;
    const isCurrentlyLocked = currentStatus?.toLowerCase() === 'lock' || currentStatus?.toLowerCase() === 'locked';
    const newLockState = !isCurrentlyLocked;

    const formData = new FormData();
    formData.append('isLocked', newLockState.toString()); 

    try {
      const res = await fetch(`https://api.binnycash.com/api/admin/affiliates/${userId}/level-lock`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      const json = await res.json();
      if (res.ok && (json?.code === 200 || json?.type === 'success')) {
        await handleViewDetails(userId);
      } else {
        alert(json?.message || `Failed to update tier lock status.`);
      }
    } catch (err) {
      alert('Network error occurred while updating tier lock.');
    } finally {
      setIsLockActionLoading(false);
    }
  };

  const fetchReferrals = async (page = 1) => {
    if (!affiliateDetail?.userInformation?.userId) return;
    setIsReferralsLoading(true);
    const token = localStorage.getItem('admin_token');
    try {
      const res = await fetch(`https://api.binnycash.com/api/admin/affiliates/${affiliateDetail.userInformation.userId}/referrals?page=${page}&limit=10`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const json = await res.json();
      if (json?.code === 200 && json?.data) {
        setReferralsList(json.data.data || []);
        setReferralsPage(json.data.pagination?.page || 1);
        setReferralsTotalPages(json.data.pagination?.totalPages || 1);
      } else {
        setReferralsList([]);
      }
    } catch (e) {
      setReferralsList([]);
    } finally {
      setIsReferralsLoading(false);
    }
  };

  const fetchCommissions = async (page = 1, status = commissionStatusFilter) => {
    if (!affiliateDetail?.userInformation?.userId) return;
    setIsCommissionsLoading(true);
    const token = localStorage.getItem('admin_token');
    
    let url = `https://api.binnycash.com/api/admin/affiliates/${affiliateDetail.userInformation.userId}/commissions?page=${page}&limit=10`;
    if (status && status !== '') url += `&status=${status}`;

    try {
      const res = await fetch(url, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const json = await res.json();
      if (json?.code === 200 && json?.data) {
        setCommissionsList(json.data.data || []);
        setCommissionsPage(json.data.pagination?.page || 1);
        setCommissionsTotalPages(json.data.pagination?.totalPages || 1);
      } else {
        setCommissionsList([]);
      }
    } catch (e) {
      setCommissionsList([]);
    } finally {
      setIsCommissionsLoading(false);
    }
  };

  const handleCommissionFilterChange = (newStatus: string) => {
    setCommissionStatusFilter(newStatus);
    fetchCommissions(1, newStatus);
  };

  useEffect(() => {
    if (activeTab === 'referrals' && referralsList.length === 0) fetchReferrals(1);
    if (activeTab === 'commissions' && commissionsList.length === 0) fetchCommissions(1, commissionStatusFilter);
  }, [activeTab]);


  // 🔥 TIER LEVEL FUNCTIONS 🔥
  const fetchAllTiers = async () => {
    setIsTierLoading(true);
    const token = localStorage.getItem('admin_token');
    try {
      const res = await fetch(`https://api.binnycash.com/api/admin/levels`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
      });
      const json = await res.json();
      if (res.ok && json.code === 200 && Array.isArray(json.data)) {
        setTierLevels(json.data);
      } else {
        setTierLevels([]);
      }
    } catch (e) {
      alert("Network Error while loading tiers.");
    } finally {
      setIsTierLoading(false);
    }
  };

  const openTierSettings = () => {
    setIsTierModalOpen(true);
    setEditingTierId(null);
    fetchAllTiers();
  };

  const startEditingTier = (tier: any) => {
    setEditingTierId(tier._id || tier.level);
    setEditFormData({ 
      commissionPercent: tier.commissionPercent || 0, 
      referralAmount: tier.referralAmount || 0 
    });
  };

  const saveTier = async (tier: any) => {
    setIsSavingTier(true);
    const token = localStorage.getItem('admin_token');

    const payload = {
      _id: tier._id || "", 
      level: tier.level,
      commissionPercent: Number(editFormData.commissionPercent),
      referralAmount: Number(editFormData.referralAmount)
    };

    try {
      const res = await fetch(`https://api.binnycash.com/api/admin/levels`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      const json = await res.json();
      if (res.ok && (json.code === 200 || json.type === 'success')) {
        setTierLevels(prev => prev.map(t => (t._id === tier._id || t.level === tier.level) ? { ...t, ...payload } : t));
        setEditingTierId(null);
      } else {
        alert(json.message || "Failed to update tier.");
      }
    } catch (e) {
      alert("Network Error while saving tier.");
    } finally {
      setIsSavingTier(false);
    }
  };

  // NEW: Add Tier Level
  const addNewTierLevel = async () => {
    setIsAddingTier(true);
    const token = localStorage.getItem('admin_token');
    
    const sorted = [...tierLevels].sort((a, b) => a.level - b.level);
    const nextLevel = sorted.length > 0 ? sorted[sorted.length - 1].level + 1 : 1;

    const payload = {
      level: nextLevel,
      commissionPercent: 0,
      referralAmount: 0
    };

    try {
      const res = await fetch(`https://api.binnycash.com/api/admin/levels`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      const json = await res.json();
      if (res.ok && (json.code === 200 || json.type === 'success')) {
        await fetchAllTiers(); // Refetch to get actual _id from DB
      } else {
        alert(json.message || "Failed to add new tier.");
      }
    } catch (e) {
      alert("Network Error while adding tier.");
    } finally {
      setIsAddingTier(false);
    }
  };

  // NEW: Delete Highest Tier Level
  const deleteLastTier = async (id: string) => {
    if (!confirm("Are you sure you want to delete this level? This action cannot be undone.")) return;
    
    setIsDeletingTier(true);
    const token = localStorage.getItem('admin_token');

    try {
      const res = await fetch(`https://api.binnycash.com/api/admin/levels/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
      });
      
      const json = await res.json();
      if (res.ok && (json.code === 200 || json.type === 'success')) {
        setTierLevels(prev => prev.filter(t => t._id !== id));
      } else {
        alert(json.message || "Cannot delete the last remaining level.");
      }
    } catch (e) {
      alert("Network Error while deleting tier.");
    } finally {
      setIsDeletingTier(false);
    }
  };

  const safeAffiliates = Array.isArray(affiliates) ? affiliates : [];
  const filteredAffiliates = safeAffiliates.filter(a => {
    const name = a?.userName || '';
    const code = a?.referralCode || '';
    const query = searchQuery.toLowerCase();
    return name.toLowerCase().includes(query) || code.toLowerCase().includes(query);
  });

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="flex flex-col gap-6 text-white w-full max-w-[1600px] mx-auto pb-10 font-sans">
      
      {/* --- HEADER --- */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
             <Share2 className="w-6 h-6 text-[#7C3AED]" /> Affiliate Management
          </h1>
          <p className="text-sm text-gray-400 mt-1">Monitor user referral performances, tiers, and earnings.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={openTierSettings} 
            className="flex items-center gap-2 bg-[#12141C] hover:bg-[#1A1C24] border border-[#7C3AED]/30 text-[#A855F7] px-4 py-2 rounded-xl text-sm font-bold transition-colors shadow-sm cursor-pointer"
          >
            <Settings className="w-4 h-4" /> Tier Settings
          </button>
          <button 
            onClick={() => fetchAffiliates(currentPage)} 
            disabled={isLoading}
            className="flex items-center gap-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
          >
            <RefreshCcw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
          </button>
        </div>
      </div>

      {errorMsg && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span className="text-sm font-bold">{errorMsg}</span>
        </div>
      )}

      {/* --- SEARCH BAR --- */}
      <div className="flex flex-wrap items-center gap-4 bg-[#12141C] p-4 rounded-xl border border-white/5">
        <div className="relative flex-1 min-w-[200px] max-w-md">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
           <input 
             type="text" 
             value={searchQuery}
             onChange={(e) => setSearchQuery(e.target.value)}
             placeholder="Search by Username or Referral Code..." 
             className="w-full bg-[#0B0D14] border border-white/10 rounded-lg pl-9 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#7C3AED] transition-colors"
           />
        </div>
      </div>

      {/* --- AFFILIATES TABLE --- */}
      <div className="bg-[#12141C] border border-white/5 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="border-b border-white/10 text-gray-400 text-xs font-bold uppercase tracking-wider bg-[#161821]">
                <th className="py-4 px-5">ID</th>
                <th className="py-4 px-4">Affiliate User</th>
                <th className="py-4 px-4 text-center">Referral Code</th>
                <th className="py-4 px-4 text-center">Referrals</th>
                <th className="py-4 px-4 text-right">Total Earnings</th>
                <th className="py-4 px-4 text-center">Tier & Status</th>
                <th className="py-4 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-gray-500 font-medium">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#7C3AED]" /> Loading users data...
                  </td>
                </tr>
              ) : filteredAffiliates.length > 0 ? (
                filteredAffiliates.map((u: any, idx: number) => {
                  const avatarUrl = resolveImage(u?.image || u?.profilePic);
                  const firstLetter = (u?.userName || 'U').charAt(0).toUpperCase();

                  return (
                    <tr key={u?.id || u?.userId || idx} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-5 text-gray-400 font-mono">#{u?.id || u?.userId}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#7C3AED]/20 border border-[#7C3AED]/40 flex items-center justify-center text-[#7C3AED] font-bold text-sm shrink-0 overflow-hidden">
                            {avatarUrl ? <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" /> : firstLetter}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-medium text-white">{u?.userName || 'Unknown'}</span>
                            <span className="text-xs text-gray-500">{u?.email || 'N/A'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className="text-xs font-mono bg-white/5 border border-white/10 px-2 py-1 rounded text-emerald-400 tracking-wider">
                          {u?.referralCode || 'N/A'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center font-bold text-white">
                        {u?.referrals || u?.referralCount || 0}
                      </td>
                      <td className="py-3 px-4 text-right font-black text-emerald-400">
                        {formatPrice(Number(u?.totalReferEarning || 0), currency)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-xs font-bold bg-[#7C3AED]/10 text-[#7C3AED] px-2 py-0.5 rounded border border-[#7C3AED]/20">
                            Tier {u?.tier || 1}
                          </span>
                          <span className={`text-[10px] font-bold uppercase tracking-wider ${u?.tierLevelStatus?.toLowerCase() === 'lock' || u?.tierLevelStatus?.toLowerCase() === 'locked' ? 'text-rose-400' : (u?.tierLevelStatus === 'Active' || u?.tierLevelStatus === 'Unlock' ? 'text-emerald-400' : 'text-gray-500')}`}>
                            {u?.tierLevelStatus || 'N/A'}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button 
                          onClick={() => handleViewDetails(u?.id || u?.userId)}
                          className="bg-[#7C3AED]/10 hover:bg-[#7C3AED]/20 text-[#7C3AED] border border-[#7C3AED]/20 px-4 py-2 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-2 text-xs font-bold mx-auto shadow-sm"
                        >
                          <Eye className="w-4 h-4" /> View Stats
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-gray-500">No users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {!isLoading && paginationData.totalPages > 0 && (
          <div className="flex flex-col sm:flex-row items-center justify-between p-4 border-t border-white/5 bg-[#12141C] gap-4">
             <span className="text-sm text-gray-400">
               Showing Page <strong className="text-white">{paginationData.page}</strong> of <strong className="text-white">{paginationData.totalPages}</strong>
             </span>
             <div className="flex items-center gap-2">
                <button 
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1.5 rounded border border-white/10 text-gray-300 hover:text-white hover:bg-white/5 disabled:opacity-30 transition-colors text-sm cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <div className="bg-[#7C3AED] text-white px-3 py-1.5 rounded font-bold text-sm">{currentPage}</div>
                <button 
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, paginationData.totalPages))}
                  disabled={currentPage === paginationData.totalPages}
                  className="px-3 py-1.5 rounded border border-white/10 text-gray-300 hover:text-white hover:bg-white/5 disabled:opacity-30 transition-colors text-sm cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
             </div>
          </div>
        )}
      </div>

      {/* --- AFFILIATE DETAIL MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-md overflow-y-auto">
          <div className="bg-[#0B0D14] border border-white/10 w-full max-w-5xl rounded-[24px] shadow-2xl relative flex flex-col overflow-hidden max-h-[95vh]">
            
            <div className="bg-[#12141C] border-b border-white/5 px-6 py-4 flex items-center justify-between shrink-0">
              <h3 className="text-lg font-black text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-[#7C3AED]" /> Detailed Affiliate Intelligence
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 p-2 rounded-xl transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-8 bg-gradient-to-b from-white/[0.02] to-transparent">
              {/* Rest of Affiliate View Logic (Same as before) */}
              {isDetailLoading ? (
                <div className="py-32 flex flex-col items-center justify-center gap-4">
                  <Loader2 className="w-10 h-10 animate-spin text-[#7C3AED]" />
                  <span className="text-gray-400 font-medium">Gathering intelligence data...</span>
                </div>
              ) : affiliateDetail?.error ? (
                <div className="py-16 text-center text-amber-400 bg-amber-500/5 rounded-2xl border border-amber-500/20 p-6">
                  <AlertCircle className="w-10 h-10 mx-auto mb-3" />
                  <p className="font-bold text-lg">{affiliateDetail.error}</p>
                  <p className="text-sm mt-2 text-amber-500/70">This user may not have any affiliate data yet.</p>
                </div>
              ) : (
                <div className="flex flex-col gap-6">
                  
                  {/* PROFILE HEADER CARD */}
                  <div className="bg-[#12141C]/80 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-lg flex flex-col md:flex-row gap-6 items-center justify-between relative overflow-hidden">
                     <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#7C3AED]/20 blur-[80px] pointer-events-none rounded-full" />
                     <div className="flex items-center gap-5 z-10 w-full md:w-auto">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#EC4899] p-0.5 shadow-[0_0_20px_rgba(139,92,246,0.3)] shrink-0">
                          <div className="w-full h-full rounded-full bg-[#12141C] flex items-center justify-center overflow-hidden text-2xl font-black text-white">
                            {resolveImage(affiliateDetail?.userInformation?.profilePic) ? (
                              <img src={resolveImage(affiliateDetail.userInformation.profilePic)!} alt="User" className="w-full h-full object-cover" />
                            ) : (affiliateDetail?.userInformation?.userName?.charAt(0).toUpperCase() || 'U')}
                          </div>
                        </div>
                        <div className="flex flex-col">
                          <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1 flex items-center gap-1.5">
                            <ShieldCheck className="w-3 h-3 text-emerald-400" /> Affiliate Partner
                          </p>
                          <h2 className="text-3xl font-black text-white leading-none mb-1.5">{affiliateDetail?.userInformation?.userName || 'Unknown'}</h2>
                          <span className="text-sm text-gray-400">{affiliateDetail?.userInformation?.email}</span>
                        </div>
                     </div>

                     <div className="z-10 w-full md:w-auto bg-[#0B0D14] border border-white/10 px-5 py-3 rounded-xl flex items-center justify-between md:justify-start gap-4 shadow-inner">
                        <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Ref Code</span>
                        <span className="font-mono text-emerald-400 font-bold text-xl">{affiliateDetail?.userInformation?.referralCode || 'N/A'}</span>
                        <button 
                          onClick={() => handleCopyCode(affiliateDetail?.userInformation?.referralCode || '')} 
                          className="w-8 h-8 flex items-center justify-center rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 transition-colors cursor-pointer"
                        >
                          {copiedCode ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                        </button>
                     </div>
                  </div>

                  {/* TAB NAVIGATION */}
                  <div className="flex items-center gap-2 p-1 bg-[#12141C] rounded-xl border border-white/5 w-fit">
                    <button onClick={() => setActiveTab('overview')} className={`px-5 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${activeTab === 'overview' ? 'bg-white/10 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}>
                      <Activity className="w-4 h-4"/> Overview
                    </button>
                    <button onClick={() => setActiveTab('referrals')} className={`px-5 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${activeTab === 'referrals' ? 'bg-white/10 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}>
                      <Users className="w-4 h-4"/> Referrals List
                    </button>
                    <button onClick={() => setActiveTab('commissions')} className={`px-5 py-2 rounded-lg text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${activeTab === 'commissions' ? 'bg-white/10 text-white shadow-sm' : 'text-gray-500 hover:text-gray-300'}`}>
                      <Receipt className="w-4 h-4"/> Commissions
                    </button>
                  </div>

                  {/* OVERVIEW TAB */}
                  {activeTab === 'overview' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in zoom-in duration-300">
                      
                      <div className="bg-[#12141C] border border-white/5 rounded-2xl p-6 flex flex-col gap-5 relative overflow-hidden">
                         <h4 className="text-sm font-black text-white flex items-center gap-2">
                           <DollarSign className="w-5 h-5 text-emerald-400" /> Earning Overview
                         </h4>
                         <div className="flex justify-between items-center bg-gradient-to-br from-emerald-500/20 to-emerald-500/5 border border-emerald-500/30 p-4 rounded-xl shadow-inner">
                           <span className="text-xs text-emerald-400 font-black uppercase tracking-widest">Total Earned</span>
                           <span className="text-2xl font-black text-emerald-400 drop-shadow-[0_0_8px_rgba(16,185,129,0.5)]">
                             {formatPrice(Number(affiliateDetail?.affiliateStats?.totalReferEarnings || 0), currency)}
                           </span>
                         </div>
                         <div className="flex flex-col gap-3 mt-2">
                           <div className="flex justify-between items-center text-sm border-b border-white/5 pb-3">
                             <span className="text-gray-400">Paid Earnings</span>
                             <span className="text-white font-bold">{formatPrice(Number(affiliateDetail?.affiliateStats?.paidEarnings || 0), currency)}</span>
                           </div>
                           <div className="flex justify-between items-center text-sm border-b border-white/5 pb-3">
                             <span className="text-gray-400">Pending</span>
                             <span className="text-amber-400 font-bold">{formatPrice(Number(affiliateDetail?.affiliateStats?.pendingEarnings || 0), currency)}</span>
                           </div>
                           <div className="flex justify-between items-center text-sm border-b border-white/5 pb-3">
                             <span className="text-gray-400">Reversed</span>
                             <span className="text-rose-400 font-bold">{formatPrice(Number(affiliateDetail?.affiliateStats?.reverseReferEarnings || 0), currency)}</span>
                           </div>
                           <div className="flex justify-between items-center text-sm pt-1">
                             <span className="text-gray-400 font-bold">Total Withdrawals</span>
                             <span className="text-blue-400 font-black">{formatPrice(Number(affiliateDetail?.affiliateStats?.totalReferWithdraw || 0), currency)}</span>
                           </div>
                         </div>
                      </div>

                      <div className="bg-[#12141C] border border-white/5 rounded-2xl p-6 flex flex-col gap-6">
                         <h4 className="text-sm font-black text-white flex items-center gap-2">
                           <TrendingUp className="w-5 h-5 text-blue-400" /> Conversion Funnel
                         </h4>
                         <div className="flex items-center justify-between px-2 pt-2">
                            <div className="flex flex-col items-center gap-2 w-16">
                              <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400"><MousePointerClick className="w-5 h-5"/></div>
                              <span className="text-2xl font-black text-white">{affiliateDetail?.referralActivity?.totalClicks || 0}</span>
                              <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">Clicks</span>
                            </div>
                            <div className="flex-1 h-px bg-gradient-to-r from-blue-500/50 to-purple-500/50 dashed-line"></div>
                            <div className="flex flex-col items-center gap-2 w-16">
                              <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center text-purple-400"><UserPlus className="w-5 h-5"/></div>
                              <span className="text-2xl font-black text-white">{affiliateDetail?.referralActivity?.totalReferrals || 0}</span>
                              <span className="text-[9px] text-gray-500 font-bold uppercase tracking-wider">Joined</span>
                            </div>
                            <div className="flex-1 h-px bg-gradient-to-r from-purple-500/50 to-emerald-500/50 dashed-line"></div>
                            <div className="flex flex-col items-center gap-2 w-16">
                              <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]"><Zap className="w-5 h-5"/></div>
                              <span className="text-2xl font-black text-emerald-400">{affiliateDetail?.referralActivity?.totalConversions || 0}</span>
                              <span className="text-[9px] text-emerald-500/70 font-bold uppercase tracking-wider">Conv.</span>
                            </div>
                         </div>

                         <div className="mt-auto bg-gradient-to-br from-[#1A1C2A] to-[#12141C] border border-[#7C3AED]/30 rounded-xl p-4 flex flex-col gap-3 relative overflow-hidden">
                           <div className="absolute top-0 right-0 w-32 h-32 bg-[#7C3AED]/10 blur-[40px]" />
                           <div className="flex justify-between items-center z-10">
                             <span className="text-[10px] font-black text-[#8B5CF6] uppercase tracking-widest">Tier System</span>
                             <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded border ${affiliateDetail?.affiliateStats?.tierLevelStatus?.toLowerCase() === 'lock' || affiliateDetail?.affiliateStats?.tierLevelStatus?.toLowerCase() === 'locked' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'}`}>
                               Status: {affiliateDetail?.affiliateStats?.tierLevelStatus || 'Unlock'}
                             </span>
                           </div>
                           <div className="flex items-center justify-between z-10">
                             <div className="flex items-center gap-2.5">
                               <span className="text-white text-xl font-black">Level {affiliateDetail?.affiliateStats?.tier || 1}</span>
                               <span className="text-white text-xs font-bold bg-[#8B5CF6] px-2 py-0.5 rounded shadow-sm">{affiliateDetail?.affiliateStats?.commissionPercent || 0}%</span>
                             </div>
                             
                             <button 
                               onClick={handleToggleTierLock} 
                               disabled={isLockActionLoading}
                               className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-md disabled:opacity-50 ${
                                 affiliateDetail?.affiliateStats?.tierLevelStatus?.toLowerCase() === 'lock' || affiliateDetail?.affiliateStats?.tierLevelStatus?.toLowerCase() === 'locked'
                                   ? 'bg-emerald-500 hover:bg-emerald-600 text-black'
                                   : 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/20'
                               }`}
                             >
                               {isLockActionLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 
                                (affiliateDetail?.affiliateStats?.tierLevelStatus?.toLowerCase() === 'lock' || affiliateDetail?.affiliateStats?.tierLevelStatus?.toLowerCase() === 'locked' ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />)
                               }
                               {(affiliateDetail?.affiliateStats?.tierLevelStatus?.toLowerCase() === 'lock' || affiliateDetail?.affiliateStats?.tierLevelStatus?.toLowerCase() === 'locked') ? 'Unlock Tier' : 'Lock Tier'}
                             </button>
                           </div>
                         </div>
                      </div>

                      <div className="bg-[#12141C] border border-white/5 rounded-2xl p-6 flex flex-col gap-5">
                         <h4 className="text-sm font-black text-white flex items-center gap-2">
                           <MonitorSmartphone className="w-5 h-5 text-amber-400" /> Device & Intelligence
                         </h4>
                         <div className="flex flex-col gap-4">
                           <div>
                             <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1 block">Country & KYC</span>
                             <div className="flex items-center gap-3">
                               <span className="text-sm text-white font-bold flex items-center gap-1.5"><Globe className="w-4 h-4 text-blue-400"/> {affiliateDetail?.userInformation?.country || 'Unknown'}</span>
                               <span className={`text-[10px] px-2 py-0.5 rounded uppercase font-black tracking-wider border ${affiliateDetail?.userInformation?.kycStatus ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'}`}>
                                 {affiliateDetail?.userInformation?.kycStatus ? 'Verified' : 'Unverified'}
                               </span>
                             </div>
                           </div>
                           <div className="border-t border-white/5 pt-3">
                             <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1 block">Last IP Address</span>
                             <span className="text-sm text-white font-mono bg-[#0B0D14] px-2 py-1 rounded border border-white/5 inline-block">{affiliateDetail?.deviceInfo?.ipAddress || 'N/A'}</span>
                           </div>
                           <div className="border-t border-white/5 pt-3">
                             <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1 block">OS & Browser</span>
                             <p className="text-xs text-gray-300 bg-[#0B0D14] px-3 py-2 rounded-lg border border-white/5 leading-relaxed">
                               {affiliateDetail?.deviceInfo?.os} <br/>
                               <span className="text-gray-500">{affiliateDetail?.deviceInfo?.browser}</span>
                             </p>
                           </div>
                           <div className="mt-auto border-t border-white/5 pt-3 flex justify-between items-center">
                             <span className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Joined Network</span>
                             <span className="text-xs text-white font-bold">{affiliateDetail?.userInformation?.joinedOn ? new Date(affiliateDetail.userInformation.joinedOn).toLocaleString() : 'N/A'}</span>
                           </div>
                         </div>
                      </div>

                    </div>
                  )}

                  {/* REFERRALS LIST TAB */}
                  {activeTab === 'referrals' && (
                    <div className="bg-[#12141C] border border-white/5 rounded-2xl overflow-hidden flex flex-col animate-in fade-in duration-300 min-h-[300px]">
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse whitespace-nowrap">
                          <thead>
                            <tr className="border-b border-white/10 text-gray-400 text-xs font-bold uppercase tracking-wider bg-[#161821]">
                              <th className="py-4 px-5">User ID</th>
                              <th className="py-4 px-4">Username / Email</th>
                              <th className="py-4 px-4 text-center">Status</th>
                              <th className="py-4 px-4 text-right">Joined Date</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5 text-sm">
                            {isReferralsLoading ? (
                              <tr>
                                <td colSpan={4} className="py-20 text-center">
                                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#7C3AED] mb-3" />
                                  <span className="text-gray-500 font-medium">Fetching referrals...</span>
                                </td>
                              </tr>
                            ) : referralsList.length > 0 ? (
                              referralsList.map((ref: any, idx: number) => (
                                <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                                  <td className="py-3 px-5 text-gray-400 font-mono">#{ref.id || ref.userId || 'N/A'}</td>
                                  <td className="py-3 px-4">
                                    <span className="font-bold text-white block">{ref.userName || ref.username || 'Unknown'}</span>
                                    <span className="text-xs text-gray-500">{ref.email || 'N/A'}</span>
                                  </td>
                                  <td className="py-3 px-4 text-center">
                                    <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20">
                                      {ref.status || 'Active'}
                                    </span>
                                  </td>
                                  <td className="py-3 px-4 text-right text-gray-400">
                                    {ref.joinedAt || ref.createdAt ? new Date(ref.joinedAt || ref.createdAt).toLocaleDateString() : 'N/A'}
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={4} className="py-20 text-center">
                                  <div className="flex flex-col items-center gap-2 opacity-50">
                                    <ListOrdered className="w-10 h-10 text-gray-500" />
                                    <span className="text-gray-400 font-bold">No Referrals Found</span>
                                    <span className="text-xs text-gray-500">This user hasn't invited anyone yet.</span>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                      
                      {!isReferralsLoading && referralsTotalPages > 0 && (
                        <div className="mt-auto p-4 border-t border-white/5 flex items-center justify-between bg-black/20">
                          <span className="text-xs text-gray-400">Page {referralsPage} of {referralsTotalPages}</span>
                          <div className="flex gap-2">
                            <button onClick={() => fetchReferrals(Math.max(referralsPage - 1, 1))} disabled={referralsPage === 1} className="p-1.5 rounded border border-white/10 text-gray-400 hover:text-white disabled:opacity-30 cursor-pointer">
                              <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button onClick={() => fetchReferrals(Math.min(referralsPage + 1, referralsTotalPages))} disabled={referralsPage === referralsTotalPages} className="p-1.5 rounded border border-white/10 text-gray-400 hover:text-white disabled:opacity-30 cursor-pointer">
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {/* COMMISSIONS LIST TAB */}
                  {activeTab === 'commissions' && (
                    <div className="bg-[#12141C] border border-white/5 rounded-2xl overflow-hidden flex flex-col animate-in fade-in duration-300 min-h-[300px]">
                      <div className="px-5 py-3 border-b border-white/5 flex flex-wrap gap-4 justify-between items-center bg-black/20">
                        <div className="flex items-center gap-2">
                           <Filter className="w-4 h-4 text-gray-400" />
                           <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Filter Logs</span>
                        </div>
                        <select
                           value={commissionStatusFilter}
                           onChange={(e) => handleCommissionFilterChange(e.target.value)}
                           className="bg-[#1A1C24] border border-white/10 text-xs font-bold rounded-lg px-3 py-1.5 text-white outline-none cursor-pointer hover:bg-[#252836] transition-colors focus:border-[#7C3AED]"
                        >
                          <option value="">All Status</option>
                          <option value="COMPLETE">Complete</option>
                          <option value="REVERSE">Reverse</option>
                        </select>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse whitespace-nowrap">
                          <thead>
                            <tr className="border-b border-white/10 text-gray-400 text-xs font-bold uppercase tracking-wider bg-[#161821]">
                              <th className="py-4 px-5">Transaction ID</th>
                              <th className="py-4 px-4">Source / Details</th>
                              <th className="py-4 px-4 text-center">Type</th>
                              <th className="py-4 px-4 text-right">Amount</th>
                              <th className="py-4 px-4 text-right">Date</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-white/5 text-sm">
                            {isCommissionsLoading ? (
                              <tr>
                                <td colSpan={5} className="py-20 text-center">
                                  <Loader2 className="w-8 h-8 animate-spin mx-auto text-emerald-400 mb-3" />
                                  <span className="text-gray-500 font-medium">Loading commission logs...</span>
                                </td>
                              </tr>
                            ) : commissionsList.length > 0 ? (
                              commissionsList.map((comm: any, idx: number) => (
                                <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                                  <td className="py-3 px-5 text-gray-400 font-mono">#{comm.id || comm.transactionId || 'N/A'}</td>
                                  <td className="py-3 px-4">
                                    <span className="font-bold text-white block">{comm.source || comm.description || 'Referral Bonus'}</span>
                                    <span className="text-xs text-gray-500">From User: #{comm.fromUserId || 'Unknown'}</span>
                                  </td>
                                  <td className="py-3 px-4 text-center">
                                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${
                                      comm.type?.toLowerCase() === 'reverse' || comm.status?.toLowerCase() === 'reverse'
                                        ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                                        : 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                                    }`}>
                                      {comm.type || comm.status || 'Complete'}
                                    </span>
                                  </td>
                                  <td className={`py-3 px-4 text-right font-black ${
                                    comm.type?.toLowerCase() === 'reverse' || comm.status?.toLowerCase() === 'reverse' ? 'text-rose-400' : 'text-emerald-400'
                                  }`}>
                                    {comm.type?.toLowerCase() === 'reverse' || comm.status?.toLowerCase() === 'reverse' ? '-' : '+'}
                                    {formatPrice(Number(comm.amount || 0), currency)}
                                  </td>
                                  <td className="py-3 px-4 text-right text-gray-400">
                                    {comm.createdAt || comm.date ? new Date(comm.createdAt || comm.date).toLocaleDateString() : 'N/A'}
                                  </td>
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={5} className="py-20 text-center">
                                  <div className="flex flex-col items-center gap-2 opacity-50">
                                    <Receipt className="w-10 h-10 text-gray-500" />
                                    <span className="text-gray-400 font-bold">No Commissions Found</span>
                                    <span className="text-xs text-gray-500">
                                      {commissionStatusFilter !== '' 
                                        ? `No ${commissionStatusFilter.toLowerCase()} commissions available.` 
                                        : "This user hasn't earned any commissions."}
                                    </span>
                                  </div>
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                      
                      {!isCommissionsLoading && commissionsTotalPages > 0 && (
                        <div className="mt-auto p-4 border-t border-white/5 flex items-center justify-between bg-black/20">
                          <span className="text-xs text-gray-400">Page {commissionsPage} of {commissionsTotalPages}</span>
                          <div className="flex gap-2">
                            <button onClick={() => fetchCommissions(Math.max(commissionsPage - 1, 1), commissionStatusFilter)} disabled={commissionsPage === 1} className="p-1.5 rounded border border-white/10 text-gray-400 hover:text-white disabled:opacity-30 cursor-pointer">
                              <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button onClick={() => fetchCommissions(Math.min(commissionsPage + 1, commissionsTotalPages), commissionStatusFilter)} disabled={commissionsPage === commissionsTotalPages} className="p-1.5 rounded border border-white/10 text-gray-400 hover:text-white disabled:opacity-30 cursor-pointer">
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* --- 🔥 NEW PREMIUM TIER LEVEL SETTINGS MODAL 🔥 --- */}
      {isTierModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#0B0E14] border border-white/10 w-full max-w-3xl rounded-[24px] shadow-2xl relative flex flex-col overflow-hidden max-h-[90vh]">
            
            <div className="bg-[#12151E] border-b border-white/5 px-6 py-5 flex items-center justify-between shrink-0">
              <h3 className="text-xl font-black text-white flex items-center gap-3">
                <Settings className="w-6 h-6 text-[#A882FF]" /> Affiliate Tier Settings
              </h3>
              <button onClick={() => setIsTierModalOpen(false)} className="text-[#8F95A3] hover:text-white bg-white/5 hover:bg-white/10 p-2 rounded-xl transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
              {isTierLoading ? (
                <div className="py-20 flex flex-col items-center justify-center gap-4">
                  <Loader2 className="w-8 h-8 animate-spin text-[#A882FF]" />
                  <span className="text-[#8F95A3] text-sm font-medium">Loading tier rules...</span>
                </div>
              ) : (
                <div className="flex flex-col gap-6">
                  
                  {/* Premium Info Box */}
                  <div className="bg-[#1A1625] border border-[#2D2440] rounded-xl p-4 flex items-start gap-3 shadow-inner">
                    <Info className="w-5 h-5 text-[#A882FF] shrink-0 mt-0.5" />
                    <p className="text-sm text-[#A882FF]/80 leading-relaxed">
                      Configure the global rules for your affiliate program. Define the <strong className="text-[#A882FF] font-black">Commission Percentage</strong> users earn at each level, and the <strong className="text-[#A882FF] font-black">Total Referral Amount</strong> they need to generate to unlock it.
                    </p>
                  </div>

                  <div className="bg-[#12151E] border border-white/5 rounded-2xl overflow-hidden shadow-lg">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse whitespace-nowrap">
                        <thead>
                          <tr className="border-b border-white/5 text-[#8F95A3] text-[11px] font-bold uppercase tracking-wider bg-[#0B0E14]/50">
                            <th className="py-4 px-6">Level</th>
                            <th className="py-4 px-4">Commission %</th>
                            <th className="py-4 px-4">Required Earnings ($)</th>
                            <th className="py-4 px-6 text-right">Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 text-sm">
                          {tierLevels.length === 0 ? (
                            <tr><td colSpan={4} className="py-10 text-center text-[#8F95A3]">No tiers configured.</td></tr>
                          ) : (
                            tierLevels.sort((a, b) => a.level - b.level).map((tier: any, index: number, arr: any[]) => {
                              const isEditing = editingTierId === (tier._id || tier.level);
                              const isLastLevel = index === arr.length - 1; // Find the highest level for delete button
                              
                              return (
                                <tr key={tier._id || tier.level} className={`transition-colors ${isEditing ? 'bg-[#A882FF]/5' : 'hover:bg-white/[0.02]'}`}>
                                  <td className="py-4 px-6">
                                    <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-white font-bold text-xs shadow-sm">
                                      {tier.level}
                                    </div>
                                  </td>
                                  
                                  <td className="py-4 px-4">
                                    {isEditing ? (
                                      <div className="relative w-24">
                                        <input 
                                          type="number" 
                                          value={editFormData.commissionPercent}
                                          onChange={(e) => setEditFormData({...editFormData, commissionPercent: Number(e.target.value)})}
                                          className="w-full bg-[#0B0E14] border border-[#A882FF]/50 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-[#A882FF] transition-colors"
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8F95A3] text-xs font-bold">%</span>
                                      </div>
                                    ) : (
                                      <span className="font-bold text-[#00E57A] bg-[#00E57A]/10 px-2.5 py-1 rounded border border-[#00E57A]/20">
                                        {tier.commissionPercent}%
                                      </span>
                                    )}
                                  </td>

                                  <td className="py-4 px-4">
                                    {isEditing ? (
                                      <div className="relative w-32">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8F95A3] text-sm font-bold">$</span>
                                        <input 
                                          type="number" 
                                          value={editFormData.referralAmount}
                                          onChange={(e) => setEditFormData({...editFormData, referralAmount: Number(e.target.value)})}
                                          className="w-full bg-[#0B0E14] border border-[#A882FF]/50 rounded-lg pl-7 pr-3 py-2 text-white text-sm focus:outline-none focus:border-[#A882FF] transition-colors"
                                        />
                                      </div>
                                    ) : (
                                      <span className="font-bold text-white text-[15px]">
                                        ${tier.referralAmount}
                                      </span>
                                    )}
                                  </td>

                                  <td className="py-4 px-6 text-right">
                                    {isEditing ? (
                                      <div className="flex justify-end gap-2">
                                        <button 
                                          onClick={() => setEditingTierId(null)}
                                          className="p-2 rounded-lg bg-white/5 text-[#8F95A3] hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                                        >
                                          <X className="w-4 h-4" />
                                        </button>
                                        <button 
                                          onClick={() => saveTier(tier)}
                                          disabled={isSavingTier}
                                          className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#A882FF] hover:bg-[#8B5CF6] text-white font-bold text-xs transition-colors shadow-md disabled:opacity-50 cursor-pointer"
                                        >
                                          {isSavingTier ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                                          Save
                                        </button>
                                      </div>
                                    ) : (
                                      <div className="flex justify-end gap-2">
                                        <button 
                                          onClick={() => startEditingTier(tier)}
                                          className="w-8 h-8 rounded-lg bg-[#1D283A] text-[#38BDF8] flex items-center justify-center hover:bg-[#25354D] transition-colors cursor-pointer"
                                          title="Edit Tier"
                                        >
                                          <Edit2 className="w-4 h-4" />
                                        </button>
                                        {isLastLevel && (
                                          <button 
                                            onClick={() => deleteLastTier(tier._id || tier.level)}
                                            disabled={isDeletingTier}
                                            className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center hover:bg-rose-500/20 transition-colors cursor-pointer disabled:opacity-50"
                                            title="Delete Last Tier"
                                          >
                                            {isDeletingTier ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                          </button>
                                        )}
                                      </div>
                                    )}
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                    
                    {/* Add New Level Button */}
                    <div className="p-4 border-t border-white/5 flex justify-center bg-black/10">
                      <button 
                        onClick={addNewTierLevel}
                        disabled={isAddingTier}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-white text-sm font-bold transition-all disabled:opacity-50 cursor-pointer"
                      >
                        {isAddingTier ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                        Add New Level
                      </button>
                    </div>
                  </div>
                  
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{__html: `
        .dashed-line {
          background-image: linear-gradient(to right, currentColor 33%, rgba(255,255,255,0) 0%);
          background-position: bottom;
          background-size: 6px 1px;
          background-repeat: repeat-x;
          height: 1px;
          background-color: transparent;
        }
      `}} />

    </div>
  );
}