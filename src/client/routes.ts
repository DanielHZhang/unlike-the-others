import {GamePage} from 'src/client/pages/game';
import {HomePage} from 'src/client/pages/home';
import {ChatPage} from 'src/client/pages/temp-chatroom';

export const routes = [
  {
    component: ChatPage,
    exact: true,
    path: '/chat',
  },
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
