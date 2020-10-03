// import io from 'socket.io-client';
// import {StorageKeys} from 'src/client/config/constants';
// import {channel} from 'src/client/networking/udp';

import {StorageKeys} from 'src/client/config/constants';
import {ROOT_URL} from 'src/shared/constants';
import {AbstractSocket} from 'src/shared/socket';
import {AnyFunction} from 'src/shared/types';

// export const socket = io({
//   transports: ['websocket'],
// });

// socket.on('connect', () => {
//   console.log('Connected to TCP server.');
//   socket.emit('authenticate', localStorage.getItem(StorageKeys.Jwt));
// });

// socket.on('authenticateResponse', (jwt?: string) => {
//   if (jwt) {
//     localStorage.setItem(StorageKeys.Jwt, jwt);
//   }
//   // Connect to UDP channel only after authentication has been completed
//   channel.onConnect(console.error);
// });

class Socket extends AbstractSocket<WebSocket> {
  private static instance: Socket;

  private constructor() {
    super(new WebSocket(`ws://${ROOT_URL}/sock`));
    this.connection.onopen = (event) => {
      console.log('Connected to TCP server.');
      this.emit('authenticate', localStorage.getItem(StorageKeys.Jwt));
    };

    this.connection.onclose = (event) => {
      console.log('on message event:', event);
    };

    this.connection.onerror = (event) => {
      console.error('error occured in socket:', event);
    };

    this.connection.onmessage = (event) => {
      console.log('received message from server:', event);
    };

    window.addEventListener('beforeunload', () => {
      this.connection.close();
    });
  }

  public static getInstance() {
    if (!Socket.instance) {
      Socket.instance = new Socket();
    }
    return Socket.instance;
  }

  // public on(eventName: string, callback: AnyFunction) {
  //   super.dispatch();
  // }

  public emit(eventName: string, payload: any) {
    const stringified = JSON.stringify([eventName, payload]);
    this.connection.send(stringified);
  }

}

export const socket = Socket.getInstance();
