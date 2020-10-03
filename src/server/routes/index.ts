import {FastifyPluginCallback} from 'fastify';
import {authRoutes} from 'src/server/routes/auth';
import {roomRoutes} from 'src/server/routes/room';

export const apiRoutes: FastifyPluginCallback = (fastify, options, next) => {
  fastify.register(authRoutes, {prefix: '/auth'});
  fastify.register(roomRoutes, {prefix: '/room'});
  next();
};
