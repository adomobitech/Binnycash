'use client';

import { useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function LoginCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Agar backend token URL mein bhej raha hai (e.g. ?token=abc), toh usko nikal lo
    const token = searchParams.get('token');
    
    if (token) {
      localStorage.setItem('token', token);
      // Event dispatch kar do taaki navbar update ho jaye
      window.dispatchEvent(new Event('storage'));
      window.dispatchEvent(new CustomEvent('profileUpdated'));
    }

    // 1 second ka chota sa delay dekar user ko dashboard pe bhej do
    const timer = setTimeout(() => {
      router.push('/'); // Ya '/dashboard' jahan bhi tu redirect karna chahta hai
    }, 1000);

    return () => clearTimeout(timer);
  }, [router, searchParams]);

  return (
    <div className="min-h-screen bg-[#0B0D19] flex flex-col items-center justify-center text-white">
      <div className="w-20 h-20 mb-6 rounded-full border border-[#00E57A]/30 bg-[#1A1C23] flex items-center justify-center shadow-[0_0_30px_rgba(0,229,122,0.2)]">
        <img src="/logo.png" alt="BinnyCash Logo" className="w-10 h-10 object-contain animate-bounce" />
      </div>
      <h2 className="text-2xl font-black mb-2 animate-pulse">Login Successful!</h2>
      <p className="text-[#8F95A3] flex items-center gap-2">
        <Loader2 className="w-4 h-4 animate-spin text-[#00E57A]" />
        Redirecting to your dashboard...
      </p>
    </div>
  );
}