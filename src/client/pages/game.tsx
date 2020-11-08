/** @jsx jsx */
import {jsx} from '@emotion/react';
import {useEffect, useState} from 'react';
import {useLocation} from 'wouter';
import {asyncAtoms} from 'src/client/store';
import {useAsyncAtomLoadable} from 'src/client/hooks';
import {connection} from 'src/client/network';
import {GameLoading} from 'src/client/components/game/loading';
import {GameWindow} from 'src/client/components/game/window';
import {Flex, Icon, Stack} from 'src/client/components/base';
import {Title} from 'src/client/components/title';
import {HomepageLink} from 'src/client/components/home/link';
import {BufferInputData} from 'src/shared/types';
import {BufferEventType} from 'src/shared/constants';
import {inputModel, snapshotModel} from 'src/shared/buffer-schema';

export const GamePage = (): JSX.Element => {
  const [, setLocation] = useLocation();
  const [user] = useAsyncAtomLoadable(asyncAtoms.user);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // const serialize: BufferInputData = {
  //   _e: BufferEventType.Movement,
  //   s: 1,
  //   h: 1,
  //   v: 1,
  // };
  // const serialized = inputModel.toBuffer(serialize);
  // const what = snapshotModel.fromBuffer(serialized);
  // console.log('what happened:', what);
  // console.log('this happened:', inputModel.fromBuffer(serialized));

  // useEffect(() => {
  //   // Do not run the effect unless the access token is defined
  //   // and the connection has not yet been initiated.
  //   if (user.state === 'loading' || connection.isOpen()) {
  //     return;
  //   }
  //   if (user.state === 'hasError' || !user.contents.isAuthed) {
  //     return setLocation('/');
  //   }
  //   if (!user.contents.accessToken) {
  //     return;
  //   }
  //   connection.onConnect(user.contents.accessToken, (error) => {
  //     if (error) {
  //       setError(error);
  //     } else {
  //       setLoading(false);
  //     }
  //   });
  //   return () => {
  //     connection.dispose(); // Dispose of the socket on page unmount
  //   };
  // }, [user]);

  if (true || error) {
    return (
      <Flex flow='column' css={{height: '100%', paddingBottom: '5rem'}}>
        <div css={{margin: '3rem 0'}}>
          <Title animate={false} fontSize={48} />
        </div>
        <Flex flow='column' mainAxis='center' crossAxis='center' grow={1}>
          <div>
            <Icon.Error size={84} color='#d64747' />
          </div>
          <div css={{marginTop: 8, letterSpacing: 4, fontSize: 32}}>ERROR</div>
          <div css={{marginTop: 8}}>{error}</div>
          <Stack crossAxis='center' flow='column' css={{marginTop: '5rem', letterSpacing: '2px'}}>
            <HomepageLink
              to='/game'
              onClick={() => window.location.reload()} /* css={{letterSpacing: '0.15em'}} */
            >
              Reload
            </HomepageLink>
            <div>
              <Icon.Scale />
            </div>
            <HomepageLink to='/' /* css={{letterSpacing: '0.15em'}} */>Home</HomepageLink>
          </Stack>
        </Flex>
      </Flex>
    );
  }

  return loading ? <GameLoading /> : <GameWindow />;
};
