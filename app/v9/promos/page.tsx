'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Ticket, Plus, Search, RefreshCcw, Loader2, X, AlertCircle, 
  Save, CheckCircle2, ShieldCheck, Clock, Settings, Zap, 
  Activity, Users, Calendar, Edit2, Trash2, History, LayoutDashboard, ChevronLeft, ChevronRight, DollarSign, Layers
} from 'lucide-react';
import { useCurrency, formatPrice } from '@/hooks/useCurrency';

export default function AdminPromosPage() {
  const router = useRouter();
  const currency = useCurrency();

  // --- DASHBOARD STATES ---
  const [dashboardStats, setDashboardStats] = useState<any>({});
  const [isDashboardLoading, setIsDashboardLoading] = useState(true);

  // --- TABS STATE ---
  const [activeTab, setActiveTab] = useState<'promos' | 'logs'>('promos');

  // --- PROMOS LIST STATES ---
  const [promos, setPromos] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // 🔥 CUSTOM DELETE MODAL STATE 🔥
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);

  // --- REDEMPTION LOGS STATES ---
  const [logs, setLogs] = useState<any[]>([]);
  const [isLogsLoading, setIsLogsLoading] = useState(false);
  const [logsPage, setLogsPage] = useState(1);
  const [logsTotalPages, setLogsTotalPages] = useState(1);

  // --- CREATE / UPDATE MODAL STATES ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isFetchingDetails, setIsFetchingDetails] = useState(false);
  const [editingPromoId, setEditingPromoId] = useState<string | null>(null);
  const [submitMessage, setSubmitMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

  const initialFormState = {
    code: '',
    name: '',
    description: '',
    source: 'Website',
    rewardType: 'COINS',
    amount: '',
    startDate: '',
    endDate: '',
    maxUsage: '',
    newUsersOnly: false,
    kycRequired: false,
    minAccountAgeDays: '0',
    minEarnings: '0',
    status: 'ACTIVE'
  };

  const [formData, setFormData] = useState(initialFormState);

  const formatForInput = (dateString: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return '';
      return date.toISOString().slice(0, 16);
    } catch {
      return '';
    }
  };

  // --- Fetch Dashboard Stats ---
  const fetchDashboardStats = async () => {
    setIsDashboardLoading(true);
    const token = localStorage.getItem('admin_token');
    
    try {
      const res = await fetch(`https://api.binnycash.com/api/admin/bonusDashboard`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
      });

      const json = await res.json().catch(() => null);

      if (res.ok && json?.code === 200 && json?.data) {
        setDashboardStats(json.data);
      }
    } catch (err) {
      console.error("Dashboard fetch error:", err);
    } finally {
      setIsDashboardLoading(false);
    }
  };

  // --- Fetch Promos List ---
  const fetchPromos = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : '';
    
    if (!token) {
      router.push('/v9/login');
      return;
    }

    let pageNum = 1;
    let hasMore = true;
    let accumulatedList: any[] = [];

    try {
      while (hasMore && pageNum <= 100) { 
        const res = await fetch(`https://api.binnycash.com/api/admin/bonuscodeList?page=${pageNum}`, {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
        });
        const json = await res.json().catch(() => null);

        if (res.ok && json?.code === 200) {
          const list = Array.isArray(json.data) ? json.data : (Array.isArray(json.data?.list) ? json.data.list : []);
          
          if (list && list.length > 0) {
            accumulatedList = [...accumulatedList, ...list];
            pageNum++;
            const totalPages = json.data?.pagination?.pages || 1;
            if (pageNum > totalPages) hasMore = false;
          } else {
            hasMore = false;
          }
        } else {
          hasMore = false;
          if (accumulatedList.length === 0) setErrorMsg(json?.message || "Failed to load promo codes.");
        }
      }
      setPromos(accumulatedList);
    } catch (err) {
      setErrorMsg("Network error while fetching promo codes.");
      setPromos([]);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Fetch Redemption Logs ---
  const fetchLogs = async (page = 1) => {
    setIsLogsLoading(true);
    const token = localStorage.getItem('admin_token');
    try {
      const res = await fetch(`https://api.binnycash.com/api/admin/redemptionLogs?page=${page}&limit=50`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
      });
      const json = await res.json().catch(() => null);
      if (res.ok && json?.code === 200 && json?.data) {
        setLogs(Array.isArray(json.data.data) ? json.data.data : []);
        setLogsPage(json.data.pagination?.page || 1);
        setLogsTotalPages(json.data.pagination?.totalPages || 1);
      } else {
        setLogs([]);
      }
    } catch (err) {
      setLogs([]);
    } finally {
      setIsLogsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
    fetchPromos();
  }, [router]);

  useEffect(() => {
    if (activeTab === 'logs' && logs.length === 0) {
      fetchLogs(1);
    }
  }, [activeTab]);

  const refreshAll = () => {
    fetchDashboardStats();
    if (activeTab === 'promos') fetchPromos();
    else fetchLogs(logsPage);
  };

  // 🔥 CUSTOM DELETE LOGIC 🔥
  const confirmDeletePromo = async () => {
    if (!deleteConfirmId) return;
    
    setIsDeletingId(deleteConfirmId);
    const token = localStorage.getItem('admin_token');
    
    try {
      const res = await fetch(`https://api.binnycash.com/api/admin/deleteBonusCode/${deleteConfirmId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
      });
      const json = await res.json();
      
      if (res.ok && (json.code === 200 || json.type === 'success')) {
        setPromos(prev => prev.filter(p => (p._id || p.id) !== deleteConfirmId));
        fetchDashboardStats(); 
        setDeleteConfirmId(null);
      } else {
        setErrorMsg(json.message || "Failed to delete promo code.");
        setDeleteConfirmId(null);
      }
    } catch (err) {
      setErrorMsg("Network Error while deleting promo code.");
      setDeleteConfirmId(null);
    } finally {
      setIsDeletingId(null);
    }
  };

  const openCreateModal = () => {
    setEditingPromoId(null);
    setFormData(initialFormState);
    setSubmitMessage(null);
    setIsModalOpen(true);
  };

  // --- Fetch Details for Update Modal ---
  const openEditModal = async (promoId: string) => {
    setEditingPromoId(promoId);
    setFormData(initialFormState);
    setSubmitMessage(null);
    setIsModalOpen(true);
    setIsFetchingDetails(true);
    
    const token = localStorage.getItem('admin_token');

    try {
      const res = await fetch(`https://api.binnycash.com/api/admin/bonusCodeDetails/${promoId}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
      });
      const json = await res.json();
      
      if (res.ok && json.code === 200 && json.data) {
        const p = json.data;
        setFormData({
          code: p.code || '',
          name: p.name || '',
          description: p.description || '',
          source: p.source || 'Website',
          rewardType: p.rewardType || 'COINS',
          amount: p.amount?.toString() || '0',
          startDate: formatForInput(p.startDate),
          endDate: formatForInput(p.endDate),
          maxUsage: p.maxUsage?.toString() || '1',
          newUsersOnly: p.newUsersOnly || false,
          kycRequired: p.kycRequired || false,
          minAccountAgeDays: p.minAccountAgeDays?.toString() || '0',
          minEarnings: p.minEarnings?.toString() || '0',
          status: p.status || 'ACTIVE'
        });
      } else {
        setErrorMsg(json.message || "Failed to fetch promo details.");
        setIsModalOpen(false);
      }
    } catch (err) {
      setErrorMsg("Network Error while fetching promo details.");
      setIsModalOpen(false);
    } finally {
      setIsFetchingDetails(false);
    }
  };

  // --- Form Submit ---
  const handleSavePromo = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 🔥 Custom validation messages inside the modal 🔥
    if (!formData.maxUsage) {
      setSubmitMessage({ text: "Max Usage is a required field.", type: 'error' });
      return;
    }
    if (!editingPromoId && !formData.code) {
      setSubmitMessage({ text: "Promo Code string is required.", type: 'error' });
      return;
    }

    setIsCreating(true);
    setSubmitMessage(null);
    const token = localStorage.getItem('admin_token');

    const fd = new URLSearchParams();
    if (!editingPromoId) fd.append('code', formData.code); 
    
    fd.append('name', formData.name);
    fd.append('description', formData.description);
    fd.append('source', formData.source);
    fd.append('rewardType', formData.rewardType);
    fd.append('amount', formData.amount || '0');
    
    if (formData.startDate) fd.append('startDate', new Date(formData.startDate).toISOString());
    if (formData.endDate) fd.append('endDate', new Date(formData.endDate).toISOString());
    
    fd.append('maxUsage', formData.maxUsage || '1');
    fd.append('newUsersOnly', formData.newUsersOnly ? 'true' : 'false');
    fd.append('kycRequired', formData.kycRequired ? 'true' : 'false');
    fd.append('minAccountAgeDays', formData.minAccountAgeDays || '0');
    fd.append('minEarnings', formData.minEarnings || '0');

    if (editingPromoId) {
      fd.append('status', formData.status);
    }

    const url = editingPromoId 
      ? `https://api.binnycash.com/api/admin/updateBonusCode/${editingPromoId}`
      : `https://api.binnycash.com/api/admin/createBonuscode`;
      
    const method = editingPromoId ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method: method,
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: fd
      });
      
      const json = await res.json();
      if (res.ok && (json.code === 200 || json.code === 201 || json.type === 'success')) {
        setSubmitMessage({ text: json.message || `Promo code ${editingPromoId ? 'updated' : 'created'} successfully!`, type: 'success' });
        setTimeout(() => {
          setIsModalOpen(false);
          setFormData(initialFormState);
          fetchPromos(); 
          fetchDashboardStats();
          setSubmitMessage(null);
        }, 1200);
      } else {
        setSubmitMessage({ text: json.message || `Failed to ${editingPromoId ? 'update' : 'create'} promo code.`, type: 'error' });
      }
    } catch (err) {
      setSubmitMessage({ text: `Network Error while ${editingPromoId ? 'updating' : 'creating'} promo code.`, type: 'error' });
    } finally {
      setIsCreating(false);
    }
  };

  const safePromos = Array.isArray(promos) ? promos : [];
  const filteredPromos = safePromos.filter(p => {
    const code = p?.code || '';
    const name = p?.name || '';
    const q = searchQuery.toLowerCase();
    return code.toLowerCase().includes(q) || name.toLowerCase().includes(q);
  });

  return (
    <div className="flex flex-col gap-6 text-white w-full max-w-[1600px] mx-auto pb-10 font-sans relative">
      
      {/* --- HEADER --- */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
             <Ticket className="w-6 h-6 text-[#7C3AED]" /> Promo Codes
          </h1>
          <p className="text-sm text-gray-400 mt-1">Manage bonus codes, track redemptions, and view campaign stats.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={refreshAll} 
            disabled={isLoading || isDashboardLoading || isLogsLoading}
            className="flex items-center gap-2 bg-[#12141C] hover:bg-[#1A1C24] border border-white/10 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
          >
            <RefreshCcw className={`w-4 h-4 ${(isLoading || isDashboardLoading || isLogsLoading) ? 'animate-spin' : ''}`} /> Refresh
          </button>
          <button 
            onClick={openCreateModal}
            className="flex items-center gap-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white px-4 py-2 rounded-xl text-sm font-bold transition-colors shadow-md cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Create Promo
          </button>
        </div>
      </div>

      {/* --- CUSTOM GLOBAL ERROR BANNER --- */}
      <AnimatePresence>
        {errorMsg && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl flex items-center justify-between gap-3 shadow-md"
          >
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span className="text-sm font-bold">{errorMsg}</span>
            </div>
            <button onClick={() => setErrorMsg(null)} className="p-1 hover:bg-rose-500/20 rounded-lg transition-colors cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- DASHBOARD STATS GRID --- */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { title: "Total Codes", value: dashboardStats?.totalBonusCodes || 0, icon: Layers, color: "text-pink-400", bg: "bg-pink-500/10", border: "border-pink-500/20" },
          { title: "Active Codes", value: dashboardStats?.activeBonusCodes || 0, icon: Ticket, color: "text-[#7C3AED]", bg: "bg-[#7C3AED]/10", border: "border-[#7C3AED]/20" },
          { title: "Redemptions", value: dashboardStats?.totalRedemptions || 0, icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
          { title: "Cash Disbursed", value: formatPrice(dashboardStats?.cashDistributed || 0, currency), icon: DollarSign, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
          { title: "Coins Disbursed", value: dashboardStats?.coinsDistributed || 0, icon: Zap, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" }
        ].map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-[#12141C] border border-white/5 rounded-xl p-4 shadow-sm hover:border-white/10 transition-all flex flex-col xl:flex-row items-start xl:items-center gap-3 xl:gap-4">
              <div className={`w-10 h-10 xl:w-12 xl:h-12 rounded-xl flex items-center justify-center shrink-0 border ${stat.bg} ${stat.border}`}>
                <Icon className={`w-5 h-5 xl:w-6 xl:h-6 ${stat.color}`} />
              </div>
              <div className="flex flex-col">
                <span className="text-[9px] xl:text-[10px] text-gray-400 font-bold uppercase tracking-wider leading-tight">{stat.title}</span>
                <span className="text-lg xl:text-2xl font-black text-white mt-0.5">
                  {isDashboardLoading ? <Loader2 className="w-4 h-4 animate-spin text-gray-500 mt-1" /> : stat.value}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* --- TAB NAVIGATION --- */}
      <div className="flex flex-wrap items-center gap-2 p-1 bg-[#12141C] rounded-xl border border-white/5 w-fit mt-2">
        <button 
          onClick={() => setActiveTab('promos')} 
          className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${activeTab === 'promos' ? 'bg-[#252836] text-white shadow-sm border border-white/10' : 'text-gray-500 hover:text-gray-300'}`}
        >
          <LayoutDashboard className="w-4 h-4"/> Promo Codes List
        </button>
        <button 
          onClick={() => setActiveTab('logs')} 
          className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${activeTab === 'logs' ? 'bg-[#252836] text-white shadow-sm border border-white/10' : 'text-gray-500 hover:text-gray-300'}`}
        >
          <History className="w-4 h-4"/> Redemption History
        </button>
      </div>

      {/* ========================================== */}
      {/* TAB 1: PROMO CODES LIST */}
      {/* ========================================== */}
      {activeTab === 'promos' && (
        <>
          <div className="flex flex-wrap items-center gap-4 bg-[#12141C] p-4 rounded-xl border border-white/5">
            <div className="relative flex-1 min-w-[200px] max-w-md">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
               <input 
                 type="text" 
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 placeholder="Search by Promo Code or Name..." 
                 className="w-full bg-[#0B0D14] border border-white/10 rounded-lg pl-9 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#7C3AED] transition-colors"
               />
            </div>
          </div>

          <div className="bg-[#12141C] border border-white/5 rounded-xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse whitespace-nowrap">
                <thead>
                  <tr className="border-b border-white/10 text-gray-400 text-xs font-bold uppercase tracking-wider bg-[#161821]">
                    <th className="py-4 px-5">Promo Code</th>
                    <th className="py-4 px-4">Info & Source</th>
                    <th className="py-4 px-4 text-center">Reward</th>
                    <th className="py-4 px-4 text-center">Usage</th>
                    <th className="py-4 px-4 text-right">Validity</th>
                    <th className="py-4 px-5 text-center">Status</th>
                    <th className="py-4 px-5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 text-sm">
                  {isLoading ? (
                    <tr>
                      <td colSpan={7} className="py-16 text-center text-gray-500 font-medium">
                        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#7C3AED]" /> Loading promo codes...
                      </td>
                    </tr>
                  ) : filteredPromos.length > 0 ? (
                    filteredPromos.map((p: any, idx: number) => {
                      const status = p?.status?.toUpperCase() || (p?.isActive ? 'ACTIVE' : 'INACTIVE');
                      let statusColor = 'bg-gray-500/10 text-gray-400 border-gray-500/20';
                      if (status === 'ACTIVE') statusColor = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
                      if (status === 'EXPIRED') statusColor = 'bg-rose-500/10 text-rose-400 border-rose-500/20';
                      
                      const promoId = p?._id || p?.id;

                      return (
                        <tr key={promoId || idx} className="hover:bg-white/[0.02] transition-colors">
                          <td className="py-4 px-5">
                            <div className="flex flex-col">
                              <span className="font-black text-[#A855F7] tracking-widest uppercase">{p?.code || 'N/A'}</span>
                              <span className="text-xs text-gray-500">{p?.name || 'No Name'}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex flex-col">
                              <span className="text-white font-medium max-w-[150px] truncate" title={p?.description}>{p?.description || '---'}</span>
                              <span className="text-[10px] text-gray-500 uppercase">{p?.source || 'Website'}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-center">
                            <div className="inline-flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
                              <Zap className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="font-bold text-emerald-400">
                                {p?.rewardType === 'CASH' ? formatPrice(Number(p?.amount || 0), currency) : `${p?.amount || 0} Coins`}
                              </span>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-center">
                            <span className="text-gray-300 font-bold">{p?.totalRedeemedUsers || p?.usedCount || 0}</span>
                            <span className="text-gray-600 mx-1">/</span>
                            <span className="text-white font-bold">{p?.maxUsage || '∞'}</span>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <div className="flex flex-col items-end text-xs">
                              <span className="text-gray-400"><span className="text-gray-600">Start:</span> {p?.startDate ? new Date(p.startDate).toLocaleDateString() : 'N/A'}</span>
                              <span className="text-gray-400"><span className="text-gray-600">End:</span> {p?.endDate ? new Date(p.endDate).toLocaleDateString() : 'Never'}</span>
                            </div>
                          </td>
                          <td className="py-4 px-5 text-center">
                            <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded border ${statusColor}`}>
                              {status}
                            </span>
                          </td>
                          <td className="py-4 px-5 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button 
                                onClick={() => openEditModal(promoId)}
                                className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 hover:text-white hover:bg-blue-500/20 transition-colors flex items-center justify-center cursor-pointer"
                                title="Edit Promo"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => setDeleteConfirmId(promoId)}
                                className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-400 hover:text-white hover:bg-rose-500/20 transition-colors flex items-center justify-center cursor-pointer"
                                title="Delete Promo"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-16 text-center text-gray-500">No promo codes found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* ========================================== */}
      {/* TAB 2: REDEMPTION LOGS */}
      {/* ========================================== */}
      {activeTab === 'logs' && (
        <div className="bg-[#12141C] border border-white/5 rounded-xl overflow-hidden shadow-sm flex flex-col min-h-[400px]">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="border-b border-white/10 text-gray-400 text-xs font-bold uppercase tracking-wider bg-[#161821]">
                  <th className="py-4 px-5">Log ID</th>
                  <th className="py-4 px-4">User Info</th>
                  <th className="py-4 px-4">Promo Code</th>
                  <th className="py-4 px-4 text-right">Reward Credited</th>
                  <th className="py-4 px-5 text-right">Redeemed At</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm">
                {isLogsLoading ? (
                  <tr>
                    <td colSpan={5} className="py-16 text-center text-gray-500 font-medium">
                      <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#7C3AED]" /> Fetching redemption history...
                    </td>
                  </tr>
                ) : logs.length > 0 ? (
                  logs.map((log: any, idx: number) => (
                    <tr key={log?._id || idx} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 px-5 text-gray-400 font-mono text-xs">#{log?._id?.slice(-8) || idx}</td>
                      <td className="py-4 px-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-white">{log?.userName || log?.email || 'Unknown User'}</span>
                          <span className="text-[10px] text-gray-500 font-mono">ID: {log?.userId || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="font-black text-[#A855F7] tracking-widest uppercase bg-[#A855F7]/10 px-2.5 py-1 rounded border border-[#A855F7]/20">
                          {log?.code || log?.promoCode || 'N/A'}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span className="font-bold text-emerald-400">
                          +{log?.rewardType === 'CASH' ? formatPrice(Number(log?.amount || 0), currency) : `${log?.amount || 0} Coins`}
                        </span>
                      </td>
                      <td className="py-4 px-5 text-right text-gray-400 text-xs">
                        {log?.createdAt ? new Date(log.createdAt).toLocaleString() : 'N/A'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="py-16 text-center text-gray-500">
                      <History className="w-10 h-10 mx-auto text-gray-600 mb-3 opacity-50" />
                      No redemption history found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          {!isLogsLoading && logsTotalPages > 0 && (
            <div className="mt-auto p-4 border-t border-white/5 flex items-center justify-between bg-black/20">
              <span className="text-xs text-gray-400">Page {logsPage} of {logsTotalPages}</span>
              <div className="flex gap-2">
                <button onClick={() => fetchLogs(Math.max(logsPage - 1, 1))} disabled={logsPage === 1} className="p-1.5 rounded border border-white/10 text-gray-400 hover:text-white disabled:opacity-30 cursor-pointer">
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button onClick={() => fetchLogs(Math.min(logsPage + 1, logsTotalPages))} disabled={logsPage === logsTotalPages} className="p-1.5 rounded border border-white/10 text-gray-400 hover:text-white disabled:opacity-30 cursor-pointer">
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* --- CREATE / EDIT PROMO MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#0B0E14] border border-white/10 w-full max-w-4xl rounded-[24px] shadow-2xl relative flex flex-col overflow-hidden max-h-[90vh]">
            
            <div className="bg-[#12151E] border-b border-white/5 px-6 py-5 flex items-center justify-between shrink-0">
              <h3 className="text-xl font-black text-white flex items-center gap-3">
                <Ticket className="w-6 h-6 text-[#A882FF]" /> 
                {editingPromoId ? 'Update Bonus Code' : 'Create Bonus Code'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-[#8F95A3] hover:text-white bg-white/5 hover:bg-white/10 p-2 rounded-xl transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-6 bg-gradient-to-b from-white/[0.02] to-transparent">
              {isFetchingDetails ? (
                <div className="py-24 flex flex-col items-center justify-center gap-4">
                  <Loader2 className="w-8 h-8 animate-spin text-[#A882FF]" />
                  <span className="text-[#8F95A3] text-sm font-medium">Fetching promo details...</span>
                </div>
              ) : (
                <form id="promoForm" onSubmit={handleSavePromo} className="flex flex-col gap-8">
                  
                  <AnimatePresence>
                    {submitMessage && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                        className={`p-4 rounded-xl flex items-center gap-3 shadow-md border ${submitMessage.type === 'success' ? 'bg-[#00E57A]/10 border-[#00E57A]/30 text-[#00E57A]' : 'bg-rose-500/10 border-rose-500/30 text-rose-400'}`}
                      >
                        {submitMessage.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
                        <span className="font-bold text-sm tracking-wide">{submitMessage.text}</span>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* --- BASIC DETAILS --- */}
                  <div className="bg-[#12141C] border border-white/5 rounded-2xl p-5">
                    <h4 className="text-sm font-black text-white flex items-center gap-2 mb-4 border-b border-white/5 pb-2">
                      <Activity className="w-4 h-4 text-[#8B5CF6]" /> Basic Details
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Promo Code {editingPromoId ? '' : <span className="text-rose-500">*</span>}</label>
                        <input 
                          type="text" 
                          required={!editingPromoId} 
                          disabled={!!editingPromoId}
                          placeholder="e.g. WELCOME100" 
                          value={formData.code} 
                          onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})} 
                          className={`w-full border border-white/10 rounded-lg px-4 py-2.5 text-white font-mono uppercase focus:outline-none focus:border-[#8B5CF6] ${editingPromoId ? 'bg-white/5 opacity-60 cursor-not-allowed' : 'bg-[#0B0E14]'}`} 
                        />
                      </div>
                      
                      {editingPromoId && (
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">Status</label>
                          <select 
                            value={formData.status} 
                            onChange={(e) => setFormData({...formData, status: e.target.value})} 
                            className="w-full bg-[#0B0E14] border border-[#00E57A]/40 rounded-lg px-4 py-2.5 text-white font-bold focus:outline-none focus:border-[#00E57A]"
                          >
                            <option value="ACTIVE">ACTIVE</option>
                            <option value="INACTIVE">INACTIVE</option>
                            <option value="EXPIRED">EXPIRED</option>
                          </select>
                        </div>
                      )}

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Display Name</label>
                        <input type="text" placeholder="e.g. Summer Bonus" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-[#0B0E14] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#8B5CF6]" />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Traffic Source</label>
                        <select value={formData.source} onChange={(e) => setFormData({...formData, source: e.target.value})} className="w-full bg-[#0B0E14] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#8B5CF6]">
                          {['Website', 'Instagram', 'Telegram', 'Discord', 'Email', 'YouTube', 'Twitter', 'Facebook', 'Influencer', 'Signup', 'Other'].map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>

                      <div className="md:col-span-2 flex flex-col gap-1.5">
                        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Description</label>
                        <input type="text" placeholder="Promo code description..." value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full bg-[#0B0E14] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#8B5CF6]" />
                      </div>
                    </div>
                  </div>

                  {/* --- REWARD & DURATION --- */}
                  <div className="bg-[#12141C] border border-white/5 rounded-2xl p-5">
                    <h4 className="text-sm font-black text-white flex items-center gap-2 mb-4 border-b border-white/5 pb-2">
                      <Zap className="w-4 h-4 text-emerald-400" /> Reward & Duration
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Reward Type</label>
                        <select value={formData.rewardType} onChange={(e) => setFormData({...formData, rewardType: e.target.value})} className="w-full bg-[#0B0E14] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#8B5CF6]">
                          <option value="COINS">COINS</option>
                          <option value="CASH">CASH</option>
                        </select>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Amount <span className="text-gray-500 lowercase">(100 coins = $1)</span></label>
                        <input type="number" step="any" placeholder="0" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} className="w-full bg-[#0B0E14] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#8B5CF6]" />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Start Date <span className="text-gray-500 lowercase">(Optional)</span></label>
                        <input type="datetime-local" value={formData.startDate} onChange={(e) => setFormData({...formData, startDate: e.target.value})} className="w-full bg-[#0B0E14] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#8B5CF6] [color-scheme:dark]" />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">End Date <span className="text-gray-500 lowercase">(Optional)</span></label>
                        <input type="datetime-local" value={formData.endDate} onChange={(e) => setFormData({...formData, endDate: e.target.value})} className="w-full bg-[#0B0E14] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#8B5CF6] [color-scheme:dark]" />
                      </div>
                    </div>
                  </div>

                  {/* --- USAGE LIMITS --- */}
                  <div className="bg-[#12141C] border border-white/5 rounded-2xl p-5">
                    <h4 className="text-sm font-black text-white flex items-center gap-2 mb-4 border-b border-white/5 pb-2">
                      <ShieldCheck className="w-4 h-4 text-amber-400" /> Usage Limits & Security
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Max Redemptions <span className="text-rose-500">*</span></label>
                        <input type="number" required placeholder="e.g. 1" value={formData.maxUsage} onChange={(e) => setFormData({...formData, maxUsage: e.target.value})} className="w-full bg-[#0B0E14] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#8B5CF6]" />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Min. Account Age (Days)</label>
                        <input type="number" min="0" value={formData.minAccountAgeDays} onChange={(e) => setFormData({...formData, minAccountAgeDays: e.target.value})} className="w-full bg-[#0B0E14] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#8B5CF6]" />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Min. Lifetime Earnings</label>
                        <input type="number" step="any" min="0" value={formData.minEarnings} onChange={(e) => setFormData({...formData, minEarnings: e.target.value})} className="w-full bg-[#0B0E14] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#8B5CF6]" />
                      </div>
                    </div>

                    <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <label className="flex items-center gap-3 bg-[#0B0E14] border border-white/5 p-3 rounded-xl cursor-pointer hover:border-white/10 transition-colors">
                        <input type="checkbox" checked={formData.newUsersOnly} onChange={(e) => setFormData({...formData, newUsersOnly: e.target.checked})} className="w-5 h-5 accent-[#8B5CF6] rounded bg-[#12141C] border-white/10" />
                        <span className="text-sm text-gray-300 font-medium">New Users Only</span>
                      </label>
                      <label className="flex items-center gap-3 bg-[#0B0E14] border border-white/5 p-3 rounded-xl cursor-pointer hover:border-white/10 transition-colors">
                        <input type="checkbox" checked={formData.kycRequired} onChange={(e) => setFormData({...formData, kycRequired: e.target.checked})} className="w-5 h-5 accent-[#8B5CF6] rounded bg-[#12141C] border-white/10" />
                        <span className="text-sm text-gray-300 font-medium">KYC Required</span>
                      </label>
                    </div>
                  </div>

                </form>
              )}
            </div>

            <div className="bg-[#12151E] border-t border-white/5 px-6 py-4 flex items-center justify-end gap-3 shrink-0">
              <button 
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-sm transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button 
                type="submit"
                form="promoForm"
                disabled={isCreating || isFetchingDetails}
                className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-bold text-sm transition-colors shadow-lg disabled:opacity-50 cursor-pointer"
              >
                {isCreating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                {editingPromoId ? 'Update Promo Code' : 'Publish Promo Code'}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* --- 🔥 CUSTOM DELETE CONFIRMATION MODAL 🔥 --- */}
      <AnimatePresence>
        {deleteConfirmId && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-[#050409]/90 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-[#12141C] border border-white/10 w-full max-w-md rounded-[32px] p-8 shadow-2xl flex flex-col items-center text-center"
            >
              <div className="w-20 h-20 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center mb-6 shadow-inner">
                <AlertCircle className="w-10 h-10 text-rose-500" />
              </div>
              <h3 className="text-2xl font-black text-white mb-2 tracking-tight">Delete Promo Code?</h3>
              <p className="text-sm text-[#8F95A3] mb-8 leading-relaxed">
                This action cannot be undone. Are you sure you want to permanently delete this promo code from the system?
              </p>
              
              <div className="flex w-full gap-4">
                <button
                  onClick={() => setDeleteConfirmId(null)}
                  disabled={isDeletingId === deleteConfirmId}
                  className="flex-1 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-sm transition-colors cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDeletePromo}
                  disabled={isDeletingId === deleteConfirmId}
                  className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 text-white font-black text-sm transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(244,63,94,0.4)] hover:shadow-[0_0_30px_rgba(244,63,94,0.6)] cursor-pointer disabled:opacity-50"
                >
                  {isDeletingId === deleteConfirmId ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                  Delete Now
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}