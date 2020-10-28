/** @jsx jsx */
import {jsx} from '@emotion/react';
import {Fragment, Suspense, useEffect, useState} from 'react';
import {useRecoilState, useRecoilValue, useSetRecoilState} from 'recoil';
import {useLocation} from 'wouter';
import {motion, AnimatePresence, useIsPresent} from 'framer-motion';
import {FormProvider, SubmitHandler, useForm} from 'react-hook-form';
import {asyncAtoms, atoms} from 'src/client/store';
import {axios, isAxiosError} from 'src/client/network';
import {Button, Flex, Icon, Input, InputWithIcon, Modal, Stack} from 'src/client/components/base';
import {UsernameInput} from 'src/client/components/auth/input';
import {childVariants, RouteTransition} from 'src/client/components/animation/route-transition';
import {RhombusSpinner} from 'src/client/components/spinner/rhombus';
import {AuthNav} from 'src/client/components/auth/nav';
import type {AccessTokenData} from 'src/shared/types';
import {InputButtonWrapper} from 'src/client/components/home/input';
import {MotionFlex} from 'src/client/components/home/motion';
import {useAsyncAtomValue, useDidMount, useSetAsyncAtom} from 'src/client/hooks';

type FormState = {username: string};

const UnauthHomePage = (): JSX.Element => {
  const setUser = useSetAsyncAtom(asyncAtoms.user);
  const methods = useForm<FormState>({
    mode: 'onChange',
    reValidateMode: 'onSubmit',
    defaultValues: {username: ''},
  });
  const isPresent = useIsPresent();
  const onSubmit: SubmitHandler<FormState> = async (data) => {
    const {formState} = methods;
    if (!formState.isValid || formState.isSubmitting || formState.isSubmitted) {
      return;
    }
    await setUser(async () => {
      const response = await axios.post<AccessTokenData>('/api/auth/guest', data);
      const {accessToken, claims} = response.data;
      // resolve();
      return {accessToken, ...claims, isAuthed: true};
    });
    // await new Promise((resolve) => {
    //   setUser(async () => {
    //     const response = await axios.post<AccessTokenData>('/api/auth/guest', data);
    //     const {accessToken, claims} = response.data;
    //     resolve();
    //     return {accessToken, ...claims, isAuthed: true};
    //   });
    // });
  };

  // console.log('formstate:', methods.formState.isSubmitting);

  return (
    <RouteTransition key='anim-unauth'>
      <Flex mainAxis='center' css={{margin: '10rem 0'}}>
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)}>
            <Flex css={{position: 'relative', width: '300px'}}>
              <InputButtonWrapper
                loading={methods.formState.isSubmitting}
                showButton={isPresent && Boolean(methods.getValues('username'))}
              >
                <UsernameInput showError={isPresent} />
              </InputButtonWrapper>
            </Flex>
          </form>
        </FormProvider>
      </Flex>
      <AuthNav upper={{text: 'Sign Up', url: '/sign-up'}} lower={{text: 'Login', url: '/login'}} />
    </RouteTransition>
  );
};

const AuthHomePage = (): JSX.Element => {
  const [, setLocation] = useLocation();
  const [room, setRoom] = useRecoilState(atoms.room);
  const [state, setState] = useState({
    joining: false,
    errorModalVisible: false,
    errorModalText: '',
    loadingCreate: false,
    loadingJoin: false,
  });

  const onJoinClick = async () => {
    try {
      setState({...state, loadingJoin: true});
      await axios.put(`/api/room/${room.id}/join`);
      setLocation('/game');
    } catch (error) {
      if (isAxiosError(error)) {
        setState({...state, errorModalVisible: true, errorModalText: error.response.data.message});
      } else {
        console.error(error);
      }
    }
  };

  const onCreateClick = async () => {
    try {
      setState({...state, loadingCreate: true});
      const {data: roomId} = await axios.post<string>('/api/room/create');
      await axios.post(`/api/room/${roomId}/join`);
      setRoom({id: roomId});
      setLocation('/game');
    } catch (error) {
      if (isAxiosError(error)) {
        setState({...state, errorModalVisible: true, errorModalText: error.response.data.message});
      } else {
        console.error(error);
      }
    }
  };

  return (
    <RouteTransition>
      <Flex mainAxis='center' css={{backgroundColor: 'transparent', marginTop: '8rem'}}>
        <Stack flow='column' spacing='1.5rem' css={{flex: '1 1 0%', maxWidth: 300}}>
          <MotionFlex /* name='host' */>
            <Button loading={state.loadingCreate} onClick={onCreateClick}>
              HOST NEW GAME
            </Button>
          </MotionFlex>
          <MotionFlex /* name='join' */>
            {state.joining ? (
              <InputButtonWrapper>
                <InputWithIcon
                  icon={Icon.AtSign}
                  type='password'
                  maxLength={40}
                  placeholder='Enter code'
                />
              </InputButtonWrapper>
            ) : (
              <Button onClick={() => setState({...state, joining: true})}>JOIN A GAME</Button>
            )}
          </MotionFlex>
          <MotionFlex /* name='find' */>
            <Button>FIND A GAME</Button>
          </MotionFlex>
          <MotionFlex /* name='how' */>
            <Button>HOW TO PLAY</Button>
          </MotionFlex>
        </Stack>
        <Modal
          title='Whoops!'
          visible={state.errorModalVisible}
          onVisibleChange={(visible) => setState({...state, errorModalVisible: visible})}
        >
          <div css={{fontSize: 18, fontWeight: 500}}>{state.errorModalText}</div>
        </Modal>
      </Flex>
    </RouteTransition>
  );
};

export const HomePage = (): JSX.Element => {
  // const user = useRecoilValue(atoms.user);
  // const [user, setUser] = useAsyncAtomLoadable(asyncAtoms.user);
  const user = useAsyncAtomValue(asyncAtoms.user);
  const [state, setState] = useState(true);
  // if (user.state === 'hasError') {
  //   return <div>some error occurred</div>;
  // }

  // console.log('what am i getting from atom async:', user);
  // const [user, setUser] = useRecoilState(atoms.user);
  // return (
  //   <RouteTransition>
  //     <UnauthHomePage />
  //   </RouteTransition>
  // );
  // return (
  //   <RouteTransition>
  //     <AuthHomePage />
  //   </RouteTransition>
  // );

  useDidMount(() => {
    console.log('home page mounting');
    return () => {
      console.log('home page unmounting');
    };
  });

  return (
    <AnimatePresence exitBeforeEnter={true} onExitComplete={() => console.log('exit complete')}>
      {state ? <AuthHomePage /> : <UnauthHomePage />}
    </AnimatePresence>
  );
};
