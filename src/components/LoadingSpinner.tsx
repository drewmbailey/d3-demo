import React from 'react'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  message?: string
}

export function LoadingSpinner({ size = 'md', message = 'Loading...' }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  }

  return (
    <div className="flex flex-col items-center justify-center p-8 bg-neutral-900/50 border border-neutral-800 rounded-2xl">
      <div className={`animate-spin rounded-full border-2 border-neutral-600 border-t-indigo-500 ${sizeClasses[size]} mb-4`} />
      <p className="text-neutral-400 text-sm">{message}</p>
    </div>
  )
}

// Skeleton loader for charts
export function ChartSkeleton() {
  return (
    <div className="w-full overflow-hidden rounded-2xl bg-neutral-950 border border-neutral-800 p-4">
      <div className="animate-pulse">
        {/* Chart area skeleton */}
        <div className="h-80 bg-neutral-800 rounded-lg mb-4" />
        
        {/* Legend skeleton */}
        <div className="flex justify-end gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center gap-2">
              <div className="w-3 h-3 bg-neutral-700 rounded" />
              <div className="w-16 h-4 bg-neutral-700 rounded" />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
