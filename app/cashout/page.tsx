'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wallet, Coins, CreditCard, IndianRupee,
  Clock, ShieldCheck, ChevronRight, Zap, 
  Landmark, CircleDollarSign, User, Calendar, 
  MapPin, Building, Hash, UploadCloud, X, ChevronDown, CheckCircle2, AlertCircle, Camera, Loader2, Smartphone, Mail, RefreshCw, AlertTriangle, Sparkles, Lock, ChevronLeft
} from 'lucide-react';
import { useCurrency, formatPrice } from '@/hooks/useCurrency';

// --- UTILITY: Get User ID ---
function getUserId(): string {
  if (typeof window === 'undefined') return '';
  const isNumeric = (v: any) => v !== null && v !== undefined && /^\d+$/.test(String(v));
  try {
    const keys = ['userDetails', 'user', 'userData', 'profile', 'loginResponse'];
    for (const key of keys) {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const parsed = JSON.parse(raw);
      const id = parsed?.id ?? parsed?.userDetails?.id ?? parsed?._id ?? parsed?.userId;
      if (isNumeric(id)) return String(id);
    }
    const directId = localStorage.getItem('userId');
    if (isNumeric(directId)) return String(directId);
  } catch {}
  return '';
}

// --- SAFE JSON PARSER ---
const safeJsonParse = async (res: Response) => {
  try {
    const text = await res.text();
    if (text && !text.trim().startsWith('<')) {
      return JSON.parse(text);
    }
    return { code: 500, data: null, message: "HTML returned instead of JSON" };
  } catch (error) {
    return { code: 500, data: null, message: "Parse Failed" };
  }
};

// --- CUSTOM SVG ICONS ---
const UPIIcon = () => (
  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.1)]">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M14.5 4.5L19.5 9.5L14.5 14.5" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M9.5 19.5L4.5 14.5L9.5 9.5" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M19.5 9.5H4.5" stroke="#059669" strokeWidth="2.5" strokeLinecap="round"/>
    </svg>
  </div>
);

const PhonePeIcon = () => (
  <div className="w-12 h-12 rounded-full bg-[#5E17EB] flex items-center justify-center shadow-[0_0_15px_rgba(94,23,235,0.3)]">
    <span className="text-white font-black text-xl mb-1">पे</span>
  </div>
);

const BankIcon = () => (
  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.1)]">
    <Landmark className="w-6 h-6 text-[#F59E0B]" fill="#F59E0B" />
  </div>
);

const PaytmIcon = () => (
  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.1)]">
    <span className="text-[#002970] font-black text-[13px] tracking-tight">Pay<span className="text-[#00BAF2]">tm</span></span>
  </div>
);

const PayPalIcon = () => (
  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shadow-[0_0_15px_rgba(255,255,255,0.1)]">
    <span className="text-[#003087] font-black text-xl italic tracking-tighter">P</span><span className="text-[#009CDE] font-black text-xl italic tracking-tighter">P</span>
  </div>
);

const features = [
  { icon: <ShieldCheck className="w-5 h-5 text-[#8B5CF6]" />, title: '100% Secure', desc: 'Your transactions are safe with us' },
  { icon: <Zap className="w-5 h-5 text-[#8B5CF6]" />, title: 'Fast Processing', desc: 'Instant or quick withdrawals' },
  { icon: <CircleDollarSign className="w-5 h-5 text-[#8B5CF6]" />, title: 'Low Minimum', desc: 'Only minimum withdrawal limit' },
  { icon: <ShieldCheck className="w-5 h-5 text-[#8B5CF6]" />, title: '24/7 Support', desc: "We're here to help you anytime" },
];

const indianCities = [
  'delhi', 'mumbai', 'bangalore', 'bengaluru', 'hyderabad', 'chennai', 'kolkata', 'pune', 'ahmedabad', 
  'jaipur', 'surat', 'lucknow', 'kanpur', 'nagpur', 'indore', 'thane', 'bhopal', 'visakhapatnam', 
  'patna', 'vadodara', 'ghaziabad', 'ludhiana', 'agra', 'nashik', 'faridabad', 'meerut', 'rajkot', 
  'kalyan', 'vasai', 'varanasi', 'srinagar', 'aurangabad', 'dhanbad', 'amritsar', 'navi mumbai', 
  'allahabad', 'howrah', 'ranchi', 'gwalior', 'jabalpur', 'coimbatore', 'vijayawada', 'jodhpur', 
  'madurai', 'raipur', 'kota', 'guwahati', 'chandigarh', 'solapur', 'hubli', 'bareilly', 'moradabad', 
  'mysore', 'gurgaon', 'aligarh', 'jalandhar', 'tiruchirappalli', 'bhubaneswar', 'salem', 'mira-bhayandar', 
  'warangal', 'thiruvananthapuram', 'guntur', 'bhiwandi', 'saharanpur', 'gorakhpur', 'bikaner', 'amravati', 
  'noida', 'jamshedpur', 'bhilai', 'cuttack', 'firozabad', 'kochi', 'nellore', 'bhavnagar', 'dehradun', 
  'durgapur', 'asansol', 'rourkela', 'nanded', 'kolhapur', 'ajmer', 'akola', 'gulbarga', 'jamnagar', 
  'ujjain', 'loni', 'siliguri', 'jhansi', 'ulhasnagar', 'jammu', 'sangli', 'mangalore', 'erode', 'belgaum', 
  'ambattur', 'tirunelveli', 'malegaon', 'gaya', 'jalgaon', 'udaipur', 'maheshtala', 'davanagere', 'kozhikode', 'alwar'
];

