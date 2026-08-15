'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings, User, Mail, BookOpen, MapPin, Home,
  Phone, Hash, Camera, UploadCloud, Copy, Globe,
  Trash2, Image as ImageIcon, CheckCircle2, ChevronRight, ChevronLeft,
  AlertCircle, X, ShieldAlert, ShieldCheck, Wallet, Clock, Loader2,
  KeyRound, Coins, Sparkles, ScanLine, Check, Calendar, Building, ChevronDown, CreditCard,
  Target, Users, ArrowUp
} from 'lucide-react';

import { useCurrency, formatPrice } from '@/hooks/useCurrency';

// --- UTILITY: Get User ID securely ---
function getUserId(): string {
  if (typeof window === 'undefined') return '';
  const isNumeric = (v: any) => v !== null && v !== undefined && /^\d+$/.test(String(v));
  try {
    const wrapperKeys = ['loginResponse', 'authResponse', 'loginData'];
    for (const key of wrapperKeys) {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      try {
        const parsed = JSON.parse(raw);
        const id = parsed?.data?.userDetails?.id ?? parsed?.userDetails?.id;
        if (isNumeric(id)) return String(id);
      } catch {}
    }
    const objectKeys = ['userDetails', 'user', 'userData', 'profile', 'authUser'];
    for (const key of objectKeys) {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      try {
        const parsed = JSON.parse(raw);
        const candidates = [parsed?.id, parsed?.userDetails?.id, parsed?._id, parsed?.userId, parsed?.user_id];
        const numericMatch = candidates.find(isNumeric);
        if (numericMatch !== undefined) return String(numericMatch);
      } catch {}
    }
    const directKeys = ['userId', 'user_id', 'uid', 'sid', 'numericUserId'];
    for (const key of directKeys) {
      const val = localStorage.getItem(key);
      if (isNumeric(val)) return String(val);
    }
  } catch (err) {}
  return '';
}

// --- HELPER: Safe JSON Fetcher ---
async function safeFetchJson(url: string, options?: RequestInit) {
  try {
    const res = await fetch(url, options);
    const text = await res.text();
    if (!text || text.trim().startsWith('<')) {
      return null;
    }
    return JSON.parse(text);
  } catch (err) {
    return null;
  }
}

// 🔥 PREMIUM 3D AI AVATARS (Local Paths) 🔥
const AVATAR_LIBRARY = [
  '/avatars/1.png',
  '/avatars/2.png',
  '/avatars/3.png',
  '/avatars/4.png',
  '/avatars/5.png',
  '/avatars/6.png',
  '/avatars/7.png',
  '/avatars/8.png',
  '/avatars/9.png',
  '/avatars/10.png',
  '/avatars/11.png',
  '/avatars/12.png'
];

