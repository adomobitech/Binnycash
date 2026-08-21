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

  // =========================
  // FETCH INITIAL ACTIVITY
  // =========================
  useEffect(() => {
    if (pathname === "/" || isActivityFetchedGlobal) return;

    const fetchLiveActivity = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch(
          "https://apitest.binnycash.com/api/user/inbox/userActivity",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            cache: "no-store",
          }
        );

        if (!res.ok) {
          console.error("Activity API Error:", res.status);
          return;
        }

        const text = await res.text();

        if (!text || text.trim().startsWith("<")) {
          console.error("Invalid API response");
          return;
        }

        const json = JSON.parse(text);

        if (json.code === 200 && Array.isArray(json.data)) {
          const reversedData = [...json.data].reverse();

          globalFeedsCache = reversedData;

          setFeeds(reversedData);

          isActivityFetchedGlobal = true;
        }
      } catch (error) {
        console.error("Activity Fetch Error:", error);
      }
    };

    fetchLiveActivity();
  }, [pathname]);

  // =========================
  // SOCKET CONNECTION
  // =========================
  useEffect(() => {
    if (pathname === "/") {
      if (socket) {
        socket.disconnect();
        socket = null;
      }

      return;
    }

    // Already connected
    if (socket?.connected) {
      return;
    }

    socket = io("https://apitest.binnycash.com", {
      transports: ["websocket", "polling"],
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 5000,
    });

    const handleNewInbox = (newMessage: any) => {
      if (!newMessage) return;

      const newFeed = {
        _id:
          newMessage._id ||
          newMessage.id ||
          `${Date.now()}-${Math.random()}`,

        userName:
          newMessage.userName ||
          newMessage.username ||
          newMessage.name ||
          "",

        image:
          newMessage.image ||
          newMessage.profilePic ||
          newMessage.profileImage ||
          "",

        amount: newMessage.amount ?? newMessage.reward ?? 0,

        status: newMessage.status || "Completed",
      };

      // Prevent duplicate
      setFeeds((prev) => {
        if (prev.some((item) => item._id === newFeed._id)) {
          return prev;
        }

        const updatedFeeds = [newFeed, ...prev];

        globalFeedsCache = updatedFeeds;

        return updatedFeeds;
      });
    };

    socket.on("connect", () => {
      console.log("Socket connected:", socket?.id);
    });

    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error.message);
    });

    socket.on("disconnect", (reason) => {
      console.log("Socket disconnected:", reason);
    });

    // Backend events
    socket.on("new-inbox", handleNewInbox);
    socket.on("userActivity", handleNewInbox);

    // Cleanup
    return () => {
      if (socket) {
        socket.off("new-inbox", handleNewInbox);
        socket.off("userActivity", handleNewInbox);

        socket.disconnect();
        socket = null;
      }
    };
  }, [pathname]);

  // =========================
  // DON'T SHOW ON HOME
  // =========================
  if (pathname === "/" || feeds.length === 0) {
    return null;
  }

  return <LiveTicker feeds={feeds} />;
}