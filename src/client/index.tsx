import 'src/client/utils/polyfills';
import React, {StrictMode} from 'react';
import {render} from 'react-dom';
import {Global, ThemeProvider} from '@emotion/react';
import {RecoilRoot} from 'recoil';
import {Router} from 'wouter';
import App from 'src/client/app';
import {theme} from 'src/client/styles/theme';
import {globalStyles} from 'src/client/styles/global';
import {multipathMatcher} from 'src/client/routes';

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
