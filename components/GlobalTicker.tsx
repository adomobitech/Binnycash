"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { io, Socket } from "socket.io-client";
import LiveTicker from "@/components/dashboard/LiveTicker";

let socket: Socket | null = null;
let globalFeedsCache: any[] = [];
let isActivityFetchedGlobal = false;

export default function GlobalTicker() {
  const pathname = usePathname();
  const [feeds, setFeeds] = useState<any[]>(globalFeedsCache);

  useEffect(() => {
    if (pathname === "/" || isActivityFetchedGlobal) return;

    const fetchLiveActivity = async () => {
      isActivityFetchedGlobal = true;

      try {
        const token = localStorage.getItem("token");
        const res = await fetch("https://apitest.binnycash.com/api/user/inbox/userActivity", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          cache: "no-store",
        });

        if (!res.ok) return;

        const text = await res.text();
        if (!text || text.trim().startsWith("<")) return;

        const json = JSON.parse(text);

        if (json.code === 200 && Array.isArray(json.data)) {
          const reversedData = [...json.data].reverse();
          globalFeedsCache = reversedData;
          setFeeds(reversedData);
        }
      } catch (error) {
        console.error("Activity Fetch Error:", error);
      }
    };

    fetchLiveActivity();
  }, [pathname]);

  useEffect(() => {
    if (pathname === "/") {
       if(socket) {
           socket.disconnect();
           socket = null;
       }
       return;
    }

    if (!socket) {
      socket = io("https://apitest.binnycash.com", {
        transports: ["polling"],
        autoConnect: true,
        reconnection: true,
        reconnectionDelay: 5000, 
      });

      socket.on("new-inbox", handleNewInbox);
      socket.on("userActivity", handleNewInbox);
    }

    function handleNewInbox(newMessage: any) {
      if (!newMessage) return;

      const newFeed = {
        _id: newMessage._id || newMessage.id || `${Date.now()}-${Math.random()}`,
        userName: newMessage.userName || newMessage.username || "",
        image: newMessage.image || newMessage.profilePic || "",
        amount: newMessage.amount ?? newMessage.reward ?? 0,
        status: newMessage.status || "Completed",
      };

      globalFeedsCache = [newFeed, ...globalFeedsCache];

      setFeeds((prev) => {
        if (prev.some((item) => item._id === newFeed._id)) return prev;
        return [newFeed, ...prev];
      });
    }

    return () => {
       if(socket) {
           socket.off("new-inbox", handleNewInbox);
           socket.off("userActivity", handleNewInbox);
       }
    };
  }, [pathname]);

  if (pathname === "/" || feeds.length === 0) {
    return null;
  }

  return <LiveTicker feeds={feeds} />;
}