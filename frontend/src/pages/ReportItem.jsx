import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ImageDropzone } from '../components/ImageDropzone';
import { LocationPicker } from '../components/LocationPicker';
import { Sparkles, MapPin, AlignLeft, ShieldCheck, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';
import api from '../api/axios';

export const ReportItem = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [file, setFile] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [locationName, setLocationName] = useState('');
  const [location, setLocation] = useState(null);
  const [itemType, setItemType] = useState('found');
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);

  // Redirect if not logged in
  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <ShieldCheck size={64} className="text-gray-500 mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Authentication Required</h2>
        <p className="text-gray-400 mb-6">You must be signed in with a valid .edu email to report items.</p>
        <button onClick={() => window.dispatchEvent(new Event('auth:unauthorized'))} className="px-6 py-2 bg-[#aa3bff] hover:bg-[#912bd9] transition-colors text-white rounded-xl font-medium shadow-[0_0_20px_rgba(170,59,255,0.3)]">
          Sign In Now
        </button>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!file) {
      toast.error('Please upload an image of the item.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB.');
      return;
    }
    if (!title.trim()) {
      toast.error('Please provide a title.');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', title);
      formData.append('item_type', itemType);
      
      if (description) formData.append('description', description);
      if (locationName) formData.append('location_name', locationName);
      if (location) {
        formData.append('latitude', location.lat);
        formData.append('longitude', location.lng);
      }

      const res = await api.post('/media/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setSuccess(res.data);
      toast.success('Item successfully reported!');
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.detail || 'Failed to upload item.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-2xl mx-auto text-center py-12"
      >
        <div className="w-24 h-24 bg-[#aa3bff]/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-[#aa3bff]/30">
          <CheckCircle2 size={48} className="text-[#c084fc]" />
        </div>
        <h2 className="text-4xl font-bold text-white mb-4 font-heading">Successfully Reported!</h2>
        <p className="text-xl text-gray-400 mb-8">
          Our Vision AI successfully processed the image and extracted the tags.
        </p>

        <div className="p-6 rounded-2xl glass-panel text-left max-w-md mx-auto mb-8 border border-white/10">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Sparkles size={20} className="text-[#aa3bff]" />
            AI Extracted Tags
          </h3>
          <div className="space-y-3">
            {Object.entries(success.tags).map(([key, val]) => (
              val && val !== 'Unknown' && (
                <div key={key} className="flex justify-between items-center pb-2 border-b border-white/5 last:border-0">
                  <span className="text-gray-400 capitalize">{key}</span>
                  <span className="text-white font-medium">{val}</span>
                </div>
              )
            ))}
          </div>
        </div>

        <button 
          onClick={() => navigate('/')}
          className="px-8 py-3 bg-[#aa3bff] hover:bg-[#912bd9] text-white rounded-xl font-medium transition-colors shadow-[0_0_20px_rgba(170,59,255,0.3)]"
        >
          Return to Feed
        </button>
      </motion.div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto pb-12">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-2 font-heading">Report an Item</h1>
        <p className="text-gray-400">Upload a photo and let our AI do the heavy lifting. We'll automatically identify the brand and category.</p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Left Column - Image */}
        <div className="lg:col-span-2 space-y-6">
          <div className="p-1 rounded-2xl bg-gradient-to-br from-[#aa3bff]/30 to-transparent">
            <div className="bg-[#120e18] rounded-2xl p-6 h-full">
              <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Sparkles size={18} className="text-[#aa3bff]" />
                Item Photo
              </h3>
              <ImageDropzone file={file} setFile={setFile} />
            </div>
          </div>
        </div>

        {/* Right Column - Details */}
        <div className="lg:col-span-3 space-y-6">
          <div className="p-6 rounded-2xl glass-panel space-y-6">
            
            {/* Status Type */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-3">Item Status</label>
              <div className="flex gap-4">
                <label className="flex-1 relative cursor-pointer">
                  <input type="radio" name="itemType" value="found" checked={itemType === 'found'} onChange={() => setItemType('found')} className="peer sr-only" />
                  <div className="p-4 text-center rounded-xl border border-white/10 bg-white/5 peer-checked:bg-[#aa3bff]/20 peer-checked:border-[#aa3bff] peer-checked:text-white text-gray-400 transition-all font-medium">
                    I Found Something
                  </div>
                </label>
                <label className="flex-1 relative cursor-pointer">
                  <input type="radio" name="itemType" value="lost" checked={itemType === 'lost'} onChange={() => setItemType('lost')} className="peer sr-only" />
                  <div className="p-4 text-center rounded-xl border border-white/10 bg-white/5 peer-checked:bg-red-500/20 peer-checked:border-red-500 peer-checked:text-white text-gray-400 transition-all font-medium">
                    I Lost Something
                  </div>
                </label>
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Short Title <span className="text-red-400">*</span></label>
              <input 
                type="text" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                required
                placeholder="e.g. Black Sony Headphones" 
                className="w-full px-4 py-3 rounded-xl glass-input"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center gap-2">
                <AlignLeft size={16} /> Additional Details
              </label>
              <textarea 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                placeholder="Any specific marks, damage, or contextual information?" 
                rows={3}
                className="w-full px-4 py-3 rounded-xl glass-input resize-none"
              />
            </div>

            {/* Location */}
            <div className="space-y-4 pt-4 border-t border-white/10">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <MapPin size={18} className="text-[#aa3bff]" />
                Location Information
              </h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Location Name</label>
                <input 
                  type="text" 
                  value={locationName} 
                  onChange={(e) => setLocationName(e.target.value)} 
                  placeholder="e.g. Library 2nd Floor, Main Cafeteria" 
                  className="w-full px-4 py-3 rounded-xl glass-input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Pin on Map (Optional)</label>
                <LocationPicker location={location} setLocation={setLocation} />
              </div>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 mt-4 font-bold text-white bg-[#aa3bff] hover:bg-[#912bd9] rounded-xl transition-colors flex justify-center items-center gap-2 disabled:opacity-70 shadow-[0_0_20px_rgba(170,59,255,0.2)]"
            >
              {loading ? (
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
              ) : (
                'Submit Report'
              )}
            </button>

          </div>
        </div>
      </form>
    </div>
  );
};
