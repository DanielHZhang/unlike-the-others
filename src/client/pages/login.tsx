/** @jsx jsx */
import {jsx} from '@emotion/react';
import {motion, useIsPresent} from 'framer-motion';
import {useLocation} from 'wouter';
import {FormProvider, SubmitHandler, useForm} from 'react-hook-form';
import {Button, Flex, Icon, Stack} from 'src/client/components/base';
import {childVariants, RouteTransition} from 'src/client/components/animation/route';
import {EmailInput, PasswordInput} from 'src/client/components/auth/input';
import {axios, isAxiosError} from 'src/client/network';
import {AuthNav} from 'src/client/components/auth/nav';

type FormState = {
  email: string;
  password: string;
};

export const LoginPage = (): JSX.Element => {
  const [, setLocation] = useLocation();
  const isPresent = useIsPresent();
  const methods = useForm<FormState>({
    defaultValues: {email: '', password: ''},
  });
  const onSubmit: SubmitHandler<FormState> = async (data) => {
    try {
      await axios.post('/api/user/login', data);
      setLocation('/'); // Push back to homepage
    } catch (error) {
      // Bad request is either from network error or user messing with client code
    }
  };

  return (
    <RouteTransition>
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)}>
          <Flex mainAxis='center' css={{margin: '6.5rem 0'}}>
            <Stack flow='column' crossAxis='stretch' spacing='1rem' css={{width: 300}}>
              <EmailInput showError={isPresent} />
              <PasswordInput showError={isPresent} />
              <motion.div
                key='anim-submit'
                variants={childVariants}
                css={{display: 'flex', justifyContent: 'flex-end'}}
              >
                <Button type='submit' loading={methods.formState.isSubmitting}>
                  <span css={{margin: '0 6px'}}>Login</span>
                  <Icon.ArrowRight color='#fff' />
                </Button>
              </motion.div>
            </Stack>
          </Flex>
        </form>
      </FormProvider>
      <AuthNav upper={{text: 'Sign Up', url: '/sign-up'}} lower={{text: 'Home', url: '/'}} />
    </RouteTransition>
  );
};
