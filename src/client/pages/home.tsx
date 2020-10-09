import Axios from 'axios';
import React, {useState} from 'react';
import styled from '@emotion/styled';
import {useRecoilState} from 'recoil';
import {RouteComponentProps} from 'react-router-dom';
import {atoms} from 'src/client/store';
import {Button, Divider, Flex, Input, Modal, Stack} from 'src/client/components/base';
import {BackgroundParticles} from 'src/client/components/particles';
import {StorageKeys} from 'src/client/config/constants';
import {MAX_USERNAME_LENGTH} from 'src/shared/constants';
import {isAxiosError} from 'src/client/utils/axios';
import {Layout} from 'src/client/components/layout';

const Container = styled.div`
  background-color: transparent;
  color: #fff;
  /* height: 100%; */
  margin: 24px;
`;

const TopBar = styled.div`
  height: 64px;
`;

const HeroWrapper = styled(Flex)`
  padding: 48px;
`;

const BoundedStack = styled(Stack)`
  flex: 1 1 0%;
  max-width: 300px;
`;

const ModalText = styled.div`
  font-size: 18px;
  font-weight: 500;
`;

const Title = styled.div`
  margin: 16px 0;
  text-align: center;
  font-family: Simplifica;
  color: white;
  font-size: 84px;
  letter-spacing: 0.2em;
`;

const InputWrapper = styled(Flex)`
  position: relative;
  /* padding: 0 300px; */
  width: 300px;
`;

const InputButtonWrapper = styled.div`
  position: absolute;
  right: 5px;
  top: 5px;
`;

const CustomInput = styled(Input)`
  border-radius: 8px;
  height: 50px;
  padding: 1px 50px 1px 11px;
`;

const ContinueButton = styled(Button)`
  /* height: 30px;
  width: 30px;
  padding: none;
  right: 5px;
  top: 5px;
  z-index: 1; */
`;

const ArrowRight = ({size = 24, color = '#000000'}) => (
  <svg
    xmlns='http://www.w3.org/2000/svg'
    width={size}
    height={size}
    viewBox='0 0 24 24'
    fill='none'
    stroke={color}
    strokeWidth='2'
    strokeLinecap='round'
    strokeLinejoin='round'
  >
    <path d='M5 12h13M12 5l7 7-7 7' />
  </svg>
);

type Props = RouteComponentProps<any> & {};

export const HomePage = (props: Props) => {
  const [username, setUsername] = useRecoilState(atoms.username);
  const [room, setRoom] = useRecoilState(atoms.room);
  const [state, setState] = useState({
    hasUsername: username ? true : false,
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

  if (!state.hasUsername) {
    return (
      <Layout>
        <TopBar />
        <Title>UNLIKE the OTHERS</Title>
        <Container>
          <HeroWrapper mainAxis='center'>
            <InputWrapper>
              <CustomInput
                placeholder='What is your name?'
                onChange={(event) => setUsername(event.target.value)}
                value={username}
                maxLength={MAX_USERNAME_LENGTH}
                width='100%'
              />
              {username && (
                <InputButtonWrapper>
                  <Button
                    onClick={() => {
                      localStorage.setItem(StorageKeys.Username, username);
                      setState({...state, hasUsername: true});
                    }}
                  >
                    <ArrowRight />
                  </Button>
                </InputButtonWrapper>
              )}
            </InputWrapper>
          </HeroWrapper>
          <Flex flow='column' crossAxis='center'>
            <Divider>OR</Divider>
            <div>Sign Up</div>
            <div>Login</div>
          </Flex>
        </Container>
      </Layout>
    );
  }

  return (
    <Layout>
      {/* <BackgroundParticles /> */}
      <TopBar />
      <Title>UNLIKE the OTHERS</Title>
      <Container>
        <HeroWrapper>
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
        </HeroWrapper>
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
    </Layout>
  );
};
