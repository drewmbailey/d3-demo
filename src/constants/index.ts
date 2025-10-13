// Chart dimensions and styling constants
export const CHART_DIMENSIONS = {
  width: 1100,
  height: 360,
  bubbleHeight: 380,
  margin: {
    top: 20,
    right: 24,
    bottom: 36,
    left: 48,
  },
  bubbleMargin: {
    top: 20,
    right: 24,
    bottom: 64,
    left: 64,
  }
} as const

// Animation and interaction constants
export const ANIMATION = {
  duration: 300,
  ease: 'ease-in-out' as const,
  zoomScaleExtent: [1, 8] as [number, number],
  zoomTranslateExtent: [[0, 0], [CHART_DIMENSIONS.width, CHART_DIMENSIONS.height]] as [[number, number], [number, number]]
} as const

// Color schemes
export const COLORS = {
  scheme: 'tableau10',
  primary: '#6366f1', // indigo-500
  secondary: '#64748b', // slate-500
  background: '#0a0a0a', // neutral-950
  surface: '#171717', // neutral-900
  border: '#262626', // neutral-800
  text: {
    primary: '#fafafa', // neutral-50
    secondary: '#a3a3a3', // neutral-400
    muted: '#737373', // neutral-500
  }
} as const

// Responsive breakpoints
export const BREAKPOINTS = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
} as const

// Data limits
export const DATA_LIMITS = {
  maxVisibleSeries: 10,
  maxTooltipItems: 8,
  minDataPoints: 2,
} as const

// Accessibility constants
export const A11Y = {
  chartRole: 'img',
  tablistRole: 'tablist',
  tabRole: 'tab',
  tabpanelRole: 'tabpanel',
  chartLabel: 'Interactive data visualization',
} as const
