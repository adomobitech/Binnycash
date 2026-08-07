'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Users, Search, Shield, Ban, CheckCircle2, AlertCircle, Wallet, Edit3 } from 'lucide-react';
import { useCurrency, formatPrice } from '@/hooks/useCurrency';

export default function AdminUsersPage() {
  const router = useRouter();
  const currency = useCurrency();
  const [users, setUsers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [walletAdjustment, setWalletAdjustment] = useState('');

  const fetchUsers = async () => {
    setIsLoading(true);
    // 🔥 FIX: Check for 'admin_token' instead of 'token' 🔥
    const token = localStorage.getItem('admin_token');
    if (!token) {
      router.push('/admin/login');
      return;
    }

    try {
      const res = await fetch('https://apitest.binnycash.com/api/admin/onlineUserList', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      const list = data?.data?.list || data?.data || data?.users || [];
      setUsers(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error("Failed to load users:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [router]);

  const handleWalletAdjust = async (userId: string) => {
    // 🔥 FIX: Check for 'admin_token' 🔥
    const token = localStorage.getItem('admin_token');
    if (!token || !walletAdjustment) return;

    try {
      const res = await fetch('https://apitest.binnycash.com/api/admin/adjest-user-wallet', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userId, amount: Number(walletAdjustment) })
      });
      if (res.ok) {
        alert("Wallet adjusted successfully!");
        setWalletAdjustment('');
        fetchUsers();
      } else {
        alert("Failed to adjust wallet.");
      }
    } catch (err) {
      console.error("Error adjusting wallet:", err);
    }
  };

  const filteredUsers = users.filter(u => 
    (u.name || '').toLowerCase().includes(searchQuery.toLowerCase()) || 
    (u.email || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6 text-white">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-wider">User Management</h1>
          <p className="text-xs text-[#8F95A3]">Monitor user activities, wallets, and account statuses</p>
        </div>

        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8F95A3]" />
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or email..."
            className="bg-[#161821] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#8B5CF6] w-full sm:w-[280px]"
          />
        </div>
      </div>

      <div className="bg-[#161821] border border-white/5 rounded-2xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 text-[#8F95A3] text-[11px] font-bold uppercase tracking-wider bg-[#111319]/50">
                <th className="py-4 px-5">User Profile</th>
                <th className="py-4 px-5">Email</th>
                <th className="py-4 px-5">Wallet Balance</th>
                <th className="py-4 px-5">Status</th>
                <th className="py-4 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-[#8F95A3] animate-pulse">Loading users database...</td>
                </tr>
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map((u: any, idx: number) => (
                  <tr key={u._id || u.id || idx} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-5 font-bold text-white flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#8B5CF6]/20 border border-[#8B5CF6]/40 flex items-center justify-center text-[#8B5CF6] font-black uppercase">
                        {(u.name || u.email || 'U')[0]}
                      </div>
                      {u.name || 'Unnamed User'}
                    </td>
                    <td className="py-4 px-5 text-[#8F95A3]">{u.email || 'N/A'}</td>
                    <td className="py-4 px-5 font-black text-emerald-400">
                      {formatPrice(Number(u.wallet || u.balance || u.userCredits || 0), currency)}
                    </td>
                    <td className="py-4 px-5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${u.isBlocked ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
                        {u.isBlocked ? <Ban className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                        {u.isBlocked ? 'Blocked' : 'Active'}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-right">
                      <button 
                        onClick={() => setSelectedUser(u)}
                        className="bg-[#8B5CF6]/20 hover:bg-[#8B5CF6]/30 text-[#8B5CF6] border border-[#8B5CF6]/30 px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer"
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-[#8F95A3]">No users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* USER MANAGEMENT MODAL */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#161821] border border-white/10 w-full max-w-md p-6 rounded-[24px] shadow-2xl flex flex-col gap-4 relative">
            <h3 className="text-lg font-black text-white">Manage User: {selectedUser.name || selectedUser.email}</h3>
            
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-[#8F95A3]">Adjust Wallet Balance (+/- amount)</label>
              <div className="flex gap-2">
                <input 
                  type="number"
                  value={walletAdjustment}
                  onChange={(e) => setWalletAdjustment(e.target.value)}
                  placeholder="e.g. 10 or -5"
                  className="flex-1 bg-[#111319] border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-[#8B5CF6]"
                />
                <button 
                  onClick={() => handleWalletAdjust(selectedUser._id || selectedUser.id)}
                  className="bg-[#8B5CF6] hover:bg-[#7c3aed] text-white px-4 py-2.5 rounded-xl font-bold text-xs transition-colors cursor-pointer"
                >
                  Apply
                </button>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-4">
              <button 
                onClick={() => setSelectedUser(null)}
                className="bg-white/5 hover:bg-white/10 text-[#8F95A3] hover:text-white px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}