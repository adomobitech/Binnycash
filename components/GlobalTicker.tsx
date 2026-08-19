'use client';

import React, { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { io } from "socket.io-client";
import LiveTicker from '@/components/dashboard/LiveTicker'; 

// --- GLOBAL LOCKS & CACHE (Survives page navigations) ---
const socket = io("https://apitest.binnycash.com", { transports: ["websocket"] });
let globalFeedsCache: any[] = [];
let isActivityFetchedGlobal = false;

export default function GlobalTicker() {
  const pathname = usePathname();
  const [feeds, setFeeds] = useState<any[]>(globalFeedsCache);

  // 1. INITIAL API FETCH (Strictly locked to 1 call per session)
  useEffect(() => {
    if (pathname === '/' || isActivityFetchedGlobal) return;

    const fetchLiveActivity = async () => {
      isActivityFetchedGlobal = true; // Lock strictly before fetch
      
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
           isActivityFetchedGlobal = false; // Unlock if failed so it can retry later
           return;
        }

        const text = await res.text();
        if (!text || text.trim().startsWith('<')) return;

        const json = JSON.parse(text);

        if (json.code === 200 && Array.isArray(json.data) && json.data.length > 0) {
          globalFeedsCache = json.data;
          setFeeds(globalFeedsCache);
        }
      } catch (error) {
        console.error("Live activity fetch error:", error);
        isActivityFetchedGlobal = false;
      }
    };

    fetchLiveActivity();
  }, [pathname]);

  // 2. SOCKET CONNECTION (Listens silently)
  useEffect(() => {
    const handleNewInbox = (newMessage: any) => {
      const newFeed = {
        _id: newMessage._id || Date.now().toString(),
        userName: newMessage.userName || newMessage.username,
        image: newMessage.image || newMessage.profilePic,
        amount: newMessage.amount || newMessage.reward,
        status: newMessage.status || 'Completed',
      };

      // Add to global cache and local state
      globalFeedsCache = [newFeed, ...globalFeedsCache];
      
      setFeeds((prev) => {
        const exists = prev.find(f => f._id === newFeed._id);
        if (exists) return prev;
        return [newFeed, ...prev];
      });
    };

    socket.on("new-inbox", handleNewInbox);

    return () => {
      socket.off("new-inbox", handleNewInbox);
    };
  }, []);

  if (pathname === '/' || feeds.length === 0) return null;

  return <LiveTicker feeds={feeds} />;
}