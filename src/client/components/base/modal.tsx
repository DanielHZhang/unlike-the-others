/** @jsx jsx */
import {css, jsx, useTheme} from '@emotion/react';
import {useEffect, ReactNode} from 'react';
import {createPortal} from 'react-dom';
import {Flex, GhostButton, Icon} from 'src/client/components/base';
import {AnimatePresence} from 'framer-motion';
import {MotionFlex} from 'src/client/components/base/flex';

type Props = {
  title?: string;
  visible: boolean;
  onClose: () => any;
  children: ReactNode;
};

export const Modal = (props: Props): JSX.Element => {
  const {children, onClose, visible = false, title} = props;
  const theme = useTheme();

  // Handle pressing Escape on keyboard to close modal
  useEffect(() => {
    const listener = (event: KeyboardEvent) => {
      if (visible && event.key === 'Escape') {
        onClose();
      }
    };
    document.addEventListener('keyup', listener);
    return () => document.removeEventListener('keyup', listener);
  }, [visible]);

  return createPortal(
    <AnimatePresence exitBeforeEnter={true}>
      {visible && (
        <Flex
          mainAxis='center'
          crossAxis='center'
          onClick={onClose}
          css={{
            position: 'fixed',
            top: 0,
            bottom: 0,
            left: 0,
            right: 0,
            background: 'rgba(0, 0, 0, 0.45)',
            zIndex: theme.modal.mask.zIndex,
          }}
        >
          <MotionFlex
            key='anim-modal'
            initial={{opacity: 1, scale: 0.1}}
            animate={{opacity: 1, scale: 1}}
            exit={{opacity: 0, scale: 0.1}}
            role='dialog'
            onClick={(event) => event.stopPropagation()}
            css={css`
              background: #202324;
              border: 4px solid #d13439;
              border-radius: 8px;
              margin: 4rem auto;
              min-height: 100px;
              position: absolute;
              width: 420px;
              z-index: ${theme.modal.content.zIndex};
            `}
          >
            <div css={{position: 'relative', width: '100%'}}>
              <div
                css={{
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  zIndex: theme.modal.content.zIndex + 1,
                }}
              >
                <GhostButton onClick={onClose} css={{height: 36, width: 36, padding: 0}}>
                  <Icon.Ecks color='#fff' />
                </GhostButton>
              </div>
              <div
                css={css`
                  position: relative;
                  padding: 32px;
                  width: 100%;
                  color: #fff;
                  overflow-wrap: break-word;
                  word-wrap: break-word;
                `}
              >
                {title && (
                  <h1
                    css={css`
                      margin: 0 0 16px 0;
                      font-size: 32px;
                      font-weight: 700;
                    `}
                  >
                    {title}
                  </h1>
                )}
                {children}
              </div>
            </div>
          </MotionFlex>
        </Flex>
      )}
    </AnimatePresence>,
    document.body
  );
};
