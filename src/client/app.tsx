import React, {FC, useEffect} from 'react';
import {hot} from 'react-hot-loader/root';
import {Switch, Route, useHistory} from 'react-router-dom';
import {useRecoilValue} from 'recoil';
import {socket} from 'src/client/networking/socketio';
import {routes} from 'src/client/routes';
import {Atoms} from 'src/client/store';
import {useDidMount} from 'src/client/utils/hooks';

const App: FC = (props) => {
  return (
    <Switch>
      {routes.map((props, index) => (
        <Route key={index} {...props} />
      ))}
    </Switch>
  );
};

export default hot(App);
