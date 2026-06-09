import { motion } from 'framer-motion';

export const SkeletonCard = () => {
  return (
    <div className="overflow-hidden rounded-2xl glass-panel animate-pulse border border-white/5">
      <div className="w-full h-48 bg-white/5"></div>
      <div className="p-5 space-y-4">
        <div className="h-6 rounded bg-white/10 w-3/4"></div>
        <div className="h-4 rounded bg-white/5 w-full"></div>
        <div className="h-4 rounded bg-white/5 w-5/6"></div>
        <div className="flex gap-2 pt-2">
          <div className="h-6 rounded-full bg-white/10 w-16"></div>
          <div className="h-6 rounded-full bg-white/10 w-20"></div>
        </div>
      </div>
    </div>
  );
};
