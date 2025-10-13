import { useState, useEffect } from 'react';
import { ChartDimensions } from '@/types';
import { BREAKPOINTS, CHART_DIMENSIONS } from '@/constants';

export function useResponsiveDimensions(): ChartDimensions {
  const [dimensions, setDimensions] = useState<ChartDimensions>(CHART_DIMENSIONS);

  useEffect(() => {
    const updateDimensions = () => {
      const width = Math.min(
        window.innerWidth - 48, // Account for padding
        CHART_DIMENSIONS.width
      );
      
      let height: number = CHART_DIMENSIONS.height;
      if (window.innerWidth < BREAKPOINTS.md) {
        height = Math.max(280, height * 0.8);
      }

      setDimensions({
        width,
        height,
        margin: CHART_DIMENSIONS.margin,
      });
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  return dimensions;
}
