import * as d3 from 'd3'
import { Series, Point, ChartDimensions } from '@/types'
import { COLORS } from '@/constants'

// Create D3 scales
export function createScales(
  series: Series[],
  dimensions: ChartDimensions,
  mode: 'absolute' | 'normalized' = 'absolute'
) {
  const normalized = normalizeSeries(series, mode)
  
  const allX = normalized.flatMap(s => s.values.map(v => v.x))
  const allY = normalized.flatMap(s => s.values.map(v => v.y))
  
  const xDomain = d3.extent(allX) as [Date, Date]
  const yDomain = d3.extent(allY) as [number, number]

  const x = d3.scaleTime()
    .domain(xDomain)
    .range([dimensions.margin.left, dimensions.width - dimensions.margin.right])
  
  const y = d3.scaleLinear()
    .domain([yDomain[0] ?? 0, yDomain[1] ?? 1])
    .nice()
    .range([dimensions.height - dimensions.margin.bottom, dimensions.margin.top])

  const color = d3.scaleOrdinal<string, string>(d3.schemeTableau10)
    .domain(normalized.map(s => s.id))

  return { x, y, color, normalized }
}

// Normalize series data for percentage mode
export function normalizeSeries(series: Series[], mode: 'absolute' | 'normalized'): Series[] {
  if (mode === 'absolute') return series
  
  return series.map(s => {
    const base = s.values[0]?.y ?? 1
    return {
      id: s.id,
      values: s.values.map(v => ({
        x: v.x,
        y: ((v.y - base) / base) * 100
      }))
    }
  })
}

// Create line generator
export function createLineGenerator(x: d3.ScaleTime<number, number>, y: d3.ScaleLinear<number, number>) {
  return d3.line<Point>()
    .x(d => x(d.x))
    .y(d => y(d.y))
    .curve(d3.curveMonotoneX)
}

// Format numbers for display
export function formatNumber(value: number, mode: 'absolute' | 'normalized'): string {
  if (mode === 'normalized') {
    return `${value.toFixed(1)}%`
  }
  return value.toFixed(2)
}

// Format currency
export function formatCurrency(value: number): string {
  return `$${Math.round(value / 1000)}k`
}

// Format date
export function formatDate(date: Date): string {
  return d3.timeFormat('%Y-%m-%d')(date)
}

// Format short date
export function formatShortDate(date: Date): string {
  return d3.timeFormat('%b %d')(date)
}

// Find nearest data point
export function findNearestPoints(
  series: Series[],
  xValue: Date
): Array<{ id: string; y: number }> {
  return series.map(s => {
    const bisector = d3.bisector<{ x: Date; y: number }, Date>(d => d.x).center
    const idx = bisector(s.values, xValue)
    const point = s.values[Math.min(Math.max(idx, 0), s.values.length - 1)]
    return { id: s.id, y: point?.y ?? 0 }
  })
}

// Debounce function for performance
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

// Check if data is valid
export function validateSeriesData(series: Series[]): boolean {
  if (!Array.isArray(series) || series.length === 0) return false
  
  return series.every(s => 
    s.id && 
    Array.isArray(s.values) && 
    s.values.length > 0 &&
    s.values.every(v => v.x instanceof Date && typeof v.y === 'number')
  )
}
