import WebSocket from 'ws';
import {createFastifyPlugin} from 'src/server/plugins';
import {tcpConnectionHandler} from 'src/server/services/sockets';

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

  const wss = new WebSocket.Server({server: fastify.server, path: options.path});

  fastify.server.on('upgrade', (request, socket, head) => {
    console.log('what are these arguments:', request, socket, head);
    wss.handleUpgrade(request, socket, head, (socket) => {
      wss.emit('connection', socket, request /* , ...args */);
    });
  });

  fastify.decorate('websocket', {server: wss, clients: []});
  fastify.addHook('onClose', (_, done) => wss.close(done));

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

  wss.on('connection', tcpConnectionHandler(fastify));
  wss.on('close', () => {
    clearInterval(interval);
    wss.clients.forEach((client) => client.close());
    fastify.log.info('Closing websocket server.');
  });

  // next();
});
