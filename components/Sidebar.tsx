'use client';

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { 
  PlayCircle, Rocket, Trophy, Wallet, Users, BarChart3, Gift, 
  HelpCircle, MessageSquare, Bell, Menu, X, Sparkles, ExternalLink, Clock
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [balance, setBalance] = useState('0.00'); // 🔥 Wallet balance state

  // Inbox Modal & Mobile Menu States
  const [isInboxOpen, setIsInboxOpen] = useState(false);
  const [inboxMessages, setInboxMessages] = useState<any[]>([]);
  const [isInboxLoading, setIsInboxLoading] = useState(false);
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
      
      // 🔥 Fetch Wallet Balance API
      fetch('https://apitest.binnycash.com/api/user/wallet/total-earning', {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data && data.data !== undefined) {
            setBalance(data.data);
          }
        })
        .catch(err => console.error("Wallet fetch error:", err));
    }
  }, []);

  // Fetch Inbox API when modal opens
  const fetchInboxMessages = async () => {
    setIsInboxLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('https://apitest.binnycash.com/api/user/inbox/inbox', {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      const list = data?.data || data || [];
      setInboxMessages(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error("Inbox fetch error:", err);
    } finally { 
      setIsInboxLoading(false); 
    }
  };

  useEffect(() => { 
    if (isInboxOpen) fetchInboxMessages(); 
  }, [isInboxOpen]);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  // Main Links
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
    <>
      {/* Floating Mobile Toggle Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="fixed bottom-6 right-6 z-[110] lg:hidden w-14 h-14 bg-gradient-to-br from-[#8B5CF6] to-[#7c3aed] text-white rounded-full flex items-center justify-center shadow-[0_4px_20px_rgba(139,92,246,0.5)] hover:scale-105 transition-all"
      >
        {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {/* Mobile Backdrop Overlay */}
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-[90] lg:hidden transition-opacity duration-300 ${isMobileMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Sidebar Component */}
      <aside 
        ref={sidebarRef} 
        className={`w-[260px] shrink-0 bg-[#111319] border-r border-white/5 p-4 flex flex-col z-[40] custom-scrollbar overflow-y-auto
          /* Mobile Drawer */
          fixed top-0 left-0 h-full transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
          /* Desktop Sticky Mode */
          lg:sticky lg:top-[80px] lg:h-[calc(100vh-80px)] lg:self-start lg:translate-x-0
        `}
      >
        
        {/* Mobile Header */}
        <div className="flex items-center justify-between lg:hidden mb-4 pb-4 border-b border-white/5">
          <span className="text-white font-black text-lg">Menu</span>
          <button onClick={() => setIsMobileMenuOpen(false)} className="text-[#8F95A3] hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Wallet Balance Display (Dynamic API Data) */}
        <div className="bg-[#1A1C24] border border-[#8B5CF6]/30 rounded-xl p-4 flex flex-col mb-6 shadow-[0_0_15px_rgba(139,92,246,0.1)] shrink-0">
          <span className="text-[#8F95A3] text-xs font-bold uppercase tracking-wider mb-1">Your Balance</span>
          <div className="flex items-center gap-1">
            <span className="text-[#8B5CF6] text-lg font-black">$</span>
            <span className="text-white text-2xl font-black">{balance}</span>
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

        {/* Communications */}
        <div className="flex flex-col gap-1.5 mb-6 relative">
          <span className="text-[10px] text-[#8F95A3] font-bold uppercase tracking-widest px-4 mb-2">Community</span>
          
          <button onClick={() => setIsInboxOpen(true)}
            className="flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 w-full text-left text-[#8F95A3] hover:text-white hover:bg-white/5 cursor-pointer">
            <div className="flex items-center gap-3">
              <Bell className="w-5 h-5" />
              <span className="text-sm font-bold tracking-wide">Notifications</span>
            </div>
            <span className="w-2 h-2 rounded-full bg-[#00E57A] shadow-[0_0_8px_#00E57A]"></span>
          </button>

          <Link href="/chat" 
            className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 w-full text-left ${pathname === '/chat' || pathname === '/support-chat' ? 'bg-[#8B5CF6] text-white shadow-[0_4px_20px_rgba(139,92,246,0.3)]' : 'text-[#8F95A3] hover:text-white hover:bg-white/5'}`}>
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

        {/* Bottom Footer Section */}
        <div className="mt-auto pt-6 border-t border-white/5 flex flex-col gap-3 shrink-0">
          <div className="flex items-center justify-between px-2 text-[#8F95A3] text-xs">
            <a href="https://discord.gg" target="_blank" rel="noreferrer" className="hover:text-white transition-colors flex items-center gap-1 font-semibold">
              Discord
            </a>
            <span className="text-white/10">•</span>
            <a href="https://telegram.org" target="_blank" rel="noreferrer" className="hover:text-white transition-colors flex items-center gap-1 font-semibold">
              Telegram
            </a>
            <span className="text-white/10">•</span>
            <a href="https://twitter.com" target="_blank" rel="noreferrer" className="hover:text-white transition-colors flex items-center gap-1 font-semibold">
              Twitter
            </a>
          </div>

          <div className="flex items-center justify-between text-[11px] text-[#8F95A3]/60 px-2 pt-2 border-t border-white/[0.03]">
            <span>© 2026 BinnyCash</span>
            <div className="flex gap-2">
              <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
              <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            </div>
          </div>
        </div>

      </aside>

      {/* 🔥 INBOX POPUP MODAL 🔥 */}
      {isInboxOpen && (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-fadeIn">
          <div className="bg-[#161922] border border-[#8B5CF6]/30 w-full max-w-lg rounded-3xl p-6 shadow-[0_0_50px_rgba(139,92,246,0.2)] relative overflow-hidden flex flex-col max-h-[80vh]">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#8B5CF6]/10 border border-[#8B5CF6]/30 flex items-center justify-center text-[#8B5CF6]">
                  <Bell className="w-5 h-5 animate-bounce" />
                </div>
                <div>
                  <h3 className="text-white font-black text-lg">Notifications</h3>
                  <p className="text-xs text-[#8F95A3]">Recent activities and offer rewards</p>
                </div>
              </div>
              <button 
                onClick={() => setIsInboxOpen(false)}
                className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-[#8F95A3] hover:text-white transition-all cursor-pointer border border-white/5"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body / Notifications List */}
            <div className="py-4 overflow-y-auto custom-scrollbar flex-1 space-y-3 pr-1">
              {isInboxLoading ? (
                <div className="flex flex-col items-center justify-center h-48 gap-3">
                  <div className="w-8 h-8 border-2 border-[#8B5CF6] border-t-transparent rounded-full animate-spin"></div>
                  <span className="text-xs text-[#8F95A3] font-medium">Loading notifications...</span>
                </div>
              ) : inboxMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-center text-[#8F95A3]">
                  <Bell className="w-10 h-10 mb-2 opacity-30" />
                  <p className="text-sm font-medium">No new notifications in your inbox.</p>
                </div>
              ) : (
                inboxMessages.map((item, idx) => {
                  const userName = item.userName || 'User';
                  const offerName = item.offer || item.title || 'Offer Completed';
                  const reward = item.totalUsdValue ? `+$${item.totalUsdValue}` : (item.reward ? `+$${item.reward}` : '');
                  
                  let imageUrl = 'https://ui-avatars.com/api/?name=User&background=random';
                  if (item.image) {
                    imageUrl = item.image.startsWith('http') ? item.image : `https://apitest.binnycash.com${item.image}`;
                  }

                  return (
                    <div key={item._id || idx} className="bg-[#111319] border border-white/5 rounded-2xl p-4 flex items-center justify-between gap-4 hover:border-[#8B5CF6]/40 transition-all">
                      <div className="flex items-center gap-3.5 min-w-0">
                        <img 
                          src={imageUrl} 
                          alt="avatar" 
                          className="w-11 h-11 rounded-xl object-cover bg-white/5 border border-white/10 shrink-0"
                          onError={(e) => { e.currentTarget.src = 'https://ui-avatars.com/api/?name=User&background=random'; }}
                        />
                        <div className="min-w-0">
                          <h4 className="text-white text-sm font-black truncate">{userName}</h4>
                          <p className="text-[#8F95A3] text-xs truncate mt-0.5">{offerName}</p>
                        </div>
                      </div>
                      {reward && (
                        <div className="text-right shrink-0">
                          <span className="text-xs font-black text-[#00E57A] bg-[#00E57A]/10 px-2.5 py-1 rounded-lg border border-[#00E57A]/20 block">
                            {reward}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Footer */}
            <div className="pt-4 border-t border-white/10 text-center">
              <button 
                onClick={() => setIsInboxOpen(false)}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#7c3aed] text-white font-bold text-sm shadow-[0_4px_15px_rgba(139,92,246,0.4)] hover:scale-[1.02] transition-all cursor-pointer"
              >
                Close Inbox
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}