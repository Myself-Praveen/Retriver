import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, User, Package } from 'lucide-react';
import api from '../api/axios';
import { ItemCard } from '../components/ItemCard';
import { SkeletonCard } from '../components/SkeletonCard';
import { motion } from 'framer-motion';

export const Profile = () => {
  const { isAuthenticated } = useAuth();
  const [profile, setProfile] = useState(null);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) return;
    const fetchProfile = async () => {
      try {
        const res = await api.get('/users/me');
        setProfile(res.data.user);
        setItems(res.data.items);
      } catch (err) {
        console.error("Failed to load profile", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <ShieldCheck size={64} className="text-gray-500 mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Authentication Required</h2>
        <p className="text-gray-400 mb-6">You must be signed in to view your profile.</p>
        <button onClick={() => window.dispatchEvent(new Event('auth:unauthorized'))} className="px-6 py-2 bg-[#aa3bff] hover:bg-[#912bd9] transition-colors text-white rounded-xl font-medium shadow-[0_0_20px_rgba(170,59,255,0.3)]">
          Sign In Now
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="p-8 rounded-2xl glass-panel animate-pulse h-32"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => <SkeletonCard key={i} />)}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-12 space-y-8">
      <div className="p-8 rounded-2xl glass-panel flex items-center gap-6">
        <div className="w-20 h-20 rounded-full bg-[#aa3bff]/20 flex items-center justify-center border border-[#aa3bff]/30">
          <User size={40} className="text-[#c084fc]" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white mb-1 font-heading">{profile?.name}</h1>
          <p className="text-gray-400">{profile?.email}</p>
        </div>
      </div>

      <div>
        <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
          <Package size={24} className="text-[#aa3bff]" />
          My Reported Items
        </h2>
        
        {items.length === 0 ? (
          <div className="text-center py-12 glass-panel rounded-2xl border border-white/5">
            <p className="text-gray-400 text-lg">You haven't reported any items yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item, i) => (
              <motion.div 
                key={item._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <ItemCard item={item} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
