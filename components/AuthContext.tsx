'use client';

import React, { createContext, useContext, useState } from 'react';
import AuthModal from './AuthModal';

interface AuthContextType {
  openLogin: () => void;
  openRegister: () => void;
  closeAuth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [view, setView] = useState<'login' | 'register'>('login');

  const openLogin = () => {
    setView('login');
    setIsOpen(true);
  };

  const openRegister = () => {
    setView('register');
    setIsOpen(true);
  };

  const closeAuth = () => {
    setIsOpen(false);
  };

  return (
    <AuthContext.Provider value={{ openLogin, openRegister, closeAuth }}>
      {children}
      {isOpen && <AuthModal initialView={view} onClose={closeAuth} />}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};