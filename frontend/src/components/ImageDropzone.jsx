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
          className={`flex flex-col items-center justify-center w-full h-64 border-4 border-dashed rounded-2xl cursor-pointer transition-all ${
            isDragging 
              ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/20 scale-105' 
              : 'border-[var(--color-border)] bg-[var(--color-surface)] hover:bg-[var(--color-surface-hover)] shadow-[4px_4px_0_0_var(--color-shadow)] hover:shadow-[6px_6px_0_0_var(--color-shadow)] hover:-translate-y-1'
          }`}
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <UploadCloud size={64} strokeWidth={3} className={`mb-4 ${isDragging ? 'text-[var(--color-primary)] animate-bounce' : 'text-[var(--color-text)]'}`} />
            <p className="mb-2 text-lg text-[var(--color-text)] font-medium">
              <span className="font-black">Click to upload</span> or drag and drop
            </p>
            <p className="text-sm font-bold text-[var(--color-text)]/60 bg-[var(--color-accent)] px-3 py-1 rounded-full border-2 border-[var(--color-border)] rotate-2">PNG, JPG or WEBP</p>
          </div>
          <input 
            type="file" 
            className="hidden" 
            accept="image/png, image/jpeg, image/webp" 
            onChange={handleChange} 
          />
        </label>
      ) : (
        <div className="relative w-full h-64 rounded-2xl overflow-hidden comic-panel border-4 border-[var(--color-border)] group">
          <img 
            src={URL.createObjectURL(file)} 
            alt="Preview" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-[var(--color-primary)]/80 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
            <button
              type="button"
              onClick={() => setFile(null)}
              className="px-6 py-3 comic-button bg-[var(--color-surface)] text-[var(--color-text)] text-lg flex items-center gap-2 hover:bg-black hover:text-white"
            >
              <X size={24} strokeWidth={3} />
              Remove Image
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
