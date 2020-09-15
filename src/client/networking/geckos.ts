import geckos from '@geckos.io/client';
import {PORT} from 'src/config/constants';

export const channel = geckos({port: PORT});
