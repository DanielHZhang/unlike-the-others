/** @jsx jsx */
import {jsx} from '@emotion/react';
import {useState} from 'react';
import {useSetRecoilState} from 'recoil';
import {useLocation} from 'wouter';
import {AnimatePresence, useIsPresent, usePresence} from 'framer-motion';
import {FormProvider, SubmitHandler, useForm} from 'react-hook-form';
import {asyncAtoms, atoms} from 'src/client/store';
import {axios, isAxiosError} from 'src/client/network';
import {
  Button,
  Flex,
  Icon,
  InputWithIcon,
  Modal,
  MotionFlex,
  Stack,
} from 'src/client/components/base';
import {InputButtonWrapper} from 'src/client/components/home/input';
import {useAsyncAtomValue, useSetAsyncAtom} from 'src/client/hooks';
import {childVariants, RouteTransition} from 'src/client/components/animation/route';
import {UsernameInput} from 'src/client/components/auth/input';
import {AuthNav} from 'src/client/components/auth/nav';
import type {AccessTokenData} from 'src/shared/types';
import {RhombusSpinner} from 'src/client/components/spinner/rhombus';

type UsernameFormState = {username: string};

const UnauthHomePage = (): JSX.Element => {
  const setUser = useSetAsyncAtom(asyncAtoms.user);
  const methods = useForm<UsernameFormState>({
    mode: 'onChange',
    reValidateMode: 'onSubmit',
    defaultValues: {username: ''},
  });
  const {formState} = methods;
  const isPresent = useIsPresent();
  const onSubmit: SubmitHandler<UsernameFormState> = async (data) => {
    if (!formState.isValid || formState.isSubmitting || formState.isSubmitted) {
      return;
    }
    await setUser(async () => {
      const response = await axios.post<AccessTokenData>('/api/auth/guest', data);
      const {accessToken, claims} = response.data;
      return {accessToken, ...claims, isAuthed: true};
    });
  };

  return (
    <RouteTransition key='anim-unauth'>
      <Flex mainAxis='center' css={{margin: '10rem 0'}}>
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)}>
            <Flex flow='column' crossAxis='stretch' css={{width: '300px'}}>
              <InputButtonWrapper
                loading={formState.isSubmitting}
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

type CodeFormState = {code: string};

const AuthHomePage = (): JSX.Element => {
  const isPresent = useIsPresent();
  const setRoom = useSetRecoilState(atoms.room);
  const [, setLocation] = useLocation();
  const [loadingHost, setLoadingHost] = useState(false);
  const [codeInputVisible, setCodeInputVisible] = useState(false);
  const [errorModal, setErrorModal] = useState({visible: false, text: ''});
  const {handleSubmit, register, formState, getValues} = useForm<CodeFormState>({
    mode: 'onChange',
    defaultValues: {code: ''},
  });

  const fetchJoinRoom = async (roomId: string) => {
    try {
      await axios.put(`/api/room/${roomId}/join`);
      setRoom({id: roomId});
      setLocation('/game');
    } catch (error) {
      if (isAxiosError(error)) {
        setErrorModal({visible: true, text: 'There is no active game with that code!'});
      }
    }
  };

  const onClickHost = async () => {
    try {
      setLoadingHost(true);
      const response = await axios.post<{roomId: string}>('/api/room/create');
      const {roomId} = response.data;
      await fetchJoinRoom(roomId);
    } catch (error) {
      if (isAxiosError(error)) {
        setErrorModal({visible: true, text: error.response.data.message});
      }
    }
  };

  const onSubmit: SubmitHandler<CodeFormState> = async (data) => {
    await fetchJoinRoom(data.code);
  };

  return (
    <RouteTransition key='anim-auth'>
      <Flex mainAxis='center' css={{backgroundColor: 'transparent', marginTop: '8rem'}}>
        <Stack flow='column' spacing='1.5rem' css={{flex: '1 1 0%', maxWidth: 300}}>
          <MotionFlex flow='column' crossAxis='stretch' variants={childVariants}>
            <Button loading={loadingHost} onClick={onClickHost}>
              {loadingHost ? <RhombusSpinner /> : 'HOST NEW GAME'}
            </Button>
          </MotionFlex>
          <MotionFlex flow='column' crossAxis='stretch' variants={childVariants}>
            {codeInputVisible ? (
              <form onSubmit={handleSubmit(onSubmit)}>
                <InputButtonWrapper
                  loading={formState.isSubmitting}
                  showButton={isPresent && Boolean(getValues('code'))}
                >
                  <InputWithIcon
                    ref={register({
                      required: true,
                    })}
                    name='code'
                    icon={Icon.Lock}
                    type='password'
                    maxLength={40}
                    placeholder='Enter code'
                  />
                </InputButtonWrapper>
              </form>
            ) : (
              <Button onClick={() => setCodeInputVisible(true)}>JOIN A GAME</Button>
            )}
          </MotionFlex>
          <MotionFlex flow='column' crossAxis='stretch' variants={childVariants}>
            <Button>FIND A GAME</Button>
          </MotionFlex>
          <MotionFlex flow='column' crossAxis='stretch' variants={childVariants}>
            <Button>HOW TO PLAY</Button>
          </MotionFlex>
        </Stack>
        <Modal
          title='Whoops!'
          visible={errorModal.visible}
          onClose={() => setErrorModal({...errorModal, visible: false})}
        >
          <div css={{fontSize: 18, fontWeight: 500}}>{errorModal.text}</div>
        </Modal>
      </Flex>
    </RouteTransition>
  );
};

export const HomePage = (): JSX.Element => {
  const user = useAsyncAtomValue(asyncAtoms.user);
  const [isPresent, safeToRemove] = usePresence();
  const [isRemoving, setRemoving] = useState(false);

  if (!isPresent && !isRemoving) {
    setRemoving(true); // Trigger exit animations in nested AnimatePresence
  }

  return (
    <AnimatePresence exitBeforeEnter={true} onExitComplete={() => safeToRemove?.()}>
      {isRemoving ? null : user?.isAuthed ? <AuthHomePage /> : <UnauthHomePage />}
    </AnimatePresence>
  );
};
