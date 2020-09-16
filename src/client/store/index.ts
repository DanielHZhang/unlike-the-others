import {atom} from 'recoil';
import {StorageKeys} from 'src/client/config/constants';
import {GameControls} from 'src/shared/types';

export const Atoms = {
  userId: atom({
    key: 'userId',
    default: localStorage.getItem(StorageKeys.Id) || '',
  }),
  username: atom({
    key: 'username',
    default: localStorage.getItem(StorageKeys.Name) || '',
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
