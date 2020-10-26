/** @jsx jsx */
import {jsx} from '@emotion/react';
import {motion} from 'framer-motion';
import {ReactNode} from 'react';

type Props = {
  children: ReactNode;
};

export const FieldError = (props: Props): JSX.Element => {
  return (
    <motion.div
      initial={{opacity: 0}}
      animate={{opacity: 1}}
      exit={{opacity: 0}}
      css={{
        marginTop: 8,
        textAlign: 'right',
        fontSize: '0.9em',
        color: '#ff4d4f',
      }}
    >
      {props.children}
    </motion.div>
  );
};
