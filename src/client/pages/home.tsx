/** @jsx jsx */
import Axios from 'axios';
import styled from '@emotion/styled';
import {jsx} from '@emotion/react';
import {FC, useState} from 'react';
import {useRecoilState} from 'recoil';
import {motion, AnimatePresence, Variants} from 'framer-motion';
import {atoms} from 'src/client/store';
import {baseInputStyles, Button, Flex, Input, Modal, Stack} from 'src/client/components/base';
import {MAX_USERNAME_LENGTH} from 'src/shared/constants';
import {isAxiosError} from 'src/client/utils/axios';
import {HomeLayout} from 'src/client/components/layout';
import {LinkDivider} from 'src/client/components/icons/link-divider';
import {HomepageLink} from 'src/client/components/link';
import {ArrowRight} from 'src/client/components/icons';
import {useDidMount} from 'src/client/hooks';

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

const UsernameInput = styled(motion.input)`
  ${baseInputStyles}
  border-radius: 8px;
  height: 50px;
  padding: 1px 50px 1px 11px;
  width: 100%;
`;

const containerVariants: Variants = {
  // hidden: {
  //   opacity: 0,
  //   y: 20,
  // },
  visible: {
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3,
      duration: 0.8,
    },
  },
  exit: {
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.3,
      duration: 0.8,
    },
  },
};

const childVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 40,
  },
  visible: {
    opacity: 1,
    y: 0,
  },
  exit: {
    opacity: 0,
    y: -40,
  },
};

type Props = /*  RouteComponentProps<any> & */ {};

export const HomePage: FC<Props> = (props) => {
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

  useDidMount(() => {
    console.log('mounting homepage');
    return () => {
      console.log('unmounting homepage');
    };
  });

  // const same = usePresence();
  // const what = useIsPresent();

  // console.log('use presence home:', same, what);

  if (!user.isAuthed) {
    return (
      // <AnimatePresence
      //   /* exitBeforeEnter={true} */ onExitComplete={() => console.log('exit completed')}
      // >
      // <Route path='/' exact={true}>
      <motion.div
        key='container'
        initial='hidden'
        animate='visible'
        exit='exit'
        variants={containerVariants}
      >
        <Flex mainAxis='center' style={{margin: '10rem 0'}}>
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
                    <ArrowRight />
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
            <LinkDivider />
          </motion.div>
          <motion.div key='/login' variants={childVariants}>
            <HomepageLink to='/login'>Login</HomepageLink>
          </motion.div>
        </Flex>
      </motion.div>

      // </Route>
      // </AnimatePresence>
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
