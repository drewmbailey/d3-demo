import React, { useState, useMemo } from 'react';
import * as d3 from 'd3';
import { BubbleChartProps } from '@/types';
import { useChartDimensions } from '@/hooks/useChartDimensions';
import { formatCurrency } from '@/utils/chartUtils';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { CHART_DIMENSIONS } from '@/constants';
import { AxisBottom, AxisLeft } from '@/components/charts/shared/Axis';

interface BubbleHoverData {
  d: { city: string; postings: number; avgSalary: number }
  cx: number
  cy: number
}

// Interactive bubble chart with hover tooltips
export default function BubbleChart({ 
  data, 
  xTicks, 
  height, 
  dimensions: customDimensions 
}: BubbleChartProps) {
  const dimensions = useChartDimensions({
    height: height ?? CHART_DIMENSIONS.bubbleHeight,
    ...customDimensions,
    margin: customDimensions?.margin ?? CHART_DIMENSIONS.bubbleMargin
  });

  const [hover, setHover] = useState<BubbleHoverData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const isValidData = useMemo(() => 
    Array.isArray(data) && data.length > 0 && Array.isArray(xTicks) && xTicks.length > 0,
    [data, xTicks]
  );

  if (!isValidData) {
    return (
      <ErrorBoundary>
        <div className="flex items-center justify-center p-8 bg-neutral-900/50 border border-neutral-800 rounded-2xl">
          <p className="text-neutral-400">Invalid or empty data provided</p>
        </div>
      </ErrorBoundary>
    );
  }

  if (isLoading) {
    return <LoadingSpinner message="Loading bubble chart..." />;
  }

  const { xScale, yScale, rScale, color } = useMemo(() => {
    const maxPosts = d3.max(data, d => d.postings) ?? 1;
    const yExtent = d3.extent(data, d => d.avgSalary) as [number, number];

    return {
      xScale: d3.scalePoint<string>()
        .domain(xTicks)
        .range([dimensions.margin.left, dimensions.width - dimensions.margin.right])
        .padding(0.5),
      yScale: d3.scaleLinear()
        .domain(yExtent)
        .nice()
        .range([dimensions.height - dimensions.margin.bottom, dimensions.margin.top]),
      rScale: d3.scaleSqrt()
        .domain([0, maxPosts])
        .range([6, 48]),
      color: d3.scaleOrdinal<string, string>(d3.schemeTableau10)
        .domain(xTicks)
    };
  }, [data, xTicks, dimensions]);

  return (
    <ErrorBoundary>
      <div className="w-full overflow-hidden rounded-2xl bg-neutral-950 border border-neutral-800">
        <svg 
          viewBox={`0 0 ${dimensions.width} ${dimensions.height}`} 
          role="img" 
          aria-label="Interactive bubble chart showing job market data by city"
        >
          <g transform={`translate(0,${dimensions.height - dimensions.margin.bottom})`}>
            <AxisBottom scale={xScale} ticks={xTicks.length} format={(d: string) => d} />
          </g>
          <g transform={`translate(${dimensions.margin.left},0)`}>
            <AxisLeft scale={yScale} ticks={5} format={formatCurrency} />
          </g>

          {data.map((d, i) => (
            <g key={`${d.city}-${i}`} transform={`translate(${xScale(d.city)}, ${yScale(d.avgSalary)})`}>
              <circle
                r={rScale(d.postings)}
                fill={color(d.city)}
                fillOpacity={0.9}
                stroke="white"
                strokeOpacity={0.15}
                onMouseEnter={() => setHover({ 
                  d, 
                  cx: xScale(d.city) ?? 0, 
                  cy: yScale(d.avgSalary) ?? 0 
                })}
                onMouseLeave={() => setHover(null)}
                aria-label={`${d.city}: ${d.postings} postings, average salary ${formatCurrency(d.avgSalary)}`}
              />
              <text 
                y={4} 
                textAnchor="middle" 
                className="fill-white text-[11px] opacity-80 pointer-events-none"
                aria-hidden="true"
              >
                {d.city.split(', ')[0]}
              </text>
            </g>
          ))}

          {hover && (
            <g transform={`translate(${hover.cx + 10}, ${hover.cy - 10})`} pointerEvents="none">
              <foreignObject x={0} y={0} width={240} height={100}>
                <div className="bg-neutral-800/90 border border-neutral-700 rounded-lg p-2 text-xs text-neutral-100">
                  <div className="font-semibold">{hover.d.city}</div>
                  <div>Postings: {hover.d.postings}</div>
                  <div>Avg Salary: {formatCurrency(hover.d.avgSalary)}</div>
                </div>
              </foreignObject>
            </g>
          )}
        </svg>
      </div>
    </ErrorBoundary>
  );
}

