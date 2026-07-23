'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Sidebar from '@/components/Sidebar'; 
import { 
  ChevronLeft, MessageSquare, Send, 
  ChevronRight, Headset, AlertCircle, Wallet, 
  User, Mail, Clock, CheckCircle2, CheckCheck
} from 'lucide-react';

export default function SupportChatPage() {
  const router = useRouter();
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<any>(null);
  
  // Contact Form View State
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactSubject, setContactSubject] = useState('');
  const [contactMsg, setContactMsg] = useState('');
  const [isSubmittingContact, setIsSubmittingContact] = useState(false);
  const [contactSuccess, setContactSuccess] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchMessages = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) return;
      
      const res = await fetch('https://apitest.binnycash.com/api/user/chat/messages', {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const resData = await res.json();
      
      let list: any[] = [];
      if (resData && resData.data) {
        list = resData.data;
      } else if (Array.isArray(resData)) {
        list = resData;
      }
      setMessages(list);

      if (list.length > 0 && !currentUserId) {
        const userMsg = list.find((m: any) => m.userId && !isNaN(Number(m.userId)));
        if (userMsg) {
          setCurrentUserId(userMsg.userId);
          localStorage.setItem('numericUserId', String(userMsg.userId));
        }
      }
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/'); 
      return;
    }

    const savedId = localStorage.getItem('numericUserId');
    if (savedId) {
      setCurrentUserId(savedId);
    }
    
    fetchMessages();
    
    const interval = setInterval(fetchMessages, 10000);
    return () => clearInterval(interval);
  }, [router]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const token = localStorage.getItem('token');
    const activeUserId = currentUserId || localStorage.getItem('numericUserId') || '12';

    if (!token) {
      alert("Session expired: Please log in again.");
      router.push('/');
      return;
    }

    const msgText = newMessage.trim();
    setNewMessage('');

    const urlEncoded = new URLSearchParams();
    urlEncoded.append('userId', String(activeUserId));
    urlEncoded.append('message', msgText);

    try {
      const res = await fetch('https://apitest.binnycash.com/api/user/chat/messages', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Bearer ${token}` 
        },
        body: urlEncoded
      });
      
      if (res.ok) {
        fetchMessages();
      }
    } catch (err) {
      console.error("Failed to send message network error:", err);
    }
  };

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactSubject.trim() || !contactMsg.trim()) return;
    setIsSubmittingContact(true);
    
    setTimeout(() => {
      setIsSubmittingContact(false);
      setContactSuccess(true);
      setContactSubject('');
      setContactMsg('');
      setTimeout(() => setContactSuccess(false), 4000);
    }, 1000);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const formatTime = (isoString: string) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex bg-[#0E1015] min-h-screen text-white overflow-hidden">
      <Sidebar />

      <div className="flex-1 pt-6 px-4 md:px-8 overflow-y-auto h-screen pb-12 custom-scrollbar">
        
        <div className="flex items-center gap-4 mb-6">
          <button 
            onClick={() => router.back()} 
            className="w-10 h-10 rounded-xl bg-[#111319] border border-white/5 hover:bg-white/5 flex items-center justify-center text-[#8F95A3] hover:text-white transition-all shadow-sm cursor-pointer"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-2xl font-black text-white">Community Chat & Support</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* LEFT COLUMN: CHAT INTERFACE (STICKY TO PREVENT BLANK SPACE AT BOTTOM) */}
          <div className="lg:col-span-8 sticky top-6 flex flex-col bg-[#111319] border border-white/5 rounded-[24px] h-[calc(100vh-120px)] shadow-lg overflow-hidden relative shrink-0">
            
            {showContactForm ? (
              /* CONTACT FORM VIEW */
              <div className="flex flex-col h-full bg-[#111319]">
                <div className="px-6 py-5 border-b border-white/5 bg-[#14171F] flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#8B5CF6]/10 flex items-center justify-center text-[#8B5CF6] border border-[#8B5CF6]/20">
                      <Mail className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-base font-black text-white">Support Contact Form</h2>
                      <p className="text-[#8F95A3] text-xs font-medium">We usually reply within 24 hours</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowContactForm(false)}
                    className="text-xs font-bold px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-[#8F95A3] hover:text-white transition-all cursor-pointer border border-white/5"
                  >
                    Back to Chat
                  </button>
                </div>

                <div className="p-6 flex-1 overflow-y-auto custom-scrollbar flex flex-col justify-center max-w-xl mx-auto w-full">
                  {contactSuccess ? (
                    <div className="bg-[#00E57A]/10 border border-[#00E57A]/30 rounded-2xl p-6 text-center space-y-3">
                      <CheckCircle2 className="w-12 h-12 text-[#00E57A] mx-auto animate-bounce" />
                      <h3 className="text-lg font-black text-white">Message Sent Successfully!</h3>
                      <p className="text-xs text-[#8F95A3]">Our team has received your request and will get back to you soon.</p>
                      <button 
                        onClick={() => setShowContactForm(false)} 
                        className="mt-4 px-6 py-2.5 rounded-xl bg-[#00E57A] text-[#0E1015] font-black text-xs cursor-pointer"
                      >
                        Return to Global Chat
                      </button>
                    </div>
                  ) : (
                    <form onSubmit={handleContactSubmit} className="space-y-4 w-full">
                      <div>
                        <label className="block text-xs font-bold text-[#8F95A3] uppercase tracking-wider mb-2">Subject / Issue Type</label>
                        <input 
                          type="text" 
                          required
                          value={contactSubject}
                          onChange={(e) => setContactSubject(e.target.value)}
                          placeholder="e.g., Missing reward from offer" 
                          className="w-full bg-[#0E1015] border border-white/10 text-white text-sm rounded-xl px-4 py-3.5 focus:border-[#8B5CF6] outline-none transition-all placeholder:text-[#8F95A3]/50"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#8F95A3] uppercase tracking-wider mb-2">Describe Your Issue</label>
                        <textarea 
                          required
                          rows={5}
                          value={contactMsg}
                          onChange={(e) => setContactMsg(e.target.value)}
                          placeholder="Provide details about your query..." 
                          className="w-full bg-[#0E1015] border border-white/10 text-white text-sm rounded-xl p-4 focus:border-[#8B5CF6] outline-none transition-all placeholder:text-[#8F95A3]/50 resize-none"
                        />
                      </div>
                      <button 
                        type="submit"
                        disabled={isSubmittingContact}
                        className="w-full py-4 rounded-xl bg-gradient-to-r from-[#8B5CF6] to-[#7c3aed] text-white font-bold text-sm shadow-[0_4px_20px_rgba(139,92,246,0.4)] hover:scale-[1.01] transition-all cursor-pointer flex items-center justify-center gap-2"
                      >
                        {isSubmittingContact ? (
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <>Submit Support Ticket</>
                        )}
                      </button>
                    </form>
                  )}
                </div>
              </div>
            ) : (
              /* GLOBAL ROOM CHAT VIEW */
              <>
                <div className="px-6 py-5 border-b border-white/5 bg-[#14171F] flex items-center justify-between shrink-0">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-[#8B5CF6]/10 flex items-center justify-center text-[#8B5CF6] border border-[#8B5CF6]/20">
                      <MessageSquare className="w-6 h-6" />
                    </div>
                    <div>
                      <h2 className="text-lg font-black text-white leading-tight">Global Room</h2>
                      <p className="text-[#8F95A3] text-[13px] font-medium">Chat with other earners</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 bg-[#00E57A]/10 border border-[#00E57A]/20 px-3 py-1.5 rounded-full">
                    <span className="w-2 h-2 rounded-full bg-[#00E57A] shadow-[0_0_8px_rgba(0,229,122,0.8)] animate-pulse"></span>
                    <span className="text-[#00E57A] text-xs font-bold uppercase tracking-wider">Online</span>
                  </div>
                </div>

                {/* CHAT MESSAGES */}
                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-[#0E1015]/30 flex flex-col gap-6">
                  {isLoading ? (
                    <div className="flex justify-center items-center h-full">
                      <div className="w-8 h-8 border-2 border-[#8B5CF6] border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="flex justify-center items-center h-full text-[#8F95A3] text-sm">
                      Be the first to send a message!
                    </div>
                  ) : (
                    messages.map((msg, index) => {
                      const isMe = String(msg.userId) === String(currentUserId) || msg.userName === 'You';
                      const fallbackAvatar = `https://ui-avatars.com/api/?name=${(msg.userName || 'User').replace(/\s+/g, '+')}&background=8B5CF6&color=fff`;
                      
                      let avatarUrl = fallbackAvatar;
                      if (msg.image) {
                        const fixedImageUrl = msg.image
                          .replace('api.binnycash.com', 'apitest.binnycash.com')
                          .replace('api.binycash.com', 'apitest.binnycash.com')
                          .replace('binycash.com', 'binnycash.com');
                        avatarUrl = fixedImageUrl.startsWith('http') ? fixedImageUrl : `https://apitest.binnycash.com${fixedImageUrl}`;
                      }

                      return (
                        <div key={msg._id || index} className={`flex gap-3 ${isMe ? 'justify-end' : 'justify-start'}`}>
                          {!isMe && (
                            <div className="w-10 h-10 rounded-full bg-[#1A1C24] border border-white/10 shrink-0 overflow-hidden mt-4">
                              <img src={avatarUrl} alt={msg.userName} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.src = fallbackAvatar; }} />
                            </div>
                          )}
                          <div className="flex flex-col max-w-[75%]">
                            <div className={`flex items-center gap-2 mb-1 ${isMe ? 'justify-end' : 'justify-start ml-1'}`}>
                              <span className="text-[11px] font-bold text-[#8F95A3]">{isMe ? 'You' : msg.userName || `User ${msg.userId}`}</span>
                            </div>
                            <div className={`p-4 text-[14px] font-medium leading-relaxed whitespace-pre-wrap break-words ${
                              isMe ? 'bg-gradient-to-br from-[#8B5CF6] to-[#7c3aed] text-white rounded-[20px] rounded-tr-sm shadow-[0_4px_15px_rgba(139,92,246,0.3)]' : 'bg-[#1A1C24] text-[#E2E8F0] border border-white/5 rounded-[20px] rounded-tl-sm shadow-sm'
                            }`}>
                              {msg.message}
                            </div>
                            <div className={`flex items-center gap-1 text-[10px] text-[#8F95A3] mt-1 ${isMe ? 'justify-end mr-1' : 'justify-start ml-1'}`}>
                              {formatTime(msg.timestamp || msg.createdAt)}
                              {isMe && <CheckCheck className="w-3.5 h-3.5 text-[#00E57A]" />}
                            </div>
                          </div>
                          {isMe && (
                            <div className="w-10 h-10 rounded-full bg-[#1A1C24] border border-[#8B5CF6]/30 shrink-0 overflow-hidden mt-4">
                              <img src={fallbackAvatar} alt="You" className="w-full h-full object-cover" />
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* INPUT BAR */}
                <div className="p-4 bg-[#14171F] border-t border-white/5 shrink-0">
                  <form onSubmit={handleSendMessage} className="relative flex items-center gap-3">
                    <div className="relative flex-1">
                      <input 
                        type="text" 
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type your message..." 
                        className="w-full bg-[#0E1015] border border-white/10 text-white text-[14px] rounded-xl pl-4 pr-4 py-4 focus:ring-1 focus:ring-[#8B5CF6]/50 focus:border-[#8B5CF6]/50 outline-none transition-all placeholder:text-[#8F95A3]"
                      />
                    </div>
                    <button 
                      type="submit" 
                      disabled={!newMessage.trim()}
                      className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#8B5CF6] to-[#7c3aed] flex items-center justify-center text-white shadow-[0_4px_15px_rgba(139,92,246,0.4)] disabled:opacity-50 disabled:cursor-not-allowed hover:scale-105 transition-all shrink-0 cursor-pointer"
                    >
                      <Send className="w-5 h-5 ml-[-2px]" />
                    </button>
                  </form>
                </div>
              </>
            )}
          </div>

          {/* RIGHT COLUMN: HELP CENTER & CONTACT INFO */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            
            <div className="bg-[#111319] border border-white/5 rounded-[24px] p-6 relative overflow-hidden shadow-lg group shrink-0">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#8B5CF6]/20 blur-[50px] rounded-full translate-x-1/3 -translate-y-1/3 group-hover:bg-[#8B5CF6]/30 transition-colors"></div>
              
              <div className="flex items-start justify-between relative z-10">
                <div className="pr-4">
                  <h3 className="text-lg font-black text-white flex items-center gap-2 mb-2">
                    <MessageSquare className="w-5 h-5 text-[#8B5CF6]" /> Need Help?
                  </h3>
                  <p className="text-[13px] text-[#8F95A3] leading-relaxed font-medium">
                    Our support team is here to help you with any issues or questions.
                  </p>
                </div>
                <div className="w-16 h-16 shrink-0 relative">
                  <div className="absolute inset-0 bg-[#8B5CF6]/20 rounded-full blur-xl"></div>
                  <Headset className="w-full h-full text-[#8B5CF6] relative z-10 drop-shadow-[0_0_15px_rgba(139,92,246,0.6)]" />
                </div>
              </div>
            </div>

            <div className="bg-[#111319] border border-white/5 rounded-[24px] p-5 shadow-lg shrink-0">
              <h3 className="text-[15px] font-black text-white flex items-center gap-2 mb-4">
                <MessageSquare className="w-4 h-4 text-[#8B5CF6]" /> Quick Help
              </h3>
              
              <div className="flex flex-col gap-2">
                {[
                  { icon: MessageSquare, title: 'How do I earn?', desc: 'Learn how to start earning' },
                  { icon: AlertCircle, title: 'Reward Issues', desc: 'Help with missing rewards' },
                  { icon: Wallet, title: 'Payouts', desc: 'Questions about payments' },
                  { icon: User, title: 'Account Help', desc: 'Manage your account' }
                ].map((item, i) => (
                  <button key={i} className="flex items-center justify-between p-3.5 rounded-xl hover:bg-[#1A1C24] border border-transparent hover:border-white/5 transition-all text-left group cursor-pointer">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-[#1A1C24] border border-white/5 flex items-center justify-center group-hover:bg-[#8B5CF6]/10 group-hover:text-[#8B5CF6] transition-colors text-[#8F95A3]">
                        <item.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-[14px] font-bold text-white mb-0.5">{item.title}</h4>
                        <p className="text-[11px] text-[#8F95A3] font-medium">{item.desc}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-[#8F95A3] group-hover:text-white transition-colors" />
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-[#111319] border border-white/5 rounded-[24px] p-5 shadow-lg shrink-0">
              <h3 className="text-[15px] font-black text-white flex items-center gap-2 mb-4">
                <Headset className="w-4 h-4 text-[#8B5CF6]" /> Contact Info
              </h3>
              
              <div className="flex flex-col gap-5 mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#1A1C24] flex items-center justify-center text-[#8B5CF6]">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-[13px] font-bold text-white">Email</h4>
                    <p className="text-[12px] text-[#8F95A3]">support@binnycash.com</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#1A1C24] flex items-center justify-center text-[#8B5CF6]">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-[13px] font-bold text-white">Average Reply Time</h4>
                    <p className="text-[12px] text-[#8F95A3]">2 - 5 minutes</p>
                  </div>
                </div>

                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-[#1A1C24] flex items-center justify-center text-[#00E57A]">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-[13px] font-bold text-white">Available</h4>
                    <p className="text-[12px] text-[#8F95A3]">24/7 All Days</p>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setShowContactForm(!showContactForm)}
                className="w-full flex items-center justify-center py-3.5 rounded-xl border border-[#8B5CF6]/30 bg-[#8B5CF6]/10 text-[#8B5CF6] hover:bg-[#8B5CF6] hover:text-white font-bold text-sm transition-all text-center cursor-pointer"
              >
                {showContactForm ? 'Back to Global Chat' : 'Open Contact Form'}
              </button>
            </div>

          </div>
        </div>

      </div>
      
      <style dangerouslySetInnerHTML={{__html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.05); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(139, 92, 246, 0.3); }
      `}} />
    </div>
  );
}