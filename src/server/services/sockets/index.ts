import WebSocket from 'ws';
import {Player} from 'src/server/store';
import type {AnyFunction} from 'src/shared/types';

export class ServerSocket {
  /**
   * Max message size of 1 MB.
   * 1 UTF-16 character = 16 bits = 2 bytes
   * 500k characters = 1 MB
   */
  private static readonly MAX_MESSAGE_SIZE = 5e5;
  private connection: WebSocket;
  private listeners = new Map<string, AnyFunction[]>();
  private playerRef?: Player;
  private isDisposed = false;
  public isAlive = true;

  public constructor(socket: WebSocket) {
    this.connection = socket;

    // Handle client-server heartbeat
    this.connection.on('pong', () => {
      this.isAlive = true;
    });

    // Handle messages received from the client
    this.connection.on('message', (data) => {
      // Only process string data messages
      if (typeof data === 'string' && data.length < ServerSocket.MAX_MESSAGE_SIZE) {
        const json = JSON.parse(data);
        if (!Array.isArray(json) || json.length > 2 || typeof json[0] !== 'string') {
          throw new Error('Improperly formatted socket message.');
        }
        this.dispatch(json[0], json[1]);
      }
    });
  }

  public get player() {
    return this.playerRef as Player;
  }

  public set player(newPlayer: Player) {
    newPlayer.socket = this;
    this.playerRef = newPlayer;
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
        const handlers = this.listeners.get(eventName);
        if (handlers) {
          handlers.push(callback);
        } else {
          this.listeners.set(eventName, [callback]);
        }
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

  private dispatch(eventName: string, ...dataArgs: any[]) {
    const handlers = this.listeners.get(eventName);
    if (handlers) {
      handlers.forEach((handler) => handler(...dataArgs));
    }
  }
}

export * from './connection';
