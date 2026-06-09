import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { MapPin } from 'lucide-react';

// Fix for default marker icon in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function LocationMarker({ position, setPosition }) {
  const map = useMapEvents({
    click(e) {
      setPosition(e.latlng);
      map.flyTo(e.latlng, map.getZoom());
    },
  });

  return position === null ? null : (
    <Marker position={position}></Marker>
  );
}

export const LocationPicker = ({ location, setLocation }) => {
  const [position, setPosition] = useState(
    location ? { lat: location.lat, lng: location.lng } : { lat: 15.8, lng: 78.0 } // Default fallback
  );

  useEffect(() => {
    if (position && (!location || position.lat !== location.lat || position.lng !== location.lng)) {
      setLocation(position);
    }
  }, [position, setLocation, location]);

  useEffect(() => {
    // Try to get user's current location initially
    if (!location && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setPosition({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
          });
        },
        () => {
          // Silent fallback to default if denied
        }
      );
    }
  }, [location]);

  return (
    <div className="w-full h-[300px] rounded-2xl overflow-hidden glass-panel border border-white/10 z-0 relative">
      <div className="absolute top-4 left-4 z-[400] bg-black/70 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 flex items-center gap-2 pointer-events-none">
        <MapPin size={16} className="text-[#aa3bff]" />
        <span className="text-xs font-medium text-white">Click map to pin location</span>
      </div>
      <MapContainer 
        center={position} 
        zoom={13} 
        scrollWheelZoom={true} 
        style={{ height: '100%', width: '100%', zIndex: 0 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          className="map-tiles"
        />
        <LocationMarker position={position} setPosition={setPosition} />
      </MapContainer>
      <style>{`
        .map-tiles { filter: invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%); }
        .leaflet-container { background: #120e18; }
        .leaflet-control-container { z-index: 100; position: relative; }
      `}</style>
    </div>
  );
};
