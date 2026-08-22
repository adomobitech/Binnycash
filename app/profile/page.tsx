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
  Target, Users, ArrowUp, Shield, Lock, Sparkle
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

// --- EXACT CASHOUT STYLE KYC SUBMISSION MODAL ---
function KycModal({ isOpen, onClose, onSuccess }: { isOpen: boolean; onClose: () => void; onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    name: '',
    dob: '',
    documentNumber: '',
    documentType: '',
    customDocumentType: '',
  });
  const [frontImage, setFrontImage] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

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
      setMessage('Please upload document image.');
      setSubmitting(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const data = new FormData();
      data.append('name', formData.name);
      data.append('dob', formData.dob);
      data.append('documentNumber', formData.documentNumber);
      
      const finalDocType = formData.documentType === 'Others' ? formData.customDocumentType : formData.documentType;
      data.append('documentType', finalDocType);
      data.append('documentFrontImage', frontImage);

      const json = await safeFetchJson('https://api.binnycash.com/api/user/kyc/submit', {
        method: 'PUT',
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
        setMessage(json?.responseMessage || json?.message || 'Submission failed. Try again.');
      }
    } catch (err) {
      setMessage('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#07080C]/85 backdrop-blur-md p-4 overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 15 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 15 }}
        className="relative w-full max-w-[700px] bg-[#10131B] border border-white/10 rounded-[32px] p-6 sm:p-8 text-white shadow-[0_25px_60px_rgba(0,0,0,0.8)] my-auto max-h-[90vh] overflow-y-auto custom-scrollbar"
      >
        {/* Top Header */}
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#8B5CF6]/15 border border-[#8B5CF6]/30 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6 text-[#A78BFA]" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-tight">Identity Verification</h2>
              <p className="text-xs text-[#8F95A3] mt-0.5 font-medium">Secure your withdrawals by submitting your document</p>
            </div>
          </div>
          <button 
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-[#8F95A3] hover:text-white transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name Field */}
          <div>
            <label className="block text-[11px] font-bold text-[#8F95A3] mb-1.5 uppercase tracking-wider">FULL NAME <span className="text-[#EC4899]">*</span></label>
            <div className="relative flex items-center">
              <User className="absolute left-3.5 w-4 h-4 text-[#8B5CF6]" />
              <input 
                type="text" 
                required
                placeholder="Enter your full name"
                className="w-full bg-[#171B26] border border-white/10 rounded-2xl pl-11 pr-4 py-3 text-sm text-white placeholder:text-[#4A5063] focus:outline-none focus:border-[#8B5CF6] transition-all"
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
          </div>

          {/* Date of Birth & Document Number */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-[#8F95A3] mb-1.5 uppercase tracking-wider">DATE OF BIRTH <span className="text-[#EC4899]">*</span></label>
              <div className="relative flex items-center">
                <Calendar className="absolute left-3.5 w-4 h-4 text-[#8B5CF6]" />
                <input 
                  type="date" 
                  required
                  className="w-full bg-[#171B26] border border-white/10 rounded-2xl pl-11 pr-4 py-3 text-sm text-white focus:outline-none focus:border-[#8B5CF6] transition-all [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert"
                  onChange={(e) => setFormData({...formData, dob: e.target.value})}
                />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-[#8F95A3] mb-1.5 uppercase tracking-wider">DOCUMENT NUMBER <span className="text-[#EC4899]">*</span></label>
              <div className="relative flex items-center">
                <CreditCard className="absolute left-3.5 w-4 h-4 text-[#8B5CF6]" />
                <input 
                  type="text" 
                  required
                  placeholder="ID Number"
                  className="w-full bg-[#171B26] border border-white/10 rounded-2xl pl-11 pr-4 py-3 text-sm text-white placeholder:text-[#4A5063] focus:outline-none focus:border-[#8B5CF6] transition-all"
                  onChange={(e) => setFormData({...formData, documentNumber: e.target.value})}
                />
              </div>
            </div>
          </div>

          {/* Document Type Dropdown */}
          <div className="relative" ref={dropdownRef}>
            <label className="block text-[11px] font-bold text-[#8F95A3] mb-1.5 uppercase tracking-wider">DOCUMENT TYPE <span className="text-[#EC4899]">*</span></label>
            <div 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full bg-[#171B26] border border-white/10 rounded-2xl px-4 py-3 text-sm text-white flex justify-between items-center cursor-pointer hover:border-[#8B5CF6]/50 transition-all"
            >
              <span className={formData.documentType ? 'text-white' : 'text-[#4A5063]'}>
                {formData.documentType || 'Select your document type'}
              </span>
              <ChevronDown className={`w-4 h-4 text-[#8F95A3] transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </div>

            {isDropdownOpen && (
              <div className="absolute top-full left-0 w-full mt-2 bg-[#171B26] border border-[#8B5CF6]/30 rounded-2xl overflow-hidden shadow-2xl z-50 py-1">
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
              <label className="block text-[11px] font-bold text-[#8F95A3] mb-1.5 uppercase tracking-wider">Specify Document Type <span className="text-[#EC4899]">*</span></label>
              <input 
                type="text" 
                required
                placeholder="Enter custom document name"
                className="w-full bg-[#171B26] border border-white/10 rounded-2xl px-4 py-3 text-sm text-white placeholder:text-[#4A5063] focus:outline-none focus:border-[#8B5CF6] transition-all"
                onChange={(e) => setFormData({...formData, customDocumentType: e.target.value})}
              />
            </div>
          )}

          {/* INSTRUCTION & EXAMPLE IMAGE (/kyc.png) */}
          <div className="pt-2">
            <div className="flex items-center gap-2 mb-2 text-[#A78BFA] text-xs font-bold tracking-wide">
              <Sparkle className="w-3.5 h-3.5" /> INSTRUCTION & EXAMPLE
            </div>
            <div className="w-full rounded-2xl overflow-hidden border border-white/10 bg-[#171B26] p-2">
              <img 
                src="/kyc.png" 
                alt="KYC Instructions" 
                className="w-full h-auto object-contain rounded-xl"
              />
            </div>
            <p className="text-[11px] text-[#8F95A3] mt-2 italic">
              * Please upload your document image following these instructions clearly (write <span className="text-white font-bold">"BINNYCASH"</span> on a white paper next to your ID proof).
            </p>
          </div>

          {/* UPLOAD DOCUMENT IMAGE BOX */}
          <div>
            <label className="block text-[11px] font-bold text-[#8F95A3] mb-1.5 uppercase tracking-wider">UPLOAD DOCUMENT IMAGE <span className="text-[#EC4899]">*</span></label>
            <div className={`border-2 border-dashed ${frontImage ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-[#8B5CF6]/30 bg-[#171B26]'} rounded-2xl p-5 flex items-center justify-between transition-all relative group cursor-pointer`}>
              <input type="file" accept=".png,.jpg,.jpeg,.webp" className="absolute inset-0 opacity-0 cursor-pointer z-10" onChange={(e) => setFrontImage(e.target.files ? e.target.files[0] : null)} />
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-[#8B5CF6]/15 border border-[#8B5CF6]/30 flex items-center justify-center shrink-0">
                  <UploadCloud className="w-6 h-6 text-[#A78BFA]" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">Upload Image</h4>
                  <p className="text-xs text-[#8F95A3] mt-0.5">Clear, readable photo (.jpg, .png)</p>
                  {frontImage && <span className="mt-1 text-xs font-bold text-emerald-400 block">✓ {frontImage.name}</span>}
                </div>
              </div>
              <div className="px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-xs font-bold text-white group-hover:bg-white/10 transition-all">
                Browse
              </div>
            </div>
          </div>

          {/* Encryption Notice */}
          <div className="bg-[#00E57A]/10 border border-[#00E57A]/20 rounded-2xl p-3.5 flex items-center gap-3">
            <Lock className="w-4 h-4 text-[#00E57A] shrink-0" />
            <p className="text-xs text-[#00E57A] font-medium">
              Your data is encrypted with bank-grade security and strictly used for compliance.
            </p>
          </div>

          {message && (
            <p className={`text-xs font-bold text-center py-1 ${message.includes('Successfully') ? 'text-emerald-400' : 'text-amber-400'}`}>
              {message}
            </p>
          )}

          {/* Footer Buttons */}
          <div className="grid grid-cols-2 gap-4 pt-2">
            <button 
              type="button"
              onClick={onClose}
              className="py-4 rounded-2xl bg-[#171B26] hover:bg-[#202533] text-white font-bold text-sm transition-all cursor-pointer border border-white/5 shadow-md"
            >
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={submitting}
              className="py-4 rounded-2xl bg-gradient-to-r from-[#7C3AED] via-[#8B5CF6] to-[#EC4899] hover:opacity-95 text-white font-bold text-sm transition-all shadow-[0_4px_25px_rgba(139,92,246,0.4)] cursor-pointer flex items-center justify-center gap-2"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {submitting ? 'Submitting...' : 'Submit Identity'}
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

  const [userData, setUserData] = useState<any>(null);
  const [dashboardSummary, setDashboardSummary] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [imgError, setImgError] = useState(false);

  // --- TAB ORDER: offers, surveys, reversals, rewards ---
  const [activeTableTab, setActiveTableTab] = useState<'offers' | 'surveys' | 'reversals' | 'rewards'>('offers');

  // Pagination & Table Data State
  const [tablePage, setTablePage] = useState(1);
  const [tableTotalPages, setTableTotalPages] = useState(1);
  const [offersData, setOffersData] = useState<any[]>([]);
  const [surveysData, setSurveysData] = useState<any[]>([]);
  const [reversalsData, setReversalsData] = useState<any[]>([]); 
  const [rewardsData, setRewardsData] = useState<any[]>([]);
  const [isTableLoading, setIsTableLoading] = useState(false);

  // Modals State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAvatarModalOpen, setIsAvatarModalOpen] = useState(false);
  const [isKycOpen, setIsKycOpen] = useState(false);
  const [avatarMode, setAvatarMode] = useState<'library' | 'upload'>('library');

  // 🔥 DELETE ACCOUNT STATES 🔥
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Form State for Edit Profile
  const [formData, setFormData] = useState({
    name: '',
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
      const json = await safeFetchJson(`https://api.binnycash.com/api/user/userDetails?userId=${userId}&t=${Date.now()}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` },
        cache: 'no-store'
      });

      if (json && (json.code === 200 || json.responseCode === 0)) {
        const user = json?.data?.user || json?.data || json;
        setUserData(user);

        const fullName = user?.name || user?.fullName || [user?.firstName, user?.lastName].filter(Boolean).join(' ') || '';

        setFormData(prev => ({
          name: fullName || prev.name || '',
          email: user?.email || prev.email || '',
          city: user?.city || prev.city || '',
          address: user?.address || prev.address || '',
          mobileNumber: user?.mobileNumber || user?.phone || prev.mobileNumber || '',
          zipCode: user?.zipCode || prev.zipCode || '',
        }));
      }

      const summaryJson = await safeFetchJson(`https://api.binnycash.com/api/user/dashboardsummary?t=${Date.now()}`, {
        headers: { 'Authorization': `Bearer ${token}` },
        cache: 'no-store'
      });

      if (summaryJson && summaryJson.code === 200) {
        setDashboardSummary(summaryJson.data);
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
        if (activeTableTab === 'offers' || activeTableTab === 'surveys' || activeTableTab === 'reversals') {
          let typeParam = 'offer';
          if (activeTableTab === 'surveys') typeParam = 'survey';
          if (activeTableTab === 'reversals') typeParam = 'reversal';

          const json = await safeFetchJson(`https://api.binnycash.com/api/user/conversionData?type=${typeParam}&page=${tablePage}&limit=10`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });

          if (json && json.code === 200) {
            const responsePayload = json?.data?.data || json?.data || {};
            const listData = 
              responsePayload.completedOffers || 
              responsePayload.completedSurveys || 
              responsePayload.reversals || 
              responsePayload.list || 
              [];

            const totalP = responsePayload?.pagination?.totalPages || 1;

            if (activeTableTab === 'offers') setOffersData(Array.isArray(listData) ? listData : []);
            if (activeTableTab === 'surveys') setSurveysData(Array.isArray(listData) ? listData : []);
            if (activeTableTab === 'reversals') setReversalsData(Array.isArray(listData) ? listData : []);
            setTableTotalPages(totalP);
          } else {
            if (activeTableTab === 'offers') setOffersData([]);
            if (activeTableTab === 'surveys') setSurveysData([]);
            if (activeTableTab === 'reversals') setReversalsData([]);
            setTableTotalPages(1);
          }
        }
        else if (activeTableTab === 'rewards') {
          const json = await safeFetchJson(`https://api.binnycash.com/api/user/user_earn_reward?userId=${userId}&page=${tablePage}&limit=10`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (json && json.code === 200 && json.type === 'success') {
            setRewardsData(json?.data?.data?.userReward || json?.data?.userReward || json?.data?.list || []);
            setTableTotalPages(json?.data?.data?.pagination?.totalPages || json?.data?.pagination?.totalPages || 1);
          } else {
            setRewardsData([]);
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
      payload.append('name', formData.name);
      payload.append('email', formData.email);
      payload.append('city', formData.city);
      payload.append('address', formData.address);
      payload.append('mobileNumber', formData.mobileNumber);
      payload.append('zipCode', formData.zipCode);

      const json = await safeFetchJson(`https://api.binnycash.com/api/user/editProfile?userId=${userId}`, {
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
          name: formData.name,
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

      const res = await fetch(`https://api.binnycash.com/api/user/uploadImage?userId=${userId}`, {
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

  // 🔥 DELETE ACCOUNT API CALL 🔥
  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    setDeleteError(null);
    
    const token = localStorage.getItem('token') || '';

    if (!token) {
      setDeleteError("You're not logged in. Please log in again and retry.");
      setIsDeleting(false);
      return;
    }

    try {
      // 🔥 FIX: Swagger confirms this endpoint takes NO parameters — the user
      // is identified purely from the Bearer token. The old `?userId=` query
      // param isn't part of the API contract and was likely causing the
      // request to be rejected or silently ignored by the backend.
      const res = await fetch(`https://api.binnycash.com/api/user/deleteUser`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const json = await res.json();

      // 🔥 FIX: Backend returns HTTP 200 even for business-logic errors
      // (same pattern as login/signup/verifyOtp in AuthModal.tsx), so `res.ok`
      // alone can't be trusted as "success". Check the body's error signals too.
      const errCode = json?.code || json?.responseCode;
      const errMsg = json?.message || json?.responseMessage || '';
      const isError = !res.ok || errCode === 400 || errCode === 403 || errCode === 404 || json?.type === 'error';

      if (!isError) {
        // Successfully Deleted -> Logout User
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('userDetails');
        localStorage.removeItem('cached_balance');
        window.dispatchEvent(new Event('storage'));
        
        router.replace('/');
      } else {
        setDeleteError(errMsg || "Failed to delete account. Please contact support.");
      }
    } catch (err) {
      setDeleteError("Network error while deleting account.");
    } finally {
      setIsDeleting(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  const resolveImage = (imgSrc: string | null | undefined) => {
    if (!imgSrc || imgSrc.trim() === '') return null;
    if (imgSrc.startsWith('http')) return imgSrc;
    return imgSrc.startsWith('/') ? `https://api.binnycash.com${imgSrc}` : `https://api.binnycash.com/${imgSrc}`;
  };

  const name = userData?.name || userData?.fullName || [userData?.firstName, userData?.lastName].filter(Boolean).join(' ').trim() || userData?.userName || 'User';

  const rawProfilePic = userData?.image || userData?.profilePic;
  const displayImage = resolveImage(rawProfilePic);

  const joinDate = userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recently';
  
  const kycStatus = userData?.documentStatus || userData?.documents?.status || userData?.kycStatus || 'Not Submitted';

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

  const kycS = String(kycStatus).toUpperCase();
  const isKycVerified = kycS === 'VERIFIED' || kycS === 'APPROVED';
  const isKycSubmitted = kycS === 'PENDING' || kycS === 'PROCESSING' || kycS === 'IN PROGRESS';

  const getKycBadgeText = () => {
    if (isKycVerified) return 'APPROVED';
    if (isKycSubmitted) return 'UNDER REVIEW';
    if (kycS === 'REJECTED') return 'REJECTED';
    return 'NOT SUBMITTED';
  };

  const kycBadgeText = getKycBadgeText();

  const btnProps = (() => {
    if (isKycVerified) {
      return {
        text: 'Verified',
        disabled: true,
        className: 'w-full py-3.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-bold text-sm flex items-center justify-center gap-2 cursor-not-allowed shadow-inner'
      };
    }
    if (isKycSubmitted) {
      return {
        text: 'Under Review',
        disabled: true,
        className: 'w-full py-3.5 rounded-2xl bg-amber-500/20 border border-amber-500/40 text-amber-400 font-bold text-sm flex items-center justify-center gap-2 cursor-not-allowed shadow-inner'
      };
    }
    return {
      text: 'Verify Now',
      disabled: false,
      className: 'w-full py-3.5 rounded-2xl bg-gradient-to-r from-violet-600 via-[#8B5CF6] to-[#EC4899] hover:opacity-95 text-white font-bold text-sm transition-all shadow-[0_4px_25px_rgba(139,92,246,0.4)] hover:shadow-[0_4px_30px_rgba(139,92,246,0.6)] cursor-pointer flex items-center justify-center gap-2'
    };
  })();

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
              <p className="text-white/60 text-xs font-medium mb-2">Available Balance</p>
              <h2 className="text-3xl font-black text-white f-mono mb-1">
                {formatPrice(Number(dashboardSummary?.availableBalance || 0), currency)}
              </h2>
          </div>
        </div>

        {/* MAIN 2-COLUMN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-10">

           {/* 🔥 DYNAMIC DOCUMENT VERIFICATION PANEL 🔥 */}
           <div className="lg:col-span-5 bg-[#120F1A] border border-white/[0.06] rounded-[24px] p-6 shadow-xl relative overflow-hidden flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start mb-3">
                   <div>
                     <h3 className="text-lg font-black text-white">Document Verification</h3>
                     <p className="text-xs text-[#8F95A3] mt-0.5">Submit any government issued document to enable withdrawals</p>
                   </div>
                   <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                     isKycVerified ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' :
                     isKycSubmitted ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' :
                     'bg-white/5 text-[#8F95A3] border border-white/10'
                   }`}>
                     {kycBadgeText}
                   </span>
                </div>

                {/* 3 Steps horizontal flow */}
                <div className="grid grid-cols-3 gap-2 my-5">
                   <div className={`flex flex-col items-center text-center p-3 rounded-xl border ${!isKycSubmitted && !isKycVerified ? 'bg-[#8B5CF6]/10 border-[#8B5CF6]/30 text-white' : 'bg-white/[0.02] border-white/5 text-[#8F95A3]'}`}>
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold mb-1.5 ${!isKycSubmitted && !isKycVerified ? 'bg-[#8B5CF6] text-white shadow-[0_0_10px_rgba(139,92,246,0.5)]' : 'bg-white/10 text-[#8F95A3]'}`}>1</div>
                      <span className="text-[11px] font-bold">Not Submitted</span>
                   </div>

                   <div className={`flex flex-col items-center text-center p-3 rounded-xl border ${isKycSubmitted ? 'bg-amber-500/10 border-amber-500/30 text-white' : 'bg-white/[0.02] border-white/5 text-[#8F95A3]'}`}>
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold mb-1.5 ${isKycSubmitted ? 'bg-amber-500 text-black shadow-[0_0_10px_rgba(245,158,11,0.5)]' : 'bg-white/10 text-[#8F95A3]'}`}>2</div>
                      <span className="text-[11px] font-bold">Under Review</span>
                   </div>

                   <div className={`flex flex-col items-center text-center p-3 rounded-xl border ${isKycVerified ? 'bg-emerald-500/10 border-emerald-500/30 text-white' : 'bg-white/[0.02] border-white/5 text-[#8F95A3]'}`}>
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold mb-1.5 ${isKycVerified ? 'bg-emerald-500 text-black shadow-[0_0_10px_rgba(16,185,129,0.5)]' : 'bg-white/10 text-[#8F95A3]'}`}>3</div>
                      <span className="text-[11px] font-bold">Approved</span>
                   </div>
                </div>

                <div className="bg-[#1A1725] border border-white/5 rounded-2xl p-3.5 mb-5 flex items-center gap-3">
                   <Shield className="w-5 h-5 text-[#8B5CF6] shrink-0" />
                   <p className="text-[11px] text-[#8F95A3] leading-relaxed">
                     Accepted: <span className="text-white font-semibold">Aadhaar Card, PAN Card, Passport, Voter ID, etc.</span>
                   </p>
                </div>
              </div>

              <button 
                disabled={btnProps.disabled}
                onClick={() => {
                  if (btnProps.disabled) return;
                  setIsKycOpen(true);
                }}
                className={btnProps.className}
              >
                {btnProps.text}
              </button>
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
                       <span className="text-xs text-[#8D89A8] font-medium mb-1">Total Completed Offers</span>
                       <span className="text-xl font-bold text-white f-mono mb-1">
                         <CountUp value={Number(dashboardSummary?.completedOffers || 0)} />
                       </span>
                       <span className="text-[10px] text-white/40">Completed</span>
                     </div>
                   </div>

                   <div className="bg-[#1A1725] border border-white/5 rounded-2xl p-5 flex items-center gap-4">
                     <div className="w-12 h-12 rounded-xl bg-[#00E57A]/10 flex items-center justify-center border border-[#00E57A]/20 shrink-0">
                       <Wallet className="w-6 h-6 text-[#00E57A]" />
                     </div>
                     <div className="flex flex-col w-full">
                       <span className="text-xs text-[#8D89A8] font-medium mb-1">Total Referral Earning</span>
                       <span className="text-xl font-bold text-white f-mono mb-1">{formatPrice(Number(dashboardSummary?.referralEarning || 0), currency)}</span>
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
                         {dashboardSummary?.totalReferrals || 0}
                       </span>
                       <span className="text-[10px] text-white/40">Lifetime</span>
                     </div>
                   </div>
                </div>
              </div>

           </div>
        </div>

        {/* BOTTOM SINGLE TABS ROW & TABLE */}
        <div className="flex flex-col">
          
          <div className="flex items-center gap-2 mb-5 overflow-x-auto no-scrollbar">
            {(['offers', 'surveys', 'reversals', 'rewards'] as const).map((tab) => (
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
                    {activeTableTab === 'offers' ? (
                      <>
                        <th className="px-6 py-4 text-[10px] f-mono font-bold text-[#8D89A8] uppercase tracking-wider">Offer Name</th>
                        <th className="px-6 py-4 text-[10px] f-mono font-bold text-[#8D89A8] uppercase tracking-wider">Network Name</th>
                        <th className="px-6 py-4 text-[10px] f-mono font-bold text-[#8D89A8] uppercase tracking-wider">Payout</th>
                        <th className="px-6 py-4 text-[10px] f-mono font-bold text-[#8D89A8] uppercase tracking-wider">Event</th>
                        <th className="px-6 py-4 text-[10px] f-mono font-bold text-[#8D89A8] uppercase tracking-wider">Status</th>
                      </>
                    ) : activeTableTab === 'surveys' ? (
                      <>
                        <th className="px-6 py-4 text-[10px] f-mono font-bold text-[#8D89A8] uppercase tracking-wider">Survey Name</th>
                        <th className="px-6 py-4 text-[10px] f-mono font-bold text-[#8D89A8] uppercase tracking-wider">Network Name</th>
                        <th className="px-6 py-4 text-[10px] f-mono font-bold text-[#8D89A8] uppercase tracking-wider">Reward</th>
                        <th className="px-6 py-4 text-[10px] f-mono font-bold text-[#8D89A8] uppercase tracking-wider">Status</th>
                        <th className="px-6 py-4 text-[10px] f-mono font-bold text-[#8D89A8] uppercase tracking-wider">Date</th>
                      </>
                    ) : activeTableTab === 'reversals' ? (
                      <>
                        <th className="px-6 py-4 text-[10px] f-mono font-bold text-[#8D89A8] uppercase tracking-wider">Name</th>
                        <th className="px-6 py-4 text-[10px] f-mono font-bold text-[#8D89A8] uppercase tracking-wider">Amount reversed</th>
                        <th className="px-6 py-4 text-[10px] f-mono font-bold text-[#8D89A8] uppercase tracking-wider">Status</th>
                        <th className="px-6 py-4 text-[10px] f-mono font-bold text-[#8D89A8] uppercase tracking-wider">Network Name</th>
                        <th className="px-6 py-4 text-[10px] f-mono font-bold text-[#8D89A8] uppercase tracking-wider">Date</th>
                      </>
                    ) : (
                      <>
                        <th className="px-6 py-4 text-[10px] f-mono font-bold text-[#8D89A8] uppercase tracking-wider">Reward name</th>
                        <th className="px-6 py-4 text-[10px] f-mono font-bold text-[#8D89A8] uppercase tracking-wider">Amount</th>
                        <th className="px-6 py-4 text-[10px] f-mono font-bold text-[#8D89A8] uppercase tracking-wider">Type</th>
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
                      if (activeTableTab === 'offers') currentData = offersData;
                      else if (activeTableTab === 'surveys') currentData = surveysData;
                      else if (activeTableTab === 'reversals') currentData = reversalsData;
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
                        // OFFERS RENDER BLOCK
                        if (activeTableTab === 'offers') {
                          const finalImg = resolveImage(item.offerImage || item.logo || item.image_url || item.preview);
                          const partnerName = item.network || item.partnerName || item.offerPartnerName || 'Partner';
                          const payoutVal = Number(item.userCredits || item.amount || 0);
                          const eventName = item.eventName ? item.eventName : '-';
                          const statusText = 'Completed';

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
                                      <span className="text-xs font-bold text-[#A66CFF]">{(item.offerName || item.offer_name || 'O').charAt(0)}</span>
                                    </div>
                                  )}
                                  <span className="text-sm font-bold text-white truncate max-w-[200px]">{item.offerName || item.offer_name || 'Offer'}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-sm text-white/80 capitalize">{partnerName}</td>
                              <td className="px-6 py-4 text-sm f-mono font-bold text-[#3DE8A0]">+{formatPrice(payoutVal, currency)}</td>
                              <td className="px-6 py-4 text-sm f-mono text-[#8D89A8]">{eventName}</td>
                              <td className="px-6 py-4">
                                <span className="px-2 py-1 rounded border text-[10px] font-bold uppercase flex items-center gap-1 w-fit bg-[#3DE8A0]/10 border-[#3DE8A0]/20 text-[#3DE8A0]">
                                  <CheckCircle2 className="w-3 h-3" /> {statusText}
                                </span>
                              </td>
                            </motion.tr>
                          );
                        }

                        // SURVEYS RENDER BLOCK
                        if (activeTableTab === 'surveys') {
                          const finalImg = resolveImage(item.logo || item.surveyImage || item.image_url || item.preview);
                          const partnerName = item.network || item.partnerName || 'Network';
                          const payoutVal = Number(item.userCredits || item.amount || 0);
                          const statusText = 'Completed';

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
                                      <span className="text-xs font-bold text-[#A66CFF]">{(item.surveyName || item.offer_name || item.name || 'S').charAt(0)}</span>
                                    </div>
                                  )}
                                  <span className="text-sm font-bold text-white truncate max-w-[200px]">{item.surveyName || item.offer_name || item.name || 'Survey'}</span>
                                </div>
                              </td>
                              <td className="px-6 py-4 text-sm text-white/80 capitalize">{partnerName}</td>
                              <td className="px-6 py-4 text-sm f-mono font-bold text-[#3DE8A0]">+{formatPrice(payoutVal, currency)}</td>
                              <td className="px-6 py-4">
                                <span className="px-2 py-1 rounded border text-[10px] font-bold uppercase flex items-center gap-1 w-fit bg-[#3DE8A0]/10 border-[#3DE8A0]/20 text-[#3DE8A0]">
                                  <CheckCircle2 className="w-3 h-3" /> {statusText}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm f-mono text-[#8D89A8]">{formatDate(item.date || item.createdAt)}</td>
                            </motion.tr>
                          );
                        }

                        // REVERSALS RENDER BLOCK
                        if (activeTableTab === 'reversals') {
                          const finalImg = resolveImage(item.logo || item.offerImage || item.image_url || item.preview);
                          const partnerName = item.network || item.partnerName || 'Network';
                          const payoutVal = Number(item.userCredits || item.amount || 0);

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
                              <td className="px-6 py-4 text-sm f-mono font-bold text-[#FF5D73]">-{formatPrice(payoutVal, currency)}</td>
                              <td className="px-6 py-4">
                                <span className="px-2 py-1 rounded border bg-[#FF5D73]/10 border-[#FF5D73]/20 text-[#FF5D73] text-[10px] font-bold uppercase flex items-center gap-1 w-fit">
                                  <AlertCircle className="w-3 h-3" /> {item.status || 'REVERSED'}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-sm text-white/80 capitalize">{partnerName}</td>
                              <td className="px-6 py-4 text-sm f-mono text-[#8D89A8]">{formatDate(item.date || item.createdAt)}</td>
                            </motion.tr>
                          );
                        }

                        // REWARDS RENDER BLOCK
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
                      });
                    })()
                  )}
                </tbody>
              </table>
            </div>

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
                    
                    <div className="flex flex-col gap-1.5">
                       <label className="text-xs font-bold text-[#8D89A8] ml-1">Full Name</label>
                       <div className="relative flex items-center">
                         <User className="absolute left-3.5 w-4 h-4 text-[#8D89A8]" />
                         <input
                            type="text"
                            required
                            placeholder="Enter full name"
                            value={formData.name || ''}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            className="w-full bg-[#1A1725] border border-white/5 focus:border-[#A66CFF]/50 rounded-xl pl-10 pr-4 py-3 text-sm text-white font-medium focus:outline-none transition-colors"
                         />
                       </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {[
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
                  
                  {/* 🔥 TRIGGER DELETE MODAL 🔥 */}
                  <div className="mt-8 pt-4 border-t border-[#FF5D73]/20 text-center">
                    <button 
                      onClick={() => setIsDeleteModalOpen(true)}
                      className="text-sm font-bold text-[#FF5D73] hover:text-[#FF5D73]/80 transition-colors cursor-pointer"
                    >
                      Delete account
                    </button>
                  </div>

              </div>

            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- 🔥 NEW: DELETE CONFIRMATION MODAL 🔥 --- */}
      <AnimatePresence>
        {isDeleteModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#050409]/90 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-[400px] bg-[#120F1A] border border-[#FF5D73]/30 rounded-3xl p-6 sm:p-8 text-center shadow-[0_20px_60px_rgba(255,93,115,0.15)] flex flex-col items-center overflow-hidden"
            >
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#FF5D73] to-transparent" />
              
              <div className="w-16 h-16 rounded-full bg-[#FF5D73]/10 flex items-center justify-center mb-5 border border-[#FF5D73]/20">
                <ShieldAlert className="w-8 h-8 text-[#FF5D73]" />
              </div>

              <h2 className="text-xl font-black text-white mb-2">Delete Account?</h2>
              <p className="text-[#8D89A8] text-sm mb-6 leading-relaxed">
                This action is permanent and cannot be undone. All your data, earnings, and referrals will be lost forever.
              </p>

              {deleteError && (
                <div className="w-full mb-6 p-3 rounded-lg bg-[#FF5D73]/10 border border-[#FF5D73]/30 text-[#FF5D73] text-xs font-bold text-center">
                  {deleteError}
                </div>
              )}

              <div className="w-full flex gap-3">
                <button 
                  disabled={isDeleting}
                  onClick={() => setIsDeleteModalOpen(false)}
                  className="flex-1 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-sm transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  disabled={isDeleting}
                  onClick={handleDeleteAccount}
                  className="flex-1 py-3 rounded-xl bg-[#FF5D73] hover:bg-red-600 text-white font-bold text-sm transition-colors shadow-lg shadow-[#FF5D73]/20 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  Yes, Delete
                </button>
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