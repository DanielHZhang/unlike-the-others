import {createFastifyPlugin} from 'src/server/plugins';
import {verifyJwt} from 'src/server/config/keys';
import {isRecord} from 'src/server/utils/object';

export const jwtAuthPlugin = createFastifyPlugin('jwt-auth', (fastify) => {
  fastify.addHook('preHandler', (request, reply, next) => {
    const {config} = reply.context;

    // Only check for JWTs on protected routes
    if (isRecord(config) && config.protected) {
      const accessToken = request.headers.authorization;
      if (!accessToken) {
        reply.status(400);
        throw new Error('No access token provided.');
      }
      try {
        const claims = verifyJwt('access', accessToken);
        fastify.decorateRequest('claims', claims);
      } catch (error) {
        reply.status(401);
        throw new Error('Bad access token.');
      }
    }
    next();
  });
});