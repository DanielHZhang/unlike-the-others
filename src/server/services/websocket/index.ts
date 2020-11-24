import WebSocket from 'ws';
import {BufferSchema} from '@supersede/buffer-schema';
import type {AnyFunction} from 'src/shared/types';

export class ServerSocket {
  /**
   * Max message size of 1 MB.
   * 1 UTF-16 character = 16 bits = 2 bytes
   * 500k characters = 1 MB
   */
  private static readonly MAX_MESSAGE_SIZE = 5e5;

  /**
   * Defines if the socket connection is still open.
   */
  public isAlive = true;

  /**
   * Reference to the underlying `ws.WebSocket` object.
   */
  private connection: WebSocket;
  private listeners = new Map<string | number, AnyFunction[]>();
  private isDisposed = false;

  public constructor(socket: WebSocket) {
    this.connection = socket;

    // Handle client-server heartbeat
    this.connection.on('pong', () => {
      this.isAlive = true;
    });

    // Handle messages received from the client
    this.connection.on('message', (data) => {
      if (typeof data === 'string') {
        if (data.length > ServerSocket.MAX_MESSAGE_SIZE) {
          // Close connection due to large message size.
          // Should never occur unless client is forcefully injecting data.
          return this.connection.close(1009, 'Max message size exceeded.');
        }
        try {
          const json = JSON.parse(data);
          if (!Array.isArray(json) || json.length > 2 || typeof json[0] !== 'string') {
            throw new Error('Improperly formatted socket message.');
          }
          this.dispatch(json[0], json[1]);
        } catch (error) {
          // Bad JSON formatting or bad message
        }
      } else if (data instanceof Buffer) {
        if (data.byteLength > ServerSocket.MAX_MESSAGE_SIZE) {
          // Close connection due to large message size.
          // Should never occur unless client is forcefully injecting data.
          return this.connection.close(1009, 'Max message size exceeded.');
        }
        // Create ArrayBuffer from raw buffer
        const arrayBuffer = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
        const schemaId = BufferSchema.getIdFromBuffer(arrayBuffer);
        if (schemaId) {
          this.dispatch(schemaId, arrayBuffer);
        }
      }
    });
  }

  public on(eventName: 'close', callback: (code: number, reason: string) => void): void;
  public on(eventName: 'error', callback: (error: Error) => void): void;
  public on(eventName: string | number, callback: (data: any) => any): void;
  public on(eventName: string | number, callback: (...args: any[]) => any): void {
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

  public emit(eventName: string, data?: unknown, status = 200): void {
    this.assertIsOpen();
    const stringified = JSON.stringify([eventName, data, status]);
    this.connection.send(stringified);
  }

  public emitRaw(data: ArrayBuffer): void {
    this.assertIsOpen();
    this.connection.send(data);
  }

  /**
   * Dispose of this socket connection and associated resources.
   * Uses `WebSocket.terminate()` to end the connection immediately.
   */
  public dispose(): void {
    this.isDisposed = true;
    this.isAlive = false;
    this.connection.terminate();
    this.listeners.clear();
  }

  /**
   * Ping the client for a response to keep the heartbeat alive.
   */
  public ping(): void {
    this.isAlive = false;
    this.connection.ping();
  }

  private assertIsOpen() {
    if (!this.isAlive || this.isDisposed) {
      throw new Error('Attempting to emit a message on a disposed socket.');
    }
  }

  private dispatch(eventName: string, ...dataArgs: any[]): void {
    const handlers = this.listeners.get(eventName);
    if (handlers) {
      handlers.forEach((handler) => handler(...dataArgs));
    }
  }
}

export * from './connection';
