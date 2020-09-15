import React, {Component, memo} from 'react';
import Phaser from 'phaser';
import {PokemonMap} from 'src/client/game/scenes/pokemon';
import {useDidMount} from 'src/client/utils/hooks';
import {useRecoilValue} from 'recoil';
import {Atoms} from 'src/client/store';
import {Lobby} from 'src/client/game/scenes/lobby-nolights';

const elementId = 'game-window';

type Props = {};

export const GameWindow = memo<Props>(
  (props) => {
    const gameControls = useRecoilValue(Atoms.gameControls);
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

// export class GameWindow extends Component<Props> {
//   private static readonly elementId = 'game-window';
//   private ref?: Phaser.Game;

//   constructor(props: Props) {
//     super(props);
//     this.state = {};
//   }

//   componentDidMount() {
//     this.ref = new Phaser.Game({
//       type: Phaser.AUTO,
//       parent: GameWindow.elementId,
//       physics: {
//         default: 'arcade',
//         arcade: {
//           gravity: {y: 0},
//         },
//       },
//       scale: {
//         autoCenter: Phaser.Scale.CENTER_BOTH,
//         mode: Phaser.Scale.RESIZE,
//         parent: GameWindow.elementId,
//       },
//       scene: [PokemonMap],
//     });

//     // this.ref = new Phaser.Game({
//     //   type: Phaser.AUTO,
//     //   physics: {
//     //     default: 'arcade',
//     //     arcade: {
//     //       debug: false,
//     //       // gravity: {y: 100},
//     //     },
//     //   },
//     //   scale: {
//     //     autoCenter: Phaser.Scale.CENTER_BOTH,
//     //     mode: Phaser.Scale.RESIZE,
//     //     parent: GameWindow.elementId,
//     //   },
//     //   scene: [ExampleScene],
//     // });
//   }

//   shouldComponentUpdate() {
//     return false;
//   }

//   render() {
//     return <div id={GameWindow.elementId} />;
//   }
// }
