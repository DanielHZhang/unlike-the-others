/** @jsx jsx */
import {FC} from 'react';
import {jsx} from '@emotion/react';
import {motion, useIsPresent} from 'framer-motion';
import {useForm} from 'react-hook-form';
import {childVariants, RouteTransition} from 'src/client/components/animation/route-transition';
import {Flex, Input, MotionButton, MotionInput, Stack} from 'src/client/components/base';
import {HomepageLink} from 'src/client/components/link';
import {MAX_PASSWORD_LENGTH} from 'src/shared/constants';
import {Icon} from 'src/client/components/base/icon';

// TODO: your username can only contain alphanumeric characters and spaces

const FieldError: FC = (props) => {
  return (
    <div css={{marginTop: 8, textAlign: 'right', fontSize: '0.9em', color: 'red'}}>
      {props.children}
    </div>
  );
};

export const SignUpPage: FC = () => {
  const isPresent = useIsPresent();
  const {
    register,
    handleSubmit,
    errors,
    formState: {touched},
  } = useForm({
    defaultValues: {username: '', email: '', password: ''},
  });
  const onSubmit = (data: any) => null;
  const hasError = () => errors.email || errors.password || errors.username;

  return (
    <RouteTransition>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Stack flow='column' crossAxis='center' spacing='1rem' css={{margin: '4rem 0'}}>
          <div>
            <MotionInput
              ref={register({required: true})}
              key='username'
              variants={childVariants}
              name='username'
              placeholder='Username'
              css={{width: 300}}
            />
            {isPresent && errors.username && touched.username && (
              <FieldError>This field is required</FieldError>
            )}
          </div>
          <div>
            <MotionInput
              ref={register({required: true})}
              name='email'
              key='email'
              variants={childVariants}
              type='email'
              placeholder='Email'
              css={{width: 300}}
            />
            {isPresent && errors.email && touched.email && (
              <FieldError>This field is required</FieldError>
            )}
          </div>
          <div>
            <MotionInput
              ref={register({required: true, maxLength: MAX_PASSWORD_LENGTH})}
              name='password'
              key='password'
              variants={childVariants}
              type='password'
              placeholder='Password'
              css={{width: 300}}
            />
            {isPresent && errors.password && touched.password && (
              <FieldError>This field is required</FieldError>
            )}
          </div>
          <MotionButton key='button' type='submit' variants={childVariants}>
            Sign Up
          </MotionButton>
        </Stack>
      </form>
      {/* Section below can be converted to component and reused in home/sign-up */}
      <Flex flow='column' crossAxis='center' style={{marginBottom: '2rem'}}>
        <motion.div key='login' variants={childVariants}>
          <HomepageLink to='/login'>Login</HomepageLink>
        </motion.div>
        <motion.div key='divider' variants={childVariants}>
          <Icon.Scale />
        </motion.div>
        <motion.div key='home' variants={childVariants}>
          <HomepageLink to='/'>Home</HomepageLink>
        </motion.div>
      </Flex>
      {/* end section */}
    </RouteTransition>
  );
};
