import WebSocket from 'ws';
import {AbstractSocket} from 'src/shared/abstract-socket';
import {Player} from 'src/server/store';

export class Socket extends AbstractSocket<WebSocket> {
  private playerRef?: Player;
  private isDisposed = false;
  public isAlive = true;

  public get player() {
    return this.playerRef as Player;
  }

  public set player(newPlayer: Player) {
    newPlayer.socket = this;
    this.playerRef = newPlayer;
  }

  public constructor(socket: WebSocket) {
    super(socket);

    // Handle client-server heartbeat
    this.connection.on('pong', () => {
      this.isAlive = true;
    });

    // Handle messages received from the client
    this.connection.on('message', (data) => {
      // Only process string data messages
      if (typeof data === 'string' && data.length < Socket.MAX_MESSAGE_SIZE) {
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
        super.on(eventName, callback);
      }
    }
  }

  public emit(eventName: string, data?: unknown, status = 200) {
    if (this.isDisposed) {
      throw new Error('Attempting to emit a message on a disposed socket.');
    }
    const stringified = JSON.stringify([eventName, data, status]);
    this.connection.send(stringified);
  }

  /**
   * Dispose of this socket connection and associated resources.
   * Uses `WebSocket.terminate()` to end the connection immediately.
   */
  public dispose() {
    this.playerRef = undefined;
    this.isDisposed = true;
    this.isAlive = false;
    this.connection.terminate();
    this.listeners.clear();
  }

  /** Ping the client for a response to keep the heartbeat alive. */
  public ping() {
    this.isAlive = false;
    this.connection.ping();
  }
}

export * from './connection';
