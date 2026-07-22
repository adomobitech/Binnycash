'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import AuthModal from './AuthModal'; 

interface AuthContextType {
  openLogin: () => void;
  openRegister: () => void;
  closeModal: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [initialView, setInitialView] = useState<'login' | 'register'>('login');

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