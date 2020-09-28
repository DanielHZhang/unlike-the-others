import Axios from 'axios';
import React, {FC, Suspense} from 'react';
import {hot} from 'react-hot-loader/root';
import {Switch, Route} from 'react-router-dom';
import {useAsyncEffect, useDidMount} from 'src/client/utils/hooks';
import {socket} from 'src/client/networking/tcp';
import {routes} from 'src/client/routes';
import {StorageKeys} from 'src/client/config/constants';

const App: FC = (props) => {
  useAsyncEffect(async () => {
    const res = await Axios.get('/login');
  });

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <Switch>
        {routes.map((props, index) => (
          <Route key={index} {...props} />
        ))}
      </Switch>
    </Suspense>
  );
};

export default hot(App);
