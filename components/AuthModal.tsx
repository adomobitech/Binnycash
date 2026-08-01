'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle2, ShieldCheck } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialView?: 'login' | 'register';
}

type ViewState = 'login' | 'register' | 'verifyOtp' | 'forgotPassword' | 'verifyForgotOtp' | 'loginSuccess';

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
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPromo, setShowPromo] = useState(false);
  const [promoCode, setPromoCode] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // 🔥 SEPARATE REFERRAL STATE 🔥
  const [isUrlReferral, setIsUrlReferral] = useState(false);
  const [refCodeValue, setRefCodeValue] = useState('');

  useEffect(() => {
    if (isOpen) {
      setView(initialView);
      
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const refCode = params.get('ref');
        if (refCode) {
          setRefCodeValue(refCode); // URL wale code ko alag state mein save kiya
          setIsUrlReferral(true); 
          // promoCode wali state ko nahi cheda
        } else {
          setIsUrlReferral(false);
          setRefCodeValue('');
        }
      }
    }
  }, [isOpen, initialView]);

  if (!isOpen) return null;

  // 🔥 PREMIUM LOGIN SUCCESS SCREEN 🔥
  if (view === 'loginSuccess') {
    return (
      <div className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#070913] overflow-hidden font-sans transition-opacity duration-300">
        
        {/* Background Subtle Glow - Success Emerald Color */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[#00E57A]/15 blur-[120px] rounded-full pointer-events-none" />
        
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="relative flex flex-col items-center z-10"
        >
           {/* Logo Container with Animations */}
           <div className="relative flex items-center justify-center mb-10 mt-[-50px]">
              
              {/* Outer Spinning Ring (Gradient) */}
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                className="absolute w-32 h-32 rounded-full border-2 border-transparent border-t-[#00E57A] border-r-[#00E57A] opacity-80"
              />
              
              {/* Reverse Spinning Dashed Ring */}
              <motion.div 
                animate={{ rotate: -360 }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
                className="absolute w-36 h-36 rounded-full border border-dashed border-white/10"
              />
              
              {/* Inner Pulsing Glow */}
              <motion.div 
                animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0, 0.3] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                className="absolute w-24 h-24 rounded-full bg-[#00E57A]/30 blur-md"
              />

              {/* Core Logo Box */}
              <div className="w-20 h-20 bg-[#120F1A] border border-[#00E57A]/30 rounded-[20px] flex items-center justify-center shadow-[0_0_30px_rgba(0,229,122,0.2)] z-10 relative overflow-hidden backdrop-blur-xl">
                 <img src="/logo.png" alt="BinnyCash Logo" className="w-10 h-10 object-contain z-10" />
                 
                 {/* Shimmer Effect Inside Logo Box */}
                 <motion.div 
                   animate={{ x: ['-150%', '250%'] }}
                   transition={{ duration: 2, repeat: Infinity, ease: "easeInOut", repeatDelay: 0.5 }}
                   className="absolute inset-0 w-1/2 h-full bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12"
                 />
              </div>

              {/* Small Success Badge */}
              <motion.div 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                className="absolute -bottom-2 -right-2 bg-[#00E57A] w-8 h-8 rounded-full flex items-center justify-center border-4 border-[#070913] z-20 shadow-[0_0_15px_rgba(0,229,122,0.4)]"
              >
                <CheckCircle2 className="w-4 h-4 text-black" strokeWidth={3} />
              </motion.div>
           </div>

           {/* Animated Text */}
           <motion.h2 
             animate={{ opacity: [0.5, 1, 0.5] }}
             transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
             className="text-2xl font-black text-white tracking-wide mb-3 text-center"
           >
             Preparing your dashboard...
           </motion.h2>
           
           <p className="text-[#8F95A3] text-sm font-medium flex items-center gap-2">
             <ShieldCheck className="w-4 h-4 text-[#00E57A]" />
             Authenticating secure session
           </p>
        </motion.div>
      </div>
    );
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    const endpoint = isUrlReferral
      ? 'https://apitest.binnycash.com/api/user/referSignup'
      : 'https://apitest.binnycash.com/api/user/signup';

    const urlEncoded = new URLSearchParams();
    urlEncoded.append('email', email);
    urlEncoded.append('password', password);
    urlEncoded.append('device_id', getOrCreateDeviceId());

    // 🔥 STRICT SEPARATION (Ab refer code galti se promo me nahi jayega) 🔥
    if (isUrlReferral && refCodeValue) {
      urlEncoded.append('referralCode', refCodeValue.trim());
    }

    if (showPromo && promoCode.trim() !== '') {
      urlEncoded.append('promoCode', promoCode.trim());
    }

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: urlEncoded
      });
      const data = await res.json();
      
      if (res.ok) {
        setView('verifyOtp');
      } else {
        setError(data.message || 'Signup failed');
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
          router.push('/dashboard');
          setTimeout(() => {
            onClose();
            setView('login');
            setEmail('');
            setPassword('');
          }, 800);
        }, 1500);

      } else {
        setError(data.message || 'Invalid email or password');
      }
    } catch (err) {
      setError('Network Error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
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
            router.push('/dashboard');
            setTimeout(() => { onClose(); }, 800);
          }, 1500);
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
                router.push('/dashboard');
                setTimeout(() => { onClose(); }, 800);
              }, 1500);
            } else {
              alert('Email verified successfully! Please log in.');
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

  const handleResendOtp = async () => {
    const urlEncoded = new URLSearchParams();
    urlEncoded.append('email', email);

    try {
      await fetch('https://apitest.binnycash.com/api/user/resendOtp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: urlEncoded
      });
      alert('OTP Resent to your email!');
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
      if (res.ok) {
        setView('verifyForgotOtp');
      } else {
        setError('Email not found');
      }
    } catch (err) {
      setError('Error sending request');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyForgotOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    const urlEncoded = new URLSearchParams();
    urlEncoded.append('email', email);
    urlEncoded.append('otp', otp);
    urlEncoded.append('newPassword', newPassword);

    try {
      const res = await fetch('https://apitest.binnycash.com/api/user/verifyforgetPasswordOtp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: urlEncoded
      });
      if (res.ok) {
        setView('login');
        alert('Password reset successful! Please login.');
      } else {
        setError('Invalid OTP or request failed');
      }
    } catch (err) {
      setError('Error resetting password');
    } finally {
      setIsLoading(false);
    }
  };

  const inputClass = "w-full bg-[#edf1f5] text-[#111315] font-medium rounded-xl pl-4 pr-11 py-3.5 outline-none focus:ring-2 focus:ring-[#00E57A] transition-all";
  const labelClass = "text-[11px] font-bold text-[#8F95A3] uppercase tracking-wider mb-1 block";

  const TopLogo = () => (
    <div className="mx-auto w-14 h-14 rounded-full border-[2px] border-[#00E57A]/50 bg-[#1A1C23] flex items-center justify-center mb-4 overflow-hidden shadow-[0_0_15px_rgba(0,229,122,0.15)]">
      <img src="/logo.png" alt="BinnyCash Logo" className="w-8 h-8 object-contain" />
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
        params.append('promoCode', promoCode.trim());
      }

      window.location.href = `https://apitest.binnycash.com/auth/google?${params.toString()}`;
    };

    return (
      <button 
        type="button"
        onClick={handleGoogleLogin}
        className="w-full flex items-center justify-center gap-3 bg-[#1A1C23] hover:bg-[#232630] border border-white/5 text-white font-bold py-3.5 rounded-xl transition-all cursor-pointer"
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

  return (
    <div className={`fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 font-sans overflow-y-auto transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <div className="w-full max-w-[420px] bg-[#111315] border border-white/5 rounded-[24px] p-8 shadow-2xl relative my-auto">
        
        <button onClick={onClose} className="absolute top-5 right-5 w-8 h-8 rounded-full bg-[#1A1C23] flex items-center justify-center text-[#8F95A3] hover:text-white transition-colors z-20 cursor-pointer">
          ✕
        </button>

        {/* LOGIN VIEW */}
        {view === 'login' && (
          <div>
            <div className="text-center mb-6 pt-2">
              <TopLogo />
              <h2 className="text-white text-[26px] font-black mb-2">Welcome Back</h2>
              <p className="text-[#8F95A3] text-[13px]">Log in to continue your earning journey.</p>
            </div>
            
            {error && (
              <div className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleLogin} className="flex flex-col gap-5">
              <div>
                <label className={labelClass}>Email Address</label>
                <input type="email" required placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
              </div>

              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="text-[11px] font-bold text-[#8F95A3] uppercase tracking-wider">Password</label>
                  <button type="button" onClick={() => setView('forgotPassword')} className="text-[11px] font-bold text-[#00E57A] hover:underline cursor-pointer">Forgot?</button>
                </div>
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} required placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8F95A3] hover:text-[#111315] transition-colors cursor-pointer">
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    )}
                  </button>
                </div>
              </div>

              <button disabled={isLoading} className="mt-2 w-full bg-[#00E57A] hover:bg-[#00c266] text-black font-black text-sm uppercase tracking-widest py-3.5 rounded-xl transition-colors cursor-pointer">
                {isLoading ? 'Processing...' : 'Log In'}
              </button>
            </form>

            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-[1px] bg-white/10"></div>
              <span className="text-xs font-bold text-[#8F95A3]">OR</span>
              <div className="flex-1 h-[1px] bg-white/10"></div>
            </div>

            <GoogleButton />

            <div className="mt-8 flex flex-col gap-4 text-center">
              <p className="text-[14px] text-white font-medium">
                Don't have an account? <button onClick={() => setView('register')} className="text-[#8B5CF6] font-bold hover:underline transition-colors cursor-pointer">Sign up</button>
              </p>
              <div className="text-[12px] leading-relaxed text-[#8F95A3]">
                <p>Using VPNs, emulators, or misusing offers is strictly prohibited.</p>
              </div>
            </div>
          </div>
        )}

        {/* REGISTER VIEW */}
        {view === 'register' && (
          <div>
            <div className="text-center mb-6 pt-2">
              <TopLogo />
              <h2 className="text-white text-[26px] font-black mb-2">Create Account</h2>
              <p className="text-[#8F95A3] text-[13px]">Join BinnyCash and start earning.</p>
            </div>
            
            {error && (
              <div className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleRegister} className="flex flex-col gap-5">
              <div>
                <label className={labelClass}>Email Address</label>
                <input type="email" required placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
              </div>

              <div>
                <label className={labelClass}>Password</label>
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} required placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className={inputClass} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8F95A3] hover:text-[#111315] transition-colors cursor-pointer">
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    )}
                  </button>
                </div>
              </div>

              {/* 🔥 UI AS REQUESTED IN SCREENSHOT 🔥 */}
              <div className="flex flex-col gap-3">
                {isUrlReferral && refCodeValue && (
                  <div>
                    <label className="text-[11px] font-bold text-[#00E57A] mb-1 block">
                      ✓ Referral Code Applied
                    </label>
                    <input 
                      type="text" 
                      value={refCodeValue} 
                      readOnly 
                      className="w-full bg-[#A3A8B5] text-[#111315] font-medium rounded-xl pl-4 pr-4 py-3.5 outline-none cursor-not-allowed select-none opacity-80" 
                    />
                  </div>
                )}
                
                <div className="flex flex-col mt-[-4px]">
                  <button 
                    type="button" 
                    onClick={() => setShowPromo(!showPromo)} 
                    className="text-left text-[11px] font-bold text-[#8B5CF6] hover:underline cursor-pointer w-fit"
                  >
                    {showPromo ? '− Remove Promo Code' : '+ I have a promo code (Optional)'}
                  </button>
                  {showPromo && (
                    <input 
                      type="text" 
                      placeholder="Enter Promo Code" 
                      value={promoCode} 
                      onChange={(e) => setPromoCode(e.target.value)} 
                      className={`${inputClass} mt-2`} 
                    />
                  )}
                </div>
              </div>

              <button disabled={isLoading} className="mt-2 w-full bg-[#00E57A] hover:bg-[#00c266] text-black font-black text-sm uppercase tracking-widest py-3.5 rounded-xl transition-colors cursor-pointer">
                {isLoading ? 'Creating Account...' : 'Sign Up'}
              </button>
            </form>

            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-[1px] bg-white/10"></div>
              <span className="text-xs font-bold text-[#8F95A3]">OR</span>
              <div className="flex-1 h-[1px] bg-white/10"></div>
            </div>

            <GoogleButton />

            <div className="mt-8 flex flex-col gap-4 text-center">
              <p className="text-[14px] text-white font-medium">
                Already have an account? <button onClick={() => setView('login')} className="text-[#8B5CF6] font-bold hover:underline transition-colors cursor-pointer">Login now</button>
              </p>
              <div className="text-[12px] leading-relaxed text-[#8F95A3]">
                <p className="mb-2">
                  By creating an account, you agree to our <a href="#" className="text-[#8B5CF6] hover:underline transition-colors">Terms of Service</a> and <a href="#" className="text-[#8B5CF6] hover:underline transition-colors">Privacy Policy</a>
                </p>
                <p>Creating multiple accounts, using VPNs, emulators, or misusing offers is strictly prohibited.</p>
              </div>
            </div>
          </div>
        )}

        {/* VERIFY OTP VIEW */}
        {view === 'verifyOtp' && (
          <div>
            <div className="text-center mb-6 pt-2">
              <TopLogo />
              <h2 className="text-white text-[26px] font-black mb-2">Verify Email</h2>
              <p className="text-[#8F95A3] text-[13px]">Enter the OTP sent to <span className="text-white">{email}</span></p>
            </div>
            
            {error && (
              <div className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleVerifyOtp} className="flex flex-col gap-5">
              <div>
                <label className={labelClass}>Secure Code</label>
                <input type="text" required placeholder="Enter OTP" value={otp} onChange={(e) => setOtp(e.target.value)} className={`${inputClass} text-center tracking-widest text-lg font-bold`} />
              </div>
              <button disabled={isLoading} className="mt-2 w-full bg-[#00E57A] hover:bg-[#00c266] text-black font-black text-sm uppercase tracking-widest py-3.5 rounded-xl transition-colors cursor-pointer">
                {isLoading ? 'Verifying...' : 'Verify & Complete'}
              </button>
            </form>
            
            <div className="mt-6 text-center">
              <button onClick={handleResendOtp} className="text-[12px] text-[#8F95A3] hover:text-white underline cursor-pointer">Resend OTP</button>
            </div>
          </div>
        )}

        {/* FORGOT PASSWORD VIEW */}
        {view === 'forgotPassword' && (
          <div>
            <div className="text-center mb-6 pt-2">
              <TopLogo />
              <h2 className="text-white text-[26px] font-black mb-2">Reset Password</h2>
              <p className="text-[#8F95A3] text-[13px]">Enter your email to receive a reset OTP.</p>
            </div>
            
            {error && (
              <div className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleForgotPassword} className="flex flex-col gap-5">
              <div>
                <label className={labelClass}>Registered Email</label>
                <input type="email" required placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClass} />
              </div>
              <button disabled={isLoading} className="mt-2 w-full bg-[#00E57A] hover:bg-[#00c266] text-black font-black text-sm uppercase tracking-widest py-3.5 rounded-xl transition-colors cursor-pointer">
                {isLoading ? 'Sending...' : 'Send OTP'}
              </button>
            </form>

            <button onClick={() => setView('login')} className="mt-8 w-full text-center text-[12px] text-[#8F95A3] hover:text-white font-bold cursor-pointer">
              ← Back to Login
            </button>
          </div>
        )}

        {/* VERIFY FORGOT PASS OTP */}
        {view === 'verifyForgotOtp' && (
          <div>
            <div className="text-center mb-6 pt-2">
              <TopLogo />
              <h2 className="text-white text-[26px] font-black mb-2">New Password</h2>
              <p className="text-[#8F95A3] text-[13px]">Enter OTP and your new password.</p>
            </div>
            
            {error && (
              <div className="mb-5 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleVerifyForgotOtp} className="flex flex-col gap-5">
              <div>
                <label className={labelClass}>Secure Code</label>
                <input type="text" required placeholder="Enter OTP" value={otp} onChange={(e) => setOtp(e.target.value)} className={`${inputClass} text-center tracking-widest text-lg font-bold`} />
              </div>
              <div>
                <label className={labelClass}>New Password</label>
                <div className="relative">
                  <input type={showPassword ? "text" : "password"} required placeholder="••••••••" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className={inputClass} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8F95A3] hover:text-[#111315] transition-colors cursor-pointer">
                    {showPassword ? (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" /></svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4"><path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    )}
                  </button>
                </div>
              </div>
              <button disabled={isLoading} className="mt-2 w-full bg-[#00E57A] hover:bg-[#00c266] text-black font-black text-sm uppercase tracking-widest py-3.5 rounded-xl transition-colors cursor-pointer">
                {isLoading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
}