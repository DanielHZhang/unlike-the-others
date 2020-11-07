import {createFastifyPlugin} from 'src/server/plugins';
import {verifyJwt} from 'src/server/config/keys';
import {isObject} from 'src/server/utils/object';
import {CookieKeys} from 'src/server/config/constants';

export const jwtAuthPlugin = createFastifyPlugin('jwt-auth', (fastify) => {
  // Decorate the shape of the request for engine optimization
  // See: https://www.fastify.io/docs/latest/Decorators/
  fastify.decorateRequest('claims', null);
  fastify.addHook('preHandler', (request, reply, next) => {
    const {config} = reply.context;

    // Only check for JWTs on protected routes
    if (isObject(config) && config.protected) {
      if (!request.cookies[CookieKeys.Refresh]) {
        reply.status(400);
        throw new Error('No refresh token.');
      }

      try {
        const accessToken = request.headers.authorization;
        request.claims = verifyJwt('access', accessToken);
      } catch (error) {
        reply.status(401);
        throw new Error('Bad access token.');
      }
    }
    next();
  });
});
