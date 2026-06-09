import { useState, useEffect } from 'react';
import { Search, MapPin, FilterX } from 'lucide-react';
import api from '../api/axios';
import { ItemCard } from '../components/ItemCard';
import { SkeletonCard } from '../components/SkeletonCard';

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
          <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text"
            placeholder="Search by brand, color, or description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-4 rounded-2xl glass-input text-lg shadow-[0_4px_20px_rgba(0,0,0,0.5)]"
          />
        </div>
        
        <div className="flex gap-3">
          <button 
            onClick={toggleLocation}
            className={`flex items-center gap-2 px-5 py-3 rounded-xl transition-all font-medium ${
              useLocation 
                ? 'bg-[#aa3bff] text-white shadow-[0_0_15px_rgba(170,59,255,0.4)] border border-[#aa3bff]' 
                : 'bg-white/5 text-gray-300 border border-white/10 hover:bg-white/10'
            }`}
          >
            <MapPin size={18} />
            {useLocation ? 'Nearby Active' : 'Find Nearby'}
          </button>
          
          {(searchQuery || useLocation) && (
            <button 
              onClick={() => {
                setSearchQuery('');
                setUseLocation(false);
                setUserLocation(null);
              }}
              className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors"
            >
              <FilterX size={18} />
              Clear
            </button>
          )}
        </div>
      </div>

      {locationError && (
        <div className="text-red-400 text-sm bg-red-500/10 p-3 rounded-lg border border-red-500/20">
          {locationError}
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {loading ? (
          Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)
        ) : items.length > 0 ? (
          items.map((item) => (
            <ItemCard key={item._id || item.id} item={item} />
          ))
        ) : (
          <div className="col-span-full py-20 text-center">
            <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/5 flex items-center justify-center">
              <Search size={32} className="text-gray-500" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No items found</h3>
            <p className="text-gray-400">Try adjusting your search or location filters.</p>
          </div>
        )}
      </div>
    </div>
  );
};
