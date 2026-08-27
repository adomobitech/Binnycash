'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ShieldCheck, Clock, CheckCircle2, XCircle, 
  RefreshCcw, AlertCircle, Loader2, Search, Eye, 
  UserCheck, X, Check, FileImage, CreditCard, Smartphone, AlertTriangle, History, CheckCircle, FileText
} from 'lucide-react';

// --- HELPER COMPONENT FOR AUTHENTICATED IMAGES ---
function AuthImage({ src, alt }: { src: string, alt: string }) {
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!src) {
      setIsLoading(false);
      return;
    }

    const token = localStorage.getItem('admin_token');

    fetch(src, {
      method: 'GET',
      headers: {
        ...(token ? { 'Authorization': `Bearer ${token}` } : {})
      }
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to load image');
        return res.blob();
      })
      .then(blob => {
        const objectUrl = URL.createObjectURL(blob);
        setImgSrc(objectUrl);
        setIsLoading(false);
      })
      .catch(err => {
        console.error("AuthImage fetch error, falling back to direct src:", err);
        setImgSrc(src); // Fallback to direct URL if fetch fails
        setIsLoading(false);
      });

    return () => {
      if (imgSrc && imgSrc.startsWith('blob:')) {
        URL.revokeObjectURL(imgSrc);
      }
    };
  }, [src]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-10 text-gray-500 text-xs gap-2">
        <Loader2 className="w-4 h-4 animate-spin text-[#7C3AED]" /> Loading secure document...
      </div>
    );
  }

  if (!imgSrc) {
    return <span className="text-gray-600 text-xs font-medium">No Document Image</span>;
  }

  return (
    <img 
      src={imgSrc} 
      alt={alt} 
      className="w-full h-full max-h-[400px] object-contain bg-black/50 p-2 rounded-xl" 
    />
  );
}

