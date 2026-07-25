'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Settings, User, Mail, BookOpen, MapPin, Home,
  Phone, Hash, Camera, UploadCloud, Copy, Globe,
  Trash2, Image as ImageIcon, CheckCircle2, ChevronRight,
  AlertCircle, X, ShieldAlert, ShieldCheck, Wallet, Clock, Loader2,
  KeyRound, Coins, Sparkles, ScanLine, Check, Calendar, Building, ChevronDown, CreditCard
} from 'lucide-react';

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

// 🔥 100% WORKING VERIFIED 3D & GAMING / CRYPTO AVATARS 🔥
const AVATAR_LIBRARY = [
  'https://api.dicebear.com/9.x/adventurer/svg?seed=Nova&backgroundColor=a66cff,7c3aed,4c1d95',
  'https://api.dicebear.com/9.x/big-smile/svg?seed=Blaze&backgroundColor=a66cff,7c3aed,4c1d95',
  'https://api.dicebear.com/9.x/adventurer/svg?seed=Orbit&backgroundColor=a66cff,7c3aed,4c1d95',
  'https://api.dicebear.com/9.x/big-smile/svg?seed=Karma&backgroundColor=a66cff,7c3aed,4c1d95',
  'https://api.dicebear.com/9.x/adventurer/svg?seed=Phoenix&backgroundColor=a66cff,7c3aed,4c1d95',
  'https://api.dicebear.com/9.x/big-smile/svg?seed=Ranger&backgroundColor=a66cff,7c3aed,4c1d95',
  'https://api.dicebear.com/9.x/adventurer/svg?seed=Cipher&backgroundColor=a66cff,7c3aed,4c1d95',
  'https://api.dicebear.com/9.x/big-smile/svg?seed=Storm&backgroundColor=a66cff,7c3aed,4c1d95',
  'https://api.dicebear.com/9.x/adventurer/svg?seed=Vortex&backgroundColor=a66cff,7c3aed,4c1d95',
  'https://api.dicebear.com/9.x/big-smile/svg?seed=Comet&backgroundColor=a66cff,7c3aed,4c1d95',
  'https://api.dicebear.com/9.x/adventurer/svg?seed=Titan&backgroundColor=a66cff,7c3aed,4c1d95',
  'https://api.dicebear.com/9.x/big-smile/svg?seed=Raven&backgroundColor=a66cff,7c3aed,4c1d95'
];

function CountUp({ value, prefix = '', decimals = 0 }: { value: number; prefix?: string; decimals?: number }) {
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
  return <>{prefix}{display.toFixed(decimals)}</>;
}

