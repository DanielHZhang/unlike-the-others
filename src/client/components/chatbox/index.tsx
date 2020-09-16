import React, {useState} from 'react';
import styled from '@emotion/styled';
import {Input} from 'src/client/components/input';
import {socket} from 'src/client/networking/tcp';
import {useDidMount} from 'src/client/utils/hooks';
import {ChatBubble} from 'src/client/components/chatbox/bubble';

const Wrapper = styled.div`
  border: 4px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  padding: 8px;
`;

type ChatState = {
  messages: string[];
  draft: string;
};

export const Chatbox = () => {
  const [state, setState] = useState<ChatState>({
    messages: ['wow', 'hello', 'does this work well?'],
    draft: '',
  });
  const addNewChatMessage = (newMessage: string) => {
    setState((prevState) => ({...prevState, messages: [...prevState.messages, newMessage]}));
  };

  useDidMount(() => {
    socket.on('chatMessageResponse', addNewChatMessage);
    return () => {
      socket.off('chatMessageReponse');
    };
  });

  const handleEnter = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      socket.emit('chatMessage', state.draft.trim());
      addNewChatMessage(state.draft.trim());
      setState((prevState) => ({...prevState, draft: ''}));
    }
  };

  return (
    <Wrapper>
      {state.messages.map((value, index) => (
        <ChatBubble key={index}>{value}</ChatBubble>
      ))}
      <Input
        value={state.draft}
        onChange={(e) => setState({...state, draft: e.target.value})}
        onKeyDown={(e) => handleEnter(e)}
        placeholder='Send a message'
      />
    </Wrapper>
  );
};
