import React from 'react';

type TErrorBoundaryProps = {
  fallback: React.ReactNode;
  children?: React.ReactNode;
  logError: (errorMessage: string, componentStack: string) => void;
};

type TErrorBoundaryState = {
  hasError: boolean;
};

export default class ErrorBoundary extends React.Component<
  TErrorBoundaryProps,
  TErrorBoundaryState
> {
  constructor(props: TErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): TErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo): void {
    const { message } = error;
    const { componentStack } = info;
    const { logError } = this.props;

    logError(message, componentStack);
  }

  render(): React.ReactNode {
    const { hasError } = this.state;
    const { fallback, children } = this.props;

    if (hasError) {
      return fallback;
    }

    return children;
  }
}
