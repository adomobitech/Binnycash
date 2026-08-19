'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { io } from "socket.io-client";
import LiveTicker from '@/components/dashboard/LiveTicker'; 

// 👇 YAHAN HAIN WO GLOBAL VARIABLES JO MISSING THE 👇
const socket = io("https://apitest.binnycash.com", { 
  transports: ["polling", "websocket"], // 400 Bad Request fix karne ke liye
  withCredentials: true
});
let globalFeedsCache: any[] = [];
let isActivityFetchedGlobal = false;
// 👆 INKO FUNCTION KE BAHAR HI RAKHNA HAI 👆

export default function GlobalTicker() {
  const pathname = usePathname();
  const [feeds, setFeeds] = useState<any[]>(globalFeedsCache);

  // 1. INITIAL API FETCH 
  useEffect(() => {
    if (pathname === '/' || isActivityFetchedGlobal) return;

    const fetchLiveActivity = async () => {
      isActivityFetchedGlobal = true; 
      
      try {
        const token = localStorage.getItem('token');
        const res = await fetch(`https://apitest.binnycash.com/api/user/inbox/userActivity`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          },
          cache: 'no-store'
        });
        
        if (!res.ok) {
           isActivityFetchedGlobal = false; 
           return;
        }

        const text = await res.text();
        if (!text || text.trim().startsWith('<')) return;

        const json = JSON.parse(text);

        if (json.code === 200 && Array.isArray(json.data) && json.data.length > 0) {
          // API ka data reverse kar diya taaki NEWEST hamesha LEFT (Start) me aaye
          const reversedData = json.data.reverse();
          globalFeedsCache = reversedData;
          setFeeds(globalFeedsCache);
        }
      } catch (error) {
        console.error("Live activity fetch error:", error);
        isActivityFetchedGlobal = false;
      }
    };

    fetchLiveActivity();
  }, [pathname]);

  // 2. SOCKET CONNECTION (Listens for real-time updates)
  useEffect(() => {
    if (!socket.connected) {
      socket.connect();
    }

    const handleNewInbox = (newMessage: any) => {
      console.log("🔥 Naya Socket Data Aaya:", newMessage); 

      const newFeed = {
        _id: newMessage._id || (Date.now() + Math.random()).toString(), 
        userName: newMessage.userName || newMessage.username,
        image: newMessage.image || newMessage.profilePic,
        amount: newMessage.amount || newMessage.reward,
        status: newMessage.status || 'Completed',
      };

      // Naya feed hamesha array ke START me jayega (Left side)
      globalFeedsCache = [newFeed, ...globalFeedsCache];
      
      setFeeds((prev) => {
        const exists = prev.find(f => f._id === newFeed._id);
        if (exists) return prev;
        return [newFeed, ...prev]; 
      });
    };

    socket.on("new-inbox", handleNewInbox);
    socket.on("userActivity", handleNewInbox);

    return () => {
      socket.off("new-inbox", handleNewInbox);
      socket.off("userActivity", handleNewInbox);
    };
  }, []);

  if (pathname === '/' || feeds.length === 0) return null;

  return <LiveTicker feeds={feeds} />;
}