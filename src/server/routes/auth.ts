import jose from 'jose';
import {nanoid} from 'nanoid/async';
import {FastifyPluginCallback} from 'fastify';
import {PrismaClientKnownRequestError} from '@prisma/client';
import {prisma} from 'src/server/prisma';
import {signJwt, verifyJwt} from 'src/server/config/keys';
import {hashPassword, verifyPassword} from 'src/server/utils/scrypt';
import {IS_PRODUCTION_ENV} from 'src/shared/constants';
import {CookieKeys} from 'src/server/config/constants';

export const authRoutes: FastifyPluginCallback = (fastify, options, next) => {
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
    attachValidation: true,
    handler: async (req, reply) => {
      try {
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
        reply.setCookie(CookieKeys.RefreshToken, refreshToken, {
          httpOnly: true,
          secure: IS_PRODUCTION_ENV,
        });
        return {success: true};
      } catch (error) {
        fastify.log.error(error);
        const values: Record<string, string> = {};
        if (error instanceof PrismaClientKnownRequestError) {
          // Unique constraint failed on fields
          if (error.code === 'P2002') {
            values.email = 'Email is already registered.';
          }
          reply.status(400);
        } else {
          reply.status(500);
        }
        return {
          message: '',
          values,
        };
      }
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
    attachValidation: true,
    handler: async (req, reply) => {
      try {
        if (req.validationError) {
          throw req.validationError;
        }

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
        reply.setCookie(CookieKeys.RefreshToken, refreshToken, {
          httpOnly: true,
          secure: IS_PRODUCTION_ENV,
        });

        return {success: true};
      } catch (error) {
        fastify.log.error(error);

        if (error instanceof PrismaClientKnownRequestError) {
          reply.status(400);
        } else if (typeof error === 'number') {
          reply.status(error);
          return {
            message: 'Invalid email or password.',
            values: {email: true, password: true},
          };
        } else {
          reply.status(500);
        }
        return {};
      }
    },
  });

  fastify.route({
    url: '/access',
    method: 'GET',
    handler: async (req, reply) => {
      try {
        const refreshToken = req.cookies[CookieKeys.RefreshToken];
        if (!refreshToken) {
          throw 401;
        }

        const claims = verifyJwt('refresh', refreshToken);

        if (claims.guestId) {
          const guestId = await nanoid();
          const accessToken = signJwt('access', {guestId});
          return accessToken;
        } else {
          const user = await prisma.user.findOne({where: {id: claims.userId}});
          if (!user) {
            throw 404;
          }
          const accessToken = signJwt('access', {userId: user.id});
          return accessToken;
        }
      } catch (error) {
        if (typeof error === 'number') {
          reply.status(error);
        } else if (error instanceof jose.errors.JWTMalformed) {
          reply.status(401);
        } else {
          reply.status(500);
        }
        return {};
      }
    },
  });

  fastify.get('/csrf', async (req, reply) => {
    return req.generateCsrfToken();
  });

  next();
};
