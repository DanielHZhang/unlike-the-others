/** @jsx jsx */
import {jsx} from '@emotion/react';
import {motion} from 'framer-motion';
import {useFormContext, UseFormMethods} from 'react-hook-form';
import {Input, Icon, Flex} from 'src/client/components/base';
import {childVariants} from 'src/client/components/animation/route-transition';
import {FieldError} from 'src/client/components/auth/error';
import {
  MAX_PASSWORD_LENGTH,
  MAX_USERNAME_LENGTH,
  MIN_PASSWORD_LENGTH,
  MIN_USERNAME_LENGTH,
  USERNAME_VALIDATION_REGEX,
} from 'src/shared/constants';

type Props = {
  showError?: boolean;
};

type FormInputProps = Props & {
  name: string;
  icon: Icon.Element;
  children: (name: string, register: UseFormMethods['register']) => any;
};

const AuthFormInput = (props: FormInputProps): JSX.Element => {
  const {register, errors, formState} = useFormContext();
  const {icon: Icon, name, children, showError} = props;

  return (
    <motion.div
      key={`anim-${name}`}
      variants={childVariants}
      css={{display: 'flex', flexFlow: 'column'}}
    >
      <Flex
        crossAxis='center'
        mainAxis='center'
        css={{position: 'absolute', height: 48, width: 48}}
      >
        <Icon color='#72767d' />
      </Flex>
      {children(name, register)}
      {showError && errors[name] && formState.dirtyFields[name] && (
        <FieldError>{errors[name].message}</FieldError>
      )}
    </motion.div>
  );
};

export const UsernameInput = (props: Props): JSX.Element => {
  return (
    <AuthFormInput name='username' icon={Icon.User} showError={props.showError}>
      {(name, register) => (
        <Input
          ref={register({
            required: 'This field is required',
            minLength: {
              value: MIN_USERNAME_LENGTH,
              message: 'Username must be at least 4 characters',
            },
            maxLength: {
              value: MAX_USERNAME_LENGTH,
              message: 'Username must be less than 20 characters',
            },
            pattern: {
              value: USERNAME_VALIDATION_REGEX,
              message: 'Only alphanumeric characters are allowed',
            },
          })}
          name={name}
          placeholder='Username'
          autoComplete='off'
          css={{flexGrow: 1, paddingLeft: 44}}
        />
      )}
    </AuthFormInput>
  );
};

export const EmailInput = (props: Props): JSX.Element => {
  return (
    <AuthFormInput name='email' icon={Icon.AtSign} showError={props.showError}>
      {(name, register) => (
        <Input
          ref={register({
            required: 'This field is required',
            maxLength: {
              value: MAX_PASSWORD_LENGTH,
              message: 'Email must be less than 50 characters',
            },
          })}
          name={name}
          type='email'
          placeholder='Email'
          css={{flexGrow: 1, paddingLeft: 44}}
        />
      )}
    </AuthFormInput>
  );
};

export const PasswordInput = (props: Props): JSX.Element => {
  return (
    <AuthFormInput name='password' icon={Icon.Key} showError={props.showError}>
      {(name, register) => (
        <Input
          ref={register({
            required: 'This field is required',
            maxLength: {
              value: MAX_PASSWORD_LENGTH,
              message: 'Password must be less than 50 characters',
            },
            minLength: {
              value: MIN_PASSWORD_LENGTH,
              message: 'Password must be at least 8 characters',
            },
          })}
          name={name}
          type='password'
          placeholder='Password'
          css={{flexGrow: 1, paddingLeft: 44}}
        />
      )}
    </AuthFormInput>
  );
};
