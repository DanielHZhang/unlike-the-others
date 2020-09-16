import geckos from '@geckos.io/client';
import {PORT} from 'src/shared/constants';

export const channel = geckos({port: PORT});
