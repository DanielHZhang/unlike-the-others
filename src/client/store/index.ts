import {atom} from 'recoil';
import {StorageKeys} from 'src/client/config/constants';
import {GameControls} from 'src/shared/types';

export const atoms = {
  accessToken: atom({
    key: 'accessToken',
    default: '',
  }),
  username: atom({
    key: 'username',
    default: localStorage.getItem(StorageKeys.Username) || '',
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
