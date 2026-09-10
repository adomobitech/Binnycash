'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import AuthModal from './AuthModal'; 

interface AuthContextType {
  openLogin: () => void;
  openRegister: () => void;
  closeModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Run URL extraction immediately so dashboard components get the token on first render
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

// GLOBAL EXECUTION: Runs before React Hydration is complete
if (typeof window !== 'undefined') {
  captureGoogleAuthFromUrl();
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [initialView, setInitialView] = useState<'login' | 'register'>('login');
  
  // We keep this to true initially, but force it false instantly in useEffect
  const [isAppLoading, setIsAppLoading] = useState(true);
  
  // 🔥 ADDED ONLY FOR LAYOUT SHIFT 🔥
  const [isAuthUser, setIsAuthUser] = useState(false);
  
  const router = useRouter();
  const pathname = usePathname();

  const protectedRoutes = ['/dashboard', '/myoffers', '/affiliate', '/leaderboard', '/cashout', '/rewards', '/profile'];
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname === route || pathname?.startsWith(route + '/')
  );

  useEffect(() => {
    // FAIL-SAFE 1: Force UI to unblock after 100ms no matter what happens
    const fallbackTimer = setTimeout(() => setIsAppLoading(false), 100);

    const handleAuthCheck = async () => {
      const token = localStorage.getItem('token');
      
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
        setIsAuthUser(false); // Added for Layout Shift
        if (isProtectedRoute) {
           safeRedirect('/'); // Redirect unauthenticated users back to home
        }
        setIsAppLoading(false);
        clearTimeout(fallbackTimer);
        return;
      }

      setIsAuthUser(true); // Added for Layout Shift

      // THE MAGIC FIX: Instantly release the loading spinner!
      // Do NOT wait for the API response. Let the UI load immediately with local data.
      setIsAppLoading(false);
      clearTimeout(fallbackTimer);

      // --- SILENT BACKGROUND FETCH ---
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 sec timeout

        const res = await fetch('https://api.binnycash.com/api/user/userDetails', {
          method: 'GET',
          headers: { 'Authorization': `Bearer ${token}` },
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (res.ok) {
          let data: any = null;
          try {
            const text = await res.text();
            if (text && !text.trim().startsWith('<')) {
               data = JSON.parse(text);
            }
          } catch (e) {}
          
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
          // If strictly unauthorized, silently logout
          if (res.status === 401 || res.status === 404) {
            localStorage.removeItem('token');
            localStorage.removeItem('userId');
            localStorage.removeItem('userDetails');
            setIsAuthUser(false); // Added for Layout Shift
            if (isProtectedRoute) safeRedirect('/'); 
          }
        }
      } catch (err) {
        // Backend is down or timed out. Do nothing. UI is already running perfectly.
        console.warn("Background auth check failed (Backend down). UI continues safely.");
      }
    };

    handleAuthCheck();

    // 🔥 Added to keep Layout Shift synced across tabs
    const syncAuth = () => {
      const token = localStorage.getItem('token');
      setIsAuthUser(!!(token && token !== 'undefined' && !token.includes('[object Object]')));
    };
    window.addEventListener('storage', syncAuth);
    window.addEventListener('profileUpdated', syncAuth);

    return () => {
      clearTimeout(fallbackTimer);
      window.removeEventListener('storage', syncAuth);
      window.removeEventListener('profileUpdated', syncAuth);
    };
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

  // Only show the full-screen spinner if strictly required
  if (isAppLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#0B0E14]">
        <div className="w-12 h-12 border-4 border-[#8B5CF6]/20 border-t-[#8B5CF6] rounded-full animate-spin"></div>
      </div>
    );
  }

  // 🔥 PAGE SHIFTER LOGIC 🔥
  const isAdminPath = pathname?.startsWith('/v9') || pathname?.startsWith('/admin');
  const isHome = pathname === '/';
  const requiresSidebarMargin = isAuthUser && !isHome && !isAdminPath;

  return (
    <AuthContext.Provider value={{ openLogin, openRegister, closeModal }}>
      {/* DIRECT RENDER OF THE ACTUAL APP COMPONENTS INSIDE SHIFTER */}
      <div className={`transition-all duration-300 min-h-screen ${requiresSidebarMargin ? 'lg:ml-[260px] lg:w-[calc(100%-260px)] pb-[80px] lg:pb-0' : 'w-full'}`}>
        {children}
      </div>
      
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