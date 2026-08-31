'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Link2, Save, Loader2, Plus, X, UploadCloud, 
  AlertCircle, Image as ImageIcon, ShieldCheck, 
  Activity, Tag, Settings, Percent, User, Edit3, Globe,
  List, PlaySquare, RefreshCcw, Eye, Copy, Check, Info,
  Trash2, CheckCircle2 
} from 'lucide-react';

// --- UTILITY: Get Admin ID ---
function getAdminId(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('adminId') || localStorage.getItem('admin_id') || localStorage.getItem('userId') || '';
}

export default function AdminPostbackPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- UI & TABS STATES ---
  const [activeTab, setActiveTab] = useState<'list' | 'create' | 'update'>('list');
  const [isFetchingDetails, setIsFetchingDetails] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' | 'warning' } | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // --- STANDALONE API STATES ---
  const [standaloneIp, setStandaloneIp] = useState('');
  const [isAddingStandaloneIp, setIsAddingStandaloneIp] = useState(false);

  // --- LIST STATES ---
  const [postbacks, setPostbacks] = useState<any[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [listError, setListError] = useState<string | null>(null);

  // --- VIEW MODAL STATES ---
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [viewingPostback, setViewingPostback] = useState<any>(null);

  // --- FORM STATES ---
  const [formData, setFormData] = useState({
    adminId: '',
    postbackId: '',   
    name: '',
    category: 'Offer',
    event_name: '',   
    reverse: '',
    payout: 'Cash',
    percent: '',
    sucess: '',       
    fail: ''
  });

  const [ipInput, setIpInput] = useState('');
  const [ipList, setIpList] = useState<string[]>([]);
  const [postbackImage, setPostbackImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Set Admin ID on mount
  useEffect(() => {
    setFormData(prev => ({ ...prev, adminId: getAdminId() }));
  }, []);

  // Fetch List when tab is 'list'
  useEffect(() => {
    if (activeTab === 'list') {
      fetchPostbacks();
    }
  }, [activeTab]);

  // ==========================================
  // 1. LIST & DELETE API LOGIC
  // ==========================================
  const fetchPostbacks = async () => {
    setIsLoadingList(true);
    setListError(null);
    const token = typeof window !== 'undefined' ? localStorage.getItem('admin_token') : '';
    const currentAdminId = getAdminId();

    if (!token || !currentAdminId) {
      router.push('/v9/login');
      return;
    }

    try {
      const res = await fetch(`https://api.binnycash.com/api/pts/postbackList?adminId=${currentAdminId}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const json = await res.json().catch(() => null);

      if (res.ok && json?.data?.list) {
        setPostbacks(json.data.list);
      } else {
        setListError(json?.message || "Failed to load postbacks.");
      }
    } catch (err) {
      setListError("Network error while fetching postbacks.");
    } finally {
      setIsLoadingList(false);
    }
  };

  const handleDeleteClick = async (numericId: string | number) => {
    if (!window.confirm("Are you sure you want to delete this postback? This cannot be undone.")) return;
    
    const token = localStorage.getItem('admin_token');
    const adminId = getAdminId();

    try {
      const url = `https://api.binnycash.com/api/pts/deletePostback?adminId=${adminId}&postbackId=${numericId}`;
      const res = await fetch(url, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const json = await res.json().catch(() => null);
      
      if (res.ok || json?.code === 200) {
        setMessage({ text: 'Postback deleted successfully!', type: 'success' });
        fetchPostbacks(); 
      } else {
        setMessage({ text: json?.message || 'Failed to delete postback.', type: 'error' });
      }
    } catch (err) {
      setMessage({ text: 'Network error while deleting postback.', type: 'error' });
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const getFullImageUrl = (path: string) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `https://api.binnycash.com${path}`;
  };

  // ==========================================
  // 2. COMMON FETCH DETAILS LOGIC
  // ==========================================
  const fetchPostbackDetails = async (numericId: string | number) => {
    setIsFetchingDetails(true);
    setMessage(null);
    const token = localStorage.getItem('admin_token');
    const adminId = getAdminId();

    try {
      const url = `https://api.binnycash.com/api/pts/postbackView?adminId=${adminId}&postbackId=${numericId}`;
      const res = await fetch(url, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const json = await res.json();
      
      if (res.ok || json?.code === 200 || json?.type === 'success') {
        const pb = Array.isArray(json?.data) ? json.data[0] : (json?.data || json);
        if (pb && Object.keys(pb).length > 0) {
          return pb;
        } else {
          setMessage({ text: 'No detailed data found for this postback.', type: 'warning' });
          return null;
        }
      } else {
        setMessage({ text: json?.message || 'Failed to load postback details.', type: 'error' });
        return null;
      }
    } catch (err) {
      setMessage({ text: 'Network error while fetching details.', type: 'error' });
      return null;
    } finally {
      setIsFetchingDetails(false);
    }
  };

  // ==========================================
  // 3. EDIT ACTION LOGIC 
  // ==========================================
  const handleEditClick = async (numericId: string | number) => {
    setIpList([]);
    setPreviewImage(null);
    setPostbackImage(null);

    const pb = await fetchPostbackDetails(numericId);
    if (pb) {
      setFormData({
        adminId: getAdminId(),
        postbackId: pb.id?.toString() || numericId.toString(), 
        name: pb.name || '',
        category: pb.category || 'Offer',
        event_name: pb.event_name || '',
        reverse: pb.reverse || '',
        payout: pb.payout || 'Cash',
        percent: pb.percent?.toString() || '',
        sucess: pb.sucess || '',
        fail: pb.fail || ''
      });

      const ips = pb.ip || pb.ipAddress || [];
      if (Array.isArray(ips)) {
        setIpList(ips);
      }

      if (pb.postbackImage) {
        setPreviewImage(getFullImageUrl(pb.postbackImage));
      }

      setActiveTab('update');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // ==========================================
  // 4. VIEW ACTION LOGIC (Opens Popup)
  // ==========================================
  const handleViewClick = async (numericId: string | number) => {
    const pb = await fetchPostbackDetails(numericId);
    if (pb) {
      setViewingPostback(pb);
      setIsViewModalOpen(true);
    }
  };

  const resetForm = () => {
    setFormData({
      adminId: getAdminId(), postbackId: '', name: '', category: 'Offer', event_name: '', reverse: '', payout: 'Cash', percent: '', sucess: '', fail: ''
    });
    setIpList([]);
    clearImage();
    setMessage(null);
  };

  // ==========================================
  // 5. STANDALONE ADD IP API LOGIC
  // ==========================================
  const handleStandaloneAddIp = async () => {
    if (!standaloneIp.trim()) return;
    
    setIsAddingStandaloneIp(true);
    setMessage(null);
    const token = localStorage.getItem('admin_token');
    const adminId = getAdminId();

    try {
      const fd = new FormData();
      fd.append('id', adminId); // Passed Admin ID here exactly as requested
      fd.append('ip', standaloneIp.trim());

      const res = await fetch('https://api.binnycash.com/api/pts/addIpToPostback', {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
        body: fd
      });

      const json = await res.json().catch(() => null);

      if (res.ok || json?.code === 200 || json?.type === 'success') {
        setMessage({ text: 'IP whitelisted successfully via standalone API!', type: 'success' });
        setStandaloneIp('');
      } else {
        setMessage({ text: json?.message || 'Failed to add IP.', type: 'error' });
      }
    } catch (err) {
      setMessage({ text: 'Network error while adding IP.', type: 'error' });
    } finally {
      setIsAddingStandaloneIp(false);
    }
  };

  // ==========================================
  // 6. FORM HANDLERS & SUBMIT
  // ==========================================
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    let value = e.target.value;
    if (e.target.name === 'event_name') {
      value = value.replace(/\s+/g, '_'); 
    }
    setFormData({ ...formData, [e.target.name]: value });
  };

  // Standard Offline IP Array Add (For Create/Update Form only)
  const handleAddIp = () => {
    if (ipInput.trim() !== '' && !ipList.includes(ipInput.trim())) {
      setIpList([...ipList, ipInput.trim()]);
      setIpInput('');
    }
  };

  const handleRemoveIp = (ipToRemove: string) => {
    setIpList(ipList.filter(ip => ip !== ipToRemove));
  };

  const handleIpKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddIp();
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setPostbackImage(file);
      setPreviewImage(URL.createObjectURL(file));
    }
  };

  const clearImage = () => {
    setPostbackImage(null);
    setPreviewImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    if (!formData.adminId) return setMessage({ text: "Admin ID is missing. Please log in again.", type: 'error' });
    if (!formData.name) return setMessage({ text: "Name is required.", type: 'error' });
    if (!formData.percent) return setMessage({ text: "Percent is required.", type: 'error' });
    if (!formData.event_name) return setMessage({ text: "Event Name is required.", type: 'error' });
    
    if (activeTab === 'create' && !postbackImage) {
      return setMessage({ text: "Postback Logo is required for creation.", type: 'error' });
    }
    
    if (activeTab === 'update' && !formData.postbackId) {
      return setMessage({ text: "Postback ID is required for updating.", type: 'error' });
    }

    setIsSubmitting(true);
    const token = localStorage.getItem('admin_token');

    try {
      const cleanEventName = formData.event_name.trim().replace(/\s+/g, '_');

      let url = '';
      if (activeTab === 'create') {
        url = `https://api.binnycash.com/api/pts/createPostabck?event_name=${encodeURIComponent(cleanEventName)}`;
      } else {
        url = `https://api.binnycash.com/api/pts/updatePostback?event_name=${encodeURIComponent(cleanEventName)}&campaign_id=${encodeURIComponent(formData.postbackId)}`;
      }

      const fd = new FormData();
      fd.append('adminId', formData.adminId);
      fd.append('name', formData.name);
      fd.append('category', formData.category);
      fd.append('percent', formData.percent);
      
      if (activeTab === 'update') {
        fd.append('postbackId', formData.postbackId);
      }

      if (formData.reverse && formData.reverse.trim() !== '') fd.append('reverse', formData.reverse.trim());
      if (formData.payout && formData.payout.trim() !== '') fd.append('payout', formData.payout.trim());
      if (formData.sucess && formData.sucess.trim() !== '') fd.append('sucess', formData.sucess.trim()); 
      if (formData.fail && formData.fail.trim() !== '') fd.append('fail', formData.fail.trim());

      if (ipList.length > 0) {
        ipList.forEach(ip => fd.append('ipAddress', ip));
      }

      if (postbackImage) {
        fd.append('postbackImage', postbackImage);
      }

      const res = await fetch(url, {
        method: activeTab === 'create' ? 'POST' : 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
        body: fd
      });

      const json = await res.json().catch(() => null);

      if (res.ok && (json?.code === 200 || json?.type === 'success')) {
        setMessage({ text: `Postback ${activeTab === 'create' ? 'created' : 'updated'} successfully!`, type: 'success' });
        setTimeout(() => {
          resetForm();
          setActiveTab('list');
        }, 1500);
      } else {
        setMessage({ text: json?.message || `Failed to ${activeTab} postback.`, type: 'error' });
      }
    } catch (err) {
      console.error(err);
      setMessage({ text: `Network error occurred while ${activeTab}ing postback.`, type: 'error' });
    } finally {
      setIsSubmitting(false);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const DetailItem = ({ label, value, highlight = false }: { label: string, value: string, highlight?: boolean }) => (
    <div className="flex flex-col gap-1 bg-[#1A1C24] p-3 rounded-xl border border-white/5">
      <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{label}</span>
      <span className={`text-sm font-bold truncate ${highlight ? 'text-emerald-400' : 'text-gray-200'}`}>
        {value || <span className="text-gray-600 italic">Not set</span>}
      </span>
    </div>
  );

  return (
    <div className="flex flex-col gap-6 text-white w-full max-w-[1400px] mx-auto pb-10 font-sans relative">
      
      {/* --- HEADER & TABS --- */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-white/10 pb-5 gap-4">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3 tracking-tight">
             <Link2 className="w-8 h-8 text-[#3B82F6]" /> 
             Postback (S2S) Management
          </h1>
          <p className="text-sm text-[#8F95A3] mt-2">
            Configure, view, or update server-to-server tracking endpoints for your offer networks.
          </p>
        </div>

        <div className="flex flex-wrap items-center p-1 gap-1 bg-[#12141C] rounded-xl border border-white/5 w-full md:w-auto shadow-inner">
          <button 
            onClick={() => setActiveTab('list')}
            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${activeTab === 'list' ? 'bg-[#1A1C24] text-white shadow-md border border-white/10' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
          >
            <List className="w-4 h-4 shrink-0" /> All Postbacks
          </button>
          <button 
            onClick={() => { resetForm(); setActiveTab('create'); }}
            className={`flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all cursor-pointer whitespace-nowrap ${activeTab === 'create' ? 'bg-[#3B82F6] text-white shadow-md shadow-[#3B82F6]/30' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
          >
            <Plus className="w-4 h-4 shrink-0" /> Create New
          </button>
          
          {activeTab === 'update' && (
            <button className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-sm font-bold transition-all bg-amber-500 text-black shadow-md shadow-amber-500/30 whitespace-nowrap cursor-default">
              <Edit3 className="w-4 h-4 shrink-0" /> Update Postback
            </button>
          )}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {message && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            className={`p-5 rounded-2xl flex items-center gap-3 shadow-lg border ${message.type === 'success' ? 'bg-[#00E57A]/10 border-[#00E57A]/30 text-[#00E57A]' : message.type === 'warning' ? 'bg-amber-500/10 border-amber-500/30 text-amber-500' : 'bg-rose-500/10 border-rose-500/30 text-rose-400'}`}
          >
            {message.type === 'success' ? <CheckCircle2 className="w-6 h-6 shrink-0" /> : <AlertCircle className="w-6 h-6 shrink-0" />}
            <span className="font-bold tracking-wide">{message.text}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 🔥 STANDALONE ADD IP BLOCK 🔥 */}
      <div className="bg-[#12141C] border border-white/5 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <div>
          <h3 className="text-white font-bold text-sm flex items-center gap-2">
            <Globe className="w-4 h-4 text-[#00E57A]" /> Quick Add IP (Standalone API)
          </h3>
          <p className="text-[10px] text-gray-500 mt-1">Hits /pts/addIpToPostback passing Admin ID and IP Address.</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <input 
            type="text" 
            value={standaloneIp}
            onChange={(e) => setStandaloneIp(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleStandaloneAddIp(); } }}
            placeholder="Enter IP (e.g. 192.168.1.1)"
            className="flex-1 bg-[#0B0D14] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#00E57A] shadow-inner md:w-[250px]"
          />
          <button 
            onClick={handleStandaloneAddIp}
            disabled={isAddingStandaloneIp || !standaloneIp.trim()}
            className="bg-[#00E57A]/10 text-[#00E57A] hover:bg-[#00E57A]/20 px-5 rounded-xl font-bold text-xs flex items-center gap-2 transition-colors disabled:opacity-50 shrink-0 cursor-pointer"
          >
            {isAddingStandaloneIp ? <Loader2 className="w-4 h-4 animate-spin" /> : "Add IP"}
          </button>
        </div>
      </div>

      <AnimatePresence mode="wait">

        {/* ========================================== */}
        {/* TAB 1: POSTBACK LIST */}
        {/* ========================================== */}
        {activeTab === 'list' && (
          <motion.div key="list" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col gap-6">
            <div className="bg-[#12141C] border border-white/5 rounded-xl overflow-hidden shadow-sm">
              <div className="p-4 border-b border-white/5 flex items-center justify-between bg-[#161821]">
                <h3 className="text-white font-bold text-sm flex items-center gap-2">
                  <PlaySquare className="w-4 h-4 text-[#3B82F6]" /> Active Integrations
                </h3>
                <button onClick={fetchPostbacks} disabled={isLoadingList} className="text-gray-400 hover:text-white transition-colors cursor-pointer">
                  <RefreshCcw className={`w-4 h-4 ${isLoadingList ? 'animate-spin text-[#3B82F6]' : ''}`} />
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse whitespace-nowrap min-w-[1100px]">
                  <thead>
                    <tr className="border-b border-white/10 text-gray-400 text-xs font-bold uppercase tracking-wider bg-[#1A1C24]/50">
                      <th className="py-4 px-5">Network Detail</th>
                      <th className="py-4 px-4 text-center">Category</th>
                      <th className="py-4 px-4 text-center">Status</th>
                      <th className="py-4 px-4 text-center">Payout</th>
                      <th className="py-4 px-4 w-[35%]">Endpoint URL</th>
                      <th className="py-4 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5 text-sm">
                    {isLoadingList ? (
                      <tr><td colSpan={6} className="py-16 text-center text-gray-500 font-medium"><Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#3B82F6]" /> Loading postbacks...</td></tr>
                    ) : listError ? (
                      <tr><td colSpan={6} className="py-16 text-center text-rose-400 font-medium"><AlertCircle className="w-6 h-6 mx-auto mb-2" /> {listError}</td></tr>
                    ) : postbacks.length > 0 ? (
                      postbacks.map((pb: any, idx: number) => (
                        <tr key={pb._id || idx} className="hover:bg-white/[0.02] transition-colors align-middle group">
                          <td className="py-4 px-5">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-xl bg-white border border-white/10 flex items-center justify-center p-1 shrink-0">
                                {pb.postbackImage ? (
                                  <img src={getFullImageUrl(pb.postbackImage)} alt={pb.name} className="w-full h-full object-contain" />
                                ) : (
                                  <ImageIcon className="w-5 h-5 text-gray-400" />
                                )}
                              </div>
                              <div className="flex flex-col">
                                <span className="font-bold text-white text-[15px]">{pb.name || 'Unnamed Network'}</span>
                                <span className="text-[10px] text-gray-500 font-mono mt-0.5">ID: {pb.id}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-center">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-black uppercase tracking-wider ${pb.category === 'Offer' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' : 'bg-blue-500/10 text-blue-400 border-blue-500/20'}`}>
                              <Tag className="w-3 h-3" /> {pb.category || 'N/A'}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-center">
                            <span className={`inline-block text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${pb.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-gray-500/10 text-gray-400 border-gray-500/20'}`}>
                              {pb.status || 'UNKNOWN'}
                            </span>
                          </td>
                          <td className="py-4 px-4 text-center">
                            <div className="flex flex-col items-center justify-center">
                              <span className="font-black text-emerald-400">{pb.percent}%</span>
                              <span className="text-[10px] text-gray-500 uppercase font-bold">{pb.payout}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <div className="flex items-center gap-2 bg-[#0B0D14] border border-white/5 px-3 py-2 rounded-xl">
                              <div className="flex-1 overflow-hidden">
                                <p className="text-gray-400 text-xs font-mono truncate select-all">{pb.postback || 'No URL generated'}</p>
                              </div>
                              {pb.postback && (
                                <button onClick={() => copyToClipboard(pb.postback, pb._id)} className="shrink-0 p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors cursor-pointer">
                                  {copiedId === pb._id ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                                </button>
                              )}
                            </div>
                          </td>
                          <td className="py-4 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button onClick={() => handleViewClick(pb.id)} title="View Details" className="w-8 h-8 rounded-lg bg-[#3B82F6]/10 hover:bg-[#3B82F6]/20 text-[#3B82F6] border border-[#3B82F6]/20 flex items-center justify-center transition-colors cursor-pointer">
                                <Eye className="w-4 h-4" />
                              </button>
                              <button onClick={() => handleEditClick(pb.id)} title="Edit Configuration" className="w-8 h-8 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-500 border border-amber-500/20 flex items-center justify-center transition-colors cursor-pointer">
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button onClick={() => handleDeleteClick(pb.id)} title="Delete Postback" className="w-8 h-8 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/20 flex items-center justify-center transition-colors cursor-pointer">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan={6} className="py-20 text-center text-gray-500"><Link2 className="w-12 h-12 mx-auto mb-3 opacity-20" /><p>No postbacks integrated yet.</p></td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        )}


        {/* ========================================== */}
        {/* TAB 2: CREATE / UPDATE POSTBACK FORM */}
        {/* ========================================== */}
        {(activeTab === 'create' || activeTab === 'update') && (
          <motion.div key="form" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="flex flex-col gap-6">
            
            {isFetchingDetails ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-[#3B82F6]" />
                <span className="text-gray-400 font-bold">Preparing form...</span>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-6">
                
                {/* LEFT COLUMN: MAIN SETTINGS */}
                <div className="flex-1 flex flex-col gap-6">
                  
                  <div className="bg-[#12141C] border border-white/5 rounded-3xl p-6 md:p-8 shadow-xl">
                    <h2 className="text-lg font-black text-white mb-6 flex items-center gap-2 border-b border-white/5 pb-4">
                      <Activity className="w-5 h-5 text-[#3B82F6]" /> Primary Details
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-[#8F95A3] uppercase tracking-widest flex items-center gap-2">
                          Admin ID <span className="text-emerald-500 normal-case text-[10px]">(Auto-Filled)</span>
                        </label>
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                          <input 
                            type="text" value={formData.adminId || ''} disabled 
                            className="w-full bg-[#0B0D14] border border-emerald-500/30 rounded-xl pl-11 px-4 py-3.5 text-sm text-emerald-400 font-bold cursor-not-allowed shadow-inner" 
                          />
                        </div>
                      </div>

                      {activeTab === 'update' && (
                        <div className="flex flex-col gap-2">
                          <label className="text-xs font-bold text-[#8F95A3] uppercase tracking-widest flex items-center gap-2">
                            Postback ID <span className="text-emerald-500 normal-case text-[10px]">(Auto-Filled)</span>
                          </label>
                          <div className="relative">
                            <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500" />
                            <input 
                              type="text" name="postbackId" value={formData.postbackId || ''} disabled 
                              className="w-full bg-[#0B0D14] border border-emerald-500/30 rounded-xl pl-11 px-4 py-3.5 text-sm text-emerald-400 font-bold cursor-not-allowed shadow-inner" 
                            />
                          </div>
                        </div>
                      )}

                      <div className={`flex flex-col gap-2 ${activeTab === 'create' ? 'md:col-span-2' : ''}`}>
                        <label className="text-xs font-bold text-[#8F95A3] uppercase tracking-widest">Network Name <span className="text-rose-500">*</span></label>
                        <input required type="text" name="name" value={formData.name || ''} onChange={handleChange} placeholder="e.g. AdGateMedia" className="w-full bg-[#0B0D14] border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-[#3B82F6] transition-all shadow-inner" />
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-[#8F95A3] uppercase tracking-widest">Category <span className="text-rose-500">*</span></label>
                        <div className="relative">
                          <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                          <select required name="category" value={formData.category || 'Offer'} onChange={handleChange} className="w-full bg-[#0B0D14] border border-white/10 rounded-xl pl-11 pr-4 py-3.5 text-sm text-white focus:outline-none focus:border-[#3B82F6] appearance-none cursor-pointer shadow-inner">
                            <option value="Offer">Offer</option>
                            <option value="Survey">Survey</option>
                          </select>
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500 text-xs">▼</span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-[#8F95A3] uppercase tracking-widest">Event Name (Query) <span className="text-rose-500">*</span></label>
                        <input required type="text" name="event_name" value={formData.event_name || ''} onChange={handleChange} placeholder="e.g. postback_completed" className="w-full bg-[#0B0D14] border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-[#3B82F6] transition-all shadow-inner" />
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#12141C] border border-white/5 rounded-3xl p-6 md:p-8 shadow-xl">
                    <h2 className="text-lg font-black text-white mb-6 flex items-center gap-2 border-b border-white/5 pb-4">
                      <Settings className="w-5 h-5 text-amber-400" /> Variables & Responses
                    </h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-[#8F95A3] uppercase tracking-widest flex items-center gap-1">
                          Payout Type <span className="text-gray-500 normal-case font-medium text-[10px]">(replaces reward_value)</span>
                        </label>
                        <div className="relative">
                          <select name="payout" value={formData.payout || 'Cash'} onChange={handleChange} className="w-full bg-[#0B0D14] border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-[#3B82F6] appearance-none cursor-pointer shadow-inner">
                            <option value="Points">Points</option>
                            <option value="Cash">Cash</option>
                          </select>
                          <span className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500 text-xs">▼</span>
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-[#8F95A3] uppercase tracking-widest">Percent <span className="text-rose-500">*</span></label>
                        <div className="relative">
                          <Percent className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                          <input required type="number" step="any" name="percent" value={formData.percent || ''} onChange={handleChange} placeholder="e.g. 100" className="w-full bg-[#0B0D14] border border-white/10 rounded-xl pl-11 pr-4 py-3.5 text-sm text-white focus:outline-none focus:border-[#3B82F6] transition-all shadow-inner" />
                        </div>
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-[#8F95A3] uppercase tracking-widest flex items-center gap-1">
                          Reverse Variable <span className="text-gray-500 normal-case font-medium text-[10px]">(Optional)</span>
                        </label>
                        <input type="text" name="reverse" value={formData.reverse || ''} onChange={handleChange} placeholder="e.g. chargeback" className="w-full bg-[#0B0D14] border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-[#3B82F6] transition-all shadow-inner" />
                      </div>

                      <div className="flex flex-col gap-2">
                        <label className="text-xs font-bold text-[#8F95A3] uppercase tracking-widest flex items-center gap-1">
                          Success Response <span className="text-gray-500 normal-case font-medium text-[10px]">(Optional)</span>
                        </label>
                        <input type="text" name="sucess" value={formData.sucess || ''} onChange={handleChange} placeholder="e.g. OK" className="w-full bg-[#0B0D14] border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-[#3B82F6] transition-all shadow-inner" />
                      </div>

                      <div className="flex flex-col gap-2 md:col-span-2">
                        <label className="text-xs font-bold text-[#8F95A3] uppercase tracking-widest flex items-center gap-1">
                          Fail Response <span className="text-gray-500 normal-case font-medium text-[10px]">(Optional)</span>
                        </label>
                        <input type="text" name="fail" value={formData.fail || ''} onChange={handleChange} placeholder="e.g. ERROR" className="w-full bg-[#0B0D14] border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-[#3B82F6] transition-all shadow-inner" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* RIGHT COLUMN: IPS & LOGO */}
                <div className="w-full lg:w-[420px] flex flex-col gap-6">
                  
                  <div className="bg-[#12141C] border border-white/5 rounded-3xl p-6 md:p-8 shadow-xl">
                    <h2 className="text-lg font-black text-white mb-6 flex items-center gap-2 border-b border-white/5 pb-4">
                      <Globe className="w-5 h-5 text-[#00E57A]" /> Form IPs
                    </h2>
                    
                    <div className="flex flex-col gap-4">
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          value={ipInput} 
                          onChange={(e) => setIpInput(e.target.value)} 
                          onKeyDown={handleIpKeyDown}
                          placeholder="e.g. 192.168.1.1" 
                          className="flex-1 bg-[#0B0D14] border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white focus:outline-none focus:border-[#00E57A] transition-all shadow-inner" 
                        />
                        <button type="button" onClick={handleAddIp} className="bg-[#00E57A]/10 text-[#00E57A] hover:bg-[#00E57A]/20 px-5 rounded-xl transition-colors font-bold flex items-center justify-center shrink-0 cursor-pointer">
                          Add IP
                        </button>
                      </div>

                      {ipList.length > 0 ? (
                        <div className="flex flex-wrap gap-2 bg-[#0B0D14] p-4 rounded-xl border border-white/5 shadow-inner">
                          {ipList.map((ip, idx) => (
                            <span key={idx} className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg text-xs font-mono text-gray-300 flex items-center gap-2 shadow-sm">
                              {ip}
                              <X onClick={() => handleRemoveIp(ip)} className="w-3.5 h-3.5 text-gray-500 hover:text-rose-500 cursor-pointer transition-colors" />
                            </span>
                          ))}
                        </div>
                      ) : (
                        <div className="bg-[#0B0D14] p-4 rounded-xl border border-white/5 text-center text-xs text-gray-500 italic shadow-inner">
                          No IP addresses added to this form yet.
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="bg-[#12141C] border border-white/5 rounded-3xl p-6 md:p-8 shadow-xl flex-1 flex flex-col">
                    <h2 className="text-lg font-black text-white mb-6 flex items-center gap-2 border-b border-white/5 pb-4">
                      <ImageIcon className="w-5 h-5 text-purple-400" /> Network Logo 
                      {activeTab === 'create' && <span className="text-rose-500 ml-auto text-xs font-bold">* Required</span>}
                    </h2>
                    
                    <div className="flex flex-col items-center justify-center gap-4 h-full min-h-[220px]">
                      {previewImage ? (
                        <div className="relative w-full h-48 bg-[#0B0D14] border border-white/10 rounded-2xl flex items-center justify-center overflow-hidden group shadow-inner">
                          <img src={previewImage} alt="Preview" className="w-full h-full object-contain p-4" />
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <button type="button" onClick={clearImage} className="bg-rose-500 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-lg hover:bg-rose-600 cursor-pointer flex items-center gap-2">
                              <Trash2 className="w-4 h-4"/> Remove Image
                            </button>
                          </div>
                        </div>
                      ) : (
                        <label className="w-full h-48 border-2 border-dashed border-white/10 rounded-2xl flex flex-col items-center justify-center gap-3 hover:border-[#3B82F6]/50 hover:bg-[#3B82F6]/5 transition-all cursor-pointer shadow-inner">
                          <UploadCloud className="w-10 h-10 text-gray-500" />
                          <span className="text-sm text-gray-400 font-bold">Click or drag to upload logo</span>
                          <span className="text-[10px] text-gray-500">Supports PNG, JPG, WEBP</span>
                          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                        </label>
                      )}
                    </div>

                    {/* SUBMIT BUTTON */}
                    <div className="mt-8 pt-6 border-t border-white/5">
                      <button 
                        type="submit"
                        disabled={isSubmitting}
                        className={`w-full py-4 rounded-[16px] font-black text-sm uppercase tracking-widest transition-all flex items-center justify-center gap-3 disabled:opacity-50 cursor-pointer text-white
                          ${activeTab === 'create' 
                            ? 'bg-gradient-to-r from-[#3B82F6] to-[#2563EB] shadow-[0_0_25px_rgba(59,130,246,0.3)] hover:shadow-[0_0_35px_rgba(59,130,246,0.5)]' 
                            : 'bg-gradient-to-r from-amber-500 to-amber-600 shadow-[0_0_25px_rgba(245,158,11,0.3)] hover:shadow-[0_0_35px_rgba(245,158,11,0.5)] text-black'
                          }`}
                      >
                        {isSubmitting ? (
                          <><Loader2 className={`w-5 h-5 animate-spin ${activeTab === 'update' ? 'text-black' : 'text-white'}`} /> Processing...</>
                        ) : (
                          <><Save className={`w-5 h-5 ${activeTab === 'update' ? 'text-black' : 'text-white'}`} /> {activeTab === 'create' ? 'Save Postback' : 'Update Postback'}</>
                        )}
                      </button>
                    </div>
                  </div>
                  
                </div>
              </form>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========================================== */}
      {/* VIEW DETAILS MODAL POPUP */}
      {/* ========================================== */}
      <AnimatePresence>
        {isViewModalOpen && viewingPostback && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }} className="bg-[#12141C] border border-white/10 w-full max-w-3xl rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
              
              <div className="p-5 border-b border-white/5 bg-[#161821] flex justify-between items-center shrink-0">
                <h2 className="text-lg font-black text-white flex items-center gap-2">
                  <Info className="w-5 h-5 text-[#3B82F6]" /> Postback Integration Details
                </h2>
                <button onClick={() => setIsViewModalOpen(false)} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white flex items-center justify-center transition-colors cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {isFetchingDetails ? (
                <div className="py-24 flex flex-col items-center justify-center gap-4">
                  <Loader2 className="w-10 h-10 animate-spin text-[#3B82F6]" />
                  <span className="text-gray-400 font-bold">Fetching details...</span>
                </div>
              ) : (
                <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-6">
                  
                  {/* Top Profile Section */}
                  <div className="flex items-center gap-5 bg-[#0B0D14] p-5 rounded-2xl border border-white/5">
                    <div className="w-16 h-16 rounded-xl bg-white border border-white/10 flex items-center justify-center p-2 shrink-0">
                      {viewingPostback.postbackImage ? (
                        <img src={getFullImageUrl(viewingPostback.postbackImage)} alt="Logo" className="w-full h-full object-contain" />
                      ) : (
                        <ImageIcon className="w-8 h-8 text-gray-400" />
                      )}
                    </div>
                    <div className="flex flex-col flex-1">
                      <h3 className="text-2xl font-black text-white">{viewingPostback.name || 'Unnamed Network'}</h3>
                      <div className="flex items-center gap-3 mt-1.5">
                        <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded border ${viewingPostback.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-gray-500/10 text-gray-400 border-gray-500/20'}`}>
                          {viewingPostback.status || 'UNKNOWN'}
                        </span>
                        <span className="text-xs text-gray-500 font-mono">Postback ID: {viewingPostback.id}</span>
                      </div>
                    </div>
                  </div>

                  {/* Variables Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <DetailItem label="Category" value={viewingPostback.category} />
                    <DetailItem label="Payout Type" value={viewingPostback.payout} />
                    <DetailItem label="Percent" value={viewingPostback.percent ? `${viewingPostback.percent}%` : ''} highlight />
                    <DetailItem label="Event Name" value={viewingPostback.event_name} />
                    
                    {viewingPostback.reverse && <DetailItem label="Reverse Variable" value={viewingPostback.reverse} />}
                    {viewingPostback.sucess && <DetailItem label="Success Response" value={viewingPostback.sucess} />}
                    {viewingPostback.fail && <DetailItem label="Fail Response" value={viewingPostback.fail} />}
                  </div>

                  {/* IPs */}
                  <div className="flex flex-col gap-2 bg-[#0B0D14] p-5 rounded-2xl border border-white/5">
                     <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-1.5">
                       <Globe className="w-3.5 h-3.5" /> Whitelisted IP Addresses
                     </span>
                     {viewingPostback.ip && viewingPostback.ip.length > 0 ? (
                        <div className="flex flex-wrap gap-2 mt-1">
                          {viewingPostback.ip.map((ip: string, idx: number) => (
                            <span key={idx} className="bg-[#1A1C24] border border-white/5 px-3 py-1.5 rounded-lg text-xs font-mono text-gray-300">
                              {ip}
                            </span>
                          ))}
                        </div>
                     ) : (
                        <span className="text-sm text-gray-600 italic">No IP addresses whitelisted.</span>
                     )}
                  </div>

                  {/* Endpoint URL */}
                  <div className="flex flex-col gap-2 bg-[#0B0D14] p-5 rounded-2xl border border-[#3B82F6]/20">
                     <span className="text-[10px] font-bold text-[#3B82F6] uppercase tracking-widest flex items-center gap-1.5">
                       <Link2 className="w-3.5 h-3.5" /> Webhook / Endpoint URL
                     </span>
                     <div className="flex items-center gap-3 mt-1 bg-[#1A1C24] border border-white/5 px-4 py-3 rounded-xl">
                       <p className="text-gray-300 text-xs font-mono flex-1 break-all select-all">
                         {viewingPostback.postback || 'No URL generated'}
                       </p>
                       {viewingPostback.postback && (
                          <button onClick={() => copyToClipboard(viewingPostback.postback, 'modal')} className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors cursor-pointer text-xs font-bold">
                            {copiedId === 'modal' ? <><Check className="w-3.5 h-3.5 text-emerald-400" /> Copied</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
                          </button>
                       )}
                     </div>
                  </div>

                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}