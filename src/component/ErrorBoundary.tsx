import React, { Component, ErrorInfo } from "react";

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<{ children: React.ReactNode }, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(_error: Error, errorInfo: ErrorInfo) {
    console.error("Error caught by ErrorBoundary: ", errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <h1>Something went wrong.</h1>;
    }
    return this.props.children;
  }
}

export default ErrorBoundary;

