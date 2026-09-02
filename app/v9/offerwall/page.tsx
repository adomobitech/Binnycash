'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Layers, Link as LinkIcon, Star, Tag, Globe, 
  RefreshCcw, Type, Image as ImageIcon, CheckCircle2, 
  XCircle, Loader2, Monitor, Smartphone, Apple, Activity,
  List, PlusCircle, Eye, Trash2, Search, X, ShieldAlert, AlertCircle, Edit3
} from 'lucide-react';

// 🔥 STANDALONE INPUT FIELD 🔥
const InputField = ({ label, icon: Icon, name, required, placeholder, type = "text", value, onChange }: any) => (
  <div className="flex flex-col gap-2">
    <label className="text-xs font-bold text-[#8F95A3] uppercase tracking-widest flex items-center gap-2">
      {label} {required && <span className="text-rose-500">*</span>}
    </label>
    <div className="relative group">
      <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8F95A3] group-focus-within:text-[#A66CFF] transition-colors" />
      <input 
        type={type} 
        name={name} 
        required={required} 
        value={value} 
        onChange={onChange} 
        placeholder={placeholder}
        className="w-full bg-[#0B0D14] border border-white/10 rounded-xl pl-11 pr-4 py-3.5 text-sm text-white font-medium focus:outline-none focus:border-[#A66CFF] transition-all shadow-inner"
      />
    </div>
  </div>
);

