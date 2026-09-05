'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Lock, Mail, Loader2, KeyRound, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  
  // --- View State ---
  const [view, setView] = useState<'login' | 'forgot' | 'reset'>('login');
  
  // --- Form States ---
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [forgotEmail, setForgotEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // --- UI States ---
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // --- Timer State ---
  const [resendTimer, setResendTimer] = useState(0);

  // Handle Resend Countdown
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (resendTimer > 0) {
      interval = setInterval(() => setResendTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [resendTimer]);

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Switch to Forgot Password View (with Auto-fill)
  const goToForgot = () => {
    setForgotEmail(email); // Autofill email if already typed
    setError(null);
    setSuccess(null);
    setView('forgot');
  };

  const goToLogin = () => {
    setError(null);
    setSuccess(null);
    setResendTimer(0);
    setView('login');
  };

  // ==========================================
  // LOGIN LOGIC (WITH ADMIN DATA SAVING)
  // ==========================================
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const res = await fetch('https://api.binnycash.com/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();

      if (res.ok && (data?.token || data?.data?.token)) {
        const token = data.token || data.data.token;
        localStorage.setItem('admin_token', token);

        const adminObj = data?.data?.admin || data?.admin || data?.data || data;
        const adminId = adminObj?.id ?? adminObj?.adminId ?? adminObj?._id ?? adminObj?.userId ?? null;

        if (adminId) {
          localStorage.setItem('admin_id', adminId);
        } else {
          console.warn("Could not find adminId in login response.");
        }

        // 🔥 ADDED: Save full admin details for the Settings Page
        if (adminObj) {
          localStorage.setItem('admin_data', JSON.stringify(adminObj));
        }

        router.push('/v9/dashboard');
      } else {
        setError(data?.message || 'Invalid admin credentials');
      }
    } catch (err) {
      setError('Something went wrong. Please check connection.');
    } finally {
      setIsLoading(false);
    }
  };

  // ==========================================
  // FORGOT PASSWORD LOGIC
  // ==========================================
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const fd = new URLSearchParams();
      fd.append('email', forgotEmail);

      const res = await fetch('https://api.binnycash.com/api/admin/forgotPassword', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: fd
      });
      const data = await res.json();

      if (res.ok && (data.code === 200 || data.type === 'success')) {
        setSuccess(data.message || 'OTP sent to your email address.');
        setView('reset');
        setResendTimer(300); // 5 minutes cooldown
      } else {
        setError(data.message || 'Failed to send OTP.');
      }
    } catch (err) {
      setError('Network Error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // ==========================================
  // RESEND OTP LOGIC
  // ==========================================
  const handleResendOtp = async () => {
    if (resendTimer > 0) return;
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const fd = new URLSearchParams();
      fd.append('email', forgotEmail);

      const res = await fetch('https://api.binnycash.com/api/admin/resendOtp', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: fd
      });
      const data = await res.json();

      if (res.ok && (data.code === 200 || data.type === 'success')) {
        setSuccess(data.message || 'OTP has been resent to your email.');
        setResendTimer(300); // Reset 5 mins timer
      } else {
        setError(data.message || 'Failed to resend OTP.');
      }
    } catch (err) {
      setError('Network Error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // ==========================================
  // RESET PASSWORD LOGIC
  // ==========================================
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const fd = new URLSearchParams();
      fd.append('email', forgotEmail);
      fd.append('otp', otp);
      fd.append('newPassword', newPassword);
      fd.append('confirm_password', confirmPassword);

      const res = await fetch('https://api.binnycash.com/api/admin/resetPassword', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: fd
      });
      const data = await res.json();

      if (res.ok && (data.code === 200 || data.type === 'success')) {
        // Successful reset, go back to login and auto-fill email
        setEmail(forgotEmail);
        setPassword('');
        setOtp('');
        setNewPassword('');
        setConfirmPassword('');
        setView('login');
        setSuccess(data.message || 'Password reset successfully. Please login.');
      } else {
        setError(data.message || 'Failed to reset password.');
      }
    } catch (err) {
      setError('Network Error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen w-full bg-[#0B0D14] text-white px-4 relative overflow-hidden font-sans">
      
      {/* Dark background blur effect */}
      <div className="absolute w-[500px] h-[500px] bg-[#7C3AED]/10 blur-[140px] rounded-full pointer-events-none" />

      <div className="w-full max-w-[420px] bg-[#12141C] border border-white/5 p-8 sm:p-10 rounded-[28px] shadow-2xl relative z-10 flex flex-col gap-6">
        
        {/* VIEW: LOGIN */}
        {view === 'login' && (
          <form onSubmit={handleLogin} className="flex flex-col gap-6">
            <div className="flex flex-col items-center text-center gap-2.5">
              <div className="w-14 h-14 rounded-2xl bg-[#7C3AED]/10 border border-[#7C3AED]/20 flex items-center justify-center text-[#7C3AED] shadow-sm">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h1 className="text-2xl font-black uppercase tracking-wider text-white">Admin Portal</h1>
              <p className="text-xs text-gray-400">Sign in to access system dashboard</p>
            </div>

            {success && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold p-3.5 rounded-xl text-center flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> {success}
              </div>
            )}
            
            {error && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold p-3.5 rounded-xl text-center animate-shake">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Admin Email</label>
              <div className="relative flex items-center">
                <Mail className="absolute left-4 w-4 h-4 text-gray-500" />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-[#0B0D14] border border-white/10 rounded-xl pl-11 pr-4 py-3.5 text-sm text-white focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] transition-all"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <div className="flex justify-between items-center">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Password</label>
                <button type="button" onClick={goToForgot} className="text-xs text-[#7C3AED] hover:text-[#A882FF] font-bold transition-colors cursor-pointer">
                  Forgot Password?
                </button>
              </div>
              <div className="relative flex items-center">
                <Lock className="absolute left-4 w-4 h-4 text-gray-500" />
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-[#0B0D14] border border-white/10 rounded-xl pl-11 pr-4 py-3.5 text-sm text-white focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] transition-all"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading}
              className="mt-2 w-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-black text-sm tracking-wide py-4 rounded-xl transition-all shadow-[0_4px_15px_rgba(124,58,237,0.3)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Login to Dashboard'}
            </button>
          </form>
        )}

        {/* VIEW: FORGOT PASSWORD */}
        {view === 'forgot' && (
          <form onSubmit={handleForgotPassword} className="flex flex-col gap-6">
            <button type="button" onClick={goToLogin} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all absolute top-6 left-6 cursor-pointer">
              <ArrowLeft className="w-4 h-4" />
            </button>

            <div className="flex flex-col items-center text-center gap-2.5 mt-2">
              <div className="w-14 h-14 rounded-2xl bg-[#7C3AED]/10 border border-[#7C3AED]/20 flex items-center justify-center text-[#7C3AED] shadow-sm">
                <KeyRound className="w-7 h-7" />
              </div>
              <h1 className="text-xl font-black uppercase tracking-wider text-white">Reset Password</h1>
              <p className="text-xs text-gray-400">Enter your email to receive an OTP</p>
            </div>

            {error && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold p-3.5 rounded-xl text-center animate-shake">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Admin Email</label>
              <div className="relative flex items-center">
                <Mail className="absolute left-4 w-4 h-4 text-gray-500" />
                <input 
                  type="email" 
                  required
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="w-full bg-[#0B0D14] border border-white/10 rounded-xl pl-11 pr-4 py-3.5 text-sm text-white focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] transition-all"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading || !forgotEmail}
              className="mt-2 w-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-black text-sm tracking-wide py-4 rounded-xl transition-all shadow-[0_4px_15px_rgba(124,58,237,0.3)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send OTP'}
            </button>
          </form>
        )}

        {/* VIEW: RESET PASSWORD */}
        {view === 'reset' && (
          <form onSubmit={handleResetPassword} className="flex flex-col gap-5">
            <button type="button" onClick={goToLogin} className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-gray-400 hover:text-white transition-all absolute top-6 left-6 cursor-pointer">
              <ArrowLeft className="w-4 h-4" />
            </button>

            <div className="flex flex-col items-center text-center gap-2.5 mt-2">
              <div className="w-14 h-14 rounded-2xl bg-[#7C3AED]/10 border border-[#7C3AED]/20 flex items-center justify-center text-[#7C3AED] shadow-sm">
                <KeyRound className="w-7 h-7" />
              </div>
              <h1 className="text-xl font-black uppercase tracking-wider text-white">Verify & Reset</h1>
              <p className="text-xs text-gray-400">Enter OTP sent to <span className="text-[#A882FF] font-bold">{forgotEmail}</span></p>
            </div>

            {success && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold p-3.5 rounded-xl text-center flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4" /> {success}
              </div>
            )}

            {error && (
              <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-bold p-3.5 rounded-xl text-center animate-shake">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-2 mt-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider flex justify-between">
                <span>OTP Code</span>
                <button 
                  type="button" 
                  onClick={handleResendOtp} 
                  disabled={resendTimer > 0 || isLoading}
                  className={`text-[#7C3AED] transition-colors ${resendTimer > 0 ? 'opacity-50 cursor-not-allowed' : 'hover:text-[#A882FF] cursor-pointer'}`}
                >
                  {resendTimer > 0 ? `Resend in ${formatTime(resendTimer)}` : 'Resend OTP'}
                </button>
              </label>
              <input 
                type="text" 
                required
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full bg-[#0B0D14] border border-white/10 rounded-xl px-4 py-3.5 text-sm text-center tracking-[0.3em] font-bold text-white focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] transition-all"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">New Password</label>
              <div className="relative flex items-center">
                <Lock className="absolute left-4 w-4 h-4 text-gray-500" />
                <input 
                  type="password" 
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full bg-[#0B0D14] border border-white/10 rounded-xl pl-11 pr-4 py-3.5 text-sm text-white focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] transition-all"
                />
              </div>
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Confirm Password</label>
              <div className="relative flex items-center">
                <Lock className="absolute left-4 w-4 h-4 text-gray-500" />
                <input 
                  type="password" 
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-[#0B0D14] border border-white/10 rounded-xl pl-11 pr-4 py-3.5 text-sm text-white focus:outline-none focus:border-[#7C3AED] focus:ring-1 focus:ring-[#7C3AED] transition-all"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={isLoading || !otp || !newPassword || !confirmPassword}
              className="mt-4 w-full bg-[#7C3AED] hover:bg-[#6D28D9] text-white font-black text-sm tracking-wide py-4 rounded-xl transition-all shadow-[0_4px_15px_rgba(124,58,237,0.3)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
            >
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Set New Password'}
            </button>
          </form>
        )}

      </div>
    </div>
  );
}