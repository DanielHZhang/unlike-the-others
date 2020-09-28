import fp from 'fastify-plugin';
import {FastifyPluginCallback} from 'fastify';

export const websocketRoutes: FastifyPluginCallback = (fastify, options, next) => {
  fastify.get('/ws', {websocket: true}, (connection, req, params) => {
    connection.setEncoding('utf-8');
    console.log('REACHES HERE', params);
    connection.write('hello client from server');
    connection.socket.on('message', (data) => {
      console.log('connection socket on:', data);
      connection.socket.send('what data lul');
    });
    // connection.on('message', (data) => {
    //   console.log('what?', data, connection.socket);
    //   connection.socket.send('hi from the server');
    // });
  });

  next();
  return Promise.resolve();
};

import WebSocket from 'ws';

export const websocket = fp(async (fastify, options) => {
  const server = new WebSocket();
});
