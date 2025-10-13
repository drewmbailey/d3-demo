import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';

interface AxisProps {
  scale: d3.AxisScale<any>
  ticks?: number
  format?: (d: any) => string
  className?: string
}

/**
 * Bottom axis component for charts
 */
export function AxisBottom({ scale, ticks = 5, format, className }: AxisProps) {
  const ref = useRef<SVGGElement | null>(null);
  
  useEffect(() => {
    if (!ref.current) return;
    
    const axis = d3.axisBottom(scale).ticks(ticks);
    if (format) {
      axis.tickFormat(format as any);
    }
    
    d3.select(ref.current).call(axis as any);
    
    d3.select(ref.current).select('.domain')
      .attr('d', function() {
        const bbox = (this as SVGGraphicsElement).getBBox();
        const y = bbox.y + bbox.height / 2;
        return `M${bbox.x},${y}H${bbox.x + bbox.width}`;
      })
      .style('stroke', '#fff')
      .style('stroke-width', '1');
    
    d3.select(ref.current).selectAll('.tick line')
      .style('stroke-width', '1px')
      .style('stroke', '#fff');
    
    // Handle text rotation for bottom axes if needed
    // Check if scale has bandwidth method (ScaleBand) or padding method (ScalePoint)
    if ('bandwidth' in scale || 'padding' in scale) {
      d3.select(ref.current)
        .selectAll("text")
        .attr("transform", "rotate(-45)")
        .style("text-anchor", "end");
    }
  }, [scale, ticks, format]);
  
  return <g ref={ref} className={className || "text-[11px] fill-neutral-300"} />;
}

/**
 * Left axis component for charts
 */
export function AxisLeft({ scale, ticks = 5, format, className }: AxisProps) {
  const ref = useRef<SVGGElement | null>(null);
  
  useEffect(() => {
    if (!ref.current) return;
    
    const axis = d3.axisLeft(scale).ticks(ticks);
    if (format) {
      axis.tickFormat(format as any);
    }
    
    d3.select(ref.current).call(axis as any);
    
    d3.select(ref.current).select('.domain')
      .attr('d', function() {
        const bbox = (this as SVGGraphicsElement).getBBox();
        const x = bbox.x + bbox.width / 2;
        return `M${x},${bbox.y}V${bbox.y + bbox.height}`;
      })
      .style('stroke', '#fff')
      .style('stroke-width', '1');
    
    d3.select(ref.current).selectAll('.tick line')
      .style('stroke-width', '1px')
      .style('stroke', '#fff');
  }, [scale, ticks, format]);
  
  return <g ref={ref} className={className || "text-[11px] fill-neutral-300"} />;
}
