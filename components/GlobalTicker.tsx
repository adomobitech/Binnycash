"use client";

import React, { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { io } from "socket.io-client";
import LiveTicker from "@/components/dashboard/LiveTicker";

// ============================================
// SOCKET
// ============================================
const socket = io("https://apitest.binnycash.com", {
  transports: ["polling"],
  reconnection: true,
  reconnectionAttempts: 10,
  reconnectionDelay: 1000,
  timeout: 10000,
});
let globalFeedsCache: any[] = [];
let isActivityFetchedGlobal = false;

export default function GlobalTicker() {
  const pathname = usePathname();
  const [feeds, setFeeds] = useState<any[]>(globalFeedsCache);

  // ============================================
  // INITIAL API FETCH
  // ============================================
  useEffect(() => {
    if (pathname === "/" || isActivityFetchedGlobal) return;

    const fetchLiveActivity = async () => {
      isActivityFetchedGlobal = true;

      try {
        const token = localStorage.getItem("token");

        const res = await fetch(
          "https://apitest.binnycash.com/api/user/inbox/userActivity",
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              ...(token
                ? {
                    Authorization: `Bearer ${token}`,
                  }
                : {}),
            },
            cache: "no-store",
          }
        );

        if (!res.ok) {
          console.error("❌ Activity API Error:", res.status);
          isActivityFetchedGlobal = false;
          return;
        }

        const text = await res.text();

        if (!text || text.trim().startsWith("<")) {
          console.error("❌ Invalid API response");
          isActivityFetchedGlobal = false;
          return;
        }

        const json = JSON.parse(text);

        if (
          json.code === 200 &&
          Array.isArray(json.data)
        ) {
          const reversedData = [...json.data].reverse();

          globalFeedsCache = reversedData;
          setFeeds(reversedData);
        }
      } catch (error) {
        console.error("❌ Activity Fetch Error:", error);
        isActivityFetchedGlobal = false;
      }
    };

    fetchLiveActivity();
  }, [pathname]);

  // ============================================
  // SOCKET
  // ============================================
  useEffect(() => {
    console.log("🔌 Starting Socket...");

    const handleConnect = () => {
      console.log("✅ SOCKET CONNECTED");
      console.log("🆔 Socket ID:", socket.id);

      if (socket.io?.engine) {
        console.log(
          "🚀 Transport:",
          socket.io.engine.transport.name
        );
      }
    };

    const handleConnectError = (error: Error) => {
      console.error(
        "❌ SOCKET CONNECT ERROR:",
        error.message
      );
      console.error("Full socket error:", error);
    };

    const handleDisconnect = (reason: string) => {
      console.warn(
        "🔴 SOCKET DISCONNECTED:",
        reason
      );
    };

    const handleNewInbox = (newMessage: any) => {
      console.log(
        "🔥 NEW SOCKET DATA:",
        newMessage
      );

      if (!newMessage) return;

      const newFeed = {
        _id:
          newMessage._id ||
          newMessage.id ||
          `${Date.now()}-${Math.random()}`,

        userName:
          newMessage.userName ||
          newMessage.username ||
          "",

        image:
          newMessage.image ||
          newMessage.profilePic ||
          "",

        amount:
          newMessage.amount ??
          newMessage.reward ??
          0,

        status:
          newMessage.status ||
          "Completed",
      };

      console.log(
        "📦 Formatted Socket Feed:",
        newFeed
      );

      // Global cache
      globalFeedsCache = [
        newFeed,
        ...globalFeedsCache,
      ];

      // React state
      setFeeds((prev) => {
        const exists = prev.some(
          (item) => item._id === newFeed._id
        );

        if (exists) {
          console.log(
            "⚠️ Duplicate socket item ignored"
          );
          return prev;
        }

        return [
          newFeed,
          ...prev,
        ];
      });
    };

    // Socket listeners
    socket.on(
      "connect",
      handleConnect
    );

    socket.on(
      "connect_error",
      handleConnectError
    );

    socket.on(
      "disconnect",
      handleDisconnect
    );

    socket.on(
      "new-inbox",
      handleNewInbox
    );

    socket.on(
      "userActivity",
      handleNewInbox
    );

    // Connect
    if (!socket.connected) {
      socket.connect();
    }

    return () => {
      socket.off(
        "connect",
        handleConnect
      );

      socket.off(
        "connect_error",
        handleConnectError
      );

      socket.off(
        "disconnect",
        handleDisconnect
      );

      socket.off(
        "new-inbox",
        handleNewInbox
      );

      socket.off(
        "userActivity",
        handleNewInbox
      );
    };
  }, []);

  // ============================================
  // RENDER
  // ============================================
  if (
    pathname === "/" ||
    feeds.length === 0
  ) {
    return null;
  }

  return (
    <LiveTicker feeds={feeds} />
  );
}