'use client';

import { useState } from 'react';

interface AuthModalProps {
  onClose: () => void;
  initialView?: 'login' | 'register';
}

export default function AuthModal({ onClose, initialView = 'login' }: AuthModalProps) {
  const [view, setView] = useState<'login' | 'register'>(initialView);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log(`${view} submitted:`, { name, email, password });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-[#08080C]/80 backdrop-blur-md font-sans">
      <div className="w-full max-w-md bg-[#12121A] border border-white/10 rounded-[32px] p-8 sm:p-10 shadow-[0_0_50px_rgba(0,0,0,0.8)] relative animate-in zoom-in-95 duration-200">
        
        <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-full h-[150px] blur-[80px] rounded-full pointer-events-none z-0 transition-colors duration-500 ${view === 'login' ? 'bg-[#00E57A]/10' : 'bg-[#8B5CF6]/15'}`}></div>

        <button onClick={onClose} className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center rounded-full bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-all z-20">✕</button>

        <div className="relative z-10">
          <div className="flex flex-col items-center text-center mb-8">
            <div className={`w-12 h-12 rounded-full border-2 flex items-center justify-center bg-black/40 mb-4 transition-colors duration-300 ${view === 'login' ? 'border-[#00E57A]' : 'border-[#8B5CF6]'}`}>
              <span className={`font-black text-xl font-mono ${view === 'login' ? 'text-[#00E57A]' : 'text-[#8B5CF6]'}`}>B</span>
            </div>
            <h2 className="text-2xl font-black text-white mb-2">
              {view === 'login' ? 'Welcome Back' : 'Create an Account'}
            </h2>
            <p className="text-[#8F95A3] text-sm">
              {view === 'login' ? 'Log in to continue your earning journey.' : 'Join thousands of players earning daily.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {view === 'register' && (
              <div className="animate-in slide-in-from-top-2 duration-300">
                <label className="text-xs font-bold text-[#8F95A3] uppercase tracking-wider mb-2 block">Full Name</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Rohit Munjal" required className={`w-full bg-[#08080C] border border-white/10 text-white rounded-xl px-4 py-3.5 focus:outline-none focus:ring-1 transition-all placeholder:text-gray-600 focus:border-[#8B5CF6] focus:ring-[#8B5CF6]`} />
              </div>
            )}
            <div>
              <label className="text-xs font-bold text-[#8F95A3] uppercase tracking-wider mb-2 block">Email Address</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" required className={`w-full bg-[#08080C] border border-white/10 text-white rounded-xl px-4 py-3.5 focus:outline-none focus:ring-1 transition-all placeholder:text-gray-600 ${view === 'login' ? 'focus:border-[#00E57A] focus:ring-[#00E57A]' : 'focus:border-[#8B5CF6] focus:ring-[#8B5CF6]'}`} />
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-xs font-bold text-[#8F95A3] uppercase tracking-wider block">Password</label>
                {view === 'login' && <span className="text-xs font-semibold text-[#00E57A] hover:text-[#00c968] transition-colors cursor-pointer">Forgot?</span>}
              </div>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" required className={`w-full bg-[#08080C] border border-white/10 text-white rounded-xl px-4 py-3.5 focus:outline-none focus:ring-1 transition-all placeholder:text-gray-600 ${view === 'login' ? 'focus:border-[#00E57A] focus:ring-[#00E57A]' : 'focus:border-[#8B5CF6] focus:ring-[#8B5CF6]'}`} />
            </div>
            <button type="submit" className={`w-full mt-2 font-black text-sm uppercase tracking-wide py-4 rounded-xl transition-all ${view === 'login' ? 'bg-[#00E57A] hover:bg-[#00c968] text-[#08080C] shadow-[0_0_20px_rgba(0,229,122,0.2)]' : 'bg-[#8B5CF6] hover:bg-[#7c3aed] text-white shadow-[0_0_20px_rgba(139,92,246,0.3)]'}`}>
              {view === 'login' ? 'Log In' : 'Create Account'}
            </button>
          </form>

          <div className="flex items-center gap-4 my-6">
            <div className="h-[1px] flex-1 bg-white/10"></div>
            <span className="text-xs font-semibold text-[#8F95A3] uppercase tracking-wider">Or</span>
            <div className="h-[1px] flex-1 bg-white/10"></div>
          </div>

          <button className="w-full flex items-center justify-center gap-3 bg-white/5 hover:bg-white/10 border border-white/5 text-white font-semibold py-3.5 rounded-xl transition-all">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <p className="text-center text-[#8F95A3] text-sm mt-6">
            {view === 'login' ? "Don't have an account? " : "Already have an account? "}
            <button onClick={() => setView(view === 'login' ? 'register' : 'login')} className={`font-bold hover:underline transition-colors ${view === 'login' ? 'text-[#00E57A]' : 'text-[#8B5CF6]'}`}>
              {view === 'login' ? 'Sign up' : 'Log in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}