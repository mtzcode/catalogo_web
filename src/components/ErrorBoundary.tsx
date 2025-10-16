'use client';

import React from 'react';

function ErrorFallback() {
  return (
    <div className="rounded-xl border bg-white p-6 text-center">
      <div className="text-red-600 font-semibold mb-2">Algo deu errado.</div>
      <div className="text-sm text-gray-600">Tente recarregar a página ou voltar mais tarde.</div>
    </div>
  );
}

type ErrorBoundaryState = { hasError: boolean };

type ErrorBoundaryProps = { children: React.ReactNode };

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(_error: unknown): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: unknown, errorInfo: unknown) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <ErrorFallback />;
    }
    return this.props.children;
  }
}