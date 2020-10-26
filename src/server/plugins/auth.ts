import {createFastifyPlugin} from 'src/server/plugins';
import {verifyJwt} from 'src/server/config/keys';
import {isRecord} from 'src/server/utils/object';
import {CookieKeys} from 'src/server/config/constants';

export const jwtAuthPlugin = createFastifyPlugin('jwt-auth', (fastify) => {
  fastify.addHook('preHandler', (request, reply, next) => {
    const {config} = reply.context;

    // Only check for JWTs on protected routes
    if (isRecord(config) && config.protected) {
      if (!request.cookies[CookieKeys.Refresh]) {
        reply.status(400);
        throw new Error('No refresh token.');
      }

      const accessToken = request.headers.authorization;
      if (!accessToken) {
        reply.status(400);
        throw new Error('No access token.');
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
