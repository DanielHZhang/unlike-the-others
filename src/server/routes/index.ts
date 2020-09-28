import {FastifyPluginCallback} from 'fastify';
import {authRoutes} from 'src/server/routes/auth';
import {websocketRoutes} from 'src/server/routes/websocket';
import {BUILD_FOLDER_PATH} from 'src/webpack/constants';

export const routes: FastifyPluginCallback = async (fastify, options, next) => {
  fastify.register(websocketRoutes /* , {prefix: '/ws'} */);
  fastify.register(authRoutes, {prefix: '/auth'});
  fastify.get('*', (req, reply) => {
    reply.sendFile('index.html', BUILD_FOLDER_PATH);
  });
  next();
  return Promise.resolve();
};
