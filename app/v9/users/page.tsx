'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, UserCheck, UserX, FileText, FileClock, 
  Search, Eye, ChevronLeft, ChevronRight, X, Loader2, Mail, MapPin, Phone, ShieldCheck,
  Gift, Share2, History, MonitorSmartphone, Wallet, AlertCircle, Clock, Info, ShieldAlert, Layers, Star, SlidersHorizontal, PlusCircle, MinusCircle, DollarSign, CheckCircle2, XCircle,
  AlertOctagon // 🔥 Imported AlertOctagon for Warning Button
} from 'lucide-react';
import { useCurrency, formatPrice } from '@/hooks/useCurrency';

// --- UTILITY: Get Admin ID ---
function getAdminId(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('adminId') || localStorage.getItem('admin_id') || localStorage.getItem('userId') || '';
}

export default function AdminUsersPage() {
  const router = useRouter();
  const currency = useCurrency();
  
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Profile View States
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);
  const [profileTab, setProfileTab] = useState<'overview' | 'earnings' | 'wallet'>('overview');

  const [imageErrors, setImageErrors] = useState<{ [key: string]: boolean }>({});

  // --- BALANCE ADJUST MODAL STATES ---
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [selectedUserForAdjust, setSelectedUserForAdjust] = useState<any>(null);
  const [amountInput, setAmountInput] = useState('');
  const [actionStatus, setActionStatus] = useState<'1' | '0'>('1'); // 1 = Add, 0 = Deduct
  const [isSubmittingAdjust, setIsSubmittingAdjust] = useState(false);
  const [adjustMessage, setAdjustMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

  // --- 🔥 WARNING MODAL STATES 🔥 ---
  const [isWarningModalOpen, setIsWarningModalOpen] = useState(false);
  const [selectedUserForWarning, setSelectedUserForWarning] = useState<any>(null);
  const [warningTitle, setWarningTitle] = useState('');
  const [warningReason, setWarningReason] = useState('');
  const [isSubmittingWarning, setIsSubmittingWarning] = useState(false);
  const [warningMessage, setWarningMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

  const fetchUsers = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : '';
    const adminId = getAdminId();
    
    if (!token) {
      router.push('/v9/login');
      return;
    }

    if (!adminId) {
      setErrorMsg("Admin session incomplete (missing adminId). Please log in again.");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch(`https://api.binnycash.com/api/admin/userList?adminId=${encodeURIComponent(adminId)}&page=1&limit=50`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      
      const json = await res.json().catch(() => null);
      const list = Array.isArray(json?.data) ? json.data : [];

      if (!res.ok || json?.code !== 200 || list.length === 0) {
        setErrorMsg(json?.message || "Server returned empty list or error.");
        setUsers([]);
      } else {
        setUsers(list);
      }
    } catch (err: any) {
      console.error("Failed to load users from API:", err);
      setErrorMsg("Network or Server error.");
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [router]);

  // GET USER DETAILED PROFILE API
  const handleViewProfile = async (numericId: string | number) => {
    setIsProfileModalOpen(true);
    setIsProfileLoading(true);
    setProfileData(null);
    setProfileTab('overview'); 
    
    const token = localStorage.getItem('admin_token');
    
    try {
      const res = await fetch(`https://api.binnycash.com/api/admin/detail/${encodeURIComponent(numericId)}`, {
        method: 'GET',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      
      const json = await res.json();
      if (json?.code === 200 && json?.data) {
        setProfileData(json.data);
      } else {
        setProfileData({ error: json?.message || 'Failed to load detailed profile.' });
      }
    } catch (err) {
      console.error("Profile fetch error:", err);
      setProfileData({ error: 'Network error while fetching details.' });
    } finally {
      setIsProfileLoading(false);
    }
  };

  // HANDLE BALANCE ADJUST SUBMIT (PATCH)
  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amountInput || Number(amountInput) <= 0) { 
      setAdjustMessage({ text: "Please enter a valid amount.", type: 'error' });
      return; 
    }

    setIsSubmittingAdjust(true);
    setAdjustMessage(null);
    const token = localStorage.getItem('admin_token');
    const adminId = getAdminId();

    try {
      const fd = new URLSearchParams();
      fd.append('userId', selectedUserForAdjust?.id || selectedUserForAdjust?._id);
      fd.append('amount', amountInput);
      fd.append('status', actionStatus); // 1 = Add, 0 = Deduct
      fd.append('adminId', adminId); 

      const res = await fetch(`https://api.binnycash.com/api/admin/balance/adjust`, {
        method: 'PATCH', 
        headers: { 
          'Authorization': `Bearer ${token}`, 
          'Content-Type': 'application/x-www-form-urlencoded' 
        },
        body: fd
      });

      const json = await res.json();
      if (res.ok || json?.code === 200) {
        setAdjustMessage({ text: json.message || "Balance updated successfully!", type: 'success' });
        fetchUsers(); // Refresh list background
        setTimeout(() => {
          setIsAdjustModalOpen(false);
          setAdjustMessage(null);
        }, 1500);
      } else {
        setAdjustMessage({ text: json.message || "Failed to update balance.", type: 'error' });
      }
    } catch (error) {
      setAdjustMessage({ text: "Network error while updating balance.", type: 'error' });
    } finally {
      setIsSubmittingAdjust(false);
    }
  };

  const openAdjustModal = (user: any) => {
    setSelectedUserForAdjust(user);
    setAmountInput('');
    setActionStatus('1');
    setAdjustMessage(null);
    setIsAdjustModalOpen(true);
  };

  // 🔥 HANDLE SEND WARNING SUBMIT (PUT) 🔥
  const openWarningModal = (user: any) => {
    setSelectedUserForWarning(user);
    setWarningTitle('');
    setWarningReason('');
    setWarningMessage(null);
    setIsWarningModalOpen(true);
  };

  const handleWarningSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!warningTitle.trim() || !warningReason.trim()) return;

    setIsSubmittingWarning(true);
    setWarningMessage(null);
    const token = localStorage.getItem('admin_token');

    try {
      const fd = new URLSearchParams();
      fd.append('userId', selectedUserForWarning?.id || selectedUserForWarning?._id);
      fd.append('title', warningTitle.trim());
      fd.append('reason', warningReason.trim());

      const res = await fetch(`https://api.binnycash.com/api/admin/sendWarning`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`, 
          'Content-Type': 'application/x-www-form-urlencoded' 
        },
        body: fd
      });

      const json = await res.json();
      if (res.ok || json?.code === 200) {
        setWarningMessage({ text: json.message || "Warning sent successfully!", type: 'success' });
        setTimeout(() => {
          setIsWarningModalOpen(false);
          setWarningMessage(null);
        }, 1500);
      } else {
        setWarningMessage({ text: json.message || "Failed to send warning.", type: 'error' });
      }
    } catch (error) {
      setWarningMessage({ text: "Network error while sending warning.", type: 'error' });
    } finally {
      setIsSubmittingWarning(false);
    }
  };

  const safeUsers = Array.isArray(users) ? users : [];
  const filteredUsers = safeUsers.filter(u => {
    const name = u?.userName || u?.name || '';
    const email = u?.email || '';
    const query = searchQuery.toLowerCase();
    return name.toLowerCase().includes(query) || email.toLowerCase().includes(query);
  });

  const totalUsersCount = safeUsers.length;
  const activeUsersCount = safeUsers.filter(u => u?.status === 'ACTIVE').length;
  const deletedUsersCount = safeUsers.filter(u => u?.status === 'DELETE').length;
  
  const kycSubmittedCount = safeUsers.filter(u => {
    const s = String(u?.documents?.status || '').toLowerCase();
    return ['approved', 'submitted', 'pending', 'under_review', 'rejected', 'reupload_required'].includes(s);
  }).length;
  
  const kycPendingCount = safeUsers.filter(u => {
    const s = String(u?.documents?.status || '').toLowerCase();
    return ['submitted', 'pending', 'under_review'].includes(s);
  }).length;

  const overviewStats = [
    { title: "Total Users", value: totalUsersCount, trend: "Live Count", trendColor: "text-emerald-400", icon: Users, bgColor: "bg-[#7C3AED]/20", iconColor: "text-[#7C3AED]" },
    { title: "Active Users", value: activeUsersCount, trend: "Operational", trendColor: "text-emerald-400", icon: UserCheck, bgColor: "bg-emerald-500/20", iconColor: "text-emerald-400" },
    { title: "Deleted Users", value: deletedUsersCount, trend: "Marked Delete", trendColor: "text-red-400", icon: UserX, bgColor: "bg-red-500/20", iconColor: "text-red-400" },
    { title: "KYC Documents", value: kycSubmittedCount, trend: "Total Submissions", trendColor: "text-blue-400", icon: FileText, bgColor: "bg-blue-500/20", iconColor: "text-blue-400" },
    { title: "KYC Pending Review", value: kycPendingCount, trend: "Awaiting Action", trendColor: "text-amber-400", icon: FileClock, bgColor: "bg-amber-500/20", iconColor: "text-amber-400" },
  ];

  const getStatusColor = (status: string) => status === 'ACTIVE' ? 'text-emerald-400 border-emerald-400/20 bg-emerald-400/10' : 'text-red-400 border-red-400/20 bg-red-400/10';
  
  const getKycStatusText = (docStatus: string) => {
    const s = String(docStatus || '').toLowerCase();
    if (s === 'approved') return 'Approved';
    if (s === 'submitted' || s === 'pending' || s === 'under_review') return 'Pending';
    if (s === 'rejected' || s === 'failed') return 'Rejected';
    if (s === 'reupload_required') return 'Re-Upload';
    return 'Not Submitted';
  };

  const getKycColor = (docStatus: string) => {
    const s = String(docStatus || '').toLowerCase();
    if (s === 'approved') return 'text-emerald-400 border-emerald-400/20 bg-emerald-400/10';
    if (s === 'submitted' || s === 'pending' || s === 'under_review') return 'text-amber-400 border-amber-400/20 bg-amber-400/10';
    if (s === 'rejected' || s === 'failed') return 'text-rose-400 border-rose-400/20 bg-rose-400/10';
    if (s === 'reupload_required') return 'text-blue-400 border-blue-400/20 bg-blue-400/10';
    return 'text-gray-400 border-white/10 bg-white/5';
  };

  const resolveImage = (imgSrc: string) => {
    if (!imgSrc || imgSrc.trim() === '') return null;
    return !imgSrc.startsWith('http') ? `https://api.binnycash.com${imgSrc}` : imgSrc;
  };

  return (
    <div className="flex flex-col gap-6 text-white w-full max-w-[1600px] mx-auto pb-10 font-sans">
      
      {/* BREADCRUMBS & TITLE */}
      <div className="flex flex-col gap-1">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-bold text-white mt-1">User List</h1>
            <p className="text-sm text-gray-400 mt-1">Manage all registered users on the platform.</p>
          </div>
          <div className="flex items-center gap-3">
             <button onClick={fetchUsers} className="flex items-center gap-2 bg-[#7C3AED] hover:bg-[#6D28D9] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer shadow-sm">
               Refresh Data
             </button>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl flex items-center gap-3">
          <UserX className="w-5 h-5 shrink-0" />
          <span className="text-sm font-bold">{errorMsg}</span>
        </div>
      )}

      {/* STATS OVERVIEW CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {overviewStats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-[#12141C] border border-white/5 rounded-xl p-4 flex items-start gap-4 shadow-sm hover:border-white/10 transition-colors">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${stat.bgColor} ${stat.iconColor}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-gray-400 font-medium">{stat.title}</span>
                <span className="text-xl font-bold text-white mt-0.5">{isLoading ? '...' : stat.value}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* FILTERS BAR */}
      <div className="flex flex-wrap items-center gap-4 bg-[#12141C] p-4 rounded-xl border border-white/5">
        <div className="relative flex-1 min-w-[200px]">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
           <input 
             type="text" 
             value={searchQuery}
             onChange={(e) => setSearchQuery(e.target.value)}
             placeholder="Search by username or email..." 
             className="w-full bg-transparent border border-white/10 rounded-lg pl-9 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#7C3AED] transition-colors"
           />
        </div>
      </div>

      {/* DATA TABLE */}
      <div className="bg-[#12141C] border border-white/5 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="border-b border-white/10 text-gray-400 text-xs font-semibold bg-[#161821]">
                <th className="py-4 px-5">ID ↕</th>
                <th className="py-4 px-4">User</th>
                <th className="py-4 px-4">Country ↕</th>
                <th className="py-4 px-4 text-center">Status ↕</th>
                <th className="py-4 px-4 text-center">KYC Status ↕</th>
                <th className="py-4 px-4 text-right">Available Balance ↕</th>
                <th className="py-4 px-4 text-right">Joined On ↕</th>
                <th className="py-4 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-500 font-medium">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#7C3AED]" /> Loading users database...
                  </td>
                </tr>
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map((u: any, idx: number) => {
                  const avatarUrl = resolveImage(u?.image);
                  const userName = u?.userName || u?.name || 'Unnamed User';
                  const firstLetter = userName.charAt(0).toUpperCase();
                  const displayId = u?.id || idx + 1;
                  const joinedDate = u?.createdAt ? new Date(u.createdAt) : null;
                  
                  const docStatus = u?.documents?.status || 'not_submited';
                  const hasImageError = imageErrors[u?._id];
                  const countryDisplay = (u?.countryCode || u?.country || 'IN').substring(0, 2).toUpperCase();

                  return (
                    <tr key={u?._id || idx} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="py-3 px-5 text-gray-400 font-mono">{displayId}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          {avatarUrl && !hasImageError ? (
                            <img 
                              src={avatarUrl} 
                              alt="avatar" 
                              onError={() => setImageErrors(prev => ({ ...prev, [u._id]: true }))}
                              className="w-9 h-9 rounded-full object-cover border border-white/10 shrink-0" 
                            />
                          ) : (
                            <div className="w-9 h-9 rounded-full bg-[#7C3AED]/20 border border-[#7C3AED]/40 flex items-center justify-center text-[#7C3AED] font-bold text-sm shrink-0">
                              {firstLetter}
                            </div>
                          )}
                          <div className="flex flex-col">
                            <span className="font-medium text-white">{userName}</span>
                            <span className="text-xs text-gray-500">{u?.email || 'N/A'}</span>
                          </div>
                        </div>
                      </td>
                      
                      <td className="py-3 px-4">
                         <span className="text-sm font-bold text-white">{countryDisplay}</span>
                      </td>

                      <td className="py-3 px-4 text-center">
                        <span className={`inline-block px-2.5 py-1 rounded text-[10px] font-bold border uppercase tracking-wider ${getStatusColor(u?.status)}`}>
                          {u?.status || 'ACTIVE'}
                        </span>
                      </td>
                      
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-block text-[10px] font-bold uppercase tracking-wider border px-2.5 py-1 rounded ${getKycColor(docStatus)}`}>
                          {getKycStatusText(docStatus)}
                        </span>
                      </td>
                      
                      <td className="py-3 px-4 text-right font-bold text-emerald-400">
                         {formatPrice(Number(u?.availableBalance || 0), currency)}
                      </td>
                      <td className="py-3 px-4 text-right">
                         <div className="flex flex-col items-end">
                           <span className="text-white text-sm">{joinedDate && !isNaN(joinedDate.getTime()) ? joinedDate.toLocaleDateString() : 'N/A'}</span>
                           <span className="text-xs text-gray-500">{joinedDate && !isNaN(joinedDate.getTime()) ? joinedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                         </div>
                      </td>
                      
                      {/* ACTIONS COLUMN */}
                      <td className="py-3 px-4">
                         <div className="flex items-center justify-center gap-2">
                            <button 
                              onClick={() => handleViewProfile(u?.id)}
                              className="w-8 h-8 rounded-lg bg-[#7C3AED]/10 hover:bg-[#7C3AED]/20 text-[#7C3AED] border border-[#7C3AED]/20 flex items-center justify-center transition-colors cursor-pointer"
                              title="View Full Profile Details"
                            >
                              <Eye className="w-4 h-4" /> 
                            </button>
                            
                            <button 
                              onClick={() => openAdjustModal(u)}
                              className="w-8 h-8 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/20 flex items-center justify-center transition-colors cursor-pointer"
                              title="Adjust Wallet Balance"
                            >
                              <SlidersHorizontal className="w-4 h-4" /> 
                            </button>

                            {/* 🔥 NEW WARNING ACTION BUTTON 🔥 */}
                            <button 
                              onClick={() => openWarningModal(u)}
                              className="w-8 h-8 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/20 flex items-center justify-center transition-colors cursor-pointer"
                              title="Send Warning"
                            >
                              <AlertOctagon className="w-4 h-4" /> 
                            </button>
                         </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-500">No users found in database.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* PAGINATION FOOTER */}
        <div className="flex items-center justify-between p-4 border-t border-white/5 bg-[#12141C]">
           <span className="text-sm text-gray-400">Showing {filteredUsers.length} total users</span>
           <div className="flex items-center gap-2">
              <button className="w-8 h-8 rounded border border-white/10 flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/5 disabled:opacity-50 cursor-pointer"><ChevronLeft className="w-4 h-4" /></button>
              <button className="w-8 h-8 rounded bg-[#7C3AED] text-white flex items-center justify-center font-medium text-sm cursor-pointer">1</button>
              <button className="w-8 h-8 rounded border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/5 cursor-pointer"><ChevronRight className="w-4 h-4" /></button>
           </div>
        </div>
      </div>

      {/* --- MODAL: DETAILED USER PROFILE --- */}
      {isProfileModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#12141C] border border-white/10 w-full max-w-4xl p-6 rounded-[24px] shadow-2xl relative my-auto max-h-[90vh] overflow-y-auto custom-scrollbar">
            
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4 sticky top-0 bg-[#12141C] z-10">
              <h3 className="text-xl font-black text-white flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-[#7C3AED]" /> User Intelligence
              </h3>
              <button onClick={() => setIsProfileModalOpen(false)} className="text-gray-400 hover:text-white transition-colors cursor-pointer bg-white/5 p-1.5 rounded-lg">
                <X className="w-5 h-5" />
              </button>
            </div>

            {isProfileLoading ? (
              <div className="py-20 flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-[#7C3AED]" />
                <span className="text-gray-400 text-sm font-medium">Loading intelligence data...</span>
              </div>
            ) : profileData?.error ? (
              <div className="py-10 text-center text-red-400 bg-red-500/10 rounded-xl border border-red-500/20 p-4">
                <ShieldAlert className="w-8 h-8 mx-auto mb-2" />
                <p>{profileData.error}</p>
              </div>
            ) : (
              <div className="flex flex-col gap-6">
                
                {/* Header Profile Info */}
                <div className="flex items-center justify-between bg-[#0B0D14] p-5 rounded-2xl border border-white/5 shadow-inner">
                   <div className="flex items-center gap-4">
                     <div className="w-16 h-16 rounded-full bg-[#7C3AED]/20 border border-[#7C3AED]/40 flex items-center justify-center text-[#7C3AED] font-bold text-2xl shrink-0 overflow-hidden">
                        {resolveImage(profileData?.image) ? <img src={resolveImage(profileData.image) || ''} alt="User" className="w-full h-full object-cover" /> : (profileData?.userName?.charAt(0).toUpperCase() || 'U')}
                     </div>
                     <div className="flex flex-col">
                       <h2 className="text-2xl font-black text-white">{profileData?.userName || 'Unknown User'}</h2>
                       <div className="flex flex-wrap items-center gap-3 mt-1">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${getStatusColor(profileData?.status)}`}>
                            {profileData?.status || 'N/A'}
                          </span>
                          <span className="text-xs text-gray-400 flex items-center gap-1"><MapPin className="w-3 h-3"/> {(profileData?.countryCode || profileData?.country || 'IN').substring(0, 2).toUpperCase()}</span>
                          <span className="text-xs text-gray-400 bg-white/5 px-2 py-0.5 rounded-full border border-white/5">ID: {profileData?.id || profileData?._id}</span>
                       </div>
                     </div>
                   </div>
                   
                   <div className="text-right hidden sm:block">
                     <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1">Available Balance</p>
                     <p className="text-3xl font-black text-emerald-400 leading-none">{formatPrice(Number(profileData?.availableBalance || 0), currency)}</p>
                   </div>
                </div>

                {/* --- MODAL TABS --- */}
                <div className="flex gap-6 border-b border-white/10">
                   <button onClick={() => setProfileTab('overview')} className={`pb-3 text-sm font-bold transition-all ${profileTab === 'overview' ? 'text-[#7C3AED] border-b-2 border-[#7C3AED]' : 'text-gray-500 hover:text-gray-300'}`}>Overview & Security</button>
                   <button onClick={() => setProfileTab('earnings')} className={`pb-3 text-sm font-bold transition-all ${profileTab === 'earnings' ? 'text-[#7C3AED] border-b-2 border-[#7C3AED]' : 'text-gray-500 hover:text-gray-300'}`}>Earnings Breakdown</button>
                   <button onClick={() => setProfileTab('wallet')} className={`pb-3 text-sm font-bold transition-all ${profileTab === 'wallet' ? 'text-[#7C3AED] border-b-2 border-[#7C3AED]' : 'text-gray-500 hover:text-gray-300'}`}>Wallet & Withdrawals</button>
                </div>

                {/* --- TAB: OVERVIEW --- */}
                {profileTab === 'overview' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-white/5 border border-white/5 rounded-xl p-4 flex flex-col gap-1">
                      <span className="text-[10px] uppercase text-gray-500 font-bold flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> Email Address</span>
                      <span className="text-sm text-white font-medium break-all">{profileData?.email || 'N/A'}</span>
                    </div>

                    <div className="bg-white/5 border border-white/5 rounded-xl p-4 flex flex-col gap-1">
                      <span className="text-[10px] uppercase text-gray-500 font-bold flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> Phone Number</span>
                      <span className="text-sm text-white font-medium">{profileData?.mobileCode} {profileData?.mobile || 'N/A'}</span>
                    </div>

                    <div className="bg-white/5 border border-white/5 rounded-xl p-4 flex flex-col gap-1">
                      <span className="text-[10px] uppercase text-gray-500 font-bold flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5" /> KYC / Document Status</span>
                      <span className={`text-sm font-bold ${getKycColor(profileData?.documents?.status || 'not_submited')}`}>
                        {getKycStatusText(profileData?.documents?.status || 'not_submited')}
                      </span>
                    </div>

                    <div className="bg-white/5 border border-white/5 rounded-xl p-4 flex flex-col gap-1">
                      <span className="text-[10px] uppercase text-gray-500 font-bold flex items-center gap-1.5"><Share2 className="w-3.5 h-3.5" /> Referral Code</span>
                      <span className="text-sm text-white font-mono">{profileData?.referralCode || 'N/A'}</span>
                    </div>
                    
                    <div className="bg-[#0B0D14] border border-white/5 rounded-xl p-4 flex flex-col gap-1 col-span-1 md:col-span-2">
                      <span className="text-[10px] uppercase text-gray-500 font-bold flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" /> Account Timelines</span>
                      <div className="flex gap-8 mt-1">
                         <div>
                           <span className="text-xs text-gray-500">Joined On:</span>
                           <span className="text-sm text-white ml-2">{profileData?.createdAt ? new Date(profileData.createdAt).toLocaleString() : 'N/A'}</span>
                         </div>
                         <div>
                           <span className="text-xs text-gray-500">Last Active:</span>
                           <span className="text-sm text-white ml-2">{profileData?.lastActive ? new Date(profileData.lastActive).toLocaleString() : 'N/A'}</span>
                         </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* --- TAB: EARNINGS BREAKDOWN --- */}
                {profileTab === 'earnings' && (
                  <div className="flex flex-col gap-4">
                    <div className="bg-gradient-to-r from-emerald-500/10 to-transparent border border-emerald-500/20 rounded-xl p-5 flex justify-between items-center">
                       <div>
                         <h4 className="text-emerald-400 font-black text-lg">Total Gross Earnings</h4>
                         <p className="text-xs text-gray-400">Total amount earned across all sources</p>
                       </div>
                       <span className="text-3xl font-black text-emerald-400">{formatPrice(Number(profileData?.totalEarnings || 0), currency)}</span>
                    </div>
                    
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                       <div className="bg-[#0B0D14] border border-white/5 rounded-xl p-4 flex flex-col justify-center items-center text-center hover:bg-white/5 transition-colors">
                         <Gift className="w-5 h-5 text-[#8B5CF6] mb-2" />
                         <span className="text-xs text-gray-500 font-bold uppercase mb-1">Offers</span>
                         <span className="text-lg text-white font-bold">{formatPrice(Number(profileData?.offerEarning || 0), currency)}</span>
                       </div>
                       <div className="bg-[#0B0D14] border border-white/5 rounded-xl p-4 flex flex-col justify-center items-center text-center hover:bg-white/5 transition-colors">
                         <FileText className="w-5 h-5 text-blue-400 mb-2" />
                         <span className="text-xs text-gray-500 font-bold uppercase mb-1">Surveys</span>
                         <span className="text-lg text-white font-bold">{formatPrice(Number(profileData?.surveyEarning || 0), currency)}</span>
                       </div>
                       <div className="bg-[#0B0D14] border border-white/5 rounded-xl p-4 flex flex-col justify-center items-center text-center hover:bg-white/5 transition-colors">
                         <Layers className="w-5 h-5 text-pink-400 mb-2" />
                         <span className="text-xs text-gray-500 font-bold uppercase mb-1">Offerwalls</span>
                         <span className="text-lg text-white font-bold">{formatPrice(Number(profileData?.offerwallEarning || 0), currency)}</span>
                       </div>
                       <div className="bg-[#0B0D14] border border-white/5 rounded-xl p-4 flex flex-col justify-center items-center text-center hover:bg-white/5 transition-colors">
                         <Star className="w-5 h-5 text-amber-400 mb-2" />
                         <span className="text-xs text-gray-500 font-bold uppercase mb-1">Bonus</span>
                         <span className="text-lg text-white font-bold">{formatPrice(Number(profileData?.bonusEarning || 0), currency)}</span>
                       </div>
                    </div>
                    
                    <div className="bg-[#0B0D14] border border-white/5 rounded-xl p-5 flex items-center justify-between">
                       <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                           <Share2 className="w-5 h-5 text-blue-400" />
                         </div>
                         <div>
                           <span className="text-sm font-bold text-white block">Referral Earnings</span>
                           <span className="text-xs text-gray-500">Income generated from invited users</span>
                         </div>
                       </div>
                       <span className="text-xl font-bold text-white">{formatPrice(Number(profileData?.referralEarnings || 0), currency)}</span>
                    </div>
                  </div>
                )}

                {/* --- TAB: WALLET & WITHDRAWALS --- */}
                {profileTab === 'wallet' && (
                  <div className="flex flex-col gap-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                       <div className="bg-[#7C3AED]/10 border border-[#7C3AED]/20 rounded-xl p-5 flex flex-col items-center justify-center text-center">
                         <Wallet className="w-6 h-6 text-[#7C3AED] mb-2" />
                         <span className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">Total Withdrawn</span>
                         <span className="text-2xl text-white font-black">{formatPrice(Number(profileData?.totalWithdrawal || 0), currency)}</span>
                         <span className="text-[10px] text-gray-500 mt-1">{profileData?.approvedWithdrawalCount || 0} Successful Payouts</span>
                       </div>
                       <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-5 flex flex-col items-center justify-center text-center">
                         <Clock className="w-6 h-6 text-amber-500 mb-2" />
                         <span className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">Pending Amount</span>
                         <span className="text-2xl text-amber-400 font-black">{formatPrice(Number(profileData?.pendingAmount || 0), currency)}</span>
                         <span className="text-[10px] text-amber-500/60 mt-1">{profileData?.pendingWithdrawalCount || 0} Pending Requests</span>
                       </div>
                       <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-5 flex flex-col items-center justify-center text-center">
                         <AlertCircle className="w-6 h-6 text-red-500 mb-2" />
                         <span className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">Total Reversals</span>
                         <span className="text-2xl text-red-400 font-black">{formatPrice(Number(profileData?.reversalAmount || 0), currency)}</span>
                         <span className="text-[10px] text-red-500/60 mt-1">{profileData?.reversalCount || 0} Chargebacks</span>
                       </div>
                    </div>
                    
                    <div className="bg-white/5 p-4 rounded-xl border border-white/5 flex items-start gap-3">
                       <Info className="w-5 h-5 text-gray-400 shrink-0 mt-0.5" />
                       <p className="text-xs text-gray-400 leading-relaxed">
                         The available balance is calculated as <strong className="text-white">Total Earnings + Bonus Earnings - (Total Withdrawals + Pending Amount + Reversals)</strong>.
                       </p>
                    </div>
                  </div>
                )}

              </div>
            )}
            
          </div>
        </div>
      )}

      {/* --- MODAL: BALANCE ADJUSTER --- */}
      <AnimatePresence>
        {isAdjustModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-[#050409]/90 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-[#12141C] border border-white/10 w-full max-w-sm rounded-[32px] shadow-2xl relative flex flex-col overflow-hidden"
            >
              <div className="bg-[#1A1C24] border-b border-white/5 px-8 py-6 flex items-center justify-between">
                <h3 className="text-xl font-black flex items-center gap-3 tracking-tight text-white">
                  <SlidersHorizontal className="w-6 h-6 text-[#A66CFF]" /> Adjust Balance
                </h3>
                <button onClick={() => setIsAdjustModalOpen(false)} className="text-[#8F95A3] hover:text-white transition-colors cursor-pointer w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleAdjustSubmit} className="p-8 flex flex-col gap-6">
                
                <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 flex flex-col shadow-inner">
                  <span className="text-[11px] text-[#8F95A3] font-bold uppercase tracking-widest mb-1.5">Target User</span>
                  <span className="text-white font-black text-base tracking-wide">{selectedUserForAdjust?.name || selectedUserForAdjust?.userName || selectedUserForAdjust?.email || 'N/A'}</span>
                  <span className="text-[#8F95A3] font-mono text-[12px] mt-1 font-medium">ID: {selectedUserForAdjust?.id || selectedUserForAdjust?._id || 'N/A'}</span>
                  
                  <div className="mt-3 pt-3 border-t border-white/5 flex justify-between items-center">
                    <span className="text-xs font-bold text-[#8F95A3]">Current Balance:</span>
                    <span className="text-sm font-black text-[#A66CFF]">
                       {formatPrice(Number(selectedUserForAdjust?.balance || selectedUserForAdjust?.walletBalance || selectedUserForAdjust?.availableBalance || 0), currency)}
                    </span>
                  </div>
                </div>

                {adjustMessage && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className={`p-4 rounded-xl text-xs font-bold flex items-center gap-2 ${adjustMessage.type === 'success' ? 'bg-[#00E57A]/10 text-[#00E57A] border border-[#00E57A]/20' : 'bg-[#FF5D73]/10 text-[#FF5D73] border border-[#FF5D73]/20'}`}>
                    {adjustMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <XCircle className="w-4 h-4 shrink-0" />}
                    {adjustMessage.text}
                  </motion.div>
                )}

                <div className="flex flex-col gap-2.5">
                  <label className="text-xs font-bold text-[#8F95A3] uppercase tracking-widest">Amount</label>
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8F95A3]" />
                    <input 
                      type="number" 
                      step="any"
                      required 
                      min="0.01"
                      placeholder="e.g. 10.00" 
                      value={amountInput}
                      onChange={(e) => setAmountInput(e.target.value)}
                      className="w-full bg-[#0B0D14] rounded-2xl pl-12 pr-5 py-4 text-white font-black text-lg focus:outline-none transition-all shadow-inner border border-transparent focus:border-[#A66CFF]/50" 
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-2.5">
                  <label className="text-xs font-bold text-[#8F95A3] uppercase tracking-widest">Action</label>
                  <div className="relative">
                    <select 
                      value={actionStatus}
                      onChange={(e) => setActionStatus(e.target.value as '1' | '0')}
                      className="w-full bg-[#0B0D14] rounded-2xl px-5 py-4 text-white font-bold text-sm focus:outline-none transition-all shadow-inner border border-transparent focus:border-[#A66CFF]/50 appearance-none cursor-pointer"
                    >
                      <option value="1">➕ Add Balance</option>
                      <option value="0">➖ Deduct Balance</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#8F95A3]">▼</div>
                  </div>
                </div>

                <button 
                  type="submit"
                  disabled={isSubmittingAdjust}
                  className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 transition-all cursor-pointer disabled:opacity-50 ${
                    actionStatus === '1' 
                      ? 'bg-gradient-to-r from-[#A66CFF] to-[#7C3AED] text-white shadow-[0_0_25px_rgba(166,108,255,0.4)] hover:shadow-[0_0_35px_rgba(166,108,255,0.6)]' 
                      : 'bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-[0_0_25px_rgba(245,158,11,0.4)] hover:shadow-[0_0_35px_rgba(245,158,11,0.6)]'
                  }`}
                >
                  {isSubmittingAdjust ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirm Adjustment'}
                </button>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- 🔥 MODAL: SEND WARNING (NEW SEPARATE MODAL) 🔥 --- */}
      <AnimatePresence>
        {isWarningModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-[#050409]/90 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-[#12141C] border border-white/10 w-full max-w-sm rounded-[32px] shadow-2xl relative flex flex-col overflow-hidden"
            >
              <div className="bg-[#1A1C24] border-b border-white/5 px-8 py-6 flex items-center justify-between">
                <h3 className="text-xl font-black flex items-center gap-3 tracking-tight text-white">
                  <AlertOctagon className="w-6 h-6 text-rose-500" /> Send Warning
                </h3>
                <button onClick={() => setIsWarningModalOpen(false)} className="text-[#8F95A3] hover:text-white transition-colors cursor-pointer w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleWarningSubmit} className="p-8 flex flex-col gap-6">
                
                <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 flex flex-col shadow-inner">
                  <span className="text-[11px] text-[#8F95A3] font-bold uppercase tracking-widest mb-1.5">Target User</span>
                  <span className="text-white font-black text-base tracking-wide">{selectedUserForWarning?.name || selectedUserForWarning?.userName || selectedUserForWarning?.email || 'N/A'}</span>
                  <span className="text-[#8F95A3] font-mono text-[12px] mt-1 font-medium">ID: {selectedUserForWarning?.id || selectedUserForWarning?._id || 'N/A'}</span>
                </div>

                {warningMessage && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className={`p-4 rounded-xl text-xs font-bold flex items-center gap-2 ${warningMessage.type === 'success' ? 'bg-[#00E57A]/10 text-[#00E57A] border border-[#00E57A]/20' : 'bg-[#FF5D73]/10 text-[#FF5D73] border border-[#FF5D73]/20'}`}>
                    {warningMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <XCircle className="w-4 h-4 shrink-0" />}
                    {warningMessage.text}
                  </motion.div>
                )}

                <div className="flex flex-col gap-2.5">
                  <label className="text-xs font-bold text-[#8F95A3] uppercase tracking-widest">Warning Title</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. Violation of Terms" 
                    value={warningTitle}
                    onChange={(e) => setWarningTitle(e.target.value)}
                    className="w-full bg-[#0B0D14] rounded-2xl px-5 py-4 text-white text-sm focus:outline-none transition-all shadow-inner border border-transparent focus:border-rose-500/50" 
                  />
                </div>

                <div className="flex flex-col gap-2.5">
                  <label className="text-xs font-bold text-[#8F95A3] uppercase tracking-widest">Reason</label>
                  <textarea 
                    required 
                    rows={3}
                    placeholder="Explain the reason for this warning..." 
                    value={warningReason}
                    onChange={(e) => setWarningReason(e.target.value)}
                    className="w-full bg-[#0B0D14] rounded-2xl px-5 py-4 text-white text-sm focus:outline-none transition-all shadow-inner border border-transparent focus:border-rose-500/50 resize-none custom-scrollbar" 
                  />
                </div>

                <button 
                  type="submit"
                  disabled={isSubmittingWarning}
                  className="w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 transition-all cursor-pointer disabled:opacity-50 bg-gradient-to-r from-rose-500 to-rose-600 text-white shadow-[0_0_25px_rgba(243,33,101,0.4)] hover:shadow-[0_0_35px_rgba(243,33,101,0.6)]"
                >
                  {isSubmittingWarning ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send Warning'}
                </button>

              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}