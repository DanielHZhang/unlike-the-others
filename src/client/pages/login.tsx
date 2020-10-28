/** @jsx jsx */
import {jsx} from '@emotion/react';
import {motion, useIsPresent} from 'framer-motion';
import {useLocation} from 'wouter';
import {FormProvider, SubmitHandler, useForm} from 'react-hook-form';
import {Alert, Button, Flex, Icon, Stack} from 'src/client/components/base';
import {childVariants, RouteTransition} from 'src/client/components/animation/route';
import {EmailInput, PasswordInput} from 'src/client/components/auth/input';
import {axios, isNetworkError} from 'src/client/network';
import {AuthNav} from 'src/client/components/auth/nav';

type FormState = {
  email: string;
  password: string;
  networkError: null;
};

export const LoginPage = (): JSX.Element => {
  const [, setLocation] = useLocation();
  const isPresent = useIsPresent();
  const methods = useForm<FormState>({
    defaultValues: {email: '', password: '', networkError: null},
  });
  const {errors, formState} = methods;
  const onSubmit: SubmitHandler<FormState> = async (data) => {
    try {
      methods.clearErrors('networkError');
      await axios.post('/api/user/login', data);
      setLocation('/'); // Push back to homepage
    } catch (error) {
      // Bad request is either from network error or user messing with client code
      if (isNetworkError(error)) {
        methods.setError('networkError', {message: error.message});
      }
    }
  };

  return (
    <RouteTransition>
      <FormProvider {...methods}>
        <form onSubmit={methods.handleSubmit(onSubmit)}>
          <Flex mainAxis='center' css={{margin: '6.5rem 0'}}>
            <Stack flow='column' crossAxis='stretch' spacing='1rem' css={{width: 300}}>
              {errors.networkError && <Alert type='error' message={errors.networkError.message!} />}
              <EmailInput showError={isPresent} />
              <PasswordInput showError={isPresent} />
              <motion.div
                key='anim-submit'
                variants={childVariants}
                css={{display: 'flex', justifyContent: 'flex-end'}}
              >
                <Button type='submit' loading={formState.isSubmitting}>
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
