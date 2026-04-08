import { Component } from 'react'
import type { ReactNode } from 'react'

type Props = {
  children: ReactNode
  fallback?: ReactNode
}

type State = {
  hasError: boolean
}

export default class ErrorBoundary extends Component<Props, State> {
  state: State = {
    hasError: false
  }

  static getDerivedStateFromError () {
    return { hasError: true }
  }

  componentDidCatch (error: unknown, info: unknown) {
    console.error('❌ ErrorBoundary caught an error', error, info)
  }

  render () {
    if (this.state.hasError) {
      return (
        this.props.fallback ?? (
          <div className='min-h-screen flex items-center justify-center bg-slate-950 text-red-400'>
            <div className='text-center space-y-3'>
              <h1 className='text-xl font-semibold'>Something went wrong</h1>
              <p className='text-sm text-slate-400'>
                Please refresh the page or try again later.
              </p>
            </div>
          </div>
        )
      )
    }

    return this.props.children
  }
}
