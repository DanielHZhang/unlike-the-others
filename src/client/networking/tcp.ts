import Axios from 'axios';
import {AbstractSocket} from 'src/shared/abstract-socket';
import {ROOT_URL} from 'src/shared/constants';
import {AnyFunction} from 'src/shared/types';

export class ClientSocket extends AbstractSocket<WebSocket> {
  private ready: Promise<boolean>;

  public constructor() {
    const token = Axios.defaults.headers.common.authorization;
    super(new WebSocket(`ws://${ROOT_URL}/ws?token=${token}`));

    this.ready = new Promise((resolve, reject) => {
      this.connection.onopen = () => {
        console.log('Websocket connection established.');
        resolve(true);
      };
    });

    this.connection.onclose = (event) => {
      console.log('on message event:', event);
    };

    this.connection.onerror = (event) => {
      console.error('error occured in socket:', event);
    };

    this.connection.onmessage = (event) => {
      // Only process string messages
      if (typeof event.data === 'string' && event.data.length < ClientSocket.MAX_MESSAGE_SIZE) {
        const json = JSON.parse(event.data);
        if (!Array.isArray(json) || typeof json[0] !== 'string' || typeof json[2] !== 'number') {
          throw new Error('Improperly formatted socket message.');
        }
        // Event name, data, status
        this.dispatch(json[0], json[1], json[2]);
      }
      console.log('received message from server:', event);
    };

    window.addEventListener('beforeunload', () => {
      this.dispose();
    });
  }

  public isReady() {
    return this.ready;
  }

  public on(eventName: string, callback: (data: unknown, status: number) => void) {
    super.on(eventName, callback);
  }

  public emit(eventName: string, payload: any) {
    const stringified = JSON.stringify([eventName, payload]);
    this.connection.send(stringified);
  }

  public dispose() {
    this.connection.close();
  }
}
