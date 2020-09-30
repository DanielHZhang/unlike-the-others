import {FastifyPluginCallback} from 'fastify';
import {PrismaClientKnownRequestError} from '@prisma/client';
import {prisma} from 'src/server/prisma';
import {signJwt, verifyJwt} from 'src/server/config/keys';
import {hashPassword, verifyPassword} from 'src/server/utils/scrypt';
import {IS_PRODUCTION_ENV} from 'src/shared/constants';

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

        const accessToken = signJwt({userId: newUser.id});
        reply.setCookie('token', accessToken, {httpOnly: true, secure: IS_PRODUCTION_ENV});

        return {
          accessToken,
        };
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

        const accessToken = signJwt({userId: foundUser.id});
        reply.setCookie('token', accessToken, {httpOnly: true, secure: IS_PRODUCTION_ENV});

        return {
          accessToken,
        };
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
    url: '/jwt',
    method: 'GET',
    schema: {
      headers: {
        type: 'object',
        required: ['authorization'],
        properties: {
          authorization: {type: 'string'},
        },
      },
    },
    attachValidation: true,
    handler: async (req, reply) => {
      try {
        const authHeader = req.headers.authorization;
        if (!authHeader) {
          throw 401;
        }
        const claims = verifyJwt(authHeader);
        return {
          accessToken: authHeader,
        };
      } catch (error) {
        fastify.log.error(error);
        reply.status(500);
        return {};
      }
    },
  });

  fastify.get('/csrf', async (req, reply) => {
    try {
      console.log('reaches route', req.generateCsrfToken());
      return {
        csrfToken: null,
      };
    } catch (error) {
      fastify.log.error(error);
      reply.status(500);
      return {};
    }
  });

  next();
};
