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

  // 🔥 Naya logic: Check if path is Home OR starts with /v9 (Admin Panel)
  const shouldHide = pathname === "/" || pathname?.startsWith("/v9");

  const [feeds, setFeeds] = useState<any[]>(globalFeedsCache);

  // =========================
  // FETCH INITIAL ACTIVITY
  // =========================
  useEffect(() => {
    // Agar hide karna hai ya data pehle se aa chuka hai, toh return kar do
    if (shouldHide || isActivityFetchedGlobal) return;

    const fetchLiveActivity = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch(
          "https://api.binnycash.com/api/user/inbox/userActivity",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            cache: "no-store",
          }
        );

        // 🔥 FIX: Handle 404 silently (No Activity Found) 🔥
        if (res.status === 404) {
          return; // Chup-chaap return ho jao, koi error print nahi karna
        }

        if (!res.ok) {
          return;
        }

        const text = await res.text();

        if (!text || text.trim().startsWith("<")) {
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
        // Network failures ko ignore karo taaki console ganda na ho
      }
    };

    fetchLiveActivity();
  }, [shouldHide]);

  // =========================
  // SOCKET CONNECTION
  // =========================
  useEffect(() => {
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

    // Agar admin panel ya home par hai, toh socket disconnect kar do
    if (shouldHide) {
      if (socket) {
        socket.off("new-inbox", handleNewInbox);
        socket.off("userActivity", handleNewInbox);
        socket.disconnect();
        socket = null;
      }
      return;
    }

    // 🔥 FIX: agar socket already exist karta hai (connected YA connecting),
    // toh naya socket mat banao — warna purana socket beech mein hi
    // disconnect ho jaata hai aur "closed before connection established" warning aati hai
    if (!socket) {
      socket = io("https://api.binnycash.com", {
        transports: ["websocket", "polling"],
        autoConnect: true,
        reconnection: true,
        reconnectionAttempts: Infinity,
        reconnectionDelay: 2000,
      });

      socket.on("connect", () => {
        console.log("Socket connected:", socket?.id);
      });

      socket.on("connect_error", (error) => {
        console.error("Socket connection error:", error.message);
      });

      socket.on("disconnect", (reason) => {
        console.log("Socket disconnected:", reason);
      });
    }

    // 🔥 FIX: purane listeners hata ke fresh laga do (StrictMode / re-render
    // ki wajah se duplicate listeners na lagein, ye ab safe hai kyunki
    // socket khud recreate nahi ho raha)
    socket.off("new-inbox", handleNewInbox);
    socket.off("userActivity", handleNewInbox);
    socket.on("new-inbox", handleNewInbox);
    socket.on("userActivity", handleNewInbox);

    // Cleanup: sirf is component ke listeners hatao,
    // socket ko disconnect/null MAT karo — wo shouldHide === true
    // hone par upar hi handle ho raha hai. Isse route change / dev
    // StrictMode remount par socket connection stable rehta hai
    // aur beech ke live events miss nahi hote.
    return () => {
      socket?.off("new-inbox", handleNewInbox);
      socket?.off("userActivity", handleNewInbox);
    };
  }, [shouldHide]);

  // =========================
  // DON'T SHOW ON HOME OR ADMIN PANEL
  // =========================
  if (shouldHide || feeds.length === 0) {
    return null;
  }

  return <LiveTicker feeds={feeds} />;
}