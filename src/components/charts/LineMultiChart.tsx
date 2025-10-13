import React, { useMemo, useRef, useState, useCallback, useEffect } from 'react'
import * as d3 from 'd3'
import { LineChartProps, TooltipData, ChartMode } from '@/types'
import { useChartDimensions } from '@/hooks/useChartDimensions'
import { useD3Zoom } from '@/hooks/useD3Zoom'
import { 
  createScales, 
  createLineGenerator, 
  findNearestPoints, 
  formatNumber, 
  formatDate,
  formatShortDate,
  debounce,
  validateSeriesData 
} from '@/utils/chartUtils'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { LoadingSpinner } from '@/components/LoadingSpinner'

export default function LineMultiChart({ 
  series, 
  height, 
  mode = 'absolute', 
  dimensions: customDimensions 
}: LineChartProps) {
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

  // Create scales and normalized data
  const { x, y, color, normalized } = useMemo(() => 
    createScales(series, dimensions, mode), 
    [series, dimensions, mode]
  )

  const line = useMemo(() => 
    createLineGenerator(x, y), 
    [x, y]
  )

  // Debounced zoom handler
  const handleZoom = useCallback(debounce((event: any) => {
    const svg = d3.select(ref.current)
    if (!svg.node()) return
    
    const gX = svg.select<SVGGElement>('g.x-axis')
    const zx = event.transform.rescaleX(x)
    
    svg.selectAll('path.series')
      .attr('d', (d: any) => line.x((v: any) => zx(v.x))(d.values) ?? '')
    
    gX.call(d3.axisBottom(zx).ticks(6) as any)
  }, 16), [x, line])

  // Setup zoom behavior
  useD3Zoom({
    svgRef: ref,
    dimensions,
    onZoom: handleZoom
  })

  // Mouse move handler with debouncing
  const handleMouseMove = useCallback(debounce((e: React.MouseEvent<SVGRectElement>) => {
    const pt = d3.pointer(e)
    const xm = x.invert(pt[0])
    const nearest = findNearestPoints(normalized, xm)
    setHover({ x: pt[0], date: xm, nearest })
  }, 16), [x, normalized])

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
          aria-label="Interactive line chart showing data trends over time"
        >
          <g className="x-axis" transform={`translate(0,${dimensions.height - dimensions.margin.bottom})`}>
            <AxisBottom scale={x} ticks={6} fmt={formatShortDate} />
          </g>
          <g transform={`translate(${dimensions.margin.left},0)`}>
            <AxisLeft scale={y} ticks={5} fmt={(d: number) => formatNumber(d, mode)} />
          </g>

          {normalized.map(s => (
            <path 
              key={s.id} 
              className="series" 
              d={line(s.values) ?? undefined} 
              fill="none" 
              stroke={color(s.id)} 
              strokeWidth={2}
              aria-label={`${s.id} data series`}
            />
          ))}

          <g transform={`translate(${dimensions.width - 150}, ${dimensions.margin.top})`} role="list" aria-label="Legend">
            {normalized.map((s, i) => (
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
                      <span>{formatNumber(n.y, mode)}</span>
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
