import { motion } from 'framer-motion';
import { MapPin, Calendar, Tag } from 'lucide-react';
import { useState } from 'react';

export const ItemCard = ({ item }) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  const date = new Date(item.created_at).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric'
  });

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -5 }}
      transition={{ duration: 0.3 }}
      className="overflow-hidden rounded-2xl glass-panel group relative flex flex-col"
    >
      <div className="absolute top-3 left-3 z-10 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white bg-black/50 backdrop-blur-md rounded-full border border-white/10">
        {item.item_type}
      </div>
      <div className="absolute top-3 right-3 z-10 px-3 py-1 text-xs font-medium text-[#c084fc] bg-[#aa3bff]/20 backdrop-blur-md rounded-full border border-[#aa3bff]/30">
        {item.status}
      </div>

      <div className="relative w-full h-48 bg-white/5 overflow-hidden shrink-0">
        {!imageLoaded && (
          <div className="absolute inset-0 flex items-center justify-center animate-pulse bg-white/5"></div>
        )}
        <img 
          src={item.image_url} 
          alt={item.title} 
          onLoad={() => setImageLoaded(true)}
          className={`object-cover w-full h-full transition-all duration-500 group-hover:scale-105 ${imageLoaded ? 'opacity-100 blur-0' : 'opacity-0 blur-sm'}`}
          loading="lazy"
        />
      </div>

      <div className="p-5 flex flex-col flex-1">
        <h3 className="text-xl font-bold text-white mb-2 line-clamp-1">{item.title}</h3>
        <p className="text-gray-400 text-sm mb-4 line-clamp-2">{item.description}</p>
        
        <div className="space-y-2 mb-4">
          {item.location_name && (
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <MapPin size={16} className="text-[#aa3bff] shrink-0" />
              <span className="truncate">{item.location_name}</span>
            </div>
          )}
          <div className="flex items-center gap-2 text-sm text-gray-300">
            <Calendar size={16} className="text-[#aa3bff] shrink-0" />
            <span>{date}</span>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mt-auto pt-4 border-t border-white/10">
          {item.ai_tags && Object.entries(item.ai_tags).map(([key, val]) => (
            val && val !== 'Unknown' && (
              <div key={key} className="flex items-center gap-1 px-2 py-1 text-xs text-gray-300 bg-white/5 rounded-md border border-white/5">
                <Tag size={12} className="text-gray-500" />
                <span>{val}</span>
              </div>
            )
          ))}
        </div>
      </div>
    </motion.div>
  );
};
