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
      // 开发环境下显示详细错误信息
      if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname.includes('127.0.0.1'))) {
        return (
          <div style={{ 
            padding: '20px', 
            margin: '20px', 
            border: '2px solid red', 
            backgroundColor: '#ffe6e6',
            fontFamily: 'monospace',
            whiteSpace: 'pre-wrap'
          }}>
            <h2 style={{ color: 'red', marginBottom: '10px' }}>开发环境 - 详细错误信息</h2>
            <p><strong>错误消息:</strong> {this.state.error.message}</p>
            <p><strong>组件:</strong> {this.constructor.name}</p>
            {this.state.error.stack && (
              <div>
                <strong>错误堆栈:</strong>
                <pre style={{ backgroundColor: '#f0f0f0', padding: '10px', marginTop: '10px', overflow: 'auto' }}>
                  {this.state.error.stack}
                </pre>
              </div>
            )}
            <button 
              onClick={this.resetError}
              style={{ 
                marginTop: '10px', 
                padding: '8px 16px', 
                backgroundColor: '#007bff', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              重试
            </button>
          </div>
        );
      }
      
      // 生产环境使用回退组件
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