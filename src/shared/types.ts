import type Peer from 'peerjs';
import type {Server} from 'ws';
import type {ServerSocket} from 'src/server/services/sockets';
import type {Interpolation} from '@emotion/react';

declare module 'peerjs' {
  export namespace peerjs {
    const Peer: {new (...args: any[]): Peer};
    const util: util;
  }
}

declare module 'fastify' {
  export interface FastifyRequest {
    claims: Required<JwtClaims>;
    generateCsrfToken: () => string;
  }

  export interface FastifyInstance {
    websocket: {
      server: Server;
      clients: ServerSocket[];
    };
  }
}

export type AnyFunction = (...args: any[]) => any;

export type GameControls = {
  up: number;
  left: number;
  down: number;
  right: number;
};

export type JwtClaims = {
  guestId?: string;
  userId?: string;
  iat: number;
};

export type FastifyReplyError = {
  error: string;
  message: string;
  statusCode: string;
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
