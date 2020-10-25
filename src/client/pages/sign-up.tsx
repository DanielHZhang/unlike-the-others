/** @jsx jsx */
import {jsx} from '@emotion/react';
import {useLocation} from 'wouter';
import {motion, useIsPresent} from 'framer-motion';
import {FormProvider, SubmitErrorHandler, SubmitHandler, useForm} from 'react-hook-form';
import {axios} from 'src/client/network';
import {HomepageLink} from 'src/client/components/link';
import {Flex, Icon, MotionButton, Stack} from 'src/client/components/base';
import {childVariants, RouteTransition} from 'src/client/components/animation/route-transition';
import {EmailInput, PasswordInput, UsernameInput} from 'src/client/components/auth/input';

// TODO: your username can only contain alphanumeric characters and spaces

type FormState = {
  username: string;
  email: string;
  password: string;
};

export const SignUpPage = (): JSX.Element => {
  const [, setLocation] = useLocation();
  const isPresent = useIsPresent();
  const methods = useForm<FormState>({
    reValidateMode: 'onSubmit',
    defaultValues: {username: '', email: '', password: ''},
  });
  const onSubmit: SubmitHandler<FormState> = async (data) => {
    const response = await axios.post('/api/user/sign-up', data);
    if (response.data.success) {
      setLocation('/');
    }
  };
  const onError: SubmitErrorHandler<FormState> = (errors) => {
    console.log('attempted submission but got errors:', errors);
  };

  return (
    <RouteTransition>
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit, onError)}>
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
