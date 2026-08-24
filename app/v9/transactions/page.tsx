'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CreditCard, RefreshCcw, Loader2, CheckCircle2, 
  XCircle, Clock, AlertCircle, 
  Search, ArrowRightLeft, DollarSign, Trophy, Users, CheckSquare, Activity, ChevronDown
} from 'lucide-react';
import { useCurrency, formatPrice } from '@/hooks/useCurrency';

type TabType = 'requests' | 'user-withdraws' | 'approved' | 'top-earners';

// --- UTILITY: Get Admin ID ---
function getAdminId(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('adminId') || localStorage.getItem('admin_id') || localStorage.getItem('userId') || '';
}

export default function AdminTransactionsPage() {
  const currency = useCurrency();

  const [activeTab, setActiveTab] = useState<TabType>('requests');
  const [transactions, setTransactions] = useState<any[]>([]); 
  const [userWithdraws, setUserWithdraws] = useState<any[]>([]); 
  const [approvedWithdraws, setApprovedWithdraws] = useState<any[]>([]); 
  const [topEarners, setTopEarners] = useState<any[]>([]); 
  const [usersList, setUsersList] = useState<any[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // Custom Dropdown State
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // --- API CALLS ---
  const fetchUsers = async () => {
    const token = localStorage.getItem('admin_token');
    const adminId = getAdminId();
    try {
      const res = await fetch(`https://api.binnycash.com/api/admin/userList?adminId=${adminId}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
      });
      const json = await res.json().catch(() => null);
      if (res.ok && json?.code === 200) {
        setUsersList(Array.isArray(json.data) ? json.data : (json.data?.list || []));
      }
    } catch (error) {
      console.error("Failed to fetch users", error);
    }
  };

  const fetchData = async (tab: TabType, query: string = '') => {
    setIsLoading(true);
    setErrorMsg(null);
    const token = localStorage.getItem('admin_token');
    const adminId = getAdminId();

    let endpoint = '';
    let method = 'GET';

    if (tab === 'requests') {
      endpoint = 'withdraw-request-list';
    }
    if (tab === 'user-withdraws') {
      endpoint = 'user-withdraw-list';
      if (query) endpoint += `?userId=${encodeURIComponent(query)}`;
    }
    if (tab === 'approved') {
      endpoint = 'approved-withdraw-list';
      if (query) endpoint += `?userId=${encodeURIComponent(query)}`;
    }
    if (tab === 'top-earners') {
      endpoint = 'top-earners';
    }

    try {
      let url = `https://api.binnycash.com/api/admin/user-balance/${endpoint}`;
      url += url.includes('?') ? `&adminId=${adminId}` : `?adminId=${adminId}`;

      const res = await fetch(url, {
        method,
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
      });
      const json = await res.json().catch(() => null);

      if (res.ok && json?.code === 200) {
        const dataPayload = json.data;
        let dataList: any[] = [];
        if (Array.isArray(dataPayload)) dataList = dataPayload;
        else if (dataPayload?.responseResult) dataList = dataPayload.responseResult;
        else if (dataPayload?.list) dataList = dataPayload.list;
        
        if (tab === 'requests') setTransactions(dataList);
        if (tab === 'user-withdraws') setUserWithdraws(dataList);
        if (tab === 'approved') setApprovedWithdraws(dataList);
        if (tab === 'top-earners') setTopEarners(dataList);
      } else {
        if (tab === 'requests') setTransactions([]);
        if (tab === 'user-withdraws') setUserWithdraws([]);
        if (tab === 'approved') setApprovedWithdraws([]);
        if (tab === 'top-earners') setTopEarners([]);
      }
    } catch (err) {
      setErrorMsg(`Failed to fetch data for ${tab.replace('-', ' ')}`);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { 
    fetchUsers(); 
  }, []);

  useEffect(() => {
    if ((activeTab === 'approved' || activeTab === 'user-withdraws') && !searchQuery) { 
      if (activeTab === 'approved') setApprovedWithdraws([]); 
      if (activeTab === 'user-withdraws') setUserWithdraws([]); 
      return; 
    }
    fetchData(activeTab, searchQuery);
  }, [activeTab]);

  // --- HANDLERS ---
  const handleUserSelect = (val: string) => {
    setSearchQuery(val); 
    if (val) {
      fetchData(activeTab, val); 
    } else {
      if (activeTab === 'approved') setApprovedWithdraws([]);
      if (activeTab === 'user-withdraws') setUserWithdraws([]);
    }
  };

  const handleStatusUpdate = async (transactionId: string, action: 'approve' | 'decline' | 'processing') => {
    if (!confirm(`Are you sure you want to mark this as ${action.toUpperCase()}?`)) return;
    setActionLoadingId(transactionId);
    const token = localStorage.getItem('admin_token');
    const adminId = getAdminId();

    let endpoint = '';
    if (action === 'approve') endpoint = 'approve-amount';
    if (action === 'decline') endpoint = 'decline-amount';
    if (action === 'processing') endpoint = 'processing-amount';

    try {
      const fd = new URLSearchParams();
      fd.append('transactionId', transactionId);
      fd.append('adminId', adminId); 

      const res = await fetch(`https://api.binnycash.com/api/admin/user-balance/${endpoint}`, {
        method: 'PUT', 
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/x-www-form-urlencoded' },
        body: fd
      });

      const json = await res.json();
      if (res.ok) {
        fetchData(activeTab, searchQuery); 
      } else {
        alert(json.message || `Failed to update status.`);
      }
    } catch (error) {
      alert("Network error.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const renderDate = (dateString: string) => {
    if (!dateString || dateString === '-') return 'N/A';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleString('en-US', { 
      year: 'numeric', month: 'numeric', day: 'numeric', 
      hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: true 
    });
  };

  const getFilteredList = (list: any[]) => {
    if (activeTab === 'approved' || activeTab === 'user-withdraws' || activeTab === 'top-earners') return list; 
    return list.filter((t: any) => {
      const q = searchQuery.toLowerCase();
      const txnId = String(t?.transactionId || t?._id || '').toLowerCase();
      const uId = String(t?.userId || '').toLowerCase();
      const upi = String(t?.upi || '').toLowerCase();
      return txnId.includes(q) || uId.includes(q) || upi.includes(q);
    });
  };

  const currentList = 
    activeTab === 'requests' ? transactions : 
    activeTab === 'user-withdraws' ? userWithdraws : 
    activeTab === 'approved' ? approvedWithdraws : topEarners;

  const displayList = getFilteredList(currentList);

  // Helper for Custom Dropdown Label
  const selectedUserObj = usersList.find((u: any) => (u.id || u._id) === searchQuery);
  const displayLabel = selectedUserObj ? `${selectedUserObj.name || selectedUserObj.userName} (ID: ${selectedUserObj.id || selectedUserObj._id})` : '-- Select a User --';

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col gap-6 text-[#F5F3FF] w-full max-w-[1600px] mx-auto pb-10 font-sans relative"
    >
      
      {/* HEADER SECTION */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3 tracking-tight">
             <CreditCard className="w-8 h-8 text-[#00E57A]" /> 
             Transactions & Balances
          </h1>
          <p className="text-sm text-[#8F95A3] mt-2">
            Manage cashouts, view user history, and track top earners dynamically.
          </p>
        </div>
        <button 
          onClick={() => { fetchUsers(); fetchData(activeTab, searchQuery); }} 
          disabled={isLoading}
          className="flex items-center gap-2 bg-[#12141C] hover:bg-[#1A1C24] border border-white/10 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg hover:shadow-xl hover:-translate-y-0.5 disabled:opacity-50 cursor-pointer"
        >
          <RefreshCcw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} /> 
          Refresh Data
        </button>
      </div>

      {/* ERROR MESSAGE */}
      <AnimatePresence>
        {errorMsg && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl flex items-center gap-3 overflow-hidden"
          >
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span className="text-sm font-bold">{errorMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* DASHBOARD STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-[#12141C] to-[#0B0D14] border border-white/5 rounded-2xl p-6 shadow-xl flex items-center gap-5 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#8B5CF6]/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border bg-[#8B5CF6]/10 border-[#8B5CF6]/30 shadow-[0_0_15px_rgba(139,92,246,0.2)]">
            <Users className="w-7 h-7 text-[#8B5CF6]" />
          </div>
          <div className="flex flex-col z-10">
            <span className="text-[11px] text-[#8F95A3] font-bold uppercase tracking-widest">Total Users</span>
            <span className="text-3xl font-black text-white mt-1">{usersList.length || 0}</span>
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-[#12141C] to-[#0B0D14] border border-white/5 rounded-2xl p-6 shadow-xl flex items-center gap-5 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border bg-amber-500/10 border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
            <Clock className="w-7 h-7 text-amber-400" />
          </div>
          <div className="flex flex-col z-10">
            <span className="text-[11px] text-[#8F95A3] font-bold uppercase tracking-widest">Pending Withdrawals</span>
            <span className="text-3xl font-black text-white mt-1">{transactions.length || 0}</span>
          </div>
        </motion.div>

        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="bg-gradient-to-br from-[#12141C] to-[#0B0D14] border border-white/5 rounded-2xl p-6 shadow-xl flex items-center gap-5 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#00E57A]/5 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border bg-[#00E57A]/10 border-[#00E57A]/30 shadow-[0_0_15px_rgba(0,229,122,0.2)]">
            <Activity className="w-7 h-7 text-[#00E57A]" />
          </div>
          <div className="flex flex-col z-10">
            <span className="text-[11px] text-[#8F95A3] font-bold uppercase tracking-widest">All Withdraws</span>
            <span className="text-3xl font-black text-white mt-1">{(userWithdraws.length || approvedWithdraws.length) > 0 ? 'Selected' : '...'}</span>
          </div>
        </motion.div>
      </div>

      {/* TABS NAVIGATION */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-[#12141C] rounded-2xl border border-white/5 w-fit mt-4 shadow-lg">
        {(['requests', 'user-withdraws', 'approved', 'top-earners'] as TabType[]).map((tab) => {
          const icons = { 'requests': Clock, 'user-withdraws': Users, 'approved': CheckSquare, 'top-earners': Trophy };
          const Icon = icons[tab];
          const isActive = activeTab === tab;
          
          return (
            <button 
              key={tab}
              onClick={() => { setActiveTab(tab); setSearchQuery(''); setIsDropdownOpen(false); }} 
              className={`relative px-6 py-3 rounded-xl text-sm font-bold transition-all cursor-pointer flex items-center gap-2.5 capitalize ${
                isActive ? 'text-white' : 'text-[#8F95A3] hover:text-white hover:bg-white/5'
              }`}
            >
              {isActive && (
                <motion.div 
                  layoutId="activeTabIndicator"
                  className="absolute inset-0 bg-[#1E212B] border border-white/10 rounded-xl shadow-md z-0"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <Icon className="w-4 h-4 relative z-10"/> 
              <span className="relative z-10">{tab.replace('-', ' ')}</span>
            </button>
          );
        })}
      </div>

      {/* SEARCH / CUSTOM USER SELECTOR */}
      {activeTab !== 'top-earners' && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap items-center gap-4 bg-[#12141C] p-5 rounded-2xl border border-white/5 shadow-lg"
        >
          <div className="relative flex-1 min-w-[250px] max-w-md flex gap-2">
             
             {(activeTab === 'approved' || activeTab === 'user-withdraws') ? (
               // 🔥 COMPLETELY CUSTOM PREMIUM DROPDOWN 🔥
               <div className="relative flex-1 group">
                 <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8F95A3] group-focus-within:text-[#8B5CF6] transition-colors z-10" />
                 
                 {/* Trigger Button */}
                 <div 
                   onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                   className={`w-full bg-[#0B0D14] border rounded-xl pl-11 pr-5 py-3.5 text-sm font-medium transition-all cursor-pointer shadow-inner flex items-center justify-between ${isDropdownOpen ? 'border-[#8B5CF6] text-white' : 'border-white/10 text-white hover:border-white/20'}`}
                 >
                   <span className="truncate pr-4">{displayLabel}</span>
                   <ChevronDown className={`w-4 h-4 text-[#8F95A3] transition-transform duration-300 ${isDropdownOpen ? 'rotate-180 text-[#8B5CF6]' : ''}`} />
                 </div>

                 {/* Dropdown Menu Overlay & List */}
                 <AnimatePresence>
                   {isDropdownOpen && (
                     <>
                       {/* Invisible overlay to close dropdown when clicking outside */}
                       <div className="fixed inset-0 z-40" onClick={() => setIsDropdownOpen(false)} />
                       
                       <motion.div
                         initial={{ opacity: 0, y: 10, scale: 0.98 }}
                         animate={{ opacity: 1, y: 0, scale: 1 }}
                         exit={{ opacity: 0, y: 10, scale: 0.98 }}
                         transition={{ duration: 0.2 }}
                         className="absolute top-full mt-3 left-0 w-full bg-[#161821] border border-[#8B5CF6]/30 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.5)] z-50 max-h-[300px] overflow-y-auto custom-scrollbar py-2"
                       >
                         {/* Default Empty Option */}
                         <div 
                           onClick={() => { handleUserSelect(''); setIsDropdownOpen(false); }}
                           className={`px-4 py-3 text-sm cursor-pointer transition-colors border-b border-white/5 ${!searchQuery ? 'bg-[#8B5CF6]/10 text-[#8B5CF6] font-bold' : 'text-[#8F95A3] hover:bg-white/5 hover:text-white'}`}
                         >
                           -- Select a User --
                         </div>

                         {/* User List Options */}
                         {usersList.map((u: any, idx: number) => {
                           const uid = u.id || u._id;
                           const isSelected = searchQuery === uid;
                           return (
                             <div 
                               key={uid || idx}
                               onClick={() => { handleUserSelect(uid); setIsDropdownOpen(false); }}
                               className={`px-4 py-3 text-sm cursor-pointer transition-colors flex items-center justify-between ${isSelected ? 'bg-[#8B5CF6]/10 text-[#8B5CF6] font-bold' : 'text-white hover:bg-white/5'}`}
                             >
                               <span className="truncate pr-3">{u.name || u.userName || 'Unnamed'}</span>
                               <span className={`text-[10px] font-mono px-2 py-0.5 rounded shrink-0 ${isSelected ? 'bg-[#8B5CF6]/20 text-[#8B5CF6]' : 'bg-black/30 text-[#8F95A3]'}`}>
                                 ID: {uid}
                               </span>
                             </div>
                           );
                         })}
                       </motion.div>
                     </>
                   )}
                 </AnimatePresence>
               </div>
             ) : (
               <div className="relative flex-1 group">
                 <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8F95A3] group-focus-within:text-[#00E57A] transition-colors" />
                 <input 
                   type="text" 
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                   placeholder="Search ID, User, or UPI..." 
                   className="w-full bg-[#0B0D14] border border-white/10 rounded-xl pl-11 pr-4 py-3.5 text-sm text-white font-medium focus:outline-none focus:border-[#00E57A] transition-all shadow-inner"
                 />
               </div>
             )}
          </div>
        </motion.div>
      )}

      {/* MAIN DATA TABLE */}
      <div className="bg-[#12141C] border border-white/5 rounded-3xl overflow-hidden shadow-2xl min-h-[500px]">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse whitespace-nowrap min-w-[900px]">
            
            <thead>
              <tr className="bg-[#0B0D14] border-b border-white/[0.05]">
                {activeTab === 'top-earners' ? (
                  <>
                    <th className="py-5 px-5 text-[11px] font-black text-[#8F95A3] uppercase tracking-widest text-left">User ID</th>
                    <th className="py-5 px-5 text-[11px] font-black text-[#8F95A3] uppercase tracking-widest text-left">Username</th>
                    <th className="py-5 px-5 text-[11px] font-black text-[#8F95A3] uppercase tracking-widest text-right">Total Withdraw</th>
                    <th className="py-5 px-5 text-[11px] font-black text-[#8F95A3] uppercase tracking-widest text-right">Total Earnings</th>
                    <th className="py-5 px-5 text-[11px] font-black text-[#8F95A3] uppercase tracking-widest text-right">Last Activity</th>
                  </>
                ) : (
                  <>
                    <th className="py-5 px-5 text-[11px] font-black text-[#8F95A3] uppercase tracking-widest text-left">Transaction ID</th>
                    <th className="py-5 px-5 text-[11px] font-black text-[#8F95A3] uppercase tracking-widest text-left">User Details</th>
                    <th className="py-5 px-5 text-[11px] font-black text-[#8F95A3] uppercase tracking-widest text-left">Payment Info</th>
                    <th className="py-5 px-5 text-[11px] font-black text-[#8F95A3] uppercase tracking-widest text-left">Amount</th>
                    <th className="py-5 px-5 text-[11px] font-black text-[#8F95A3] uppercase tracking-widest text-center">Status</th>
                    {activeTab === 'requests' && (
                      <th className="py-5 px-5 text-[11px] font-black text-[#8F95A3] uppercase tracking-widest text-center">Actions</th>
                    )}
                  </>
                )}
              </tr>
            </thead>

            <tbody className="divide-y divide-white/[0.05] text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-32 text-center">
                    <Loader2 className="w-10 h-10 animate-spin mx-auto text-[#00E57A]" />
                    <p className="text-[#8F95A3] mt-4 font-medium text-sm tracking-widest uppercase">Fetching Records...</p>
                  </td>
                </tr>
              ) : displayList.length > 0 ? (
                
                <AnimatePresence>
                  {displayList.map((item: any, idx: number) => {
                    
                    if (activeTab === 'top-earners') {
                      return (
                        <motion.tr 
                          key={item?.userId || idx} 
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className="hover:bg-white/[0.02] transition-colors group"
                        >
                          <td className="py-5 px-5 font-mono text-sm text-[#8F95A3]">#{item?.userId}</td>
                          <td className="py-5 px-5 font-black text-white text-base tracking-wide">{item?.userName || 'N/A'}</td>
                          <td className="py-5 px-5 font-black text-[#00E57A] text-lg text-right">{formatPrice(Number(item?.totalAmount || 0), currency)}</td>
                          <td className="py-5 px-5 font-bold text-[#3B82F6] text-right">{formatPrice(Number(item?.totalEarnings || 0), currency)}</td>
                          <td className="py-5 px-5 text-[#8F95A3] text-sm font-medium text-right">{renderDate(item?.Date)}</td>
                        </motion.tr>
                      );
                    }

                    const txnId = item?.transactionId || item?._id || `TXN-${idx}`;
                    const status = (item?.status || 'PENDING').toUpperCase();
                    const txTime = item?.transactionTime || item?.createdAt || item?.Date;
                    const isTerminal = status === 'APPROVED' || status === 'COMPLETED' || status === 'DECLINED' || status === 'REJECTED';
                    
                    let statusColor = 'border-amber-500/40 text-amber-500 bg-amber-500/10 shadow-[0_0_15px_rgba(245,158,11,0.1)]';
                    if (status === 'APPROVED' || status === 'COMPLETED') statusColor = 'border-emerald-500/40 text-emerald-500 bg-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.1)]';
                    if (status === 'DECLINED' || status === 'REJECTED') statusColor = 'border-rose-500/40 text-rose-500 bg-rose-500/10 shadow-[0_0_15px_rgba(244,63,94,0.1)]';
                    if (status === 'PROCESSING') statusColor = 'border-blue-500/40 text-blue-500 bg-blue-500/10 shadow-[0_0_15px_rgba(59,130,246,0.1)]';

                    return (
                      <motion.tr 
                        key={txnId} 
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="hover:bg-white/[0.03] transition-colors group"
                      >
                        
                        {/* TRANSACTION ID */}
                        <td className="py-5 px-5">
                          <div className="flex flex-col gap-1.5">
                            <span className="font-bold text-[14px] text-[#8F95A3] tracking-wide">#{txnId}</span>
                            <span className="text-[#6B7280] text-[12px] font-mono font-medium">{renderDate(txTime)}</span>
                          </div>
                        </td>
                        
                        {/* USER DETAILS */}
                        <td className="py-5 px-5">
                          <div className="flex flex-col gap-1">
                            <span className="text-white font-black text-[15px] tracking-wide">{item?.userName || item?.email || 'Unknown'}</span>
                            <span className="text-[12px] text-[#8F95A3] font-medium uppercase">ID: {item?.userId || 'N/A'}</span>
                          </div>
                        </td>

                        {/* PAYMENT INFO */}
                        <td className="py-5 px-5">
                          <div className="flex flex-col gap-1.5">
                            <span className="text-white font-black text-[13px] uppercase tracking-widest">{item?.payoutMethod || item?.method || 'N/A'}</span>
                            {item?.upi && item?.upi !== '-' && (
                              <span className="text-[13px] text-[#A66CFF] font-medium tracking-wide">{item.upi}</span>
                            )}
                          </div>
                        </td>

                        {/* AMOUNT & FEE */}
                        <td className="py-5 px-5">
                          <div className="flex flex-col gap-1 w-fit">
                            <div className="flex items-center justify-center bg-[#00E57A]/10 px-4 py-1.5 rounded-lg border border-[#00E57A]/30">
                              <span className="font-black text-[#00E57A] tracking-wider text-[15px]">
                                {formatPrice(Number(item?.amount || 0), currency)}
                              </span>
                            </div>
                            {Number(item?.fee) > 0 && (
                              <span className="text-[11px] text-[#FF5D73] font-bold text-center uppercase tracking-widest mt-0.5">
                                Fee: {formatPrice(Number(item.fee), currency)}
                              </span>
                            )}
                          </div>
                        </td>

                        {/* STATUS */}
                        <td className="py-5 px-5 text-center">
                          <span className={`inline-flex items-center justify-center text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border ${statusColor}`}>
                            {status}
                          </span>
                        </td>

                        {/* ACTIONS ONLY */}
                        {activeTab === 'requests' && (
                          <td className="py-5 px-5">
                            <div className="flex items-center justify-center gap-2.5">
                              {isTerminal ? (
                                <span className="text-[#8F95A3] font-black opacity-30 select-none">-</span>
                              ) : (
                                <>
                                  {status !== 'APPROVED' && status !== 'COMPLETED' && (
                                    <button 
                                      onClick={() => handleStatusUpdate(txnId, 'approve')}
                                      disabled={actionLoadingId === txnId}
                                      className="w-9 h-9 rounded-full border-2 border-[#00E57A]/30 text-[#00E57A] flex items-center justify-center hover:bg-[#00E57A]/10 hover:scale-110 transition-all cursor-pointer"
                                      title="Approve"
                                    >
                                      <CheckCircle2 className="w-4 h-4" />
                                    </button>
                                  )}

                                  {status !== 'PROCESSING' && (
                                    <button 
                                      onClick={() => handleStatusUpdate(txnId, 'processing')}
                                      disabled={actionLoadingId === txnId}
                                      className="w-9 h-9 rounded-full border-2 border-[#5EA8FF]/30 text-[#5EA8FF] flex items-center justify-center hover:bg-[#5EA8FF]/10 hover:scale-110 transition-all cursor-pointer"
                                      title="Mark Processing"
                                    >
                                      <Clock className="w-4 h-4" />
                                    </button>
                                  )}

                                  {status !== 'DECLINED' && status !== 'REJECTED' && (
                                    <button 
                                      onClick={() => handleStatusUpdate(txnId, 'decline')}
                                      disabled={actionLoadingId === txnId}
                                      className="w-9 h-9 rounded-full border-2 border-[#FF5D73]/30 text-[#FF5D73] flex items-center justify-center hover:bg-[#FF5D73]/10 hover:scale-110 transition-all cursor-pointer"
                                      title="Decline"
                                    >
                                      <XCircle className="w-4 h-4" />
                                    </button>
                                  )}
                                </>
                              )}
                            </div>
                          </td>
                        )}
                      </motion.tr>
                    );
                  })}
                </AnimatePresence>
              ) : (
                <tr>
                  <td colSpan={6} className="py-32 text-center">
                    <ArrowRightLeft className="w-16 h-16 mx-auto text-[#8F95A3] mb-5 opacity-20" />
                    <p className="font-bold text-[#8F95A3] tracking-wide">
                      {(activeTab === 'approved' || activeTab === 'user-withdraws') && !searchQuery 
                        ? 'Please select a User from the dropdown to view records.' 
                        : 'No transactions found.'}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}