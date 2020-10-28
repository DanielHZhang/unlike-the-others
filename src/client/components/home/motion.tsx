/** @jsx jsx */
import {jsx} from '@emotion/react';
import {motion} from 'framer-motion';
import {ReactNode} from 'react';
import {childVariants} from 'src/client/components/animation/route';

type Props = {children: ReactNode};

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
