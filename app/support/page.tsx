'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HelpCircle, MessageSquare, Mail, ShieldCheck, Clock, 
  Send, UploadCloud, ChevronDown, CheckCircle2, AlertCircle, Search, FileText, X, Trash2, Eye, PlusCircle,
  Loader2, Sparkles, Radio, Zap
} from 'lucide-react';

function getUserId(): string {
  if (typeof window === 'undefined') return '';
  const isNumeric = (v: any) => v !== null && v !== undefined && /^\d+$/.test(String(v));
  try {
    const wrapperKeys = ['loginResponse', 'authResponse', 'loginData'];
    for (const key of wrapperKeys) {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      try {
        const parsed = JSON.parse(raw);
        const id = parsed?.data?.userDetails?.id ?? parsed?.userDetails?.id;
        if (isNumeric(id)) return String(id);
      } catch {}
    }
    const objectKeys = ['userDetails', 'user', 'userData', 'profile', 'authUser'];
    for (const key of objectKeys) {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      try {
        const parsed = JSON.parse(raw);
        const candidates = [parsed?.id, parsed?.userDetails?.id, parsed?._id, parsed?.userId, parsed?.user_id];
        const numericMatch = candidates.find(isNumeric);
        if (numericMatch !== undefined) return String(numericMatch);
      } catch {}
    }
    const directKeys = ['userId', 'user_id', 'uid', 'sid', 'numericUserId'];
    for (const key of directKeys) {
      const val = localStorage.getItem(key);
      if (isNumeric(val)) return String(val);
    }
  } catch (err) {}
  return '';
}

const FAQS_DATA = [
  {
    q: 'What is BinnyCash and how does it work?',
    a: 'BinnyCash is a premier platform where you can play games, complete offers, participate in surveys, and refer friends to earn real cash and rewards instantly.'
  },
  {
    q: 'How much can I earn on BinnyCash?',
    a: 'Your earnings depend entirely on the offers, surveys, and tasks you complete. There is no upper limit—the more active you are, the more you earn!'
  },
  {
    q: 'What is the minimum withdrawal amount?',
    a: 'The minimum withdrawal amount is set at a low threshold of just $5 so you can cash out your earnings quickly.'
  },
  {
    q: 'How long do withdrawals take to process?',
    a: 'Most withdrawals via UPI, PhonePe, and Paytm are processed instantly. Bank transfers typically take up to 24 hours.'
  },
  {
    q: 'Why is my task or reward pending?',
    a: 'Tasks can sometimes take a few minutes to several hours to verify with our partners. If it exceeds 24 hours, feel free to raise a support ticket.'
  },
  {
    q: 'Which offers give the highest rewards?',
    a: 'Featured partner offers and high-tier app installations usually offer the highest payouts. Check the "Earn" section daily for boosted tasks.'
  }
];

