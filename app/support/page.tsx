'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'next/navigation';
import { 
  HelpCircle, MessageSquare, Mail, ShieldCheck, Clock, 
  Send, UploadCloud, ChevronDown, CheckCircle2, AlertCircle, Search, FileText, X, Trash2, Eye, PlusCircle,
  Loader2, Sparkles, Radio, Zap, LifeBuoy, ArrowRight, CornerDownRight, Check
} from 'lucide-react';

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

function SupportPageContent() {
  const searchParams = useSearchParams();
  const [activeTab, setActiveTab] = useState<'ticket' | 'faqs' | 'myTickets'>('ticket');
  
  const [ticketSubject, setTicketSubject] = useState('');
  const [category, setCategory] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [message, setMessage] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [submitDone, setSubmitDone] = useState(false);

  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const CATEGORY_OPTIONS = [
    { value: 'Withdrawal', label: 'Withdrawal' },
    { value: 'Offer Not Credited', label: 'Offer Not Credited' },
    { value: 'Account', label: 'Account' },
    { value: 'KYC', label: 'KYC' },
    { value: 'Referral', label: 'Referral' },
    { value: 'Bug', label: 'Bug' },
    { value: 'Other', label: 'Other' },
  ];

  const [faqSearch, setFaqSearch] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [tickets, setTickets] = useState<any[]>([]);
  const [isTicketsLoading, setIsTicketsLoading] = useState(false);

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

  // URL PARAMS AUTOFILL LOGIC
  useEffect(() => {
    if (searchParams) {
      const urlCategory = searchParams.get('category');
      const urlDescription = searchParams.get('description');

      if (urlCategory) {
        const match = CATEGORY_OPTIONS.find(c => c.label.toLowerCase() === urlCategory.toLowerCase());
        if (match) setCategory(match.value);
        else setCategory('Other');
      }

      if (urlDescription) {
        setMessage(urlDescription);
      }
    }
  }, [searchParams]);

  const fetchTickets = async () => {
    const token = localStorage.getItem('token') || '';
    setIsTicketsLoading(true);
    try {
      const res = await fetch(`https://api.binnycash.com/api/user/ticketList?page=1&limit=20`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const text = await res.text();
      const json = text ? JSON.parse(text) : {};
      if (json.code === 200 && json.data) {
        setTickets(Array.isArray(json.data) ? json.data : (json.data.tickets || []));
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
  }, [activeTab]);

  const handleTicketSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!category) {
      setSuccessMsg('Error: Please select a category');
      return;
    }
    
    setIsSubmitting(true);
    setSuccessMsg('');

    const token = localStorage.getItem('token') || '';
    
    try {
      const data = new FormData();
      data.append('subject', ticketSubject);
      data.append('category', category);
      data.append('contactEmail', contactEmail);
      data.append('message', message);

      if (imageFile) {
        data.append('image', imageFile);
      }

      const res = await fetch(`https://api.binnycash.com/api/user/createTicket`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: data
      });

      let json: any = {};
      const text = await res.text();
      try {
        json = text ? JSON.parse(text) : {};
      } catch (parseError) {
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
      const res = await fetch(`https://api.binnycash.com/api/user/userViewTicket?ticketId=${ticketId}`, {
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
      const res = await fetch(`https://api.binnycash.com/api/user/deleteTicket?ticketId=${ticketToDelete}`, {
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

      const res = await fetch('https://api.binnycash.com/api/user/userReplyTicket', {
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

  const filteredFaqs = FAQS_DATA.filter(f => 
    f.q.toLowerCase().includes(faqSearch.toLowerCase()) || 
    f.a.toLowerCase().includes(faqSearch.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#07080F] text-white selection:bg-[#00F2FE]/30 relative overflow-x-hidden pb-20">
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;700&display=swap');
        .custom-font { font-family: 'Plus Jakarta Sans', sans-serif; }
        .mono-font { font-family: 'JetBrains Mono', monospace; }
        .custom-scrollbar::-webkit-scrollbar { width: 5px; height: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0, 242, 254, 0.25); border-radius: 10px; }
        .glow-effect { box-shadow: 0 0 35px rgba(0, 242, 254, 0.12); }
      `}</style>

      {/* Cyberpunk Grid & Glow Backgrounds */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-[25%] -left-[10%] w-[600px] h-[600px] bg-gradient-to-br from-[#00F2FE]/15 to-[#4FACFE]/5 blur-[140px] rounded-full" />
        <div className="absolute top-[40%] -right-[15%] h-[550px] w-[550px] bg-gradient-to-br from-[#8B5CF6]/15 to-pink-500/5 blur-[150px] rounded-full" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      </div>

      <main className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 pt-10 relative z-10 custom-font">
        
        {/* TOP HERO BANNER */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="relative rounded-[32px] bg-gradient-to-r from-[#0E1325] via-[#121833] to-[#0E1325] border border-white/10 p-8 sm:p-10 shadow-2xl overflow-hidden mb-10 glow-effect"
        >
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#00F2FE]/10 blur-[100px] pointer-events-none" />
          <div className="absolute inset-x-0 top-0 h-[3px] bg-gradient-to-r from-transparent via-[#00F2FE] to-transparent" />

          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 relative z-10">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#00F2FE]/10 border border-[#00F2FE]/30 text-[#00F2FE] text-xs font-bold uppercase tracking-widest mb-4">
                <Radio className="w-3.5 h-3.5 animate-pulse" /> Support Command Center
              </div>
              <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-3">
                How can we <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#00F2FE] to-[#4FACFE]">help you</span> today?
              </h1>
              <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
                Connect instantly with our dedicated support engineers or track your active inquiries in real-time.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
              <motion.a
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                href="mailto:support@binnycash.com"
                className="w-full sm:w-auto px-6 py-4 rounded-2xl bg-[#1A223F] hover:bg-[#222B50] border border-white/10 text-white font-bold text-sm flex items-center justify-center gap-3 transition-all shadow-lg"
              >
                <Mail className="w-4 h-4 text-[#00F2FE]" />
                support@binnycash.com
              </motion.a>
            </div>
          </div>

          {/* TAB NAVIGATION PILLS */}
          <div className="flex flex-wrap items-center gap-3 mt-10 pt-6 border-t border-white/10">
            {[
              { id: 'ticket', label: 'Raise New Ticket', icon: PlusCircle },
              { id: 'myTickets', label: 'My Active Tickets', icon: FileText },
              { id: 'faqs', label: 'Knowledge Base & FAQs', icon: HelpCircle },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`relative px-6 py-3.5 rounded-2xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-2.5 ${
                    isActive 
                      ? 'text-white bg-gradient-to-r from-[#00F2FE]/20 to-[#4FACFE]/20 border border-[#00F2FE]/50 shadow-[0_0_20px_rgba(0,242,254,0.2)]' 
                      : 'bg-white/5 border border-white/5 text-slate-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-[#00F2FE]' : 'text-slate-400'}`} />
                  {tab.label}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* TAB 1: RAISE TICKET */}
        <AnimatePresence mode="wait">
          {activeTab === 'ticket' && (
            <motion.div 
              key="ticket" 
              initial={{ opacity: 0, y: 15 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -15 }} 
              transition={{ duration: 0.3 }}
              className="grid grid-cols-1 lg:grid-cols-12 gap-8"
            >
              <div className="lg:col-span-8 bg-[#0E1325]/90 backdrop-blur-xl border border-white/10 rounded-[32px] p-6 sm:p-10 shadow-2xl">
                <div className="mb-8">
                  <h2 className="text-2xl font-bold text-white tracking-tight">Create Support Ticket</h2>
                  <p className="text-slate-400 text-xs sm:text-sm mt-1">Fill out the form with accurate details to get priority assistance.</p>
                </div>

                {successMsg && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`mb-6 p-4 rounded-2xl text-xs font-bold text-center border ${
                      successMsg.includes('successfully') 
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                        : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                    }`}
                  >
                    {successMsg}
                  </motion.div>
                )}

                <form onSubmit={handleTicketSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-2 uppercase tracking-wider">Subject <span className="text-rose-500">*</span></label>
                      <input 
                        type="text" 
                        required
                        placeholder="Brief title of your issue"
                        value={ticketSubject}
                        onChange={(e) => setTicketSubject(e.target.value)}
                        className="w-full bg-[#131932] border border-white/10 rounded-2xl px-4 py-3.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#00F2FE] focus:ring-2 focus:ring-[#00F2FE]/20 transition-all"
                      />
                    </div>

                    <div className="relative">
                      <label className="block text-xs font-bold text-slate-300 mb-2 uppercase tracking-wider">
                        Category <span className="text-rose-500">*</span>
                      </label>
                      
                      <div 
                        onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                        className={`w-full bg-[#131932] border rounded-2xl px-4 py-3.5 text-sm cursor-pointer flex justify-between items-center transition-all ${
                          isCategoryOpen ? 'border-[#00F2FE] shadow-[0_0_15px_rgba(0,242,254,0.2)]' : 'border-white/10 hover:border-white/30'
                        }`}
                      >
                        <span className={category ? "text-white font-medium" : "text-slate-500"}>
                          {category ? CATEGORY_OPTIONS.find(c => c.value === category)?.label : "Select category"}
                        </span>
                        <motion.div animate={{ rotate: isCategoryOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
                          <ChevronDown className="w-4 h-4 text-slate-400" />
                        </motion.div>
                      </div>

                      <AnimatePresence>
                        {isCategoryOpen && (
                          <motion.div 
                            initial={{ opacity: 0, y: -10, scaleY: 0.95 }} 
                            animate={{ opacity: 1, y: 0, scaleY: 1 }} 
                            exit={{ opacity: 0, y: -10, scaleY: 0.95 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                            className="absolute z-50 w-full mt-2 bg-[#131932] border border-white/15 rounded-2xl shadow-2xl overflow-hidden origin-top"
                          >
                            <div className="max-h-60 overflow-y-auto custom-scrollbar p-2">
                              {CATEGORY_OPTIONS.map((cat) => (
                                <div 
                                  key={cat.value}
                                  onClick={() => {
                                    setCategory(cat.value);
                                    setIsCategoryOpen(false);
                                  }}
                                  className={`px-3 py-3 text-sm rounded-xl cursor-pointer transition-all flex items-center justify-between ${
                                    category === cat.value 
                                      ? 'bg-[#00F2FE]/20 text-[#00F2FE] font-bold' 
                                      : 'text-slate-300 hover:bg-white/5 hover:text-white'
                                  }`}
                                >
                                  <span>{cat.label}</span>
                                  {category === cat.value && <Check className="w-4 h-4 text-[#00F2FE]" />}
                                </div>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-2 uppercase tracking-wider">Contact Email <span className="text-rose-500">*</span></label>
                      <input 
                        type="email" 
                        required
                        placeholder="yourname@domain.com"
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        className="w-full bg-[#131932] border border-white/10 rounded-2xl px-4 py-3.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#00F2FE] focus:ring-2 focus:ring-[#00F2FE]/20 transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-300 mb-2 uppercase tracking-wider">Attachment (Optional)</label>
                      <label className="flex items-center gap-3 bg-[#131932] hover:bg-[#1A223F] border border-white/10 px-4 py-3 rounded-2xl cursor-pointer transition-all">
                        <input 
                          type="file" 
                          accept="image/png, image/jpeg"
                          className="hidden"
                          onChange={(e) => setImageFile(e.target.files ? e.target.files[0] : null)}
                        />
                        <div className="w-8 h-8 rounded-xl bg-[#00F2FE]/10 flex items-center justify-center text-[#00F2FE] shrink-0">
                          <UploadCloud className="w-4 h-4" />
                        </div>
                        <span className="text-xs text-slate-300 truncate">{imageFile ? imageFile.name : 'Upload screenshot (PNG, JPG)'}</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-2 uppercase tracking-wider">Description <span className="text-rose-500">*</span></label>
                    <textarea 
                      required
                      rows={5}
                      placeholder="Describe your issue in detail..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full bg-[#131932] border border-white/10 rounded-2xl p-4 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-[#00F2FE] focus:ring-2 focus:ring-[#00F2FE]/20 custom-scrollbar transition-all"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-4 pt-4 border-t border-white/10">
                    <button 
                      type="reset"
                      onClick={() => { setTicketSubject(''); setCategory(''); setContactEmail(''); setMessage(''); setImageFile(null); }}
                      className="px-6 py-3.5 rounded-2xl bg-white/5 hover:bg-white/10 text-xs font-bold text-slate-300 transition-colors cursor-pointer"
                    >
                      Reset Form
                    </button>
                    <motion.button 
                      whileHover={{ scale: submitDone ? 1 : 1.02 }}
                      whileTap={{ scale: 0.97 }}
                      type="submit"
                      disabled={isSubmitting}
                      className={`px-8 py-3.5 rounded-2xl text-xs font-bold text-white shadow-xl transition-all cursor-pointer flex items-center gap-2 ${
                        submitDone 
                          ? 'bg-emerald-500 shadow-emerald-500/30' 
                          : 'bg-gradient-to-r from-[#00F2FE] to-[#4FACFE] text-slate-950 font-black shadow-[0_0_25px_rgba(0,242,254,0.3)] hover:opacity-95'
                      }`}
                    >
                      <AnimatePresence mode="wait" initial={false}>
                        {submitDone ? (
                          <motion.span key="done" initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4 text-slate-950" /> Ticket Submitted!
                          </motion.span>
                        ) : isSubmitting ? (
                          <motion.span key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin text-slate-950" /> Transmitting...
                          </motion.span>
                        ) : (
                          <motion.span key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2">
                            <Send className="w-4 h-4 text-slate-950" /> Submit Ticket
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </motion.button>
                  </div>
                </form>
              </div>

              {/* RIGHT INFO CARDS */}
              <div className="lg:col-span-4 space-y-6">
                <div className="bg-[#0E1325]/90 backdrop-blur-xl border border-white/10 rounded-[32px] p-6 shadow-xl">
                  <div className="w-12 h-12 rounded-2xl bg-[#00F2FE]/10 border border-[#00F2FE]/30 flex items-center justify-center mb-4">
                    <LifeBuoy className="w-6 h-6 text-[#00F2FE]" />
                  </div>
                  <h3 className="text-base font-bold text-white mb-1">Priority Support</h3>
                  <p className="text-xs text-slate-400 leading-relaxed mb-4">Our engineers review and answer tickets in the order they arrive. Typical turnaround is under 4 hours.</p>
                  <div className="p-3.5 rounded-2xl bg-[#131932] border border-white/5 text-xs text-slate-300 flex items-center gap-2.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Secure End-to-End Encryption</span>
                  </div>
                </div>

                <div className="bg-[#0E1325]/90 backdrop-blur-xl border border-white/10 rounded-[32px] p-6 shadow-xl">
                  <h4 className="text-sm font-bold text-white mb-4 uppercase tracking-wider">Fast-Track Checklist</h4>
                  <ul className="space-y-3 text-xs text-slate-400">
                    <li className="flex items-start gap-2.5">
                      <div className="w-4 h-4 rounded-full bg-[#00F2FE]/20 text-[#00F2FE] flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">1</div>
                      <span>Include transaction IDs for payout delays.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <div className="w-4 h-4 rounded-full bg-[#00F2FE]/20 text-[#00F2FE] flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">2</div>
                      <span>Attach full-screen screenshots when possible.</span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <div className="w-4 h-4 rounded-full bg-[#00F2FE]/20 text-[#00F2FE] flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">3</div>
                      <span>Do not submit duplicate tickets for the same issue.</span>
                    </li>
                  </ul>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* TAB 2: MY ACTIVE TICKETS */}
        <AnimatePresence mode="wait">
          {activeTab === 'myTickets' && (
            <motion.div 
              key="myTickets" 
              initial={{ opacity: 0, y: 15 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -15 }} 
              transition={{ duration: 0.3 }}
              className="bg-[#0E1325]/90 backdrop-blur-xl border border-white/10 rounded-[32px] p-6 sm:p-10 shadow-2xl"
            >
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">Active Support Tickets</h2>
                  <p className="text-slate-400 text-xs sm:text-sm mt-1">Review correspondence history and check real-time ticket status.</p>
                </div>
                <button 
                  onClick={fetchTickets}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-[#00F2FE] transition-colors cursor-pointer"
                >
                  Refresh List
                </button>
              </div>

              <div className="overflow-x-auto custom-scrollbar">
                <table className="w-full text-left border-collapse min-w-[850px]">
                  <thead>
                    <tr className="border-b border-white/10 text-[11px] mono-font font-bold text-slate-400 uppercase tracking-widest bg-white/[0.02]">
                      <th className="px-6 py-4">Ticket ID</th>
                      <th className="px-6 py-4">Subject</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4">Created Date</th>
                      <th className="px-6 py-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {isTicketsLoading ? (
                      Array.from({ length: 3 }).map((_, i) => (
                        <tr key={i} className="border-b border-white/5">
                          <td colSpan={5} className="px-6 py-6">
                            <div className="h-6 rounded-xl bg-white/5 animate-pulse w-full" />
                          </td>
                        </tr>
                      ))
                    ) : tickets.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="px-6 py-20 text-center">
                          <FileText className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                          <p className="text-sm font-semibold text-slate-400">No support tickets found.</p>
                          <p className="text-xs text-slate-500 mt-1">Click "Raise New Ticket" above to start an inquiry.</p>
                        </td>
                      </tr>
                    ) : (
                      tickets.map((t, i) => (
                        <motion.tr 
                          key={t._id || t.ticketId}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.04 }}
                          className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                        >
                          <td className="px-6 py-4 text-xs mono-font font-bold text-[#00F2FE]">#{t.ticketId || t._id}</td>
                          <td className="px-6 py-4 text-sm font-bold text-white">{t.ticketSubject || t.subject}</td>
                          <td className="px-6 py-4">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase border inline-flex items-center gap-1.5 ${
                              t.status === 'OPEN' 
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                                : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                            }`}>
                              {t.status === 'OPEN' && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />}
                              {t.status}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-xs mono-font text-slate-400">{new Date(t.createdAt).toLocaleDateString()}</td>
                          <td className="px-6 py-4 text-right flex items-center justify-end gap-2.5">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleViewTicket(t.ticketId || t._id)}
                              className="px-4 py-2 rounded-xl bg-[#00F2FE]/15 hover:bg-[#00F2FE]/25 text-[#00F2FE] text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-colors"
                            >
                              <Eye className="w-3.5 h-3.5" /> View Thread
                            </motion.button>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => confirmDeleteTicket(t.ticketId || t._id)}
                              className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 cursor-pointer transition-colors"
                            >
                              <Trash2 className="w-4 h-4" />
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

        {/* TAB 3: FAQs */}
        <AnimatePresence mode="wait">
          {activeTab === 'faqs' && (
            <motion.div 
              key="faqs" 
              initial={{ opacity: 0, y: 15 }} 
              animate={{ opacity: 1, y: 0 }} 
              exit={{ opacity: 0, y: -15 }} 
              transition={{ duration: 0.3 }}
              className="bg-[#0E1325]/90 backdrop-blur-xl border border-white/10 rounded-[32px] p-6 sm:p-10 shadow-2xl"
            >
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
                <div>
                  <h2 className="text-2xl font-bold text-white tracking-tight">Frequently Asked Questions</h2>
                  <p className="text-slate-400 text-xs sm:text-sm mt-1">Instant answers regarding rewards, payouts, and account security.</p>
                </div>
                
                <div className="relative w-full md:w-80">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="Search knowledge base..."
                    value={faqSearch}
                    onChange={(e) => setFaqSearch(e.target.value)}
                    className="w-full bg-[#131932] border border-white/10 rounded-2xl pl-11 pr-4 py-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00F2FE]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {filteredFaqs.map((faq, idx) => {
                  const isOpen = openFaq === idx;
                  return (
                    <motion.div 
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.04 }}
                      className={`bg-[#131932] border rounded-2xl overflow-hidden transition-all ${
                        isOpen ? 'border-[#00F2FE]/50 shadow-[0_0_20px_rgba(0,242,254,0.1)]' : 'border-white/10 hover:border-white/20'
                      }`}
                    >
                      <button 
                        onClick={() => setOpenFaq(isOpen ? null : idx)}
                        className="w-full p-5 text-left flex justify-between items-center gap-4 cursor-pointer"
                      >
                        <span className="text-sm font-bold text-white">{faq.q}</span>
                        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.25 }}>
                          <ChevronDown className={`w-4 h-4 shrink-0 ${isOpen ? 'text-[#00F2FE]' : 'text-slate-400'}`} />
                        </motion.div>
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
                            <div className="px-5 pb-5 text-xs text-slate-300 leading-relaxed border-t border-white/5 pt-3">
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
        </AnimatePresence>

      </main>

      {/* --- DELETE CONFIRMATION MODAL --- */}
      <AnimatePresence>
        {deleteModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 10 }}
              className="bg-[#0E1325] border border-white/15 rounded-[32px] p-8 w-full max-w-[420px] shadow-2xl text-center relative text-white"
            >
              <div className="w-16 h-16 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-7 h-7 text-rose-400" />
              </div>
              <h3 className="text-xl font-bold mb-2">Delete Inquiry?</h3>
              <p className="text-xs text-slate-400 mb-8">This will permanently remove this support ticket and associated chat history.</p>

              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setDeleteModalOpen(false)}
                  className="py-3.5 rounded-2xl bg-white/5 hover:bg-white/10 text-xs font-bold text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isDeleting}
                  onClick={executeDeleteTicket}
                  className="py-3.5 rounded-2xl bg-rose-500 hover:bg-rose-600 text-xs font-bold text-white shadow-lg shadow-rose-500/30 transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {isDeleting ? 'Deleting...' : 'Confirm Delete'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* --- VIEW TICKET THREAD & REPLY MODAL --- */}
      <AnimatePresence>
        {isViewModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-[#0E1325] border border-white/15 rounded-[32px] p-6 sm:p-8 w-full max-w-[750px] shadow-2xl max-h-[92vh] overflow-y-auto custom-scrollbar relative text-white"
            >
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="absolute top-6 right-6 w-9 h-9 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-slate-400 hover:text-white cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3 mb-6">
                <div className="px-3 py-1 rounded-xl bg-[#00F2FE]/10 border border-[#00F2FE]/30 text-xs mono-font font-bold text-[#00F2FE]">
                  #{selectedTicketId}
                </div>
                <h3 className="text-xl font-bold tracking-tight">{ticketDetail?.ticketSubject || ticketDetail?.subject || 'Ticket Thread'}</h3>
              </div>

              {isDetailLoading ? (
                <div className="py-24 flex flex-col items-center justify-center gap-3 text-slate-400">
                  <Loader2 className="w-8 h-8 text-[#00F2FE] animate-spin" />
                  <span className="text-xs">Loading correspondence...</span>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* MESSAGE THREAD WITH EXACT userType CHECK */}
                  <div className="space-y-4 max-h-[42vh] overflow-y-auto custom-scrollbar p-2 bg-[#131932]/50 border border-white/5 rounded-2xl">
                    {(() => {
                      const allMessages = ticketDetail?.messages || ticketDetail?.chats || [];
                      if (allMessages.length > 0) {
                        return allMessages.map((msg: any, idx: number) => {
                          const userTypeVal = String(msg.userType || msg.senderType || msg.sender || '').trim().toUpperCase();
                          
                          // If userType is ADMIN -> Left Side (Support Agent)
                          // If userType is USER -> Right Side (You)
                          const isAdmin = userTypeVal === 'ADMIN';
                          const isUser = !isAdmin;

                          return (
                            <div key={msg._id || idx} className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
                              <div className={`max-w-[85%] p-4 rounded-2xl text-xs space-y-2 shadow-md ${
                                isUser 
                                  ? 'bg-[#00F2FE]/15 border border-[#00F2FE]/30 rounded-br-sm text-white' 
                                  : 'bg-[#1A223F] border border-white/10 rounded-bl-sm text-slate-200'
                              }`}>
                                <div className="flex justify-between items-center gap-4">
                                  <span className={`font-bold ${isUser ? 'text-[#00F2FE]' : 'text-emerald-400'}`}>
                                    {msg.userName || (isUser ? 'You' : 'Support Agent')}
                                  </span>
                                  <span className="text-[10px] mono-font text-slate-400">
                                    {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                  </span>
                                </div>
                                <p className="text-sm leading-relaxed">{msg.message || msg.text}</p>
                                {msg.userImage || msg.image ? (
                                  <a href={msg.userImage || msg.image} target="_blank" rel="noreferrer">
                                    <img src={msg.userImage || msg.image} alt="Attachment" className="mt-2 rounded-xl max-h-48 object-cover border border-white/10 hover:opacity-90 transition-opacity" />
                                  </a>
                                ) : null}
                              </div>
                            </div>
                          );
                        });
                      }
                      return <p className="text-xs text-slate-500 italic text-center py-8">No messages recorded in thread.</p>;
                    })()}
                  </div>

                  {/* REPLY FORM */}
                  <form onSubmit={handleReplySubmit} className="pt-4 border-t border-white/10 space-y-4">
                    <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">Reply to Support</label>
                    <textarea 
                      required
                      rows={3}
                      placeholder="Type your reply..."
                      value={replyMessage}
                      onChange={(e) => setReplyMessage(e.target.value)}
                      className="w-full bg-[#131932] border border-white/10 rounded-2xl p-4 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#00F2FE]"
                    />
                    
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <label className="flex items-center gap-2.5 bg-[#131932] hover:bg-[#1A223F] border border-white/10 px-4 py-2.5 rounded-xl cursor-pointer transition-all">
                        <input 
                          type="file" 
                          accept="image/*"
                          onChange={(e) => setReplyImage(e.target.files ? e.target.files[0] : null)}
                          className="hidden"
                        />
                        <UploadCloud className="w-4 h-4 text-[#00F2FE]" />
                        <span className="text-xs text-slate-300 truncate max-w-[200px]">{replyImage ? replyImage.name : 'Attach screenshot'}</span>
                      </label>

                      <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.97 }}
                        type="submit"
                        disabled={isReplying}
                        className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#00F2FE] to-[#4FACFE] text-slate-950 font-extrabold text-xs shadow-lg shadow-[#00F2FE]/20 cursor-pointer flex items-center gap-2"
                      >
                        {isReplying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
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

export default function SupportPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#07080F] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#00F2FE] animate-spin" />
      </div>
    }>
      <SupportPageContent />
    </Suspense>
  );
}