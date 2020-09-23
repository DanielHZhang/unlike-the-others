import React from 'react';
import App from 'src/client/app';
import {render} from 'react-dom';
import {RecoilRoot} from 'recoil';
import {BrowserRouter} from 'react-router-dom';
import {Global, ThemeProvider} from '@emotion/react';
import {globalStyles} from 'src/client/styles/global';
import {theme} from 'src/client/styles/theme';

render(
  <RecoilRoot>
    <ThemeProvider theme={theme}>
      <Global styles={globalStyles} />
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </ThemeProvider>
  </RecoilRoot>,
  document.getElementById('root')
);
