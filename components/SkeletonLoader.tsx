import React from 'react';

interface SkeletonLoaderProps {
  type: 'text' | 'image' | 'gallery';
}

const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({ type }) => {
  if (type === 'text') {
    return (
      <div className="space-y-3 py-2">
        <div className="h-4 animate-shimmer rounded-lg w-3/4" />
        <div className="h-4 animate-shimmer rounded-lg w-full" />
        <div className="h-4 animate-shimmer rounded-lg w-5/6" />
        <div className="h-3 animate-shimmer rounded-lg w-2/3" />
      </div>
    );
  }

  if (type === 'image') {
    return (
      <div className="w-24 h-24 animate-shimmer rounded-xl" />
    );
  }

  // Gallery: 2x2 grid shimmer
  return (
    <div className="grid grid-cols-2 gap-2">
      {[0, 1, 2, 3].map(i => (
        <div key={i} className="aspect-square animate-shimmer rounded-xl" />
      ))}
    </div>
  );
};

export default SkeletonLoader;
