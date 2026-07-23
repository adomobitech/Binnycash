'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { Rocket, Trophy, Wallet, Users, BarChart3, Gift, HelpCircle, MessageSquare, Bell } from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Sirf Inbox ke States (Chat wale hata diye kyunki chat ab naye page pe hai)
  const [isInboxOpen, setIsInboxOpen] = useState(false);
  const [inboxMessages, setInboxMessages] = useState<any[]>([]);
  const [isInboxLoading, setIsInboxLoading] = useState(false);
  
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem('token'));
    
    // Click outside to close Inbox dropdown
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        setIsInboxOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // API Call: Inbox
  const fetchInboxMessages = async () => {
    setIsInboxLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('https://apitest.binnycash.com/api/user/inbox/inbox', {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setInboxMessages(Array.isArray(data) ? data : (data.data || data.inbox || []));
    } catch (err) {} finally { setIsInboxLoading(false); }
  };

  useEffect(() => { if (isInboxOpen) fetchInboxMessages(); }, [isInboxOpen]);

  // Nav Items Setup
  const mainLinks = [
    { name: 'Earn', href: '/dashboard', icon: Rocket },
    { name: 'My Offers', href: '/myoffers', icon: Trophy },
    { name: 'Cashout', href: '/cashout', icon: Wallet },
  ];

  const secondaryLinks = [
    { name: 'Affiliate', href: '/referrals', icon: Users },
    { name: 'Leaderboard', href: '/leaderboard', icon: BarChart3 },
    { name: 'Rewards', href: '/rewards', icon: Gift },
    { name: 'Support & FAQ', href: '/support', icon: HelpCircle },
  ];

  if (!isLoggedIn) return null;

  return (
    <div ref={sidebarRef} className="w-[260px] hidden lg:flex flex-col h-[calc(100vh-80px)] bg-[#111319] border-r border-white/5 sticky top-[80px] p-4 overflow-y-auto custom-scrollbar relative">
      
      {/* Wallet Balance Display */}
      <div className="bg-[#1A1C24] border border-[#8B5CF6]/30 rounded-xl p-4 flex flex-col mb-6 shadow-[0_0_15px_rgba(139,92,246,0.1)]">
        <span className="text-[#8F95A3] text-xs font-bold uppercase tracking-wider mb-1">Your Balance</span>
        <div className="flex items-center gap-1">
          <span className="text-[#8B5CF6] text-lg font-black">$</span>
          <span className="text-white text-2xl font-black">0.10</span>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="flex flex-col gap-1.5 mb-6">
        <span className="text-[10px] text-[#8F95A3] font-bold uppercase tracking-widest px-4 mb-2">Main Menu</span>
        {mainLinks.map((item) => {
          const isActive = pathname === item.href || (item.name === 'Earn' && pathname === '/');
          const Icon = item.icon;
          return (
            <Link key={item.name} href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive ? 'bg-[#8B5CF6] text-white shadow-[0_4px_20px_rgba(139,92,246,0.3)]' : 'text-[#8F95A3] hover:text-white hover:bg-white/5'}`}>
              <Icon className="w-5 h-5" />
              <span className="text-sm font-bold tracking-wide">{item.name}</span>
            </Link>
          );
        })}
      </div>

      {/* Communications (Chat & Inbox) */}
      <div className="flex flex-col gap-1.5 mb-6 relative">
        <span className="text-[10px] text-[#8F95A3] font-bold uppercase tracking-widest px-4 mb-2">Community</span>
        
        {/* Inbox Dropdown Button */}
        <button onClick={() => setIsInboxOpen(!isInboxOpen)}
          className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 w-full text-left ${isInboxOpen ? 'bg-[#1A1C24] text-white border border-white/10' : 'text-[#8F95A3] hover:text-white hover:bg-white/5'}`}>
          <div className="flex items-center gap-3">
            <Bell className="w-5 h-5" />
            <span className="text-sm font-bold tracking-wide">Inbox</span>
          </div>
          {inboxMessages.length > 0 && (
            <span className="bg-red-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">{inboxMessages.length}</span>
          )}
        </button>

        {/* 🔥 LIVE CHAT: AB SEEDHA LINK HAI 🔥 */}
        <Link href="/chat" onClick={() => setIsInboxOpen(false)}
          className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 w-full text-left ${pathname === '/support-chat' ? 'bg-[#8B5CF6] text-white shadow-[0_4px_20px_rgba(139,92,246,0.3)]' : 'text-[#8F95A3] hover:text-white hover:bg-white/5'}`}>
          <div className="flex items-center gap-3">
            <MessageSquare className="w-5 h-5" />
            <span className="text-sm font-bold tracking-wide">Live Chat</span>
          </div>
          <span className="w-2 h-2 bg-[#00E57A] rounded-full shadow-[0_0_10px_rgba(0,229,122,0.8)] animate-pulse"></span>
        </Link>
      </div>

      {/* Secondary Navigation */}
      <div className="flex flex-col gap-1.5 mb-6">
        <span className="text-[10px] text-[#8F95A3] font-bold uppercase tracking-widest px-4 mb-2">Extras</span>
        {secondaryLinks.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link key={item.name} href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${isActive ? 'bg-[#8B5CF6] text-white shadow-[0_4px_20px_rgba(139,92,246,0.3)]' : 'text-[#8F95A3] hover:text-white hover:bg-white/5'}`}>
              <Icon className="w-5 h-5" />
              <span className="text-sm font-bold tracking-wide">{item.name}</span>
            </Link>
          );
        })}
      </div>

      {/* 🔥 FLOATING INBOX DROPDOWN 🔥 */}
      {isInboxOpen && (
        <div className="absolute left-[270px] top-[240px] w-[320px] bg-[#111319]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.8)] z-50 animate-in fade-in slide-in-from-left-4 duration-300 overflow-hidden">
          <div className="px-5 py-4 border-b border-white/10 bg-[#1A1C24]/80 flex justify-between items-center">
            <h3 className="text-white text-[15px] font-black tracking-wide">Notifications</h3>
            <span className="bg-[#8B5CF6]/20 text-[#8B5CF6] text-[10px] font-bold px-2 py-1 rounded-md tracking-widest uppercase">{inboxMessages.length} New</span>
          </div>
          <div className="max-h-[340px] overflow-y-auto bg-[#0B0E14]/80 custom-scrollbar">
            {isInboxLoading ? (
              <div className="p-8 flex justify-center"><div className="w-6 h-6 border-2 border-[#8B5CF6] border-t-transparent rounded-full animate-spin"></div></div>
            ) : inboxMessages.length === 0 ? (
              <div className="p-8 text-center opacity-60 text-[#8F95A3] text-[13px]">Your inbox is empty</div>
            ) : (
              inboxMessages.map((msg, idx) => (
                <div key={idx} className="px-5 py-4 border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer group">
                  <h4 className="text-[13px] text-white font-bold mb-1 group-hover:text-[#8B5CF6]">{msg.title || msg.subject || 'Notification'}</h4>
                  <p className="text-[12px] text-[#8F95A3]">{msg.message || msg.body || ''}</p>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}