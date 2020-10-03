import React from 'react';
import {Redirect} from 'react-router-dom';
import {useRecoilState, useRecoilValue} from 'recoil';
import {AudioCall} from 'src/client/components/audio-call';
import {Button} from 'src/client/components/base/button';
import {Stack} from 'src/client/components/base/stack';
import {GameWindow} from 'src/client/game';
import {ClientSocket} from 'src/client/networking/tcp';
import {atoms} from 'src/client/store';
import {useDidMount} from 'src/client/utils/hooks';
import {Chatbox} from 'src/client/components/chatbox';
import Axios from 'axios';

export const GamePage = () => {
  const room = useRecoilValue(atoms.room);
  // if (!room.id) {
  //   return <Redirect to='/' />; // Prevent accessing page unless room has been assigned
  // }

  useDidMount(() => {
    const socket = new ClientSocket();

    // Leave room on page unmount
    return () => {
      socket.dispose();
    };
  });

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
      <GameWindow />
      <AudioCall />
    </div>
  );
};
