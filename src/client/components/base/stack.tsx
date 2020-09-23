import styled from '@emotion/styled';
import {css} from '@emotion/react';
import {Flex} from 'src/client/components/base/flex';

type Props = {
  spacing?: string;
};

export const Stack = styled(Flex)<Props>(
  ({flow, spacing = '8px'}) => css`
    & > * + * {
      margin-left: ${flow === 'row' ? spacing : undefined};
      margin-top: ${flow === 'column' ? spacing : undefined};
    }
  `
);
