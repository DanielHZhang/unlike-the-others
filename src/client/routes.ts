import makeMatcher, {DefaultParams, Match, MatcherFn, NoMatch} from 'wouter/matcher';
import {GamePage} from 'src/client/pages/game';
import {MainPage} from 'src/client/pages/main';
import {ChatPage} from 'src/client/pages/temp-chatroom';
import {NotFoundPage} from 'src/client/pages/not-found';

const defaultMatcher = makeMatcher();

/** A custom routing matcher function that supports multipath routes */
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
  params?: boolean;
  component: (props: {params: DefaultParams} | undefined) => JSX.Element;
  path: any; // should be string | string[], but string[] is not supported by wouter
};

export const routes: Route[] = [
  {
    path: '/chat',
    component: ChatPage,
  },
  {
    path: '/game',
    component: GamePage,
  },
  {
    path: ['/', '/login', '/sign-up'],
    component: MainPage,
  },
  {
    params: true,
    path: '/:rest*',
    component: NotFoundPage,
  },
];
