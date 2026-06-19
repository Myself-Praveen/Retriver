import { useEffect, useState, useRef, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapPin, Search, Map } from 'lucide-react';

// Fix for default marker icon in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function MapUpdater({ position }) {
  const map = useMap();
  useEffect(() => {
    if (position) {
      map.flyTo(position, map.getZoom(), { animate: true, duration: 1 });
    }
  }, [position, map]);
  return null;
}

function LocationMarker({ position, setPosition }) {
  const markerRef = useRef(null);

  useMapEvents({
    click(e) {
      setPosition(e.latlng);
    },
  });

  const eventHandlers = useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          setPosition(marker.getLatLng());
        }
      },
    }),
    [setPosition]
  );

  return position === null ? null : (
    <Marker 
      position={position}
      draggable={true}
      eventHandlers={eventHandlers}
      ref={markerRef}
    ></Marker>
  );
}

export const LocationPicker = ({ location, setLocation }) => {
  const [position, setPosition] = useState(
    location ? { lat: location.lat, lng: location.lng } : { lat: 39.8283, lng: -98.5795 }
  );

  const [geolocationLoaded, setGeolocationLoaded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchTimeout = useRef(null);

  useEffect(() => {
    if (position && (!location || position.lat !== location.lat || position.lng !== location.lng)) {
      setLocation(position);
    }
  }, [position, setLocation, location]);

  useEffect(() => {
    if (!location && navigator.geolocation && !geolocationLoaded) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setGeolocationLoaded(true);
        },
        () => setGeolocationLoaded(true)
      );
    }
  }, [location, geolocationLoaded]);

  const fetchSuggestions = async (query) => {
    if (!query.trim() || query.length < 3) {
      setSuggestions([]);
      return;
    }
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`);
      const data = await response.json();
      setSuggestions(data);
    } catch (error) {
      console.error("Geocoding failed", error);
    }
  };

  const handleInputChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    setShowSuggestions(true);
    
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    
    searchTimeout.current = setTimeout(() => {
      fetchSuggestions(val);
    }, 500);
  };

  const selectSuggestion = (result) => {
    setSearchQuery(result.display_name);
    setShowSuggestions(false);
    setPosition({
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon)
    });
  };

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setIsSearching(true);
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`);
      const data = await response.json();
      
      if (data && data.length > 0) {
        selectSuggestion(data[0]);
      }
    } catch (error) {
      console.error("Geocoding failed", error);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="w-full h-[350px] rounded-2xl overflow-hidden comic-panel z-0 relative flex flex-col">
      {/* Search Bar Overlay */}
      <div className="absolute top-4 left-4 right-4 z-[400] flex flex-col gap-2">
        <div className="flex gap-2">
          <input 
            type="text" 
            value={searchQuery}
            onChange={handleInputChange}
            onFocus={() => setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                setShowSuggestions(false);
                handleSearch(e);
              }
            }}
            placeholder="Search for a location..."
            className="flex-1 px-4 py-2 bg-[var(--color-surface)] border-4 border-[var(--color-border)] rounded-xl shadow-[4px_4px_0_0_var(--color-shadow)] font-bold focus:outline-none focus:translate-y-[-2px] focus:translate-x-[-2px] focus:shadow-[6px_6px_0_0_var(--color-shadow)] transition-all"
          />
          <button 
            type="button"
            onClick={handleSearch}
            disabled={isSearching}
            className="px-4 py-2 bg-[var(--color-primary)] text-white border-4 border-[var(--color-border)] rounded-xl shadow-[4px_4px_0_0_var(--color-shadow)] font-black hover:translate-y-[-2px] hover:translate-x-[-2px] hover:shadow-[6px_6px_0_0_var(--color-shadow)] transition-all disabled:opacity-70 flex items-center justify-center"
          >
            <Search size={20} strokeWidth={3} />
          </button>
        </div>

        {/* Autocomplete Dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="bg-[var(--color-surface)] border-4 border-[var(--color-border)] rounded-xl shadow-[4px_4px_0_0_var(--color-shadow)] overflow-hidden flex flex-col mt-1 max-h-48 overflow-y-auto">
            {suggestions.map((result, idx) => (
              <button
                key={result.place_id || idx}
                type="button"
                onClick={() => selectSuggestion(result)}
                className="text-left px-4 py-3 hover:bg-[var(--color-surface-hover)] border-b-2 border-[var(--color-border)]/10 last:border-0 font-bold text-sm flex items-start gap-3 transition-colors"
              >
                <Map size={16} className="mt-0.5 shrink-0 text-[var(--color-text)]/40" />
                <span className="line-clamp-2 leading-tight">{result.display_name}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <div className="absolute bottom-4 left-4 z-[400] bg-[var(--color-secondary)] px-4 py-2 rounded-xl border-4 border-[var(--color-border)] flex items-center gap-2 pointer-events-none shadow-[2px_2px_0_0_var(--color-shadow)] -rotate-2">
        <MapPin size={20} strokeWidth={3} className="text-[var(--color-text)]" />
        <span className="text-sm font-black text-[var(--color-text)]">Drag pin or click map</span>
      </div>

      <MapContainer 
        center={position} 
        zoom={14} 
        scrollWheelZoom={true} 
        style={{ height: '100%', width: '100%', zIndex: 0 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          className="map-tiles"
        />
        <MapUpdater position={position} />
        <LocationMarker position={position} setPosition={setPosition} />
      </MapContainer>
      <style>{`
        /* Remove the dark mode invert filter for comic theme */
        .leaflet-container { background: #f0f0f0; }
        .leaflet-control-container { z-index: 100; position: relative; }
      `}</style>
    </div>
  );
};
