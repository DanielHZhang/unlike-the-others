import Axios from 'axios';
import React, {FC} from 'react';
import {hot} from 'react-hot-loader/root';
import {Switch, Route} from 'react-router-dom';
import {routes} from 'src/client/routes';
import {useAsyncEffect} from 'src/client/utils/hooks';

const App: FC = (props) => {
  useAsyncEffect(async () => {
    const [access, csrf] = await Promise.allSettled([
      Axios.get('/api/auth/access'),
      Axios.get('/api/auth/csrf'),
    ]);
    console.log('got access:', access);
    const {headers} = Axios.defaults;
    if (access.status === 'fulfilled') {
      const {data: accessToken} = access.value;
      headers.common.authorization = accessToken;
    }
    if (csrf.status === 'fulfilled') {
      const {data: csrfToken} = csrf.value;
      headers.post['x-csrf-token'] = csrfToken;
      headers.put['x-csrf-token'] = csrfToken;
      headers.delete['x-csrf-token'] = csrfToken;
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
