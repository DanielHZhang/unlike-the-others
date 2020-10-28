/** @jsx jsx */
import {jsx} from '@emotion/react';
import {motion} from 'framer-motion';
import {ReactNode} from 'react';
import {childVariants} from 'src/client/components/animation/route-transition';

type Props = {children: ReactNode; /* name: string */};

export const MotionFlex = (props: Props): JSX.Element => {
  // console.log('got key:', props.name);
  return (
    <motion.div
      // key={props.name}
      // key='host'
      variants={childVariants}
      css={{display: 'flex', flexFlow: 'column', alignItems: 'stretch'}}
    >
      {props.children}
    </motion.div>
  );
};
