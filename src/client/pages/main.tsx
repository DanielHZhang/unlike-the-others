/** @jsx jsx */
import {jsx} from '@emotion/react';
import {Route} from 'react-router-dom';

export const MainPage = () => {
  return (
    <div>
      What
      <Route exact={true} path='/login'>
        should be rendered on login route
      </Route>
    </div>
  );
};
