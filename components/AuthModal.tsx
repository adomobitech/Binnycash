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
  Rocket,
  RefreshCcw,
  MailOpen
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialView?: 'login' | 'register';
}

type ViewState = 'login' | 'register' | 'verifyEmailSent' | 'forgotPassword' | 'resetEmailSent' | 'loginSuccess';

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
  
  // UI States
  const [isLoading, setIsLoading] = useState(false);
  const [isCheckingStatus, setIsCheckingStatus] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Timer State for Resend Link (in seconds)
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

  // Handle Resend Link Timer Countdown
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
    return `${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
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
  // REUSABLE SUCCESS LOGIN HANDLER
  // =====================================
  const processSuccessfulLogin = (data: any) => {
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
      window.location.href = '/dashboard';
    }, 1200); 
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

    const urlEncoded = new URLSearchParams();
    urlEncoded.append('email', email);
    urlEncoded.append('password', password);
    urlEncoded.append('device_id', getOrCreateDeviceId());

    if (isUrlReferral && refCodeValue) urlEncoded.append('referralCode', refCodeValue.trim());
    if (showPromo && promoCode.trim() !== '') urlEncoded.append('bonusCode', promoCode.trim());

    try {
      const res = await fetch('https://api.binnycash.com/api/user/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: urlEncoded
      });
      const data = await res.json();
      
      const errCode = data?.code || data?.responseCode;
      const errMsg = data?.message || data?.responseMessage || '';
      
      const isError = !res.ok || errCode === 400 || errCode === 403 || errCode === 409 || data?.type === 'error' || errMsg.toLowerCase().includes('already') || errMsg.toLowerCase().includes('alredy') || errMsg.toLowerCase().includes('required');

      if (!isError) {
        setResendTimer(300); // 5 minutes timer
        setView('verifyEmailSent'); 
      } else {
        let displayError = errMsg || 'Signup failed. Please check your details.';
        if (displayError.toLowerCase().includes('device alredy') || displayError.toLowerCase().includes('device already')) {
          displayError = 'This device is already registered.';
        } else if (displayError.toLowerCase().includes('alredy') || displayError.toLowerCase().includes('already')) {
          displayError = 'Account already exists. Please log in.';
        }
        setError(displayError);
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
    urlEncoded.append('device_id', getOrCreateDeviceId());

    try {
      const res = await fetch('https://api.binnycash.com/api/user/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: urlEncoded
      });
      const data = await res.json();
      
      const errCode = data?.code || data?.responseCode;
      const errMsg = data?.message || data?.responseMessage || '';
      const isError = !res.ok || errCode === 400 || errCode === 401 || errCode === 403 || errCode === 404 || data?.type === 'error' || errMsg.toLowerCase().includes('wrong');
      
      if (!isError) {
        processSuccessfulLogin(data);
      } else {
        setError(errMsg || 'Wrong email or password.');
      }
    } catch (err) {
      setError('Network Error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // 🔥 CHANGED: Now only runs when the user manually clicks "Refresh Status"
  const checkVerificationStatus = async () => {
    setIsCheckingStatus(true);
    
    const urlEncoded = new URLSearchParams();
    urlEncoded.append('email', email);
    urlEncoded.append('password', password);
    urlEncoded.append('device_id', getOrCreateDeviceId());

    try {
      const res = await fetch('https://api.binnycash.com/api/user/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: urlEncoded
      });
      const data = await res.json();
      
      const errCode = data?.code || data?.responseCode;
      const isError = !res.ok || errCode === 400 || errCode === 401 || errCode === 403 || errCode === 404 || data?.type === 'error';
      
      if (!isError) {
        processSuccessfulLogin(data);
      } else {
        setToast('Not verified yet. Please check your email and click the link.');
      }
    } catch (err) {
      setToast('Network Error. Could not check status.');
    } finally {
      setIsCheckingStatus(false);
    }
  };

  const handleResendLink = async () => {
    if (resendTimer > 0) return;

    const urlEncoded = new URLSearchParams();
    urlEncoded.append('email', email);

    try {
      const res = await fetch('https://api.binnycash.com/api/user/resendOtp', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: urlEncoded
      });
      const data = await res.json();
      
      const errCode = data?.code || data?.responseCode;
      const errMsg = data?.message || data?.responseMessage || '';
      const isError = !res.ok || errCode === 400 || errCode === 403 || data?.type === 'error';

      if (!isError) {
        setToast('Link resent successfully to your email!');
        setResendTimer(300); // 5 minutes
      } else {
        setError(errMsg || 'Failed to resend link.');
      }
    } catch (err) {
      setError('Network error. Failed to resend.');
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    const urlEncoded = new URLSearchParams();
    urlEncoded.append('email', email);

    try {
      const res = await fetch('https://api.binnycash.com/api/user/forgetPassword', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: urlEncoded
      });
      const data = await res.json();
      
      const errCode = data?.code || data?.responseCode;
      const errMsg = data?.message || data?.responseMessage || '';
      const isError = !res.ok || errCode === 400 || errCode === 403 || errCode === 404 || data?.type === 'error';

      if (!isError) {
        setResendTimer(300); 
        setView('resetEmailSent'); 
      } else {
        setError(errMsg || 'Email not found');
      }
    } catch (err) {
      setError('Error sending request');
    } finally {
      setIsLoading(false);
    }
  };

  // =====================================
  // UI COMPONENTS
  // =====================================
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
      if (isUrlReferral && refCodeValue) params.append('referralCode', refCodeValue.trim());
      if (showPromo && promoCode.trim()) params.append('promoCode', promoCode.trim());
      window.location.href = `https://api.binnycash.com/auth/google?${params.toString()}`;
    };

    return (
      <button 
        type="button" onClick={handleGoogleLogin}
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
              <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="absolute -inset-4 rounded-full border border-dashed border-[#8B5CF6]/50" />
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
        input[type="password"]::-ms-reveal, input[type="password"]::-ms-clear { display: none; }
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
                    <input type="email" required placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} className={baseInputClass} />
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className="relative group flex items-center">
                      <Lock className={iconClass} />
                      <input type={showPassword ? "text" : "password"} required placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className={baseInputClass} />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 text-[#4B5263] hover:text-white transition-colors outline-none cursor-pointer">
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                    <div className="flex justify-end mt-1">
                      <button type="button" onClick={() => setView('forgotPassword')} className="text-[11px] font-bold text-[#8F95A3] hover:text-[#8B5CF6] transition-colors cursor-pointer">
                        Recover Password?
                      </button>
                    </div>
                  </div>

                  <button disabled={isLoading} className="cyber-btn mt-4 w-full text-white font-black text-sm uppercase tracking-widest py-4 rounded-[12px] transition-all cursor-pointer flex items-center justify-center gap-2">
                    {isLoading ? <><Loader2 className="w-5 h-5 animate-spin" /> <span>Logging In...</span></> : <>Access Account <ArrowRight className="w-4 h-4" /></>}
                  </button>
                </form>

                <div className="flex items-center gap-4 my-7">
                  <div className="flex-1 h-[1px] bg-[#1A1D24]"></div>
                  <span className="text-[10px] font-bold text-[#4B5263] tracking-widest uppercase">Or Continue With</span>
                  <div className="flex-1 h-[1px] bg-[#1A1D24]"></div>
                </div>

                <GoogleButton />

                <div className="mt-8 text-center flex flex-col gap-3">
                  <p className="text-[13px] text-[#8F95A3] font-medium">New player? <button onClick={() => setView('register')} className="text-[#8B5CF6] font-bold hover:underline transition-colors cursor-pointer ml-1">Create Account</button></p>
                  <p className="text-[10px] leading-relaxed text-[#4B5263]">Protected by reCAPTCHA and subject to our <a href="/terms" className="text-[#3B82F6] hover:underline">Terms</a> & <a href="/privacy" className="text-[#3B82F6] hover:underline">Privacy Policy</a>. No VPNs.</p>
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
                    <input type="email" required placeholder="Email Address" value={email} onChange={(e) => setEmail(e.target.value)} className={baseInputClass} />
                  </div>

                  <div className="relative group flex items-center">
                    <Lock className={iconClass} />
                    <input type={showPassword ? "text" : "password"} required placeholder="Create Password" value={password} onChange={(e) => setPassword(e.target.value)} className={baseInputClass} />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 text-[#4B5263] hover:text-white transition-colors outline-none cursor-pointer">
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>

                  <div className="flex flex-col gap-3 mt-1">
                    {isUrlReferral && refCodeValue && (
                      <div className="bg-[#00E57A]/10 border border-[#00E57A]/20 rounded-[12px] p-3 flex items-center gap-3">
                        <Zap className="w-4 h-4 text-[#00E57A]" />
                        <div>
                          <span className="text-[10px] font-bold text-[#00E57A] uppercase block leading-tight">Referral Active</span>
                          <span className="text-[13px] font-bold text-white">{refCodeValue}</span>
                        </div>
                      </div>
                    )}
                    <div>
                      <button type="button" onClick={() => setShowPromo(!showPromo)} className="text-left text-[11px] font-bold text-[#8B5CF6] hover:text-[#A66CFF] transition-colors cursor-pointer w-fit flex items-center gap-1">
                        {showPromo ? '− Hide Bonus Code' : '+ Add Bonus Code (Optional)'}
                      </button>
                      <AnimatePresence>
                        {showPromo && (
                          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden mt-3">
                            <div className="relative group flex items-center">
                              <Hash className={iconClass} />
                              <input type="text" placeholder="Enter bonus code" value={promoCode} onChange={(e) => setPromoCode(e.target.value)} className={baseInputClass} />
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  <button disabled={isLoading} className="cyber-btn mt-4 w-full text-white font-black text-sm uppercase tracking-widest py-4 rounded-[12px] transition-all cursor-pointer flex items-center justify-center gap-2">
                    {isLoading ? <><Loader2 className="w-5 h-5 animate-spin" /> <span>Signing Up...</span></> : <>Sign Up Now <ArrowRight className="w-4 h-4" /></>}
                  </button>
                </form>

                <div className="flex items-center gap-4 my-7">
                  <div className="flex-1 h-[1px] bg-[#1A1D24]"></div>
                  <span className="text-[10px] font-bold text-[#4B5263] tracking-widest uppercase">Or</span>
                  <div className="flex-1 h-[1px] bg-[#1A1D24]"></div>
                </div>

                <GoogleButton />

                <div className="mt-8 text-center flex flex-col gap-3">
                  <p className="text-[13px] text-[#8F95A3] font-medium">Already registered? <button onClick={() => setView('login')} className="text-[#8B5CF6] font-bold hover:underline transition-colors cursor-pointer ml-1">Log In</button></p>
                  <p className="text-[10px] leading-relaxed text-[#4B5263]">By joining, you agree to our <a href="/terms" className="text-[#3B82F6] hover:underline">Terms</a> & <a href="/privacy" className="text-[#3B82F6] hover:underline">Privacy Policy</a>. No VPNs.</p>
                </div>
              </motion.div>
            )}

            {/* ======================= VERIFY EMAIL SENT (MANUAL REFRESH ONLY) ======================= */}
            {view === 'verifyEmailSent' && (
              <motion.div key="verify-email" {...animConfig} className="relative z-10 flex flex-col items-center">
                
                <div className="w-20 h-20 bg-[#8B5CF6]/10 border border-[#8B5CF6]/30 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(139,92,246,0.2)] relative">
                  <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 2 }} className="absolute inset-0 bg-[#8B5CF6]/20 rounded-full blur-md" />
                  <MailOpen className="w-8 h-8 text-[#A855F7] relative z-10" />
                </div>

                <div className="text-center mb-6">
                  <h2 className="text-white text-[26px] font-black tracking-tight mb-3">Check Your Email</h2>
                  <p className="text-[#8F95A3] text-sm leading-relaxed">
                    We've sent a magic link to <br/>
                    <span className="text-white font-bold">{email}</span>
                  </p>
                </div>

                <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 mb-6 text-center">
                  <p className="text-xs text-[#8F95A3] mb-4">
                    Click the link in the email to verify your account. Once verified in the new tab, click below to access your account.
                  </p>
                  {/* 🔥 MANUAL REFRESH BUTTON ONLY 🔥 */}
                  <button 
                    onClick={checkVerificationStatus}
                    disabled={isCheckingStatus}
                    className="w-full bg-[#1A1D24] hover:bg-[#232736] border border-white/10 text-white font-bold text-sm py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-sm"
                  >
                    <RefreshCcw className={`w-4 h-4 ${isCheckingStatus ? 'animate-spin' : ''}`} /> 
                    {isCheckingStatus ? 'Checking Status...' : 'Refresh Status'}
                  </button>
                </div>
                
                <div className="text-center w-full">
                  {resendTimer > 0 ? (
                    <span className="text-[12px] text-[#8F95A3]">
                      Resend available in <span className="font-bold text-white tracking-widest">{formatTime(resendTimer)}</span>
                    </span>
                  ) : (
                    <button 
                      type="button" onClick={handleResendLink} 
                      className="text-[13px] text-[#8F95A3] hover:text-white transition-colors cursor-pointer"
                    >
                      Didn't receive it? <span className="font-bold underline text-[#8B5CF6]">Resend Link</span>
                    </button>
                  )}
                </div>

                <button onClick={() => setView('login')} className="mt-6 text-[12px] font-bold text-[#4B5263] hover:text-white transition-colors cursor-pointer">
                  ← Back to Login
                </button>
              </motion.div>
            )}

            {/* ======================= FORGOT PASSWORD STEP 1 ======================= */}
            {view === 'forgotPassword' && (
              <motion.div key="forgot" {...animConfig} className="relative z-10">
                <BrandHeader title="Reset Identity" subtitle="Enter your email to receive a recovery link." />
                
                {error && (
                  <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-3 rounded-lg bg-[#EF4444]/10 border border-[#EF4444]/20 text-[#EF4444] text-xs font-bold text-center">
                    {error}
                  </motion.div>
                )}
                
                <form onSubmit={handleForgotPassword} className="flex flex-col gap-4">
                  <div className="relative group flex items-center">
                    <Mail className={iconClass} />
                    <input type="email" required placeholder="Registered Email" value={email} onChange={(e) => setEmail(e.target.value)} className={baseInputClass} />
                  </div>
                  
                  <button disabled={isLoading} className="cyber-btn mt-4 w-full text-white font-black text-sm uppercase tracking-widest py-4 rounded-[12px] transition-all cursor-pointer flex items-center justify-center gap-2">
                    {isLoading ? <><Loader2 className="w-5 h-5 animate-spin" /> <span>Sending...</span></> : <>Send Recovery Link</>}
                  </button>
                </form>

                <button onClick={() => setView('login')} className="mt-8 w-full text-center text-[13px] text-[#8F95A3] hover:text-white font-bold cursor-pointer transition-colors">
                  ← Back to Login
                </button>
              </motion.div>
            )}

            {/* ======================= RESET EMAIL SENT (FORGOT PASSWORD) ======================= */}
            {view === 'resetEmailSent' && (
              <motion.div key="reset-email" {...animConfig} className="relative z-10 flex flex-col items-center">
                <div className="w-20 h-20 bg-amber-500/10 border border-amber-500/30 rounded-full flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(245,158,11,0.2)] relative">
                  <motion.div animate={{ scale: [1, 1.1, 1] }} transition={{ repeat: Infinity, duration: 2 }} className="absolute inset-0 bg-amber-500/20 rounded-full blur-md" />
                  <MailOpen className="w-8 h-8 text-amber-400 relative z-10" />
                </div>

                <div className="text-center mb-6">
                  <h2 className="text-white text-[26px] font-black tracking-tight mb-3">Check Your Email</h2>
                  <p className="text-[#8F95A3] text-sm leading-relaxed">
                    We've sent password reset instructions to <br/>
                    <span className="text-white font-bold">{email}</span>
                  </p>
                </div>

                <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-5 mb-6 text-center">
                  <p className="text-xs text-[#8F95A3]">
                    Please open the link in the email to securely create a new password. You can close this tab if you've opened the link on a different device.
                  </p>
                </div>
                
                <div className="text-center w-full mb-6">
                  {resendTimer > 0 ? (
                    <span className="text-[12px] text-[#8F95A3]">
                      Resend available in <span className="font-bold text-white tracking-widest">{formatTime(resendTimer)}</span>
                    </span>
                  ) : (
                    <button 
                      type="button" onClick={handleResendLink} 
                      className="text-[13px] text-[#8F95A3] hover:text-white transition-colors cursor-pointer"
                    >
                      Didn't receive it? <span className="font-bold underline text-amber-400">Resend Link</span>
                    </button>
                  )}
                </div>

                <button onClick={() => setView('login')} className="w-full py-3.5 bg-white hover:bg-gray-200 text-black font-black text-sm uppercase tracking-widest rounded-xl transition-all cursor-pointer">
                  Return to Login
                </button>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}