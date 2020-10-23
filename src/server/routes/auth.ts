import {nanoid} from 'nanoid/async';
import type {FastifyPluginCallback} from 'fastify';
import {prisma} from 'src/server/prisma';
import {signJwt, verifyJwt} from 'src/server/config/keys';
import {IS_PRODUCTION_ENV} from 'src/shared/constants';
import {CookieKeys} from 'src/server/config/constants';
import type {JwtClaims} from 'src/shared/types';

export const authRoutes: FastifyPluginCallback = (fastify, options, next) => {
  fastify.route({
    url: '/access',
    method: 'GET',
    handler: async (req, reply) => {
      let refreshToken = req.cookies[CookieKeys.Refresh];
      let payload: Partial<JwtClaims>;
      if (refreshToken) {
        let claims;
        try {
          claims = verifyJwt('refresh', refreshToken);
        } catch (error) {
          reply.status(401);
          throw error;
        }
        if (claims.userId) {
          const user = await prisma.user.findOne({where: {id: claims.userId}});
          if (!user) {
            // Guard against access token creation after user deletion
            reply.status(404);
            throw new Error('No user found.');
          }
        }
        payload = claims;
      } else {
        payload = {guestId: await nanoid()};
        refreshToken = signJwt('refresh', payload);
        reply.setCookie(CookieKeys.Refresh, refreshToken, {
          httpOnly: true,
          secure: IS_PRODUCTION_ENV,
        });
      }
      const accessToken = signJwt('access', payload);
      return {accessToken, isGuest: !!payload.guestId};
    },
  });

  next();
};
