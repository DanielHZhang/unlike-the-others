import React from 'react';
import {Global} from '@emotion/react';
import {hot} from 'react-hot-loader/root';
import {Route, Router, Switch} from 'wouter';
import {useDidMount, useSetAsyncAtom} from 'src/client/hooks';
import {multipathMatcher, routes} from 'src/client/routes';
import {globalStyles} from 'src/client/styles/global';
import {fetchAccessToken} from 'src/client/network';
import {asyncAtoms} from 'src/client/store';

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
        {routes.map(
          ({params, component: Component, path}, index): JSX.Element => {
            if (params) {
              return (
                <Route key={index} path={path}>
                  {(params) => <Component params={params} />}
                </Route>
              );
            }
            return <Route key={index} path={path} component={Component} />;
          }
        )}
      </Switch>
    </Router>
  );
};

export default hot(App);
