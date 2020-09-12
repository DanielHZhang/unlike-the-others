import React, {useState} from 'react';
import styled from '@emotion/styled';
import {Input} from 'src/client/components/input';
import {socket} from 'src/client/networking/socketio';
import {useDidMount} from 'src/client/utils/hooks';

const ChatBubble = styled.div`
  border: 1px solid rgb(51, 51, 51);
  border-radius: 8px;
  color: white;
  /* font:  */
  padding: 1em;
`;

type ChatState = {
  messages: string[];
  draft: string;
};

const initialState = {
  messages: [],
  draft: '',
};

export const Chatbox = () => {
  const [state, setState] = useState<ChatState>(initialState);

  const addNewChatMessage = (newMessage: string) => {
    setState((prevState) => ({...prevState, messages: [...prevState.messages, newMessage]}));
  };

  useDidMount(() => {
    socket.on('chatMessageResponse', (newMessage: string) => {
      addNewChatMessage(newMessage);
    });
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
    <div>
      {state.messages.map((value, index) => (
        <ChatBubble key={index}>{value}</ChatBubble>
      ))}
      <Input
        value={state.draft}
        onChange={(e) => setState({...state, draft: e.target.value})}
        onKeyDown={(e) => handleEnter(e)}
        placeholder='Send a message'
      />
    </div>
  );
};
