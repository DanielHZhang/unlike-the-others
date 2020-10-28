import styled from '@emotion/styled';
import {css} from '@emotion/react';
import {styledOptions} from 'src/client/components/props';
import type {DeclaredTheme} from 'src/client/styles/theme';

type Props = {
  loading?: boolean;
};

type BaseProps = Props & {theme: DeclaredTheme};

const baseButtonStyles = ({loading, theme}: BaseProps) => css`
  align-items: center;
  background-color: ${theme.button.primaryColor};
  border: none;
  border-radius: 4px;
  color: #fff;
  display: flex;
  font-weight: 500;
  height: 46px;
  justify-content: center;
  outline: none;
  padding: 1px 8px;
  transition: all 0.3s ease-out;
  user-select: none;
  cursor: ${loading ? 'inherit' : 'pointer'};
  &:focus,
  &:hover {
    background-color: ${loading ? theme.button.loadingColor : theme.button.hoverColor};
  }
  &:active {
    background-color: ${loading ? theme.button.loadingColor : theme.button.activeColor};
  }
`;

export const Button = styled('button', styledOptions)<Props>`
  ${baseButtonStyles};
`;
