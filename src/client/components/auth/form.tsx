import React, {ReactNode} from 'react';
import {FormProvider, UseFormMethods, SubmitHandler, SubmitErrorHandler} from 'react-hook-form';

type Props = {
  methods: UseFormMethods<Record<string, any>>;
  children: ReactNode;
  onValidSubmit: SubmitHandler<Record<string, any>>;
  onInvalidSubmit?: SubmitErrorHandler<Record<string, any>>;
};

const Form = (props: Props): JSX.Element => {
  return (
    <FormProvider {...props.methods}>
      <form onSubmit={props.methods.handleSubmit(props.onValidSubmit, props.onInvalidSubmit)}>
        {props.children}
      </form>
    </FormProvider>
  );
};
