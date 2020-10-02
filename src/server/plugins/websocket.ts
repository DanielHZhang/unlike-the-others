import WebSocket from 'ws';
import fp from 'fastify-plugin';
import {FastifyInstance, FastifyPluginCallback} from 'fastify';
import {FASTIFY_SEM_VER} from 'src/server/config/constants';
import {socketConnection} from 'src/server/sockets/tcp';

const DECORATOR_KEY: Partial<keyof FastifyInstance> = 'websocketServer';

const plugin: FastifyPluginCallback = (fastify, options, next) => {
  if (fastify.hasDecorator(DECORATOR_KEY)) {
    throw new Error('Websocket plugin has already been registered.');
  }

  const ws = new WebSocket.Server({server: fastify.server, path: '/sock'});

  fastify.decorate('websocketServer', ws);
  fastify.addHook('onClose', (_, done) => ws.close(done));

  // TODO: ensure that SocketHandler instances are cleaned up when connection is closed
  ws.on('connection', socketConnection(fastify));
  ws.on('close', () => {
    fastify.log.info('Closing websocket server.');
  });

  next();
};

export const websocket = fp(plugin, {
  fastify: FASTIFY_SEM_VER,
  name: 'fastify-websocket',
});
