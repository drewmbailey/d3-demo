import { useMemo } from 'react'
import { ChartDimensions } from '@/types'
import { CHART_DIMENSIONS } from '@/constants'

export function useChartDimensions(
  customDimensions?: Partial<ChartDimensions>
): ChartDimensions {
  return useMemo(() => ({
    width: customDimensions?.width ?? CHART_DIMENSIONS.width,
    height: customDimensions?.height ?? CHART_DIMENSIONS.height,
    margin: {
      top: customDimensions?.margin?.top ?? CHART_DIMENSIONS.margin.top,
      right: customDimensions?.margin?.right ?? CHART_DIMENSIONS.margin.right,
      bottom: customDimensions?.margin?.bottom ?? CHART_DIMENSIONS.margin.bottom,
      left: customDimensions?.margin?.left ?? CHART_DIMENSIONS.margin.left,
    },
  }), [customDimensions])
}
