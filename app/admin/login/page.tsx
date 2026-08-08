'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Lock, Mail, Loader2 } from 'lucide-react';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('https://apitest.binnycash.com/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();

      if (res.ok && (data?.token || data?.data?.token)) {
        const token = data.token || data.data.token;
        localStorage.setItem('admin_token', token);
        router.push('/admin/dashboard');
      } else {
        setError(data?.message || 'Invalid admin credentials');
      }
    } catch (err) {
      setError('Something went wrong. Please check connection.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen w-full bg-[#F4F5F7] text-black px-4 relative overflow-hidden">
      
      {/* Light background blur effect */}
      <div className="absolute w-[500px] h-[500px] bg-[#8B5CF6]/5 blur-[140px] rounded-full pointer-events-none" />

      <form onSubmit={handleLogin} className="w-full max-w-[420px] bg-white border border-gray-200 p-8 sm:p-10 rounded-[28px] shadow-xl relative z-10 flex flex-col gap-6">
        <div className="flex flex-col items-center text-center gap-2.5">
          <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-200 flex items-center justify-center text-black shadow-sm">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-black uppercase tracking-wider text-black">Admin Portal</h1>
          <p className="text-xs text-gray-500">Sign in to access system dashboard</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-xs font-bold p-3.5 rounded-xl text-center animate-shake">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Admin Email</label>
          <div className="relative flex items-center">
            <Mail className="absolute left-4 w-4 h-4 text-gray-400" />
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white border border-gray-300 rounded-xl pl-11 pr-4 py-3.5 text-sm text-black focus:outline-none focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6] transition-all"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Password</label>
          <div className="relative flex items-center">
            <Lock className="absolute left-4 w-4 h-4 text-gray-400" />
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white border border-gray-300 rounded-xl pl-11 pr-4 py-3.5 text-sm text-black focus:outline-none focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6] transition-all"
            />
          </div>
        </div>

        <button 
          type="submit" 
          disabled={isLoading}
          className="mt-2 w-full bg-[#8B5CF6] hover:bg-[#7c3aed] text-white font-black text-sm tracking-wide py-4 rounded-xl transition-all shadow-[0_4px_15px_rgba(139,92,246,0.3)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
        >
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Login to Dashboard'}
        </button>
      </form>
    </div>
  );
}