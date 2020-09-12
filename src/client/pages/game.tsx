import React from 'react';
import styled from '@emotion/styled';
import {Redirect} from 'react-router-dom';
import {useRecoilState, useRecoilValue} from 'recoil';
import {AudioCall} from 'src/client/components/audio-call';
import {GameWindow} from 'src/client/game';
import {Atoms} from 'src/client/store';

const Wrapper = styled.div`
  width: 100%;
  height: 100%;
`;

export const GamePage = () => {
  // const [room, setRoomState] = useRecoilState(Atoms.room);
  // if (!room.id) {
  //   return <Redirect to='/' />; // Prevent accessing page unless room has been assigned
  // }

  return (
    <Wrapper>
      <GameWindow />
      <AudioCall />
    </Wrapper>
  );
};
