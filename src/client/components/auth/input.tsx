/** @jsx jsx */
import {jsx} from '@emotion/react';
import {AnimatePresence, motion} from 'framer-motion';
import {useFormContext, UseFormMethods} from 'react-hook-form';
import {Icon, InputWithIcon} from 'src/client/components/base';
import {childVariants} from 'src/client/components/animation/route-transition';
import {FieldError} from 'src/client/components/auth/error';
import {
  MAX_EMAIL_LENGTH,
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
  children: (name: string, register: UseFormMethods['register'], hasError: boolean) => any;
};

const AuthFormInput = (props: FormInputProps): JSX.Element => {
  const {register, errors, formState} = useFormContext();
  const {name, children, showError} = props;
  const hasError = showError && errors[name] && formState.dirtyFields[name];
  return (
    <motion.div
      key={`anim-${name}`}
      variants={childVariants}
      css={{display: 'flex', flexFlow: 'column', flexGrow: 1}}
    >
      {children(name, register, hasError)}
      <AnimatePresence exitBeforeEnter={true}>
        {hasError && <FieldError key={`anim-error-${name}`}>{errors[name].message}</FieldError>}
      </AnimatePresence>
    </motion.div>
  );
};

export const validationMessages = {
  username: {
    minLength: `Username must be at least ${MIN_USERNAME_LENGTH} characters`,
    maxLength: `Username must be less than ${MAX_USERNAME_LENGTH} characters`,
    pattern: 'Only alphanumeric characters are allowed',
  },
};

export const UsernameInput = (props: Props): JSX.Element => {
  return (
    <AuthFormInput name='username' showError={props.showError}>
      {(name, register, hasError) => (
        <InputWithIcon
          ref={register({
            required: 'This field is required',
            minLength: {
              value: MIN_USERNAME_LENGTH,
              message: validationMessages.username.minLength,
            },
            maxLength: {
              value: MAX_USERNAME_LENGTH,
              message: validationMessages.username.maxLength,
            },
            pattern: {
              value: USERNAME_VALIDATION_REGEX,
              message: validationMessages.username.pattern,
            },
          })}
          icon={Icon.User}
          name={name}
          placeholder='Username'
          autoComplete='off'
          hasError={hasError}
        />
      )}
    </AuthFormInput>
  );
};

export const EmailInput = (props: Props): JSX.Element => {
  return (
    <AuthFormInput name='email' showError={props.showError}>
      {(name, register, hasError) => (
        <InputWithIcon
          ref={register({
            required: 'This field is required',
            maxLength: {
              value: MAX_EMAIL_LENGTH,
              message: `Email must be less than ${MAX_EMAIL_LENGTH} characters`,
            },
          })}
          name={name}
          icon={Icon.AtSign}
          type='email'
          placeholder='Email'
          hasError={hasError}
        />
      )}
    </AuthFormInput>
  );
};

export const PasswordInput = (props: Props): JSX.Element => {
  return (
    <AuthFormInput name='password' showError={props.showError}>
      {(name, register, hasError) => (
        <InputWithIcon
          ref={register({
            required: 'This field is required',
            maxLength: {
              value: MAX_PASSWORD_LENGTH,
              message: `Password must be less than ${MAX_PASSWORD_LENGTH} characters`,
            },
            minLength: {
              value: MIN_PASSWORD_LENGTH,
              message: `Password must be at least ${MIN_PASSWORD_LENGTH} characters`,
            },
          })}
          name={name}
          icon={Icon.Key}
          type='password'
          placeholder='Password'
          hasError={hasError}
        />
      )}
    </AuthFormInput>
  );
};
