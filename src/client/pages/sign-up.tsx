/** @jsx jsx */
import {FC} from 'react';
import {jsx} from '@emotion/react';
import {motion, useIsPresent} from 'framer-motion';
import {FormProvider, useForm} from 'react-hook-form';
import {childVariants, RouteTransition} from 'src/client/components/animation/route-transition';
import {Flex, Icon, Input, MotionButton, MotionInput, Stack} from 'src/client/components/base';
import {HomepageLink} from 'src/client/components/link';
import {MAX_PASSWORD_LENGTH} from 'src/shared/constants';
import {EmailInput, PasswordInput, UsernameInput} from 'src/client/components/auth/input';
import {Form} from 'src/client/components/auth/form';
import {FieldError} from 'src/client/components/auth/error';

// TODO: your username can only contain alphanumeric characters and spaces

export const SignUpPage: FC = () => {
  const isPresent = useIsPresent();
  const methods = useForm({
    defaultValues: {username: '', email: '', password: ''},
  });

  const onSubmit = (data: any) => null;

  return (
    <RouteTransition>
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)}>
          <Stack flow='column' crossAxis='center' spacing='1rem' css={{margin: '4rem 0'}}>
            <UsernameInput showError={isPresent} />
            <EmailInput showError={isPresent} />
            <PasswordInput showError={isPresent} />
            <Flex flow='row' mainAxis='flex-end' css={{width: 300}}>
              <MotionButton key='button' type='submit' variants={childVariants}>
                <span css={{margin: '0 10px'}}>Continue</span>
                <Icon.ArrowRight color='#fff' />
              </MotionButton>
            </Flex>
          </Stack>
        </form>
      </FormProvider>

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
