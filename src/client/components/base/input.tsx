import styled from '@emotion/styled';
import {css} from '@emotion/react';

type InputProps = {
  width?: string;
  height?: string;
  hasError?: boolean;
};

export const Input = styled('input')<InputProps>(
  ({theme, hasError, height = '40px', width}) => css`
    background-color: #010101;
    border: 2px solid ${theme.borderColor};
    border-radius: 4px;
    color: #fff;
    /* box-shadow: ${hasError && `0 0 0 1.5px ${theme.errorColor}`}; */
    height: ${height};
    outline: none;
    padding: 1px 11px;
    transition: all 0.2s ease-out;
    width: ${width};

    &::placeholder {
      color: rgb(134, 154, 184);
    }
    &:disabled {
      cursor: not-allowed;
    }
    &:disabled,
    &:hover {
      background-color: #121212;
      /* border: 2px solid rgb(233, 236, 240); */
    }
    &:focus {
      background-color: inherit;
      border: none;
      box-shadow: 0 0 0 1.5px ${hasError ? theme.errorColor : '#a7b9f6'};
    }
  `
);
