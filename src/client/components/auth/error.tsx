/** @jsx jsx */
import {jsx} from '@emotion/react';
import {motion, Variants} from 'framer-motion';
import {nanoid} from 'nanoid';
import {ReactNode} from 'react';

type Props = {
  visible?: boolean;
  children: ReactNode;
};

// const variants: Variants = {
//   hidden: {
//     opacity: 0,
//   },
//   visible: {
//     opacity: 1,
//   },
// };

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
        // visibility: props.visible ? 'visible' : 'hidden',
        // minHeight: '16px',
      }}
    >
      {props.children}
    </motion.div>
  );
};
