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
    <div className="flex flex-col gap-6 text-black">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-wider text-black">Offers & Offerwall Management</h1>
          <p className="text-xs text-gray-500">Manage third-party networks, postbacks, and custom offerwalls</p>
        </div>

        <button 
          onClick={() => setIsCreating(true)}
          className="bg-[#8B5CF6] hover:bg-[#7c3aed] text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 shadow-[0_4px_15px_rgba(139,92,246,0.3)] cursor-pointer"
        >
          <Plus className="w-4 h-4" /> Add New Offerwall
        </button>
      </div>

      {/* CREATE MODAL */}
      {isCreating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <form onSubmit={handleCreateOfferwall} className="bg-white border border-gray-200 w-full max-w-md p-6 rounded-[24px] shadow-xl flex flex-col gap-4">
            <h3 className="text-lg font-black text-black">Create New Offerwall</h3>
            
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-gray-500">Offerwall Name</label>
              <input 
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. CPX Research, AdGate"
                className="bg-white border border-gray-300 rounded-xl px-4 py-3 text-xs text-black focus:outline-none focus:border-[#8B5CF6] focus:ring-1 focus:ring-[#8B5CF6] transition-all"
              />
            </div>

            <div className="flex justify-end gap-3 mt-4">
              <button 
                type="button"
                onClick={() => setIsCreating(false)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-black px-4 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button 
                type="submit"
                className="bg-[#8B5CF6] hover:bg-[#7c3aed] text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer shadow-sm"
              >
                Create
              </button>
            </div>
          </form>
        </div>
      )}

      {/* OFFERWALLS GRID TABLE */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200 text-gray-500 text-[11px] font-bold uppercase tracking-wider bg-gray-50">
                <th className="py-4 px-5">Offerwall Name</th>
                <th className="py-4 px-5">Status</th>
                <th className="py-4 px-5">Postbacks Tracked</th>
                <th className="py-4 px-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-xs text-black">
              {isLoading ? (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-gray-500 animate-pulse">Loading offerwalls...</td>
                </tr>
              ) : offerwalls.length > 0 ? (
                offerwalls.map((ow: any, idx: number) => (
                  <tr key={ow._id || ow.id || idx} className="hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-5 font-bold text-black flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-[#8B5CF6]/10 border border-[#8B5CF6]/20 flex items-center justify-center text-[#8B5CF6]">
                        <Layers className="w-4 h-4" />
                      </div>
                      {ow.name || ow.title || 'Unnamed Offerwall'}
                    </td>
                    <td className="py-4 px-5">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold bg-green-50 text-green-600 border border-green-200">
                        <CheckCircle2 className="w-3 h-3" /> Active
                      </span>
                    </td>
                    <td className="py-4 px-5 text-gray-500">{ow.postbacksCount || 0} hits</td>
                    <td className="py-4 px-5 text-right">
                      <button 
                        onClick={() => handleDeleteOfferwall(ow._id || ow.id)}
                        className="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 p-2 rounded-lg transition-colors cursor-pointer"
                        title="Delete Offerwall"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-gray-500">No offerwalls found. Let's create one.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}