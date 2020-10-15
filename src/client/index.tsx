import 'src/client/utils/polyfills';
import React, {StrictMode} from 'react';
import Axios from 'axios';
import App from 'src/client/app';
import {render} from 'react-dom';
import {RecoilRoot} from 'recoil';
// import {BrowserRouter} from 'react-router-dom';
import {Router} from 'wouter';
import {Global, ThemeProvider} from '@emotion/react';
import {globalStyles} from 'src/client/styles/global';
import {theme} from 'src/client/styles/theme';
import {ROOT_URL} from 'src/shared/constants';
import {multipathMatcher} from 'src/client/routes';

Axios.defaults.baseURL = `http://${ROOT_URL}`;

render(
  <StrictMode>
    <RecoilRoot>
      <ThemeProvider theme={theme}>
        <Global styles={globalStyles} />
        <Router matcher={multipathMatcher}>
          <App />
        </Router>
      </ThemeProvider>
    </RecoilRoot>
  </StrictMode>,
  document.getElementById('root')
);
