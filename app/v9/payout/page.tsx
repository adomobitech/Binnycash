'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Settings, Globe, Percent, Monitor, Save, Loader2, AlertCircle, CheckCircle2, ShieldCheck
} from 'lucide-react';

// --- UTILITY: Get Admin ID ---
function getAdminId(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem('adminId') || localStorage.getItem('admin_id') || localStorage.getItem('userId') || '';
}

// --- UTILITY: Auto Detect Device Name ---
function detectDevice(): string {
  if (typeof window === 'undefined') return 'Admin Web Dashboard';
  const ua = window.navigator.userAgent;
  let os = 'Unknown OS';
  if (ua.indexOf('Win') !== -1) os = 'Windows';
  if (ua.indexOf('Mac') !== -1) os = 'MacOS';
  if (ua.indexOf('Linux') !== -1) os = 'Linux';
  if (ua.indexOf('Android') !== -1) os = 'Android';
  if (ua.indexOf('like Mac') !== -1) os = 'iOS';
  
  let browser = 'Browser';
  if (ua.indexOf('Chrome') !== -1) browser = 'Chrome';
  else if (ua.indexOf('Firefox') !== -1) browser = 'Firefox';
  else if (ua.indexOf('Safari') !== -1) browser = 'Safari';
  else if (ua.indexOf('Edge') !== -1) browser = 'Edge';

  return `${os} - ${browser} (Admin)`;
}

