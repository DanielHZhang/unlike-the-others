import {FastifyPluginCallback} from 'fastify';
import {authRoutes} from 'src/server/routes/auth';
import {BUILD_FOLDER_PATH} from 'src/webpack/constants';

export const routes: FastifyPluginCallback = async (fastify, options, next) => {
  fastify.register(authRoutes, {prefix: '/auth'});
  fastify.get('*', (req, reply) => {
    console.log('reaches catch all route');
    reply.sendFile('index.html', BUILD_FOLDER_PATH);
  });
  next();
};
