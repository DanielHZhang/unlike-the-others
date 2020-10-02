import Peer from 'peerjs';
import WebSocket from 'ws';

declare module 'peerjs' {
  export namespace peerjs {
    const Peer: {new (...args: any[]): Peer};
    const util: util;
  }
}

declare module 'fastify' {
  interface FastifyRequest {
    generateCsrfToken: () => string;
  }

  interface FastifyInstance {
    websocketServer: WebSocket.Server;
  }
}

export type GameControls = {
  up: number;
  left: number;
  down: number;
  right: number;
};

export type JwtClaims = {
  userId: string;
  iat: number;
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

export type InputData = {
  sequenceNumber: number;
  verticalMovement: number;
  horizontalMovement: number;
  actionType: number;
  // /** Type of input */
  // t: PlayerInput;
  // /** Timestamp */
  // ts: number;
};

export type BufferPlayerData = {
  uiid: number;
  x: number;
  y: number;
};

export type BufferInputData = {
  s: number; // Sequence number
  h: number;
  v: number;
};

export type BufferSnapshotData = {
  seq: number;
  tick: number;
  players: BufferPlayerData[];
};

export type SocketMessage = [string, any];
