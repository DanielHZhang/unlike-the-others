/** @jsx jsx */
import {jsx} from '@emotion/react';
import {motion, useIsPresent} from 'framer-motion';
import {FormProvider, useForm} from 'react-hook-form';
import {Flex, Icon, MotionButton, Stack} from 'src/client/components/base';
import {childVariants, RouteTransition} from 'src/client/components/animation/route-transition';
import {EmailInput, PasswordInput} from 'src/client/components/auth/input';
import {HomepageLink} from 'src/client/components/link';

type FormState = {
  email: string;
  password: string;
};

export const LoginPage = (): JSX.Element => {
  const isPresent = useIsPresent();
  const methods = useForm<FormState>({
    defaultValues: {email: '', password: ''},
  });
  const onValidSubmit = () => null;

  return (
    <RouteTransition>
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onValidSubmit)}>
          <Flex mainAxis='center' css={{margin: '6rem 0'}}>
            <Stack flow='column' crossAxis='stretch' spacing='1rem' css={{width: 300}}>
              <EmailInput showError={isPresent} />
              <PasswordInput showError={isPresent} />
              <Flex mainAxis='flex-end'>
                <MotionButton key='anim-login-submit' type='submit' variants={childVariants}>
                  <span css={{margin: '0 6px'}}>Login</span>
                  <Icon.ArrowRight color='#fff' />
                </MotionButton>
              </Flex>
            </Stack>
          </Flex>
        </form>
      </FormProvider>

      {/* Section below can be converted to component and reused in home/sign-up */}
      <Flex flow='column' crossAxis='center' style={{marginBottom: '2rem'}}>
        <motion.div key='/sign-up' variants={childVariants}>
          <HomepageLink to='/sign-up'>Sign Up</HomepageLink>
        </motion.div>
        <motion.div key='divider' variants={childVariants}>
          <Icon.Scale />
        </motion.div>
        <motion.div key='/' variants={childVariants}>
          <HomepageLink to='/'>Home</HomepageLink>
        </motion.div>
      </Flex>
      {/* end section */}
    </RouteTransition>
  );
};
