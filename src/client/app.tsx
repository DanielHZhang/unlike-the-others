import React from 'react';
import {Route, Router, Switch} from 'wouter';
import {hot} from 'react-hot-loader/root';
import {useSetRecoilState} from 'recoil';
import {useAsyncEffect, useDidMount, useSetAtomAsync} from 'src/client/hooks';
import {GamePage} from 'src/client/pages/game';
import {MainPage} from 'src/client/pages/main';
import {asyncAtoms, atoms} from 'src/client/store';
import {isAxiosError, fetchAccessToken} from 'src/client/network';
import {Global} from '@emotion/react';
import {globalStyles} from 'src/client/styles/global';
import {multipathMatcher} from 'src/client/routes';

const App = () => {
  // const setUser = useSetRecoilState(atoms.user);
  const setUser = useSetAtomAsync(asyncAtoms.user);

  useDidMount(() => {
    setUser(async () => {
      const response = await fetchAccessToken();
      // if (isAxiosError(response)) {
      //   throw response;
      // }
      // const {accessToken, claims} = response;
      // const {isGuest, username, hashtag} = claims;
      // return {
      //   accessToken,
      //   ...claims,
      //   username: isGuest ? `${username}#${hashtag}` : username,
      //   isAuthed: true,
      // };
    });
  });

  // useAsyncEffect(async () => {

  //     setUser();
  // }, []);

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
