import {FastifyPluginCallback} from 'fastify';
import {prisma} from 'src/server/prisma';
import {signJwt} from 'src/server/config/keys';
import {hashPassword, verifyPassword} from 'src/server/utils/scrypt';
import {CookieKeys} from 'src/server/config/constants';
import {IS_PRODUCTION_ENV} from 'src/shared/constants';

export const userRoutes: FastifyPluginCallback = (fastify, options, next) => {
  fastify.route({
    url: '/sign-up',
    method: 'POST',
    schema: {
      body: {
        type: 'object',
        required: ['email', 'password', 'username'],
        properties: {
          email: {
            type: 'string',
            maxLength: 50,
          },
          password: {
            type: 'string',
            maxLength: 50,
          },
          username: {
            type: 'string',
            maxLength: 16,
          },
        },
      },
    },
    handler: async (req, reply) => {
      const {username, email, password} = req.body as {
        username: string;
        email: string;
        password: string;
      };

      const hash = await hashPassword(password);
      const newUser = await prisma.user.create({
        data: {
          username,
          email,
          password: hash,
        },
      });

      fastify.log.info(`Created new user: ${newUser.id}`);

      const refreshToken = signJwt('refresh', {userId: newUser.id});
      reply.setCookie(CookieKeys.Refresh, refreshToken, {
        httpOnly: true,
        secure: IS_PRODUCTION_ENV,
      });

      return {success: true};
    },
  });

  fastify.route({
    url: '/login',
    method: 'POST',
    schema: {
      body: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
          email: {
            type: 'string',
            maxLength: 50,
          },
          password: {
            type: 'string',
            maxLength: 50,
          },
        },
      },
    },
    handler: async (req, reply) => {
      const {email, password} = req.body as {email: string; password: string};
      const foundUser = await prisma.user.findOne({where: {email}});
      if (!foundUser) {
        throw 404;
      }

      const passwordMatch = await verifyPassword(password, foundUser.password);
      if (!passwordMatch) {
        throw 401;
      }

      const refreshToken = signJwt('refresh', {userId: foundUser.id});
      reply.setCookie(CookieKeys.Refresh, refreshToken, {
        httpOnly: true,
        secure: IS_PRODUCTION_ENV,
      });

      return {success: true};
    },
  });

  next();
};
