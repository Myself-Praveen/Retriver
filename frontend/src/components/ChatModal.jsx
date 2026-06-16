import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, MessageCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const ChatModal = ({ isOpen, onClose, item }) => {
  const { user } = useAuth();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const ws = useRef(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen && item) {
      // Connect to WebSocket
      const wsUrl = `ws://localhost:8000/api/chat/ws/${item._id || item.id}`;
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
            className="relative w-full max-w-md h-[500px] flex flex-col overflow-hidden rounded-2xl glass-panel"
          >
            {/* Header */}
            <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/5">
              <div className="flex items-center gap-2">
                <MessageCircle size={20} className="text-[#aa3bff]" />
                <h3 className="font-bold text-white">Chat about {item?.title}</h3>
              </div>
              <button onClick={onClose} className="p-2 text-gray-400 hover:text-white transition-colors rounded-full hover:bg-white/10">
                <X size={20} />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-500">
                  <MessageCircle size={40} className="mb-2 opacity-50" />
                  <p>No messages yet. Say hello!</p>
                </div>
              ) : (
                messages.map((msg, idx) => {
                  const isMe = msg.sender === user?.name;
                  return (
                    <div key={idx} className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}>
                      <span className="text-xs text-gray-500 mb-1 px-1">{msg.sender}</span>
                      <div className={`px-4 py-2 rounded-2xl max-w-[80%] ${isMe ? 'bg-[#aa3bff] text-white rounded-tr-none' : 'bg-white/10 text-gray-200 rounded-tl-none'}`}>
                        {msg.text}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <form onSubmit={sendMessage} className="p-4 border-t border-white/10 bg-white/5 flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type a message..."
                className="flex-1 px-4 py-2 rounded-xl glass-input"
              />
              <button 
                type="submit"
                disabled={!input.trim()}
                className="p-3 bg-[#aa3bff] hover:bg-[#912bd9] text-white rounded-xl transition-colors disabled:opacity-50"
              >
                <Send size={18} />
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
