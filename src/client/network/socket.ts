// import geckos, {ClientChannel, RawMessage} from '@geckos.io/client';
import {GECKOS_LABEL, ROOT_URL, PORT} from 'src/shared/constants';
import type {AnyFunction} from 'src/shared/types';

export const connection = new (class {
  private socket?: WebSocket;
  // private channel?: ClientChannel;
  private listeners = new Map<string, AnyFunction[]>();

  public onConnect(accessToken: string, callback: (event?: string) => any) {
    this.socket = new WebSocket(`ws://${ROOT_URL}/ws?token=${accessToken}`);
    this.socket.binaryType = 'arraybuffer';

    // Run callback if socket error occurred - authentication failed
    const openErrorListener = () => {
      callback('There is no active game with that code!');
      this.dispose();
    };

    this.socket.addEventListener('open', () => {
      console.log('Websocket connection established.');
      this.socket?.removeEventListener('close', openErrorListener);
      callback();
      // Connect to UDP channel only after successful TCP socket authentication
      // this.channel = geckos({
      //   authorization: accessToken,
      //   label: GECKOS_LABEL,
      //   port: PORT,
      // });
      // this.channel.onConnect((error) => {
      //   if (error) {
      //     callback(error.message);
      //     this.dispose();
      //   }
      //   this.socket?.removeEventListener('close', openErrorListener);
      // });
    });

    // Add a temporary listener to handle potential error on socket open
    this.socket.addEventListener('close', openErrorListener);

    this.socket.addEventListener('close', (event) => {
      console.log('Websocket connection closed.', event);
      this.dispose();
    });

    this.socket.addEventListener('error', (event) => {
      console.error('Websocket error occured.', event);
    });

    this.socket.addEventListener('message', (event) => {
      // Only process string messages
      if (typeof event.data === 'string') {
        const json = JSON.parse(event.data);
        if (!Array.isArray(json) || typeof json[0] !== 'string' || typeof json[2] !== 'number') {
          throw new Error('Improperly formatted socket message.');
        }
        // Event name, data, status
        this.dispatch(json[0], json[1], json[2]);
      }
    });

    // Close the socket and channel when leaving the page
    window.addEventListener('beforeunload', () => {
      this.dispose();
    });
  }

  /**
   * Returns whether the connection has been opened successfully.
   */
  public isOpen(): boolean {
    return (
      this.socket !== undefined && this.socket.readyState === WebSocket.OPEN
      // this.channel !== undefined &&
      // 'id' in this.channel.userData
    );
  }

  /**
   * Attach a listener to the WebSocket connection.
   */
  public on(eventName: string, callback: (data: unknown) => void): void;
  public on(eventName: string, callback: (data: unknown, status: number) => void): void {
    const handlers = this.listeners.get(eventName);
    if (handlers) {
      handlers.push(callback);
    } else {
      this.listeners.set(eventName, [callback]);
    }
  }

  // /**
  //  * Attach a listener to the WebRTC connection.
  //  */
  // public onRaw(callback: (data: ArrayBuffer) => void): void {
  //   if (!this.channel) {
  //     throw new Error('Attempting to add callback before the channel has been opened.');
  //   }
  //   this.channel.onRaw(callback as (data: RawMessage) => void);
  // }

  /**
   * Emit JSON event via WebSocket.
   */
  public emit(eventName: string, payload: any): void {
    if (!this.socket || !this.isOpen()) {
      throw new Error('Attempting to emit before WebSocket has been opened.');
    }
    const stringified = JSON.stringify([eventName, payload]);
    this.socket.send(stringified);
  }

  /**
   * Emit raw Buffer event via WebSocket.
   */
  public emitRaw(payload: ArrayBuffer) {
    if (!this.socket || !this.isOpen()) {
      throw new Error('Attempting to emit before WebSocket has been opened.');
    }
    this.socket.send(payload);
  }

  public dispose() {
    if (this.socket) {
      if (this.isOpen()) {
        this.socket.close();
      }
      this.socket = undefined;
    }
    // if (this.channel) {
    //   this.channel.close();
    //   this.channel = undefined;
    // }
    this.listeners.clear();
  }

  private dispatch(eventName: string, ...dataArgs: any[]) {
    const handlers = this.listeners.get(eventName);
    handlers?.forEach((handler) => handler(...dataArgs));
  }
})();
