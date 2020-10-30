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
        <div css={{fontSize: '12rem', color: '#d64747'}}>404</div>
        <div css={{fontSize: '30px'}}>Whoops! Reduced to atoms.</div>
        <div css={{fontSize: '18px', marginTop: 8, color: 'rgba(255, 255, 255, 0.85)'}}>
          We couldn't find the page you were looking for.
        </div>
        <div css={{marginTop: '3rem'}}>
          <HomepageLink to='/' css={{letterSpacing: '0.15em'}}>
            HOME
          </HomepageLink>
        </div>
      </Flex>
    </Flex>
  );
};
