import styled from '@emotion/styled';
import {Flex} from 'src/client/components/base/flex';

type Props = {
  spacing?: string;
};

export const Stack = styled(Flex)<Props>(({flow = 'row', spacing = '8px'}) => ({
  '& > * + *': {
    marginLeft: flow === 'row' ? spacing : undefined,
    marginTop: flow === 'column' ? spacing : undefined,
  },
}));
