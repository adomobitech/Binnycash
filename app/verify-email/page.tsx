'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, Loader2, ShieldCheck, AlertTriangle, Rocket } from 'lucide-react';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');

  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Verifying your secure link...');

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
        
        if (res.ok || data.code === 200 || data.code === 409 || data.type === 'success') {
          
          // 🔥 AUTO LOGIN LOGIC START 🔥
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
          if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('profileUpdated'));
          }
          // 🔥 AUTO LOGIN LOGIC END 🔥

          setStatus('success');
          setMessage('Identity verified! Taking you to your dashboard...');

          // Redirect to Dashboard after 1.5 seconds
          setTimeout(() => {
            window.location.href = '/dashboard';
          }, 1500);

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
    <motion.div 
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="relative z-10 w-full max-w-[420px] p-8 md:p-10 bg-[#0B0D14]/80 backdrop-blur-xl border border-white/10 rounded-[32px] shadow-[0_30px_80px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col items-center text-center"
    >
      {/* Top subtle glow line on card */}
      <div className={`absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r ${
        status === 'loading' ? 'from-transparent via-[#8B5CF6] to-transparent' : 
        status === 'success' ? 'from-transparent via-[#00E57A] to-transparent' : 
        'from-transparent via-rose-500 to-transparent'
      }`} />

      {/* Dynamic Icon based on Status */}
      <div className="mb-6 relative">
        {status === 'loading' && (
          <div className="relative w-24 h-24 flex items-center justify-center">
            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2, ease: "linear" }} className="absolute inset-0 rounded-full border-2 border-dashed border-[#8B5CF6]/50" />
            <div className="w-16 h-16 bg-[#8B5CF6]/10 border border-[#8B5CF6]/30 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(139,92,246,0.3)]">
              <Loader2 className="w-8 h-8 text-[#A855F7] animate-spin" />
            </div>
          </div>
        )}
        
        {/* SUCCESS STATE WITH ROCKET ANIMATION */}
        {status === 'success' && (
          <div className="relative w-24 h-24 flex items-center justify-center">
            <motion.div animate={{ rotate: 360 }} transition={{ duration: 2, repeat: Infinity, ease: "linear" }} className="absolute -inset-2 rounded-full border border-dashed border-[#00E57A]/50" />
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", bounce: 0.5 }} className="absolute inset-0 bg-[#00E57A]/10 rounded-full blur-xl" />
            <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2, type: "spring" }} className="w-20 h-20 bg-gradient-to-br from-[#00E57A]/20 to-[#00E57A]/5 border border-[#00E57A]/30 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(0,229,122,0.4)] relative z-10">
              <Rocket className="w-10 h-10 text-[#00E57A]" strokeWidth={2.5} />
            </motion.div>
          </div>
        )}

        {status === 'error' && (
          <div className="relative w-24 h-24 flex items-center justify-center">
            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", bounce: 0.5 }} className="absolute inset-0 bg-rose-500/10 rounded-full blur-xl" />
            <motion.div initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.2, type: "spring" }} className="w-20 h-20 bg-gradient-to-br from-rose-500/20 to-rose-500/5 border border-rose-500/30 rounded-full flex items-center justify-center shadow-[0_0_40px_rgba(244,63,94,0.4)] relative z-10">
              <AlertTriangle className="w-10 h-10 text-rose-500" strokeWidth={2.5} />
            </motion.div>
          </div>
        )}
      </div>

      <motion.h1 
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="text-2xl font-black text-white tracking-tight mb-2"
      >
        {status === 'loading' ? 'Verifying Identity' : status === 'success' ? 'Logging You In...' : 'Link Expired'}
      </motion.h1>
      
      <motion.p 
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        className={`text-[13px] font-medium leading-relaxed mb-4 ${status === 'error' ? 'text-rose-400' : 'text-[#8F95A3]'}`}
      >
        {message}
      </motion.p>

      {/* Action Messages / Buttons */}
      <AnimatePresence>
        {status === 'error' && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="w-full mt-4">
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

export default function VerifyEmailPage() {
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
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-br from-[#8B5CF6]/10 to-[#3B82F6]/5 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-[#00E57A]/5 blur-[100px] rounded-full pointer-events-none" />

      {/* Next.js requires useSearchParams to be wrapped in Suspense */}
      <Suspense fallback={
        <div className="flex flex-col items-center justify-center z-10">
          <Loader2 className="w-12 h-12 text-[#8B5CF6] animate-spin mb-4" />
          <p className="text-[#8F95A3] font-bold tracking-widest uppercase text-xs">Authenticating...</p>
        </div>
      }>
        <VerifyEmailContent />
      </Suspense>
    </main>
  );
}