'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  User, Lock, Save, Loader2, Mail, MapPin, 
  Calendar, Phone, ShieldCheck, CheckCircle2, AlertCircle,
  KeyRound, Fingerprint, AtSign, Edit2, X
} from 'lucide-react';

export default function AdminSettingsPage() {
  // --- Display Data State ---
  const [adminData, setAdminData] = useState<any>({});

  // --- Modal States ---
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isPassModalOpen, setIsPassModalOpen] = useState(false);

  // --- States for Profile Form ---
  const [profileForm, setProfileForm] = useState({
    email: '',
    firstname: '',
    lastname: '',
    address: '',
    dob: '',
    number: ''
  });
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [profileMessage, setProfileMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

  // --- States for Password Form ---
  const [passForm, setPassForm] = useState({
    password: '',
    newPassword: '',
    confirm_password: ''
  });
  const [isPassLoading, setIsPassLoading] = useState(false);
  const [passMessage, setPassMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

  // --- Load Initial Data from Local Storage ---
  useEffect(() => {
    const rawData = localStorage.getItem('admin_data');
    if (rawData) {
      try {
        const data = JSON.parse(rawData);
        setAdminData(data);
        
        const nameParts = (data.name || '').split(' ');
        const firstname = nameParts[0] || '';
        const lastname = nameParts.slice(1).join(' ') || '';

        setProfileForm({
          email: data.email || '',
          firstname: firstname,
          lastname: lastname,
          address: data.address || '',
          dob: data.dob ? data.dob.split('T')[0] : '', 
          number: data.mobileNumber || ''
        });
      } catch (e) {
        console.error("Failed to parse admin data", e);
      }
    }
  }, []);

  // Sync Form when opening Profile Modal
  const openProfileModal = () => {
    setProfileMessage(null);
    setIsProfileModalOpen(true);
  };

  const openPassModal = () => {
    setPassMessage(null);
    setPassForm({ password: '', newPassword: '', confirm_password: '' });
    setIsPassModalOpen(true);
  };

  // --- Update Profile Logic ---
  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProfileLoading(true);
    setProfileMessage(null);

    const token = localStorage.getItem('admin_token') || '';

    const fd = new FormData();
    fd.append('email', profileForm.email);
    fd.append('firstname', profileForm.firstname);
    fd.append('lastname', profileForm.lastname);
    fd.append('address', profileForm.address);
    fd.append('dob', profileForm.dob);
    fd.append('number', profileForm.number);

    try {
      const res = await fetch('https://api.binnycash.com/api/admin/editProfile', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'token': token 
        },
        body: fd
      });
      const data = await res.json();

      if (res.ok && (data.code === 200 || data.type === 'success')) {
        setProfileMessage({ text: data.message || 'Profile updated successfully!', type: 'success' });
        
        // Update Local Storage and Display Data
        const updatedName = `${profileForm.firstname} ${profileForm.lastname}`.trim();
        const rawData = localStorage.getItem('admin_data');
        if (rawData) {
          const storedData = JSON.parse(rawData);
          storedData.email = profileForm.email;
          storedData.name = updatedName;
          storedData.address = profileForm.address;
          storedData.mobileNumber = profileForm.number;
          storedData.dob = profileForm.dob;
          localStorage.setItem('admin_data', JSON.stringify(storedData));
          
          setAdminData(storedData);
        }

        setTimeout(() => {
          setIsProfileModalOpen(false);
          setProfileMessage(null);
        }, 1500);
      } else {
        setProfileMessage({ text: data.message || 'Failed to update profile.', type: 'error' });
      }
    } catch (err) {
      setProfileMessage({ text: 'Network error. Please try again.', type: 'error' });
    } finally {
      setIsProfileLoading(false);
    }
  };

  // --- Change Password Logic ---
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passForm.newPassword !== passForm.confirm_password) {
      setPassMessage({ text: 'New passwords do not match.', type: 'error' });
      return;
    }

    setIsPassLoading(true);
    setPassMessage(null);

    const token = localStorage.getItem('admin_token') || '';

    const fd = new FormData();
    fd.append('password', passForm.password);
    fd.append('newPassword', passForm.newPassword);
    fd.append('confirm_password', passForm.confirm_password);

    try {
      const res = await fetch('https://api.binnycash.com/api/admin/changePassword', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'token': token 
        },
        body: fd
      });
      const data = await res.json();

      if (res.ok && (data.code === 200 || data.type === 'success')) {
        setPassMessage({ text: data.message || 'Password changed successfully!', type: 'success' });
        setTimeout(() => {
          setIsPassModalOpen(false);
          setPassMessage(null);
        }, 1500);
      } else {
        setPassMessage({ text: data.message || 'Failed to change password.', type: 'error' });
      }
    } catch (err) {
      setPassMessage({ text: 'Network error. Please try again.', type: 'error' });
    } finally {
      setIsPassLoading(false);
    }
  };

  return (
    <div className="flex flex-col text-white w-full max-w-[1600px] mx-auto pb-12 font-sans relative">
      
      {/* GLOBAL BACKGROUND GLOW */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[#7C3AED]/10 blur-[150px] rounded-full pointer-events-none -z-10" />

      {/* STYLISH HEADER */}
      <div className="bg-[#12141C]/80 backdrop-blur-xl border border-white/5 rounded-3xl p-8 sm:p-10 mb-8 shadow-2xl relative overflow-hidden flex flex-col sm:flex-row items-center sm:items-start gap-6 z-10">
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[#7C3AED]/20 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-[#7C3AED] to-[#5B21B6] p-[2px] shadow-[0_0_30px_rgba(124,58,237,0.3)] shrink-0">
          <div className="w-full h-full bg-[#12141C] rounded-[14px] flex items-center justify-center">
            <ShieldCheck className="w-10 h-10 text-[#A882FF]" />
          </div>
        </div>

        <div className="flex flex-col text-center sm:text-left justify-center pt-2">
          <h1 className="text-3xl font-black text-white tracking-tight mb-2">Administrator Settings</h1>
          <p className="text-sm text-[#8F95A3] max-w-xl">
            Manage your personal profile, contact information, and security credentials. Keep your account secure and up to date.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8 z-10">
        
        {/* ========================================== */}
        {/* PROFILE DETAILS (READ-ONLY) */}
        {/* ========================================== */}
        <div className="bg-[#12141C]/90 backdrop-blur-md border border-white/5 rounded-3xl p-6 sm:p-10 shadow-2xl relative flex flex-col h-full group">
          <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[#7C3AED]/10 flex items-center justify-center border border-[#7C3AED]/20">
                <User className="w-6 h-6 text-[#A882FF]" />
              </div>
              <div>
                <h3 className="text-xl font-black text-white">Profile Details</h3>
                <p className="text-xs text-[#8F95A3] mt-1">Your current personal information</p>
              </div>
            </div>
            <button 
              onClick={openProfileModal}
              className="bg-white/5 hover:bg-[#7C3AED]/20 border border-white/10 hover:border-[#7C3AED]/50 text-[#8F95A3] hover:text-white p-2.5 rounded-xl transition-all cursor-pointer"
            >
              <Edit2 className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-8 gap-x-6 flex-1">
            <div className="flex items-start gap-4 bg-white/[0.02] p-4 rounded-2xl border border-white/5">
              <div className="w-10 h-10 rounded-full bg-black/20 flex items-center justify-center shrink-0 border border-white/5">
                <User className="w-4 h-4 text-gray-400" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Full Name</span>
                <span className="text-sm font-black text-white">{adminData.name || 'Not Set'}</span>
              </div>
            </div>

            <div className="flex items-start gap-4 bg-white/[0.02] p-4 rounded-2xl border border-white/5">
              <div className="w-10 h-10 rounded-full bg-black/20 flex items-center justify-center shrink-0 border border-white/5">
                <Mail className="w-4 h-4 text-gray-400" />
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Email Address</span>
                <span className="text-sm font-black text-white truncate">{adminData.email || 'Not Set'}</span>
              </div>
            </div>

            <div className="flex items-start gap-4 bg-white/[0.02] p-4 rounded-2xl border border-white/5">
              <div className="w-10 h-10 rounded-full bg-black/20 flex items-center justify-center shrink-0 border border-white/5">
                <Phone className="w-4 h-4 text-gray-400" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Mobile Number</span>
                <span className="text-sm font-black text-white">{adminData.mobileNumber || 'Not Set'}</span>
              </div>
            </div>

            <div className="flex items-start gap-4 bg-white/[0.02] p-4 rounded-2xl border border-white/5">
              <div className="w-10 h-10 rounded-full bg-black/20 flex items-center justify-center shrink-0 border border-white/5">
                <Calendar className="w-4 h-4 text-gray-400" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Date of Birth</span>
                <span className="text-sm font-black text-white">{adminData.dob ? adminData.dob.split('T')[0] : 'Not Set'}</span>
              </div>
            </div>

            <div className="sm:col-span-2 flex items-start gap-4 bg-white/[0.02] p-4 rounded-2xl border border-white/5">
              <div className="w-10 h-10 rounded-full bg-black/20 flex items-center justify-center shrink-0 border border-white/5">
                <MapPin className="w-4 h-4 text-gray-400" />
              </div>
              <div className="flex flex-col">
                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Address</span>
                <span className="text-sm font-bold text-gray-300 leading-relaxed">{adminData.address || 'Not Set'}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ========================================== */}
        {/* SECURITY SETTINGS (READ-ONLY) */}
        {/* ========================================== */}
        <div className="bg-[#12141C]/90 backdrop-blur-md border border-white/5 rounded-3xl p-6 sm:p-10 shadow-2xl relative flex flex-col h-fit group">
          <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/5">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-rose-500/10 flex items-center justify-center border border-rose-500/20">
                <Fingerprint className="w-6 h-6 text-rose-400" />
              </div>
              <div>
                <h3 className="text-xl font-black text-white">Security & Password</h3>
                <p className="text-xs text-[#8F95A3] mt-1">Manage your account protection</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            <div className="flex items-center justify-between bg-white/[0.02] p-6 rounded-2xl border border-white/5">
              <div className="flex items-center gap-5">
                <div className="w-12 h-12 rounded-full bg-black/20 flex items-center justify-center shrink-0 border border-white/5">
                  <KeyRound className="w-5 h-5 text-gray-400" />
                </div>
                <div className="flex flex-col">
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-1">Account Password</span>
                  <span className="text-lg font-black text-white tracking-[0.2em] mt-1">••••••••••••</span>
                </div>
              </div>
            </div>

            <button 
              onClick={openPassModal}
              className="w-full mt-4 bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-black text-sm tracking-wide px-10 py-4 rounded-xl transition-all shadow-[0_0_20px_rgba(244,63,94,0.3)] hover:shadow-[0_0_30px_rgba(244,63,94,0.5)] flex items-center justify-center gap-2 cursor-pointer"
            >
              <Lock className="w-5 h-5" />
              Update Password
            </button>
          </div>
        </div>

      </div>

      {/* ========================================== */}
      {/* MODAL: EDIT PROFILE */}
      {/* ========================================== */}
      <AnimatePresence>
        {isProfileModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-[#12141C] border border-white/10 w-full max-w-2xl rounded-[32px] shadow-2xl relative flex flex-col overflow-hidden my-auto"
            >
              <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-[#161821]">
                <h3 className="text-xl font-black text-white flex items-center gap-3">
                  <User className="w-5 h-5 text-[#A882FF]" /> Edit Profile Details
                </h3>
                <button onClick={() => setIsProfileModalOpen(false)} className="text-gray-400 hover:text-white p-2 rounded-xl hover:bg-white/5 transition-colors cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-8 custom-scrollbar overflow-y-auto max-h-[75vh]">
                {profileMessage && (
                  <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 text-sm font-bold border ${profileMessage.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}>
                    {profileMessage.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
                    {profileMessage.text}
                  </div>
                )}

                <form id="profileForm" onSubmit={handleUpdateProfile} className="flex flex-col gap-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-2">
                      <label className="text-[11px] font-bold text-[#8F95A3] uppercase tracking-widest pl-1">First Name</label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                           <User className="w-4 h-4 text-gray-500 group-focus-within:text-[#7C3AED] transition-colors" />
                        </div>
                        <input 
                          type="text" required placeholder="John"
                          value={profileForm.firstname} onChange={e => setProfileForm({...profileForm, firstname: e.target.value})}
                          className="w-full bg-[#0B0D14]/80 border border-white/5 rounded-xl pl-11 pr-4 py-3.5 text-sm text-white focus:outline-none focus:border-[#7C3AED]/50 focus:bg-[#0B0D14] focus:ring-2 focus:ring-[#7C3AED]/20 transition-all placeholder:text-gray-700"
                        />
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-[11px] font-bold text-[#8F95A3] uppercase tracking-widest pl-1">Last Name</label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                           <AtSign className="w-4 h-4 text-gray-500 group-focus-within:text-[#7C3AED] transition-colors" />
                        </div>
                        <input 
                          type="text" required placeholder="Doe"
                          value={profileForm.lastname} onChange={e => setProfileForm({...profileForm, lastname: e.target.value})}
                          className="w-full bg-[#0B0D14]/80 border border-white/5 rounded-xl pl-11 pr-4 py-3.5 text-sm text-white focus:outline-none focus:border-[#7C3AED]/50 focus:bg-[#0B0D14] focus:ring-2 focus:ring-[#7C3AED]/20 transition-all placeholder:text-gray-700"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[11px] font-bold text-[#8F95A3] uppercase tracking-widest pl-1">Email Address</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                         <Mail className="w-4 h-4 text-gray-500 group-focus-within:text-[#7C3AED] transition-colors" />
                      </div>
                      <input 
                        type="email" required placeholder="admin@example.com"
                        value={profileForm.email} onChange={e => setProfileForm({...profileForm, email: e.target.value})}
                        className="w-full bg-[#0B0D14]/80 border border-white/5 rounded-xl pl-11 pr-4 py-3.5 text-sm text-white focus:outline-none focus:border-[#7C3AED]/50 focus:bg-[#0B0D14] focus:ring-2 focus:ring-[#7C3AED]/20 transition-all placeholder:text-gray-700"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="flex flex-col gap-2">
                      <label className="text-[11px] font-bold text-[#8F95A3] uppercase tracking-widest pl-1">Mobile Number</label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                           <Phone className="w-4 h-4 text-gray-500 group-focus-within:text-[#7C3AED] transition-colors" />
                        </div>
                        <input 
                          type="text" required placeholder="+1 234 567 890"
                          value={profileForm.number} onChange={e => setProfileForm({...profileForm, number: e.target.value})}
                          className="w-full bg-[#0B0D14]/80 border border-white/5 rounded-xl pl-11 pr-4 py-3.5 text-sm text-white focus:outline-none focus:border-[#7C3AED]/50 focus:bg-[#0B0D14] focus:ring-2 focus:ring-[#7C3AED]/20 transition-all placeholder:text-gray-700"
                        />
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <label className="text-[11px] font-bold text-[#8F95A3] uppercase tracking-widest pl-1">Date of Birth</label>
                      <div className="relative group">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                           <Calendar className="w-4 h-4 text-gray-500 group-focus-within:text-[#7C3AED] transition-colors" />
                        </div>
                        <input 
                          type="date" required
                          value={profileForm.dob} onChange={e => setProfileForm({...profileForm, dob: e.target.value})}
                          className="w-full bg-[#0B0D14]/80 border border-white/5 rounded-xl pl-11 pr-4 py-3.5 text-sm text-white focus:outline-none focus:border-[#7C3AED]/50 focus:bg-[#0B0D14] focus:ring-2 focus:ring-[#7C3AED]/20 transition-all [color-scheme:dark]"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 mb-2">
                    <label className="text-[11px] font-bold text-[#8F95A3] uppercase tracking-widest pl-1">Address</label>
                    <div className="relative group">
                      <div className="absolute top-4 left-0 pl-4 flex items-start pointer-events-none">
                         <MapPin className="w-4 h-4 text-gray-500 group-focus-within:text-[#7C3AED] transition-colors" />
                      </div>
                      <textarea 
                        required rows={3} placeholder="Enter your full address..."
                        value={profileForm.address} onChange={e => setProfileForm({...profileForm, address: e.target.value})}
                        className="w-full bg-[#0B0D14]/80 border border-white/5 rounded-xl pl-11 pr-4 py-3.5 text-sm text-white focus:outline-none focus:border-[#7C3AED]/50 focus:bg-[#0B0D14] focus:ring-2 focus:ring-[#7C3AED]/20 transition-all placeholder:text-gray-700 resize-none custom-scrollbar"
                      />
                    </div>
                  </div>
                </form>
              </div>

              <div className="px-8 py-5 border-t border-white/5 bg-[#161821] flex justify-end gap-3 shrink-0">
                <button 
                  type="button" onClick={() => setIsProfileModalOpen(false)}
                  className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-sm transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" form="profileForm" disabled={isProfileLoading}
                  className="bg-gradient-to-r from-[#7C3AED] to-[#5B21B6] hover:from-[#6D28D9] hover:to-[#4C1D95] text-white font-black text-sm px-8 py-3 rounded-xl transition-all shadow-[0_0_20px_rgba(124,58,237,0.3)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
                >
                  {isProfileLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Save Changes
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ========================================== */}
      {/* MODAL: CHANGE PASSWORD */}
      {/* ========================================== */}
      <AnimatePresence>
        {isPassModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-[#12141C] border border-white/10 w-full max-w-md rounded-[32px] shadow-2xl relative flex flex-col overflow-hidden my-auto"
            >
              <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-[#161821]">
                <h3 className="text-xl font-black text-white flex items-center gap-3">
                  <Lock className="w-5 h-5 text-rose-400" /> Change Password
                </h3>
                <button onClick={() => setIsPassModalOpen(false)} className="text-gray-400 hover:text-white p-2 rounded-xl hover:bg-white/5 transition-colors cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-8">
                {passMessage && (
                  <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 text-sm font-bold border ${passMessage.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border-rose-500/20 text-rose-400'}`}>
                    {passMessage.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
                    {passMessage.text}
                  </div>
                )}

                <form id="passForm" onSubmit={handleChangePassword} className="flex flex-col gap-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-[11px] font-bold text-[#8F95A3] uppercase tracking-widest pl-1">Current Password</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                         <KeyRound className="w-4 h-4 text-gray-500 group-focus-within:text-rose-400 transition-colors" />
                      </div>
                      <input 
                        type="password" required placeholder="Enter current password"
                        value={passForm.password} onChange={e => setPassForm({...passForm, password: e.target.value})}
                        className="w-full bg-[#0B0D14]/80 border border-white/5 rounded-xl pl-11 pr-4 py-3.5 text-sm text-white focus:outline-none focus:border-rose-500/50 focus:bg-[#0B0D14] focus:ring-2 focus:ring-rose-500/20 transition-all placeholder:text-gray-700"
                      />
                    </div>
                  </div>

                  <div className="w-full h-px bg-white/5 my-1"></div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[11px] font-bold text-[#8F95A3] uppercase tracking-widest pl-1">New Password</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                         <Lock className="w-4 h-4 text-gray-500 group-focus-within:text-rose-400 transition-colors" />
                      </div>
                      <input 
                        type="password" required placeholder="Enter new strong password"
                        value={passForm.newPassword} onChange={e => setPassForm({...passForm, newPassword: e.target.value})}
                        className="w-full bg-[#0B0D14]/80 border border-white/5 rounded-xl pl-11 pr-4 py-3.5 text-sm text-white focus:outline-none focus:border-rose-500/50 focus:bg-[#0B0D14] focus:ring-2 focus:ring-rose-500/20 transition-all placeholder:text-gray-700"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[11px] font-bold text-[#8F95A3] uppercase tracking-widest pl-1">Confirm New Password</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                         <Lock className="w-4 h-4 text-gray-500 group-focus-within:text-rose-400 transition-colors" />
                      </div>
                      <input 
                        type="password" required placeholder="Repeat new password"
                        value={passForm.confirm_password} onChange={e => setPassForm({...passForm, confirm_password: e.target.value})}
                        className="w-full bg-[#0B0D14]/80 border border-white/5 rounded-xl pl-11 pr-4 py-3.5 text-sm text-white focus:outline-none focus:border-rose-500/50 focus:bg-[#0B0D14] focus:ring-2 focus:ring-rose-500/20 transition-all placeholder:text-gray-700"
                      />
                    </div>
                  </div>
                </form>
              </div>

              <div className="px-8 py-5 border-t border-white/5 bg-[#161821] flex justify-end gap-3 shrink-0">
                <button 
                  type="button" onClick={() => setIsPassModalOpen(false)}
                  className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-sm transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  type="submit" form="passForm" disabled={isPassLoading}
                  className="bg-gradient-to-r from-rose-500 to-rose-600 hover:from-rose-600 hover:to-rose-700 text-white font-black text-sm px-8 py-3 rounded-xl transition-all shadow-[0_0_20px_rgba(244,63,94,0.3)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
                >
                  {isPassLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                  Update
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}