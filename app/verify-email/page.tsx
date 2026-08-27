'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Loader2, ShieldCheck } from 'lucide-react';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your magical link...');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setMessage('Invalid or missing verification token.');
      return;
    }

    const verifyToken = async () => {
      try {
        const fd = new URLSearchParams();
        fd.append('token', token);

        const res = await fetch('https://api.binnycash.com/api/user/verifyOtp', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: fd
        });

        const data = await res.json();
        
        // 200 ya 409 (Already Verified) dono ko success manenge
        if (res.ok || data.code === 200 || data.code === 409 || data.type === 'success') {
          setStatus('success');
          setMessage(data.message || 'Your email has been successfully verified!');
        } else {
          setStatus('error');
          setMessage(data.message || 'Verification link is invalid or has expired.');
        }
      } catch (err) {
        setStatus('error');
        setMessage('Network error. Please try again.');
      }
    };

    verifyToken();
  }, [token]);

  return (
    <div className="flex flex-col items-center text-center relative z-10 w-full max-w-md p-8 bg-[#0B0E14] border border-[#1A1D24] rounded-[24px] shadow-[0_20px_60px_rgba(0,0,0,0.9)]">
      
      {/* Dynamic Icon based on Status */}
      <div className="mb-6 relative">
        {status === 'loading' && (
          <div className="w-20 h-20 bg-[#8B5CF6]/10 border border-[#8B5CF6]/30 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(139,92,246,0.2)]">
            <Loader2 className="w-8 h-8 text-[#A855F7] animate-spin" />
          </div>
        )}
        {status === 'success' && (
          <div className="w-20 h-20 bg-[#00E57A]/10 border border-[#00E57A]/30 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(0,229,122,0.2)]">
            <CheckCircle2 className="w-10 h-10 text-[#00E57A]" />
          </div>
        )}
        {status === 'error' && (
          <div className="w-20 h-20 bg-rose-500/10 border border-rose-500/30 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(244,63,94,0.2)]">
            <XCircle className="w-10 h-10 text-rose-500" />
          </div>
        )}
      </div>

      <h1 className="text-2xl font-black text-white tracking-tight mb-3">
        {status === 'loading' ? 'Verifying Email' : status === 'success' ? 'Verification Complete!' : 'Verification Failed'}
      </h1>
      
      <p className={`text-sm mb-8 ${status === 'error' ? 'text-rose-400' : 'text-[#8F95A3]'}`}>
        {message}
      </p>

      {/* Action Messages / Buttons */}
      {status === 'success' && (
        <div className="bg-[#1A1D24]/50 border border-white/5 rounded-xl p-5 w-full">
          <ShieldCheck className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
          <p className="text-sm font-bold text-white mb-1">You're all set!</p>
          <p className="text-xs text-[#8F95A3]">
            You can securely <strong className="text-white">close this tab</strong> and return to your original screen.
          </p>
        </div>
      )}

      {status === 'error' && (
        <button 
          onClick={() => router.push('/')}
          className="w-full py-4 rounded-xl bg-gradient-to-r from-rose-500 to-rose-600 text-white font-black text-sm uppercase tracking-widest cursor-pointer shadow-[0_4px_20px_rgba(244,63,94,0.3)] hover:opacity-90 transition-opacity"
        >
          Return to Home
        </button>
      )}

    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#05070A] font-sans overflow-hidden relative">
      {/* Background Elements */}
      <div className="absolute inset-0" style={{ backgroundImage: 'linear-gradient(to right, rgba(255,255,255,0.02) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.02) 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[#8B5CF6]/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Next.js requires useSearchParams to be wrapped in Suspense */}
      <Suspense fallback={
        <div className="flex flex-col items-center justify-center z-10">
          <Loader2 className="w-10 h-10 text-[#8B5CF6] animate-spin mb-4" />
          <p className="text-white font-bold tracking-widest uppercase text-sm">Loading...</p>
        </div>
      }>
        <VerifyEmailContent />
      </Suspense>
    </div>
  );
}