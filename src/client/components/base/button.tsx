import styled from '@emotion/styled';
import {css} from '@emotion/react';
import {motion} from 'framer-motion';
import {styledOptions} from 'src/client/components/props';
import {theme} from 'src/client/styles/theme';

const baseButtonStyles = css`
  align-items: center;
  background-color: ${theme.button.primaryColor};
  border: none;
  border-radius: 4px;
  color: #fff;
  display: flex;
  font-weight: 500;
  height: 40px;
  justify-content: center;
  outline: none;
  padding: 1px 8px;
  transition: all 0.3s ease-out;
  user-select: none;
`;

type ButtonProps = {
  loading?: boolean;
};

export const Button = styled(
  'button',
  styledOptions
)<ButtonProps>(
  ({theme: {button}, loading}) => css`
    ${baseButtonStyles}
    cursor: ${loading ? 'inherit' : 'pointer'};
    &:focus,
    &:hover {
      background-color: ${loading ? button.loadingColor : button.hoverColor};
    }
    &:active {
      background-color: ${loading ? button.loadingColor : button.activeColor};
    }
  `
);

export const MotionButton = styled(motion.button)<ButtonProps>(
  ({theme: {button}, loading}) => css`
    ${baseButtonStyles}
    cursor: ${loading ? 'inherit' : 'pointer'};
    &:focus,
    &:hover {
      background-color: ${loading ? button.loadingColor : button.hoverColor};
    }
    &:active {
      background-color: ${loading ? button.loadingColor : button.activeColor};
    }
  `
);
