'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trophy, Save, Loader2, Plus, Trash2, CalendarDays, 
  Settings, Globe, Users, DollarSign, Activity, 
  CheckCircle2, AlertCircle, FileText, Target, List, PlaySquare, 
  RefreshCcw, Edit3, ShieldAlert, Eye, Medal, UserMinus, UserCheck, X
} from 'lucide-react';

export default function AdminLeaderboardPage() {
  const router = useRouter();

  // --- TABS STATE ---
  const [activeTab, setActiveTab] = useState<'list' | 'create' | 'edit'>('list');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isReadOnly, setIsReadOnly] = useState(false);

  // ==========================================
  // 1. LIST LEADERBOARDS STATES & LOGIC
  // ==========================================
  const [leaderboards, setLeaderboards] = useState<any[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [listError, setListError] = useState<string | null>(null);
  const [statusUpdatingId, setStatusUpdatingId] = useState<string | null>(null);

  const fetchLeaderboards = async () => {
    setIsLoadingList(true);
    setListError(null);
    const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : '';
    
    if (!token) {
      router.push('/v9/login');
      return;
    }

    try {
      const res = await fetch(`https://api.binnycash.com/api/admin/leaderboards`, {
        method: 'GET',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      const json = await res.json().catch(() => null);

      if (res.ok && json) {
        let list: any[] = [];
        if (Array.isArray(json.data)) list = json.data;
        else if (json.data && Array.isArray(json.data.data)) list = json.data.data;
        else if (json.data && Array.isArray(json.data.list)) list = json.data.list;
        else if (Array.isArray(json)) list = json;
        setLeaderboards(list);
      } else {
        setListError(json?.message || "Failed to load leaderboards.");
      }
    } catch (err) {
      setListError("Network error while fetching leaderboards.");
    } finally {
      setIsLoadingList(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'list') {
      fetchLeaderboards();
    }
  }, [activeTab]);

  // 🔥 DELETE LEADERBOARD (Only INACTIVE or UPCOMING)
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this leaderboard? This action cannot be undone.")) return;
    const token = localStorage.getItem('admin_token');
    
    try {
      const res = await fetch(`https://api.binnycash.com/api/admin/leaderboards/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        fetchLeaderboards();
      } else {
        const json = await res.json();
        alert(json?.message || "Failed to delete leaderboard.");
      }
    } catch (e) {
      alert("Network error while deleting.");
    }
  };

  // 🔥 QUICK STATUS UPDATE (PATCH)
  const handleStatusChange = async (id: string, newStatus: string) => {
    setStatusUpdatingId(id);
    const token = localStorage.getItem('admin_token');

    try {
      const res = await fetch(`https://api.binnycash.com/api/admin/leaderboards/${id}/status`, {
        method: 'PATCH',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (res.ok) {
        fetchLeaderboards(); // Refresh list to reflect changes
      } else {
        const json = await res.json();
        alert(json?.message || "Failed to update status.");
      }
    } catch (e) {
      alert("Network error while updating status.");
    } finally {
      setStatusUpdatingId(null);
    }
  };

  // ==========================================
  // WINNERS MODAL LOGIC (GET)
  // ==========================================
  const [isWinnersModalOpen, setIsWinnersModalOpen] = useState(false);
  const [winnersList, setWinnersList] = useState<any[]>([]);
  const [isWinnersLoading, setIsWinnersLoading] = useState(false);

  const handleViewWinners = async (id: string) => {
    setIsWinnersModalOpen(true);
    setIsWinnersLoading(true);
    setWinnersList([]);
    const token = localStorage.getItem('admin_token');

    try {
      const res = await fetch(`https://api.binnycash.com/api/admin/leaderboards/${id}/winners`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const json = await res.json();
      if (res.ok && json) {
        let list: any[] = [];
        if (Array.isArray(json.data)) list = json.data;
        else if (Array.isArray(json)) list = json;
        setWinnersList(list);
      } else {
        alert(json?.message || "Failed to fetch winners.");
        setIsWinnersModalOpen(false);
      }
    } catch (e) {
      alert("Network error fetching winners.");
      setIsWinnersModalOpen(false);
    } finally {
      setIsWinnersLoading(false);
    }
  };


  // ==========================================
  // 2. CREATE / EDIT LEADERBOARD STATES
  // ==========================================
  const [formData, setFormData] = useState({
    leaderboardName: '', description: '', leaderboardType: 'DAILY', status: 'INACTIVE', startDate: '', endDate: '',   
  });
  const [targeting, setTargeting] = useState({ countries: 'All', excludeCountries: '', excludeUsers: '' });
  const [prizes, setPrizes] = useState([{ startRank: 1, endRank: 1, Cash: 0 }]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isFetchingDetails, setIsFetchingDetails] = useState(false);
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' | 'warning' } | null>(null);

  // Quick User Exclusion (PATCH) State
  const [quickUserId, setQuickUserId] = useState('');
  const [isQuickPatching, setIsQuickPatching] = useState(false);

  // Formatting helpers
  const apiDateToDatetimeLocal = (apiDate: string) => {
    if (!apiDate) return '';
    if (apiDate.includes('T')) return apiDate.substring(0, 16); 
    const match = apiDate.match(/(\d{4}-\d{2}-\d{2})\s+(\d{1,2}):(\d{2})\s+(AM|PM)/i);
    if (match) {
      let [_, datePart, h, m, ampm] = match;
      let hour = parseInt(h, 10);
      if (ampm.toUpperCase() === 'PM' && hour < 12) hour += 12;
      if (ampm.toUpperCase() === 'AM' && hour === 12) hour = 0;
      return `${datePart}T${hour.toString().padStart(2, '0')}:${m}`;
    }
    return '';
  };

  const formatForApi = (dateString: string) => {
    if (!dateString) return '';
    const d = new Date(dateString);
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    let h = d.getHours();
    const m = String(d.getMinutes()).padStart(2, '0');
    const ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12 || 12; 
    return `${yyyy}-${mm}-${dd} ${String(h).padStart(2, '0')}:${m} ${ampm}`;
  };

  const displayDate = (isoString: string) => {
    if (!isoString) return 'N/A';
    try {
      return new Date(isoString).toLocaleString(undefined, { 
        year: 'numeric', month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' 
      });
    } catch {
      return isoString;
    }
  };

  // --- FETCH SINGLE LEADERBOARD DETAILS (GET) ---
  const handleEditClick = async (id: string) => {
    if (!id) return;
    setActiveTab('edit');
    setEditingId(id);
    setIsFetchingDetails(true);
    setMessage(null);
    setIsReadOnly(false);
    setQuickUserId(''); // Reset quick widget

    const token = localStorage.getItem('admin_token');
    try {
      const res = await fetch(`https://api.binnycash.com/api/admin/leaderboards/${id}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
      });
      const text = await res.text();
      let json: any = {};
      try { json = JSON.parse(text); } catch (e) {}

      let lb = json?.data || (json?.leaderboardName ? json : null);

      if (res.ok && lb) {
        setFormData({
          leaderboardName: lb.leaderboardName || '', description: lb.description || '', leaderboardType: lb.leaderboardType || 'DAILY',
          status: lb.status || 'INACTIVE', startDate: apiDateToDatetimeLocal(lb.startDate), endDate: apiDateToDatetimeLocal(lb.endDate),
        });

        const safeJoin = (val: any) => Array.isArray(val) ? val.join(', ') : (typeof val === 'string' ? val : '');
        setTargeting({
          countries: safeJoin(lb.countries) || 'All',
          excludeCountries: safeJoin(lb.excludeCountries),
          excludeUsers: safeJoin(lb.excludeUsers)
        });

        if (lb.prizes && Array.isArray(lb.prizes) && lb.prizes.length > 0) {
          setPrizes(lb.prizes.map((p: any) => {
            let foundCash = p.Cash ?? p.cash ?? p.CASH ?? p.prize ?? p.amount ?? p.reward ?? 0;
            return {
              startRank: p.startRank || p.start_rank || 1, endRank: p.endRank || p.end_rank || 1, Cash: Number(foundCash)
            };
          }));
        } else {
          setPrizes([{ startRank: 1, endRank: 1, Cash: 0 }]);
        }

        if (lb.status === 'ACTIVE' || lb.status === 'ENDED') {
          setIsReadOnly(true);
          setMessage({ text: 'Active or Ended leaderboards cannot be edited. You can only view the details.', type: 'warning' });
        }
      } else {
        setMessage({ text: json?.message || 'Failed to load details. Ensure ID is correct.', type: 'error' });
      }
    } catch (err) {
      setMessage({ text: 'Network error while fetching details.', type: 'error' });
    } finally {
      setIsFetchingDetails(false);
    }
  };

  // 🔥 QUICK USER EXCLUSION (PATCH) 🔥
  const handleQuickExclusion = async (action: 'exclude' | 'include') => {
    if (!editingId || !quickUserId) return;
    setIsQuickPatching(true);
    const token = localStorage.getItem('admin_token');

    try {
      const res = await fetch(`https://api.binnycash.com/api/admin/leaderboards/${editingId}/users/exclusion`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: Number(quickUserId), action: action })
      });
      const json = await res.json();
      if (res.ok) {
        setMessage({ text: `User ${action}d successfully!`, type: 'success' });
        setQuickUserId('');
        // Re-fetch details to sync view
        handleEditClick(editingId);
      } else {
        setMessage({ text: json?.message || `Failed to ${action} user.`, type: 'error' });
      }
    } catch (e) {
      setMessage({ text: `Network error while trying to ${action} user.`, type: 'error' });
    } finally {
      setIsQuickPatching(false);
    }
  };

  // --- FORM HANDLERS ---
  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    if (isReadOnly) return;
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
  const handleTargetingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isReadOnly) return;
    setTargeting({ ...targeting, [e.target.name]: e.target.value });
  };
  const handleAddPrize = () => {
    if (isReadOnly) return;
    const lastPrize = prizes[prizes.length - 1];
    const nextRank = lastPrize ? Number(lastPrize.endRank) + 1 : 1;
    setPrizes([...prizes, { startRank: nextRank, endRank: nextRank, Cash: 0 }]);
  };
  const handleRemovePrize = (index: number) => {
    if (isReadOnly) return;
    setPrizes(prizes.filter((_, i) => i !== index));
  };
  const handlePrizeChange = (index: number, field: string, value: string) => {
    if (isReadOnly) return;
    const newPrizes = [...prizes];
    newPrizes[index] = { ...newPrizes[index], [field]: value };
    setPrizes(newPrizes);
  };
  const resetForm = () => {
    setFormData({ leaderboardName: '', description: '', leaderboardType: 'DAILY', status: 'INACTIVE', startDate: '', endDate: '' });
    setTargeting({ countries: 'All', excludeCountries: '', excludeUsers: '' });
    setPrizes([{ startRank: 1, endRank: 1, Cash: 0 }]);
    setEditingId(null);
    setIsReadOnly(false);
    setMessage(null);
    setQuickUserId('');
  };

  // --- SUBMIT (POST or PUT) ---
  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isReadOnly) return;
    setIsSubmitting(true);
    setMessage(null);
    const token = localStorage.getItem('admin_token');
    
    const countriesArray = targeting.countries.split(',').map(s => s.trim()).filter(Boolean);
    const excludeCountriesArray = targeting.excludeCountries.split(',').map(s => s.trim().toUpperCase()).filter(Boolean);
    const excludeUsersArray = targeting.excludeUsers.split(',').map(s => Number(s.trim())).filter(n => !isNaN(n));
    const formattedPrizes = prizes.map(p => ({ startRank: Number(p.startRank), endRank: Number(p.endRank), Cash: Number(p.Cash) }));

    const payload = {
      leaderboardName: formData.leaderboardName, description: formData.description, leaderboardType: formData.leaderboardType,
      status: formData.status, startDate: formatForApi(formData.startDate), endDate: formatForApi(formData.endDate),
      countries: countriesArray.length > 0 ? countriesArray : ["All"], excludeCountries: excludeCountriesArray, excludeUsers: excludeUsersArray,
      prizes: formattedPrizes
    };

    const isEditMode = activeTab === 'edit' && editingId;
    const url = isEditMode ? `https://api.binnycash.com/api/admin/leaderboards/${editingId}` : `https://api.binnycash.com/api/admin/leaderboards`;

    try {
      const res = await fetch(url, {
        method: isEditMode ? 'PUT' : 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (res.ok && (json?.code === 200 || json?.code === 201 || json?.type === 'success')) {
        setMessage({ text: `Leaderboard ${isEditMode ? 'updated' : 'created'} successfully!`, type: 'success' });
        setTimeout(() => { resetForm(); setActiveTab('list'); }, 1500);
      } else {
        setMessage({ text: json?.message || `Failed to ${isEditMode ? 'update' : 'create'} leaderboard.`, type: 'error' });
      }
    } catch (err) {
      setMessage({ text: 'Network error. Please try again later.', type: 'error' });
    } finally {
      setIsSubmitting(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };


  return (
    <div className="flex flex-col gap-6 text-white w-full max-w-[1400px] mx-auto pb-10 font-sans relative">
      
      {/* HEADER & TABS */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-white/10 pb-5 gap-4">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3 tracking-tight">
             <Trophy className="w-8 h-8 text-[#A66CFF]" /> 
             Leaderboard Management
          </h1>
          <p className="text-sm text-[#8F95A3] mt-2">
            Configure competitive tournaments, set prize pools, and manage active leaderboards.
          </p>
        </div>

        <div className="flex items-center p-1 bg-[#12141C] rounded-xl border border-white/5 w-full md:w-auto shadow-inner">
          <button 
            onClick={() => setActiveTab('list')}
            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all cursor-pointer ${activeTab === 'list' ? 'bg-[#1A1C24] text-white shadow-md border border-white/10' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
          >
            <List className="w-4 h-4" /> All Leaderboards
          </button>
          <button 
            onClick={() => { resetForm(); setActiveTab('create'); }}
            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all cursor-pointer ${activeTab === 'create' ? 'bg-[#A66CFF] text-white shadow-md shadow-[#A66CFF]/30' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
          >
            <Plus className="w-4 h-4" /> Create New
          </button>
          
          {activeTab === 'edit' && (
            <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all bg-amber-500 text-black shadow-md shadow-amber-500/30 cursor-default">
              <Edit3 className="w-4 h-4" /> View / Edit
            </button>
          )}
        </div>
      </div>

      <AnimatePresence mode="wait">
        
        {/* ========================================== */}
        {/* TAB 1: LEADERBOARD LIST */}
        {/* ========================================== */}
        {activeTab === 'list' && (
          <motion.div key="list" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col gap-6">
            <div className="bg-[#12141C] border border-white/5 rounded-xl overflow-hidden shadow-sm">
              <div className="p-4 border-b border-white/5 flex items-center justify-between bg-[#161821]">
                <h3 className="text-white font-bold text-sm flex items-center gap-2">
                  <PlaySquare className="w-4 h-4 text-emerald-400" /> Active & Past Campaigns
                </h3>
                <button onClick={fetchLeaderboards} disabled={isLoadingList} className="text-gray-400 hover:text-white transition-colors cursor-pointer">
                  <RefreshCcw className={`w-4 h-4 ${isLoadingList ? 'animate-spin text-[#A66CFF]' : ''}`} />
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse whitespace-nowrap min-w-[1000px]">
                  <thead>
                    <tr className="border-b border-white/10 text-gray-400 text-xs font-bold uppercase tracking-wider bg-[#1A1C24]/50">
                      <th className="py-4 px-5 w-[25%]">Campaign Name</th>
                      <th className="py-4 px-4 text-center">Type</th>
                      <th className="py-4 px-4 text-center">Quick Status</th>
                      <th className="py-4 px-4">Timeline</th>
                      <th className="py-4 px-4">Prizes</th>
                      <th className="py-4 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-sm">
                    {isLoadingList ? (
                      <tr>
                        <td colSpan={6} className="py-16 text-center text-gray-500 font-medium">
                          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#A66CFF]" /> Fetching leaderboards...
                        </td>
                      </tr>
                    ) : listError ? (
                      <tr>
                        <td colSpan={6} className="py-16 text-center text-rose-400 font-medium">
                          <AlertCircle className="w-6 h-6 mx-auto mb-2" /> {listError}
                        </td>
                      </tr>
                    ) : leaderboards.length > 0 ? (
                      leaderboards.map((lb: any, idx: number) => {
                        const lbId = lb._id || lb.id;
                        const isApp = lb.leaderboardType === 'DAILY';
                        return (
                          <tr key={lbId || idx} className="hover:bg-white/[0.02] transition-colors align-top group">
                            <td className="py-4 px-5">
                              <div className="flex flex-col">
                                <span className="font-bold text-white text-[15px]">{lb.leaderboardName || 'Unnamed'}</span>
                                <span className="text-xs text-gray-500 truncate max-w-[200px]" title={lb.description}>{lb.description || 'No description'}</span>
                              </div>
                            </td>
                            <td className="py-4 px-4 text-center">
                              <span className={`inline-block mt-1 text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${isApp ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-purple-500/10 text-purple-400 border-purple-500/20'}`}>
                                {lb.leaderboardType || 'N/A'}
                              </span>
                            </td>
                            
                            {/* 🔥 QUICK STATUS DROPODOWN 🔥 */}
                            <td className="py-4 px-4 text-center">
                              <div className="relative inline-block mt-0.5">
                                {statusUpdatingId === lbId ? (
                                  <div className="flex items-center justify-center px-3 py-1"><Loader2 className="w-4 h-4 animate-spin text-[#A66CFF]" /></div>
                                ) : (
                                  <select 
                                    value={lb.status} 
                                    onChange={(e) => handleStatusChange(lbId, e.target.value)}
                                    disabled={lb.status === 'ENDED'}
                                    className={`appearance-none text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded border cursor-pointer outline-none transition-colors ${
                                      lb.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:border-emerald-400' : 
                                      lb.status === 'ENDED' ? 'bg-rose-500/10 text-rose-400 border-rose-500/20 cursor-not-allowed opacity-70' : 
                                      'bg-gray-500/10 text-gray-400 border-gray-500/30 hover:border-gray-400'
                                    }`}
                                  >
                                    <option value="INACTIVE" className="bg-[#12141C] text-gray-400">INACTIVE</option>
                                    <option value="ACTIVE" className="bg-[#12141C] text-emerald-400">ACTIVE</option>
                                    <option value="UPCOMING" className="bg-[#12141C] text-blue-400">UPCOMING</option>
                                    {lb.status === 'ENDED' && <option value="ENDED" className="bg-[#12141C] text-rose-400">ENDED</option>}
                                  </select>
                                )}
                              </div>
                            </td>

                            <td className="py-4 px-4">
                              <div className="flex flex-col text-[11px] gap-1 bg-[#0B0D14] p-2 rounded-lg border border-white/5 w-fit">
                                <span className="text-gray-400">Start: <span className="text-emerald-400 font-mono font-bold">{displayDate(lb.startDate)}</span></span>
                                <span className="text-gray-400">End: <span className="text-rose-400 font-mono font-bold ml-1.5">{displayDate(lb.endDate)}</span></span>
                              </div>
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex flex-col gap-1.5 max-h-[80px] overflow-y-auto custom-scrollbar pr-2">
                                {lb.prizes && Array.isArray(lb.prizes) && lb.prizes.length > 0 ? (
                                  lb.prizes.map((p: any, i: number) => {
                                    const rankText = p.startRank === p.endRank ? `Rank ${p.startRank}` : `Rank ${p.startRank}-${p.endRank}`;
                                    const cashValue = p.Cash ?? p.cash ?? p.CASH ?? p.prize ?? p.amount ?? p.reward ?? 0;
                                    return (
                                      <div key={i} className="flex items-center gap-2 bg-[#0B0D14] border border-white/5 px-2 py-1 rounded text-[11px]">
                                        <span className="text-gray-400 font-medium w-[60px]">{rankText}:</span>
                                        <span className="text-emerald-400 font-bold">${Number(cashValue)}</span>
                                      </div>
                                    );
                                  })
                                ) : (
                                  <span className="text-xs text-gray-500 italic">No prizes set</span>
                                )}
                              </div>
                            </td>
                            <td className="py-4 px-4 text-right">
                              <div className="flex items-center justify-end gap-2 mt-2">
                                {/* Winners Button (Only if ENDED) */}
                                {lb.status === 'ENDED' && (
                                  <button onClick={() => handleViewWinners(lbId)} title="View Winners" className="w-8 h-8 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/20 flex items-center justify-center transition-colors cursor-pointer">
                                    <Medal className="w-4 h-4" />
                                  </button>
                                )}
                                {/* View/Edit Button */}
                                <button onClick={() => handleEditClick(lbId)} title="View / Edit" className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-white border border-white/10 flex items-center justify-center transition-colors cursor-pointer">
                                  {lb.status === 'INACTIVE' || lb.status === 'UPCOMING' ? <Edit3 className="w-4 h-4 text-amber-400" /> : <Eye className="w-4 h-4 text-[#A66CFF]" />}
                                </button>
                                {/* Delete Button (Only if INACTIVE or UPCOMING) */}
                                {(lb.status === 'INACTIVE' || lb.status === 'UPCOMING') && (
                                  <button onClick={() => handleDelete(lbId)} title="Delete Leaderboard" className="w-8 h-8 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/20 flex items-center justify-center transition-colors cursor-pointer">
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    ) : (
                      <tr>
                        <td colSpan={6} className="py-20 text-center text-gray-500">
                          <Trophy className="w-12 h-12 mx-auto mb-3 opacity-20" />
                          <p>No leaderboards found. Create your first campaign!</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}

        {/* ========================================== */}
        {/* TAB 2: CREATE / EDIT LEADERBOARD */}
        {/* ========================================== */}
        {(activeTab === 'create' || activeTab === 'edit') && (
          <motion.div key="form" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col gap-6">
            <AnimatePresence>
              {message && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                  className={`p-5 rounded-2xl flex items-center gap-3 shadow-lg border ${message.type === 'success' ? 'bg-[#00E57A]/10 border-[#00E57A]/30 text-[#00E57A]' : message.type === 'warning' ? 'bg-amber-500/10 border-amber-500/30 text-amber-500' : 'bg-rose-500/10 border-rose-500/30 text-rose-400'}`}
                >
                  {message.type === 'success' ? <CheckCircle2 className="w-6 h-6 shrink-0" /> : message.type === 'warning' ? <ShieldAlert className="w-6 h-6 shrink-0" /> : <AlertCircle className="w-6 h-6 shrink-0" />}
                  <span className="font-bold tracking-wide">{message.text}</span>
                </motion.div>
              )}
            </AnimatePresence>

            {isFetchingDetails ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-[#A66CFF]" />
                <span className="text-gray-400 font-bold">Loading leaderboard details...</span>
              </div>
            ) : (
              <form onSubmit={handleCreateSubmit} className="flex flex-col xl:flex-row gap-6">
                
                {/* LEFT COLUMN: MAIN SETTINGS */}
                <div className="flex-1 flex flex-col gap-6">
                  
                  {/* GENERAL INFO CARD */}
                  <div className="bg-[#12141C] border border-white/5 rounded-3xl p-6 md:p-8 shadow-xl">
                    <h2 className="text-lg font-black text-white mb-6 flex items-center gap-2 border-b border-white/5 pb-4">
                      <FileText className="w-5 h-5 text-[#A66CFF]" /> General Details
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex flex-col gap-2 md:col-span-2">
                        <label className="text-xs font-bold text-[#8F95A3] uppercase tracking-widest flex items-center gap-2">Leaderboard Name <span className="text-rose-500">*</span></label>
                        <input type="text" name="leaderboardName" required value={formData.leaderboardName} onChange={handleFormChange} placeholder="e.g. Daily Earnings Race" disabled={isReadOnly} className="w-full bg-[#0B0D14] border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-[#A66CFF] transition-all shadow-inner disabled:opacity-60" />
                      </div>
                      <div className="flex flex-col gap-2 md:col-span-2">
                        <label className="text-xs font-bold text-[#8F95A3] uppercase tracking-widest flex items-center gap-2">Description <span className="text-rose-500">*</span></label>
                        <textarea name="description" required rows={3} value={formData.description} onChange={handleFormChange} placeholder="e.g. Top earners win cash prizes..." disabled={isReadOnly} className="w-full bg-[#0B0D14] border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-[#A66CFF] transition-all shadow-inner resize-none custom-scrollbar disabled:opacity-60" />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-[#8F95A3] uppercase tracking-widest flex items-center gap-2">Leaderboard Type <span className="text-rose-500">*</span></label>
                        <div className="relative">
                          <select name="leaderboardType" value={formData.leaderboardType} onChange={handleFormChange} disabled={isReadOnly} className="w-full bg-[#0B0D14] border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-[#A66CFF] transition-all shadow-inner appearance-none cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed">
                            <option value="DAILY">Daily</option>
                            <option value="MONTHLY">Monthly</option>
                          </select>
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500 text-xs">▼</span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-[#8F95A3] uppercase tracking-widest flex items-center gap-2">Status (PUT Mode)</label>
                        <div className="relative">
                          <select name="status" value={formData.status} onChange={handleFormChange} disabled={isReadOnly} className="w-full bg-[#0B0D14] border border-white/10 rounded-xl px-4 py-3.5 text-sm font-bold focus:outline-none transition-all shadow-inner appearance-none cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed">
                            <option value="ACTIVE" className="text-emerald-400">ACTIVE</option>
                            <option value="INACTIVE" className="text-gray-400">INACTIVE</option>
                            <option value="UPCOMING" className="text-blue-400">UPCOMING</option>
                            {formData.status === 'ENDED' && <option value="ENDED" className="text-rose-400">ENDED</option>}
                          </select>
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500 text-xs">▼</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* TIMELINE CARD */}
                  <div className="bg-[#12141C] border border-white/5 rounded-3xl p-6 md:p-8 shadow-xl">
                    <h2 className="text-lg font-black text-white mb-6 flex items-center gap-2 border-b border-white/5 pb-4"><CalendarDays className="w-5 h-5 text-amber-400" /> Timeline Schedule</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-[#8F95A3] uppercase tracking-widest">Start Date & Time <span className="text-rose-500">*</span></label>
                        <input type="datetime-local" name="startDate" required value={formData.startDate} onChange={handleFormChange} disabled={isReadOnly} className="w-full bg-[#0B0D14] border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-[#A66CFF] disabled:opacity-60 [color-scheme:dark]" />
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-[#8F95A3] uppercase tracking-widest">End Date & Time <span className="text-rose-500">*</span></label>
                        <input type="datetime-local" name="endDate" required value={formData.endDate} onChange={handleFormChange} disabled={isReadOnly} className="w-full bg-[#0B0D14] border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-[#A66CFF] disabled:opacity-60 [color-scheme:dark]" />
                      </div>
                    </div>
                  </div>

                  {/* TARGETING CARD */}
                  <div className="bg-[#12141C] border border-white/5 rounded-3xl p-6 md:p-8 shadow-xl">
                    <h2 className="text-lg font-black text-white mb-6 flex items-center gap-2 border-b border-white/5 pb-4"><Target className="w-5 h-5 text-blue-400" /> Targeting & Restrictions</h2>
                    <div className="grid grid-cols-1 gap-6">
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-[#8F95A3] uppercase tracking-widest">Allowed Countries</label>
                        <div className="relative">
                          <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                          <input type="text" name="countries" value={targeting.countries} onChange={handleTargetingChange} placeholder="e.g. All OR US, UK, IN" disabled={isReadOnly} className="w-full bg-[#0B0D14] border border-white/10 rounded-xl pl-11 pr-4 py-3.5 text-sm text-white focus:outline-none focus:border-[#A66CFF] uppercase disabled:opacity-60" />
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-[#8F95A3] uppercase tracking-widest">Exclude Countries</label>
                        <div className="relative">
                          <Activity className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                          <input type="text" name="excludeCountries" value={targeting.excludeCountries} onChange={handleTargetingChange} placeholder="e.g. PK, BD" disabled={isReadOnly} className="w-full bg-[#0B0D14] border border-white/10 rounded-xl pl-11 pr-4 py-3.5 text-sm text-white focus:outline-none focus:border-[#A66CFF] uppercase disabled:opacity-60" />
                        </div>
                      </div>
                      <div className="flex flex-col gap-2 border-b border-white/5 pb-6">
                        <label className="text-xs font-bold text-[#8F95A3] uppercase tracking-widest">Exclude Specific Users (Bulk via PUT)</label>
                        <div className="relative">
                          <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                          <input type="text" name="excludeUsers" value={targeting.excludeUsers} onChange={handleTargetingChange} placeholder="e.g. 101, 102" disabled={isReadOnly} className="w-full bg-[#0B0D14] border border-white/10 rounded-xl pl-11 pr-4 py-3.5 text-sm text-white focus:outline-none focus:border-[#A66CFF] disabled:opacity-60" />
                        </div>
                      </div>

                      {/* 🔥 QUICK USER EXCLUSION (PATCH) 🔥 */}
                      {activeTab === 'edit' && (
                        <div className="flex flex-col gap-3 pt-2">
                          <label className="text-xs font-bold text-[#A66CFF] uppercase tracking-widest flex items-center gap-2">
                            <Users className="w-4 h-4" /> Quick Manage User Exclusion (Live)
                          </label>
                          <div className="flex gap-2">
                            <input 
                              type="number" value={quickUserId} onChange={(e) => setQuickUserId(e.target.value)} placeholder="User ID (e.g. 45)" 
                              className="w-[120px] bg-[#0B0D14] border border-white/10 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#A66CFF]" 
                            />
                            <button type="button" onClick={() => handleQuickExclusion('exclude')} disabled={!quickUserId || isQuickPatching} className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/20 px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50">
                              {isQuickPatching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserMinus className="w-3.5 h-3.5" />} Exclude
                            </button>
                            <button type="button" onClick={() => handleQuickExclusion('include')} disabled={!quickUserId || isQuickPatching} className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/20 px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50">
                              {isQuickPatching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserCheck className="w-3.5 h-3.5" />} Include
                            </button>
                          </div>
                          <span className="text-[10px] text-gray-500 italic">This patches the live leaderboard instantly without clicking "Save".</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* RIGHT COLUMN: PRIZE POOL */}
                <div className="w-full xl:w-[500px] flex flex-col gap-6">
                  <div className="bg-[#12141C] border border-white/5 rounded-3xl p-6 md:p-8 shadow-xl flex-1 flex flex-col">
                    <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-6">
                      <h2 className="text-lg font-black text-white flex items-center gap-2"><DollarSign className="w-5 h-5 text-emerald-400" /> Prize Distribution</h2>
                      {!isReadOnly && (
                        <button type="button" onClick={handleAddPrize} className="bg-white/5 hover:bg-white/10 text-emerald-400 border border-emerald-400/20 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer"><Plus className="w-3.5 h-3.5" /> Add Tier</button>
                      )}
                    </div>
                    <div className="flex flex-col gap-4 overflow-y-auto custom-scrollbar flex-1 pb-4">
                      <AnimatePresence>
                        {prizes.map((prize, idx) => (
                          <motion.div key={idx} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-[#0B0D14] border border-white/5 rounded-2xl p-4 relative group">
                            {!isReadOnly && prizes.length > 1 && (
                              <button type="button" onClick={() => handleRemovePrize(idx)} className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-rose-500 text-white flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-10 hover:bg-rose-600"><Trash2 className="w-3.5 h-3.5" /></button>
                            )}
                            <div className="grid grid-cols-2 gap-4">
                              <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Start Rank</label>
                                <input type="number" required min="1" disabled={isReadOnly} value={prize.startRank} onChange={(e) => handlePrizeChange(idx, 'startRank', e.target.value)} className="w-full bg-[#1A1C24] border border-white/5 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#A66CFF] disabled:opacity-60" />
                              </div>
                              <div className="flex flex-col gap-1.5">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">End Rank</label>
                                <input type="number" required min="1" disabled={isReadOnly} value={prize.endRank} onChange={(e) => handlePrizeChange(idx, 'endRank', e.target.value)} className="w-full bg-[#1A1C24] border border-white/5 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-[#A66CFF] disabled:opacity-60" />
                              </div>
                              <div className="flex flex-col gap-1.5 col-span-2">
                                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Cash Reward ($)</label>
                                <div className="relative">
                                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                                  <input type="number" step="any" required min="0" disabled={isReadOnly} value={prize.Cash} onChange={(e) => handlePrizeChange(idx, 'Cash', e.target.value)} className="w-full bg-[#1A1C24] border border-emerald-500/30 rounded-lg pl-9 pr-3 py-2.5 text-sm font-bold text-emerald-400 focus:outline-none focus:border-emerald-400 shadow-inner disabled:opacity-60" />
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                    {!isReadOnly && (
                      <div className="pt-6 border-t border-white/5 mt-auto">
                        <button type="submit" disabled={isSubmitting} className="w-full py-4 rounded-[16px] font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 transition-all cursor-pointer disabled:opacity-50 bg-gradient-to-r from-[#A66CFF] to-[#7C3AED] text-white shadow-[0_0_30px_rgba(166,108,255,0.3)] hover:shadow-[0_0_40px_rgba(166,108,255,0.5)] hover:-translate-y-1">
                          {isSubmitting ? <><Loader2 className="w-5 h-5 animate-spin" /> Saving...</> : <><Save className="w-5 h-5" /> Save Leaderboard</>}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

              </form>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================== */}
      {/* WINNERS MODAL OVERLAY */}
      {/* ========================================== */}
      <AnimatePresence>
        {isWinnersModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-[#12141C] border border-white/10 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
              <div className="p-5 border-b border-white/5 bg-[#161821] flex justify-between items-center shrink-0">
                <h2 className="text-lg font-black text-white flex items-center gap-2">
                  <Medal className="w-5 h-5 text-amber-400" /> Leaderboard Winners
                </h2>
                <button onClick={() => setIsWinnersModalOpen(false)} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="p-6 overflow-y-auto custom-scrollbar flex-1 bg-gradient-to-b from-white/[0.02] to-transparent">
                {isWinnersLoading ? (
                  <div className="py-20 flex flex-col items-center justify-center gap-3">
                     <Loader2 className="w-8 h-8 animate-spin text-amber-400" />
                     <span className="text-sm font-bold text-gray-400">Fetching frozen winners list...</span>
                  </div>
                ) : winnersList.length > 0 ? (
                  <div className="space-y-3">
                    {winnersList.map((winner, idx) => (
                      <div key={idx} className="flex items-center justify-between bg-[#0B0D14] border border-white/5 p-4 rounded-xl">
                         <div className="flex items-center gap-4">
                           <div className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center font-black border border-amber-500/20">
                             #{winner.rank || idx + 1}
                           </div>
                           <div className="flex flex-col">
                             <span className="font-bold text-white text-sm">User ID: {winner.userId || winner.user_id || 'Unknown'}</span>
                             {winner.creditedAt && <span className="text-[10px] text-gray-500 font-mono mt-0.5">Credited: {new Date(winner.creditedAt).toLocaleString()}</span>}
                           </div>
                         </div>
                         <div className="text-right">
                           <span className="text-emerald-400 font-black text-sm">${winner.prizeAmount ?? winner.amount ?? winner.prize ?? 0}</span>
                         </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-20 text-center flex flex-col items-center gap-3 opacity-50">
                    <Medal className="w-12 h-12 text-gray-500" />
                    <span className="text-sm font-bold text-gray-400">No winners found for this leaderboard.</span>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}