import React, {Component} from 'react';

type Props = {};
type State = {
  hasError: boolean;
};

export class ErrorBoundary extends Component<Props, State> {
  public constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
    };
  }

  public static getDerivedStateFromProps(
    nextProps: Props,
    prevState: State
  ): Partial<State> | null {
    return {hasError: true};
  }

  public componentDidCatch(error: any, errorInfo: any) {
    console.log('Error occured in component tree:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return <h1>Something went wrong.</h1>;
    }
    return this.props.children;
  }
}
