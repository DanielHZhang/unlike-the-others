import Peer from 'peerjs';

declare module 'peerjs' {
  export namespace peerjs {
    const Peer: {new (...args: any[]): Peer};
    const util: util;
  }
}

export interface ObjectService {
  create(...args: any[]): any;
  getById(...args: any[]): any;
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

export type UdpMessage = {
  seqNum: number;
  entityId: number;
  pressTime: number;
};
