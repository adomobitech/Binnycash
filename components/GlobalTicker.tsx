'use client';

import React, { useEffect, useState, useRef } from 'react';
import { usePathname } from 'next/navigation';
import LiveTicker from '@/components/dashboard/LiveTicker'; 

export default function GlobalTicker() {
  const pathname = usePathname();
  const [feeds, setFeeds] = useState<any[]>([]);
  // Use a ref to track if component is mounted to prevent state updates on unmounted component
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    
    // Home page par fetch nahi karna
    if (pathname === '/') return;

    const fetchLiveActivity = async () => {
      try {
        const token = localStorage.getItem('token');
        
        const res = await fetch(`https://apitest.binnycash.com/api/user/inbox/userActivity`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache, no-store',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          },
          cache: 'no-store'
        });
        
        const text = await res.text();
        if (!text || text.trim().startsWith('<')) return;

        const json = JSON.parse(text);
        
        if (!isMounted.current) return; // Prevent setting state if unmounted during fetch

        if (res.ok && json.code === 200 && Array.isArray(json.data) && json.data.length > 0) {
          setFeeds(json.data);
        } else if (res.ok && json.code === 404) {
          setFeeds([]);
        }
      } catch (error) {
        console.error("Live activity fetch error:", error);
      }
    };

    // Page load ya route change hone par ek baar turant fetch hoga
    fetchLiveActivity();

    // HAR 10 SECONDS MEIN AUTO-UPDATE HOGA 🔥
    const intervalId = setInterval(() => {
      fetchLiveActivity();
    }, 10000); // 10000 milliseconds = 10 seconds. Tu isko change kar sakta hai.

    // Cleanup function: jab component unmount hoga ya pathname change hoga toh interval clear kar denge
    return () => {
      isMounted.current = false;
      clearInterval(intervalId);
    };

  }, [pathname]);

  if (pathname === '/' || feeds.length === 0) return null;

  return <LiveTicker feeds={feeds} />;
}