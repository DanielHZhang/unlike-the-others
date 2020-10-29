/** @jsx jsx */
import styled from '@emotion/styled';
import {jsx} from '@emotion/react';
import {FC, useState, useEffect} from 'react';
import {createPortal} from 'react-dom';
import {Flex, GhostButton, Icon} from 'src/client/components/base';

const Mask = styled(Flex)`
  position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.45);
  z-index: ${({theme: {modal}}) => modal.mask.zIndex};
`;

const Dialog = styled(Flex)`
  opacity: 1;
  top: 50%;
  left: 50%;
  border: 4px solid #d13439;
  border-radius: 8px;
  min-height: 100px;
  width: 420px;
  color: white;
  background: #202324;
  transform: translate(-50%, -50%);
  z-index: ${({theme: {modal}}) => modal.content.zIndex};
  position: absolute;
`;

const Titlebar = styled.div`
  position: fixed;
  top: 8px;
  right: 8px;
  z-index: ${({theme: {modal}}) => modal.content.zIndex + 1};
`;

const Content = styled.div`
  position: relative;
  padding: 36px;
  width: 100%;
`;

const Title = styled.h1`
  margin: 0 0 16px 0;
  font-size: 32px;
  font-weight: 700;
`;

type Props = {
  title?: string;
  visible?: boolean;
  onVisibleChange?: (newVisibility: boolean) => any;
};

export const Modal: FC<Props> = (props) => {
  const {children, onVisibleChange, visible = false, title} = props;
  const [state, setState] = useState({visible});

  const onClickClose = () => {
    setState({visible: false});
    onVisibleChange?.(false);
  };

  useEffect(() => {
    setState({visible});
    onVisibleChange?.(visible);
  }, [visible]);

  if (!state.visible) {
    return null;
  }

  return createPortal(
    <Mask onClick={onClickClose}>
      <Dialog role='dialog' onClick={(event) => event.stopPropagation()}>
        <Titlebar>
          <GhostButton onClick={onClickClose} css={{backgroundColor: 'transparent'}}>
            <Icon.Ecks color='#fff' />
          </GhostButton>
        </Titlebar>
        <Content>
          {title && <Title>{title}</Title>}
          {children}
        </Content>
      </Dialog>
    </Mask>,
    document.body
  );
};
