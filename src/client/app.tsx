import React, {FC} from 'react';
import {hot} from 'react-hot-loader/root';
import {Switch, Route, useHistory} from 'react-router-dom';
import {useRecoilValue} from 'recoil';
import {socket} from 'src/client/networking/socketio';
import {routes} from 'src/client/routes';
import {Atoms} from 'src/client/store';
import {useDidMount} from 'src/client/utils/hooks';

const App: FC = (props) => {
  const room = useRecoilValue(Atoms.room);
  const history = useHistory();

  useDidMount(() => {
    let previousPath = '';
    const unregister = history.listen((location) => {
      if (previousPath === '/game' && location.pathname !== '/game') {
        socket.emit('leaveRoom', room.id);
      }
      previousPath = location.pathname;
    });
    return () => unregister();
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
