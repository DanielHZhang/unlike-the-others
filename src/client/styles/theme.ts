import {Theme} from '@emotion/react';

declare module '@emotion/react' {
  export interface Theme {
    borderColor: string;
    errorColor: string;
    button: {
      primaryColor: string;
      loadingColor: string;
      hoverColor: string;
      activeColor: string;
    };
    modal: {
      content: {
        zIndex: number;
      };
      mask: {
        zIndex: number;
      };
    };
  }
}

export const theme: Theme = {
  borderColor: '#21ad99',
  errorColor: '#d64747',
  button: {
    primaryColor: '#21ad99',
    loadingColor: '#21aa99',
    hoverColor: '#21ab99',
    activeColor: '#21ac99',
  },
  modal: {
    content: {
      zIndex: 100,
    },
    mask: {
      zIndex: 99,
    },
  },
};
