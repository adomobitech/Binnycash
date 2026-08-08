'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Users, UserCheck, UserX, FileText, FileClock, ShieldAlert, 
  Search, Filter, MoreVertical, Eye, ChevronLeft, ChevronRight, Ban, CheckCircle2, X, Loader2
} from 'lucide-react';
import { useCurrency, formatPrice } from '@/hooks/useCurrency';

export default function AdminUsersPage() {
  const router = useRouter();
  const currency = useCurrency();
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [walletAdjustment, setWalletAdjustment] = useState('');
  const [imageErrors, setImageErrors] = useState<{ [key: string]: boolean }>({});

  // Fallback demo data if backend gives 500 error so UI stays active
  const fallbackUsersData = [
    {
      "_id": "6a756e02262b4de9fe9ee3ea",
      "userName": "yogitauser23_6463",
      "email": "yogitauser232@gmail.com",
      "country": "India",
      "countryCode": "IN",
      "status": "DELETE",
      "image": "",
      "risk_score": 100,
      "risk_level": "LOW",
      "createdAt": "2026-08-07T05:32:50.181Z",
      "id": 35,
      "totalAmount": 0
    },
    {
      "_id": "6a6c5f37714b1dfd1156b790",
      "userName": "Yogita4338",
      "email": "yogitagupta21062005@gmail.com",
      "country": "India",
      "countryCode": "IN",
      "status": "ACTIVE",
      "image": "https://lh3.googleusercontent.com/a/ACg8ocJ3hQEgDEqPr8dizVAVnDuOQG0aU6rmHXQdVcljBFQ8aBdA2Q=s96-c",
      "risk_score": 100,
      "risk_level": "LOW",
      "createdAt": "2026-07-31T08:39:19.894Z",
      "id": 33,
      "totalAmount": 0.1
    },
    {
      "_id": "6a6b12a44b6c1bcd6fd43c53",
      "userName": "hargovindbaj_4521",
      "email": "hargovindbajpai2002@gmail.com",
      "country": "India",
      "countryCode": "IN",
      "status": "ACTIVE",
      "image": "/uploads/profile-images/1785921261109-c63tj5.png",
      "risk_score": 100,
      "risk_level": "LOW",
      "createdAt": "2026-07-30T09:00:20.849Z",
      "id": 24,
      "totalAmount": 453.1
    }
  ];

  const fetchUsers = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : '';
    const adminId = typeof window !== 'undefined' ? localStorage.getItem('admin_id') : '';
    
    if (!token) {
      router.push('/admin/login');
      return;
    }

    if (!adminId) {
      // adminId is a required query param for userList — without it the API will reject the request.
      // Re-login so AdminLoginPage can capture and store it.
      console.warn("Missing admin_id in localStorage — redirecting to login to re-capture it.");
      setErrorMsg("Admin session incomplete (missing adminId). Please log in again.");
      setUsers(fallbackUsersData);
      setIsLoading(false);
      return;
    }

    try {
      // Correct endpoint casing: userList (capital 'L') — backend route is case-sensitive
      // adminId is a required query param per API docs
      // page/limit added defensively — backend may 500 if these are missing despite being marked optional in the docs
      const res = await fetch(`https://apitest.binnycash.com/api/admin/userList?adminId=${encodeURIComponent(adminId)}&page=1&limit=20`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      
      const json = await res.json().catch(() => null);
      console.log("User List API Response:", json);

      const list = Array.isArray(json?.data) ? json.data : [];

      if (!res.ok || json?.code !== 200 || list.length === 0) {
        setErrorMsg(json?.message || "Server returned empty list or error. Loaded offline preview.");
        setUsers(fallbackUsersData);
      } else {
        setUsers(list);
      }
    } catch (err: any) {
      console.error("Failed to load users from API:", err);
      setErrorMsg("Network or Server error. Loaded preview data.");
      setUsers(fallbackUsersData);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [router]);

  const handleWalletAdjust = async (userId: string) => {
    const token = localStorage.getItem('admin_token');
    if (!token || !walletAdjustment) return;

    try {
      const res = await fetch('https://apitest.binnycash.com/api/admin/adjest-user-wallet', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userId, amount: Number(walletAdjustment) })
      });
      if (res.ok) {
        alert("Wallet adjusted successfully!");
        setWalletAdjustment('');
        setSelectedUser(null);
        fetchUsers();
      } else {
        alert("Failed to adjust wallet.");
      }
    } catch (err) {
      console.error("Error adjusting wallet:", err);
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
  const highRiskCount = safeUsers.filter(u => (u?.risk_score ?? 100) < 50).length;

  const overviewStats = [
    { title: "Total Users", value: totalUsersCount, trend: "Live Count", trendColor: "text-emerald-400", icon: Users, bgColor: "bg-[#7C3AED]/20", iconColor: "text-[#7C3AED]" },
    { title: "Active Users", value: activeUsersCount, trend: "Operational", trendColor: "text-emerald-400", icon: UserCheck, bgColor: "bg-emerald-500/20", iconColor: "text-emerald-400" },
    { title: "Deleted Users", value: deletedUsersCount, trend: "Marked Delete", trendColor: "text-red-400", icon: UserX, bgColor: "bg-red-500/20", iconColor: "text-red-400" },
    { title: "KYC Submitted", value: kycSubmittedCount, trend: "Verified/Sub", trendColor: "text-blue-400", icon: FileText, bgColor: "bg-blue-500/20", iconColor: "text-blue-400" },
    { title: "KYC Pending", value: kycPendingCount, trend: "Awaiting", trendColor: "text-amber-400", icon: FileClock, bgColor: "bg-amber-500/20", iconColor: "text-amber-400" },
    { title: "High Risk Users", value: highRiskCount, trend: "Security", trendColor: "text-rose-400", icon: ShieldAlert, bgColor: "bg-rose-500/20", iconColor: "text-rose-400" },
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

  const getRiskColor = (level: string) => {
    if (level === 'HIGH') return 'text-red-400 border-red-400/20 bg-red-400/10';
    if (level === 'MEDIUM') return 'text-amber-400 border-amber-400/20 bg-amber-400/10';
    return 'text-emerald-400 border-emerald-400/20 bg-emerald-400/10';
  };

  const resolveImage = (imgSrc: string) => imgSrc && !imgSrc.startsWith('http') ? `https://apitest.binnycash.com${imgSrc}` : imgSrc;

  return (
    <div className="flex flex-col gap-6 text-white w-full max-w-[1600px] mx-auto pb-10 font-sans">
      
      {/* BREADCRUMBS & TITLE */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2 text-xs text-gray-400 font-medium">
          <span>Dashboard</span>
          <span>›</span>
          <span>Users</span>
          <span>›</span>
          <span className="text-white">User List</span>
        </div>
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
        <div className="bg-amber-500/10 border border-amber-500/20 text-amber-400 p-4 rounded-xl flex items-center gap-3">
          <ShieldAlert className="w-5 h-5 shrink-0" />
          <span className="text-sm font-bold">{errorMsg}</span>
        </div>
      )}

      {/* STATS OVERVIEW CARDS */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
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
                <span className={`text-[10px] font-medium mt-1 ${stat.trendColor}`}>{stat.trend}</span>
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
        
        <div className="flex items-end gap-3 ml-auto">
           <button onClick={() => setSearchQuery('')} className="text-gray-400 hover:text-white text-sm font-medium px-3 py-2 transition-colors cursor-pointer">Clear Search</button>
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
                <th className="py-4 px-4 text-center">Risk Score ↕</th>
                <th className="py-4 px-4 text-center">Risk Level ↕</th>
                <th className="py-4 px-4 text-right">Total Amount ↕</th>
                <th className="py-4 px-4 text-right">Joined On ↕</th>
                <th className="py-4 px-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {isLoading ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-gray-500 font-medium">
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
                  const riskScore = u?.risk_score ?? u?.documents?.fraud?.totalScore ?? 100;
                  const riskLevel = u?.risk_level ?? u?.documents?.fraud?.riskLevel ?? 'LOW';
                  const hasImageError = imageErrors[u?._id];

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
                         <div className="flex items-center gap-2">
                            <span className="text-lg leading-none">🇮🇳</span>
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
                      <td className="py-3 px-4 text-center text-gray-300 font-mono">{riskScore}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${getRiskColor(riskLevel)}`}>
                          {riskLevel}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-bold text-emerald-400">
                         {formatPrice(Number(u?.totalAmount || 0), currency)}
                      </td>
                      <td className="py-3 px-4 text-right">
                         <div className="flex flex-col items-end">
                           <span className="text-white text-sm">{joinedDate && !isNaN(joinedDate.getTime()) ? joinedDate.toLocaleDateString() : 'N/A'}</span>
                           <span className="text-xs text-gray-500">{joinedDate && !isNaN(joinedDate.getTime()) ? joinedDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                         </div>
                      </td>
                      <td className="py-3 px-4 text-center">
                         <button 
                           onClick={() => setSelectedUser(u)}
                           className="bg-[#7C3AED]/10 hover:bg-[#7C3AED]/20 text-[#7C3AED] border border-[#7C3AED]/20 px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-sm"
                         >
                           Manage
                         </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-gray-500">No users found in database.</td>
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
              <button className="w-8 h-8 rounded border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/5"><ChevronRight className="w-4 h-4" /></button>
           </div>
        </div>
      </div>

      {/* USER MANAGEMENT MODAL */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#12141C] border border-white/10 w-full max-w-md p-6 rounded-[24px] shadow-xl flex flex-col gap-4 relative">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h3 className="text-lg font-black text-white">Manage User: {selectedUser?.userName}</h3>
              <button onClick={() => setSelectedUser(null)} className="text-gray-400 hover:text-white transition-colors cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Adjust Wallet Balance (+/- amount)</label>
              <div className="flex gap-2">
                <input 
                  type="number"
                  value={walletAdjustment}
                  onChange={(e) => setWalletAdjustment(e.target.value)}
                  placeholder="e.g. 10 or -5"
                  className="flex-1 bg-[#0B0D14] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#7C3AED] transition-all"
                />
                <button 
                  onClick={() => handleWalletAdjust(selectedUser?._id)}
                  className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-colors cursor-pointer shadow-md"
                >
                  Apply
                </button>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-white/10">
              <button 
                onClick={() => setSelectedUser(null)}
                className="bg-transparent hover:bg-white/5 border border-white/10 text-gray-400 hover:text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}