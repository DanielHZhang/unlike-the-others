import {css} from '@emotion/react';
import {theme} from 'src/client/styles/theme';

export const scrollbarStyles = css`
  background-color: ${theme.backgroundColor};

  &::-webkit-scrollbar {
    width: 16px;
    height: 16px;

    &-corner {
      background-color: transparent;
    }

    &-thumb {
      background-color: ${theme.scrollbar.thumb.primaryColor};
      min-height: 40px;

      &:hover {
        background-color: ${theme.scrollbar.thumb.hoverColor};
      }
      &:active {
        background-color: ${theme.scrollbar.thumb.activeColor};
      }
    }

    &-thumb,
    &-track {
      border: 4px solid transparent;
      background-clip: padding-box;
      border-radius: 8px;
    }

    &-track {
      background-color: ${theme.scrollbar.track.pieceColor};
    }
  }
`;
