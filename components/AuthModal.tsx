'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, 
  ShieldCheck, 
  Eye, 
  EyeOff, 
  Mail, 
  Lock, 
  Hash, 
  ArrowRight, 
  Zap, 
  Loader2,
  Rocket
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialView?: 'login' | 'register';
}

type ViewState = 'login' | 'register' | 'verifyOtp' | 'forgotPassword' | 'resetPassword' | 'loginSuccess';

// --- UTILITY: Get Device ID ---
function getOrCreateDeviceId(): string {
  if (typeof window === 'undefined') return '';
  let deviceId = localStorage.getItem('device_id');
  if (!deviceId) {
    deviceId = 'dev_' + Math.random().toString(36).substring(2) + Date.now().toString(36);
    localStorage.setItem('device_id', deviceId);
  }
  return deviceId;
}

export default function AuthModal({ isOpen, onClose, initialView = 'login' }: AuthModalProps) {
  const router = useRouter();
  const [view, setView] = useState<ViewState>(initialView);
  
  // Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPromo, setShowPromo] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  // UI States
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Timer State for Resend OTP (in seconds)
  const [resendTimer, setResendTimer] = useState(0);

  // Referral States
  const [isUrlReferral, setIsUrlReferral] = useState(false);
  const [refCodeValue, setRefCodeValue] = useState('');

  // Handle Initial View & URL Params
  useEffect(() => {
    if (isOpen) {
      setView(initialView);
      
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const refCode = params.get('ref');
        if (refCode) {
          setRefCodeValue(refCode); 
          setIsUrlReferral(true); 
        } else {
          setIsUrlReferral(false);
          setRefCodeValue('');
        }
      }
    }
  }, [isOpen, initialView]);

  // Handle Resend OTP Timer Countdown
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendTimer > 0) {
      interval = setInterval(() => {
        setResendTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  // Format seconds to MM:SS
  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = timeInSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };

  // Auto-clear error after 4 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(''), 4000);
      return () => clearTimeout(timer);
    }
  }, [error]);

  // Auto-clear toast popup after 3 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(''), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Clear error when switching views
  useEffect(() => {
    setError('');
  }, [view]);

  if (!isOpen) return null;

  // =====================================
  // OTP BOX LOGIC (4 Digits)
  // =====================================
  const handleOtpChange = (index: number, val: string) => {
    if (!/^[0-9]*$/.test(val)) return;
    const otpArray = otp.padEnd(4, ' ').split('');
    otpArray[index] = val.slice(-1);
    const newOtp = otpArray.join('').trim();
    setOtp(newOtp);

    if (val && index < 3) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      document.getElementById(`otp-${index - 1}`)?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text/plain').replace(/[^0-9]/g, '').slice(0, 4);
    if (pastedData) {
      setOtp(pastedData);
      const nextIndex = Math.min(pastedData.length, 3);
      document.getElementById(`otp-${nextIndex}`)?.focus();
    }
  };

  // =====================================
  // API LOGIC
  // =====================================
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (password.length < 8) {
      setError('Password must be at least 8 characters long.');
      return;
    }

    setIsLoading(true);
    setError('');

    // Ab hamesha unified signup API par hi request jayegi
    const endpoint = 'https://apitest.binnycash.com/api/user/signup';

    const urlEncoded = new URLSearchParams();
    urlEncoded.append('email', email);
    urlEncoded.append('password', password);
    urlEncoded.append('device_id', getOrCreateDeviceId());

    // Agar referral se aaya hai toh auto append ho jayega
    if (isUrlReferral && refCodeValue) {
      urlEncoded.append('referralCode', refCodeValue.trim());
    }

    // Manual bonus code backend image ke according "bonusCode" param me jayega
    if (showPromo && promoCode.trim() !== '') {
      urlEncoded.append('bonusCode', promoCode.trim());
    }

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: urlEncoded
      });
      const data = await res.json();
      
      if (res.ok) {
        setOtp('');
        setView('verifyOtp');
      } else {
        let errorMsg = data.message || 'Signup failed';
        if (errorMsg.toLowerCase().includes('alredy created') || errorMsg.toLowerCase().includes('already created')) {
          errorMsg = 'Account already exists. Please log in.';
        }
        setError(errorMsg);
      }
    } catch (err) {
      setError('Network Error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    const urlEncoded = new URLSearchParams();
    urlEncoded.append('email', email);
    urlEncoded.append('password', password);

    try {
      const res = await fetch('https://apitest.binnycash.com/api/user/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: urlEncoded
      });
      const data = await res.json();
      
      if (res.ok) {
        let userToken = data.token || data.accessToken || data.data?.token;
        if (!userToken && typeof data.data === 'string') userToken = data.data;

        if (userToken && typeof userToken === 'string' && !userToken.includes('[object Object]')) {
          localStorage.setItem('token', userToken);
        }

        const userDetails = data.data?.userDetails || data.userDetails || data.data?.user || data.user;
        if (userDetails && typeof userDetails === 'object') {
          localStorage.setItem('userDetails', JSON.stringify(userDetails));
        }
        
        const userId = userDetails?.id ?? userDetails?._id ?? data.userId ?? data.user?._id ?? data.data?.userId ?? data.data?._id ?? data.id;
        if (userId) {
          localStorage.setItem('userId', String(userId));
        }
        
        window.dispatchEvent(new Event('storage'));
        window.dispatchEvent(new CustomEvent('profileUpdated'));

        setView('loginSuccess');
        
        setTimeout(() => {
          router.refresh(); 
          router.push('/dashboard');
          onClose();
          setView('login');
          setEmail('');
          setPassword('');
        }, 800); 

      } else {
        setError('Wrong email or password.');
      }
    } catch (err) {
      setError('Network Error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length < 4) {
      setError('Please enter all 4 digits.');
      return;
    }

    setIsLoading(true);
    setError('');
    
    const urlEncoded = new URLSearchParams();
    urlEncoded.append('email', email);
    urlEncoded.append('otp', otp);

    try {
      const res = await fetch('https://apitest.binnycash.com/api/user/verifyOtp', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: urlEncoded
      });
      const data = await res.json();

      if (res.ok) {
        let userToken = data.token || data.accessToken || data.data?.token;
        if (!userToken && typeof data.data === 'string') userToken = data.data;

        if (userToken && typeof userToken === 'string' && !userToken.includes('[object Object]')) {
          localStorage.setItem('token', userToken);

          const userDetails = data.data?.userDetails || data.userDetails || data.data?.user || data.user;
          if (userDetails && typeof userDetails === 'object') {
            localStorage.setItem('userDetails', JSON.stringify(userDetails));
          }
          
          window.dispatchEvent(new Event('storage'));
          window.dispatchEvent(new CustomEvent('profileUpdated'));
          
          setView('loginSuccess');
          
          setTimeout(() => {
            router.refresh(); 
            router.push('/dashboard');
            onClose();
          }, 800);
          
        } else {
          try {
            const loginEncoded = new URLSearchParams();
            loginEncoded.append('email', email);
            loginEncoded.append('password', password); 

            const loginRes = await fetch('https://apitest.binnycash.com/api/user/login', {
              method: 'POST',
              headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
              body: loginEncoded
            });
            const loginData = await loginRes.json();

            if (loginRes.ok) {
              let fallbackToken = loginData.token || loginData.accessToken || loginData.data?.token;
              if (!fallbackToken && typeof loginData.data === 'string') fallbackToken = loginData.data;

              localStorage.setItem('token', fallbackToken);

              const userDetails = loginData.data?.userDetails || loginData.userDetails || loginData.data?.user || loginData.user;
              if (userDetails && typeof userDetails === 'object') {
                localStorage.setItem('userDetails', JSON.stringify(userDetails));
              }

              window.dispatchEvent(new Event('storage'));
              window.dispatchEvent(new CustomEvent('profileUpdated'));

              setView('loginSuccess');
              
              setTimeout(() => {
                router.refresh(); 
                router.push('/dashboard');
                onClose();
              }, 800);

            } else {
              setToast('Email verified successfully! Please log in.');
              setView('login');
            }
          } catch (fallbackErr) {
            setView('login');
          }
        }
      } else {
        setError(data.message || 'Invalid OTP');
      }
    } catch (err) {
      setError('Error verifying OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendSignupOtp = async () => {
    const urlEncoded = new URLSearchParams();
    urlEncoded.append('email', email);

    try {
      await fetch('https://apitest.binnycash.com/api/user/resendOtp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: urlEncoded
      });
      setToast('OTP Resent to your email!');
    } catch (err) {
      setError('Failed to resend OTP');
    }
  };

  const handleResendForgotOtp = async () => {
    if (resendTimer > 0) return; 
    
    const urlEncoded = new URLSearchParams();
    urlEncoded.append('email', email);

    try {
      await fetch('https://apitest.binnycash.com/api/user/resendOtp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: urlEncoded
      });
      setToast('OTP Resent to your email!');
      setResendTimer(300); 
    } catch (err) {
      setError('Failed to resend OTP');
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    const urlEncoded = new URLSearchParams();
    urlEncoded.append('email', email);

    try {
      const res = await fetch('https://apitest.binnycash.com/api/user/forgetPassword', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: urlEncoded
      });
      const data = await res.json();
      
      if (res.ok) {
        setOtp('');
        setNewPassword('');
        setResendTimer(300); 
        setView('resetPassword'); 
      } else {
        setError(data.message || 'Email not found');
      }
    } catch (err) {
      setError('Error sending request');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (otp.length < 4) {
      setError('Please enter all 4 digits of the OTP.');
      return;
    }
    if (newPassword.length < 8) {
      setError('New password must be at least 8 characters long.');
      return;
    }

    setIsLoading(true);
    setError('');
    
    const urlEncoded = new URLSearchParams();
    urlEncoded.append('email', email);
    urlEncoded.append('otp', otp);
    urlEncoded.append('newPassword', newPassword); 
    urlEncoded.append('password', newPassword); 

    try {
      const res = await fetch('https://apitest.binnycash.com/api/user/resetPassword', {
        method: 'POST', 
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: urlEncoded
      });
      const data = await res.json();

      if (res.ok) {
        setView('login');
        setToast('Password reset successful! Please login.');
      } else {
        setError(data.message || 'Invalid OTP. Please try again.');
        setOtp('');
      }
    } catch (err) {
      setError('Error resetting password');
      setOtp('');
    } finally {
      setIsLoading(false);
    }
  };

  const baseInputClass = "w-full bg-[#0B0E14] border border-[#1A1D24] text-white font-medium rounded-[12px] pl-12 pr-11 py-4 outline-none focus:border-[#8B5CF6]/60 focus:bg-[#0E1118] transition-all placeholder:text-[#4B5263] shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]";
  const iconClass = "absolute left-4 w-5 h-5 text-[#4B5263] group-focus-within:text-[#8B5CF6] transition-colors pointer-events-none";

  const BrandHeader = ({ title, subtitle }: { title: string, subtitle: string }) => (
    <div className="text-center mb-8">
      <div className="flex flex-col items-center justify-center mb-8">
         <h1 className="text-[42px] font-black tracking-tighter uppercase text-transparent bg-clip-text bg-gradient-to-r from-[#8B5CF6] via-[#A855F7] to-[#3B82F6] drop-shadow-[0_0_15px_rgba(139,92,246,0.2)] leading-none">
           BinnyCash
         </h1>
         <span className="text-[9px] font-black tracking-[0.4em] text-[#00E57A] mt-3 bg-[#00E57A]/10 px-3.5 py-1.5 rounded-full border border-[#00E57A]/20 uppercase shadow-sm">
           Play. Earn. Dominate.
         </span>
      </div>
      <div>
        <h2 className="text-white text-xl font-bold tracking-wide">{title}</h2>
        <p className="text-[#8F95A3] text-[13px] mt-1.5 font-medium">{subtitle}</p>
      </div>
    </div>
  );

  const GoogleButton = () => {
    const handleGoogleLogin = () => {
      const deviceId = getOrCreateDeviceId();
      const params = new URLSearchParams();
      params.append('device_id', deviceId);
      
      if (isUrlReferral && refCodeValue) {
        params.append('referralCode', refCodeValue.trim());
      } 
      
      if (showPromo && promoCode.trim()) {
        params.append('bonusCode', promoCode.trim());
      }

      window.location.href = `https://apitest.binnycash.com/auth/google?${params.toString()}`;
    };

    return (
      <button 
        type="button"
        onClick={handleGoogleLogin}
        className="w-full flex items-center justify-center gap-3 bg-[#0F1219] hover:bg-[#151923] border border-[#232736] text-white font-bold py-4 rounded-[12px] transition-all cursor-pointer shadow-[0_2px_10px_rgba(0,0,0,0.2)]"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
        </svg>
        Continue with Google
      </button>
    );
  };

  if (view === 'loginSuccess') {
    return (
      <div className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#05070A] overflow-hidden font-sans transition-opacity duration-300">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-[#8B5CF6]/10 blur-[100px] rounded-full pointer-events-none" />
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }} 
          animate={{ scale: 1, opacity: 1 }} 
          className="relative flex flex-col items-center z-10"
        >
           <div className="relative mb-8">
              <motion.div 
                animate={{ rotate: 360 }} 
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }} 
                className="absolute -inset-4 rounded-full border border-dashed border-[#8B5CF6]/50" 
              />
              <div className="w-24 h-24 bg-[#0A0D14] border border-[#8B5CF6]/30 rounded-[20px] flex items-center justify-center shadow-[0_0_40px_rgba(139,92,246,0.3)] relative z-10 overflow-hidden">
                <Rocket className="w-10 h-10 text-[#A855F7]" strokeWidth={2} />
              </div>
           </div>
           <h2 className="text-3xl font-black text-white tracking-wide mb-2">Welcome Back!</h2>
           <p className="text-[#00E57A] text-sm font-bold animate-pulse tracking-widest uppercase">Signing into your dashboard...</p>
        </motion.div>
      </div>
    );
  }

  const animConfig = {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.95 },
    transition: { duration: 0.2 }
  };

  return (
    <div className={`fixed inset-0 z-[100] flex items-center justify-center bg-[#000000]/80 backdrop-blur-sm p-4 font-sans overflow-y-auto transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      
      <style jsx global>{`
        input[type="password"]::-ms-reveal, input[type="password"]::-ms-clear { 
          display: none; 
        }
        @keyframes shimmer { 
          100% { transform: translateX(100%); } 
        }
        .btn-shimmer::after {
          content: ''; 
          position: absolute; 
          top: 0; 
          left: 0; 
          width: 50%; 
          height: 100%;
          background: linear-gradient(to right, transparent, rgba(255,255,255,0.3), transparent);
          transform: skewX(-20deg) translateX(-150%);
          animation: shimmer 2s infinite ease-in-out;
        }
        .cyber-btn {
          background: linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%);
          box-shadow: 0 4px 15px rgba(139, 92, 246, 0.3), inset 0 -3px 0 rgba(0,0,0,0.15);
        }
        .cyber-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(139, 92, 246, 0.4), inset 0 -3px 0 rgba(0,0,0,0.15);
        }
        .bg-grid-pattern {
          background-size: 30px 30px;
          background-image: linear-gradient(to right, rgba(255,255,255,0.02) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(255,255,255,0.02) 1px, transparent 1px);
        }
      `}</style>

      {/* Toast Popup */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -30, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9 }}
            transition={{ duration: 0.25 }}
            className="fixed top-6 left-1/2 -translate-x-1/2 z-[100000] w-[calc(100%-2rem)] max-w-[420px] flex items-center gap-3 bg-[#0B0E14] border border-[#00E57A]/40 text-white text-sm font-bold px-5 py-4 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.6)]"
          >
            <CheckCircle2 className="w-5 h-5 text-[#00E57A] shrink-0" />
            <span>{toast}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Container */}
      <div className="w-full max-w-[460px] bg-[#05070A] border border-[#1A1D24] rounded-[24px] shadow-[0_20px_60px_rgba(0,0,0,0.9)] relative my-auto overflow-hidden">
        
        <div className="absolute inset-0 bg-grid-pattern pointer-events-none" />
        <div className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-[#8B5CF6] via-[#A855F7] to-[#3B82F6]" />

        <div className="p-8 sm:p-10 relative z-10">
          <button onClick={onClose} className="absolute top-6 right-6 w-8 h-8 flex items-center justify-center text-[#4B5263] hover:text-white transition-colors cursor-pointer z-50">
            ✕
          </button>

          <AnimatePresence mode="wait">
            
            {/* ======================= LOGIN VIEW ======================= */}
            {view === 'login' && (
              <motion.div key="login" {...animConfig}>
                <BrandHeader title="Sign In" subtitle="Access your dashboard and continue earning." />
                
                {error && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-3 rounded-lg bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444] text-xs font-bold text-center flex items-center justify-center gap-2">
                    <ShieldCheck className="w-4 h-4 shrink-0"/> {error}
                  </motion.div>
                )}

                <form onSubmit={handleLogin} className="flex flex-col gap-4">
                  <div className="relative group flex items-center">
                    <Mail className={iconClass} />
                    <input 
                      type="email" 
                      required 
                      placeholder="Email Address" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                      className={baseInputClass} 
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className="relative group flex items-center">
                      <Lock className={iconClass} />
                      <input 
                        type={showPassword ? "text" : "password"} 
                        required 
                        placeholder="Password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} 
                        className={baseInputClass} 
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowPassword(!showPassword)} 
                        className="absolute right-4 text-[#4B5263] hover:text-white transition-colors outline-none cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    <div className="flex justify-end mt-1">
                      <button 
                        type="button" 
                        onClick={() => setView('forgotPassword')} 
                        className="text-[11px] font-bold text-[#8F95A3] hover:text-[#8B5CF6] transition-colors cursor-pointer"
                      >
                        Recover Password?
                      </button>
                    </div>
                  </div>

                  <button 
                    disabled={isLoading} 
                    className="cyber-btn mt-4 w-full text-white font-black text-sm uppercase tracking-widest py-4 rounded-[12px] transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <><Loader2 className="w-5 h-5 animate-spin" /> <span>Logging In...</span></>
                    ) : (
                      <>Access Account <ArrowRight className="w-4 h-4" /></>
                    )}
                  </button>
                </form>

                <div className="flex items-center gap-4 my-7">
                  <div className="flex-1 h-[1px] bg-[#1A1D24]"></div>
                  <span className="text-[10px] font-bold text-[#4B5263] tracking-widest uppercase">Or Continue With</span>
                  <div className="flex-1 h-[1px] bg-[#1A1D24]"></div>
                </div>

                <GoogleButton />

                {/* LOGIN FOOTER */}
                <div className="mt-8 text-center flex flex-col gap-3">
                  <p className="text-[13px] text-[#8F95A3] font-medium">
                    New player? 
                    <button 
                      onClick={() => setView('register')} 
                      className="text-[#8B5CF6] font-bold hover:underline transition-colors cursor-pointer ml-1"
                    >
                      Create Account
                    </button>
                  </p>
                  <p className="text-[10px] leading-relaxed text-[#4B5263]">
                    Protected by reCAPTCHA and subject to our <a href="/terms" className="text-[#3B82F6] hover:underline">Terms</a> & <a href="/privacy" className="text-[#3B82F6] hover:underline">Privacy Policy</a>.
                  </p>
                </div>
              </motion.div>
            )}

            {/* ======================= REGISTER VIEW ======================= */}
            {view === 'register' && (
              <motion.div key="register" {...animConfig}>
                <BrandHeader title="Join the Elite" subtitle="Create your account and start dominating." />
                
                {error && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-3 rounded-lg bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444] text-xs font-bold text-center">
                    {error}
                  </motion.div>
                )}

                <form onSubmit={handleRegister} className="flex flex-col gap-4">
                  <div className="relative group flex items-center">
                    <Mail className={iconClass} />
                    <input 
                      type="email" 
                      required 
                      placeholder="Email Address" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                      className={baseInputClass} 
                    />
                  </div>

                  <div className="relative group flex items-center">
                    <Lock className={iconClass} />
                    <input 
                      type={showPassword ? "text" : "password"} 
                      required 
                      placeholder="Create Password" 
                      value={password} 
                      onChange={(e) => setPassword(e.target.value)} 
                      className={baseInputClass} 
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowPassword(!showPassword)} 
                      className="absolute right-4 text-[#4B5263] hover:text-white transition-colors outline-none cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>

                  <div className="flex flex-col gap-3 mt-1">
                    {/* Auto-detected Referral Banner */}
                    {isUrlReferral && refCodeValue && (
                      <div className="bg-[#00E57A]/10 border border-[#00E57A]/20 rounded-[12px] p-3 flex items-center gap-3">
                        <Zap className="w-4 h-4 text-[#00E57A]" />
                        <div>
                          <span className="text-[10px] font-bold text-[#00E57A] uppercase block leading-tight">Referral Active</span>
                          <span className="text-[13px] font-bold text-white">{refCodeValue}</span>
                        </div>
                      </div>
                    )}
                    
                    {/* Optional Bonus Code Input */}
                    <div>
                      <button 
                        type="button" 
                        onClick={() => setShowPromo(!showPromo)} 
                        className="text-left text-[11px] font-bold text-[#8B5CF6] hover:text-[#A66CFF] transition-colors cursor-pointer w-fit flex items-center gap-1"
                      >
                        {showPromo ? '− Hide Bonus Code' : '+ Add Bonus Code (Optional)'}
                      </button>
                      <AnimatePresence>
                        {showPromo && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }} 
                            animate={{ height: 'auto', opacity: 1 }} 
                            exit={{ height: 0, opacity: 0 }} 
                            className="overflow-hidden mt-3"
                          >
                            <div className="relative group flex items-center">
                              <Hash className={iconClass} />
                              <input 
                                type="text" 
                                placeholder="Enter bonus code" 
                                value={promoCode} 
                                onChange={(e) => setPromoCode(e.target.value)} 
                                className={baseInputClass} 
                              />
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  <button 
                    disabled={isLoading} 
                    className="cyber-btn mt-4 w-full text-white font-black text-sm uppercase tracking-widest py-4 rounded-[12px] transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <><Loader2 className="w-5 h-5 animate-spin" /> <span>Signing Up...</span></>
                    ) : (
                      <>Sign Up Now <ArrowRight className="w-4 h-4" /></>
                    )}
                  </button>
                </form>

                <div className="flex items-center gap-4 my-7">
                  <div className="flex-1 h-[1px] bg-[#1A1D24]"></div>
                  <span className="text-[10px] font-bold text-[#4B5263] tracking-widest uppercase">Or</span>
                  <div className="flex-1 h-[1px] bg-[#1A1D24]"></div>
                </div>

                <GoogleButton />

                {/* REGISTER FOOTER */}
                <div className="mt-8 text-center flex flex-col gap-3">
                  <p className="text-[13px] text-[#8F95A3] font-medium">
                    Already registered? 
                    <button 
                      onClick={() => setView('login')} 
                      className="text-[#8B5CF6] font-bold hover:underline transition-colors cursor-pointer ml-1"
                    >
                      Log In
                    </button>
                  </p>
                  <p className="text-[10px] leading-relaxed text-[#4B5263]">
                    By joining, you agree to our <a href="/terms" className="text-[#3B82F6] hover:underline">Terms</a> & <a href="/privacy" className="text-[#3B82F6] hover:underline">Privacy Policy</a>. No VPNs.
                  </p>
                </div>
              </motion.div>
            )}

            {/* ======================= VERIFY SIGNUP OTP VIEW ======================= */}
            {view === 'verifyOtp' && (
              <motion.div key="otp" {...animConfig} className="relative z-10 flex flex-col items-center">
                <div className="text-center mb-8">
                  <h2 className="text-white text-[28px] font-black tracking-tight mb-2">Verify Email</h2>
                  <p className="text-[#8F95A3] text-[13px]">
                    Enter the 4-digit code we sent to <br/>
                    <span className="text-white font-medium">{email}</span>
                  </p>
                </div>
                
                {error && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 w-full p-3 rounded-lg bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444] text-xs font-bold text-center">
                    {error}
                  </motion.div>
                )}
                
                <form onSubmit={handleVerifyOtp} className="w-full flex flex-col gap-6">
                  <div className="flex justify-center gap-3 sm:gap-4" onPaste={handleOtpPaste}>
                    {[0, 1, 2, 3].map((index) => (
                      <input
                        key={index}
                        id={`otp-${index}`}
                        type="text"
                        maxLength={1}
                        value={otp[index] || ''}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        className="w-14 h-16 sm:w-16 sm:h-20 bg-[#0B0E14] border border-[#1A1D24] rounded-2xl text-center text-[28px] font-bold text-white focus:border-[#8B5CF6] focus:bg-[#0B0E14] focus:ring-1 focus:ring-[#8B5CF6] transition-all outline-none shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]"
                      />
                    ))}
                  </div>
                  
                  <button 
                    disabled={isLoading} 
                    className="cyber-btn mt-6 w-full text-white font-black text-sm uppercase tracking-widest py-4 rounded-[12px] transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <><Loader2 className="w-5 h-5 animate-spin" /> <span>Verifying...</span></>
                    ) : (
                      <>Verify & Access <ArrowRight className="w-4 h-4" /></>
                    )}
                  </button>
                </form>
                
                <div className="mt-8 text-center">
                  <button 
                    onClick={handleResendSignupOtp} 
                    className="text-[13px] text-[#8F95A3] hover:text-white transition-colors cursor-pointer"
                  >
                    Didn't receive it? <span className="font-bold underline text-[#8B5CF6]">Resend</span>
                  </button>
                </div>
              </motion.div>
            )}

            {/* ======================= FORGOT PASSWORD STEP 1 (Email Only) ======================= */}
            {view === 'forgotPassword' && (
              <motion.div key="forgot" {...animConfig} className="relative z-10">
                <BrandHeader title="Reset Identity" subtitle="Enter your email to receive a recovery code." />
                
                {error && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-3 rounded-lg bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444] text-xs font-bold text-center">
                    {error}
                  </motion.div>
                )}
                
                <form onSubmit={handleForgotPassword} className="flex flex-col gap-4">
                  <div className="relative group flex items-center">
                    <Mail className={iconClass} />
                    <input 
                      type="email" 
                      required 
                      placeholder="Registered Email" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)} 
                      className={baseInputClass} 
                    />
                  </div>
                  
                  <button 
                    disabled={isLoading} 
                    className="cyber-btn mt-4 w-full text-white font-black text-sm uppercase tracking-widest py-4 rounded-[12px] transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <><Loader2 className="w-5 h-5 animate-spin" /> <span>Sending...</span></>
                    ) : (
                      <>Send Recovery Code</>
                    )}
                  </button>
                </form>

                <button 
                  onClick={() => setView('login')} 
                  className="mt-8 w-full text-center text-[13px] text-[#8F95A3] hover:text-white font-bold cursor-pointer transition-colors"
                >
                  ← Back to Login
                </button>
              </motion.div>
            )}

            {/* ======================= FORGOT PASSWORD STEP 2 (Combined OTP + New Password) ======================= */}
            {view === 'resetPassword' && (
              <motion.div key="reset-password" {...animConfig} className="relative z-10 flex flex-col items-center">
                <div className="text-center mb-8">
                  <h2 className="text-white text-[28px] font-black tracking-tight mb-2">Reset Password</h2>
                  <p className="text-[#8F95A3] text-[13px]">
                    Enter the 4-digit code sent to <br/>
                    <span className="text-white font-medium">{email}</span>
                  </p>
                </div>
                
                {error && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 w-full p-3 rounded-lg bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444] text-xs font-bold text-center">
                    {error}
                  </motion.div>
                )}
                
                <form onSubmit={handleResetPassword} className="w-full flex flex-col gap-6">
                  
                  {/* OTP Input */}
                  <div className="flex justify-center gap-3 sm:gap-4" onPaste={handleOtpPaste}>
                    {[0, 1, 2, 3].map((index) => (
                      <input
                        key={index}
                        id={`otp-${index}`}
                        type="text"
                        maxLength={1}
                        value={otp[index] || ''}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(index, e)}
                        className="w-14 h-16 sm:w-16 sm:h-20 bg-[#0B0E14] border border-[#1A1D24] rounded-2xl text-center text-[28px] font-bold text-white focus:border-[#8B5CF6] focus:bg-[#0B0E14] focus:ring-1 focus:ring-[#8B5CF6] transition-all outline-none shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]"
                      />
                    ))}
                  </div>

                  {/* New Password Input */}
                  <div className="relative group flex items-center w-full mt-2">
                    <Lock className={iconClass} />
                    <input 
                      type={showPassword ? "text" : "password"} 
                      required 
                      placeholder="Enter new secure password" 
                      value={newPassword} 
                      onChange={(e) => setNewPassword(e.target.value)} 
                      className={baseInputClass} 
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowPassword(!showPassword)} 
                      className="absolute right-4 text-[#4B5263] hover:text-white transition-colors cursor-pointer outline-none"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>

                  <button 
                    disabled={isLoading} 
                    className="cyber-btn mt-2 w-full text-white font-black text-sm uppercase tracking-widest py-4 rounded-[12px] transition-all cursor-pointer flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <><Loader2 className="w-5 h-5 animate-spin" /> <span>Updating...</span></>
                    ) : (
                      <>Update & Access <CheckCircle2 className="w-4 h-4" /></>
                    )}
                  </button>
                </form>

                {/* Resend OTP Timer Logic */}
                <div className="mt-8 text-center">
                  {resendTimer > 0 ? (
                    <span className="text-[13px] text-[#8F95A3]">
                      You can resend OTP in <span className="font-bold text-white tracking-widest">{formatTime(resendTimer)}</span>
                    </span>
                  ) : (
                    <button 
                      onClick={handleResendForgotOtp} 
                      className="text-[13px] text-[#8F95A3] hover:text-white transition-colors cursor-pointer"
                    >
                      Didn't receive it? <span className="font-bold underline text-[#8B5CF6]">Resend OTP</span>
                    </button>
                  )}
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}