export default function SupportPage() {
  const [activeTab, setActiveTab] = useState<'ticket' | 'faqs' | 'myTickets'>('ticket');
  
  const [ticketSubject, setTicketSubject] = useState('');
  const [category, setCategory] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [message, setMessage] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [submitDone, setSubmitDone] = useState(false);

  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const [tickets, setTickets] = useState<any[]>([]);
  const [isTicketsLoading, setIsTicketsLoading] = useState(false);
  
  // State to hold verified ID from backend
  const [trueUserId, setTrueUserId] = useState<string>('');

  const [selectedTicketId, setSelectedTicketId] = useState<any>(null);
  const [ticketDetail, setTicketDetail] = useState<any>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDetailLoading, setIsDetailLoading] = useState(false);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [ticketToDelete, setTicketToDelete] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const [replyMessage, setReplyMessage] = useState('');
  const [replyImage, setReplyImage] = useState<File | null>(null);
  const [isReplying, setIsReplying] = useState(false);

  // FETCH TRUE USER ID FROM TOKEN
  useEffect(() => {
    const fetchAccurateId = async () => {
      const token = localStorage.getItem('token');
      if (!token) return;
      try {
        const res = await fetch('https://apitest.binnycash.com/api/user/viewData', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const text = await res.text();
        const json = text ? JSON.parse(text) : {};
        const validId = json?.data?.user?.id || json?.data?.id || json?.data?.user?.userId;
        if (validId) {
          setTrueUserId(String(validId));
          localStorage.setItem('userId', String(validId));
        }
      } catch (e) {
        console.error("Failed to sync true user ID");
      }
    };
    fetchAccurateId();
  }, []);

  const fetchTickets = async () => {
    const token = localStorage.getItem('token') || '';
    const userId = trueUserId || getUserId();
    if (!userId) return;

    setIsTicketsLoading(true);
    try {
      const res = await fetch(`https://apitest.binnycash.com/api/user/ticketList?userId=${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const text = await res.text();
      const json = text ? JSON.parse(text) : {};
      if (json.code === 200 && json.data) {
        setTickets(Array.isArray(json.data) ? json.data : []);
      }
    } catch (err) {
      console.error('Failed to fetch tickets:', err);
    } finally {
      setIsTicketsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'myTickets') {
      fetchTickets();
    }
  }, [activeTab, trueUserId]);

  // 🔥 FIXED: Safe Parsing to handle 504 HTML Responses 🔥
  const handleTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMsg('');

    const token = localStorage.getItem('token') || '';
    const userId = trueUserId || getUserId();
    
    try {
      const data = new FormData();
      data.append('ticketSubject', ticketSubject);
      data.append('category', category);
      data.append('contactEmail', contactEmail);
      data.append('message', message);
      data.append('userId', userId); 

      if (imageFile) {
        data.append('image', imageFile);
      }

      const res = await fetch(`https://apitest.binnycash.com/api/user/createTicket?userId=${userId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: data
      });

      // Safe JSON parsing to prevent crash if server returns 504 HTML
      let json: any = {};
      const text = await res.text();
      try {
        json = text ? JSON.parse(text) : {};
      } catch (parseError) {
        console.error("Non-JSON response received:", text);
        if (res.status === 504) {
          throw new Error("504 Gateway Timeout: Server is currently overloaded.");
        }
        throw new Error(`Server returned ${res.status} ${res.statusText}`);
      }
      
      if (res.ok || json.code === 200 || json.responseCode === 0) {
        setSuccessMsg('Support ticket submitted successfully!');
        setSubmitDone(true);
        setTicketSubject('');
        setCategory('');
        setContactEmail('');
        setMessage('');
        setImageFile(null);
        setTimeout(() => {
          setActiveTab('myTickets');
          setSubmitDone(false);
          fetchTickets(); 
        }, 1200);
      } else {
        let errMsg = json.message || json.error || 'Failed to submit ticket.';
        if (Array.isArray(errMsg)) errMsg = errMsg.join(', ');
        else if (typeof errMsg === 'object') errMsg = JSON.stringify(errMsg);
        setSuccessMsg(`Error: ${errMsg}`);
      }
    } catch (err: any) {
      console.error('Ticket creation error:', err);
      setSuccessMsg(`Something went wrong: ${err.message || 'Network Error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleViewTicket = async (ticketId: any) => {
    setSelectedTicketId(ticketId);
    setIsViewModalOpen(true);
    setIsDetailLoading(true);

    const token = localStorage.getItem('token') || '';
    try {
      const res = await fetch(`https://apitest.binnycash.com/api/user/userViewTicket?ticketId=${ticketId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const text = await res.text();
      const json = text ? JSON.parse(text) : {};
      if (json.code === 200 || json.data) {
        setTicketDetail(json.data);
      }
    } catch (err) {
      console.error('Failed to view ticket:', err);
    } finally {
      setIsDetailLoading(false);
    }
  };

  const confirmDeleteTicket = (ticketId: any) => {
    setTicketToDelete(ticketId);
    setDeleteModalOpen(true);
  };

  const executeDeleteTicket = async () => {
    if (!ticketToDelete) return;
    setIsDeleting(true);
    const token = localStorage.getItem('token') || '';
    try {
      const res = await fetch(`https://apitest.binnycash.com/api/user/deleteTicket?ticketId=${ticketToDelete}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setDeleteModalOpen(false);
        setTicketToDelete(null);
        fetchTickets();
      }
    } catch (err) {
      console.error('Failed to delete ticket:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleReplySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyMessage.trim()) return;
    setIsReplying(true);

    const token = localStorage.getItem('token') || '';
    try {
      const data = new FormData();
      data.append('ticketId', String(selectedTicketId));
      data.append('message', replyMessage);
      if (replyImage) {
        data.append('image', replyImage);
      }

      const res = await fetch('https://apitest.binnycash.com/api/user/userReplyTicket', {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` },
        body: data
      });

      const text = await res.text();
      const json = text ? JSON.parse(text) : {};
      
      if (res.ok || json.code === 200 || json.responseCode === 0) {
        setReplyMessage('');
        setReplyImage(null);
        handleViewTicket(selectedTicketId);
      }
    } catch (err) {
      console.error('Reply failed:', err);
    } finally {
      setIsReplying(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#08070D] text-[#F5F3FF] relative overflow-x-hidden pb-16">
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(166,108,255,0.35); border-radius: 10px; }
        @keyframes radarPing {
          0% { transform: scale(0.6); opacity: 0.7; }
          100% { transform: scale(2.4); opacity: 0; }
        }
        .radar-ring { animation: radarPing 2.2s cubic-bezier(0.2,0.6,0.4,1) infinite; }
        @keyframes floaty { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
        .floaty { animation: floaty 3.5s ease-in-out infinite; }
        @keyframes shimmer { 0% { background-position: -400px 0; } 100% { background-position: 400px 0; } }
        .shimmer { background: linear-gradient(90deg, rgba(255,255,255,0.02) 0%, rgba(255,255,255,0.07) 50%, rgba(255,255,255,0.02) 100%); background-size: 400px 100%; animation: shimmer 1.6s ease-in-out infinite; }
      `}</style>

      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <motion.div 
          animate={{ x: [0, 40, 0], y: [0, 30, 0] }}
          transition={{ duration: 18, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute -top-40 -left-24 w-[520px] h-[520px] bg-[#A66CFF]/10 blur-[120px] rounded-full" 
        />
        <motion.div 
          animate={{ x: [0, -30, 0], y: [0, 40, 0] }}
          transition={{ duration: 22, repeat: Infinity, ease: 'easeInOut' }}
          className="absolute top-1/3 -right-32 w-[420px] h-[420px] bg-[#FFC94A]/[0.05] blur-[130px] rounded-full" 
        />
      </div>

      <main className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 relative z-10">

        {/* HEADER SECTION */}
        <motion.div 
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-[#120F1A] border border-white/[0.06] rounded-[28px] p-6 md:p-8 shadow-2xl mb-8 relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-[#A66CFF]/10 blur-[80px] pointer-events-none" />
          <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#A66CFF]/60 to-transparent" />
          
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
            <div>
              <span className="f-mono text-[10px] font-bold tracking-[0.3em] text-[#A66CFF] uppercase">Assistance · 24*7</span>
              <h1 className="f-display text-3xl md:text-4xl font-bold text-white tracking-tight mt-1">Help Center</h1>
              <p className="text-[#8D89A8] text-sm mt-1 font-medium">Raise a ticket, browse FAQs, or review your requests — all in one place.</p>
              
              <div className="flex flex-wrap items-center gap-3 mt-4">
                <div className="relative px-3 py-1 pl-6 rounded-full bg-[#3DE8A0]/10 border border-[#3DE8A0]/20 text-xs text-[#3DE8A0] font-bold flex items-center gap-1.5 overflow-visible">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[#3DE8A0]" />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full bg-[#3DE8A0] radar-ring" />
                  Support online now
                </div>
                <div className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-[#8D89A8] flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#A66CFF]" /> Avg. response: ~4 hours
                </div>
              </div>
            </div>

            <div className="flex flex-col items-start md:items-end gap-2 shrink-0 w-full md:w-auto">
              <motion.a 
                whileHover={{ scale: 1.03, y: -1 }}
                whileTap={{ scale: 0.98 }}
                href="mailto:support@binnycash.com"
                className="flex items-center gap-2 bg-[#1A1725] hover:bg-[#231F33] border border-white/10 px-5 py-3 rounded-2xl text-sm font-bold text-white transition-colors shadow-lg cursor-pointer"
              >
                <Mail className="w-4 h-4 text-[#A66CFF]" />
                Email Support
              </motion.a>
              <span className="text-[11px] text-[#8D89A8] font-medium">
                u can email us at <span className="text-[#A66CFF] font-bold">support@binnycash.com</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 mt-8 pt-6 border-t border-white/[0.06] relative">
            {[
              { id: 'ticket', label: 'Raise Ticket' },
              { id: 'faqs', label: 'FAQs' },
              { id: 'myTickets', label: 'My Tickets' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`relative px-5 py-2.5 rounded-full text-xs font-bold transition-colors cursor-pointer ${activeTab === tab.id ? 'text-white' : 'bg-[#1A1725] border border-white/[0.06] text-[#8D89A8] hover:text-white'}`}
              >
                {activeTab === tab.id && (
                  <motion.div 
                    layoutId="supportTabPill" 
                    transition={{ type: 'spring', duration: 0.5 }}
                    className="absolute inset-0 rounded-full bg-[#A66CFF] shadow-md shadow-[#A66CFF]/30" 
                  />
                )}
                <span className="relative z-10">{tab.label}</span>
              </button>
            ))}
          </div>
        </motion.div>

        <AnimatePresence mode="wait">
        {/* TAB 1: RAISE TICKET */}
        {activeTab === 'ticket' && (
          <motion.div key="ticket" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -14 }} transition={{ duration: 0.3 }} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 bg-[#120F1A] border border-white/[0.06] rounded-[28px] p-6 md:p-8 shadow-xl">
              <div className="mb-6">
                <h3 className="text-lg font-bold text-white">Raise a Support Ticket</h3>
                <p className="text-xs text-[#8D89A8] mt-0.5">Share details of the issue so our team can help you faster.</p>
              </div>

              {successMsg && (
                <div className={`mb-6 p-4 rounded-xl text-xs font-bold text-center border ${successMsg.includes('successfully') ? 'bg-[#3DE8A0]/10 text-[#3DE8A0] border-[#3DE8A0]/30' : 'bg-[#FF5D73]/10 text-[#FF5D73] border-[#FF5D73]/30'}`}>
                  {successMsg}
                </div>
              )}

              <form onSubmit={handleTicketSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-[#8D89A8] mb-2">Subject <span className="text-[#FF5D73]">*</span></label>
                    <input 
                      type="text" 
                      required
                      placeholder="e.g. Missing reward for offer"
                      value={ticketSubject}
                      onChange={(e) => setTicketSubject(e.target.value)}
                      className="w-full bg-[#1A1725] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#A66CFF]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#8D89A8] mb-2">Category <span className="text-[#FF5D73]">*</span></label>
                    <select
                      required
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full bg-[#1A1725] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#A66CFF]"
                    >
                      <option value="">Select category</option>
                      <option value="Offer / Reward Issue">Offer / Reward Issue</option>
                      <option value="Payout / Withdrawal">Payout / Withdrawal</option>
                      <option value="Account & KYC">Account & KYC</option>
                      <option value="Affiliate / Referral">Affiliate / Referral</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-[#8D89A8] mb-2">Upload Image</label>
                    <label className="flex items-center gap-3 bg-[#1A1725] hover:bg-[#231F33] border border-white/10 px-4 py-2.5 rounded-xl cursor-pointer transition-all">
                      <input 
                        type="file" 
                        accept="image/png, image/jpeg"
                        className="hidden"
                        onChange={(e) => setImageFile(e.target.files ? e.target.files[0] : null)}
                      />
                      <span className="px-3 py-1 rounded-lg bg-[#A66CFF] text-white text-xs font-bold">Choose file</span>
                      <span className="text-xs text-[#8D89A8] truncate">{imageFile ? imageFile.name : 'No file chosen'}</span>
                    </label>
                    <span className="text-[10px] text-[#8D89A8] mt-1 block">JPG, PNG (max 10MB)</span>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#8D89A8] mb-2">Contact Email <span className="text-[#FF5D73]">*</span></label>
                    <input 
                      type="email" 
                      required
                      placeholder="you@company.com"
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      className="w-full bg-[#1A1725] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#A66CFF]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#8D89A8] mb-2">Description <span className="text-[#FF5D73]">*</span></label>
                  <textarea 
                    required
                    rows={5}
                    placeholder="Provide full details of your issue..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full bg-[#1A1725] border border-white/10 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-[#A66CFF] custom-scrollbar"
                  />
                </div>

                <div className="flex items-start gap-2 pt-2">
                  <input type="checkbox" required id="consent" className="mt-1 accent-[#A66CFF]" />
                  <label htmlFor="consent" className="text-xs text-[#8D89A8] leading-relaxed">
                    I consent to be contacted about this request and agree to the processing of the information I've provided.
                  </label>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/[0.06]">
                  <motion.button 
                    whileTap={{ scale: 0.96 }}
                    type="reset"
                    onClick={() => { setTicketSubject(''); setCategory(''); setContactEmail(''); setMessage(''); setImageFile(null); }}
                    className="px-6 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-white transition-colors cursor-pointer"
                  >
                    Reset
                  </motion.button>
                  <motion.button 
                    whileHover={{ scale: submitDone ? 1 : 1.02 }}
                    whileTap={{ scale: 0.97 }}
                    type="submit"
                    disabled={isSubmitting}
                    className={`px-8 py-3 rounded-xl text-xs font-bold text-white shadow-lg transition-colors cursor-pointer flex items-center gap-2 ${submitDone ? 'bg-[#3DE8A0] shadow-[#3DE8A0]/30' : 'bg-gradient-to-r from-[#A66CFF] to-[#7C3AED] hover:opacity-90 shadow-[#A66CFF]/30'}`}
                  >
                    <AnimatePresence mode="wait" initial={false}>
                      {submitDone ? (
                        <motion.span key="done" initial={{ scale: 0, rotate: -90 }} animate={{ scale: 1, rotate: 0 }} className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4" /> Submitted!
                        </motion.span>
                      ) : isSubmitting ? (
                        <motion.span key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
                          <Loader2 className="w-4 h-4 animate-spin" /> Submitting...
                        </motion.span>
                      ) : (
                        <motion.span key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
                          <Send className="w-4 h-4" /> Submit Ticket
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.button>
                </div>
              </form>
            </div>

            <div className="space-y-6">
              <motion.div whileHover={{ y: -3 }} className="bg-[#120F1A] border border-white/[0.06] rounded-[28px] p-6 text-center shadow-xl relative overflow-hidden">
                <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-[#A66CFF]/15 flex items-center justify-center border border-[#A66CFF]/30 floaty">
                  <HelpCircle className="w-12 h-12 text-[#A66CFF]" />
                </div>
                <h3 className="text-base font-bold text-white mb-1">Need fast assistance?</h3>
                <p className="text-xs text-[#8D89A8] leading-relaxed">Our support crew is always ready to tackle payout, task, or account glitches.</p>
              </motion.div>

              <motion.div whileHover={{ y: -3 }} className="bg-[#120F1A] border border-white/[0.06] rounded-[28px] p-6 shadow-xl">
                <h4 className="text-sm font-bold text-white mb-3">Tips for fast resolution</h4>
                <ul className="space-y-2.5 text-xs text-[#8D89A8]">
                  <li className="flex items-start gap-2"><Zap className="w-3.5 h-3.5 text-[#FFC94A] shrink-0 mt-0.5" /> Share reproducible steps and exact error text.</li>
                  <li className="flex items-start gap-2"><Zap className="w-3.5 h-3.5 text-[#FFC94A] shrink-0 mt-0.5" /> Attach clear screenshots of the offer/wallet.</li>
                  <li className="flex items-start gap-2"><Zap className="w-3.5 h-3.5 text-[#FFC94A] shrink-0 mt-0.5" /> Tell us what you've already tried.</li>
                  <li className="flex items-start gap-2"><Zap className="w-3.5 h-3.5 text-[#FFC94A] shrink-0 mt-0.5" /> Pick the most relevant category.</li>
                </ul>
              </motion.div>

              <motion.div whileHover={{ y: -3 }} className="bg-[#120F1A] border border-white/[0.06] rounded-[28px] p-6 shadow-xl">
                <h4 className="text-sm font-bold text-white mb-1">Contact hours</h4>
                <p className="text-xs text-[#3DE8A0] font-bold mb-2">24*7 Available</p>
                <p className="text-[11px] text-[#8D89A8]/70 leading-relaxed">We monitor critical payout & security issues round the clock.</p>
              </motion.div>
            </div>
          </motion.div>
        )}

        {/* TAB 2: FAQS */}
        {activeTab === 'faqs' && (
          <motion.div key="faqs" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -14 }} transition={{ duration: 0.3 }} className="bg-[#120F1A] border border-white/[0.06] rounded-[28px] p-6 md:p-8 shadow-xl">
            <h3 className="text-xl font-bold text-white mb-2">Frequently Asked Questions</h3>
            <p className="text-xs text-[#8D89A8] mb-6">Quick answers to common questions about earning and withdrawals.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {FAQS_DATA.map((faq, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <motion.div 
                    key={idx} 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className={`bg-[#1A1725] border rounded-2xl overflow-hidden transition-colors ${isOpen ? 'border-[#A66CFF]/40' : 'border-white/[0.06]'}`}
                  >
                    <button 
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      className="w-full p-5 text-left flex justify-between items-center gap-4 cursor-pointer hover:bg-white/5 transition-colors"
                    >
                      <span className="text-sm font-bold text-white">{faq.q}</span>
                      <motion.span animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.25 }}>
                        <ChevronDown className={`w-4 h-4 shrink-0 ${isOpen ? 'text-[#A66CFF]' : 'text-[#8D89A8]'}`} />
                      </motion.span>
                    </button>
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.25, ease: 'easeInOut' }}
                          className="overflow-hidden"
                        >
                          <div className="px-5 pb-5 text-xs text-[#8D89A8] leading-relaxed border-t border-white/5 pt-3">
                            {faq.a}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* TAB 3: MY TICKETS */}
        {activeTab === 'myTickets' && (
          <motion.div key="myTickets" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -14 }} transition={{ duration: 0.3 }} className="bg-[#120F1A] border border-white/[0.06] rounded-[28px] p-6 md:p-8 shadow-xl">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
              <div>
                <h3 className="text-lg font-bold text-white">My Tickets</h3>
                <p className="text-xs text-[#8D89A8] mt-0.5">Track status, replies, and details of your support requests.</p>
              </div>
            </div>

            <div className="overflow-x-auto custom-scrollbar">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead>
                  <tr className="border-b border-white/[0.06] text-[10px] f-mono font-bold text-[#8D89A8] uppercase tracking-wider bg-white/[0.02]">
                    <th className="px-6 py-4">Ticket ID</th>
                    <th className="px-6 py-4">Subject</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Date</th>
                    <th className="px-6 py-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {isTicketsLoading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <tr key={i} className="border-b border-white/[0.05]">
                        <td colSpan={5} className="px-6 py-4"><div className="h-4 rounded-lg shimmer" /></td>
                      </tr>
                    ))
                  ) : tickets.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-16 text-center">
                        <FileText className="w-10 h-10 text-[#8D89A8] mx-auto mb-3 opacity-40 floaty" />
                        <span className="text-sm font-medium text-[#8D89A8]">No tickets yet. Create one from the Raise Ticket tab.</span>
                      </td>
                    </tr>
                  ) : (
                    tickets.map((t, i) => (
                      <motion.tr 
                        key={t._id} 
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04 }}
                        className="border-b border-white/[0.05] hover:bg-white/[0.03] transition-colors"
                      >
                        <td className="px-6 py-4 text-xs font-bold f-mono text-white">{t.ticketId}</td>
                        <td className="px-6 py-4 text-xs text-white font-bold">{t.ticketSubject}</td>
                        <td className="px-6 py-4">
                          <span className={`relative px-2.5 py-1 rounded text-[10px] font-bold uppercase border flex items-center gap-1.5 w-fit ${t.status === 'OPEN' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
                            {t.status === 'OPEN' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
                            {t.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-xs f-mono text-[#8D89A8]">{new Date(t.createdAt).toLocaleDateString()}</td>
                        <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleViewTicket(t.ticketId)}
                            className="px-3 py-1.5 rounded-lg bg-[#A66CFF]/20 hover:bg-[#A66CFF]/30 text-[#A66CFF] text-xs font-bold flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <Eye className="w-3.5 h-3.5" /> View
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => confirmDeleteTicket(t.ticketId)}
                            className="p-1.5 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 cursor-pointer transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </motion.button>
                        </td>
                      </motion.tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </motion.div>
        )}
        </AnimatePresence>

      </main>

      {/* --- CUSTOM DELETE CONFIRMATION MODAL --- */}
      <AnimatePresence>
        {deleteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              transition={{ type: 'spring', damping: 20, stiffness: 300 }}
              className="bg-[#120F1A] border border-white/10 rounded-[28px] p-6 sm:p-8 w-full max-w-[420px] shadow-2xl text-center relative text-white"
            >
              <motion.div 
                animate={{ rotate: [0, -8, 8, -8, 0] }}
                transition={{ duration: 0.5, delay: 0.15 }}
                className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4"
              >
                <Trash2 className="w-6 h-6 text-red-400" />
              </motion.div>
              <h3 className="text-lg font-bold mb-2">Delete Ticket</h3>
              <p className="text-xs text-[#8D89A8] mb-6">Are you sure you want to delete this support request? This action cannot be undone.</p>

              <div className="grid grid-cols-2 gap-3">
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  type="button"
                  onClick={() => setDeleteModalOpen(false)}
                  className="py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-bold text-white transition-colors cursor-pointer"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.96 }}
                  type="button"
                  disabled={isDeleting}
                  onClick={executeDeleteTicket}
                  className="py-2.5 rounded-xl bg-red-500 hover:bg-red-600 text-xs font-bold text-white shadow-lg shadow-red-500/30 transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : null}
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- VIEW & REPLY TICKET MODAL --- */}
      <AnimatePresence>
        {isViewModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: 'spring', damping: 22, stiffness: 300 }}
              className="bg-[#120F1A] border border-white/10 rounded-[28px] p-6 sm:p-8 w-full max-w-[700px] shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar relative text-white"
            >
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-white/70 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <h3 className="text-xl font-bold mb-4">Ticket Details #{selectedTicketId}</h3>

              {isDetailLoading ? (
                <div className="py-16 flex flex-col items-center justify-center gap-3 text-[#8D89A8]">
                  <div className="flex gap-1.5">
                    {[0, 1, 2].map((i) => (
                      <motion.span 
                        key={i}
                        animate={{ y: [0, -6, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.15 }}
                        className="w-2 h-2 rounded-full bg-[#A66CFF]"
                      />
                    ))}
                  </div>
                  <span className="text-xs">Loading conversation...</span>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="bg-[#1A1725] p-4 rounded-2xl border border-white/5 space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-[#8D89A8]">Subject</span>
                      <span className="text-xs font-bold text-white">{ticketDetail?.ticketSubject || ticketDetail?.subject || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-[#8D89A8]">Status</span>
                      <span className="text-xs font-bold text-emerald-400">{ticketDetail?.status || 'OPEN'}</span>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-sm font-bold text-[#8D89A8]">Conversation Thread</h4>
                    
                    {/* Initial User Message */}
                    <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="bg-[#1A1725] p-4 rounded-2xl border border-[#A66CFF]/30 text-xs leading-relaxed space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-[#A66CFF]">You (User)</span>
                        <span className="text-[10px] text-[#8D89A8]">{ticketDetail?.createdAt ? new Date(ticketDetail.createdAt).toLocaleString() : ''}</span>
                      </div>
                      <p className="text-white/90 font-medium">
                        {ticketDetail?.message || ticketDetail?.description || ticketDetail?.ticketSubject || 'No message description available.'}
                      </p>
                    </motion.div>

                    {/* All Replies */}
                    {(() => {
                      const allReplies = ticketDetail?.replies || ticketDetail?.reply || ticketDetail?.chats || [];
                      if (allReplies.length > 0) {
                        return allReplies.map((rep: any, idx: number) => {
                          const isUser = rep.sender === 'user' || rep.senderType === 'user' || rep.isAdmin === false;
                          const replyText = rep.message || rep.replyMessage || rep.text || '';
                          const replyTime = rep.createdAt || rep.date;
                          return (
                            <motion.div 
                              key={idx} 
                              initial={{ opacity: 0, x: isUser ? -10 : 10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ delay: idx * 0.06 }}
                              className={`p-4 rounded-2xl border text-xs leading-relaxed space-y-1 ${isUser ? 'bg-[#1A1725] border-white/10 ml-6' : 'bg-[#161322] border-amber-500/30 mr-6'}`}
                            >
                              <div className="flex justify-between items-center">
                                <span className={`font-bold ${isUser ? 'text-[#3DE8A0]' : 'text-amber-400'}`}>
                                  {isUser ? 'You (Reply)' : 'Admin / Support'}
                                </span>
                                <span className="text-[10px] text-[#8D89A8]">{replyTime ? new Date(replyTime).toLocaleString() : ''}</span>
                              </div>
                              <p className="text-white/90">{replyText}</p>
                            </motion.div>
                          );
                        });
                      }
                      return (
                        <p className="text-xs text-[#8D89A8] italic text-center py-2">No replies yet. Support will respond soon.</p>
                      );
                    })()}
                  </div>

                  {/* Reply Form */}
                  <form onSubmit={handleReplySubmit} className="pt-4 border-t border-white/10 space-y-3">
                    <label className="block text-xs font-bold text-[#8D89A8]">Add a Reply</label>
                    <textarea 
                      required
                      rows={3}
                      placeholder="Type your reply here..."
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      className="w-full bg-[#1A1725] border border-white/10 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-[#A66CFF]"
                    />
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                      <label className="flex items-center gap-2 bg-[#1A1725] hover:bg-[#201C2F] border border-white/10 px-3 py-2 rounded-xl cursor-pointer transition-all">
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={(e) => setReplyImage(e.target.files ? e.target.files[0] : null)}
                          className="hidden"
                        />
                        <span className="px-2 py-0.5 rounded bg-[#A66CFF] text-white text-[10px] font-bold">Choose file</span>
                        <span className="text-xs text-[#8D89A8] truncate max-w-[180px]">{replyImage ? replyImage.name : 'No file chosen'}</span>
                      </label>

                      <motion.button 
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.96 }}
                        type="submit"
                        disabled={isReplying}
                        className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#A66CFF] to-[#7C3AED] hover:opacity-90 text-white text-xs font-bold shadow-md cursor-pointer transition-opacity flex items-center gap-2"
                      >
                        {isReplying ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                        Send Reply
                      </motion.button>
                    </div>
                  </form>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}