const HEX_CLIP = 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)';
const NOTCH_CLIP = 'polygon(0% 0%, calc(100% - 28px) 0%, 100% 28px, 100% 100%, 0% 100%)';

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

      const res = await fetch('https://apitest.binnycash.com/api/user/kyc/submit', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: data
      });

      const json = await res.json();
      if (res.ok || json.responseCode === 0 || json.code === 200) {
        setMessage('KYC Submitted Successfully!');
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 1500);
      } else {
        setMessage(json.responseMessage || 'Submission failed. Try again.');
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
              alt="KYC Instructions: Document and BINNYCASH note" 
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
              className="py-3.5 rounded-2xl bg-gradient-to-r from-[#7C3AED] via-[#8B5CF6] to-[#EC4899] hover:opacity-95 text-white font-bold text-sm transition-all shadow-[0_4px_25px_rgba(139,92,246,0.4)] cursor-pointer flex items-center justify-center gap-2"
            >
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

  const [userData, setUserData] = useState<any>(null);
  const [stats, setStats] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Tabs State
  const [mainTab, setMainTab] = useState<'earning' | 'reversal'>('earning');
  const [subTab, setSubTab] = useState<'offers' | 'surveys' | 'rewards'>('offers');

  // Table Data State
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
    education: '',
    city: '',
    address: '',
    mobileNumber: '',
    zipCode: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

  const fetchProfileData = async () => {
    setIsLoading(true);
    const token = localStorage.getItem('token') || '';
    const userId = getUserId();

    try {
      let res = await fetch(`https://apitest.binnycash.com/api/user/editProfile?userId=${userId}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (!res.ok) {
        res = await fetch('https://apitest.binnycash.com/api/user/viewData', {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}` }
        });
      }

      const json = await res.json();
      const user = json?.data?.user || json?.data || json;
      setUserData(user);

      setFormData({
        firstName: user?.firstName || '',
        lastName: user?.lastName || '',
        email: user?.email || '',
        education: user?.education || '',
        city: user?.city || '',
        address: user?.address || '',
        mobileNumber: user?.mobileNumber || '',
        zipCode: user?.zipCode || '',
      });

      const resStats = await fetch('https://apitest.binnycash.com/api/user/wallet/view', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const statsJson = await resStats.json();
      setStats(statsJson?.data);

    } catch (err) {
      console.error("Failed to load profile", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchTableData = async () => {
      const token = localStorage.getItem('token') || '';
      const userId = getUserId();
      if (!userId || !token) return;

      setIsTableLoading(true);
      try {
        if (mainTab === 'earning') {
          if (subTab === 'offers' && offersData.length === 0) {
            const res = await fetch(`https://apitest.binnycash.com/api/user/user_completed_offer?userId=${userId}`, {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            const json = await res.json();
            setOffersData(json?.data?.data?.completedOffers || []);
          }
          else if (subTab === 'surveys' && surveysData.length === 0) {
            const res = await fetch(`https://apitest.binnycash.com/api/user/user_completed_survey_api?userId=${userId}`, {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            const json = await res.json();
            setSurveysData(json?.data?.data?.completedSurveys || []);
          }
          else if (subTab === 'rewards' && rewardsData.length === 0) {
            const res = await fetch(`https://apitest.binnycash.com/api/user/user_earn_reward?userId=${userId}`, {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            const json = await res.json();
            setRewardsData(json?.data?.data?.userReward || []);
          }
        }
        else if (mainTab === 'reversal' && reversalsData.length === 0) {
          const res = await fetch(`https://apitest.binnycash.com/api/user/userReversalsApi?userId=${userId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const json = await res.json();
          setReversalsData(json?.data?.data?.reversals || []);
        }
      } catch (error) {
        console.error("Failed to fetch table data:", error);
      } finally {
        setIsTableLoading(false);
      }
    };

    fetchTableData();
  }, [mainTab, subTab]);

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
      const data = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        data.append(key, value);
      });

      const res = await fetch(`https://apitest.binnycash.com/api/user/editProfile?userId=${userId}`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
        body: data
      });

      const json = await res.json();
      if (res.ok || json.code === 200 || json.responseCode === 0) {
        setMessage({ text: 'Profile updated successfully!', type: 'success' });
        fetchProfileData();
      } else {
        setMessage({ text: json.message || 'Failed to update profile', type: 'error' });
      }
    } catch (err) {
      setMessage({ text: 'Something went wrong', type: 'error' });
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

      if (!res.ok) {
        throw new Error(`HTTP Error: ${res.status}`);
      }

      const json = await res.json();
      if (json.code === 200 || json.responseCode === 0) {
        setMessage({ text: 'Avatar updated successfully!', type: 'success' });
        fetchProfileData();
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

  const resolveImage = (imgSrc: string) => {
    if (!imgSrc) return null;
    if (imgSrc.startsWith('http')) return imgSrc;
    return `https://apitest.binnycash.com${imgSrc}`;
  };

  const name = userData?.firstName ? `${userData.firstName} ${userData.lastName || ''}` : userData?.name || 'User';
  
  const rawProfilePic = userData?.image || userData?.profilePic;
  const displayImage = resolveImage(rawProfilePic);

  const joinDate = userData?.createdAt ? new Date(userData.createdAt).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'Recently';
  const kycStatus = userData?.documents?.status || 'Unverified';

  const formatDate = (dateString: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
    });
  };

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
        @keyframes drift { 0%, 100% { transform: translate(0,0); } 50% { transform: translate(14px,-10px); } }
        .animate-drift { animation: drift 8s ease-in-out infinite; }
      `}</style>

      {/* Ambient backdrop */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-24 w-[520px] h-[520px] bg-[#A66CFF]/10 blur-[120px] rounded-full animate-drift" />
        <div className="absolute top-1/3 -right-32 w-[420px] h-[420px] bg-[#FFC94A]/[0.06] blur-[130px] rounded-full" />
        <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '26px 26px' }} />
      </div>

      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 relative z-10 f-body">

        {message && (
           <div className={`mb-6 p-4 rounded-xl text-sm font-bold text-center border ${message.type === 'success' ? 'bg-[#3DE8A0]/10 text-[#3DE8A0] border-[#3DE8A0]/30' : 'bg-[#FF5D73]/10 text-[#FF5D73] border-[#FF5D73]/30'}`}>
             {message.text}
           </div>
        )}

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
          <div>
            <span className="f-mono text-[10px] font-bold tracking-[0.3em] text-[#A66CFF] uppercase">Account · Vault</span>
            <h1 className="f-display text-3xl md:text-4xl font-bold text-white tracking-tight mt-1">My Profile</h1>
            <p className="text-[#8D89A8] text-sm mt-1 font-medium">Manage your identity, wallet and earning history.</p>
          </div>
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="flex items-center gap-2 bg-[#14121F] hover:bg-[#1A1725] border border-white/10 pl-4 pr-5 py-2.5 rounded-full text-sm font-bold transition-all hover:scale-105 shadow-lg shadow-black/30 cursor-pointer"
          >
            <span className="w-6 h-6 rounded-full bg-[#A66CFF]/15 flex items-center justify-center">
              <KeyRound className="w-3.5 h-3.5 text-[#A66CFF]" />
            </span>
            Settings
          </button>
        </div>

        {/* TOP WIDGETS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">

          {/* IDENTITY CARD */}
          <div
            className="lg:col-span-1 bg-[#120F1A] border border-white/[0.06] p-6 shadow-xl shadow-black/40 flex flex-col gap-6 relative overflow-hidden"
            style={{ clipPath: NOTCH_CLIP, borderRadius: 24 }}
          >
            <div className="absolute top-0 right-0 w-40 h-40 bg-[#A66CFF]/10 blur-[60px] pointer-events-none" />
            <div className="absolute top-0 right-0 w-7 h-7 bg-[#08070D] border-b border-l border-white/[0.06]" style={{ clipPath: 'polygon(100% 0, 0 0, 100% 100%)' }} />

            <div className="flex justify-between items-start relative z-10">
              <div className="flex gap-4 items-center">
                <div className="relative shrink-0">
                  <div className="absolute -inset-2 rounded-full border border-solid border-[#A66CFF]/20" />
                  <div className="w-16 h-16 bg-[#1A1725] p-[3px] shadow-inner" style={{ clipPath: HEX_CLIP }}>
                    {displayImage ? (
                      <img 
                        src={displayImage} 
                        alt="Profile" 
                        className="w-full h-full object-cover" 
                        style={{ clipPath: HEX_CLIP }} 
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#8B5CF6] to-[#7c3aed] flex items-center justify-center text-white text-xl font-black uppercase" style={{ clipPath: HEX_CLIP }}>
                        {name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => setIsAvatarModalOpen(true)}
                    className="absolute -bottom-1.5 -right-1.5 w-6 h-6 bg-[#A66CFF] hover:bg-[#8B5CF6] rounded-full border-2 border-[#120F1A] flex items-center justify-center shadow-md cursor-pointer transition-colors"
                  >
                    <Camera className="w-3 h-3 text-white" />
                  </button>
                </div>
                <div className="flex flex-col">
                  <h2 className="f-display text-lg font-bold text-white">{name}</h2>
                  <span className="text-[#8D89A8] text-[11px] font-medium">Joined {joinDate}</span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="text-[11px] text-[#8D89A8]">Binny ID</span>
                    <span className="f-mono text-[11px] font-bold text-white">{userData?.id || userData?.userId || 'N/A'}</span>
                  </div>
                </div>
              </div>
              <div className="px-2.5 py-1 rounded-full border border-[#FFC94A]/30 bg-[#FFC94A]/10 flex items-center gap-1.5 shrink-0">
                <Coins className="w-3.5 h-3.5 text-[#FFC94A]" />
                <span className="text-[10px] f-mono font-bold text-[#FFC94A] uppercase">Bronze</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/[0.06] relative z-10">
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-end">
                  <span className="text-xs font-bold text-white">Tier charge</span>
                  <span className="f-mono text-[10px] text-[#8D89A8]">$0.10 / $1</span>
                </div>
                <div className="w-full h-1.5 bg-[#1A1725] rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: '10%' }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                    className="h-full rounded-full bg-gradient-to-r from-[#A66CFF] to-[#FFC94A]"
                  />
                </div>
                <span className="text-[9px] text-[#8D89A8] text-center mt-1">$0.90 to reach Silver</span>
              </div>

              <div 
                onClick={() => {
                  if (kycStatus !== 'Verified') setIsKycOpen(true);
                }}
                className="bg-[#1A1725] border border-white/[0.06] rounded-xl flex flex-col items-center justify-center py-2 cursor-pointer hover:bg-white/5 transition-colors"
              >
                <span className="text-[10px] text-[#8D89A8] font-medium mb-1">Document status</span>
                <span className={`text-xs font-black ${kycStatus === 'Verified' ? 'text-[#3DE8A0]' : 'text-[#FFC94A]'}`}>
                  {kycStatus}
                </span>
                {kycStatus !== 'Verified' && <span className="text-[9px] text-[#8D89A8] mt-0.5">Click to verify</span>}
              </div>
            </div>
          </div>

          {/* STATS */}
          <div className="lg:col-span-2 bg-[#120F1A] border border-white/[0.06] rounded-[24px] p-6 shadow-xl shadow-black/40 flex flex-col gap-4 relative overflow-hidden">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-sm font-bold text-[#8D89A8]">Wallet overview</h3>
              <div className="px-3 py-1 rounded-full border border-white/10 bg-white/5 text-[10px] f-mono font-bold text-white tracking-wider uppercase flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[#3DE8A0] animate-pulse" /> Live
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 h-full">
              {[
                { icon: Wallet, color: '#A66CFF', value: parseFloat(stats?.totalEarning || 0), prefix: '$', decimals: 2, label: 'Total earnings' },
                { icon: CheckCircle2, color: '#3DE8A0', value: Number(stats?.totalCompletedOffers || 0), prefix: '', decimals: 0, label: 'Completed offers' },
                { icon: User, color: '#5EA8FF', value: Number(userData?.referrals || 0), prefix: '', decimals: 0, label: 'Users referred' },
                { icon: Clock, color: '#FFC94A', value: parseFloat(stats?.last30DaysEarning || 0), prefix: '$', decimals: 2, label: 'Earnings last 30 days' },
              ].map((s, i) => (
                <motion.div
                  key={s.label}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06, duration: 0.4 }}
                  className="bg-[#1A1725] border border-white/[0.06] rounded-[18px] p-5 flex items-center gap-4"
                >
                  <div className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 border" style={{ backgroundColor: `${s.color}1A`, borderColor: `${s.color}33` }}>
                    <s.icon className="w-5 h-5" style={{ color: s.color }} />
                  </div>
                  <div className="flex flex-col">
                    <h4 className="f-display text-2xl font-bold text-white">
                      <CountUp value={s.value} prefix={s.prefix} decimals={s.decimals} />
                    </h4>
                    <span className="text-xs text-[#8D89A8] font-medium">{s.label}</span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        {/* BOTTOM TABS & TABLE */}
        <div className="flex flex-col">
          <div className="relative inline-flex items-center bg-[#120F1A] border border-white/[0.06] rounded-full p-1 mb-5 w-fit">
            {(['earning', 'reversal'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setMainTab(t)}
                className={`relative z-10 px-5 py-2 text-sm font-bold rounded-full capitalize transition-colors cursor-pointer ${mainTab === t ? 'text-white' : 'text-[#8D89A8] hover:text-white'}`}
              >
                {mainTab === t && (
                  <motion.div
                    layoutId="mainTabPill"
                    className="absolute inset-0 bg-gradient-to-r from-[#A66CFF] to-[#7C3AED] rounded-full -z-10 shadow-md shadow-[#A66CFF]/30"
                    transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                  />
                )}
                {t}
              </button>
            ))}
          </div>

          {mainTab === 'earning' && (
            <div className="flex items-center gap-2 mb-4">
              {['offers', 'surveys', 'rewards'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setSubTab(tab as any)}
                  className={`px-4 py-2 rounded-full text-[11px] font-bold tracking-wider uppercase transition-all cursor-pointer ${subTab === tab ? 'bg-[#A66CFF] text-white shadow-md' : 'bg-[#120F1A] border border-white/[0.06] text-[#8D89A8] hover:text-white'}`}
                >
                  {tab}
                </button>
              ))}
            </div>
          )}

          <div className="w-full bg-[#120F1A] border border-white/[0.06] rounded-[24px] overflow-hidden">
            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="border-b border-white/[0.06] bg-white/[0.02]">
                    {mainTab === 'reversal' ? (
                      <>
                        <th className="px-6 py-4 text-[10px] f-mono font-bold text-[#8D89A8] uppercase tracking-wider">Name</th>
                        <th className="px-6 py-4 text-[10px] f-mono font-bold text-[#8D89A8] uppercase tracking-wider">Amount reversed</th>
                        <th className="px-6 py-4 text-[10px] f-mono font-bold text-[#8D89A8] uppercase tracking-wider">Status</th>
                        <th className="px-6 py-4 text-[10px] f-mono font-bold text-[#8D89A8] uppercase tracking-wider">Partner</th>
                        <th className="px-6 py-4 text-[10px] f-mono font-bold text-[#8D89A8] uppercase tracking-wider">Date</th>
                      </>
                    ) : subTab === 'rewards' ? (
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
                      if (mainTab === 'reversal') currentData = reversalsData;
                      else if (subTab === 'offers') currentData = offersData;
                      else if (subTab === 'surveys') currentData = surveysData;
                      else if (subTab === 'rewards') currentData = rewardsData;

                      if (currentData.length === 0) {
                        return (
                          <tr>
                            <td colSpan={5} className="px-6 py-16 text-center">
                              <div className="flex flex-col items-center justify-center gap-2 opacity-60">
                                <AlertCircle className="w-8 h-8 text-[#8D89A8]" />
                                <span className="text-sm font-medium text-[#8D89A8]">No {mainTab === 'reversal' ? 'reversal' : 'completed'} data found.</span>
                              </div>
                            </td>
                          </tr>
                        );
                      }

                      return currentData.map((item: any, idx: number) => {
                        if (mainTab === 'reversal') {
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
                              <td className="px-6 py-4 text-sm f-mono font-bold text-[#FF5D73]">-${parseFloat(item.userCredits || item.amount || 0).toFixed(2)}</td>
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

                        if (subTab === 'rewards' && mainTab === 'earning') {
                          return (
                            <motion.tr
                              key={item._id || idx}
                              initial={{ opacity: 0, x: -8 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: Math.min(idx * 0.03, 0.4) }}
                              className="border-b border-white/[0.05] hover:bg-white/[0.03] transition-colors"
                            >
                              <td className="px-6 py-4 text-sm font-bold text-white">{item.name || 'Reward'}</td>
                              <td className="px-6 py-4 text-sm f-mono font-bold text-[#3DE8A0]">+${parseFloat(item.amount || item.Balance || 0).toFixed(2)}</td>
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
                            <td className="px-6 py-4 text-sm f-mono font-bold text-[#3DE8A0]">+${parseFloat(item.userCredits || item.amount || 0).toFixed(2)}</td>
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
          </div>
        </div>
      </main>

      {/* --- KYC MODAL RENDER --- */}
      <KycModal 
        isOpen={isKycOpen} 
        onClose={() => setIsKycOpen(false)} 
        onSuccess={() => {
          fetchProfileData();
        }}
      />

      {/* --- SETTINGS MODAL --- */}
      <AnimatePresence>
        {isSettingsOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#050409]/90 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 12 }}
              transition={{ type: 'spring', stiffness: 320, damping: 30 }}
              className="relative w-full max-w-[600px] bg-[#120F1A] border border-white/10 p-6 sm:p-8 text-white shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar"
              style={{ clipPath: NOTCH_CLIP, borderRadius: 28 }}
            >
              <button
                onClick={() => setIsSettingsOpen(false)}
                className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white/70 hover:text-white transition-all cursor-pointer z-10"
              >
                <X className="w-4 h-4" />
              </button>

              <span className="f-mono text-[10px] font-bold tracking-[0.3em] text-[#A66CFF] uppercase">Access panel</span>

              <div className="flex items-center gap-5 my-6">
                <div className="relative shrink-0">
                  <div className="w-20 h-20 bg-[#1A1725] p-1" style={{ clipPath: HEX_CLIP }}>
                    {displayImage ? (
                      <img 
                        src={displayImage} 
                        alt="Profile" 
                        className="w-full h-full object-cover" 
                        style={{ clipPath: HEX_CLIP }} 
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-[#8B5CF6] to-[#7c3aed] flex items-center justify-center text-white text-2xl font-black uppercase" style={{ clipPath: HEX_CLIP }}>
                        {name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => { setIsSettingsOpen(false); setIsAvatarModalOpen(true); }}
                    className="absolute bottom-0 right-0 w-7 h-7 bg-white rounded-full border-2 border-[#120F1A] flex items-center justify-center cursor-pointer hover:scale-110 shadow-md transition-transform"
                  >
                    <ImageIcon className="w-3.5 h-3.5 text-[#120F1A]" />
                  </button>
                </div>
                <div className="flex flex-col">
                  <h2 className="f-display text-2xl font-bold text-white">{name}</h2>
                  <span className="text-sm text-[#8D89A8] font-medium">Joined {joinDate}</span>
                </div>
              </div>

              <h3 className="text-sm font-bold text-white mb-3">Account information</h3>
              <div className="flex flex-col mb-8 border-t border-white/[0.06]">
                <div className="flex items-center justify-between py-4 border-b border-white/[0.06]">
                  <div className="flex items-center gap-3">
                    <ShieldAlert className="w-4 h-4 text-[#A66CFF]" />
                    <div className="flex flex-col">
                      <span className="text-xs text-[#8D89A8] font-medium">Coinlooty ID</span>
                      <span className="f-mono text-sm font-bold text-white">{userData?.id || 'N/A'}</span>
                    </div>
                  </div>
                  <button onClick={() => copyToClipboard(userData?.id || '')} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-bold text-white transition-colors border border-white/5 cursor-pointer">
                    <Copy className="w-3.5 h-3.5" /> Copy
                  </button>
                </div>

                <div className="flex items-center gap-3 py-4 border-b border-white/[0.06]">
                  <Mail className="w-4 h-4 text-[#A66CFF]" />
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[#8D89A8] font-medium">Email</span>
                      <div className="w-1.5 h-1.5 rounded-full bg-[#3DE8A0]" />
                    </div>
                    <span className="f-mono text-sm font-bold text-white">{userData?.email || 'N/A'}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between py-4">
                  <div className="flex items-center gap-3">
                    <Globe className="w-4 h-4 text-[#A66CFF]" />
                    <div className="flex flex-col">
                      <span className="text-xs text-[#8D89A8] font-medium">Language</span>
                      <span className="text-sm font-bold text-white">English</span>
                    </div>
                  </div>
                  <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-bold text-white transition-colors border border-white/5 cursor-pointer">
                    Change
                  </button>
                </div>
              </div>

              <div className="border-t border-white/[0.06] pt-6">
                <h3 className="text-sm font-bold text-white mb-4">Edit profile details</h3>
                <form onSubmit={handleUpdateProfile} className="flex flex-col">
                  {[
                    { key: 'firstName', label: 'First name', type: 'text', icon: User },
                    { key: 'lastName', label: 'Last name', type: 'text', icon: User },
                    { key: 'email', label: 'Email', type: 'email', icon: Mail },
                    { key: 'mobileNumber', label: 'Mobile number', type: 'tel', icon: Phone },
                    { key: 'education', label: 'Education', type: 'text', icon: BookOpen },
                    { key: 'address', label: 'Address', type: 'text', icon: Home },
                    { key: 'city', label: 'City', type: 'text', icon: MapPin },
                    { key: 'zipCode', label: 'Zip code', type: 'text', icon: Hash },
                  ].map((f) => (
                    <div key={f.key} className="flex items-center gap-3 py-3 border-b border-white/[0.06] group focus-within:border-[#A66CFF]/50 transition-colors">
                      <f.icon className="w-4 h-4 text-[#8D89A8] group-focus-within:text-[#A66CFF] transition-colors shrink-0" />
                      <label className="text-xs font-bold text-[#8D89A8] w-32 shrink-0">{f.label}</label>
                      <input
                        type={f.type}
                        required
                        value={(formData as any)[f.key]}
                        onChange={e => setFormData({ ...formData, [f.key]: e.target.value })}
                        className="w-full bg-transparent text-sm text-white font-medium focus:outline-none placeholder:text-[#8D89A8]/50"
                      />
                    </div>
                  ))}

                  {message && (
                    <div className={`p-3 rounded-xl text-sm font-bold text-center mt-4 ${message.type === 'success' ? 'bg-[#3DE8A0]/10 text-[#3DE8A0]' : 'bg-[#FF5D73]/10 text-[#FF5D73]'}`}>
                      {message.text}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSaving}
                    className="w-full py-3.5 mt-6 rounded-xl bg-gradient-to-r from-[#A66CFF] to-[#7C3AED] text-white font-bold text-sm shadow-md hover:shadow-[0_0_20px_rgba(166,108,255,0.4)] transition-shadow flex justify-center items-center gap-2 cursor-pointer"
                  >
                    {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    {isSaving ? 'Saving...' : 'Save changes'}
                  </button>
                </form>
              </div>

              <div className="mt-8 pt-4 border-t border-[#FF5D73]/20 text-center">
                <button className="text-sm font-bold text-[#FF5D73] hover:text-[#FF5D73]/80 transition-colors cursor-pointer">
                  Delete account
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
              className="relative w-full max-w-[560px] bg-[#120F1A] border border-white/10 p-6 sm:p-8 text-white shadow-2xl overflow-hidden max-h-[85vh] flex flex-col"
              style={{ clipPath: NOTCH_CLIP, borderRadius: 28 }}
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

    </div>
  );
}