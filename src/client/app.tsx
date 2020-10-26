import React from 'react';
import {Route, Router, Switch} from 'wouter';
import {hot} from 'react-hot-loader/root';
import {useSetRecoilState} from 'recoil';
import {useAsyncEffect} from 'src/client/hooks';
import {GamePage} from 'src/client/pages/game';
import {MainPage} from 'src/client/pages/main';
import {atoms} from 'src/client/store';
import {isAxiosError, postAccessToken} from 'src/client/network';
import {Global} from '@emotion/react';
import {globalStyles} from 'src/client/styles/global';
import {multipathMatcher} from 'src/client/routes';

const App = () => {
  const setUser = useSetRecoilState(atoms.user);

  useAsyncEffect(async () => {
    const response = await postAccessToken();
    if (!isAxiosError(response)) {
      const {accessToken, claims} = response;
      const {isGuest, username, hashtag} = claims;
      setUser({
        accessToken,
        ...claims,
        username: isGuest ? `${username}#${hashtag}` : username,
        isAuthed: true,
      });
    }
  }, []);

  return (
    <Router matcher={multipathMatcher}>
      <Global styles={globalStyles} />
      <Switch>
        <Route path='/game' component={GamePage} />
        <Route path={['/', '/login', '/sign-up'] as any} component={MainPage} />
      </Switch>
    </Router>
  );
};

export default hot(App);
