import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { ChartDimensions } from '@/types';
import { ANIMATION } from '@/constants';

interface UseD3ZoomProps {
  svgRef: React.RefObject<SVGSVGElement>
  dimensions: ChartDimensions
  onZoom?: (event: any) => void
}

export function useD3Zoom({ svgRef, dimensions, onZoom }: UseD3ZoomProps) {
  const zoomRef = useRef<d3.ZoomBehavior<SVGSVGElement, unknown> | null>(null);

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    if (!svg.node()) return;

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent(ANIMATION.zoomScaleExtent)
      .translateExtent([[0, 0], [dimensions.width, dimensions.height]])
      .on('zoom', onZoom || (() => {}));

    svg.call(zoom as any);
    zoomRef.current = zoom;

    return () => {
      svg.on('zoom', null);
      zoomRef.current = null;
    };
  }, [svgRef, dimensions, onZoom]);

  return zoomRef.current;
}
