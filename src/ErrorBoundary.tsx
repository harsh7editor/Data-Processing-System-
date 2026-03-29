import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error(error, info.componentStack);
  }

  render(): ReactNode {
    if (this.state.error) {
      return (
        <div
          style={{
            padding: 24,
            fontFamily: 'system-ui, sans-serif',
            maxWidth: 560,
            margin: '10vh auto',
          }}
        >
          <h1 style={{ fontSize: '1.25rem', marginBottom: 12 }}>Something went wrong</h1>
          <pre
            style={{
              background: '#f1f5f9',
              padding: 12,
              borderRadius: 8,
              overflow: 'auto',
              fontSize: 13,
              whiteSpace: 'pre-wrap',
            }}
          >
            {this.state.error.message}
          </pre>
          <p style={{ marginTop: 16, color: '#64748b', fontSize: 14 }}>
            Open the browser developer console (F12) for the full stack trace.
          </p>
        </div>
      );
    }
    return this.props.children;
  }
}
