import WebSocket from 'ws';
import type {AnyFunction, BufferInputData} from 'src/shared/types';
import {inputModel} from 'src/shared/buffer-schema';
import {BufferEventType} from 'src/shared/constants';
import {isObjectEmpty} from 'src/server/utils/object';

export function bufferEventName(eventType: BufferEventType): string {
  return `buffer_${eventType}`;
}

export class ServerSocket {
  /**
   * Max message size of 1 MB.
   * 1 UTF-16 character = 16 bits = 2 bytes
   * 500k characters = 1 MB
   */
  private static readonly MAX_MESSAGE_SIZE = 5e5;
  private connection: WebSocket;
  private listeners = new Map<string, AnyFunction[]>();
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
      if (typeof data === 'string') {
        if (data.length > ServerSocket.MAX_MESSAGE_SIZE) {
          // Close connection due to large message size.
          // Should never occur unless client is forcefully injecting data.
          return this.connection.close(1009, 'MAX_MESSAGE_SIZE exceeded.');
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
          return this.connection.close(1009, 'MAX_MESSAGE_SIZE exceeded.');
        }
        // Create ArrayBuffer from raw buffer
        const arrayBuffer = data.buffer.slice(data.byteOffset, data.byteOffset + data.byteLength);
        const dataObject = inputModel.fromBuffer(arrayBuffer);
        // if (!('_e' in dataObject)) {
        //   // Handle action type here
        //   // const action =
        //   dataObject = undefined;
        // }
        if (isObjectEmpty(dataObject)) {
          this.dispatch(bufferEventName(dataObject._e), dataObject);
        }
      }
    });
  }

  public on(eventName: 'close', callback: (code: number, reason: string) => void): void;
  public on(eventName: 'error', callback: (error: Error) => void): void;
  public on(eventName: string, callback: (data: any) => any): void;
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

  public emit(eventName: string, data?: unknown, status = 200): void {
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
  public dispose(): void {
    this.isDisposed = true;
    this.isAlive = false;
    this.connection.terminate();
    this.listeners.clear();
  }

  /** Ping the client for a response to keep the heartbeat alive. */
  public ping(): void {
    this.isAlive = false;
    this.connection.ping();
  }

  private dispatch(eventName: string, ...dataArgs: any[]): void {
    const handlers = this.listeners.get(eventName);
    if (handlers) {
      handlers.forEach((handler) => handler(...dataArgs));
    }
  }
}

export * from './connection';