function CountUp({ value, prefix = '', suffix = '', decimals = 0 }: { value: number; prefix?: string; suffix?: string; decimals?: number }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let frame: number;
    const start = performance.now();
    const duration = 900;
    const from = 0;
    const tick = (t: number) => {
      const progress = Math.min((t - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplay(from + (value - from) * eased);
      if (progress < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [value]);
  return <>{prefix}{display.toFixed(decimals)}{suffix}</>;
}

// --- PAGINATION COMPONENT ---
const Pagination = ({ current, total, onPageChange }: { current: number, total: number, onPageChange: (p: number) => void }) => {
  if (total <= 1) return null;
  return (
    <div className="flex justify-center items-center gap-4 py-4 border-t border-white/[0.06] bg-[#120F1A]">
      <button 
        disabled={current === 1}
        onClick={() => onPageChange(current - 1)}
        className="w-8 h-8 rounded-lg bg-[#1A1C24] border border-white/5 flex items-center justify-center text-white disabled:opacity-30 hover:bg-white/10 transition-all cursor-pointer"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      <span className="text-[#8F95A3] font-medium text-xs">
        Page <span className="text-white font-bold">{current}</span> of {total}
      </span>
      <button 
        disabled={current === total}
        onClick={() => onPageChange(current + 1)}
        className="w-8 h-8 rounded-lg bg-[#1A1C24] border border-white/5 flex items-center justify-center text-white disabled:opacity-30 hover:bg-white/10 transition-all cursor-pointer"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
};

// --- KYC SUBMISSION MODAL ---
function KycModal({ isOpen, onClose, onSuccess }: { isOpen: boolean; onClose: () => void; onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dob: '',
    documentNumber: '',
    documentType: '',
    customDocumentType: '',
  });
  const [frontImage, setFrontImage] = useState<File | null>(null);
  const [backImage, setBackImage] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileDevice, setIsMobileDevice] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const ua = navigator.userAgent;
      const isMobile = /Mobi|Android|iPhone|iPad|iPod/i.test(ua);
      setIsMobileDevice(isMobile);
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');

    if (!frontImage) {
      setMessage('Front Image is required. Please capture or upload it.');
      setSubmitting(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const data = new FormData();
      data.append('firstName', formData.firstName);
      data.append('lastName', formData.lastName);
      data.append('dob', formData.dob);
      data.append('documentNumber', formData.documentNumber);
      
      const finalDocType = formData.documentType === 'Others' ? formData.customDocumentType : formData.documentType;
      data.append('documentType', finalDocType);

      data.append('documentFrontImage', frontImage);
      if (backImage) {
        data.append('documentBackImage', backImage);
      }

      const json = await safeFetchJson('https://apitest.binnycash.com/api/user/kyc/submit', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: data
      });

      if (json && (json.responseCode === 0 || json.code === 200)) {
        setMessage('KYC Submitted Successfully!');
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1500);
      } else {
        setMessage(json?.responseMessage || 'Submission failed. Try again.');
      }
    } catch (err) {
      console.error('KYC error:', err);
      setMessage('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center bg-[#070913]/85 backdrop-blur-md p-3 sm:p-6 overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: -20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -20 }}
        className="relative w-full max-w-[760px] bg-[#0E111E] border border-[#8B5CF6]/30 rounded-[32px] p-6 sm:p-8 text-white shadow-[0_25px_60px_rgba(139,92,246,0.25)] my-6 max-h-[92vh] overflow-y-auto custom-scrollbar"
      >
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ boxShadow: ['0 0 20px rgba(139,92,246,0.3)', '0 0 32px rgba(139,92,246,0.55)', '0 0 20px rgba(139,92,246,0.3)'] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
              className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#8B5CF6]/20 to-[#6366F1]/10 border border-[#8B5CF6]/40 flex items-center justify-center"
            >
              <ShieldCheck className="w-6 h-6 text-[#A78BFA]" />
            </motion.div>
            <div>
              <h2 className="text-2xl font-black tracking-tight text-white">Identity <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#A78BFA] to-[#EC4899]">Verification</span></h2>
              <p className="text-xs text-[#8F95A3] font-medium mt-0.5">Verify your identity to ensure secure withdrawals</p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white/70 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-white/80 mb-1.5">First Name <span className="text-[#EC4899]">*</span></label>
              <div className="relative flex items-center">
                <User className="absolute left-3.5 w-4 h-4 text-[#8B5CF6]" />
                <input 
                  type="text" 
                  required
                  placeholder="Enter your first name"
                  className="w-full bg-[#15192C] border border-white/10 rounded-2xl pl-11 pr-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#8B5CF6] focus:ring-2 focus:ring-[#8B5CF6]/20 transition-all"
                  onChange={(e) => setFormData({...formData, firstName: e.target.value})}
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-white/80 mb-1.5">Last Name <span className="text-[#EC4899]">*</span></label>
              <div className="relative flex items-center">
                <User className="absolute left-3.5 w-4 h-4 text-[#8B5CF6]" />
                <input 
                  type="text" 
                  required
                  placeholder="Enter your last name"
                  className="w-full bg-[#15192C] border border-white/10 rounded-2xl pl-11 pr-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#8B5CF6] focus:ring-2 focus:ring-[#8B5CF6]/20 transition-all"
                  onChange={(e) => setFormData({...formData, lastName: e.target.value})}
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-white/80 mb-1.5">Date of Birth <span className="text-[#EC4899]">*</span></label>
              <div className="relative flex items-center">
                <Calendar className="absolute left-3.5 w-4 h-4 text-[#8B5CF6]" />
                <input 
                  type="date" 
                  required
                  className="w-full bg-[#15192C] border border-white/10 rounded-2xl pl-11 pr-4 py-3 text-sm text-white focus:outline-none focus:border-[#8B5CF6] focus:ring-2 focus:ring-[#8B5CF6]/20 transition-all [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert"
                  onChange={(e) => setFormData({...formData, dob: e.target.value})}
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-white/80 mb-1.5">Document Number <span className="text-[#EC4899]">*</span></label>
              <div className="relative flex items-center">
                <CreditCard className="absolute left-3.5 w-4 h-4 text-[#8B5CF6]" />
                <input 
                  type="text" 
                  required
                  placeholder="Enter document number"
                  className="w-full bg-[#15192C] border border-white/10 rounded-2xl pl-11 pr-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#8B5CF6] focus:ring-2 focus:ring-[#8B5CF6]/20 transition-all"
                  onChange={(e) => setFormData({...formData, documentNumber: e.target.value})}
                />
              </div>
            </div>
          </div>

          <div className="relative" ref={dropdownRef}>
            <label className="block text-xs font-bold text-white/80 mb-1.5">Document Type <span className="text-[#EC4899]">*</span></label>
            <div 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full bg-[#15192C] border border-white/10 rounded-2xl px-4 py-3 text-sm text-white flex justify-between items-center cursor-pointer hover:border-[#8B5CF6]/50 transition-all"
            >
              <span className={formData.documentType ? 'text-white' : 'text-white/40'}>
                {formData.documentType || 'e.g. National ID, Passport'}
              </span>
              <ChevronDown className={`w-4 h-4 text-white/50 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </div>

            {isDropdownOpen && (
              <div className="absolute top-full left-0 w-full mt-2 bg-[#15192C] border border-[#8B5CF6]/30 rounded-2xl overflow-hidden shadow-2xl z-50 py-1">
                {['National ID', 'Aadhaar Card', 'Voter ID', 'Passport', 'Others'].map((type) => (
                  <div
                    key={type}
                    onClick={() => {
                      setFormData({...formData, documentType: type});
                      setIsDropdownOpen(false);
                    }}
                    className="px-4 py-3 text-sm text-white hover:bg-[#8B5CF6]/20 cursor-pointer transition-colors"
                  >
                    {type}
                  </div>
                ))}
              </div>
            )}
          </div>

          {formData.documentType === 'Others' && (
            <div>
              <label className="block text-xs font-bold text-white/80 mb-1.5">Specify Document Type <span className="text-[#EC4899]">*</span></label>
              <input 
                type="text" 
                required
                placeholder="Enter custom document name"
                className="w-full bg-[#15192C] border border-white/10 rounded-2xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#8B5CF6] transition-all"
                onChange={(e) => setFormData({...formData, customDocumentType: e.target.value})}
              />
            </div>
          )}

          <div className="w-full rounded-2xl overflow-hidden border border-white/10 bg-white/5 mt-4 mb-2">
            <img 
              src="/kyc.png" 
              alt="KYC Instructions" 
              className="w-full h-auto object-contain"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <div className={`border-2 border-dashed ${frontImage ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-[#8B5CF6]/30 bg-[#15192C]/50'} rounded-2xl p-5 flex flex-col items-center justify-center text-center transition-all`}>
              <div className="flex gap-4 mb-3">
                {isMobileDevice && (
                  <label className="flex flex-col items-center cursor-pointer group">
                    <input 
                      type="file" 
                      accept=".png,.jpg,.jpeg,.webp" 
                      capture="environment"
                      className="hidden" 
                      onChange={(e) => setFrontImage(e.target.files ? e.target.files[0] : null)} 
                    />
                    <div className="w-12 h-12 rounded-2xl bg-[#8B5CF6]/10 border border-[#8B5CF6]/30 flex items-center justify-center group-hover:scale-110 group-hover:bg-[#8B5CF6]/20 transition-all shadow-sm">
                      <Camera className="w-5 h-5 text-[#A78BFA]" />
                    </div>
                    <span className="text-[10px] text-[#8F95A3] mt-1.5 font-medium group-hover:text-white transition-colors">Take Photo</span>
                  </label>
                )}
                <label className="flex flex-col items-center cursor-pointer group">
                  <input 
                    type="file" 
                    accept=".png,.jpg,.jpeg,.webp" 
                    className="hidden" 
                    onChange={(e) => setFrontImage(e.target.files ? e.target.files[0] : null)} 
                  />
                  <div className="w-12 h-12 rounded-2xl bg-[#8B5CF6]/10 border border-[#8B5CF6]/30 flex items-center justify-center group-hover:scale-110 group-hover:bg-[#8B5CF6]/20 transition-all shadow-sm">
                    <UploadCloud className="w-5 h-5 text-[#A78BFA]" />
                  </div>
                  <span className="text-[10px] text-[#8F95A3] mt-1.5 font-medium group-hover:text-white transition-colors">Upload File</span>
                </label>
              </div>
              <p className="text-sm font-bold text-white mb-0.5">Front Image <span className="text-[#EC4899]">*</span></p>
              {frontImage && (
                <span className="mt-2 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20 truncate max-w-full">
                  ✓ {frontImage.name}
                </span>
              )}
            </div>

            <div className={`border-2 border-dashed ${backImage ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-white/20 bg-[#15192C]/30'} rounded-2xl p-5 flex flex-col items-center justify-center text-center transition-all`}>
              <div className="flex gap-4 mb-3">
                {isMobileDevice && (
                  <label className="flex flex-col items-center cursor-pointer group">
                    <input 
                      type="file" 
                      accept=".png,.jpg,.jpeg,.webp" 
                      capture="environment"
                      className="hidden" 
                      onChange={(e) => setBackImage(e.target.files ? e.target.files[0] : null)} 
                    />
                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:scale-110 group-hover:bg-white/10 transition-all shadow-sm">
                      <Camera className="w-5 h-5 text-white/50 group-hover:text-white" />
                    </div>
                    <span className="text-[10px] text-[#8F95A3] mt-1.5 font-medium group-hover:text-white transition-colors">Take Photo</span>
                  </label>
                )}
                <label className="flex flex-col items-center cursor-pointer group">
                  <input 
                    type="file" 
                    accept=".png,.jpg,.jpeg,.webp" 
                    className="hidden" 
                    onChange={(e) => setBackImage(e.target.files ? e.target.files[0] : null)} 
                  />
                  <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:scale-110 group-hover:bg-white/10 transition-all shadow-sm">
                    <UploadCloud className="w-5 h-5 text-white/50 group-hover:text-white" />
                  </div>
                  <span className="text-[10px] text-[#8F95A3] mt-1.5 font-medium group-hover:text-white transition-colors">Upload File</span>
                </label>
              </div>
              <p className="text-sm font-bold text-white mb-0.5">Back Image <span className="text-white/40 font-normal text-xs">(Optional)</span></p>
              {backImage && (
                <span className="mt-2 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20 truncate max-w-full">
                  ✓ {backImage.name}
                </span>
              )}
            </div>

          </div>

          <div className="flex justify-center -mt-2">
            <span className="inline-block text-[#8F95A3] text-[10px] font-medium tracking-wide">
              Accepted formats: .png, .jpg, .jpeg, .webp (Max 10MB each)
            </span>
          </div>

          {message && (
            <p className={`text-xs font-bold text-center py-1 ${message.includes('Successfully') ? 'text-emerald-400' : 'text-amber-400'}`}>
              {message}
            </p>
          )}

          <div className="grid grid-cols-2 gap-4 pt-3">
            <button 
              type="button"
              onClick={onClose}
              className="py-3.5 rounded-2xl bg-[#15192C] hover:bg-[#1E233B] border border-white/10 text-white font-bold text-sm transition-all cursor-pointer shadow-md"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={submitting}
              className="group py-3.5 rounded-2xl bg-gradient-to-r from-[#7C3AED] via-[#8B5CF6] to-[#EC4899] hover:opacity-95 text-white font-bold text-sm transition-all shadow-[0_4px_25px_rgba(139,92,246,0.4)] hover:shadow-[0_4px_30px_rgba(139,92,246,0.6)] cursor-pointer flex items-center justify-center gap-2 relative overflow-hidden"
            >
              <div className="shine-hover" />
              {submitting ? (
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}>
                  <ShieldCheck className="w-4 h-4" />
                </motion.div>
              ) : (
                <ShieldCheck className="w-4 h-4" />
              )}
              {submitting ? 'Verifying...' : 'Submit for Verification'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export default function ProfilePage() {
  const router = useRouter();
  
  const currency = useCurrency();
  const isCoin = currency === 'Coin' || currency === 'COIN';

  const [userData, setUserData] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const [imgError, setImgError] = useState(false);

  // --- SINGLE TAB STATE FOR 4 TABS ---
  const [activeTableTab, setActiveTableTab] = useState<'offers' | 'surveys' | 'rewards' | 'reversals'>('offers');

  // Pagination & Table Data State
  const [tablePage, setTablePage] = useState(1);
  const [tableTotalPages, setTableTotalPages] = useState(1);
  const [offersData, setOffersData] = useState<any[]>([]);
  const [surveysData, setSurveysData] = useState<any[]>([]);
  const [rewardsData, setRewardsData] = useState<any[]>([]);
  const [reversalsData, setReversalsData] = useState<any[]>([]); 
  const [isTableLoading, setIsTableLoading] = useState(false);

  // Modals State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [isKycOpen, setIsKycOpen] = useState(false);
  const [avatarMode, setAvatarMode] = useState<'library' | 'upload'>('library');

  // Form State for Edit Profile
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    city: '',
    address: '',
    mobileNumber: '',
    zipCode: '',
  });
  
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

  const fetchProfileData = async () => {
    setIsLoading(true);
    setImgError(false);
    const token = localStorage.getItem('token') || '';
    const userId = getUserId();

    try {
      const json = await safeFetchJson(`https://apitest.binnycash.com/api/user/userDetails?userId=${userId}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (json && (json.code === 200 || json.responseCode === 0)) {
        const user = json?.data?.user || json?.data || json;
        setUserData(user);

        setFormData(prev => ({
          firstName: user?.firstName || prev.firstName || '',
          lastName: user?.lastName || prev.lastName || '',
          email: user?.email || prev.email || '',
          city: user?.city || prev.city || '',
          address: user?.address || prev.address || '',
          mobileNumber: user?.mobileNumber || user?.phone || prev.mobileNumber || '',
          zipCode: user?.zipCode || prev.zipCode || '',
        }));
      }

      const statsJson = await safeFetchJson('https://apitest.binnycash.com/api/user/wallet/view', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (statsJson) {
        setStats(statsJson?.data);
      }

    } catch (err) {
      console.error("Failed to load profile", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Reset page when tab changes
  useEffect(() => {
    setTablePage(1);
    setTableTotalPages(1);
  }, [activeTableTab]);

  useEffect(() => {
    const fetchTableData = async () => {
      const token = localStorage.getItem('token') || '';
      const userId = getUserId();
      if (!userId || !token) return;

      setIsTableLoading(true);
      try {
        if (activeTableTab === 'offers') {
          const json = await safeFetchJson(`https://apitest.binnycash.com/api/user/user_completed_offer?userId=${userId}&page=${tablePage}&limit=10`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (json && json.code === 200) {
            setOffersData(json?.data?.data?.completedOffers || json?.data?.completedOffers || []);
            setTableTotalPages(json?.data?.data?.pagination?.totalPages || json?.data?.pagination?.totalPages || 1);
          } else {
            setOffersData([]);
            setTableTotalPages(1);
          }
        }
        else if (activeTableTab === 'surveys') {
          const json = await safeFetchJson(`https://apitest.binnycash.com/api/user/user_completed_survey_api?userId=${userId}&page=${tablePage}&limit=10`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (json && json.code === 200) {
            setSurveysData(json?.data?.data?.completedSurveys || json?.data?.completedSurveys || []);
            setTableTotalPages(json?.data?.data?.pagination?.totalPages || json?.data?.pagination?.totalPages || 1);
          } else {
            setSurveysData([]);
            setTableTotalPages(1);
          }
        }
        else if (activeTableTab === 'rewards') {
          const json = await safeFetchJson(`https://apitest.binnycash.com/api/user/user_earn_reward?userId=${userId}&page=${tablePage}&limit=10`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          // Handling 500 error gracefully by checking code
          if (json && json.code === 200 && json.type === 'success') {
            setRewardsData(json?.data?.data?.userReward || json?.data?.userReward || json?.data?.list || []);
            setTableTotalPages(json?.data?.data?.pagination?.totalPages || json?.data?.pagination?.totalPages || 1);
          } else {
            setRewardsData([]);
            setTableTotalPages(1);
          }
        }
        else if (activeTableTab === 'reversals') {
          const json = await safeFetchJson(`https://apitest.binnycash.com/api/user/userReversalsApi?userId=${userId}&page=${tablePage}&limit=10`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (json && json.code === 200) {
            setReversalsData(json?.data?.data?.reversals || json?.data?.reversals || []);
            setTableTotalPages(json?.data?.data?.pagination?.totalPages || json?.data?.pagination?.totalPages || 1);
          } else {
            setReversalsData([]);
            setTableTotalPages(1);
          }
        }
      } catch (error) {
        console.error("Failed to fetch table data:", error);
      } finally {
        setIsTableLoading(false);
      }
    };

    fetchTableData();
  }, [activeTableTab, tablePage]);

  useEffect(() => {
    if (!localStorage.getItem('token')) {
      router.push('/');
      return;
    }
    fetchProfileData();
  }, [router]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);
    const token = localStorage.getItem('token') || '';
    const userId = getUserId();

    try {
      const payload = new URLSearchParams();
      payload.append('firstName', formData.firstName);
      payload.append('lastName', formData.lastName);
      payload.append('email', formData.email);
      payload.append('city', formData.city);
      payload.append('address', formData.address);
      payload.append('mobileNumber', formData.mobileNumber);
      payload.append('zipCode', formData.zipCode);

      const json = await safeFetchJson(`https://apitest.binnycash.com/api/user/editProfile?userId=${userId}`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/x-www-form-urlencoded' 
        },
        body: payload
      });

      if (json && (json.code === 200 || json.responseCode === 0)) {
        setMessage({ text: 'Profile updated successfully!', type: 'success' });
        setUserData((prev: any) => ({
          ...prev,
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          city: formData.city,
          address: formData.address,
          mobileNumber: formData.mobileNumber,
          zipCode: formData.zipCode,
        }));
        fetchProfileData(); 
      } else {
        setMessage({ text: json?.message || 'Failed to update profile', type: 'error' });
      }
    } catch (err) {
      setMessage({ text: 'Network error or server down', type: 'error' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageUpload = async (file: File | string) => {
    setIsAvatarModalOpen(false); 
    setMessage(null);
    const token = localStorage.getItem('token') || '';
    const userId = getUserId();

    try {
      const data = new FormData();

      if (typeof file === 'string') {
        const resObj = await fetch(file);
        const blob = await resObj.blob();
        data.append('image', new File([blob], 'avatar.png', { type: 'image/png' }));
      } else {
        data.append('image', file);
      }

      const res = await fetch(`https://apitest.binnycash.com/api/user/uploadImage?userId=${userId}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
        body: data
      });

      const text = await res.text();
      let json: any = {};
      if (text && !text.trim().startsWith('<')) {
        try { json = JSON.parse(text); } catch (e) {}
      }

      if (res.ok && (json.code === 200 || json.responseCode === 0)) {
        setMessage({ text: 'Avatar updated successfully!', type: 'success' });
        
        if (json.data && json.data.imageUrl) {
            const localRaw = localStorage.getItem('loginResponse') || localStorage.getItem('userDetails');
            if(localRaw){
                try {
                   const parsed = JSON.parse(localRaw);
                   if(parsed.data && parsed.data.userDetails) {
                       parsed.data.userDetails.image = json.data.imageUrl;
                   } else if(parsed.image !== undefined) {
                       parsed.image = json.data.imageUrl;
                   }
                   localStorage.setItem(localStorage.getItem('loginResponse') ? 'loginResponse' : 'userDetails', JSON.stringify(parsed));
                } catch(e){}
            }
        }
        
        fetchProfileData();
        window.dispatchEvent(new CustomEvent('profileUpdated'));
        
      } else {
        setMessage({ text: json.message || 'Failed to upload image. Backend error.', type: 'error' });
      }
    } catch (err: any) {
      console.error("Upload error:", err);
      setMessage({ text: `Upload blocked: ${err.message}. Please check API network CORS.`, type: 'error' });
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const resolveImage = (imgSrc: string | null | undefined) => {
    if (!imgSrc || imgSrc.trim() === '') return null;
    if (imgSrc.startsWith('http')) return imgSrc;
    return imgSrc.startsWith('/') ? `https://apitest.binnycash.com${imgSrc}` : `https://apitest.binnycash.com/${imgSrc}`;
  };

  const name = [userData?.firstName, userData?.lastName].filter(Boolean).join(' ') || userData?.userName || 'User';
  const fullNameDisplay = [userData?.firstName, userData?.lastName].filter(Boolean).join(' ') || userData?.userName || 'Not provided';
  const phoneDisplay = userData?.mobileCode ? `${userData.mobileCode} ${userData.mobileNumber}` : (userData?.mobileNumber || userData?.phone || 'Not provided');
  const cityZipDisplay = [userData?.city, userData?.zipCode].filter(Boolean).join(' - ') || 'Not provided';
  const addressDisplay = userData?.address || 'Not provided';

  const rawProfilePic = userData?.image || userData?.profilePic;
  const displayImage = resolveImage(rawProfilePic);

  const joinDate = userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recently';
  const kycStatus = userData?.documentStatus || userData?.documents?.status || userData?.kycStatus || 'Unverified';

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const isBasicDetailsFilled = Boolean(
    userData?.firstName && 
    userData?.lastName && 
    userData?.email && 
    userData?.mobileNumber && 
    userData?.city && 
    userData?.address && 
    userData?.zipCode
  );

  const kycS = String(kycStatus).toUpperCase();
  const isKycVerified = kycS === 'VERIFIED' || kycS === 'APPROVED';
  const isKycSubmitted = kycS === 'PENDING' || kycS === 'PROCESSING' || kycS === 'IN PROGRESS';

  let kycProgressPercent = 0;
  if (isBasicDetailsFilled) kycProgressPercent += 34; 
  if (isKycVerified) kycProgressPercent += 66; 
  else if (isKycSubmitted) kycProgressPercent += 33; 

  const getKycSteps = () => {
    const step1 = isBasicDetailsFilled
      ? { label: 'Basic Details', status: 'Completed', color: 'text-[#00E57A]', iconColor: 'bg-[#00E57A]/10 text-[#00E57A]', icon: CheckCircle2 }
      : { label: 'Basic Details', status: 'Pending', color: 'text-[#8F95A3]', iconColor: 'bg-white/5 text-[#8F95A3]', icon: ShieldAlert };

    let step2, step3;
    if (isKycVerified) {
      step2 = { label: 'Identity Verification', status: 'Completed', color: 'text-[#00E57A]', iconColor: 'bg-[#00E57A]/10 text-[#00E57A]', icon: CheckCircle2 };
      step3 = { label: 'Address Verification', status: 'Completed', color: 'text-[#00E57A]', iconColor: 'bg-[#00E57A]/10 text-[#00E57A]', icon: CheckCircle2 };
    } else if (isKycSubmitted) {
      step2 = { label: 'Identity Verification', status: 'In Progress', color: 'text-[#FFC94A]', iconColor: 'bg-[#FFC94A]/10 text-[#FFC94A]', icon: Clock };
      step3 = { label: 'Address Verification', status: 'In Progress', color: 'text-[#FFC94A]', iconColor: 'bg-[#FFC94A]/10 text-[#FFC94A]', icon: Clock };
    } else {
      step2 = { label: 'Identity Verification', status: 'Pending', color: 'text-[#8F95A3]', iconColor: 'bg-white/5 text-[#8F95A3]', icon: ShieldAlert };
      step3 = { label: 'Address Verification', status: 'Pending', color: 'text-[#8F95A3]', iconColor: 'bg-white/5 text-[#8F95A3]', icon: ShieldAlert };
    }

    return [step1, step2, step3];
  };

  const kycSteps = getKycSteps();

  const getKycButtonProps = () => {
    if (isKycVerified) {
      return {
        text: 'Verified',
        disabled: true,
        className: 'px-4 py-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-bold text-xs flex items-center justify-center gap-2 cursor-not-allowed shadow-inner'
      };
    }
    if (isKycSubmitted) {
      return {
        text: 'Verification Pending',
        disabled: true,
        className: 'px-4 py-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 font-bold text-xs flex items-center justify-center gap-2 cursor-not-allowed shadow-inner'
      };
    }
    if (kycS === 'REJECTED') {
      return {
        text: 'Rejected - Re-verify',
        disabled: false,
        className: 'px-4 py-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-400 font-bold text-xs transition-all cursor-pointer shadow-md'
      };
    }
    return {
      text: 'Verify Now',
      disabled: false,
      className: 'px-4 py-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-bold text-xs transition-all shadow-[0_4px_15px_rgba(139,92,246,0.3)] hover:shadow-[0_4px_20px_rgba(139,92,246,0.5)] cursor-pointer'
    };
  };

  const btnProps = getKycButtonProps();

  return (
    <div className="min-h-screen bg-[#08070D] text-[#F5F3FF] selection:bg-[#A66CFF]/30 relative overflow-x-hidden">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@500;600;700&display=swap');
        .f-display { font-family: 'Space Grotesk', ui-sans-serif, sans-serif; }
        .f-mono { font-family: 'JetBrains Mono', ui-monospace, monospace; }
        .f-body { font-family: 'Inter', ui-sans-serif, sans-serif; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(166,108,255,0.35); border-radius: 10px; }
      `}</style>

      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 relative z-10 f-body">

        {message && (
           <div className={`mb-6 p-4 rounded-xl text-sm font-bold text-center border ${message.type === 'success' ? 'bg-[#3DE8A0]/10 text-[#3DE8A0] border-[#3DE8A0]/30' : 'bg-[#FF5D73]/10 text-[#FF5D73] border-[#FF5D73]/30'}`}>
             {message.text}
           </div>
        )}

        {/* HEADER */}
        <div className="flex justify-end items-center gap-4 mb-6">
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="flex items-center gap-2 bg-[#14121F] hover:bg-[#1A1725] border border-white/10 pl-4 pr-5 py-2.5 rounded-full text-sm font-bold transition-all hover:scale-105 shadow-lg cursor-pointer"
          >
            <span className="w-6 h-6 rounded-full bg-[#A66CFF]/15 flex items-center justify-center">
              <KeyRound className="w-3.5 h-3.5 text-[#A66CFF]" />
            </span>
            Settings
          </button>
        </div>

        {/* HERO BANNER */}
        <div className="relative w-full rounded-3xl overflow-hidden bg-gradient-to-br from-[#4c1d95] via-[#2e1065] to-[#0f061f] p-6 md:p-10 flex flex-col md:flex-row items-center justify-between shadow-2xl mb-8 border border-white/10">
          
          <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/3 w-[600px] h-[600px] pointer-events-none opacity-20 flex items-center justify-center">
             <div className="w-[300px] h-[300px] rounded-full border border-white absolute"></div>
             <div className="w-[450px] h-[450px] rounded-full border border-white absolute"></div>
             <div className="w-[600px] h-[600px] rounded-full border border-white absolute"></div>
          </div>

          <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 z-10 w-full">
             <div className="relative shrink-0">
               <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-[#8b5cf6] shadow-xl border-4 border-[#4c1d95] overflow-hidden flex items-center justify-center">
                 {displayImage && !imgError ? (
                    <img 
                      src={displayImage} 
                      alt="Profile" 
                      onError={() => setImgError(true)}
                      className="w-full h-full object-cover" 
                    />
                  ) : (
                    <span className="text-white text-5xl font-bold uppercase">{name.charAt(0)}</span>
                  )}
               </div>
               <button 
                  onClick={() => setIsAvatarModalOpen(true)}
                  className="absolute bottom-1 right-1 w-9 h-9 bg-black/40 backdrop-blur-md hover:bg-black/60 rounded-full border border-white/20 flex items-center justify-center transition-colors cursor-pointer"
               >
                 <Camera className="w-4 h-4 text-white" />
               </button>
             </div>
             
             <div className="flex flex-col text-center sm:text-left mt-4 sm:mt-6">
                <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">{name}</h1>
                <p className="text-white/70 text-sm font-medium">Joined {joinDate}</p>
                <p className="text-white/50 text-xs mt-1.5">Your earnings. Your milestones. Your future.</p>
             </div>
          </div>

          <div className="bg-[#120F1A]/40 backdrop-blur-md border border-white/10 rounded-2xl p-6 min-w-[280px] z-10 mt-8 md:mt-0 shadow-xl shrink-0">
              <p className="text-white/60 text-xs font-medium mb-2">Total Earnings</p>
              <h2 className="text-3xl font-black text-white f-mono mb-1">{formatPrice(Number(stats?.totalEarning || 0), currency)}</h2>
          </div>
        </div>

        {/* MAIN 2-COLUMN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-10">

           {/* KYC Verification Column */}
           <div className="lg:col-span-5 bg-[#120F1A] border border-white/[0.06] rounded-[24px] p-6 shadow-xl relative overflow-hidden flex flex-col h-fit">
              <div className="flex justify-between items-center mb-8">
                 <h3 className="text-base font-bold text-white">KYC Panel</h3>
                 
                 <button 
                  disabled={btnProps.disabled}
                  onClick={() => {
                    if (btnProps.disabled) return;
                    if (!isBasicDetailsFilled) {
                       setMessage({ text: 'Please fill out your Basic Details in Settings first.', type: 'error' });
                       setIsSettingsOpen(true);
                    } else {
                       setIsKycOpen(true);
                    }
                  }}
                  className={btnProps.className}
                 >
                   {btnProps.text}
                 </button>
              </div>

              <div className="flex flex-col gap-6 mb-6">
                {kycSteps.map((step, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${step.iconColor}`}>
                        <step.icon className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-white/90">{step.label}</span>
                        <span className={`text-xs font-medium mt-0.5 ${step.color}`}>{step.status}</span>
                      </div>
                    </div>
                    
                    {step.label === 'Basic Details' && step.status === 'Pending' && (
                      <button
                        onClick={() => setIsSettingsOpen(true)}
                        className="px-3 py-1.5 bg-[#A66CFF]/10 text-[#A66CFF] hover:bg-[#A66CFF]/20 border border-[#A66CFF]/20 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors cursor-pointer"
                      >
                        Fill Now
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="pt-4 mt-2 border-t border-white/5">
                <p className="text-xs text-white/60 font-medium mb-3">Your KYC is {kycProgressPercent}% complete</p>
                <div className="w-full h-2 bg-[#1A1725] rounded-full overflow-hidden flex items-center">
                   <motion.div 
                     initial={{ width: 0 }} 
                     animate={{ width: `${kycProgressPercent}%` }} 
                     transition={{ duration: 1 }}
                     className={`h-full rounded-full ${kycProgressPercent === 100 ? 'bg-[#00E57A]' : kycProgressPercent >= 66 ? 'bg-[#FFC94A]' : 'bg-[#A66CFF]'}`}
                   />
                </div>
                <div className="flex justify-end mt-2">
                  <span className="text-xs font-bold text-white">{kycProgressPercent}%</span>
                </div>
              </div>
           </div>

           {/* Account Overview Column */}
           <div className="lg:col-span-7 flex flex-col gap-6">
              
              <div className="bg-[#120F1A] border border-white/[0.06] rounded-[24px] p-6 shadow-xl">
                <h3 className="text-base font-bold text-white mb-6">Account Overview</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                   
                   <div className="bg-[#1A1725] border border-white/5 rounded-2xl p-5 flex items-center gap-4">
                     <div className="w-12 h-12 rounded-xl bg-[#A66CFF]/10 flex items-center justify-center border border-[#A66CFF]/20 shrink-0">
                       <Target className="w-6 h-6 text-[#A66CFF]" />
                     </div>
                     <div className="flex flex-col w-full">
                       <span className="text-xs text-[#8D89A8] font-medium mb-1">Total Offers</span>
                       <span className="text-xl font-bold text-white f-mono mb-1">
                         <CountUp value={Number(stats?.totalCompletedOffers || offersData.length || 0)} />
                       </span>
                       <span className="text-[10px] text-white/40">Completed</span>
                     </div>
                   </div>

                   <div className="bg-[#1A1725] border border-white/5 rounded-2xl p-5 flex items-center gap-4">
                     <div className="w-12 h-12 rounded-xl bg-[#00E57A]/10 flex items-center justify-center border border-[#00E57A]/20 shrink-0">
                       <Wallet className="w-6 h-6 text-[#00E57A]" />
                     </div>
                     <div className="flex flex-col w-full">
                       <span className="text-xs text-[#8D89A8] font-medium mb-1">Total Earnings</span>
                       <span className="text-xl font-bold text-white f-mono mb-1">{formatPrice(Number(stats?.totalEarning || 0), currency)}</span>
                       <span className="text-[10px] text-white/40">Lifetime</span>
                     </div>
                   </div>

                   <div className="bg-[#1A1725] border border-white/5 rounded-2xl p-5 flex items-center gap-4 sm:col-span-2">
                     <div className="w-12 h-12 rounded-xl bg-[#5EA8FF]/10 flex items-center justify-center border border-[#5EA8FF]/20 shrink-0">
                       <Users className="w-6 h-6 text-[#5EA8FF]" />
                     </div>
                     <div className="flex flex-col w-full">
                       <span className="text-xs text-[#8D89A8] font-medium mb-1">Referral Users</span>
                       <span className="text-xl font-bold text-white f-mono mb-1">
                         {userData?.referrals || userData?.referralCount || 0}
                       </span>
                       <span className="text-[10px] text-white/40">Lifetime</span>
                     </div>
                   </div>
                </div>
              </div>

              {/* Personal Details Card */}
              <div className="bg-[#120F1A] border border-white/[0.06] rounded-[24px] p-6 shadow-xl">
                 <h3 className="text-base font-bold text-white mb-4">Personal Details</h3>
                 <div className="bg-[#1A1725] border border-white/5 rounded-2xl p-5 grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-4">
                   <div className="flex flex-col">
                     <span className="text-xs text-[#8D89A8] mb-1">Full Name</span>
                     <span className="text-sm text-white font-medium">{fullNameDisplay}</span>
                   </div>
                   <div className="flex flex-col">
                     <span className="text-xs text-[#8D89A8] mb-1">Phone Number</span>
                     <span className="text-sm text-white font-medium">{phoneDisplay}</span>
                   </div>
                   <div className="flex flex-col">
                     <span className="text-xs text-[#8D89A8] mb-1">City / Zip</span>
                     <span className="text-sm text-white font-medium">{cityZipDisplay}</span>
                   </div>
                   <div className="flex flex-col">
                     <span className="text-xs text-[#8D89A8] mb-1">Full Address</span>
                     <span className="text-sm text-white font-medium truncate">{addressDisplay}</span>
                   </div>
                 </div>
              </div>

           </div>
        </div>

        {/* BOTTOM SINGLE TABS ROW & TABLE */}
        <div className="flex flex-col">
          
          <div className="flex items-center gap-2 mb-5 overflow-x-auto no-scrollbar">
            {(['offers', 'surveys', 'rewards', 'reversals'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTableTab(tab)}
                className={`relative z-10 px-5 py-2.5 text-[11px] uppercase tracking-wider font-bold rounded-full transition-colors cursor-pointer whitespace-nowrap ${activeTableTab === tab ? 'text-white' : 'text-[#8D89A8] bg-[#120F1A] border border-white/[0.06] hover:text-white'}`}
              >
                {activeTableTab === tab && (
                  <motion.div
                    layoutId="tableTabPill"
                    className="absolute inset-0 bg-gradient-to-r from-[#A66CFF] to-[#7C3AED] rounded-full -z-10 shadow-md shadow-[#A66CFF]/30"
                    transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                  />
                )}
                {tab}
              </button>
            ))}
          </div>

          <div className="w-full bg-[#120F1A] border border-white/[0.06] rounded-[24px] overflow-hidden">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                    {activeTableTab === 'reversals' ? (
                      <>
                        <th className="px-6 py-4 text-[10px] f-mono font-bold text-[#8D89A8] uppercase tracking-wider">Name</th>
                        <th className="px-6 py-4 text-[10px] f-mono font-bold text-[#8D89A8] uppercase tracking-wider">Amount reversed</th>
                        <th className="px-6 py-4 text-[10px] f-mono font-bold text-[#8D89A8] uppercase tracking-wider">Status</th>
                        <th className="px-6 py-4 text-[10px] f-mono font-bold text-[#8D89A8] uppercase tracking-wider">Partner</th>
                        <th className="px-6 py-4 text-[10px] f-mono font-bold text-[#8D89A8] uppercase tracking-wider">Date</th>
                      </>
                    ) : activeTableTab === 'rewards' ? (
                      <>
                        <th className="px-6 py-4 text-[10px] f-mono font-bold text-[#8D89A8] uppercase tracking-wider">Reward name</th>
                        <th className="px-6 py-4 text-[10px] f-mono font-bold text-[#8D89A8] uppercase tracking-wider">Amount</th>
                        <th className="px-6 py-4 text-[10px] f-mono font-bold text-[#8D89A8] uppercase tracking-wider">Type</th>
                        <th className="px-6 py-4 text-[10px] f-mono font-bold text-[#8D89A8] uppercase tracking-wider">Date</th>
                      </>
                    ) : (
                      <>
                        <th className="px-6 py-4 text-[10px] f-mono font-bold text-[#8D89A8] uppercase tracking-wider">Name</th>
                        <th className="px-6 py-4 text-[10px] f-mono font-bold text-[#8D89A8] uppercase tracking-wider">Reward</th>
                        <th className="px-6 py-4 text-[10px] f-mono font-bold text-[#8D89A8] uppercase tracking-wider">Status</th>
                        <th className="px-6 py-4 text-[10px] f-mono font-bold text-[#8D89A8] uppercase tracking-wider">Partner</th>
                        <th className="px-6 py-4 text-[10px] f-mono font-bold text-[#8D89A8] uppercase tracking-wider">Date</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {isTableLoading ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-16 text-center">
                        <div className="flex flex-col items-center justify-center gap-3">
                          <Loader2 className="w-8 h-8 text-[#A66CFF] animate-spin" />
                          <span className="text-sm font-medium text-[#8D89A8]">Loading data...</span>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    (() => {
                      let currentData: any[] = [];
                      if (activeTableTab === 'reversals') currentData = reversalsData;
                      else if (activeTableTab === 'offers') currentData = offersData;
                      else if (activeTableTab === 'surveys') currentData = surveysData;
                      else if (activeTableTab === 'rewards') currentData = rewardsData;

                      if (currentData.length === 0) {
                        return (
                          <tr>
                            <td colSpan={5} className="px-6 py-16 text-center">
                              <div className="flex flex-col items-center justify-center gap-2 opacity-60">
                                <AlertCircle className="w-8 h-8 text-[#8D89A8]" />
                                <span className="text-sm font-medium text-[#8D89A8]">
                                  No {activeTableTab === 'reversals' ? 'reversal' : 'completed'} data found.
                                </span>
                              </div>
                            </td>
                          </tr>
                        );
                      }

                      return currentData.map((item: any, idx: number) => {
                        if (activeTableTab === 'reversals') {
                          const finalImg = resolveImage(item.logo || item.offerImage || item.image_url || item.preview);
                          return (
                            <motion.tr
                              key={item._id || idx}
                              initial={{ opacity: 0, x: -8 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: Math.min(idx * 0.03, 0.4) }}
                              className="border-b border-white/[0.05] hover:bg-white/[0.03] transition-colors"
                            >
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  {finalImg ? (
                                    <img src={finalImg} alt="logo" className="w-8 h-8 rounded-lg object-cover bg-white/5" />
                                  ) : (
                                    <div className="w-8 h-8 rounded-lg bg-[#FF5D73]/20 flex items-center justify-center">
                                      <span className="text-xs font-bold text-[#FF5D73]">{(item.offer_name || item.name || 'R').charAt(0)}</span>
                                    </div>
                                  )}
                                  <span className="text-sm font-bold text-white truncate max-w-[200px]">{item.offer_name || item.name || 'Reversal Item'}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-sm f-mono font-bold text-[#FF5D73]">-{formatPrice(Number(item.userCredits || item.amount || 0), currency)}</td>
                              <td className="px-6 py-4">
                                <span className="px-2 py-1 rounded bg-[#FF5D73]/10 border border-[#FF5D73]/20 text-[#FF5D73] text-[10px] font-bold uppercase flex items-center gap-1 w-fit">
                                  <AlertCircle className="w-3 h-3" /> {item.status || 'REVERSED'}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm text-white/80">{item.partnerName || item.network || 'Partner'}</td>
                              <td className="px-6 py-4 text-sm f-mono text-[#8D89A8]">{formatDate(item.date || item.createdAt)}</td>
                            </motion.tr>
                          );
                        }

                        if (activeTableTab === 'rewards') {
                          return (
                            <motion.tr
                              key={item._id || idx}
                              initial={{ opacity: 0, x: -8 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: Math.min(idx * 0.03, 0.4) }}
                              className="border-b border-white/[0.05] hover:bg-white/[0.03] transition-colors"
                            >
                              <td className="px-6 py-4 text-sm font-bold text-white">{item.name || 'Reward'}</td>
                              <td className="px-6 py-4 text-sm f-mono font-bold text-[#3DE8A0]">+{formatPrice(Number(item.amount || item.Balance || 0), currency)}</td>
                              <td className="px-6 py-4">
                                <span className="px-2 py-1 rounded bg-[#5EA8FF]/10 border border-[#5EA8FF]/20 text-[#5EA8FF] text-[10px] font-bold uppercase">{item.type || 'CREDIT'}</span>
                              </td>
                              <td className="px-6 py-4 text-sm f-mono text-[#8D89A8]">{formatDate(item.Date || item.createdAt)}</td>
                            </motion.tr>
                          );
                        }

                        const finalImg = resolveImage(item.logo || item.offerImage || item.image_url || item.preview);
                        return (
                          <motion.tr
                            key={item._id || idx}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: Math.min(idx * 0.03, 0.4) }}
                            className="border-b border-white/[0.05] hover:bg-white/[0.03] transition-colors"
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center gap-3">
                                {finalImg ? (
                                  <img src={finalImg} alt="logo" className="w-8 h-8 rounded-lg object-cover bg-white/5" />
                                ) : (
                                  <div className="w-8 h-8 rounded-lg bg-[#A66CFF]/20 flex items-center justify-center">
                                    <span className="text-xs font-bold text-[#A66CFF]">{(item.offer_name || item.surveyName || 'O').charAt(0)}</span>
                                  </div>
                                )}
                                <span className="text-sm font-bold text-white truncate max-w-[200px]">{item.offer_name || item.surveyName || 'Item'}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 text-sm f-mono font-bold text-[#3DE8A0]">+{formatPrice(Number(item.userCredits || item.amount || 0), currency)}</td>
                            <td className="px-6 py-4">
                              <span className="px-2 py-1 rounded bg-[#3DE8A0]/10 border border-[#3DE8A0]/20 text-[#3DE8A0] text-[10px] font-bold uppercase flex items-center gap-1 w-fit">
                                <CheckCircle2 className="w-3 h-3" /> {item.status || 'COMPLETE'}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-sm text-white/80">{item.partnerName || item.network || 'Partner'}</td>
                            <td className="px-6 py-4 text-sm f-mono text-[#8D89A8]">{formatDate(item.date || item.createdAt)}</td>
                          </motion.tr>
                        );
                      });
                    })()
                  )}
                </tbody>
              </table>
            </div>

            {/* Render Pagination only if data exists and is not loading */}
            {!isTableLoading && (
              <Pagination 
                current={tablePage} 
                total={tableTotalPages} 
                onPageChange={setTablePage} 
              />
            )}
          </div>
        </div>
      </main>

      {/* --- SETTINGS MODAL REDESIGNED --- */}
      <AnimatePresence>
        {isSettingsOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#050409]/90 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ type: 'spring', stiffness: 320, damping: 30 }}
              className="relative w-full max-w-[700px] bg-[#0E111E] border border-white/10 text-white shadow-2xl rounded-3xl max-h-[90vh] overflow-y-auto custom-scrollbar"
            >
              {/* Cover Banner */}
              <div className="h-32 bg-gradient-to-r from-[#A66CFF]/30 to-[#FFC94A]/10 relative w-full overflow-hidden">
                 <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
                 <button
                    onClick={() => setIsSettingsOpen(false)}
                    className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 flex items-center justify-center text-white transition-all cursor-pointer z-10"
                  >
                    <X className="w-4 h-4" />
                 </button>
              </div>

              {/* Modal Body */}
              <div className="px-6 sm:px-10 pb-10 relative -mt-12">
                  
                  {/* Avatar & Header Info */}
                  <div className="flex items-end gap-5 mb-8">
                    <div className="relative shrink-0 z-10">
                      <div className="w-24 h-24 rounded-full border-4 border-[#0E111E] bg-[#1A1725] overflow-hidden">
                        {displayImage && !imgError ? (
                          <img 
                            src={displayImage} 
                            alt="Profile" 
                            onError={() => setImgError(true)}
                            className="w-full h-full object-cover" 
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-[#8B5CF6] to-[#7c3aed] flex items-center justify-center text-white text-3xl font-black uppercase">
                            {name.charAt(0)}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => { setIsSettingsOpen(false); setIsAvatarModalOpen(true); }}
                        className="absolute bottom-0 right-0 w-8 h-8 bg-[#A66CFF] hover:bg-[#8B5CF6] rounded-full border-2 border-[#0E111E] flex items-center justify-center cursor-pointer shadow-md transition-transform hover:scale-110"
                      >
                        <ImageIcon className="w-4 h-4 text-white" />
                      </button>
                    </div>

                    <div className="flex flex-col pb-1">
                      <h2 className="text-2xl font-bold text-white tracking-tight">{name}</h2>
                      <span className="text-sm text-[#8D89A8] font-medium mt-0.5">Joined {joinDate}</span>
                    </div>
                  </div>

                  {/* Read-only Account Info Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
                      <div className="bg-[#1A1725] border border-white/5 rounded-2xl p-4 flex justify-between items-center group hover:border-white/10 transition-all">
                         <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-[#A66CFF]/10 flex items-center justify-center shrink-0">
                               <ShieldAlert className="w-5 h-5 text-[#A66CFF]" />
                            </div>
                            <div className="flex flex-col">
                               <span className="text-[11px] text-[#8D89A8] font-medium uppercase tracking-wider">Account ID</span>
                            <span className="f-mono text-sm font-bold text-white mt-0.5">{getUserId() || userData?.id || userData?._id || 'N/A'}</span>
                            </div>
                         </div>
                         <button onClick={() => copyToClipboard(getUserId() || userData?.id || userData?._id || '')} className="text-[#8D89A8] hover:text-white cursor-pointer transition-colors p-2">
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="bg-[#1A1725] border border-white/5 rounded-2xl p-4 flex items-center gap-3 group hover:border-white/10 transition-all">
                         <div className="w-10 h-10 rounded-full bg-[#3DE8A0]/10 flex items-center justify-center shrink-0">
                            <Mail className="w-5 h-5 text-[#3DE8A0]" />
                         </div>
                         <div className="flex flex-col overflow-hidden">
                            <span className="text-[11px] text-[#8D89A8] font-medium uppercase tracking-wider flex items-center gap-1.5">
                              Registered Email <div className="w-1.5 h-1.5 rounded-full bg-[#3DE8A0]" />
                            </span>
                            <span className="f-mono text-sm font-bold text-white mt-0.5 truncate">{userData?.email || 'N/A'}</span>
                         </div>
                      </div>
                  </div>

                  <h3 className="text-lg font-bold text-white mb-5">Personal Details</h3>
                  <form onSubmit={handleUpdateProfile} className="flex flex-col gap-4">
                    
                    {/* PERFECT 2-COLUMN GRID (First Name, Last Name, Phone, City) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[
                        { key: 'firstName', label: 'First Name', type: 'text', icon: User, placeholder: 'Enter first name' },
                        { key: 'lastName', label: 'Last Name', type: 'text', icon: User, placeholder: 'Enter last name' },
                        { key: 'mobileNumber', label: 'Phone Number', type: 'tel', icon: Phone, placeholder: 'Enter mobile' },
                        { key: 'city', label: 'City', type: 'text', icon: MapPin, placeholder: 'Enter your city' },
                      ].map((f) => (
                        <div key={f.key} className="flex flex-col gap-1.5">
                           <label className="text-xs font-bold text-[#8D89A8] ml-1">{f.label}</label>
                           <div className="relative flex items-center">
                             <f.icon className="absolute left-3.5 w-4 h-4 text-[#8D89A8]" />
                             <input
                                type={f.type}
                                required
                                placeholder={f.placeholder}
                                value={(formData as any)[f.key] || ''}
                                onChange={e => setFormData({ ...formData, [f.key]: e.target.value })}
                                className="w-full bg-[#1A1725] border border-white/5 focus:border-[#A66CFF]/50 rounded-xl pl-10 pr-4 py-3 text-sm text-white font-medium focus:outline-none transition-colors"
                             />
                           </div>
                        </div>
                      ))}
                    </div>

                    {/* PERFECT 3-COLUMN GRID (Address spans 2 columns, Zip Code spans 1) */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2">
                       <div className="flex flex-col gap-1.5 sm:col-span-2">
                           <label className="text-xs font-bold text-[#8D89A8] ml-1">Full Address</label>
                           <div className="relative flex items-center">
                             <Home className="absolute left-3.5 w-4 h-4 text-[#8D89A8]" />
                             <input
                                type="text"
                                required
                                placeholder="Enter street address"
                                value={formData.address || ''}
                                onChange={e => setFormData({ ...formData, address: e.target.value })}
                                className="w-full bg-[#1A1725] border border-white/5 focus:border-[#A66CFF]/50 rounded-xl pl-10 pr-4 py-3 text-sm text-white font-medium focus:outline-none transition-colors"
                             />
                           </div>
                       </div>
                       <div className="flex flex-col gap-1.5">
                           <label className="text-xs font-bold text-[#8D89A8] ml-1">Zip Code</label>
                           <div className="relative flex items-center">
                             <Hash className="absolute left-3.5 w-4 h-4 text-[#8D89A8]" />
                             <input
                                type="text"
                                required
                                placeholder="Postal code"
                                value={formData.zipCode || ''}
                                onChange={e => setFormData({ ...formData, zipCode: e.target.value })}
                                className="w-full bg-[#1A1725] border border-white/5 focus:border-[#A66CFF]/50 rounded-xl pl-10 pr-4 py-3 text-sm text-white font-medium focus:outline-none transition-colors"
                             />
                           </div>
                       </div>
                    </div>

                    {message && (
                      <div className={`p-4 rounded-xl text-sm font-bold text-center mt-4 border ${message.type === 'success' ? 'bg-[#3DE8A0]/10 text-[#3DE8A0] border-[#3DE8A0]/20' : 'bg-[#FF5D73]/10 text-[#FF5D73] border-[#FF5D73]/20'}`}>
                        {message.text}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isSaving}
                      className="w-full py-4 mt-6 rounded-xl bg-gradient-to-r from-[#A66CFF] to-[#7C3AED] text-white font-bold text-sm shadow-[0_4px_20px_rgba(166,108,255,0.3)] hover:shadow-[0_4px_30px_rgba(166,108,255,0.5)] transition-shadow flex justify-center items-center gap-2 cursor-pointer"
                    >
                      {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                      {isSaving ? 'Saving Changes...' : 'Save Profile Changes'}
                    </button>
                  </form>
                  
                  <div className="mt-8 pt-4 border-t border-[#FF5D73]/20 text-center">
                    <button className="text-sm font-bold text-[#FF5D73] hover:text-[#FF5D73]/80 transition-colors cursor-pointer">
                      Delete account
                    </button>
                  </div>

              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- AVATAR MODAL --- */}
      <AnimatePresence>
        {isAvatarModalOpen && (
          <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#050409]/90 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: 'spring', stiffness: 320, damping: 30 }}
              className="relative w-full max-w-[560px] bg-[#120F1A] border border-white/10 rounded-3xl p-6 sm:p-8 text-white shadow-2xl overflow-hidden max-h-[85vh] flex flex-col"
            >
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#A66CFF] to-transparent" />
              <button
                onClick={() => setIsAvatarModalOpen(false)}
                className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white/70 hover:text-white transition-all cursor-pointer z-10"
              >
                <X className="w-4 h-4" />
              </button>

              <span className="f-mono text-[10px] font-bold tracking-[0.3em] text-[#A66CFF] uppercase">Identity access</span>
              <h2 className="f-display text-xl font-bold text-white mt-1 mb-1">Choose avatar</h2>
              <p className="text-[#8D89A8] text-sm mb-6">Pick a high-end 3D face from the vault, or upload your own.</p>

              <div className="relative inline-flex items-center bg-[#1A1725] border border-white/[0.06] rounded-full p-1 mb-6 w-full shrink-0">
                {([
                  { id: 'library', label: 'Choose avatar', icon: Coins },
                  { id: 'upload', label: 'Upload photo', icon: UploadCloud },
                ] as const).map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setAvatarMode(m.id as any)}
                    className={`relative z-10 flex-1 flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-bold rounded-full transition-colors cursor-pointer ${avatarMode === m.id ? 'text-white' : 'text-[#8D89A8] hover:text-white'}`}
                  >
                    {avatarMode === m.id && (
                      <motion.div
                        layoutId="avatarModePill"
                        className="absolute inset-0 bg-gradient-to-r from-[#A66CFF] to-[#7C3AED] rounded-full -z-10 shadow-md shadow-[#A66CFF]/30"
                        transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                      />
                    )}
                    <m.icon className="w-3.5 h-3.5" /> {m.label}
                  </button>
                ))}
              </div>

              <div className="overflow-y-auto custom-scrollbar flex-1 pr-1">
                <AnimatePresence mode="wait">
                  {avatarMode === 'library' ? (
                    <motion.div
                      key="library"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="grid grid-cols-4 gap-3">
                        {AVATAR_LIBRARY.map((url, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => handleImageUpload(url)}
                            className="relative aspect-square rounded-full bg-[#1A1725] border-2 border-white/[0.08] hover:border-[#A66CFF] hover:scale-105 flex items-center justify-center cursor-pointer transition-all overflow-hidden shadow-lg group"
                          >
                            <img src={url} alt={`Avatar ${idx}`} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                          </button>
                        ))}
                      </div>
                      <p className="text-[10px] text-[#8D89A8] text-center mt-4">Tap any 3D face to equip it instantly.</p>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="upload"
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -8 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="relative border-2 border-dashed border-[#A66CFF]/30 hover:border-[#A66CFF] bg-[#1A1725] rounded-[20px] p-8 flex flex-col items-center text-center cursor-pointer group transition-colors overflow-hidden">
                        <input
                          type="file"
                          accept="image/*"
                          className="absolute inset-0 opacity-0 cursor-pointer z-10"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              handleImageUpload(e.target.files[0]);
                            }
                          }}
                        />
                        <div className="w-14 h-14 rounded-full bg-[#A66CFF]/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform relative">
                          <ScanLine className="w-6 h-6 text-[#A66CFF]" />
                        </div>
                        <span className="text-white font-bold text-sm">Drop or select an image</span>
                        <span className="text-[#8D89A8] text-xs mt-1">JPEG, PNG up to 5MB</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <KycModal 
        isOpen={isKycOpen} 
        onClose={() => setIsKycOpen(false)} 
        onSuccess={() => {
          fetchProfileData();
        }} 
      />

    </div>
  );
}