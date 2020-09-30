import fp from 'fastify-plugin';
import findMyWay from 'find-my-way';
import WebSocket from 'ws';
import {ServerResponse} from 'http';
import {FastifyPluginCallback} from 'fastify';

const sockSym = Symbol('ws');

// const plugin: FastifyPluginCallback =

export const fastifyWebsocket: FastifyPluginCallback = fp(async (fastify, opts) => {

  const handle = opts.handle
    ? (req, res) => opts.handle.call(fastify, req[sockSym], req)
    : (req, res) => {
        req[sockSym].socket.close();
      };

  const options = Object.assign({server: fastify.server}, opts.options);

  const router = findMyWay({
    ignoreTrailingSlash: true,
    defaultRoute: handle,
  });

  const wss = new WebSocket.Server(options);
  wss.on('connection', handleRouting);

  fastify.decorate('websocketServer', wss);

  fastify.addHook('onRoute', (routeOptions) => {
    if (routeOptions.websocket || routeOptions.wsHandler) {
      if (routeOptions.method !== 'GET') {
        throw new Error('websocket handler can only be declared in GET method');
      }

      if (routeOptions.path === routeOptions.prefix) {
        return;
      }
      let wsHandler = routeOptions.wsHandler;
      let handler = routeOptions.handler;

      if (routeOptions.websocket) {
        wsHandler = routeOptions.handler;
        handler = function (request, reply) {
          reply.code(404).send();
        };
      }

      if (typeof wsHandler !== 'function') {
        throw new Error('invalid wsHandler function');
      }

      router.on('GET', routeOptions.path, (req, _, params) => {
        const result = wsHandler.call(fastify, req[sockSym], req, params);

        if (result && typeof result.catch === 'function') {
          result.catch((err) => req[sockSym].destroy(err));
        }
      });

      routeOptions.handler = handler;
    }
  });

  fastify.addHook('onClose', (fastify, done) => {
    const server = fastify.websocketServer;
    server.close(done);
  });

  // Fastify is missing a pre-close event, or the ability to
  // add a hook before the server.close call. We need to resort
  // to monkeypatching for now.
  const oldClose = fastify.server.close;
  fastify.server.close = function (cb) {
    const server = fastify.websocketServer;
    for (const client of server.clients) {
      client.close();
    }
    oldClose.call(this, cb);
    return fastify.server;
  };

  function handleRouting(connection, request) {
    const response = new ServerResponse(request);
    request[sockSym] = WebSocket.createWebSocketStream(connection);
    request[sockSym].socket = connection;
    router.lookup(request, response);
  }

  // next();
});
