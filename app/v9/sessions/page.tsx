'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Monitor, Smartphone, Globe, Clock, Power, ShieldAlert, 
  Search, Users, Loader2, ChevronDown, CheckCircle2, 
  AlertCircle, ChevronLeft, ChevronRight, Laptop
} from 'lucide-react';

// --- UTILITY: Get Admin ID ---
function getAdminId(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('adminId') || localStorage.getItem('admin_id') || localStorage.getItem('userId') || '';
}

// ==========================================
// CUSTOM SINGLE-SELECT USER DROPDOWN
// ==========================================
const UserSingleSelect = ({ 
  users, 
  selectedUser, 
  onChange, 
  placeholder 
}: { 
  users: any[], 
  selectedUser: any | null, 
  onChange: (user: any) => void, 
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

  const handleSelect = (user: any) => {
    onChange(user);
    setIsOpen(false);
    setSearch('');
  };

  return (
    <div className="relative w-full max-w-md" ref={dropdownRef}>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-[#12141C] border border-white/10 hover:border-[#7C3AED]/50 rounded-xl px-4 py-3.5 flex items-center justify-between cursor-pointer transition-colors shadow-sm"
      >
        <div className="flex items-center gap-3 truncate">
          <Users className="w-4 h-4 text-gray-400 shrink-0" />
          <span className={`text-sm truncate ${selectedUser ? 'text-white font-bold' : 'text-gray-500'}`}>
            {selectedUser ? `${selectedUser.userName || selectedUser.name} (${selectedUser.email})` : placeholder}
          </span>
        </div>
        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform shrink-0 ${isOpen ? 'rotate-180' : ''}`} />
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
                  placeholder="Search by name, email or ID..." 
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-[#0B0D14] border border-white/5 rounded-lg pl-9 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#7C3AED]/50 transition-colors"
                />
              </div>
            </div>

            <div className="max-h-[300px] overflow-y-auto custom-scrollbar p-2 flex flex-col gap-1">
              {filteredUsers.length > 0 ? (
                filteredUsers.map(u => {
                  const uId = String(u.id || u._id);
                  const isSelected = selectedUser && String(selectedUser.id || selectedUser._id) === uId;
                  return (
                    <div 
                      key={uId} 
                      onClick={() => handleSelect(u)}
                      className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-colors ${isSelected ? 'bg-[#7C3AED]/10 border border-[#7C3AED]/20' : 'hover:bg-white/5 border border-transparent'}`}
                    >
                      <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-xs font-bold text-gray-300 shrink-0">
                        {(u.userName || u.name || 'U').charAt(0).toUpperCase()}
                      </div>
                      <div className="flex flex-col overflow-hidden">
                        <span className={`text-sm font-bold truncate ${isSelected ? 'text-white' : 'text-gray-300'}`}>{u.userName || u.name || 'Unnamed User'}</span>
                        <span className="text-[10px] text-gray-500 truncate">ID: {uId} • {u.email || 'No email'}</span>
                      </div>
                    </div>
                  );
                })
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
// MAIN SESSIONS PAGE COMPONENT
// ==========================================
export default function AdminSessionsPage() {
  const router = useRouter();
  
  // --- Global States ---
  const [users, setUsers] = useState<any[]>([]);
  const [isUsersLoading, setIsUsersLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);

  // --- Session Data States ---
  const [sessions, setSessions] = useState<any[]>([]);
  const [isSessionsLoading, setIsSessionsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const limit = 20;

  // --- Action States ---
  const [terminatingId, setTerminatingId] = useState<string | null>(null);
  const [isTerminatingAll, setIsTerminatingAll] = useState(false);
  const [actionMessage, setActionMessage] = useState<{text: string, type: 'success' | 'error'} | null>(null);

  // Fetch Users for Dropdown on Mount
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
        console.error("Failed to fetch users", err);
      } finally {
        setIsUsersLoading(false);
      }
    };
    fetchUsers();
  }, [router]);

  // Fetch Sessions when User or Page Changes
  useEffect(() => {
    if (!selectedUser) {
      setSessions([]);
      setTotalPages(1);
      return;
    }

    const fetchSessions = async () => {
      setIsSessionsLoading(true);
      const token = localStorage.getItem('admin_token') || '';
      const userId = selectedUser.id || selectedUser._id;

      try {
        const res = await fetch(`https://api.binnycash.com/api/admin/sessions?userId=${userId}&page=${currentPage}&limit=${limit}`, {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
        });
        const json = await res.json();

        if (res.ok && json.data) {
          const sessionList = Array.isArray(json.data) ? json.data : (json.data.docs || json.data.sessions || []);
          setSessions(sessionList);
          
          const pages = json.data.totalPages || json.pagination?.totalPages || 1;
          setTotalPages(pages);
        } else {
          setSessions([]);
        }
      } catch (err) {
        console.error("Failed to fetch sessions", err);
        setSessions([]);
      } finally {
        setIsSessionsLoading(false);
      }
    };

    fetchSessions();
  }, [selectedUser, currentPage]);

  // Handle Terminate Action (Single or All)
  const handleTerminate = async (sessionId?: string) => {
    if (!selectedUser) return;
    const isAll = !sessionId;

    if (isAll) {
      if (!confirm(`Are you sure you want to terminate ALL active sessions for ${selectedUser.userName || selectedUser.name}?`)) return;
      setIsTerminatingAll(true);
    } else {
      if (!confirm("Are you sure you want to terminate this specific session?")) return;
      setTerminatingId(sessionId as string);
    }

    setActionMessage(null);
    const token = localStorage.getItem('admin_token') || '';
    const userId = selectedUser.id || selectedUser._id;

    try {
      const fd = new URLSearchParams();
      if (isAll) {
        fd.append('userId', userId);
        fd.append('isAllSession', 'true');
      } else {
        fd.append('id', sessionId as string);
        fd.append('isAllSession', 'false');
      }

      const res = await fetch(`https://api.binnycash.com/api/admin/sessions/terminate`, {
        method: 'PATCH',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/x-www-form-urlencoded' 
        },
        body: fd
      });

      const data = await res.json();
      if (res.ok && (data.code === 200 || data.type === 'success')) {
        setActionMessage({ text: data.message || 'Session(s) terminated successfully.', type: 'success' });
        
        // Optimistically update UI
        if (isAll) {
          setSessions(sessions.map(s => ({ ...s, isActive: false, status: 'Terminated' })));
        } else {
          setSessions(sessions.map(s => (s._id === sessionId || s.id === sessionId) ? { ...s, isActive: false, status: 'Terminated' } : s));
        }
        
        setTimeout(() => setActionMessage(null), 3000);
      } else {
        setActionMessage({ text: data.message || 'Failed to terminate session.', type: 'error' });
      }
    } catch (err) {
      setActionMessage({ text: 'Network Error while terminating session.', type: 'error' });
    } finally {
      setIsTerminatingAll(false);
      setTerminatingId(null);
    }
  };

  const getDeviceIcon = (deviceInfo: string) => {
    const info = (deviceInfo || '').toLowerCase();
    if (info.includes('mobile') || info.includes('android') || info.includes('iphone')) return <Smartphone className="w-4 h-4" />;
    if (info.includes('mac') || info.includes('windows') || info.includes('pc')) return <Laptop className="w-4 h-4" />;
    return <Globe className="w-4 h-4" />;
  };

  return (
    <div className="flex flex-col gap-6 text-white w-full max-w-[1600px] mx-auto pb-10 font-sans relative">
      
      {/* GLOBAL BACKGROUND GLOW */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#7C3AED]/10 blur-[150px] rounded-full pointer-events-none -z-10" />

      {/* HEADER */}
      <div className="flex flex-col gap-1 mb-2 relative z-10 border-b border-white/5 pb-6">
        <h1 className="text-3xl font-black text-white flex items-center gap-3 tracking-tight">
          <Monitor className="w-8 h-8 text-[#7C3AED]" /> Session Management
        </h1>
        <p className="text-[#8F95A3] text-sm mt-1 max-w-2xl">
          Monitor active logins, track connection history, and forcefully terminate unauthorized sessions for any user.
        </p>
      </div>

      <div className="flex flex-col gap-6 z-10">
        
        {/* ACTION BAR: USER SELECTOR & ALERTS */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-[#12141C]/80 backdrop-blur-md p-4 rounded-2xl border border-white/5 shadow-lg">
          <div className="flex items-center gap-4 w-full sm:w-auto">
            {isUsersLoading ? (
              <div className="px-4 py-3 bg-[#0B0D14] rounded-xl flex items-center gap-3 text-sm text-[#7C3AED] font-bold border border-white/5">
                <Loader2 className="w-4 h-4 animate-spin" /> Loading Users...
              </div>
            ) : (
              <UserSingleSelect 
                users={users} 
                selectedUser={selectedUser} 
                onChange={(u) => { setSelectedUser(u); setCurrentPage(1); }} 
                placeholder="Select a user to view sessions..."
              />
            )}
          </div>

          {selectedUser && (
            <button 
              onClick={() => handleTerminate()}
              disabled={isTerminatingAll || sessions.filter(s => s.isActive !== false).length === 0}
              className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/20 px-5 py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {isTerminatingAll ? <Loader2 className="w-4 h-4 animate-spin" /> : <ShieldAlert className="w-4 h-4" />}
              Terminate All Sessions
            </button>
          )}
        </div>

        {actionMessage && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className={`p-4 rounded-xl flex items-center gap-3 text-sm font-bold border ${actionMessage.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}>
            {actionMessage.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
            {actionMessage.text}
          </motion.div>
        )}

        {/* SESSIONS TABLE */}
        <div className="bg-[#12141C] border border-white/5 rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto min-h-[400px]">
            <table className="w-full text-left border-collapse whitespace-nowrap">
              <thead>
                <tr className="border-b border-white/10 text-gray-400 text-xs font-bold uppercase tracking-wider bg-[#161821]">
                  <th className="py-4 px-6">Session ID</th>
                  <th className="py-4 px-4">Device & IP</th>
                  <th className="py-4 px-4">Location</th>
                  <th className="py-4 px-4">Login Time</th>
                  <th className="py-4 px-4 text-center">Status</th>
                  <th className="py-4 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-sm">
                {!selectedUser ? (
                  <tr>
                    <td colSpan={6} className="py-24 text-center">
                      <div className="flex flex-col items-center justify-center text-gray-500">
                        <Users className="w-12 h-12 mb-3 opacity-20" />
                        <span className="font-bold text-base text-gray-400">No User Selected</span>
                        <span className="text-xs mt-1">Please select a user from the dropdown above to view their sessions.</span>
                      </div>
                    </td>
                  </tr>
                ) : isSessionsLoading ? (
                  <tr>
                    <td colSpan={6} className="py-24 text-center text-gray-500 font-medium">
                      <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-[#7C3AED]" /> Fetching session history...
                    </td>
                  </tr>
                ) : sessions.length > 0 ? (
                  sessions.map((session: any, idx: number) => {
                    const sId = session._id || session.id;
                    const isActive = session.isActive !== false && session.status !== 'Terminated'; // Adjust based on your actual API response structure
                    const loginDate = session.createdAt ? new Date(session.createdAt) : null;
                    const isRowTerminating = terminatingId === sId;

                    return (
                      <tr key={sId || idx} className="hover:bg-white/[0.02] transition-colors group">
                        <td className="py-4 px-6 font-mono text-xs text-gray-400">{sId}</td>
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-gray-400 border border-white/10 shrink-0">
                              {getDeviceIcon(session.deviceInfo || session.userAgent)}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-bold text-white max-w-[200px] truncate" title={session.deviceInfo || session.userAgent || 'Unknown Device'}>
                                {session.deviceInfo || session.userAgent || 'Unknown Device'}
                              </span>
                              <span className="text-xs text-gray-500 font-mono">{session.ipAddress || session.ip || 'Unknown IP'}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-gray-300">
                          {session.location || session.country || 'N/A'}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex flex-col">
                            <span className="text-white font-medium">{loginDate ? loginDate.toLocaleDateString() : 'N/A'}</span>
                            <span className="text-xs text-gray-500 flex items-center gap-1 mt-0.5"><Clock className="w-3 h-3" /> {loginDate ? loginDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-center">
                          {isActive ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-[10px] font-bold border uppercase tracking-wider text-emerald-400 border-emerald-400/20 bg-emerald-400/10">
                              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div> Active
                            </span>
                          ) : (
                            <span className="inline-block px-2.5 py-1 rounded text-[10px] font-bold border uppercase tracking-wider text-gray-400 border-white/10 bg-white/5">
                              Terminated
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-right">
                          <button 
                            onClick={() => handleTerminate(sId)}
                            disabled={!isActive || isRowTerminating}
                            className={`w-9 h-9 rounded-lg flex items-center justify-center ml-auto transition-colors ${
                              isActive 
                                ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/20 cursor-pointer' 
                                : 'bg-white/5 text-gray-600 border border-transparent cursor-not-allowed'
                            }`}
                            title={isActive ? "Terminate this session" : "Already terminated"}
                          >
                            {isRowTerminating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Power className="w-4 h-4" />}
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="py-24 text-center">
                      <div className="flex flex-col items-center justify-center text-gray-500">
                        <Monitor className="w-12 h-12 mb-3 opacity-20" />
                        <span className="font-bold text-base text-gray-400">No Sessions Found</span>
                        <span className="text-xs mt-1">This user does not have any recorded session history.</span>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          {selectedUser && sessions.length > 0 && (
            <div className="flex items-center justify-between p-5 border-t border-white/5 bg-[#161821]">
              <span className="text-sm text-gray-400">
                Page <span className="font-bold text-white">{currentPage}</span> of <span className="font-bold text-white">{totalPages}</span>
              </span>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
                  disabled={currentPage === 1 || isSessionsLoading} 
                  className="w-9 h-9 rounded-lg border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/5 disabled:opacity-50 cursor-pointer transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button 
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
                  disabled={currentPage === totalPages || isSessionsLoading} 
                  className="w-9 h-9 rounded-lg border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/5 disabled:opacity-50 cursor-pointer transition-colors"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}