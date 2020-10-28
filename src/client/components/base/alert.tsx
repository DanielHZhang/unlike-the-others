/** @jsx jsx */
import {jsx, useTheme} from '@emotion/react';
import {Flex} from 'src/client/components/base/flex';
import {Icon} from 'src/client/components/base/icon';
import {Stack} from 'src/client/components/base/stack';

type Props = {
  type: 'error' | 'info' | 'success' | 'warning';
  message: string;
};

export const Alert = (props: Props): JSX.Element => {
  // const theme = useTheme();
  return (
    <Stack
      crossAxis='center'
      css={{
        backgroundColor: '#f04f43',
        borderRadius: 8,
        color: '#ececec',
        padding: '10px 12px',
      }}
    >
      {props.type === 'error' && (
        <div>
          <Icon.SyncExclamation color='#fff' />
        </div>
      )}
      <div css={{marginLeft: 8}}>{props.message}</div>
    </Stack>
  );
};
