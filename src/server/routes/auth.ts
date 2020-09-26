import {Router} from 'express';
import {JWT} from 'jose';
import {PrismaClientKnownRequestError} from '@prisma/client';
import {prisma} from 'src/server/prisma';
import {log} from 'src/server/utils/logs';
import {hashPassword, verifyPassword} from 'src/server/utils/scrypt';
import {getJWK} from 'src/server/config/jwk';

export const authRouter = Router();

authRouter.post('/sign-up', async (req, res) => {
  try {
    const {username, email, password} = req.body;
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
    res.send({
      accessToken: newJwt,
      username: newUser.username,
      email: newUser.email,
    });
  } catch (error) {
    console.error(error);
    const values: Record<string, string> = {};
    if (error instanceof PrismaClientKnownRequestError) {
      // Unique constraint failed on fields
      if (error.code === 'P2002') {
        values.email = 'Email is already registered.';
      }
      res.status(400);
    } else {
      res.status(500);
    }
    res.send({message: '', values});
  }
});

authRouter.post('/login', async (req, res) => {
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
    res.send({
      accessToken: token,
      username: foundUser.username,
      email: foundUser.email,
    });
  } catch (error) {
    console.error(error);
    // const values: Record<string, string | boolean> = {};
    if (error instanceof PrismaClientKnownRequestError) {
      res.sendStatus(400);
    } else if (typeof error === 'number') {
      res.status(error).send({
        message: 'Invalid email or password.',
        values: {email: true, password: true},
      });
    } else {
      res.sendStatus(500);
    }
  }
});
