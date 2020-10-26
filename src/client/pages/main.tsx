/** @jsx jsx */
import {css, jsx} from '@emotion/react';
import {FC} from 'react';
import {useLocation} from 'wouter';
import {AnimatePresence} from 'framer-motion';
import {HomePage} from 'src/client/pages/home';
import {LoginPage} from 'src/client/pages/login';
import {SignUpPage} from 'src/client/pages/sign-up';
import {Flex} from 'src/client/components/base';

export const MainPage: FC = () => {
  const [location] = useLocation();

  const renderLocationMatch = (location: string) => {
    switch (location) {
      case '/login':
        return <LoginPage key={location} />;
      case '/sign-up':
        return <SignUpPage key={location} />;
      default:
        return <HomePage key={location} />;
    }
  };

  return (
    <Flex
      flow='column'
      css={css`
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
      <AnimatePresence exitBeforeEnter={true}>{renderLocationMatch(location)}</AnimatePresence>
    </Flex>
  );
};
