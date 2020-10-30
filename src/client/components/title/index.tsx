/** @jsx jsx */
import {jsx} from '@emotion/react';
import {motion} from 'framer-motion';
import {Flex} from 'src/client/components/base';

const title = Array.from('UNLIKE the OTHERS');
const numbers = Array.from({length: 3}, () =>
  Array.from({length: title.length}, () => Math.random() * 2 - 1)
);

type Props = {
  animate?: boolean;
  fontSize?: number;
};

export const Title = ({animate = true, fontSize = 84}: Props): JSX.Element => {
  return (
    <Flex
      mainAxis='center'
      css={{
        color: 'white',
        fontFamily: 'Simplifica',
        fontSize,
        height: fontSize,
        overflow: 'hidden',
        userSelect: 'none',
        width: '100%',
      }}
    >
      {title.map((letter, index) => (
        <motion.div
          key={index}
          initial={
            animate
              ? {
                  opacity: 0,
                  x: -100,
                  y: 40,
                  rotateX: 180 * numbers[0][index],
                  rotateY: 180 * numbers[1][index],
                  rotateZ: 180 * numbers[2][index],
                }
              : false
          }
          animate={{
            opacity: 1,
            x: 0,
            y: 0,
            rotateX: 0,
            rotateY: 0,
            rotateZ: 0,
            transition: {
              ease: 'circOut',
              duration: 0.7,
              delay: 0.07 * index,
            },
          }}
          css={{width: 'auto', height: fontSize, position: 'relative', padding: '0 8px'}}
        >
          {letter === ' ' ? '\u00A0' : letter}
        </motion.div>
      ))}
    </Flex>
  );
};
