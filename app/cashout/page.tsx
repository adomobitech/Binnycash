'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wallet, Coins, CreditCard, IndianRupee,
  Clock, ShieldCheck, ChevronRight, Zap, 
  Landmark, CircleDollarSign, User, Calendar, 
  MapPin, Building, Hash, UploadCloud, X, ChevronDown, CheckCircle2, AlertCircle, Camera, Loader2, Smartphone, Mail, RefreshCw
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

// --- STATIC DATA ---
const withdrawalMethods = [
  { id: 'phonepe', name: 'PhonePe', desc: 'Transfer to PhonePe', time: 'Instant', icon: <PhonePeIcon />, speed: 'fast' },
  { id: 'paytm', name: 'Paytm', desc: 'Withdraw to Paytm', time: 'Instant', icon: <PaytmIcon />, speed: 'fast' },
  { id: 'bank', name: 'Bank Transfer', desc: 'Transfer to your bank', time: '1-3 Business Days', icon: <BankIcon />, speed: 'slow' },
  { id: 'paypal', name: 'PayPal', desc: 'Transfer to PayPal', time: '1-2 Business Days', icon: <PayPalIcon />, speed: 'slow' },
];

const features = [
  { icon: <ShieldCheck className="w-5 h-5 text-[#8B5CF6]" />, title: '100% Secure', desc: 'Your transactions are safe with us' },
  { icon: <Zap className="w-5 h-5 text-[#8B5CF6]" />, title: 'Fast Processing', desc: 'Instant or quick withdrawals' },
  { icon: <CircleDollarSign className="w-5 h-5 text-[#8B5CF6]" />, title: 'Low Minimum', desc: 'Only minimum withdrawal limit' },
  { icon: <ShieldCheck className="w-5 h-5 text-[#8B5CF6]" />, title: '24/7 Support', desc: "We're here to help you anytime" },
];