export default function OfferwallManagementPage() {
  // --- GLOBAL STATES ---
  const [activeTab, setActiveTab] = useState<'list' | 'create' | 'edit'>('list');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  
  // --- LIST STATES ---
  const [offerwalls, setOfferwalls] = useState<any[]>([]);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // --- VIEW DETAILS MODAL STATES ---
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isViewingLoading, setIsViewingLoading] = useState(false);
  const [viewData, setViewData] = useState<any>(null);

  // --- DELETE STATE ---
  const [isDeletingId, setIsDeletingId] = useState<string | null>(null);

  // --- CREATE / EDIT FORM STATES ---
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '', rating: '', category: '', excludeCountryCode: '',
    offerwallUrl: '', postbackName: '', type: '',
    status: '', web: '', android: '', ios: ''
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [existingImageUrl, setExistingImageUrl] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);
  
  const [postbackOptions, setPostbackOptions] = useState<any[]>([]);
  const [isFetchingPostbacks, setIsFetchingPostbacks] = useState(true);

  // --- 1. FETCH OFFERWALL LIST ---
  const fetchOfferwallsList = async () => {
    setIsLoadingList(true);
    setErrorMsg(null);
    const token = localStorage.getItem('admin_token');

    let pageNum = 1;
    let hasMore = true;
    let accumulatedList: any[] = [];

    try {
      while (hasMore && pageNum <= 100) { 
        const res = await fetch(`https://api.binnycash.com/api/admin/offerwallList?page=${pageNum}`, {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
        });
        const json = await res.json();
        
        if (res.ok && json?.code === 200) {
          const list = Array.isArray(json.data) ? json.data : (Array.isArray(json.data?.list) ? json.data.list : []);
          if (list && list.length > 0) {
            accumulatedList = [...accumulatedList, ...list];
            pageNum++;
            if (json.data?.totalPages && pageNum > json.data.totalPages) hasMore = false;
            else if (list.length === 0) hasMore = false;
          } else {
            hasMore = false;
          }
        } else {
          hasMore = false;
          if (accumulatedList.length === 0) setErrorMsg(json?.message || "Failed to load offerwalls.");
        }
      }
      setOfferwalls(accumulatedList);
    } catch (error) {
      setErrorMsg("Network error while fetching offerwalls.");
      setOfferwalls([]);
    } finally {
      setIsLoadingList(false);
    }
  };

  // --- 2. FETCH POSTBACKS FOR FORM ---
  const fetchPostbacks = async () => {
    const token = localStorage.getItem('admin_token');
    try {
      const res = await fetch(`https://api.binnycash.com/api/admin/offerwall-postback-list`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
      });
      const json = await res.json();
      if (res.ok && json?.code === 200) {
        setPostbackOptions(Array.isArray(json.data) ? json.data : []);
      }
    } catch (error) {
      console.error("Failed to load postbacks:", error);
    } finally {
      setIsFetchingPostbacks(false);
    }
  };

  useEffect(() => {
    fetchOfferwallsList();
    fetchPostbacks();
  }, []);

  // --- 3. VIEW DETAILS API ---
  const handleViewDetails = async (id: string) => {
    setIsViewModalOpen(true);
    setIsViewingLoading(true);
    setViewData(null);
    const token = localStorage.getItem('admin_token');

    try {
      const res = await fetch(`https://api.binnycash.com/api/admin/view-offerwall-details?id=${id}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
      });
      const json = await res.json();
      if (res.ok && json?.code === 200) {
        setViewData(json.data);
      } else {
        setViewData({ error: json?.message || "Failed to fetch details." });
      }
    } catch (error) {
      setViewData({ error: "Network error while fetching details." });
    } finally {
      setIsViewingLoading(false);
    }
  };

  // --- 4. DELETE OFFERWALL API ---
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this Offerwall?")) return;
    setIsDeletingId(id);
    const token = localStorage.getItem('admin_token');

    try {
      const res = await fetch(`https://api.binnycash.com/api/admin/deleteOfferwall?id=${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
      });
      const json = await res.json();
      if (res.ok && json?.code === 200) {
        fetchOfferwallsList();
      } else {
        alert(json?.message || "Failed to delete offerwall.");
      }
    } catch (error) {
      alert("Network error while deleting offerwall.");
    } finally {
      setIsDeletingId(null);
    }
  };

  // --- 5. EDIT OFFERWALL (POPULATE FORM) ---
  const handleEditClick = async (id: string) => {
    setActiveTab('edit');
    setEditingId(id);
    setSubmitMessage(null);
    setImageFile(null);
    setExistingImageUrl(null);
    
    // Set temp loading state
    setFormData({ title: 'Loading...', rating: '', category: '', excludeCountryCode: '', offerwallUrl: '', postbackName: '', type: '', status: '', web: '', android: '', ios: '' });

    const token = localStorage.getItem('admin_token');
    try {
      const res = await fetch(`https://api.binnycash.com/api/admin/view-offerwall-details?id=${id}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}`, 'Accept': 'application/json' }
      });
      const json = await res.json();
      if (res.ok && json?.code === 200 && json.data) {
        const d = json.data;
        setFormData({
          title: d.title || '',
          rating: d.rating ? String(d.rating) : '',
          category: Array.isArray(d.category) ? d.category.join(',') : (d.category || ''),
          excludeCountryCode: Array.isArray(d.excludeCountryCode) ? d.excludeCountryCode.join(',') : (d.excludeCountryCode || ''),
          offerwallUrl: d.offerwallUrl || '',
          postbackName: d.postbackName || '',
          type: d.type || '',
          status: d.status !== undefined ? String(d.status) : '',
          web: d.platforms?.web !== undefined ? String(d.platforms.web) : (d.web !== undefined ? String(d.web) : ''),
          android: d.platforms?.android !== undefined ? String(d.platforms.android) : (d.android !== undefined ? String(d.android) : ''),
          ios: d.platforms?.ios !== undefined ? String(d.platforms.ios) : (d.ios !== undefined ? String(d.ios) : '')
        });
        if (d.image) setExistingImageUrl(d.image);
      } else {
        setSubmitMessage({ text: "Failed to load offerwall data for editing.", type: 'error' });
        setActiveTab('list');
      }
    } catch (error) {
      setSubmitMessage({ text: "Network error while loading data.", type: 'error' });
      setActiveTab('list');
    }
  };

  // --- 6. CREATE / UPDATE OFFERWALL HANDLERS ---
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setImageFile(e.target.files[0]);
    }
  };

  const resetForm = () => {
    setFormData({ title: '', rating: '', category: '', excludeCountryCode: '', offerwallUrl: '', postbackName: '', type: '', status: '', web: '', android: '', ios: '' });
    setImageFile(null);
    setExistingImageUrl(null);
    setEditingId(null);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.offerwallUrl) {
      setSubmitMessage({ text: "Title and Offerwall URL are required fields.", type: 'error' });
      return;
    }
    
    // Image is required for CREATE, but optional for EDIT
    if (activeTab === 'create' && !imageFile) {
      setSubmitMessage({ text: "Offerwall Cover Image is required.", type: 'error' });
      return;
    }

    if (!formData.status || !formData.web || !formData.android || !formData.ios) {
      setSubmitMessage({ text: "Please select the status for all platforms.", type: 'error' });
      return;
    }

    setIsSubmitting(true);
    setSubmitMessage(null);
    const token = localStorage.getItem('admin_token');

    try {
      const fd = new FormData();
      
      // Append PUT specific field
      if (activeTab === 'edit' && editingId) {
        fd.append('id', editingId);
      }

      Object.entries(formData).forEach(([key, value]) => {
        if (value !== '') fd.append(key, value);
      });
      
      // Only append image if a new one is selected
      if (imageFile) fd.append('image', imageFile);

      const url = activeTab === 'edit' 
        ? `https://api.binnycash.com/api/admin/updateOfferwall` 
        : `https://api.binnycash.com/api/admin/createOfferwall`;
      
      const method = activeTab === 'edit' ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method: method,
        headers: { 'Authorization': `Bearer ${token}` },
        body: fd
      });

      const json = await res.json();
      if (res.ok || json?.code === 200 || json?.code === 201 || json?.type === 'success') {
        setSubmitMessage({ text: json.message || `Offerwall ${activeTab === 'edit' ? 'updated' : 'created'} successfully!`, type: 'success' });
        
        setTimeout(() => {
          setSubmitMessage(null);
          resetForm();
          setActiveTab('list');
          fetchOfferwallsList();
        }, 1500);

      } else {
        setSubmitMessage({ text: json.message || `Failed to ${activeTab} offerwall.`, type: 'error' });
      }
    } catch (error) {
      setSubmitMessage({ text: `Network error while processing request.`, type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const resolveImage = (imgSrc: string) => {
    if (!imgSrc || imgSrc.trim() === '') return null;
    return !imgSrc.startsWith('http') ? `https://api.binnycash.com${imgSrc}` : imgSrc;
  };

  const BooleanSelect = ({ label, icon: Icon, name, color }: any) => {
    const value = formData[name as keyof typeof formData];
    let selectStyle = 'border-white/10 text-[#8F95A3] bg-[#0B0D14]';
    if (value === 'true') selectStyle = 'text-emerald-400 border-emerald-400/30 bg-emerald-400/5';
    if (value === 'false') selectStyle = 'text-rose-400 border-rose-400/30 bg-rose-400/5';

    return (
      <div className="flex flex-col gap-2">
        <label className="text-[11px] font-bold text-[#8F95A3] uppercase tracking-widest flex items-center gap-1.5">
          <Icon className={`w-3.5 h-3.5 ${color}`} /> {label} <span className="text-rose-500">*</span>
        </label>
        <div className="relative group">
          <select 
            name={name} required value={value} onChange={handleInputChange}
            className={`w-full border rounded-xl px-4 py-3 text-sm font-bold focus:outline-none transition-all appearance-none cursor-pointer shadow-inner ${selectStyle}`}
          >
            <option value="" disabled className="bg-[#12141C] text-[#8F95A3]">-- Select Status --</option>
            <option value="true" className="bg-[#12141C] text-emerald-400">Enabled</option>
            <option value="false" className="bg-[#12141C] text-rose-400">Disabled</option>
          </select>
          <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#8F95A3] text-[10px]">▼</div>
        </div>
      </div>
    );
  };

  const filteredList = offerwalls.filter(o => {
    const q = searchQuery.toLowerCase();
    const title = String(o?.title || '').toLowerCase();
    return title.includes(q);
  });

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="flex flex-col gap-6 text-[#F5F3FF] w-full max-w-[1400px] mx-auto pb-10 font-sans relative"
    >
      
      {/* HEADER */}
      <div className="flex justify-between items-end border-b border-white/10 pb-5">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3 tracking-tight">
             <Layers className="w-8 h-8 text-[#A66CFF]" /> 
             Offerwall Management
          </h1>
          <p className="text-sm text-[#8F95A3] mt-2">
            View active partners, configure platforms, and deploy new offerwalls.
          </p>
        </div>
      </div>

      {/* TABS */}
      <div className="flex items-center gap-2 p-1.5 bg-[#12141C] rounded-2xl border border-white/5 w-fit shadow-lg">
        <button 
          onClick={() => { resetForm(); setActiveTab('list'); }}
          className={`relative px-6 py-3 rounded-xl text-sm font-bold transition-all cursor-pointer flex items-center gap-2.5 ${activeTab === 'list' ? 'text-white' : 'text-[#8F95A3] hover:text-white hover:bg-white/5'}`}
        >
          {activeTab === 'list' && <motion.div layoutId="owTab" className="absolute inset-0 bg-[#1E212B] border border-white/10 rounded-xl shadow-md z-0" />}
          <List className="w-4 h-4 relative z-10"/> <span className="relative z-10">Offerwalls List</span>
        </button>
        <button 
          onClick={() => { resetForm(); setActiveTab('create'); }}
          className={`relative px-6 py-3 rounded-xl text-sm font-bold transition-all cursor-pointer flex items-center gap-2.5 ${activeTab === 'create' ? 'text-white' : 'text-[#8F95A3] hover:text-white hover:bg-white/5'}`}
        >
          {activeTab === 'create' && <motion.div layoutId="owTab" className="absolute inset-0 bg-[#1E212B] border border-white/10 rounded-xl shadow-md z-0" />}
          <PlusCircle className="w-4 h-4 relative z-10"/> <span className="relative z-10">Deploy New</span>
        </button>
        {activeTab === 'edit' && (
          <button className="relative px-6 py-3 rounded-xl text-sm font-bold transition-all flex items-center gap-2.5 text-amber-400 bg-amber-400/10 border border-amber-400/20 cursor-default">
            <Edit3 className="w-4 h-4"/> <span>Update Offerwall</span>
          </button>
        )}
      </div>

      {/* --- TAB 1: LIST VIEW --- */}
      {activeTab === 'list' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col gap-6">
          
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-[#12141C] p-5 rounded-2xl border border-white/5 shadow-lg">
            <div className="relative w-full max-w-md group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8F95A3] group-focus-within:text-[#A66CFF] transition-colors" />
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search offerwalls by title..." 
                className="w-full bg-[#0B0D14] border border-white/10 rounded-xl pl-11 pr-4 py-3 text-sm text-white font-medium focus:outline-none focus:border-[#A66CFF] transition-all shadow-inner"
              />
            </div>
            <button onClick={fetchOfferwallsList} disabled={isLoadingList} className="flex items-center gap-2 bg-[#1A1C24] hover:bg-white/10 border border-white/10 text-white px-5 py-3 rounded-xl text-sm font-bold transition-all shadow-sm disabled:opacity-50 cursor-pointer">
              <RefreshCcw className={`w-4 h-4 ${isLoadingList ? 'animate-spin' : ''}`} /> Refresh List
            </button>
          </div>

          <div className="bg-[#12141C] border border-white/5 rounded-3xl overflow-hidden shadow-2xl min-h-[400px]">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse whitespace-nowrap min-w-[800px]">
                <thead>
                  <tr className="bg-[#0B0D14] border-b border-white/[0.05]">
                    <th className="py-5 px-6 text-[11px] font-black text-[#8F95A3] uppercase tracking-widest text-left">Offerwall / Info</th>
                    <th className="py-5 px-6 text-[11px] font-black text-[#8F95A3] uppercase tracking-widest text-left">Type & Category</th>
                    <th className="py-5 px-6 text-[11px] font-black text-[#8F95A3] uppercase tracking-widest text-center">Status (Global)</th>
                    <th className="py-5 px-6 text-[11px] font-black text-[#8F95A3] uppercase tracking-widest text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.05] text-sm">
                  {isLoadingList && offerwalls.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="py-24 text-center">
                        <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#A66CFF]" />
                        <p className="text-[#8F95A3] mt-3 font-bold text-xs uppercase tracking-widest">Loading Records...</p>
                      </td>
                    </tr>
                  ) : filteredList.length > 0 ? (
                    <AnimatePresence>
                      {filteredList.map((ow: any, idx: number) => {
                        const img = resolveImage(ow?.image);
                        const isEnabled = String(ow?.status) === 'true';

                        return (
                          <motion.tr 
                            key={ow?._id || idx} 
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="hover:bg-white/[0.02] transition-colors group"
                          >
                            <td className="py-5 px-6">
                              <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-xl bg-[#0B0D14] border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                                  {img ? <img src={img} alt="logo" className="w-full h-full object-cover" /> : <ImageIcon className="w-5 h-5 text-gray-500" />}
                                </div>
                                <div className="flex flex-col gap-1">
                                  <span className="text-white font-black text-base">{ow?.title || 'Unnamed'}</span>
                                  <span className="text-[11px] text-[#8F95A3] font-mono flex items-center gap-1">
                                    <Star className="w-3 h-3 text-amber-400" /> {ow?.rating || '0'} Rating
                                  </span>
                                </div>
                              </div>
                            </td>

                            <td className="py-5 px-6">
                              <div className="flex flex-col gap-1.5 items-start">
                                <span className="bg-[#A66CFF]/10 text-[#A66CFF] border border-[#A66CFF]/20 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider">
                                  {ow?.type || 'UNKNOWN'}
                                </span>
                                <span className="text-xs text-[#8F95A3] truncate max-w-[200px]">
                                  {Array.isArray(ow?.category) ? ow.category.join(', ') : (ow?.category || 'No category')}
                                </span>
                              </div>
                            </td>

                            <td className="py-5 px-6 text-center">
                              <span className={`inline-flex items-center justify-center text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-lg border ${isEnabled ? 'border-emerald-500/40 text-emerald-500 bg-emerald-500/10' : 'border-rose-500/40 text-rose-500 bg-rose-500/10'}`}>
                                {isEnabled ? 'ENABLED' : 'DISABLED'}
                              </span>
                            </td>

                            <td className="py-5 px-6 text-right">
                              <div className="flex items-center justify-end gap-2.5">
                                <button 
                                  onClick={() => handleViewDetails(ow?._id)}
                                  className="w-9 h-9 rounded-xl border border-[#5EA8FF]/30 text-[#5EA8FF] flex items-center justify-center hover:bg-[#5EA8FF]/10 transition-colors cursor-pointer"
                                  title="View Full Details"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                {/* 🔥 NEW: EDIT BUTTON 🔥 */}
                                <button 
                                  onClick={() => handleEditClick(ow?._id)}
                                  className="w-9 h-9 rounded-xl border border-amber-400/30 text-amber-400 flex items-center justify-center hover:bg-amber-400/10 transition-colors cursor-pointer"
                                  title="Edit Offerwall"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>
                                <button 
                                  onClick={() => handleDelete(ow?._id)}
                                  disabled={isDeletingId === ow?._id}
                                  className="w-9 h-9 rounded-xl border border-[#FF5D73]/30 text-[#FF5D73] flex items-center justify-center hover:bg-[#FF5D73]/10 transition-colors cursor-pointer disabled:opacity-50"
                                  title="Delete Offerwall"
                                >
                                  {isDeletingId === ow?._id ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                </button>
                              </div>
                            </td>
                          </motion.tr>
                        );
                      })}
                    </AnimatePresence>
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-24 text-center">
                        <Layers className="w-16 h-16 mx-auto text-[#8F95A3] mb-5 opacity-20" />
                        <p className="font-bold text-[#8F95A3] tracking-wide">No offerwalls found.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
            
            {isLoadingList && offerwalls.length > 0 && (
               <div className="text-center py-4 bg-[#0B0D14] border-t border-white/5">
                 <span className="text-xs text-[#A66CFF] animate-pulse flex items-center justify-center gap-2 font-bold uppercase tracking-widest"><Loader2 className="w-4 h-4 animate-spin" /> Fetching more records...</span>
               </div>
            )}
          </div>
        </motion.div>
      )}

      {/* --- TAB 2 & 3: CREATE / EDIT FORM --- */}
      {(activeTab === 'create' || activeTab === 'edit') && (
        <motion.form initial={{ opacity: 0 }} animate={{ opacity: 1 }} onSubmit={handleFormSubmit} className="flex flex-col gap-8">
          
          <AnimatePresence>
            {submitMessage && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                className={`p-5 rounded-2xl flex items-center gap-3 overflow-hidden shadow-lg border ${submitMessage.type === 'success' ? 'bg-[#00E57A]/10 border-[#00E57A]/30 text-[#00E57A]' : 'bg-rose-500/10 border-rose-500/30 text-rose-400'}`}
              >
                {submitMessage.type === 'success' ? <CheckCircle2 className="w-6 h-6 shrink-0" /> : <AlertCircle className="w-6 h-6 shrink-0" />}
                <span className="font-bold tracking-wide">{submitMessage.text}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="bg-[#12141C] border border-white/5 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
            <h2 className="text-lg font-black text-white mb-6 flex items-center gap-2">
              <span className="w-1 h-5 bg-[#A66CFF] rounded-full"></span> General Configuration
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
              
              <InputField label="Offerwall Title" name="title" icon={Type} required={true} placeholder="e.g. AdGate Media" value={formData.title} onChange={handleInputChange} />
              <InputField label="Offerwall URL" name="offerwallUrl" icon={LinkIcon} required={true} placeholder="https://..." value={formData.offerwallUrl} onChange={handleInputChange} />
              <InputField label="Rating (Number)" name="rating" icon={Star} type="number" placeholder="e.g. 5" value={formData.rating} onChange={handleInputChange} />
              <InputField label="Offerwall Type" name="type" icon={Layers} placeholder="e.g. Offerwall, Surveywall" value={formData.type} onChange={handleInputChange} />
              <InputField label="Category" name="category" icon={Tag} placeholder="Comma separated (e.g. games, quizzes)" value={formData.category} onChange={handleInputChange} />
              <InputField label="Exclude Country Codes" name="excludeCountryCode" icon={Globe} placeholder="e.g. IN, US, UK" value={formData.excludeCountryCode} onChange={handleInputChange} />

              <div className="md:col-span-2 flex flex-col gap-2">
                <label className="text-xs font-bold text-[#8F95A3] uppercase tracking-widest flex items-center gap-2">
                  Postback Name / Identifier
                </label>
                <div className="relative group">
                  <RefreshCcw className={`absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${isFetchingPostbacks ? 'text-[#A66CFF] animate-spin' : 'text-[#8F95A3] group-focus-within:text-[#A66CFF]'}`} />
                  <select 
                    name="postbackName" value={formData.postbackName} onChange={handleInputChange}
                    className="w-full bg-[#0B0D14] border border-white/10 rounded-xl pl-11 pr-10 py-3.5 text-sm text-white font-medium focus:outline-none focus:border-[#A66CFF] transition-all shadow-inner appearance-none cursor-pointer"
                  >
                    <option value="" disabled className="text-[#8F95A3]">
                      {isFetchingPostbacks ? "Fetching postbacks..." : "-- Select Postback Name --"}
                    </option>
                    {!isFetchingPostbacks && postbackOptions.map((pb: any, idx: number) => (
                      <option key={pb._id || idx} value={pb.name} className="bg-[#12141C]">{pb.name}</option>
                    ))}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#8F95A3] text-[10px]">▼</div>
                </div>
              </div>

              <div className="md:col-span-2 flex flex-col gap-2 mt-2">
                <label className="text-xs font-bold text-[#8F95A3] uppercase tracking-widest flex items-center justify-between">
                  <span>Offerwall Cover Image {activeTab === 'create' && <span className="text-rose-500">*</span>}</span>
                  {activeTab === 'edit' && <span className="text-[10px] text-[#A66CFF] font-medium lowercase normal-case">(Leave blank to keep current image)</span>}
                </label>
                
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  {/* Current image preview if in edit mode */}
                  {activeTab === 'edit' && existingImageUrl && !imageFile && (
                    <div className="w-24 h-24 rounded-2xl bg-[#0B0D14] border border-white/10 flex items-center justify-center overflow-hidden shrink-0">
                      <img src={resolveImage(existingImageUrl)!} alt="Current" className="w-full h-full object-cover" />
                    </div>
                  )}

                  <label className={`flex-1 w-full flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${imageFile ? 'border-[#A66CFF] bg-[#A66CFF]/5' : 'border-white/10 bg-[#0B0D14] hover:border-[#A66CFF]/50 hover:bg-[#0B0D14]/80'}`}>
                    <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                    {imageFile ? (
                      <div className="flex flex-col items-center text-[#A66CFF]">
                        <CheckCircle2 className="w-8 h-8 mb-2" />
                        <span className="font-bold text-sm">{imageFile.name}</span>
                        <span className="text-xs text-white/50 mt-1 font-mono">{(imageFile.size / 1024).toFixed(2)} KB</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center text-[#8F95A3]">
                        <ImageIcon className="w-8 h-8 mb-3 opacity-50" />
                        <span className="font-bold text-sm text-white">Click to upload new image</span>
                        <span className="text-xs mt-1">SVG, PNG, JPG or GIF</span>
                      </div>
                    )}
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#12141C] border border-white/5 rounded-3xl p-8 shadow-2xl">
            <h2 className="text-lg font-black text-white mb-6 flex items-center gap-2">
              <span className="w-1 h-5 bg-[#00E57A] rounded-full"></span> Platform Availability & Status
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <BooleanSelect label="Global Status" name="status" icon={Activity} color="text-emerald-400" />
              <BooleanSelect label="Web Platform" name="web" icon={Monitor} color="text-blue-400" />
              <BooleanSelect label="Android Platform" name="android" icon={Smartphone} color="text-[#00E57A]" />
              <BooleanSelect label="iOS Platform" name="ios" icon={Apple} color="text-white" />
            </div>
          </div>

          <div className="flex justify-end pt-4 gap-4">
            {activeTab === 'edit' && (
              <button 
                type="button" 
                onClick={() => { resetForm(); setActiveTab('list'); }}
                className="px-6 py-4 rounded-2xl font-bold text-sm uppercase tracking-widest text-[#8F95A3] bg-[#1A1C24] hover:bg-white/5 hover:text-white transition-all cursor-pointer"
              >
                Cancel Edit
              </button>
            )}
            <button 
              type="submit" disabled={isSubmitting}
              className={`w-full md:w-auto px-10 py-4 rounded-2xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 transition-all cursor-pointer disabled:opacity-50 ${activeTab === 'edit' ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black shadow-[0_0_30px_rgba(245,158,11,0.3)] hover:shadow-[0_0_40px_rgba(245,158,11,0.5)]' : 'bg-gradient-to-r from-[#A66CFF] to-[#7C3AED] text-white shadow-[0_0_30px_rgba(166,108,255,0.3)] hover:shadow-[0_0_40px_rgba(166,108,255,0.5)]'} hover:-translate-y-1`}
            >
              {isSubmitting ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> {activeTab === 'edit' ? 'Updating...' : 'Deploying...'}</>
              ) : (
                <><Layers className="w-5 h-5" /> {activeTab === 'edit' ? 'Update Offerwall' : 'Deploy Offerwall'}</>
              )}
            </button>
          </div>
        </motion.form>
      )}

      {/* --- VIEW DETAILS MODAL --- */}
      <AnimatePresence>
        {isViewModalOpen && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-[#050409]/90 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 15 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-[#12141C] border border-white/10 w-full max-w-2xl rounded-[32px] shadow-2xl flex flex-col overflow-hidden max-h-[90vh]"
            >
              <div className="bg-[#1A1C24] border-b border-white/5 px-8 py-6 flex items-center justify-between sticky top-0 z-10">
                <h3 className="text-xl font-black flex items-center gap-3 tracking-tight text-white">
                  <Eye className="w-6 h-6 text-[#5EA8FF]" /> Offerwall Details
                </h3>
                <button onClick={() => setIsViewModalOpen(false)} className="text-[#8F95A3] hover:text-white transition-colors cursor-pointer w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-8 overflow-y-auto custom-scrollbar">
                {isViewingLoading ? (
                  <div className="py-20 flex flex-col items-center">
                    <Loader2 className="w-10 h-10 animate-spin text-[#5EA8FF] mb-4" />
                    <p className="text-[#8F95A3] font-bold tracking-widest uppercase text-xs">Fetching Details...</p>
                  </div>
                ) : viewData?.error ? (
                  <div className="p-6 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-2xl text-center">
                    <ShieldAlert className="w-10 h-10 mx-auto mb-3" />
                    <p className="font-bold">{viewData.error}</p>
                  </div>
                ) : (
                  <div className="flex flex-col gap-8">
                    
                    <div className="flex items-center gap-5 bg-white/[0.02] p-6 rounded-2xl border border-white/5">
                      <div className="w-20 h-20 bg-[#0B0D14] border border-white/10 rounded-2xl flex items-center justify-center overflow-hidden shrink-0">
                        {resolveImage(viewData?.image) ? <img src={resolveImage(viewData.image)!} alt="logo" className="w-full h-full object-cover" /> : <ImageIcon className="w-8 h-8 text-gray-500" />}
                      </div>
                      <div className="flex flex-col">
                        <h2 className="text-2xl font-black text-white">{viewData?.title || 'N/A'}</h2>
                        <span className="text-[#8F95A3] font-mono text-xs mt-1">ID: {viewData?._id || 'N/A'}</span>
                      </div>
                      <div className="ml-auto flex items-center gap-2">
                        <Star className="w-5 h-5 text-amber-400" />
                        <span className="text-2xl font-black text-amber-400">{viewData?.rating || '0'}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      
                      <div className="bg-[#0B0D14] p-4 rounded-xl border border-white/5 flex flex-col gap-1">
                        <span className="text-[10px] text-[#8F95A3] font-bold uppercase tracking-widest">Target URL</span>
                        <span className="text-sm font-medium text-[#5EA8FF] break-all">{viewData?.offerwallUrl || 'N/A'}</span>
                      </div>

                      <div className="bg-[#0B0D14] p-4 rounded-xl border border-white/5 flex flex-col gap-1">
                        <span className="text-[10px] text-[#8F95A3] font-bold uppercase tracking-widest">Postback Identifier</span>
                        <span className="text-sm font-black text-white">{viewData?.postbackName || 'N/A'}</span>
                      </div>

                      <div className="bg-[#0B0D14] p-4 rounded-xl border border-white/5 flex flex-col gap-1">
                        <span className="text-[10px] text-[#8F95A3] font-bold uppercase tracking-widest">Type</span>
                        <span className="text-sm font-black text-[#A66CFF] uppercase">{viewData?.type || 'N/A'}</span>
                      </div>

                      <div className="bg-[#0B0D14] p-4 rounded-xl border border-white/5 flex flex-col gap-1">
                        <span className="text-[10px] text-[#8F95A3] font-bold uppercase tracking-widest">Category</span>
                        <span className="text-sm font-medium text-white">{Array.isArray(viewData?.category) ? viewData.category.join(', ') : (viewData?.category || 'N/A')}</span>
                      </div>
                      
                      <div className="bg-[#0B0D14] p-4 rounded-xl border border-white/5 flex flex-col gap-1 md:col-span-2">
                        <span className="text-[10px] text-[#8F95A3] font-bold uppercase tracking-widest">Excluded Countries</span>
                        <span className="text-sm font-medium text-rose-400">{Array.isArray(viewData?.excludeCountryCode) ? viewData.excludeCountryCode.join(', ') : (viewData?.excludeCountryCode || 'None')}</span>
                      </div>

                    </div>

                    <div className="bg-[#0B0D14] p-5 rounded-2xl border border-white/5">
                       <span className="text-[11px] text-[#8F95A3] font-bold uppercase tracking-widest block mb-4">Platform Config</span>
                       <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                         <div className="flex flex-col gap-1 text-center">
                           <Activity className="w-5 h-5 mx-auto mb-1 text-gray-500" />
                           <span className="text-[10px] text-gray-400 uppercase font-bold">Global</span>
                           <span className={`text-xs font-black ${String(viewData?.status) === 'true' ? 'text-emerald-400' : 'text-rose-400'}`}>{String(viewData?.status) === 'true' ? 'ENABLED' : 'DISABLED'}</span>
                         </div>
                         <div className="flex flex-col gap-1 text-center">
                           <Monitor className="w-5 h-5 mx-auto mb-1 text-blue-400" />
                           <span className="text-[10px] text-gray-400 uppercase font-bold">Web</span>
                           <span className={`text-xs font-black ${String(viewData?.platforms?.web) === 'true' ? 'text-emerald-400' : 'text-rose-400'}`}>{String(viewData?.platforms?.web) === 'true' ? 'ENABLED' : 'DISABLED'}</span>
                         </div>
                         <div className="flex flex-col gap-1 text-center">
                           <Smartphone className="w-5 h-5 mx-auto mb-1 text-[#00E57A]" />
                           <span className="text-[10px] text-gray-400 uppercase font-bold">Android</span>
                           <span className={`text-xs font-black ${String(viewData?.platforms?.android) === 'true' ? 'text-emerald-400' : 'text-rose-400'}`}>{String(viewData?.platforms?.android) === 'true' ? 'ENABLED' : 'DISABLED'}</span>
                         </div>
                         <div className="flex flex-col gap-1 text-center">
                           <Apple className="w-5 h-5 mx-auto mb-1 text-white" />
                           <span className="text-[10px] text-gray-400 uppercase font-bold">iOS</span>
                           <span className={`text-xs font-black ${String(viewData?.platforms?.ios) === 'true' ? 'text-emerald-400' : 'text-rose-400'}`}>{String(viewData?.platforms?.ios) === 'true' ? 'ENABLED' : 'DISABLED'}</span>
                         </div>
                       </div>
                    </div>

                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}