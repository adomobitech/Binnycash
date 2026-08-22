'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import GlobalTicker from './GlobalTicker';

export default function ConditionalTicker() {
  const pathname = usePathname();
  
  // 👉 In sab legal pages par Global Ticker HIDE ho jayega
  const hiddenRoutes = ['/terms', '/privacy', '/cookie-policy', '/affiliate-policy' , '/delete-account'];
  
  if (hiddenRoutes.includes(pathname || '')) {
    return null; // Ticker gayab!
  }

  return (
    // 404 page par hide karne ke liye isme ek ID di hai
    <div id="global-ticker-wrapper">
      <GlobalTicker />
    </div>
  );
}