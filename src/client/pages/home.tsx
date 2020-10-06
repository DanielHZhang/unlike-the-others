import Axios from 'axios';
import React, {useState} from 'react';
import styled from '@emotion/styled';
import {useRecoilState} from 'recoil';
import {RouteComponentProps} from 'react-router-dom';
import {atoms} from 'src/client/store';
import {Button, Input, Modal, Stack} from 'src/client/components/base';
import {BackgroundParticles} from 'src/client/components/particles';
import {StorageKeys} from 'src/client/config/constants';

const Layout = styled.div`
  background: black;
  height: 100%;
  position: relative;
  z-index: 0; /* Allow tsparticles to appear with z-index -1 */
`;

const Container = styled.div`
  background-color: transparent;
  color: #fff;
  /* height: 100%; */
  padding: 24px;
`;

const TopBar = styled.div`
  height: 64px;
`;

const HeroWrapper = styled.div`
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
  text-align: center;
  font-family: Simplifica;
  color: white;
  font-size: 84px;
  letter-spacing: 0.2em;
`;

type Props = RouteComponentProps<any> & {};

export const HomePage = (props: Props) => {
  const [username, setUsername] = useRecoilState(atoms.username);
  const [room, setRoom] = useRecoilState(atoms.room);
  const [state, setState] = useState({
    joining: false,
    errorModalVisible: false,
    loadingCreate: false,
    loadingJoin: false,
  });

  const onJoinClick = async () => {
    try {
      setState({...state, loadingJoin: true});
      await Axios.put(`/api/room/${room.id}/join`);
      props.history.push('/game');
    } catch (error) {
      console.error(error);
      setState({...state, errorModalVisible: true});
    }
  };

  const onCreateClick = async () => {
    try {
      setState({...state, loadingCreate: true});
      const {data: roomId} = await Axios.post('/api/room/create');
      await Axios.post(`/api/room/${room.id}/join`);
      setRoom({id: roomId});
      props.history.push('/game');
    } catch (error) {
      // console.log(JSON.stringify(error, null, 2));
      console.log(error.response);
      setState({...state, errorModalVisible: true});
    }
  };

  return (
    <Layout>
      {/* <BackgroundParticles /> */}
      <TopBar />
      <Title>UNLIKE the OTHERS</Title>
      <Container>
        <HeroWrapper>
          <BoundedStack flow='column' spacing='16px'>
            <Input
              placeholder='What is your name?'
              onChange={(event) => setUsername(event.target.value)}
              onBlur={() => localStorage.setItem(StorageKeys.Name, username)}
              value={username}
              maxLength={32}
            />
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
          <ModalText>There is no active game with that code!</ModalText>
        </Modal>
      </Container>
    </Layout>
  );
};
