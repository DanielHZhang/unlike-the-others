/** @jsx jsx */
import {jsx} from '@emotion/react';
import {motion} from 'framer-motion';
import {ReactNode} from 'react';
import {childVariants} from 'src/client/components/animation/route-transition';

type Props = {children: ReactNode};

export const MotionFlex = (props: Props): JSX.Element => {
  return (
    <motion.div
      key='host'
      variants={childVariants}
      css={{display: 'flex', flexFlow: 'column', alignItems: 'stretch'}}
    >
      {props.children}
    </motion.div>
  );
};
