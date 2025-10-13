import React, { useMemo, useRef, useState, useCallback, useEffect } from 'react'
import * as d3 from 'd3'
import { LineChartProps, TooltipData } from '@/types'
import { useChartDimensions } from '@/hooks/useChartDimensions'
import { useD3Zoom } from '@/hooks/useD3Zoom'
import { 
  createScales, 
  formatNumber, 
  formatDate,
  formatShortDate,
  debounce,
  validateSeriesData 
} from '@/utils/chartUtils'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { LoadingSpinner } from '@/components/LoadingSpinner'

export default function StackedAreaChart({ 
  series, 
  height, 
  dimensions: customDimensions 
}: Omit<LineChartProps, 'mode'>) {
  const ref = useRef<SVGSVGElement | null>(null)
  const [hover, setHover] = useState<TooltipData | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  const dimensions = useChartDimensions({ 
    height, 
    ...customDimensions 
  })

  // Validate data
  const isValidData = useMemo(() => validateSeriesData(series), [series])
  
  if (!isValidData) {
    return (
      <ErrorBoundary>
        <div className="flex items-center justify-center p-8 bg-neutral-900/50 border border-neutral-800 rounded-2xl">
          <p className="text-neutral-400">Invalid or empty data provided</p>
        </div>
      </ErrorBoundary>
    )
  }

  if (isLoading) {
    return <LoadingSpinner message="Loading chart..." />
  }

  // Create stacked data and scales
  const { x, y, color, stackedData, yMax } = useMemo(() => {
    // Get all unique dates and sort them
    const allDates = Array.from(new Set(
      series.flatMap(s => s.values.map(v => v.x.getTime()))
    )).sort((a, b) => a - b).map(t => new Date(t))

    // Create stacked data structure
    const stacked = allDates.map(date => {
      const obj: { [key: string]: number | Date } = { date }
      let cumulative = 0
      
      series.forEach(s => {
        const point = s.values.find(v => v.x.getTime() === date.getTime())
        const value = point ? point.y : 0
        obj[s.id] = cumulative
        obj[`${s.id}_end`] = cumulative + value
        cumulative += value
      })
      
      return obj
    })

    // Create scales
    const x = d3.scaleTime()
      .domain(d3.extent(allDates) as [Date, Date])
      .range([dimensions.margin.left, dimensions.width - dimensions.margin.right])

    const yMax = d3.max(stacked, d => 
      series.reduce((sum, s) => sum + ((d[`${s.id}_end`] as number) || 0), 0)
    ) || 1

    const y = d3.scaleLinear()
      .domain([0, yMax])
      .nice()
      .range([dimensions.height - dimensions.margin.bottom, dimensions.margin.top])

    const color = d3.scaleOrdinal<string, string>(d3.schemeTableau10)
      .domain(series.map(s => s.id))

    return { x, y, color, stackedData: stacked, yMax }
  }, [series, dimensions])

  // Create area generator
  const area = useMemo(() => {
    return d3.area<{ [key: string]: number | Date }>()
      .x(d => x(d.date as Date))
      .y0(d => y(0))
      .y1(d => y(d3.max(series.map(s => (d[`${s.id}_end`] as number) || 0)) || 0))
      .curve(d3.curveMonotoneX)
  }, [x, y, series])

  // Create individual area generators for each series
  const areaGenerators = useMemo(() => {
    return series.map(s => 
      d3.area<{ [key: string]: number | Date }>()
        .x(d => x(d.date as Date))
        .y0(d => y((d[s.id] as number) || 0))
        .y1(d => y((d[`${s.id}_end`] as number) || 0))
        .curve(d3.curveMonotoneX)
    )
  }, [x, y, series])

  // Debounced zoom handler
  const handleZoom = useCallback(debounce((event: any) => {
    const svg = d3.select(ref.current)
    if (!svg.node()) return
    
    const gX = svg.select<SVGGElement>('g.x-axis')
    const zx = event.transform.rescaleX(x)
    
    // Update all area paths
    svg.selectAll('path.area')
      .attr('d', (d: any, i: number) => {
        const areaGen = d3.area<{ [key: string]: number | Date }>()
          .x((d: any) => zx(d.date as Date))
          .y0((d: any) => y((d[series[i].id] as number) || 0))
          .y1((d: any) => y((d[`${series[i].id}_end`] as number) || 0))
          .curve(d3.curveMonotoneX)
        return areaGen(stackedData) ?? ''
      })
    
    gX.call(d3.axisBottom(zx).ticks(6) as any)
  }, 16), [x, y, series, stackedData])

  // Setup zoom behavior
  useD3Zoom({
    svgRef: ref,
    dimensions,
    onZoom: handleZoom
  })

  // Create a debounced handler that uses SVG viewBox for reliable coordinates
  const debouncedMouseHandler = useMemo(() => {
    return debounce((svg: SVGSVGElement, clientX: number, clientY: number) => {
      // Use SVG's viewBox and clientWidth for coordinate calculation
      // This is more reliable than getBoundingClientRect() when viewport changes
      const rect = svg.getBoundingClientRect()
      const scaleX = svg.clientWidth / dimensions.width
      const mouseX = (clientX - rect.left) / scaleX
      
      const xm = x.invert(mouseX)
      
      // Find the closest date
      const closestDate = stackedData.reduce((prev, curr) => 
        Math.abs((curr.date as Date).getTime() - xm.getTime()) < Math.abs((prev.date as Date).getTime() - xm.getTime()) ? curr : prev
      )
      
      // Create nearest points for tooltip
      const nearest = series.map(s => ({
        id: s.id,
        y: ((closestDate[`${s.id}_end`] as number) || 0) - ((closestDate[s.id] as number) || 0)
      })).filter(n => n.y > 0)
      
      setHover({ x: mouseX, date: xm, nearest })
    }, 16)
  }, [x, stackedData, series, dimensions.width])

  // Mouse move handler
  const handleMouseMove = useCallback((e: React.MouseEvent<SVGRectElement>) => {
    const svg = e.currentTarget.ownerSVGElement
    if (svg) {
      debouncedMouseHandler(svg, e.clientX, e.clientY)
    }
  }, [debouncedMouseHandler])

  const handleMouseLeave = useCallback(() => {
    setHover(null)
  }, [])

  return (
    <ErrorBoundary>
      <div className="w-full overflow-hidden rounded-2xl bg-neutral-950 border border-neutral-800">
        <svg 
          ref={ref} 
          viewBox={`0 0 ${dimensions.width} ${dimensions.height}`} 
          role="img" 
          aria-label="Interactive stacked area chart showing data composition over time"
        >
          <g className="x-axis" transform={`translate(0,${dimensions.height - dimensions.margin.bottom})`}>
            <AxisBottom scale={x} ticks={6} fmt={formatShortDate} />
          </g>
          <g transform={`translate(${dimensions.margin.left},0)`}>
            <AxisLeft scale={y} ticks={5} fmt={(d: number) => formatNumber(d, 'absolute')} />
          </g>

          {series.map((s, i) => (
            <path 
              key={s.id} 
              className="area" 
              d={areaGenerators[i](stackedData) ?? undefined} 
              fill={color(s.id)} 
              fillOpacity={0.7}
              stroke={color(s.id)}
              strokeWidth={1}
              strokeOpacity={0.8}
              aria-label={`${s.id} area series`}
            />
          ))}

          <g transform={`translate(${dimensions.width - 150}, ${dimensions.margin.top})`} role="list" aria-label="Legend">
            {series.map((s, i) => (
              <g key={s.id} transform={`translate(0, ${i * 18})`} role="listitem">
                <rect width={10} height={10} fill={color(s.id)} rx={2} aria-hidden="true" />
                <text x={16} y={10} className="fill-neutral-300 text-[12px]" aria-label={`${s.id} series`}>
                  {s.id}
                </text>
              </g>
            ))}
          </g>

          <rect 
            x={dimensions.margin.left} 
            y={dimensions.margin.top} 
            width={dimensions.width - dimensions.margin.left - dimensions.margin.right} 
            height={dimensions.height - dimensions.margin.top - dimensions.margin.bottom}
            fill="transparent" 
            onMouseMove={handleMouseMove} 
            onMouseLeave={handleMouseLeave}
            aria-label="Interactive chart area"
          />

          {hover && (
            <g transform={`translate(${hover.x}, ${dimensions.margin.top})`} pointerEvents="none">
              <line 
                x1={0} x2={0} 
                y1={0} y2={dimensions.height - dimensions.margin.top - dimensions.margin.bottom} 
                stroke="white" 
                opacity={0.2}
                aria-hidden="true"
              />
              <foreignObject x={8} y={8} width={220} height={140}>
                <div className="bg-neutral-800/90 border border-neutral-700 rounded-lg p-2 text-xs text-neutral-100">
                  <div className="opacity-80 mb-1">{formatDate(hover.date)}</div>
                  {hover.nearest.map((n: any) => (
                    <div key={n.id} className="flex justify-between gap-2">
                      <span className="opacity-80">{n.id}</span>
                      <span>{formatNumber(n.y, 'absolute')}</span>
                    </div>
                  ))}
                </div>
              </foreignObject>
            </g>
          )}
        </svg>
      </div>
    </ErrorBoundary>
  )
}

function AxisBottom({ scale, ticks = 5, fmt }: { scale: d3.ScaleTime<number, number>; ticks?: number; fmt: (d: Date) => string }) {
  const ref = useRef<SVGGElement | null>(null)
  useEffect(() => { d3.select(ref.current).call(d3.axisBottom(scale).ticks(ticks).tickFormat(fmt as any) as any) }, [scale, ticks, fmt])
  return <g ref={ref} className="text-[11px] fill-neutral-300" />
}

function AxisLeft({ scale, ticks = 5, fmt }: { scale: d3.ScaleLinear<number, number>; ticks?: number; fmt: (d: number) => string }) {
  const ref = useRef<SVGGElement | null>(null)
  useEffect(() => { d3.select(ref.current).call(d3.axisLeft(scale).ticks(ticks).tickFormat(fmt as any) as any) }, [scale, ticks, fmt])
  return <g ref={ref} className="text-[11px] fill-neutral-300" />
}
