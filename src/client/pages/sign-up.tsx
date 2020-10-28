/** @jsx jsx */
import {jsx} from '@emotion/react';
import {Fragment} from 'react';
import {useLocation} from 'wouter';
import {useIsPresent} from 'framer-motion';
import {FormProvider, SubmitHandler, useForm} from 'react-hook-form';
import {axios, fetchAccessToken, isNetworkError} from 'src/client/network';
import {Alert, Button, Flex, Icon, MotionFlex, Stack} from 'src/client/components/base';
import {childVariants, RouteTransition} from 'src/client/components/animation/route';
import {EmailInput, PasswordInput, UsernameInput} from 'src/client/components/auth/input';
import {AuthNav} from 'src/client/components/auth/nav';
import {RhombusSpinner} from 'src/client/components/spinner/rhombus';
import {asyncAtoms} from 'src/client/store';
import {useSetAsyncAtom} from 'src/client/hooks';

type FormState = {
  username: string;
  email: string;
  password: string;
  networkError: null;
};

export const SignUpPage = (): JSX.Element => {
  const [, setLocation] = useLocation();
  const isPresent = useIsPresent();
  const setUser = useSetAsyncAtom(asyncAtoms.user);
  const methods = useForm<FormState>({
    defaultValues: {username: '', email: '', password: '', networkError: null},
  });
  const {errors, formState} = methods;
  const onSubmit: SubmitHandler<FormState> = async ({username, email, password}) => {
    try {
      methods.clearErrors('networkError');
      await axios.post('/api/user/sign-up', {username, email, password});
      await setUser(async () => {
        const {accessToken, claims} = await fetchAccessToken();
        return {accessToken, ...claims, isAuthed: true};
      });
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
          <Flex mainAxis='center' css={{margin: '4.5rem 0'}}>
            <Stack flow='column' crossAxis='stretch' spacing='1rem' css={{width: 300}}>
              {errors.networkError && <Alert type='error' message={errors.networkError.message!} />}
              <UsernameInput showError={isPresent} />
              <EmailInput showError={isPresent} />
              <PasswordInput showError={isPresent} />
              <MotionFlex key='anim-submit' variants={childVariants} mainAxis='flex-end'>
                <Button type='submit' loading={formState.isSubmitting}>
                  {formState.isSubmitting ? (
                    <RhombusSpinner />
                  ) : (
                    <Fragment>
                      <span css={{margin: '0 6px'}}>Continue</span>
                      <Icon.ArrowRight color='#fff' />
                    </Fragment>
                  )}
                </Button>
              </MotionFlex>
            </Stack>
          </Flex>
        </form>
      </FormProvider>
      <AuthNav upper={{text: 'Login', url: '/login'}} lower={{text: 'Home', url: '/'}} />
    </RouteTransition>
  );
};
