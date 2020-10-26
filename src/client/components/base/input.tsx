/** @jsx jsx */
import styled from '@emotion/styled';
import {jsx, css} from '@emotion/react';
import {DetailedHTMLProps, forwardRef, InputHTMLAttributes} from 'react';
import {styledOptions} from 'src/client/components/props';
import {theme} from 'src/client/styles/theme';
import {Flex} from 'src/client/components/base/flex';
import {Icon} from 'src/client/components/base/icon';

export const baseInputStyles = css`
  background-color: #202225;
  border: 2px solid ${theme.borderColor};
  border-radius: 8px;
  color: #fff;
  height: 48px;
  outline: none;
  padding: 1px 15px;
  transition: all 0.2s ease-out;

  &::placeholder {
    color: rgb(181, 181, 182);
    /* color: rgb(134, 154, 184); */
  }
  &:disabled {
    cursor: not-allowed;
  }
  &:disabled,
  &:hover {
    background-color: ${theme.backgroundColor};
    /* border: 2px solid rgb(233, 236, 240); */
  }
  &:focus {
    background-color: inherit;
    border: none;
    box-shadow: 0 0 0 1.5px #a7b9f6;
  }
`;

type Props = {
  hasError?: boolean;
};

export const Input = styled(
  'input',
  styledOptions
)<Props>(
  ({theme, hasError}) => css`
    ${baseInputStyles}
    ${hasError && 'border: none;'}
    box-shadow: ${hasError && `0 0 0 1.5px ${theme.errorColor}`};
    &:focus {
      box-shadow: 0 0 0 1.5px ${hasError ? theme.errorColor : '#a7b9f6'};
    }
  `
);

type ReactInputProps = DetailedHTMLProps<InputHTMLAttributes<HTMLInputElement>, HTMLInputElement>;

type InputWithIconProps = Props &
  ReactInputProps & {
    icon: Icon.Element;
    prefix?: boolean;
  };

export const InputWithIcon = forwardRef<HTMLInputElement, InputWithIconProps>((props, ref) => {
  const {icon: Icon, prefix = true, ...rest} = props;
  return (
    <Flex flow='column' crossAxis='stretch' grow={1} css={{position: 'relative'}}>
      <Input {...rest} ref={ref} css={{padding: prefix ? '0 0 0 44px' : '0 44px 0 0'}} />
      <Flex
        crossAxis='center'
        mainAxis='center'
        css={{
          position: 'absolute',
          height: 48,
          width: 48,
          left: prefix ? 0 : undefined,
          right: !prefix ? 0 : undefined,
        }}
      >
        <Icon color='#72767d' />
      </Flex>
    </Flex>
  );
});

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
