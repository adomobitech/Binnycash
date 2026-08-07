'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Flame, Plus, Trash2, Edit, Layers, ExternalLink, CheckCircle2 } from 'lucide-react';
import { useCurrency, formatPrice } from '@/hooks/useCurrency';

export default function AdminOffersPage() {
  const router = useRouter();
  const currency = useCurrency();
  const [offerwalls, setOfferwalls] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // New Offerwall Form States
  const [name, setName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const fetchOfferwalls = async () => {
    setIsLoading(true);
    // 🔥 FIX: Use 'admin_token' here too 🔥
    const token = localStorage.getItem('admin_token');
    if (!token) {
      router.push('/admin/login');
      return;
    }

    try {
      const res = await fetch('https://apitest.binnycash.com/api/admin/offerwallList', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      const list = data?.data?.list || data?.data || data?.offerwalls || [];
      setOfferwalls(Array.isArray(list) ? list : []);
    } catch (err) {
      console.error("Failed to fetch offerwalls:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOfferwalls();
  }, [router]);

  const handleCreateOfferwall = async (e: React.FormEvent) => {
    e.preventDefault();
    // 🔥 FIX: Use 'admin_token' 🔥
    const token = localStorage.getItem('admin_token');
    if (!token || !name) return;

    try {
      const res = await fetch('https://apitest.binnycash.com/api/admin/createOfferwall', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name })
      });

      if (res.ok) {
        setName('');
        setIsCreating(false);
        fetchOfferwalls();
      } else {
        alert("Failed to create offerwall.");
      }
    } catch (err) {
      console.error("Error creating offerwall:", err);
    }
  };

  const handleDeleteOfferwall = async (id: string) => {
    if (!confirm("Are you sure you want to delete this offerwall?")) return;
    // 🔥 FIX: Use 'admin_token' 🔥
    const token = localStorage.getItem('admin_token');
    if (!token) return;

    try {
      const res = await fetch(`https://apitest.binnycash.com/api/admin/deleteOfferwall`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ id })
      });

      if (res.ok) {
        fetchOfferwalls();
      } else {
        alert("Failed to delete offerwall.");
      }
    } catch (err) {
      console.error("Error deleting offerwall:", err);
    }
  };

  return (
    <div className="flex flex-col gap-6 text-white">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-wider">Offers & Offerwall Management</h1>
          <p className="text-xs text-[#8F95A3]">Manage third-party networks, postbacks, and custom offerwalls</p>
        </div>

        <button 
          onClick={() => setIsCreating(true)}
          className="bg-[#8B5CF6] hover:bg-[#7c3aed] text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(139,92,246,0.4)] cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add New Offerwall
        </button>
      </div>

      {/* CREATE MODAL */}
      {isCreating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <form onSubmit={handleCreateOfferwall} className="bg-[#161821] border border-white/10 w-full max-w-md p-6 rounded-[24px] shadow-2xl flex flex-col gap-4">
            <h3 className="text-lg font-black text-white">Create New Offerwall</h3>
            
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-[#8F95A3]">Offerwall Name</label>
              <input 
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. CPX Research, AdGate"
                className="bg-[#111319] border border-white/10 rounded-xl px-4 py-3 text-xs text-white focus:outline-none focus:border-[#8B5CF6]"
              />
            </div>

            <div className="flex justify-end gap-3 mt-4">
              <button 
                type="button"
                onClick={() => setIsCreating(false)}
                className="bg-white/5 hover:bg-white/10 text-[#8F95A3] hover:text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="bg-[#8B5CF6] hover:bg-[#7c3aed] text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Create
              </button>
            </div>
          </form>
        </div>
      )}

      {/* OFFERWALLS GRID TABLE */}
      <div className="bg-[#161821] border border-white/5 rounded-2xl overflow-hidden shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 text-[#8F95A3] text-[11px] font-bold uppercase tracking-wider bg-[#111319]/50">
                <th className="py-4 px-5">Offerwall Name</th>
                <th className="py-4 px-5">Status</th>
                <th className="py-4 px-5">Postbacks Tracked</th>
                <th className="py-4 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-xs">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-[#8F95A3] animate-pulse">Loading offerwalls...</td>
                </tr>
              ) : offerwalls.length > 0 ? (
                offerwalls.map((ow: any, idx: number) => (
                  <tr key={ow._id || ow.id || idx} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-4 px-5 font-bold text-white flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-[#8B5CF6]/20 border border-[#8B5CF6]/40 flex items-center justify-center text-[#8B5CF6]">
                        <Layers className="w-4 h-4" />
                      </div>
                      {ow.name || ow.title || 'Unnamed Offerwall'}
                    </td>
                    <td className="py-4 px-5">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        <CheckCircle2 className="w-3 h-3" /> Active
                      </span>
                    </td>
                    <td className="py-4 px-5 text-[#8F95A3]">{ow.postbacksCount || 0} hits</td>
                    <td className="py-4 px-5 text-right">
                      <button 
                        onClick={() => handleDeleteOfferwall(ow._id || ow.id)}
                        className="bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 p-2 rounded-lg transition-colors cursor-pointer"
                        title="Delete Offerwall"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-[#8F95A3]">No offerwalls found. Let's create one.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}