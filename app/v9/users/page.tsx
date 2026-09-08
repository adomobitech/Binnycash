'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Users, UserCheck, UserX, FileText, Search, Eye, ChevronLeft, ChevronRight, X, Loader2, 
  Mail, MapPin, Phone, ShieldCheck, Share2, MonitorSmartphone, Wallet, AlertCircle, 
  Clock, Info, ShieldAlert, Layers, Star, SlidersHorizontal, DollarSign, CheckCircle2, 
  XCircle, AlertOctagon, TrendingUp, RefreshCw, LogIn, MoreVertical, Activity, 
  ShieldBan, Unlock, Trash2, PauseCircle, PlayCircle, Radar, Gift, Monitor, Smartphone, Laptop, Power, Globe
} from 'lucide-react';
import { useCurrency, formatPrice } from '@/hooks/useCurrency';

// --- UTILITY: Get Admin ID ---
function getAdminId(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('adminId') || localStorage.getItem('admin_id') || localStorage.getItem('userId') || '';
}

// ==========================================
// 3-DOTS ACTION MENU COMPONENT
// ==========================================
const ActionMenu = ({ 
  user, onView, onLogin, onAdjust, onWarn, isLoggingIn 
}: { 
  user: any, onView: () => void, onLogin: () => void, onAdjust: () => void, onWarn: () => void, isLoggingIn: boolean 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <button onClick={() => setIsOpen(!isOpen)} className="w-8 h-8 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer">
        <MoreVertical className="w-4 h-4" />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: -10 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: -10 }} transition={{ duration: 0.15 }}
            className="absolute right-0 top-full mt-2 w-48 bg-[#161821] border border-white/10 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] z-50 overflow-hidden flex flex-col"
          >
            <button onClick={() => { setIsOpen(false); onView(); }} className="w-full px-4 py-3 flex items-center gap-3 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors cursor-pointer text-left">
              <Eye className="w-4 h-4 text-[#7C3AED]" /> View Profile
            </button>
            <button onClick={() => { setIsOpen(false); onAdjust(); }} className="w-full px-4 py-3 flex items-center gap-3 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors cursor-pointer text-left">
              <SlidersHorizontal className="w-4 h-4 text-emerald-400" /> Adjust Balance
            </button>
            <button onClick={() => { setIsOpen(false); onWarn(); }} className="w-full px-4 py-3 flex items-center gap-3 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors cursor-pointer text-left">
              <AlertOctagon className="w-4 h-4 text-rose-400" /> Warn User
            </button>
            <button onClick={() => { setIsOpen(false); onLogin(); }} disabled={isLoggingIn} className="w-full px-4 py-3 flex items-center gap-3 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors cursor-pointer text-left disabled:opacity-50 border-t border-white/5">
              {isLoggingIn ? <Loader2 className="w-4 h-4 text-blue-400 animate-spin" /> : <MonitorSmartphone className="w-4 h-4 text-blue-400" />}
              Login as User
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function AdminUsersPage() {
  const router = useRouter();
  const currency = useCurrency();
  
  // --- CORE STATES ---
  const [users, setUsers] = useState<any[]>([]);
  const [dashboardStats, setDashboardStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [userFilter, setUserFilter] = useState<'ALL' | 'RESTRICTED'>('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 50;

  // --- PROFILE VIEW STATES ---
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [profileData, setProfileData] = useState<any>(null);
  const [profileTab, setProfileTab] = useState<'overview' | 'activities' | 'sessions' | 'earnings' | 'wallet' | 'risk'>('overview');
  const [imageErrors, setImageErrors] = useState<{ [key: string]: boolean }>({});

  const [activities, setActivities] = useState<any[]>([]);
  const [isActivitiesLoading, setIsActivitiesLoading] = useState(false);
  const [riskData, setRiskData] = useState<any>(null);
  const [isRiskLoading, setIsRiskLoading] = useState(false);

  // --- SESSIONS STATES (New) ---
  const [sessions, setSessions] = useState<any[]>([]);
  const [isSessionsLoading, setIsSessionsLoading] = useState(false);
  const [sessionPage, setSessionPage] = useState(1);
  const [sessionTotalPages, setSessionTotalPages] = useState(1);
  const [terminatingSessionId, setTerminatingSessionId] = useState<string | null>(null);
  const [isTerminatingAll, setIsTerminatingAll] = useState(false);

  // --- SYSTEM ACTION MODALS (RESTRICT / RESTORE / DELETE) ---
  const [systemAction, setSystemAction] = useState<{type: 'RESTRICT' | 'RESTORE' | 'DELETE' | null, isOpen: boolean, targetUser: any}>({type: null, isOpen: false, targetUser: null});
  const [actionReason, setActionReason] = useState('');
  const [isSubmittingSysAction, setIsSubmittingSysAction] = useState(false);
  const [sysActionMessage, setSysActionMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

  // --- BALANCE ADJUST MODAL STATES ---
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [selectedUserForAdjust, setSelectedUserForAdjust] = useState<any>(null);
  const [amountInput, setAmountInput] = useState('');
  const [actionStatus, setActionStatus] = useState<'1' | '0'>('1'); 
  const [isSubmittingAdjust, setIsSubmittingAdjust] = useState(false);
  const [adjustMessage, setAdjustMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

  // --- WARNING MODAL STATES ---
  const [isWarningModalOpen, setIsWarningModalOpen] = useState(false);
  const [selectedUserForWarning, setSelectedUserForWarning] = useState<any>(null);
  const [warningTitle, setWarningTitle] = useState('');
  const [warningReason, setWarningReason] = useState('');
  const [isSubmittingWarning, setIsSubmittingWarning] = useState(false);
  const [warningMessage, setWarningMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

  // --- LOGIN AS USER MODAL STATES ---
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [selectedUserForLogin, setSelectedUserForLogin] = useState<any>(null);
  const [isLoggingInUser, setIsLoggingInUser] = useState<string | null>(null);

  // 🔥 FETCH DATA LOOP & DASHBOARD API 🔥
  const fetchAllData = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : '';
    const adminId = getAdminId();
    
    if (!token || !adminId) { router.push('/v9/login'); return; }

    try {
      const dashRes = await fetch(`https://api.binnycash.com/api/admin/dashboard`, {
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
      });
      const dashJson = await dashRes.json();
      if (dashRes.ok && dashJson.data) setDashboardStats(dashJson.data);
    } catch (err) {}

    let pageNum = 1;
    let hasMore = true;
    let accumulatedUsers: any[] = [];

    while (hasMore && pageNum <= 10) { 
      try {
        const endpoint = userFilter === 'RESTRICTED' 
          ? `https://api.binnycash.com/api/admin/users/restricted?page=${pageNum}&limit=50`
          : `https://api.binnycash.com/api/admin/userList?adminId=${encodeURIComponent(adminId)}&page=${pageNum}&limit=50`;

        const res = await fetch(endpoint, {
          headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
        });
        
        const json = await res.json().catch(() => null);
        let list = [];
        if (Array.isArray(json?.data)) list = json.data;
        else if (json?.data?.users && Array.isArray(json.data.users)) list = json.data.users;
        else if (Array.isArray(json)) list = json; 

        if (list && list.length > 0) {
          accumulatedUsers = [...accumulatedUsers, ...list];
          setUsers(accumulatedUsers); 
          pageNum++;
          if (list.length < 50) hasMore = false; 
        } else {
          hasMore = false; 
        }
      } catch (err: any) {
        hasMore = false;
        if (accumulatedUsers.length === 0) setErrorMsg("Network error while fetching users.");
      }
    }
    setIsLoading(false);
  };

  useEffect(() => { fetchAllData(); }, [router, userFilter]);
  useEffect(() => { setCurrentPage(1); }, [searchQuery, userFilter]);

  // --- SUB-DATA FETCHERS ---
  const fetchActivities = async (userId: string) => {
    setIsActivitiesLoading(true);
    const token = localStorage.getItem('admin_token');
    try {
      const res = await fetch(`https://api.binnycash.com/api/admin/activity/users?userId=${userId}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const json = await res.json();
      if (json?.code === 200 && json?.data?.list) setActivities(json.data.list);
      else setActivities([]);
    } catch (err) { setActivities([]); } 
    finally { setIsActivitiesLoading(false); }
  };

  const fetchRiskData = async (userId: string) => {
    setIsRiskLoading(true);
    const token = localStorage.getItem('admin_token');
    try {
      const res = await fetch(`https://api.binnycash.com/api/admin/users/${userId}/risk-activity`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const json = await res.json();
      if (res.ok && json) setRiskData(json.data || json);
      else setRiskData(null);
    } catch (err) { setRiskData(null); } 
    finally { setIsRiskLoading(false); }
  };

  const fetchSessions = async (userId: string, page: number) => {
    setIsSessionsLoading(true);
    const token = localStorage.getItem('admin_token') || '';
    try {
      const res = await fetch(`https://api.binnycash.com/api/admin/sessions?userId=${userId}&page=${page}&limit=20`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
      });
      const json = await res.json();
      if (res.ok && json.data) {
        setSessions(Array.isArray(json.data) ? json.data : (json.data.docs || json.data.sessions || []));
        setSessionTotalPages(json.data.totalPages || json.pagination?.totalPages || 1);
      } else {
        setSessions([]);
      }
    } catch (err) { setSessions([]); } 
    finally { setIsSessionsLoading(false); }
  };

  // Watch for session pagination
  useEffect(() => {
    if (profileData && profileTab === 'sessions') {
      fetchSessions(profileData.id || profileData._id, sessionPage);
    }
  }, [sessionPage, profileTab]);

  const handleViewProfile = async (user: any) => {
    const numericId = user.id || user._id;
    setIsProfileModalOpen(true);
    setIsProfileLoading(true);
    setProfileData(null);
    setProfileTab('overview'); 
    setActivities([]);
    setRiskData(null);
    setSessions([]);
    setSessionPage(1);
    
    const token = localStorage.getItem('admin_token');
    try {
      const res = await fetch(`https://api.binnycash.com/api/admin/detail/${encodeURIComponent(numericId)}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const json = await res.json();
      if (json?.code === 200 && json?.data) {
        setProfileData(json.data);
        fetchActivities(numericId);
        fetchRiskData(numericId);
      } else {
        setProfileData({ error: json?.message || 'Failed to load detailed profile.' });
      }
    } catch (err) {
      setProfileData({ error: 'Network error while fetching details.' });
    } finally {
      setIsProfileLoading(false);
    }
  };

  // --- 🔥 SESSION TERMINATION LOGIC 🔥 ---
  const handleTerminateSession = async (sessionId?: string) => {
    if (!profileData) return;
    const isAll = !sessionId;

    if (isAll) {
      if (!confirm(`Are you sure you want to terminate ALL active sessions for ${profileData.userName || profileData.name}?`)) return;
      setIsTerminatingAll(true);
    } else {
      if (!confirm("Are you sure you want to terminate this specific session?")) return;
      setTerminatingSessionId(sessionId as string);
    }

    const token = localStorage.getItem('admin_token') || '';
    const userId = profileData.id || profileData._id;

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
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/x-www-form-urlencoded' },
        body: fd
      });

      if (res.ok) {
        if (isAll) {
          setSessions(sessions.map(s => ({ ...s, isActive: false, status: 'Terminated' })));
        } else {
          setSessions(sessions.map(s => (s._id === sessionId || s.id === sessionId) ? { ...s, isActive: false, status: 'Terminated' } : s));
        }
      } else {
        alert('Failed to terminate session.');
      }
    } catch (err) {
      alert('Network Error while terminating session.');
    } finally {
      setIsTerminatingAll(false);
      setTerminatingSessionId(null);
    }
  };

  // --- 🔥 SYSTEM ACTIONS (RESTORE / DELETE) 🔥 ---
  const openSystemAction = (type: 'RESTRICT' | 'RESTORE' | 'DELETE', targetUser: any) => {
    setSystemAction({ type, isOpen: true, targetUser });
    setActionReason('');
    setSysActionMessage(null);
  };

  const handleSystemActionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (systemAction.type === 'RESTRICT' && !actionReason.trim()) return;

    setIsSubmittingSysAction(true);
    setSysActionMessage(null);
    const token = localStorage.getItem('admin_token') || '';
    const uId = systemAction.targetUser?.id || systemAction.targetUser?._id;

    try {
      let res;
      if (systemAction.type === 'RESTRICT') {
        const fd = new URLSearchParams(); fd.append('reason', actionReason.trim());
        res = await fetch(`https://api.binnycash.com/api/admin/users/restrict?id=${uId}`, {
          method: 'PATCH',
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/x-www-form-urlencoded' },
          body: fd
        });
      } else if (systemAction.type === 'RESTORE') {
        const fd = new URLSearchParams(); fd.append('userId', uId);
        res = await fetch(`https://api.binnycash.com/api/admin/users/restore`, {
          method: 'PATCH',
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/x-www-form-urlencoded' },
          body: fd
        });
      } else if (systemAction.type === 'DELETE') {
        res = await fetch(`https://api.binnycash.com/api/admin/users?id=${uId}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      }

      const json = await res?.json();
      if (res?.ok || json?.code === 200) {
        setSysActionMessage({ text: json.message || `User ${systemAction.type?.toLowerCase() || ''}ed successfully!`, type: 'success' });
        
        if (profileData && (profileData.id === uId || profileData._id === uId)) {
          if (systemAction.type === 'RESTRICT') setProfileData({ ...profileData, status: 'BLOCK', is_blocked: true, isHoldPayout: 1 });
          if (systemAction.type === 'RESTORE') setProfileData({ ...profileData, status: 'ACTIVE', is_blocked: false, isHoldPayout: 0 });
        }
        
        if (systemAction.type === 'DELETE') {
          setTimeout(() => { setIsProfileModalOpen(false); fetchAllData(); }, 1500);
        }

        setTimeout(() => { setSystemAction({ type: null, isOpen: false, targetUser: null }); setSysActionMessage(null); }, 1500);
      } else {
        setSysActionMessage({ text: json?.message || `Failed to ${systemAction.type?.toLowerCase() || ''} user.`, type: 'error' });
      }
    } catch (error) {
      setSysActionMessage({ text: `Network error during ${systemAction.type || 'action'}.`, type: 'error' });
    } finally {
      setIsSubmittingSysAction(false);
    }
  };

  // --- 🔥 PAYOUT RESTRICTIONS (GLOBAL & SINGLE) 🔥 ---
  const handleGlobalPayoutHold = async () => {
    if (!confirm(`Are you sure you want to ${profileData?.isHoldPayout === 1 ? 'RELEASE' : 'HOLD'} all payouts for this user?`)) return;
    
    const token = localStorage.getItem('admin_token') || '';
    const uId = profileData?.id || profileData?._id;
    const newStatus = profileData?.isHoldPayout === 1 ? '0' : '1';

    try {
      const fd = new URLSearchParams();
      fd.append('userId', uId);
      fd.append('isHoldPayout', newStatus);

      const res = await fetch(`https://api.binnycash.com/api/admin/payout/restriction`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/x-www-form-urlencoded' },
        body: fd
      });
      if (res.ok) {
        setProfileData({ ...profileData, isHoldPayout: Number(newStatus) });
        alert(`Global Payout ${newStatus === '1' ? 'Hold Applied' : 'Released'} Successfully.`);
      }
    } catch (err) { alert('Failed to update global payout restriction.'); }
  };

  const handleSinglePayoutHold = async (actId: string, currentHoldStatus: boolean) => {
    const newHoldStatus = !currentHoldStatus;
    const token = localStorage.getItem('admin_token') || '';

    try {
      const fd = new URLSearchParams();
      fd.append('completedId', actId);
      fd.append('isHold', String(newHoldStatus));

      const res = await fetch(`https://api.binnycash.com/api/admin/payout/hold`, {
        method: 'PATCH',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/x-www-form-urlencoded' },
        body: fd
      });
      if (res.ok) {
        setActivities(activities.map(a => (a._id === actId || a.id === actId) ? { ...a, isHold: newHoldStatus } : a));
      } else {
        alert('Failed to update specific payout status.');
      }
    } catch (err) { alert('Network error during payout hold update.'); }
  };


  // --- 🔥 WARNING MODAL (CLEAN STATE OPENER) 🔥 ---
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
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/x-www-form-urlencoded' },
        body: fd
      });

      const json = await res.json();
      if (res.ok || json?.code === 200) {
        setWarningMessage({ text: json.message || "Warning sent successfully!", type: 'success' });
        setTimeout(() => { setIsWarningModalOpen(false); setWarningMessage(null); }, 1500);
      } else {
        setWarningMessage({ text: json.message || "Failed to send warning.", type: 'error' });
      }
    } catch (error) {
      setWarningMessage({ text: "Network error while sending warning.", type: 'error' });
    } finally {
      setIsSubmittingWarning(false);
    }
  };

  // --- 🔥 ADJUST BALANCE MODAL (CLEAN STATE OPENER) 🔥 ---
  const openAdjustModal = (user: any) => {
    setSelectedUserForAdjust(user);
    setAmountInput('');
    setActionStatus('1');
    setAdjustMessage(null);
    setIsAdjustModalOpen(true);
  };

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amountInput || Number(amountInput) <= 0) { 
      setAdjustMessage({ text: "Please enter a valid amount.", type: 'error' });
      return; 
    }

    setIsSubmittingAdjust(true);
    setAdjustMessage(null);
    const token = localStorage.getItem('admin_token');

    try {
      const fd = new URLSearchParams();
      fd.append('userId', selectedUserForAdjust?.id || selectedUserForAdjust?._id);
      fd.append('amount', amountInput);
      fd.append('status', actionStatus); 
      fd.append('adminId', getAdminId()); 

      const res = await fetch(`https://api.binnycash.com/api/admin/balance/adjust`, {
        method: 'PATCH', 
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/x-www-form-urlencoded' },
        body: fd
      });
      const json = await res.json();
      if (res.ok || json?.code === 200) {
        const adjustAmount = Number(amountInput);
        const newBal = actionStatus === '1' ? Number(selectedUserForAdjust.availableBalance) + adjustAmount : Math.max(0, Number(selectedUserForAdjust.availableBalance) - adjustAmount);
        
        // Update both Main List and Profile if open
        setUsers(users.map(u => (u.id === selectedUserForAdjust.id || u._id === selectedUserForAdjust._id) ? { ...u, availableBalance: newBal } : u));
        if (profileData && (profileData.id === selectedUserForAdjust.id || profileData._id === selectedUserForAdjust._id)) {
          setProfileData({ ...profileData, availableBalance: newBal });
        }
        
        setAdjustMessage({ text: json.message || "Balance updated successfully!", type: 'success' });
        setTimeout(() => { setIsAdjustModalOpen(false); setAdjustMessage(null); }, 1500);
      } else {
        setAdjustMessage({ text: json.message || "Failed to update balance.", type: 'error' });
      }
    } catch (error) { setAdjustMessage({ text: "Network error while updating balance.", type: 'error' }); } 
    finally { setIsSubmittingAdjust(false); }
  };

  // 🔥 LOGIN AS USER 🔥
  const openLoginModal = (user: any) => {
    setSelectedUserForLogin(user);
    setIsLoginModalOpen(true);
  };

  const handleLoginAsUser = async () => {
    if (!selectedUserForLogin) return;
    const userId = selectedUserForLogin.id || selectedUserForLogin._id;
    setIsLoggingInUser(userId);
    const adminToken = localStorage.getItem('admin_token');

    try {
      const res = await fetch(`https://api.binnycash.com/api/admin/user_login_admin`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${adminToken}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminId: getAdminId(), id: userId })
      });
      const json = await res.json();
      
      if (res.ok && (json.code === 200 || json.token || json.data?.token)) {
        const userToken = json.token || json.data?.token;
        const userDetails = json.data?.user || json.data?.userDetails || json.data || json;
        if (userToken) {
          localStorage.setItem('token', userToken);
          localStorage.setItem('userId', userId);
          if (userDetails) localStorage.setItem('userDetails', JSON.stringify(userDetails));
          window.open('/dashboard', '_blank'); 
          setIsLoginModalOpen(false);
        }
      } else { alert(json.message || 'Failed to login as user.'); }
    } catch (err) { alert('Network error while trying to login as user.'); } 
    finally { setIsLoggingInUser(null); }
  };

  const safeUsers = Array.isArray(users) ? users : [];
  const filteredUsers = safeUsers.filter(u => {
    const name = u?.userName || u?.name || '';
    const email = u?.email || '';
    const idStr = String(u?.id || u?._id || '');
    const query = searchQuery.toLowerCase();
    return name.toLowerCase().includes(query) || email.toLowerCase().includes(query) || idStr.includes(query);
  });

  const totalPages = Math.ceil(filteredUsers.length / usersPerPage) || 1;
  const paginatedUsers = filteredUsers.slice((currentPage - 1) * usersPerPage, currentPage * usersPerPage);

  const overviewStats = [
    { title: "Total Users", value: dashboardStats?.users?.total || 0, subValue: `${dashboardStats?.users?.active || 0} Active`, icon: Users, bgColor: "bg-blue-500/20", iconColor: "text-blue-400" },
    { title: "Total Revenue", value: formatPrice(Number(dashboardStats?.revenue?.total || 0), currency), subValue: `Month: ${formatPrice(Number(dashboardStats?.revenue?.thisMonth || 0), currency)}`, icon: DollarSign, bgColor: "bg-emerald-500/20", iconColor: "text-emerald-400" },
    { title: "Total Payouts", value: formatPrice(Number(dashboardStats?.payout?.total || 0), currency), subValue: `Month: ${formatPrice(Number(dashboardStats?.payout?.thisMonth || 0), currency)}`, icon: Wallet, bgColor: "bg-amber-500/20", iconColor: "text-amber-400" },
    { title: "Net Profit", value: formatPrice(Number(dashboardStats?.profit?.total || 0), currency), subValue: `Month: ${formatPrice(Number(dashboardStats?.profit?.thisMonth || 0), currency)}`, icon: TrendingUp, bgColor: "bg-[#7C3AED]/20", iconColor: "text-[#7C3AED]" },
  ];

  const getStatusColor = (status: string) => {
    const s = String(status || '').toUpperCase();
    if (s === 'ACTIVE') return 'text-emerald-400 border-emerald-400/20 bg-emerald-400/10';
    if (s === 'BLOCK') return 'text-rose-400 border-rose-400/20 bg-rose-400/10';
    if (s === 'INACTIVE') return 'text-gray-400 border-gray-400/20 bg-gray-400/10';
    if (s === 'DELETE') return 'text-red-600 border-red-600/20 bg-red-600/10';
    return 'text-emerald-400 border-emerald-400/20 bg-emerald-400/10';
  };
  
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

  const getDeviceIcon = (deviceInfo: string) => {
    const info = (deviceInfo || '').toLowerCase();
    if (info.includes('mobile') || info.includes('android') || info.includes('iphone')) return <Smartphone className="w-4 h-4" />;
    if (info.includes('mac') || info.includes('windows') || info.includes('pc')) return <Laptop className="w-4 h-4" />;
    return <Globe className="w-4 h-4" />;
  };

  return (
    <div className="flex flex-col gap-6 text-white w-full max-w-[1600px] mx-auto pb-10 font-sans">
      
      {/* BREADCRUMBS & TITLE */}
      <div className="flex flex-col gap-1">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-bold text-white mt-1">User List & Directory</h1>
           </div>
          <div className="flex items-center gap-3">
             <button onClick={fetchAllData} disabled={isLoading} className="flex items-center gap-2 bg-[#7C3AED] hover:bg-[#6D28D9] disabled:opacity-50 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer shadow-sm">
               {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
               Refresh
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

      {/* OVERVIEW CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {overviewStats.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-[#12141C] border border-white/5 rounded-xl p-5 flex items-start gap-4 shadow-sm hover:border-white/10 transition-colors">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${stat.bgColor} ${stat.iconColor}`}>
                <Icon className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="text-xs text-gray-400 font-medium">{stat.title}</span>
                <span className="text-xl font-bold text-white mt-0.5">{isLoading ? '...' : stat.value}</span>
                <span className={`text-[10px] font-medium mt-1 ${stat.iconColor}`}>{stat.subValue}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* FILTERS BAR & RESTRICTED TOGGLE */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#12141C] p-4 rounded-xl border border-white/5">
        <div className="flex items-center bg-white/5 p-1 rounded-lg border border-white/10">
           <button 
             onClick={() => setUserFilter('ALL')} 
             className={`px-4 py-2 rounded-md text-xs font-bold transition-all ${userFilter === 'ALL' ? 'bg-[#7C3AED] text-white shadow-md' : 'text-gray-400 hover:text-white'}`}
           >
             All Users
           </button>
           <button 
             onClick={() => setUserFilter('RESTRICTED')} 
             className={`px-4 py-2 rounded-md text-xs font-bold transition-all flex items-center gap-1 ${userFilter === 'RESTRICTED' ? 'bg-rose-500 text-white shadow-md' : 'text-gray-400 hover:text-white'}`}
           >
             <ShieldBan className="w-3.5 h-3.5" /> Restricted
           </button>
        </div>

        <div className="relative flex-1 max-w-md">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
           <input 
             type="text" 
             value={searchQuery}
             onChange={(e) => setSearchQuery(e.target.value)}
             placeholder="Search by username, ID or email..." 
             className="w-full bg-[#0B0D14] border border-white/10 rounded-lg pl-9 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#7C3AED] transition-colors"
           />
        </div>
      </div>

      {/* DATA TABLE */}
      <div className="bg-[#12141C] border border-white/5 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto min-h-[400px]">
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
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-sm">
              {isLoading && users.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-20 text-center text-gray-500 font-medium">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-[#7C3AED]" /> Fetching {userFilter.toLowerCase()} database...
                  </td>
                </tr>
              ) : paginatedUsers.length > 0 ? (
                paginatedUsers.map((u: any, idx: number) => {
                  const avatarUrl = resolveImage(u?.image);
                  const userName = u?.userName || u?.name || 'Unnamed User';
                  const firstLetter = userName.charAt(0).toUpperCase();
                  const displayId = u?.id || u?._id || idx + 1;
                  const joinedDate = u?.createdAt ? new Date(u.createdAt) : null;
                  
                  const docStatus = u?.documents?.status || 'not_submited';
                  const hasImageError = imageErrors[u?._id || u?.id];
                  const countryDisplay = (u?.countryCode || u?.country || 'IN').substring(0, 2).toUpperCase();

                  const isLoggingIn = isLoggingInUser === (u?.id || u?._id);

                  return (
                    <tr key={u?._id || u?.id || idx} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="py-3 px-5 text-gray-400 font-mono text-xs">{displayId}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          {avatarUrl && !hasImageError ? (
                            <img 
                              src={avatarUrl} 
                              alt="avatar" 
                              onError={() => setImageErrors(prev => ({ ...prev, [u?._id || u?.id]: true }))}
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
                      
                      {/* 🔥 3-DOTS ACTION MENU 🔥 */}
                      <td className="py-3 px-6 text-right">
                         <div className="flex justify-end">
                           <ActionMenu 
                             user={u} 
                             onView={() => handleViewProfile(u)} 
                             onLogin={() => openLoginModal(u)} 
                             onAdjust={() => openAdjustModal(u)}
                             onWarn={() => openWarningModal(u)}
                             isLoggingIn={isLoggingIn} 
                           />
                         </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-gray-500">
                    {searchQuery ? 'No matching users found.' : `No ${userFilter.toLowerCase()} users found in database.`}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        
        {/* CLIENT SIDE PAGINATION FOOTER */}
        <div className="flex items-center justify-between p-4 border-t border-white/5 bg-[#12141C]">
           <span className="text-sm text-gray-400">
             Showing {filteredUsers.length > 0 ? (currentPage - 1) * usersPerPage + 1 : 0} - {Math.min(currentPage * usersPerPage, filteredUsers.length)} of <span className="font-bold text-white">{filteredUsers.length}</span> total users
             {isLoading && <span className="text-[#A66CFF] ml-2 animate-pulse">(fetching more...)</span>}
           </span>
           <div className="flex items-center gap-2">
              <button 
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
                disabled={currentPage === 1} 
                className="w-8 h-8 rounded border border-white/10 flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/5 disabled:opacity-50 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              <div className="px-3 h-8 rounded bg-[#7C3AED] text-white flex items-center justify-center font-medium text-sm cursor-default">
                Page {currentPage} of {totalPages}
              </div>
              
              <button 
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
                disabled={currentPage === totalPages} 
                className="w-8 h-8 rounded border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/5 disabled:opacity-50 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
           </div>
        </div>
      </div>

      {/* --- MODAL: DETAILED USER PROFILE WITH ACTIONS --- */}
      <AnimatePresence>
      {isProfileModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
            className="bg-[#12141C] border border-white/10 w-full max-w-5xl rounded-[32px] shadow-2xl relative my-auto max-h-[90vh] overflow-hidden flex flex-col"
          >
            <div className="flex items-center justify-between border-b border-white/10 px-8 py-5 bg-[#161821] shrink-0">
              <h3 className="text-xl font-black text-white flex items-center gap-2">
                <UserCheck className="w-5 h-5 text-[#7C3AED]" /> User Intelligence Center
              </h3>
              <div className="flex items-center gap-3">
                {/* 🔥 ACTION BUTTONS INSIDE PROFILE HEADER 🔥 */}
                {!isProfileLoading && profileData && !profileData.error && (
                  <>
                    <button 
                      onClick={handleGlobalPayoutHold} 
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer ${profileData?.isHoldPayout === 1 ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/20'}`}
                    >
                      {profileData?.isHoldPayout === 1 ? (
                        <><PlayCircle className="w-3.5 h-3.5" /> Release Payouts</>
                      ) : (
                        <><PauseCircle className="w-3.5 h-3.5" /> Hold Payouts</>
                      )}
                    </button>
                    
                    {profileTab === 'sessions' && (
                      <button 
                        onClick={() => handleTerminateSession()} 
                        disabled={isTerminatingAll || sessions.filter(s => s.isActive !== false).length === 0}
                        className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/20 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
                      >
                        {isTerminatingAll ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Power className="w-3.5 h-3.5" />} 
                        Terminate All Sessions
                      </button>
                    )}

                    {(profileData?.status === 'BLOCK' || profileData?.is_blocked) && (
                      <button onClick={() => openSystemAction('RESTORE', profileData)} className="bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer">
                        <Unlock className="w-3.5 h-3.5" /> Restore Access
                      </button>
                    )}
                    
                    <button onClick={() => openSystemAction('DELETE', profileData)} className="bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/20 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer">
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </>
                )}
                <div className="w-px h-6 bg-white/10 mx-1"></div>
                <button onClick={() => setIsProfileModalOpen(false)} className="text-gray-400 hover:text-white transition-colors cursor-pointer bg-white/5 hover:bg-white/10 p-2 rounded-xl">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="overflow-y-auto custom-scrollbar p-8 flex-1">
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
                  <div className="flex items-center justify-between bg-[#0B0D14] p-5 rounded-3xl border border-white/5 shadow-inner relative overflow-hidden">
                     {/* If Payout is on Hold, show global banner */}
                     {profileData?.isHoldPayout === 1 && (
                        <div className="absolute top-0 left-0 w-full h-1 bg-rose-500"></div>
                     )}
                     
                     <div className="flex items-center gap-4 relative z-10">
                       <div className="w-20 h-20 rounded-2xl bg-[#7C3AED]/20 border border-[#7C3AED]/40 flex items-center justify-center text-[#7C3AED] font-bold text-3xl shrink-0 overflow-hidden shadow-lg">
                          {resolveImage(profileData?.image) ? <img src={resolveImage(profileData.image) || ''} alt="User" className="w-full h-full object-cover" /> : (profileData?.userName?.charAt(0).toUpperCase() || 'U')}
                       </div>
                       <div className="flex flex-col">
                         <h2 className="text-3xl font-black text-white flex items-center gap-3">
                           {profileData?.userName || 'Unknown User'}
                           {profileData?.isHoldPayout === 1 && <span className="bg-rose-500 text-white text-[10px] px-2 py-0.5 rounded-full uppercase tracking-wider">Payout Held</span>}
                         </h2>
                         <div className="flex flex-wrap items-center gap-3 mt-2">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border uppercase tracking-wider ${getStatusColor(profileData?.status)}`}>
                              {profileData?.status || 'N/A'}
                            </span>
                            <span className="text-xs text-gray-400 flex items-center gap-1 bg-white/5 px-2 py-0.5 rounded-full border border-white/5"><MapPin className="w-3 h-3"/> {(profileData?.countryCode || profileData?.country || 'IN').substring(0, 2).toUpperCase()}</span>
                            <span className="text-xs text-gray-400 bg-white/5 px-2 py-0.5 rounded-full border border-white/5 font-mono">ID: {profileData?.id || profileData?._id}</span>
                         </div>
                       </div>
                     </div>
                     
                     <div className="text-right hidden sm:block bg-emerald-500/10 border border-emerald-500/20 px-6 py-4 rounded-2xl relative z-10">
                       <p className="text-[10px] text-emerald-400/80 uppercase font-bold tracking-widest mb-1 flex justify-between items-center gap-4">
                         Available Balance
                         <button onClick={() => openAdjustModal(profileData)} className="hover:text-white transition-colors" title="Adjust Balance"><SlidersHorizontal className="w-3.5 h-3.5"/></button>
                       </p>
                       <p className="text-4xl font-black text-emerald-400 leading-none">{formatPrice(Number(profileData?.availableBalance || 0), currency)}</p>
                     </div>
                  </div>

                  {/* --- MODAL TABS --- */}
                  <div className="flex gap-6 border-b border-white/10 overflow-x-auto no-scrollbar">
                     <button onClick={() => setProfileTab('overview')} className={`pb-3 text-sm font-bold transition-all whitespace-nowrap ${profileTab === 'overview' ? 'text-[#7C3AED] border-b-2 border-[#7C3AED]' : 'text-gray-500 hover:text-gray-300'}`}>Overview & Security</button>
                     <button onClick={() => setProfileTab('activities')} className={`pb-3 text-sm font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${profileTab === 'activities' ? 'text-[#7C3AED] border-b-2 border-[#7C3AED]' : 'text-gray-500 hover:text-gray-300'}`}><Activity className="w-4 h-4"/> Completed Activities</button>
                     <button onClick={() => setProfileTab('risk')} className={`pb-3 text-sm font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${profileTab === 'risk' ? 'text-rose-400 border-b-2 border-rose-400' : 'text-gray-500 hover:text-gray-300'}`}><Radar className="w-4 h-4"/> Risk Analysis</button>
                     <button onClick={() => setProfileTab('sessions')} className={`pb-3 text-sm font-bold transition-all whitespace-nowrap flex items-center gap-1.5 ${profileTab === 'sessions' ? 'text-[#7C3AED] border-b-2 border-[#7C3AED]' : 'text-gray-500 hover:text-gray-300'}`}><Monitor className="w-4 h-4"/> Sessions</button>
                     <button onClick={() => setProfileTab('earnings')} className={`pb-3 text-sm font-bold transition-all whitespace-nowrap ${profileTab === 'earnings' ? 'text-[#7C3AED] border-b-2 border-[#7C3AED]' : 'text-gray-500 hover:text-gray-300'}`}>Earnings Breakdown</button>
                     <button onClick={() => setProfileTab('wallet')} className={`pb-3 text-sm font-bold transition-all whitespace-nowrap ${profileTab === 'wallet' ? 'text-[#7C3AED] border-b-2 border-[#7C3AED]' : 'text-gray-500 hover:text-gray-300'}`}>Wallet & Withdrawals</button>
                  </div>

                  {/* --- TAB: OVERVIEW --- */}
                  {profileTab === 'overview' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                      
                      <div className="bg-[#0B0D14] border border-white/5 rounded-xl p-5 flex flex-col gap-1 col-span-1 md:col-span-2">
                        <span className="text-[10px] uppercase text-gray-500 font-bold flex items-center gap-1.5 mb-2"><Clock className="w-3.5 h-3.5" /> Account Timelines</span>
                        <div className="grid grid-cols-2 gap-8">
                           <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                             <span className="text-xs text-gray-500 block mb-1">Joined On:</span>
                             <span className="text-sm font-bold text-white block">{profileData?.createdAt ? new Date(profileData.createdAt).toLocaleDateString() : 'N/A'}</span>
                             <span className="text-[10px] text-gray-400">{profileData?.createdAt ? new Date(profileData.createdAt).toLocaleTimeString() : ''}</span>
                           </div>
                           <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                             <span className="text-xs text-gray-500 block mb-1">Last Active:</span>
                             <span className="text-sm font-bold text-white block">{profileData?.lastActive ? new Date(profileData.lastActive).toLocaleDateString() : 'N/A'}</span>
                             <span className="text-[10px] text-gray-400">{profileData?.lastActive ? new Date(profileData.lastActive).toLocaleTimeString() : ''}</span>
                           </div>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* --- TAB: COMPLETED ACTIVITIES (WITH HOLD ACTION) --- */}
                  {profileTab === 'activities' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4">
                      <div className="flex items-center justify-between">
                         <h4 className="text-white font-bold flex items-center gap-2"><Activity className="w-4 h-4 text-[#A66CFF]"/> Recent Offer & Survey Activity</h4>
                         <span className="text-xs text-gray-500 bg-white/5 px-3 py-1 rounded-full border border-white/10">Showing latest records</span>
                      </div>

                      <div className="bg-[#0B0D14] border border-white/5 rounded-2xl overflow-hidden shadow-inner">
                        <div className="overflow-x-auto custom-scrollbar max-h-[350px]">
                          <table className="w-full text-left border-collapse whitespace-nowrap">
                            <thead className="sticky top-0 bg-[#161821] z-10 border-b border-white/10 shadow-sm">
                              <tr className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">
                                <th className="py-3 px-4">Activity Name</th>
                                <th className="py-3 px-4">Network</th>
                                <th className="py-3 px-4 text-right">Payout</th>
                                <th className="py-3 px-4 text-center">Status</th>
                                <th className="py-3 px-4 text-right">Action</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 text-sm">
                              {isActivitiesLoading ? (
                                <tr>
                                  <td colSpan={5} className="py-10 text-center">
                                    <Loader2 className="w-6 h-6 animate-spin text-[#A66CFF] mx-auto mb-2" />
                                    <span className="text-xs text-gray-500">Fetching activity records...</span>
                                  </td>
                                </tr>
                              ) : activities.length > 0 ? (
                                activities.map((act: any, idx: number) => {
                                  const name = act.offer_name || act.surveyName || act.offerName || 'Unknown Activity';
                                  const network = act.networkName || act.network || 'Unknown';
                                  const payout = Number(act.userCredits || act.amount || 0);
                                  const img = resolveImage(act.logo || act.offerImage || act.surveyImage);
                                  const isCurrentlyHeld = act.isHold === true || act.status === 'Hold';

                                  return (
                                    <tr key={act._id || act.id || idx} className="hover:bg-white/[0.02] transition-colors">
                                      <td className="py-3 px-4">
                                        <div className="flex items-center gap-3">
                                          {img ? (
                                            <img src={img} alt="logo" className="w-8 h-8 rounded-lg object-cover bg-white/5" />
                                          ) : (
                                            <div className="w-8 h-8 rounded-lg bg-[#A66CFF]/20 flex items-center justify-center text-[10px] font-bold text-[#A66CFF]">{name.charAt(0)}</div>
                                          )}
                                          <span className="text-white font-bold truncate max-w-[150px]">{name}</span>
                                        </div>
                                      </td>
                                      <td className="py-3 px-4 text-gray-300 text-xs">{network}</td>
                                      <td className="py-3 px-4 text-right font-bold text-[#00E57A] f-mono">+{formatPrice(payout, currency)}</td>
                                      <td className="py-3 px-4 text-center">
                                         {isCurrentlyHeld ? (
                                           <span className="bg-amber-500/10 text-amber-500 border border-amber-500/20 px-2 py-0.5 rounded text-[10px] font-bold uppercase">On Hold</span>
                                         ) : (
                                           <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded text-[10px] font-bold uppercase">Completed</span>
                                         )}
                                      </td>
                                      <td className="py-3 px-4 text-right">
                                         <button 
                                            onClick={() => handleSinglePayoutHold(act._id || act.id, isCurrentlyHeld)}
                                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 ml-auto ${isCurrentlyHeld ? 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400'}`}
                                         >
                                            {isCurrentlyHeld ? <PlayCircle className="w-3.5 h-3.5"/> : <PauseCircle className="w-3.5 h-3.5"/>}
                                            {isCurrentlyHeld ? 'Release' : 'Hold'}
                                         </button>
                                      </td>
                                    </tr>
                                  );
                                })
                              ) : (
                                <tr>
                                  <td colSpan={5} className="py-12 text-center text-gray-500 text-sm">
                                    No completed activities found for this user.
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* --- TAB: RISK ANALYSIS (NEW) --- */}
                  {profileTab === 'risk' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4">
                       <div className="flex items-center justify-between">
                         <h4 className="text-white font-bold flex items-center gap-2"><Radar className="w-4 h-4 text-rose-400"/> Fraud & Risk Detection</h4>
                       </div>
                       
                       {isRiskLoading ? (
                         <div className="py-16 text-center flex flex-col items-center justify-center gap-2 border border-white/5 rounded-2xl">
                           <Loader2 className="w-6 h-6 animate-spin text-rose-400" />
                           <span className="text-xs text-gray-500">Analyzing completion patterns...</span>
                         </div>
                       ) : riskData && (Array.isArray(riskData) ? riskData.length > 0 : Object.keys(riskData).length > 0) ? (
                         <div className="bg-[#0B0D14] border border-rose-500/20 rounded-2xl p-5 shadow-inner">
                            <div className="grid grid-cols-1 gap-4">
                              {(Array.isArray(riskData) ? riskData : [riskData]).map((r: any, i: number) => (
                                <div key={i} className="bg-white/5 border border-white/5 p-4 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                  <div className="flex flex-col gap-1">
                                    <span className="text-sm font-bold text-white">{r.offerName || r.name || r.activity || 'Suspicious Activity Detected'}</span>
                                    <span className="text-xs text-rose-400 font-medium">Reason: {r.reason || r.fraudReason || 'Speeding / LOI Mismatch'}</span>
                                  </div>
                                  <div className="flex items-center gap-4 text-xs font-mono bg-[#161821] px-4 py-2 rounded-lg border border-white/5">
                                    <div className="flex flex-col items-center">
                                      <span className="text-gray-500">Expected LOI</span>
                                      <span className="text-white">{r.loi || r.expectedLoi || '--'} min</span>
                                    </div>
                                    <div className="w-px h-6 bg-white/10"></div>
                                    <div className="flex flex-col items-center">
                                      <span className="text-gray-500">Actual Time</span>
                                      <span className="text-rose-400 font-bold">{r.avgTime || r.actualTime || '--'} min</span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                         </div>
                       ) : (
                         <div className="bg-[#0B0D14] border border-white/5 rounded-2xl py-12 flex flex-col items-center text-center shadow-inner">
                           <ShieldCheck className="w-10 h-10 text-emerald-500 mb-2 opacity-50" />
                           <span className="text-white font-bold">No Risk Flags Detected</span>
                           <span className="text-xs text-gray-500 mt-1">This user's activity looks clean based on our security algorithms.</span>
                         </div>
                       )}
                    </motion.div>
                  )}

                  {/* --- TAB: SESSIONS (NEW) --- */}
                  {profileTab === 'sessions' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4">
                      <div className="bg-[#0B0D14] border border-white/5 rounded-2xl overflow-hidden shadow-inner">
                        <div className="overflow-x-auto custom-scrollbar">
                          <table className="w-full text-left border-collapse whitespace-nowrap">
                            <thead className="bg-[#161821] border-b border-white/10">
                              <tr className="text-gray-400 text-[10px] font-bold uppercase tracking-wider">
                                <th className="py-3 px-4">Device & IP</th>
                                <th className="py-3 px-4">Location</th>
                                <th className="py-3 px-4">Login Time</th>
                                <th className="py-3 px-4 text-center">Status</th>
                                <th className="py-3 px-4 text-right">Action</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5 text-sm">
                              {isSessionsLoading ? (
                                <tr>
                                  <td colSpan={5} className="py-10 text-center">
                                    <Loader2 className="w-6 h-6 animate-spin text-[#7C3AED] mx-auto mb-2" />
                                    <span className="text-xs text-gray-500">Fetching sessions...</span>
                                  </td>
                                </tr>
                              ) : sessions.length > 0 ? (
                                sessions.map((session: any, idx: number) => {
                                  const sId = session._id || session.id;
                                  const isActive = session.isActive !== false && session.status !== 'Terminated';
                                  const loginDate = session.createdAt ? new Date(session.createdAt) : null;
                                  const isRowTerminating = terminatingSessionId === sId;

                                  return (
                                    <tr key={sId || idx} className="hover:bg-white/[0.02] transition-colors">
                                      <td className="py-3 px-4">
                                        <div className="flex items-center gap-3">
                                          <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-gray-400 border border-white/10 shrink-0">
                                            {getDeviceIcon(session.deviceInfo || session.userAgent)}
                                          </div>
                                          <div className="flex flex-col">
                                            <span className="font-bold text-white max-w-[150px] truncate" title={session.deviceInfo || session.userAgent || 'Unknown Device'}>
                                              {session.deviceInfo || session.userAgent || 'Unknown Device'}
                                            </span>
                                            <span className="text-[10px] text-gray-500 font-mono">{session.ipAddress || session.ip || 'Unknown IP'}</span>
                                          </div>
                                        </div>
                                      </td>
                                      <td className="py-3 px-4 text-gray-300 text-xs">{session.location || session.country || 'N/A'}</td>
                                      <td className="py-3 px-4 text-xs">
                                        <span className="text-white block">{loginDate ? loginDate.toLocaleDateString() : 'N/A'}</span>
                                        <span className="text-gray-500">{loginDate ? loginDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                                      </td>
                                      <td className="py-3 px-4 text-center">
                                        {isActive ? (
                                          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[9px] font-bold uppercase text-emerald-400 bg-emerald-400/10 border border-emerald-400/20">
                                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div> Active
                                          </span>
                                        ) : (
                                          <span className="inline-block px-2 py-0.5 rounded text-[9px] font-bold uppercase text-gray-400 bg-white/5 border border-white/10">Terminated</span>
                                        )}
                                      </td>
                                      <td className="py-3 px-4 text-right">
                                        <button 
                                          onClick={() => handleTerminateSession(sId)}
                                          disabled={!isActive || isRowTerminating}
                                          className={`w-8 h-8 rounded-lg flex items-center justify-center ml-auto transition-colors ${isActive ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/20 cursor-pointer' : 'bg-white/5 text-gray-600 border border-transparent cursor-not-allowed'}`}
                                          title={isActive ? "Terminate session" : "Terminated"}
                                        >
                                          {isRowTerminating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Power className="w-3.5 h-3.5" />}
                                        </button>
                                      </td>
                                    </tr>
                                  );
                                })
                              ) : (
                                <tr>
                                  <td colSpan={5} className="py-12 text-center text-gray-500 text-sm">
                                    No sessions found.
                                  </td>
                                </tr>
                              )}
                            </tbody>
                          </table>
                        </div>
                        {sessions.length > 0 && sessionTotalPages > 1 && (
                          <div className="flex items-center justify-between p-3 border-t border-white/5 bg-[#161821]">
                            <span className="text-xs text-gray-400">Page <span className="text-white">{sessionPage}</span> of {sessionTotalPages}</span>
                            <div className="flex gap-2">
                              <button onClick={() => setSessionPage(p => Math.max(1, p - 1))} disabled={sessionPage === 1} className="p-1.5 rounded bg-white/5 hover:bg-white/10 disabled:opacity-30"><ChevronLeft className="w-4 h-4 text-gray-300" /></button>
                              <button onClick={() => setSessionPage(p => Math.min(sessionTotalPages, p + 1))} disabled={sessionPage === sessionTotalPages} className="p-1.5 rounded bg-white/5 hover:bg-white/10 disabled:opacity-30"><ChevronRight className="w-4 h-4 text-gray-300" /></button>
                            </div>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )}

                  {/* --- TAB: EARNINGS BREAKDOWN --- */}
                  {profileTab === 'earnings' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-4">
                      <div className="bg-gradient-to-r from-emerald-500/10 to-transparent border border-emerald-500/20 rounded-2xl p-6 flex justify-between items-center shadow-inner">
                         <div>
                           <h4 className="text-emerald-400 font-black text-xl">Total Gross Earnings</h4>
                           <p className="text-xs text-gray-400 mt-1">Total amount earned across all sources</p>
                         </div>
                         <span className="text-4xl font-black text-emerald-400">{formatPrice(Number(profileData?.totalEarnings || 0), currency)}</span>
                      </div>
                      
                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                         <div className="bg-[#0B0D14] border border-white/5 rounded-2xl p-5 flex flex-col justify-center items-center text-center hover:border-white/10 transition-colors shadow-sm">
                           <Gift className="w-6 h-6 text-[#8B5CF6] mb-3" />
                           <span className="text-[11px] text-gray-500 font-bold uppercase tracking-wider mb-1">Offers</span>
                           <span className="text-xl text-white font-bold">{formatPrice(Number(profileData?.offerEarning || 0), currency)}</span>
                         </div>
                         <div className="bg-[#0B0D14] border border-white/5 rounded-2xl p-5 flex flex-col justify-center items-center text-center hover:border-white/10 transition-colors shadow-sm">
                           <FileText className="w-6 h-6 text-blue-400 mb-3" />
                           <span className="text-[11px] text-gray-500 font-bold uppercase tracking-wider mb-1">Surveys</span>
                           <span className="text-xl text-white font-bold">{formatPrice(Number(profileData?.surveyEarning || 0), currency)}</span>
                         </div>
                         <div className="bg-[#0B0D14] border border-white/5 rounded-2xl p-5 flex flex-col justify-center items-center text-center hover:border-white/10 transition-colors shadow-sm">
                           <Layers className="w-6 h-6 text-pink-400 mb-3" />
                           <span className="text-[11px] text-gray-500 font-bold uppercase tracking-wider mb-1">Offerwalls</span>
                           <span className="text-xl text-white font-bold">{formatPrice(Number(profileData?.offerwallEarning || 0), currency)}</span>
                         </div>
                         <div className="bg-[#0B0D14] border border-white/5 rounded-2xl p-5 flex flex-col justify-center items-center text-center hover:border-white/10 transition-colors shadow-sm">
                           <Star className="w-6 h-6 text-amber-400 mb-3" />
                           <span className="text-[11px] text-gray-500 font-bold uppercase tracking-wider mb-1">Bonus</span>
                           <span className="text-xl text-white font-bold">{formatPrice(Number(profileData?.bonusEarning || 0), currency)}</span>
                         </div>
                      </div>
                      
                      <div className="bg-[#0B0D14] border border-white/5 rounded-2xl p-6 flex items-center justify-between shadow-inner mt-2">
                         <div className="flex items-center gap-4">
                           <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                             <Share2 className="w-6 h-6 text-blue-400" />
                           </div>
                           <div>
                             <span className="text-base font-bold text-white block mb-0.5">Referral Earnings</span>
                             <span className="text-xs text-gray-500">Income generated from invited users</span>
                           </div>
                         </div>
                         <span className="text-2xl font-black text-white">{formatPrice(Number(profileData?.referralEarnings || 0), currency)}</span>
                      </div>
                    </motion.div>
                  )}

                  {/* --- TAB: WALLET & WITHDRAWALS --- */}
                  {profileTab === 'wallet' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-6">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                         <div className="bg-[#7C3AED]/10 border border-[#7C3AED]/20 rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-inner">
                           <Wallet className="w-8 h-8 text-[#7C3AED] mb-3" />
                           <span className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">Total Withdrawn</span>
                           <span className="text-3xl text-white font-black">{formatPrice(Number(profileData?.totalWithdrawal || 0), currency)}</span>
                           <span className="text-[10px] font-bold text-[#7C3AED] bg-[#7C3AED]/10 px-2 py-1 rounded-md mt-2">{profileData?.approvedWithdrawalCount || 0} Successful Payouts</span>
                         </div>
                         <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-inner">
                           <Clock className="w-8 h-8 text-amber-500 mb-3" />
                           <span className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">Pending Amount</span>
                           <span className="text-3xl text-amber-400 font-black">{formatPrice(Number(profileData?.pendingAmount || 0), currency)}</span>
                           <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2 py-1 rounded-md mt-2">{profileData?.pendingWithdrawalCount || 0} Pending Requests</span>
                         </div>
                         <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-inner">
                           <AlertCircle className="w-8 h-8 text-red-500 mb-3" />
                           <span className="text-xs text-gray-400 uppercase font-bold tracking-wider mb-1">Total Reversals</span>
                           <span className="text-3xl text-red-400 font-black">{formatPrice(Number(profileData?.reversalAmount || 0), currency)}</span>
                           <span className="text-[10px] font-bold text-red-400 bg-red-500/10 px-2 py-1 rounded-md mt-2">{profileData?.reversalCount || 0} Chargebacks</span>
                         </div>
                      </div>
                      
                      {/* GLOBAL PAYOUT HOLD PANEL */}
                      <div className={`bg-gradient-to-r ${profileData?.isHoldPayout === 1 ? 'from-rose-500/20 to-transparent border-rose-500/30' : 'from-emerald-500/10 to-transparent border-emerald-500/20'} border rounded-2xl p-5 flex items-center justify-between shadow-inner`}>
                         <div className="flex flex-col">
                           <h4 className="text-white font-bold text-lg flex items-center gap-2">
                             Global Payout Restriction
                           </h4>
                           <p className="text-xs text-gray-400 mt-1 max-w-sm">
                             Currently, user's payouts are <strong className={profileData?.isHoldPayout === 1 ? 'text-rose-400' : 'text-emerald-400'}>{profileData?.isHoldPayout === 1 ? 'ON HOLD' : 'ALLOWED'}</strong>.
                           </p>
                         </div>
                         <button 
                           onClick={handleGlobalPayoutHold}
                           className={`px-5 py-2.5 rounded-xl font-bold text-sm cursor-pointer transition-colors ${profileData?.isHoldPayout === 1 ? 'bg-emerald-500 hover:bg-emerald-600 text-black' : 'bg-rose-500 hover:bg-rose-600 text-white'}`}
                         >
                           {profileData?.isHoldPayout === 1 ? 'Release All Payouts' : 'Hold All Payouts'}
                         </button>
                      </div>

                    </motion.div>
                  )}

                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
      </AnimatePresence>

      {/* --- ALL CONTROL MODALS (Nested outside for safety) --- */}

      {/* MODAL: SYSTEM ACTION (RESTORE / DELETE) */}
      <AnimatePresence>
        {systemAction.isOpen && systemAction.type && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-[#050409]/90 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className={`bg-[#12141C] border ${systemAction.type === 'DELETE' ? 'border-red-500/30' : 'border-white/10'} w-full max-w-sm rounded-[32px] shadow-2xl relative flex flex-col overflow-hidden`}
            >
              <div className="bg-[#1A1C24] border-b border-white/5 px-8 py-6 flex items-center justify-between">
                <h3 className={`text-xl font-black flex items-center gap-3 tracking-tight ${systemAction.type === 'DELETE' ? 'text-red-500' : 'text-white'}`}>
                  {systemAction.type === 'RESTORE' && <Unlock className="w-6 h-6 text-emerald-500" />}
                  {systemAction.type === 'DELETE' && <Trash2 className="w-6 h-6 text-red-500" />}
                  {systemAction.type === 'RESTORE' ? 'Restore User' : 'Delete User'}
                </h3>
                <button onClick={() => setSystemAction({type: null, isOpen: false, targetUser: null})} className="text-[#8F95A3] hover:text-white transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleSystemActionSubmit} className="p-8 flex flex-col gap-6">
                
                {sysActionMessage && (
                  <div className={`p-4 rounded-xl text-xs font-bold flex items-center gap-2 ${sysActionMessage.type === 'success' ? 'bg-[#00E57A]/10 text-[#00E57A] border border-[#00E57A]/20' : 'bg-[#FF5D73]/10 text-[#FF5D73] border border-[#FF5D73]/20'}`}>
                    {sysActionMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <XCircle className="w-4 h-4 shrink-0" />} {sysActionMessage.text}
                  </div>
                )}

                <p className="text-sm text-gray-400 leading-relaxed text-center">
                  {systemAction.type === 'RESTORE' && `Restore full access for ${systemAction.targetUser?.userName || systemAction.targetUser?.name}? They will be able to login and withdraw.`}
                  {systemAction.type === 'DELETE' && `WARNING: You are about to permanently delete ${systemAction.targetUser?.userName || systemAction.targetUser?.name}. This action cannot be undone.`}
                </p>

                <button type="submit" disabled={isSubmittingSysAction} className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 transition-all cursor-pointer disabled:opacity-50 ${
                  systemAction.type === 'RESTORE' ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-black' :
                  'bg-gradient-to-r from-red-500 to-red-600 text-white'
                }`}>
                  {isSubmittingSysAction ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirm Action'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: BALANCE ADJUSTER */}
      <AnimatePresence>
        {isAdjustModalOpen && selectedUserForAdjust && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-[#050409]/90 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-[#12141C] border border-white/10 w-full max-w-sm rounded-[32px] shadow-2xl relative flex flex-col overflow-hidden"
            >
              <div className="bg-[#1A1C24] border-b border-white/5 px-8 py-6 flex items-center justify-between">
                <h3 className="text-xl font-black flex items-center gap-3 tracking-tight text-white"><SlidersHorizontal className="w-6 h-6 text-[#A66CFF]" /> Adjust Balance</h3>
                <button onClick={() => setIsAdjustModalOpen(false)} className="text-[#8F95A3] hover:text-white transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleAdjustSubmit} className="p-8 flex flex-col gap-6">
                <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 flex flex-col shadow-inner">
                  <span className="text-[11px] text-[#8F95A3] font-bold uppercase tracking-widest mb-1.5">Target User</span>
                  <span className="text-white font-black text-base tracking-wide">{selectedUserForAdjust?.userName || selectedUserForAdjust?.name || 'N/A'}</span>
                  <span className="text-[#8F95A3] font-mono text-[12px] mt-1 font-medium">ID: {selectedUserForAdjust?.id || selectedUserForAdjust?._id}</span>
                  <div className="mt-3 pt-3 border-t border-white/5 flex justify-between items-center">
                    <span className="text-xs font-bold text-[#8F95A3]">Current Balance:</span>
                    <span className="text-sm font-black text-[#A66CFF]">{formatPrice(Number(selectedUserForAdjust?.availableBalance || 0), currency)}</span>
                  </div>
                </div>
                {adjustMessage && (
                  <div className={`p-4 rounded-xl text-xs font-bold flex items-center gap-2 ${adjustMessage.type === 'success' ? 'bg-[#00E57A]/10 text-[#00E57A] border border-[#00E57A]/20' : 'bg-[#FF5D73]/10 text-[#FF5D73] border border-[#FF5D73]/20'}`}>
                    {adjustMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <XCircle className="w-4 h-4 shrink-0" />} {adjustMessage.text}
                  </div>
                )}
                <div className="flex flex-col gap-2.5">
                  <label className="text-xs font-bold text-[#8F95A3] uppercase tracking-widest">Amount</label>
                  <div className="relative">
                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8F95A3]" />
                    <input type="number" step="any" required min="0.01" placeholder="e.g. 10.00" value={amountInput} onChange={(e) => setAmountInput(e.target.value)} className="w-full bg-[#0B0D14] rounded-2xl pl-12 pr-5 py-4 text-white font-black text-lg focus:outline-none transition-all shadow-inner border border-transparent focus:border-[#A66CFF]/50" />
                  </div>
                </div>
                <div className="flex flex-col gap-2.5">
                  <label className="text-xs font-bold text-[#8F95A3] uppercase tracking-widest">Action</label>
                  <div className="relative">
                    <select value={actionStatus} onChange={(e) => setActionStatus(e.target.value as '1' | '0')} className="w-full bg-[#0B0D14] rounded-2xl px-5 py-4 text-white font-bold text-sm focus:outline-none transition-all shadow-inner border border-transparent focus:border-[#A66CFF]/50 appearance-none cursor-pointer">
                      <option value="1">➕ Add Balance</option>
                      <option value="0">➖ Deduct Balance</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#8F95A3]">▼</div>
                  </div>
                </div>
                <button type="submit" disabled={isSubmittingAdjust} className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 transition-all cursor-pointer disabled:opacity-50 ${actionStatus === '1' ? 'bg-gradient-to-r from-[#A66CFF] to-[#7C3AED] text-white' : 'bg-gradient-to-r from-amber-500 to-amber-600 text-black'}`}>
                  {isSubmittingAdjust ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Confirm Adjustment'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: SEND WARNING */}
      <AnimatePresence>
        {isWarningModalOpen && selectedUserForWarning && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-[#050409]/90 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-[#12141C] border border-white/10 w-full max-w-sm rounded-[32px] shadow-2xl relative flex flex-col overflow-hidden"
            >
              <div className="bg-[#1A1C24] border-b border-white/5 px-8 py-6 flex items-center justify-between">
                <h3 className="text-xl font-black flex items-center gap-3 tracking-tight text-white"><AlertOctagon className="w-6 h-6 text-rose-500" /> Send Warning</h3>
                <button onClick={() => setIsWarningModalOpen(false)} className="text-[#8F95A3] hover:text-white transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10"><X className="w-5 h-5" /></button>
              </div>
              <form onSubmit={handleWarningSubmit} className="p-8 flex flex-col gap-6">
                <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 flex flex-col shadow-inner">
                  <span className="text-[11px] text-[#8F95A3] font-bold uppercase tracking-widest mb-1.5">Target User</span>
                  <span className="text-white font-black text-base tracking-wide">{selectedUserForWarning?.userName || selectedUserForWarning?.name || 'N/A'}</span>
                  <span className="text-[#8F95A3] font-mono text-[12px] mt-1 font-medium">ID: {selectedUserForWarning?.id || selectedUserForWarning?._id}</span>
                </div>
                {warningMessage && (
                  <div className={`p-4 rounded-xl text-xs font-bold flex items-center gap-2 ${warningMessage.type === 'success' ? 'bg-[#00E57A]/10 text-[#00E57A] border border-[#00E57A]/20' : 'bg-[#FF5D73]/10 text-[#FF5D73] border border-[#FF5D73]/20'}`}>
                    {warningMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <XCircle className="w-4 h-4 shrink-0" />} {warningMessage.text}
                  </div>
                )}
                <div className="flex flex-col gap-2.5">
                  <label className="text-xs font-bold text-[#8F95A3] uppercase tracking-widest">Warning Title</label>
                  <input type="text" required placeholder="e.g. Violation of Terms" value={warningTitle} onChange={(e) => setWarningTitle(e.target.value)} className="w-full bg-[#0B0D14] rounded-2xl px-5 py-4 text-white text-sm focus:outline-none transition-all shadow-inner border border-transparent focus:border-rose-500/50" />
                </div>
                <div className="flex flex-col gap-2.5">
                  <label className="text-xs font-bold text-[#8F95A3] uppercase tracking-widest">Reason</label>
                  <textarea required rows={3} placeholder="Explain the reason for this warning..." value={warningReason} onChange={(e) => setWarningReason(e.target.value)} className="w-full bg-[#0B0D14] rounded-2xl px-5 py-4 text-white text-sm focus:outline-none transition-all shadow-inner border border-transparent focus:border-rose-500/50 resize-none custom-scrollbar" />
                </div>
                <button type="submit" disabled={isSubmittingWarning} className="w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 transition-all cursor-pointer disabled:opacity-50 bg-gradient-to-r from-rose-500 to-rose-600 text-white shadow-[0_0_25px_rgba(243,33,101,0.4)]">
                  {isSubmittingWarning ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send Warning'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: LOGIN AS USER (EMULATE) */}
      <AnimatePresence>
        {isLoginModalOpen && selectedUserForLogin && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-[#050409]/90 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-[#12141C] border border-white/10 w-full max-w-sm rounded-[32px] shadow-2xl relative flex flex-col overflow-hidden"
            >
              <div className="bg-[#1A1C24] border-b border-white/5 px-8 py-6 flex items-center justify-between">
                <h3 className="text-xl font-black flex items-center gap-3 tracking-tight text-white"><LogIn className="w-6 h-6 text-blue-400" /> Emulate User</h3>
                <button onClick={() => setIsLoginModalOpen(false)} className="text-[#8F95A3] hover:text-white transition-colors w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10"><X className="w-5 h-5" /></button>
              </div>
              <div className="p-8 flex flex-col gap-6">
                <div className="bg-white/[0.02] border border-white/5 rounded-2xl p-5 flex flex-col items-center text-center shadow-inner gap-2">
                  {resolveImage(selectedUserForLogin?.image) ? (
                    <img src={resolveImage(selectedUserForLogin?.image)!} alt="User" className="w-16 h-16 rounded-full object-cover border-2 border-blue-500/30" />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-blue-500/20 border-2 border-blue-500/40 flex items-center justify-center text-blue-400 font-bold text-2xl">
                      {(selectedUserForLogin?.userName || selectedUserForLogin?.name || 'U').charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <h4 className="text-white font-black text-lg tracking-wide">{selectedUserForLogin?.userName || selectedUserForLogin?.name || 'Unknown User'}</h4>
                    <p className="text-[#8F95A3] text-xs">{selectedUserForLogin?.email || 'No email provided'}</p>
                  </div>
                  <span className="text-blue-400/80 font-mono text-[10px] bg-blue-500/10 px-2 py-1 rounded-md mt-1 border border-blue-500/20">ID: {selectedUserForLogin?.id || selectedUserForLogin?._id}</span>
                </div>
                <p className="text-sm text-gray-400 text-center leading-relaxed">
                  You are about to log in as this user. Their dashboard will open in a new tab.
                </p>
                <div className="flex gap-3 mt-2">
                  <button onClick={() => setIsLoginModalOpen(false)} disabled={isLoggingInUser !== null} className="flex-1 py-3.5 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-sm transition-colors cursor-pointer disabled:opacity-50">Cancel</button>
                  <button onClick={handleLoginAsUser} disabled={isLoggingInUser !== null} className="flex-1 py-3.5 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-black text-sm transition-all flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(59,130,246,0.3)] cursor-pointer disabled:opacity-50">
                    {isLoggingInUser !== null ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Proceed'}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}