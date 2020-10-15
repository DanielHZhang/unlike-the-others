import Axios from 'axios';
import {AnimatePresence} from 'framer-motion';
import {nanoid} from 'nanoid';
import React from 'react';
import {hot} from 'react-hot-loader/root';
// import {Switch, Route, useLocation} from 'react-router-dom';
import {useSetRecoilState} from 'recoil';
import {HomeLayout} from 'src/client/components/layout';
import {PresenceSwitch} from 'src/client/components/routes/presence-switch';
import {useAsyncEffect} from 'src/client/hooks';
import {GamePage} from 'src/client/pages/game';
import {HomePage} from 'src/client/pages/home';
import {LoginPage} from 'src/client/pages/login';
import {MainPage} from 'src/client/pages/main';
import {routes} from 'src/client/routes';
import {atoms} from 'src/client/store';
import {Route, Switch} from 'wouter';

const App = () => {
  const setUser = useSetRecoilState(atoms.user);

  useAsyncEffect(async () => {
    const [accessRes, csrfRes] = await Promise.allSettled([
      Axios.get('/api/auth/access'),
      Axios.get('/api/auth/csrf'),
    ]);
    const {headers} = Axios.defaults;
    if (accessRes.status === 'fulfilled') {
      const {accessToken, isGuest} = accessRes.value.data as {
        accessToken: string;
        isGuest: boolean;
      };
      headers.common.authorization = accessToken;
      setUser((state) => ({...state, accessToken, isGuest}));
    }
    if (csrfRes.status === 'fulfilled') {
      const csrfToken = csrfRes.value.data as string;
      const headerKey = 'x-csrf-token';
      headers.post[headerKey] = headers.put[headerKey] = headers.delete[headerKey] = csrfToken;
    }
  }, []);

  // {routes.map((props, index) => (
  //   <Route key={index} {...props} />
  // ))}

  // const location = useLocation();

  //   <Route
  // render={({location, match}) => {
  //   console.log(
  //     'Router matched',
  //     match.url,
  //     match.path,
  //     'and was at location',
  //     location.pathname
  //   );
  //   return (
  //     <HomeLayout>
  //       {/* <Switch location={location} key={location.pathname}> */}
  //       <Route key='/' exact={true} path='/' component={HomePage} />
  //       {/* </Switch> */}
  //     </HomeLayout>
  //   );
  // }}
  // />

  return (
    // <AnimatePresence exitBeforeEnter={true} initial={false}>
    <Switch /* key={nanoid()} */>
      {/* <Route key='/game' path='/game' component={GamePage} /> */}
      {/* <Route key='/login' path='/login' component={LoginPage} /> */}
      <Route key='/' path={['/', '/login']} component={MainPage} />
    </Switch>
    // </AnimatePresence>
  );
};

export default hot(App);
