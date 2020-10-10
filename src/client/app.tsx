import Axios from 'axios';
import React from 'react';
import {hot} from 'react-hot-loader/root';
import {Switch, Route} from 'react-router-dom';
import {useSetRecoilState} from 'recoil';
import {useAsyncEffect} from 'src/client/hooks';
import {routes} from 'src/client/routes';
import {atoms} from 'src/client/store';

const App = () => {
  const setAccessToken = useSetRecoilState(atoms.accessToken);

  useAsyncEffect(async () => {
    const [access, csrf] = await Promise.allSettled([
      Axios.get('/api/auth/access'),
      Axios.get('/api/auth/csrf'),
    ]);
    const {headers} = Axios.defaults;
    if (access.status === 'fulfilled') {
      const {data: accessToken} = access.value;
      headers.common.authorization = accessToken;
      setAccessToken(accessToken);
    }
    if (csrf.status === 'fulfilled') {
      const {data: csrfToken} = csrf.value;
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
