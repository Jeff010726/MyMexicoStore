import React from 'react';
import { ErrorHandler, ErrorSeverity } from '../utils/errorHandling';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallbackComponent: React.ComponentType<{ error: Error; resetError: () => void }>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // 捕获错误并发送到错误处理系统
    ErrorHandler.getInstance().captureRenderingError(
      error,
      this.constructor.name,
      {},
      ErrorSeverity.HIGH,
      {
        component: this.constructor.name,
        additionalData: { errorInfo }
      }
    );

    // 调用自定义错误处理函数
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  resetError = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      const FallbackComponent = this.props.fallbackComponent;
      return <FallbackComponent error={this.state.error} resetError={this.resetError} />;
    }

    return this.props.children;
  }
}

// 创建错误边界组件的辅助函数
export const createErrorBoundary = (
  fallbackComponent: React.ComponentType<{ error: Error; resetError: () => void }>,
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
) => {
  return (props: { children: React.ReactNode }) => (
    <ErrorBoundary
      fallbackComponent={fallbackComponent}
      onError={onError}
    >
      {props.children}
    </ErrorBoundary>
  );
};

export default ErrorBoundary;