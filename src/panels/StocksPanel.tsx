import React from 'react'
import * as d3 from 'd3'
import LineMultiChart from '@/components/charts/LineMultiChart'
import { STOCKS_RAW } from '@/data/stocks'
import { Series, ChartMode } from '@/types'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { useResponsiveDimensions } from '@/hooks/useResponsiveDimensions'

export default function StocksPanel() {
  const [enabled, setEnabled] = React.useState<string[]>(['AAPL','NVDA','TSLA'])
  const [mode, setMode] = React.useState<ChartMode>('absolute')
  const [isLoading, setIsLoading] = React.useState(false)

  const dimensions = useResponsiveDimensions()

  const bySym = React.useMemo(() => 
    d3.group(STOCKS_RAW.map(d => ({...d, date: new Date(d.date)})), d => d.symbol), 
    []
  )

  const series: Series[] = React.useMemo(() => 
    Array.from(bySym.entries())
      .filter(([s]) => enabled.includes(s as string))
      .map(([id, arr]) => ({ 
        id: id as string, 
        values: (arr as any[])
          .sort((a,b) => +a.date - +b.date)
          .map(d => ({ x: d.date as Date, y: d.close })) 
      })), 
    [bySym, enabled]
  )

  const toggleSymbol = React.useCallback((symbol: string) => {
    setEnabled(prev => prev.includes(symbol) 
      ? prev.filter(x => x !== symbol) 
      : [...prev, symbol]
    )
  }, [])

  const handleModeChange = React.useCallback((newMode: ChartMode) => {
    setMode(newMode)
  }, [])

  return (
    <ErrorBoundary>
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-end gap-2">
          {Array.from(bySym.keys()).map(s => (
            <button 
              key={s as string} 
              onClick={() => toggleSymbol(s as string)}
              className={`px-3 py-1 rounded-xl border text-sm transition-colors ${
                enabled.includes(s as string) 
                  ? 'bg-indigo-600 border-indigo-500 text-white' 
                  : 'bg-neutral-800 border-neutral-700 text-neutral-200 hover:border-neutral-600'
              }`}
              aria-pressed={enabled.includes(s as string)}
              aria-label={`Toggle ${s as string} stock data`}
            >
              {s as string}
            </button>
          ))}
          <label className="ml-auto text-sm opacity-80">Scale</label>
          <select 
            className="bg-neutral-800 border border-neutral-700 rounded-lg px-2 py-1 text-sm text-neutral-100 focus:border-indigo-500 focus:outline-none" 
            value={mode} 
            onChange={e => handleModeChange(e.target.value as ChartMode)}
            aria-label="Select chart scale mode"
          >
            <option value="absolute">Absolute</option>
            <option value="normalized">Normalized %</option>
          </select>
        </div>
        <LineMultiChart 
          series={series} 
          mode={mode}
          dimensions={dimensions}
        />
      </div>
    </ErrorBoundary>
  )
}
