import React from 'react'

export default class AdminErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, message: '' }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, message: error?.message || 'Unknown error' }
  }

  componentDidCatch(error) {
    console.error('[AdminErrorBoundary]', error)
  }

  handleReload = () => {
    if (typeof window !== 'undefined') {
      window.location.reload()
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6 notranslate" translate="no">
          <div className="max-w-lg w-full rounded-2xl border border-red-200 bg-white p-6 shadow-sm">
            <h1 className="text-xl font-bold text-red-700">Admin runtime error</h1>
            <p className="mt-2 text-sm text-gray-700">
              The admin UI crashed. Disable auto-translate/browser extensions for this page and retry.
            </p>
            <p className="mt-2 text-xs text-gray-500 break-all">{this.state.message}</p>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="px-4 py-2 rounded-lg bg-primary-600 text-white text-sm font-semibold"
              >
                Reload
              </button>
              <a href="/" className="px-4 py-2 rounded-lg border border-gray-200 text-sm font-semibold text-gray-700">
                Go Home
              </a>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
