'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Ticket, Plus, Search, RefreshCcw, Loader2, X, AlertCircle, 
  Save, CheckCircle2, ShieldCheck, Clock, Settings, Zap, 
  Activity, Users, Calendar, Edit2, Trash2, History, LayoutDashboard, ChevronLeft, ChevronRight, DollarSign
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

  // Form State corresponding to Swagger API
  const initialFormState = {
    code: '',
    name: '',
    campaignName: '',
    description: '',
    source: 'Website',
    rewardType: 'CASH',
    amount: '',
    startDate: '',
    endDate: '',
    maxUsage: '',
    perUserLimit: '1',
    newUsersOnly: false,
    kycRequired: false,
    minAccountAgeDays: '0',
    minEarnings: '0',
    deviceLimit: '1',
    checkReferralAbuse: true,
    blockVpnProxy: true,
    status: 'ACTIVE' // Only used during UPDATE
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

  // 🔥 1. Fetch Dashboard Stats 🔥
  const fetchDashboardStats = async () => {
    setIsDashboardLoading(true);
    const token = localStorage.getItem('admin_token');
    try {
      const res = await fetch(`https://apitest.binnycash.com/api/admin/bonusDashboard`, {
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

  // 🔥 2. Fetch Promos List 🔥
  const fetchPromos = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : '';
    
    if (!token) {
      router.push('/v9/login');
      return;
    }

    try {
      const res = await fetch(`https://apitest.binnycash.com/api/admin/bonuscodeList`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
      });
      const json = await res.json().catch(() => null);

      if (res.ok && json?.code === 200 && json?.data) {
        setPromos(Array.isArray(json.data) ? json.data : []);
      } else {
        setErrorMsg(json?.message || "Failed to load promo codes.");
        setPromos([]);
      }
    } catch (err) {
      console.error("Promos fetch error:", err);
      setErrorMsg("Network error while fetching promo codes.");
      setPromos([]);
    } finally {
      setIsLoading(false);
    }
  };

  // 🔥 3. Fetch Redemption Logs 🔥
  const fetchLogs = async (page = 1) => {
    setIsLogsLoading(true);
    const token = localStorage.getItem('admin_token');
    try {
      const res = await fetch(`https://apitest.binnycash.com/api/admin/redemptionLogs?page=${page}&limit=50`, {
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
      console.error("Logs fetch error:", err);
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

  // 🔥 4. DELETE Promo Code 🔥
  const handleDeletePromo = async (id: string) => {
    if (!confirm("Are you sure you want to delete this promo code? This action cannot be undone.")) return;
    
    setIsDeletingId(id);
    const token = localStorage.getItem('admin_token');
    
    try {
      const res = await fetch(`https://apitest.binnycash.com/api/admin/deleteBonusCode/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
      });
      const json = await res.json();
      
      if (res.ok && (json.code === 200 || json.type === 'success')) {
        setPromos(prev => prev.filter(p => (p._id || p.id) !== id));
        fetchDashboardStats(); // Refresh stats after delete
      } else {
        alert(json.message || "Failed to delete promo code.");
      }
    } catch (err) {
      alert("Network Error while deleting promo code.");
    } finally {
      setIsDeletingId(null);
    }
  };

  // Open Create Modal
  const openCreateModal = () => {
    setEditingPromoId(null);
    setFormData(initialFormState);
    setIsModalOpen(true);
  };

  // Open Update Modal & Fetch Details
  const openEditModal = async (promoId: string) => {
    setEditingPromoId(promoId);
    setFormData(initialFormState);
    setIsModalOpen(true);
    setIsFetchingDetails(true);
    
    const token = localStorage.getItem('admin_token');

    try {
      const res = await fetch(`https://apitest.binnycash.com/api/admin/bonusCodeDetails/${promoId}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
      });
      const json = await res.json();
      
      if (res.ok && json.code === 200 && json.data) {
        const p = json.data;
        setFormData({
          code: p.code || '',
          name: p.name || '',
          campaignName: p.campaignName || '',
          description: p.description || '',
          source: p.source || 'Website',
          rewardType: p.rewardType || 'CASH',
          amount: p.amount?.toString() || '',
          startDate: formatForInput(p.startDate),
          endDate: formatForInput(p.endDate),
          maxUsage: p.maxUsage?.toString() || '',
          perUserLimit: p.perUserLimit?.toString() || '1',
          newUsersOnly: p.newUsersOnly || false,
          kycRequired: p.kycRequired || false,
          minAccountAgeDays: p.minAccountAgeDays?.toString() || '0',
          minEarnings: p.minEarnings?.toString() || '0',
          deviceLimit: p.deviceLimit?.toString() || '1',
          checkReferralAbuse: p.checkReferralAbuse !== false,
          blockVpnProxy: p.blockVpnProxy !== false,
          status: p.status || 'ACTIVE'
        });
      } else {
        alert(json.message || "Failed to fetch promo details.");
        setIsModalOpen(false);
      }
    } catch (err) {
      alert("Network Error while fetching promo details.");
      setIsModalOpen(false);
    } finally {
      setIsFetchingDetails(false);
    }
  };

  // Submit Form (POST for Create, PUT for Update)
  const handleSavePromo = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.maxUsage) {
      alert("Max Usage is a required field.");
      return;
    }
    
    if (!editingPromoId && !formData.code) {
      alert("Promo Code string is required.");
      return;
    }

    setIsCreating(true);
    const token = localStorage.getItem('admin_token');

    const fd = new FormData();
    if (!editingPromoId) fd.append('code', formData.code); 
    
    fd.append('name', formData.name);
    fd.append('campaignName', formData.campaignName);
    fd.append('description', formData.description);
    fd.append('source', formData.source);
    fd.append('rewardType', formData.rewardType);
    fd.append('amount', formData.amount.toString());
    
    if (formData.startDate) fd.append('startDate', new Date(formData.startDate).toISOString());
    if (formData.endDate) fd.append('endDate', new Date(formData.endDate).toISOString());
    
    fd.append('maxUsage', formData.maxUsage.toString());
    fd.append('perUserLimit', formData.perUserLimit.toString());
    fd.append('minAccountAgeDays', formData.minAccountAgeDays.toString());
    fd.append('minEarnings', formData.minEarnings.toString());
    fd.append('deviceLimit', formData.deviceLimit.toString());
    
    fd.append('newUsersOnly', formData.newUsersOnly ? 'true' : 'false');
    fd.append('kycRequired', formData.kycRequired ? 'true' : 'false');
    fd.append('checkReferralAbuse', formData.checkReferralAbuse ? 'true' : 'false');
    fd.append('blockVpnProxy', formData.blockVpnProxy ? 'true' : 'false');

    if (editingPromoId) {
      fd.append('status', formData.status);
    }

    const url = editingPromoId 
      ? `https://apitest.binnycash.com/api/admin/updateBonusCode/${editingPromoId}`
      : `https://apitest.binnycash.com/api/admin/createBonuscode`;
      
    const method = editingPromoId ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method: method,
        headers: { 'Authorization': `Bearer ${token}` },
        body: fd
      });
      
      const json = await res.json();
      if (res.ok && (json.code === 200 || json.type === 'success')) {
        setIsModalOpen(false);
        setFormData(initialFormState);
        fetchPromos(); 
        fetchDashboardStats();
      } else {
        alert(json.message || `Failed to ${editingPromoId ? 'update' : 'create'} promo code.`);
      }
    } catch (err) {
      alert(`Network Error while ${editingPromoId ? 'updating' : 'creating'} promo code.`);
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
    <div className="flex flex-col gap-6 text-white w-full max-w-[1600px] mx-auto pb-10 font-sans">
      
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

      {errorMsg && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span className="text-sm font-bold">{errorMsg}</span>
        </div>
      )}

      {/* --- DASHBOARD STATS GRID --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { title: "Total Active Codes", value: dashboardStats?.activeCodes || 0, icon: Ticket, color: "text-[#7C3AED]", bg: "bg-[#7C3AED]/10", border: "border-[#7C3AED]/20" },
          { title: "Total Redemptions", value: dashboardStats?.totalRedeemed || 0, icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
          { title: "Total Cash Distributed", value: formatPrice(dashboardStats?.totalCashDistributed || 0, currency), icon: DollarSign, color: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/20" },
          { title: "Total Coins Distributed", value: dashboardStats?.totalCoinsDistributed || 0, icon: Zap, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" }
        ].map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-[#12141C] border border-white/5 rounded-2xl p-5 shadow-sm hover:border-white/10 transition-all flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${stat.bg} ${stat.border}`}>
                <Icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">{stat.title}</span>
                <span className="text-2xl font-black text-white mt-1">
                  {isDashboardLoading ? <Loader2 className="w-5 h-5 animate-spin text-gray-500 mt-1" /> : stat.value}
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
                    <th className="py-4 px-4">Campaign</th>
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
                              <span className="text-white font-medium">{p?.campaignName || 'General'}</span>
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
                            <span className="text-gray-300 font-bold">{p?.usedCount || 0}</span>
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
                                onClick={() => handleDeletePromo(promoId)}
                                disabled={isDeletingId === promoId}
                                className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-400 hover:text-white hover:bg-rose-500/20 transition-colors flex items-center justify-center cursor-pointer disabled:opacity-50"
                                title="Delete Promo"
                              >
                                {isDeletingId === promoId ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
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

                      {!editingPromoId && (
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Display Name</label>
                          <input type="text" placeholder="Summer Bonus" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-[#0B0E14] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#8B5CF6]" />
                        </div>
                      )}

                      {editingPromoId && (
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Display Name</label>
                          <input type="text" placeholder="Summer Bonus" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full bg-[#0B0E14] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#8B5CF6]" />
                        </div>
                      )}

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Campaign Name</label>
                        <input type="text" placeholder="August Campaign" value={formData.campaignName} onChange={(e) => setFormData({...formData, campaignName: e.target.value})} className="w-full bg-[#0B0E14] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#8B5CF6]" />
                      </div>

                      <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Traffic Source</label>
                        <select value={formData.source} onChange={(e) => setFormData({...formData, source: e.target.value})} className="w-full bg-[#0B0E14] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#8B5CF6]">
                          {['Instagram', 'Telegram', 'Discord', 'Website', 'Email', 'YouTube', 'Twitter', 'Facebook', 'LinkedIn', 'TikTok', 'Reddit', 'Snapchat', 'WhatsApp', 'Pinterest', 'Twitch', 'Push Notification', 'Partner', 'Influencer', 'Signup', 'Other'].map(s => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>

                      <div className="md:col-span-2 flex flex-col gap-1.5">
                        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Description</label>
                        <input type="text" placeholder="Internal notes about this promo code..." value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} className="w-full bg-[#0B0E14] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#8B5CF6]" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#12141C] border border-white/5 rounded-2xl p-5">
                    <h4 className="text-sm font-black text-white flex items-center gap-2 mb-4 border-b border-white/5 pb-2">
                      <Zap className="w-4 h-4 text-emerald-400" /> Reward & Duration
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Reward Type</label>
                        <select value={formData.rewardType} onChange={(e) => setFormData({...formData, rewardType: e.target.value})} className="w-full bg-[#0B0E14] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#8B5CF6]">
                          <option value="CASH">Cash (USD)</option>
                          <option value="COINS">Coins</option>
                        </select>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Amount <span className="text-gray-500 lowercase">(100 coins = $1)</span></label>
                        <input type="number" step="any" required placeholder="0.00" value={formData.amount} onChange={(e) => setFormData({...formData, amount: e.target.value})} className="w-full bg-[#0B0E14] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#8B5CF6]" />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Start Date <span className="text-gray-500 lowercase">(Optional)</span></label>
                        <input type="datetime-local" value={formData.startDate} onChange={(e) => setFormData({...formData, startDate: e.target.value})} className="w-full bg-[#0B0E14] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#8B5CF6]" />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">End Date <span className="text-gray-500 lowercase">(Optional)</span></label>
                        <input type="datetime-local" value={formData.endDate} onChange={(e) => setFormData({...formData, endDate: e.target.value})} className="w-full bg-[#0B0E14] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#8B5CF6]" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#12141C] border border-white/5 rounded-2xl p-5">
                    <h4 className="text-sm font-black text-white flex items-center gap-2 mb-4 border-b border-white/5 pb-2">
                      <ShieldCheck className="w-4 h-4 text-amber-400" /> Usage Limits & Security
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Max Total Uses <span className="text-rose-500">*</span></label>
                        <input type="number" required placeholder="e.g. 1000" value={formData.maxUsage} onChange={(e) => setFormData({...formData, maxUsage: e.target.value})} className="w-full bg-[#0B0E14] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#8B5CF6]" />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Per User Limit</label>
                        <input type="number" min="1" value={formData.perUserLimit} onChange={(e) => setFormData({...formData, perUserLimit: e.target.value})} className="w-full bg-[#0B0E14] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#8B5CF6]" />
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Per Device Limit</label>
                        <input type="number" min="1" value={formData.deviceLimit} onChange={(e) => setFormData({...formData, deviceLimit: e.target.value})} className="w-full bg-[#0B0E14] border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-[#8B5CF6]" />
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
                      <label className="flex items-center gap-3 bg-[#0B0E14] border border-white/5 p-3 rounded-xl cursor-pointer hover:border-white/10 transition-colors">
                        <input type="checkbox" checked={formData.checkReferralAbuse} onChange={(e) => setFormData({...formData, checkReferralAbuse: e.target.checked})} className="w-5 h-5 accent-[#8B5CF6] rounded bg-[#12141C] border-white/10" />
                        <span className="text-sm text-gray-300 font-medium">Check Referral Abuse</span>
                      </label>
                      <label className="flex items-center gap-3 bg-[#0B0E14] border border-white/5 p-3 rounded-xl cursor-pointer hover:border-white/10 transition-colors">
                        <input type="checkbox" checked={formData.blockVpnProxy} onChange={(e) => setFormData({...formData, blockVpnProxy: e.target.checked})} className="w-5 h-5 accent-[#8B5CF6] rounded bg-[#12141C] border-white/10" />
                        <span className="text-sm text-gray-300 font-medium">Block VPN/Proxy IPs</span>
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

    </div>
  );
}