// --- KYC SUBMISSION MODAL ---
function KycModal({ isOpen, onClose, onSuccess }: { isOpen: boolean; onClose: () => void; onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    name: '', dob: '', documentNumber: '', documentType: '', customDocumentType: '',
  });
  const [frontImage, setFrontImage] = useState<File | null>(null);
  const [backImage, setBackImage] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileDevice, setIsMobileDevice] = useState(false); 
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') setIsMobileDevice(/Mobi|Android|iPhone|iPad|iPod/i.test(navigator.userAgent));
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
      setMessage('Document Image is required.');
      setSubmitting(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const data = new FormData();
      data.append('name', formData.name);
      data.append('dob', formData.dob);
      data.append('documentNumber', formData.documentNumber);
      data.append('documentType', formData.documentType === 'Others' ? formData.customDocumentType : formData.documentType);
      data.append('documentFrontImage', frontImage);
      if (backImage) data.append('documentBackImage', backImage);

      const res = await fetch('https://apitest.binnycash.com/api/user/kyc/submit', {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
        body: data,
      });

      const json = await safeJsonParse(res);
      if (res.ok || json.responseCode === 0 || json.code === 200 || json.type === 'success') {
        setMessage('KYC Submitted Successfully!');
        setTimeout(() => { onSuccess(); onClose(); }, 1500);
      } else {
        setMessage(json.responseMessage || json.message || 'Submission failed.');
      }
    } catch (err) {
      setMessage('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#05070A]/85 backdrop-blur-md p-3 sm:p-6 overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 20 }} 
        animate={{ opacity: 1, scale: 1, y: 0 }} 
        exit={{ opacity: 0, scale: 0.95, y: 20 }} 
        className="relative w-full max-w-[640px] bg-[#0E111E] border border-[#8B5CF6]/30 rounded-[32px] p-6 sm:p-8 text-white shadow-[0_30px_90px_rgba(139,92,246,0.3)] my-auto max-h-[92vh] overflow-y-auto custom-scrollbar"
      >
        <button onClick={onClose} className="absolute top-5 right-5 z-20 w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center cursor-pointer transition-colors">
          <X className="w-5 h-5 text-white" />
        </button>

        <div className="flex items-center gap-4 mb-6 pr-10">
          <div className="w-12 h-12 rounded-2xl bg-[#8B5CF6]/20 border border-[#8B5CF6]/40 flex items-center justify-center shrink-0 shadow-[0_0_20px_rgba(139,92,246,0.3)]">
            <ShieldCheck className="w-6 h-6 text-[#A78BFA]" />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight">Identity Verification</h2>
            <p className="text-xs text-[#8F95A3] mt-0.5">Secure your withdrawals by submitting your document</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          
          <div>
            <label className="block text-[11px] font-bold text-[#8F95A3] uppercase tracking-wider mb-1.5 ml-1">Full Name <span className="text-[#EC4899]">*</span></label>
            <div className="relative flex items-center">
              <User className="absolute left-3.5 w-4 h-4 text-[#8B5CF6]" />
              <input type="text" required placeholder="Enter your full name" className="w-full bg-[#15192C] border border-white/5 rounded-2xl pl-11 pr-4 py-3 text-sm text-white focus:bg-[#1A1E35] focus:border-[#8B5CF6] transition-all" onChange={(e) => setFormData({...formData, name: e.target.value})} />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-[#8F95A3] uppercase tracking-wider mb-1.5 ml-1">Date of Birth <span className="text-[#EC4899]">*</span></label>
              <div className="relative flex items-center">
                <Calendar className="absolute left-3.5 w-4 h-4 text-[#8B5CF6]" />
                <input type="date" required className="w-full bg-[#15192C] border border-white/5 rounded-2xl pl-11 pr-4 py-3 text-sm text-white focus:bg-[#1A1E35] focus:border-[#8B5CF6] transition-all [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert opacity-90" onChange={(e) => setFormData({...formData, dob: e.target.value})} />
              </div>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-[#8F95A3] uppercase tracking-wider mb-1.5 ml-1">Document Number <span className="text-[#EC4899]">*</span></label>
              <div className="relative flex items-center">
                <CreditCard className="absolute left-3.5 w-4 h-4 text-[#8B5CF6]" />
                <input type="text" required placeholder="ID Number" className="w-full bg-[#15192C] border border-white/5 rounded-2xl pl-11 pr-4 py-3 text-sm text-white focus:bg-[#1A1E35] focus:border-[#8B5CF6] transition-all" onChange={(e) => setFormData({...formData, documentNumber: e.target.value})} />
              </div>
            </div>
          </div>

          <div className="relative" ref={dropdownRef}>
            <label className="block text-[11px] font-bold text-[#8F95A3] uppercase tracking-wider mb-1.5 ml-1">Document Type <span className="text-[#EC4899]">*</span></label>
            <div onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="w-full bg-[#15192C] hover:bg-[#1A1E35] border border-white/5 rounded-2xl px-4 py-3 text-sm flex items-center justify-between cursor-pointer transition-colors">
              <span className={formData.documentType ? "text-white" : "text-white/40"}>{formData.documentType || 'Select your document type'}</span>
              <ChevronDown className={`w-4 h-4 text-[#8B5CF6] transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </div>
            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} className="absolute top-full w-full mt-2 bg-[#15192C] border border-[#8B5CF6]/30 rounded-2xl overflow-hidden z-50 shadow-xl">
                  {['National ID', 'Aadhaar Card', 'Voter ID', 'Passport', 'Others'].map((type) => (
                    <div key={type} onClick={() => { setFormData({...formData, documentType: type}); setIsDropdownOpen(false); }} className="px-4 py-3 text-sm text-[#8F95A3] hover:text-white hover:bg-[#8B5CF6]/20 cursor-pointer transition-colors">{type}</div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {formData.documentType === 'Others' && (
            <motion.input initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} type="text" required placeholder="Specify Custom Document" className="w-full bg-[#15192C] border border-white/5 rounded-2xl px-4 py-3 text-sm text-white focus:bg-[#1A1E35] focus:border-[#8B5CF6] transition-all" onChange={(e) => setFormData({...formData, customDocumentType: e.target.value})} />
          )}

          <div className="mt-2">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-4 h-4 text-[#A78BFA]" />
              <span className="text-xs font-bold text-[#A78BFA] uppercase tracking-wider">Instruction & Example</span>
            </div>
            <div className="w-full overflow-hidden rounded-2xl">
              <img src="/kyc.png" alt="KYC Instructions: Document and BINNYCASH note" className="w-full h-auto object-contain mx-auto" />
            </div>
            <p className="text-[11px] text-[#8F95A3] mt-2 italic text-center leading-relaxed">
              * Please upload your document image following these instructions clearly (write <span className="text-white font-bold">"BINNYCASH"</span> on a white paper next to your ID proof).
            </p>
          </div>

          <div className="mt-2">
            <label className="block text-[11px] font-bold text-[#8F95A3] uppercase tracking-wider mb-1.5 ml-1">Upload Document Image <span className="text-[#EC4899]">*</span></label>
            <div className={`relative border-2 border-dashed ${frontImage ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-[#8B5CF6]/30 bg-[#15192C]/40 hover:bg-[#15192C]'} rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 transition-all`}>
              <div className="flex items-center gap-4 text-left w-full sm:w-auto">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${frontImage ? 'bg-emerald-500/20 text-emerald-400' : 'bg-[#8B5CF6]/10 text-[#A78BFA]'}`}>
                  {frontImage ? <CheckCircle2 className="w-6 h-6" /> : <UploadCloud className="w-6 h-6" />}
                </div>
                <div>
                  <p className="text-sm font-bold text-white mb-0.5">{frontImage ? 'Upload Successful' : 'Upload Image'}</p>
                  <p className="text-[10px] text-[#8F95A3]">{frontImage ? frontImage.name : 'Clear, readable photo (.jpg, .png)'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto shrink-0">
                {isMobileDevice && (
                  <label className="flex-1 sm:flex-none py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-white transition-colors cursor-pointer text-center flex items-center justify-center gap-2">
                    <input type="file" accept=".png,.jpg,.jpeg,.webp" capture="environment" className="hidden" onChange={(e) => setFrontImage(e.target.files ? e.target.files[0] : null)} />
                    <Camera className="w-4 h-4 text-[#8B5CF6]" />
                    <span>Camera</span>
                  </label>
                )}
                <label className="flex-1 sm:flex-none py-2.5 px-4 rounded-xl bg-[#8B5CF6]/10 hover:bg-[#8B5CF6]/20 border border-[#8B5CF6]/30 text-xs font-bold text-[#A78BFA] transition-colors cursor-pointer text-center flex items-center justify-center gap-2">
                  <input type="file" accept=".png,.jpg,.jpeg,.webp" className="hidden" onChange={(e) => setFrontImage(e.target.files ? e.target.files[0] : null)} />
                  <UploadCloud className="w-4 h-4" />
                  <span>{frontImage ? 'Change' : 'Browse'}</span>
                </label>
              </div>
            </div>
          </div>

          {message && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`text-xs font-bold text-center py-2 px-4 rounded-xl ${message.includes('Successfully') ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
              {message}
            </motion.p>
          )}

          <div className="flex items-center gap-2 bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20">
            <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
            <p className="text-[10px] text-[#8F95A3] font-medium">Your data is encrypted with bank-grade security and strictly used for compliance.</p>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <button type="button" onClick={onClose} className="py-3.5 rounded-2xl bg-[#15192C] hover:bg-[#1A1E35] border border-white/5 hover:border-white/10 text-white font-bold text-sm transition-all cursor-pointer">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="group py-3.5 rounded-2xl bg-gradient-to-r from-[#7C3AED] to-[#EC4899] hover:opacity-90 text-white font-bold text-sm transition-all shadow-[0_4px_25px_rgba(139,92,246,0.3)] cursor-pointer flex items-center justify-center gap-2">
              {submitting ? (
                <motion.div animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: 'linear' }}>
                  <ShieldCheck className="w-5 h-5" />
                </motion.div>
              ) : (
                <Sparkles className="w-4 h-4" />
              )}
              {submitting ? 'Verifying...' : 'Submit Identity'}
            </button>
          </div>
          
        </form>
      </motion.div>
    </div>
  );
}

// --- VERIFICATION ALERT MODAL ---
function VerificationAlertModal({ isOpen, onClose, onVerifyNow, kycStatus }: { isOpen: boolean; onClose: () => void; onVerifyNow: () => void; kycStatus: string }) {
  if (!isOpen) return null;

  const statusLower = String(kycStatus).toLowerCase();
  const isPending = statusLower === 'pending' || statusLower === 'under_review' || statusLower === 'processing' || statusLower === 'submitted';
  const isRejected = statusLower === 'rejected' || statusLower === 'failed' || statusLower === 'reupload';

  let title = "Identity Verification";
  let desc = "To comply with financial regulations and secure your withdrawals, we need to verify your identity.";
  let showVerifyBtn = true;
  let badgeText = "Required";
  let badgeColor = "text-amber-400 bg-amber-400/10";
  let iconColor = "text-amber-400";
  let IconComponent = ShieldCheck; 

  if (isPending) {
    title = "Review in Progress";
    desc = "Your documents are currently being verified by our team. This process typically takes less than 24 hours.";
    showVerifyBtn = false;
    badgeText = "Pending";
    badgeColor = "text-blue-400 bg-blue-400/10";
    iconColor = "text-blue-400";
    IconComponent = Clock;
  } else if (isRejected) {
    title = "Verification Failed";
    desc = "We couldn't verify your previous submission. Please check the requirements and upload clear documents.";
    showVerifyBtn = true;
    badgeText = "Action Needed";
    badgeColor = "text-rose-400 bg-rose-400/10";
    iconColor = "text-rose-400";
    IconComponent = AlertCircle;
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[#05070A]/80 backdrop-blur-sm p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="relative w-full max-w-[400px] bg-[#0F111A] border border-white/10 rounded-2xl p-6 shadow-2xl overflow-hidden"
      >
        <div className={`absolute top-0 left-0 w-full h-1 ${isPending ? 'bg-blue-500' : isRejected ? 'bg-rose-500' : 'bg-amber-500'}`} />

        <div className="flex items-start gap-4 mb-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${badgeColor}`}>
            <IconComponent className={`w-6 h-6 ${iconColor}`} />
          </div>
          <div className="flex-1 pt-1">
            <div className="flex items-center justify-between mb-1">
              <h3 className="text-xl font-bold text-white leading-none tracking-tight">{title}</h3>
            </div>
            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${badgeColor}`}>
              {badgeText}
            </span>
          </div>
        </div>

        <div className="bg-white/5 rounded-xl p-4 mb-6">
          <p className="text-[#8F95A3] text-sm leading-relaxed">
            {desc}
          </p>
        </div>

        <div className="flex flex-col gap-2.5">
          {showVerifyBtn && (
            <button
              onClick={onVerifyNow}
              className="w-full py-3.5 bg-white text-black hover:bg-gray-100 rounded-xl font-bold text-sm transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
            >
              Proceed to Verification <ChevronRight className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="w-full py-3.5 bg-transparent hover:bg-white/5 text-[#8F95A3] hover:text-white rounded-xl font-bold text-sm transition-all cursor-pointer"
          >
            {showVerifyBtn ? 'Do this later' : 'Close'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

// --- INSUFFICIENT BALANCE ALERT MODAL ---
function InsufficientBalanceModal({ isOpen, onClose, minText, currentBalance, isCoin, currency }: { isOpen: boolean; onClose: () => void; minText: string, currentBalance: number, isCoin: boolean, currency: string }) {
  if (!isOpen) return null;

  const minRequired = isCoin ? 5000 : 5;
  const progressPercent = Math.min((currentBalance / minRequired) * 100, 100);
  const remainingAmount = Math.max(minRequired - currentBalance, 0);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }} 
        animate={{ opacity: 1, scale: 1, y: 0 }} 
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-sm bg-[#111319] border border-white/10 rounded-3xl p-6 sm:p-8 text-center shadow-2xl overflow-hidden"
      >
        <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-[#8F95A3] hover:text-white transition-colors cursor-pointer">
          <X className="w-4 h-4" />
        </button>

        <div className="w-16 h-16 rounded-full bg-rose-500/10 border-2 border-rose-500/20 flex items-center justify-center mx-auto mb-5">
          <AlertTriangle className="w-7 h-7 text-rose-500" />
        </div>

        <h3 className="text-xl font-black text-white mb-2">Insufficient Balance</h3>
        <p className="text-sm text-[#8F95A3] mb-6">
          You need at least <span className="font-bold text-white">{minText}</span> to request a withdrawal. Keep completing tasks to reach the goal!
        </p>

        <div className="bg-[#1A1C24] rounded-2xl p-4 mb-6 border border-white/5">
          <div className="flex justify-between text-xs font-bold text-white mb-2">
            <span>{formatPrice(currentBalance, currency)}</span>
            <span className="text-[#8F95A3]">{minText}</span>
          </div>
          <div className="w-full h-3 rounded-full bg-white/5 overflow-hidden">
            <motion.div 
              initial={{ width: 0 }} 
              animate={{ width: `${progressPercent}%` }} 
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-[#8B5CF6] to-[#A66CFF] rounded-full relative"
            >
               <div className="absolute inset-0 bg-white/20 w-full h-full transform -skew-x-12 animate-[shimmer_2s_infinite]"></div>
            </motion.div>
          </div>
          <p className="text-[11px] text-[#A66CFF] font-bold mt-3 text-center">
            Only {formatPrice(remainingAmount, currency)} more to go!
          </p>
        </div>

        <button 
          onClick={onClose} 
          className="w-full py-3.5 bg-gradient-to-r from-[#8B5CF6] to-[#7C3AED] rounded-2xl font-bold text-sm text-white shadow-[0_4px_15px_rgba(139,92,246,0.3)] hover:shadow-[0_4px_20px_rgba(139,92,246,0.5)] transition-all cursor-pointer"
        >
          Earn More
        </button>
      </motion.div>
    </div>
  );
}

// --- MAIN PAGE ---
export default function CashoutPage() {
  const currency = useCurrency();
  const isCoin = currency === 'Coin' || currency === 'COIN';

  const [totalEarning, setTotalEarning] = useState('0.00');
  const [pendingAmount, setPendingAmount] = useState('0.00');
  const [loading, setLoading] = useState(true);
  
  // KYC STATES
  const [kycStatus, setKycStatus] = useState('not_submited');
  const [kycMessage, setKycMessage] = useState<string | null>(null);

  // Country Logic State
  const [isIndianUser, setIsIndianUser] = useState<boolean>(true);

  // Withdrawals State (KEPT ONLY FOR CALCULATING TOP STAT BLOCKS)
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [withdrawalsLoading, setWithdrawalsLoading] = useState(true);

  // Modals visibility
  const [isKycOpen, setIsKycOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [isBalanceAlertOpen, setIsBalanceAlertOpen] = useState(false);

  // PAYMENT REQUEST FORM STATES
  const [selectedMethod, setSelectedMethod] = useState<any>(null);
  const [amount, setAmount] = useState('');
  const [paymentDetails, setPaymentDetails] = useState<any>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [msg, setMsg] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      const userId = getUserId();
      const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };

      const [resEarning, resView, resUserData] = await Promise.all([
        fetch('https://apitest.binnycash.com/api/user/wallet/total-amount', { method: 'GET', headers }),
        fetch('https://apitest.binnycash.com/api/user/wallet/view', { method: 'GET', headers }),
        fetch(`https://apitest.binnycash.com/api/user/userDetails?userId=${userId}`, { method: 'GET', headers })
      ]);

      const [jsonEarning, jsonView, jsonUserData] = await Promise.all([
        safeJsonParse(resEarning),
        safeJsonParse(resView),
        safeJsonParse(resUserData)
      ]);

      if (jsonEarning.code === 200 && jsonEarning.data) setTotalEarning(jsonEarning.data);
      if (jsonView.code === 200 && jsonView.data) setPendingAmount(jsonView.data.totalPendingAmount ?? '0.00');
      
      if (jsonUserData.code === 200) {
        const user = jsonUserData.data?.user || jsonUserData.data;
        if (user) {
          const countryStr = String(user.country || '').toLowerCase().trim();
          const cityStr = String(user.city || '').toLowerCase().trim();
          
          let isIndia = true;
          if (countryStr) {
            if (countryStr === 'india' || countryStr === 'in' || countryStr === 'ind') isIndia = true;
            else isIndia = indianCities.includes(cityStr);
          } else if (cityStr) {
            isIndia = indianCities.includes(cityStr);
          }
          
          setIsIndianUser(isIndia);
          setKycStatus(user.documentStatus || 'not_submited');
          setKycMessage(user.documentMessage || user.rejectReason || user.adminMessage || user.remark || null);
        }
      }
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUserData(); }, []);

  // FETCH WITHDRAW HISTORY (Needed to show Total Withdrawn & Total Withdrawals on Top Blocks)
  const fetchWithdrawals = async () => {
    setWithdrawalsLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`https://apitest.binnycash.com/api/user/withdrawHistory?page=1`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
      });
      const json = await safeJsonParse(res);
      if (json.code === 200 && json.data) {
        setWithdrawals(json.data.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch withdrawal history:', err);
    } finally {
      setWithdrawalsLoading(false);
    }
  };

  useEffect(() => { fetchWithdrawals(); }, []);

  const availableMethods = isIndianUser ? [
    { id: 'upi', name: 'UPI', desc: 'Transfer to UPI', time: 'Instant', icon: <UPIIcon />, speed: 'fast' },
    { id: 'phonepe', name: 'PhonePe', desc: 'Transfer to PhonePe', time: 'Instant', icon: <PhonePeIcon />, speed: 'fast' },
    { id: 'paytm', name: 'Paytm', desc: 'Withdraw to Paytm', time: 'Instant', icon: <PaytmIcon />, speed: 'fast' },
    { id: 'bank', name: 'Bank Transfer', desc: 'Transfer to your bank', time: '1-3 Business Days', icon: <BankIcon />, speed: 'slow' },
  ] : [
    { id: 'paypal', name: 'PayPal', desc: 'Transfer to PayPal', time: '1-2 Business Days', icon: <PayPalIcon />, speed: 'slow' },
  ];

  const minWithdrawLimit = isCoin ? 5000 : 5;

  const handleMethodCardClick = (methodId: string) => {
    const status = String(kycStatus).toLowerCase();
    if (status !== 'verified' && status !== 'approved') {
      setIsAlertOpen(true);
      return;
    }

    if (Number(totalEarning) < minWithdrawLimit) {
      setIsBalanceAlertOpen(true);
      return;
    }

    const method = availableMethods.find(m => m.id === methodId);
    setSelectedMethod(method);
    setAmount('');
    setPaymentDetails({});
    setMsg(null);
  };

  const handleQuickSelect = (val: number) => setAmount(String(val));
  const feeAmount = amount ? (Number(amount) * 0.05).toFixed(2) : '0.00';
  const receiveAmount = amount ? (Number(amount) - Number(feeAmount)).toFixed(2) : '0.00';

  const handleWithdrawRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || Number(amount) <= 0) {
      setMsg({ text: 'Please enter a valid amount.', type: 'error' });
      return;
    }

    if (Number(amount) < minWithdrawLimit) {
      setMsg({ text: `Minimum withdrawal amount is ${isCoin ? '5000 Coins' : '$5.00'}.`, type: 'error' });
      return;
    }

    if (Number(amount) > Number(totalEarning)) {
      setMsg({ text: 'Amount exceeds your available balance.', type: 'error' });
      return;
    }

    setIsSubmitting(true);
    setMsg(null);

    const token = localStorage.getItem('token');

    const payload = new URLSearchParams();
    payload.append('amount', amount);
    payload.append('method', selectedMethod.id);
    
    if (selectedMethod.id === 'upi') payload.append('upi', paymentDetails.paymentId || '');
    if (selectedMethod.id === 'paytm') payload.append('paytm', paymentDetails.paymentId || '');
    if (selectedMethod.id === 'phonepe') payload.append('phonePay', paymentDetails.paymentId || ''); 
    if (selectedMethod.id === 'paypal') payload.append('paypal', paymentDetails.paymentId || '');
    
    if (selectedMethod.id === 'bank') {
      payload.append('bankName', paymentDetails.bankName || '');
      payload.append('accountNumber', paymentDetails.accountNumber || '');
      payload.append('ifscCode', paymentDetails.ifscCode || '');
    }

    try {
      const res = await fetch('https://apitest.binnycash.com/api/user/withdraw/request', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Bearer ${token}` 
        },
        body: payload
      });

      const data = await safeJsonParse(res);

      if (res.ok || data.code === 200 || data.type === 'success') {
        setMsg({ text: data.message || 'Withdrawal request submitted successfully!', type: 'success' });
        
        if (typeof window !== 'undefined') {
           window.dispatchEvent(new Event('walletUpdated'));
        }
        
        fetchUserData(); 
        fetchWithdrawals();
        setTimeout(() => { setSelectedMethod(null); }, 2000);
      } else {
        setMsg({ text: data.message || 'Failed to process withdrawal.', type: 'error' });
      }
    } catch (err) {
      setMsg({ text: 'Network Error. Please try again.', type: 'error' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getMethodLabel = (id: string) => {
    if (id === 'upi') return 'UPI ID';
    if (id === 'paypal') return 'PayPal Email';
    if (id === 'paytm') return 'Paytm Number';
    if (id === 'phonepe') return 'PhonePe Number';
    return 'ID / Number';
  };

  const getMethodPlaceholder = (id: string) => {
    if (id === 'upi') return 'Enter your UPI ID';
    if (id === 'paypal') return 'Enter your PayPal Email';
    if (id === 'paytm') return 'Enter your Paytm Number';
    if (id === 'phonepe') return 'Enter your PhonePe Number';
    return 'Enter details';
  };

  const getMethodIconComponent = (id: string) => {
    if (id === 'paypal') return <Mail className="absolute left-3.5 w-4 h-4 text-[#8B5CF6]" />;
    return <Smartphone className="absolute left-3.5 w-4 h-4 text-[#8B5CF6]" />;
  };

  const kycStatusLower = String(kycStatus).toLowerCase();
  
  let kycDisplayStatus = 'Not Submitted';
  let badgeColorClass = 'bg-white/5 text-[#8F95A3] border-white/10';

  if (kycStatusLower === 'verified' || kycStatusLower === 'approved') {
    kycDisplayStatus = 'Approved';
    badgeColorClass = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
  } else if (kycStatusLower === 'pending' || kycStatusLower === 'processing' || kycStatusLower === 'submitted' || kycStatusLower === 'under_review') {
    kycDisplayStatus = 'Under Review';
    badgeColorClass = 'bg-amber-500/10 text-amber-400 border-amber-500/30';
  } else if (kycStatusLower === 'rejected' || kycStatusLower === 'failed' || kycStatusLower === 'reupload') {
    kycDisplayStatus = 'Rejected / Re-upload';
    badgeColorClass = 'bg-rose-500/10 text-rose-400 border-rose-500/30';
  }

  const getKycButtonProps = () => {
    if (kycStatusLower === 'verified' || kycStatusLower === 'approved') {
      return { text: 'Approved', disabled: true, className: 'w-full py-3 rounded-xl bg-emerald-500/20 text-emerald-400 font-bold text-sm cursor-not-allowed border border-emerald-500/40 shadow-inner' };
    }
    if (kycStatusLower === 'pending' || kycStatusLower === 'processing' || kycStatusLower === 'submitted' || kycStatusLower === 'under_review') {
      return { text: 'Verification Pending', disabled: true, className: 'w-full py-3 rounded-xl bg-amber-500/20 text-amber-400 font-bold text-sm cursor-not-allowed border border-amber-500/40 shadow-inner' };
    }
    if (kycStatusLower === 'rejected' || kycStatusLower === 'failed' || kycStatusLower === 'reupload') {
      return { text: 'Verify KYC Again', disabled: false, className: 'w-full py-3 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 font-bold text-sm cursor-pointer border border-rose-500/40 flex items-center justify-center gap-2' };
    }
    return { text: 'Verify Now', disabled: false, className: 'w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white font-bold text-sm cursor-pointer hover:shadow-[0_4px_20px_rgba(139,92,246,0.5)] transition-all' };
  };

  const btnProps = getKycButtonProps();

  const totalWithdrawnAmount = withdrawals.reduce((sum, w) => {
    const s = String(w.status || '').toUpperCase();
    return (s === 'COMPLETED' || s === 'APPROVED' || s === 'SUCCESS') ? sum + Number(w.amount || 0) : sum;
  }, 0);
  const totalWithdrawalsCount = withdrawals.length;

  const kycSteps = ['Not Submitted', 'Under Review', 'Approved / Re-upload'];
  type StepState = 'done' | 'active' | 'error' | 'pending';
  let kycStepStates: StepState[] = ['active', 'pending', 'pending']; 

  if (kycStatusLower === 'pending' || kycStatusLower === 'processing' || kycStatusLower === 'submitted' || kycStatusLower === 'under_review') {
    kycStepStates = ['done', 'active', 'pending'];
  } else if (kycStatusLower === 'verified' || kycStatusLower === 'approved') {
    kycStepStates = ['done', 'done', 'done']; 
  } else if (kycStatusLower === 'rejected' || kycStatusLower === 'failed' || kycStatusLower === 'reupload') {
    kycStepStates = ['done', 'done', 'error']; 
  }

  return (
    <div className="flex flex-col bg-[#0B0D19] min-h-[calc(100vh-80px)] text-white relative font-sans overflow-x-hidden">
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-[#8B5CF6]/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="fixed bottom-0 left-10 w-[350px] h-[350px] bg-[#EC4899]/5 blur-[110px] rounded-full pointer-events-none" />

      <main className="w-full max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">

        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-black text-white mb-2 tracking-tight">Cashout Center</h1>
          <p className="text-[#8F95A3] text-[15px] font-medium">Withdraw your earnings instantly and securely</p>
        </div>

        {/* Stats Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
          <div className="bg-[#111319] border border-white/5 rounded-[20px] p-6">
            <div className="w-11 h-11 rounded-xl bg-[#8B5CF6]/10 flex items-center justify-center mb-4 border border-[#8B5CF6]/20">
              <Wallet className="w-5 h-5 text-[#A78BFA]" />
            </div>
            <h3 className="text-[#8F95A3] font-bold text-xs uppercase tracking-wide mb-1.5">Available Balance</h3>
            <span className="text-2xl font-black text-emerald-400 block">{loading ? '...' : formatPrice(Number(totalEarning), currency)}</span>
            <p className="text-[#8F95A3] text-[11px] mt-1.5">Minimum withdrawal: {isCoin ? '5000 Coins' : '$5.00'}</p>
          </div>

          <div className="bg-[#111319] border border-white/5 rounded-[20px] p-6">
            <div className="w-11 h-11 rounded-xl bg-amber-500/10 flex items-center justify-center mb-4 border border-amber-500/20">
              <Clock className="w-5 h-5 text-amber-400" />
            </div>
            <h3 className="text-[#8F95A3] font-bold text-xs uppercase tracking-wide mb-1.5">Pending Amount</h3>
            <span className="text-2xl font-black text-amber-400 block">{loading ? '...' : formatPrice(Number(pendingAmount), currency)}</span>
            <p className="text-[#8F95A3] text-[11px] mt-1.5">In process</p>
          </div>

          <div className="bg-[#111319] border border-white/5 rounded-[20px] p-6">
            <div className="w-11 h-11 rounded-xl bg-emerald-500/10 flex items-center justify-center mb-4 border border-emerald-500/20">
              <CircleDollarSign className="w-5 h-5 text-emerald-400" />
            </div>
            <h3 className="text-[#8F95A3] font-bold text-xs uppercase tracking-wide mb-1.5">Total Withdrawn</h3>
            <span className="text-2xl font-black text-white block">{withdrawalsLoading ? '...' : formatPrice(totalWithdrawnAmount, currency)}</span>
            <p className="text-[#8F95A3] text-[11px] mt-1.5">All time</p>
          </div>

          <div className="bg-[#111319] border border-white/5 rounded-[20px] p-6">
            <div className="w-11 h-11 rounded-xl bg-blue-500/10 flex items-center justify-center mb-4 border border-blue-500/20">
              <ShieldCheck className="w-5 h-5 text-blue-400" />
            </div>
            <h3 className="text-[#8F95A3] font-bold text-xs uppercase tracking-wide mb-1.5">Total Withdrawals</h3>
            <span className="text-2xl font-black text-white block">{withdrawalsLoading ? '...' : totalWithdrawalsCount}</span>
            <p className="text-[#8F95A3] text-[11px] mt-1.5">All time</p>
          </div>
        </div>

        {/* MAIN CASHOUT CONTENT */}
        <div className="mb-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

            {/* LEFT COLUMN */}
            <div className="lg:col-span-2 flex flex-col gap-6">

              {/* Document Verification Section (3 Steps) */}
              <div className="bg-[#111319] border border-[#8B5CF6]/20 rounded-[20px] p-6">
                <div className="flex items-center justify-between mb-1 gap-3">
                  <h2 className="text-lg font-bold text-white">Document Verification</h2>
                  <span className={`shrink-0 px-3 py-1 rounded-lg text-[11px] font-bold uppercase tracking-wide border ${badgeColorClass}`}>
                    {kycDisplayStatus}
                  </span>
                </div>
                <p className="text-[#8F95A3] text-xs mb-6">Submit any government issued document to enable withdrawals</p>

                {/* Stepper (3 Steps) */}
                <div className="flex items-start justify-between mb-6 px-1">
                  {kycSteps.map((step, idx) => {
                    const state = kycStepStates[idx];
                    const isDone = state === 'done';
                    const nodeColor = state === 'error' ? 'bg-rose-500/20 border-rose-500 text-rose-400'
                      : state === 'active' ? 'bg-[#8B5CF6]/20 border-[#8B5CF6] text-[#A78BFA]'
                      : state === 'done' ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
                      : 'bg-white/5 border-white/10 text-[#8F95A3]';
                    const lineActive = kycStepStates[idx - 1] === 'done';
                    return (
                      <div key={step} className="flex-1 flex flex-col items-center text-center relative">
                        {idx !== 0 && <div className={`absolute top-4 right-1/2 w-full h-[2px] -z-10 ${lineActive ? 'bg-[#8B5CF6]/40' : 'bg-white/5'}`} />}
                        <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center text-xs font-bold ${nodeColor}`}>
                          {isDone ? <CheckCircle2 className="w-4 h-4" /> : idx + 1}
                        </div>
                        <span className="text-[11px] font-bold text-white mt-2">{step}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="bg-[#15192C] border border-white/5 rounded-2xl p-4 flex items-start gap-3 mb-4">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                  <div>
                    <p className="text-xs font-bold text-white mb-0.5">Accepted Documents (Any One)</p>
                    <p className="text-[11px] text-[#8F95A3] leading-relaxed">Aadhaar Card, PAN Card, Driving License, Passport, Voter ID, Bank Passbook, Ration Card, Government ID etc.</p>
                  </div>
                </div>

                {kycMessage && (
                  <div className={`mb-4 p-2.5 rounded-lg border text-[11px] font-medium leading-relaxed ${
                    (kycStatusLower === 'rejected' || kycStatusLower === 'reupload' || kycStatusLower === 'failed')
                      ? 'bg-rose-500/10 border-rose-500/20 text-rose-400'
                      : 'bg-amber-500/10 border-amber-500/20 text-amber-400'
                  }`}>
                    <span className="font-bold uppercase tracking-wider block mb-0.5 text-[9px] opacity-80">Admin Note</span>
                    {kycMessage}
                  </div>
                )}

                <button 
                  onClick={() => !btnProps.disabled && setIsKycOpen(true)} 
                  disabled={btnProps.disabled} 
                  className={btnProps.className}
                >
                  {kycStatusLower === 'rejected' || kycStatusLower === 'reupload' || kycStatusLower === 'failed' ? (
                    <>
                      <RefreshCw className="w-4 h-4" />
                      <span>Verify KYC Again</span>
                    </>
                  ) : (
                    btnProps.text
                  )}
                </button>
              </div>

              {/* Choose Withdrawal Method */}
              <div className="bg-[#111319] border border-white/5 rounded-[20px] p-6">
                <h2 className="text-lg font-bold text-white mb-1">Choose Withdrawal Method</h2>
                <p className="text-[#8F95A3] text-sm mb-6 font-medium">Fast, secure and convenient options</p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {availableMethods.map((method) => {
                    const isSelected = selectedMethod?.id === method.id;
                    return (
                      <div
                        key={method.id}
                        onClick={() => handleMethodCardClick(method.id)}
                        className={`relative bg-[#15192C] border rounded-2xl p-5 cursor-pointer transition-all duration-200 flex items-start gap-4 ${isSelected ? 'border-[#8B5CF6] shadow-[0_0_0_1px_rgba(139,92,246,0.4)]' : 'border-white/5 hover:border-[#8B5CF6]/40'}`}
                      >
                        {method.speed === 'fast' && (
                          <span className="absolute top-3 right-3 text-[9px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-md bg-[#10B981]/10 text-[#10B981]">Instant</span>
                        )}
                        <div className="shrink-0">{method.icon}</div>
                        <div className="flex flex-col">
                          <h3 className="text-white font-bold text-[15px]">{method.name}</h3>
                          <p className="text-[#8F95A3] text-[12px] mt-0.5">{method.desc}</p>
                          <div className="flex items-center gap-2 mt-2">
                            <span className={`inline-flex items-center gap-1 text-[10px] font-bold ${method.speed === 'fast' ? 'text-[#10B981]' : 'text-[#3B82F6]'}`}>
                              {method.speed === 'fast' ? <Zap className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                              {method.time}
                            </span>
                          </div>
                        </div>
                        {isSelected && (
                          <div className="absolute bottom-3 right-3 w-5 h-5 rounded-full bg-[#8B5CF6] flex items-center justify-center">
                            <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN */}
            <div className="bg-[#111319] border border-[#8B5CF6]/20 rounded-[20px] p-6 lg:sticky lg:top-6">
              <h2 className="text-lg font-bold text-white mb-5">Withdrawal Details</h2>

              {msg && (
                <div className={`mb-4 p-3 rounded-xl flex items-start gap-2 text-sm font-bold ${msg.type === 'success' ? 'bg-[#00E57A]/10 text-[#00E57A]' : 'bg-[#FF5D73]/10 text-[#FF5D73]'}`}>
                  {msg.type === 'success' ? <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" /> : <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />}
                  <span>{msg.text}</span>
                </div>
              )}

              {!selectedMethod ? (
                <div className="py-10 text-center">
                  <Wallet className="w-10 h-10 text-[#8F95A3] mx-auto mb-3 opacity-50" />
                  <p className="text-[#8F95A3] text-sm font-medium">Select a withdrawal method from the left to continue.</p>
                </div>
              ) : (
                <form onSubmit={handleWithdrawRequest} className="flex flex-col gap-4">

                  <div className="flex items-center gap-3 pb-4 border-b border-white/5">
                    <div className="shrink-0">{selectedMethod.icon}</div>
                    <div>
                      <p className="text-white font-bold text-sm">{selectedMethod.name}</p>
                      <p className="text-[#8F95A3] text-[11px]">{selectedMethod.time}</p>
                    </div>
                    <button type="button" onClick={() => setSelectedMethod(null)} className="ml-auto w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white cursor-pointer">
                      <X className="w-4 h-4" />
                    </button>
                  </div>

                  {selectedMethod.id === 'bank' ? (
                    <>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-bold text-[#8F95A3] uppercase ml-1">Bank Name</label>
                        <div className="relative flex items-center">
                          <Building className="absolute left-3.5 w-4 h-4 text-[#8B5CF6]" />
                          <input type="text" required placeholder="Enter bank name" value={paymentDetails.bankName || ''} onChange={(e) => setPaymentDetails({...paymentDetails, bankName: e.target.value})} className="w-full bg-[#15192C] border border-white/10 rounded-2xl pl-11 pr-4 py-3 text-sm text-white focus:outline-none focus:border-[#8B5CF6] focus:ring-2 focus:ring-[#8B5CF6]/20 transition-all" />
                        </div>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-bold text-[#8F95A3] uppercase ml-1">Account Number</label>
                        <div className="relative flex items-center">
                          <Hash className="absolute left-3.5 w-4 h-4 text-[#8B5CF6]" />
                          <input type="text" required placeholder="0000000000" value={paymentDetails.accountNumber || ''} onChange={(e) => setPaymentDetails({...paymentDetails, accountNumber: e.target.value})} className="w-full bg-[#15192C] border border-white/10 rounded-2xl pl-11 pr-4 py-3 text-sm text-white focus:outline-none focus:border-[#8B5CF6] focus:ring-2 focus:ring-[#8B5CF6]/20 transition-all" />
                        </div>
                      </div>
                      <div className="flex flex-col gap-1.5">
                        <label className="text-[11px] font-bold text-[#8F95A3] uppercase ml-1">IFSC Code</label>
                        <div className="relative flex items-center">
                          <MapPin className="absolute left-3.5 w-4 h-4 text-[#8B5CF6]" />
                          <input type="text" required placeholder="IFSC Code" value={paymentDetails.ifscCode || ''} onChange={(e) => setPaymentDetails({...paymentDetails, ifscCode: e.target.value})} className="w-full bg-[#15192C] border border-white/10 rounded-2xl pl-11 pr-4 py-3 text-sm text-white uppercase focus:outline-none focus:border-[#8B5CF6] focus:ring-2 focus:ring-[#8B5CF6]/20 transition-all" />
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col gap-1.5">
                      <label className="text-[11px] font-bold text-[#8F95A3] uppercase ml-1">{getMethodLabel(selectedMethod.id)}</label>
                      <div className="relative flex items-center">
                        {getMethodIconComponent(selectedMethod.id)}
                        <input type={selectedMethod.id === 'paypal' ? 'email' : 'text'} required placeholder={getMethodPlaceholder(selectedMethod.id)} value={paymentDetails.paymentId || ''} onChange={(e) => setPaymentDetails({...paymentDetails, paymentId: e.target.value})} className="w-full bg-[#15192C] border border-white/10 rounded-2xl pl-11 pr-4 py-3 text-sm text-white focus:outline-none focus:border-[#8B5CF6] focus:ring-2 focus:ring-[#8B5CF6]/20 transition-all" />
                      </div>
                    </div>
                  )}

                  <div className="flex flex-col gap-1.5 mt-1">
                    <label className="text-[11px] font-bold text-[#8F95A3] uppercase ml-1">Amount ({isCoin ? 'Coins' : 'USD'})</label>
                    <div className="relative flex items-center">
                      <span className="absolute left-4 font-black text-[#8B5CF6]">{isCoin ? 'C' : '$'}</span>
                      <input type="number" required min="0.01" step="0.01" placeholder="Enter amount" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full bg-[#15192C] border border-white/10 rounded-2xl pl-10 pr-16 py-3 text-sm text-white font-bold focus:outline-none focus:border-[#8B5CF6] focus:ring-2 focus:ring-[#8B5CF6]/20 transition-all" />
                      <button type="button" onClick={() => setAmount(String(totalEarning))} className="absolute right-2 text-[10px] font-bold text-[#A78BFA] bg-[#8B5CF6]/10 border border-[#8B5CF6]/30 rounded-lg px-2.5 py-1.5 cursor-pointer hover:bg-[#8B5CF6]/20">MAX</button>
                    </div>
                    <p className="text-[10px] text-[#8F95A3] ml-1">Min. {isCoin ? '5000 Coins' : '$5.00'} &middot; Available: {formatPrice(Number(totalEarning), currency)}</p>
                  </div>

                  <div className="bg-[#15192C] border border-[#8B5CF6]/20 rounded-2xl p-4 flex flex-col gap-2 shadow-inner mt-1">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-[#FF5D73]">Processing fee (5%)</span>
                      <span className="text-xs font-bold text-[#FF5D73]">{isCoin ? 'C' : '$'}{feeAmount}</span>
                    </div>
                    <div className="flex justify-between items-center mt-1 pt-2 border-t border-white/5">
                      <span className="text-sm font-black text-[#00E57A]">You will receive</span>
                      <span className="text-sm font-black text-[#00E57A]">{isCoin ? 'C' : '$'}{receiveAmount}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-2 mt-1">
                    {[10, 25, 50, 100].map((val) => (
                      <button key={val} type="button" onClick={() => handleQuickSelect(val)} className="bg-[#15192C] hover:bg-[#8B5CF6]/20 border border-white/10 rounded-xl py-2.5 text-xs font-bold text-white transition-all cursor-pointer">$ {val}</button>
                    ))}
                  </div>

                  <button type="submit" disabled={isSubmitting} className="w-full bg-gradient-to-r from-[#7C3AED] to-[#EC4899] hover:opacity-95 text-white font-black text-sm uppercase py-4 rounded-2xl mt-2 shadow-[0_4px_25px_rgba(139,92,246,0.4)] flex justify-center items-center gap-2 cursor-pointer">
                    {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
                    {isSubmitting ? 'Processing...' : 'Withdraw Now'}
                  </button>

                  <div className="flex items-center gap-2 justify-center mt-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-[10px] text-[#8F95A3]">Your transaction is secure and encrypted</span>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Footer Features Bar */}
        <div className="bg-[#111319] border border-white/5 rounded-[20px] p-6 lg:p-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 divide-y sm:divide-y-0 sm:divide-x divide-white/5">
            {features.map((feature, index) => (
              <div key={index} className={`flex items-start gap-4 ${index !== 0 ? 'pt-6 sm:pt-0 sm:pl-6 lg:pl-8' : ''}`}>
                <div className="w-10 h-10 rounded-full bg-[#8B5CF6]/10 flex items-center justify-center shrink-0 border border-[#8B5CF6]/20">
                  {feature.icon}
                </div>
                <div className="flex flex-col">
                  <h4 className="text-white font-bold text-sm">{feature.title}</h4>
                  <p className="text-[#8F95A3] text-xs mt-1">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </main>

      <KycModal isOpen={isKycOpen} onClose={() => setIsKycOpen(false)} onSuccess={() => { setKycStatus('pending'); fetchUserData(); }} />
      <VerificationAlertModal isOpen={isAlertOpen} onClose={() => setIsAlertOpen(false)} onVerifyNow={() => { setIsAlertOpen(false); setIsKycOpen(true); }} kycStatus={kycStatus} />
      
      {/* INSUFFICIENT BALANCE MODAL */}
      <InsufficientBalanceModal 
        isOpen={isBalanceAlertOpen} 
        onClose={() => setIsBalanceAlertOpen(false)} 
        minText={isCoin ? '5000 Coins' : '$5.00'} 
        currentBalance={Number(totalEarning)}
        isCoin={isCoin}
        currency={currency}
      />

    </div>
  );
}