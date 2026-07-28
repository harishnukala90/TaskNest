import { Component } from "react";

/**
 * ErrorBoundary - Catches JavaScript errors anywhere in the child component tree
 * Displays a fallback UI instead of crashing the whole app
 */
export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render shows the fallback UI
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Log error information for debugging
    console.error("🐛 ErrorBoundary caught an error:", error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
    
    // You can also log to an error reporting service here
    // logErrorToMyService(error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '2rem',
          textAlign: 'center',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          backgroundColor: 'var(--bg-color, #f5f5f5)',
          color: 'var(--text-color, #333)'
        }}>
          <div style={{
            backgroundColor: 'white',
            padding: '3rem',
            borderRadius: '16px',
            boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
            maxWidth: '500px'
          }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>😱</div>
            <h1 style={{ 
              fontSize: '1.5rem', 
              marginBottom: '1rem',
              color: '#e74c3c'
            }}>
              Oops! Something went wrong
            </h1>
            <p style={{ 
              color: '#666', 
              marginBottom: '1.5rem',
              lineHeight: '1.6'
            }}>
              We encountered an unexpected error. Our team has been notified.
            </p>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details style={{
                textAlign: 'left',
                marginBottom: '1.5rem',
                padding: '1rem',
                backgroundColor: '#f8f9fa',
                borderRadius: '8px',
                fontSize: '0.875rem',
                overflow: 'auto'
              }}>
                <summary style={{ cursor: 'pointer', fontWeight: 'bold' }}>
                  Error Details
                </summary>
                <pre style={{ 
                  marginTop: '0.5rem',
                  overflow: 'auto',
                  maxHeight: '200px'
                }}>
                  {this.state.error.toString()}
                  {'\n\n'}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
            <button
              onClick={this.handleReload}
              style={{
                padding: '0.75rem 2rem',
                fontSize: '1rem',
                fontWeight: '600',
                color: 'white',
                backgroundColor: '#3498db',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'background-color 0.2s'
              }}
              onMouseOver={(e) => e.target.style.backgroundColor = '#2980b9'}
              onMouseOut={(e) => e.target.style.backgroundColor = '#3498db'}
            >
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
