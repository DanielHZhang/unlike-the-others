/** @jsx jsx */
import {css, jsx} from '@emotion/react';
import {Suspense} from 'react';
import {useLocation} from 'wouter';
import {AnimatePresence} from 'framer-motion';
import {HomePage} from 'src/client/pages/home';
import {LoginPage} from 'src/client/pages/login';
import {SignUpPage} from 'src/client/pages/sign-up';
import {Flex, Icon} from 'src/client/components/base';
import {asyncAtoms} from 'src/client/store';
import {axios} from 'src/client/network';
import {useAsyncAtomValue} from 'src/client/hooks';
import {FingerprintSpinner} from 'src/client/components/spinner/fingerprint';

export const MainPage = (): JSX.Element => {
  const [location, setLocation] = useLocation();
  const user = useAsyncAtomValue(asyncAtoms.user);

  const onClick = async () => {
    try {
      await axios.delete('/api/auth/logout');
      setLocation('/');
    } catch (error) {
      console.error(error);
    }
    window.location.reload(); // Reload the page to signal logout confirmed
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
      <Flex crossAxis='stretch' mainAxis='flex-end' css={{height: '64px'}}>
        <Flex css={{padding: '0 2rem'}}>
          {user?.isAuthed && (
            <Flex crossAxis='center' onClick={onClick}>
              <Icon.User color='#fff' />
              <span css={{marginLeft: 8}}>{user.username}</span>
            </Flex>
          )}
        </Flex>
      </Flex>
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
      <Suspense
        fallback={
          <Flex mainAxis='center' crossAxis='center' css={{marginTop: '8rem'}}>
            <FingerprintSpinner />
          </Flex>
        }
      >
        <AnimatePresence
          exitBeforeEnter={true}
          // onExitComplete={() => console.log('Main page onExitComplete')}
        >
          {(() => {
            const key = `anim-${location}`;
            switch (location) {
              case '/login':
                return <LoginPage key={key} />;
              case '/sign-up':
                return <SignUpPage key={key} />;
              default:
                return <HomePage key={key} />;
            }
          })()}
        </AnimatePresence>
      </Suspense>
    </Flex>
  );
};
