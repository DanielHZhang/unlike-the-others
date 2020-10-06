import styled from '@emotion/styled';
import {css} from '@emotion/react';
import {styledOptions} from 'src/client/components/props';

type ButtonProps = {
  loading?: boolean;
};

export const Button = styled(
  'button',
  styledOptions
)<ButtonProps>(
  ({theme: {button}, loading}) => css`
    align-items: center;
    background-color: ${button.primaryColor};
    border: none;
    border-radius: 4px;
    color: #fff;
    cursor: ${loading ? 'inherit' : 'pointer'};
    display: flex;
    font-weight: 500;
    height: 40px;
    justify-content: center;
    outline: none;
    padding: 1px 8px;
    transition: all 0.3s ease-out;
    user-select: none;
    &:focus,
    &:hover {
      background-color: ${loading ? button.loadingColor : button.hoverColor};
    }
    &:active {
      background-color: ${loading ? button.loadingColor : button.activeColor};
    }
  `
);
