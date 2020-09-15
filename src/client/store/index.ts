import Phaser from 'phaser';
import {atom} from 'recoil';
import {GameControls} from 'src/shared/types';

export const Atoms = {
  username: atom({
    key: 'username',
    default: localStorage.getItem('name') || '',
  }),
  room: atom({
    key: 'room',
    default: {
      id: '',
    },
  }),
  gameControls: atom<GameControls>({
    key: 'gameControls',
    default: {
      up: 87, // W
      left: 65, // A
      down: 83, // S
      right: 68, // D
    },
  }),
};
