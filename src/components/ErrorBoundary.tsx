import { Component, ErrorInfo, ReactNode } from 'react';
import { AlertOctagon, RotateCcw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('KeJaTrust React ErrorBoundary caught an unhandled error:', error, errorInfo);
  }

  private handleResetState = () => {
    try {
      localStorage.removeItem('kejatrust_current_user_id');
      localStorage.removeItem('kejatrust_reviews');
      localStorage.removeItem('kejatrust_properties');
      localStorage.removeItem('kejatrust_disputes');
      localStorage.removeItem('kejatrust_crypto_logs');
    } catch {
      // ignore
    }
    window.location.reload();
  };

  private handleReload = () => {
    window.location.reload();
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div
          id="error-boundary-screen"
          className="min-h-screen bg-neutral-950 text-neutral-100 flex items-center justify-center p-6"
        >
          <div className="max-w-md w-full bg-neutral-900 border border-neutral-800 rounded-3xl p-8 space-y-6 shadow-2xl text-center">
            <div className="w-14 h-14 bg-red-950/80 border border-red-800/60 rounded-2xl flex items-center justify-center mx-auto text-red-400">
              <AlertOctagon className="w-7 h-7" />
            </div>

            <div className="space-y-2">
              <h1 className="text-xl font-black text-white tracking-tight">
                Application Recovery Shield
              </h1>
              <p className="text-xs text-neutral-400 leading-relaxed">
                An unexpected interface anomaly occurred. KeJaTrust isolated the error to safeguard your local state and cryptographic partitions.
              </p>
            </div>

            {this.state.error && (
              <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 text-left font-mono text-[11px] text-red-300 break-words max-h-28 overflow-y-auto">
                {this.state.error.message || 'Unknown runtime exception'}
              </div>
            )}

            <div className="space-y-3 pt-2">
              <button
                type="button"
                onClick={this.handleReload}
                className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-[0.98]"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Reload Application</span>
              </button>

              <button
                type="button"
                onClick={this.handleResetState}
                className="w-full py-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-300 font-semibold text-xs flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
              >
                <Home className="w-3.5 h-3.5" />
                <span>Clear Local Cache & Reset</span>
              </button>
            </div>

            <p className="text-[10px] text-neutral-500">
              Privacy Protected · Fair Review Protocol Compliant
            </p>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
