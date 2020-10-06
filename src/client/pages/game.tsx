import Axios from 'axios';
import React, {useState} from 'react';
import {Redirect, RouteComponentProps} from 'react-router-dom';
import {useRecoilState, useRecoilValue} from 'recoil';
import {AudioCall} from 'src/client/components/audio-call';
import {Button} from 'src/client/components/base/button';
import {Stack} from 'src/client/components/base/stack';
import {GameWindow} from 'src/client/game';
import {ClientSocket} from 'src/client/networking/tcp';
import {atoms} from 'src/client/store';
import {useAsyncEffect, useDidMount} from 'src/client/utils/hooks';
import {Chatbox} from 'src/client/components/chatbox';
import {channel} from 'src/client/networking/udp';
import {FingerprintSpinner} from 'src/client/components/spinner';

type Props = RouteComponentProps<any> & {};

export const GamePage = (props: Props) => {
  const [state, setState] = useState({loading: true, errorModalVisible: false});
  const room = useRecoilValue(atoms.room);

  useAsyncEffect(async () => {
    const socket = new ClientSocket();
    await socket.isReady();
    socket.emit('authenticate', {
      roomId: room.id,
      jwt: Axios.defaults.headers.common.authorization,
    });
    socket.on('authenticate-reply', (data, status) => {
      if (status === 200) {
        // Connect to UDP channel only after successful TCP socket authentication
        channel.onConnect((error) => {
          if (error) {
            console.error(error);
          } else {
            setState({...state, loading: false});
          }
        });
      } else {
        // Authentication failed, redirect back to homepage
        props.history.push('/');
      }
    });

    // Dispose of the socket on page unmount
    return () => {
      socket.dispose();
    };
  }, []);

  if (true /* state.loading */) {
    return (
      <div>
        <FingerprintSpinner color='#000' />
        Loading...
      </div>
    );
  }
  if (state.errorModalVisible) {
    return <div>error modal here</div>;
  }

  return <GameWindow />;

  return (
    <div style={{backgroundColor: 'black'}}>
      {/* <Stack flow='column' style={{width: 200}}>
        <Button onClick={() => socket.emit('startGame')}>Start game</Button>
        <Button onClick={() => socket.emit('endGame')}>End game</Button>
        <Button onClick={() => socket.emit('startVoting')}>Start vote</Button>
        <Button onClick={() => socket.emit('endVoting')}>End vote</Button>
        <Button onClick={() => socket.emit('TEMP_killSelf')}>Kill yourself</Button>
        <Button onClick={() => socket.emit('TEMP_reviveSelf')}>Revive yourself</Button>
      </Stack>
      <Chatbox /> */}
      <GameWindow />9
      <AudioCall />
    </div>
  );
};
