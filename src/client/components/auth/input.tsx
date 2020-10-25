// import React from 'react';
/** @jsx jsx */
import {jsx} from '@emotion/react';
import {motion} from 'framer-motion';
import {useFormContext} from 'react-hook-form';
import {Input, Icon, Flex} from 'src/client/components/base';
import {childVariants} from 'src/client/components/animation/route-transition';
import {
  MAX_PASSWORD_LENGTH,
  MAX_USERNAME_LENGTH,
  MIN_PASSWORD_LENGTH,
  MIN_USERNAME_LENGTH,
} from 'src/shared/constants';
import {FieldError} from 'src/client/components/auth/error';

type Props = {
  showError?: boolean;
};

export const PasswordInput = (props: Props): JSX.Element => {
  const {register, errors, formState} = useFormContext();
  const name = 'password';
  return (
    <motion.div key={`anim-${name}`} variants={childVariants}>
      <Flex
        crossAxis='center'
        mainAxis='center'
        css={{position: 'absolute', height: 48, width: 48}}
      >
        <Icon.Key color='#72767d' />
      </Flex>
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
        css={{width: 300, paddingLeft: 44}}
      />
      {props.showError && errors[name] && formState.touched[name] && (
        <FieldError>{errors[name].message}</FieldError>
      )}
    </motion.div>
  );
};

export const EmailInput = (props: Props): JSX.Element => {
  const {register, errors, formState} = useFormContext();
  const name = 'email';
  return (
    <motion.div key={`anim-${name}`} variants={childVariants} css={{position: 'relative'}}>
      <Flex
        crossAxis='center'
        mainAxis='center'
        css={{position: 'absolute', height: 48, width: 48}}
      >
        <Icon.AtSign color='#72767d' />
      </Flex>
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
        css={{width: 300, paddingLeft: 44}}
      />
      {props.showError && errors[name] && formState.touched[name] && (
        <FieldError>{errors[name].message}</FieldError>
      )}
    </motion.div>
  );
};

export const UsernameInput = (props: Props): JSX.Element => {
  const methods = useFormContext();
  const name = 'username';
  return (
    <motion.div key={`anim-${name}`} variants={childVariants}>
      <Flex
        crossAxis='center'
        mainAxis='center'
        css={{position: 'absolute', height: 48, width: 48}}
      >
        <Icon.User color='#72767d' />
      </Flex>
      <Input
        ref={methods.register({
          required: 'This field is required',
          minLength: {
            value: MIN_USERNAME_LENGTH,
            message: 'Username must be at least 4 characters',
          },
          maxLength: {
            value: MAX_USERNAME_LENGTH,
            message: 'Username must be less than 20 characters',
          },
        })}
        name={name}
        placeholder='Username'
        css={{width: 300, paddingLeft: 44}}
      />
      {props.showError && methods.errors[name] && methods.formState.touched[name] && (
        <FieldError>{methods.errors[name].message}</FieldError>
      )}
    </motion.div>
  );
};
