// src/components/ErrorBoundary.jsx
import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render shows fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // You could log errorInfo to an error reporting service
    console.error('ErrorBoundary caught an error', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-screen items-center justify-center bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white">
          <div className="p-8 bg-black bg-opacity-60 rounded-lg shadow-lg backdrop-blur-md">
            <h2 className="text-2xl font-bold mb-4">Something went wrong.</h2>
            <p className="mb-2">{this.state.error?.toString()}</p>
            <button
              className="mt-4 rounded bg-primary px-4 py-2 text-white hover:bg-primary/90"
              onClick={() => window.location.reload()}
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

export default ErrorBoundary;
