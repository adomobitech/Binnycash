'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wallet, Coins, CreditCard, Bitcoin, IndianRupee,
  Clock, ShieldCheck, ChevronRight, Zap, 
  Landmark, CircleDollarSign, User, Calendar, 
  MapPin, Home, Building, Hash, UploadCloud, FileText, X, ChevronDown, CheckCircle2, AlertCircle
} from 'lucide-react';

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

// --- STATIC DATA ---
const withdrawalMethods = [
  { id: 'upi', name: 'UPI', desc: 'Withdraw directly to your UPI ID', time: 'Instant', icon: <UPIIcon />, speed: 'fast' },
  { id: 'phonepe', name: 'PhonePe', desc: 'Quick transfer to your PhonePe wallet', time: 'Instant', icon: <PhonePeIcon />, speed: 'fast' },
  { id: 'bank', name: 'Bank Transfer', desc: 'Transfer to your bank account', time: 'In 24h', icon: <BankIcon />, speed: 'slow' },
  { id: 'paytm', name: 'Paytm', desc: 'Withdraw to your Paytm wallet', time: 'Instant', icon: <PaytmIcon />, speed: 'fast' },
];

const features = [
  { icon: <ShieldCheck className="w-5 h-5 text-[#8B5CF6]" />, title: '100% Secure', desc: 'Your transactions are safe with us' },
  { icon: <Zap className="w-5 h-5 text-[#8B5CF6]" />, title: 'Fast Processing', desc: 'Instant or quick withdrawals' },
  { icon: <CircleDollarSign className="w-5 h-5 text-[#8B5CF6]" />, title: 'Low Minimum', desc: 'Only $5 minimum withdrawal' },
  { icon: <ShieldCheck className="w-5 h-5 text-[#8B5CF6]" />, title: '24/7 Support', desc: "We're here to help you anytime" },
];

