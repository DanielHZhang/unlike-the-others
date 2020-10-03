import WebSocket from 'ws';
import fp from 'fastify-plugin';
import {FastifyInstance, FastifyPluginCallback} from 'fastify';
import {FASTIFY_SEM_VER} from 'src/server/config/constants';
import {connectionHandler} from 'src/server/services/sockets';

const DECORATOR_KEY: Partial<keyof FastifyInstance> = 'websocket';
const HEARTBEAT_INTERVAL = 30; // Number of seconds between heartbeat messages

const plugin: FastifyPluginCallback = (fastify, options, next) => {
  if (fastify.hasDecorator(DECORATOR_KEY)) {
    throw new Error('Websocket plugin has already been registered.');
  }

  const ws = new WebSocket.Server({server: fastify.server, path: '/sock'});

  fastify.decorate(DECORATOR_KEY, {server: ws, clients: []});
  fastify.addHook('onClose', (_, done) => ws.close(done));

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
  }, HEARTBEAT_INTERVAL * 1000);

  ws.on('connection', connectionHandler(fastify));
  ws.on('close', () => {
    clearInterval(interval);
    ws.clients.forEach((client) => client.close());
    fastify.log.info('Closing websocket server.');
  });

  next();
};

export const websocket = fp(plugin, {
  fastify: FASTIFY_SEM_VER,
  name: 'fastify-websocket',
});
