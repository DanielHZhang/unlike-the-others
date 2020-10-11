import {atom} from 'recoil';
import {GameControls} from 'src/shared/types';

export const atoms = {
  user: atom({
    key: 'user',
    default: {
      accessToken: '',
      isAuthed: false,
      isGuest: true,
      username: '',
    },
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
