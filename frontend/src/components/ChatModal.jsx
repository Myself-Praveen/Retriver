import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, MessageCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export const ChatModal = ({ isOpen, onClose, item }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const ws = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen && item) {
      const itemId = item._id || item.id;
      // Fetch history
      api.get(`/chat/${itemId}/history`)
        .then(res => {
          setMessages(res.data);
        })
        .catch(err => console.error("Failed to fetch history:", err));

      // Connect to WebSocket
      const wsUrl = `ws://localhost:8000/api/chat/ws/${itemId}`;
      ws.current = new WebSocket(wsUrl);
      
      ws.current.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.message) {
          setMessages(prev => [...prev, JSON.parse(data.message)]);
        }
      };

      return () => {
        ws.current?.close();
      };
    }
  }, [isOpen, item]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!input.trim() || !ws.current) return;

    const msg = {
      text: input,
      sender: user?.name || 'Anonymous',
      timestamp: new Date().toISOString()
    };

    ws.current.send(JSON.stringify(msg));
    setInput('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-md h-[500px] flex flex-col overflow-hidden comic-panel bg-[var(--color-surface)] rotate-1"
          >
            {/* Header */}
            <div className="p-4 border-b-4 border-[var(--color-border)] flex items-center justify-between bg-[var(--color-primary)]">
              <div className="flex items-center gap-2">
                <MessageCircle size={24} strokeWidth={3} className="text-[var(--color-text)]" />
                <h3 className="font-black text-[var(--color-text)] text-xl uppercase shadow-black drop-shadow-[2px_2px_0_var(--color-shadow)]">Chat: {item?.title}</h3>
              </div>
              <button onClick={onClose} className="p-2 text-[var(--color-text)] hover:text-white hover:bg-black transition-colors rounded-xl border-2 border-transparent hover:border-[var(--color-border)]">
                <X size={24} strokeWidth={3} />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-[#f0f0f0]">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-[var(--color-text)]/40">
                  <MessageCircle size={48} strokeWidth={2} className="mb-4" />
                  <p className="font-black text-lg">No messages yet. Say hello!</p>
                </div>
              ) : (
                messages.map((msg, idx) => {
                  const isMe = msg.sender === user?.name;
                  return (
                    <div key={idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                      <span className="text-sm font-bold text-[var(--color-text)]/50 mb-1 px-1">{msg.sender}</span>
                      <div className={`px-4 py-3 border-4 border-[var(--color-border)] shadow-[4px_4px_0_0_var(--color-shadow)] max-w-[80%] font-bold text-[var(--color-text)] text-md ${isMe ? 'bg-[var(--color-secondary)] rounded-2xl rounded-tr-none' : 'bg-[var(--color-accent)] rounded-2xl rounded-tl-none'}`}>
                        {msg.text}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={sendMessage} className="p-4 border-t-4 border-[var(--color-border)] bg-[var(--color-surface)] flex gap-3">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 px-4 py-3 comic-input font-bold text-[var(--color-text)]"
              />
              <button 
                type="submit"
                disabled={!input.trim()}
                className="px-6 py-3 comic-button bg-[var(--color-primary)] text-white flex items-center justify-center hover:bg-black disabled:opacity-50"
              >
                <Send size={24} strokeWidth={3} />
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
