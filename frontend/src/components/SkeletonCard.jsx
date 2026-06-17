import { motion } from 'framer-motion';

export const SkeletonCard = () => {
  return (
    <div className="overflow-hidden comic-panel animate-pulse bg-white border-4 border-black">
      <div className="w-full h-48 bg-gray-200 border-b-4 border-black"></div>
      <div className="p-5 space-y-4">
        <div className="h-6 rounded-lg bg-gray-200 border-2 border-black/20 w-3/4"></div>
        <div className="h-4 rounded-md bg-gray-100 border border-black/10 w-full"></div>
        <div className="h-4 rounded-md bg-gray-100 border border-black/10 w-5/6"></div>
        <div className="flex gap-2 pt-2">
          <div className="h-6 rounded-full bg-gray-200 border-2 border-black/20 w-16"></div>
          <div className="h-6 rounded-full bg-gray-200 border-2 border-black/20 w-20"></div>
        </div>
        <div className="h-12 rounded-full bg-gray-200 border-4 border-black/20 w-full mt-4"></div>
      </div>
    </div>
  );
};
