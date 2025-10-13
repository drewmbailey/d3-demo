import React from 'react';
import * as d3 from 'd3';
import StackedAreaChart from '@/components/charts/StackedAreaChart';
import { FRAMEWORKS_RAW } from '@/data/frameworks';
import { Series } from '@/types';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { useResponsiveDimensions } from '@/hooks/useResponsiveDimensions';

export default function FrameworksPanel() {
  const [enabled, setEnabled] = React.useState<string[]>(['React','Vue','Angular','Svelte','Next.js']);
  const [isLoading, setIsLoading] = React.useState(false);

  const dimensions = useResponsiveDimensions();

  const grouped = React.useMemo(() => 
    d3.group(FRAMEWORKS_RAW.map(d => ({...d, date: new Date(d.date)})), d => d.name), 
    []
  );

  const series: Series[] = React.useMemo(() => 
    Array.from(grouped.entries())
      .filter(([name]) => enabled.includes(name as string))
      .map(([id, arr]) => ({ 
        id: id as string, 
        values: (arr as any[])
          .sort((a,b) => +a.date - +b.date)
          .map(d => ({ x: d.date as Date, y: d.value })) 
      })), 
    [grouped, enabled]
  );

  const toggleFramework = React.useCallback((framework: string) => {
    setEnabled(prev => prev.includes(framework) 
      ? prev.filter(x => x !== framework) 
      : [...prev, framework]
    );
  }, []);

  return (
    <ErrorBoundary>
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap gap-2">
          {Array.from(grouped.keys()).map(name => (
            <button 
              key={name as string} 
              onClick={() => toggleFramework(name as string)}
              className={`px-3 py-1 rounded-xl border text-sm transition-colors ${
                enabled.includes(name as string) 
                  ? 'bg-indigo-600 border-indigo-500 text-white' 
                  : 'bg-neutral-800 border-neutral-700 text-neutral-200 hover:border-neutral-600'
              }`}
              aria-pressed={enabled.includes(name as string)}
              aria-label={`Toggle ${name as string} framework data`}
            >
              {name as string}
            </button>
          ))}
        </div>
        <StackedAreaChart 
          series={series} 
          dimensions={dimensions}
        />
      </div>
    </ErrorBoundary>
  );
}