// --- KYC SUBMISSION MODAL ---
function KycModal({ isOpen, onClose, onSuccess }: { isOpen: boolean; onClose: () => void; onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    dob: '',
    placeOfBirth: '',
    address: '',
    city: '',
    zipCode: '',
    documentType: '',
    customDocumentType: '',
  });
  const [file, setFile] = useState<File | null>(null);
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

    try {
      const token = localStorage.getItem('token');
      const data = new FormData();
      data.append('firstName', formData.firstName);
      data.append('lastName', formData.lastName);
      data.append('dob', formData.dob);
      data.append('placeOfBirth', formData.placeOfBirth);
      data.append('address', formData.address);
      data.append('city', formData.city);
      data.append('zipCode', formData.zipCode);
      
      const finalDocType = formData.documentType === 'Others' ? formData.customDocumentType : formData.documentType;
      data.append('documentType', finalDocType);

      if (file) {
        data.append('documentImage', file);
      }

      const res = await fetch('https://apitest.binnycash.com/api/user/kyc/submit', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: data,
        credentials: 'include'
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
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-[#070913]/85 backdrop-blur-md p-3 sm:p-6 overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: -20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: -20 }}
        className="relative w-full max-w-[720px] bg-[#0E111E] border border-[#8B5CF6]/30 rounded-[32px] p-6 sm:p-8 text-white shadow-[0_25px_60px_rgba(139,92,246,0.25)] my-6 max-h-[92vh] overflow-y-auto custom-scrollbar"
      >
        <div className="flex justify-between items-start mb-6">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#8B5CF6]/20 to-[#6366F1]/10 border border-[#8B5CF6]/40 flex items-center justify-center shadow-[0_0_20px_rgba(139,92,246,0.3)]">
              <ShieldCheck className="w-6 h-6 text-[#A78BFA]" />
            </div>
            <div>
              <h2 className="text-2xl font-black tracking-tight text-white">Identity <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#A78BFA] to-[#EC4899]">Verification</span></h2>
              <p className="text-xs text-[#8F95A3] font-medium mt-0.5">Verify your identity to ensure secure withdrawals and prevent fraud</p>
            </div>
          </div>
          <button 
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
              <label className="block text-xs font-bold text-white/80 mb-1.5">Place of Birth <span className="text-[#EC4899]">*</span></label>
              <div className="relative flex items-center">
                <MapPin className="absolute left-3.5 w-4 h-4 text-[#8B5CF6]" />
                <input 
                  type="text" 
                  required
                  placeholder="Enter your place of birth"
                  className="w-full bg-[#15192C] border border-white/10 rounded-2xl pl-11 pr-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#8B5CF6] focus:ring-2 focus:ring-[#8B5CF6]/20 transition-all"
                  onChange={(e) => setFormData({...formData, placeOfBirth: e.target.value})}
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-white/80 mb-1.5">Address <span className="text-[#EC4899]">*</span></label>
            <div className="relative flex items-center">
              <Home className="absolute left-3.5 w-4 h-4 text-[#8B5CF6]" />
              <input 
                type="text" 
                required
                placeholder="Enter your complete address"
                className="w-full bg-[#15192C] border border-white/10 rounded-2xl pl-11 pr-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#8B5CF6] focus:ring-2 focus:ring-[#8B5CF6]/20 transition-all"
                onChange={(e) => setFormData({...formData, address: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-white/80 mb-1.5">City <span className="text-[#EC4899]">*</span></label>
              <div className="relative flex items-center">
                <Building className="absolute left-3.5 w-4 h-4 text-[#8B5CF6]" />
                <input 
                  type="text" 
                  required
                  placeholder="Enter your city"
                  className="w-full bg-[#15192C] border border-white/10 rounded-2xl pl-11 pr-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#8B5CF6] focus:ring-2 focus:ring-[#8B5CF6]/20 transition-all"
                  onChange={(e) => setFormData({...formData, city: e.target.value})}
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-bold text-white/80 mb-1.5">Zip Code <span className="text-[#EC4899]">*</span></label>
              <div className="relative flex items-center">
                <Hash className="absolute left-3.5 w-4 h-4 text-[#8B5CF6]" />
                <input 
                  type="text" 
                  required
                  placeholder="Enter zip code"
                  className="w-full bg-[#15192C] border border-white/10 rounded-2xl pl-11 pr-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#8B5CF6] focus:ring-2 focus:ring-[#8B5CF6]/20 transition-all"
                  onChange={(e) => setFormData({...formData, zipCode: e.target.value})}
                />
              </div>
            </div>
          </div>

          <div className="bg-[#15192C]/80 border border-[#8B5CF6]/20 p-4 rounded-2xl space-y-3 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#8B5CF6]/5 blur-3xl pointer-events-none" />
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-[#8B5CF6]/20 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-xs font-bold text-[#A78BFA]">i</span>
              </div>
              <div className="text-xs text-[#8F95A3] space-y-1.5 leading-relaxed">
                <p>To prevent fraud please upload your ID document picture along with a piece of paper where you have <span className="text-white font-bold">&quot;BINNYCASH&quot;</span> written on it.</p>
                <div className="flex items-center gap-2 text-white/90 pt-1 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#8B5CF6]" /> ID document picture
                </div>
                <div className="flex items-center gap-2 text-white/90 font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#8B5CF6]" /> Piece of paper &quot;BINNYCASH&quot; written on it.
                </div>
              </div>
            </div>
            
            <div className="flex justify-center pt-1">
              <span className="inline-block bg-[#1E233B] border border-white/10 text-cyan-400 text-xs font-semibold px-4 py-1.5 rounded-full tracking-wide shadow-inner">
                Accepted file types: .png, .jpg, .jpeg, .webp
              </span>
            </div>
          </div>

          <div className="relative" ref={dropdownRef}>
            <label className="block text-xs font-bold text-white/80 mb-1.5">Document Type <span className="text-[#EC4899]">*</span></label>
            <div 
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full bg-[#15192C] border border-white/10 rounded-2xl px-4 py-3 text-sm text-white flex justify-between items-center cursor-pointer hover:border-[#8B5CF6]/50 transition-all"
            >
              <span className={formData.documentType ? 'text-white' : 'text-white/40'}>
                {formData.documentType || 'Select Document Type'}
              </span>
              <ChevronDown className={`w-4 h-4 text-white/50 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
            </div>

            {isDropdownOpen && (
              <div className="absolute top-full left-0 w-full mt-2 bg-[#15192C] border border-[#8B5CF6]/30 rounded-2xl overflow-hidden shadow-2xl z-50 py-1">
                {['Aadhaar Card', 'Voter ID', 'Passport', 'Others'].map((type) => (
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
                placeholder="Enter document name"
                className="w-full bg-[#15192C] border border-white/10 rounded-2xl px-4 py-3 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-[#8B5CF6] transition-all"
                onChange={(e) => setFormData({...formData, customDocumentType: e.target.value})}
              />
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
            <div className="border-2 border-dashed border-[#8B5CF6]/30 hover:border-[#8B5CF6] bg-[#15192C]/50 rounded-2xl p-5 flex flex-col items-center justify-center text-center relative group transition-all">
              <input 
                type="file" 
                required
                accept=".png,.jpg,.jpeg,.webp,.pdf"
                className="absolute inset-0 opacity-0 cursor-pointer z-10"
                onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
              />
              <div className="w-12 h-12 rounded-2xl bg-[#8B5CF6]/10 border border-[#8B5CF6]/30 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                <UploadCloud className="w-6 h-6 text-[#A78BFA]" />
              </div>
              <p className="text-xs font-bold text-white">Click to upload or drag and drop</p>
              <p className="text-[10px] text-[#8F95A3] mt-1">JPEG, PNG, JPG, WEBP, PDF (Max 10MB each)</p>
              {file && (
                <span className="mt-2 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20 truncate max-w-full">
                  {file.name}
                </span>
              )}
            </div>

            <div className="relative rounded-2xl overflow-hidden flex items-center justify-center">
              <img 
                src="/kyc.png" 
                alt="BinnyCash Vault Verification" 
                className="w-full h-full max-h-44 object-cover rounded-2xl"
              />
            </div>
          </div>

          {message && (
            <p className="text-xs font-bold text-center text-amber-400 py-1">{message}</p>
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
              <ShieldCheck className="w-4 h-4" />
              {submitting ? 'Verifying...' : 'Submit for Verification'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

// --- VERIFICATION REQUIRED ALERT POP-UP MODAL ---
function VerificationAlertModal({ isOpen, onClose, onVerifyNow }: { isOpen: boolean; onClose: () => void; onVerifyNow: () => void }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#070913]/85 backdrop-blur-md p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative w-full max-w-[440px] bg-[#0E111E] border border-[#8B5CF6]/30 rounded-[32px] p-6 sm:p-8 text-white shadow-[0_25px_60px_rgba(139,92,246,0.3)] text-center"
      >
        <div className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto mb-5 shadow-[0_0_20px_rgba(245,158,11,0.2)]">
          <AlertCircle className="w-7 h-7 text-amber-400" />
        </div>

        <h3 className="text-2xl font-black text-white mb-2.5">Verification Required</h3>
        <p className="text-xs sm:text-sm text-[#8F95A3] font-medium leading-relaxed mb-8 px-2">
          Oops! It looks like your account is not verified yet. Please submit your documents to proceed with cashout.
        </p>

        <div className="grid grid-cols-2 gap-4">
          <button 
            onClick={onClose}
            className="py-3.5 rounded-2xl bg-[#15192C] hover:bg-[#1E233B] border border-white/10 text-white font-bold text-sm transition-all cursor-pointer shadow-md"
          >
            Close
          </button>
          <button 
            onClick={onVerifyNow}
            className="py-3.5 rounded-2xl bg-gradient-to-r from-[#8B5CF6] via-[#EC4899] to-[#F97316] hover:opacity-95 text-white font-bold text-sm transition-all shadow-[0_4px_25px_rgba(139,92,246,0.4)] cursor-pointer"
          >
            Verify Now
          </button>
        </div>
      </motion.div>
    </div>
  );
}

export default function CashoutPage() {
  const [activeTab, setActiveTab] = useState('cash');
  const [totalEarning, setTotalEarning] = useState('0.00');
  const [pendingAmount, setPendingAmount] = useState('0.00');
  const [loading, setLoading] = useState(true);
  const [isKycOpen, setIsKycOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [kycStatus, setKycStatus] = useState('not_submited');

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      };

      const resEarning = await fetch('https://apitest.binnycash.com/api/user/wallet/total-earning', {
        method: 'GET',
        headers: headers,
        credentials: 'include' 
      });
      const jsonEarning = await resEarning.json();
      if (jsonEarning.code === 200 && jsonEarning.data) {
        setTotalEarning(jsonEarning.data);
      }

      const resView = await fetch('https://apitest.binnycash.com/api/user/wallet/view', {
        method: 'GET',
        headers: headers,
        credentials: 'include'
      });
      const jsonView = await resView.json();
      if (jsonView.code === 200 && jsonView.data) {
        setPendingAmount(jsonView.data.totalPendingAmount ?? '0.00');
      }

      const resUserData = await fetch('https://apitest.binnycash.com/api/user/viewData', {
        method: 'GET',
        headers: headers,
        credentials: 'include'
      });
      const jsonUserData = await resUserData.json();
      if (jsonUserData.code === 200 && jsonUserData.data?.user?.documents?.status) {
        setKycStatus(jsonUserData.data.user.documents.status);
      }

    } catch (err) {
      console.error('Failed to fetch data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUserData();
  }, []);

  const handleMethodClick = (methodId: string) => {
    if (kycStatus !== 'verified') {
      setIsAlertOpen(true);
    } else {
      // Proceed with normal withdrawal action for the method
      console.log(`Proceeding with withdrawal via ${methodId}`);
    }
  };

  const getKycButtonProps = () => {
    switch (kycStatus) {
      case 'verified':
        return {
          text: 'Verified',
          disabled: true,
          className: 'w-full py-3 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-bold text-sm flex items-center justify-center gap-2 cursor-not-allowed shadow-inner'
        };
      case 'pending':
        return {
          text: 'Verification Pending',
          disabled: true,
          className: 'w-full py-3 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 font-bold text-sm flex items-center justify-center gap-2 cursor-not-allowed shadow-inner'
        };
      case 'rejected':
        return {
          text: 'KYC Rejected - Re-verify',
          disabled: false,
          className: 'w-full py-3 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-400 font-bold text-sm transition-all cursor-pointer shadow-md'
        };
      default:
        return {
          text: 'Verify Now',
          disabled: false,
          className: 'w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 text-white font-bold text-sm transition-all shadow-[0_4px_15px_rgba(139,92,246,0.3)] hover:shadow-[0_4px_20px_rgba(139,92,246,0.5)] cursor-pointer'
        };
    }
  };

  const btnProps = getKycButtonProps();

  return (
    <div className="flex flex-col bg-[#0B0D19] min-h-[calc(100vh-80px)] text-white relative font-sans overflow-x-hidden">
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-[#8B5CF6]/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="fixed top-20 right-0 w-[400px] h-[400px] bg-[#3B82F6]/5 blur-[100px] rounded-full pointer-events-none" />

      <main className="w-full max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
        
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between items-center mb-12 gap-8">
          <div className="max-w-xl">
            <h1 className="text-4xl md:text-5xl font-black text-white mb-3 tracking-tight">Cashout</h1>
            <p className="text-[#8F95A3] text-[15px] font-medium leading-relaxed">Withdraw your BinnyCash earnings quickly via cash, crypto or gift cards.</p>
          </div>
          
          <div className="relative w-[380px] h-[240px] sm:w-[420px] sm:h-[260px] flex items-center justify-center shrink-0">
            <div className="absolute w-52 h-52 bg-purple-600/30 rounded-full blur-[80px] pointer-events-none" />

            <div className="relative w-[320px] h-[190px] flex items-center justify-center">
              <motion.div
                animate={{ y: [-4, 4, -4] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-2 left-16 w-36 h-28 bg-gradient-to-br from-emerald-500 to-green-700 rounded-xl border border-emerald-300/40 shadow-2xl -rotate-6 z-10 flex flex-col items-center justify-center overflow-hidden opacity-95"
              >
                <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:12px_12px] opacity-20" />
                <div className="w-10 h-10 rounded-full border-2 border-emerald-300/50 flex items-center justify-center bg-emerald-600/50 shadow-inner">
                  <IndianRupee className="w-5 h-5 text-emerald-100" />
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [4, -4, 4], rotate: [8, 12, 8] }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute top-4 right-16 w-28 h-20 bg-gradient-to-br from-violet-600 to-indigo-800 rounded-lg border border-white/25 shadow-xl z-15 p-2 flex flex-col justify-between"
              >
                <div className="w-5 h-3.5 rounded bg-amber-400 opacity-90" />
                <div className="flex justify-between items-end">
                  <div className="w-8 h-1 bg-white/40 rounded-full" />
                  <span className="text-[9px] font-black italic text-amber-300">VIP</span>
                </div>
              </motion.div>

              <motion.div
                animate={{ y: [-3, 3, -3] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
                className="absolute bottom-2 left-1/2 -translate-x-1/2 z-30 w-[260px] h-[140px] rounded-[24px] bg-gradient-to-br from-[#1e1b4b] via-[#311059] to-[#1e1b4b] border border-purple-500/30 shadow-[0_20px_50px_rgba(139,92,246,0.4)] p-4 flex flex-col justify-between"
              >
                <div className="absolute right-[-10px] top-6 w-12 h-10 bg-[#311059] border border-purple-500/30 rounded-r-xl shadow-md flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
                </div>

                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center border border-purple-500/30">
                    <IndianRupee className="w-4 h-4 text-purple-300" />
                  </div>
                  <span className="text-xs font-bold text-white/80 tracking-wider">BINNY VAULT</span>
                </div>

                <div className="flex justify-between items-end">
                  <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">● Live Balance</span>
                  <span className="text-xs font-mono font-bold text-white/90">Secure Pay</span>
                </div>
              </motion.div>

              <motion.div 
                animate={{ scale: [1, 1.03, 1] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute bottom-0 left-4 z-40 flex flex-col items-center"
              >
                <div className="w-12 h-6 rounded-full bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 border border-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.6)] flex items-center justify-center">
                  <Coins className="w-3.5 h-3.5 text-yellow-950" />
                </div>
                <div className="w-12 h-6 -mt-3 rounded-full bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 border border-amber-300 shadow-md" />
                <div className="w-12 h-6 -mt-3 rounded-full bg-gradient-to-r from-amber-500 via-yellow-600 to-amber-700 border border-amber-400 shadow-md" />
              </motion.div>
            </div>
          </div>
        </div>

        {/* Stats Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
          <div className="bg-[#111319] border border-[#8B5CF6]/20 rounded-[20px] p-6 relative overflow-hidden group shadow-[0_0_30px_rgba(139,92,246,0.05)]">
            <div className="absolute inset-0 bg-gradient-to-br from-[#8B5CF6]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="flex items-start gap-4 relative z-10">
              <div className="w-12 h-12 rounded-full bg-[#8B5CF6]/10 flex items-center justify-center shrink-0 border border-[#8B5CF6]/20">
                <Wallet className="w-5 h-5 text-[#8B5CF6]" />
              </div>
              <div className="flex flex-col">
                <h3 className="text-white font-bold text-sm">Available Balance</h3>
                <p className="text-[#8F95A3] text-xs mt-0.5">Minimum withdrawal $5</p>
                <span className="text-3xl font-black text-[#8B5CF6] mt-3 tracking-tight">
                  {loading ? '...' : `$${totalEarning}`}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-[#111319] border border-white/5 rounded-[20px] p-6 relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="flex items-start gap-4 relative z-10">
              <div className="w-12 h-12 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0 border border-amber-500/20">
                <Clock className="w-5 h-5 text-amber-500" />
              </div>
              <div className="flex flex-col">
                <h3 className="text-white font-bold text-sm">Pending Process</h3>
                <p className="text-[#8F95A3] text-xs mt-0.5">Awaiting Completion</p>
                <span className="text-3xl font-black text-amber-500 mt-3 tracking-tight">
                  {loading ? '...' : `$${pendingAmount}`}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-[#111319] border border-blue-500/10 rounded-[20px] p-6 relative overflow-hidden flex flex-col justify-between group">
             <div className="absolute right-0 top-0 w-32 h-32 bg-blue-500/5 blur-[50px] rounded-full pointer-events-none" />
             <div className="flex items-start gap-4 relative z-10 mb-4">
              <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0 border border-blue-500/20">
                <ShieldCheck className="w-4 h-4 text-blue-400" />
              </div>
              <div className="flex flex-col">
                <h3 className="text-blue-400 font-bold text-sm">Verify Your Account</h3>
                <p className="text-[#8F95A3] text-xs mt-0.5">
                  {kycStatus === 'verified' ? 'Account Verified Successfully' : kycStatus === 'pending' ? 'Verification under review' : 'KYC verification is required'}
                </p>
              </div>
            </div>
            <button 
              onClick={() => !btnProps.disabled && setIsKycOpen(true)}
              disabled={btnProps.disabled}
              className={btnProps.className}
            >
              {kycStatus === 'verified' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
              {kycStatus === 'pending' && <Clock className="w-4 h-4 text-amber-400 animate-spin" />}
              {btnProps.text}
            </button>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="flex items-center gap-8 border-b border-white/5 mb-8">
          <button 
            onClick={() => setActiveTab('cash')}
            className={`pb-4 text-sm font-bold transition-all relative cursor-pointer ${activeTab === 'cash' ? 'text-[#8B5CF6]' : 'text-[#8F95A3] hover:text-white'}`}
          >
            Cash & Crypto
            {activeTab === 'cash' && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-[#8B5CF6] rounded-t-full shadow-[0_-2px_10px_rgba(139,92,246,0.5)]" />}
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`pb-4 text-sm font-bold transition-all relative cursor-pointer ${activeTab === 'history' ? 'text-[#8B5CF6]' : 'text-[#8F95A3] hover:text-white'}`}
          >
            My Withdrawals
            {activeTab === 'history' && <div className="absolute bottom-0 left-0 w-full h-[2px] bg-[#8B5CF6] rounded-t-full shadow-[0_-2px_10px_rgba(139,92,246,0.5)]" />}
          </button>
        </div>

        {activeTab === 'cash' ? (
          <div className="mb-10 animate-in fade-in slide-in-from-bottom-2 duration-500">
            <h2 className="text-xl font-bold text-white mb-1">Choose your withdrawal method</h2>
            <p className="text-[#8F95A3] text-sm mb-6 font-medium">Fast, secure and convenient options</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {withdrawalMethods.map((method) => (
                <div 
                  key={method.id} 
                  onClick={() => handleMethodClick(method.id)}
                  className="bg-[#111319] border border-white/5 hover:border-[#8B5CF6]/40 rounded-[20px] p-6 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_10px_30px_rgba(139,92,246,0.1)] group flex flex-col h-full"
                >
                  <div className="flex items-start justify-between mb-4">
                    {method.icon}
                  </div>
                  
                  <div className="flex flex-col flex-grow">
                    <div className="flex items-center gap-2 mb-2">
                      <h3 className="text-white font-bold text-lg">{method.name}</h3>
                    </div>
                    
                    <div className="mb-3">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${method.speed === 'fast' ? 'bg-[#10B981]/10 text-[#10B981]' : 'bg-[#3B82F6]/10 text-[#3B82F6]'}`}>
                        {method.speed === 'fast' ? <Zap className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                        {method.time}
                      </span>
                    </div>

                    <p className="text-[#8F95A3] text-[13px] font-medium leading-relaxed mb-6 flex-grow">{method.desc}</p>
                    
                    <div className="mt-auto flex justify-end">
                      <div className="w-8 h-8 rounded-full bg-white/5 group-hover:bg-[#8B5CF6] border border-white/5 flex items-center justify-center transition-colors">
                        <ChevronRight className="w-4 h-4 text-[#8F95A3] group-hover:text-white transition-colors" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="py-20 text-center bg-[#111319] border border-white/5 rounded-[20px] animate-in fade-in slide-in-from-bottom-2 duration-500 mb-10">
            <Clock className="w-12 h-12 text-[#8F95A3] mx-auto mb-4 opacity-50" />
            <h3 className="text-white font-bold text-lg mb-1">No withdrawals yet</h3>
            <p className="text-[#8F95A3] text-sm">Your cashout history will appear here.</p>
          </div>
        )}

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
                  <p className="text-[#8F95A3] text-xs mt-1 leading-relaxed">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </main>

      {/* KYC Modal Component */}
      <KycModal 
        isOpen={isKycOpen} 
        onClose={() => setIsKycOpen(false)} 
        onSuccess={() => {
          setKycStatus('pending');
          fetchUserData();
        }}
      />

      {/* Verification Required Alert Modal */}
      <VerificationAlertModal 
        isOpen={isAlertOpen} 
        onClose={() => setIsAlertOpen(false)} 
        onVerifyNow={() => {
          setIsAlertOpen(false);
          setIsKycOpen(true);
        }}
      />
    </div>
  );
}