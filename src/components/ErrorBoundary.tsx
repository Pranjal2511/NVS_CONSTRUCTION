import React from 'react';
export default class ErrorBoundary extends React.Component<React.PropsWithChildren, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    if (this.state.failed) return <main className="min-h-screen bg-[#0a0f18] text-white flex flex-col items-center justify-center gap-4" role="alert"><h1>Unable to display this page</h1><p>Please reload and try again.</p><button className="text-[#c2a649]" onClick={() => window.location.reload()}>Reload page</button></main>;
    return this.props.children;
  }
}
