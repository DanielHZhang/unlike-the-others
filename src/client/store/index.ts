import {atom} from 'recoil';
import {Keybindings} from 'src/shared/types';

export const atoms = {
  game: {
    keybindings: atom<Keybindings>({
      key: 'gameControls',
      default: {
        up: 'KeyW',
        left: 'KeyA',
        down: 'KeyS',
        right: 'KeyD',
        sprint: 'ShiftLeft',
        kill: 'Space',
        vent: 'KeyQ',
        report: 'KeyR',
        use: 'KeyF',
      },
    }),
  },
  room: atom({
    key: 'room',
    default: {
      id: '',
    },
  }),
};

/**
 * By setting the default value to any truthy value, while the async promise is still awaiting
 * the useAsyncAtomValue hook will return the default value until the promise has resolved or
 * rejected. However by setting the default value to a resolved promise, the hook will
 * return undefined until the promise has resolved.
 */

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
    // default: {
    //   accessToken: '',
    //   id: '',
    //   isAuthed: false,
    //   isGuest: true,
    //   username: '',
    // },
  }),
};
