'use client';

import React, { useState, useEffect } from 'react';
import { 
  CreditCard, RefreshCcw, Loader2, CheckCircle2, 
  XCircle, Clock, PlusCircle, MinusCircle, AlertCircle, 
  Search, ArrowRightLeft, DollarSign, X, Trophy, Users, CheckSquare, Activity
} from 'lucide-react';
import { useCurrency, formatPrice } from '@/hooks/useCurrency';

type TabType = 'requests' | 'user-withdraws' | 'approved' | 'top-earners';

export default function AdminTransactionsPage() {
  const currency = useCurrency();

  // --- TABS STATE ---
  const [activeTab, setActiveTab] = useState<TabType>('requests');

  // --- DATA STATES ---
  const [transactions, setTransactions] = useState<any[]>([]); // For Withdraw Requests
  const [userWithdraws, setUserWithdraws] = useState<any[]>([]); // For All User Withdrawals
  const [approvedWithdraws, setApprovedWithdraws] = useState<any[]>([]); // For Approved (By User ID)
  const [topEarners, setTopEarners] = useState<any[]>([]); // For Top Earners
  
  // 🔥 NEW: USERS LIST STATE 🔥
  const [usersList, setUsersList] = useState<any[]>([]);

  const [isLoading, setIsLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // --- MODAL STATES FOR ADD / DEDUCT ---
  const [isAmountModalOpen, setIsAmountModalOpen] = useState(false);
  const [amountActionType, setAmountActionType] = useState<'ADD' | 'DEDUCT'>('ADD');
  const [selectedTxn, setSelectedTxn] = useState<any>(null);
  const [amountInput, setAmountInput] = useState('');
  const [isSubmittingAmount, setIsSubmittingAmount] = useState(false);

  // 🔥 1. FETCH USERS LIST (For Stats & Dropdown) 🔥
  const fetchUsers = async () => {
    const token = localStorage.getItem('admin_token');
    try {
      const res = await fetch(`https://api.binnycash.com/api/admin/userList`, {
        method: 'GET',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json' 
        }
      });
      const json = await res.json().catch(() => null);
      if (res.ok && json?.code === 200) {
        setUsersList(Array.isArray(json.data) ? json.data : (json.data?.list || []));
      }
    } catch (error) {
      console.error("Failed to fetch users list", error);
    }
  };

  // 🔥 2. FETCH DATA BASED ON ACTIVE TAB 🔥
  const fetchData = async (tab: TabType, query: string = '') => {
    setIsLoading(true);
    setErrorMsg(null);
    const token = localStorage.getItem('admin_token');

    let endpoint = '';
    let method = 'GET';

    if (tab === 'requests') endpoint = 'withdraw-request-list';
    if (tab === 'user-withdraws') endpoint = 'user-withdraw-list';
    if (tab === 'approved') {
      endpoint = 'approved-withdraw-list';
      if (query) endpoint += `?userId=${encodeURIComponent(query)}`;
    }
    if (tab === 'top-earners') endpoint = 'top-earners';

    try {
      const res = await fetch(`https://api.binnycash.com/api/admin/user-balance/${endpoint}`, {
        method,
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json' 
        }
      });
      const json = await res.json().catch(() => null);

      if (res.ok && json?.code === 200) {
        const dataList = Array.isArray(json.data) ? json.data : (json.data?.list || []);
        
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
      console.error("Fetch error:", err);
      setErrorMsg(`Failed to fetch data for ${tab.replace('-', ' ')}`);
    } finally {
      setIsLoading(false);
    }
  };

  // Initial load
  useEffect(() => {
    fetchUsers();
  }, []);

  // Tab Change trigger
  useEffect(() => {
    if (activeTab === 'approved' && !searchQuery) {
      setApprovedWithdraws([]);
      return;
    }
    fetchData(activeTab, searchQuery);
  }, [activeTab]);

  // 🔥 AUTOMATED USER DROPDOWN SELECTION 🔥
  const handleUserSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSearchQuery(val); // Save ID in search query
    if (val) {
      fetchData('approved', val); // Auto fetch without hitting any button
    } else {
      setApprovedWithdraws([]);
    }
  };

  // HANDLE STATUS UPDATES (PUT)
  const handleStatusUpdate = async (transactionId: string, action: 'approve' | 'decline' | 'processing') => {
    if (!confirm(`Are you sure you want to mark this as ${action.toUpperCase()}?`)) return;

    setActionLoadingId(transactionId);
    const token = localStorage.getItem('admin_token');

    let endpoint = '';
    if (action === 'approve') endpoint = 'approve-amount';
    if (action === 'decline') endpoint = 'decline-amount';
    if (action === 'processing') endpoint = 'processing-amount';

    try {
      const fd = new URLSearchParams();
      fd.append('transactionId', transactionId);

      const res = await fetch(`https://api.binnycash.com/api/admin/user-balance/${endpoint}`, {
        method: 'PUT', 
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: fd
      });

      const json = await res.json();
      if (res.ok) {
        alert(`Transaction marked as ${action.toUpperCase()} successfully!`);
        fetchData('requests'); 
      } else {
        alert(json.message || `Failed to update status to ${action}`);
      }
    } catch (error) {
      alert("Network error while updating transaction status.");
    } finally {
      setActionLoadingId(null);
    }
  };

  // HANDLE ADD / DEDUCT AMOUNT SUBMIT (PUT)
  const handleAmountSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amountInput || Number(amountInput) <= 0) {
      alert("Please enter a valid amount.");
      return;
    }

    setIsSubmittingAmount(true);
    const token = localStorage.getItem('admin_token');
    const endpoint = amountActionType === 'ADD' ? 'add-amount' : 'deduct-amount';

    try {
      const fd = new URLSearchParams();
      fd.append('transactionId', selectedTxn?.transactionId || selectedTxn?._id);
      fd.append('userId', selectedTxn?.userId);
      fd.append('amount', amountInput);

      const res = await fetch(`https://api.binnycash.com/api/admin/user-balance/${endpoint}`, {
        method: 'PUT', 
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: fd
      });

      const json = await res.json();
      if (res.ok) {
        alert(`Amount ${amountActionType === 'ADD' ? 'added' : 'deducted'} successfully!`);
        setIsAmountModalOpen(false);
        setAmountInput('');
        fetchData('requests');
      } else {
        alert(json.message || `Failed to ${amountActionType.toLowerCase()} amount.`);
      }
    } catch (error) {
      alert(`Network error while trying to ${amountActionType.toLowerCase()} amount.`);
    } finally {
      setIsSubmittingAmount(false);
    }
  };

  const openAmountModal = (txn: any, type: 'ADD' | 'DEDUCT') => {
    setSelectedTxn(txn);
    setAmountActionType(type);
    setAmountInput('');
    setIsAmountModalOpen(true);
  };

  const renderDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? dateString : date.toLocaleString();
  };

  // Local filtering for standard search inputs
  const getFilteredList = (list: any[]) => {
    if (activeTab === 'approved' || activeTab === 'top-earners') return list; 
    return list.filter((t: any) => {
      const q = searchQuery.toLowerCase();
      const txnId = String(t?.transactionId || t?._id || '').toLowerCase();
      const uId = String(t?.userId || '').toLowerCase();
      return txnId.includes(q) || uId.includes(q);
    });
  };

  const currentList = 
    activeTab === 'requests' ? transactions : 
    activeTab === 'user-withdraws' ? userWithdraws : 
    activeTab === 'approved' ? approvedWithdraws : topEarners;

  const displayList = getFilteredList(currentList);

  return (
    <div className="flex flex-col gap-6 text-white w-full max-w-[1600px] mx-auto pb-10 font-sans">
      
      {/* --- HEADER --- */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
             <CreditCard className="w-6 h-6 text-[#00E57A]" /> Transactions & Balances
          </h1>
          <p className="text-sm text-gray-400 mt-1">Manage cashouts, view user history, and track top earners.</p>
        </div>
        <button 
          onClick={() => { fetchUsers(); fetchData(activeTab, searchQuery); }} 
          disabled={isLoading}
          className="flex items-center gap-2 bg-[#12141C] hover:bg-[#1A1C24] border border-white/10 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
        >
          <RefreshCcw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} /> Refresh
        </button>
      </div>

      {errorMsg && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span className="text-sm font-bold">{errorMsg}</span>
        </div>
      )}

      {/* 🔥 DASHBOARD STATS (Matching Screenshot) 🔥 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-[#12141C] border border-white/5 rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border bg-[#8B5CF6]/10 border-[#8B5CF6]/20">
            <Users className="w-6 h-6 text-[#8B5CF6]" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Total Registered Users</span>
            <span className="text-2xl font-black text-white mt-1">{usersList.length || 0}</span>
          </div>
        </div>
        <div className="bg-[#12141C] border border-white/5 rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border bg-amber-500/10 border-amber-500/20">
            <Clock className="w-6 h-6 text-amber-400" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Pending Withdrawals</span>
            <span className="text-2xl font-black text-white mt-1">{transactions.length || 0}</span>
          </div>
        </div>
        <div className="bg-[#12141C] border border-white/5 rounded-2xl p-5 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border bg-[#00E57A]/10 border-[#00E57A]/20">
            <Activity className="w-6 h-6 text-[#00E57A]" />
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">All User Withdraws</span>
            <span className="text-2xl font-black text-white mt-1">{userWithdraws.length || 0}</span>
          </div>
        </div>
      </div>

      {/* --- TABS --- */}
      <div className="flex flex-wrap items-center gap-2 p-1 bg-[#12141C] rounded-xl border border-white/5 w-fit mt-2">
        <button onClick={() => { setActiveTab('requests'); setSearchQuery(''); }} className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${activeTab === 'requests' ? 'bg-[#252836] text-[#00E57A] shadow-sm border border-white/10' : 'text-gray-500 hover:text-gray-300'}`}>
          <Clock className="w-4 h-4"/> Pending Requests
        </button>
        <button onClick={() => { setActiveTab('user-withdraws'); setSearchQuery(''); }} className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${activeTab === 'user-withdraws' ? 'bg-[#252836] text-white shadow-sm border border-white/10' : 'text-gray-500 hover:text-gray-300'}`}>
          <Users className="w-4 h-4"/> All Withdrawals
        </button>
        <button onClick={() => { setActiveTab('approved'); setSearchQuery(''); }} className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${activeTab === 'approved' ? 'bg-[#252836] text-white shadow-sm border border-white/10' : 'text-gray-500 hover:text-gray-300'}`}>
          <CheckSquare className="w-4 h-4"/> Approved List
        </button>
        <button onClick={() => { setActiveTab('top-earners'); setSearchQuery(''); }} className={`px-5 py-2.5 rounded-lg text-sm font-bold transition-all cursor-pointer flex items-center gap-2 ${activeTab === 'top-earners' ? 'bg-[#252836] text-amber-400 shadow-sm border border-white/10' : 'text-gray-500 hover:text-gray-300'}`}>
          <Trophy className="w-4 h-4"/> Top Earners
        </button>
      </div>

      {/* --- SEARCH BAR / USER SELECTOR (Contextual) --- */}
      {activeTab !== 'top-earners' && (
        <div className="flex flex-wrap items-center gap-4 bg-[#12141C] p-4 rounded-xl border border-white/5">
          <div className="relative flex-1 min-w-[200px] max-w-md flex gap-2">
            
             {/* 🔥 AUTOMATED USER DROPDOWN FOR APPROVED TAB 🔥 */}
             {activeTab === 'approved' ? (
               <div className="relative flex-1">
                 <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                 <select 
                   value={searchQuery}
                   onChange={handleUserSelect}
                   className="w-full bg-[#0B0D14] border border-white/10 rounded-lg pl-9 pr-10 py-2.5 text-sm text-white focus:outline-none focus:border-[#8B5CF6] transition-colors appearance-none cursor-pointer"
                 >
                   <option value="">-- Select a User to view Approved Withdrawals --</option>
                   {usersList.map((u: any, idx: number) => (
                     <option key={u.id || u._id || idx} value={u.id || u._id}>
                       {u.name || u.userName || u.email || 'Unknown'} (ID: {u.id || u._id})
                     </option>
                   ))}
                 </select>
                 <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                 </div>
               </div>
             ) : (
               <div className="relative flex-1">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                 <input 
                   type="text" 
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                   placeholder="Search by Transaction ID or User ID..." 
                   className="w-full bg-[#0B0D14] border border-white/10 rounded-lg pl-9 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#00E57A] transition-colors"
                 />
               </div>
             )}
          </div>
        </div>
      )}

      {/* --- MAIN DATA TABLE --- */}
      <div className="bg-[#12141C] border border-white/5 rounded-xl overflow-hidden shadow-sm min-h-[400px]">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            
            {/* DYNAMIC HEADERS BASED ON TAB */}
            <thead>
              <tr className="border-b border-white/10 text-gray-400 text-xs font-bold uppercase tracking-wider bg-[#161821]">
                {activeTab === 'top-earners' ? (
                  <>
                    <th className="py-4 px-5">User ID</th>
                    <th className="py-4 px-4">Username</th>
                    <th className="py-4 px-4 text-right">Total Withdraw</th>
                    <th className="py-4 px-4 text-right">Total Earnings</th>
                    <th className="py-4 px-5 text-right">Last Activity</th>
                  </>
                ) : (
                  <>
                    <th className="py-4 px-5">Transaction ID</th>
                    <th className="py-4 px-4">User Details</th>
                    <th className="py-4 px-4 text-center">Amount</th>
                    <th className="py-4 px-5 text-center">Status</th>
                    {activeTab === 'requests' && (
                      <>
                        <th className="py-4 px-5 text-right">Actions (Status)</th>
                        <th className="py-4 px-5 text-right">Balance Adj.</th>
                      </>
                    )}
                  </>
                )}
              </tr>
            </thead>

            <tbody className="divide-y divide-white/5 text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-gray-500 font-medium">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#00E57A]" /> Fetching data...
                  </td>
                </tr>
              ) : displayList.length > 0 ? (
                
                displayList.map((item: any, idx: number) => {
                  // --- RENDER TOP EARNERS ---
                  if (activeTab === 'top-earners') {
                    return (
                      <tr key={item?.userId || idx} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-4 px-5 font-mono text-xs text-gray-400">UID-{item?.userId}</td>
                        <td className="py-4 px-4 font-bold text-white">{item?.userName || 'N/A'}</td>
                        <td className="py-4 px-4 text-right">
                          <span className="font-black text-[#00E57A]">{formatPrice(Number(item?.totalAmount || 0), currency)}</span>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <span className="font-bold text-blue-400">{formatPrice(Number(item?.totalEarnings || 0), currency)}</span>
                        </td>
                        <td className="py-4 px-5 text-right text-gray-400 text-xs">{renderDate(item?.Date)}</td>
                      </tr>
                    );
                  }

                  // --- RENDER REQUESTS / WITHDRAWALS / APPROVED ---
                  const txnId = item?.transactionId || item?._id || `TXN-${idx}`;
                  const status = (item?.status || 'PENDING').toUpperCase();
                  
                  let statusColor = 'bg-amber-500/10 text-amber-400 border-amber-500/20';
                  if (status === 'APPROVED' || status === 'COMPLETED') statusColor = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
                  if (status === 'DECLINED' || status === 'REJECTED') statusColor = 'bg-rose-500/10 text-rose-400 border-rose-500/20';
                  if (status === 'PROCESSING') statusColor = 'bg-blue-500/10 text-blue-400 border-blue-500/20';

                  return (
                    <tr key={txnId} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-4 px-5">
                        <span className="font-mono text-xs text-gray-400">#{txnId}</span>
                        <div className="text-[10px] text-gray-500 mt-1">
                          {renderDate(item?.createdAt || item?.Date)}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex flex-col">
                          <span className="text-white font-bold">{item?.userName || item?.email || 'Unknown User'}</span>
                          <span className="text-[10px] text-gray-500 font-mono">ID: {item?.userId || 'N/A'}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <div className="inline-flex items-center gap-1.5 bg-[#00E57A]/10 border border-[#00E57A]/20 px-2.5 py-1 rounded-lg">
                          <DollarSign className="w-3.5 h-3.5 text-[#00E57A]" />
                          <span className="font-black text-[#00E57A]">
                            {formatPrice(Number(item?.amount || 0), currency)}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-5 text-center">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded border ${statusColor}`}>
                          {status}
                        </span>
                      </td>

                      {/* ACTION BUTTONS ONLY IN REQUESTS TAB */}
                      {activeTab === 'requests' && (
                        <>
                          <td className="py-4 px-5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button 
                                onClick={() => handleStatusUpdate(txnId, 'approve')}
                                disabled={actionLoadingId === txnId}
                                className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:text-white hover:bg-emerald-500/20 transition-colors cursor-pointer"
                                title="Approve"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleStatusUpdate(txnId, 'processing')}
                                disabled={actionLoadingId === txnId}
                                className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 hover:text-white hover:bg-blue-500/20 transition-colors cursor-pointer"
                                title="Mark as Processing"
                              >
                                <Clock className="w-4 h-4" />
                              </button>
                              <button 
                                onClick={() => handleStatusUpdate(txnId, 'decline')}
                                disabled={actionLoadingId === txnId}
                                className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:text-white hover:bg-rose-500/20 transition-colors cursor-pointer"
                                title="Decline"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                          <td className="py-4 px-5 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              <button 
                                onClick={() => openAmountModal(item, 'ADD')}
                                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#8B5CF6]/10 text-[#8B5CF6] hover:bg-[#8B5CF6]/20 transition-colors text-xs font-bold cursor-pointer border border-[#8B5CF6]/20"
                                title="Add Amount"
                              >
                                <PlusCircle className="w-3.5 h-3.5" /> Add
                              </button>
                              <button 
                                onClick={() => openAmountModal(item, 'DEDUCT')}
                                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 transition-colors text-xs font-bold cursor-pointer border border-amber-500/20"
                                title="Deduct Amount"
                              >
                                <MinusCircle className="w-3.5 h-3.5" /> Deduct
                              </button>
                            </div>
                          </td>
                        </>
                      )}
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="py-24 text-center text-gray-500">
                    <ArrowRightLeft className="w-12 h-12 mx-auto text-gray-600 mb-4 opacity-30" />
                    <p className="font-medium text-base">
                      {activeTab === 'approved' && !searchQuery ? 'Please select a User from dropdown above to view approved transactions.' : 'No data found in this category.'}
                    </p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- ADD / DEDUCT AMOUNT MODAL --- */}
      {isAmountModalOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0B0E14] border border-white/10 w-full max-w-sm rounded-[24px] shadow-2xl relative flex flex-col overflow-hidden">
            
            <div className="bg-[#12151E] border-b border-white/5 px-6 py-5 flex items-center justify-between">
              <h3 className={`text-lg font-black flex items-center gap-2 ${amountActionType === 'ADD' ? 'text-[#8B5CF6]' : 'text-amber-400'}`}>
                {amountActionType === 'ADD' ? <PlusCircle className="w-5 h-5" /> : <MinusCircle className="w-5 h-5" />} 
                {amountActionType === 'ADD' ? 'Add Amount' : 'Deduct Amount'}
              </h3>
              <button onClick={() => setIsAmountModalOpen(false)} className="text-[#8F95A3] hover:text-white transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAmountSubmit} className="p-6 flex flex-col gap-5">
              <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex flex-col">
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider mb-1">Target User</span>
                <span className="text-white font-mono text-xs">{selectedTxn?.userName || selectedTxn?.email || 'N/A'}</span>
                <span className="text-gray-500 font-mono text-[10px] mt-0.5">ID: {selectedTxn?.userId || 'N/A'}</span>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Amount to {amountActionType}</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input 
                    type="number" 
                    step="any"
                    required 
                    min="0.01"
                    placeholder="e.g. 5.00" 
                    value={amountInput}
                    onChange={(e) => setAmountInput(e.target.value)}
                    className={`w-full bg-[#12141C] border rounded-lg pl-9 pr-4 py-3 text-white font-bold focus:outline-none transition-colors ${amountActionType === 'ADD' ? 'border-[#8B5CF6]/30 focus:border-[#8B5CF6]' : 'border-amber-500/30 focus:border-amber-400'}`} 
                  />
                </div>
              </div>

              <button 
                type="submit"
                disabled={isSubmittingAmount}
                className={`w-full py-3 rounded-xl font-black text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-50 cursor-pointer ${
                  amountActionType === 'ADD' 
                    ? 'bg-[#8B5CF6] hover:bg-[#7C3AED] text-white shadow-[0_0_15px_rgba(139,92,246,0.3)]' 
                    : 'bg-amber-500 hover:bg-amber-600 text-black shadow-[0_0_15px_rgba(245,158,11,0.3)]'
                }`}
              >
                {isSubmittingAmount ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirm Action'}
              </button>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}