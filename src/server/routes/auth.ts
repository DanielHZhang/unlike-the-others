import {JWT} from 'jose';
import {FastifyPluginCallback} from 'fastify';
import {PrismaClientKnownRequestError} from '@prisma/client';
import {prisma} from 'src/server/prisma';
import {log} from 'src/server/utils/logs';
import {getJWK} from 'src/server/config/jwk';
import {hashPassword, verifyPassword} from 'src/server/utils/scrypt';
import {IS_PRODUCTION_ENV} from 'src/shared/constants';

export const authRoutes: FastifyPluginCallback = (fastify, options, next) => {
  fastify.post('/sign-up', async (req, reply) => {
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
          password: hash.toString('base64'),
        },
      });

      log('info', `Created new user: ${newUser.id}`);

      const newJwt = JWT.sign({userId: newUser.id}, getJWK());
      return {
        accessToken: newJwt,
        username: newUser.username,
        email: newUser.email,
      };
    } catch (error) {
      console.error(error);
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
  });

  fastify.post('/login', async (req, reply) => {
    try {
      const {email, password} = req.body;
      const foundUser = await prisma.user.findOne({where: {email}});

      if (!foundUser) {
        throw 404;
      }

      const passwordMatch = await verifyPassword(password, foundUser.password);
      if (!passwordMatch) {
        throw 401;
      }

      const token = JWT.sign({userId: foundUser.id}, getJWK());
      reply.cookie('token', token, {httpOnly: true, secure: IS_PRODUCTION_ENV});
      reply.send({
        accessToken: token,
        username: foundUser.username,
        email: foundUser.email,
      });
    } catch (error) {
      console.error(error);

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
  });

  fastify.get('/csrf', async (req, reply) => {
    try {
      return {
        csrfToken: req.csrfToken(),
      };
    } catch (error) {
      console.error(error);
      reply.status(500);
      return {};
    }
  });

  next();
  return Promise.resolve();
};