export default function PayoutSettingsPage() {
  const [formData, setFormData] = useState({
    payoutPercent: '',
    countryCode: ''
  });
  
  const [deviceName, setDeviceName] = useState('Detecting...');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

  // Set device name on mount
  useEffect(() => {
    setDeviceName(detectDevice());
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    // Auto capitalize country code
    const finalValue = name === 'countryCode' ? value.toUpperCase() : value;
    setFormData(prev => ({ ...prev, [name]: finalValue }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const adminId = getAdminId();

    if (!adminId) {
      setMessage({ text: 'Admin ID missing. Please log in again.', type: 'error' });
      return;
    }

    if (!formData.payoutPercent || !formData.countryCode) {
      setMessage({ text: 'Please fill in all required fields.', type: 'error' });
      return;
    }

    setIsLoading(true);
    setMessage(null);
    const token = localStorage.getItem('admin_token') || '';

    try {
      const payload = new FormData();
      payload.append('adminId', adminId);
      payload.append('payoutPercent', formData.payoutPercent);
      payload.append('countryCode', formData.countryCode);
      payload.append('deviceName', deviceName);

      const res = await fetch(`https://api.binnycash.com/api/admin/addPayoutPercent`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}` 
        },
        body: payload
      });

      const json = await res.json();
      
      if (res.ok && (json.code === 200 || json.type === 'success')) {
        setMessage({ text: json.message || 'Payout percentage updated successfully!', type: 'success' });
        setFormData({ payoutPercent: '', countryCode: '' }); // Reset form
      } else {
        setMessage({ text: json.message || 'Failed to update payout percentage.', type: 'error' });
      }
    } catch (err) {
      console.error("Payout update error:", err);
      setMessage({ text: 'Network error. Please try again.', type: 'error' });
    } finally {
      setIsLoading(false);
      // Clear message after 4 seconds
      setTimeout(() => setMessage(null), 4000);
    }
  };

  return (
    <div className="flex flex-col gap-6 text-white w-full max-w-[800px] mx-auto pb-10 font-sans">
      
      {/* HEADER */}
      <div className="flex flex-col gap-1 border-b border-white/10 pb-5">
        <h1 className="text-3xl font-black text-white flex items-center gap-3 tracking-tight">
          <Settings className="w-8 h-8 text-[#A66CFF]" /> Payout Configuration
        </h1>
        <p className="text-sm text-[#8F95A3] mt-1">
          Set dynamic payout percentages for specific countries securely.
        </p>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-[#12141C] border border-white/5 rounded-3xl p-8 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#A66CFF]/5 blur-[80px] pointer-events-none rounded-full" />
        
        <h2 className="text-lg font-black text-white mb-6 flex items-center gap-2 relative z-10">
          <span className="w-1 h-5 bg-[#A66CFF] rounded-full"></span> Country Payout Rules
        </h2>

        <AnimatePresence>
          {message && (
            <motion.div 
              initial={{ opacity: 0, height: 0, marginBottom: 0 }} 
              animate={{ opacity: 1, height: 'auto', marginBottom: 24 }} 
              exit={{ opacity: 0, height: 0, marginBottom: 0 }}
              className={`p-4 rounded-xl flex items-center gap-3 overflow-hidden shadow-lg border relative z-10 ${
                message.type === 'success' ? 'bg-[#00E57A]/10 border-[#00E57A]/30 text-[#00E57A]' : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
              }`}
            >
              {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <AlertCircle className="w-5 h-5 shrink-0" />}
              <span className="font-bold text-sm tracking-wide">{message.text}</span>
            </motion.div>
          )}
        </AnimatePresence>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* PAYOUT PERCENT */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-[#8F95A3] uppercase tracking-widest flex items-center gap-2">
                Payout Percent <span className="text-rose-500">*</span>
              </label>
              <div className="relative group">
                <Percent className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8F95A3] group-focus-within:text-[#A66CFF] transition-colors" />
                <input 
                  type="number" 
                  name="payoutPercent" 
                  required 
                  min="0"
                  step="any"
                  value={formData.payoutPercent} 
                  onChange={handleInputChange} 
                  placeholder="e.g. 85"
                  className="w-full bg-[#0B0D14] border border-white/10 rounded-xl pl-11 pr-4 py-3.5 text-sm text-white font-medium focus:outline-none focus:border-[#A66CFF] transition-all shadow-inner"
                />
              </div>
            </div>

            {/* COUNTRY CODE */}
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-[#8F95A3] uppercase tracking-widest flex items-center gap-2">
                Country Code <span className="text-rose-500">*</span>
              </label>
              <div className="relative group">
                <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8F95A3] group-focus-within:text-[#A66CFF] transition-colors" />
                <input 
                  type="text" 
                  name="countryCode" 
                  required 
                  maxLength={2}
                  value={formData.countryCode} 
                  onChange={handleInputChange} 
                  placeholder="e.g. IN, US"
                  className="w-full bg-[#0B0D14] border border-white/10 rounded-xl pl-11 pr-4 py-3.5 text-sm text-white font-medium focus:outline-none focus:border-[#A66CFF] transition-all shadow-inner uppercase"
                />
              </div>
            </div>

            {/* AUTOMATED DEVICE NAME (READ-ONLY) */}
            <div className="flex flex-col gap-2 md:col-span-2">
              <label className="text-xs font-bold text-[#8F95A3] uppercase tracking-widest flex items-center gap-2">
                Device Name <span className="text-emerald-500 text-[10px] ml-2">(Auto-Detected)</span>
              </label>
              <div className="relative">
                <Monitor className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600" />
                <input 
                  type="text" 
                  value={deviceName} 
                  disabled
                  className="w-full bg-[#1A1C24] border border-white/5 rounded-xl pl-11 pr-11 py-3.5 text-sm text-gray-500 font-mono cursor-not-allowed shadow-inner"
                />
                <ShieldCheck className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-emerald-500/50" />
              </div>
            </div>

          </div>

          <div className="flex justify-end pt-4 border-t border-white/5 mt-2">
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full md:w-auto px-10 py-4 rounded-xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 transition-all cursor-pointer disabled:opacity-50 bg-gradient-to-r from-[#A66CFF] to-[#7C3AED] text-white shadow-[0_0_30px_rgba(166,108,255,0.3)] hover:shadow-[0_0_40px_rgba(166,108,255,0.5)] hover:-translate-y-1"
            >
              {isLoading ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</>
              ) : (
                <><Save className="w-5 h-5" /> Save Configuration</>
              )}
            </button>
          </div>
        </form>
      </motion.div>

    </div>
  );
}