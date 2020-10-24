import Axios from 'axios';
import React from 'react';
import {Route, Switch} from 'wouter';
import {hot} from 'react-hot-loader/root';
import {useSetRecoilState} from 'recoil';
import {useAsyncEffect} from 'src/client/hooks';
import {GamePage} from 'src/client/pages/game';
import {MainPage} from 'src/client/pages/main';
import {atoms} from 'src/client/store';

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

  return (
    <Switch>
      <Route path='/game' component={GamePage} />
      <Route path={['/', '/login', '/sign-up'] as any} component={MainPage} />
    </Switch>
  );
};

export default hot(App);
