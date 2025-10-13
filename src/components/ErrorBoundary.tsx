import React, { Component, ErrorInfo, ReactNode } from 'react'
import { ChartError } from '@/types'

interface Props {
  children: ReactNode
  fallback?: ReactNode
  onError?: (error: ChartError) => void
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const chartError: ChartError = {
      message: error.message,
      component: errorInfo.componentStack || 'Unknown',
      timestamp: new Date()
    }
    
    this.props.onError?.(chartError)
    console.error('Chart Error:', chartError, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <div className="flex items-center justify-center p-8 bg-neutral-900/50 border border-neutral-800 rounded-2xl">
          <div className="text-center">
            <div className="text-red-400 mb-2">
              <svg className="w-8 h-8 mx-auto" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-neutral-100 mb-1">
              Chart Error
            </h3>
            <p className="text-neutral-400 text-sm mb-4">
              Something went wrong while rendering the chart.
            </p>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

// Hook for error handling
export function useErrorHandler() {
  const [errors, setErrors] = React.useState<ChartError[]>([])

  const handleError = React.useCallback((error: ChartError) => {
    setErrors(prev => [...prev.slice(-9), error]) // Keep last 10 errors
  }, [])

  const clearErrors = React.useCallback(() => {
    setErrors([])
  }, [])

  return { errors, handleError, clearErrors }
}
