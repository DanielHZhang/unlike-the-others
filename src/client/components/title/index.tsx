/** @jsx jsx */
import {jsx} from '@emotion/react';
import {motion, Variants} from 'framer-motion';
import {MotionFlex} from 'src/client/components/base';

const title = Array.from('UNLIKE the OTHERS');
const numbersX: number[] = [];
const numbersY: number[] = [];
const numbersZ: number[] = [];

for (let i = 0; i < title.length; i++) {
  const j = Math.random() * 2 - 1;
  const k = Math.random() * 2 - 1;
  const l = Math.random() * 2 - 1;
  numbersX.push(j);
  numbersY.push(k);
  numbersZ.push(l);
}

const containerVariants: Variants = {
  visible: {
    transition: {
      // staggerChildren: 0.3,
      // ease: 'circIn',
      // duration: 0.8,
      // staggerChildren: 1,
      // repeat: Infinity,
      // repeatType: 'mirror',
    },
  },
};

const childVariants = (index: number): Variants => ({
  hidden: {
    // opacity: 0,
    x: -1000,
    y: 50,
    rotateX: 180 * numbersX[index],
    rotateY: 180 * numbersY[index],
    rotateZ: 180 * numbersZ[index],
  },
  visible: {
    // opacity: 1,
    x: 0,
    y: 0,
    rotateX: 0,
    rotateY: 0,
    rotateZ: 0,
    transition: {
      ease: 'circIn',
      // delay: index * 0.1,
      // duration: 0.8,
      // duration: 8,
      delay: 2 - 0.08 * index,
    },
  },
});

// const childVariants: Variants = {
//   hidden: {
//     opacity: 0,
//     y: 30,
//     rotate: -90,
//     x: -50,
//   },
//   visible: {
//     opacity: 1,
//     x: 0,
//     y: 0,
//     // rotate: 0,
//     rotateX: 180 * numbersX[i],
//     rotateY: 180 * numbersY[i],
//     rotateZ: 180 * numbersZ[i],
//   },
// };

export const Title = (): JSX.Element => {
  return (
    <MotionFlex
      // initial='hidden'
      // animate='visible'
      // variants={containerVariants}
      mainAxis='center'
      css={{
        font: '84px Simplifica',
        color: 'white',
        letterSpacing: '0.2em',
        width: '100%',
        overflow: 'hidden',
        height: 84,
      }}
    >
      {title.map((letter, index) => (
        <motion.div
          key={index}
          initial={{
            opacity: 0,
            x: -100,
            y: 40,
            rotateX: 180 * numbersX[index],
            rotateY: 180 * numbersY[index],
            rotateZ: 180 * numbersZ[index],
          }}
          animate={{
            opacity: 1,
            x: 0,
            y: 0,
            rotateX: 0,
            rotateY: 0,
            rotateZ: 0,
            transition: {
              ease: 'circOut',
              duration: 0.8,
              delay: 0.2 + 0.08 * index,
            },
          }}
          // variants={childVariants(index)}
          css={{width: 'auto', height: 84, position: 'relative'}}
        >
          {letter === ' ' ? '\u00A0' : letter}
        </motion.div>
      ))}
    </MotionFlex>
  );
};
