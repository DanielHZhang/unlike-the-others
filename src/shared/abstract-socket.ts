import type {AnyFunction} from 'src/shared/types';

export abstract class AbstractSocket<T> {
  /**
   * Max message size of 1 MB.
   * 1 UTF-16 character = 16 bits = 2 bytes
   * 500k characters = 1 MB
   */
  protected static readonly MAX_MESSAGE_SIZE = 5e5;
  protected connection: T;
  protected listeners = new Map<string, AnyFunction[]>();

  public constructor(socket: T) {
    this.connection = socket;
  }

  public on(eventName: string, callback: AnyFunction): void {
    const handlers = this.listeners.get(eventName);
    if (handlers) {
      handlers.push(callback);
    } else {
      this.listeners.set(eventName, [callback]);
    }
  }

  public abstract emit(eventName: string, status: number, data?: unknown): void;

  public abstract dispose(): void;

  protected dispatch(eventName: string, ...dataArgs: any[]) {
    const handlers = this.listeners.get(eventName);
    if (handlers) {
      handlers.forEach((handler) => handler(...dataArgs));
    }
  }
}
