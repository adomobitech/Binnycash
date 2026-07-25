'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wallet, Coins, CreditCard, Bitcoin, IndianRupee,
  Clock, ShieldCheck, ChevronRight, Zap, 
  Landmark, CircleDollarSign, User, Calendar, 
  MapPin, Home, Building, Hash, UploadCloud, FileText, X, ChevronDown, CheckCircle2, AlertCircle, Camera
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
    documentNumber: '',
    documentType: '',
    customDocumentType: '',
  });
  const [frontImage, setFrontImage] = useState<File | null>(null);
  const [backImage, setBackImage] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isMobileDevice, setIsMobileDevice] = useState(false); // 🔥 Mobile detection state 🔥
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Check if device is mobile on mount
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
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center text-white/70 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Top Fields: First Name & Last Name */}
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

          {/* DOB & Document Number */}
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

          {/* Document Type Dropdown */}
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

          {/* Conditional Custom Document Input */}
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

          {/* Main Full-Width Display Image for Instructions */}
          <div className="w-full rounded-2xl overflow-hidden border border-white/10 bg-white/5 mt-4 mb-2">
            <img 
              src="/kyc.png" 
              alt="KYC Instructions: Document and BINNYCASH note" 
              className="w-full h-auto object-contain"
            />
          </div>

          {/* Upload Fields: Front (Required) & Back (Optional) */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            {/* FRONT IMAGE BOX */}
            <div className={`border-2 border-dashed ${frontImage ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-[#8B5CF6]/30 bg-[#15192C]/50'} rounded-2xl p-5 flex flex-col items-center justify-center text-center transition-all`}>
              <div className="flex gap-4 mb-3">
                
                {/* Take Photo Button (Only for Mobile) */}
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
                
                {/* Upload File Button (For Both Mobile and Desktop) */}
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

            {/* BACK IMAGE BOX */}
            <div className={`border-2 border-dashed ${backImage ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-white/20 bg-[#15192C]/30'} rounded-2xl p-5 flex flex-col items-center justify-center text-center transition-all`}>
              <div className="flex gap-4 mb-3">
                
                {/* Take Photo Button (Only for Mobile) */}
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
                
                {/* Upload File Button */}
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

          {/* Submission Messages */}
          {message && (
            <p className={`text-xs font-bold text-center py-1 ${message.includes('Successfully') ? 'text-emerald-400' : 'text-amber-400'}`}>
              {message}
            </p>
          )}

          {/* Action Buttons */}
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
        <motion.div
          animate={{ boxShadow: ['0 0 20px rgba(245,158,11,0.2)', '0 0 34px rgba(245,158,11,0.4)', '0 0 20px rgba(245,158,11,0.2)'], scale: [1, 1.05, 1] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          className="w-14 h-14 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto mb-5"
        >
          <AlertCircle className="w-7 h-7 text-amber-400" />
        </motion.div>

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
            className="group py-3.5 rounded-2xl bg-gradient-to-r from-[#8B5CF6] via-[#EC4899] to-[#F97316] hover:opacity-95 text-white font-bold text-sm transition-all shadow-[0_4px_25px_rgba(139,92,246,0.4)] hover:shadow-[0_4px_30px_rgba(139,92,246,0.6)] cursor-pointer relative overflow-hidden"
          >
            <div className="shine-hover" />
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
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [withdrawalsLoading, setWithdrawalsLoading] = useState(true);

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

  const fetchWithdrawals = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('https://apitest.binnycash.com/api/user/wallet/cashout-list', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        credentials: 'include'
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

  useEffect(() => {
    fetchWithdrawals();
  }, []);

  const getMethodIcon = (method: string | null) => {
    switch ((method || '').toLowerCase()) {
      case 'upi': return <UPIIcon />;
      case 'phonepe': return <PhonePeIcon />;
      case 'bank': return <BankIcon />;
      case 'paytm': return <PaytmIcon />;
      default:
        return (
          <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
            <Wallet className="w-5 h-5 text-[#8F95A3]" />
          </div>
        );
    }
  };

  const getStatusStyle = (status: string) => {
    switch ((status || '').toUpperCase()) {
      case 'PENDING':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'COMPLETED':
      case 'APPROVED':
      case 'SUCCESS':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'REJECTED':
      case 'FAILED':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      default:
        return 'bg-white/5 text-white/60 border-white/10';
    }
  };

  const formatTransactionDate = (dateStr: string | null) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const handleMethodClick = (methodId: string) => {
    if (kycStatus !== 'verified') {
      setIsAlertOpen(true);
    } else {
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
      <style>{`
        @keyframes shine-sweep { 0% { transform: translateX(-150%) skewX(-15deg); } 100% { transform: translateX(250%) skewX(-15deg); } }
        @keyframes text-shimmer { 0% { background-position: 200% 50%; } 100% { background-position: -200% 50%; } }
        @keyframes spark-float { 0% { transform: translateY(0) scale(0); opacity: 0; } 15% { opacity: 1; transform: translateY(-10px) scale(1); } 100% { transform: translateY(-90px) scale(0.4); opacity: 0; } }
        .shine-hover { position: absolute; inset: 0; overflow: hidden; pointer-events: none; border-radius: inherit; }
        .shine-hover::after {
          content: ''; position: absolute; top: 0; left: 0; width: 40%; height: 100%;
          background: linear-gradient(120deg, transparent, rgba(255,255,255,0.12), transparent);
          transform: translateX(-150%) skewX(-15deg);
        }
        .group:hover .shine-hover::after { animation: shine-sweep 1s ease forwards; }
        .text-shimmer-anim { background-size: 200% auto; animation: text-shimmer 3.5s linear infinite; }
      `}</style>

      <motion.div
        animate={{ x: [0, 40, 0], y: [0, -30, 0], scale: [1, 1.15, 1] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
        className="fixed top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-[#8B5CF6]/5 blur-[120px] rounded-full pointer-events-none"
      />
      <motion.div
        animate={{ x: [0, -30, 0], y: [0, 40, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
        className="fixed top-20 right-0 w-[400px] h-[400px] bg-[#3B82F6]/5 blur-[100px] rounded-full pointer-events-none"
      />
      <motion.div
        animate={{ x: [0, 20, 0], y: [0, 20, 0] }}
        transition={{ duration: 14, repeat: Infinity, ease: 'easeInOut' }}
        className="fixed bottom-0 left-10 w-[350px] h-[350px] bg-[#EC4899]/5 blur-[110px] rounded-full pointer-events-none"
      />

      <main className="w-full max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
        
        {/* Header Section */}
        <div className="flex flex-col lg:flex-row justify-between items-center mb-12 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="max-w-xl"
          >
            <span className="inline-flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.2em] text-[#A78BFA] bg-[#8B5CF6]/10 border border-[#8B5CF6]/20 px-3 py-1 rounded-full mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse" />
              Wallet Online
            </span>
            <h1 className="text-4xl md:text-5xl font-black text-white mb-3 tracking-tight bg-gradient-to-r from-white via-white to-[#A78BFA] bg-clip-text text-transparent">Cashout</h1>
            <p className="text-[#8F95A3] text-[15px] font-medium leading-relaxed">Withdraw your BinnyCash earnings quickly via cash, crypto or gift cards.</p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut', delay: 0.1 }}
            className="relative w-[320px] h-[220px] sm:w-[360px] sm:h-[230px] flex items-center justify-center shrink-0"
          >
            {/* ambient glow */}
            <motion.div
              animate={{ opacity: [0.35, 0.6, 0.35] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute inset-0 m-auto w-56 h-40 bg-purple-600/25 rounded-full blur-[80px] pointer-events-none"
            />

            {/* floating accent - UPI chip */}
            <motion.div
              animate={{ y: [-6, 6, -6], rotate: [-4, 4, -4] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -top-3 -right-2 z-30 scale-[0.7]"
            >
              <UPIIcon />
            </motion.div>

            {/* floating accent - coin */}
            <motion.div
              animate={{ y: [6, -6, 6] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute -bottom-3 -left-3 z-30"
            >
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-amber-300 via-yellow-400 to-amber-500 border border-amber-200 shadow-[0_0_15px_rgba(245,158,11,0.6)] flex items-center justify-center">
                <Coins className="w-5 h-5 text-yellow-950" />
              </div>
            </motion.div>

            {/* main glass card */}
            <motion.div
              animate={{ y: [-5, 5, -5] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              className="relative z-20 w-[290px] sm:w-[320px] h-[190px] rounded-[26px] bg-gradient-to-br from-[#1c1a35] via-[#241436] to-[#150f28] border border-white/10 shadow-[0_25px_60px_rgba(139,92,246,0.35)] p-5 flex flex-col justify-between overflow-hidden"
            >
              {/* holographic sheen sweep */}
              <motion.div
                animate={{ x: ['-120%', '160%'] }}
                transition={{ duration: 3.2, repeat: Infinity, repeatDelay: 1.6, ease: 'easeInOut' }}
                className="absolute top-0 left-0 h-full w-1/3 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-[-20deg] pointer-events-none"
              />
              <div className="absolute inset-0 bg-[radial-gradient(#A78BFA_1px,transparent_1px)] [background-size:16px_16px] opacity-[0.04] pointer-events-none" />

              <div className="flex items-center justify-between relative z-10">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#8B5CF6] to-[#6366F1] flex items-center justify-center shadow-[0_0_12px_rgba(139,92,246,0.6)]">
                    <IndianRupee className="w-4 h-4 text-white" />
                  </div>
                  <span className="text-xs font-black text-white/90 tracking-[0.15em]">BINNYCASH</span>
                </div>
                <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> LIVE
                </span>
              </div>

              <div className="relative z-10 -mx-1">
                <svg viewBox="0 0 260 60" className="w-full h-12" fill="none">
                  <defs>
                    <linearGradient id="sparklineGrad" x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0%" stopColor="#8B5CF6" />
                      <stop offset="100%" stopColor="#EC4899" />
                    </linearGradient>
                  </defs>
                  <motion.path
                    d="M0 45 L30 38 L55 42 L80 25 L110 30 L140 15 L170 20 L200 8 L230 12 L260 2"
                    stroke="url(#sparklineGrad)"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 2, ease: 'easeOut' }}
                  />
                </svg>
              </div>

              <div className="flex items-end justify-between relative z-10">
                <div>
                  <p className="text-[9px] text-white/40 font-medium uppercase tracking-wider">Earnings Trend</p>
                  <p className="text-sm font-black text-white tracking-wide">Growing Steadily</p>
                </div>
                <div className="flex items-center gap-1 text-[10px] font-bold text-white/60">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#A78BFA]" />
                  Secure
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Stats Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.05 }}
            whileHover={{ y: -4 }}
            className="bg-[#111319] border border-[#8B5CF6]/20 rounded-[20px] p-6 relative overflow-hidden group shadow-[0_0_30px_rgba(139,92,246,0.05)]"
          >
            <motion.div
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#8B5CF6] to-transparent"
            />
            <div className="absolute inset-0 bg-gradient-to-br from-[#8B5CF6]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="shine-hover" />
            <div className="flex items-start gap-4 relative z-10">
              <motion.div
                animate={{ boxShadow: ['0 0 0px rgba(139,92,246,0)', '0 0 18px rgba(139,92,246,0.45)', '0 0 0px rgba(139,92,246,0)'] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                className="w-12 h-12 rounded-full bg-[#8B5CF6]/10 flex items-center justify-center shrink-0 border border-[#8B5CF6]/20"
              >
                <Wallet className="w-5 h-5 text-[#8B5CF6]" />
              </motion.div>
              <div className="flex flex-col">
                <h3 className="text-white font-bold text-sm">Available Balance</h3>
                <p className="text-[#8F95A3] text-xs mt-0.5">Minimum withdrawal $5</p>
                <span className="text-3xl font-black mt-3 tracking-tight bg-gradient-to-r from-[#8B5CF6] via-[#C4B5FD] to-[#8B5CF6] bg-clip-text text-transparent text-shimmer-anim">
                  {loading ? '...' : `$${totalEarning}`}
                </span>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            whileHover={{ y: -4 }}
            className="bg-[#111319] border border-white/5 rounded-[20px] p-6 relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <div className="shine-hover" />
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
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            whileHover={{ y: -4 }}
            className="bg-[#111319] border border-blue-500/10 rounded-[20px] p-6 relative overflow-hidden flex flex-col justify-between group">
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
          </motion.div>
        </div>
        
        {/* Tabs */}
        <div className="flex items-center gap-8 border-b border-white/5 mb-8">
          <button 
            onClick={() => setActiveTab('cash')}
            className={`pb-4 text-sm font-bold transition-all relative cursor-pointer ${activeTab === 'cash' ? 'text-[#8B5CF6]' : 'text-[#8F95A3] hover:text-white'}`}
          >
            Cash & Crypto
            {activeTab === 'cash' && (
              <motion.div layoutId="tab-underline" transition={{ type: 'spring', stiffness: 500, damping: 35 }} className="absolute bottom-0 left-0 w-full h-[2px] bg-[#8B5CF6] rounded-t-full shadow-[0_-2px_10px_rgba(139,92,246,0.5)]" />
            )}
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`pb-4 text-sm font-bold transition-all relative cursor-pointer ${activeTab === 'history' ? 'text-[#8B5CF6]' : 'text-[#8F95A3] hover:text-white'}`}
          >
            My Withdrawals
            {activeTab === 'history' && (
              <motion.div layoutId="tab-underline" transition={{ type: 'spring', stiffness: 500, damping: 35 }} className="absolute bottom-0 left-0 w-full h-[2px] bg-[#8B5CF6] rounded-t-full shadow-[0_-2px_10px_rgba(139,92,246,0.5)]" />
            )}
          </button>
        </div>

        <AnimatePresence mode="wait">
        {activeTab === 'cash' ? (
          <motion.div
            key="cash"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="mb-10"
          >
            <h2 className="text-xl font-bold text-white mb-1">Choose your withdrawal method</h2>
            <p className="text-[#8F95A3] text-sm mb-6 font-medium">Fast, secure and convenient options</p>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {withdrawalMethods.map((method, i) => (
                <motion.div 
                  key={method.id} 
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.08 }}
                  onClick={() => handleMethodClick(method.id)}
                  whileHover={{ y: -6, scale: 1.015 }}
                  whileTap={{ scale: 0.98 }}
                  className="bg-[#111319] border border-white/5 hover:border-[#8B5CF6]/40 rounded-[20px] p-6 cursor-pointer transition-colors duration-300 hover:shadow-[0_10px_35px_rgba(139,92,246,0.15)] group flex flex-col h-full relative overflow-hidden"
                >
                  <div className="shine-hover" />
                  <div className="flex items-start justify-between mb-4 relative z-10">
                    <motion.div whileHover={{ rotate: [0, -6, 6, 0] }} transition={{ duration: 0.4 }}>
                      {method.icon}
                    </motion.div>
                  </div>
                  
                  <div className="flex flex-col flex-grow relative z-10">
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
                      <div className="w-8 h-8 rounded-full bg-white/5 group-hover:bg-[#8B5CF6] border border-white/5 flex items-center justify-center transition-colors group-hover:shadow-[0_0_16px_rgba(139,92,246,0.6)]">
                        <ChevronRight className="w-4 h-4 text-[#8F95A3] group-hover:text-white transition-colors group-hover:translate-x-0.5" />
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="history"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            className="mb-10"
          >
            {withdrawalsLoading ? (
              <div className="space-y-3">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="h-20 rounded-[18px] bg-[#111319] border border-white/5 overflow-hidden relative">
                    <motion.div
                      animate={{ x: ['-100%', '100%'] }}
                      transition={{ duration: 1.4, repeat: Infinity, ease: 'linear' }}
                      className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/5 to-transparent"
                    />
                  </div>
                ))}
              </div>
            ) : withdrawals.length === 0 ? (
              <div className="py-20 text-center bg-[#111319] border border-white/5 rounded-[20px]">
                <motion.div
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <Clock className="w-12 h-12 text-[#8F95A3] mx-auto mb-4 opacity-50" />
                </motion.div>
                <h3 className="text-white font-bold text-lg mb-1">No withdrawals yet</h3>
                <p className="text-[#8F95A3] text-sm">Your cashout history will appear here.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {withdrawals.map((w, i) => (
                  <motion.div
                    key={w._id}
                    initial={{ opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: i * 0.06 }}
                    whileHover={{ y: -2 }}
                    className="bg-[#111319] border border-white/5 hover:border-[#8B5CF6]/30 rounded-[18px] p-4 sm:p-5 flex items-center gap-4 relative overflow-hidden group transition-colors"
                  >
                    <div className="shine-hover" />
                    <div className="shrink-0 scale-[0.75] sm:scale-100 -ml-2 sm:ml-0">
                      {getMethodIcon(w.method)}
                    </div>
                    <div className="flex-grow min-w-0 relative z-10">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-white font-bold text-sm">
                          {w.method ? w.method.toUpperCase() : 'Method Not Selected'}
                        </h4>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border ${getStatusStyle(w.status)}`}>
                          {w.status}
                        </span>
                      </div>
                      <p className="text-[#8F95A3] text-xs mt-1 truncate">
                        Txn #{w.transactionId} · {formatTransactionDate(w.transactionTime)}
                      </p>
                    </div>
                    <div className="shrink-0 text-right relative z-10">
                      <span className="text-lg font-black text-white tracking-tight">${w.amount}</span>
                      <p className="text-[#8F95A3] text-[10px] mt-0.5">{w.earningStatus}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        )}
        </AnimatePresence>

        {/* Footer Features Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
          className="bg-[#111319] border border-white/5 rounded-[20px] p-6 lg:p-8"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8 divide-y sm:divide-y-0 sm:divide-x divide-white/5">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                whileHover={{ y: -3 }}
                className={`flex items-start gap-4 ${index !== 0 ? 'pt-6 sm:pt-0 sm:pl-6 lg:pl-8' : ''}`}
              >
                <div className="w-10 h-10 rounded-full bg-[#8B5CF6]/10 flex items-center justify-center shrink-0 border border-[#8B5CF6]/20">
                  {feature.icon}
                </div>
                <div className="flex flex-col">
                  <h4 className="text-white font-bold text-sm">{feature.title}</h4>
                  <p className="text-[#8F95A3] text-xs mt-1 leading-relaxed">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>

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