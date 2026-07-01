import React from 'react';

export default function ProductSkeleton({ count = 4 }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="aspect-[4/5] bg-gradient-to-br from-muted via-muted/60 to-muted mb-5 relative overflow-hidden">
            <div className="absolute inset-0 bg-shimmer" />
          </div>
          <div className="flex justify-between gap-4">
            <div className="h-5 bg-muted w-2/3" />
            <div className="h-5 bg-muted w-16" />
          </div>
          <div className="h-3 bg-muted w-1/2 mt-3" />
        </div>
      ))}
    </div>
  );
}