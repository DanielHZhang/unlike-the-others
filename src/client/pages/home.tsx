/** @jsx jsx */
import styled from '@emotion/styled';
import {jsx} from '@emotion/react';
import {FC, useState} from 'react';
import {useRecoilState} from 'recoil';
import {useLocation} from 'wouter';
import {motion, AnimatePresence} from 'framer-motion';
import {atoms} from 'src/client/store';
import {Button, Flex, Icon, Input, Modal, MotionInput, Stack} from 'src/client/components/base';
import {MAX_USERNAME_LENGTH} from 'src/shared/constants';
import {HomeLayout} from 'src/client/components/layout';
import {HomepageLink} from 'src/client/components/link';
import {useDidMount} from 'src/client/hooks';
import {childVariants, RouteTransition} from 'src/client/components/animation/route-transition';
import {axios, isAxiosError} from 'src/client/network';

const Container = styled(Flex)`
  background-color: transparent;
  color: #fff;
  margin: 24px;
`;

const BoundedStack = styled(Stack)`
  flex: 1 1 0%;
  max-width: 300px;
`;

const ModalText = styled.div`
  font-size: 18px;
  font-weight: 500;
`;

const UsernameInput = styled(MotionInput)`
  border-radius: 8px;
  padding: 1px 50px 1px 11px;
  width: 100%;
`;

type Props = {};

export const HomePage: FC<Props> = (props) => {
  const [, setLocation] = useLocation();
  const [user, setUser] = useRecoilState(atoms.user);
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

  useDidMount(() => {
    console.log('mounting homepage');
    return () => {
      console.log('unmounting homepage');
    };
  });

  if (!user.isAuthed) {
    return (
      <RouteTransition>
        <Flex mainAxis='center' css={{margin: '10rem 0'}}>
          <Flex css={{position: 'relative', width: '300px'}}>
            <UsernameInput
              key='input'
              variants={childVariants}
              placeholder='What is your name?'
              onChange={(event) => setUser({...user, username: event.target.value})}
              maxLength={MAX_USERNAME_LENGTH}
            />
            <AnimatePresence>
              {user.username && (
                <motion.div
                  initial={{x: '20px', opacity: 0}}
                  animate={{x: '0px', opacity: 1}}
                  exit={{opacity: 0}}
                  css={{position: 'absolute', right: '5px', top: '5px'}}
                >
                  <Button
                    onClick={() => {
                      // SEND REQ TO SERVER TO VERIFY IF USERNAME IS AVAILABLE
                      setUser({...user, isAuthed: true});
                    }}
                  >
                    <Icon.ArrowRight />
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </Flex>
        </Flex>
        <Flex flow='column' crossAxis='center' style={{marginBottom: '2rem'}}>
          <motion.div key='/sign-up' variants={childVariants}>
            <HomepageLink to='/sign-up'>Sign Up</HomepageLink>
          </motion.div>
          <motion.div key='divider' variants={childVariants}>
            <Icon.Scale />
          </motion.div>
          <motion.div key='/login' variants={childVariants}>
            <HomepageLink to='/login'>Login</HomepageLink>
          </motion.div>
        </Flex>
      </RouteTransition>
    );
  }

  return (
    <HomeLayout>
      <Container>
        <BoundedStack flow='column' spacing='16px'>
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
        </BoundedStack>
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
          <ModalText>{state.errorModalText}</ModalText>
        </Modal>
      </Container>
    </HomeLayout>
  );
};
