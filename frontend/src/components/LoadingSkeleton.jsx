import React from 'react';
import { motion } from 'framer-motion';

const LoadingSkeleton = () => {
  return (
    <div className="space-y-12 w-full animate-pulse">
      {/* Summary Area Skeleton */}
      <div className="glass p-8 rounded-[40px] border-white border-opacity-10">
        <div className="h-4 w-32 bg-white bg-opacity-10 rounded-full mb-4" />
        <div className="space-y-3">
          <div className="h-6 w-full bg-white bg-opacity-10 rounded-full" />
          <div className="h-6 w-3/4 bg-white bg-opacity-10 rounded-full" />
        </div>
      </div>

      {/* Grid Area Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="glass p-6 rounded-3xl border-white border-opacity-5 h-[300px]">
             <div className="h-5 w-24 bg-white bg-opacity-10 rounded-full mb-6" />
             <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: 35 }).map((_, j) => (
                  <div key={j} className="aspect-square bg-white bg-opacity-5 rounded-lg" />
                ))}
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LoadingSkeleton;
