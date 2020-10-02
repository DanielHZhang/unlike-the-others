import WebSocket from 'ws';

export class Socket {
  /**
   * Max message size of 1 MB.
   * 1 UTF-16 character = 16 bits = 2 bytes
   * 500k characters = 1 MB
   */
  private static readonly MAX_MESSAGE_SIZE = 5e5;
  private listeners: Record<string, ((...args: any[]) => any)[]> = {};
  private connection: WebSocket;

  public constructor(socket: WebSocket) {
    this.connection = socket;
    this.connection.on('message', (data) => {
      // Only process string data messages
      if (typeof data === 'string') {
        if (data.length > Socket.MAX_MESSAGE_SIZE) {
          throw new Error('Socket message was too long.');
        }
        const json = JSON.parse(data);
        if (!Array.isArray(json) || json.length > 2 || typeof json[0] !== 'string') {
          throw new Error('Improperly formatted socket message.');
        }
        this.dispatch(json[0], json[1]);
      }
    });
  }

  public on(eventName: 'close', callback: (code: number, reason: string) => void): void;
  public on(eventName: 'error', callback: (error: Error) => void): void;
  public on(eventName: string, callback: (data: unknown) => any): void;
  public on(eventName: string, callback: (...args: any[]) => any): void {
    switch (eventName) {
      case 'close': {
        this.connection.on('close', callback);
        return;
      }
      case 'error': {
        this.connection.on('error', callback);
        return;
      }
      default: {
        if (this.listeners[eventName]) {
          this.listeners[eventName].push(callback);
        } else {
          this.listeners[eventName] = [callback];
        }
      }
    }
  }

  public emit(eventName: string, data?: unknown, status = 200) {
    const stringified = JSON.stringify([eventName, status, data]);
    this.connection.send(stringified);
  }

  private dispatch(eventName: string, data: any) {
    const handlers = this.listeners[eventName];
    if (handlers) {
      handlers.forEach((handler) => handler(data));
    }
  }
}
