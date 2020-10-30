/** @jsx jsx */
import {jsx} from '@emotion/react';
import {useState} from 'react';
import {asyncAtoms} from 'src/client/store';
import {useAsyncAtomValue} from 'src/client/hooks';
import {GameWindow} from 'src/client/components/game/window';
import {FingerprintSpinner} from 'src/client/components/spinner/fingerprint';

export const GamePage = (): JSX.Element => {
  const user = useAsyncAtomValue(asyncAtoms.user);
  // const [state, setState] = useState({loading: true, errorModalVisible: false});

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
      <div>
        <FingerprintSpinner color='#fff' />
        <div>Loading...</div>
      </div>
    );
  }

  // return <GameWindow />;

  // return (
  //   <div style={{backgroundColor: 'black'}}>
  //     {/* <Stack flow='column' style={{width: 200}}>
  //       <Button onClick={() => socket.emit('startGame')}>Start game</Button>
  //       <Button onClick={() => socket.emit('endGame')}>End game</Button>
  //       <Button onClick={() => socket.emit('startVoting')}>Start vote</Button>
  //       <Button onClick={() => socket.emit('endVoting')}>End vote</Button>
  //       <Button onClick={() => socket.emit('TEMP_killSelf')}>Kill yourself</Button>
  //       <Button onClick={() => socket.emit('TEMP_reviveSelf')}>Revive yourself</Button>
  //     </Stack>
  //     <Chatbox /> */}
  //     <GameWindow />9
  //     <AudioCall />
  //   </div>
  // );
};
