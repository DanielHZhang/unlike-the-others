import fp from 'fastify-plugin';
import {FastifyPluginCallback, FastifyRequest} from 'fastify';
import {CsrfTokenizer} from 'src/server/utils/csrf';

const csrf: FastifyPluginCallback = (fastify, options, next) => {
  const ignoreMethods = ['GET', 'HEAD', 'OPTIONS'];
  const cookieOpts = {
    key: '_csrf',
    path: '/',
  };
  const tokenizer = new CsrfTokenizer();

  fastify.addHook('preHandler', async (request, reply) => {
    let secret = request.cookies[cookieOpts.key];
    if (!secret) {
      secret = await tokenizer.secret();
      request.cookies[cookieOpts.key] = secret;
      reply.setCookie(cookieOpts.key, secret, cookieOpts);
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
    const secret = this.cookies[cookieOpts.key];
    return tokenizer.create(secret);
  });

  next();
};

export const fastifyCsrf = fp(csrf, {
  fastify: '>=1.0.0',
  name: 'fastify-csrf',
  dependencies: ['fastify-cookie'],
});
