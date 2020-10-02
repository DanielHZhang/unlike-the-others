import fp from 'fastify-plugin';
import {FastifyPluginCallback, FastifyRequest} from 'fastify';
import {CsrfTokenizer} from 'src/server/utils/csrf';
import {IS_PRODUCTION_ENV} from 'src/shared/constants';
import {CookieKeys, FASTIFY_SEM_VER} from 'src/server/config/constants';

const plugin: FastifyPluginCallback = (fastify, options, next) => {
  const ignoreMethods = ['GET', 'HEAD', 'OPTIONS'];
  const tokenizer = new CsrfTokenizer();

  fastify.addHook('preHandler', async (request, reply) => {
    let secret = request.cookies[CookieKeys.Csrf];
    if (!secret) {
      secret = await tokenizer.secret();
      request.cookies[CookieKeys.Csrf] = secret;
      reply.setCookie(CookieKeys.Csrf, secret, {
        path: '/',
        sameSite: 'strict',
        secure: IS_PRODUCTION_ENV,
      });
    }

    const rawToken =
      request.headers['csrf-token'] ||
      request.headers['xsrf-token'] ||
      request.headers['x-csrf-token'] ||
      request.headers['x-xsrf-token'];
    const token = Array.isArray(rawToken) ? rawToken[0] : rawToken;

    // Current request should be processed
    if (
      ignoreMethods.indexOf(request.raw.method!) < 0 &&
      (!token || !tokenizer.verify(secret, token))
    ) {
      throw new Error('Invalid CSRF token provided.');
    }
  });

  fastify.decorateRequest('generateCsrfToken', function (this: FastifyRequest) {
    const secret = this.cookies[CookieKeys.Csrf];
    return tokenizer.create(secret);
  });

  next();
};

export const csrf = fp(plugin, {
  fastify: FASTIFY_SEM_VER,
  name: 'fastify-csrf',
  dependencies: ['fastify-cookie'],
});
