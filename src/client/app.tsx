import Axios from 'axios';
import {AnimatePresence} from 'framer-motion';
import React from 'react';
import {hot} from 'react-hot-loader/root';
import {useSetRecoilState} from 'recoil';
import {HomeLayout} from 'src/client/components/layout';
import {PresenceSwitch} from 'src/client/components/routes/presence-switch';
import {useAsyncEffect} from 'src/client/hooks';
import {GamePage} from 'src/client/pages/game';
import {HomePage} from 'src/client/pages/home';
import {LoginPage} from 'src/client/pages/login';
import {MainPage} from 'src/client/pages/main';
import {atoms} from 'src/client/store';
import {Route, Switch} from 'wouter';

const App = () => {
  const setUser = useSetRecoilState(atoms.user);

  useAsyncEffect(async () => {
    type AccessResponseData = {
      accessToken: string;
      isGuest: boolean;
    };

    const accessRes = await Axios.get('/api/auth/access');
    const {accessToken, isGuest}: AccessResponseData = accessRes.data;
    Axios.defaults.headers.common.authorization = accessToken;

    const token = /(?:^|;\s*)csrfToken=([^;]+)/.exec(document.cookie)?.[0];
    Axios.interceptors.request.use((config) => {
      if (config.method === 'POST' || config.method === 'PUT' || config.method === 'DELETE') {
        config.headers['x-csrf-token'] = token;
      }
      return config;
    });

    setUser((state) => ({...state, accessToken, isGuest}));
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
