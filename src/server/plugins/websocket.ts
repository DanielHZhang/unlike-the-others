import url from 'url';
import WebSocket from 'ws';
import type {Socket} from 'net';
import type {IncomingMessage} from 'http';
import {createFastifyPlugin} from 'src/server/plugins';
import {websocketConnectionHandler} from 'src/server/services/websocket';
import {verifyJwt} from 'src/server/config/keys';

type Options = {
  /** Number of seconds between ping-pong messages. */
  heartbeatInterval: number;
  /** URL path where the websocket server will be served.  */
  path: string;
};

export const websocketPlugin = createFastifyPlugin<Options>('websocket', (fastify, options) => {
  if (typeof options.heartbeatInterval !== 'number') {
    throw new Error('Missing heartbeat interval.');
  }
  if (typeof options.path !== 'string') {
    throw new Error('Missing path.');
  }

  const wss = new WebSocket.Server({
    path: options.path,
    noServer: true,
  });

  fastify.server.on('upgrade', (request: IncomingMessage, socket: Socket, head: Buffer) => {
    try {
      const {query} = url.parse(request.url ?? '', true);
      if (typeof query.token !== 'string') {
        throw new Error('Bad token.');
      }
      const claims = verifyJwt('access', query.token);
      wss.handleUpgrade(request, socket, head, (socket) => {
        wss.emit('connection', socket, request, claims);
      });
    } catch (error) {
      socket.destroy();
    }
  });

  fastify.decorate('websocket', {server: wss, clients: []});
  fastify.addHook('onClose', (_, done) => wss.close(done));

  // Handle heartbeat connection with clients
  const interval = setInterval(() => {
    let i = 0;
    const {clients} = fastify.websocket;
    while (i < clients.length) {
      const socket = clients[i];
      if (socket.isAlive) {
        socket.ping();
        i++;
      } else {
        // Client has not pong-ed since last interval
        socket.dispose();
        clients.splice(i, 1);
      }
    }
  }, options.heartbeatInterval * 1000);

  wss.on('connection', websocketConnectionHandler(fastify));
  wss.on('close', () => {
    clearInterval(interval);
    wss.clients.forEach((client) => client.close());
    fastify.log.info('Closing websocket server.');
  });
});
