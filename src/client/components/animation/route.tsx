import React, {ReactNode} from 'react';
import {motion, Variants} from 'framer-motion';

const containerVariants: Variants = {
  visible: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0,
      duration: 0.3,
    },
  },
  exit: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0,
      duration: 0.3,
    },
  },
};

export const childVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 40,
  },
  visible: {
    opacity: 1,
    y: 0,
  },
  exit: {
    opacity: 0,
    y: -40,
  },
};

type Props = {children: ReactNode};

export const RouteTransition = (props: Props): JSX.Element => {
  return (
    <motion.div
      key='container'
      initial='hidden'
      animate='visible'
      exit='exit'
      variants={containerVariants}
    >
      {props.children}
    </motion.div>
  );
};
