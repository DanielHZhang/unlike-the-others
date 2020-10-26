import React from 'react';
import {Route, Switch} from 'wouter';
import {hot} from 'react-hot-loader/root';
import {useSetRecoilState} from 'recoil';
import {useAsyncEffect} from 'src/client/hooks';
import {GamePage} from 'src/client/pages/game';
import {MainPage} from 'src/client/pages/main';
import {atoms} from 'src/client/store';
import {isAxiosError, postAccessToken} from 'src/client/network';

const App = () => {
  const setUser = useSetRecoilState(atoms.user);

  useAsyncEffect(async () => {
    const response = await postAccessToken();
    if (!isAxiosError(response)) {
      const {accessToken, claims} = response;
      setUser({accessToken, ...claims, isAuthed: true});
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
