/** @jsx jsx */
import {jsx} from '@emotion/react';
import {motion, useAnimation, useIsPresent, usePresence} from 'framer-motion';
import {Flex, MotionFlex} from 'src/client/components/base';
import {Title} from 'src/client/components/title';
import {FingerprintSpinner} from 'src/client/components/spinner/fingerprint';
import {useEffect} from 'react';

const loadingText = Array.from('Loading . . .');
const initial = {
  rotate: -90,
  opacity: 0,
};

export const GameLoading = (): JSX.Element => {
  // const [isPresent, safeToRemove] = usePresence();
  const letterAnimation = useAnimation();
  // const transitionAnimation = useAnimation();

  // console.log(isPresent, safeToRemove);
  // useEffect(() => {
  //   if (!isPresent) {
  //     letterAnimation.stop();
  //   }
  // }, [isPresent]);

  async function animateLoop() {
    for (;;) {
      // Start state
      await letterAnimation.start(() => initial);
      // Start -> visible state
      await letterAnimation.start((i) => ({
        rotate: 0,
        opacity: 1,
        transition: {
          delay: 0.15 * i,
          duration: 0.8,
          repeatType: 'loop',
        },
      }));
      // Visible -> end state
      await letterAnimation.start((i) => ({
        rotate: 90,
        opacity: 0,
        transition: {
          ease: 'easeOut',
          delay: 1 + 0.1 * i, // Delay between each letter
          duration: 0.4, // Duration for each letter
        },
      }));
    }
  }

  animateLoop();

  return (
    <Flex flow='column' css={{width: '100%', paddingBottom: '10rem', zIndex: 2}}>
      <motion.div key='anim-title' exit={{opacity: 0}} css={{margin: '3rem 0'}}>
        <Title animate={false} fontSize={48} />
      </motion.div>
      <MotionFlex flow='column' mainAxis='center' crossAxis='center' grow={1} exit={{opacity: 0}}>
        <FingerprintSpinner color='#fff' duration={2500} />
        <Flex
          mainAxis='center'
          css={{
            marginTop: 32,
            letterSpacing: '0.5rem',
            fontSize: 20,
            // fontFamily: 'Simplifica',
            // fontWeight: 500,
          }}
        >
          {loadingText.map((letter, index) => (
            <motion.div
              key={index}
              custom={index}
              initial={initial}
              animate={letterAnimation}
              css={{position: 'relative', height: 20}}
            >
              {letter === ' ' ? '\u00A0' : letter}
            </motion.div>
          ))}
        </Flex>
      </MotionFlex>
    </Flex>
  );
};
