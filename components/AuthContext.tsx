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

  useEffect(() => {
    const handleAuthCheck = async () => {
      const token = localStorage.getItem('token');
      
      const protectedRoutes = ['/dashboard', '/myoffers', '/affiliate', '/leaderboard', '/cashout', '/rewards', '/profile'];
      const isProtectedRoute = protectedRoutes.some(route => pathname?.startsWith(route));

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
           router.replace('/'); 
        }
        setIsAppLoading(false);
        return;
      }

      try {
        const res = await fetch('https://apitest.binnycash.com/api/user/userDetails', {
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
          }
        } else {
          // If strictly unauthorized, remove tokens
          if (res.status === 401 || res.status === 404) {
            localStorage.removeItem('token');
            localStorage.removeItem('userId');
            localStorage.removeItem('userDetails');
            if (isProtectedRoute) router.replace('/');
          }
        }
      } catch (err) {
        console.error("Session verification failed", err);
      } finally {
        setIsAppLoading(false);
      }
    };

    handleAuthCheck();
  }, [pathname]);

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
      {children}
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