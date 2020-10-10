import {ROOT_URL} from 'src/shared/constants';
import type {AnyFunction} from 'src/shared/types';

export const socket = new (class ClientSocket {
  private connection?: WebSocket;
  private listeners = new Map<string, AnyFunction[]>();

  public onConnect(accessToken: string, callback: AnyFunction) {
    this.connection = new WebSocket(`ws://${ROOT_URL}/ws?token=${accessToken}`);

    this.connection.onopen = (event) => {
      console.log('Websocket connection established.', event);
      callback(event);
    };

    this.connection.onclose = (event) => {
      console.log('Websocket connection closed.', event);
      this.dispose();
    };

    this.connection.onerror = (event) => {
      console.error('Websocket error occured:', event);
      this.dispose();
    };

    this.connection.onmessage = (event) => {
      // Only process string messages
      if (typeof event.data === 'string') {
        const json = JSON.parse(event.data);
        if (!Array.isArray(json) || typeof json[0] !== 'string' || typeof json[2] !== 'number') {
          throw new Error('Improperly formatted socket message.');
        }
        // Event name, data, status
        this.dispatch(json[0], json[1], json[2]);
      }
    };

    window.addEventListener('beforeunload', () => {
      this.dispose();
    });
  }

  public isConnected() {
    return this.connection !== undefined && this.connection.readyState === WebSocket.OPEN;
  }

  public on(eventName: string, callback: (data: unknown, status: number) => void) {
    const handlers = this.listeners.get(eventName);
    if (handlers) {
      handlers.push(callback);
    } else {
      this.listeners.set(eventName, [callback]);
    }
  }

  public emit(eventName: string, payload: any) {
    if (!this.connection || !this.isConnected()) {
      throw new Error('Attempting to emit before connection has been established.');
    }
    const stringified = JSON.stringify([eventName, payload]);
    this.connection.send(stringified);
  }

  public dispose() {
    if (this.connection) {
      if (this.isConnected()) {
        this.connection.close();
      }
      this.connection = undefined;
      this.listeners.clear();
    }
  }

  private dispatch(eventName: string, ...dataArgs: any[]) {
    const handlers = this.listeners.get(eventName);
    if (handlers) {
      handlers.forEach((handler) => handler(...dataArgs));
    }
  }
})();
