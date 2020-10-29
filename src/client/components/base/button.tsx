import styled from '@emotion/styled';
import {css} from '@emotion/react';
import {styledOptions} from 'src/client/components/props';
import type {DeclaredTheme} from 'src/client/styles/theme';

type Props = {
  loading?: boolean;
};

type BaseProps = Props & {theme: DeclaredTheme};

const baseButtonStyles = () => css`
  align-items: center;
  border: none;
  border-radius: 4px;
  color: #fff;
  display: inline-flex;
  font-weight: 500;
  height: 46px;
  justify-content: center;
  outline: none;
  padding: 1px 11px;
  transition: all 0.3s ease-out;
  user-select: none;
`;

const primaryButtonStyles = ({loading, theme}: BaseProps) => css`
  background-color: ${theme.button.primaryColor};
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
  ${primaryButtonStyles};
`;

export const GhostButton = styled.button`
  ${baseButtonStyles};
  cursor: pointer;
`;
