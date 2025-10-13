import React, { useState, useMemo } from 'react'
import * as d3 from 'd3'
import { useChartDimensions } from '@/hooks/useChartDimensions'
import { formatCurrency } from '@/utils/chartUtils'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { LoadingSpinner } from '@/components/LoadingSpinner'
import { CHART_DIMENSIONS } from '@/constants'

export interface SkillData {
  skill: string
  totalPostings: number
  avgSalary: number
  topCity: string
}

interface BarChartProps {
  data: SkillData[]
  height?: number
  dimensions?: Partial<{
    width: number
    height: number
    margin: {
      top: number
      right: number
      bottom: number
      left: number
    }
  }>
}

interface BarHoverData {
  d: SkillData
  x: number
  y: number
  width: number
  height: number
}

export default function BarChart({ 
  data, 
  height, 
  dimensions: customDimensions 
}: BarChartProps) {
  const dimensions = useChartDimensions({
    height: height ?? CHART_DIMENSIONS.height,
    ...customDimensions,
    margin: customDimensions?.margin ?? CHART_DIMENSIONS.margin
  })

  const [hover, setHover] = useState<BarHoverData | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Validate data
  const isValidData = useMemo(() => 
    Array.isArray(data) && data.length > 0,
    [data]
  )

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
    return <LoadingSpinner message="Loading bar chart..." />
  }

  // Create scales
  const { xScale, yScale, color } = useMemo(() => {
    const maxPostings = d3.max(data, d => d.totalPostings) ?? 1

    return {
      xScale: d3.scaleBand<string>()
        .domain(data.map(d => d.skill))
        .range([dimensions.margin.left, dimensions.width - dimensions.margin.right])
        .paddingInner(0.2)
        .paddingOuter(0.1),
      yScale: d3.scaleLinear()
        .domain([0, maxPostings])
        .nice()
        .range([dimensions.height - dimensions.margin.bottom, dimensions.margin.top]),
      color: d3.scaleOrdinal<string, string>(d3.schemeTableau10)
        .domain(data.map(d => d.skill))
    }
  }, [data, dimensions])

  return (
    <ErrorBoundary>
      <div className="w-full overflow-hidden rounded-2xl bg-neutral-950 border border-neutral-800">
        <svg 
          viewBox={`0 0 ${dimensions.width} ${dimensions.height}`} 
          role="img" 
          aria-label="Interactive bar chart showing job postings by skill"
        >
          {/* X-axis */}
          <g transform={`translate(0,${dimensions.height - dimensions.margin.bottom})`}>
            <AxisBottom scale={xScale} ticks={data.length} fmt={(d: string) => d} />
          </g>
          
          {/* Y-axis */}
          <g transform={`translate(${dimensions.margin.left},0)`}>
            <AxisLeft scale={yScale} ticks={5} fmt={(d: number) => d.toString()} />
          </g>

          {/* Bars */}
          {data.map((d, i) => {
            const barWidth = xScale.bandwidth()
            const barHeight = dimensions.height - dimensions.margin.bottom - (yScale(d.totalPostings) ?? 0)
            const barX = xScale(d.skill) ?? 0
            const barY = yScale(d.totalPostings) ?? 0

            return (
              <g key={`${d.skill}-${i}`}>
                <rect
                  x={barX}
                  y={barY}
                  width={barWidth}
                  height={barHeight}
                  fill={color(d.skill)}
                  fillOpacity={0.9}
                  stroke="white"
                  strokeOpacity={0.15}
                  onMouseEnter={() => setHover({ 
                    d, 
                    x: barX, 
                    y: barY, 
                    width: barWidth, 
                    height: barHeight 
                  })}
                  onMouseLeave={() => setHover(null)}
                  aria-label={`${d.skill}: ${d.totalPostings} postings, average salary ${formatCurrency(d.avgSalary)}`}
                />
                
                {/* Value label on top of bars */}
                <text 
                  x={barX + barWidth / 2}
                  y={barY - 5}
                  textAnchor="middle" 
                  className="fill-white text-[11px] opacity-80 pointer-events-none"
                  aria-hidden="true"
                >
                  {d.totalPostings}
                </text>
              </g>
            )
          })}

          {/* Tooltip */}
          {hover && (
            <g transform={`translate(${hover.x + hover.width / 2}, ${hover.y - 10})`} pointerEvents="none">
              <foreignObject x={-120} y={0} width={240} height={120}>
                <div className="bg-neutral-800/90 border border-neutral-700 rounded-lg p-3 text-xs text-neutral-100">
                  <div className="font-semibold text-sm mb-1">{hover.d.skill}</div>
                  <div className="space-y-1">
                    <div>Total Postings: <span className="text-indigo-300 font-medium">{hover.d.totalPostings}</span></div>
                    <div>Avg Salary: <span className="text-green-300 font-medium">{formatCurrency(hover.d.avgSalary)}</span></div>
                    <div>Top City: <span className="text-yellow-300 font-medium">{hover.d.topCity}</span></div>
                  </div>
                </div>
              </foreignObject>
            </g>
          )}
        </svg>
      </div>
    </ErrorBoundary>
  )
}

function AxisBottom({ scale, ticks = 5, fmt }: { scale: d3.AxisScale<any>; ticks?: number; fmt: (d: any) => string }) {
  const ref = React.useRef<SVGGElement | null>(null)
  React.useEffect(() => { 
    d3.select(ref.current)
      .call(d3.axisBottom(scale).ticks(ticks).tickFormat(fmt as any) as any)
      .selectAll("text")
      .attr("transform", "rotate(-45)")
      .style("text-anchor", "end")
  }, [scale, ticks, fmt])
  return <g ref={ref} className="text-[11px] fill-neutral-300" />
}

function AxisLeft({ scale, ticks = 5, fmt }: { scale: d3.AxisScale<any>; ticks?: number; fmt: (d: any) => string }) {
  const ref = React.useRef<SVGGElement | null>(null)
  React.useEffect(() => { d3.select(ref.current).call(d3.axisLeft(scale).ticks(ticks).tickFormat(fmt as any) as any) }, [scale, ticks, fmt])
  return <g ref={ref} className="text-[11px] fill-neutral-300" />
}
