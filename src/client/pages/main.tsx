/** @jsx jsx */
import {jsx} from '@emotion/react';
import {AnimatePresence} from 'framer-motion';
import {FC} from 'react';
// import {Route, RouteComponentProps} from 'react-router-dom';
import {HomeLayout} from 'src/client/components/layout';
import {PresenceSwitch} from 'src/client/components/routes/presence-switch';
import {useDidMount} from 'src/client/hooks';
import {HomePage} from 'src/client/pages/home';
import {LoginPage} from 'src/client/pages/login';
import {SignUpPage} from 'src/client/pages/sign-up';
import {useRoute} from 'wouter';

type Props = /* RouteComponentProps<any> & */ {};

export const MainPage: FC<Props> = (props) => {
  useDidMount(() => {
    console.log('mounting main page');
    return () => {
      console.log('unmounting main page');
    };
  });
  // <Route key='/sign-up' exact={true} path='/sign-up' />
  // <Route
  //   key='/login'
  //   exact={true}
  //   path='/login'
  //   children={({match, ...rest}) => {
  //     console.log('what is this:', match, rest);
  //     return (
  //       <AnimatePresence
  //         /* exitBeforeEnter={true} */ onExitComplete={() => console.log('exit completed')}
  //       >
  //         {match && <LoginPage match={match} {...rest} />}
  //       </AnimatePresence>
  //     );
  //   }}
  // />
  const [matchHome] = useRoute('/');
  const [matchLogin] = useRoute('/login');

  console.log('path:', matchHome, matchLogin);
  return (
    <HomeLayout>
      <AnimatePresence exitBeforeEnter={true}>
        {console.log('why doesnt this rerender', matchHome)}
        {matchHome ? <HomePage key='homepage' /> : <LoginPage key='login' />}
        {/* {matchLogin && <LoginPage key='login' />} */}
      </AnimatePresence>
    </HomeLayout>
  );
};
