// Common data types
export interface Point {
  x: Date
  y: number
}

export interface Series {
  id: string
  values: Point[]
}

export interface ChartDimensions {
  width: number
  height: number
  margin: {
    top: number
    right: number
    bottom: number
    left: number
  }
}

// Stock data types
export interface StockRow {
  date: string
  symbol: string
  close: number
}

// Job data types
export interface JobRow {
  city: string
  skill: string
  postings: number
  avgSalary: number
}

// Framework data types
export interface FrameworkRow {
  date: string
  name: string
  value: number
}

// Chart component props
export interface LineChartProps {
  series: Series[]
  height?: number
  mode?: 'absolute' | 'normalized'
  dimensions?: Partial<ChartDimensions>
}

export interface BubbleChartProps {
  data: JobRow[]
  xTicks: string[]
  height?: number
  dimensions?: Partial<ChartDimensions>
}

// Tooltip data
export interface TooltipData {
  x: number
  date: Date
  nearest: Array<{
    id: string
    y: number
  }>
}

// Chart mode types
export type ChartMode = 'absolute' | 'normalized'

// Error types
export interface ChartError {
  message: string
  component: string
  timestamp: Date
}
