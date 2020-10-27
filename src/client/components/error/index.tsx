import React, {Component, ReactNode} from 'react';

type State = {
  hasError: boolean;
  error: Error | null;
};

type Props = {
  fallback: ReactNode;
  children: ReactNode;
};

export class ErrorBoundary extends Component<Props, State> {
  public state = {hasError: false, error: null};

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  public render(): ReactNode {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}
