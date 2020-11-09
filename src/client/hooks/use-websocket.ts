import {useEffect, useRef} from 'react';
import {ClientSocket} from 'src/client/network';

const sockets: Map<string, ClientSocket> = new Map();

type UseWebsocketState = {
  socket: ClientSocket;
};

// return the destory function
export function useWebsocket(key: string): UseWebsocketState {
  const foundSocket = sockets.get(key);
  if (foundSocket) {
    return {socket: foundSocket};
  }

  const newSocket = new ClientSocket();
  sockets.set(key, newSocket);
  return {socket: newSocket};
}
