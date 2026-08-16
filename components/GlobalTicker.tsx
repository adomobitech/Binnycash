'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import LiveTicker from '@/components/dashboard/LiveTicker'; 

export default function GlobalTicker() {
  const pathname = usePathname();
  const [feeds, setFeeds] = useState<any[]>([]);

  useEffect(() => {
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
        
        if (res.ok && json.code === 200 && Array.isArray(json.data) && json.data.length > 0) {
          setFeeds(json.data);
        } else if (res.ok && json.code === 404) {
          setFeeds([]);
        }
      } catch (error) {
        console.error("Live activity fetch error:", error);
      }
    };

    // Page load ya route change hone par ek baar fetch hoga (No spam, no errors)
    fetchLiveActivity();

  }, [pathname]);

  if (pathname === '/' || feeds.length === 0) return null;

  return <LiveTicker feeds={feeds} />;
}