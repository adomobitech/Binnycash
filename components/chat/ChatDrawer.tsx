'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, Send, Smile, ShieldCheck, CheckCheck, MessageSquare } from 'lucide-react';
// 🔥 NAYA IMPORT EMOJI PICKER KE LIYE 🔥
import EmojiPicker, { Theme } from 'emoji-picker-react'; 

export default function ChatDrawer({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<any>(null);
  
  // 🔥 EMOJI PICKER STATES 🔥
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Emoji picker ke bahar click karne par usko close karne ka logic
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Jab emoji select ho, usko input box me add karna
  const onEmojiClick = (emojiObject: any) => {
    setNewMessage(prevInput => prevInput + emojiObject.emoji);
  };

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
    if (!isOpen) return;

    const savedId = localStorage.getItem('numericUserId');
    if (savedId) {
      setCurrentUserId(savedId);
    }
    
    fetchMessages();
    
    const interval = setInterval(fetchMessages, 10000);
    return () => clearInterval(interval);
  }, [isOpen]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    const token = localStorage.getItem('token');
    const activeUserId = currentUserId || localStorage.getItem('numericUserId') || '12';

    if (!token) {
      alert("Session expired: Please log in again.");
      return;
    }

    const msgText = newMessage.trim();
    setNewMessage('');
    setShowEmojiPicker(false); // Send karne pe picker band kar do

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

  const formatTime = (isoString: string) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[400]"
          />

          <motion.div
            initial={{ x: '100%', opacity: 0.5 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0.5 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed top-0 right-0 h-[100dvh] w-full max-w-[420px] bg-[#0E1015] border-l border-white/5 shadow-[-20px_0_50px_rgba(0,0,0,0.5)] z-[450] flex flex-col"
          >
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#8B5CF6 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>

            <div className="p-4 border-b border-white/5 flex items-center justify-between bg-[#111319] relative z-10 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#8B5CF6] to-[#6d28d9] flex items-center justify-center relative shadow-[0_0_15px_rgba(139,92,246,0.4)]">
                  <MessageSquare className="w-6 h-6 text-white" />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-[#0E1015] rounded-full flex items-center justify-center">
                    <div className="w-2.5 h-2.5 bg-[#00E57A] rounded-full shadow-[0_0_8px_rgba(0,229,122,0.8)]"></div>
                  </div>
                </div>
                <div className="flex flex-col">
                  <h2 className="text-white font-black text-[17px] leading-tight">BinnyCash Chat</h2>
                  <p className="text-[#8F95A3] text-xs font-medium flex items-center gap-1">
                    Members <span className="text-[#00E57A] font-bold">• Live</span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-[#8F95A3] hover:text-white transition-colors">
                  <Minus className="w-4 h-4" />
                </button>
                <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-[#8F95A3] hover:text-white transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-4 shrink-0 relative z-10">
              <div className="bg-[#14171F] border border-white/5 rounded-2xl p-4 flex items-center gap-4 relative overflow-hidden shadow-lg">
                <div className="absolute top-0 right-0 w-24 h-24 bg-[#8B5CF6]/10 blur-2xl rounded-full pointer-events-none"></div>
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#8B5CF6]/20 to-[#6d28d9]/20 flex items-center justify-center shrink-0 border border-[#8B5CF6]/30">
                  <span className="text-2xl">🤖</span>
                </div>
                <div>
                  <h4 className="text-white font-black text-sm mb-0.5">Welcome to BinnyCash Chat! 👋</h4>
                  <p className="text-[#8F95A3] text-xs leading-relaxed font-medium">We're here to help you earn more and cash out more.</p>
                </div>
              </div>
              
              <div className="flex items-center justify-center mt-6 mb-2">
                <div className="h-px bg-white/5 flex-1"></div>
                <span className="px-4 text-[10px] text-[#8F95A3] font-bold uppercase tracking-widest">Today</span>
                <div className="h-px bg-white/5 flex-1"></div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 pb-4 custom-scrollbar relative z-10 flex flex-col gap-4">
              {isLoading ? (
                <div className="flex justify-center items-center h-full">
                  <div className="w-8 h-8 border-4 border-[#8B5CF6]/20 border-t-[#8B5CF6] rounded-full animate-spin"></div>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col gap-1 items-start max-w-[80%]">
                  <div className="bg-[#1A1C24] text-white border border-white/5 rounded-[20px] rounded-tl-sm p-4 text-sm font-medium shadow-sm">
                    No messages yet. Say hi 👋👋
                  </div>
                  <span className="text-[10px] text-[#8F95A3] ml-1">{formatTime(new Date().toISOString())}</span>
                </div>
              ) : (
                messages.map((msg, index) => {
                  const isMe = String(msg.userId) === String(currentUserId) || msg.userName === 'You';
                  
                  return (
                    <div key={msg._id || index} className={`flex flex-col gap-1 ${isMe ? 'items-end' : 'items-start'} w-full`}>
                      {!isMe && msg.userName && <span className="text-[11px] font-bold text-[#8F95A3] ml-1">{msg.userName}</span>}
                      
                      <div className={`p-3.5 px-4 text-[14px] font-medium leading-relaxed whitespace-pre-wrap break-words max-w-[85%] ${
                        isMe 
                          ? 'bg-gradient-to-br from-[#8B5CF6] to-[#6d28d9] text-white rounded-[20px] rounded-br-sm shadow-[0_4px_15px_rgba(139,92,246,0.3)]' 
                          : 'bg-[#1A1C24] text-[#E2E8F0] border border-white/5 rounded-[20px] rounded-tl-sm shadow-sm'
                      }`}>
                        {msg.message}
                      </div>
                      
                      <div className={`flex items-center gap-1 text-[10px] text-[#8F95A3] mt-0.5 ${isMe ? 'mr-1' : 'ml-1'}`}>
                        {formatTime(msg.timestamp || msg.createdAt)}
                        {isMe && <CheckCheck className="w-3.5 h-3.5 text-[#8B5CF6]" />}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area with Emoji Picker */}
            <div className="p-4 bg-[#111319] border-t border-white/5 relative z-10 pb-safe">
              
              {/* 🔥 EMOJI PICKER INJECTION 🔥 */}
              <AnimatePresence>
                {showEmojiPicker && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    ref={emojiPickerRef}
                    className="absolute bottom-[80px] left-4 z-[500] shadow-2xl rounded-2xl overflow-hidden border border-white/10"
                  >
                    <EmojiPicker 
                      onEmojiClick={onEmojiClick}
                      theme={Theme.DARK} 
                      searchDisabled={true}
                      skinTonesDisabled={true}
                      width={300}
                      height={350}
                    />
                  </motion.div>
                )}
              </AnimatePresence>

              <form onSubmit={handleSendMessage} className="relative flex items-center bg-[#1A1C24] border border-[#8B5CF6]/50 rounded-[20px] p-1.5 focus-within:border-[#8B5CF6] focus-within:ring-1 focus-within:ring-[#8B5CF6]/50 transition-all shadow-[0_0_15px_rgba(139,92,246,0.1)]">
                
                {/* 🔥 EMOJI TOGGLE BUTTON 🔥 */}
                <button 
                  type="button" 
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className={`w-10 h-10 flex items-center justify-center shrink-0 transition-colors ${showEmojiPicker ? 'text-[#8B5CF6]' : 'text-[#8F95A3] hover:text-white'}`}
                >
                  <Smile className="w-5 h-5" />
                </button>

                <input 
                  type="text" 
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Write a message..." 
                  className="flex-1 bg-transparent text-white text-[14px] px-2 outline-none placeholder:text-[#8F95A3]"
                />
                
                <button 
                  type="submit" 
                  disabled={!newMessage.trim()}
                  className="px-5 py-2.5 rounded-[14px] bg-[#8B5CF6] hover:bg-[#7c3aed] flex items-center gap-2 text-white font-bold text-sm shadow-[0_4px_15px_rgba(139,92,246,0.4)] disabled:opacity-50 disabled:cursor-not-allowed transition-all shrink-0"
                >
                  <Send className="w-4 h-4" /> <span className="hidden sm:block">Send</span>
                </button>
              </form>
              <div className="text-center mt-3 text-[11px] text-[#8F95A3] flex items-center justify-center gap-1.5 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-[#00E57A]" /> Your conversations are 100% secure
              </div>
            </div>

          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}