import { useCallback, useState } from 'react';
import { UploadCloud, X } from 'lucide-react';

export const ImageDropzone = ({ file, setFile }) => {
  const [isDragging, setIsDragging] = useState(false);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile.type.startsWith('image/')) {
        setFile(droppedFile);
      }
    }
  }, [setFile]);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  return (
    <div className="w-full">
      {!file ? (
        <label 
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-2xl cursor-pointer transition-all ${
            isDragging 
              ? 'border-[#aa3bff] bg-[#aa3bff]/10' 
              : 'border-white/20 bg-white/5 hover:bg-white/10 hover:border-white/30'
          }`}
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <UploadCloud size={48} className={`mb-4 ${isDragging ? 'text-[#aa3bff]' : 'text-gray-400'}`} />
            <p className="mb-2 text-sm text-gray-300">
              <span className="font-semibold text-white">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-gray-500">PNG, JPG or WEBP (MAX. 5MB)</p>
          </div>
          <input 
            type="file" 
            className="hidden" 
            accept="image/png, image/jpeg, image/webp" 
            onChange={handleChange} 
          />
        </label>
      ) : (
        <div className="relative w-full h-64 rounded-2xl overflow-hidden glass-panel border border-white/10 group">
          <img 
            src={URL.createObjectURL(file)} 
            alt="Preview" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <button
              type="button"
              onClick={() => setFile(null)}
              className="px-4 py-2 bg-red-500/80 text-white rounded-lg backdrop-blur-sm flex items-center gap-2 hover:bg-red-600 transition-colors"
            >
              <X size={18} />
              Remove Image
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
