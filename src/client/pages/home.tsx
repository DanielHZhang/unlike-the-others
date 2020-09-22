import React, {useCallback, useState} from 'react';
import styled from '@emotion/styled';
import {useRecoilState} from 'recoil';
import {RouteComponentProps} from 'react-router-dom';
import {useDidMount} from 'src/client/utils/hooks';
import {atoms} from 'src/client/store';
import {socket} from 'src/client/networking/tcp';
import {Button} from 'src/client/components/button';
import {Stack} from 'src/client/components/stack';
import {Input} from 'src/client/components/input';
import {Modal} from 'src/client/components/modal';
import {SocketResponse} from 'src/shared/types';
import {channel} from 'src/client/networking/udp';
import {StorageKeys} from 'src/client/config/constants';

const Container = styled.div`
  background-color: #000;
  color: #fff;
  height: 100%;
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

type Props = RouteComponentProps<any> & {};

export const HomePage = (props: Props) => {
  const [username, setUsername] = useRecoilState(atoms.username);
  const [room, setRoom] = useRecoilState(atoms.room);
  const [state, setState] = useState({joining: false, errorModalVisible: false});
  const onJoinButtonClick = useCallback(() => {
    socket.emit('joinRoom', room.id);
    channel.emit('joinRoom', room.id);
  }, [room.id]);

  useDidMount(() => {
    socket.once('createRoomResponse', (res: SocketResponse) => {
      if (res.status >= 400) {
        setState({...state, errorModalVisible: true});
      } else {
        const roomId = res.payload;
        console.log('Created room:', roomId);
        socket.emit('joinRoom', roomId);
      }
    });

    socket.once('joinRoomResponse', (res: SocketResponse) => {
      if (res.status >= 400) {
        setState({...state, errorModalVisible: true});
      } else {
        const roomId = res.payload;
        console.log('Joined room:', roomId);
        setRoom({id: roomId});
        props.history.push('/game');
      }
    });

    return () => {
      socket.off('createRoomResponse');
      socket.off('joinRoomResponse');
    };
  });

  return (
    <Container>
      <TopBar />
      <HeroWrapper>
        <BoundedStack flow='column' spacing='16px'>
          <Input
            placeholder='What is your name?'
            onChange={(event) => setUsername(event.target.value)}
            onBlur={() => localStorage.setItem(StorageKeys.Name, username)}
            value={username}
            maxLength={32}
          />
          <Button onClick={() => socket.emit('createRoom')}>HOST NEW GAME</Button>
          {state.joining ? (
            <Stack flow='row'>
              <Input
                placeholder='Enter code'
                onChange={(event) => setRoom({id: event.target.value})}
                type='password'
                maxLength={32}
                style={{flexGrow: 1}}
              />
              <Button onClick={onJoinButtonClick}>JOIN</Button>
            </Stack>
          ) : (
            <Button onClick={() => setState({...state, joining: true})}>JOIN A GAME</Button>
          )}
          <Button>FIND A GAME</Button>
          <Button>HOW TO PLAY</Button>
        </BoundedStack>
      </HeroWrapper>
      <Modal
        title='Whoops!'
        visible={state.errorModalVisible}
        onVisibleChange={(visibility) => setState({...state, errorModalVisible: visibility})}
      >
        <ModalText>There is no active game with that code!</ModalText>
      </Modal>
    </Container>
  );
};
