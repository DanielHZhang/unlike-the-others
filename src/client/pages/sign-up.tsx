/** @jsx jsx */
import {jsx} from '@emotion/react';
import {useLocation} from 'wouter';
import {motion, useIsPresent} from 'framer-motion';
import {FormProvider, SubmitHandler, useForm} from 'react-hook-form';
import {axios, isAxiosError} from 'src/client/network';
import {HomepageLink} from 'src/client/components/link';
import {Flex, Icon, MotionButton, Stack} from 'src/client/components/base';
import {childVariants, RouteTransition} from 'src/client/components/animation/route-transition';
import {EmailInput, PasswordInput, UsernameInput} from 'src/client/components/auth/input';
import {AuthNav} from 'src/client/components/auth/nav';

type FormState = {
  username: string;
  email: string;
  password: string;
};

export const SignUpPage = (): JSX.Element => {
  const [, setLocation] = useLocation();
  const isPresent = useIsPresent();
  const methods = useForm<FormState>({
    // reValidateMode: 'onSubmit',
    defaultValues: {username: '', email: '', password: ''},
  });
  const onSubmit: SubmitHandler<FormState> = async (data) => {
    try {
      const response = await axios.post('/api/user/sign-up', data);
      setLocation('/'); // Push back to homepage
      // Potentially return user data in response and set on user atom
    } catch (error) {
      if (isAxiosError(error)) {
        // set errors on forms
      } else {
        console.error(error);
      }
    }
  };

  return (
    <RouteTransition>
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)}>
          <Flex mainAxis='center' css={{margin: '4rem 0'}}>
            <Stack flow='column' crossAxis='stretch' spacing='1rem' css={{width: 300}}>
              <UsernameInput showError={isPresent} />
              <EmailInput showError={isPresent} />
              <PasswordInput showError={isPresent} />
              <Flex mainAxis='flex-end'>
                <MotionButton
                  key='anim-signup-submit'
                  type='submit'
                  variants={childVariants}
                  disabled={methods.formState.isSubmitting}
                >
                  <span css={{margin: '0 6px'}}>Continue</span>
                  <Icon.ArrowRight color='#fff' />
                </MotionButton>
              </Flex>
            </Stack>
          </Flex>
        </form>
      </FormProvider>
      <AuthNav upper={{text: 'Login', url: '/login'}} lower={{text: 'Home', url: '/'}} />
    </RouteTransition>
  );
};
