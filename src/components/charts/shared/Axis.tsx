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
    
    const domainLine = d3.select(ref.current).select('.domain');
    if (domainLine.empty()) {
      const range = scale.range();
      const y = 0;
      d3.select(ref.current)
        .insert('path', ':first-child')
        .attr('class', 'domain')
        .attr('d', `M${range[0]},${y}H${range[1]}`)
        .style('stroke', '#fff')
        .style('stroke-width', '1')
        .style('fill', 'none');
    } else {
      domainLine
        .style('stroke', '#fff')
        .style('stroke-width', '1')
        .style('fill', 'none')
        .style('opacity', '1');
    }
    
    d3.select(ref.current).selectAll('.tick line')
      .style('stroke-width', '1px')
      .style('stroke', '#fff')
      .style('opacity', '1');
    
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
    
    const domainLine = d3.select(ref.current).select('.domain');
    if (domainLine.empty()) {
      const range = scale.range();
      const x = 0;
      d3.select(ref.current)
        .insert('path', ':first-child')
        .attr('class', 'domain')
        .attr('d', `M${x},${range[1]}V${range[0]}`)
        .style('stroke', '#fff')
        .style('stroke-width', '1')
        .style('fill', 'none');
    } else {
      domainLine
        .style('stroke', '#fff')
        .style('stroke-width', '1')
        .style('fill', 'none')
        .style('opacity', '1');
    }
    
    d3.select(ref.current).selectAll('.tick line')
      .style('stroke-width', '1px')
      .style('stroke', '#fff')
      .style('opacity', '1');
  }, [scale, ticks, format]);
  
  return <g ref={ref} className={className || "text-[11px] fill-neutral-300"} />;
}
