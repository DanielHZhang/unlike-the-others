/** @jsx jsx */
import {jsx} from '@emotion/react';
import {Flex} from 'src/client/components/base';
import {HomepageLink} from 'src/client/components/home/link';
import {Title} from 'src/client/components/title';
import {useDidMount} from 'src/client/hooks';

export const NotFoundPage = (): JSX.Element => {
  useDidMount(() => {
    const prevTitle = document.title;
    document.title = '404 • Unlike the Others';
    return () => {
      document.title = prevTitle;
    };
  });

  return (
    <Flex flow='column'>
      <Title />
      <Flex>
        <div css={{fontSize: '15rem'}}>404</div>
      </Flex>
      <div>The page that you're looking for is nowhere to be found.</div>
      <div>Whoops! You fell down a hole.</div>
      <HomepageLink>HOME</HomepageLink>
    </Flex>
  );
};
