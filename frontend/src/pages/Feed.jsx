import { useState, useEffect } from 'react';
import { Search, MapPin, FilterX, Ghost } from 'lucide-react';
import api from '../api/axios';
import { ItemCard } from '../components/ItemCard';
import { SkeletonCard } from '../components/SkeletonCard';
import { motion } from 'framer-motion';

export const Feed = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [useLocation, setUseLocation] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [locationError, setLocationError] = useState('');

  // Debounced Search effect
  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchItems();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, useLocation, userLocation]);

  const fetchItems = async () => {
    setLoading(true);
    try {
      let endpoint = '/search/feed';
      let params = {};

      if (searchQuery.trim().length > 0) {
        endpoint = '/search/text';
        params.q = searchQuery;
      } else if (useLocation && userLocation) {
        endpoint = '/search/nearby';
        params.longitude = userLocation.lng;
        params.latitude = userLocation.lat;
        params.radius = 5000; // 5km radius
      }

      const response = await api.get(endpoint, { params });
      setItems(response.data.results || []);
    } catch (err) {
      console.error("Failed to fetch items", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleLocation = () => {
    if (useLocation) {
      setUseLocation(false);
      setUserLocation(null);
    } else {
      if (!navigator.geolocation) {
        setLocationError("Geolocation is not supported by your browser");
        return;
      }
      
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setUseLocation(true);
          setLocationError("");
        },
        () => {
          setLocationError("Unable to retrieve your location");
        }
      );
    }
  };

  return (
    <div className="space-y-8">
      {/* Search Header */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="w-full md:w-1/2 relative">
          <Search size={28} strokeWidth={3} className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text)]" />
          <input 
            type="text"
            placeholder="Search for lost keys, phones, bags..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-14 pr-4 py-4 comic-input text-xl font-black placeholder-black/40"
          />
        </div>
        
        <div className="flex gap-3">
          <button 
            onClick={toggleLocation}
            className={`flex items-center gap-2 px-6 py-4 font-black text-[var(--color-text)] border-4 border-[var(--color-border)] rounded-2xl shadow-[4px_4px_0_0_var(--color-shadow)] hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_0_var(--color-shadow)] transition-all text-lg ${
              useLocation 
                ? 'bg-[var(--color-primary)] text-white -rotate-2' 
                : 'bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)]'
            }`}
          >
            <MapPin size={24} strokeWidth={3} />
            {useLocation ? 'Nearby Active!' : 'Find Nearby'}
          </button>
          
          {(searchQuery || useLocation) && (
            <button 
              onClick={() => {
                setSearchQuery('');
                setUseLocation(false);
                setUserLocation(null);
              }}
              className="flex items-center gap-2 px-5 py-4 font-black text-white bg-black border-4 border-[var(--color-border)] rounded-2xl shadow-[4px_4px_0_0_var(--color-shadow)] transition-all hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0_0_var(--color-shadow)] text-lg rotate-2"
            >
              <FilterX size={24} strokeWidth={3} />
              Clear
            </button>
          )}
        </div>
      </div>

      {locationError && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-[var(--color-text)] font-black text-lg bg-[var(--color-primary)] p-4 comic-panel border-[var(--color-border)] flex items-center gap-2"
        >
          <Ghost size={24} strokeWidth={3} /> {locationError}
        </motion.div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
        {loading ? (
          Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
        ) : items.length > 0 ? (
          items.map((item) => (
            <ItemCard key={item._id || item.id} item={item} />
          ))
        ) : (
          <div className="col-span-full py-32 text-center comic-panel bg-[var(--color-accent)] relative overflow-hidden">
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              className="w-32 h-32 mx-auto mb-6 rounded-full border-4 border-[var(--color-border)] bg-[var(--color-surface)] flex items-center justify-center shadow-[6px_6px_0_0_var(--color-shadow)] -rotate-6"
            >
              <Ghost size={64} strokeWidth={2} className="text-[var(--color-text)]" />
            </motion.div>
            <h3 className="text-4xl font-black text-[var(--color-text)] mb-3 uppercase tracking-wide">It's a Ghost Town!</h3>
            <p className="text-2xl font-bold text-[var(--color-text)]/70">No items found. Try adjusting your search filters.</p>
            
            {/* Background decorations */}
            <div className="absolute top-10 left-10 text-[var(--color-text)]/10 -rotate-12"><Search size={100} /></div>
            <div className="absolute bottom-10 right-10 text-[var(--color-text)]/10 rotate-12"><MapPin size={100} /></div>
          </div>
        )}
      </div>
    </div>
  );
};
