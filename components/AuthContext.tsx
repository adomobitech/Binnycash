'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import AuthModal from './AuthModal'; 

interface AuthContextType {
  openLogin: () => void;
  openRegister: () => void;
  closeModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 🔥 FIX: Google login backend (/auth/google) par process hone ke baad wapas isi site par
// redirect karta hai — kisi query param me token/userDetails ke saath. AuthModal ke andar yeh
// data kabhi capture nahi hota tha kyunki Google button seedha backend URL pe le jaata hai
// aur wapas aane par koi bhi component URL ko check nahi karta tha.
// Yahan AuthContext hamesha mount rehta hai (har page par), isliye yahi sahi jagah hai
// URL check karne ke liye — page load hote hi ek baar dekh lega.
//
// NOTE: Backend "Google ke baad" exact kis param naam se data bhejta hai (token=..&id=.. ya
// kuch aur), yeh confirm nahi hai — isliye common possible naam try kiye hain. Agar save
// abhi bhi na ho, ek baar Google se login karke jo final URL address bar me aaye woh dekh
// ke batana, taaki param names exact kar sakein.
function captureGoogleAuthFromUrl() {
  if (typeof window === 'undefined') return;

  const params = new URLSearchParams(window.location.search);

  // Possible token param names
  const token = params.get('token') || params.get('accessToken') || params.get('access_token');

  // Possible full-user-object param (agar backend poora userDetails JSON bhi bhejta hai, encoded)
  const rawUserDetails = params.get('userDetails') || params.get('user');

  // Possible direct numeric id param names
  const directId = params.get('id') || params.get('userId') || params.get('sid');

  if (!token && !rawUserDetails && !directId) return; // Google redirect nahi tha, kuch nahi karna

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

  if (userDetails) {
    localStorage.setItem('userDetails', JSON.stringify(userDetails));
  } else if (directId) {
    // Poora object nahi mila, kam se kam numeric id hi save kar do taaki sid kaam kare
    localStorage.setItem('userDetails', JSON.stringify({ id: directId }));
  }

  // URL se sensitive params hata do taaki token address bar/history me na reh jaaye
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
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [initialView, setInitialView] = useState<'login' | 'register'>('login');

  useEffect(() => {
    captureGoogleAuthFromUrl();
  }, []);

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