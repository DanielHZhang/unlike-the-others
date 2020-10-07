import {FastifyRequest} from 'fastify';
import {CsrfTokenizer} from 'src/server/utils/csrf';
import {createFastifyPlugin} from 'src/server/plugins';
import {IS_PRODUCTION_ENV} from 'src/shared/constants';
import {CookieKeys} from 'src/server/config/constants';

export const csrfPlugin = createFastifyPlugin(
  'csrf',
  (fastify) => {
    const ignoreMethods = ['GET', 'HEAD', 'OPTIONS'];
    const tokenizer = new CsrfTokenizer();

    fastify.addHook('preHandler', async (request, reply) => {
      // Ignore methods which do not modify data on the server
      if (ignoreMethods.includes(request.raw.method!)) {
        return;
      }

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

      const token = request.headers['x-csrf-token'];

      if (typeof token !== 'string' || !tokenizer.verify(secret, token)) {
        // Bad token, do not proceed to route handler
        reply.status(400);
        throw new Error('Invalid CSRF token provided.');
      }
    });

    fastify.decorateRequest('generateCsrfToken', function (this: FastifyRequest) {
      const secret = this.cookies[CookieKeys.Csrf];
      return tokenizer.create(secret);
    });

    // next();
  },
  {
    dependencies: ['fastify-cookie'],
  }
);
