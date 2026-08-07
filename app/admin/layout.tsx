'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, Users, Flame, Ticket, Gift, 
  HelpCircle, Share2, Bell, Layers, LogOut, ShieldCheck, Menu, X 
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  // Agar login page par hain, toh sidebar render nahi karna
  if (pathname === '/admin/login') {
    return <div className="min-h-screen bg-[#0B0D14] text-white">{children}</div>;
  }

  const navItems = [
    { name: 'Dashboard Overview', href: '/admin/dashboard', icon: LayoutDashboard },
    { name: 'User Management', href: '/admin/users', icon: Users },
    { name: 'Offers & Wall', href: '/admin/offers', icon: Flame },
    { name: 'Affiliates', href: '/admin/affiliates', icon: Share2 },
    { name: 'Promo Codes', href: '/admin/promos', icon: Ticket },
    { name: 'Gift Cards', href: '/admin/giftcards', icon: Gift },
    { name: 'Streaks System', href: '/admin/streaks', icon: Layers },
    { name: 'Help Desk / Tickets', href: '/admin/support', icon: HelpCircle },
    { name: 'Notifications', href: '/admin/notifications', icon: Bell },
  ];

  const handleLogout = () => {
    localStorage.removeItem('token');
    router.push('/admin/login');
  };

  return (
    <div className="flex min-h-screen bg-[#0B0D14] text-white overflow-hidden">
      
      {/* SIDEBAR NAVIGATION */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#12141C] border-r border-white/10 flex flex-col transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        
        {/* BRAND LOGO */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#8B5CF6]/20 border border-[#8B5CF6]/40 flex items-center justify-center text-[#8B5CF6]">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="font-black tracking-wider uppercase text-base">BinnyAdmin</span>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-[#8F95A3] hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* NAVIGATION LINKS */}
        <div className="flex-1 overflow-y-auto px-4 py-6 flex flex-col gap-1.5 custom-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold transition-all ${isActive ? 'bg-[#8B5CF6] text-white shadow-[0_0_20px_rgba(139,92,246,0.4)]' : 'text-[#8F95A3] hover:bg-white/5 hover:text-white'}`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {item.name}
              </Link>
            );
          })}
        </div>

        {/* LOGOUT BUTTON */}
        <div className="p-4 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            Secure Logout
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT WRAPPER */}
      <div className="flex-1 flex flex-col lg:pl-64">
        
        {/* TOPBAR */}
        <header className="sticky top-0 z-40 bg-[#0B0D14]/80 backdrop-blur-md border-b border-white/10 px-6 py-4 flex items-center justify-between">
          <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden text-white p-2">
            <Menu className="w-6 h-6" />
          </button>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-bold text-[#8F95A3] uppercase tracking-wider">System Operational</span>
          </div>
        </header>

        {/* PAGE CONTENT */}
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto">
          {children}
        </main>
      </div>

    </div>
  );
}   