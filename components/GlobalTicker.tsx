'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import LiveTicker from '@/components/dashboard/LiveTicker'; // Apna LiveTicker component import kar

// 👇 TUNE JO JSON DATA DIYA THA WO YAHAN HAI (Fallback ke liye) 👇
const FALLBACK_DATA = [
  { "userName": "kihaviy298_6289", "image": "", "status": "Signup", "amount": 0.1 },
  { "userName": "shubham_3899", "image": "/uploads/postback-logo/1786427037995-yrakeo.png", "status": "complete", "amount": 7 },
  { "userName": "shubham_3899", "image": "/uploads/postback-logo/1786427037995-yrakeo.png", "status": "complete", "amount": 3 },
  { "userName": "shubham_3899", "image": "", "status": "cashout", "amount": 9.5 },
  { "userName": "swati7311", "image": "/uploads/postback-logo/1786427037995-yrakeo.png", "status": "complete", "amount": 2 },
  { "userName": "shubham_3899", "image": "/uploads/postback-logo/1786427037995-yrakeo.png", "status": "complete", "amount": 3 },
  { "userName": "shubham_3899", "image": "/uploads/postback-logo/1786427037995-yrakeo.png", "status": "complete", "amount": 3 },
  { "userName": "shubham_3899", "image": "/uploads/profile-images/1786804159042-5ae61h.png", "status": "cashout", "amount": 4.75 },
  { "userName": "swati7311", "image": "/uploads/postback-logo/1786427037995-yrakeo.png", "status": "complete", "amount": 2 },
  { "userName": "shubham_3899", "image": "/uploads/postback-logo/1786427037995-yrakeo.png", "status": "complete", "amount": 3 },
  { "userName": "shubham_3899", "image": "/uploads/postback-logo/1786427037995-yrakeo.png", "status": "complete", "amount": 3 },
  { "userName": "Yogesh1664", "image": "https://lh3.googleusercontent.com/a/ACg8ocK32V_pVeWy2Y4tAYa5ViUm_zquQfaDLAjeyKsrRsurtbUo8g=s96-c", "status": "Signup", "amount": 0.1 }
];

export default function GlobalTicker() {
  const pathname = usePathname();
  const [feeds, setFeeds] = useState<any[]>([]);

  useEffect(() => {
    // 1. Agar user Home page ('/') par hai, toh Ticker mat dikhao
    if (pathname === '/') return;

    const fetchLiveActivity = async () => {
      try {
        const token = localStorage.getItem('token');
        
        const res = await fetch('https://apitest.binnycash.com/api/user/inbox/userActivity', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            // Token bhej raha hu, iske na hone par bhi HTML error aa sakta hai
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          },
          cache: 'no-store'
        });
        
        const text = await res.text();
        
        // Agar API error (HTML) deti hai toh tera diya hua JSON data use karenge
        if (!text || text.trim().startsWith('<')) {
          console.warn("API URL galat hai ya Token missing hai. Using Fallback Data...");
          setFeeds(FALLBACK_DATA); 
          return;
        }

        const json = JSON.parse(text);
        
        // Tere diye gaye JSON structure ke hisaab se
        if (json && json.code === 200 && Array.isArray(json.data)) {
          setFeeds(json.data);
        } else {
          setFeeds(FALLBACK_DATA);
        }
      } catch (error) {
        console.error("Live activity fetch error:", error);
        setFeeds(FALLBACK_DATA); // Network error me bhi tera data dikhega
      }
    };

    fetchLiveActivity();

  }, [pathname]);

  // Homepage par Ticker ko puri tarah hide rakho
  if (pathname === '/') return null;

  // Agar kutch data nahi hai toh blank space mat dikhao
  if (feeds.length === 0) return null;

  // Render Ticker
  return <LiveTicker feeds={feeds} />;
}