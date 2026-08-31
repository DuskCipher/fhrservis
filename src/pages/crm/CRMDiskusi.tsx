import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, Users, Clock, CheckCircle } from 'lucide-react';
import { DiscussionMessage } from '../../types';
import { subscribeToDiscussion, sendDiscussionMessage } from '../../lib/firestoreService';
import { supabase } from '../../lib/supabase';

export function CRMDiskusi() {
  const [messages, setMessages] = useState<DiscussionMessage[]>([]);
  const [newMsg, setNewMsg] = useState('');
  const [sending, setSending] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const u = subscribeToDiscussion(msgs => { setMessages(msgs); });
    
    // Get initial Supabase user
    supabase.auth.getUser().then(({ data: { user } }) => {
      setCurrentUser(user || { id: 'admin-local', email: 'admin@fhrcar.xyz', user_metadata: { name: 'Admin FHR' } });
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setCurrentUser(session?.user || { id: 'admin-local', email: 'admin@fhrcar.xyz', user_metadata: { name: 'Admin FHR' } });
    });

    return () => {
      u();
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!newMsg.trim()) return;
    setSending(true);
    const displayName = currentUser?.user_metadata?.name || currentUser?.email?.split('@')[0] || 'Admin';
    await sendDiscussionMessage({
      senderId: currentUser?.id || 'admin-local',
      senderName: displayName,
      message: newMsg.trim(),
    });
    setNewMsg('');
    setSending(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const formatTime = (iso: string) => {
    try { return new Date(iso).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }); }
    catch { return ''; }
  };

  const formatDate = (iso: string) => {
    try {
      const d = new Date(iso);
      const today = new Date();
      const yesterday = new Date(); yesterday.setDate(yesterday.getDate() - 1);
      if (d.toDateString() === today.toDateString()) return 'Hari Ini';
      if (d.toDateString() === yesterday.toDateString()) return 'Kemarin';
      return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
    } catch { return ''; }
  };

  // Group messages by date
  const grouped: { date: string; msgs: DiscussionMessage[] }[] = [];
  messages.forEach(m => {
    const dateLabel = formatDate(m.createdAt);
    const last = grouped[grouped.length - 1];
    if (last && last.date === dateLabel) { last.msgs.push(m); }
    else { grouped.push({ date: dateLabel, msgs: [m] }); }
  });

  const myId = currentUser?.uid;

  const AVATAR_COLORS = ['bg-red-500', 'bg-blue-500', 'bg-emerald-500', 'bg-purple-500', 'bg-amber-500', 'bg-pink-500'];
  const getColor = (uid: string) => AVATAR_COLORS[Math.abs(uid.split('').reduce((s, c) => s + c.charCodeAt(0), 0)) % AVATAR_COLORS.length];

  return (
    <div className="flex flex-col h-full font-sans bg-[#f4f6fb]" style={{ minHeight: 'calc(100vh - 56px)' }}>
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center gap-3 flex-shrink-0 shadow-xs">
        <div className="w-10 h-10 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center">
          <MessageSquare size={20} />
        </div>
        <div>
          <h1 className="text-base font-black text-slate-900">Diskusi Tim Internal</h1>
          <p className="text-xs text-slate-500">Chat real-time seluruh staf FHR Car Service</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-full">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-[11px] font-bold text-emerald-700">Online</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 sm:px-8 py-4 space-y-6">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center py-20">
            <MessageSquare size={48} className="text-slate-300" />
            <p className="font-bold text-slate-500">Belum ada pesan. Jadilah yang pertama!</p>
            <p className="text-xs text-slate-400">Tekan Enter untuk mengirim pesan</p>
          </div>
        )}
        {grouped.map(group => (
          <div key={group.date}>
            {/* Date separator */}
            <div className="flex items-center gap-3 my-4">
              <div className="flex-1 h-px bg-slate-200" />
              <span className="text-[11px] font-bold text-slate-400 px-3 py-1 bg-slate-100 rounded-full">{group.date}</span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>
            <div className="space-y-3">
              {group.msgs.map(msg => {
                const isMe = msg.userId === myId;
                return (
                  <div key={msg.id} className={`flex items-end gap-2.5 ${isMe ? 'flex-row-reverse' : 'flex-row'}`}>
                    {/* Avatar */}
                    {!isMe && (
                      <div className={`w-8 h-8 rounded-full ${getColor(msg.userId)} text-white font-black text-xs flex items-center justify-center flex-shrink-0 shadow-xs`}>
                        {msg.userInitial}
                      </div>
                    )}
                    <div className={`max-w-[70%] ${isMe ? 'items-end' : 'items-start'} flex flex-col gap-0.5`}>
                      {!isMe && <span className="text-[11px] font-bold text-slate-500 px-1">{msg.userName}</span>}
                      <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-xs ${
                        isMe
                          ? 'bg-red-600 text-white rounded-br-sm'
                          : 'bg-white text-slate-800 border border-slate-200 rounded-bl-sm'
                      }`}>
                        {msg.message}
                      </div>
                      <span className={`text-[10px] text-slate-400 px-1 ${isMe ? 'text-right' : ''}`}>{formatTime(msg.createdAt)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input Area */}
      <div className="bg-white border-t border-slate-200 px-4 sm:px-8 py-4 flex-shrink-0 shadow-xs">
        <div className="flex items-end gap-3 max-w-4xl mx-auto">
          <div className="flex-1 bg-slate-50 border border-slate-200 rounded-2xl px-4 py-2.5 focus-within:border-red-400 focus-within:ring-2 focus-within:ring-red-100 transition-all">
            <textarea
              value={newMsg}
              onChange={e => setNewMsg(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Tulis pesan... (Enter untuk kirim)"
              rows={1}
              className="w-full text-sm bg-transparent outline-none resize-none text-slate-800 placeholder-slate-400"
              style={{ maxHeight: '120px' }}
            />
          </div>
          <button
            onClick={handleSend}
            disabled={!newMsg.trim() || sending}
            className="w-11 h-11 rounded-2xl bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-md shadow-red-600/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
          >
            {sending ? <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Send size={16} />}
          </button>
        </div>
        <p className="text-[10px] text-slate-400 text-center mt-2">Pesan dikirim ke semua staf secara real-time</p>
      </div>
    </div>
  );
}
