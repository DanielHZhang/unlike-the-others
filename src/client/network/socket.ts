// import geckos, {ClientChannel, RawMessage} from '@geckos.io/client';
import {GECKOS_LABEL, HOST, PORT} from 'src/shared/constants';
import type {AnyFunction} from 'src/shared/types';

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

export class ClientSocket {
  private readonly listeners = new Map<string, AnyFunction[]>();
  private socket?: WebSocket;
  private isConnected?: Promise<boolean>;
  // private channel?: ClientChannel;

  public constructor() {
    // Close the socket and channel when leaving the page
    window.addEventListener('beforeunload', this.beforeUnload);
  }

  public async connect(endpoint: string): Promise<void> {
    const socket = new WebSocket(`ws://${HOST}/${endpoint}`);
    socket.binaryType = 'arraybuffer';

    this.isConnected = new Promise((resolve, reject) => {
      const onOpenError = (event: CloseEvent) => {
        const message =
          event.code === 1006 ? 'There is no active game with that code!' : 'Something went wrong.';
        reject(message);
        this.dispose();
      };
      socket.addEventListener('open', () => {
        console.log('Websocket connection established.');
        socket.removeEventListener('close', onOpenError);
        resolve(true);
      });
      socket.addEventListener('close', onOpenError);
    });

    await this.isConnected;
    socket.addEventListener('message', this.handleMessage);
    socket.addEventListener('close', this.handleClose);
    socket.addEventListener('error', this.handleError);
    this.socket = socket;
  }

  /**
   * Returns whether the connection has been opened successfully.
   */
  public isOpen(): boolean {
    return this.socket !== undefined && this.socket.readyState === WebSocket.OPEN;
    // this.channel !== undefined &&
    // 'id' in this.channel.userData
  }

  /**
   * Attach a listener to the WebSocket connection.
   */
  public on(eventName: string, callback: (data: any) => void): void;
  public on(eventName: string, callback: (data: any, status: number) => void): void {
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
    this.assertIsOpen(this.socket);
    const stringified = JSON.stringify([eventName, payload]);
    this.socket.send(stringified);
  }

  /**
   * Emit raw ArrayBuffer event via WebSocket.
   */
  public emitRaw(payload: ArrayBuffer): void {
    this.assertIsOpen(this.socket);
    this.socket.send(payload);
  }

  /**
   * Throws error if socket has not been opened.
   */
  private assertIsOpen(sock?: WebSocket): asserts sock is WebSocket {
    if (!sock || !this.isOpen()) {
      throw new Error('Attempting to emit before WebSocket has been opened.');
    }
  }

  /**
   * Dispose of all listeners and references associated with this socket instance.
   */
  public dispose(): void {
    if (this.socket) {
      if (this.isOpen()) {
        this.socket.close(1000, 'Disconnected');
      }
      this.socket.removeEventListener('message', this.handleMessage);
      this.socket.removeEventListener('close', this.handleClose);
      this.socket.removeEventListener('error', this.handleError);
      window.removeEventListener('beforeunload', this.beforeUnload);
      this.socket = undefined;
    }
    // if (this.channel) {
    //   this.channel.close();
    //   this.channel = undefined;
    // }
    this.listeners.clear();
  }

  private handleMessage = (event: MessageEvent) => {
    if (typeof event.data === 'string') {
      try {
        const json = JSON.parse(event.data);
        if (!Array.isArray(json) || typeof json[0] !== 'string' || typeof json[2] !== 'number') {
          throw new Error('Improperly formatted socket message.');
        }
        // Event name, data, status
        this.dispatch(json[0], json[1], json[2]);
      } catch (error) {
        console.error('Error occurred processing socket message:', error);
      }
    } else if (event.data instanceof ArrayBuffer) {
      console.log('Arraybuffer message received from server');
    }
  };

  private handleClose = (event: CloseEvent) => {
    console.log('Websocket connection closed.', event);
    this.dispose();
  };

  private handleError = (event: Event) => {
    console.error('Websocket error occured.', event);
  };

  private dispatch(eventName: string, ...dataArgs: any[]) {
    const handlers = this.listeners.get(eventName);
    handlers?.forEach((handler) => handler(...dataArgs));
  }

  private beforeUnload = () => {
    this.dispose();
  };
}
