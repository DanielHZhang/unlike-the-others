/** @jsx jsx */
import Axios from 'axios';
import styled from '@emotion/styled';
import {jsx} from '@emotion/react';
import {useState} from 'react';
import {useRecoilState} from 'recoil';
import {Link, RouteComponentProps} from 'react-router-dom';
import {motion, AnimatePresence} from 'framer-motion';
import {atoms} from 'src/client/store';
import {Button, Divider, Flex, Input, Modal, Stack} from 'src/client/components/base';
import {StorageKeys} from 'src/client/config/constants';
import {MAX_USERNAME_LENGTH} from 'src/shared/constants';
import {isAxiosError} from 'src/client/utils/axios';
import {HomeLayout} from 'src/client/components/layout';
import {LinkDivider} from 'src/client/components/icons/link-divider';
import {HomepageLink} from 'src/client/components/link';
import {ArrowRight} from 'src/client/components/icons';

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

type Props = RouteComponentProps<any> & {};

export const HomePage = (props: Props) => {
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
      await Axios.put(`/api/room/${room.id}/join`);
      props.history.push('/game');
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
      const {data: roomId} = await Axios.post<string>('/api/room/create');
      await Axios.post(`/api/room/${roomId}/join`);
      setRoom({id: roomId});
      props.history.push('/game');
    } catch (error) {
      if (isAxiosError(error)) {
        setState({...state, errorModalVisible: true, errorModalText: error.response.data.message});
      } else {
        console.error(error);
      }
    }
  };

  if (!user.isAuthed) {
    return (
      <HomeLayout>
        <Flex mainAxis='center' style={{margin: '10rem 0'}}>
          <Flex css={{position: 'relative', width: '300px'}}>
            <Input
              placeholder='What is your name?'
              onChange={(event) => setUser({...user, username: event.target.value})}
              // value={username}
              maxLength={MAX_USERNAME_LENGTH}
              css={{
                borderRadius: '8px',
                height: '50px',
                padding: '1px 50px 1px 11px',
                width: '100%',
              }}
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
                    <ArrowRight />
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </Flex>
        </Flex>
        <Flex flow='column' crossAxis='center' style={{marginBottom: '2rem'}}>
          <HomepageLink to='/sign-up'>Sign Up</HomepageLink>
          <LinkDivider />
          <HomepageLink to='/login'>Login</HomepageLink>
        </Flex>
      </HomeLayout>
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
            <Stack flow='row'>
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
