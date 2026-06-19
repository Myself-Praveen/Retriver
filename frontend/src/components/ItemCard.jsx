import { motion, AnimatePresence } from 'framer-motion';
import { MapPin, Calendar, Tag, Sparkles, X, Check, MessageCircle } from 'lucide-react';
import { useState } from 'react';
import { ChatModal } from './ChatModal';
import { WantedPosterModal } from './WantedPosterModal';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

export const ItemCard = ({ item }) => {
  const { user } = useAuth();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isDescOpen, setIsDescOpen] = useState(false);
  const [isPosterOpen, setIsPosterOpen] = useState(false);
  const [localStatus, setLocalStatus] = useState(item.status || 'open');
  const [isResolving, setIsResolving] = useState(false);

  const isOwner = user?.email === item.finder_email;

  const handleResolve = async () => {
    try {
      setIsResolving(true);
      await api.patch(`/items/${item._id}/resolve`);
      setLocalStatus('resolved');
    } catch (err) {
      console.error('Failed to resolve item:', err);
      alert('Could not mark as resolved.');
    } finally {
      setIsResolving(false);
    }
  };

  const date = new Date(item.created_at).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  });

  // Random rotation for tags to make them look like stickers
  const getRandomRotation = (index) => {
    const rotations = ['-rotate-2', 'rotate-2', '-rotate-3', 'rotate-3', '-rotate-1', 'rotate-1'];
    return rotations[index % rotations.length];
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="overflow-hidden comic-panel relative flex flex-col bg-[var(--color-surface)] group"
    >
      <div className="absolute top-4 left-4 z-10 px-3 py-1.5 text-sm font-black uppercase tracking-wider text-[var(--color-text)] bg-[var(--color-primary)] border-4 border-[var(--color-border)] rounded-xl shadow-[2px_2px_0_0_var(--color-shadow)] -rotate-2 group-hover:rotate-0 transition-transform">
        {item.item_type}
      </div>
      <div className={`absolute top-4 right-4 z-10 px-3 py-1.5 text-sm font-black uppercase tracking-wider text-[var(--color-text)] border-4 border-[var(--color-border)] rounded-xl shadow-[2px_2px_0_0_var(--color-shadow)] rotate-2 group-hover:rotate-0 transition-transform ${localStatus === 'resolved' ? 'bg-[#00E5FF]' : 'bg-[var(--color-secondary)]'}`}>
        {localStatus}
      </div>

      <div className="relative w-full h-56 bg-gray-200 border-b-4 border-[var(--color-border)] overflow-hidden shrink-0">
        {!imageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center animate-pulse bg-gray-300">
             <Sparkles size={32} className="text-gray-400 opacity-50" />
          </div>
        )}
        <img 
          src={item.image_url} 
          alt={item.title} 
          onLoad={() => setImageLoaded(true)}
          className={`object-cover w-full h-full transition-all duration-500 group-hover:scale-105 ${imageLoaded ? 'opacity-100 blur-0' : 'opacity-0 blur-sm'}`}
          loading="lazy"
        />
        {/* Fake tape effect */}
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-24 h-8 bg-[var(--color-surface)]/40 backdrop-blur-sm border-2 border-white/60 rotate-2 z-20 shadow-sm" />
      </div>

      <div className="p-6 flex flex-col flex-1 relative">
        <h3 className="text-2xl font-black text-[var(--color-text)] mb-2 line-clamp-1">{item.title}</h3>
        
        {/* User Description */}
        {item.description && (
          <p className="text-[var(--color-text)]/80 font-medium mb-3 line-clamp-2 text-base">{item.description}</p>
        )}

        {/* AI Description Callout */}
        {item.ai_tags?.description && item.ai_tags.description !== 'Unknown' && (
          <div className="mb-5 relative cursor-pointer group" onClick={() => setIsDescOpen(true)}>
            <div className="absolute -left-2 -top-2 bg-[var(--color-primary)] text-white text-[10px] font-black uppercase px-2 py-0.5 rounded border-2 border-[var(--color-border)] rotate-[-5deg] z-10 shadow-[1px_1px_0_0_var(--color-shadow)] group-hover:scale-110 transition-transform">
              AI Notes
            </div>
            <div className="bg-[var(--color-surface)] border-2 border-dashed border-[var(--color-border)]/30 p-3 pt-4 rounded-xl group-hover:border-[var(--color-border)] group-hover:bg-gray-50 transition-colors">
              <p className="text-sm font-medium text-[var(--color-text)]/80 line-clamp-3 italic">"{item.ai_tags.description}"</p>
              <p className="text-[10px] font-bold text-[var(--color-primary)] mt-1 text-right">Click to read more →</p>
            </div>
          </div>
        )}
        
        <div className="space-y-3 mb-6 font-bold bg-[var(--color-surface-hover)] p-3 rounded-xl border-2 border-[var(--color-border)]/10">
          {item.location_name && (
            <div className="flex items-center gap-3 text-[var(--color-text)]/70">
              <div className="bg-[var(--color-accent)] p-1.5 rounded-lg border-2 border-[var(--color-border)] shadow-[1px_1px_0_0_var(--color-shadow)] -rotate-3">
                <MapPin size={16} strokeWidth={3} className="text-[var(--color-text)] shrink-0" />
              </div>
              <span className="truncate text-sm">{item.location_name}</span>
            </div>
          )}
          <div className="flex items-center gap-3 text-[var(--color-text)]/70">
            <div className="bg-[var(--color-primary)] p-1.5 rounded-lg border-2 border-[var(--color-border)] shadow-[1px_1px_0_0_var(--color-shadow)] rotate-2">
              <Calendar size={16} strokeWidth={3} className="text-[var(--color-text)] shrink-0" />
            </div>
            <span className="text-sm">{date}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-auto pt-5 border-t-4 border-[var(--color-border)] border-dotted">
          {item.ai_tags && Object.entries(item.ai_tags)
            .filter(([key]) => key !== 'description')
            .map(([key, val], index) => (
            val && val !== 'Unknown' && (
              <div key={key} title={val} className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-[var(--color-text)] bg-[var(--color-accent)] border-2 border-[var(--color-border)] rounded-full shadow-[2px_2px_0_0_var(--color-shadow)] ${getRandomRotation(index)} hover:rotate-0 hover:-translate-y-1 transition-transform cursor-default max-w-[220px]`}>
                <Tag size={12} strokeWidth={3} className="shrink-0" />
                <span className="truncate">{val}</span>
              </div>
            )
          ))}
        </div>
        
        {isOwner ? (
          <div className="flex gap-3 mt-6">
            {localStatus !== 'resolved' ? (
              <button 
                onClick={handleResolve}
                disabled={isResolving}
                className="flex-1 py-3 comic-button bg-[#00E5FF] text-[var(--color-text)] border-[var(--color-border)] text-lg hover:bg-[var(--color-surface)] group disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <Check size={20} strokeWidth={3} className="group-hover:scale-110 transition-transform" /> Resolve
              </button>
            ) : (
              <button 
                disabled
                className="flex-1 py-3 comic-button bg-gray-200 text-[var(--color-text)] border-[var(--color-border)] text-lg opacity-50 cursor-not-allowed"
              >
                Closed
              </button>
            )}
            <button 
              onClick={() => setIsChatOpen(true)}
              className="flex-1 py-3 comic-button bg-black text-white border-[var(--color-border)] text-lg hover:bg-[var(--color-primary)] hover:text-[var(--color-text)] group flex items-center justify-center gap-2"
            >
              <MessageCircle size={20} strokeWidth={3} className="group-hover:scale-110 transition-transform" /> Chat
            </button>
          </div>
        ) : (
          localStatus !== 'resolved' && (
            <button 
              onClick={() => setIsChatOpen(true)}
              className="mt-6 w-full py-4 comic-button bg-black text-white border-[var(--color-border)] text-xl hover:bg-[var(--color-primary)] hover:text-[var(--color-text)] group flex items-center justify-center gap-2"
            >
              <MessageCircle size={24} strokeWidth={3} className="group-hover:scale-110 transition-transform" /> Chat with Finder
            </button>
          )
        )}
        
        <button 
          onClick={() => setIsPosterOpen(true)}
          className="mt-4 w-full py-3 comic-button bg-[var(--color-accent)] text-[var(--color-text)] border-[var(--color-border)] text-lg hover:bg-[var(--color-surface)] flex items-center justify-center gap-2 font-black uppercase tracking-wider"
        >
          🖨️ Generate Poster
        </button>
      </div>

      <ChatModal 
        isOpen={isChatOpen} 
        onClose={() => setIsChatOpen(false)} 
        item={item} 
      />

      <WantedPosterModal
        isOpen={isPosterOpen}
        onClose={() => setIsPosterOpen(false)}
        item={item}
      />

      {/* Description Pop-up Modal */}
      <AnimatePresence>
        {isDescOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md flex flex-col overflow-hidden comic-panel bg-yellow-50 -rotate-1"
            >
              <div className="p-4 border-b-4 border-[var(--color-border)] flex items-center justify-between bg-[var(--color-accent)]">
                <div className="flex items-center gap-2">
                  <Sparkles size={24} strokeWidth={3} className="text-[var(--color-text)]" />
                  <h3 className="font-black text-[var(--color-text)] text-xl uppercase shadow-black drop-shadow-[2px_2px_0_var(--color-shadow)]">AI Analysis</h3>
                </div>
                <button onClick={() => setIsDescOpen(false)} className="p-2 text-[var(--color-text)] hover:text-white hover:bg-black transition-colors rounded-xl border-2 border-transparent hover:border-[var(--color-border)]">
                  <X size={24} strokeWidth={3} />
                </button>
              </div>
              <div className="p-6 max-h-[60vh] overflow-y-auto font-medium text-lg leading-relaxed text-[var(--color-text)]">
                {item.ai_tags?.description}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
