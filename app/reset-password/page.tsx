'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, Loader2, ShieldCheck, AlertTriangle, Lock, Eye, EyeOff, KeyRound } from 'lucide-react';

type StepState = 'verifying_token' | 'token_error' | 'enter_password' | 'resetting' | 'success';

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [step, setStep] = useState<StepState>('verifying_token');
  const [message, setMessage] = useState('Verifying your secure link...');
  
  // Form States
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [formError, setFormError] = useState('');

  // 1. VERIFY TOKEN ON PAGE LOAD
  useEffect(() => {
    if (!token) {
      setStep('token_error');
      setMessage('Invalid or missing password reset token.');
      return;
    }

    const verifyToken = async () => {
      try {
        const fd = new URLSearchParams();
        fd.append('token', token);

        const res = await fetch('https://api.binnycash.com/api/user/verifyforgetPasswordOtp', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: fd
        });

        const data = await res.json();
        
        if (res.ok || data.code === 200 || data.type === 'success') {
          setStep('enter_password');
          setMessage('Create a new secure password for your account.');
        } else {
          setStep('token_error');
          setMessage(data.message || 'Reset link is invalid or has expired.');
        }
      } catch (err) {
        setStep('token_error');
        setMessage('Network error. Please try again.');
      }
    };

    verifyToken();
  }, [token]);

  // 2. SUBMIT NEW PASSWORD
  const handleResetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (newPassword.length < 8) {
      setFormError('Password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setFormError('Passwords do not match.');
      return;
    }

    setStep('resetting');

    try {
      const fd = new URLSearchParams();
      fd.append('token', token!);
      fd.append('newPassword', newPassword);

      const res = await fetch('https://api.binnycash.com/api/user/resetPassword', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: fd
      });

      const data = await res.json();

      if (res.ok || data.code === 200 || data.type === 'success') {
        setStep('success');
        setMessage('Your password has been reset successfully!');
      } else {
        setStep('enter_password');
        setFormError(data.message || 'Failed to reset password. Please try again.');
      }
    } catch (err) {
      setStep('enter_password');
      setFormError('Network error. Please try again.');
    }
  };

  const inputClass = "w-full bg-[#15192C] border border-white/5 text-white font-medium rounded-[16px] pl-12 pr-11 py-4 outline-none focus:border-[#8B5CF6]/60 focus:bg-[#1A1E35] transition-all placeholder:text-[#4B5263] shadow-inner";
  const iconClass = "absolute left-4 w-5 h-5 text-[#4B5263] group-focus-within:text-[#8B5CF6] transition-colors pointer-events-none";

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="relative z-10 w-full max-w-[420px] p-8 md:p-10 bg-[#0B0D14]/80 backdrop-blur-xl border border-white/10 rounded-[32px] shadow-[0_30px_80px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col items-center text-center"
    >
      {/* Top subtle glow line on card */}
      <div className={`absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r ${
        (step === 'verifying_token' || step === 'resetting') ? 'from-transparent via-[#8B5CF6] to-transparent' : 
        step === 'success' ? 'from-transparent via-[#00E57A] to-transparent' : 
        step === 'enter_password' ? 'from-transparent via-[#5EA8FF] to-transparent' :
        'from-transparent via-rose-500 to-transparent'
      }`} />

      {/* Dynamic Icon based on Status */}
      <div className="mb-6 relative">
        {(step === 'verifying_token' || step === 'resetting') && (
          <div className="relative w-24 h-24 flex items-center justify-center">
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }} className="absolute inset-0 rounded-full border-2 border-dashed border-[#8B5CF6]/50" />
            <div className="w-16 h-16 bg-[#8B5CF6]/10 border border-[#8B5CF6]/30 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(139,92,246,0.3)]">
              <Loader2 className="w-8 h-8 text-[#A855F7] animate-spin" />
            </div>
          </div>
        )}
        {step === 'enter_password' && (
          <div className="relative w-24 h-24 flex items-center justify-center">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", bounce: 0.5 }} className="absolute inset-0 bg-[#5EA8FF]/10 rounded-full blur-xl" />
            <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.1, type: "spring" }} className="w-20 h-20 bg-gradient-to-br from-[#5EA8FF]/20 to-[#5EA8FF]/5 border border-[#5EA8FF]/30 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(94,168,255,0.4)] relative z-10">
              <KeyRound className="w-9 h-9 text-[#5EA8FF]" strokeWidth={2} />
            </motion.div>
          </div>
        )}
        {step === 'success' && (
          <div className="relative w-24 h-24 flex items-center justify-center">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", bounce: 0.5 }} className="absolute inset-0 bg-[#00E57A]/10 rounded-full blur-xl" />
            <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2, type: "spring" }} className="w-20 h-20 bg-gradient-to-br from-[#00E57A]/20 to-[#00E57A]/5 border border-[#00E57A]/30 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(0,229,122,0.4)] relative z-10">
              <CheckCircle2 className="w-10 h-10 text-[#00E57A]" strokeWidth={2.5} />
            </motion.div>
          </div>
        )}
        {step === 'token_error' && (
          <div className="relative w-24 h-24 flex items-center justify-center">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", bounce: 0.5 }} className="absolute inset-0 bg-rose-500/10 rounded-full blur-xl" />
            <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2, type: "spring" }} className="w-20 h-20 bg-gradient-to-br from-rose-500/20 to-rose-500/5 border border-rose-500/30 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(244,63,94,0.4)] relative z-10">
              <AlertTriangle className="w-10 h-10 text-rose-500" strokeWidth={2.5} />
            </motion.div>
          </div>
        )}
      </div>

      <motion.h1 
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
        className="text-2xl font-black text-white tracking-tight mb-2"
      >
        {step === 'verifying_token' ? 'Verifying Link' : 
         step === 'enter_password' ? 'Create New Password' : 
         step === 'resetting' ? 'Updating Password' : 
         step === 'success' ? 'Password Reset!' : 'Link Expired'}
      </motion.h1>
      
      <motion.p 
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className={`text-[13px] font-medium leading-relaxed mb-6 ${step === 'token_error' ? 'text-rose-400' : 'text-[#8F95A3]'}`}
      >
        {message}
      </motion.p>

      {/* ============================================================== */}
      {/* ENTER NEW PASSWORD FORM */}
      {/* ============================================================== */}
      <AnimatePresence mode="wait">
        {step === 'enter_password' && (
          <motion.form 
            key="password-form"
            initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            onSubmit={handleResetSubmit} 
            className="w-full flex flex-col gap-4"
          >
            {formError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold flex items-center justify-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0"/> {formError}
              </div>
            )}

            <div className="relative group flex items-center">
              <Lock className={iconClass} />
              <input 
                type={showPassword ? "text" : "password"} 
                required minLength={8}
                placeholder="New Password" 
                value={newPassword} 
                onChange={(e) => setNewPassword(e.target.value)} 
                className={inputClass} 
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)} 
                className="absolute right-4 text-[#4B5263] hover:text-white transition-colors outline-none cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>

            <div className="relative group flex items-center">
              <Lock className={iconClass} />
              <input 
                type={showPassword ? "text" : "password"} 
                required minLength={8}
                placeholder="Confirm New Password" 
                value={confirmPassword} 
                onChange={(e) => setConfirmPassword(e.target.value)} 
                className={inputClass} 
              />
            </div>

            <button 
              type="submit"
              className="mt-2 w-full py-4 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#5EA8FF] text-white font-black text-[13px] uppercase tracking-widest cursor-pointer shadow-[0_4px_25px_rgba(139,92,246,0.3)] hover:shadow-[0_6px_30px_rgba(139,92,246,0.5)] hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
            >
              Update Password
            </button>
          </motion.form>
        )}

        {/* ============================================================== */}
        {/* SUCCESS / ERROR STATES */}
        {/* ============================================================== */}
        {step === 'success' && (
          <motion.div key="success-msg" initial={{ opacity: 0, scale: 0.9, y: 10 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="w-full relative group">
            <div className="bg-[#12141C] border border-[#00E57A]/30 rounded-2xl p-5 w-full flex items-start gap-4 shadow-inner relative z-10">
              <div className="w-10 h-10 rounded-full bg-[#00E57A]/10 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5 text-[#00E57A]" />
              </div>
              <div className="text-left">
                <p className="text-[15px] font-black text-white mb-0.5">Account Secured</p>
                <p className="text-[11px] text-[#8F95A3] leading-relaxed">
                  You can securely <strong className="text-white">close this tab</strong> and log in to the main website with your new password.
                </p>
              </div>
            </div>
            
            <button 
              onClick={() => router.push('/')}
              className="mt-6 w-full py-4 rounded-xl bg-white text-black font-black text-[13px] uppercase tracking-widest cursor-pointer hover:bg-gray-200 transition-colors"
            >
              Go to Login Page
            </button>
          </motion.div>
        )}

        {step === 'token_error' && (
          <motion.div key="error-msg" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="w-full">
            <button 
              onClick={() => router.push('/')}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 text-white font-black text-[13px] uppercase tracking-widest cursor-pointer shadow-[0_4px_25px_rgba(244,63,94,0.4)] hover:shadow-[0_6px_35px_rgba(244,63,94,0.6)] hover:-translate-y-0.5 transition-all"
            >
              Return to Home
            </button>
          </motion.div>
        )}
      </AnimatePresence>

    </motion.div>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="fixed inset-0 w-full min-h-screen flex items-center justify-center bg-[#05070A] font-sans overflow-hidden z-[2147483647]">
      
      {/* 🔥 EXACT IDs FROM YOUR LAYOUT TO HIDE NAVBAR & TICKER + Chat Widget 🔥 */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
            #global-ticker-wrapper {
              display: none !important;
            }

            #main-navbar-wrapper {
              display: none !important;
            }

            /* Hiding chat widget forcefully */
            #crisp-chatbox, iframe[name*="chat"], iframe[src*="chat"] {
              display: none !important;
            }
          `,
        }}
      />

      {/* Premium Cyber Background */}
      <div 
        className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(255,255,255,.7) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,.7) 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-[#8B5CF6]/10 to-[#5EA8FF]/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-[#00E57A]/5 blur-[100px] rounded-full pointer-events-none" />

      {/* Next.js requires useSearchParams to be wrapped in Suspense */}
      <Suspense fallback={
        <div className="flex flex-col items-center justify-center z-10">
          <Loader2 className="w-12 h-12 text-[#8B5CF6] animate-spin mb-4" />
          <p className="text-[#8F95A3] font-bold tracking-widest uppercase text-xs">Loading Secure Environment...</p>
        </div>
      }>
        <ResetPasswordContent />
      </Suspense>
    </main>
  );
}