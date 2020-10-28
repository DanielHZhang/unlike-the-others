import React, {Component, ReactElement, ReactNode, Suspense} from 'react';

type State = {
  hasError: boolean;
  error: Error | null;
};

type Props = {
  error: ReactElement;
  loading: ReactElement;
  children: ReactNode;
};

export class SuspenseErrorBoundary extends Component<Props, State> {
  public state = {hasError: false, error: null};

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
    };
  }

  public render(): JSX.Element {
    return <Suspense fallback={this.props.loading}>{this.props.children}</Suspense>;
  }
}
