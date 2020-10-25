import React from 'react';
import {Route, Switch} from 'wouter';
import {hot} from 'react-hot-loader/root';
import {useSetRecoilState} from 'recoil';
import {useAsyncEffect} from 'src/client/hooks';
import {GamePage} from 'src/client/pages/game';
import {MainPage} from 'src/client/pages/main';
import {atoms} from 'src/client/store';
import {axios} from 'src/client/network';

const App = () => {
  const setUser = useSetRecoilState(atoms.user);

  useAsyncEffect(async () => {
    type AccessResponseData = {
      accessToken: string;
      isGuest: boolean;
    };
    try {
      // Set JWT access token header
      const accessRes = await axios.get('/api/auth/access');
      const {accessToken, id, isGuest, username}: AccessResponseData = accessRes.data;
      axios.defaults.headers.authorization = accessToken;
      setUser((state) => ({accessToken, id, isGuest, username, isAuthed: true}));
    } catch (error) {
      //
    }
  }, []);

  return (
    <Switch>
      <Route path='/game' component={GamePage} />
      <Route path={['/', '/login', '/sign-up'] as any} component={MainPage} />
    </Switch>
  );
};

export default hot(App);
