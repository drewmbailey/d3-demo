import React, { useMemo, useRef, useState, useCallback, useEffect } from 'react';
import * as d3 from 'd3';
import { LineChartProps, TooltipData } from '@/types';
import { useChartDimensions } from '@/hooks/useChartDimensions';
import { useD3Zoom } from '@/hooks/useD3Zoom';
import { 
  createScales, 
  formatNumber, 
  formatDate,
  formatShortDate,
  debounce,
  validateSeriesData 
} from '@/utils/chartUtils';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { AxisBottom, AxisLeft } from '@/components/charts/shared/Axis';

// Interactive stacked area chart with zoom and tooltips
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

  const isValidData = useMemo(() => validateSeriesData(series), [series])
  
  // Create scales and area generators - use empty series as fallback to avoid errors
  const { x, y, color, stackedData, yMax } = useMemo(() => {
    if (!isValidData) {
      // Return minimal valid scales for empty data
      const emptyX = d3.scaleTime().domain([new Date(), new Date()]).range([dimensions.margin.left, dimensions.width - dimensions.margin.right])
      const emptyY = d3.scaleLinear().domain([0, 1]).range([dimensions.height - dimensions.margin.bottom, dimensions.margin.top])
      const emptyColor = d3.scaleOrdinal<string, string>(d3.schemeTableau10).domain([])
      return { x: emptyX, y: emptyY, color: emptyColor, stackedData: [], yMax: 1   };
}

    const allDates = Array.from(new Set(
      series.flatMap(s => s.values.map(v => v.x.getTime()))
    )).sort((a, b) => a - b).map(t => new Date(t))

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

    return { x, y, color, stackedData: stacked, yMax   };
}, [series, dimensions, isValidData])

  const area = useMemo(() => {
    return d3.area<{ [key: string]: number | Date }>()
      .x(d => x(d.date as Date))
      .y0(d => y(0))
      .y1(d => y(d3.max(series.map(s => (d[`${s.id}_end`] as number) || 0)) || 0))
      .curve(d3.curveMonotoneX)
  }, [x, y, series])

  const areaGenerators = useMemo(() => {
    return series.map(s => 
      d3.area<{ [key: string]: number | Date }>()
        .x(d => x(d.date as Date))
        .y0(d => y((d[s.id] as number) || 0))
        .y1(d => y((d[`${s.id}_end`] as number) || 0))
        .curve(d3.curveMonotoneX)
    )
  }, [x, y, series])

  const handleZoom = useCallback(debounce((event: any) => {
    const svg = d3.select(ref.current)
    if (!svg.node()) return
    
    const gX = svg.select<SVGGElement>('g.x-axis')
    const zx = event.transform.rescaleX(x)
    
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

  useD3Zoom({
    svgRef: ref,
    dimensions,
    onZoom: handleZoom
  })

  const debouncedMouseHandler = useMemo(() => {
    return debounce((svg: SVGSVGElement, clientX: number, clientY: number) => {
      const rect = svg.getBoundingClientRect()
      const scaleX = svg.clientWidth / dimensions.width
      const mouseX = (clientX - rect.left) / scaleX
      
      const xm = x.invert(mouseX)
      
      const closestDate = stackedData.reduce((prev, curr) => 
        Math.abs((curr.date as Date).getTime() - xm.getTime()) < Math.abs((prev.date as Date).getTime() - xm.getTime()) ? curr : prev
      )
      
      const nearest = series.map(s => ({
        id: s.id,
        y: ((closestDate[`${s.id}_end`] as number) || 0) - ((closestDate[s.id] as number) || 0)
      })).filter(n => n.y > 0)
      
      setHover({ x: mouseX, date: xm, nearest })
    }, 16)
  }, [x, stackedData, series, dimensions.width])

  const handleMouseMove = useCallback((e: React.MouseEvent<SVGRectElement>) => {
    const svg = e.currentTarget.ownerSVGElement
    if (svg) {
      debouncedMouseHandler(svg, e.clientX, e.clientY)
  };
}, [debouncedMouseHandler])

  const handleMouseLeave = useCallback(() => {
    setHover(null)
  }, [])

  // Early returns after all hooks
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
            <AxisBottom scale={x} ticks={6} format={formatShortDate} />
          </g>
          <g transform={`translate(${dimensions.margin.left},0)`}>
            <AxisLeft scale={y} ticks={5} format={(d: number) => formatNumber(d, 'absolute')} />
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
  );
}

