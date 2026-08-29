'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  LayoutDashboard, Users, ShieldCheck, Share2, Ticket, 
  RefreshCcw, Layers, Gift, LogOut, Menu, X, 
  Moon, Sun, Bell, ListOrdered, Settings,
} from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(true);

  if (pathname === '/v9/login') {
    return <div className="min-h-screen bg-[#0B0D14] text-white">{children}</div>;
  }

  // 🔥 Settings aur Logs ko ab main scrollable list me add kar diya hai
  const navItems = [
    { name: 'Dashboard', href: '/v9/dashboard', icon: LayoutDashboard },
    { name: 'User Management', href: '/v9/users', icon: Users },
    { name: 'KYC', href: '/v9/kyc', icon: ShieldCheck },
    { name: 'Affiliates', href: '/v9/affiliates', icon: Share2 },
    { name: 'Promo Codes', href: '/v9/promos', icon: Ticket },
    { name: 'Postbacks', href: '/v9/postbacks', icon: RefreshCcw },
    { name: 'Offerwall', href: '/v9/offerwall', icon: Layers },
    { name: 'Daily Rewards', href: '/v9/daily-rewards', icon: Gift },
    { name: 'Transactions', href: '/v9/transactions' , icon: Layers },
    { name: 'Leaderboards', href: '/v9/leaderboards' , icon: ShieldCheck },
    { name: 'Settings', href: '/v9/settings', icon: Settings },
    { name: 'Logs', href: '/v9/logs', icon: ListOrdered },
  ];

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    router.push('/v9/login');
  };

  return (
    <div className={`flex min-h-screen transition-colors duration-300 overflow-hidden font-sans ${isDarkMode ? 'bg-[#0B0D14] text-white' : 'bg-gray-50 text-gray-900'}`}>
      
      {/* --- SIDEBAR NAVIGATION --- */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-[260px] border-r flex flex-col transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 ${isDarkMode ? 'bg-[#12141C] border-white/5' : 'bg-white border-gray-200'}`}>
        
        {/* BRAND LOGO */}
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-lg border flex items-center justify-center ${isDarkMode ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400' : 'bg-emerald-100 border-emerald-300 text-emerald-600'}`}>
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="flex flex-col">
              <span className={`font-bold text-base leading-tight tracking-wide ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>BinnyCash</span>
              <span className="text-[10px] text-gray-500 tracking-widest uppercase">Admin Panel</span>
            </div>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className={`lg:hidden ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* NAVIGATION LINKS (SCROLLABLE AREA) */}
        <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-2 custom-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch={false} // 🔥 FIX: Ye ab background me automatic API requests nahi bhejega
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  isActive 
                    ? 'bg-[#7C3AED] text-white shadow-lg shadow-purple-500/20' 
                    : isDarkMode 
                      ? 'text-gray-400 hover:bg-white/5 hover:text-white' 
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {item.name}
              </Link>
            );
          })}
        </div>

        {/* LOGOUT AREA (PINNED AT BOTTOM) */}
        <div className={`p-4 flex flex-col gap-3 border-t ${isDarkMode ? 'border-white/5 bg-[#12141C]' : 'border-gray-200 bg-white'}`}>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-bold bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 transition-all cursor-pointer shadow-sm"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            Logout
          </button>
          <p className="px-2 text-[10px] text-gray-500 text-center">© 2026 BinnyCash Admin</p>
        </div>
      </aside>

      {/* --- MAIN CONTENT WRAPPER --- */}
      <div className="flex-1 flex flex-col lg:pl-[260px] relative">
        
        {/* --- CLEAN TOP BAR --- */}
        <header className={`sticky top-0 z-40 border-b px-6 py-4 flex items-center justify-between transition-colors duration-300 ${isDarkMode ? 'bg-[#0B0D14] border-white/5' : 'bg-white border-gray-200'}`}>
          <div className="flex items-center gap-4">
             <button onClick={() => setIsSidebarOpen(true)} className={`lg:hidden p-1 ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`}>
               <Menu className="w-5 h-5" />
             </button>
          </div>

          <div className="flex items-center gap-5">
            {/* THEME TOGGLE */}
            <button 
              onClick={() => setIsDarkMode(!isDarkMode)} 
              className={`transition-colors flex items-center justify-center w-8 h-8 rounded-full border ${isDarkMode ? 'text-gray-400 hover:text-white bg-white/5 border-white/10' : 'text-gray-600 hover:text-gray-900 bg-gray-100 border-gray-200'}`}
            >
               {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            
            {/* NOTIFICATION BELL */}
            <div className="relative">
                <button className={`transition-colors flex items-center justify-center w-8 h-8 rounded-full border ${isDarkMode ? 'text-gray-400 hover:text-white bg-white/5 border-white/10' : 'text-gray-600 hover:text-gray-900 bg-gray-100 border-gray-200'}`}>
                  <Bell className="w-4 h-4" />
                  <span className={`absolute -top-1 -right-1 bg-[#7C3AED] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full border-2 ${isDarkMode ? 'border-[#0B0D14]' : 'border-white'}`}>12</span>
                </button>
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