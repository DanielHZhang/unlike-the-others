import {ReactElement} from 'react';
import {GamePage} from 'src/client/pages/game';
import {HomePage} from 'src/client/pages/home';
import {LoginPage} from 'src/client/pages/login';
import {MainPage} from 'src/client/pages/main';
import {SignUpPage} from 'src/client/pages/sign-up';
import {ChatPage} from 'src/client/pages/temp-chatroom';

import makeMatcher, {Match, MatcherFn, NoMatch} from 'wouter/matcher';

const defaultMatcher = makeMatcher();

/**
 * A custom routing matcher function that supports multipath routes
 */
export const multipathMatcher: MatcherFn = (patterns, path) => {
  for (const pattern of [patterns].flat()) {
    const [match, params] = defaultMatcher(pattern, path);
    if (match) {
      return [true, params] as Match;
    }
  }
  return [false, null] as NoMatch;
};

type Route = {
  component: ReactElement;
  path?: string | string[];
};

export const routes: Route[] = [
  {
    path: ['/', '/login', '/sign-up'],
    component: MainPage,
  }
]



// export const routes: Route[] = [
//   {
//     component: ChatPage,
//     exact: true,
//     path: '/chat',
//   },
//   {
//     component: GamePage,
//     exact: true,
//     path: '/game',
//   },
//   {
//     component: MainPage,
//     // exact: true,
//     path: '*',
//   },
//   // {
//   //   component: SignUpPage,
//   //   exact: true,
//   //   path: '/sign-up',
//   // },
//   // {
//   //   component: LoginPage,
//   //   exact: true,
//   //   path: '/login',
//   // },
//   // {
//   //   component: HomePage,
//   //   exact: true,
//   //   path: '/',
//   // },
// ];
