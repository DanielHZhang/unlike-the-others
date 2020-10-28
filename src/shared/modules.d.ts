import type Peer from 'peerjs';
import type {Server} from 'ws';
import type {DeclaredTheme} from 'src/client/styles/theme';
import type {ServerSocket} from 'src/server/services/sockets';

// Client-side module overriden definitions

declare module '@emotion/react' {
  /* eslint-disable @typescript-eslint/no-empty-interface */
  export interface Theme extends DeclaredTheme {}
}

declare module 'peerjs' {
  export namespace peerjs {
    const Peer: {new (...args: any[]): Peer};
    const util: util;
  }
}

// Server-side consumed module overriden definitions

declare module 'fastify' {
  export interface FastifyRequest {
    claims: Required<JwtClaims>;
  }

  export interface FastifyInstance {
    websocket: {
      server: Server;
      clients: ServerSocket[];
    };
  }
}
