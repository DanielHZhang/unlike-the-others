import React from 'react';
import {Global} from '@emotion/react';
import {hot} from 'react-hot-loader/root';
import {Route, Router, Switch} from 'wouter';
import {useDidMount, useSetAsyncAtom} from 'src/client/hooks';
import {GamePage} from 'src/client/pages/game';
import {MainPage} from 'src/client/pages/main';
import {asyncAtoms} from 'src/client/store';
import {fetchAccessToken} from 'src/client/network';
import {globalStyles} from 'src/client/styles/global';
import {multipathMatcher} from 'src/client/routes';

const App = () => {
  const setUser = useSetAsyncAtom(asyncAtoms.user);

  useDidMount(() => {
    setUser(async () => {
      const {accessToken, claims} = await fetchAccessToken();
      return {accessToken, ...claims, isAuthed: true};
    });
  });

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
