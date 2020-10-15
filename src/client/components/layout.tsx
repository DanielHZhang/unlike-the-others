/** @jsx jsx */
import {css, jsx} from '@emotion/react';
import {FC} from 'react';
import {Flex} from 'src/client/components/base';
import {BackgroundParticles} from 'src/client/components/particles';
import {useDidMount} from 'src/client/hooks';

export const HomeLayout: FC = ({children}) => {
  useDidMount(() => {
    console.log('home layout mounting');
    return () => {
      console.log('home layout unmounting');
    };
  });

  return (
    <Flex
      flow='column'
      css={css`
        background: black;
        color: white;
        min-height: 100%;
        position: relative;
        z-index: 0; /* Allow tsparticles to appear with z-index -1 */
      `}
    >
      <div css={{height: '64px'}} />
      <div
        css={{
          margin: '3rem 0',
          textAlign: 'center',
          font: '84px Simplifica',
          color: 'white',
          letterSpacing: '0.2em',
        }}
      >
        UNLIKE the OTHERS
      </div>
      {children}
    </Flex>
  );
};
