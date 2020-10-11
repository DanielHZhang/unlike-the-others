import Axios from 'axios';
import React from 'react';
import {hot} from 'react-hot-loader/root';
import {Switch, Route} from 'react-router-dom';
import {useSetRecoilState} from 'recoil';
import {useAsyncEffect} from 'src/client/hooks';
import {routes} from 'src/client/routes';
import {atoms} from 'src/client/store';

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

  return (
    <Switch>
      {routes.map((props, index) => (
        <Route key={index} {...props} />
      ))}
    </Switch>
  );
};

export default hot(App);
