import {FastifyPluginCallback} from 'fastify';
import {authRoutes} from 'src/server/routes/auth';
import {roomRoutes} from 'src/server/routes/room';
import {userRoutes} from 'src/server/routes/user';

export const apiRoutes: FastifyPluginCallback = (fastify, options, next) => {
  fastify.register(authRoutes, {prefix: '/auth'});
  fastify.register(roomRoutes, {prefix: '/room'});
  fastify.register(userRoutes, {prefix: '/user'});
  next();
};
