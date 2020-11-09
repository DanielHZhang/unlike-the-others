/** @jsx jsx */
import {jsx} from '@emotion/react';
import {ReactNode} from 'react';
import {Flex, Icon, Stack} from 'src/client/components/base';
import {HomepageLink} from 'src/client/components/home/link';
import {Title} from 'src/client/components/title';

type Props = {
  message?: string;
  children?: ReactNode;
};

export const GameError = ({message, children}: Props): JSX.Element => {
  if (!message && !children) {
    throw new Error('No message or children provided.');
  }

  return (
    <Flex flow='column' css={{width: '100%', paddingBottom: '5rem'}}>
      <div css={{margin: '3rem 0'}}>
        <Title animate={false} fontSize={48} />
      </div>
      <Flex flow='column' mainAxis='center' crossAxis='center' grow={1}>
        <div>
          <Icon.Error size={84} color='#d64747' />
        </div>
        <div css={{marginTop: 8, letterSpacing: 4, fontSize: 32}}>ERROR</div>
        <div css={{marginTop: 8}}>{message ?? children}</div>
        <Stack crossAxis='center' flow='column' css={{marginTop: '5rem', letterSpacing: '2px'}}>
          <HomepageLink to='/game' onClick={() => window.location.reload()}>
            Reload
          </HomepageLink>
          <Flex crossAxis='center'>
            <Icon.Scale />
          </Flex>
          <HomepageLink to='/'>Home</HomepageLink>
        </Stack>
      </Flex>
    </Flex>
  );
};
