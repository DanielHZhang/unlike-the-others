import React, {memo} from 'react';
import Phaser from 'phaser';
import {useDidMount} from 'src/client/hooks';
import {useRecoilValue} from 'recoil';
import {atoms} from 'src/client/store';
import {Lobby} from 'src/client/game/scenes/lobby-nolights';

const elementId = 'game-window';

type Props = {};

export const GameWindow = memo<Props>(
  (props) => {
    const gameControls = useRecoilValue(atoms.gameControls);
    useDidMount(() => {
      new Phaser.Game({
        type: Phaser.WEBGL,
        scale: {
          autoCenter: Phaser.Scale.CENTER_BOTH,
          mode: Phaser.Scale.RESIZE,
          parent: elementId,
        },
        scene: new Lobby(gameControls),
      });
    });
    return <div id={elementId} />;
  },
  () => false
);
