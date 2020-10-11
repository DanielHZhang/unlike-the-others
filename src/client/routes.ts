import {GamePage} from 'src/client/pages/game';
import {HomePage} from 'src/client/pages/home';
import {LoginPage} from 'src/client/pages/login';
import {SignUpPage} from 'src/client/pages/sign-up';
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
    component: SignUpPage,
    exact: true,
    path: '/sign-up',
  },
  {
    component: LoginPage,
    exact: true,
    path: '/login',
  },
  {
    component: HomePage,
    exact: true,
    path: '/',
  },
];
