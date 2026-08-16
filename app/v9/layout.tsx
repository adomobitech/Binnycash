'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, Users, Flame, Ticket, Gift, 
  HelpCircle, Share2, Bell, Layers, LogOut, ShieldCheck, Menu, X,
  Search, Moon, ListOrdered, Award, Wallet, CheckSquare, UserSquare, Ban, Trophy, Settings
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  if (pathname === '/v9/login') {
    return <div className="min-h-screen bg-[#0B0D14] text-white">{children}</div>;
  }

  const navCategories = [
    {
      title: 'USERS',
      items: [
        { name: 'All Users', href: '/v9/users', icon: Users },
        { name: 'User Details', href: '/v9/user-details', icon: UserSquare },
        { name: 'Blocked Users', href: '/v9/blocked-users', icon: Ban },
        { name: 'Wallets', href: '/v9/wallets', icon: Wallet },
      ]
    },
    {
      title: 'OFFERS',
      items: [
        { name: 'Offer Partners', href: '/v9/offers', icon: Flame },
        { name: 'Featured Offers', href: '/v9/featured-offers', icon: Ticket },
        { name: 'Categories', href: '/v9/categories', icon: Layers },
      ]
    },
    {
      title: 'SURVEYS',
      items: [
        { name: 'Survey Partners', href: '/v9/surveys', icon: CheckSquare },
      ]
    },
    {
      title: 'AFFILIATE',
      items: [
        { name: 'Affiliates', href: '/v9/affiliates', icon: Share2 },
        { name: 'Leaderboard', href: '/v9/leaderboard', icon: Trophy },
      ]
    },
     {
      title: 'REWARDS',
      items: [
        { name: 'Rewards', href: '/v9/rewards', icon: Gift },
        { name: 'Promo Codes', href: '/v9/promos', icon: Ticket },
      ]
    }
  ];

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    router.push('/v9/login');
  };

  return (
    <div className="flex min-h-screen bg-[#0B0D14] text-white overflow-hidden font-sans">
      
      {/* SIDEBAR NAVIGATION */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-[260px] bg-[#12141C] border-r border-white/5 flex flex-col transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`}>
        
        {/* BRAND LOGO */}
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-base leading-tight tracking-wide text-white">BinnyCash</span>
              <span className="text-[10px] text-gray-500 tracking-widest uppercase">Admin Panel</span>
            </div>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-gray-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* NAVIGATION LINKS */}
        <div className="flex-1 overflow-y-auto px-4 py-2 flex flex-col gap-6 custom-scrollbar">
          
          <Link
            href="/v9/dashboard"
            className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${pathname === '/v9/dashboard' ? 'bg-[#7C3AED] text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
          >
            <LayoutDashboard className="w-4 h-4 shrink-0" />
            Dashboard
          </Link>

          {navCategories.map((cat, idx) => (
            <div key={idx} className="flex flex-col gap-1.5">
              <span className="px-4 text-[10px] font-bold text-gray-500 tracking-wider uppercase mb-1">{cat.title}</span>
              {cat.items.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${isActive ? 'bg-[#7C3AED] text-white shadow-lg shadow-purple-500/20' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>

        {/* SETTINGS, LOGOUT & FOOTER AREA */}
        <div className="p-4 flex flex-col gap-3 border-t border-white/5 bg-[#12141C]">
          <div className="flex flex-col gap-1">
            <Link 
              href="/v9/settings" 
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${pathname === '/v9/settings' ? 'bg-[#7C3AED] text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
            >
               <Settings className="w-4 h-4" />
               Settings
            </Link>
            <Link 
              href="/v9/logs" 
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${pathname === '/v9/logs' ? 'bg-[#7C3AED] text-white' : 'text-gray-400 hover:bg-white/5 hover:text-white'}`}
            >
               <ListOrdered className="w-4 h-4" />
               Logs
            </Link>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-bold bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 transition-all cursor-pointer shadow-sm"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            Secure Logout
          </button>
          <p className="px-2 text-[10px] text-gray-500 text-center">© 2026 BinnyCash Admin Panel</p>
        </div>
      </aside>

      {/* MAIN CONTENT WRAPPER */}
      <div className="flex-1 flex flex-col lg:pl-[260px]">
        
        {/* TOPBAR */}
        <header className="sticky top-0 z-40 bg-[#0B0D14] border-b border-white/5 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
             <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden text-gray-400 hover:text-white p-1">
               <Menu className="w-5 h-5" />
             </button>
             
             <div className="hidden md:flex items-center relative w-[300px]">
                <Search className="absolute left-3 w-4 h-4 text-gray-500" />
                <input 
                  type="text" 
                  placeholder="Search by user name, email or ID..." 
                  className="w-full bg-[#12141C] border border-white/5 rounded-lg pl-9 pr-14 py-2 text-xs text-white focus:outline-none focus:border-[#7C3AED] transition-colors"
                />
                <div className="absolute right-2 flex items-center gap-1">
                   <kbd className="hidden sm:inline-block bg-white/5 border border-white/10 rounded px-1.5 py-0.5 text-[10px] font-mono text-gray-400">Ctrl</kbd>
                   <kbd className="hidden sm:inline-block bg-white/5 border border-white/10 rounded px-1.5 py-0.5 text-[10px] font-mono text-gray-400">K</kbd>
                </div>
             </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="text-gray-400 hover:text-white transition-colors">
               <Moon className="w-5 h-5" />
            </button>
            <div className="relative">
                <button className="text-gray-400 hover:text-white transition-colors relative">
                  <Bell className="w-5 h-5" />
                  <span className="absolute -top-1.5 -right-1.5 bg-[#7C3AED] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full border-2 border-[#0B0D14]">12</span>
                </button>
            </div>
            
            <div className="flex items-center gap-3 border-l border-white/10 pl-4 ml-2">
                <img src="https://ui-avatars.com/api/?name=Super+Admin&background=F59E0B&color=fff" alt="Admin" className="w-8 h-8 rounded-full border border-white/10" />
                <div className="hidden sm:flex flex-col">
                   <span className="text-[10px] text-gray-400">super@binnycash.com</span>
                </div>
            </div>
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