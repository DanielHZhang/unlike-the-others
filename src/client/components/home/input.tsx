/** @jsx jsx */
import {jsx} from '@emotion/react';
import {AnimatePresence} from 'framer-motion';
import {ReactElement} from 'react';
import {Button, Flex, Icon, MotionFlex} from 'src/client/components/base';
import {RhombusSpinner} from 'src/client/components/spinner/rhombus';

type Props = {
  loading?: boolean;
  showButton?: boolean;
  children: ReactElement;
};

export const InputButtonWrapper = (props: Props): JSX.Element => {
  return (
    <Flex css={{position: 'relative'}}>
      {props.children}
      <AnimatePresence>
        {props.showButton && (
          <MotionFlex
            mainAxis='center'
            crossAxis='center'
            initial={{x: '20px', opacity: 0}}
            animate={{x: '0px', opacity: 1}}
            exit={{opacity: 0}}
            css={{
              position: 'absolute',
              right: 0,
              height: 48,
              width: 48,
            }}
          >
            <Button type='submit' loading={props.loading} css={{width: 36, height: 36, padding: 0}}>
              {props.loading ? <RhombusSpinner size={8} /> : <Icon.ArrowRight color='#fff' />}
            </Button>
          </MotionFlex>
        )}
      </AnimatePresence>
    </Flex>
  );
};
