import {Router} from 'express';
import {User, PrismaClientKnownRequestError} from '@prisma/client';
import {prisma} from 'src/server/prisma';

export const userRouter = Router();

const signAccessToken = (user: User) => {
  return new Promise<string>((resolve, reject) => {
    sign(
      {userId: user.id},
      keys.jwt.secret,
      {
        expiresIn: '90d',
        issuer: 'calamity',
        subject: user.email,
        // audience: 'https://calamity.com'
      },
      (error, token) => (error ? reject(error) : resolve(token))
    );
  });
};

userRouter.post('/sign-up', async (req, res) => {
  try {
    const {name, email, password} = req.body;
    const hash = await bcrypt.hash(password, 10);
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hash,
      },
    });
    console.log('Created new user:', newUser);
    const token = await signAccessToken(newUser);
    res.send({
      accessToken: token,
      name: newUser.name,
      email: newUser.email,
    });
  } catch (error) {
    console.error(error);
    const values: Record<string, string> = {};
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        // Unique constraint failed on fields
        // const meta = error.meta as {target: string[]} | undefined;
        // meta?.target.forEach((field) => values[field] = '')
        values.email = 'Email is already registered.';
      }
      res.status(400);
    } else {
      res.status(500);
    }
    res.send({message: '', values});
  }
});

userRouter.post('/login', async (req, res) => {
  try {
    const {email, password} = req.body;
    const foundUser = await prisma.user.findOne({where: {email}});
    if (!foundUser) {
      throw 404;
    }
    const passwordMatch = await bcrypt.compare(password, foundUser.password);
    if (!passwordMatch) {
      throw 401;
    }
    const token = await signAccessToken(foundUser);
    res.send({
      accessToken: token,
      name: foundUser.name,
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
