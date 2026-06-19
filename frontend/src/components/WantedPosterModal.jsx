import { motion, AnimatePresence } from 'framer-motion';
import { X, Printer, Download } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { toPng } from 'html-to-image';
import { useRef, useState } from 'react';

export const WantedPosterModal = ({ isOpen, onClose, item }) => {
  const posterRef = useRef(null);
  const [isGenerating, setIsGenerating] = useState(false);

  if (!isOpen) return null;

  const handleDownload = async () => {
    if (!posterRef.current) return;
    setIsGenerating(true);
    try {
      const dataUrl = await toPng(posterRef.current, {
        cacheBust: true,
        backgroundColor: '#ffffff',
        pixelRatio: 2 // High resolution
      });
      const link = document.createElement('a');
      link.download = `WANTED_${item.title.replace(/\s+/g, '_')}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to generate poster', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const itemUrl = `${window.location.origin}`;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-start justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="relative w-full max-w-2xl flex flex-col items-center my-8"
        >
          {/* Controls */}
          <div className="w-full flex justify-between items-center mb-6 bg-[var(--color-surface)] p-4 border-4 border-black shadow-[6px_6px_0_0_#000] rotate-1">
            <h3 className="text-black font-black text-2xl uppercase tracking-wider">Poster Preview</h3>
            <div className="flex gap-4 items-center">
              <button 
                onClick={handleDownload}
                disabled={isGenerating}
                className="flex items-center gap-2 px-8 py-3 bg-[#FFD500] hover:bg-[#00E5FF] text-black font-black text-xl uppercase border-4 border-black shadow-[4px_4px_0_0_#000] hover:shadow-[2px_2px_0_0_#000] hover:translate-y-1 transition-all disabled:opacity-50"
              >
                {isGenerating ? 'Saving...' : <><Download size={28} strokeWidth={3} /> Download PDF / PNG</>}
              </button>
              <button onClick={onClose} className="p-3 text-black bg-white hover:bg-[#FF3366] hover:text-white border-4 border-black shadow-[4px_4px_0_0_#000] hover:shadow-[2px_2px_0_0_#000] hover:translate-y-1 transition-all rounded-full">
                <X size={24} strokeWidth={4} />
              </button>
            </div>
          </div>

          {/* The Poster (Hidden from layout flow if we want, but better to show it so they preview it) */}
          <div 
            ref={posterRef}
            className="w-[600px] bg-white text-black p-8 relative flex flex-col shadow-2xl"
            style={{ 
              fontFamily: '"Fredoka", sans-serif',
              border: '12px solid #000',
              backgroundImage: 'radial-gradient(circle, #000 1.5px, transparent 1.5px)',
              backgroundSize: '24px 24px',
              backgroundColor: '#f4f4f0'
            }}
          >
            {/* Header */}
            <div className="text-center bg-black text-white py-6 px-4 border-8 border-black -rotate-2 mb-8 shadow-[8px_8px_0_0_#FF3366]">
              <h1 className="text-6xl font-black uppercase tracking-widest leading-none mb-2" style={{ textShadow: '4px 4px 0 #00E5FF' }}>
                WANTED
              </h1>
              <h2 className="text-3xl font-bold uppercase tracking-wide text-[#FFD500]">
                {item.item_type === 'lost' ? 'LOST ITEM' : 'FOUND ITEM'}
              </h2>
            </div>

            {/* Image Box */}
            <div className="bg-white border-8 border-black p-4 mb-8 shadow-[8px_8px_0_0_#000] rotate-1 relative">
              <img 
                src={item.image_url} 
                alt="Item" 
                crossOrigin="anonymous"
                className="w-full h-64 object-cover border-4 border-black"
              />
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-32 h-12 bg-white/50 backdrop-blur-sm border-2 border-black/20 rotate-3 z-20 shadow-sm" />
            </div>

            {/* Details */}
            <div className="bg-white border-8 border-black p-6 mb-8 shadow-[8px_8px_0_0_#000] -rotate-1">
              <h3 className="text-4xl font-black uppercase mb-4 text-center line-clamp-1">{item.title}</h3>
              <div className="text-xl font-bold mb-4 space-y-2">
                {item.location_name && (
                  <p className="flex items-center gap-2"><strong className="text-[#FF3366]">Last Seen:</strong> {item.location_name}</p>
                )}
                <p className="flex items-center gap-2"><strong className="text-[#FF3366]">Date:</strong> {new Date(item.created_at).toLocaleDateString()}</p>
              </div>
              {item.description && (
                <div className="p-4 bg-[#FFD500] border-4 border-black font-medium text-lg leading-snug text-black">
                  "{item.description}"
                </div>
              )}
            </div>

            {/* Footer / QR Code */}
            <div className="mt-auto flex items-center justify-between bg-white border-8 border-black p-6 shadow-[8px_8px_0_0_#00E5FF] rotate-1">
              <div className="flex-1 pr-6">
                <h4 className="text-3xl font-black uppercase mb-2">Help Us Out!</h4>
                <p className="text-xl font-bold leading-tight">
                  Scan the QR code to view this item on the Retriever platform and chat with the owner!
                </p>
              </div>
              <div className="bg-white p-2 border-4 border-black shrink-0">
                <QRCodeSVG value={itemUrl} size={120} level="H" fgColor="#000000" />
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
