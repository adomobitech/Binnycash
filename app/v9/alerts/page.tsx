'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  BellRing, Send, Users, Loader2, CheckCircle2, AlertCircle, 
  Search, MessageSquare, Mail, Type, FileText, ChevronDown, CheckSquare, Square
} from 'lucide-react';

// --- UTILITY: Get Admin ID ---
function getAdminId(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('adminId') || localStorage.getItem('admin_id') || localStorage.getItem('userId') || '';
}

// ==========================================
// CUSTOM MULTI-SELECT DROPDOWN COMPONENT (PREMIUM UI)
// ==========================================
const UserMultiSelect = ({ 
  users, 
  selectedIds, 
  onChange, 
  placeholder 
}: { 
  users: any[], 
  selectedIds: string[], 
  onChange: (ids: string[]) => void, 
  placeholder: string 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredUsers = users.filter(u => {
    const q = search.toLowerCase();
    return (u.userName || u.name || '').toLowerCase().includes(q) || (u.email || '').toLowerCase().includes(q) || String(u.id || u._id).includes(q);
  });

  const toggleUser = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter(selectedId => selectedId !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.length === filteredUsers.length && filteredUsers.length > 0) {
      onChange([]); 
    } else {
      const newIds = Array.from(new Set([...selectedIds, ...filteredUsers.map(u => String(u.id || u._id))]));
      onChange(newIds);
    }
  };

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-[#0B0D14]/80 border border-white/5 hover:border-white/10 rounded-xl px-4 py-3.5 flex items-center justify-between cursor-pointer transition-colors shadow-inner"
      >
        <span className={`text-sm ${selectedIds.length > 0 ? 'text-white font-bold' : 'text-gray-500'}`}>
          {selectedIds.length > 0 ? `${selectedIds.length} User(s) Selected` : placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 5 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 right-0 top-full mt-2 bg-[#161821] border border-white/10 rounded-2xl shadow-[0_15px_40px_rgba(0,0,0,0.5)] z-50 overflow-hidden flex flex-col"
          >
            <div className="p-3 border-b border-white/5 bg-[#12141C]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input 
                  type="text" 
                  placeholder="Search users..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-[#0B0D14] border border-white/5 rounded-lg pl-9 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#7C3AED]/50 transition-colors"
                />
              </div>
            </div>

            <div className="max-h-[280px] overflow-y-auto custom-scrollbar p-2 flex flex-col gap-1">
              {filteredUsers.length > 0 ? (
                <>
                  <div 
                    onClick={handleSelectAll}
                    className="flex items-center gap-3 p-3 rounded-xl hover:bg-white/5 cursor-pointer transition-colors mb-1 border-b border-white/5 pb-3 group"
                  >
                    {selectedIds.length === filteredUsers.length ? <CheckSquare className="w-5 h-5 text-[#A882FF]" /> : <Square className="w-5 h-5 text-gray-500 group-hover:text-gray-400" />}
                    <span className="text-sm font-bold text-white">Select All {search ? 'Filtered' : ''}</span>
                  </div>
                  
                  {filteredUsers.map(u => {
                    const uId = String(u.id || u._id);
                    const isSelected = selectedIds.includes(uId);
                    return (
                      <div 
                        key={uId} 
                        onClick={() => toggleUser(uId)}
                        className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors ${isSelected ? 'bg-[#A882FF]/10 border border-[#A882FF]/20' : 'hover:bg-white/5 border border-transparent'}`}
                      >
                        {isSelected ? <CheckSquare className="w-5 h-5 text-[#A882FF]" /> : <Square className="w-5 h-5 text-gray-500" />}
                        <div className="flex flex-col">
                          <span className={`text-sm font-bold ${isSelected ? 'text-white' : 'text-gray-300'}`}>{u.userName || u.name || 'Unnamed User'}</span>
                          <span className="text-[10px] text-gray-500">ID: {uId} • {u.email || 'No email'}</span>
                        </div>
                      </div>
                    );
                  })}
                </>
              ) : (
                <div className="text-center py-6 text-sm text-gray-500">No users found.</div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// ==========================================
// MAIN ALERTS PAGE COMPONENT
// ==========================================
export default function AdminAlertsPage() {
  const router = useRouter();
  
  const [users, setUsers] = useState<any[]>([]);
  const [isUsersLoading, setIsUsersLoading] = useState(true);

  // --- Alert Form State ---
  const [alertUserIds, setAlertUserIds] = useState<string[]>([]);
  const [alertMessage, setAlertMessage] = useState('');
  const [isSubmittingAlert, setIsSubmittingAlert] = useState(false);
  const [alertStatus, setAlertStatus] = useState<{text: string, type: 'success' | 'error'} | null>(null);

  // --- Message Form State ---
  const [msgUserIds, setMsgUserIds] = useState<string[]>([]);
  const [msgMethod, setMsgMethod] = useState('Email'); // Only Email now
  const [msgTitle, setMsgTitle] = useState('');
  const [msgBody, setMsgBody] = useState('');
  const [isSubmittingMsg, setIsSubmittingMsg] = useState(false);
  const [msgStatus, setMsgStatus] = useState<{text: string, type: 'success' | 'error'} | null>(null);

  // 🔥 FETCH USER LIST ON MOUNT 🔥
  useEffect(() => {
    const fetchUsers = async () => {
      const token = localStorage.getItem('admin_token');
      const adminId = getAdminId();
      if (!token) { router.push('/v9/login'); return; }

      try {
        const res = await fetch(`https://api.binnycash.com/api/admin/userList?adminId=${encodeURIComponent(adminId)}&page=1&limit=2000`, {
          headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
        });
        const json = await res.json();
        
        let list = [];
        if (Array.isArray(json?.data)) list = json.data;
        else if (json?.data?.users && Array.isArray(json.data.users)) list = json.data.users;

        setUsers(list);
      } catch (err) {
        console.error("Failed to fetch users for dropdown", err);
      } finally {
        setIsUsersLoading(false);
      }
    };
    fetchUsers();
  }, [router]);

  // ==========================================
  // SEND USER ALERT LOGIC (/admin/sendUserAlert)
  // ==========================================
  const handleSendAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!alertMessage.trim()) {
      setAlertStatus({ text: 'Message cannot be empty.', type: 'error' });
      return;
    }
    
    // 🔥 FIX: Check if at least 1 user is selected based on screenshot error 🔥
    if (alertUserIds.length === 0) {
      setAlertStatus({ text: 'userId and message are required', type: 'error' });
      return;
    }

    setIsSubmittingAlert(true);
    setAlertStatus(null);
    const token = localStorage.getItem('admin_token') || '';

    try {
      // 🔥 FIX: Using URLSearchParams instead of FormData to match x-www-form-urlencoded standard 🔥
      const fd = new URLSearchParams();
      fd.append('userId', alertUserIds.join(',')); // Backend expects comma separated string
      fd.append('message', alertMessage.trim());

      const res = await fetch(`https://api.binnycash.com/api/admin/sendUserAlert`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/x-www-form-urlencoded' 
        },
        body: fd
      });

      const data = await res.json();
      if (res.ok && (data.code === 200 || data.type === 'success')) {
        setAlertStatus({ text: data.message || 'Alert sent successfully!', type: 'success' });
        setAlertMessage('');
        setAlertUserIds([]);
        setTimeout(() => setAlertStatus(null), 3000);
      } else {
        setAlertStatus({ text: data.message || 'userId and message are required', type: 'error' });
      }
    } catch (err) {
      setAlertStatus({ text: 'Network Error while sending alert.', type: 'error' });
    } finally {
      setIsSubmittingAlert(false);
    }
  };

  // ==========================================
  // SEND MESSAGE LOGIC (/admin/sendMessage)
  // ==========================================
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!msgBody.trim() || !msgTitle.trim()) {
       setMsgStatus({ text: 'Title and body are required.', type: 'error' });
       return;
    }
    
    // 🔥 FIX: Check if at least 1 user is selected based on screenshot error 🔥
    if (msgUserIds.length === 0) {
      setMsgStatus({ text: 'userId and message are required', type: 'error' });
      return;
    }

    setIsSubmittingMsg(true);
    setMsgStatus(null);
    const token = localStorage.getItem('admin_token') || '';

    try {
      // 🔥 FIX: Using URLSearchParams instead of FormData 🔥
      const fd = new URLSearchParams();
      fd.append('userId', msgUserIds.join(',')); 
      fd.append('method', msgMethod);
      fd.append('title', msgTitle.trim());
      fd.append('message', msgBody.trim());

      const res = await fetch(`https://api.binnycash.com/api/admin/sendMessage`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/x-www-form-urlencoded' 
        },
        body: fd
      });

      const data = await res.json();
      if (res.ok && (data.code === 200 || data.type === 'success')) {
        setMsgStatus({ text: data.message || 'Message broadcasted successfully!', type: 'success' });
        setMsgTitle('');
        setMsgBody('');
        setMsgUserIds([]);
        setTimeout(() => setMsgStatus(null), 3000);
      } else {
        setMsgStatus({ text: data.message || 'userId and message are required', type: 'error' });
      }
    } catch (err) {
      setMsgStatus({ text: 'Network Error while sending message.', type: 'error' });
    } finally {
      setIsSubmittingMsg(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 text-white w-full max-w-[1600px] mx-auto pb-10 font-sans relative">
      
      {/* GLOBAL BACKGROUND GLOW */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#A855F7]/5 blur-[150px] rounded-full pointer-events-none -z-10" />

      {/* HEADER */}
      <div className="flex flex-col gap-1 mb-2 relative z-10 border-b border-white/5 pb-6">
        <h1 className="text-2xl font-black text-white flex items-center gap-3 tracking-tight">
          <BellRing className="w-7 h-7 text-[#A855F7]" /> Communications & Alerts
        </h1>
        <p className="text-[#8F95A3] text-sm mt-1 max-w-2xl">
          Broadcast global announcements or trigger specific user alerts in real-time.
        </p>
      </div>

      {isUsersLoading && (
        <div className="bg-[#12141C] border border-white/5 rounded-2xl p-4 flex items-center gap-3 text-sm text-[#A855F7] font-bold shadow-sm w-fit">
          <Loader2 className="w-4 h-4 animate-spin" /> Fetching global user registry...
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 z-10">
        
        {/* ========================================== */}
        {/* FORM 1: SEND USER ALERT */}
        {/* ========================================== */}
        <div className="bg-[#12141C] border border-white/5 rounded-3xl p-6 sm:p-8 shadow-xl relative flex flex-col h-full group transition-all hover:border-white/10">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20">
              <AlertCircle className="w-6 h-6 text-amber-500" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">Send User Alert</h3>
              <p className="text-[11px] text-[#8F95A3] mt-0.5">Quick popup/notification alert</p>
            </div>
          </div>

          {alertStatus && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className={`mb-6 p-4 rounded-xl flex items-center gap-3 text-sm font-bold border ${alertStatus.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}>
              {alertStatus.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
              {alertStatus.text}
            </motion.div>
          )}

          <form onSubmit={handleSendAlert} className="flex flex-col gap-6 flex-1">
            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-[#8F95A3] uppercase tracking-widest pl-1">
                Target User(s) <span className="text-gray-600 lowercase font-normal">(Leave empty for all)</span>
              </label>
              <div className="relative group flex">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                   <Users className="w-4 h-4 text-gray-500 group-focus-within:text-[#7C3AED] transition-colors" />
                </div>
                <div className="w-full pl-11">
                  <UserMultiSelect 
                    users={users} 
                    selectedIds={alertUserIds} 
                    onChange={setAlertUserIds} 
                    placeholder="Select specific users..."
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2 mb-4">
              <label className="text-[10px] font-bold text-[#8F95A3] uppercase tracking-widest pl-1 flex items-center gap-1">
                Alert Message <span className="text-rose-500">*</span>
              </label>
              <div className="relative group">
                <div className="absolute top-4 left-0 pl-4 flex items-start pointer-events-none">
                   <Type className="w-4 h-4 text-gray-500 group-focus-within:text-amber-500 transition-colors" />
                </div>
                <textarea 
                  required rows={5} placeholder="Type the alert message here..."
                  value={alertMessage} onChange={e => setAlertMessage(e.target.value)}
                  className="w-full bg-[#0B0D14]/80 border border-white/5 rounded-xl pl-11 pr-4 py-3.5 text-sm text-white focus:outline-none focus:border-amber-500/50 focus:bg-[#0B0D14] focus:ring-2 focus:ring-amber-500/20 transition-all placeholder:text-gray-700 resize-none custom-scrollbar"
                />
              </div>
            </div>

            <div className="mt-auto flex justify-end">
              <button 
                type="submit" disabled={isSubmittingAlert || isUsersLoading}
                className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-black font-black text-sm tracking-wide px-10 py-4 rounded-xl transition-all shadow-[0_4px_15px_rgba(245,158,11,0.2)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
              >
                {isSubmittingAlert ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                Dispatch Alert
              </button>
            </div>
          </form>
        </div>

        {/* ========================================== */}
        {/* FORM 2: SEND DETAILED MESSAGE */}
        {/* ========================================== */}
        <div className="bg-[#12141C] border border-white/5 rounded-3xl p-6 sm:p-8 shadow-xl relative flex flex-col h-full group transition-all hover:border-white/10">
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
              <MessageSquare className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">Send Detailed Message</h3>
              <p className="text-[11px] text-[#8F95A3] mt-0.5">Full announcement with Title & Method</p>
            </div>
          </div>

          {msgStatus && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className={`mb-6 p-4 rounded-xl flex items-center gap-3 text-sm font-bold border ${msgStatus.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}>
              {msgStatus.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
              {msgStatus.text}
            </motion.div>
          )}

          <form onSubmit={handleSendMessage} className="flex flex-col gap-6 flex-1">
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-[#8F95A3] uppercase tracking-widest pl-1">
                  Target User(s) <span className="text-gray-600 lowercase font-normal">(Empty = All)</span>
                </label>
                <div className="relative group flex">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                     <Users className="w-4 h-4 text-gray-500 group-focus-within:text-[#7C3AED] transition-colors" />
                  </div>
                  <div className="w-full pl-11">
                    <UserMultiSelect 
                      users={users} 
                      selectedIds={msgUserIds} 
                      onChange={setMsgUserIds} 
                      placeholder="Select specific users..."
                    />
                  </div>
                </div>
              </div>

              {/* 🔥 UPDATED: Only Email option available as requested 🔥 */}
              <div className="flex flex-col gap-2">
                <label className="text-[10px] font-bold text-[#8F95A3] uppercase tracking-widest pl-1">Method</label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                     <Mail className="w-4 h-4 text-gray-500 group-focus-within:text-blue-500 transition-colors" />
                  </div>
                  <select 
                    value={msgMethod} onChange={e => setMsgMethod(e.target.value)}
                    className="w-full bg-[#0B0D14]/80 border border-white/5 rounded-xl pl-11 pr-4 py-3.5 text-sm font-bold text-white focus:outline-none focus:border-blue-500/50 focus:bg-[#0B0D14] focus:ring-2 focus:ring-blue-500/20 transition-all appearance-none cursor-pointer"
                  >
                    <option value="Email">📧 Email Campaign</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] font-bold text-[#8F95A3] uppercase tracking-widest pl-1 flex items-center gap-1">
                Message Title <span className="text-rose-500">*</span>
              </label>
              <div className="relative group">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                   <Type className="w-4 h-4 text-gray-500 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <input 
                  type="text" required placeholder="E.g. Special Weekend Bonus!"
                  value={msgTitle} onChange={e => setMsgTitle(e.target.value)}
                  className="w-full bg-[#0B0D14]/80 border border-white/5 rounded-xl pl-11 pr-4 py-3.5 text-sm text-white font-bold focus:outline-none focus:border-blue-500/50 focus:bg-[#0B0D14] focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-gray-700 placeholder:font-normal"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2 mb-4">
              <label className="text-[10px] font-bold text-[#8F95A3] uppercase tracking-widest pl-1 flex items-center gap-1">
                Message Body <span className="text-rose-500">*</span>
              </label>
              <div className="relative group">
                <div className="absolute top-4 left-0 pl-4 flex items-start pointer-events-none">
                   <FileText className="w-4 h-4 text-gray-500 group-focus-within:text-blue-500 transition-colors" />
                </div>
                <textarea 
                  required rows={5} placeholder="Detailed content of the message..."
                  value={msgBody} onChange={e => setMsgBody(e.target.value)}
                  className="w-full bg-[#0B0D14]/80 border border-white/5 rounded-xl pl-11 pr-4 py-3.5 text-sm text-white focus:outline-none focus:border-blue-500/50 focus:bg-[#0B0D14] focus:ring-2 focus:ring-blue-500/20 transition-all placeholder:text-gray-700 resize-none custom-scrollbar"
                />
              </div>
            </div>

            <div className="mt-auto flex justify-end">
              <button 
                type="submit" disabled={isSubmittingMsg || isUsersLoading}
                className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-black text-sm tracking-wide px-10 py-4 rounded-xl transition-all shadow-[0_4px_15px_rgba(37,99,235,0.2)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
              >
                {isSubmittingMsg ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-4 h-4" />}
                Broadcast Message
              </button>
            </div>
          </form>
        </div>

      </div>
    </div>
  );
}