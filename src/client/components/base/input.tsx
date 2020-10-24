import styled from '@emotion/styled';
import {css} from '@emotion/react';
import {styledOptions} from 'src/client/components/props';
import {theme} from 'src/client/styles/theme';
import {motion} from 'framer-motion';

export const baseInputStyles = css`
  background-color: #010101;
  border: 2px solid ${theme.borderColor};
  border-radius: 4px;
  color: #fff;
  height: 40px;
  outline: none;
  padding: 1px 11px;
  transition: all 0.2s ease-out;

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
    box-shadow: 0 0 0 1.5px #a7b9f6;
  }
`;

type InputProps = {
  hasError?: boolean;
};

export const Input = styled(
  'input',
  styledOptions
)<InputProps>(
  ({theme, hasError}) => css`
    ${baseInputStyles}
    box-shadow: ${hasError && `0 0 0 1.5px ${theme.errorColor}`};
    &:focus {
      box-shadow: 0 0 0 1.5px ${hasError ? theme.errorColor : '#a7b9f6'};
    }
  `
);

export const MotionInput = styled(motion.input)(
  () => css`
    ${baseInputStyles}
  `
);

// export const Input = styled(
//   'input',
//   styledOptions
// )<InputProps>(({theme, hasError}) => ({
//   backgroundColor: '#010101',
//   border: `2px solid ${theme.borderColor}`,
//   borderRadius: '4px',
//   color: 'white',
//   height: '40px',
//   outline: 'none',
//   padding: '1px 11px',
//   transition: 'all 0.2s ease-out',
//   '&::placeholder': {
//     color: 'rgb(134, 154, 184)',
//   },
//   '&:disabled': {
//     cursor: 'not-allowed',
//   },
//   '&:disabled,&:hover': {
//     backgroundColor: '#121212',
//     /* border: 2px solid rgb(233, 236, 240); */
//   },
//   '&:focus': {
//     backgroundColor: 'inherit',
//     border: 'none',
//     boxShadow: `0 0 0 1.5px ${hasError ? theme.errorColor : '#a7b9f6'}`,
//   },
// }));
