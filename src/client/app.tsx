import React, {FC} from 'react';
import {hot} from 'react-hot-loader/root';
import {Switch, Route} from 'react-router-dom';
import {useDidMount} from 'src/client/utils/hooks';
import {socket} from 'src/client/networking/socketio';
import {routes} from 'src/client/routes';
import {StorageKeys} from 'src/client/config/constants';

const App: FC = (props) => {
  useDidMount(() => {
    socket.on('connect', () => {
      console.log('Connected to TCP server.');
      socket.emit('authenticate', localStorage.getItem(StorageKeys.Jwt));
    });
  });

  return (
    <Switch>
      {routes.map((props, index) => (
        <Route key={index} {...props} />
      ))}
    </Switch>
  );
};

export default hot(App);
