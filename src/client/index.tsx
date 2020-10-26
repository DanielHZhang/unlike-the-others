import 'src/client/utils/polyfills';
import React, {StrictMode} from 'react';
import App from 'src/client/app';
import {render} from 'react-dom';
import {RecoilRoot} from 'recoil';
import {ThemeProvider} from '@emotion/react';
import {theme} from 'src/client/styles/theme';

render(
  <StrictMode>
    <RecoilRoot>
      <ThemeProvider theme={theme}>
        <App />
      </ThemeProvider>
    </RecoilRoot>
  </StrictMode>,
  document.getElementById('root')
);
