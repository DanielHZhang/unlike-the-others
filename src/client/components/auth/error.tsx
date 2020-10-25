/** @jsx jsx */
import {jsx} from '@emotion/react';
import {ReactNode} from 'react';

type Props = {
  children: ReactNode;
};

export const FieldError = (props: Props): JSX.Element => {
  return (
    <div css={{marginTop: 8, textAlign: 'right', fontSize: '0.9em', color: 'red'}}>
      {props.children}
    </div>
  );
};
