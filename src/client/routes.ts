import {GamePage} from 'src/client/pages/game';
import {HomePage} from 'src/client/pages/home';

export const routes = [
  {
    component: GamePage,
    exact: true,
    path: '/game',
  },
  {
    component: HomePage,
    exact: true,
    path: '/',
  },
];
