'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import AuthModal from './AuthModal'; 
import { Settings, AlertTriangle } from 'lucide-react'; // 🔥 Added Technical Issue Icons

interface AuthContextType {
  openLogin: () => void;
  openRegister: () => void;
  closeModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 🔥 FIX: Run URL extraction immediately so dashboard components get the token on first render
function captureGoogleAuthFromUrl() {
  if (typeof window === 'undefined') return false;

  const params = new URLSearchParams(window.location.search);

  const token = params.get('token') || params.get('accessToken') || params.get('access_token');
  const rawUserDetails = params.get('userDetails') || params.get('user');
  const directId = params.get('id') || params.get('userId') || params.get('sid');

  if (!token && !rawUserDetails && !directId) return false; 

  if (token) {
    localStorage.setItem('token', token);
  }

  let userDetails: any = null;
  if (rawUserDetails) {
    try {
      userDetails = JSON.parse(decodeURIComponent(rawUserDetails));
    } catch {
      userDetails = null;
    }
  }

  let extractedId = directId;

  if (userDetails) {
    localStorage.setItem('userDetails', JSON.stringify(userDetails));
    extractedId = userDetails.id || userDetails._id || userDetails.userId || directId;
  } else if (directId) {
    localStorage.setItem('userDetails', JSON.stringify({ id: directId }));
  }

  if (extractedId) {
    localStorage.setItem('userId', String(extractedId));
  }

  // Cleanup URL
  params.delete('token');
  params.delete('accessToken');
  params.delete('access_token');
  params.delete('userDetails');
  params.delete('user');
  params.delete('id');
  params.delete('userId');
  params.delete('sid');
  const cleanQuery = params.toString();
  const cleanUrl = window.location.pathname + (cleanQuery ? `?${cleanQuery}` : '') + window.location.hash;
  window.history.replaceState({}, '', cleanUrl);
  
  // WAKE UP ENTIRE APP IMMEDIATELY
  setTimeout(() => {
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new CustomEvent('profileUpdated'));
  }, 50);

  return true;
}

// 🔥 GLOBAL EXECUTION: Runs before React Hydration is complete 🔥
if (typeof window !== 'undefined') {
  captureGoogleAuthFromUrl();
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [initialView, setInitialView] = useState<'login' | 'register'>('login');
  const [isAppLoading, setIsAppLoading] = useState(true);
  
  const router = useRouter();
  const pathname = usePathname();

  // We determine protected routes outside useEffect so we can use it to render the Fake Screen
  const protectedRoutes = ['/dashboard', '/myoffers', '/affiliate', '/leaderboard', '/cashout', '/rewards', '/profile'];
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname === route || pathname?.startsWith(route + '/')
  );

  useEffect(() => {
    const handleAuthCheck = async () => {
      const token = localStorage.getItem('token');
      
      // 🔥 SAFE REDIRECT HELPER: Fixes "Router action dispatched before initialization" error 🔥
      const safeRedirect = (path: string) => {
        setTimeout(() => {
          router.replace(path);
        }, 0);
      };

      // AUTO-OPEN SIGNUP IF REF PARAM IS PRESENT
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        if (params.get('ref') && (!token || token === 'undefined')) {
           setInitialView('register');
           setIsOpen(true);
        }
      }

      if (!token || token === 'undefined' || token.includes('[object Object]')) {
        if (isProtectedRoute) {
           safeRedirect('/'); // Redirect unauthenticated users back to home
        }
        setIsAppLoading(false);
        return;
      }

      try {
        const res = await fetch('https://api.binnycash.com/api/user/userDetails', {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}` }
        });

        if (res.ok) {
          let data: any = null;
          try {
            const text = await res.text();
            if (text && !text.trim().startsWith('<')) {
               data = JSON.parse(text);
            }
          } catch (e) {
            console.warn("AuthContext Parse Error Safely Handled");
          }
          
          const user = data?.data?.user || data?.data || data?.userDetails || data;
          
          if (user) {
            const backendCurrency = user.currency || user.currencyValue || 'Usd';
            const resolvedCurrency = (backendCurrency.toString().toLowerCase() === 'coin') ? 'Coin' : 'Usd';
            
            localStorage.setItem('currency', resolvedCurrency);
            window.dispatchEvent(new CustomEvent('currencyChanged', { detail: resolvedCurrency }));

            try {
              const existingRaw = localStorage.getItem('userDetails');
              const existing = existingRaw ? JSON.parse(existingRaw) : {};
              const mergedUser = { ...existing, ...user };
              localStorage.setItem('userDetails', JSON.stringify(mergedUser));

              const mergedId = mergedUser.id || mergedUser._id || mergedUser.userId;
              if (mergedId) {
                localStorage.setItem('userId', String(mergedId));
              }
            } catch {
              localStorage.setItem('userDetails', JSON.stringify(user));
            }

            window.dispatchEvent(new Event('storage'));
            window.dispatchEvent(new CustomEvent('profileUpdated'));
          }
        } else {
          // If strictly unauthorized, remove tokens
          if (res.status === 401 || res.status === 404) {
            localStorage.removeItem('token');
            localStorage.removeItem('userId');
            localStorage.removeItem('userDetails');
            if (isProtectedRoute) safeRedirect('/'); 
          }
        }
      } catch (err) {
        console.error("Session verification failed", err);
      } finally {
        setIsAppLoading(false);
      }
    };

    handleAuthCheck();
  }, [pathname, router, isProtectedRoute]);

  const openLogin = () => {
    setInitialView('login');
    setIsOpen(true);
  };

  const openRegister = () => {
    setInitialView('register');
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
  };

  if (isAppLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#0B0E14]">
        <div className="w-12 h-12 border-4 border-[#8B5CF6]/20 border-t-[#8B5CF6] rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={{ openLogin, openRegister, closeModal }}>
      {/* 🔥 FAKE TECHNICAL ISSUE SCREEN INJECTION FOR PROTECTED ROUTES 🔥 */}
      {isProtectedRoute ? (
        <div className="flex h-screen w-full flex-col items-center justify-center bg-[#05070A] text-white p-6 text-center font-sans relative overflow-hidden">
          {/* Ambient Background Effect */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-[#FF5D73]/10 blur-[100px] rounded-full pointer-events-none" />
          
          <div className="relative z-10 flex flex-col items-center">
            {/* Animated Settings/Warning Icon */}
            <div className="w-24 h-24 bg-[#12141D] border border-[#FF5D73]/30 rounded-[24px] flex items-center justify-center mb-8 shadow-[0_0_40px_rgba(255,93,115,0.2)] relative">
              <Settings className="w-12 h-12 text-[#FF5D73] animate-spin" style={{ animationDuration: '4s' }} />
              <div className="absolute -bottom-2 -right-2 bg-[#12141D] p-1.5 rounded-xl border border-[#FF5D73]/30">
                 <AlertTriangle className="w-5 h-5 text-amber-400" />
              </div>
            </div>
            
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-4">
              System Maintenance
            </h1>
            
            <p className="text-[#8F95A3] text-sm sm:text-base max-w-md leading-relaxed mb-8">
              We are currently experiencing a technical issue on our side. Our engineering team is actively working to resolve it. Please wait for some time and check back later.
            </p>
            
            {/* Minimal Loading Bar */}
            <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden">
              <div className="h-full bg-[#FF5D73] rounded-full animate-pulse" style={{ width: '60%' }}></div>
            </div>
          </div>
        </div>
      ) : (
        children
      )}
      
      <AuthModal 
        isOpen={isOpen} 
        onClose={closeModal} 
        initialView={initialView} 
      />
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}