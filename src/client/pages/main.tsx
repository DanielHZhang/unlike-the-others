/** @jsx jsx */
import {css, jsx} from '@emotion/react';
import {FC, Suspense} from 'react';
import {useLocation} from 'wouter';
import {AnimatePresence} from 'framer-motion';
import {HomePage} from 'src/client/pages/home';
import {LoginPage} from 'src/client/pages/login';
import {SignUpPage} from 'src/client/pages/sign-up';
import {Flex, Icon} from 'src/client/components/base';
import {useRecoilValue} from 'recoil';
import {asyncAtoms, atoms} from 'src/client/store';
import {axios} from 'src/client/network';
import {useAsyncAtomValue} from 'src/client/hooks';

export const MainPage: FC = () => {
  const [location, setLocation] = useLocation();
  const user = useAsyncAtomValue(asyncAtoms.user);
  // const user = useRecoilValue(atoms.user);

  const onClick = async () => {
    const response = await axios.delete('/api/auth/logout');
    if (response.data.success) {
      setLocation('/');
      window.location.reload();
    }
  };

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
      <Suspense fallback={<div>Loading...</div>}>
        <AnimatePresence exitBeforeEnter={true}>{renderLocationMatch(location)}</AnimatePresence>
      </Suspense>
    </Flex>
  );
};
