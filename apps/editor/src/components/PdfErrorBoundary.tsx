import { Component } from "react";
import type { ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  pageWidth?: number;
  pageHeight?: number;
  resetKey?: string;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class PdfErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("PDF Rendering Error:", error, errorInfo);
  }

  componentDidUpdate(prevProps: Props) {
    if (
      this.state.hasError &&
      this.props.resetKey !== undefined &&
      prevProps.resetKey !== this.props.resetKey
    ) {
      this.setState({ hasError: false, error: null });
    }
  }

  render() {
    if (this.state.hasError) {
      const pageWidth = this.props.pageWidth ?? 400;
      const pageHeight = this.props.pageHeight ?? 565;

      return (
        this.props.fallback ?? (
          <div
            className="grid place-items-center rounded bg-rose-50 text-xs text-rose-400 p-4"
            style={{ width: pageWidth, height: pageHeight }}
          >
            <div className="text-center">
              <p>Failed to render PDF</p>
              <p className="text-rose-300 mt-1">Try resizing or reloading</p>
            </div>
          </div>
        )
      );
    }

    return this.props.children;
  }
}
