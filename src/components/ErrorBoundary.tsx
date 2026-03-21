import React, { ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export default class ErrorBoundary extends React.Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  public render() {
    if (this.state.hasError) {
      let errorMessage = "حدث خطأ غير متوقع.";
      let errorDetails = "";

      if (this.state.error) {
        try {
          const parsedError = JSON.parse(this.state.error.message);
          if (parsedError.error && parsedError.error.includes("Missing or insufficient permissions")) {
            errorMessage = "عذراً، ليس لديك الصلاحية للقيام بهذا الإجراء.";
          } else if (parsedError.error) {
            errorMessage = parsedError.error;
          }
          errorDetails = JSON.stringify(parsedError, null, 2);
        } catch (e) {
          errorMessage = this.state.error.message;
        }
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4" dir="rtl">
          <div className="max-w-lg w-full bg-white p-8 rounded-2xl shadow-sm border border-red-100 text-center">
            <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">عذراً، حدث خطأ ما</h1>
            <p className="text-gray-600 mb-6">{errorMessage}</p>
            
            {errorDetails && (
              <div className="mt-6 text-left">
                <details className="text-sm text-gray-500 bg-gray-50 p-4 rounded-lg overflow-auto">
                  <summary className="cursor-pointer font-medium mb-2 text-right">تفاصيل الخطأ</summary>
                  <pre className="whitespace-pre-wrap text-left" dir="ltr">{errorDetails}</pre>
                </details>
              </div>
            )}
            
            <button
              onClick={() => window.location.href = '/'}
              className="mt-8 px-6 py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-colors"
            >
              العودة للرئيسية
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
