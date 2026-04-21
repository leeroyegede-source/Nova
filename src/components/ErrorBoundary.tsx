"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children?: ReactNode;
  fallback?: ReactNode;
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
    console.error("Uncaught error:", error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div className="flex flex-col items-center justify-center p-8 bg-black/50 text-white rounded-xl border border-red-500/30 overflow-hidden w-full h-full">
          <div className="text-red-400 mb-4 font-bold text-xl flex items-center gap-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
            Oops! The preview crashed.
          </div>
          <div className="text-gray-400 mb-4 text-center max-w-md">
            The code generated a runtime error that broke the preview sandbox. This is likely due to a syntax error or a missing dependency in the generated code.
          </div>
          <div className="bg-red-950/30 p-4 rounded-lg border border-red-500/20 text-xs font-mono w-full max-w-2xl overflow-auto text-left text-red-200">
            {this.state.error?.message || "Unknown error"}
          </div>
          <button 
            onClick={() => this.setState({ hasError: false, error: null })}
            className="mt-6 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-colors border border-white/20 text-sm"
          >
            Try rendering again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
