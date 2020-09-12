import React from 'react';
import styled from '@emotion/styled';
import {Input} from 'src/client/components/input';

const ChatBubble = styled.div`
  border: 1px solid rgb(51, 51, 51);
  border-radius: 8px;
  color: white;
  /* font:  */
  padding: 1em;
`;

export const Chatbox = () => {
  return (
    <div>
      {['wow so', 'cool lol', 'pls type', 'more stuff'].map((value, index) => (
        <ChatBubble key={index}>{value}</ChatBubble>
      ))}
      <Input placeholder='Send a message' />
    </div>
  );
};
