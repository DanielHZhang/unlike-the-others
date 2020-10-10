import styled from '@emotion/styled';
import {Flex} from 'src/client/components/base';

export const Layout = styled(Flex)`
  background: black;
  color: white;
  height: 100%;
  position: relative;
  z-index: 0; /* Allow tsparticles to appear with z-index -1 */
`;
