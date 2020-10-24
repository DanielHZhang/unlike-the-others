/** @jsx jsx */
import {jsx} from '@emotion/react';
import {FC} from 'react';
import {useLocation} from 'wouter';
import {AnimatePresence} from 'framer-motion';
import {HomePage} from 'src/client/pages/home';
import {LoginPage} from 'src/client/pages/login';
import {SignUpPage} from 'src/client/pages/sign-up';
import {HomeLayout} from 'src/client/components/layout';
import {useDidMount} from 'src/client/hooks';

export const MainPage: FC = () => {
  const [location] = useLocation();

  // useDidMount(() => {
  //   console.log('mounting main page');
  //   return () => {
  //     console.log('unmounting main page');
  //   };
  // });

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
    <HomeLayout>
      <AnimatePresence exitBeforeEnter={true}>{renderLocationMatch(location)}</AnimatePresence>
    </HomeLayout>
  );
};
