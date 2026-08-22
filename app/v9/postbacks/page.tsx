'use client';

import React, { useState, useRef } from 'react';
import { 
  Link2, Save, Loader2, Plus, X, UploadCloud, 
  AlertCircle, Image as ImageIcon, ShieldCheck, 
  Activity, Tag, Settings, Percent, RefreshCcw 
} from 'lucide-react';

export default function AdminPostbackPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- FORM STATES ---
  const [formData, setFormData] = useState({
    adminId: '',
    name: '',
    category: 'Offer',
    event_name: '',
    reverse: '',
    payout: 'Cash',
    percent: '',
    sucess: '', // Spelling as per your Swagger screenshot (sucess)
    fail: ''
  });

  const [ipInput, setIpInput] = useState('');
  const [ipList, setIpList] = useState<string[]>([]);
  const [postbackImage, setPostbackImage] = useState<File | null>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // --- UI STATES ---
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // --- HANDLE INPUT CHANGE ---
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // --- IP ADDRESS LOGIC ---
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

  // --- IMAGE UPLOAD LOGIC ---
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

  // --- FORM SUBMIT LOGIC ---
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    // 1. Validations
    if (!formData.adminId) return setErrorMsg("Admin ID is required.");
    if (!formData.name) return setErrorMsg("Name is required.");
    if (!formData.category) return setErrorMsg("Category is required.");
    if (!formData.percent) return setErrorMsg("Percent is required.");
    if (!formData.event_name) return setErrorMsg("Event Name is required.");
    if (!postbackImage) return setErrorMsg("Postback Logo/Image is strictly required.");

    setIsSubmitting(true);
    const token = localStorage.getItem('admin_token');

    try {
      // API expects event_name in query string
      const url = `https://api.binnycash.com/api/pts/createPostabck?event_name=${encodeURIComponent(formData.event_name)}`;

      const fd = new FormData();
      fd.append('adminId', formData.adminId);
      fd.append('name', formData.name);
      fd.append('category', formData.category);
      fd.append('percent', formData.percent);
      
      // Optional/Replacement Fields
      if (formData.reverse) fd.append('reverse', formData.reverse);
      if (formData.payout) fd.append('payout', formData.payout);
      if (formData.sucess) fd.append('sucess', formData.sucess); 
      if (formData.fail) fd.append('fail', formData.fail);

      // Append multiple IPs
      if (ipList.length > 0) {
        ipList.forEach(ip => fd.append('ipAddress', ip));
      }

      // Append Image
      fd.append('postbackImage', postbackImage);

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
          // Don't set Content-Type, browser will automatically set it to multipart/form-data with boundaries
        },
        body: fd
      });

      const json = await res.json().catch(() => null);

      if (res.ok && (json?.code === 200 || json?.type === 'success')) {
        setSuccessMsg("Postback created successfully!");
        // Reset form
        setFormData({
          adminId: '', name: '', category: 'Offer', event_name: '', reverse: '',
          payout: 'Cash', percent: '', sucess: '', fail: ''
        });
        setIpList([]);
        clearImage();
      } else {
        setErrorMsg(json?.message || "Failed to create postback.");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Network error occurred while creating postback.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6 text-white w-full max-w-[1200px] mx-auto pb-10 font-sans">
      
      {/* --- HEADER --- */}
      <div>
        <h1 className="text-2xl font-bold text-white flex items-center gap-2">
           <Link2 className="w-6 h-6 text-[#3B82F6]" /> Create Postback (S2S)
        </h1>
        <p className="text-sm text-gray-400 mt-1">Configure server-to-server tracking endpoints for your offer networks.</p>
      </div>

      {errorMsg && (
        <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 p-4 rounded-xl flex items-center gap-3">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span className="text-sm font-bold">{errorMsg}</span>
        </div>
      )}

      {successMsg && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-4 rounded-xl flex items-center gap-3">
          <ShieldCheck className="w-5 h-5 shrink-0" />
          <span className="text-sm font-bold">{successMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col lg:flex-row gap-6">
        
        {/* LEFT COLUMN: MAIN SETTINGS */}
        <div className="flex-1 flex flex-col gap-6">
          
          <div className="bg-[#12141C] border border-white/5 rounded-[20px] p-6 shadow-sm">
            <h2 className="text-sm font-black text-white flex items-center gap-2 mb-5 pb-3 border-b border-white/5">
              <Activity className="w-4 h-4 text-[#3B82F6]" /> Primary Details
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Admin ID <span className="text-rose-500">*</span></label>
                <input required type="text" name="adminId" value={formData.adminId} onChange={handleChange} placeholder="e.g. 1" className="bg-[#0B0D14] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#3B82F6]" />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Network Name <span className="text-rose-500">*</span></label>
                <input required type="text" name="name" value={formData.name} onChange={handleChange} placeholder="e.g. AdGateMedia" className="bg-[#0B0D14] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#3B82F6]" />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Category <span className="text-rose-500">*</span></label>
                <div className="relative">
                  <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <select required name="category" value={formData.category} onChange={handleChange} className="w-full bg-[#0B0D14] border border-white/10 rounded-xl pl-9 pr-4 py-3 text-sm text-white focus:outline-none focus:border-[#3B82F6] appearance-none cursor-pointer">
                    <option value="Offer">Offer</option>
                    <option value="Survey">Survey</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Event Name (Query) <span className="text-rose-500">*</span></label>
                <input required type="text" name="event_name" value={formData.event_name} onChange={handleChange} placeholder="e.g. postback_completed" className="bg-[#0B0D14] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#3B82F6]" />
              </div>
            </div>
          </div>

          <div className="bg-[#12141C] border border-white/5 rounded-[20px] p-6 shadow-sm">
            <h2 className="text-sm font-black text-white flex items-center gap-2 mb-5 pb-3 border-b border-white/5">
              <Settings className="w-4 h-4 text-amber-400" /> Variables & Responses
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                  Payout Type <span className="text-gray-600 normal-case font-medium">(replaces reward_value)</span>
                </label>
                <select name="payout" value={formData.payout} onChange={handleChange} className="w-full bg-[#0B0D14] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#3B82F6] appearance-none">
                  <option value="Points">Points</option>
                  <option value="Cash">Cash</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">Percent <span className="text-rose-500">*</span></label>
                <div className="relative">
                  <Percent className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input required type="number" step="any" name="percent" value={formData.percent} onChange={handleChange} placeholder="e.g. 100" className="w-full bg-[#0B0D14] border border-white/10 rounded-xl pl-9 pr-4 py-3 text-sm text-white focus:outline-none focus:border-[#3B82F6]" />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                  Reverse Variable <span className="text-gray-600 normal-case font-medium">(Optional)</span>
                </label>
                <input type="text" name="reverse" value={formData.reverse} onChange={handleChange} placeholder="e.g. chargeback" className="bg-[#0B0D14] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#3B82F6]" />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                  Success Response <span className="text-gray-600 normal-case font-medium">(Optional)</span>
                </label>
                <input type="text" name="sucess" value={formData.sucess} onChange={handleChange} placeholder="e.g. OK" className="bg-[#0B0D14] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#3B82F6]" />
              </div>

              <div className="flex flex-col gap-1.5 md:col-span-2">
                <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                  Fail Response <span className="text-gray-600 normal-case font-medium">(Optional)</span>
                </label>
                <input type="text" name="fail" value={formData.fail} onChange={handleChange} placeholder="e.g. ERROR" className="bg-[#0B0D14] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#3B82F6]" />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: IPS & LOGO */}
        <div className="w-full lg:w-[400px] flex flex-col gap-6">
          
          <div className="bg-[#12141C] border border-white/5 rounded-[20px] p-6 shadow-sm">
            <h2 className="text-sm font-black text-white flex items-center gap-2 mb-5 pb-3 border-b border-white/5">
              <ShieldCheck className="w-4 h-4 text-[#00E57A]" /> Whitelisted IPs
            </h2>
            
            <div className="flex flex-col gap-3">
              <label className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">IP Addresses (Optional)</label>
              <div className="flex gap-2">
                <input 
                  type="text" 
                  value={ipInput} 
                  onChange={(e) => setIpInput(e.target.value)} 
                  onKeyDown={handleIpKeyDown}
                  placeholder="e.g. 192.168.1.1" 
                  className="flex-1 bg-[#0B0D14] border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#00E57A]" 
                />
                <button type="button" onClick={handleAddIp} className="bg-[#00E57A]/10 text-[#00E57A] hover:bg-[#00E57A]/20 px-4 rounded-xl transition-colors font-bold flex items-center justify-center shrink-0 cursor-pointer">
                  Add IP
                </button>
              </div>

              {ipList.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2 bg-[#0B0D14] p-3 rounded-xl border border-white/5">
                  {ipList.map((ip, idx) => (
                    <span key={idx} className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-lg text-xs font-mono text-gray-300 flex items-center gap-2">
                      {ip}
                      <X onClick={() => handleRemoveIp(ip)} className="w-3 h-3 text-gray-500 hover:text-rose-500 cursor-pointer transition-colors" />
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="bg-[#12141C] border border-white/5 rounded-[20px] p-6 shadow-sm flex-1">
            <h2 className="text-sm font-black text-white flex items-center gap-2 mb-5 pb-3 border-b border-white/5">
              <ImageIcon className="w-4 h-4 text-purple-400" /> Network Logo <span className="text-rose-500 ml-auto text-xs font-bold">* Required</span>
            </h2>
            
            <div className="flex flex-col items-center justify-center gap-4 h-full min-h-[200px]">
              {previewImage ? (
                <div className="relative w-full h-40 bg-[#0B0D14] border border-white/10 rounded-xl flex items-center justify-center overflow-hidden group">
                  <img src={previewImage} alt="Preview" className="w-full h-full object-contain p-2" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button type="button" onClick={clearImage} className="bg-rose-500 text-white px-4 py-2 rounded-lg text-xs font-bold shadow-lg hover:bg-rose-600 cursor-pointer">
                      Remove Image
                    </button>
                  </div>
                </div>
              ) : (
                <label className="w-full h-40 border-2 border-dashed border-white/10 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-[#3B82F6]/50 hover:bg-[#3B82F6]/5 transition-all cursor-pointer">
                  <UploadCloud className="w-8 h-8 text-gray-500" />
                  <span className="text-xs text-gray-400 font-bold">Click to upload logo</span>
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
              )}
            </div>
          </div>

          {/* SUBMIT BUTTON */}
          <button 
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 rounded-[16px] bg-[#3B82F6] hover:bg-[#2563EB] text-white font-black text-sm uppercase tracking-widest transition-all shadow-[0_0_20px_rgba(59,130,246,0.3)] flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer mt-auto"
          >
            {isSubmitting ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Submitting...</>
            ) : (
              <><Save className="w-5 h-5" /> Save Postback</>
            )}
          </button>
          
        </div>
      </form>
    </div>
  );
}