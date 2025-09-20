import React from 'react';

// Simple error boundary to isolate module failures
export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // Optionally log to a monitoring service
    // console.error('Module crashed:', error, info);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="alert alert-danger" role="alert" style={{ margin: 16 }}>
          <div><strong>Este módulo encontró un error.</strong></div>
          <div className="small" style={{ whiteSpace: 'pre-wrap' }}>{String(this.state.error?.message || this.state.error || 'Error')}</div>
          <button type="button" className="btn btn-sm btn-outline-light mt-2" onClick={this.handleReset}>Reintentar</button>
        </div>
      );
    }
    return this.props.children;
  }
}