// --- KYC SUBMISSION MODAL ---
function KycModal({ isOpen, onClose, onSuccess }: { isOpen: boolean; onClose: () => void; onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    firstName: '', lastName: '', dob: '', documentNumber: '', documentType: '', customDocumentType: '',
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
      setMessage('Front Image is required.');
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
      data.append('documentType', formData.documentType === 'Others' ? formData.customDocumentType : formData.documentType);
      data.append('documentFrontImage', frontImage);
      if (backImage) data.append('documentBackImage', backImage);

      const res = await fetch('https://apitest.binnycash.com/api/user/kyc/submit', {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
        body: data,
      });

      const responseText = await res.text();
      try {
        const json = JSON.parse(responseText);
        if (res.ok || json.responseCode === 0 || json.code === 200 || json.type === 'success') {
          setMessage('KYC Submitted Successfully!');
          setTimeout(() => { onSuccess(); onClose(); }, 1500);
        } else {
          setMessage(json.responseMessage || json.message || 'Submission failed.');
        }
      } catch {
        setMessage('Server error: API endpoint invalid.');
      }
    } catch (err) {
      setMessage('Network error. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center bg-[#070913]/85 backdrop-blur-md p-3 sm:p-6 overflow-y-auto">
      <motion.div initial={{ opacity: 0, scale: 0.95, y: -20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: -20 }} className="relative w-full max-w-[760px] bg-[#0E111E] border border-[#8B5CF6]/30 rounded-[32px] p-6 sm:p-8 text-white shadow-[0_25px_60px_rgba(139,92,246,0.25)] my-6 max-h-[92vh] overflow-y-auto custom-scrollbar">
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#8B5CF6]/10 border border-[#8B5CF6]/40 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-[#A78BFA]" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-white">Identity Verification</h2>
              <p className="text-xs text-[#8F95A3] mt-0.5">Verify your identity to ensure secure withdrawals</p>
            </div>
          </div>
          <button onClick={onClose} className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center cursor-pointer"><X className="w-5 h-5" /></button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-white/80 mb-1.5">First Name <span className="text-[#EC4899]">*</span></label>
              <div className="relative flex items-center">
                <User className="absolute left-3.5 w-4 h-4 text-[#8B5CF6]" />
                <input type="text" required placeholder="First name" className="w-full bg-[#15192C] border border-white/10 rounded-2xl pl-11 pr-4 py-3 text-sm focus:border-[#8B5CF6] transition-all" onChange={(e) => setFormData({...formData, firstName: e.target.value})} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-white/80 mb-1.5">Last Name <span className="text-[#EC4899]">*</span></label>
              <div className="relative flex items-center">
                <User className="absolute left-3.5 w-4 h-4 text-[#8B5CF6]" />
                <input type="text" required placeholder="Last name" className="w-full bg-[#15192C] border border-white/10 rounded-2xl pl-11 pr-4 py-3 text-sm focus:border-[#8B5CF6] transition-all" onChange={(e) => setFormData({...formData, lastName: e.target.value})} />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-white/80 mb-1.5">Date of Birth <span className="text-[#EC4899]">*</span></label>
              <div className="relative flex items-center">
                <Calendar className="absolute left-3.5 w-4 h-4 text-[#8B5CF6]" />
                <input type="date" required className="w-full bg-[#15192C] border border-white/10 rounded-2xl pl-11 pr-4 py-3 text-sm focus:border-[#8B5CF6] transition-all [&::-webkit-calendar-picker-indicator]:filter [&::-webkit-calendar-picker-indicator]:invert" onChange={(e) => setFormData({...formData, dob: e.target.value})} />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-white/80 mb-1.5">Document Number <span className="text-[#EC4899]">*</span></label>
              <div className="relative flex items-center">
                <CreditCard className="absolute left-3.5 w-4 h-4 text-[#8B5CF6]" />
                <input type="text" required placeholder="Document number" className="w-full bg-[#15192C] border border-white/10 rounded-2xl pl-11 pr-4 py-3 text-sm focus:border-[#8B5CF6] transition-all" onChange={(e) => setFormData({...formData, documentNumber: e.target.value})} />
              </div>
            </div>
          </div>

          <div className="relative" ref={dropdownRef}>
            <label className="block text-xs font-bold text-white/80 mb-1.5">Document Type <span className="text-[#EC4899]">*</span></label>
            <div onClick={() => setIsDropdownOpen(!isDropdownOpen)} className="w-full bg-[#15192C] border border-white/10 rounded-2xl px-4 py-3 text-sm flex justify-between cursor-pointer">
              <span>{formData.documentType || 'Select Document'}</span>
              <ChevronDown className="w-4 h-4 text-white/50" />
            </div>
            {isDropdownOpen && (
              <div className="absolute top-full w-full mt-2 bg-[#15192C] border border-[#8B5CF6]/30 rounded-2xl overflow-hidden z-50">
                {['National ID', 'Aadhaar Card', 'Voter ID', 'Passport', 'Others'].map((type) => (
                  <div key={type} onClick={() => { setFormData({...formData, documentType: type}); setIsDropdownOpen(false); }} className="px-4 py-3 text-sm hover:bg-[#8B5CF6]/20 cursor-pointer">{type}</div>
                ))}
              </div>
            )}
          </div>

          {formData.documentType === 'Others' && (
            <input type="text" required placeholder="Specify Custom Document" className="w-full bg-[#15192C] border border-white/10 rounded-2xl px-4 py-3 text-sm focus:border-[#8B5CF6]" onChange={(e) => setFormData({...formData, customDocumentType: e.target.value})} />
          )}

          <div className="w-full rounded-2xl overflow-hidden border border-white/10 bg-white/5 mt-4 mb-2">
            <img src="/kyc.png" alt="KYC Instructions: Document and BINNYCASH note" className="w-full h-auto object-contain" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
            <div className={`border-2 border-dashed ${frontImage ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-[#8B5CF6]/30 bg-[#15192C]/50'} rounded-2xl p-5 text-center transition-all`}>
              <div className="flex gap-4 mb-3 justify-center">
                {isMobileDevice && (
                  <label className="flex flex-col items-center cursor-pointer group">
                    <input type="file" accept=".png,.jpg,.jpeg,.webp" capture="environment" className="hidden" onChange={(e) => setFrontImage(e.target.files ? e.target.files[0] : null)} />
                    <div className="w-12 h-12 rounded-2xl bg-[#8B5CF6]/10 border border-[#8B5CF6]/30 flex items-center justify-center group-hover:scale-110 transition-all shadow-sm">
                      <Camera className="w-5 h-5 text-[#A78BFA]" />
                    </div>
                    <span className="text-[10px] text-[#8F95A3] mt-1.5 font-medium group-hover:text-white transition-colors">Take Photo</span>
                  </label>
                )}
                <label className="flex flex-col items-center cursor-pointer group">
                  <input type="file" accept=".png,.jpg,.jpeg,.webp" className="hidden" onChange={(e) => setFrontImage(e.target.files ? e.target.files[0] : null)} />
                  <div className="w-12 h-12 rounded-2xl bg-[#8B5CF6]/10 border border-[#8B5CF6]/30 flex items-center justify-center group-hover:scale-110 transition-all shadow-sm">
                    <UploadCloud className="w-5 h-5 text-[#A78BFA]" />
                  </div>
                  <span className="text-[10px] text-[#8F95A3] mt-1.5 font-medium group-hover:text-white transition-colors">Upload File</span>
                </label>
              </div>
              <p className="text-sm font-bold text-white mb-0.5">Front Image <span className="text-[#EC4899]">*</span></p>
              {frontImage && <span className="mt-2 text-[11px] font-bold text-emerald-400">✓ Selected</span>}
            </div>
            <div className={`border-2 border-dashed ${backImage ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-white/20 bg-[#15192C]/30'} rounded-2xl p-5 text-center transition-all`}>
              <div className="flex gap-4 mb-3 justify-center">
                {isMobileDevice && (
                  <label className="flex flex-col items-center cursor-pointer group">
                    <input type="file" accept=".png,.jpg,.jpeg,.webp" capture="environment" className="hidden" onChange={(e) => setBackImage(e.target.files ? e.target.files[0] : null)} />
                    <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:scale-110 transition-all shadow-sm">
                      <Camera className="w-5 h-5 text-white/50 group-hover:text-white" />
                    </div>
                    <span className="text-[10px] text-[#8F95A3] mt-1.5 font-medium group-hover:text-white transition-colors">Take Photo</span>
                  </label>
                )}
                <label className="flex flex-col items-center cursor-pointer group">
                  <input type="file" accept=".png,.jpg,.jpeg,.webp" className="hidden" onChange={(e) => setBackImage(e.target.files ? e.target.files[0] : null)} />
                  <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:scale-110 transition-all shadow-sm">
                    <UploadCloud className="w-5 h-5 text-white/50 group-hover:text-white" />
                  </div>
                  <span className="text-[10px] text-[#8F95A3] mt-1.5 font-medium group-hover:text-white transition-colors">Upload File</span>
                </label>
              </div>
              <p className="text-sm font-bold text-white mb-0.5">Back Image <span className="text-white/40 text-xs">(Optional)</span></p>
              {backImage && <span className="mt-2 text-[11px] font-bold text-emerald-400">✓ Selected</span>}
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
            <button type="button" onClick={onClose} className="py-3.5 rounded-2xl bg-[#15192C] hover:bg-[#1E233B] border border-white/10 text-white font-bold text-sm transition-all cursor-pointer shadow-md">
              Cancel
            </button>
            <button type="submit" disabled={submitting} className="group py-3.5 rounded-2xl bg-gradient-to-r from-[#7C3AED] via-[#8B5CF6] to-[#EC4899] hover:opacity-95 text-white font-bold text-sm transition-all shadow-[0_4px_25px_rgba(139,92,246,0.4)] hover:shadow-[0_4px_30px_rgba(139,92,246,0.6)] cursor-pointer flex items-center justify-center gap-2 relative overflow-hidden">
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

// --- DYNAMIC VERIFICATION ALERT MODAL ---
function VerificationAlertModal({ isOpen, onClose, onVerifyNow, kycStatus }: { isOpen: boolean; onClose: () => void; onVerifyNow: () => void; kycStatus: string }) {
  if (!isOpen) return null;

  const statusLower = String(kycStatus).toLowerCase();
  const isPending = statusLower === 'pending' || statusLower === 'under_review' || statusLower === 'processing' || statusLower === 'submitted';
  const isRejected = statusLower === 'rejected' || statusLower === 'failed' || statusLower === 'reupload';

  let title = "Verification Required";
  let desc = "Oops! It looks like your account is not verified yet. Please submit your documents to proceed.";
  let showVerifyBtn = true;

  if (isPending) {
    title = "Verification Pending";
    desc = "Your KYC documents are currently under review. Please wait for approval before requesting a withdrawal.";
    showVerifyBtn = false;
  } else if (isRejected) {
    title = "Verification Failed";
    desc = "Your previous KYC submission was rejected. Please review the admin notes and re-submit your documents.";
    showVerifyBtn = true;
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#070913]/85 backdrop-blur-md p-4">
      <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="relative w-full max-w-[440px] bg-[#0E111E] border border-[#8B5CF6]/30 rounded-[32px] p-6 sm:p-8 text-center text-white shadow-2xl">
        <AlertCircle className="w-14 h-14 text-amber-400 mx-auto mb-4" />
        <h3 className="text-2xl font-black mb-2.5">{title}</h3>
        <p className="text-sm text-[#8F95A3] mb-8 px-2">{desc}</p>
        <div className={`grid gap-4 ${showVerifyBtn ? 'grid-cols-2' : 'grid-cols-1 max-w-[200px] mx-auto'}`}>
          <button onClick={onClose} className="py-3.5 bg-[#15192C] hover:bg-[#1E233B] border border-white/10 rounded-2xl font-bold text-sm transition-all cursor-pointer">Close</button>
          {showVerifyBtn && (
            <button onClick={onVerifyNow} className="py-3.5 bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] rounded-2xl font-bold text-sm hover:opacity-90 cursor-pointer">Verify Now</button>
          )}
        </div>
      </motion.div>
    </div>
  );
}

// --- INSUFFICIENT BALANCE ALERT MODAL ---
function InsufficientBalanceModal({ isOpen, onClose, minText }: { isOpen: boolean; onClose: () => void; minText: string }) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#070913]/85 backdrop-blur-md p-4">
      <motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="relative w-full max-w-[440px] bg-[#0E111E] border border-[#8B5CF6]/30 rounded-[32px] p-6 sm:p-8 text-center text-white shadow-2xl">
        <AlertCircle className="w-14 h-14 text-amber-400 mx-auto mb-4" />
        <h3 className="text-2xl font-black mb-2.5">Minimum Balance Required</h3>
        <p className="text-sm text-[#8F95A3] mb-8 px-2">Your available balance is below the minimum withdrawal limit. You need at least {minText} to request a withdrawal.</p>
        <button onClick={onClose} className="w-full py-3.5 bg-gradient-to-r from-[#8B5CF6] to-[#EC4899] rounded-2xl font-bold text-sm hover:opacity-90 cursor-pointer">Got it</button>
      </motion.div>
    </div>
  );
}

// --- MAIN PAGE ---
export default function CashoutPage() {
  const currency = useCurrency();
  const isCoin = currency === 'Coin' || currency === 'COIN';

  const [activeTab, setActiveTab] = useState('cash');
  const [totalEarning, setTotalEarning] = useState('0.00');
  const [pendingAmount, setPendingAmount] = useState('0.00');
  const [loading, setLoading] = useState(true);
  
  // KYC STATES
  const [kycStatus, setKycStatus] = useState('not_submited');
  const [kycMessage, setKycMessage] = useState<string | null>(null);

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
      const headers = { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` };

      const resEarning = await fetch('https://apitest.binnycash.com/api/user/wallet/total-earning', { method: 'GET', headers });
      const jsonEarning = await resEarning.json();
      if (jsonEarning.code === 200 && jsonEarning.data) setTotalEarning(jsonEarning.data);

      const resView = await fetch('https://apitest.binnycash.com/api/user/wallet/view', { method: 'GET', headers });
      const jsonView = await resView.json();
      if (jsonView.code === 200 && jsonView.data) setPendingAmount(jsonView.data.totalPendingAmount ?? '0.00');

      const resUserData = await fetch('https://apitest.binnycash.com/api/user/viewData', { method: 'GET', headers });
      const jsonUserData = await resUserData.json();
      
      if (jsonUserData.code === 200 && jsonUserData.data?.user?.documents) {
        const docs = jsonUserData.data.user.documents;
        setKycStatus(docs.status || 'not_submited');
        setKycMessage(docs.reason || docs.adminMessage || docs.message || docs.rejectReason || docs.remark || null);
      }
    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUserData(); }, []);

  const fetchWithdrawals = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('https://apitest.binnycash.com/api/user/wallet/cashout-list', {
        method: 'GET',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
      });
      const json = await res.json();
      if (json.code === 200 && json.data?.list) {
        setWithdrawals(json.data.list);
      }
    } catch (err) {
      console.error('Failed to fetch withdrawals:', err);
    } finally {
      setWithdrawalsLoading(false);
    }
  };

  useEffect(() => { fetchWithdrawals(); }, []);

  const getMethodIcon = (method: string | null) => {
    switch ((method || '').toLowerCase()) {
      case 'upi': return <UPIIcon />;
      case 'phonepe': return <PhonePeIcon />;
      case 'bank': return <BankIcon />;
      case 'paytm': return <PaytmIcon />;
      case 'paypal': return <PayPalIcon />;
      default: return <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center"><Wallet className="w-5 h-5 text-[#8F95A3]" /></div>;
    }
  };

  const getStatusStyle = (status: string) => {
    switch ((status || '').toUpperCase()) {
      case 'PENDING': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'COMPLETED': case 'APPROVED': case 'SUCCESS': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'REJECTED': case 'FAILED': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      default: return 'bg-white/5 text-white/60 border-white/10';
    }
  };

  const minWithdrawLimit = isCoin ? 5000 : 5;

  const handleMethodCardClick = (methodId: string) => {
    if (Number(totalEarning) < minWithdrawLimit) {
      setIsBalanceAlertOpen(true);
      return;
    }

    const status = String(kycStatus).toLowerCase();
    if (status !== 'verified' && status !== 'approved') {
      setIsAlertOpen(true);
      return;
    }

    const method = withdrawalMethods.find(m => m.id === methodId);
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

      const data = await res.json();

      if (res.ok || data.code === 200 || data.type === 'success') {
        setMsg({ text: data.message || 'Withdrawal request submitted successfully!', type: 'success' });
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

  // KYC STATUS & 3-STEP CONFIGURATION BASED ON BACKEND
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
    kycDisplayStatus = 'Rejected';
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

  // STRICTLY 3 STEPS: Dynamic 3rd step label based on backend status
  let thirdStepLabel = 'Approved';
  if (kycStatusLower === 'rejected' || kycStatusLower === 'failed' || kycStatusLower === 'reupload') {
    thirdStepLabel = 'Re-upload';
  }

  const kycSteps = ['Not Submitted', 'Under Review', thirdStepLabel];
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
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

        {/* TABS */}
        <div className="flex items-center gap-8 border-b border-white/5 mb-8">
          <button onClick={() => setActiveTab('cash')} className={`pb-4 text-sm font-bold relative ${activeTab === 'cash' ? 'text-[#8B5CF6]' : 'text-[#8F95A3]'}`}>
            Cashout
            {activeTab === 'cash' && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 w-full h-[2px] bg-[#8B5CF6]" />}
          </button>
          <button onClick={() => setActiveTab('history')} className={`pb-4 text-sm font-bold relative ${activeTab === 'history' ? 'text-[#8B5CF6]' : 'text-[#8F95A3]'}`}>
            My Withdrawals
            {activeTab === 'history' && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 w-full h-[2px] bg-[#8B5CF6]" />}
          </button>
        </div>

        <AnimatePresence mode="wait">
        {activeTab === 'cash' ? (
          <motion.div key="cash" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="mb-10">

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

              {/* LEFT COLUMN */}
              <div className="lg:col-span-2 flex flex-col gap-6">

                {/* Document Verification Section (3 Steps) */}
                <div className="bg-[#111319] border border-[#8B5CF6]/20 rounded-[20px] p-6">
                  <div className="flex items-center justify-between mb-1 gap-3">
                    <h2 className="text-lg font-bold text-white">Document Verification (Any Document)</h2>
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
                    {withdrawalMethods.map((method) => {
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
          </motion.div>
        ) : (
          <motion.div key="history" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }} className="mb-10">
            {withdrawalsLoading ? (
              <div className="space-y-3">
                {[0, 1, 2].map((i) => <div key={i} className="h-20 rounded-[18px] bg-[#111319] border border-white/5" />)}
              </div>
            ) : withdrawals.length === 0 ? (
              <div className="py-20 text-center bg-[#111319] border border-white/5 rounded-[20px]">
                <Clock className="w-12 h-12 text-[#8F95A3] mx-auto mb-4 opacity-50" />
                <h3 className="text-white font-bold text-lg mb-1">No withdrawals yet</h3>
              </div>
            ) : (
              <div className="space-y-3">
                {withdrawals.map((w) => (
                  <div key={w._id} className="bg-[#111319] border border-white/5 rounded-[18px] p-4 sm:p-5 flex items-center gap-4">
                    <div className="shrink-0">{getMethodIcon(w.method)}</div>
                    <div className="flex-grow min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-white font-bold text-sm">{w.method ? w.method.toUpperCase() : 'Method Not Selected'}</h4>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${getStatusStyle(w.status)}`}>{w.status}</span>
                      </div>
                      <p className="text-[#8F95A3] text-xs mt-1 truncate">Txn #{w.transactionId} · {w.transactionTime ? new Date(w.transactionTime).toLocaleString() : ''}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <span className="text-lg font-black text-white">{formatPrice(Number(w.amount), currency)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
        </AnimatePresence>

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
      <InsufficientBalanceModal isOpen={isBalanceAlertOpen} onClose={() => setIsBalanceAlertOpen(false)} minText={isCoin ? '5000 Coins' : '$5.00'} />

    </div>
  );
}