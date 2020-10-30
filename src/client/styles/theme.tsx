export type DeclaredTheme = typeof theme;
export const theme = {
  backgroundColor: '#111111',
  borderColor: '#21ad99',
  errorColor: '#d64747',
  // alert: {
  //   error: {
  //     backgroundColor: '#ffccc7',
  //     borderColor: '#d64747',
  //   },
  // },
  button: {
    activeColor: '#21ac99',
    hoverColor: '#25cab4',
    loadingColor: '#6bc7b9',
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
