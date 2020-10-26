/** @jsx jsx */
import {jsx} from '@emotion/react';
import {Fragment, useState} from 'react';
import {useRecoilState, useRecoilValue, useSetRecoilState} from 'recoil';
import {useLocation} from 'wouter';
import {motion, AnimatePresence, useIsPresent} from 'framer-motion';
import {FormProvider, SubmitHandler, useForm} from 'react-hook-form';
import {atoms} from 'src/client/store';
import {axios, isAxiosError} from 'src/client/network';
import {Button, Flex, Icon, Input, InputWithIcon, Modal, Stack} from 'src/client/components/base';
import {UsernameInput} from 'src/client/components/auth/input';
import {childVariants, RouteTransition} from 'src/client/components/animation/route-transition';
import {RhombusSpinner} from 'src/client/components/spinner/rhombus';
import {AuthNav} from 'src/client/components/auth/nav';
import type {AccessResponse} from 'src/shared/types';
import {InputButtonWrapper} from 'src/client/components/home/input';
import {MotionFlex} from 'src/client/components/home/motion';

type FormState = {username: string};

const UnauthHomePage = (): JSX.Element => {
  const setUser = useSetRecoilState(atoms.user);
  const methods = useForm<FormState>({
    mode: 'onChange',
    reValidateMode: 'onSubmit',
    defaultValues: {username: ''},
  });
  const isPresent = useIsPresent();
  const onSubmit: SubmitHandler<FormState> = async (data) => {
    try {
      const response = await axios.post<AccessResponse>('/api/auth/guest', data);
      const {accessToken, claims} = response.data;
      setUser({
        accessToken,
        ...claims,
        username: `${claims.username}#${claims.hashtag}`,
        isAuthed: true,
      });
    } catch (error) {
      if (isAxiosError(error)) {
        // Messsage should only ever be set if user messes with form properties
        methods.setError('username', {
          message: error.response.data.message,
          shouldFocus: true,
        });
      }
    }
  };

  return (
    <Fragment>
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
    </Fragment>
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
    <Flex mainAxis='center' css={{backgroundColor: 'transparent', marginTop: '8rem'}}>
      <Stack flow='column' spacing='1.5rem' css={{flex: '1 1 0%', maxWidth: 300}}>
        <MotionFlex key='host'>
          <Button loading={state.loadingCreate} onClick={onCreateClick}>
            HOST NEW GAME
          </Button>
        </MotionFlex>
        <MotionFlex key='join'>
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
        <MotionFlex key='find'>
          <Button>FIND A GAME</Button>
        </MotionFlex>
        <MotionFlex key='how'>
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
  );
};

export const HomePage = (): JSX.Element => {
  const user = useRecoilValue(atoms.user);
  // const [user, setUser] = useRecoilState(atoms.user);
  // return (
  //   <RouteTransition>
  //     <UnauthHomePage />
  //   </RouteTransition>
  // );
  return (
    <RouteTransition>
      <AuthHomePage />
    </RouteTransition>
  );
  return <RouteTransition>{user.isAuthed ? <AuthHomePage /> : <UnauthHomePage />}</RouteTransition>;
};
