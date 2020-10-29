/** @jsx jsx */
import styled from '@emotion/styled';
import {css, jsx, useTheme} from '@emotion/react';
import {useState, useEffect, ReactNode} from 'react';
import {createPortal} from 'react-dom';
import {Flex, GhostButton, Icon} from 'src/client/components/base';
import {AnimatePresence} from 'framer-motion';
import {MotionFlex} from 'src/client/components/base/flex';

type Props = {
  title?: string;
  visible?: boolean;
  onVisibleChange?: (newVisibility: boolean) => any;
  children: ReactNode;
};

export const Modal = (props: Props): JSX.Element => {
  const theme = useTheme();
  const {children, onVisibleChange, visible: propVisible = false, title} = props;
  const [visible, setVisible] = useState(propVisible);

  const onClickClose = () => {
    setVisible(false);
    onVisibleChange?.(false);
  };

  useEffect(() => {
    setVisible(propVisible);
    onVisibleChange?.(propVisible);
  }, [propVisible]);

  return createPortal(
    <AnimatePresence exitBeforeEnter={true}>
      {visible && (
        <Flex
          mainAxis='center'
          crossAxis='center'
          onClick={onClickClose}
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
            initial={{opacity: 0, scale: 0.1}}
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
                <GhostButton onClick={onClickClose} css={{height: 36, width: 36, padding: 0}}>
                  <Icon.Ecks color='#fff' />
                </GhostButton>
              </div>
              <div
                css={css`
                  position: relative;
                  padding: 32px;
                  width: 100%;
                  color: #fff;
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
