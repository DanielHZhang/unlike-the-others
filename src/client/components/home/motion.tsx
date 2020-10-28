/** @jsx jsx */
import {jsx} from '@emotion/react';
import styled from '@emotion/styled/types/base';
import {motion} from 'framer-motion';
import {ReactNode} from 'react';
import {childVariants} from 'src/client/components/animation/route-transition';

type Props = {children: ReactNode};

// export const Same = styled(() => <motion.div variants={childVariants} />)`
//   display: flex;
//   flex-flow: column;
//   align-items: stretch;
// `;

// Same.withComponent()

export const MotionFlex = (props: Props): JSX.Element => {
  return (
    <motion.div
      variants={childVariants}
      css={{display: 'flex', flexFlow: 'column', alignItems: 'stretch'}}
    >
      {props.children}
    </motion.div>
  );
};