export default function KycDashboardPage() {
  const router = useRouter();
  
  // --- STATES ---
  const [stats, setStats] = useState({
    pendingKyc: 0,
    approvedToday: 0,
    rejectedToday: 0,
    avgReviewTime: "0h 0m"
  });
  const [isStatsLoading, setIsStatsLoading] = useState(true);
  
  // --- TABLE USERS STATES (From verification/users API) ---
  const [users, setUsers] = useState<any[]>([]);
  const [isUsersLoading, setIsUsersLoading] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState('');

  // --- KYC VIEW MODAL STATES ---
  const [isKycModalOpen, setIsKycModalOpen] = useState(false);
  const [isKycLoading, setIsKycLoading] = useState(false);
  const [kycData, setKycData] = useState<any>(null);
  const [currentKycUserId, setCurrentKycUserId] = useState<number | null>(null);

  // --- KYC ACTION STATES ---
  const [actionReason, setActionReason] = useState('');
  const [isActionLoading, setIsActionLoading] = useState(false);

  // 1. Fetch Dashboard Stats
  const fetchKycStats = async () => {
    setIsStatsLoading(true);
    const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : '';
    
    if (!token) {
      router.push('/v9/login');
      return;
    }

    try {
      const res = await fetch(`https://api.binnycash.com/api/admin/kyc/dashboard-stats`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
      });
      const json = await res.json().catch(() => null);

      if (res.ok && json?.code === 200 && json?.data) {
        setStats({
          pendingKyc: json.data.pendingKyc || 0,
          approvedToday: json.data.approvedToday || 0,
          rejectedToday: json.data.rejectedToday || 0,
          avgReviewTime: json.data.avgReviewTime || "0h 0m"
        });
      }
    } catch (err) {
      console.error("Failed to load KYC stats:", err);
    } finally {
      setIsStatsLoading(false);
    }
  };

  // 2. Fetch Users List for KYC Table
  const fetchKycUsersList = async () => {
    setIsUsersLoading(true);
    const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : '';

    if (!token) return;

    try {
      const res = await fetch(`https://api.binnycash.com/api/admin/verification/users?page=1&limit=100`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
      });
      
      const json = await res.json().catch(() => null);
      if (json?.code === 200 && Array.isArray(json?.data?.list)) {
        setUsers(json.data.list);
      } else {
        setUsers([]);
      }
    } catch (err) {
      console.error("Failed to load users for KYC table:", err);
      setUsers([]);
    } finally {
      setIsUsersLoading(false);
    }
  };

  useEffect(() => {
    fetchKycStats();
    fetchKycUsersList();
  }, [router]);

  const handleRefreshAll = () => {
    fetchKycStats();
    fetchKycUsersList();
  };

  // 3. Fetch Detailed KYC Information for Modal
  const handleViewKyc = async (userId: string | number) => {
    setCurrentKycUserId(Number(userId));
    setIsKycModalOpen(true);
    setIsKycLoading(true);
    setKycData(null);
    setActionReason('');
    
    const token = localStorage.getItem('admin_token');

    try {
      const res = await fetch(`https://api.binnycash.com/api/admin/kyc/view?userId=${encodeURIComponent(userId)}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
      });
      const json = await res.json();
      
      if (json?.code === 200 && json?.data) {
        setKycData(json.data);
      } else {
        setKycData({ error: json?.message || 'Failed to fetch KYC details.' });
      }
    } catch (err) {
      console.error("KYC Details fetch error:", err);
      setKycData({ error: 'Network error while fetching KYC documents.' });
    } finally {
      setIsKycLoading(false);
    }
  };

  // 4. ACTION: Approve / Reject / Under Review / Reupload
  const handleKycAction = async (status: 'approved' | 'rejected' | 'under_review' | 'reupload_required') => {
    if (!currentKycUserId) return;
    
    if ((status === 'rejected' || status === 'reupload_required') && actionReason.trim() === '') {
      alert(`Please provide a reason to ${status === 'rejected' ? 'Reject' : 'request Re-Upload'}.`);
      return;
    }

    setIsActionLoading(true);
    const token = localStorage.getItem('admin_token');
    
    const payload = {
      userId: currentKycUserId,
      status: status,
      reason: actionReason.trim()
    };

    try {
      const res = await fetch(`https://api.binnycash.com/api/admin/kyc/approve`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      
      if (res.ok && (json?.code === 200 || json?.type === 'success')) {
        setActionReason(''); 
        await handleViewKyc(currentKycUserId); 
        handleRefreshAll(); 
      } else {
        alert(json?.message || `Failed to update KYC status.`);
      }
    } catch (err) {
      console.error(`KYC Action error (${status}):`, err);
      alert('Network error occurred while performing action.');
    } finally {
      setIsActionLoading(false);
    }
  };

  const safeUsers = Array.isArray(users) ? users : [];
  const filteredUsers = safeUsers.filter(u => {
    const name = u?.name || '';
    const email = u?.email || '';
    const id = u?.userId?.toString() || '';
    const query = searchQuery.toLowerCase();
    return name.toLowerCase().includes(query) || email.toLowerCase().includes(query) || id.includes(query);
  });

  const resolveImage = (imgSrc: string) => {
    if (!imgSrc || imgSrc.trim() === '') return null;
    if (imgSrc.startsWith('http')) return imgSrc;
    const prefix = imgSrc.startsWith('/') ? '' : '/';
    return `https://api.binnycash.com${prefix}${imgSrc}`;
  };

  const statCards = [
    { title: "Pending KYC", value: stats.pendingKyc, desc: "Awaiting review", icon: Clock, color: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20" },
    { title: "Approved Today", value: stats.approvedToday, desc: "Verified last 24h", icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
    { title: "Rejected Today", value: stats.rejectedToday, desc: "Declined last 24h", icon: XCircle, color: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/20" },
    { title: "Avg. Review Time", value: stats.avgReviewTime, desc: "Overall response speed", icon: ShieldCheck, color: "text-[#7C3AED]", bg: "bg-[#7C3AED]/10", border: "border-[#7C3AED]/20" }
  ];

  const getKycColor = (status: string) => {
    const s = String(status || '').toLowerCase();
    if (s === 'approved') return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20';
    if (s === 'rejected' || s === 'failed') return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
    if (s === 'under_review') return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
    if (s === 'reupload_required') return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
    if (s === 'pending' || s === 'submitted') return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
    return 'text-gray-400 bg-gray-800 border-gray-700';
  };

  const doc = kycData?.kycDetails || {};
  const docStatus = (doc?.status || 'pending').toLowerCase();
  const canTakeAction = ['pending', 'submitted', 'under_review'].includes(docStatus);

  const rawDocumentUrl = resolveImage(kycData?.kycDetails?.documentFrontImage);

  return (
    <div className="flex flex-col gap-6 text-white w-full max-w-[1600px] mx-auto pb-10 font-sans">
      
      {/* HEADER */}
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
             <ShieldCheck className="w-6 h-6 text-[#7C3AED]" /> KYC Management
          </h1>
          <p className="text-sm text-gray-400 mt-1">Review, approve, and manage user verification documents.</p>
        </div>
        <button 
          onClick={handleRefreshAll} 
          disabled={isStatsLoading || isUsersLoading}
          className="flex items-center gap-2 bg-[#12141C] hover:bg-white/5 border border-white/10 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors shadow-sm disabled:opacity-50 cursor-pointer"
        >
          <RefreshCcw className={`w-4 h-4 ${(isStatsLoading || isUsersLoading) ? 'animate-spin' : ''}`} /> Refresh Data
        </button>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-[#12141C] border border-white/5 rounded-2xl p-5 shadow-sm hover:border-white/10 transition-all flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${stat.bg} ${stat.border}`}>
                <Icon className={`w-6 h-6 ${stat.color}`} />
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">{stat.title}</span>
                <span className="text-2xl font-black text-white mt-1">
                  {isStatsLoading ? <Loader2 className="w-5 h-5 animate-spin text-gray-500 mt-1" /> : stat.value}
                </span>
                <span className="text-[10px] text-gray-500 mt-0.5">{stat.desc}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* SEARCH BAR */}
      <div className="flex flex-wrap items-center gap-4 bg-[#12141C] p-4 rounded-xl border border-white/5 mt-2">
        <div className="relative flex-1 min-w-[200px] max-w-md">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
           <input 
             type="text" 
             value={searchQuery}
             onChange={(e) => setSearchQuery(e.target.value)}
             placeholder="Search by ID, Name, or Email..." 
             className="w-full bg-[#0B0D14] border border-white/10 rounded-lg pl-9 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#7C3AED] transition-colors"
           />
        </div>
      </div>

      {/* KYC TABLE */}
      <div className="bg-[#12141C] border border-white/5 rounded-xl overflow-hidden shadow-sm">
        <div className="p-5 border-b border-white/5 flex items-center justify-between">
           <h3 className="text-lg font-bold text-white">KYC Applications</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse whitespace-nowrap">
            <thead>
              <tr className="border-b border-white/10 text-gray-400 text-xs font-bold uppercase tracking-wider bg-[#161821]">
                <th className="py-4 px-5">User ID</th>
                <th className="py-4 px-4">User Details</th>
                <th className="py-4 px-4">Document Type</th>
                <th className="py-4 px-4 text-center">KYC Status</th>
                <th className="py-4 px-4 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {isUsersLoading ? (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-gray-500 font-medium">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#7C3AED]" /> Loading users...
                  </td>
                </tr>
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map((u: any, idx: number) => {
                  const uDocStatus = u?.kycStatus || 'not_submited';
                  const docType = u?.documentType || 'Not Provided';
                  const firstLetter = (u?.name || 'U').charAt(0).toUpperCase();

                  return (
                    <tr key={u?.userId || idx} className="hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 px-5 text-gray-400 font-mono">#{u?.userId}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-[#7C3AED]/20 border border-[#7C3AED]/40 flex items-center justify-center text-[#7C3AED] font-bold text-sm shrink-0">
                            {firstLetter}
                          </div>
                          <div className="flex flex-col">
                            <span className="font-medium text-white">{u?.name || 'Unknown'}</span>
                            <span className="text-xs text-gray-500">{u?.email || 'N/A'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-gray-300 font-medium">
                        {docType === '' ? 'Not Provided' : docType}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <span className={`text-[10px] font-bold uppercase tracking-wider border px-2.5 py-1 rounded ${getKycColor(uDocStatus)}`}>
                          {uDocStatus.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button 
                          onClick={() => handleViewKyc(u?.userId)}
                          className="bg-[#7C3AED]/10 hover:bg-[#7C3AED]/20 text-[#7C3AED] border border-[#7C3AED]/20 px-4 py-2 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-2 text-xs font-bold mx-auto"
                        >
                          <Eye className="w-4 h-4" /> Review
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="py-16 text-center text-gray-500">No matching users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- KYC REVIEW MODAL --- */}
      {isKycModalOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#12141C] border border-white/10 w-full max-w-5xl p-6 rounded-[24px] shadow-2xl relative my-auto max-h-[95vh] overflow-y-auto custom-scrollbar flex flex-col">
            
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4 sticky top-0 bg-[#12141C] z-10 shrink-0">
              <h3 className="text-xl font-black text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-[#7C3AED]" /> KYC Application Review
              </h3>
              <button onClick={() => setIsKycModalOpen(false)} className="text-gray-400 hover:text-white bg-white/5 p-1.5 rounded-lg cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {isKycLoading ? (
              <div className="py-24 flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-[#7C3AED]" />
                <span className="text-gray-400 text-sm font-medium">Fetching secure documents & intelligence...</span>
              </div>
            ) : kycData?.error ? (
              <div className="py-10 text-center text-red-400 bg-red-500/10 rounded-xl border border-red-500/20 p-4">
                <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                <p>{kycData.error}</p>
              </div>
            ) : (
              <div className="flex flex-col gap-6 flex-1">
                
                {kycData?.similarAccounts?.length > 0 && (
                  <div className="bg-rose-500/10 border border-rose-500/30 rounded-xl p-4 flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-rose-500 font-bold">
                      <AlertTriangle className="w-5 h-5" />
                      <h4>Fraud Warning: Connected Accounts Detected!</h4>
                    </div>
                    <ul className="text-sm text-rose-400/90 list-disc list-inside ml-6 space-y-1">
                      {kycData.similarAccounts.map((acc: any, i: number) => (
                        <li key={i}>Matched by <strong className="text-white">{acc.matchType}</strong>: {acc.user || 'User'} ({acc.email})</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="bg-[#0B0D14] border border-white/5 rounded-xl p-5 shadow-inner flex flex-col gap-3">
                     <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2 border-b border-white/5 pb-2">
                       <UserCheck className="w-4 h-4" /> Personal Details
                     </h4>
                     <div className="grid grid-cols-2 gap-y-3 text-sm">
                       <div><p className="text-gray-500 text-[10px] uppercase">Name</p><p className="font-bold">{kycData?.userInfo?.name || 'N/A'}</p></div>
                       <div><p className="text-gray-500 text-[10px] uppercase">User ID</p><p className="font-mono text-[#7C3AED]">#{kycData?.userInfo?.userId || 'N/A'}</p></div>
                       <div className="col-span-2"><p className="text-gray-500 text-[10px] uppercase">Email</p><p>{kycData?.userInfo?.email || 'N/A'}</p></div>
                       <div><p className="text-gray-500 text-[10px] uppercase">Country</p><p>{kycData?.userInfo?.country || 'N/A'}</p></div>
                       <div><p className="text-gray-500 text-[10px] uppercase">Registered</p><p>{kycData?.userInfo?.registeredAt ? new Date(kycData.userInfo.registeredAt).toLocaleDateString() : 'N/A'}</p></div>
                     </div>
                  </div>

                  <div className="flex flex-col gap-4">
                    <div className="bg-[#0B0D14] border border-white/5 rounded-xl p-4 shadow-inner flex flex-col gap-4">
                      
                      <div className="flex gap-4 items-center">
                        <div className="w-12 h-12 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 shrink-0">
                          <CreditCard className="w-6 h-6" />
                        </div>
                        <div className="flex-1">
                          <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Document Applied</p>
                          <p className="text-sm font-bold text-white">{kycData?.kycDetails?.documentType || 'Not Provided'}</p>
                          <p className="text-xs font-mono text-emerald-400 mt-0.5">{kycData?.kycDetails?.documentNumber || 'N/A'}</p>
                        </div>
                        <div className="text-right">
                          <span className={`px-2.5 py-1 text-[10px] font-bold uppercase rounded border ${getKycColor(docStatus)}`}>
                            {docStatus.replace('_', ' ')}
                          </span>
                        </div>
                      </div>

                      {kycData?.kycDetails?.reason && (
                        <div className={`p-3 rounded-xl border text-sm font-medium ${
                          docStatus === 'rejected' || docStatus === 'failed' ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' :
                          'bg-amber-500/10 border-amber-500/20 text-amber-400'
                        }`}>
                          <span className="block text-[10px] font-bold uppercase tracking-wider mb-1 opacity-70">Admin Reason / Note</span>
                          {kycData.kycDetails.reason}
                        </div>
                      )}
                    </div>

                    <div className="bg-[#0B0D14] border border-white/5 rounded-xl p-4 flex flex-col gap-2">
                      <h4 className="text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5"><Smartphone className="w-3 h-3"/> Device Fingerprint</h4>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-400">IP Address:</span><span className="text-white font-mono">{kycData?.deviceInfo?.ipAddress || 'Unknown'}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-400">Fingerprint:</span><span className="text-white font-mono">{kycData?.deviceInfo?.deviceFingerprint || 'Unknown'}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* --- DOCUMENT IMAGE & TIMELINE (USING AUTH IMAGE HELPER) --- */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  
                  <div className="lg:col-span-2 flex flex-col gap-2">
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                      <FileImage className="w-4 h-4" /> Document Image
                    </span>
                    <div className="bg-[#0B0D14] border border-white/10 rounded-xl overflow-hidden min-h-[280px] max-h-[420px] flex items-center justify-center relative group">
                      
                      {/* 🔥 AUTHENTICATED BLOB IMAGE LOADER 🔥 */}
                      <AuthImage 
                        src={rawDocumentUrl || ''} 
                        alt="KYC Document" 
                      />

                      {rawDocumentUrl && (
                        <a 
                          href={rawDocumentUrl} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity text-white text-sm font-bold cursor-pointer rounded-xl"
                        >
                          Open Full Screen
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="bg-[#0B0D14] border border-white/5 rounded-xl p-4 flex flex-col">
                    <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2 border-b border-white/5 pb-3 mb-4">
                      <History className="w-4 h-4" /> Activity Timeline
                    </h4>
                    <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar max-h-[280px]">
                      {kycData?.activityTimeline?.length > 0 ? (
                        <div className="border-l border-white/10 ml-2 space-y-4 pb-2">
                          {kycData.activityTimeline.map((event: any, i: number) => (
                            <div key={i} className="relative pl-4">
                              <span className="absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full bg-[#7C3AED] ring-4 ring-[#0B0D14]"></span>
                              <p className="text-xs font-bold text-white">{event.title}</p>
                              <p className="text-[10px] text-gray-500 mt-0.5">{event.description}</p>
                              <p className="text-[9px] text-gray-600 mt-1 font-mono">{new Date(event.createdAt).toLocaleString()}</p>
                            </div>
                          ))}
                        </div>
                      ) : <span className="text-xs text-gray-500">No activity recorded.</span>}
                    </div>
                  </div>

                </div>

                {/* DYNAMIC ACTION BAR */}
                {canTakeAction ? (
                  <div className="mt-2 pt-6 border-t border-white/10 flex flex-col xl:flex-row justify-between items-center gap-4 sticky bottom-0 bg-[#12141C] py-2 shrink-0">
                     <div className="w-full xl:w-2/5 flex items-center gap-2">
                       <input 
                         type="text" 
                         value={actionReason}
                         onChange={(e) => setActionReason(e.target.value)}
                         placeholder="Required for Rejection or Re-upload..."
                         className="w-full bg-[#0B0D14] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#7C3AED] transition-colors placeholder:text-rose-500/50"
                       />
                       {isActionLoading && <Loader2 className="w-5 h-5 animate-spin text-[#7C3AED] shrink-0" />}
                     </div>
                     <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto justify-end">
                       <button onClick={() => handleKycAction('rejected')} disabled={isActionLoading} className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/20 px-5 py-3 rounded-xl font-bold text-sm transition-colors cursor-pointer shadow-sm disabled:opacity-50">
                         <X className="w-4 h-4" /> Reject
                       </button>
                       <button onClick={() => handleKycAction('reupload_required')} disabled={isActionLoading} className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/20 px-5 py-3 rounded-xl font-bold text-sm transition-colors cursor-pointer shadow-sm disabled:opacity-50">
                         <RefreshCcw className="w-4 h-4" /> Re-Upload
                       </button>
                       <button onClick={() => handleKycAction('under_review')} disabled={isActionLoading} className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 px-5 py-3 rounded-xl font-bold text-sm transition-colors cursor-pointer shadow-sm disabled:opacity-50">
                         <Clock className="w-4 h-4" /> Under Review
                       </button>
                       <button onClick={() => handleKycAction('approved')} disabled={isActionLoading} className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-black px-7 py-3 rounded-xl font-bold text-sm transition-colors cursor-pointer shadow-md disabled:opacity-50">
                         <Check className="w-4 h-4" /> Approve
                       </button>
                     </div>
                  </div>
                ) : (
                  <div className="mt-2 pt-6 border-t border-white/10 sticky bottom-0 bg-[#12141C] py-2 shrink-0 flex justify-center">
                    <div className={`px-8 py-4 rounded-xl border flex items-center justify-center gap-3 font-black text-sm uppercase tracking-wider w-full md:w-auto ${getKycColor(docStatus)}`}>
                       {docStatus === 'approved' ? <CheckCircle className="w-5 h-5" /> : docStatus === 'rejected' ? <XCircle className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                       KYC is marked as {docStatus.replace('_', ' ')}
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