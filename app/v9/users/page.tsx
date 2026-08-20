'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Users, UserCheck, UserX, FileText, FileClock, 
  Search, Eye, ChevronLeft, ChevronRight, X, Loader2, Mail, MapPin, Phone, ShieldCheck,
  Gift, Share2, History, MonitorSmartphone, Wallet, AlertCircle, Clock, Info, ShieldAlert, Layers, Star
} from 'lucide-react';
import { useCurrency, formatPrice } from '@/hooks/useCurrency';

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

  const fetchUsers = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : '';
    const adminId = typeof window !== 'undefined' ? localStorage.getItem('admin_id') : '';
    
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
      const res = await fetch(`https://apitest.binnycash.com/api/admin/userList?adminId=${encodeURIComponent(adminId)}&page=1&limit=50`, {
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

  // 🔥 GET USER DETAILED PROFILE API
  const handleViewProfile = async (numericId: string | number) => {
    setIsProfileModalOpen(true);
    setIsProfileLoading(true);
    setProfileData(null);
    setProfileTab('overview'); 
    
    const token = localStorage.getItem('admin_token');
    
    try {
      const res = await fetch(`https://apitest.binnycash.com/api/admin/detail/${encodeURIComponent(numericId)}`, {
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
  const kycSubmittedCount = safeUsers.filter(u => u?.documents?.status === 'approved' || u?.documents?.status === 'submitted').length;
  const kycPendingCount = safeUsers.filter(u => u?.documents?.status === 'not_submited' || !u?.documents?.status).length;

  const overviewStats = [
    { title: "Total Users", value: totalUsersCount, trend: "Live Count", trendColor: "text-emerald-400", icon: Users, bgColor: "bg-[#7C3AED]/20", iconColor: "text-[#7C3AED]" },
    { title: "Active Users", value: activeUsersCount, trend: "Operational", trendColor: "text-emerald-400", icon: UserCheck, bgColor: "bg-emerald-500/20", iconColor: "text-emerald-400" },
    { title: "Deleted Users", value: deletedUsersCount, trend: "Marked Delete", trendColor: "text-red-400", icon: UserX, bgColor: "bg-red-500/20", iconColor: "text-red-400" },
    { title: "KYC Submitted", value: kycSubmittedCount, trend: "Verified/Sub", trendColor: "text-blue-400", icon: FileText, bgColor: "bg-blue-500/20", iconColor: "text-blue-400" },
    { title: "KYC Pending", value: kycPendingCount, trend: "Awaiting", trendColor: "text-amber-400", icon: FileClock, bgColor: "bg-amber-500/20", iconColor: "text-amber-400" },
  ];

  const getStatusColor = (status: string) => status === 'ACTIVE' ? 'text-emerald-400 border-emerald-400/20 bg-emerald-400/10' : 'text-red-400 border-red-400/20 bg-red-400/10';
  
  const getKycStatusText = (docStatus: string) => {
    if (docStatus === 'approved') return 'Approved';
    if (docStatus === 'submitted') return 'Pending';
    return 'Not Submitted';
  };

  const getKycColor = (docStatus: string) => {
    if (docStatus === 'approved') return 'text-emerald-400';
    if (docStatus === 'submitted') return 'text-amber-400';
    return 'text-gray-400';
  };

  // Image resolution fallback
  const resolveImage = (imgSrc: string) => {
    if (!imgSrc || imgSrc.trim() === '') return null;
    return !imgSrc.startsWith('http') ? `https://apitest.binnycash.com${imgSrc}` : imgSrc;
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
                  const userName = u?.userName || 'Unnamed User';
                  const firstLetter = userName.charAt(0).toUpperCase();
                  const displayId = u?.id || idx + 1;
                  const joinedDate = u?.createdAt ? new Date(u.createdAt) : null;
                  const docStatus = u?.documents?.status || 'not_submited';
                  const hasImageError = imageErrors[u?._id];

                  return (
                    <tr key={u?._id || idx} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="py-3 px-5 text-gray-400 font-mono">{displayId}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          {/* Image rendering with error fallback */}
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
                         <div className="flex items-center gap-2">
                            <span className="text-lg leading-none">🌍</span>
                            <div className="flex flex-col">
                               <span className="text-sm text-white">{u?.country || 'India'}</span>
                               <span className="text-xs text-gray-500">{u?.countryCode || 'IN'}</span>
                            </div>
                         </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-block px-2.5 py-1 rounded text-[10px] font-bold border uppercase tracking-wider ${getStatusColor(u?.status)}`}>
                          {u?.status || 'ACTIVE'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`text-xs font-medium border px-2 py-0.5 rounded border-white/10 bg-white/5 ${getKycColor(docStatus)}`}>
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
                      <td className="py-3 px-4">
                         <div className="flex items-center justify-center gap-2">
                            <button 
                              onClick={() => handleViewProfile(u?.id)}
                              className="bg-[#7C3AED]/10 hover:bg-[#7C3AED]/20 text-[#7C3AED] border border-[#7C3AED]/20 px-4 py-2 rounded-lg transition-colors cursor-pointer flex items-center gap-2 text-xs font-bold"
                              title="View Full Profile Details"
                            >
                              <Eye className="w-4 h-4" /> View Details
                            </button>
                            {/* 🔥 MANAGE BUTTON REMOVED COMPLETELY */}
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

      {/* --- MODAL: DETAILED USER PROFILE (DYNAMIC JSON) --- */}
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
                          <span className="text-xs text-gray-400 flex items-center gap-1"><MapPin className="w-3 h-3"/> {profileData?.country || 'Unknown'}</span>
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

    </div>
  );
}