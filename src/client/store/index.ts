import {atom} from 'recoil';
import {GameControls} from 'src/shared/types';

export const atoms = {
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

/**
 * By setting the default value to any truthy value, while the async promise is still awaiting
 * the useAsyncAtomValue hook will return the default value until the promise has resolved or
 * rejected. However by setting the default value to a resolved promise, the hook will
 * return undefined until the promise has resolved.
 */
// default: {
//   accessToken: '',
//   id: '',
//   isAuthed: false,
//   isGuest: true,
//   username: '',
// },

export const asyncAtoms = {
  user: atom({
    key: 'user',
    default: Promise.resolve({
      accessToken: '',
      id: '',
      isAuthed: false,
      isGuest: true,
      username: '',
    }),
  }),
};
