'use client';

import { useState, useEffect } from 'react';

export function useCurrency() {
  const [currency, setCurrency] = useState('Usd');

  useEffect(() => {
    // 1. Initial load pe localStorage se check karo
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('currency');
      if (stored) {
        setCurrency(stored);
      }
    }

    // 2. Navbar se aane wale global event ko suno
    const handleSwitch = (e: any) => {
      setCurrency(e.detail);
    };

    window.addEventListener('currencyChanged', handleSwitch);
    
    // Cleanup
    return () => window.removeEventListener('currencyChanged', handleSwitch);
  }, []);

  return currency;
}

// 🎁 BONUS: Ek helper function bhi wahi rakh le taaki price format karna asaan ho
export function formatPrice(usdAmount: number, currentCurrency: string) {
  if (currentCurrency === 'Coin' || currentCurrency === 'COIN') {
    // Maan le 1 USD = 1000 Coins (Apne backend rate ke hisaab se change kar lena)
    const coinValue = Math.round(usdAmount * 1000); 
    return `${coinValue} COINS`;
  } else {
    // Default USD format
    return `$ ${Number(usdAmount).toFixed(2)}`;
  }
}