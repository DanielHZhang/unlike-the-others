import {FastifyPluginCallback} from 'fastify';
import {authRoutes} from 'src/server/routes/auth';

export const apiRoutes: FastifyPluginCallback = (fastify, options, next) => {
  fastify.register(authRoutes, {prefix: '/auth'});
  next();
};
