import {AbstractSocket} from 'src/shared/abstract-socket';
import {StorageKeys} from 'src/client/config/constants';
import {ROOT_URL} from 'src/shared/constants';

export class ClientSocket extends AbstractSocket<WebSocket> {
  // private static instance: Socket;

  public constructor() {
    super(new WebSocket(`ws://${ROOT_URL}/sock`));
    this.connection.onopen = () => {
      console.log('Websocket connection established.');
      // this.emit('authenticate', localStorage.getItem(StorageKeys.Jwt));

      //   // Connect to UDP channel only after authentication has been completed
      //   channel.onConnect(console.error);
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

  // public static getInstance() {
  //   if (!Socket.instance) {
  //     Socket.instance = new Socket();
  //   }
  //   return Socket.instance;
  // }

  // public on(eventName: string, callback: AnyFunction) {
  //   super.dispatch();
  // }

  public emit(eventName: string, payload: any) {
    const stringified = JSON.stringify([eventName, payload]);
    this.connection.send(stringified);
  }

  public dispose() {
    this.connection.close();
  }
}

// export const socket = Socket.getInstance();
