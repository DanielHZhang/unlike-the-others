import React, {FC} from 'react';
import {hot} from 'react-hot-loader/root';
import {Switch, Route} from 'react-router-dom';
import {useRecoilValue} from 'recoil';
import {useDidMount} from 'src/client/utils/hooks';
import {socket} from 'src/client/networking/socketio';
import {routes} from 'src/client/routes';
import {Atoms} from 'src/client/store';

const App: FC = (props) => {
  const userId = useRecoilValue(Atoms.userId);

  useDidMount(() => {
    socket.on('connect', () => {
      console.log('Connected to TCP server.');
    });
    // socket.emit('authenticate', userId);
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
