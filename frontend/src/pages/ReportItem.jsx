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
        <div className="comic-panel bg-[var(--color-accent)] p-8 max-w-md mx-auto -rotate-2">
          <ShieldCheck size={80} strokeWidth={3} className="text-black mx-auto mb-6" />
          <h2 className="text-3xl font-black text-black mb-4 uppercase">Hold Up!</h2>
          <p className="text-xl font-bold text-black/80 mb-8">You must be signed in with a valid .edu email to report items.</p>
          <button 
            onClick={() => window.dispatchEvent(new Event('auth:unauthorized'))} 
            className="px-8 py-4 comic-button bg-[var(--color-primary)] text-white text-xl w-full"
          >
            Sign In Now
          </button>
        </div>
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
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl mx-auto text-center py-12"
      >
        <div className="comic-panel bg-white p-10 rotate-1">
          <div className="w-24 h-24 bg-[var(--color-primary)] rounded-full flex items-center justify-center mx-auto mb-6 border-4 border-black shadow-[4px_4px_0_0_#000] -rotate-6">
            <CheckCircle2 size={48} strokeWidth={3} className="text-white" />
          </div>
          <h2 className="text-5xl font-black text-black mb-4 uppercase drop-shadow-[2px_2px_0_#fff]">Success!</h2>
          <p className="text-2xl font-bold text-black/80 mb-8">
            Our Vision AI successfully processed the image and extracted the tags.
          </p>

          <div className="p-6 comic-panel bg-[var(--color-surface-hover)] text-left max-w-md mx-auto mb-10 -rotate-2">
            <h3 className="text-2xl font-black text-black mb-6 flex items-center gap-3">
              <Sparkles size={28} strokeWidth={3} className="text-[var(--color-primary)]" />
              AI Extracted Tags
            </h3>
            <div className="space-y-4">
              {Object.entries(success.tags).map(([key, val]) => (
                val && val !== 'Unknown' && (
                  <div key={key} className="flex justify-between items-center pb-3 border-b-4 border-black/10 last:border-0 font-bold text-lg">
                    <span className="text-black/60 capitalize">{key}</span>
                    <span className="text-black bg-white px-3 py-1 border-2 border-black rounded-lg shadow-[2px_2px_0_0_#000]">{val}</span>
                  </div>
                )
              ))}
            </div>
          </div>

          <button 
            onClick={() => navigate('/')}
            className="px-8 py-4 comic-button bg-[var(--color-secondary)] text-black text-xl hover:bg-black hover:text-white"
          >
            Return to Feed
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto pb-12 relative">
      <div className="mb-10 bg-[var(--color-primary)] border-4 border-black shadow-[6px_6px_0_0_#000] rounded-2xl p-8 rotate-1 transition-all hover:rotate-0">
        <h1 className="text-4xl md:text-5xl font-black text-black mb-4 uppercase drop-shadow-[3px_3px_0_#fff]">Report an Item</h1>
        <p className="text-xl font-bold text-black/90">Upload a photo and let our AI do the heavy lifting. We'll automatically identify the brand and category.</p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        {/* Left Column - Image */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[var(--color-accent)] border-4 border-black shadow-[6px_6px_0_0_#000] rounded-2xl p-6 -rotate-1 h-full flex flex-col transition-all hover:rotate-0">
            <h3 className="text-2xl font-black text-black mb-6 flex items-center gap-3">
              <Sparkles size={28} strokeWidth={3} className="text-black" />
              Item Photo
            </h3>
            <div className="flex-1 bg-white border-4 border-black rounded-2xl p-4 shadow-[4px_4px_0_0_#000]">
              <ImageDropzone file={file} setFile={setFile} />
            </div>
          </div>
        </div>

        {/* Right Column - Details */}
        <div className="lg:col-span-3 space-y-6">
          <div className="p-8 comic-panel space-y-8 rotate-1">
            
            {/* Status Type */}
            <div>
              <label className="block text-xl font-black text-black mb-4">Item Status</label>
              <div className="flex gap-4">
                <label className="flex-1 relative cursor-pointer group">
                  <input type="radio" name="itemType" value="found" checked={itemType === 'found'} onChange={() => setItemType('found')} className="peer sr-only" />
                  <div className="p-4 text-center rounded-2xl border-4 border-black bg-white peer-checked:bg-[var(--color-secondary)] peer-checked:-translate-y-1 peer-checked:shadow-[6px_6px_0_0_#000] text-black transition-all font-black text-lg group-hover:bg-[var(--color-surface-hover)] shadow-[2px_2px_0_0_#000]">
                    Found Something!
                  </div>
                </label>
                <label className="flex-1 relative cursor-pointer group">
                  <input type="radio" name="itemType" value="lost" checked={itemType === 'lost'} onChange={() => setItemType('lost')} className="peer sr-only" />
                  <div className="p-4 text-center rounded-2xl border-4 border-black bg-white peer-checked:bg-[var(--color-primary)] peer-checked:text-white peer-checked:-translate-y-1 peer-checked:shadow-[6px_6px_0_0_#000] text-black transition-all font-black text-lg group-hover:bg-[var(--color-surface-hover)] shadow-[2px_2px_0_0_#000]">
                    Lost Something?
                  </div>
                </label>
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-xl font-black text-black mb-3">Short Title <span className="text-[var(--color-primary)]">*</span></label>
              <input 
                type="text" 
                value={title} 
                onChange={(e) => setTitle(e.target.value)} 
                required
                placeholder="e.g. Black Sony Headphones" 
                className="w-full px-5 py-4 comic-input text-lg font-bold"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xl font-black text-black mb-3 flex items-center gap-2">
                <AlignLeft size={24} strokeWidth={3} /> Additional Details
              </label>
              <textarea 
                value={description} 
                onChange={(e) => setDescription(e.target.value)} 
                placeholder="Any specific marks, damage, or contextual information?" 
                rows={4}
                className="w-full px-5 py-4 comic-input text-lg font-bold resize-none"
              />
            </div>

            {/* Location */}
            <div className="space-y-6 pt-6 border-t-4 border-black border-dashed">
              <h3 className="text-2xl font-black text-black flex items-center gap-3 bg-[var(--color-secondary)] p-3 rounded-xl border-4 border-black w-fit -rotate-2 shadow-[2px_2px_0_0_#000]">
                <MapPin size={24} strokeWidth={3} />
                Location Information
              </h3>
              
              <div>
                <label className="block text-xl font-black text-black mb-3">Location Name</label>
                <input 
                  type="text" 
                  value={locationName} 
                  onChange={(e) => setLocationName(e.target.value)} 
                  placeholder="e.g. Library 2nd Floor, Main Cafeteria" 
                  className="w-full px-5 py-4 comic-input text-lg font-bold"
                />
              </div>

              <div>
                <label className="block text-xl font-black text-black mb-3">Pin on Map (Optional)</label>
                <LocationPicker location={location} setLocation={setLocation} />
              </div>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full py-5 mt-8 comic-button bg-[var(--color-primary)] text-white text-2xl hover:bg-black hover:-rotate-1 disabled:opacity-70 flex justify-center items-center gap-3"
            >
              {loading ? (
                <>
                  <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-8 h-8 border-4 border-white/30 border-t-white rounded-full" />
                  <span>Analyzing...</span>
                </>
              ) : (
                'Submit Report!'
              )}
            </button>

          </div>
        </div>
      </form>
    </div>
  );
};
