import {nanoid} from 'nanoid/async';
import type {FastifyPluginCallback} from 'fastify';
import {prisma} from 'src/server/prisma';
import {signJwt, verifyJwt} from 'src/server/config/keys';
import {CookieKeys, REFRESH_COOKIE_OPTIONS} from 'src/server/config/constants';
import {
  MAX_USERNAME_LENGTH,
  MIN_USERNAME_LENGTH,
  USERNAME_VALIDATION_REGEX,
} from 'src/shared/constants';
import type {JwtClaims} from 'src/shared/types';

export const authRoutes: FastifyPluginCallback = (fastify, options, next) => {
  fastify.route({
    url: '/access',
    method: 'GET',
    handler: async (req, reply) => {
      const refreshToken = req.cookies[CookieKeys.Refresh];

      // No refresh token -> deny creation of access token
      if (!refreshToken) {
        reply.status(400);
        throw new Error('No refresh token.');
      }

      // Verify if the refresh token is valid
      let claims: JwtClaims;
      try {
        claims = verifyJwt('refresh', refreshToken);
      } catch (error) {
        reply.clearCookie(CookieKeys.Refresh, REFRESH_COOKIE_OPTIONS);
        reply.status(401);
        throw error;
      }

      if (!claims.isGuest) {
        const foundUser = await prisma.user.findOne({where: {id: claims.id}});
        // Ensure that user still exists
        if (!foundUser) {
          reply.clearCookie(CookieKeys.Refresh, REFRESH_COOKIE_OPTIONS);
          reply.status(404);
          throw new Error('No user found.');
        }
      }

      // Create a new access token for this session
      const accessToken = signJwt('access', claims);
      return {accessToken, claims};
    },
  });

  fastify.route({
    method: 'POST',
    url: '/guest',
    schema: {
      body: {
        type: 'object',
        required: ['username'],
        properties: {
          username: {
            type: 'string',
            minLength: MIN_USERNAME_LENGTH,
            maxLength: MAX_USERNAME_LENGTH,
            pattern: USERNAME_VALIDATION_REGEX.source,
          },
        },
      },
    },
    handler: async (req, reply) => {
      const {username} = req.body as {username: string};

      // Set new refresh token
      const claims: JwtClaims = {
        id: await nanoid(),
        username,
        isGuest: true,
      };
      const refreshToken = signJwt('refresh', claims);
      reply.setCookie(CookieKeys.Refresh, refreshToken, REFRESH_COOKIE_OPTIONS);

      // Create a new access token for this session
      const accessToken = signJwt('access', claims);
      return {accessToken, claims};
    },
  });

  next();
};
