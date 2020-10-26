export const theme = {
  backgroundColor: '#111111',
  borderColor: '#21ad99',
  errorColor: '#d64747',
  button: {
    activeColor: '#21ac99',
    hoverColor: '#21ab99',
    loadingColor: '#21aa99',
    primaryColor: '#21ad99',
  },
  modal: {
    content: {
      zIndex: 100,
    },
    mask: {
      zIndex: 99,
    },
  },
  scrollbar: {
    thumb: {
      activeColor: '#1e2644',
      hoverColor: '#3a4a5a',
      primaryColor: '#495d74',
    },
    track: {
      backgroundColor: '#111111',
      pieceColor: '#3a3a3a',
    },
  },
};

declare module '@emotion/react' {
  type DeclaredTheme = typeof theme;

  export interface Theme extends DeclaredTheme {
    notEmpty: any;
  }
}
