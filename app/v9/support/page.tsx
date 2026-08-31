'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LifeBuoy, Search, FileText, X, Eye, 
  Loader2, CheckCircle2, AlertCircle, RefreshCcw, 
  User, Mail, MapPin, Monitor, Wallet, Clock, Send, UploadCloud,
  Inbox, AlertTriangle, Users, Repeat, CheckCircle,
  Activity, ShieldCheck, StickyNote
} from 'lucide-react';

function AdminSupportContent() {
  const router = useRouter();

  // --- STATES ---
  const [isAuthChecking, setIsAuthChecking] = useState(true);
  const [tickets, setTickets] = useState<any[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  // Stats States
  const [stats, setStats] = useState<any>(null);
  const [isStatsLoading, setIsStatsLoading] = useState(true);

  // View Modal States
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [userInfo, setUserInfo] = useState<any>(null);
  
  // Reply States
  const [replyMessage, setReplyMessage] = useState('');
  const [replyImage, setReplyImage] = useState<File | null>(null);
  const [isReplying, setIsReplying] = useState(false);

  // Status Update State
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // --- INTERNAL NOTES STATES ---
  const [internalNoteText, setInternalNoteText] = useState('');
  const [isAddingNote, setIsAddingNote] = useState(false);

  // --- AUTH GUARD ---
  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      router.push('/v9/login');
    } else {
      setIsAuthChecking(false);
    }
  }, [router]);

  // --- FETCH DASHBOARD STATS ---
  const fetchStats = async () => {
    setIsStatsLoading(true);
    const token = localStorage.getItem('admin_token') || '';
    try {
      const res = await fetch(`https://api.binnycash.com/api/admin/adminTicketDashboardStats`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const json = await res.json().catch(() => null);
      if (res.ok && json?.code === 200 && json?.data) {
        setStats(json.data);
      }
    } catch (err) {
      console.error("Failed to fetch stats", err);
    } finally {
      setIsStatsLoading(false);
    }
  };

  // --- FETCH TICKETS LIST ---
  const fetchTickets = async () => {
    setIsLoadingList(true);
    setListError(null);
    const token = localStorage.getItem('admin_token') || '';

    try {
      const res = await fetch(`https://api.binnycash.com/api/admin/adminTicketList`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const json = await res.json().catch(() => null);

      if (res.ok && json?.code === 200 && json?.data?.tickets) {
        setTickets(json.data.tickets);
      } else {
        setListError(json?.message || "Failed to load tickets.");
      }
    } catch (err) {
      setListError("Network error while fetching tickets.");
    } finally {
      setIsLoadingList(false);
    }
  };

  useEffect(() => {
    if (!isAuthChecking) {
      fetchTickets();
      fetchStats();
    }
  }, [isAuthChecking]);

  // --- VIEW TICKET DETAILS ---
  const handleViewTicket = async (ticketId: string | number) => {
    setIsViewModalOpen(true);
    setIsDetailLoading(true);
    setSelectedTicket(null);
    setUserInfo(null);
    setInternalNoteText(''); // Naya ticket kholne pe form reset kar do

    const token = localStorage.getItem('admin_token') || '';

    try {
      const res = await fetch(`https://api.binnycash.com/api/admin/adminViewTicket?ticketId=${ticketId}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const json = await res.json().catch(() => null);

      if (res.ok && json?.code === 200 && json?.data) {
        setSelectedTicket(json.data.ticket);
        setUserInfo(json.data.userInformation);
      } else {
        alert(json?.message || "Failed to load ticket details.");
        setIsViewModalOpen(false);
      }
    } catch (err) {
      alert("Network error while fetching details.");
      setIsViewModalOpen(false);
    } finally {
      setIsDetailLoading(false);
    }
  };

  // --- REPLY TICKET API ---
  const handleAdminReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyMessage.trim() || !selectedTicket?.ticketId) return;
    setIsReplying(true);
    
    const token = localStorage.getItem('admin_token') || '';
    
    try {
      // Isme image upload ho sakti hai isliye isko FormData me hi rakhenge
      const fd = new FormData();
      fd.append('ticketId', selectedTicket.ticketId.toString());
      fd.append('replyMessage', replyMessage.trim());
      if (replyImage) {
        fd.append('image', replyImage);
      }

      const res = await fetch('https://api.binnycash.com/api/admin/replyTicket', {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
        body: fd
      });

      const json = await res.json().catch(() => null);

      if (res.ok || json?.code === 200) {
        setReplyMessage('');
        setReplyImage(null);
        // Refresh the thread to show the new message
        handleViewTicket(selectedTicket.ticketId);
        fetchStats(); 
      } else {
        alert(json?.message || "Failed to send reply.");
      }
    } catch (err) {
      alert("Network error while sending reply.");
    } finally {
      setIsReplying(false);
    }
  };

  // --- UPDATE STATUS API ---
  const handleStatusUpdate = async (newStatus: string) => {
    if (!selectedTicket?.ticketId) return;
    if (!window.confirm(`Are you sure you want to mark this ticket as ${newStatus}?`)) return;

    setIsUpdatingStatus(true);
    const token = localStorage.getItem('admin_token') || '';

    try {
      const bodyParams = new URLSearchParams();
      bodyParams.append('ticketId', selectedTicket.ticketId.toString());
      bodyParams.append('status', newStatus);

      const res = await fetch('https://api.binnycash.com/api/admin/updateTicketStatus', {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/x-www-form-urlencoded' 
        },
        body: bodyParams
      });

      const json = await res.json().catch(() => null);

      if (res.ok || json?.code === 200) {
        setSelectedTicket({ ...selectedTicket, status: newStatus });
        fetchTickets();
        fetchStats();
      } else {
        alert(json?.message || "Failed to update status.");
      }
    } catch (err) {
      alert("Network error while updating status.");
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // --- ADD INTERNAL NOTE API ---
  const handleAddInternalNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket?.ticketId || !internalNoteText.trim()) return;

    setIsAddingNote(true);
    const token = localStorage.getItem('admin_token') || '';

    try {
      const bodyParams = new URLSearchParams();
      bodyParams.append('ticketId', selectedTicket.ticketId.toString());
      bodyParams.append('note', internalNoteText.trim());

      const res = await fetch('https://api.binnycash.com/api/admin/addInternalNote', {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: bodyParams
      });

      const json = await res.json().catch(() => null);

      if (res.ok || json?.code === 200) {
        // Refresh ticket to get the newly added note in the UI
        handleViewTicket(selectedTicket.ticketId);
        setInternalNoteText('');
      } else {
        alert(json?.message || "Failed to add internal note.");
      }
    } catch (err) {
      alert("Network error while adding internal note.");
    } finally {
      setIsAddingNote(false);
    }
  };

  // Helper for Attachments
  const getAttachmentUrl = (path: string) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `https://api.binnycash.com${cleanPath}`;
  };

  // Status Badge Colors
  const getStatusBadge = (status: string) => {
    switch (status?.toUpperCase()) {
      case 'OPEN': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'CLOSED': return 'bg-gray-500/10 text-gray-400 border-gray-500/30';
      case 'RESOLVED': return 'bg-purple-500/10 text-purple-400 border-purple-500/30';
      case 'PENDING': return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      default: return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
    }
  };

  // Priority Badge Colors
  const getPriorityBadge = (priority: string) => {
    switch (priority?.toUpperCase()) {
      case 'HIGH': return 'text-rose-400 bg-rose-500/10 border-rose-500/20';
      case 'MEDIUM': return 'text-amber-400 bg-amber-500/10 border-amber-500/20';
      case 'LOW': return 'text-blue-400 bg-blue-500/10 border-blue-500/20';
      default: return 'text-gray-400 bg-gray-500/10 border-gray-500/20';
    }
  };

  if (isAuthChecking) {
    return (
      <div className="min-h-screen bg-[#07080F] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-[#3B82F6] animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 text-white w-full max-w-[1400px] mx-auto pb-10 font-sans relative">
      
      {/* --- HEADER --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-white/10 pb-5 gap-4">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3 tracking-tight">
             <LifeBuoy className="w-8 h-8 text-[#3B82F6]" /> 
             Support Desk Management
          </h1>
          <p className="text-sm text-[#8F95A3] mt-2">
            View, manage, and reply to user support tickets securely.
          </p>
        </div>
        <button 
          onClick={() => { fetchTickets(); fetchStats(); }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-bold transition-colors cursor-pointer"
        >
          <RefreshCcw className={`w-4 h-4 ${isLoadingList || isStatsLoading ? 'animate-spin text-[#3B82F6]' : 'text-gray-400'}`} /> Refresh Dashboard
        </button>
      </div>

      {/* --- DASHBOARD STATS GRID --- */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-[#12141C] border border-white/5 p-4 rounded-2xl flex flex-col gap-2 shadow-lg">
          <div className="flex items-center gap-2 text-gray-400 text-xs font-bold uppercase tracking-wider"><Inbox className="w-4 h-4 text-blue-400" /> Open Tickets</div>
          <span className="text-2xl font-black text-white">{isStatsLoading ? '-' : stats?.openTickets || 0}</span>
        </div>
        <div className="bg-[#12141C] border border-white/5 p-4 rounded-2xl flex flex-col gap-2 shadow-lg">
          <div className="flex items-center gap-2 text-gray-400 text-xs font-bold uppercase tracking-wider"><AlertTriangle className="w-4 h-4 text-rose-400" /> High Priority</div>
          <span className="text-2xl font-black text-white">{isStatsLoading ? '-' : stats?.highPriority || 0}</span>
        </div>
        <div className="bg-[#12141C] border border-white/5 p-4 rounded-2xl flex flex-col gap-2 shadow-lg">
          <div className="flex items-center gap-2 text-gray-400 text-xs font-bold uppercase tracking-wider"><Clock className="w-4 h-4 text-amber-400" /> Waiting Admin</div>
          <span className="text-2xl font-black text-white">{isStatsLoading ? '-' : stats?.waitingAdmin || 0}</span>
        </div>
        <div className="bg-[#12141C] border border-white/5 p-4 rounded-2xl flex flex-col gap-2 shadow-lg">
          <div className="flex items-center gap-2 text-gray-400 text-xs font-bold uppercase tracking-wider"><Users className="w-4 h-4 text-emerald-400" /> Waiting User</div>
          <span className="text-2xl font-black text-white">{isStatsLoading ? '-' : stats?.waitingUser || 0}</span>
        </div>
        <div className="bg-[#12141C] border border-white/5 p-4 rounded-2xl flex flex-col gap-2 shadow-lg">
          <div className="flex items-center gap-2 text-gray-400 text-xs font-bold uppercase tracking-wider"><Repeat className="w-4 h-4 text-purple-400" /> Reopened</div>
          <span className="text-2xl font-black text-white">{isStatsLoading ? '-' : stats?.reopen || 0}</span>
        </div>
        <div className="bg-[#12141C] border border-white/5 p-4 rounded-2xl flex flex-col gap-2 shadow-lg">
          <div className="flex items-center gap-2 text-gray-400 text-xs font-bold uppercase tracking-wider"><CheckCircle className="w-4 h-4 text-emerald-500" /> Resolved Today</div>
          <span className="text-2xl font-black text-white">{isStatsLoading ? '-' : stats?.resolvedToday || 0}</span>
        </div>
      </div>

      {/* --- TICKET LIST TABLE --- */}
      <div className="bg-[#12141C] border border-white/5 rounded-2xl overflow-hidden shadow-xl mt-2">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse whitespace-nowrap min-w-[1000px]">
            <thead>
              <tr className="border-b border-white/10 text-[10px] font-bold text-gray-400 uppercase tracking-widest bg-[#161821]">
                <th className="py-4 px-6">Ticket ID</th>
                <th className="py-4 px-6">User & Subject</th>
                <th className="py-4 px-6">Category</th>
                <th className="py-4 px-6 text-center">Priority</th>
                <th className="py-4 px-6 text-center">Status</th>
                <th className="py-4 px-6">Created Date</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {isLoadingList ? (
                <tr><td colSpan={7} className="py-20 text-center"><Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-[#3B82F6]" /><span className="text-gray-400 font-bold">Loading Tickets...</span></td></tr>
              ) : listError ? (
                <tr><td colSpan={7} className="py-20 text-center text-rose-400"><AlertCircle className="w-8 h-8 mx-auto mb-3" />{listError}</td></tr>
              ) : tickets.length > 0 ? (
                tickets.map((t) => (
                  <tr key={t._id} className="hover:bg-white/[0.02] transition-colors align-middle">
                    <td className="py-4 px-6 font-mono text-xs text-[#3B82F6] font-bold">
                      #{t.ticketId}
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex flex-col">
                        <span className="font-bold text-white text-sm">{t.subject}</span>
                        <span className="text-[11px] text-gray-500 flex items-center gap-1 mt-0.5"><User className="w-3 h-3" /> {t.name} (ID: {t.userId})</span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-xs font-bold text-gray-300 bg-white/5 px-2.5 py-1 rounded-lg border border-white/10">{t.category}</span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase border tracking-wider ${getPriorityBadge(t.priority)}`}>
                        {t.priority}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase border tracking-wider ${getStatusBadge(t.status)}`}>
                        {t.status === 'OPEN' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
                        {t.status}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-xs text-gray-400 font-mono">
                      {new Date(t.createdAt).toLocaleString()}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button 
                        onClick={() => handleViewTicket(t.ticketId)}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#3B82F6]/10 hover:bg-[#3B82F6]/20 text-[#3B82F6] border border-[#3B82F6]/20 text-xs font-bold transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" /> View Thread
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan={7} className="py-24 text-center text-gray-500"><FileText className="w-12 h-12 mx-auto mb-3 opacity-20" /><p>No support tickets found.</p></td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* --- VIEW TICKET MODAL --- */}
      <AnimatePresence>
        {isViewModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-[#12141C] border border-white/10 w-full max-w-[1300px] h-[95vh] rounded-[32px] overflow-hidden shadow-2xl flex flex-col relative"
            >
              {/* MODAL HEADER */}
              <div className="p-5 border-b border-white/5 bg-[#161821] flex justify-between items-center shrink-0">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-[#3B82F6]/10 border border-[#3B82F6]/20 flex items-center justify-center text-[#3B82F6]">
                    <LifeBuoy className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-white flex items-center gap-2">
                      Ticket #{selectedTicket?.ticketId || 'Loading...'}
                    </h2>
                    <span className="text-[10px] text-gray-400 uppercase tracking-widest">{selectedTicket?.category || 'Category'}</span>
                  </div>
                </div>
                <button onClick={() => setIsViewModalOpen(false)} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {isDetailLoading ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-4">
                  <Loader2 className="w-10 h-10 animate-spin text-[#3B82F6]" />
                  <span className="text-gray-400 font-bold">Decrypting ticket details...</span>
                </div>
              ) : (
                <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                  
                  {/* LEFT: CHAT THREAD & REPLY */}
                  <div className="flex-1 flex flex-col border-r border-white/5 bg-[#0B0D14] overflow-hidden">
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
                      {selectedTicket?.messages?.length > 0 ? (
                        selectedTicket.messages.map((msg: any, idx: number) => {
                          const isUser = msg.userType?.toUpperCase() === 'USER';
                          return (
                            <div key={msg._id || idx} className={`flex ${isUser ? 'justify-start' : 'justify-end'}`}>
                              <div className={`max-w-[85%] p-4 rounded-2xl text-sm space-y-2 shadow-md ${
                                isUser 
                                  ? 'bg-[#1A1C24] border border-white/5 rounded-bl-sm text-gray-200' 
                                  : 'bg-[#3B82F6]/10 border border-[#3B82F6]/20 rounded-br-sm text-white' 
                              }`}>
                                <div className="flex justify-between items-center gap-6 mb-1">
                                  <span className={`font-bold text-xs ${isUser ? 'text-gray-300' : 'text-[#3B82F6]'}`}>
                                    {isUser ? msg.userName || 'User' : 'Support Agent (You)'}
                                  </span>
                                  <span className="text-[10px] font-mono text-gray-500">
                                    {new Date(msg.createdAt).toLocaleString()}
                                  </span>
                                </div>
                                <p className="leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                                
                                {msg.image && (
                                  <a href={getAttachmentUrl(msg.image)} target="_blank" rel="noreferrer" className="block mt-3">
                                    <img src={getAttachmentUrl(msg.image)} alt="Attachment" className="max-h-52 rounded-xl object-contain border border-white/10 hover:opacity-80 transition-opacity" />
                                  </a>
                                )}
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="h-full flex items-center justify-center text-gray-500 italic text-sm">No messages found.</div>
                      )}
                    </div>

                    {/* REPLY BOX */}
                    <div className="p-4 bg-[#161821] border-t border-white/5 shrink-0">
                      {selectedTicket?.status === 'CLOSED' ? (
                        <div className="text-center p-3 text-rose-400 bg-rose-500/10 border border-rose-500/20 rounded-xl text-sm font-bold">
                          This ticket is CLOSED. You cannot reply.
                        </div>
                      ) : (
                        <form onSubmit={handleAdminReply} className="flex flex-col gap-3">
                          <textarea 
                            rows={3} 
                            placeholder="Type your official reply here..." 
                            value={replyMessage}
                            onChange={(e) => setReplyMessage(e.target.value)}
                            className="w-full bg-[#0B0D14] border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-[#3B82F6] resize-none custom-scrollbar"
                            required
                          />
                          <div className="flex justify-between items-center">
                            <label className="flex items-center gap-2 cursor-pointer hover:bg-white/5 px-3 py-1.5 rounded-lg transition-colors">
                              <UploadCloud className="w-4 h-4 text-gray-400" />
                              <span className="text-xs text-gray-400 font-bold max-w-[150px] truncate">{replyImage ? replyImage.name : 'Attach File'}</span>
                              <input type="file" className="hidden" accept="image/*" onChange={(e) => setReplyImage(e.target.files ? e.target.files[0] : null)} />
                            </label>
                            <button 
                              type="submit" 
                              disabled={isReplying}
                              className="bg-[#3B82F6] hover:bg-blue-600 text-white text-xs font-bold px-6 py-2.5 rounded-xl shadow-lg shadow-[#3B82F6]/20 transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
                            >
                              {isReplying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />} Send Reply
                            </button>
                          </div>
                        </form>
                      )}
                    </div>
                  </div>

                  {/* RIGHT: USER INFORMATION & INTERNAL NOTES PANEL */}
                  <div className="w-full lg:w-[420px] bg-[#12141C] overflow-y-auto custom-scrollbar p-6 space-y-6">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">User Intelligence</h3>
                    
                    {userInfo ? (
                      <div className="space-y-4">
                        {/* Profile Card */}
                        <div className="flex items-center gap-4 bg-[#0B0D14] p-4 rounded-2xl border border-white/5">
                          <img src={getAttachmentUrl(userInfo.profilePic)} alt="User" className="w-14 h-14 rounded-full border border-white/10 object-cover bg-white/5" onError={(e) => { e.currentTarget.src = 'https://ui-avatars.com/api/?name=' + userInfo.userName; }} />
                          <div className="flex flex-col overflow-hidden">
                            <span className="font-bold text-white text-lg truncate">{userInfo.userName}</span>
                            <span className="text-xs text-gray-500 font-mono">User ID: {userInfo.userId}</span>
                          </div>
                        </div>

                        {/* Vital Stats */}
                        <div className="grid grid-cols-2 gap-3">
                          <div className="bg-[#1A1C24] p-3 rounded-xl border border-white/5 flex flex-col gap-1">
                            <span className="text-[10px] text-gray-500 font-bold uppercase">Wallet Balance</span>
                            <span className="text-sm font-black text-emerald-400 flex items-center gap-1"><Wallet className="w-3.5 h-3.5" /> ${userInfo.walletBalance}</span>
                          </div>
                          <div className="bg-[#1A1C24] p-3 rounded-xl border border-white/5 flex flex-col gap-1">
                            <span className="text-[10px] text-gray-500 font-bold uppercase">Total Earnings</span>
                            <span className="text-sm font-black text-white flex items-center gap-1"><Activity className="w-3.5 h-3.5" /> ${userInfo.totalEarnings}</span>
                          </div>
                        </div>

                        {/* Detailed List */}
                        <div className="bg-[#0B0D14] rounded-2xl border border-white/5 overflow-hidden">
                          <div className="p-3 border-b border-white/5 flex items-center gap-3 text-sm">
                            <Mail className="w-4 h-4 text-gray-400 shrink-0" />
                            <span className="text-gray-300 text-xs truncate">{userInfo.email}</span>
                          </div>
                          <div className="p-3 border-b border-white/5 flex items-center gap-3 text-sm">
                            <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
                            <span className="text-gray-300 text-xs">{userInfo.city ? `${userInfo.city}, ` : ''}{userInfo.country || 'N/A'}</span>
                          </div>
                          <div className="p-3 border-b border-white/5 flex items-center gap-3 text-sm">
                            <Monitor className="w-4 h-4 text-gray-400 shrink-0" />
                            <span className="text-gray-300 font-mono text-xs">{userInfo.ipAddress || 'Unknown IP'}</span>
                          </div>
                          <div className="p-3 border-b border-white/5 flex items-center gap-3 text-sm">
                            <ShieldCheck className={`w-4 h-4 shrink-0 ${userInfo.kycStatus ? 'text-emerald-400' : 'text-amber-400'}`} />
                            <span className={userInfo.kycStatus ? 'text-emerald-400 font-bold text-xs' : 'text-amber-400 font-bold text-xs'}>
                              KYC {userInfo.kycStatus ? 'VERIFIED' : 'PENDING'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center text-gray-500 py-10 text-xs">User details unavailable.</div>
                    )}

                    {/* Ticket Context & Status Actions */}
                    <div className="bg-white/[0.02] border border-white/10 rounded-2xl p-4">
                      <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Ticket Status Management</h4>
                      <div className="flex justify-between items-center text-xs text-gray-300 mb-4 bg-[#0B0D14] p-3 rounded-xl border border-white/5">
                        <span className="uppercase tracking-widest font-bold text-[10px]">Current Status</span>
                        <span className={`font-black ${
                          selectedTicket?.status === 'OPEN' ? 'text-emerald-400' : 
                          selectedTicket?.status === 'RESOLVED' ? 'text-purple-400' : 
                          selectedTicket?.status === 'ADMIN_REPLIED' ? 'text-blue-400' : 
                          'text-gray-400'
                        }`}>
                          {selectedTicket?.status}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <button 
                          onClick={() => handleStatusUpdate('RESOLVED')}
                          disabled={isUpdatingStatus || selectedTicket?.status === 'RESOLVED'}
                          className="bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/20 text-[10px] font-black uppercase tracking-widest py-2.5 rounded-xl transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-1.5"
                        >
                          {isUpdatingStatus ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5" />}
                          Resolve
                        </button>
                        <button 
                          onClick={() => handleStatusUpdate('CLOSED')}
                          disabled={isUpdatingStatus || selectedTicket?.status === 'CLOSED'}
                          className="bg-gray-500/10 hover:bg-gray-500/20 text-gray-400 border border-gray-500/20 text-[10px] font-black uppercase tracking-widest py-2.5 rounded-xl transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex justify-center items-center gap-1.5"
                        >
                          {isUpdatingStatus ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <X className="w-3.5 h-3.5" />}
                          Close
                        </button>
                      </div>
                    </div>

                    {/* 🔥 INTERNAL NOTES SECTION 🔥 */}
                    <div className="bg-[#161821] border border-white/5 rounded-2xl flex flex-col overflow-hidden mt-6">
                      <div className="p-4 border-b border-white/5 flex items-center justify-between bg-[#1A1C24]">
                         <h4 className="text-xs font-bold text-gray-300 uppercase tracking-widest flex items-center gap-1.5">
                           <StickyNote className="w-3.5 h-3.5 text-amber-400" /> Internal Notes
                         </h4>
                         <span className="text-[10px] bg-white/5 px-2 py-0.5 rounded text-gray-500 font-bold">
                           {selectedTicket?.internalNotes?.length || 0}
                         </span>
                      </div>
                      
                      {/* Notes List */}
                      <div className="p-4 flex flex-col gap-3 max-h-[200px] overflow-y-auto custom-scrollbar">
                        {selectedTicket?.internalNotes?.length > 0 ? (
                          selectedTicket.internalNotes.map((note: any, idx: number) => (
                            <div key={idx} className="bg-[#0B0D14] border border-white/5 p-3 rounded-xl relative">
                              <p className="text-xs text-gray-300 leading-relaxed pr-2">{note.note}</p>
                              <div className="text-[9px] text-gray-500 mt-2 font-mono text-right border-t border-white/5 pt-1.5 inline-block float-right">
                                {new Date(note.createdAt || Date.now()).toLocaleString()}
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-gray-500 italic text-center py-4">No internal notes added yet. Notes are hidden from the user.</p>
                        )}
                      </div>

                      {/* Add Note Form */}
                      <div className="p-3 border-t border-white/5 bg-[#0B0D14]">
                        <form onSubmit={handleAddInternalNote} className="flex gap-2">
                          <input 
                            type="text" 
                            placeholder="Type a private note..." 
                            required
                            value={internalNoteText}
                            onChange={(e) => setInternalNoteText(e.target.value)}
                            className="flex-1 bg-[#1A1C24] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400/50"
                          />
                          <button 
                            type="submit" 
                            disabled={isAddingNote || !internalNoteText.trim()}
                            className="bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 border border-amber-500/20 px-3 rounded-lg text-xs font-bold transition-colors disabled:opacity-50 flex items-center justify-center shrink-0 cursor-pointer"
                          >
                            {isAddingNote ? <Loader2 className="w-3 h-3 animate-spin" /> : "Save"}
                          </button>
                        </form>
                      </div>
                    </div>

                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}

export default function AdminSupportPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#07080F] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-[#3B82F6] animate-spin" />
      </div>
    }>
      <AdminSupportContent />
    </Suspense>
  );
}