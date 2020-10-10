import Axios from 'axios';
import React, {useEffect, useState} from 'react';
import {RouteComponentProps} from 'react-router-dom';
import {useRecoilValue} from 'recoil';
import {AudioCall} from 'src/client/components/audio-call';
import {GameWindow} from 'src/client/game';
import {socket} from 'src/client/network/socket';
import {atoms} from 'src/client/store';
import {Chatbox} from 'src/client/components/chatbox';
import {channel} from 'src/client/network/webrtc';
import {FingerprintSpinner} from 'src/client/components/spinner';
import {useDidMount} from 'src/client/hooks';
import {Layout} from 'src/client/components/layout';

type Props = RouteComponentProps<any> & {};

export const GamePage = (props: Props) => {
  const accessToken = useRecoilValue(atoms.accessToken);
  const [state, setState] = useState({loading: true, errorModalVisible: false});

  // useEffect(() => {
  //   if (!accessToken || socket.isConnected()) {
  //     return;
  //   }
  //   socket.onConnect(accessToken, (error) => {
  //     if (error) {
  //       // Authentication failed, redirect back to homepage
  //       return props.history.push('/');
  //     }
  //     // Connect to UDP channel only after successful TCP socket authentication
  //     channel.onConnect((error) => {
  //       if (error) {
  //         console.error(error);
  //       } else {
  //         setState({...state, loading: false});
  //       }
  //     });
  //   });

  //   return () => {
  //     socket.dispose(); // Dispose of the socket on page unmount
  //   };
  // }, [accessToken]);

  if (true /* state.loading */) {
    return (
      <Layout>
        <div> // this div shoudl center everything
          <FingerprintSpinner color='#fff' />
          <div>Loading...</div>
        </div>
      </Layout>
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
