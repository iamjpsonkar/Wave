import { Component, type ErrorInfo, type ReactNode } from 'react';
import { reportDiagnostic } from './diagnostics';

type Props = { children: ReactNode };
type State = { failed: boolean };

export default class DiagnosticsErrorBoundary extends Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(error: Error, _info: ErrorInfo): void {
    reportDiagnostic('error', 'ui:render-failed', {
      errorName: error.name || 'Error',
      boundary: 'root'
    });
  }

  render() {
    if (this.state.failed) {
      return <main role="alert" className="app-crash-fallback">
        <h1>Wave could not display this workspace</h1>
        <p>Your local files have not been changed by this error. Reload Wave to try again.</p>
        <button type="button" onClick={() => window.location.reload()}>Reload Wave</button>
      </main>;
    }
    return this.props.children;
  }
}
