import {css} from '@emotion/react';
import {scrollbarStyles} from 'src/client/styles/scrollbar';

export const globalStyles = css`
  @font-face {
    font-family: Simplifica;
    src: url('/assets/fonts/simplifica.ttf');
  }

  @font-face {
    font-family: Inter;
    src: url('/assets/fonts/inter.ttf');
  }

  ::selection {
    background: rgba(33, 173, 153, 0.2);
  }

  body {
    ${scrollbarStyles}
    margin: 0;
    height: 100%;
    color: #fff;
  }

  #root {
    height: 100%;
    width: 100%;
  }

  html {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Helvetica, Arial,
      sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';
    font-size: 16px;
    font-style: normal;
    height: 100%;
    line-height: 1.15;
    -webkit-text-size-adjust: 100%;
    -webkit-font-smoothing: subpixel-antialiased;
  }

  i,
  a {
    text-decoration: none;
  }

  *,
  *::before,
  *::after {
    box-sizing: border-box;
  }
`;
