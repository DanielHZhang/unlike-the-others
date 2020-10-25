/** @jsx jsx */
import {jsx} from '@emotion/react';
import {motion, useIsPresent} from 'framer-motion';
import {FormProvider, useForm} from 'react-hook-form';
import {childVariants, RouteTransition} from 'src/client/components/animation/route-transition';
import {Flex, Icon, MotionButton, Stack} from 'src/client/components/base';
import {HomepageLink} from 'src/client/components/link';
import {EmailInput, PasswordInput, UsernameInput} from 'src/client/components/auth/input';

// TODO: your username can only contain alphanumeric characters and spaces

export const SignUpPage = (): JSX.Element => {
  const isPresent = useIsPresent();
  const methods = useForm({
    defaultValues: {username: '', email: '', password: ''},
  });
  const onValidSubmit = (data: any) => null;

  return (
    <RouteTransition>
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onValidSubmit)}>
          <Flex mainAxis='center' css={{margin: '4rem 0'}}>
            <Stack flow='column' crossAxis='stretch' spacing='1rem' css={{width: 300}}>
              <UsernameInput showError={isPresent} />
              <EmailInput showError={isPresent} />
              <PasswordInput showError={isPresent} />
              <Flex mainAxis='flex-end'>
                <MotionButton key='anim-signup-submit' type='submit' variants={childVariants}>
                  <span css={{margin: '0 6px'}}>Continue</span>
                  <Icon.ArrowRight color='#fff' />
                </MotionButton>
              </Flex>
            </Stack>
          </Flex>
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
