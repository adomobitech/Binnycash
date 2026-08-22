'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Trash2, AlertTriangle, ShieldAlert, ArrowLeft, Loader2, 
  CheckCircle2, XCircle, Mail, Lock, Eye, EyeOff, ShieldCheck 
} from 'lucide-react';

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

export default function DeleteAccountPage() {
  const router = useRouter();
  
  // Page States
  const [step, setStep] = useState<'auth' | 'confirm'>('auth');
  const [tempToken, setTempToken] = useState<string | null>(null); 
  
  // Auth Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  
  // Delete Confirmation States
  const [isApproved, setIsApproved] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  
  // Global Message State
  const [message, setMessage] = useState<{ text: string, type: 'error' | 'success' } | null>(null);

  // 1. Check if user is already logged in (Helps with Google Auth redirects)
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && token !== 'undefined' && !token.includes('[object Object]')) {
      setTempToken(token);
      setStep('confirm');
    }
  }, []);

  // 2. Handle Isolated Email/Password Login (NO LOCAL STORAGE SAVING)
  const handleVerifyIdentity = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setMessage(null);
    
    const tempDeviceId = 'del_' + Math.random().toString(36).substring(2);

    const urlEncoded = new URLSearchParams();
    urlEncoded.append('email', email);
    urlEncoded.append('password', password);
    urlEncoded.append('device_id', tempDeviceId);

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
        let userToken = data.token || data.accessToken || data.data?.token;
        if (!userToken && typeof data.data === 'string') userToken = data.data;

        // Save only to temporary page state
        if (userToken && typeof userToken === 'string') {
          setTempToken(userToken);
        }

        setMessage({ text: 'Identity verified! Proceed with caution.', type: 'success' });
        setTimeout(() => {
          setMessage(null);
          setStep('confirm');
        }, 1000);

      } else {
        setMessage({ text: errMsg || 'Wrong email or password.', type: 'error' });
      }
    } catch (err) {
      setMessage({ text: 'Network Error. Please try again.', type: 'error' });
    } finally {
      setIsLoggingIn(false);
    }
  };

  // 3. Handle Google Auth
  const handleGoogleLogin = () => {
    const deviceId = getOrCreateDeviceId();
    const params = new URLSearchParams();
    params.append('device_id', deviceId);
    // Google auth relies on your backend redirect
    window.location.href = `https://api.binnycash.com/auth/google?${params.toString()}`;
  };

  // 4. Handle Final Account Deletion
  const handleDeleteAccount = async () => {
    if (!isApproved) {
      setMessage({ text: 'Please approve the deletion to proceed.', type: 'error' });
      return;
    }
    if (confirmText !== 'DELETE') {
      setMessage({ text: 'Please type DELETE exactly to confirm.', type: 'error' });
      return;
    }

    setIsDeleting(true);
    setMessage(null);

    if (!tempToken) {
      setMessage({ text: "Authentication missing. Please verify your identity again.", type: 'error' });
      setIsDeleting(false);
      setStep('auth');
      return;
    }

    try {
      const res = await fetch(`https://api.binnycash.com/api/user/deleteUser`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${tempToken}` }
      });
      
      const json = await res.json();

      const errCode = json?.code || json?.responseCode;
      const errMsg = json?.message || json?.responseMessage || '';
      const isError = !res.ok || errCode === 400 || errCode === 403 || errCode === 404 || json?.type === 'error';

      if (!isError) {
        setMessage({ text: "Account deleted permanently. Exiting...", type: 'success' });
        
        setTimeout(() => {
          localStorage.clear();
          window.location.href = '/';
        }, 1500);

      } else {
        setMessage({ text: errMsg || "Failed to delete account. Please try again.", type: 'error' });
      }
    } catch (err) {
      setMessage({ text: "Network error. Please check your connection.", type: 'error' });
    } finally {
      setIsDeleting(false);
    }
  };

  // 5. Handle Safe Exit
  const handleSafeExit = () => {
    setTempToken(null);
    setEmail('');
    setPassword('');
    setConfirmText('');
    setIsApproved(false);
    window.location.href = '/';
  };

  const baseInputClass = "w-full bg-[#0B0D14] border border-[#1A1D24] text-white font-medium rounded-[12px] pl-12 pr-11 py-4 outline-none focus:border-[#8B5CF6]/60 focus:bg-[#0E1118] transition-all placeholder:text-[#4B5263] shadow-inner";
  const iconClass = "absolute left-4 w-5 h-5 text-[#4B5263] group-focus-within:text-[#8B5CF6] transition-colors pointer-events-none";

  return (
    <div className="min-h-screen bg-[#0B0D14] text-[#F5F3FF] selection:bg-[#FF5D73]/30 relative overflow-x-hidden font-sans py-12">
      
      {/* CSS HACK: ISOLATE PAGE FROM ENTIRE WEBSITE */}
      <style dangerouslySetInnerHTML={{ __html: `
        #global-ticker-wrapper { display: none !important; }
        #main-navbar-wrapper { display: none !important; }
        footer { display: none !important; }
      `}} />

      <div className={`fixed top-0 left-1/2 -translate-x-1/2 w-full h-[500px] blur-[150px] rounded-full pointer-events-none z-0 transition-colors duration-700 ${step === 'auth' ? 'bg-[#8B5CF6]/10' : 'bg-[#FF5D73]/10'}`} />

      <main className="max-w-[600px] mx-auto px-4 sm:px-6 relative z-10 mt-10">
        
        <div className="mb-8">
          <button onClick={handleSafeExit} className="inline-flex items-center gap-2 text-[#8D89A8] hover:text-white transition-colors font-medium text-sm cursor-pointer">
            <ArrowLeft className="w-4 h-4" /> Cancel & Exit
          </button>
        </div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`bg-[#161821] border rounded-[24px] overflow-hidden transition-colors duration-500 shadow-2xl ${step === 'auth' ? 'border-[#8B5CF6]/20' : 'border-[#FF5D73]/20'}`}
        >
          <AnimatePresence mode="wait">
            
            {/* STEP 1: VERIFY IDENTITY */}
            {step === 'auth' && (
              <motion.div key="auth" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="w-full">
                <div className="bg-[#111319] border-b border-[#8B5CF6]/20 p-8 sm:p-10 flex flex-col items-center text-center relative overflow-hidden">
                  <div className="w-20 h-20 bg-[#8B5CF6]/10 border border-[#8B5CF6]/30 rounded-full flex items-center justify-center mb-5 relative z-10 shadow-[0_0_30px_rgba(139,92,246,0.2)]">
                    <ShieldCheck className="w-10 h-10 text-[#8B5CF6]" />
                  </div>
                  <h1 className="text-3xl font-black text-white tracking-tight relative z-10">Security Portal</h1>
                  <p className="text-[#8F95A3] mt-2 font-medium relative z-10">Enter your credentials to authorize account deletion.</p>
                </div>

                <div className="p-8 sm:p-10">
                  {message && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className={`mb-6 p-4 rounded-xl text-sm font-bold flex items-center gap-3 ${message.type === 'success' ? 'bg-[#00E57A]/10 text-[#00E57A] border border-[#00E57A]/20' : 'bg-[#FF5D73]/10 text-[#FF5D73] border border-[#FF5D73]/20'}`}>
                      {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <XCircle className="w-5 h-5 shrink-0" />}
                      {message.text}
                    </motion.div>
                  )}

                  <form onSubmit={handleVerifyIdentity} className="flex flex-col gap-4">
                    <div className="relative group flex items-center">
                      <Mail className={iconClass} />
                      <input type="email" required placeholder="Registered Email" value={email} onChange={(e) => setEmail(e.target.value)} className={baseInputClass} />
                    </div>

                    <div className="relative group flex items-center">
                      <Lock className={iconClass} />
                      <input type={showPassword ? "text" : "password"} required placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className={baseInputClass} />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 text-[#4B5263] hover:text-white transition-colors outline-none cursor-pointer">
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>

                    <button disabled={isLoggingIn} className="mt-4 w-full bg-gradient-to-r from-[#8B5CF6] to-[#6D28D9] text-white font-black text-sm uppercase tracking-widest py-4 rounded-[12px] shadow-[0_4px_15px_rgba(139,92,246,0.3)] hover:shadow-[0_6px_20px_rgba(139,92,246,0.4)] transition-all cursor-pointer flex items-center justify-center gap-2">
                      {isLoggingIn ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
                      {isLoggingIn ? 'Verifying...' : 'Verify & Continue'}
                    </button>
                  </form>

                  {/* 🔥 GOOGLE AUTH BUTTON ADDED HERE 🔥 */}
                  <div className="flex items-center gap-4 my-7">
                    <div className="flex-1 h-[1px] bg-[#1A1D24]"></div>
                    <span className="text-[10px] font-bold text-[#4B5263] tracking-widest uppercase">Or Verify With</span>
                    <div className="flex-1 h-[1px] bg-[#1A1D24]"></div>
                  </div>

                  <button 
                    type="button"
                    onClick={handleGoogleLogin}
                    className="w-full flex items-center justify-center gap-3 bg-[#0F1219] hover:bg-[#151923] border border-[#232736] text-white font-bold py-4 rounded-[12px] transition-all cursor-pointer shadow-sm"
                  >
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                    </svg>
                    Continue with Google
                  </button>

                </div>
              </motion.div>
            )}

            {/* STEP 2: CONFIRM DELETION */}
            {step === 'confirm' && (
              <motion.div key="confirm" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="w-full">
                <div className="bg-[#1E141A] border-b border-[#FF5D73]/20 p-8 sm:p-10 flex flex-col items-center text-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/diagmonds-light.png')] opacity-5"></div>
                  <div className="w-20 h-20 bg-[#FF5D73]/10 border border-[#FF5D73]/30 rounded-full flex items-center justify-center mb-5 relative z-10 shadow-[0_0_30px_rgba(255,93,115,0.2)]">
                    <AlertTriangle className="w-10 h-10 text-[#FF5D73]" />
                  </div>
                  <h1 className="text-3xl font-black text-white tracking-tight relative z-10">Delete Account</h1>
                  <p className="text-[#8F95A3] mt-2 font-medium relative z-10">This action is permanent and cannot be redone.</p>
                </div>

                <div className="p-8 sm:p-10">
                  <div className="bg-[#1A1C24] border border-white/5 rounded-2xl p-6 mb-8">
                    <h3 className="text-white font-bold text-lg mb-4 flex items-center gap-2">
                      <ShieldAlert className="w-5 h-5 text-[#FF5D73]" /> What happens next?
                    </h3>
                    <ul className="space-y-3">
                      <li className="flex items-start gap-3 text-[#8F95A3] text-sm"><div className="w-1.5 h-1.5 rounded-full bg-[#FF5D73] mt-1.5 shrink-0" /> Your profile, personal data, and connected accounts will be permanently wiped.</li>
                      <li className="flex items-start gap-3 text-[#8F95A3] text-sm"><div className="w-1.5 h-1.5 rounded-full bg-[#FF5D73] mt-1.5 shrink-0" /> Any unredeemed balance, rewards, and pending cashouts will be forfeited.</li>
                      <li className="flex items-start gap-3 text-[#8F95A3] text-sm"><div className="w-1.5 h-1.5 rounded-full bg-[#FF5D73] mt-1.5 shrink-0" /> Your referral network and lifetime earnings history will be lost.</li>
                    </ul>
                  </div>

                  <div className="mb-5">
                    <label className="block text-sm font-bold text-[#8F95A3] mb-3">To confirm, type <span className="text-white font-black bg-white/10 px-2 py-0.5 rounded">DELETE</span> below:</label>
                    <input type="text" value={confirmText} onChange={(e) => setConfirmText(e.target.value)} placeholder="Type DELETE" className="w-full bg-[#0B0D14] border border-[#1A1D24] text-white font-bold rounded-xl px-5 py-4 outline-none focus:border-[#FF5D73] focus:bg-[#161217] transition-all placeholder:text-[#4B5263] shadow-inner" />
                  </div>

                  <div className="mb-8 p-4 bg-[#FF5D73]/5 border border-[#FF5D73]/20 rounded-xl cursor-pointer" onClick={() => setIsApproved(!isApproved)}>
                    <label className="flex items-center gap-3 cursor-pointer select-none">
                      <div className={`w-6 h-6 rounded border flex items-center justify-center shrink-0 transition-colors ${isApproved ? 'bg-[#FF5D73] border-[#FF5D73]' : 'bg-[#0B0D14] border-[#4B5263]'}`}>
                        {isApproved && <CheckCircle2 className="w-4 h-4 text-white" />}
                      </div>
                      <span className="text-sm font-bold text-white">Yes, I am sure and I approve the permanent deletion of my account.</span>
                    </label>
                  </div>

                  {message && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className={`mb-6 p-4 rounded-xl text-sm font-bold flex items-center gap-3 ${message.type === 'success' ? 'bg-[#00E57A]/10 text-[#00E57A] border border-[#00E57A]/20' : 'bg-[#FF5D73]/10 text-[#FF5D73] border border-[#FF5D73]/20'}`}>
                      {message.type === 'success' ? <CheckCircle2 className="w-5 h-5 shrink-0" /> : <XCircle className="w-5 h-5 shrink-0" />}
                      {message.text}
                    </motion.div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-4">
                    <button onClick={handleSafeExit} className="flex-1 py-4 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-sm transition-colors cursor-pointer border border-white/5">
                      Cancel, keep my account
                    </button>
                    
                    <button disabled={isDeleting || !isApproved || confirmText !== 'DELETE'} onClick={handleDeleteAccount} className="flex-1 py-4 rounded-xl bg-gradient-to-r from-[#FF5D73] to-[#E11D48] text-white font-black text-sm transition-all shadow-[0_0_20px_rgba(255,93,115,0.3)] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-2 hover:shadow-[0_0_30px_rgba(255,93,115,0.5)]">
                      {isDeleting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                      {isDeleting ? 'Deleting...' : 'Yes, Delete Account'}
                    </button>
                  </div>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </motion.div>
      </main>
    </div>
  );
}