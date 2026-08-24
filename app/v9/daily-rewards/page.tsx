'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Gift, Settings, Save, RefreshCcw, Loader2, CheckCircle2, 
  XCircle, AlertCircle, CalendarDays, DollarSign, PlusCircle, 
  Activity, Target, ShieldAlert, Edit2, Trash2, X, Users, 
  Trophy, TrendingUp, AlertTriangle, Lock, Unlock, RotateCcw, Search
} from 'lucide-react';
import { useCurrency, formatPrice } from '@/hooks/useCurrency';

// --- UTILITY: Get Admin ID ---
function getAdminId(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('adminId') || localStorage.getItem('admin_id') || localStorage.getItem('userId') || '';
}

export default function DailyRewardsPage() {
  const currency = useCurrency();

  // --- TABS STATE ---
  const [activeTab, setActiveTab] = useState<'config' | 'users'>('config');

  // --- GLOBAL STATES ---
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [actionMsg, setActionMsg] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

  // ==========================================
  // TAB 1: CONFIGURATION STATES
  // ==========================================
  const [isConfigLoading, setIsConfigLoading] = useState(true);
  const [settings, setSettings] = useState({
    enabled: 'true', minimumEarning: '1', resetProgress: 'false', qualifiedSources: ''
  });
  const [rewardsList, setRewardsList] = useState<any[]>([]);
  
  const [isUpdatingSettings, setIsUpdatingSettings] = useState(false);
  const [settingsMsg, setSettingsMsg] = useState<{ text: string, type: 'success' | 'error' } | null>(null);
  const [isAddingReward, setIsAddingReward] = useState(false);
  const [newRewardParam, setNewRewardParam] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [editModalData, setEditModalData] = useState<{ day: number, rewardAmount: string } | null>(null);
  const [isUpdatingReward, setIsUpdatingReward] = useState(false);

  // ==========================================
  // TAB 2: USERS & DASHBOARD STATES
  // ==========================================
  const [isUsersLoading, setIsUsersLoading] = useState(false);
  const [dashboardStats, setDashboardStats] = useState({
    activeDailyRewardUsers: 0, highestActiveDailyReward: 0, rewardsDistributedToday: 0, usersLostDailyRewardToday: 0
  });
  const [rewardUsers, setRewardUsers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  // --- HELPER ---
  const showTemporaryMessage = (msg: { text: string, type: 'success' | 'error' }) => {
    setActionMsg(msg);
    setTimeout(() => setActionMsg(null), 3000);
  };

  // ==========================================
  // CONFIGURATION APIs
  // ==========================================
  const fetchConfigData = async () => {
    setIsConfigLoading(true);
    const token = localStorage.getItem('admin_token');
    try {
      const res = await fetch(`https://api.binnycash.com/api/admin/adminGetDailyReward`, {
        method: 'GET', headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
      });
      const json = await res.json().catch(() => null);
      if (res.ok && json?.code === 200 && json?.data) {
        const data = json.data;
        setSettings({
          enabled: data.enabled ? 'true' : 'false',
          minimumEarning: String(data.minimumEarning || '0'),
          resetProgress: data.resetProgress ? 'true' : 'false',
          qualifiedSources: Array.isArray(data.qualifiedSources) ? data.qualifiedSources.join(', ') : (data.qualifiedSources || '')
        });
        setRewardsList(data.rewards || []);
      }
    } catch (error) {
      setErrorMsg("Network error while fetching config data.");
    } finally {
      setIsConfigLoading(false);
    }
  };

  const handleUpdateSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingSettings(true);
    const token = localStorage.getItem('admin_token');
    try {
      const fd = new FormData();
      fd.append('enabled', settings.enabled);
      fd.append('minimumEarning', settings.minimumEarning);
      fd.append('resetProgress', settings.resetProgress);
      fd.append('qualifiedSources', settings.qualifiedSources);

      const res = await fetch(`https://api.binnycash.com/api/admin/adminUpdateDailyReward`, {
        method: 'PUT', headers: { 'Authorization': `Bearer ${token}` }, body: fd
      });
      const json = await res.json();
      if (res.ok || json?.code === 200) {
        setSettingsMsg({ text: json.message || "Settings updated!", type: 'success' });
        setTimeout(() => setSettingsMsg(null), 3000);
      } else {
        setSettingsMsg({ text: json.message || "Failed to update settings.", type: 'error' });
      }
    } catch (error) {
      setSettingsMsg({ text: "Network error.", type: 'error' });
    } finally {
      setIsUpdatingSettings(false);
    }
  };

  const handleAddNewReward = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRewardParam) return;
    setIsAddingReward(true);
    const token = localStorage.getItem('admin_token');
    try {
      const fd = new FormData();
      fd.append('reward', newRewardParam);
      const res = await fetch(`https://api.binnycash.com/api/admin/adminAddNewRewardDay`, {
        method: 'PUT', headers: { 'Authorization': `Bearer ${token}` }, body: fd
      });
      const json = await res.json();
      if (res.ok || json?.code === 200) {
        showTemporaryMessage({ text: json.message || "Reward day added!", type: 'success' });
        setNewRewardParam('');
        fetchConfigData(); 
      } else showTemporaryMessage({ text: json.message || "Failed to add.", type: 'error' });
    } catch (error) {
      showTemporaryMessage({ text: "Network error.", type: 'error' });
    } finally {
      setIsAddingReward(false);
    }
  };

  const submitUpdateReward = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editModalData) return;
    setIsUpdatingReward(true);
    const token = localStorage.getItem('admin_token');
    try {
      const fd = new FormData();
      fd.append('day', String(editModalData.day));
      fd.append('reward', editModalData.rewardAmount);
      const res = await fetch(`https://api.binnycash.com/api/admin/adminUpdateReward`, {
        method: 'PUT', headers: { 'Authorization': `Bearer ${token}` }, body: fd
      });
      const json = await res.json();
      if (res.ok || json?.code === 200) {
        showTemporaryMessage({ text: json.message || `Day updated!`, type: 'success' });
        setEditModalData(null);
        fetchConfigData(); 
      } else showTemporaryMessage({ text: json.message || "Failed to update.", type: 'error' });
    } catch (error) {
      showTemporaryMessage({ text: "Network error.", type: 'error' });
    } finally {
      setIsUpdatingReward(false);
    }
  };

  const handleDeleteLastDay = async () => {
    if (!confirm("Are you sure you want to delete the last reward day?")) return;
    setIsDeleting(true);
    const token = localStorage.getItem('admin_token');
    try {
      const res = await fetch(`https://api.binnycash.com/api/admin/adminDeleteRewardDay`, {
        method: 'PUT', headers: { 'Authorization': `Bearer ${token}` }
      });
      const json = await res.json();
      if (res.ok || json?.code === 200) {
        showTemporaryMessage({ text: json.message || "Last day deleted!", type: 'success' });
        fetchConfigData(); 
      } else showTemporaryMessage({ text: json.message || "Failed to delete.", type: 'error' });
    } catch (error) {
      showTemporaryMessage({ text: "Network error.", type: 'error' });
    } finally {
      setIsDeleting(false);
    }
  };

  // ==========================================
  // USERS & DASHBOARD APIs
  // ==========================================
  const fetchDashboardAndUsers = async () => {
    setIsUsersLoading(true);
    const token = localStorage.getItem('admin_token');
    
    try {
      // 1. Fetch Dashboard Stats[cite: 4]
      const dashRes = await fetch(`https://api.binnycash.com/api/admin/adminDailyRewardDashboard`, {
        method: 'GET', headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
      });
      const dashJson = await dashRes.json().catch(() => null);
      if (dashRes.ok && dashJson?.code === 200) {
        setDashboardStats(dashJson.data || { activeDailyRewardUsers: 0, highestActiveDailyReward: 0, rewardsDistributedToday: 0, usersLostDailyRewardToday: 0 });
      }

      // 2. Fetch Users List[cite: 3]
      const usersRes = await fetch(`https://api.binnycash.com/api/admin/adminGetDailyRewardUsers`, {
        method: 'GET', headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
      });
      const usersJson = await usersRes.json().catch(() => null);
      if (usersRes.ok && usersJson?.code === 200) {
        setRewardUsers(usersJson.data?.list || []);
      }
    } catch (error) {
      console.error("Failed to load dashboard/users data:", error);
    } finally {
      setIsUsersLoading(false);
    }
  };

  const handleLockToggle = async (userId: string | number) => {
    if (!confirm("Are you sure you want to toggle the lock status for this user?")) return;
    setActionLoadingId(`lock-${userId}`);
    const token = localStorage.getItem('admin_token');
    try {
      const fd = new FormData();
      fd.append('userId', String(userId)); //
      const res = await fetch(`https://api.binnycash.com/api/admin/dailyRewardLock`, {
        method: 'PUT', headers: { 'Authorization': `Bearer ${token}` }, body: fd
      });
      const json = await res.json();
      if (res.ok || json?.code === 200) {
        showTemporaryMessage({ text: json.message || "Lock status toggled!", type: 'success' });
        fetchDashboardAndUsers(); // Refresh list
      } else showTemporaryMessage({ text: json.message || "Action failed.", type: 'error' });
    } catch (err) {
      showTemporaryMessage({ text: "Network error.", type: 'error' });
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleResetUser = async (userId: string | number) => {
    if (!confirm("Are you sure you want to RESET this user's daily reward progress? This cannot be undone.")) return;
    setActionLoadingId(`reset-${userId}`);
    const token = localStorage.getItem('admin_token');
    try {
      const fd = new FormData();
      fd.append('userId', String(userId)); //
      const res = await fetch(`https://api.binnycash.com/api/admin/adminResetUserDailyReward`, {
        method: 'PUT', headers: { 'Authorization': `Bearer ${token}` }, body: fd
      });
      const json = await res.json();
      if (res.ok || json?.code === 200) {
        showTemporaryMessage({ text: json.message || "User progress reset!", type: 'success' });
        fetchDashboardAndUsers(); // Refresh list
      } else showTemporaryMessage({ text: json.message || "Action failed.", type: 'error' });
    } catch (err) {
      showTemporaryMessage({ text: "Network error.", type: 'error' });
    } finally {
      setActionLoadingId(null);
    }
  };

  // --- INITIAL LOAD ---
  useEffect(() => {
    fetchConfigData();
    fetchDashboardAndUsers();
  }, []);

  const handleSettingChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  const filteredUsers = rewardUsers.filter(u => {
    const q = searchQuery.toLowerCase();
    return String(u?.username || '').toLowerCase().includes(q) || 
           String(u?.email || '').toLowerCase().includes(q) || 
           String(u?.userId || '').includes(q);
  });

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
      className="flex flex-col gap-6 text-[#F5F3FF] w-full max-w-[1400px] mx-auto pb-10 font-sans"
    >
      {/* HEADER */}
      <div className="flex justify-between items-end border-b border-white/5 pb-5">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3 tracking-tight">
             <Gift className="w-8 h-8 text-[#A66CFF]" /> 
             Daily Rewards System
          </h1>
          <p className="text-sm text-[#8F95A3] mt-2">
            Configure global settings, manage streak sequence, and track user progress.
          </p>
        </div>
        <button 
          onClick={() => activeTab === 'config' ? fetchConfigData() : fetchDashboardAndUsers()} 
          className="flex items-center gap-2 bg-[#12141C] hover:bg-[#1A1C24] border border-white/5 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg cursor-pointer"
        >
          <RefreshCcw className="w-4 h-4" /> Reload Data
        </button>
      </div>

      {/* GLOBAL MESSAGES */}
      <AnimatePresence>
        {errorMsg && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="bg-rose-500/10 border border-rose-500/30 text-rose-400 p-4 rounded-xl flex items-center gap-3 shadow-lg">
            <ShieldAlert className="w-5 h-5 shrink-0" />
            <span className="text-sm font-bold">{errorMsg}</span>
          </motion.div>
        )}
        {actionMsg && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className={`p-4 rounded-xl flex items-center gap-3 shadow-lg border ${actionMsg.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border-rose-500/30 text-rose-400'}`}>
            {actionMsg.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <XCircle className="w-5 h-5 shrink-0" />}
            <span className="text-sm font-bold">{actionMsg.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* TABS NAVIGATION */}
      <div className="flex items-center gap-2 p-1.5 bg-[#12141C] rounded-2xl border border-white/5 w-fit shadow-lg">
        <button 
          onClick={() => setActiveTab('config')}
          className={`relative px-6 py-3 rounded-xl text-sm font-bold transition-all cursor-pointer flex items-center gap-2.5 ${activeTab === 'config' ? 'text-white' : 'text-[#8F95A3] hover:text-white hover:bg-white/5'}`}
        >
          {activeTab === 'config' && <motion.div layoutId="drTab" className="absolute inset-0 bg-[#1E212B] border border-white/10 rounded-xl shadow-md z-0" />}
          <Settings className="w-4 h-4 relative z-10"/> <span className="relative z-10">Configuration</span>
        </button>
        <button 
          onClick={() => setActiveTab('users')}
          className={`relative px-6 py-3 rounded-xl text-sm font-bold transition-all cursor-pointer flex items-center gap-2.5 ${activeTab === 'users' ? 'text-white' : 'text-[#8F95A3] hover:text-white hover:bg-white/5'}`}
        >
          {activeTab === 'users' && <motion.div layoutId="drTab" className="absolute inset-0 bg-[#1E212B] border border-white/10 rounded-xl shadow-md z-0" />}
          <Users className="w-4 h-4 relative z-10"/> <span className="relative z-10">Users & Analytics</span>
        </button>
      </div>

      {/* ========================================== */}
      {/* TAB 1: CONFIGURATION */}
      {/* ========================================== */}
      {activeTab === 'config' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          
          {/* LEFT: GENERAL SETTINGS FORM */}
          <div className="xl:col-span-4 flex flex-col gap-6">
            <div className="bg-[#12141C] border border-white/5 rounded-3xl p-7 shadow-2xl relative overflow-hidden">
              <h2 className="text-xl font-black text-white mb-6 flex items-center gap-2">
                <Settings className="w-5 h-5 text-[#A66CFF]" /> General Config
              </h2>
              {isConfigLoading ? (
                <div className="py-10 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-[#A66CFF]" /></div>
              ) : (
                <form onSubmit={handleUpdateSettings} className="flex flex-col gap-6 relative z-10">
                  {settingsMsg && (
                    <div className={`p-4 rounded-xl text-xs font-bold flex items-center gap-2 border ${settingsMsg.type === 'success' ? 'bg-[#00E57A]/10 text-[#00E57A] border-[#00E57A]/20' : 'bg-[#FF5D73]/10 text-[#FF5D73] border-[#FF5D73]/20'}`}>
                      {settingsMsg.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <XCircle className="w-4 h-4 shrink-0" />}
                      {settingsMsg.text}
                    </div>
                  )}

                  <div className="flex flex-col gap-2.5">
                    <label className="text-[11px] font-bold text-[#8F95A3] uppercase tracking-widest flex items-center gap-2">
                      <Activity className="w-4 h-4 text-emerald-400" /> System Status
                    </label>
                    <div className="relative group">
                      <select name="enabled" value={settings.enabled} onChange={handleSettingChange} className={`w-full border rounded-xl px-4 py-3 text-sm font-bold focus:outline-none transition-all appearance-none cursor-pointer shadow-inner ${settings.enabled === 'true' ? 'text-emerald-400 border-emerald-400/30 bg-emerald-400/5' : 'text-rose-400 border-rose-400/30 bg-rose-400/5'}`}>
                        <option value="true" className="bg-[#12141C] text-emerald-400">Enabled (Active)</option>
                        <option value="false" className="bg-[#12141C] text-rose-400">Disabled (Inactive)</option>
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#8F95A3] text-[10px]">▼</div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2.5">
                    <label className="text-[11px] font-bold text-[#8F95A3] uppercase tracking-widest flex items-center gap-2">
                      <Target className="w-4 h-4 text-amber-400" /> Minimum Earning Required
                    </label>
                    <div className="relative group">
                      <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8F95A3]" />
                      <input type="number" step="any" name="minimumEarning" required value={settings.minimumEarning} onChange={handleSettingChange} placeholder="e.g. 1" className="w-full bg-[#0B0D14] border border-white/5 rounded-xl pl-11 pr-4 py-3 text-sm text-white font-bold focus:outline-none focus:border-white/20 transition-all shadow-inner" />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2.5">
                    <label className="text-[11px] font-bold text-[#8F95A3] uppercase tracking-widest flex items-center gap-2">
                      <RefreshCcw className="w-4 h-4 text-blue-400" /> Reset on Missed Day
                    </label>
                    <div className="relative group">
                      <select name="resetProgress" value={settings.resetProgress} onChange={handleSettingChange} className={`w-full bg-[#0B0D14] border border-white/5 rounded-xl px-4 py-3 text-sm font-bold focus:outline-none transition-all appearance-none cursor-pointer shadow-inner ${settings.resetProgress === 'true' ? 'text-white' : 'text-[#8F95A3]'}`}>
                        <option value="true" className="bg-[#12141C] text-white">Yes, Reset Progress</option>
                        <option value="false" className="bg-[#12141C] text-[#8F95A3]">No, Keep Progress</option>
                      </select>
                      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#8F95A3] text-[10px]">▼</div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2.5">
                    <label className="text-[11px] font-bold text-[#8F95A3] uppercase tracking-widest flex items-center gap-2">
                      <Target className="w-4 h-4 text-pink-400" /> Qualified Sources (Comma Separated)
                    </label>
                    <textarea name="qualifiedSources" required rows={3} value={settings.qualifiedSources} onChange={handleSettingChange} placeholder="Offer, Offerwall, Survey..." className="w-full bg-[#0B0D14] border border-white/5 rounded-xl px-4 py-3 text-sm text-white font-medium focus:outline-none focus:border-white/20 transition-all shadow-inner resize-none leading-relaxed" />
                  </div>

                  <button type="submit" disabled={isUpdatingSettings} className="mt-2 w-full py-4 rounded-xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 bg-[#A66CFF] hover:bg-[#8B5CF6] text-white shadow-[0_0_20px_rgba(166,108,255,0.3)] hover:shadow-[0_0_30px_rgba(166,108,255,0.5)]">
                    {isUpdatingSettings ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />} Save Settings
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* RIGHT: REWARDS TIMELINE & ADD NEW */}
          <div className="xl:col-span-8 flex flex-col gap-6">
            <div className="bg-[#12141C] border border-white/5 rounded-3xl p-8 shadow-2xl relative">
              <h2 className="text-xl font-black text-white mb-6 flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-[#00E57A]" /> Daily Reward Sequence
              </h2>
              {isConfigLoading ? (
                <div className="py-10 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto text-[#00E57A]" /></div>
              ) : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {rewardsList.map((reward, idx) => (
                      <div key={idx} onClick={() => setEditModalData({ day: reward.rewardDay, rewardAmount: String(reward.rewardAmount) })} className="bg-[#0B0D14] border border-white/5 rounded-2xl p-5 flex items-center justify-between shadow-inner hover:border-white/10 hover:bg-white/[0.02] transition-colors cursor-pointer group" title="Click to Edit Reward">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-full bg-[#00E57A]/10 border border-[#00E57A]/30 flex items-center justify-center text-[#00E57A] font-black text-lg shadow-[0_0_15px_rgba(0,229,122,0.1)]">{reward.rewardDay}</div>
                          <div className="flex flex-col gap-0.5">
                            <span className="text-[10px] text-[#8F95A3] font-bold uppercase tracking-widest flex items-center gap-2">Reward Day <Edit2 className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-[#A66CFF]" /></span>
                            <span className="text-2xl font-black text-white tracking-wide">{formatPrice(Number(reward.rewardAmount || 0), currency)}</span>
                          </div>
                        </div>
                        <div>
                          {reward.isActive ? <span className="bg-[#00E57A]/10 text-[#00E57A] px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-wider">Active</span> : <span className="bg-rose-500/10 text-rose-400 px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-wider">Inactive</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                  {rewardsList.length === 0 && (
                    <div className="py-10 text-center">
                       <CalendarDays className="w-12 h-12 text-white/10 mx-auto mb-3" />
                       <p className="text-[#8F95A3] font-bold">No reward sequence configured yet.</p>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="bg-[#12141C] border border-white/5 rounded-3xl p-8 shadow-xl">
               <div className="flex items-center justify-between mb-5">
                 <h3 className="text-lg font-black text-white flex items-center gap-2"><PlusCircle className="w-5 h-5 text-[#5EA8FF]" /> Add Next Reward Day</h3>
                 <button onClick={handleDeleteLastDay} disabled={isDeleting || rewardsList.length === 0} className="flex items-center gap-2 text-rose-400 hover:text-rose-300 text-xs font-bold uppercase tracking-widest transition-colors disabled:opacity-50">
                   {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />} Remove Last Day
                 </button>
               </div>
               <form onSubmit={handleAddNewReward} className="flex flex-col sm:flex-row gap-4">
                 <div className="relative flex-1 group">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8F95A3] group-focus-within:text-[#5EA8FF] transition-colors" />
                    <input type="number" step="any" required min="0.01" value={newRewardParam} onChange={(e) => setNewRewardParam(e.target.value)} placeholder="Enter Reward Amount..." className="w-full bg-[#0B0D14] border border-white/5 rounded-2xl pl-12 pr-5 py-4 text-sm text-white font-bold focus:outline-none focus:border-[#5EA8FF] transition-all shadow-inner" />
                 </div>
                 <button type="submit" disabled={isAddingReward} className="px-8 py-4 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50 bg-gradient-to-r from-[#5EA8FF] to-[#3B82F6] text-white shadow-[0_0_20px_rgba(94,168,255,0.3)] hover:shadow-[0_0_30px_rgba(94,168,255,0.5)] whitespace-nowrap">
                   {isAddingReward ? <Loader2 className="w-4 h-4 animate-spin" /> : <PlusCircle className="w-4 h-4" />} Add Day
                 </button>
               </form>
            </div>
          </div>
        </motion.div>
      )}

      {/* ========================================== */}
      {/* TAB 2: USERS & ANALYTICS */}
      {/* ========================================== */}
      {activeTab === 'users' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-6">
          
          {/* DASHBOARD STATS */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-[#12141C] to-[#0B0D14] border border-white/5 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-[#00E57A]/10 flex items-center justify-center text-[#00E57A]"><Users className="w-5 h-5" /></div>
                <Activity className="w-4 h-4 text-gray-500 opacity-50" />
              </div>
              <div>
                <span className="text-3xl font-black text-white">{isUsersLoading ? '...' : dashboardStats.activeDailyRewardUsers}</span>
                <p className="text-[10px] text-[#8F95A3] font-bold uppercase tracking-widest mt-1">Active Streak Users</p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#12141C] to-[#0B0D14] border border-white/5 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-[#A66CFF]/10 flex items-center justify-center text-[#A66CFF]"><Trophy className="w-5 h-5" /></div>
                <Activity className="w-4 h-4 text-gray-500 opacity-50" />
              </div>
              <div>
                <span className="text-3xl font-black text-white">{isUsersLoading ? '...' : dashboardStats.highestActiveDailyReward}</span>
                <p className="text-[10px] text-[#8F95A3] font-bold uppercase tracking-widest mt-1">Highest Active Day</p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#12141C] to-[#0B0D14] border border-white/5 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-amber-400/10 flex items-center justify-center text-amber-400"><TrendingUp className="w-5 h-5" /></div>
                <Activity className="w-4 h-4 text-gray-500 opacity-50" />
              </div>
              <div>
                <span className="text-3xl font-black text-white">{isUsersLoading ? '...' : dashboardStats.rewardsDistributedToday}</span>
                <p className="text-[10px] text-[#8F95A3] font-bold uppercase tracking-widest mt-1">Rewards Distributed Today</p>
              </div>
            </div>

            <div className="bg-gradient-to-br from-[#12141C] to-[#0B0D14] border border-white/5 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-rose-400/10 flex items-center justify-center text-rose-400"><AlertTriangle className="w-5 h-5" /></div>
                <Activity className="w-4 h-4 text-gray-500 opacity-50" />
              </div>
              <div>
                <span className="text-3xl font-black text-white">{isUsersLoading ? '...' : dashboardStats.usersLostDailyRewardToday}</span>
                <p className="text-[10px] text-[#8F95A3] font-bold uppercase tracking-widest mt-1">Users Lost Streak Today</p>
              </div>
            </div>
          </div>

          {/* SEARCH BAR */}
          <div className="bg-[#12141C] p-5 rounded-2xl border border-white/5 shadow-lg flex items-center gap-4">
            <div className="relative flex-1 max-w-md group">
               <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8F95A3] group-focus-within:text-[#A66CFF] transition-colors" />
               <input 
                 type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                 placeholder="Search by Username, Email or ID..." 
                 className="w-full bg-[#0B0D14] border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-white font-medium focus:outline-none focus:border-[#A66CFF] transition-all shadow-inner"
               />
            </div>
          </div>

          {/* USERS TABLE */}
          <div className="bg-[#12141C] border border-white/5 rounded-3xl overflow-hidden shadow-2xl min-h-[500px]">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse whitespace-nowrap min-w-[1000px]">
                <thead>
                  <tr className="bg-[#0B0D14] border-b border-white/[0.05]">
                    <th className="py-5 px-6 text-[11px] font-black text-[#8F95A3] uppercase tracking-widest">User Info</th>
                    <th className="py-5 px-6 text-[11px] font-black text-[#8F95A3] uppercase tracking-widest">Current Reward</th>
                    <th className="py-5 px-6 text-[11px] font-black text-[#8F95A3] uppercase tracking-widest w-[250px]">Today's Progress</th>
                    <th className="py-5 px-6 text-[11px] font-black text-[#8F95A3] uppercase tracking-widest text-center">Status</th>
                    <th className="py-5 px-6 text-[11px] font-black text-[#8F95A3] uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.05] text-sm">
                  {isUsersLoading ? (
                    <tr>
                      <td colSpan={5} className="py-32 text-center">
                        <Loader2 className="w-10 h-10 animate-spin mx-auto text-[#00E57A]" />
                        <p className="text-[#8F95A3] mt-4 font-medium text-sm tracking-widest uppercase">Fetching Reward Users...</p>
                      </td>
                    </tr>
                  ) : filteredUsers.length > 0 ? (
                    filteredUsers.map((u: any, idx: number) => {
                      const progressPct = u?.todayProgress?.percentage || 0;
                      return (
                        <tr key={u.userId || idx} className="hover:bg-white/[0.02] transition-colors group">
                          
                          {/* USER INFO */}
                          <td className="py-5 px-6">
                            <div className="flex flex-col gap-1">
                              <span className="text-white font-black text-base">{u.username || 'Unknown'}</span>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-[#8F95A3]">{u.email || 'N/A'}</span>
                                <span className="bg-white/5 text-white/50 px-1.5 py-0.5 rounded text-[10px] font-mono border border-white/10">ID: {u.userId}</span>
                              </div>
                            </div>
                          </td>

                          {/* CURRENT REWARD */}
                          <td className="py-5 px-6">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-lg bg-[#00E57A]/10 text-[#00E57A] flex items-center justify-center border border-[#00E57A]/30">
                                <Gift className="w-4 h-4" />
                              </div>
                              <span className="font-bold text-white tracking-wide">{u.currentDailyReward || `Day ${u.rewardDay}`}</span>
                            </div>
                          </td>

                          {/* PROGRESS BAR */}
                          <td className="py-5 px-6">
                            <div className="flex flex-col gap-2 w-full max-w-[200px]">
                              <div className="flex items-center justify-between text-[11px] font-bold">
                                <span className="text-[#8F95A3]">Requirement</span>
                                <span className="text-white">{u?.todayProgress?.display || '0/0'}</span>
                              </div>
                              <div className="w-full h-2 bg-[#0B0D14] rounded-full overflow-hidden border border-white/5">
                                <div 
                                  className="h-full bg-gradient-to-r from-[#5EA8FF] to-[#A66CFF] transition-all duration-500"
                                  style={{ width: `${Math.min(100, Math.max(0, progressPct))}%` }}
                                ></div>
                              </div>
                            </div>
                          </td>

                          {/* STATUS */}
                          <td className="py-5 px-6 text-center">
                            <div className="flex flex-col items-center gap-1.5">
                              {u.dailyRewardStatus === 'ACTIVE' ? (
                                 <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider">Active</span>
                              ) : (
                                 <span className="bg-rose-500/10 text-rose-400 border border-rose-500/30 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider">Inactive</span>
                              )}
                              
                              {u.isLocked && (
                                <span className="flex items-center gap-1 text-[10px] font-bold text-amber-400">
                                  <Lock className="w-3 h-3" /> Locked
                                </span>
                              )}
                            </div>
                          </td>

                          {/* ACTIONS */}
                          <td className="py-5 px-6 text-right">
                            <div className="flex items-center justify-end gap-2.5">
                              {/* Toggle Lock Button */}
                              <button 
                                onClick={() => handleLockToggle(u.userId)}
                                disabled={actionLoadingId === `lock-${u.userId}`}
                                className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-colors cursor-pointer disabled:opacity-50 ${u.isLocked ? 'border-amber-500/30 text-amber-500 hover:bg-amber-500/10' : 'border-[#5EA8FF]/30 text-[#5EA8FF] hover:bg-[#5EA8FF]/10'}`}
                                title={u.isLocked ? "Unlock User" : "Lock User"}
                              >
                                {actionLoadingId === `lock-${u.userId}` ? <Loader2 className="w-4 h-4 animate-spin" /> : u.isLocked ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                              </button>
                              
                              {/* Reset Progress Button */}
                              <button 
                                onClick={() => handleResetUser(u.userId)}
                                disabled={actionLoadingId === `reset-${u.userId}`}
                                className="w-9 h-9 rounded-xl border border-rose-500/30 text-rose-500 flex items-center justify-center hover:bg-rose-500/10 transition-colors cursor-pointer disabled:opacity-50"
                                title="Reset User Progress"
                              >
                                {actionLoadingId === `reset-${u.userId}` ? <Loader2 className="w-4 h-4 animate-spin" /> : <RotateCcw className="w-4 h-4" />}
                              </button>
                            </div>
                          </td>

                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td colSpan={5} className="py-32 text-center">
                        <Users className="w-16 h-16 mx-auto text-[#8F95A3] mb-5 opacity-20" />
                        <p className="font-bold text-[#8F95A3] tracking-wide">No reward users found.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}

      {/* --- EDIT REWARD MODAL (CONFIG TAB) --- */}
      <AnimatePresence>
        {editModalData && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-[#050409]/90 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-[#12141C] border border-white/10 w-full max-w-sm rounded-[32px] shadow-2xl relative flex flex-col overflow-hidden"
            >
              <div className="bg-[#1A1C24] border-b border-white/5 px-8 py-6 flex items-center justify-between">
                <h3 className="text-xl font-black flex items-center gap-3 tracking-tight text-white">
                  <Edit2 className="w-5 h-5 text-[#A66CFF]" /> Edit Day {editModalData.day}
                </h3>
                <button onClick={() => setEditModalData(null)} className="text-[#8F95A3] hover:text-white transition-colors cursor-pointer w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={submitUpdateReward} className="p-8 flex flex-col gap-6">
                <div className="flex flex-col gap-2.5">
                  <label className="text-xs font-bold text-[#8F95A3] uppercase tracking-widest">Reward Amount</label>
                  <div className="relative group">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8F95A3]" />
                    <input 
                      type="number" step="any" required min="0.01"
                      value={editModalData.rewardAmount}
                      onChange={(e) => setEditModalData({ ...editModalData, rewardAmount: e.target.value })}
                      className="w-full bg-[#0B0D14] rounded-2xl pl-12 pr-5 py-4 text-white font-black text-lg focus:outline-none transition-all shadow-inner border border-transparent focus:border-[#A66CFF]/50" 
                    />
                  </div>
                </div>

                <button 
                  type="submit" disabled={isUpdatingReward}
                  className="w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 transition-all cursor-pointer disabled:opacity-50 bg-[#A66CFF] hover:bg-[#8B5CF6] text-white shadow-[0_0_25px_rgba(166,108,255,0.4)]"
                >
                  {isUpdatingReward ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Update Reward'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}