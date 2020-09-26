import {Router} from 'express';
import {authRouter} from 'src/server/routes/auth';

export const apiRouter = Router();
apiRouter.use('/auth', authRouter);
