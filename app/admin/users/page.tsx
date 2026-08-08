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
    <div className="flex flex-col gap-6 text-black">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-wider text-black">User Management</h1>
          <p className="text-xs text-gray-500">Monitor user activities, wallets, and account statuses</p>
        </div>

        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or email..."
            className="bg-white border border-gray-300 rounded-xl pl-10 pr-4 py-2.5 text-xs text-black focus:outline-none focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6] transition-all w-full sm:w-[280px]"
          />
        </div>
      </div>

      {/* USERS TABLE */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 text-gray-500 text-[11px] font-bold uppercase tracking-wider bg-gray-50">
                <th className="py-4 px-5">User Profile</th>
                <th className="py-4 px-5">Email</th>
                <th className="py-4 px-5">Wallet Balance</th>
                <th className="py-4 px-5">Status</th>
                <th className="py-4 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-xs">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500 animate-pulse">Loading users database...</td>
                </tr>
              ) : filteredUsers.length > 0 ? (
                filteredUsers.map((u: any, idx: number) => (
                  <tr key={u._id || u.id || idx} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-5 font-bold text-black flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#8B5CF6]/10 border border-[#8B5CF6]/20 flex items-center justify-center text-[#8B5CF6] font-black uppercase">
                        {(u.name || u.email || 'U')[0]}
                      </div>
                      {u.name || 'Unnamed User'}
                    </td>
                    <td className="py-4 px-5 text-gray-500">{u.email || 'N/A'}</td>
                    <td className="py-4 px-5 font-black text-green-600">
                      {formatPrice(Number(u.wallet || u.balance || u.userCredits || 0), currency)}
                    </td>
                    <td className="py-4 px-5">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold ${u.isBlocked ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-green-50 text-green-600 border border-green-200'}`}>
                        {u.isBlocked ? <Ban className="w-3 h-3" /> : <CheckCircle2 className="w-3 h-3" />}
                        {u.isBlocked ? 'Blocked' : 'Active'}
                      </span>
                    </td>
                    <td className="py-4 px-5 text-right">
                      <button 
                        onClick={() => setSelectedUser(u)}
                        className="bg-[#8B5CF6]/10 hover:bg-[#8B5CF6]/20 text-[#8B5CF6] border border-[#8B5CF6]/20 px-3 py-1.5 rounded-lg font-bold transition-colors cursor-pointer"
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500">No users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* USER MANAGEMENT MODAL */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white border border-gray-200 w-full max-w-md p-6 rounded-[24px] shadow-xl flex flex-col gap-4 relative">
            <h3 className="text-lg font-black text-black">Manage User: {selectedUser.name || selectedUser.email}</h3>
            
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-gray-500">Adjust Wallet Balance (+/- amount)</label>
              <div className="flex gap-2">
                <input 
                  type="number"
                  value={walletAdjustment}
                  onChange={(e) => setWalletAdjustment(e.target.value)}
                  placeholder="e.g. 10 or -5"
                  className="flex-1 bg-white border border-gray-300 rounded-xl px-4 py-2.5 text-xs text-black focus:outline-none focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6] transition-all"
                />
                <button 
                  onClick={() => handleWalletAdjust(selectedUser._id || selectedUser.id)}
                  className="bg-[#8B5CF6] hover:bg-[#7c3aed] text-white px-4 py-2.5 rounded-xl font-bold text-xs transition-colors cursor-pointer shadow-sm"
                >
                  Apply
                </button>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-4">
              <button 
                onClick={() => setSelectedUser(null)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-black px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer"
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