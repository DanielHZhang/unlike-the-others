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
      <div css={{margin: '3rem 0'}}>
        <Title fontSize={48} />
      </div>
      <Flex flow='column' crossAxis='center' css={{margin: '7rem 0'}}>
        <div css={{fontSize: '12rem'}}>404</div>
        <div css={{fontSize: '30px'}}>Whoops! You fell down a hole.</div>
        <div css={{marginTop: 8}}>The page that you're looking for is nowhere to be found.</div>
        <div css={{marginTop: 32}}>
          <HomepageLink to='/' css={{letterSpacing: '0.15em'}}>
            HOME
          </HomepageLink>
        </div>
      </Flex>
    </Flex>
  );
};
