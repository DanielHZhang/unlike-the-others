/** @jsx jsx */
import {jsx} from '@emotion/react';
import {motion, useAnimation} from 'framer-motion';
import {Flex} from 'src/client/components/base';
import {Title} from 'src/client/components/title';
import {FingerprintSpinner} from 'src/client/components/spinner/fingerprint';

const loadingText = Array.from('Loading . . .');
const initial = {
  rotate: -90,
  opacity: 0,
};

export const GameLoading = (): JSX.Element => {
  const letterAnimation = useAnimation();

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
    <Flex flow='column' css={{width: '100%', paddingBottom: '10rem'}}>
      <div css={{margin: '3rem 0'}}>
        <Title animate={false} fontSize={48} />
      </div>
      <Flex flow='column' mainAxis='center' crossAxis='center' grow={1}>
        <FingerprintSpinner color='#fff' duration={2500} />
        <Flex
          mainAxis='center'
          css={{
            marginTop: 32,
            letterSpacing: '0.5rem',
            // fontFamily: 'Simplifica',
            fontSize: 20,
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
      </Flex>
    </Flex>
  );
};
