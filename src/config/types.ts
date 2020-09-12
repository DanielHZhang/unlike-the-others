import Peer from 'peerjs';

declare module 'peerjs' {
  export namespace peerjs {
    const Peer: {new (...args: any[]): Peer};
    const util: util;
  }
}

export enum GameStatus {
  InProgress,
  Lobby,
}

export type GameControls = {
  up: number;
  left: number;
  down: number;
  right: number;
};

export type SocketResponse<T = string> = {
  status: number;
  payload: T;
};
