/** @jsx jsx */
import {jsx} from '@emotion/react';
import {useState} from 'react';
import {useRecoilState, useRecoilValue} from 'recoil';
import {useLocation} from 'wouter';
import {motion, AnimatePresence, useIsPresent} from 'framer-motion';
import {FormProvider, SubmitHandler, useForm} from 'react-hook-form';
import {atoms} from 'src/client/store';
import {axios, isAxiosError} from 'src/client/network';
import {Button, Flex, Icon, Input, Modal, Stack} from 'src/client/components/base';
import {UsernameInput} from 'src/client/components/auth/input';
import {HomepageLink} from 'src/client/components/link';
import {childVariants, RouteTransition} from 'src/client/components/animation/route-transition';
import {AuthNav} from 'src/client/components/auth/nav';

type FormState = {username: string};

const UnauthHomePage = (): JSX.Element => {
  const methods = useForm<FormState>({
    mode: 'onChange',
    reValidateMode: 'onSubmit',
    defaultValues: {username: ''},
  });
  const isPresent = useIsPresent();
  const onSubmit: SubmitHandler<FormState> = async (data) => {
    const response = await axios.post('/api/auth/guest', data);
    // if repsonse successful, make another call to /access for access token
  };

  return (
    <RouteTransition>
      <Flex mainAxis='center' css={{margin: '10rem 0'}}>
        <FormProvider {...methods}>
          <form onSubmit={methods.handleSubmit(onSubmit)}>
            <Flex css={{position: 'relative', width: '300px'}}>
              <UsernameInput showError={isPresent} />
              <AnimatePresence>
                {isPresent && methods.getValues('username') && (
                  <motion.div
                    key='test'
                    initial={{x: '20px', opacity: 0}}
                    animate={{x: '0px', opacity: 1}}
                    exit={{opacity: 0}}
                    css={{
                      position: 'absolute',
                      right: 0,
                      height: 48,
                      width: 48,
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                    }}
                  >
                    <Button type='submit' css={{width: 36, height: 36}}>
                      <Icon.ArrowRight />
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
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
    <Flex css={{backgroundColor: 'transparent', color: '#fff', margin: 24}}>
      <Stack flow='column' spacing='16px' css={{flex: '1 1 0%', maxWidth: 300}}>
        <Button loading={state.loadingCreate} onClick={onCreateClick}>
          HOST NEW GAME
        </Button>
        {state.joining ? (
          <Stack>
            <Input
              placeholder='Enter code'
              onChange={(event) => setRoom({id: event.target.value})}
              type='password'
              maxLength={32}
              style={{flexGrow: 1}}
            />
            <Button onClick={onJoinClick}>JOIN</Button>
          </Stack>
        ) : (
          <Button onClick={() => setState({...state, joining: true})}>JOIN A GAME</Button>
        )}
        <Button>FIND A GAME</Button>
        <Button>HOW TO PLAY</Button>
      </Stack>
      {/* <Modal
          title='JOIN GAME'
          visible={state.joinModalVisible}
          onVisibleChange={(visible) => setState({...state, joinModalVisible: visible})}
        >
        </Modal> */}
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
  return user.isAuthed ? <AuthHomePage /> : <UnauthHomePage />;
};
